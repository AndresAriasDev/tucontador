<?php
defined( 'ABSPATH' ) || exit;

function contador_subscription_response( $message, $status = 200, $accepted = false, $code = '' ) {
	$response = new WP_REST_Response( array( 'message' => $message, 'accepted' => $accepted, 'code' => $code ), $status );
	$response->header( 'Cache-Control', 'no-store, private' );
	if ( 429 === $status ) $response->header( 'Retry-After', '900' );
	return $response;
}

function contador_subscription_permission( WP_REST_Request $request ) {
	$origin = $request->get_header( 'origin' );
	if ( $origin ) {
		$parts = wp_parse_url( $origin );
		$site = wp_parse_url( home_url( '/' ) );
		if ( ! $parts || ! $site || ( $parts['host'] ?? '' ) !== ( $site['host'] ?? '' ) || ( $parts['scheme'] ?? '' ) !== ( $site['scheme'] ?? '' ) || ( $parts['port'] ?? 0 ) !== ( $site['port'] ?? 0 ) ) {
			return new WP_Error( 'subscription_origin', 'Solicitud no permitida.', array( 'status' => 403 ) );
		}
	}
	return true;
}

add_action( 'rest_api_init', static function () {
	foreach ( array( 'subscribe', 'confirm', 'unsubscribe' ) as $action ) {
		register_rest_route( 'tucontador/v1', '/subscriptions/' . $action, array(
			'methods' => 'POST',
			'permission_callback' => 'contador_subscription_permission',
			'callback' => static function ( $request ) use ( $action ) { return contador_subscription_request( $request, $action ); },
		) );
	}
} );

function contador_subscription_request( WP_REST_Request $request, $action ) {
	if ( strlen( $request->get_body() ) > 2048 ) return contador_subscription_response( 'La solicitud es demasiado extensa.', 413 );
	$data = $request->get_json_params();
	if ( ! is_array( $data ) ) return contador_subscription_response( 'La solicitud no tiene un formato válido.', 400 );
	try {
		if ( ! contador_subscription_schema_ready() && ! contador_subscription_install( true ) ) {
			return contador_subscription_response( 'No se pudo preparar la base de datos de suscripciones. El administrador debe revisar los permisos de creación y modificación de tablas. Reintenta en un minuto.', 503, false, 'subscription_database_schema' );
		}
		$ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown'; // No confiar en cabeceras de proxy del visitante.
		$rate = contador_subscription_rate( 'ip-' . $action, $ip, 'subscribe' === $action ? 5 : 20, 15 * MINUTE_IN_SECONDS );
		if ( is_wp_error( $rate ) ) return contador_subscription_response( $rate->get_error_message(), 503, false, $rate->get_error_code() );
		if ( ! $rate ) {
			return contador_subscription_response( 'Espera unos minutos antes de volver a intentarlo.', 429 );
		}
		if ( 'subscribe' === $action ) return contador_subscription_subscribe( $data );
		$token = $data['token'] ?? '';
		if ( ! is_string( $token ) || ! preg_match( '/^[a-f0-9]{64}$/D', $token ) ) return contador_subscription_response( 'Este enlace no es válido o ya venció.', 400 );
		return 'confirm' === $action ? contador_subscription_confirm( $token ) : contador_subscription_unsubscribe( $token );
	} catch ( Throwable $error ) {
		// No registrar correos, tokens ni contenido de la excepción.
		return contador_subscription_response( 'No pudimos completar la solicitud. Inténtalo más tarde.', 503 );
	}
}

function contador_subscription_subscribe( array $data ) {
	if ( ! isset( $data['website'] ) || ! is_string( $data['website'] ) || '' !== $data['website'] ) return contador_subscription_response( 'No pudimos procesar la solicitud.', 400 );
	$email = contador_subscription_normalize_email( $data['email'] ?? null );
	if ( ! $email ) return contador_subscription_response( 'Escribe un correo electrónico válido.', 422 );
	// Mismos límites y respuesta para correos nuevos, activos, pendientes y bajas.
	foreach ( array( array( 'email', $email, 1, 5 * MINUTE_IN_SECONDS ), array( 'mail', 'global', max( 1, (int) apply_filters( 'contador_subscription_hourly_limit', 30 ) ), HOUR_IN_SECONDS ) ) as $limit ) {
		$rate = contador_subscription_rate( ...$limit );
		if ( is_wp_error( $rate ) ) return contador_subscription_response( $rate->get_error_message(), 503, false, $rate->get_error_code() );
		if ( ! $rate ) return contador_subscription_response( 'Espera unos minutos antes de volver a intentarlo.', 429, false, 'subscription_rate_limit' );
	}
	global $wpdb;
	$table = contador_subscription_table();
	$now = gmdate( 'Y-m-d H:i:s' );
	$token = contador_subscription_token();
	$hash = contador_subscription_hash( $token );
	// El índice único impide duplicados. Una solicitud nunca cambia el estado existente.
	$inserted = $wpdb->query( $wpdb->prepare( "INSERT INTO $table (email,status,created_at) VALUES (%s,'pending',%s) ON DUPLICATE KEY UPDATE id = id", $email, $now ) );
	if ( false === $inserted ) return contador_subscription_response( 'No pudimos guardar la solicitud en la base de datos. Inténtalo más tarde.', 503, false, 'subscription_database_write' );
	$updated = $wpdb->update( $table, array( 'confirmation_hash' => $hash, 'confirmation_expires' => gmdate( 'Y-m-d H:i:s', time() + DAY_IN_SECONDS ) ), array( 'email' => $email ), array( '%s', '%s' ), array( '%s' ) );
	if ( 1 !== $updated ) return contador_subscription_response( 'No pudimos guardar la confirmación en la base de datos. Inténtalo más tarde.', 503, false, 'subscription_database_write' );
	try { $accepted = contador_subscription_send_confirmation( $email, $token ); }
	catch ( Throwable $error ) { $accepted = false; }
	if ( ! $accepted ) {
		$wpdb->query( $wpdb->prepare( "UPDATE $table SET confirmation_hash = NULL, confirmation_expires = NULL WHERE email = %s AND confirmation_hash = %s", $email, $hash ) );
		return contador_subscription_response( 'La solicitud se guardó, pero el sistema de correo no aceptó el envío. Revisa WP Mail SMTP/Brevo y vuelve a intentarlo en unos minutos.', 502, false, 'subscription_mail_failed' );
	}
	return contador_subscription_response( 'Te enviamos un enlace para confirmar tu suscripción. Confírmala para comenzar a recibir nuestras nuevas publicaciones.', 200, true );
}

function contador_subscription_confirm( $token ) {
	global $wpdb;
	$table = contador_subscription_table();
	$hash = contador_subscription_hash( $token );
	$now = gmdate( 'Y-m-d H:i:s' );
	$row = $wpdb->get_row( $wpdb->prepare( "SELECT id,email,status FROM $table WHERE confirmation_hash = %s AND confirmation_expires > %s", $hash, $now ) );
	if ( $wpdb->last_error ) return contador_subscription_response( 'No se pudo consultar la confirmación en la base de datos.', 503, false, 'subscription_database_read' );
	if ( ! $row ) return contador_subscription_response( 'Este enlace ya fue utilizado o venció. Puedes solicitar uno nuevo desde el footer.', 410 );
	$unsubscribe_token = contador_subscription_token();
	// CAS: solo un proceso puede consumir el token. Activos conservan su enlace de baja.
	$updated = $wpdb->query( $wpdb->prepare(
		"UPDATE $table SET unsubscribe_hash = IF(status = 'active', unsubscribe_hash, %s), confirmed_at = COALESCE(confirmed_at,%s), status = 'active', unsubscribed_at = NULL, confirmation_hash = NULL, confirmation_expires = NULL WHERE id = %d AND confirmation_hash = %s AND confirmation_expires > %s",
		contador_subscription_hash( $unsubscribe_token ), $now, $row->id, $hash, $now
	) );
	if ( false === $updated ) return contador_subscription_response( 'No pudimos confirmar tu suscripción. Inténtalo más tarde.', 503 );
	if ( 1 !== $updated ) return contador_subscription_response( 'Este enlace ya fue utilizado o venció.', 410 );
	$welcome = true;
	if ( 'active' !== $row->status ) {
		try { $welcome = contador_subscription_send_welcome( $row->email, $unsubscribe_token ); }
		catch ( Throwable $error ) { $welcome = false; }
	}
	$message = '¡Tu suscripción está confirmada!';
	if ( ! $welcome ) $message .= ' No pudimos aceptar el envío del correo de bienvenida.';
	// Facilitar siempre la baja en la pantalla de confirmación, aunque falle la bienvenida.
	$response = contador_subscription_response( $message, 200, true );
	if ( 'active' !== $row->status ) {
		$body = $response->get_data();
		$body['unsubscribe_url'] = contador_subscription_link( 'unsubscribe', $unsubscribe_token );
		$response->set_data( $body );
	}
	return $response;
}

function contador_subscription_unsubscribe( $token ) {
	global $wpdb;
	$table = contador_subscription_table();
	$updated = $wpdb->query( $wpdb->prepare( "UPDATE $table SET status = 'unsubscribed', unsubscribed_at = %s, confirmation_hash = NULL, confirmation_expires = NULL, unsubscribe_hash = NULL WHERE unsubscribe_hash = %s AND status = 'active'", gmdate( 'Y-m-d H:i:s' ), contador_subscription_hash( $token ) ) );
	if ( false === $updated ) return contador_subscription_response( 'No pudimos procesar la baja. Inténtalo más tarde.', 503 );
	if ( 1 !== $updated ) return contador_subscription_response( 'Este enlace no es válido o ya fue utilizado.', 410 );
	return contador_subscription_response( 'Tu suscripción ha sido cancelada. No recibirás nuevas notificaciones del blog.', 200, true );
}

add_action( 'template_redirect', static function () {
	$action = isset( $_GET['tc-subscription'] ) && is_string( $_GET['tc-subscription'] ) ? sanitize_key( wp_unslash( $_GET['tc-subscription'] ) ) : '';
	if ( ! in_array( $action, array( 'confirm', 'unsubscribe' ), true ) ) return;
	status_header( 200 );
	nocache_headers();
	header( 'Referrer-Policy: no-referrer' );
	header( 'X-Robots-Tag: noindex, nofollow, noarchive' );
	// Documento mínimo sin scripts de terceros: el token permanece en el navegador.
	require get_theme_file_path( 'template-parts/subscriptions/manage.php' );
	exit;
} );

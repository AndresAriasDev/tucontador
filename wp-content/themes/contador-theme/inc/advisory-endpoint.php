<?php
/**
 * Recepción pública de solicitudes. No almacena el contenido del formulario.
 */
defined( 'ABSPATH' ) || exit;

add_action( 'rest_api_init', static function () {
	register_rest_route( 'tucontador/v1', '/solicitudes', array(
		'methods' => 'POST',
		'callback' => 'contador_receive_advisory_request',
		'permission_callback' => '__return_true',
	) );
} );

function contador_advisory_response( $data, $status ) {
	$response = new WP_REST_Response( $data, $status );
	$response->header( 'Cache-Control', 'no-store' );
	return $response;
}

function contador_advisory_length( $text ) {
	return preg_match_all( '/./us', $text );
}

function contador_receive_advisory_request( WP_REST_Request $request ) {
	if ( strlen( $request->get_body() ) > 20000 ) {
		return contador_advisory_response( array( 'message' => 'La solicitud es demasiado extensa.' ), 413 );
	}
	// No confiar en X-Forwarded-For enviado por visitantes. Configurar el proxy en el servidor.
	$ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
	$key = 'tc_advisory_' . hash_hmac( 'sha256', $ip, wp_salt( 'auth' ) );
	$lock = $key . '_lock';
	$now = time();
	// Bloqueo atómico corto para evitar carreras en el contador y envíos simultáneos.
	if ( ! add_option( $lock, $now + 120, '', false ) ) {
		if ( (int) get_option( $lock ) < $now ) {
			delete_option( $lock );
		}
		return contador_advisory_response( array( 'message' => 'Espera un momento antes de volver a intentarlo.' ), 429 );
	}
	try {
		$rate = get_transient( $key );
		if ( ! is_array( $rate ) || $rate['until'] <= $now ) {
			$rate = array( 'count' => 0, 'until' => $now + 15 * MINUTE_IN_SECONDS );
		}
		if ( $rate['count'] >= 5 ) {
			$response = contador_advisory_response( array( 'message' => 'Has alcanzado el límite de solicitudes. Inténtalo de nuevo en unos minutos.' ), 429 );
			$response->header( 'Retry-After', (string) max( 1, $rate['until'] - $now ) );
			return $response;
		}
		$rate['count']++;
		set_transient( $key, $rate, max( 1, $rate['until'] - $now ) );
		$data = $request->get_json_params();
		if ( ! is_array( $data ) ) {
			return contador_advisory_response( array( 'message' => 'La solicitud no tiene un formato válido.' ), 400 );
		}
		if ( ! isset( $data['website'] ) || ! is_string( $data['website'] ) || '' !== $data['website'] ) {
			return contador_advisory_response( array( 'message' => 'No se pudo procesar la solicitud.' ), 400 );
		}
		$errors = array();
		$clean = array();
		foreach ( array( 'name', 'phone', 'email', 'situation', 'service', 'details' ) as $field ) {
			if ( ! isset( $data[$field] ) || ! is_string( $data[$field] ) || ! preg_match( '//u', $data[$field] ) ) {
				$errors[$field] = 'Completa este campo con un valor válido.';
				$clean[$field] = '';
				continue;
			}
			$raw = $data[$field];
			$clean[$field] = 'details' === $field ? sanitize_textarea_field( $raw ) : sanitize_text_field( $raw );
			$clean[$field] = trim( preg_replace( '/\s+/u', ' ', $clean[$field] ) );
			// Rechazar contenido alterado al sanitizar, en vez de aceptar entradas maliciosas.
			if ( trim( preg_replace( '/\s+/u', ' ', $raw ) ) !== $clean[$field] ) {
				$errors[$field] = 'Revisa el contenido de este campo.';
			}
		}
		$clean['phone'] = preg_replace( '/\s/u', '', $clean['phone'] );
		if ( contador_advisory_length( $clean['name'] ) < 3 || contador_advisory_length( $clean['name'] ) > 100 ||
			! preg_match( "/^[\\p{L}\\p{M}]+(?:[ .’'\\-][\\p{L}\\p{M}]+)*\\.?$/u", $clean['name'] ) ) {
			$errors['name'] = 'Escribe un nombre válido de 3 a 100 caracteres.';
		}
		if ( ! preg_match( '/^[0-9]{8}$/', $clean['phone'] ) ) {
			$errors['phone'] = 'El celular debe contener 8 dígitos, sin prefijo.';
		}
		if ( strlen( $clean['email'] ) > 254 || ! is_email( $clean['email'] ) || preg_match( '/[\r\n]/', $data['email'] ?? '' ) ) {
			$errors['email'] = 'Escribe un correo electrónico válido.';
		}
		$situations = array( 'Tengo un negocio en funcionamiento', 'Quiero registrar o iniciar un negocio', 'Soy una persona natural', 'Soy profesional independiente', 'Otra situación' );
		$services = array( 'Servicios contables', 'Declaraciones de impuestos', 'Asesoría contable y tributaria' );
		if ( ! in_array( $clean['situation'], $situations, true ) ) $errors['situation'] = 'Selecciona una situación válida.';
		if ( ! in_array( $clean['service'], $services, true ) ) $errors['service'] = 'Selecciona un servicio válido.';
		if ( contador_advisory_length( $clean['details'] ) < 10 || contador_advisory_length( $clean['details'] ) > 2000 ) {
			$errors['details'] = 'La solicitud debe tener entre 10 y 2000 caracteres de contenido.';
		}
		if ( $errors ) {
			return contador_advisory_response( array( 'message' => 'Revisa los campos indicados.', 'errors' => $errors ), 422 );
		}
		$recipient = defined( 'TUCONTADOR_CONTACT_EMAIL' ) ? TUCONTADOR_CONTACT_EMAIL : get_option( 'admin_email' );
		if ( ! is_string( $recipient ) || ! is_email( $recipient ) ) {
			return contador_advisory_response( array( 'message' => 'El servicio no está disponible. Inténtalo más tarde.' ), 503 );
		}
		$reply_to = sanitize_email( $clean['email'] );
		$headers = array( 'Content-Type: text/html; charset=UTF-8' );
		if ( is_email( $reply_to ) && ! preg_match( '/[\x00-\x1F\x7F]/', $reply_to ) ) {
			$headers[] = 'Reply-To: ' . $reply_to;
		} else {
			$reply_to = '';
		}
		// Solo presentación: restaurar saltos de línea del texto que ya pasó la validación.
		$email_data = $clean;
		$email_data['details'] = trim( sanitize_textarea_field( $data['details'] ) );
		// Generar una sola referencia aleatoria, compartida por el asunto y el HTML.
		$email_data['request_id'] = strtoupper( bin2hex( random_bytes( 6 ) ) );
		$subject = 'Nueva solicitud #' . $email_data['request_id'] . ' | ' . $clean['service'];
		require_once __DIR__ . '/advisory-email.php';
		$message = contador_render_advisory_email( $email_data, $reply_to );
		$accepted = wp_mail(
			$recipient,
			$subject,
			$message,
			$headers
		);
		if ( ! $accepted ) {
			return contador_advisory_response( array( 'message' => 'No pudimos procesar el envío. Conserva tus datos e inténtalo de nuevo.' ), 502 );
		}
		return contador_advisory_response( array( 'accepted' => true ), 200 );
	} catch ( Throwable $exception ) {
		return contador_advisory_response( array( 'message' => 'No se pudo procesar la solicitud. Inténtalo más tarde.' ), 500 );
	} finally {
		delete_option( $lock );
	}
}

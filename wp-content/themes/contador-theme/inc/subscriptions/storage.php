<?php
defined( 'ABSPATH' ) || exit;

function contador_subscription_table( $rates = false ) {
	global $wpdb;
	return $wpdb->prefix . ( $rates ? 'tc_subscription_limits' : 'tc_subscribers' );
}

/** Verificar estructura real, no solo una opción de instalación. */
function contador_subscription_schema_ready() {
	global $wpdb;
	foreach ( array(
		contador_subscription_table() => array( 'id', 'email', 'status', 'created_at', 'confirmed_at', 'unsubscribed_at', 'confirmation_hash', 'confirmation_expires', 'unsubscribe_hash' ),
		contador_subscription_table( true ) => array( 'bucket', 'hits', 'expires_at' ),
	) as $table => $fields ) {
		if ( $wpdb->get_var( $wpdb->prepare( 'SHOW TABLES LIKE %s', $wpdb->esc_like( $table ) ) ) !== $table ) return false;
		$columns = $wpdb->get_col( "SHOW COLUMNS FROM `$table`" );
		if ( array_diff( $fields, (array) $columns ) ) return false;
		$indexes = $wpdb->get_results( "SHOW INDEX FROM `$table`" );
		$unique = array();
		foreach ( (array) $indexes as $index ) {
			if ( 0 === (int) $index->Non_unique && null === $index->Sub_part ) $unique[$index->Key_name][] = $index->Column_name;
		}
		$required = $table === contador_subscription_table() ? array( 'id', 'email', 'confirmation_hash', 'unsubscribe_hash' ) : array( 'bucket' );
		foreach ( $required as $field ) if ( ! in_array( array( $field ), $unique, true ) ) return false;
	}
	return true;
}

/** Migración de esquema fijo del tema; no requiere una sesión administrativa. */
function contador_subscription_install( $repair = false ) {
	global $wpdb;
	if ( true === $repair || '2' !== get_option( 'tc_subscription_schema' ) ) {
		if ( get_transient( 'tc_subscription_install_failed' ) ) return false;
		$lock = 'tc_sub_schema_' . substr( hash( 'sha256', DB_NAME . $wpdb->prefix ), 0, 40 );
		if ( '1' !== (string) $wpdb->get_var( $wpdb->prepare( 'SELECT GET_LOCK(%s, 0)', $lock ) ) ) return false;
		try {
		require_once ABSPATH . 'wp-admin/includes/upgrade.php';
		$table = contador_subscription_table();
		$limits = contador_subscription_table( true );
		$charset = $wpdb->get_charset_collate();
		dbDelta( "CREATE TABLE $table (
			id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
			email varchar(254) CHARACTER SET ascii COLLATE ascii_general_ci NOT NULL,
			status varchar(20) NOT NULL DEFAULT 'pending',
			created_at datetime NOT NULL,
			confirmed_at datetime DEFAULT NULL,
			unsubscribed_at datetime DEFAULT NULL,
			confirmation_hash char(64) DEFAULT NULL,
			confirmation_expires datetime DEFAULT NULL,
			unsubscribe_hash char(64) DEFAULT NULL,
			PRIMARY KEY  (id),
			UNIQUE KEY email (email),
			UNIQUE KEY confirmation_hash (confirmation_hash),
			UNIQUE KEY unsubscribe_hash (unsubscribe_hash),
			KEY status_id (status,id),
			KEY confirmation_expires (confirmation_expires),
			KEY created_at (created_at)
		) $charset;" );
		dbDelta( "CREATE TABLE $limits (
			bucket char(64) NOT NULL,
			hits int unsigned NOT NULL DEFAULT 0,
			expires_at datetime NOT NULL,
			PRIMARY KEY  (bucket),
			KEY expires_at (expires_at)
		) $charset;" );
		if ( ! contador_subscription_schema_ready() ) {
			set_transient( 'tc_subscription_install_failed', 1, MINUTE_IN_SECONDS );
			return false;
		}
		update_option( 'tc_subscription_schema', '2', false );
		} catch ( Throwable $error ) {
			set_transient( 'tc_subscription_install_failed', 1, MINUTE_IN_SECONDS );
			return false;
		} finally {
			$wpdb->get_var( $wpdb->prepare( 'SELECT RELEASE_LOCK(%s)', $lock ) );
		}
	}
	if ( ! wp_next_scheduled( 'tc_subscription_cleanup' ) ) wp_schedule_event( time() + HOUR_IN_SECONDS, 'hourly', 'tc_subscription_cleanup' );
	return true;
}
add_action( 'init', 'contador_subscription_install', 5 );

function contador_subscription_cleanup() {
	global $wpdb;
	$table = contador_subscription_table();
	$limits = contador_subscription_table( true );
	$now = gmdate( 'Y-m-d H:i:s' );
	$wpdb->query( $wpdb->prepare( "DELETE FROM $limits WHERE expires_at < %s LIMIT 1000", $now ) );
	$wpdb->query( $wpdb->prepare( "UPDATE $table SET confirmation_hash = NULL, confirmation_expires = NULL WHERE confirmation_expires < %s LIMIT 1000", $now ) );
	$wpdb->query( $wpdb->prepare( "DELETE FROM $table WHERE status = 'pending' AND confirmation_hash IS NULL AND created_at < %s LIMIT 1000", gmdate( 'Y-m-d H:i:s', time() - 30 * DAY_IN_SECONDS ) ) );
}
add_action( 'tc_subscription_cleanup', 'contador_subscription_cleanup' );
add_action( 'switch_theme', static function () { wp_clear_scheduled_hook( 'tc_subscription_cleanup' ); } );

/** Contadores persistentes/atómicos; no guarda la IP ni el correo en esta tabla. */
function contador_subscription_rate( $scope, $identity, $limit, $window ) {
	global $wpdb;
	$table = contador_subscription_table( true );
	$period = (int) floor( time() / $window );
	$bucket = hash_hmac( 'sha256', "$scope|$identity|$period", wp_salt( 'auth' ) );
	$expires = gmdate( 'Y-m-d H:i:s', ( $period + 1 ) * $window );
	$result = $wpdb->query( $wpdb->prepare( "INSERT INTO $table (bucket,hits,expires_at) VALUES (%s,1,%s) ON DUPLICATE KEY UPDATE hits = hits + 1", $bucket, $expires ) );
	if ( false === $result ) return new WP_Error( 'subscription_database', 'No se pudo acceder al control de solicitudes en la base de datos.' );
	$hits = $wpdb->get_var( $wpdb->prepare( "SELECT hits FROM $table WHERE bucket = %s", $bucket ) );
	if ( null === $hits ) return new WP_Error( 'subscription_database', 'No se pudo consultar el control de solicitudes en la base de datos.' );
	return (int) $hits <= $limit;
}

function contador_subscription_normalize_email( $raw ) {
	if ( ! is_string( $raw ) || preg_match( '/[\x00-\x1f\x7f-\xff]/', $raw ) || strpos( trim( $raw ), ' ' ) !== false ) return '';
	$email = strtolower( trim( $raw ) );
	return strlen( $email ) <= 254 && sanitize_email( $email ) === $email && is_email( $email ) ? $email : '';
}

function contador_subscription_token() { return bin2hex( random_bytes( 32 ) ); }
function contador_subscription_hash( $token ) { return hash( 'sha256', $token ); }

/** El secreto viaja en el fragmento: no se envía al servidor en el GET ni como Referer. */
function contador_subscription_link( $action, $token ) {
	return add_query_arg( 'tc-subscription', $action, home_url( '/' ) ) . '#token=' . rawurlencode( $token );
}

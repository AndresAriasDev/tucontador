<?php
/** Suscripciones del blog: etapa de doble confirmación, sin campañas. */
defined( 'ABSPATH' ) || exit;
require_once __DIR__ . '/storage.php';
require_once __DIR__ . '/email.php';
require_once __DIR__ . '/http.php';

function contador_subscription_assets() {
	foreach ( array( 'style' => 'assets/css/components/subscription.css', 'script' => 'assets/js/subscription.js' ) as $type => $file ) {
		$version = (string) filemtime( get_theme_file_path( $file ) );
		if ( 'style' === $type ) wp_enqueue_style( 'contador-subscription', get_theme_file_uri( $file ), array( 'contador-theme-global', 'contador-theme-footer' ), $version );
		else wp_enqueue_script( 'contador-subscription', get_theme_file_uri( $file ), array(), $version, true );
	}
}
add_action( 'wp_enqueue_scripts', 'contador_subscription_assets' );

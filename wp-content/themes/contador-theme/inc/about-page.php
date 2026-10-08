<?php
/** Recursos y metadatos exclusivos de Sobre nosotros. */
defined( 'ABSPATH' ) || exit;

function contador_about_page_styles() {
	if ( ! is_page( 'sobre-nosotros' ) ) return;
	$file = 'assets/css/pages/sobre-nosotros.css';
	wp_enqueue_style( 'contador-theme-about', get_theme_file_uri( $file ), array( 'contador-theme-global', 'contador-theme-header' ), (string) filemtime( get_theme_file_path( $file ) ) );
}
add_action( 'wp_enqueue_scripts', 'contador_about_page_styles', 20 );

/** Dejar los metadatos al plugin SEO cuando hay uno reconocido activo. */
function contador_about_has_seo_plugin() {
	$plugins = array_merge( (array) get_option( 'active_plugins', array() ), array_keys( (array) get_site_option( 'active_sitewide_plugins', array() ) ) );
	$detected = defined( 'WPSEO_VERSION' ) || defined( 'RANK_MATH_VERSION' ) || defined( 'AIOSEO_VERSION' ) || defined( 'SEOPRESS_VERSION' ) || defined( 'THE_SEO_FRAMEWORK_VERSION' );
	foreach ( $plugins as $plugin ) {
		if ( preg_match( '~^(wordpress-seo(?:-premium)?|seo-by-rank-math(?:-pro)?|all-in-one-seo-pack(?:-pro)?|wp-seopress(?:-pro)?|autodescription|slim-seo)/~', $plugin ) ) $detected = true;
	}
	// Permite delegar también en otros gestores de metadatos.
	return (bool) apply_filters( 'contador_about_has_seo_plugin', $detected );
}

function contador_about_document_title( $title ) {
	if ( is_page( 'sobre-nosotros' ) && '' === $title && ! contador_about_has_seo_plugin() ) {
		return 'Sobre nosotros | Contadores en Nicaragua - Tu Contador de Confianza';
	}
	return $title;
}
add_filter( 'pre_get_document_title', 'contador_about_document_title', 20 );

function contador_about_meta_description() {
	if ( ! is_page( 'sobre-nosotros' ) || contador_about_has_seo_plugin() ) return;
	echo '<meta name="description" content="' . esc_attr( 'Conoce a Tu Contador de Confianza, un equipo con más de 20 años de trayectoria ofreciendo servicios contables y asesoría tributaria en Nicaragua.' ) . '">' . "\n";
}
add_action( 'wp_head', 'contador_about_meta_description', 5 );

/** Usa los tamaños y srcset de la biblioteca cuando la imagen está registrada. */
function contador_about_image( $path, $alt, $hero = false ) {
	$url = content_url( '/uploads/' . $path );
	$id = attachment_url_to_postid( $url );
	$attributes = array( 'alt' => $alt, 'loading' => $hero ? 'eager' : 'lazy', 'decoding' => 'async', 'sizes' => '(max-width: 800px) calc(100vw - 32px), 540px' );
	if ( $hero ) $attributes['fetchpriority'] = 'high';
	if ( $id ) return wp_get_attachment_image( $id, 'large', false, $attributes );
	return '<img src="' . esc_url( $url ) . '" alt="' . esc_attr( $alt ) . '" loading="' . esc_attr( $attributes['loading'] ) . '" decoding="async"' . ( $hero ? ' fetchpriority="high"' : '' ) . '>';
}

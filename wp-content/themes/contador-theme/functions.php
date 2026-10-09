<?php
/**
 * Funciones del tema.
 *
 * @package Contador_Theme
 */

defined( 'ABSPATH' ) || exit;

/**
 * Registra los soportes y las ubicaciones de menú del tema.
 */
function contador_theme_setup() {
	add_theme_support( 'title-tag' );
	add_theme_support( 'post-thumbnails' );
	add_theme_support(
		'custom-logo',
		array(
			'flex-width'  => true,
			'flex-height' => true,
		)
	);

	register_nav_menus(
		array(
			'primary-menu' => __( 'Menú principal', 'contador-theme' ),
		)
	);
}
add_action( 'after_setup_theme', 'contador_theme_setup' );

/**
 * Carga los estilos globales y renueva su versión cuando cambia el archivo.
 */
function contador_theme_enqueue_styles() {
	$css_file = 'assets/css/global.css';

	wp_enqueue_style(
		'contador-theme-global',
		get_theme_file_uri( $css_file ),
		array(),
		(string) filemtime( get_theme_file_path( $css_file ) )
	);
}
add_action( 'wp_enqueue_scripts', 'contador_theme_enqueue_styles' );

/**
 * Estilos del footer compartido por todas las páginas.
 */
function contador_theme_enqueue_footer_styles() {
	wp_enqueue_style(
		'contador-theme-footer',
		get_theme_file_uri( 'assets/css/components/footer.css' ),
		array( 'contador-theme-global' ),
		(string) filemtime( get_theme_file_path( 'assets/css/components/footer.css' ) )
	);
}
add_action( 'wp_enqueue_scripts', 'contador_theme_enqueue_footer_styles' );

/**
 * Carga los estilos de la Home únicamente en la portada.
 */
function contador_theme_enqueue_home_styles() {
	if ( ! is_front_page() ) {
		return;
	}

	wp_enqueue_style(
		'contador-theme-home',
		get_theme_file_uri( 'assets/css/pages/home.css' ),
		array( 'contador-theme-global' ),
		(string) filemtime( get_theme_file_path( 'assets/css/pages/home.css' ) )
	);

	wp_enqueue_script(
		'contador-theme-home',
		get_theme_file_uri( 'assets/js/pages/home.js' ),
		array(),
		(string) filemtime( get_theme_file_path( 'assets/js/pages/home.js' ) ),
		true
	);
}
add_action( 'wp_enqueue_scripts', 'contador_theme_enqueue_home_styles' );

/**
 * Carga los recursos del header después de los estilos globales.
 */
function contador_theme_enqueue_header_assets() {
	wp_enqueue_style(
		'contador-theme-header',
		get_theme_file_uri( 'assets/css/header.css' ),
		array( 'contador-theme-global' ),
		(string) filemtime( get_theme_file_path( 'assets/css/header.css' ) )
	);

	wp_enqueue_script(
		'contador-theme-header',
		get_theme_file_uri( 'assets/js/header.js' ),
		array(),
		(string) filemtime( get_theme_file_path( 'assets/js/header.js' ) ),
		true
	);
}
add_action( 'wp_enqueue_scripts', 'contador_theme_enqueue_header_assets' );

/**
 * Aplica las clases globales de botón al CTA identificado desde WordPress.
 */
function contador_theme_header_cta_attributes( $atts, $item, $args, $depth ) {
	if ( 'primary-menu' === $args->theme_location && 0 === $depth && in_array( 'menu-item-cta', (array) $item->classes, true ) ) {
		$atts['class'] = trim( ( $atts['class'] ?? '' ) . ' btn btn-primary' );
	}

	return $atts;
}
add_filter( 'nav_menu_link_attributes', 'contador_theme_header_cta_attributes', 10, 4 );



/** Recursos compartidos por las páginas individuales de servicios. */
function contador_theme_enqueue_accounting_service_styles() {
	if ( ! is_page( array( 'servicios-contables', 'declaraciones-de-impuestos', 'asesoria-contable-tributaria' ) ) ) {
		return;
	}
	$css_file = 'assets/css/pages/servicios-contables.css';
	wp_enqueue_style(
		'contador-theme-accounting-service',
		get_theme_file_uri( $css_file ),
		array( 'contador-theme-global' ),
		(string) filemtime( get_theme_file_path( $css_file ) )
	);
	$js_file = 'assets/js/pages/servicios-contables.js';
	wp_enqueue_script(
		'contador-theme-accounting-service',
		get_theme_file_uri( $js_file ),
		array( 'contador-theme-header' ),
		(string) filemtime( get_theme_file_path( $js_file ) ),
		true
	);
}
add_action( 'wp_enqueue_scripts', 'contador_theme_enqueue_accounting_service_styles' );

/** Recursos FAQ compartidos por las páginas que utilizan el componente. */
function contador_theme_enqueue_faq_assets() {
	if ( ! is_front_page() && ! is_page( array( 'servicios-contables', 'declaraciones-de-impuestos', 'asesoria-contable-tributaria' ) ) ) {
		return;
	}
	$css_file = 'assets/css/components/faq.css';
	$js_file = 'assets/js/components/faq.js';
	wp_enqueue_style( 'contador-theme-faq', get_theme_file_uri( $css_file ), array( 'contador-theme-global' ), (string) filemtime( get_theme_file_path( $css_file ) ) );
	wp_enqueue_script( 'contador-theme-faq', get_theme_file_uri( $js_file ), array(), (string) filemtime( get_theme_file_path( $js_file ) ), true );
}
add_action( 'wp_enqueue_scripts', 'contador_theme_enqueue_faq_assets', 20 );

/** Títulos SEO de servicios mediante el soporte title-tag de WordPress. */
function contador_theme_tax_service_document_title( $parts ) {
	if ( is_page( 'declaraciones-de-impuestos' ) ) {
		$parts['title'] = 'Declaraciones de impuestos en Nicaragua';
	} elseif ( is_page( 'asesoria-contable-tributaria' ) ) {
		$parts['title'] = 'Asesoría contable y tributaria en Nicaragua';
	}
	return $parts;
}
add_filter( 'document_title_parts', 'contador_theme_tax_service_document_title' );

require_once get_template_directory() . '/inc/calculators.php';
require_once get_template_directory() . '/inc/advisory-form.php';
require_once get_template_directory() . '/inc/advisory-endpoint.php';
require_once get_template_directory() . '/inc/about-page.php';
require_once get_template_directory() . '/inc/blog.php';
require_once get_template_directory() . '/inc/subscriptions/bootstrap.php';

/** Recursos exclusivos del índice de Servicios. */
function contador_services_index_assets() {
	if ( ! is_page( 'servicios' ) ) return;
	$file = 'assets/css/pages/servicios.css';
	wp_enqueue_style( 'contador-services-index', get_theme_file_uri( $file ), array( 'contador-theme-global', 'contador-theme-header' ), (string) filemtime( get_theme_file_path( $file ) ) );
}
add_action( 'wp_enqueue_scripts', 'contador_services_index_assets', 20 );

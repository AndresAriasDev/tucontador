<?php
/** Recursos del blog nativo; no crea contenido ni cambia opciones de WordPress. */
defined( 'ABSPATH' ) || exit;

function contador_blog_assets() {
	if ( ! is_home() && ! is_category() && ! is_singular( 'post' ) ) return;
	$file = 'assets/css/pages/blog.css';
	wp_enqueue_style( 'contador-theme-blog', get_theme_file_uri( $file ), array( 'contador-theme-global', 'contador-theme-header' ), (string) filemtime( get_theme_file_path( $file ) ) );
	if ( is_singular( 'post' ) ) {
		$script = 'assets/js/pages/blog-related.js';
		wp_enqueue_script( 'contador-blog-related', get_theme_file_uri( $script ), array(), (string) filemtime( get_theme_file_path( $script ) ), true );
	}
}
add_action( 'wp_enqueue_scripts', 'contador_blog_assets', 20 );

/** Un único orden estable, sin promover entradas fijadas ni alterar offsets/totales. */
function contador_blog_query_order( $query ) {
	if ( is_admin() || ! $query->is_main_query() || ( ! $query->is_home() && ! $query->is_category() ) ) return;
	$query->set( 'posts_per_page', 12 );
	$query->set( 'ignore_sticky_posts', true );
	$query->set( 'orderby', array( 'date' => 'DESC', 'ID' => 'DESC' ) );
}
add_action( 'pre_get_posts', 'contador_blog_query_order' );

function contador_blog_url() {
	$page_id = (int) get_option( 'page_for_posts' );
	if ( $page_id && 'publish' === get_post_status( $page_id ) ) return get_permalink( $page_id );
	return 'posts' === get_option( 'show_on_front' ) ? home_url( '/' ) : home_url( '/blog/' );
}

function contador_blog_category() {
	$categories = get_the_category();
	if ( ! $categories ) return;
	$category = reset( $categories );
	$url = get_category_link( $category->term_id );
	if ( ! is_wp_error( $url ) ) {
		echo '<a class="blog-category" href="' . esc_url( $url ) . '">' . esc_html( $category->name ) . '</a>';
	}
}

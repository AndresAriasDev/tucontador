<?php
defined( 'ABSPATH' ) || exit;

/** Recursos del formulario; invocar en wp_enqueue_scripts para reutilizarlo en otra página. */
function contador_enqueue_advisory_assets() {
  $css = 'assets/css/components/advisory-form.css';
  wp_enqueue_style( 'contador-advisory', get_theme_file_uri( $css ), array( 'contador-theme-global' ), (string) filemtime( get_theme_file_path( $css ) ) );
  $manifest_path = get_theme_file_path( 'dist/.vite/manifest.json' );
  if ( ! file_exists( $manifest_path ) ) return;
  $manifest = json_decode( file_get_contents( $manifest_path ), true );
  $entry = $manifest['src/advisory/main.tsx'] ?? null;
  if ( empty( $entry['file'] ) ) return;
  wp_enqueue_script( 'contador-advisory', get_theme_file_uri( 'dist/' . $entry['file'] ), array(), null, true );
}
function contador_advisory_page_assets() {
  if ( is_page( array( 'servicios-contables', 'declaraciones-de-impuestos', 'asesoria-contable-tributaria' ) ) ) contador_enqueue_advisory_assets();
}
add_action( 'wp_enqueue_scripts', 'contador_advisory_page_assets' );

function contador_advisory_module_script( $tag, $handle ) {
  return 'contador-advisory' === $handle ? str_replace( '<script ', '<script type="module" ', $tag ) : $tag;
}
add_filter( 'script_loader_tag', 'contador_advisory_module_script', 10, 2 );

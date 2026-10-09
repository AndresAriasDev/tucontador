<?php defined( 'ABSPATH' ) || exit;
$title = 'confirm' === $action ? 'Confirma tu suscripción' : 'Cancelar suscripción';
?>
<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex,nofollow"><meta name="referrer" content="no-referrer"><title><?php echo esc_html( $title ); ?> | Tu Contador de Confianza</title>
<link rel="stylesheet" href="<?php echo esc_url( get_theme_file_uri( 'assets/css/global.css' ) ); ?>">
<link rel="stylesheet" href="<?php echo esc_url( get_theme_file_uri( 'assets/css/components/subscription.css' ) ); ?>">
</head><body class="subscription-manage">
<main class="subscription-manage__card">
	<h1><?php echo esc_html( $title ); ?></h1>
	<p><?php echo 'confirm' === $action ? 'Pulsa el botón para confirmar que deseas recibir las nuevas publicaciones del blog.' : 'Pulsa el botón para dejar de recibir las nuevas publicaciones del blog.'; ?></p>
	<form data-subscription-manage data-endpoint="<?php echo esc_url( rest_url( 'tucontador/v1/subscriptions/' . $action ) ); ?>">
		<button type="submit" class="btn btn-primary" disabled><?php echo esc_html( $title ); ?></button>
		<p data-subscription-status role="status" aria-live="polite"></p>
	</form>
	<noscript><p>Activa JavaScript para procesar este enlace de forma segura.</p></noscript>
	<a href="<?php echo esc_url( function_exists( 'contador_blog_url' ) ? contador_blog_url() : home_url( '/blog/' ) ); ?>">Visitar el blog</a>
</main>
<script src="<?php echo esc_url( add_query_arg( 'ver', (string) filemtime( get_theme_file_path( 'assets/js/subscription.js' ) ), get_theme_file_uri( 'assets/js/subscription.js' ) ) ); ?>"></script>
</body></html>

<?php
/**
 * Encabezado compartido del documento.
 *
 * @package Contador_Theme
 */

defined( 'ABSPATH' ) || exit;
?>
<!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
	<meta charset="<?php bloginfo( 'charset' ); ?>">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<?php wp_head(); ?>
</head>
<body <?php body_class(); ?>>
	<?php wp_body_open(); ?>
	<header class="site-header">
		<div class="container site-header__inner">
			<div class="site-header__logo">
				<?php the_custom_logo(); ?>
			</div>
			<?php if ( has_nav_menu( 'primary-menu' ) ) : ?>
				<button class="site-header__toggle" type="button" aria-expanded="false" aria-controls="primary-navigation" hidden>
					<span class="site-header__toggle-icon" aria-hidden="true"></span>
					<span><?php esc_html_e( 'Menú', 'contador-theme' ); ?></span>
				</button>
				<nav id="primary-navigation" class="site-header__nav" aria-label="<?php esc_attr_e( 'Menú principal', 'contador-theme' ); ?>">
					<?php
					wp_nav_menu(
						array(
							'theme_location' => 'primary-menu',
							'container'      => false,
							'menu_class'     => 'site-header__menu',
							'fallback_cb'    => false,
						)
					);
					?>
				</nav>
			<?php endif; ?>
		</div>
	</header>

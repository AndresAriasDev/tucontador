<?php
/**
 * Footer global y cierre del documento.
 *
 * @package Contador_Theme
 */
defined( 'ABSPATH' ) || exit;

// Solo enlazar páginas publicadas; las pendientes conservan su etiqueta visible.
$footer_page_url = static function ( $slug ) {
	$page = get_page_by_path( $slug );
	return $page instanceof WP_Post && 'publish' === $page->post_status ? get_permalink( $page ) : '';
};
$footer_contact_url = $footer_page_url( 'contacto' );
$footer_blog_id = (int) get_option( 'page_for_posts' );
$footer_links = array(
	'Inicio' => home_url( '/' ),
	'Servicios' => $footer_page_url( 'servicios' ),
	'Calculadoras' => $footer_page_url( 'calculadoras' ),
	'Blog' => $footer_blog_id && 'publish' === get_post_status( $footer_blog_id ) ? get_permalink( $footer_blog_id ) : $footer_page_url( 'blog' ),
	'Sobre mí' => $footer_page_url( 'sobre-mi' ),
	'Contacto' => $footer_contact_url,
);
$footer_legal = array(
	'Términos y condiciones' => $footer_page_url( 'terminos-y-condiciones' ),
	'Política de privacidad' => get_privacy_policy_url() ?: $footer_page_url( 'politica-de-privacidad' ),
);
?>
<footer class="site-footer">
	<div class="container site-footer__columns">
		<div class="site-footer__brand">
			<a class="site-footer__logo" href="<?php echo esc_url( home_url( '/' ) ); ?>" aria-label="Tu Contador de Confianza — Inicio">
				<img src="<?php echo esc_url( content_url( '/uploads/2026/09/logo-color-blanco-tu-contador-de-confianza.png' ) ); ?>" alt="Tu Contador de Confianza" loading="lazy" decoding="async">
			</a>
			<p>Acompañamiento contable y tributario para negocios y profesionales en Nicaragua.</p>

		</div>
		<nav aria-labelledby="footer-links-title">
			<h2 id="footer-links-title">Enlaces rápidos</h2>
			<ul class="site-footer__links">
				<?php foreach ( $footer_links as $label => $url ) : ?>
					<li><?php if ( $url ) : ?><a href="<?php echo esc_url( $url ); ?>"><?php echo esc_html( $label ); ?></a><?php else : ?><span><?php echo esc_html( $label ); ?></span><?php endif; ?></li>
				<?php endforeach; ?>
			</ul>
		</nav>
		<div class="site-footer__contact">
			<h2>Contacto</h2>
			<address>
				<a href="https://maps.app.goo.gl/Ws9qPQhxMyxEEQ6J9" target="_blank" rel="noopener noreferrer"><span class="site-footer__icon site-footer__icon--location" aria-hidden="true"></span><span>Colegio Francisco Morazán 2 cuadras al norte, 1 cuadra al oeste, casa B 284, 12012</span></a>
				<a href="mailto:eduardoleonprofesional@hotmail.com" target="_blank" rel="noopener noreferrer"><span class="site-footer__icon site-footer__icon--mail" aria-hidden="true"></span><span>eduardoleonprofesional@hotmail.com</span></a>
				<a href="https://wa.me/50588027409?text=%C2%A1Quiero%20consultar%20acerca%20de%20sus%20servicios%20contables%20" target="_blank" rel="noopener noreferrer"><span class="site-footer__icon site-footer__icon--phone" aria-hidden="true"></span><span>8802-7409</span></a>
			</address>
		</div>
		<div class="site-footer__subscription">
			<h2 id="footer-subscribe-title">Suscríbete a mi blog</h2>
			
			<div class="site-footer__email-field" role="group" aria-labelledby="footer-subscribe-title">
				<input type="email" name="subscriber_email" placeholder="Tu correo electrónico" aria-label="Tu correo electrónico" autocomplete="email" disabled>
				<button type="button" aria-label="Suscribirse (próximamente)" disabled><span class="site-footer__icon site-footer__icon--send" aria-hidden="true"></span></button>
			</div>
			
			
		</div>
	</div>
	<div class="site-footer__utility">
		<div class="container site-footer__utility-inner">
			<nav aria-label="Información legal"><ul><?php foreach ( $footer_legal as $label => $url ) : ?><li><?php if ( $url ) : ?><a href="<?php echo esc_url( $url ); ?>"><?php echo esc_html( $label ); ?></a><?php else : ?><span><?php echo esc_html( $label ); ?></span><?php endif; ?></li><?php endforeach; ?></ul></nav>
			<nav class="site-footer__socials" aria-label="Redes sociales">
				<a href="https://www.facebook.com/zonacontablenicaragua" target="_blank" rel="noopener noreferrer" aria-label="Facebook"><span aria-hidden="true">f</span></a>
				<a href="https://www.tiktok.com/@elcontadordelbarrio/video/7188229908991069445" target="_blank" rel="noopener noreferrer" aria-label="TikTok"><span class="site-footer__tiktok" aria-hidden="true"></span></a>
			</nav>
		</div>
	</div>
	<div class="site-footer__bottom">
		<div class="container site-footer__bottom-inner">
			<p class="site-footer__credits"><span>© 2026 Tu Contador de Confianza.</span><span class="site-footer__developer">Diseñado y desarrollado por AndresAriasDev</span></p>

		</div>
	</div>
</footer>
<?php wp_footer(); ?>
</body>
</html>

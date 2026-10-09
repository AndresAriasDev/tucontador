<?php
/** Índice de servicios: plantilla nativa para la página con slug servicios. */
defined( 'ABSPATH' ) || exit;
$resolve_service = static function ( $slug ) {
	foreach ( array( 'servicios/' . $slug, $slug ) as $path ) {
		$page = get_page_by_path( $path );
		if ( $page instanceof WP_Post && 'publish' === $page->post_status ) return get_permalink( $page );
	}
	return '';
};
$services = array(
	array( 'Servicios contables', 'Organiza y mantén actualizada la información contable de tu negocio con acompañamiento profesional y atención personalizada', 'servicios-contables' ),
	array( 'Declaraciones de impuestos', 'Recibe apoyo para preparar y presentar tus declaraciones tributarias de acuerdo con las obligaciones de tu negocio ante la DGI', 'declaraciones-de-impuestos' ),
	array( 'Asesoría contable y tributaria', 'Resuelve dudas sobre contabilidad, impuestos y obligaciones fiscales con orientación profesional adaptada a tu situación', 'asesoria-contable-tributaria' ),
);
foreach ( $services as &$service ) $service[] = $resolve_service( $service[2] );
unset( $service );
$advisory_url = '';
foreach ( array( 2, 0, 1 ) as $index ) {
	if ( $services[$index][3] ) { $advisory_url = $services[$index][3] . '#solicitar-asesoria'; break; }
}
$portrait_url = content_url( '/uploads/2026/09/eduardo-leon-tu-contador-de-confianza-en-nicaragua.png' );
$portrait_id = attachment_url_to_postid( $portrait_url );
get_header();
?>
<main id="primary" class="services-index">
	<section class="services-index__catalog" aria-labelledby="services-index-title">
		<div class="container">
			<div class="services-index__intro">
				<h1 id="services-index-title">Servicios contables y asesoría tributaria en Nicaragua</h1>
				<p>Encuentra el apoyo contable que necesitas para mantener tu negocio organizado, cumplir con tus obligaciones tributarias y tomar decisiones con mayor tranquilidad</p>
			</div>
			<div class="services-index__layout">
				<div class="services-index__portrait">
					<?php if ( $portrait_id ) : ?>
						<?php echo wp_get_attachment_image( $portrait_id, 'large', false, array( 'alt' => 'Eduardo León, contador y asesor de negocios en Nicaragua', 'loading' => 'lazy', 'decoding' => 'async', 'sizes' => '(max-width: 900px) 90vw, 460px' ) ); ?>
					<?php else : ?>
						<img src="<?php echo esc_url( $portrait_url ); ?>" alt="Eduardo León, contador y asesor de negocios en Nicaragua" loading="lazy" decoding="async">
					<?php endif; ?>
				</div>
				<div class="services-index__list">
					<?php foreach ( $services as $index => $service ) : ?>
						<article class="services-index__item">
							<span class="services-index__number" aria-hidden="true"><?php echo esc_html( sprintf( '%02d', $index + 1 ) ); ?></span>
							<div>
								<h2><?php echo esc_html( $service[0] ); ?></h2>
								<p><?php echo esc_html( $service[1] ); ?></p>
								<?php if ( $service[3] ) : ?><a class="btn btn-outline" href="<?php echo esc_url( $service[3] ); ?>" aria-label="<?php echo esc_attr( 'Conocer servicio: ' . $service[0] ); ?>">Conocer servicio</a><?php endif; ?>
							</div>
						</article>
					<?php endforeach; ?>
				</div>
			</div>
		</div>
	</section>
	<section class="services-index__guidance" aria-labelledby="services-guidance-title">
		<div class="container">
			<h2 id="services-guidance-title">¿No sabes qué servicio contable necesitas?</h2>
			<p>No necesitas conocer todos los términos contables para solicitar ayuda. Si tienes declaraciones pendientes, dudas sobre impuestos o necesitas organizar la contabilidad de tu negocio, podemos revisar tu situación y orientarte sobre el servicio adecuado</p>
			<?php if ( $advisory_url ) : ?><a class="btn btn-primary" href="<?php echo esc_url( $advisory_url ); ?>">Solicitar asesoría</a><?php endif; ?>
		</div>
	</section>
</main>
<?php get_footer(); ?>

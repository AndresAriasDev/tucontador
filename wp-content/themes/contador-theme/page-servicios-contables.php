<?php
/**
 * Página individual de Servicios contables, asignada por su slug.
 *
 * @package Contador_Theme
 */
defined( 'ABSPATH' ) || exit;

$service_page_url = static function ( $path ) {
	$page = get_page_by_path( $path );
	return $page instanceof WP_Post && 'publish' === $page->post_status ? get_permalink( $page ) : '';
};
$contact_url = $service_page_url( 'contacto' );
$portrait_url = content_url( '/uploads/2026/09/eduardo-leon-tu-contador-de-confianza-elegante.png' );
$portrait_id = attachment_url_to_postid( $portrait_url );
$needs = array(
	array( 'No tienes tiempo para llevar tu contabilidad', 'Concéntrate en administrar y hacer crecer tu negocio mientras recibes apoyo profesional para mantener tu información contable al día.', 'Más tiempo para enfocarte en tu negocio' ),
	array( 'Tienes tu información contable desorganizada', 'Recibe ayuda para ordenar tus registros y mantener un mejor control de la información relacionada con las operaciones de tu negocio.', 'Pon en orden tu información contable' ),
	array( 'Necesitas acompañamiento contable', 'Resuelve las dudas y situaciones contables que puedan surgir durante las operaciones de tu negocio con atención profesional y personalizada.', 'Acompañamiento cuando lo necesites' ),
);
$included = array(
	array( 'Contabilidad general', 'Apoyo profesional para llevar y mantener organizada la información contable relacionada con las operaciones de tu negocio.', 'notebook-pen.svg' ),
	array( 'Organización y control', 'Organización y seguimiento de tu información y documentación para mantener un mayor control contable de las operaciones de tu negocio.', 'clipboard-pen.svg' ),
	array( 'Seguimiento contable', 'Acompañamiento para mantener tus registros al día y dar seguimiento a las necesidades contables habituales de tu negocio.', 'calendar-check-2.svg' ),
	array( 'Acompañamiento continuo', 'Atención personalizada para resolver dudas y situaciones contables que puedan surgir durante las operaciones de tu negocio.', 'headset.svg' ),
);
$faqs = array(
	array( '¿Cuánto cuesta contratar un servicio contable en Nicaragua?', 'El costo depende de las características del negocio y del tipo de apoyo que necesites. Puedes contarme tu situación para determinar qué servicio se adapta mejor a tus necesidades y recibir una propuesta.' ),
	array( '¿Puedo contratar un servicio contable de forma mensual?', 'Sí. Si necesitas apoyo continuo para llevar la contabilidad de tu negocio, podemos revisar tu situación y definir el acompañamiento que necesitas de forma periódica.' ),
	array( '¿Puedo solicitar ayuda si tengo mi contabilidad atrasada o desorganizada?', 'Sí. Primero podemos revisar tu situación actual, identificar qué información está pendiente y determinar qué necesitas para comenzar a poner en orden tu contabilidad.' ),
	array( '¿Qué información necesito para comenzar?', 'Dependerá de la situación de tu negocio y del servicio que necesites. Durante el primer contacto podemos revisar qué información tienes disponible y qué documentación será necesaria para comenzar.' ),
	array( '¿Atiendes pequeños negocios y emprendedores?', 'Sí. Los servicios contables pueden adaptarse a pequeños negocios, emprendedores y profesionales que necesiten apoyo para llevar un mejor control de su contabilidad.' ),
);
get_header();
?>
<main id="primary" class="accounting-service">
	<header class="accounting-service__hero">
		<div class="container accounting-service__hero-inner">
			<div class="accounting-service__hero-copy">
				<h1>Servicios contables en Nicaragua</h1>
				<p class="accounting-service__lead">Mantén tu contabilidad en orden y enfócate en hacer crecer tu negocio con el respaldo de un contador con experiencia.</p>
				<div class="accounting-service__actions">
					<a class="btn btn-primary" href="#solicitar-asesoria">Solicitar asesoría</a>
					<a class="btn btn-outline" href="#que-incluye">Ver qué incluye</a>
				</div>
			</div>
			<div class="accounting-service__hero-portrait">
				<?php if ( $portrait_id ) : ?>
					<?php echo wp_get_attachment_image( $portrait_id, 'full', false, array( 'alt' => 'Eduardo León, contador en Nicaragua', 'loading' => 'eager', 'fetchpriority' => 'high', 'sizes' => '(max-width: 760px) 288px, (max-width: 1200px) 40vw, 480px' ) ); ?>
				<?php else : ?>
					<img src="<?php echo esc_url( $portrait_url ); ?>" alt="Eduardo León, contador en Nicaragua" loading="eager" fetchpriority="high" decoding="async">
				<?php endif; ?>
			</div>
		</div>
	</header>

	<section class="accounting-service__section" aria-labelledby="necesidades-title">
		<div class="container accounting-service__needs-layout">
			<div class="accounting-service__needs-intro">
				<h2 id="necesidades-title">¿Necesitas ayuda para llevar la contabilidad de tu negocio?</h2>
			</div>
			<div class="accounting-service__needs" data-service-needs>
				<?php foreach ( $needs as $index => $need ) : ?>
					<details class="accounting-service__need" <?php echo 0 === $index ? 'open' : ''; ?>>
						<summary id="service-need-<?php echo esc_attr( $index ); ?>" aria-controls="service-need-panel-<?php echo esc_attr( $index ); ?>">
							<span class="accounting-service__number" aria-hidden="true"><?php echo esc_html( sprintf( '%02d', $index + 1 ) ); ?></span>
							<span><?php echo esc_html( $need[0] ); ?></span>
							<span class="accounting-service__need-indicator" aria-hidden="true">+</span>
						</summary>
						<div class="accounting-service__need-panel" id="service-need-panel-<?php echo esc_attr( $index ); ?>" role="region" aria-labelledby="service-need-<?php echo esc_attr( $index ); ?>">
							<span class="accounting-service__need-number" aria-hidden="true"><?php echo esc_html( sprintf( '%02d', $index + 1 ) ); ?></span>
							<h3><?php echo esc_html( $need[2] ); ?></h3>
							<p><?php echo esc_html( $need[1] ); ?></p>
						</div>
					</details>
				<?php endforeach; ?>
			</div>
		</div>
	</section>

	<section id="que-incluye" class="accounting-service__section accounting-service__included" aria-labelledby="incluye-title">
		<div class="container">
			<div class="accounting-service__included-intro">
				<h2 id="incluye-title">¿Qué incluyen mis servicios contables?</h2>
				<p>El servicio se adapta a las necesidades de cada negocio para ayudarte a mantener tu información contable organizada y bajo control.</p>
			</div>
			<div class="accounting-service__included-grid" data-service-included>
				<?php foreach ( $included as $index => $item ) : ?>
					<article class="accounting-service__included-item">
						<img src="<?php echo esc_url( get_theme_file_uri( 'assets/icons/' . $item[2] ) ); ?>" width="28" height="28" alt="" aria-hidden="true" loading="lazy" decoding="async">
						<h3><button class="accounting-service__included-trigger" id="included-trigger-<?php echo esc_attr( $index ); ?>" type="button" aria-expanded="true" aria-controls="included-panel-<?php echo esc_attr( $index ); ?>" disabled><?php echo esc_html( $item[0] ); ?></button></h3>
						<div class="accounting-service__included-panel" id="included-panel-<?php echo esc_attr( $index ); ?>" role="region" aria-labelledby="included-trigger-<?php echo esc_attr( $index ); ?>">
							<p><?php echo esc_html( $item[1] ); ?></p>
							<a class="btn btn-primary" href="#solicitar-asesoria">Solicitar asesoría</a>
						</div>
					</article>
				<?php endforeach; ?>
			</div>
		</div>
	</section>

	<?php
	get_template_part( 'template-parts/components/advisory-form', null, array(
		'id' => 'solicitar-asesoria',
		'service' => 'Servicios contables',
	) );
	get_template_part( 'template-parts/components/faq', null, array(
		'title' => 'Preguntas frecuentes sobre servicios contables',
		'items' => $faqs,
	) );
	?>
</main>
<?php get_footer(); ?>

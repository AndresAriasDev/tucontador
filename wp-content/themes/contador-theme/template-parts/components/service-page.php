<?php
/**
 * Composición compartida de páginas individuales de servicios.
 * Args: title, description, needs_title, needs_intro (opcional), needs,
 * included_title, included_intro, included, service, faq_title y faqs.
 */
defined( 'ABSPATH' ) || exit;

$portrait_url = content_url( '/uploads/2026/09/eduardo-leon-tu-contador-de-confianza-elegante.png' );
$portrait_id = attachment_url_to_postid( $portrait_url );
get_header();
?>
<main id="primary" class="accounting-service">
	<header class="accounting-service__hero">
		<div class="container accounting-service__hero-inner">
			<div class="accounting-service__hero-copy">
				<h1><?php echo esc_html( $args['title'] ); ?></h1>
				<p class="accounting-service__lead"><?php echo esc_html( $args['description'] ); ?></p>
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
				<h2 id="necesidades-title"><?php echo esc_html( $args['needs_title'] ); ?></h2>
				<?php if ( ! empty( $args['needs_intro'] ) ) : ?>
					<p><?php echo esc_html( $args['needs_intro'] ); ?></p>
				<?php endif; ?>
			</div>
			<div class="accounting-service__needs" data-service-needs>
				<?php foreach ( $args['needs'] as $index => $need ) : ?>
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
				<h2 id="incluye-title"><?php echo esc_html( $args['included_title'] ); ?></h2>
				<p><?php echo esc_html( $args['included_intro'] ); ?></p>
			</div>
			<div class="accounting-service__included-grid" data-service-included>
				<?php foreach ( $args['included'] as $index => $item ) : ?>
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
		'service' => $args['service'],
	) );
	get_template_part( 'template-parts/components/faq', null, array(
		'title' => $args['faq_title'],
		'items' => $args['faqs'],
	) );
	?>
</main>
<?php get_footer(); ?>

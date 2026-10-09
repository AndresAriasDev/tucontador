<?php
/** Tarjeta del post actual. Args: heading (h2/h3). */
defined( 'ABSPATH' ) || exit;
$heading = isset( $args['heading'] ) && 'h3' === $args['heading'] ? 'h3' : 'h2';
?>
<article class="blog-card<?php echo has_post_thumbnail() ? '' : ' blog-card--no-image'; ?>">
	<?php if ( has_post_thumbnail() ) : ?>
		<div class="blog-card__image">
			<?php the_post_thumbnail( 'medium_large', array(
				'loading' => 'lazy',
				'decoding' => 'async',
				'sizes' => '(max-width: 640px) calc(100vw - 32px), (max-width: 1000px) 50vw, 360px',
			) ); ?>
			<div class="blog-card__category"><?php contador_blog_category(); ?></div>
		</div>
	<?php endif; ?>
	<div class="blog-card__body">
		<?php if ( ! has_post_thumbnail() ) : ?>
			<div class="blog-card__category blog-card__category--fallback"><?php contador_blog_category(); ?></div>
		<?php endif; ?>
		<div class="blog-meta"><time datetime="<?php echo esc_attr( get_the_date( DATE_W3C ) ); ?>"><?php echo esc_html( get_the_date() ); ?></time></div>
		<?php echo '<' . $heading . ' class="blog-card__title">'; ?>
			<a href="<?php the_permalink(); ?>"><?php the_title(); ?></a>
		<?php echo '</' . $heading . '>'; ?>
		<a class="blog-read" href="<?php the_permalink(); ?>" aria-label="<?php echo esc_attr( 'Leer artículo: ' . wp_strip_all_tags( get_the_title() ) ); ?>">Leer artículo <span aria-hidden="true">→</span></a>
	</div>
</article>

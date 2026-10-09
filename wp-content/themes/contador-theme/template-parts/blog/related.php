<?php
defined( 'ABSPATH' ) || exit;
$category_ids = wp_get_post_categories( get_the_ID() );
$query_args = array(
	'post_type' => 'post',
	'post_status' => 'publish',
	'posts_per_page' => 4,
	'post__not_in' => array( get_the_ID() ),
	'has_password' => false,
	'ignore_sticky_posts' => true,
	'no_found_rows' => true,
	'orderby' => array( 'date' => 'DESC', 'ID' => 'DESC' ),
);
if ( $category_ids && ! is_wp_error( $category_ids ) ) $query_args['category__in'] = $category_ids;
$related = new WP_Query( $query_args );
// Una segunda consulta solo si no hubo coincidencias por categoría.
if ( ! $related->post_count && isset( $query_args['category__in'] ) ) {
	unset( $query_args['category__in'] );
	$related = new WP_Query( $query_args );
}
if ( $related->have_posts() ) : ?>
	<aside class="blog-related" aria-labelledby="blog-related-title" data-related-carousel>
		<h2 id="blog-related-title">Artículos relacionados</h2>
		<div class="blog-related__track" tabindex="0" role="region" aria-label="Artículos relacionados, carrusel" aria-roledescription="carrusel">
			<?php while ( $related->have_posts() ) : $related->the_post(); ?>
				<div class="blog-related__slide" role="group" aria-roledescription="diapositiva" aria-label="<?php echo esc_attr( ( $related->current_post + 1 ) . ' de ' . $related->post_count ); ?>">
					<?php get_template_part( 'template-parts/blog/card', null, array( 'heading' => 'h3' ) ); ?>
				</div>
			<?php endwhile; ?>
		</div>
		<div class="blog-related__dots" role="group" aria-label="Elegir artículo relacionado" hidden></div>
	</aside>
<?php endif;
wp_reset_postdata();

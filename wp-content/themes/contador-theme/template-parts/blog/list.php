<?php
defined( 'ABSPATH' ) || exit;
global $wp_query;
// No volver a llamar have_posts() después de agotar el destacado: WordPress rebobina el loop.
if ( 0 === $wp_query->post_count ) : ?>
	<p class="blog-empty">Próximamente encontrarás aquí artículos sobre contabilidad, impuestos y obligaciones tributarias en Nicaragua.</p>
<?php elseif ( $wp_query->current_post + 1 < $wp_query->post_count ) : ?>
	<div class="blog-grid">
		<?php while ( have_posts() ) : the_post(); ?>
			<?php get_template_part( 'template-parts/blog/card' ); ?>
		<?php endwhile; ?>
	</div>
<?php endif;
the_posts_pagination( array(
	'mid_size' => 1,
	'prev_text' => '← Anterior',
	'next_text' => 'Siguiente →',
	'screen_reader_text' => 'Paginación del blog',
	'aria_label' => 'Paginación del blog',
) );

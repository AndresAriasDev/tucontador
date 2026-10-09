<?php
/** Índice nativo de entradas: todas las publicaciones comparten la cuadrícula. */
defined( 'ABSPATH' ) || exit;
get_header();
?>
<main id="primary" class="blog-page">
	<header class="blog-hero blog-hero--index">
		<div class="container">
			<h1>Blog de contabilidad e impuestos en Nicaragua</h1>
		</div>
	</header>
	<div class="container blog-listing">
		<?php get_template_part( 'template-parts/blog/categories' ); ?>
		<?php get_template_part( 'template-parts/blog/list' ); ?>
	</div>
</main>
<?php get_footer(); ?>

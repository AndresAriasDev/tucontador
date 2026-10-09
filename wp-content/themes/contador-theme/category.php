<?php
/** Archivo nativo de categorías, con la consulta principal y tarjetas compartidas. */
defined( 'ABSPATH' ) || exit;
get_header();
?>
<main id="primary" class="blog-page">
	<header class="blog-hero blog-hero--category">
		<div class="container">
			<h1><?php single_cat_title(); ?></h1>
		</div>
	</header>
	<div class="container blog-listing">
		<?php get_template_part( 'template-parts/blog/categories' ); ?>
		<?php get_template_part( 'template-parts/blog/list' ); ?>
	</div>
</main>
<?php get_footer(); ?>

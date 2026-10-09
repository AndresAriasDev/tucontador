<?php
/** Artículos individuales: esta plantilla solo se aplica al tipo nativo post. */
defined( 'ABSPATH' ) || exit;
get_header();
?>
<main id="primary" class="blog-page blog-single">
	<?php while ( have_posts() ) : the_post(); ?>
		<div class="container blog-single__layout">
		<article class="blog-single__article">
			<header class="blog-article-header">
				<h1><?php the_title(); ?></h1>
				<div class="blog-meta">
					<span>Por <?php the_author(); ?></span>
					<time datetime="<?php echo esc_attr( get_the_date( DATE_W3C ) ); ?>"><?php echo esc_html( get_the_date() ); ?></time>
				</div>
			</header>
			<div class="blog-content">
				<?php the_content(); ?>
				<?php wp_link_pages( array( 'before' => '<nav class="blog-content-pages" aria-label="Páginas del artículo">', 'after' => '</nav>' ) ); ?>
			</div>
		</article>
		<?php get_template_part( 'template-parts/blog/related' ); ?>
		</div>
	<?php endwhile; ?>
	<?php
	$advisory_page = get_page_by_path( 'servicios/asesoria-contable-tributaria' );
	if ( $advisory_page instanceof WP_Post && 'publish' === $advisory_page->post_status ) : ?>
		<section class="blog-cta">
			<div class="container">
				<h2>¿Necesitas orientación para tu negocio?</h2>
				<p>Cuéntanos tu situación y recibe apoyo contable o tributario adaptado a tus necesidades.</p>
				<a class="btn btn-primary" href="<?php echo esc_url( get_permalink( $advisory_page ) . '#solicitar-asesoria' ); ?>">Solicitar asesoría</a>
			</div>
		</section>
	<?php endif; ?>
</main>
<?php get_footer(); ?>

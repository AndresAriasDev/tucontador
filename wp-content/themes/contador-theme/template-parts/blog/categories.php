<?php
defined( 'ABSPATH' ) || exit;
$categories = get_categories( array( 'hide_empty' => true, 'orderby' => 'name', 'order' => 'ASC' ) );
?>
<nav class="blog-categories" aria-label="Categorías del blog">
	<a href="<?php echo esc_url( contador_blog_url() ); ?>"<?php if ( is_home() ) echo ' aria-current="page"'; ?>>Todas las publicaciones</a>
	<?php if ( ! is_wp_error( $categories ) ) : foreach ( $categories as $category ) :
		$url = get_category_link( $category->term_id );
		if ( is_wp_error( $url ) ) continue;
		?>
		<a href="<?php echo esc_url( $url ); ?>"<?php if ( is_category( $category->term_id ) ) echo ' aria-current="page"'; ?>><?php echo esc_html( $category->name ); ?></a>
	<?php endforeach; endif; ?>
</nav>

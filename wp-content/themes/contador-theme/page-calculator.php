<?php
/**
 * Template Name: Calculadora
 */

get_header();
?>

<main class="contador-calculator-page">
    <?php while (have_posts()) : the_post(); ?>
        <header class="contador-calculator-page__hero" aria-labelledby="calculator-page-title">
            <div class="container">
                <h1 id="calculator-page-title"><?php the_title(); ?></h1>
            </div>
        </header>

        <div class="contador-calculator-page__container">
            <?php if (has_excerpt()) : ?>
                <div class="contador-calculator-page__intro">
                    <?php echo esc_html(get_the_excerpt()); ?>
                </div>
            <?php endif; ?>
            <?php
            ob_start();
            the_content();
            $calculator_editorial = ob_get_clean();
            ?>
            <?php if (trim($calculator_editorial) !== '') : ?>
                <div class="contador-calculator-page__editorial">
                    <?php echo $calculator_editorial; // Content already processed by the_content(). ?>
                </div>
            <?php endif; ?>
            <div
                id="tucontador-calculator"
                data-calculator="<?php echo esc_attr(get_post_field('post_name', get_the_ID())); ?>"
                aria-live="polite"
            ></div>
        </div>
    <?php endwhile; ?>
</main>

<?php
get_footer();

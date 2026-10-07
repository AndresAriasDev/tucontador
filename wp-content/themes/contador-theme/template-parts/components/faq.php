<?php
/**
 * FAQ compartidas.
 * Args: title, items (pares pregunta/respuesta), action_url y action_label opcionales.
 */
defined( 'ABSPATH' ) || exit;
$faq_items = $args['items'] ?? array();
if ( empty( $faq_items ) ) {
	return;
}
$faq_id = wp_unique_id( 'site-faq-' );
$faq_title = $args['title'] ?? 'Preguntas frecuentes';
$faq_action_url = $args['action_url'] ?? '';
?>
<section class="site-faq" aria-labelledby="<?php echo esc_attr( $faq_id . '-title' ); ?>">
	<div class="container">
		<h2 class="site-faq__title" id="<?php echo esc_attr( $faq_id . '-title' ); ?>"><?php echo esc_html( $faq_title ); ?></h2>
		<div class="site-faq__list" data-site-faq>
			<?php foreach ( $faq_items as $index => $faq_item ) :
				$question_id = $faq_id . '-question-' . $index;
				$answer_id = $faq_id . '-answer-' . $index;
				?>
				<div class="site-faq__item">
					<h3>
						<button class="site-faq__trigger" id="<?php echo esc_attr( $question_id ); ?>" type="button" aria-expanded="true" aria-controls="<?php echo esc_attr( $answer_id ); ?>" disabled>
							<span><?php echo esc_html( $faq_item[0] ); ?></span>
							<span class="site-faq__indicator" aria-hidden="true"></span>
						</button>
					</h3>
					<div class="site-faq__answer" id="<?php echo esc_attr( $answer_id ); ?>" role="region" aria-labelledby="<?php echo esc_attr( $question_id ); ?>">
						<p><?php echo esc_html( $faq_item[1] ); ?></p>
					</div>
				</div>
			<?php endforeach; ?>
		</div>
	</div>
	<?php if ( $faq_action_url ) : ?>
		<div class="container site-faq__action">
			<a class="btn btn-primary" href="<?php echo esc_url( $faq_action_url ); ?>"><?php echo esc_html( $args['action_label'] ?? 'Solicitar asesoría' ); ?></a>
		</div>
	<?php endif; ?>
</section>

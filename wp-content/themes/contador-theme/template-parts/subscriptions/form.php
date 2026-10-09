<?php defined( 'ABSPATH' ) || exit; ?>
<form class="subscription-form" method="post" action="<?php echo esc_url( rest_url( 'tucontador/v1/subscriptions/subscribe' ) ); ?>" data-subscription-form data-endpoint="<?php echo esc_url( rest_url( 'tucontador/v1/subscriptions/subscribe' ) ); ?>" aria-labelledby="footer-subscribe-title">
	<div class="site-footer__email-field">
		<input id="footer-subscription-email" type="email" name="email" placeholder="Tu correo electrónico" aria-label="Tu correo electrónico" aria-describedby="subscription-error" autocomplete="email" maxlength="254" required>
		<button type="submit" aria-label="Suscribirse" disabled><span class="site-footer__icon site-footer__icon--send" aria-hidden="true"></span><span class="subscription-spinner" hidden aria-hidden="true"></span></button>
	</div>
	<div class="subscription-trap" aria-hidden="true"><label>Sitio web<input type="text" name="website" tabindex="-1" autocomplete="off"></label></div>
	<p id="subscription-error" class="subscription-error" role="alert"></p>
	<noscript><p>Activa JavaScript para solicitar la confirmación de tu suscripción.</p></noscript>
</form>
<dialog class="subscription-dialog" aria-labelledby="subscription-dialog-title" aria-describedby="subscription-dialog-description">
	<div class="subscription-dialog__icon" aria-hidden="true">✓</div>
	<h2 id="subscription-dialog-title">¡Revisa tu correo!</h2>
	<p id="subscription-dialog-description">Te enviamos un enlace para confirmar tu suscripción. Confírmala para comenzar a recibir nuestras nuevas publicaciones.</p>
	<button type="button" class="btn btn-primary" data-subscription-close autofocus>Cerrar</button>
</dialog>

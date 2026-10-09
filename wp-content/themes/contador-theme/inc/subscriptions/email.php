<?php
defined( 'ABSPATH' ) || exit;

/** Plantilla base de correos; solo recibe texto, URLs y párrafos, nunca HTML del visitante. */
function contador_subscription_email_html( $title, array $paragraphs, $label, $url, $unsubscribe = '' ) {
	$uploads = wp_get_upload_dir();
	$logo = trailingslashit( $uploads['baseurl'] ) . '2026/09/logo-tu-contador-de-confianza-nicaragua.png';
	ob_start(); ?>
<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title><?php echo esc_html( $title ); ?></title></head>
<body style="margin:0;padding:0;background:#f3f5fa;font-family:Arial,Helvetica,sans-serif;color:#02175d;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:24px 12px;">
<!--[if mso]><table role="presentation" width="600"><tr><td><![endif]-->
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;">
<tr><td align="center" bgcolor="#02175d" style="padding:28px 20px;"><table role="presentation" cellpadding="16" cellspacing="0" bgcolor="#ffffff"><tr><td><img src="<?php echo esc_url( $logo ); ?>" width="220" alt="Tu Contador de Confianza" style="display:block;width:220px;max-width:100%;height:auto;border:0;"></td></tr></table></td></tr>
<tr><td style="padding:28px 24px;"><h1 style="margin:0 0 20px;font-size:25px;line-height:1.2;"><?php echo esc_html( $title ); ?></h1>
<?php foreach ( $paragraphs as $paragraph ) : ?><p style="margin:0 0 18px;color:#56647c;font-size:16px;line-height:1.6;"><?php echo esc_html( $paragraph ); ?></p><?php endforeach; ?>
<table role="presentation" cellpadding="0" cellspacing="0"><tr><td bgcolor="#0705d6" style="border-radius:8px;mso-padding-alt:16px 24px;"><a href="<?php echo esc_url( $url ); ?>" style="display:inline-block;padding:16px 24px;color:#ffffff;font-size:16px;font-weight:bold;text-decoration:none;"><?php echo esc_html( $label ); ?></a></td></tr></table>
</td></tr>
<tr><td style="padding:24px;background:#edf0f6;color:#56647c;font-size:12px;line-height:1.6;">Tu Contador de Confianza<br>
<?php if ( $unsubscribe ) : ?><a href="<?php echo esc_url( $unsubscribe ); ?>" style="color:#02175d;">Cancelar suscripción</a><?php else : ?>Si no solicitaste esta suscripción, puedes ignorar este mensaje.<?php endif; ?>
</td></tr></table>
<!--[if mso]></td></tr></table><![endif]-->
</td></tr></table></body></html>
	<?php return ob_get_clean();
}

function contador_subscription_send_confirmation( $email, $token ) {
	$html = contador_subscription_email_html( '¡Gracias por interesarte en nuestro blog!', array(
		'Estás a un paso de recibir nuestras nuevas publicaciones sobre contabilidad, impuestos, obligaciones ante la DGI y temas de interés para los negocios en Nicaragua.',
		'Confirma tu correo electrónico para comenzar a recibir nuestras novedades.',
		'El enlace vence en 24 horas y se utiliza una sola vez.',
	), 'Confirmar suscripción', contador_subscription_link( 'confirm', $token ) );
	return wp_mail( $email, 'Confirma tu suscripción | Tu Contador de Confianza', $html, array( 'Content-Type: text/html; charset=UTF-8' ) );
}

function contador_subscription_send_welcome( $email, $unsubscribe_token ) {
	$blog_id = (int) get_option( 'page_for_posts' );
	$url = $blog_id ? get_permalink( $blog_id ) : home_url( '/blog/' );
	$html = contador_subscription_email_html( '¡Tu suscripción está confirmada!', array(
		'Gracias por suscribirte a nuestro blog.',
		'A partir de ahora recibirás notificaciones cuando publiquemos nuevos artículos sobre contabilidad, impuestos, declaraciones ante la DGI y otros temas que pueden ayudarte a administrar mejor tu negocio.',
		'Nuestro objetivo es compartir información clara, práctica y útil para ti.',
	), 'Visitar el blog', $url, contador_subscription_link( 'unsubscribe', $unsubscribe_token ) );
	return wp_mail( $email, '¡Bienvenido al blog de Tu Contador de Confianza!', $html, array( 'Content-Type: text/html; charset=UTF-8' ) );
}

<?php
/** Presentación de la notificación; recibe únicamente datos previamente validados. */
defined( 'ABSPATH' ) || exit;

function contador_render_advisory_email( array $data, $reply_to ) {
	$uploads = wp_get_upload_dir();
	$logo_url = trailingslashit( $uploads['baseurl'] ) . '2026/09/logo-tu-contador-de-confianza-nicaragua.png';
	$mailto = '';
	if ( is_email( $reply_to ) && ! preg_match( '/[\x00-\x1F\x7F]/', $reply_to ) ) {
		// Mantener @ literal; proteger delimitadores que pueden existir en la parte local.
		$address = str_replace( array( '%', '#', '?', '&', '/' ), array( '%25', '%23', '%3F', '%26', '%2F' ), $reply_to );
		$mailto = 'mailto:' . $address . '?subject=' . rawurlencode( 'Re: Solicitud de asesoría - ' . $data['service'] );
	}
	$labels = array(
		'name'      => 'Nombre completo',
		'phone'     => 'Número de celular',
		'email'     => 'Correo electrónico',
		'situation' => 'Situación actual',
		'service'   => 'Servicio solicitado',
	);
	ob_start();
	?>
<!DOCTYPE html>
<html lang="es">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>Nueva solicitud de asesoría</title>
	<style>
		@media only screen and (max-width:600px) {
			.email-padding { padding:24px 16px !important; }
			.email-title { font-size:24px !important; line-height:1.1 !important; }
			.email-details { padding:16px !important; }
			.email-button { width:100% !important; }
		}
	</style>
</head>
<body style="margin:0;padding:0;width:100%;background-color:#ffffff;color:#02175d;font-family:Arial,Helvetica,sans-serif;-webkit-text-size-adjust:100%;">
	<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#ffffff" style="width:100%;border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;">
		<tr>
			<td align="center" style="padding:0;">
				<!--[if mso]><table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0"><tr><td><![endif]-->
				<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#ffffff" style="width:100%;max-width:600px;table-layout:fixed;border-collapse:separate;border-spacing:0;mso-table-lspace:0pt;mso-table-rspace:0pt;">
					<tr>
						<td class="email-padding" align="center" bgcolor="#02175d" style="padding:32px 24px;background-color:#02175d;border-radius:12px 12px 0 0;">
							<table role="presentation" width="252" cellpadding="0" cellspacing="0" border="0" bgcolor="#ffffff" style="width:100%;max-width:252px;table-layout:fixed;background-color:#ffffff;border-radius:8px;">
								<tr><td align="center" style="padding:16px;">
									<img src="<?php echo esc_url( $logo_url ); ?>" width="220" alt="Tu Contador de Confianza" border="0" style="display:block;width:220px;max-width:100%;height:auto;border:0;color:#02175d;font-family:Arial,Helvetica,sans-serif;font-size:16px;">
								</td></tr>
							</table>
						</td>
					</tr>
					<tr>
						<td class="email-padding" style="padding:32px 24px 24px;">
							<p style="margin:0 0 12px;color:#56647c;font-size:12px;line-height:18px;">Solicitud #<?php echo esc_html( $data['request_id'] ); ?></p>
							<h1 class="email-title" style="margin:0 0 12px;color:#02175d;font-size:26px;line-height:1.1;font-weight:700;">Nueva solicitud de asesoría</h1>
							<p style="margin:0 0 28px;color:#56647c;font-size:16px;line-height:25px;">Has recibido una nueva solicitud de asesoría desde tu sitio web.</p>
							<h2 style="margin:0 0 8px;color:#02175d;font-size:18px;line-height:26px;">Información del cliente</h2>
							<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;table-layout:fixed;border-collapse:collapse;">
								<?php foreach ( $labels as $field => $label ) : ?>
								<tr><td style="padding:14px 0;border-bottom:1px solid #e5e9f2;word-wrap:break-word;overflow-wrap:anywhere;">
									<p style="margin:0 0 5px;color:#56647c;font-size:13px;line-height:19px;"><?php echo esc_html( $label ); ?></p>
									<p style="margin:0;color:#02175d;font-size:16px;line-height:24px;font-weight:700;"><?php echo esc_html( $data[$field] ); ?></p>
								</td></tr>
								<?php endforeach; ?>
							</table>
							<h2 style="margin:28px 0 12px;color:#02175d;font-size:18px;line-height:26px;">Detalles de la solicitud</h2>
							<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;table-layout:fixed;border-collapse:separate;border-spacing:0;">
								<tr><td class="email-details" bgcolor="#f3f5fa" style="padding:20px;background-color:#f3f5fa;border:1px solid #e5e9f2;border-radius:8px;color:#34425c;font-size:16px;line-height:26px;word-wrap:break-word;overflow-wrap:anywhere;"><?php echo nl2br( esc_html( $data['details'] ) ); ?></td></tr>
							</table>
							<?php if ( '' !== $mailto ) : ?>
							<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;border-collapse:collapse;">
								<tr><td align="right" style="padding:28px 0 8px;">
									<table class="email-button" role="presentation" width="240" cellpadding="0" cellspacing="0" border="0" style="width:240px;max-width:100%;border-collapse:separate;border-spacing:0;">
										<tr><td align="center" bgcolor="#0705d6" style="background-color:#0705d6;border-radius:8px;mso-padding-alt:16px 24px;">
											<?php // Esquema fijo y destinatario validado: escapar el atributo sin reescribir mailto. ?>
											<a href="<?php echo esc_attr( $mailto ); ?>" style="display:block;padding:16px 12px;border:1px solid #0705d6;border-radius:8px;color:#ffffff;font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:22px;font-weight:700;text-align:center;text-decoration:none;mso-padding-alt:0;">Responder al cliente</a>
										</td></tr>
									</table>
								</td></tr>
							</table>
							<?php endif; ?>
						</td>
					</tr>
					<tr><td class="email-padding" align="center" bgcolor="#edf0f6" style="padding:24px;background-color:#edf0f6;border-radius:0 0 12px 12px;">
						<p style="margin:0 0 8px;color:#56647c;font-size:13px;line-height:20px;font-weight:700;">Notificación automática de Tu Contador de Confianza.</p>
						<p style="margin:0;color:#56647c;font-size:12px;line-height:19px;">Este mensaje fue generado a partir de una solicitud enviada desde el formulario de tu sitio web.</p>
					</td></tr>
				</table>
				<!--[if mso]></td></tr></table><![endif]-->
			</td>
		</tr>
	</table>
</body>
</html>
	<?php
	return ob_get_clean();
}

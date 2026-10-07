<?php
/**
 * Plantilla de la portada del sitio.
 *
 * @package Contador_Theme
 */

defined( 'ABSPATH' ) || exit;

$contact_page  = get_page_by_path( 'contacto' );
$services_page = get_page_by_path( 'servicios' );
$portrait_url  = content_url( '/uploads/2026/09/eduardo-leon-tu-contador-de-confianza-elegante.png' );
$portrait_id   = attachment_url_to_postid( $portrait_url );

get_header();
?>
<!-- Plantilla: front-page.php -->
<main id="primary">
	<section class="home-hero" aria-labelledby="home-hero-title">
		<div class="container home-hero__inner">
			<div class="home-hero__content">
				<h1 id="home-hero-title" class="home-hero__title">Servicios contables en Nicaragua</h1>
				<p class="home-hero__description">Ocúpate de hacer crecer tu negocio mientras yo te ayudo con tu contabilidad, declaraciones, impuestos y obligaciones ante la DGI.</p>
				<div class="home-hero__actions">
					<?php if ( $contact_page instanceof WP_Post && 'publish' === $contact_page->post_status ) : ?>
						<a class="btn btn-primary" href="<?php echo esc_url( get_permalink( $contact_page ) ); ?>">Solicitar asesoría</a>
					<?php endif; ?>
					<?php if ( $services_page instanceof WP_Post && 'publish' === $services_page->post_status ) : ?>
						<a class="btn btn-outline" href="<?php echo esc_url( get_permalink( $services_page ) ); ?>">Ver servicios</a>
					<?php endif; ?>
				</div>
			</div>
			<div class="home-hero__portrait">
				<?php
				if ( $portrait_id ) {
					echo wp_get_attachment_image(
						$portrait_id,
						'full',
						false,
						array(
							'class'         => 'home-hero__image',
							'alt'           => 'Eduardo León, contador y asesor contable en Nicaragua',
							'loading'       => 'eager',
							'fetchpriority' => 'high',
							'sizes'         => '(max-width: 760px) 92vw, (max-width: 1200px) 45vw, 520px',
						)
					);
				} else {
					?>
					<img class="home-hero__image" src="<?php echo esc_url( $portrait_url ); ?>" alt="Eduardo León, contador y asesor contable en Nicaragua" loading="eager" fetchpriority="high" decoding="async">
					<?php
				}
				?>
				<p class="home-hero__badge home-hero__badge--attention">Atención personalizada</p>
				<p class="home-hero__badge home-hero__badge--experience">+20 años de experiencia</p>
			</div>
		</div>
	</section>
	<?php
	$situations = array(
		array( 'No sabes qué debes declarar', 'Orientación sobre las obligaciones tributarias y declaraciones correspondientes.', 'clipboard-pen.svg', 'Claridad para declarar' ),
		array( 'Tienes declaraciones pendientes', 'Revisión de la situación y pasos necesarios para ponerse al día.', 'clock-2.svg', 'Un camino para ponerte al día' ),
		array( 'Necesitas llevar la contabilidad de tu negocio', 'Organización de registros contables y obligaciones sin que tengas que encargarte de todo.', 'notebook-pen.svg', 'Orden para tu negocio' ),
		array( 'Tienes dudas sobre impuestos o la DGI', 'Orientación antes de declarar, hacer un trámite o tomar una decisión.', 'hand-coins.svg', 'Decide con orientación' ),
		array( 'Estás comenzando un negocio', 'Acompañamiento para conocer las obligaciones contables y tributarias desde el inicio.', 'chart-line.svg', 'Comienza con claridad' ),
	);
	?>
	<section class="home-situations" aria-labelledby="situations-title">
		<div class="container">
			<div class="home-situations__heading">
				<h2 id="situations-title">¿Tienes problemas con tu contabilidad o tus declaraciones?</h2>
				<p>Un atraso, un error o una obligación que desconocías puede convertirse en un problema para tu negocio. Si estás pasando por alguna de estas situaciones, puedo ayudarte a encontrar una solución.</p>
			</div>
			<div class="home-situations__selector" data-situations>
				<?php foreach ( $situations as $index => $situation ) : ?>
					<details class="home-situations__item" <?php echo 0 === $index ? 'open' : ''; ?>>
						<summary id="situation-label-<?php echo esc_attr( $index ); ?>" aria-controls="situation-panel-<?php echo esc_attr( $index ); ?>">
							<img src="<?php echo esc_url( get_theme_file_uri( 'assets/icons/' . $situation[2] ) ); ?>" width="24" height="24" alt="" aria-hidden="true" loading="lazy">
							<span><?php echo esc_html( $situation[0] ); ?></span>
							<span class="home-situations__indicator" aria-hidden="true">+</span>
						</summary>
						<div class="home-situations__panel" id="situation-panel-<?php echo esc_attr( $index ); ?>" role="region" aria-labelledby="situation-label-<?php echo esc_attr( $index ); ?>">
							<span class="home-situations__number" aria-hidden="true"><?php echo esc_html( sprintf( '%02d', $index + 1 ) ); ?></span>
							<h3><?php echo esc_html( $situation[3] ); ?></h3>
							<p><?php echo esc_html( $situation[1] ); ?></p>
						</div>
					</details>
				<?php endforeach; ?>
			</div>
			<?php if ( $contact_page instanceof WP_Post && 'publish' === $contact_page->post_status ) : ?>
				<div class="home-situations__closing">
					<a class="btn btn-primary" href="<?php echo esc_url( get_permalink( $contact_page ) ); ?>">Resolver mi situación</a>
				</div>
			<?php endif; ?>
		</div>
	</section>
	<?php
	// Los paths admiten páginas hijas de Servicios o páginas independientes.
	$catalog = array(
		array(
			'title' => 'Servicios contables',
			'text'  => 'Mantén organizada la información financiera y contable de tu negocio con acompañamiento profesional y atención personalizada.',
			'slug'  => 'servicios-contables',
		),
		array(
			'title' => 'Declaraciones de impuestos',
			'text'  => 'Recibe apoyo para preparar y presentar tus declaraciones tributarias correctamente y dentro de los plazos correspondientes.',
			'slug'  => 'declaraciones-de-impuestos',
		),
		array(
			'title' => 'Asesoría contable y tributaria',
			'text'  => 'Resuelve dudas sobre impuestos, obligaciones fiscales y situaciones contables antes de tomar decisiones importantes para tu negocio.',
			'slug'  => 'asesoria-contable-y-tributaria',
		),
	);
	?>
	<section class="home-services" aria-labelledby="services-title">
		<div class="container">
			<div class="home-services__heading">
				<h2 id="services-title">Soluciones contables para tu negocio</h2>
				<p>Encuentra el apoyo que necesitas para mantener tu contabilidad organizada, cumplir con tus obligaciones y tomar decisiones con mayor tranquilidad.</p>
			</div>
			<div class="home-services__catalog">
				<div class="home-services__portrait">
					<?php
					$services_portrait_url = content_url( '/uploads/2026/09/eduardo-leon-tu-contador-de-confianza-en-nicaragua.png' );
					$services_portrait_id  = attachment_url_to_postid( $services_portrait_url );
					if ( $services_portrait_id ) {
						echo wp_get_attachment_image( $services_portrait_id, 'full', false, array(
							'class' => 'home-services__photo',
							'alt' => 'Eduardo León, contador y asesor de negocios en Nicaragua',
							'loading' => 'lazy',
							'sizes' => '(max-width: 900px) 90vw, 460px',
						) );
					} else {
						?>
						<img class="home-services__photo" src="<?php echo esc_url( $services_portrait_url ); ?>" alt="Eduardo León, contador y asesor de negocios en Nicaragua" loading="lazy" decoding="async">
						<?php
					}
					?>
				</div>
				<div class="home-services__list">
				<?php foreach ( $catalog as $index => $service ) : ?>
					<?php
					$is_advisory = 'asesoria-contable-y-tributaria' === $service['slug'];
					$destination = $is_advisory ? $contact_page : null;
					if ( ! $is_advisory ) {
						foreach ( array( 'servicios/' . $service['slug'], $service['slug'] ) as $service_path ) {
							$candidate = get_page_by_path( $service_path );
							if ( $candidate instanceof WP_Post && 'publish' === $candidate->post_status ) {
								$destination = $candidate;
								break;
							}
						}
						$destination = $destination ?: $services_page;
					}
					$link_label = 'Ver detalles';
					?>
					<article class="home-services__service">
						<span class="home-services__number" aria-hidden="true"><?php echo esc_html( sprintf( '%02d', $index + 1 ) ); ?></span>
						<h3><?php echo esc_html( $service['title'] ); ?></h3>
						<p><?php echo esc_html( $service['text'] ); ?></p>
						<?php if ( $destination instanceof WP_Post && 'publish' === $destination->post_status ) : ?>
							<a class="home-services__link" href="<?php echo esc_url( get_permalink( $destination ) ); ?>" aria-label="<?php echo esc_attr( $link_label . ': ' . $service['title'] ); ?>"><?php echo esc_html( $link_label ); ?></a>
						<?php endif; ?>
					</article>
				<?php endforeach; ?>
				</div>
			</div>
			<div class="home-services__closing">
				<h2>¿Tienes una situación contable que necesitas resolver?</h2>
				<p>No tienes que saber exactamente qué servicio contratar. Cuéntame qué está pasando con tu negocio y revisaremos qué necesitas hacer y cómo puedo ayudarte.</p>
			</div>
		</div>
	</section>
	<section class="home-office-cta" aria-labelledby="office-cta-title">
			<?php
			$office_url = content_url( '/uploads/2026/09/oficina-contador-eduardo-leon-tu-contador-de-confianza.png' );
			$office_id  = attachment_url_to_postid( $office_url );
			if ( $office_id ) {
				echo wp_get_attachment_image( $office_id, 'full', false, array(
					'class'   => 'home-office-cta__image',
					'alt'     => 'Oficina de Eduardo León, contador en Nicaragua',
					'loading' => 'lazy',
					'sizes'   => '100vw',
				) );
			} else {
				?>
				<img class="home-office-cta__image" src="<?php echo esc_url( $office_url ); ?>" alt="Oficina de Eduardo León, contador en Nicaragua" loading="lazy" decoding="async">
				<?php
			}
			?>
		<div class="container home-office-cta__inner">
			<div class="home-office-cta__content">
				<h2 id="office-cta-title">Tu contabilidad puede ser más sencilla.</h2>
				<ul class="home-office-cta__services">
					<li>Contabilidad mensual</li>
					<li>Declaraciones de impuestos</li>
					<li>Asesoría tributaria</li>
					<li>Trámites ante la DGI</li>
					<li>Nómina e INSS</li>
					<li>Formalización de negocios</li>
				</ul>
				<?php if ( $contact_page instanceof WP_Post && 'publish' === $contact_page->post_status ) : ?>
					<a class="btn btn-primary home-office-cta__button" href="<?php echo esc_url( get_permalink( $contact_page ) ); ?>">Solicitar asesoría</a>
				<?php endif; ?>
			</div>
		</div>
	</section>
	<?php
	$calculator_tools = array(
		array( 'title' => 'Calcula tu IR e INSS', 'slug' => 'ir-inss', 'icon' => 'salary' ),
		array( 'title' => 'Calcula tu aguinaldo', 'slug' => 'aguinaldo', 'icon' => 'bonus' ),
		array( 'title' => 'Calcula tus vacaciones', 'slug' => 'vacaciones', 'icon' => 'vacation' ),
		array( 'title' => 'Calcula tu liquidación', 'slug' => 'liquidacion-laboral', 'icon' => 'settlement' ),
	);
	?>
	<section class="home-calculators" aria-labelledby="calculators-title">
		<div class="container">
			<div class="home-calculators__heading">
				<h2 id="calculators-title">Calculadoras contables para Nicaragua</h2>
				<p>Consulta tu salario neto, aguinaldo, vacaciones y liquidación laboral con herramientas gratuitas diseñadas para Nicaragua.</p>
			</div>
			<div class="home-calculators__tools">
				<?php foreach ( $calculator_tools as $tool ) : ?>
					<?php
					$tool_page = get_page_by_path( 'calculadoras/' . $tool['slug'] );
					if ( ! $tool_page instanceof WP_Post || 'publish' !== $tool_page->post_status ) {
						continue;
					}
					?>
					<a class="home-calculators__tool" href="<?php echo esc_url( get_permalink( $tool_page ) ); ?>" aria-labelledby="calculator-<?php echo esc_attr( $tool['slug'] ); ?>">
						<span class="home-calculators__icon home-calculators__icon--<?php echo esc_attr( $tool['icon'] ); ?>" aria-hidden="true"></span>
						<h3 id="calculator-<?php echo esc_attr( $tool['slug'] ); ?>"><?php if ( 'ir-inss' === $tool['slug'] ) : ?><span class="home-calculators__salary-line">Calcula tu</span> <span class="home-calculators__salary-line">IR e INSS</span><?php else : ?><?php echo esc_html( $tool['title'] ); ?><?php endif; ?></h3>
					</a>
				<?php endforeach; ?>
			</div>
		</div>
	</section>
	<?php
	$home_faqs = array(
		array( '¿Cuánto cuesta contratar un contador en Nicaragua?', 'El costo depende de las necesidades y operaciones de cada negocio. Antes de definir un servicio se revisa tu situación para determinar qué tipo de acompañamiento necesitas.' ),
		array( '¿Qué incluye un servicio de contabilidad mensual?', 'Puede incluir el registro y organización de información contable, preparación de declaraciones, seguimiento de obligaciones y acompañamiento contable, dependiendo de las necesidades de cada cliente.' ),
		array( '¿Puedo recibir ayuda si tengo declaraciones atrasadas?', 'Sí. Primero se revisa tu situación para identificar qué declaraciones u obligaciones están pendientes y determinar los pasos necesarios para regularizarla.' ),
		array( '¿Atiendes pequeños negocios y emprendedores?', 'Sí. Los servicios están dirigidos a emprendedores, profesionales independientes, pequeños negocios y empresas que necesitan apoyo contable.' ),
		array( '¿Qué necesito para comenzar?', 'Dependerá del servicio y de tu situación actual. Al realizar la primera consulta se te indicará qué información o documentación será necesaria.' ),
		array( '¿Puedo solicitar una asesoría sin contratar un servicio mensual?', 'Sí. Si tienes una situación o duda específica, puedes solicitar una asesoría para revisar tu caso y determinar qué necesitas hacer.' ),
	);
	?>
	<?php
	get_template_part( 'template-parts/components/faq', null, array(
		'title' => 'Preguntas frecuentes sobre servicios contables',
		'items' => $home_faqs,
		'action_url' => $contact_page instanceof WP_Post && 'publish' === $contact_page->post_status ? get_permalink( $contact_page ) : '',
	) );
	?>
</main>
<?php
get_footer();

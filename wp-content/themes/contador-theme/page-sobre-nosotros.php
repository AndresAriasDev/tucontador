<?php
/** Página institucional, seleccionada automáticamente por el slug sobre-nosotros. */
defined( 'ABSPATH' ) || exit;
$page_url = static function ( $path ) {
	$page = get_page_by_path( $path );
	return $page instanceof WP_Post && 'publish' === $page->post_status ? get_permalink( $page ) : home_url( '/' . trim( $path, '/' ) . '/' );
};
$advisory_url = $page_url( 'servicios/asesoria-contable-tributaria' ) . '#solicitar-asesoria';
$steps = array(
	array( 'Escuchamos tus necesidades', 'Conocemos tu negocio, las dificultades que enfrentas y el tipo de apoyo contable que estás buscando.' ),
	array( 'Evaluamos tu situación', 'Revisamos la información necesaria para comprender tus necesidades contables o tributarias e identificar cómo podemos ayudarte.' ),
	array( 'Te proponemos una solución', 'Te explicamos el servicio que mejor se adapta a tu situación, procurando que tengas claridad sobre el acompañamiento que recibirás.' ),
	array( 'Te acompañamos', 'Brindamos el apoyo acordado y mantenemos la comunicación necesaria para atender las responsabilidades relacionadas con el servicio.' ),
);
get_header();
?>
<main id="primary" class="about-page">
	<section class="about-hero" aria-labelledby="about-title">
		<div class="container about-hero__grid">
			<div>
				<p class="about-hero__experience"><span class="about-hero__experience-badge">+20</span> <span>años de experiencia</span></p>
				<h1 id="about-title">Somos Tu Contador de Confianza, tu equipo contable en Nicaragua</h1>
				<p class="about-lead">Somos un equipo dedicado a brindar servicios contables y asesoría tributaria a pequeños y medianos negocios en Nicaragua. Con más de 20 años de trayectoria en el sector contable, trabajamos para ayudarte a mantener tus cuentas organizadas, cumplir con tus obligaciones y tomar decisiones con mayor tranquilidad.</p>
				<a class="btn btn-primary" href="<?php echo esc_url( $advisory_url ); ?>">Solicitar asesoría</a>
			</div>
			<figure class="about-hero__photo">
				<?php echo contador_about_image( '2026/10/oficinas-contabilidad-eduardo-leon-tu-contador.webp', 'Oficinas de Tu Contador de Confianza', true ); ?>
			</figure>
		</div>
	</section>

	<section class="about-section" aria-labelledby="about-commitment">
		<div class="container about-editorial">
			<div>
				<p class="about-eyebrow">Cerca de tu negocio</p>
				<h2 id="about-commitment">Más que contadores, un equipo comprometido con tu negocio</h2>
				<p class="about-editorial__statement">Buscamos construir relaciones profesionales duraderas, donde la confianza, la responsabilidad y la comunicación sean parte fundamental de cada servicio.</p>
			</div>
			<div class="about-editorial__copy">
				<p>En Tu Contador de Confianza entendemos que administrar un negocio implica mucho más que vender productos u ofrecer servicios. También significa llevar registros, atender obligaciones tributarias y tomar decisiones que pueden influir en su crecimiento.</p>
				<p>Por eso, ponemos nuestros conocimientos y experiencia al servicio de emprendedores, comerciantes y pequeñas y medianas empresas que necesitan acompañamiento contable.</p>
				<p>Nuestro trabajo se basa en conocer las necesidades de cada cliente, ofrecer orientación clara y contribuir a que su información contable se mantenga organizada.</p>
			</div>
		</div>
	</section>

	<section class="about-section about-process" aria-labelledby="about-process-title">
		<div class="container">
			<header class="about-section-intro">
				<h2 id="about-process-title">Nuestra forma de trabajar</h2>
				<p>Creemos que un buen servicio contable comienza por comprender la situación de cada cliente. Por eso, seguimos un enfoque basado en la comunicación, el orden y el acompañamiento profesional.</p>
			</header>
			<ol class="about-steps">
				<?php foreach ( $steps as $index => $step ) : ?>
					<li><span class="about-steps__number" aria-hidden="true"><?php echo esc_html( sprintf( '%02d', $index + 1 ) ); ?></span><h3><?php echo esc_html( $step[0] ); ?></h3><p><?php echo esc_html( $step[1] ); ?></p></li>
				<?php endforeach; ?>
			</ol>
		</div>
	</section>

	<section class="about-section about-conversion" aria-labelledby="about-services-title">
		<div class="container">
			<div class="about-conversion__content">
				<h2 id="about-services-title">¿Necesitas ayuda con la contabilidad de tu negocio?</h2>
				<p>No tienes que saber exactamente qué servicio contratar. Cuéntanos qué está pasando con tu negocio y te ayudaremos a identificar el apoyo contable o tributario que necesitas.</p>
				<a class="btn btn-primary" href="<?php echo esc_url( $advisory_url ); ?>">Solicitar asesoría</a>
			</div>
		</div>
	</section>
</main>
<?php get_footer(); ?>

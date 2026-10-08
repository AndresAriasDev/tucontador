<?php
/**
 * Página individual de Servicios contables, asignada por su slug.
 *
 * @package Contador_Theme
 */
defined( 'ABSPATH' ) || exit;

$needs = array(
	array( 'No tienes tiempo para llevar tu contabilidad', 'Concéntrate en administrar y hacer crecer tu negocio mientras recibes apoyo profesional para mantener tu información contable al día.', 'Más tiempo para enfocarte en tu negocio' ),
	array( 'Tienes tu información contable desorganizada', 'Recibe ayuda para ordenar tus registros y mantener un mejor control de la información relacionada con las operaciones de tu negocio.', 'Pon en orden tu información contable' ),
	array( 'Necesitas acompañamiento contable', 'Resuelve las dudas y situaciones contables que puedan surgir durante las operaciones de tu negocio con atención profesional y personalizada.', 'Acompañamiento cuando lo necesites' ),
);
$included = array(
	array( 'Contabilidad general', 'Apoyo profesional para llevar y mantener organizada la información contable relacionada con las operaciones de tu negocio.', 'notebook-pen.svg' ),
	array( 'Organización y control', 'Organización y seguimiento de tu información y documentación para mantener un mayor control contable de las operaciones de tu negocio.', 'clipboard-pen.svg' ),
	array( 'Seguimiento contable', 'Acompañamiento para mantener tus registros al día y dar seguimiento a las necesidades contables habituales de tu negocio.', 'calendar-check-2.svg' ),
	array( 'Acompañamiento continuo', 'Atención personalizada para resolver dudas y situaciones contables que puedan surgir durante las operaciones de tu negocio.', 'headset.svg' ),
);
$faqs = array(
	array( '¿Cuánto cuesta contratar un servicio contable en Nicaragua?', 'El costo depende de las características del negocio y del tipo de apoyo que necesites. Puedes contarme tu situación para determinar qué servicio se adapta mejor a tus necesidades y recibir una propuesta.' ),
	array( '¿Puedo contratar un servicio contable de forma mensual?', 'Sí. Si necesitas apoyo continuo para llevar la contabilidad de tu negocio, podemos revisar tu situación y definir el acompañamiento que necesitas de forma periódica.' ),
	array( '¿Puedo solicitar ayuda si tengo mi contabilidad atrasada o desorganizada?', 'Sí. Primero podemos revisar tu situación actual, identificar qué información está pendiente y determinar qué necesitas para comenzar a poner en orden tu contabilidad.' ),
	array( '¿Qué información necesito para comenzar?', 'Dependerá de la situación de tu negocio y del servicio que necesites. Durante el primer contacto podemos revisar qué información tienes disponible y qué documentación será necesaria para comenzar.' ),
	array( '¿Atiendes pequeños negocios y emprendedores?', 'Sí. Los servicios contables pueden adaptarse a pequeños negocios, emprendedores y profesionales que necesiten apoyo para llevar un mejor control de su contabilidad.' ),
);
get_template_part( 'template-parts/components/service-page', null, array(
	'title' => 'Servicios contables en Nicaragua',
	'description' => 'Mantén tu contabilidad en orden y enfócate en hacer crecer tu negocio con el respaldo de un contador con experiencia.',
	'needs_title' => '¿Necesitas ayuda para llevar la contabilidad de tu negocio?',
	'needs' => $needs,
	'included_title' => '¿Qué incluyen mis servicios contables?',
	'included_intro' => 'El servicio se adapta a las necesidades de cada negocio para ayudarte a mantener tu información contable organizada y bajo control.',
	'included' => $included,
	'service' => 'Servicios contables',
	'faq_title' => 'Preguntas frecuentes sobre servicios contables',
	'faqs' => $faqs,
) );

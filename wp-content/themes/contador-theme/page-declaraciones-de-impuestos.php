<?php
/**
 * Página de Declaraciones de impuestos, asignada por su slug.
 * Crear en WordPress como hija de Servicios para conservar la URL prevista.
 *
 * @package Contador_Theme
 */
defined( 'ABSPATH' ) || exit;

get_template_part( 'template-parts/components/service-page', null, array(
	'title' => 'Declaraciones de impuestos en Nicaragua',
	'description' => 'Recibe apoyo profesional para preparar y presentar tus declaraciones de impuestos ante la DGI. Mantén tus obligaciones tributarias al día y evita que los atrasos o errores se conviertan en un problema para tu negocio.',
	'needs_title' => '¿Necesitas ayuda con tus declaraciones de impuestos?',
	'needs_intro' => 'Cumplir con tus obligaciones tributarias puede generar dudas, especialmente cuando no tienes claro qué debes declarar, cuándo hacerlo o cómo presentar correctamente la información de tu negocio.',
	'needs' => array(
		array( 'No sabes qué impuestos debes declarar', 'Conoce las obligaciones tributarias que corresponden a tu actividad económica y recibe orientación para cumplir con ellas.', 'Identifica tus obligaciones tributarias' ),
		array( 'Tienes declaraciones pendientes', 'Revisemos qué obligaciones están atrasadas y qué pasos necesitas seguir para regularizar tu situación ante la DGI.', 'Ponte al día con tus declaraciones' ),
		array( 'Tienes dudas al presentar tus declaraciones', 'Evita presentar información sin estar seguro. Recibe acompañamiento profesional para revisar tu situación tributaria.', 'Recibe orientación profesional' ),
	),
	'included_title' => '¿Qué incluye mi servicio de declaraciones de impuestos?',
	'included_intro' => 'Recibe acompañamiento para gestionar tus declaraciones tributarias de acuerdo con las obligaciones y características de tu negocio.',
	'included' => array(
		array( 'Preparación de declaraciones', 'Apoyo para preparar tus declaraciones tributarias con base en la información y documentación correspondiente a tu actividad económica.', 'notebook-pen.svg' ),
		array( 'Declaraciones mensuales', 'Acompañamiento con las declaraciones periódicas que correspondan a tu negocio, según sus obligaciones ante la DGI.', 'calendar-check-2.svg' ),
		array( 'Revisión de obligaciones', 'Orientación para identificar las declaraciones que debes presentar y las responsabilidades tributarias relacionadas con tu actividad.', 'clipboard-pen.svg' ),
		array( 'Declaraciones pendientes', 'Apoyo para revisar obligaciones atrasadas y determinar las acciones necesarias para ponerte al día.', 'headset.svg' ),
	),
	'service' => 'Declaraciones de impuestos',
	'faq_title' => 'Preguntas frecuentes sobre declaraciones de impuestos',
	'faqs' => array(
		array( '¿Qué impuestos debe declarar un negocio en Nicaragua?', 'Depende de su actividad económica, régimen tributario y obligaciones registradas ante la DGI. Entre los impuestos que pueden corresponder se encuentran el Impuesto sobre la Renta (IR) y el Impuesto al Valor Agregado (IVA).' ),
		array( '¿Puedo recibir ayuda si tengo declaraciones atrasadas?', 'Sí. Podemos revisar tu situación para identificar las obligaciones pendientes y determinar qué acciones necesitas realizar para regularizarte.' ),
		array( '¿Puedo contratar el servicio solamente para una declaración?', 'Puedes solicitar apoyo para una declaración específica. Primero será necesario conocer el tipo de declaración y tu situación tributaria.' ),
		array( '¿Qué documentos necesito para presentar mis declaraciones?', 'Dependerá del impuesto y de las obligaciones de tu negocio. Durante la consulta se te indicará qué información y documentación necesitas proporcionar.' ),
		array( '¿Cuánto cuesta el servicio de declaraciones de impuestos?', 'El costo depende del tipo de declaración, la cantidad de obligaciones y la situación tributaria del cliente. Puedes solicitar asesoría para conocer el servicio que necesitas.' ),
	),
) );

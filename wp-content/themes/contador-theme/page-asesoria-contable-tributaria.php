<?php
/**
 * Página de Asesoría contable y tributaria, asignada por su slug.
 * Crear en WordPress como hija de Servicios para conservar la URL prevista.
 *
 * @package Contador_Theme
 */
defined( 'ABSPATH' ) || exit;

get_template_part( 'template-parts/components/service-page', null, array(
	'title' => 'Asesoría contable y tributaria en Nicaragua',
	'description' => 'Resuelve tus dudas sobre contabilidad, impuestos y obligaciones fiscales con el acompañamiento de un contador con experiencia. Recibe orientación profesional para tomar decisiones con mayor claridad y evitar problemas en tu negocio.',
	'needs_title' => '¿Tienes dudas contables o tributarias sobre tu negocio?',
	'needs_intro' => array(
		'Una decisión relacionada con impuestos, registros contables o trámites ante la DGI puede generar inconvenientes cuando no tienes la información adecuada.',
		'No necesitas resolverlo todo por tu cuenta. Puedo ayudarte a comprender tu situación y conocer las opciones disponibles.',
	),
	'needs' => array(
		array( 'No sabes si estás cumpliendo correctamente', 'Tienes dudas sobre las obligaciones contables o tributarias que corresponden a tu negocio y necesitas orientación.', 'Comprende las obligaciones de tu negocio' ),
		array( 'Necesitas tomar una decisión importante', 'Antes de realizar cambios en tu negocio, quieres comprender sus posibles implicaciones contables y fiscales.', 'Toma decisiones con mayor claridad' ),
		array( 'Tienes una situación ante la DGI', 'Necesitas aclarar dudas relacionadas con tus obligaciones, declaraciones o gestiones tributarias.', 'Aclara tus dudas ante la DGI' ),
	),
	'included_title' => '¿Qué incluye mi asesoría contable y tributaria?',
	'included_intro' => 'Cada asesoría parte de una necesidad específica. El objetivo es ayudarte a comprender tu situación y recibir orientación sobre los pasos que puedes seguir.',
	'included' => array(
		array( 'Asesoría contable', 'Orientación profesional para resolver dudas relacionadas con los registros, la organización y la gestión contable de tu negocio.', 'notebook-pen.svg' ),
		array( 'Orientación tributaria', 'Acompañamiento para comprender los impuestos y obligaciones fiscales que pueden corresponder a tu actividad económica.', 'calendar-check-2.svg' ),
		array( 'Consultas sobre la DGI', 'Asesoría para aclarar dudas relacionadas con declaraciones, obligaciones y procedimientos ante la Dirección General de Ingresos.', 'headset.svg' ),
		array( 'Evaluación de situaciones específicas', 'Revisión de tu caso para identificar aspectos contables o tributarios que requieren atención y orientarte sobre los siguientes pasos.', 'clipboard-pen.svg' ),
	),
	'service' => 'Asesoría contable y tributaria',
	'faq_title' => 'Preguntas frecuentes sobre asesoría contable y tributaria',
	'faqs' => array(
		array( '¿Cuál es la diferencia entre asesoría contable y tributaria?', 'La asesoría contable se enfoca en aspectos relacionados con el registro, organización y manejo de la información contable. La asesoría tributaria aborda las obligaciones fiscales, impuestos y procedimientos relacionados con el cumplimiento tributario.' ),
		array( '¿Puedo solicitar asesoría sin contratar un servicio mensual?', 'Sí. Puedes consultar sobre una situación específica sin necesidad de contratar inicialmente un servicio contable permanente.' ),
		array( '¿Puedo recibir asesoría si estoy comenzando un negocio?', 'Sí. Puedes recibir orientación para conocer las principales obligaciones contables y tributarias que debes considerar al iniciar tus actividades en Nicaragua.' ),
		array( '¿Me pueden orientar si tengo un problema con la DGI?', 'Sí. Podemos revisar tu situación para comprender el problema, identificar las obligaciones relacionadas y determinar qué pasos podrían ser necesarios.' ),
		array( '¿Cuánto cuesta una asesoría contable y tributaria?', 'El costo depende del tipo de consulta y de la complejidad de tu situación. Puedes explicar brevemente tu caso para determinar el alcance de la asesoría.' ),
	),
) );

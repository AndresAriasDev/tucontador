# Suscripciones del blog

## Alcance de esta entrega

Primera etapa: formulario real del footer, tabla de suscriptores, confirmación de correo,
bienvenida y baja. No hay campañas, hooks de publicación ni envío masivo habilitado.
No se han creado suscriptores ni se han enviado correos durante el desarrollo.
El formulario de asesoría y su correo no se modifican.

### Archivos

- `inc/subscriptions/bootstrap.php`: carga de módulos y recursos.
- `storage.php`: instalación versionada, índices, límites y limpieza.
- `http.php`: REST, transiciones de estado y pantalla de gestión.
- `email.php`: plantilla HTML base y correos transaccionales.
- `template-parts/subscriptions/form.php` y `manage.php`: interfaz.
- `assets/js/subscription.js` y `assets/css/components/subscription.css`.
- `functions.php` carga el módulo; `footer.php` utiliza el formulario parcial.

## Instalación y almacenamiento

Después de subir todos los archivos, visitar el administrador con permiso
`manage_options`. `admin_init` ejecuta `dbDelta()` y guarda la versión de esquema
solo cuando existen ambas tablas. No requiere reactivar el tema. Antes de instalar,
el endpoint devuelve 503; nunca comunica una suscripción exitosa.

Las tablas usan el prefijo real de WordPress:

- `tc_subscribers`: ID, correo ASCII normalizado a minúsculas y único, estado
  `pending/active/unsubscribed`, fechas UTC y hashes SHA-256 de tokens aleatorios
  de 256 bits. Índices únicos en correo y hashes; índice `(status,id)` para el
  recorrido futuro de destinatarios por cursor, sin OFFSET masivo.
- `tc_subscription_limits`: contadores atómicos con identidad HMAC y caducidad.
  No contiene correos ni direcciones IP legibles.

No se crean usuarios WordPress ni hay endpoint de consulta de suscriptores.
La tabla de suscriptores sí contiene datos personales: proteger copias y acceso
a base de datos. No se borra al cambiar de tema, pero se retira la tarea periódica.
Las bajas se conservan para respetar el estado; no hay exportación/borrado masivo
ni panel administrativo en esta primera entrega.

## Flujo y garantías

1. El navegador valida el correo; el servidor valida tipo, tamaño, controles,
   formato, honeypot, origen si está presente y límites de abuso.
2. Solicitar no cambia un estado existente. Se genera un token nuevo de 24 horas;
   únicamente su hash se guarda. Un enlace anterior queda invalidado.
3. Se envía confirmación por `wp_mail()`, sin cambiar From, Reply-To ni filtros
   globales de correo. El modal solo se abre si `wp_mail()` devuelve verdadero.
   Esto significa aceptación por la capa de envío, no entrega acreditada.
4. Los enlaces usan un fragmento `#token=...`, sin correo ni ID de suscriptor.
   El GET no recibe el secreto ni activa/baja registros. Una pantalla sin scripts
   de terceros retira el fragmento del historial y espera un clic explícito.
   El POST transmite el token por HTTPS. No recargar esta pantalla antes de enviar;
   si se recarga, abrir de nuevo el enlace del correo.
5. La confirmación usa actualización condicional por hash y vencimiento: solo un
   proceso consume el token. Al activar genera el enlace de baja y envía bienvenida.
   Un activo que vuelve a confirmar conserva su enlace de baja y no recibe otra
   bienvenida. Una baja solo se reactiva tras una nueva confirmación explícita.
6. La baja exige su propio secreto y un clic; invalida también cualquier confirmación
   pendiente. El enlace de baja no vence hasta utilizarlo. No hay acciones mutantes GET.

Todos los estados reciben el mismo flujo de solicitud y respuesta pública. No se
responde «correo registrado». También se envía confirmación a un activo que la
solicita dentro de los límites, sin desactivarlo ni fingir un envío.

Los enlaces con fragmento deben verificarse en el correo real recibido: si Brevo
o un seguimiento de clics reescribe URLs y pierde el fragmento, desactivar dicho
seguimiento para estos correos transaccionales. No pegar tokens en tickets ni logs.

## Límites y mantenimiento

- Solicitudes: 5 por IP / 15 minutos y 1 por correo / ventana de 5 minutos.
- Confirmación y baja: 20 intentos por IP y acción / 15 minutos.
- Confirmaciones: 30 intentos globales por hora, ajustable con el filtro
  `contador_subscription_hourly_limit`. No equivale al cupo total de Brevo:
  sumar bienvenidas, asesorías y demás correos al dimensionarlo.
- Ventanas fijas: puede existir una ráfaga alrededor del cambio de ventana.
- IP obtenida solo de `REMOTE_ADDR`. Si existe proxy, configurar la IP real en
  servidor; no confiar en un X-Forwarded-For arbitrario.
- Limpieza horaria: hasta 1.000 filas por operación; elimina contadores vencidos,
  borra tokens de confirmación caducados y pendientes sin token de más de 30 días.
- WP-Cron depende del tráfico. Para producción, configurar un cron real que ejecute
  eventos vencidos (por ejemplo mediante WP-CLI) desde el servidor. No se ha cambiado
  la configuración del servidor ni `DISABLE_WP_CRON`.

Estos límites son conservadores, no sustituyen la protección del servidor/WAF ante
tráfico distribuido. El alta maneja un solo correo por petición, no recorre la tabla.

Si el envío de confirmación falla, el endpoint devuelve error y revoca ese token.
Si falla la bienvenida, la suscripción permanece confirmada: la pantalla informa
del fallo y ofrece el enlace de baja. No hay reintento automático en esta etapa.
Una interrupción entre activar y enviar bienvenida puede dejar un activo sin ese
correo: la siguiente etapa debe introducir un outbox transaccional para resolverlo.
No se promete entrega exactamente una vez mediante SMTP.

## Pruebas manuales autorizadas, local y servidor

Realizar con una dirección propia y un entorno de correo controlado. No publicar
entradas ficticias ni usar listas de terceros. No mostrar éxitos mediante mocks.

1. Respaldar la base de datos, instalar archivos y entrar al administrador. Comprobar
   que aparecen ambas tablas con sus índices. No se requiere npm ni build.
2. Enviar vacío/inválido: debe bloquearse. Comprobar teclado, loader, botón desactivado,
   errores, modal, Escape y restauración del foco.
3. Enviar el correo propio: comprobar aceptación y el correo realmente recibido.
   Antes de confirmar, verificar `pending`; nunca debe estar activo por el mero envío.
4. Abrir enlace sin pulsar: estado intacto. Confirmar: `active`, hash de confirmación
   borrado, fecha UTC y bienvenida con baja. Segundo uso del enlace: error 410.
5. Solicitar otra vez tras el límite: sigue una sola fila. Probar dos clics/solicitudes
   concurrentes y comprobar que no se consumen dos veces los tokens.
6. Cancelar desde la bienvenida: el GET no cambia nada; el botón cambia a `unsubscribed`.
   Volver a solicitar no activa la baja; solo un nuevo enlace confirmado lo hace.
7. Probar vencimiento en una base de pruebas y la limpieza cron. Verificar límites,
   honeypot, token alterado, Origin externo y rechazo de caracteres de control.
8. Probar SMTP rechazado o desconectado en el entorno de pruebas: sin modal de éxito
   para la confirmación; verificar que no se afirma entrega. No modificar SMTP de producción.
9. Revisar Gmail/Outlook, móvil, logo y enlaces con los correos recibidos realmente.
10. En servidor, HTTPS obligatorio. Excluir de caché `?tc-subscription=*` y las rutas
    REST de suscripción; comprobar que no se registran cuerpos POST sensibles.
    Configurar cron real y límites acordes al plan Brevo antes de escalar.

## Etapas siguientes (diseñadas, no implementadas)

### A. Campañas y primera publicación

Crear `campaigns.php`, `queue.php`, `admin.php` y tablas:

- `tc_blog_campaigns`: UNIQUE(post_id), asunto, estado pendiente/preparando/enviando/
  pausada/completa, creación, cursor de preparación, límite superior del snapshot,
  destinatarios, procesados, aceptados e incidencias.
- `tc_blog_deliveries`: UNIQUE(campaign_id,subscriber_id), estado, intentos,
  próxima ejecución, propietario de lease, vencimiento y resultado sanitizado.
- `tc_blog_attempts`: intento, fecha, aceptación/error/incierto y código sin datos
  personales ni respuesta SMTP completa.

Inicializar una marca de primera-publicación de las entradas históricas mediante
una migración por lotes ANTES de habilitar campañas. Debe considerar también entradas
antes publicadas y ahora en borrador: validar estrategia de historial/disponibilidad;
no basta con comparar post_date con la activación. Mantener deshabilitado el detector
hasta cerrar esa migración. `transition_post_status` para post al entrar realmente
en publish (incluye programadas), más marca persistente y UNIQUE(post_id). Ediciones,
cambios de categorías, borradores y republicaciones no crean nuevas campañas.

### B. Cola persistente y cron

Preparar destinatarios por cursor de ID y límite superior de snapshot, sin cargar
20.000 correos en memoria. Usar INSERT con unicidad para reanudar sin duplicar.
Revisar estado activo justo antes del envío; una baja excluye trabajos pendientes.
Procesar inicialmente 25 entregas por ejecución y presupuesto de tiempo, tamaño,
frecuencia y cupo global configurables. Cada trabajo se reclama atómicamente con
lease y propietario; solo ese propietario puede finalizarlo. Pausa/reanuda sin
destruir la cola. Reintentos temporales con backoff y tope, no infinitos.

Un proceso puede morir DESPUÉS de que SMTP acepte pero ANTES de guardar el resultado.
Ese trabajo debe quedar `incierto` y requerir reconciliación; reintentarlo ciegamente
puede duplicar el correo. La unicidad evita trabajos duplicados y el lease evita
trabajadores concurrentes, pero no hace transaccional un proveedor externo.
`wp_mail()` no acredita entrega: usar «aceptado», nunca «entregado», sin eventos
de entrega verificables del proveedor.

Evaluar Action Scheduler en ejecución con `function_exists('as_enqueue_async_action')`
cuando se implemente la cola. No se inspeccionaron plugins fuera del tema ni se asume
que esté instalado. Si está disponible, puede aportar persistencia/administración
de tareas, pero no sustituye la unicidad de destinatarios ni resuelve la ambigüedad
SMTP. Si no está, WP-Cron con tablas propias y cron real es suficiente para iniciar
sin dependencias. No instalar plugins automáticamente.

### C. Administración y validación de escala

Pantalla «Suscriptores del blog», capacidades `manage_options`, nonces, consultas
paginadas, contadores por estado y campañas, errores sanitizados y pausa/reanudación.
Añadir gestión segura de bajas y privacidad. Validar interrupciones, concurrencia,
errores temporales, cupos y carga con un transporte controlado antes de autorizar
campañas reales. Reutilizar la base HTML de correo para notificaciones.

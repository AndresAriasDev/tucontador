# Selector de fechas civiles

DateField recibe label, value (ISO YYYY-MM-DD), onChange y opcionalmente min, max,
disabled, required, error, helperText, name, id, pickerLabel, defaultPickerDate.
DateWheelPicker recibe label, value, min, max, defaultPickerDate, onCancel y onConfirm.
No contiene reglas de negocio. DateRangeFields lo integra en las tres calculadoras.

Se reutilizan parseCivilDate y daysInMonth. Nunca se convierte un ISO en timestamp.
Solo la sugerencia de hoy usa los componentes locales del reloj del usuario.
El rango por defecto es 0001–9999; Home/End permiten llegar a los extremos.
Límites inválidos se ignoran, límites invertidos generan un error de configuración.
La fecha temporal se limita de nuevo al confirmar para respetar cambios de límites.

El diálogo nativo showModal ocupa el top layer, hace inerte el fondo y se renderiza
por portal. Tab cicla dentro del diálogo, Escape/backdrop cancelan, el foco vuelve
al disparador y se restaura overflow al cerrar/desmontar. Required se anuncia como
campo obligatorio; la validación del formulario sigue siendo responsabilidad del
consumidor (un botón no participa en constraint validation nativa).

Mouse wheel: umbral acumulado 40px, como máximo un paso cada 80ms. Pointer Events:
un paso cada 44px, snap al entero más cercano, click selecciona la fila pulsada.
Flechas arriba/abajo cambian valor, izquierda/derecha cambian rueda; Home/End van
a los límites. Confirmación únicamente mediante Aceptar; Cancelar no llama onChange.

## Verificación manual pendiente en navegador

No hay infraestructura DOM de tests instalada. Las pruebas automatizadas cubren
fechas, límites y regresiones matemáticas. Comprobar en Chrome, Firefox y Safari:

- Abrir 01/10/2026, cambiar a 15/11/2026, cancelar: conserva 01/10/2026.
- Repetir y aceptar: emite 2026-11-15 e invalida el resultado de la calculadora.
- Escape y click sobre backdrop cancelan; Tab/Shift+Tab quedan dentro; foco retorna.
- Rueda sobre cada columna, drag de mouse y swipe táctil; snap y click en vecinos.
- Enero 31 a febrero: 28 en 2026, 29 en 2024; límites parciales marzo15–octubre20.
- Ancho 320px, zoom, pantalla horizontal, reduced motion, lector de pantalla.
- Disabled no abre; required/helper/error se anuncian; fondo no se desplaza y
  recupera su desplazamiento al cerrar o desmontar el componente.

Requiere navegadores con HTMLDialogElement.showModal y Pointer Events.

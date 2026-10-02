# Liquidación laboral — Nicaragua

Estimación informativa **bruta**, exclusivamente para salario mensual fijo. No determina derechos de forma definitiva ni aplica IR/INSS, preaviso u otros descuentos.

## Integración

`CalculatorApp` reconoce `liquidacion` y el alias `liquidacion-laboral` (slug de la página de WordPress). Utiliza la plantilla y los assets de calculadoras existentes, sin cambios de routing. La página debe existir y tener asignada la plantilla de calculadora; no se crea automáticamente.

`calculateSettlement` orquesta los motores actuales de Vacaciones y Aguinaldo. `calculatePendingSalary` y `calculateSeniorityIndemnity` son funciones puras independientes. La interfaz reutiliza MoneyField, DateRangeFields, DaysField, InfoTooltip, ResultRow, ResultGroup y CalculatorDetails, además de los estilos laborales y utilidades de formato existentes. Cualquier edición invalida el resumen y cierra el detalle.

## Metodología

- Salario diario: salario mensual / 30, sin redondeo interno.
- Salario pendiente: salario diario × días ingresados por el usuario. Se permiten fracciones; no se infieren pagos desde la fecha de salida.
- Vacaciones: llamada directa a `calculateVacation`, por todo el período laboral y restando los días disfrutados. Conserva la acumulación de 2.5 días por mes y 1/12 por día adicional, y la validación contra saldo negativo.
- Aguinaldo: llamada directa a `calculateAguinaldo`, desde la fecha posterior entre contratación y 1 de diciembre del ciclo que contiene la terminación. Solo se estima ese ciclo; se supone que los anteriores ya fueron pagados. No agrega deudas históricas.
- Antigüedad: `computeCalendarWorkPeriod`, fechas civiles estrictas sin Date.parse ni zona horaria. Cierres mensuales anclados al inicio, final inclusivo y cierre ajustado al último día disponible del mes. El residuo de 30 días se normaliza a mes. Se representa como años completos, meses restantes y días; no se divide el tiempo real entre 365.
- Indemnización: `years = months / 12 + days / 360`; `days = min(150, min(years, 3) × 30 + max(0, years − 3) × 20)`. Importe = días indemnizables × salario diario. Las fracciones después del tercer año reciben la tasa de 20, no 30. El tope es 150 días (cinco salarios mensuales). Los períodos inferiores al año son proporcionales, sin mínimo automático de un salario.
- Las convenciones de meses/días son la metodología determinista del proyecto, no una afirmación de que toda situación jurídica deba computarse así. Dinero y días se formatean únicamente para presentación.

## Estados y total

| Contrato / motivo | Estado de indemnización |
| --- | --- |
| Indeterminado, despido sin causa | `calculated`: importe y días |
| Indeterminado, despido autorizado por causa justa | `notIncluded` |
| Indeterminado, renuncia con preaviso declarado Sí | `calculated` |
| Indeterminado, renuncia con preaviso declarado No | `missingNotice` |
| Indeterminado, otro caso | `requiresReview` |
| Determinado, cualquier motivo | `notApplicableToContractType` |

Los estados no calculados conservan importe y días en `null`. Nunca se presentan como C$0. El total suma únicamente conceptos calculados y se identifica como parcial cuando algún concepto queda excluido, con explicación visible. Un salario pendiente real de cero sí es un importe calculado válido.

Para el alcance de esta calculadora, la renuncia en contrato indeterminado requiere declarar si se dio aviso escrito con al menos quince días de anticipación. `noticeGiven` inicia en `null`: sin una respuesta explícita no se calcula. Sí reutiliza `calculateSeniorityIndemnity`; No conserva importe y días en `null`, estado `missingNotice`, y muestra un total parcial. No se descuentan quince días de salario ni se alteran las demás prestaciones. Es una estimación según lo declarado, no una afirmación absoluta de pérdida de derechos. Al cambiar contrato o motivo se reinicia la respuesta; el motor la ignora fuera de este supuesto.

El motor existente de Aguinaldo no entrega importe para períodos de hasta un mes (`below-threshold`). Se preserva sin modificarlo: ese concepto se muestra pendiente de revisión y se excluye explícitamente del total parcial. La posible aplicación de prestaciones proporcionales al terminar exige resolver esa ambigüedad antes de cambiar el motor; no se introduce una fórmula alternativa.

## Referencias jurídicas

[Código del Trabajo, Poder Judicial de Nicaragua](https://www.poderjudicial.gob.ni/carrerajudicial/pdf/codigo_trabajo_nicaragua.pdf), artículos 42, 43, 44, 45 y 48. Para derecho de antigüedad y renuncia/preaviso: [Sentencia 02/2015 del TNLA](https://www.poderjudicial.gob.ni/tnla/SENTENCIA_2_2015.pdf). El control declara aviso escrito y anticipación; no verifica documentación, controversias sobre cumplimiento efectivo ni excepciones, que requieren revisión individual.

[Código del Trabajo, fuente institucional INETER](https://www.ineter.gob.ni/leyes/codigo-trabajo.pdf): artículos 42 (prestaciones proporcionales), 43 (derechos adquiridos), 44 (aviso), 45 (indemnización), 48 (terminación con causa), 76–80 (vacaciones) y 93–97 (décimo tercer mes). Son contexto legal; la herramienta no verifica requisitos probatorios ni autorización administrativa.

El artículo 45 contiene un mínimo literal de un mes y máximo de cinco. La proporcionalidad inferior a un año solicitada para esta herramienta sigue el criterio jurisprudencial referido en la [Sentencia 141/2015 del TNLA](https://www.poderjudicial.gob.ni/tnla/SENTENCIA_141_2015.pdf) y el [compendio del TNLA, tomo II](https://www.poderjudicial.gob.ni/tnla/tomo_2.pdf), en lugar de imponer automáticamente el mínimo literal a cualquier fracción. La fracción convencional días/360 se documenta como metodología del proyecto.

## Validación y límites

Salario positivo finito, fechas reales y ordenadas, contrato/motivo reconocidos, días numéricos finitos no negativos y vacaciones disfrutadas no superiores a acumuladas. Valores vacíos e importes que desborden la capacidad numérica se rechazan. No se impone un máximo jurídico inventado a días pendientes de pago; su razonabilidad debe revisarse conforme al período y pagos efectivos.

Fuera de alcance: salario variable, promedios, comisiones, horas extras, trabajadores de confianza, convenios especiales, regímenes especiales, litigios, causas controvertidas, fiscalidad neta y descuentos automáticos por preaviso. Tampoco se incluyen vacaciones previamente liquidadas en dinero como un campo separado: el saldo requiere revisión si existen esos pagos.

## Comprobación

Desde el tema: `node --experimental-strip-types --test tests/calculators.test.mjs` y `npm run build`.
Las pruebas cubren tramos, fracciones, tope, salario pendiente, igualdad con motores existentes, selección del ciclo, bisiestos, todos los estados, totales parciales, validaciones y regresión.

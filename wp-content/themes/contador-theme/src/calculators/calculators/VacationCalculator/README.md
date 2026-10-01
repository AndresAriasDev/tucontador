# Vacaciones — Nicaragua

Estimación para trabajadores con salario mensual fijo. WordPress monta la
herramienta con `data-calculator="vacaciones"` y plantilla Calculadora en la
página `/calculadoras/vacaciones/`. No se crean páginas desde React.

## Ley

Referencia: Código del Trabajo, artículos 76–80:
https://www.ineter.gob.ni/leyes/codigo-trabajo.pdf

El artículo 76 reconoce 15 días continuos remunerados por seis meses; el 78
establece la referencia salarial ordinaria y el 79 contempla interrupciones
justificadas que no interrumpen la acumulación. La herramienta no descuenta
enfermedad, permisos o ausencias justificadas. No determina reglas particulares
del sector público, programación del descanso ni circunstancias individuales.

## Metodología matemática del proyecto

No se presenta esta convención proporcional como cita literal de la ley:

- Acumulados: `months * (15 / 6) + days / 12`.
- Equivalencias: 2.5 días por mes, 30 por 12 meses, 45 por 18 meses.
- Salario diario: `monthlySalary / 30`.
- Pendientes: `accruedVacationDays - vacationDaysTaken`.
- Valor bruto: `pendingVacationDays * dailySalary`.

Se conserva precisión interna; moneda y días solo se formatean al presentar
(dos decimales máximos para días). No se calculan IR ni INSS ni un importe neto.
No se aplica el umbral ni el ciclo diciembre–noviembre de Aguinaldo.
La acumulación estimada no equivale por sí sola a determinar exigibilidad de pago.

## Fechas compartidas

`utils/workPeriod.ts` conserva el algoritmo inclusivo previamente utilizado:
cierres mensuales anclados al inicio, día d−1 ajustado al final del mes destino;
si inicia el día 1, cierre al final del mes. Se suman días residuales y se
normalizan bloques de 30. No usa Date, UTC ni totalDays/30 para obtener los meses.
31/01–28/02 no bisiesto equivale a un mes. Se mantiene esa convención del proyecto,
incluida la equivalencia convencional de 30 días residuales a un mes.
Vacaciones permite múltiples años; Aguinaldo conserva su validación de ciclo en
su propio wrapper. La extracción no cambia los resultados de Aguinaldo.

## Validación y límites

Salario finito positivo, fechas reales requeridas y ordenadas, días disfrutados
finitos no negativos, incluidos decimales. Disfrutadas > acumuladas genera error
en el campo, nunca un saldo cero silencioso. Importes fuera de la capacidad
numérica se rechazan. Cualquier edición borra resultados y cierra el detalle.

No incluye salario variable, comisiones, neto fiscal, backend, PDF ni persistencia.
No sustituye revisión profesional de situaciones particulares.

## Ejemplo y pruebas

C$20,000; 10 meses + 15 días; 10 disfrutados:
25 + 1.25 = 26.25 acumulados; 16.25 pendientes;
salario diario 666.666…; valor bruto C$10,833.33.

`node --experimental-strip-types --test tests/calculators.test.mjs`

Incluye casos normalizados, fechas multianuales/bisiestas, validaciones,
formato y regresiones Aguinaldo e IR/INSS. No hay dependencias nuevas.

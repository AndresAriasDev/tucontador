# Calculadora de Aguinaldo — Nicaragua

Esta implementación está orientada a trabajadores con salario mensual fijo.
Recibe `{ monthlySalary, startDate, endDate }` y utiliza directamente el último
salario mensual como base. Otras modalidades quedan fuera del alcance de esta
herramienta; esto no limita los derechos que reconoce la legislación.

## Ley y metodología de la herramienta

Código del Trabajo, Ley 185, artículos 93–97:
https://www.poderjudicial.gob.ni/carrerajudicial/pdf/codigo_trabajo_nicaragua.pdf

- Art. 93: salario adicional anual y proporcionalidad para más de un mes y menos de un año.
- Art. 94: referencia al último salario ordinario. El artículo también contempla otras modalidades remunerativas, fuera del alcance de esta implementación.
- Art. 95: oportunidad de pago; no se calcula mora ni indemnización.
- Art. 96: no se descuentan los períodos de tiempo efectivo contemplados.
- Art. 97: protección y exenciones, con las particularidades alimentarias legales. No se aplican IR, INSS ni deducciones.

La convención 30/360 fue indicada para este proyecto; no es una cita textual de la ley:

```
monthFraction = months / 12
dayFraction = days / 360
amountForMonths = salaryBase * monthFraction
amountForDays = salaryBase * dayFraction
amount = amountForMonths + amountForDays
```

Un mes acumula 30/12 = 2.5 días de aguinaldo; un día adicional acumula
2.5/30 = 1/12 de día de aguinaldo, equivalente a 1/360 del salario.
No se utiliza 0.0833 ni divisor monetario de 365/366.
No se redondean pasos internos. `formatCordobas` presenta dos decimales;
la suma de componentes ya formateados puede diferir un centavo del total.

## Fechas inclusivas y fin de mes

`workPeriod.ts` usa componentes gregorianos, sin Date, Date.parse, UTC ni zona horaria.
Ambas fechas cuentan. Los cierres se anclan siempre a la fecha inicial:

1. Inicio en día 1: primer cierre al último día de ese mes.
2. Inicio en día d > 1: cierre del mes n en día d−1 del mes destino.
3. Si ese día no existe, cierre al último día del mes destino.
4. Se cuentan cierres completos y días posteriores al último cierre hasta el final incluido.
5. Residuo de 30 días: normalización a un mes convencional y cero días.

Los días civiles se usan solamente para el residuo, nunca como divisor anual.
01/12–31/12 = 1 mes; 01/12–31/01 = 2 meses; 31/01–28/02 no bisiesto
= 1 mes; 31/01–29/02 bisiesto = 1 mes; 31/01–30/03 = 2 meses sin arrastrar febrero.

**Ambigüedad explicitada:** tratar el aniversario ajustado como inicio del siguiente
tramo daría 1 mes y 1 día para 31/01–28/02 inclusivo. Aquí se trata como cierre,
por lo que da 1 mes. Es convención del proyecto, no definición literal del Código.
La normalización 30/360 también hace que 01/01–30/01 y 01/01–31/01 computen un mes.

## Ciclo y estados

- Un ciclo ordinario: 1 diciembre–30 noviembre. Cruzar al siguiente genera error
  en fecha final, incluso si dura menos de doce meses. No se recorta ni acumula.
- Ciclo completo: 12 meses, 0 días, un salario exacto, incluso en año bisiesto.
- Hasta un mes computado: `below-threshold`, información del artículo 93 y monto
  null. No se presenta C$0.00 como resultado ordinario.
- Más de un mes: `calculated`, resumen y detalle habilitados.
- Editar el salario o cualquiera de las fechas elimina el resultado anterior.

## Verificación

Node >=22.18: `node --experimental-strip-types --test tests/calculators.test.mjs`.
Pruebas: salario mensual y entradas inválidas, ciclos normal/bisiesto, seis meses, 8 meses + 15 días,
umbral, fechas inválidas, fin de mes, cruce de ciclos y regresión IR/INSS.
Para C$20,000 y 8 meses + 15 días: C$14,166.67 sin redondeos intermedios.

## WordPress y límites

Página `aguinaldo` bajo `calculadoras`, plantilla «Calculadora». WordPress conserva
routing y SEO. No se implementan PDF, persistencia, correo, backend ni casos excepcionales.

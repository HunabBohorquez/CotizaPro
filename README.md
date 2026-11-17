# CotizaPro — Calculadora de Tarifa y Cotizaciones PDF

> **Enlaces del proyecto**

**Link:** `https://hunabbohorquez.github.io/CotizaPro/`

**Repositorio en GitHub:** `https://github.com/HunabBohorquez/CotizaPro`

> 📝 **Nota:** este proyecto tiene los **mismos archivos** que el repositorio de GitLab
> (`index.html`, `styles.css`, `app.js`, `README.md`). Solo cambia la plataforma de alojamiento.

---

## Descripción del Proyecto

**CotizaPro** es una aplicación web autocontenida desarrollada exclusivamente con **HTML5**, **CSS3** y **JavaScript ES6+ Vanilla** (sin dependencias ni librerías externas). Permite a profesionales independientes, consultores y estudios digitales calcular su tarifa por hora real sostenible y generar cotizaciones formales listas para imprimir o guardar como documento **PDF** en tamaño Carta.

### Características Principales
- **Calculadora de Tarifa por Hora Real:** Determina el precio mínimo por hora considerando ingreso neto deseado, gastos operativos fijos, horas facturables reales y margen de imprevistos.
- **Vista Previa en Tiempo Real (Split-Screen):** Sincronización instantánea entre el panel de edición y una hoja tamaño Carta (`8.5" × 11"`).
- **Constructor Dinámico de Partidas (CRUD):** Permite agregar, editar y eliminar entregables con cálculo automático por línea.
- **Motor Fiscal y Descuentos:** Soporte para descuento porcentual previo a impuestos e IVA configurable (16% por defecto).
- **Exportación PDF Limpia (`@media print`):** Oculta controles, barras y formularios al invocar `window.print()`, conservando únicamente la hoja de cotización.
- **Persistencia y Portabilidad:** Guardado automático en `localStorage`, carga de escenario Demo y exportación/importación en formato `.json`.

---

## Fórmulas Financieras Utilizadas

### 1. Tarifa por Hora Sugerida (`RateCalculator`)
$$\text{Tarifa Base} = \frac{\text{Ingreso Neto Objetivo} + \text{Gastos Fijos Mensuales}}{\text{Horas Facturables al Mes}}$$

$$\text{Tarifa Sugerida} = \text{Tarifa Base} \times \left(1 + \frac{\text{Margen de Imprevistos}}{100}\right)$$

### 2. Cálculo de Cotización e Impuestos (`QuoteCalculator`)
$$\text{Importe por Partida} = \text{Cantidad / Horas} \times \text{Tarifa Unitaria}$$

$$\text{Subtotal} = \sum \text{Importes de Partidas}$$

$$\text{Descuento (\$)} = \text{Subtotal} \times \left(\frac{\text{Descuento (\%)}}{100}\right)$$

$$\text{Subtotal con Descuento} = \text{Subtotal} - \text{Descuento (\$)}$$

$$\text{IVA (\$)} = \text{Subtotal con Descuento} \times \left(\frac{\text{IVA (\%)}}{100}\right)$$

$$\text{Total Neto a Pagar} = \text{Subtotal con Descuento} + \text{IVA (\$)}$$

---

## Instrucciones de Ejecución

1. Guarda los 4 archivos (`index.html`, `styles.css`, `app.js`, `README.md`) dentro de una misma carpeta local.
2. Haz doble clic sobre **`index.html`** para abrirlo en cualquier navegador web moderno (Chrome, Firefox, Edge o Safari). No requiere servidor backend ni instalación de paquetes.
3. Para generar el PDF, haz clic en **"Imprimir / Guardar como PDF"** y selecciona **"Guardar como PDF"** en el cuadro de diálogo de impresión del navegador.

---

## Pruebas Verificables (Escenario "Cargar Cotización Demo")

Al presionar el botón **"Cargar Cotización Demo"**, la aplicación debe cargar un proyecto web de 4 partidas con los siguientes valores exactos verificables:

1. **Calculadora de Tarifa Real (Demo):**
   - Ingreso neto: `$40,000.00` | Gastos fijos: `$6,000.00` | Horas facturables: `100 h` | Imprevistos: `15%`
   - **Tarifa base:** `$460.00 / h`
   - **Tarifa por hora sugerida:** **`$529.00 / h`**

2. **Desglose de las 4 Partidas del Proyecto:**
   - **Partida 1:** Diseño UX/UI responsivo y prototipo interactivo en Figma — `12 h × $500.00` = **`$6,000.00`**
   - **Partida 2:** Desarrollo Frontend (HTML5, CSS3, JavaScript ES6+ modular) — `24 h × $500.00` = **`$12,000.00`**
   - **Partida 3:** Integración de API REST, catálogo dinámico y panel administrativo — `16 h × $550.00` = **`$8,800.00`**
   - **Partida 4:** Optimización SEO técnico, auditoría Lighthouse y despliegue productivo — `8 h × $450.00` = **`$3,600.00`**

3. **Totales Finales Esperados:**
   - **Subtotal:** **`$30,400.00`**
   - **Descuento (5%):** **`-$1,520.00`**
   - **Subtotal con descuento:** **`$28,880.00`**
   - **IVA (16%):** **`$4,620.80`**
   - **Total Neto a Pagar:** **`$33,500.80 MXN`**

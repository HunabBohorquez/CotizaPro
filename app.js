/**
 * CotizaPro — Aplicación Vanilla ES6+
 * Módulos:
 * 1. RateCalculator: Cálculo de tarifa por hora real sostenible.
 * 2. QuoteCalculator: Motor financiero de partidas, descuentos, IVA y totales.
 * 3. QuoteStore: Gestión de estado reactivo, localStorage, Demo e Import/Export JSON.
 * 4. DocumentRenderer: Sincronización de UI de edición y vista previa tamaño Carta.
 */

/* ==========================================================================
   MÓDULO 1: CALCULADORA DE TARIFA POR HORA REAL
   ========================================================================== */
class RateCalculator {
  /**
   * Calcula la tarifa por hora sugerida a partir de metas financieras y costos fijos.
   * Fórmula: ((IngresoNeto + GastosFijos) / HorasFacturables) * (1 + MargenImprevistos / 100)
   */
  static calculate({ netIncome, billableHours, fixedExpenses, contingencyPercent }) {
    const safeIncome = Math.max(0, Number(netIncome) || 0);
    const safeExpenses = Math.max(0, Number(fixedExpenses) || 0);
    const safeHours = Math.max(1, Number(billableHours) || 1);
    const safeContingency = Math.max(0, Number(contingencyPercent) || 0);

    const baseHourlyRate = (safeIncome + safeExpenses) / safeHours;
    const contingencyMultiplier = 1 + safeContingency / 100;
    const suggestedRate = baseHourlyRate * contingencyMultiplier;

    return {
      baseHourlyRate: this.round(baseHourlyRate),
      suggestedRate: this.round(suggestedRate),
      contingencyPercent: safeContingency
    };
  }

  static round(value) {
    return Math.round((value + Number.EPSILON) * 100) / 100;
  }
}

/* ==========================================================================
   MÓDULO 2: MOTOR DE CÁLCULO DE PARTIDAS E IMPUESTOS
   ========================================================================== */
class QuoteCalculator {
  static calculateTotals(items, discountPercent = 0, taxPercent = 16) {
    const normalizedItems = items.map((item) => {
      const quantity = Math.max(0, Number(item.quantity) || 0);
      const unitRate = Math.max(0, Number(item.unitRate) || 0);
      const amount = RateCalculator.round(quantity * unitRate);
      return {
        ...item,
        quantity,
        unitRate,
        amount
      };
    });

    const subtotal = RateCalculator.round(
      normalizedItems.reduce((acc, item) => acc + item.amount, 0)
    );

    const safeDiscountPct = Math.min(100, Math.max(0, Number(discountPercent) || 0));
    const discountAmount = RateCalculator.round(subtotal * (safeDiscountPct / 100));
    const taxableSubtotal = RateCalculator.round(subtotal - discountAmount);

    const safeTaxPct = Math.max(0, Number(taxPercent) || 0);
    const taxAmount = RateCalculator.round(taxableSubtotal * (safeTaxPct / 100));
    const grandTotal = RateCalculator.round(taxableSubtotal + taxAmount);

    return {
      items: normalizedItems,
      subtotal,
      discountPercent: safeDiscountPct,
      discountAmount,
      taxableSubtotal,
      taxPercent: safeTaxPct,
      taxAmount,
      grandTotal
    };
  }
}

/* ==========================================================================
   MÓDULO 3: GESTIÓN DE ESTADO, PERSISTENCIA Y DATOS DEMO
   ========================================================================== */
class QuoteStore {
  constructor(storageKey = "cotizapro_state_v1") {
    this.storageKey = storageKey;
    this.state = this.loadFromStorage() || this.getInitialState();
  }

  getTodayISO() {
    const now = new Date();
    const offset = now.getTimezoneOffset() * 60000;
    return new Date(now.getTime() - offset).toISOString().split("T")[0];
  }

  getInitialState() {
    return {
      rateConfig: {
        netIncome: 35000,
        billableHours: 100,
        fixedExpenses: 5000,
        contingencyPercent: 15
      },
      defaultHourlyRate: 460,
      meta: {
        folio: "COT-2026-001",
        issueDate: this.getTodayISO(),
        validityDays: 15,
        currency: "MXN",
        discountPercent: 0,
        taxPercent: 16,
        notes:
          "1. Condiciones de pago: 50% de anticipo al autorizar la cotización y 50% contra entrega final.\n2. Los tiempos de entrega comienzan a correr a partir de la recepción del anticipo e insumos.\n3. Cualquier requerimiento adicional fuera del alcance descrito se cotizará por separado."
      },
      issuer: {
        name: "Estudio Digital Arista",
        specialty: "Arquitectura Web & Desarrollo Frontend",
        contact: "hola@estudioarista.mx | +52 55 4890 1122 | estudioarista.mx"
      },
      client: {
        name: "Comercializadora Horizonte S.A. de C.V.",
        project: "Rediseño de Portal Corporativo"
      },
      items: [
        {
          id: this.generateId(),
          description: "Consultoría UX/UI y arquitectura de información",
          quantity: 10,
          unitRate: 460
        }
      ]
    };
  }

  /**
   * Carga un escenario realista de proyecto web de 4 partidas con cifras exactas.
   */
  getDemoState() {
    return {
      rateConfig: {
        netIncome: 40000,
        billableHours: 100,
        fixedExpenses: 6000,
        contingencyPercent: 15
      },
      defaultHourlyRate: 500,
      meta: {
        folio: "COT-2026-042",
        issueDate: "2026-11-16",
        validityDays: 15,
        currency: "MXN",
        discountPercent: 5,
        taxPercent: 16,
        notes:
          "1. Forma de pago: 50% de anticipo para inicio de sprint y 50% previo al despliegue en producción.\n2. Incluye 30 días de soporte técnico sin costo por incidencias posteriores al lanzamiento.\n3. Precios expresados en Pesos Mexicanos (MXN) más IVA vigente."
      },
      issuer: {
        name: "Vértice Ingeniería Web",
        specialty: "Desarrollo Full-Stack & Plataformas E-Commerce",
        contact: "proyectos@verticeweb.mx | +52 55 8821 4400 | verticeweb.mx"
      },
      client: {
        name: "Grupo Industrial Teknova",
        project: "Plataforma Web Corporativa y Catálogo B2B"
      },
      items: [
        {
          id: this.generateId(),
          description: "Diseño UX/UI responsivo y prototipo interactivo en Figma",
          quantity: 12,
          unitRate: 500
        },
        {
          id: this.generateId(),
          description: "Desarrollo Frontend (HTML5, CSS3, JavaScript ES6+ modular)",
          quantity: 24,
          unitRate: 500
        },
        {
          id: this.generateId(),
          description: "Integración de API REST, catálogo dinámico y panel administrativo",
          quantity: 16,
          unitRate: 550
        },
        {
          id: this.generateId(),
          description: "Optimización SEO técnico, auditoría Lighthouse y despliegue productivo",
          quantity: 8,
          unitRate: 450
        }
      ]
    };
  }

  generateId() {
    return "item_" + Math.random().toString(36).substring(2, 9);
  }

  loadFromStorage() {
    try {
      const raw = localStorage.getItem(this.storageKey);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (error) {
      console.warn("No se pudo leer localStorage:", error);
      return null;
    }
  }

  saveToStorage() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.state));
    } catch (error) {
      console.error("Error al guardar en localStorage:", error);
    }
  }

  loadDemo() {
    this.state = this.getDemoState();
    this.saveToStorage();
  }

  reset() {
    this.state = this.getInitialState();
    this.saveToStorage();
  }

  exportJSON() {
    const dataStr = JSON.stringify(this.state, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${this.state.meta.folio || "cotizacion"}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  importJSON(parsedData) {
    if (!parsedData || typeof parsedData !== "object" || !Array.isArray(parsedData.items)) {
      throw new Error("El archivo JSON no tiene una estructura válida de CotizaPro.");
    }
    this.state = {
      ...this.getInitialState(),
      ...parsedData,
      rateConfig: { ...this.getInitialState().rateConfig, ...(parsedData.rateConfig || {}) },
      meta: { ...this.getInitialState().meta, ...(parsedData.meta || {}) },
      issuer: { ...this.getInitialState().issuer, ...(parsedData.issuer || {}) },
      client: { ...this.getInitialState().client, ...(parsedData.client || {}) },
      items: parsedData.items.map((it) => ({
        id: it.id || this.generateId(),
        description: String(it.description || ""),
        quantity: Number(it.quantity) || 0,
        unitRate: Number(it.unitRate) || 0
      }))
    };
    this.saveToStorage();
  }
}

/* ==========================================================================
   MÓDULO 4: RENDERIZADOR DE INTERFAZ Y DOCUMENTO EN VIVO
   ========================================================================== */
class DocumentRenderer {
  constructor(store) {
    this.store = store;
    this.cacheDOM();
    this.bindEvents();
    this.syncInputsFromState();
    this.renderAll();
  }

  cacheDOM() {
    // Botones globales
    this.btnLoadDemo = document.getElementById("btnLoadDemo");
    this.btnExportJson = document.getElementById("btnExportJson");
    this.inputImportJson = document.getElementById("inputImportJson");
    this.btnResetAll = document.getElementById("btnResetAll");
    this.btnPrintPdf = document.getElementById("btnPrintPdf");
    this.statusIndicator = document.getElementById("statusIndicator");

    // Inputs Calculadora de Tarifa
    this.calcNetIncome = document.getElementById("calcNetIncome");
    this.calcBillableHours = document.getElementById("calcBillableHours");
    this.calcFixedExpenses = document.getElementById("calcFixedExpenses");
    this.calcContingency = document.getElementById("calcContingency");
    this.suggestedRateDisplay = document.getElementById("suggestedRateDisplay");
    this.rateBreakdownText = document.getElementById("rateBreakdownText");
    this.btnApplySuggestedRate = document.getElementById("btnApplySuggestedRate");

    // Inputs Datos Generales
    this.quoteFolio = document.getElementById("quoteFolio");
    this.quoteDate = document.getElementById("quoteDate");
    this.quoteValidity = document.getElementById("quoteValidity");
    this.issuerName = document.getElementById("issuerName");
    this.issuerSpecialty = document.getElementById("issuerSpecialty");
    this.issuerContact = document.getElementById("issuerContact");
    this.clientName = document.getElementById("clientName");
    this.projectName = document.getElementById("projectName");

    // Partidas
    this.btnAddItem = document.getElementById("btnAddItem");
    this.itemsEditorContainer = document.getElementById("itemsEditorContainer");

    // Impuestos y notas
    this.quoteCurrency = document.getElementById("quoteCurrency");
    this.quoteDiscount = document.getElementById("quoteDiscount");
    this.quoteTax = document.getElementById("quoteTax");
    this.quoteNotes = document.getElementById("quoteNotes");

    // Elementos de Vista Previa
    this.prevIssuerName = document.getElementById("prevIssuerName");
    this.prevIssuerSpecialty = document.getElementById("prevIssuerSpecialty");
    this.prevIssuerContact = document.getElementById("prevIssuerContact");
    this.prevFolio = document.getElementById("prevFolio");
    this.prevDate = document.getElementById("prevDate");
    this.prevValidUntil = document.getElementById("prevValidUntil");
    this.prevClientName = document.getElementById("prevClientName");
    this.prevProjectName = document.getElementById("prevProjectName");
    this.prevItemsBody = document.getElementById("prevItemsBody");
    this.prevNotes = document.getElementById("prevNotes");
    this.prevSubtotal = document.getElementById("prevSubtotal");
    this.prevDiscountRow = document.getElementById("prevDiscountRow");
    this.prevDiscountLabel = document.getElementById("prevDiscountLabel");
    this.prevDiscountAmount = document.getElementById("prevDiscountAmount");
    this.prevTaxableRow = document.getElementById("prevTaxableRow");
    this.prevTaxableAmount = document.getElementById("prevTaxableAmount");
    this.prevTaxLabel = document.getElementById("prevTaxLabel");
    this.prevTaxAmount = document.getElementById("prevTaxAmount");
    this.prevGrandTotal = document.getElementById("prevGrandTotal");
    this.prevSignatureIssuer = document.getElementById("prevSignatureIssuer");
  }

  bindEvents() {
    // Calculadora de tarifa
    const rateInputs = [
      this.calcNetIncome,
      this.calcBillableHours,
      this.calcFixedExpenses,
      this.calcContingency
    ];
    rateInputs.forEach((input) => {
      input.addEventListener("input", () => {
        this.store.state.rateConfig = {
          netIncome: Number(this.calcNetIncome.value) || 0,
          billableHours: Number(this.calcBillableHours.value) || 1,
          fixedExpenses: Number(this.calcFixedExpenses.value) || 0,
          contingencyPercent: Number(this.calcContingency.value) || 0
        };
        this.persistAndRender();
      });
    });

    this.btnApplySuggestedRate.addEventListener("click", () => {
      const result = RateCalculator.calculate(this.store.state.rateConfig);
      this.store.state.defaultHourlyRate = result.suggestedRate;
      this.store.saveToStorage();
      this.flashStatus(`Tarifa ${this.formatMoney(result.suggestedRate)}/h lista para nuevas partidas`);
    });

    // Datos generales
    const bindField = (el, section, key, isNumeric = false) => {
      el.addEventListener("input", () => {
        this.store.state[section][key] = isNumeric ? Number(el.value) || 0 : el.value;
        this.persistAndRender();
      });
    };

    bindField(this.quoteFolio, "meta", "folio");
    bindField(this.quoteDate, "meta", "issueDate");
    bindField(this.quoteValidity, "meta", "validityDays", true);
    bindField(this.quoteCurrency, "meta", "currency");
    bindField(this.quoteDiscount, "meta", "discountPercent", true);
    bindField(this.quoteTax, "meta", "taxPercent", true);
    bindField(this.quoteNotes, "meta", "notes");

    bindField(this.issuerName, "issuer", "name");
    bindField(this.issuerSpecialty, "issuer", "specialty");
    bindField(this.issuerContact, "issuer", "contact");

    bindField(this.clientName, "client", "name");
    bindField(this.projectName, "client", "project");

    // CRUD Partidas
    this.btnAddItem.addEventListener("click", () => {
      this.store.state.items.push({
        id: this.store.generateId(),
        description: "Nuevo entregable o servicio profesional",
        quantity: 1,
        unitRate: this.store.state.defaultHourlyRate
      });
      this.persistAndRender();
    });

    // Delegación de eventos en editor de partidas
    this.itemsEditorContainer.addEventListener("input", (e) => {
      const card = e.target.closest("[data-item-id]");
      if (!card) return;
      const itemId = card.dataset.itemId;
      const field = e.target.dataset.field;
      const item = this.store.state.items.find((it) => it.id === itemId);
      if (!item || !field) return;

      if (field === "description") {
        item.description = e.target.value;
      } else {
        item[field] = Math.max(0, Number(e.target.value) || 0);
      }

      // Actualizar importe de la tarjeta sin reconstruir el DOM del input activo
      const amountPill = card.querySelector(".item-subtotal-pill");
      if (amountPill) {
        const lineTotal = RateCalculator.round(item.quantity * item.unitRate);
        amountPill.textContent = this.formatMoney(lineTotal);
      }

      this.store.saveToStorage();
      this.renderDocumentPreview();
      this.flashStatus("Guardado automáticamente");
    });

    this.itemsEditorContainer.addEventListener("click", (e) => {
      const removeBtn = e.target.closest("[data-remove-id]");
      if (!removeBtn) return;
      const removeId = removeBtn.dataset.removeId;
      this.store.state.items = this.store.state.items.filter((it) => it.id !== removeId);
      this.persistAndRender();
    });

    // Acciones de barra superior
    this.btnLoadDemo.addEventListener("click", () => {
      this.store.loadDemo();
      this.syncInputsFromState();
      this.renderAll();
      this.flashStatus("Cotización Demo cargada");
    });

    this.btnExportJson.addEventListener("click", () => {
      this.store.exportJSON();
      this.flashStatus("Archivo JSON descargado");
    });

    this.inputImportJson.addEventListener("change", (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          const parsed = JSON.parse(evt.target.result);
          this.store.importJSON(parsed);
          this.syncInputsFromState();
          this.renderAll();
          this.flashStatus("JSON importado correctamente");
        } catch (err) {
          alert(err.message || "No se pudo importar el archivo JSON.");
        } finally {
          this.inputImportJson.value = "";
        }
      };
      reader.readAsText(file);
    });

    this.btnResetAll.addEventListener("click", () => {
      if (confirm("¿Deseas restablecer toda la cotización a los valores iniciales?")) {
        this.store.reset();
        this.syncInputsFromState();
        this.renderAll();
        this.flashStatus("Formulario restablecido");
      }
    });

    this.btnPrintPdf.addEventListener("click", () => {
      window.print();
    });
  }

  syncInputsFromState() {
    const { rateConfig, meta, issuer, client } = this.store.state;
    this.calcNetIncome.value = rateConfig.netIncome;
    this.calcBillableHours.value = rateConfig.billableHours;
    this.calcFixedExpenses.value = rateConfig.fixedExpenses;
    this.calcContingency.value = rateConfig.contingencyPercent;

    this.quoteFolio.value = meta.folio;
    this.quoteDate.value = meta.issueDate;
    this.quoteValidity.value = meta.validityDays;
    this.quoteCurrency.value = meta.currency;
    this.quoteDiscount.value = meta.discountPercent;
    this.quoteTax.value = meta.taxPercent;
    this.quoteNotes.value = meta.notes;

    this.issuerName.value = issuer.name;
    this.issuerSpecialty.value = issuer.specialty;
    this.issuerContact.value = issuer.contact;

    this.clientName.value = client.name;
    this.projectName.value = client.project;
  }

  persistAndRender() {
    this.store.saveToStorage();
    this.renderAll();
    this.flashStatus("Guardado automáticamente");
  }

  renderAll() {
    this.renderRateCalculator();
    this.renderItemsEditor();
    this.renderDocumentPreview();
  }

  renderRateCalculator() {
    const result = RateCalculator.calculate(this.store.state.rateConfig);
    this.suggestedRateDisplay.textContent = `${this.formatMoney(result.suggestedRate)} / h`;
    this.rateBreakdownText.textContent = `Costo base: ${this.formatMoney(
      result.baseHourlyRate
    )}/h + ${result.contingencyPercent}% imprevistos`;
  }

  renderItemsEditor() {
    const { items } = this.store.state;
    if (items.length === 0) {
      this.itemsEditorContainer.innerHTML = `<p style="color:#64748b;font-size:0.82rem;">No hay partidas agregadas. Haz clic en "+ Agregar Partida".</p>`;
      return;
    }

    this.itemsEditorContainer.innerHTML = items
      .map((item, idx) => {
        const lineTotal = RateCalculator.round(item.quantity * item.unitRate);
        return `
          <div class="item-editor-card" data-item-id="${item.id}">
            <div class="item-editor-top">
              <span class="item-index-badge">Partida #${idx + 1}</span>
              <button type="button" class="btn-remove-item" data-remove-id="${item.id}">
                Eliminar
              </button>
            </div>
            <div class="form-group" style="margin-bottom:0.4rem;">
              <input
                type="text"
                data-field="description"
                value="${this.escapeHTML(item.description)}"
                placeholder="Descripción del entregable o servicio"
              />
            </div>
            <div class="item-metrics-row">
              <div>
                <label style="font-size:0.7rem;color:#64748b;display:block;">Horas / Cant.</label>
                <input type="number" data-field="quantity" min="0" step="0.5" value="${item.quantity}" />
              </div>
              <div>
                <label style="font-size:0.7rem;color:#64748b;display:block;">Tarifa Unit. ($)</label>
                <input type="number" data-field="unitRate" min="0" step="10" value="${item.unitRate}" />
              </div>
              <div>
                <label style="font-size:0.7rem;color:#64748b;display:block;">Importe</label>
                <div class="item-subtotal-pill">${this.formatMoney(lineTotal)}</div>
              </div>
            </div>
          </div>
        `;
      })
      .join("");
  }

  renderDocumentPreview() {
    const { meta, issuer, client, items } = this.store.state;
    const totals = QuoteCalculator.calculateTotals(items, meta.discountPercent, meta.taxPercent);

    // Encabezado y metadatos
    this.prevIssuerName.textContent = issuer.name || "Nombre / Empresa Emisora";
    this.prevIssuerSpecialty.textContent = issuer.specialty || "Especialidad Profesional";
    this.prevIssuerContact.textContent = issuer.contact || "Datos de contacto";
    this.prevSignatureIssuer.textContent = issuer.name || "Firma del Emisor";

    this.prevFolio.textContent = meta.folio || "SIN-FOLIO";
    this.prevDate.textContent = this.formatDateES(meta.issueDate);
    this.prevValidUntil.textContent = this.calculateValidUntil(meta.issueDate, meta.validityDays);

    this.prevClientName.textContent = client.name || "Cliente por definir";
    this.prevProjectName.textContent = client.project || "Proyecto por definir";

    // Tabla de partidas en documento
    if (totals.items.length === 0) {
      this.prevItemsBody.innerHTML = `
        <tr>
          <td colspan="5" style="text-align:center;color:#94a3b8;padding:1.5rem;">
            Agrega al menos una partida desde el panel izquierdo para visualizar el desglose.
          </td>
        </tr>
      `;
    } else {
      this.prevItemsBody.innerHTML = totals.items
        .map(
          (item, index) => `
          <tr>
            <td>${index + 1}</td>
            <td>${this.escapeHTML(item.description || "Sin descripción")}</td>
            <td class="text-right">${item.quantity}</td>
            <td class="text-right">${this.formatMoney(item.unitRate)}</td>
            <td class="text-right">${this.formatMoney(item.amount)}</td>
          </tr>
        `
        )
        .join("");
    }

    // Notas y totales
    this.prevNotes.textContent = meta.notes || "Sin notas adicionales.";
    this.prevSubtotal.textContent = this.formatMoney(totals.subtotal);

    if (totals.discountPercent > 0) {
      this.prevDiscountRow.style.display = "table-row";
      this.prevTaxableRow.style.display = "table-row";
      this.prevDiscountLabel.textContent = `Descuento (${totals.discountPercent}%):`;
      this.prevDiscountAmount.textContent = `-${this.formatMoney(totals.discountAmount)}`;
      this.prevTaxableAmount.textContent = this.formatMoney(totals.taxableSubtotal);
    } else {
      this.prevDiscountRow.style.display = "none";
      this.prevTaxableRow.style.display = "none";
    }

    this.prevTaxLabel.textContent = `IVA (${totals.taxPercent}%):`;
    this.prevTaxAmount.textContent = this.formatMoney(totals.taxAmount);
    this.prevGrandTotal.textContent = `${this.formatMoney(totals.grandTotal)} ${meta.currency}`;
  }

  formatMoney(amount) {
    const currency = this.store.state.meta.currency || "MXN";
    const locale = currency === "EUR" ? "de-DE" : "es-MX";
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount || 0);
  }

  formatDateES(isoDate) {
    if (!isoDate) return "—";
    const [year, month, day] = isoDate.split("-");
    if (!year || !month || !day) return isoDate;
    return `${day}/${month}/${year}`;
  }

  calculateValidUntil(isoDate, days) {
    if (!isoDate) return "—";
    const [year, month, day] = isoDate.split("-").map(Number);
    const dateObj = new Date(year, month - 1, day);
    dateObj.setDate(dateObj.getDate() + (Number(days) || 0));
    const d = String(dateObj.getDate()).padStart(2, "0");
    const m = String(dateObj.getMonth() + 1).padStart(2, "0");
    const y = dateObj.getFullYear();
    return `${d}/${m}/${y} (${days} días)`;
  }

  escapeHTML(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  flashStatus(message) {
    if (!this.statusIndicator) return;
    this.statusIndicator.textContent = message;
  }
}

/* ==========================================================================
   INICIALIZACIÓN DE LA APLICACIÓN
   ========================================================================== */
document.addEventListener("DOMContentLoaded", () => {
  const store = new QuoteStore();
  new DocumentRenderer(store);
});

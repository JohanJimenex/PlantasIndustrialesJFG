// =================== CONFIGURACIÓN RÁPIDA ===================
const CONFIG = {
    // Teléfono (RD usa prefijo +1)
    phoneDisplay: "+1 (829) 283-1000",
    phoneDigits: "18292831000",     // solo dígitos
    whatsappDigits: "18292831000",  // solo dígitos

    // Correo y textos
    email: "gonzalezsrl01@gmail.com",
    mailSubject: "Solicitud de cotización — JFG",

    // Dirección / RNC / Redes
    address: "Alma Rosa I, Santo Domingo, RD",
    rnc: "—",
    instagramUrl: "https://www.instagram.com/plantasindustriales_jfg/"
};
// =============================================================


// =================== HELPERS SEGUROS ===================
const $ = (sel) => document.querySelector(sel);
const byId = (id) => document.getElementById(id);
const safeSetHTML = (el, html) => { if (el) el.innerHTML = html; };
const safeSetText = (el, text) => { if (el) el.textContent = text; };
const safeSetHref = (el, href) => { if (el && href) el.setAttribute('href', href); };

const toDigits = (s) => (s || "").replace(/\D+/g, "");
const enc = encodeURIComponent;
// =======================================================


// =================== PINTAR DATOS BÁSICOS ===================
safeSetText(byId('year'), String(new Date().getFullYear()));
safeSetText(byId('rnc'), CONFIG.rnc || '—');

safeSetHTML($('#ui-phone'), `Tel: ${CONFIG.phoneDisplay || '<i>Completar</i>'}`);
safeSetHTML($('#ui-email'), `Email: ${CONFIG.email ? `<a href="mailto:${CONFIG.email}">${CONFIG.email}</a>` : '<i>Completar</i>'}`);
safeSetHTML($('#ui-address'), `Dirección: ${CONFIG.address || '<i>Completar</i>'}`);

// Instagram (header y card)
const igUrl = CONFIG.instagramUrl || '#';
safeSetHref(byId('ui-ig'), igUrl);
safeSetHref(byId('cta-ig'), igUrl);
// ============================================================


// =================== CTA HEADER (WhatsApp / Llamar / Mail) ===================
const PHONE = toDigits(CONFIG.phoneDigits);
const WSP = toDigits(CONFIG.whatsappDigits);

const defaultWspText = enc("Hola, quisiera información sobre plantas eléctricas.");
const wspHeaderLink = WSP ? `https://wa.me/${WSP}?text=${defaultWspText}` : '#';
const telLink = PHONE ? `tel:${PHONE}` : '#';
const mailtoBase = CONFIG.email
    ? `mailto:${CONFIG.email}?subject=${enc(CONFIG.mailSubject || '')}`
    : '#';

safeSetHref(byId('cta-whatsapp'), wspHeaderLink);
safeSetHref(byId('cta-llamar'), telLink);
safeSetHref(byId('cta-mail'), mailtoBase);
// ============================================================================


// =================== COPIAR TELÉFONO ===================
const btnCopy = byId('btn-copy');
if (btnCopy) {
    btnCopy.addEventListener('click', async () => {
        if (!PHONE) { alert('Agrega phoneDigits en CONFIG'); return; }
        try {
            await navigator.clipboard.writeText(PHONE);
            btnCopy.textContent = 'Copiado ✓';
            setTimeout(() => (btnCopy.textContent = 'Copiar'), 1500);
        } catch {
            // Fallback si Clipboard falla
            const tmp = document.createElement('input');
            tmp.value = PHONE;
            document.body.appendChild(tmp);
            tmp.select();
            document.execCommand('copy');
            tmp.remove();
            btnCopy.textContent = 'Copiado ✓';
            setTimeout(() => (btnCopy.textContent = 'Copiar'), 1500);
        }
    });
}
// =======================================================


// =================== FORMULARIO: WhatsApp / Mailto DINÁMICOS ===================
const form = byId('form-contacto');
const mailBtn = byId('cta-mail');           // botón "Enviar por correo"
const wspFormBtn = byId('cta-whatsapp-form'); // botón "WhatsApp" del formulario

function buildMessages() {
    if (!form) return { mailto: mailtoBase, whatsapp: wspHeaderLink };

    const fd = new FormData(form);
    const nombre = String(fd.get('nombre') || '').trim();
    const telefono = String(fd.get('telefono') || '').trim();
    const email = String(fd.get('email') || '').trim();
    const mensaje = String(fd.get('mensaje') || '').trim();

    const subject = enc(CONFIG.mailSubject || 'Solicitud de información — JFG');

    const mailBody =
        `Nombre: ${nombre}\r\n` +
        `Teléfono: ${telefono}\r\n` +
        `Email: ${email}\r\n\r\n` +
        `Necesito:\r\n${mensaje}`;

    const wspText =
        `Hola, soy ${nombre}. ` +
        `Tel: ${telefono}. ` +
        `Email: ${email}. ` +
        `Necesito: ${mensaje}`;

    const mailto = CONFIG.email
        ? `mailto:${CONFIG.email}?subject=${subject}&body=${enc(mailBody)}`
        : '#';

    const whatsapp = WSP
        ? `https://wa.me/${WSP}?text=${enc(wspText)}`
        : '#';

    return { mailto, whatsapp };
}

function refreshFormLinks() {
    const { mailto, whatsapp } = buildMessages();
    safeSetHref(mailBtn, mailto);
    safeSetHref(wspFormBtn, whatsapp);
}

// Actualiza enlaces al escribir
if (form) {
    form.addEventListener('input', refreshFormLinks);
    // Inicial
    refreshFormLinks();

    // Submit: prioridad WhatsApp si está configurado, si no mailto
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const { whatsapp, mailto } = buildMessages();
        if (WSP && whatsapp !== '#') {
            window.open(whatsapp, '_blank');
            return;
        }
        if (CONFIG.email && mailto !== '#') {
            window.location.href = mailto;
            return;
        }
        alert('Configura WhatsApp o Email en CONFIG.');
    });
}
// ===============================================================================


// =================== HARDENING: EVITAR ERRORES SI FALTAN NODOS ===================
// (Nada que hacer aquí: ya usamos "safeSet*" y cheques de existencia en todo el código.)
// ================================================================================


// =================== OPCIONAL: AUTOCOMPLETAR CTA LLAMAR SI CAMBIAS PHONE EN CONFIG ===================
const ctaPhone = byId('cta-llamar');
if (ctaPhone && PHONE) ctaPhone.href = `tel:${PHONE}`;

// Listo: enlaces del header y del formulario quedan siempre sincronizados con CONFIG y con lo que el usuario escriba.

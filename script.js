// section // 0. HERO TITLE WAVE ANIMATIE
document.addEventListener('DOMContentLoaded', () => {
    const heroTitle = document.querySelector('.hero-title');
    if (heroTitle) {
        const text = heroTitle.textContent;
        heroTitle.innerHTML = text.split('').map((char, i) =>
            char === ' '
                ? `<span class="wave-letter wave-space" style="animation-delay:${i * 0.07}s">&nbsp;</span>`
                : `<span class="wave-letter" style="animation-delay:${i * 0.07}s">${char}</span>`
        ).join('');
    }
});

// section // 1. CANVAS MOTOR (Sterrenhemel)
if (window.emailjs) {
    window.emailjs.init('WmdbKABruq6DF33lp');
}

const debugApp = document.getElementById('app');
if (debugApp) {
    debugApp.textContent = 'script.js is geladen.';
}

const starContainer = document.getElementById('stars-container');
if (starContainer) {
    const canvas = document.createElement('canvas');
    canvas.id = 'bg-canvas';
    starContainer.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    let stars = [];

    function initStars() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        stars = [];
        for (let i = 0; i < 1750; i++) {
            stars.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                size: Math.random() * 2,
                v: Math.random() * 0.5 + 0.1
            });
        }
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#FFFFFF';
        ctx.globalAlpha = 1.0;
        stars.forEach((star) => {
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            ctx.fill();
            star.y += star.v;
            if (star.y > canvas.height) star.y = 0;
        });
        requestAnimationFrame(draw);
    }
    window.addEventListener('resize', initStars);
    initStars();
    draw();
}

// section // 2. DE PERFECTE AUTO-SCROLL (FIXED)

// // MENTOR NOTE: Deze variabele houdt bij of we mogen scrollen //
let isStepPlanActive = false;

function autoScrollToInfo() {

    const infoSectie = document.getElementById('ai-intro');

    if (infoSectie) {

        // Verander -20 naar bijvoorbeeld -120 voor meer ruimte bovenin

        const yOffset = -120;

        const y = infoSectie.getBoundingClientRect().top + window.pageYOffset + yOffset;



        window.scrollTo({

            top: y,

            behavior: 'smooth'

        });

    }

}

function openStepPlan() {
    isStepPlanActive = true; // Nu staat het stappenplan aan
    const overlay = document.getElementById('config-overlay') || document.getElementById('overlay');
    if (overlay) {
        overlay.style.display = 'flex';
        overlay.setAttribute('aria-hidden', 'false');
        document.body.classList.add('scan-active');
    }
}

function closeStepPlan() {
    isStepPlanActive = false; // Plan is klaar, scrollen mag weer
    const overlay = document.getElementById('config-overlay') || document.getElementById('overlay');
    if (overlay) {
        overlay.style.display = 'none';
        overlay.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('scan-active');
    }
}

// // STAP 6 AFRONDEN //
function stapZesKlaar(summaryData = null) {
    // 1. Sluit de overlay visueel
    const overlay = document.getElementById('config-overlay') || document.getElementById('overlay');
    if (overlay) {
        overlay.style.display = 'none';
        overlay.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('scan-active');
    }

    // 2. Zet de blokkade uit
    isStepPlanActive = false;

    // 3. Stuur het laatste bericht naar de chat
    // Omdat de blokkade nu UIT staat, zal de browser direct omlaag scrollen naar dit bericht.
    if (summaryData) {
        const modulesText = summaryData.modules.length > 0
            ? summaryData.modules.join(', ')
            : 'Geen extra AI-modules geselecteerd';

        const bericht = [
            `Empire Scan compleet voor ${summaryData.naam || 'uw project'}.`,
            `Branche: ${summaryData.brancheLabel}`,
            `Pagina's: ${summaryData.pages} (${summaryData.pagesExtra} extra)`,
            `Design Stijl: ${summaryData.style}`,
            `AI Modules: ${modulesText}`,
            `Eindprijs Indicatie: €${summaryData.total.toFixed(2)} excl. BTW.`,
            'Wilt u dat ik direct de aanbetaling van €50 voorbereid zodat we uw projectslot vastzetten?'
        ].join('\n');

        sendAiMessage(bericht);
        return;
    }

    sendAiMessage('Uw blauwdruk is compleet. Zal ik de AI-installaties voorbereiden?');
}

const EMPIRE_SCAN_PRICES = {
    basis: 399,
    extraPagina: 99,
    modules: {
        ai_chat: 799,
        ai_ag: 149,
        ai_mail: 175,
        ai_fact: 249,
        ai_data: 199,
        seo: 99
    }
};

function formatEmpirePrice(value) {
    return `€${value.toFixed(2)}`;
}

function berekenEmpireScanVanForm(form) {
    const pages = Number(form.elements.pages?.value || 1);
    const safePages = Number.isFinite(pages) ? Math.min(10, Math.max(1, pages)) : 1;
    const extraPaginaPrijs = (safePages - 1) * EMPIRE_SCAN_PRICES.extraPagina;

    let modulesTotaal = 0;
    Object.entries(EMPIRE_SCAN_PRICES.modules).forEach(([key, bedrag]) => {
        if (form.elements[key]?.checked) {
            modulesTotaal += bedrag;
        }
    });

    return EMPIRE_SCAN_PRICES.basis + extraPaginaPrijs + modulesTotaal;
}

function updateEmpireScanPrijs() {
    const form = document.getElementById('empire-scan-form');
    const liveTotal = document.getElementById('scan-live-total');
    const pageOutput = document.getElementById('scan-pages-output');
    if (!form || !liveTotal) return;

    const pages = Number(form.elements.pages?.value || 1);
    if (pageOutput) {
        pageOutput.value = String(pages);
        pageOutput.textContent = String(pages);
    }

    const total = berekenEmpireScanVanForm(form);
    liveTotal.textContent = `Live Indicatie: ${formatEmpirePrice(total)},-`;
}

function getSelectedEmpireModules(form) {
    const labels = {
        ai_chat: 'AI Hersen-capaciteit',
        ai_ag: 'AI Agenda Beheer',
        ai_mail: 'AI Mail Assistent',
        ai_fact: 'AI Factuur Systeem',
        ai_data: 'AI Data Manager',
        seo: 'SEO Optimalisatie'
    };

    return Object.keys(labels).filter((key) => form.elements[key]?.checked).map((key) => labels[key]);
}

function initializeEmpireScan() {
    const form = document.getElementById('empire-scan-form');
    if (!form) return;

    form.addEventListener('input', updateEmpireScanPrijs);
    form.addEventListener('change', updateEmpireScanPrijs);

    form.addEventListener('submit', (event) => {
        event.preventDefault();

        const pages = Number(form.elements.pages?.value || 1);
        const branchSelect = form.elements.branche;
        const branchLabel = branchSelect?.options?.[branchSelect.selectedIndex]?.text || 'Onbekende branche';
        const summaryData = {
            naam: String(form.elements.naam?.value || '').trim(),
            brancheLabel: branchLabel,
            pages: pages,
            pagesExtra: Math.max(0, pages - 1),
            style: String(form.elements.style?.value || 'Niet gespecificeerd'),
            modules: getSelectedEmpireModules(form),
            total: berekenEmpireScanVanForm(form)
        };

        stapZesKlaar(summaryData);
        form.reset();
        updateEmpireScanPrijs();
    });

    updateEmpireScanPrijs();
}

// section // 3. AI-GUIDE ARCHITECT FLOW
const aiGuide = {
    hasStarted: false,
    startGesprek: async function () {
        if (this.hasStarted) return;
        this.hasStarted = true;
        const welkomBericht = "TT-Guide geactiveerd. Ik ben je assistent. Om de digitale blauwdruk voor je project te genereren, heb ik je visie nodig. Vertel me eerst: Wat is het hoofddoel van je nieuwe platform?";
        await this.displayMessage(welkomBericht, 'bot');
    },
    displayMessage: async function (text, sender = 'bot') {
        const messageElement = createChatMessage(sender);
        if (!messageElement) return;
        if (sender === 'bot') {
            await typeText(messageElement, text);
        } else {
            messageElement.textContent = text;
        }
    }
};

const stapPrompts = {
    1: 'Ik wil graag een keuze maken voor het Type: Website, Shop of Kaart',
    2: 'Ik wil de Grootte bepalen: Hoeveel pagina\'s heb ik nodig?',
    3: 'Ik wil praten over de Look: Kleuren & UI Design',
    4: 'Ik heb vragen over de Vulling: Tekst & foto\'s',
    5: 'Ik wil extra Tools toevoegen: Boekingen, Koppelingen, etc.',
    6: 'Vertel me meer over de Finish: Domein, Mail & Beheer'
};

// // DE OFFICIELE EMPIRE PRIJSLIJST // //
const PRIJSLIJST = {
    bouw: {
        onePager: 399,          // Was 299
        extraPagina: 99,        // Was 95
        logoOntwerp: 99,        // Was 75
        seoTurbo: 149,
        privacyCookie: 49       // Aangepast (was 39)
    },
    animatie: {
        scrollAnimaties: 99,
        premiumInteractie: 149,
        lottieMaatwerk: 195
    },
    functies: {
        whatsappKnop: 65,       // Was 49
        socialFeed: 65,
        reviewSysteem: 125,     // Was 85
        afsprakenPlanner: 149,  // Was 125
        betaalModule: 199,      // Was 149
        emailSetup: 85          // Was 45
    },
    ai: {
        installatie: 799,       // Was 599 (incl. 1500 woorden)
        extraGeheugen: 75,
        prijsIndicator: 299     // Was 249
    },
    automatisering: {
        emailAuto: 175,         // Nieuw
        factuurKoppeling: 249,  // Nieuw
        crmSysteem: 199         // Nieuw
    },
    service: {
        onderhoudMaand: 19.95,
        adhocUpdate: 150,       // Verhoogd (was 125)
        crashRecovery: 599      // Verhoogd (was 499)
    }
};

// // DE OFFICIELE EMPIRE PRIJS CONFIGURATIE (Excl. BTW) // //
const TT_CONFIG = {
    prices: {
        // Stap 1 & 2: De Basis & Pagina's
        onePager: 399,          // Jouw nieuwe prijs
        extraPagina: 99,        // Was 95, nu 99
        logo: 99,               // Was 75, nu 99
        
        // Stap 4 & 5: Conversie & Knoppen
        whatsapp: 65,           // Contact Button (was 49)
        betaal: 199,            // Betaal Knop (was 149)
        reviews: 125,           // Review Systeem (was 85)
        planner: 149,           // Afspraken Planner (was 125)
        
        // Stap 6: AI Power (De hersenen)
        ai: 799,                // AI Installatie (was 599)
        aiCalc: 299,            // AI Prijs-Indicator (was 249)
        aiExtra: 75,            // Per 1000 woorden extra geheugen
        
        // Nieuw: Automatisering & Support
        emailAuto: 175,         // E-mail Automatisering (bevestigingen)
        factuurKoppeling: 249,  // Automatische PDF facturen
        crmSysteem: 199,        // Lead systeem (Google Sheets)
        emailSetup: 85,         // Zakelijke e-mail (info@...)
        onderhoud: 19.95        // Maandelijks (p/m)
    },
    colors: { primary: '#00ffcc' },
    // Mentor Tip: centrale prijsresolver voor key-based opties.
    getPrice(key) {
        return this.prices[key] || 0;
    }
};

const keuzes = {
    stap: 0,
    type: '',
    pagina: '',
    stijl: '',
    content: '',
    tools: '',
    finish: '',
    modus: 'normaal',
    wachtOpAutomatisering: false,
    wachtOpAutomatiseringDetails: false
};

let supportData = { email: '', vraag: '', stap: 0 };
let gemaakteKeuzes = {};
let currentTotal = 399;
let selectedOptions = {
    stap1: 399
};
let aiWinkelmandje = [];
let systeemConfiguratieContext = '';

const STAP_PRIJS_MAP = {
    1: {
        'Website': 699,
        'Webshop': 999,
        'Digitale Kaart': 399
    },
    2: {
        'Modern/Clean': 0,
        'Futuristisch/Dark': 99,
        'Speels/Kleurrijk': 49
    },
    3: {
        "1 Pagina's": 0,
        "2 Pagina's": 95,
        "3 Pagina's": 190,
        "4 Pagina's": 285,
        "5 Pagina's": 380,
        "6 Pagina's": 475,
        "7 Pagina's": 570,
        "8 Pagina's": 665,
        "9 Pagina's": 760,
        "10 Pagina's": 855
    },
    4: {
        'AI-Content': 149,
        'Eigen Content': 0
    },
    5: {
        'Boeking-Systeem': 125,
        'Contact-Focus': 49,
        'Socials': 65
    },
    6: {
        'All-in Beheer': 149,
        'Zelf Beheren': 0
    }
};

function resolveChoicePrice(stapNummer, keuzeWaarde, explicietePrijs) {
    if (typeof explicietePrijs === 'number' && Number.isFinite(explicietePrijs)) {
        return explicietePrijs;
    }

    const keyPrijs = TT_CONFIG.getPrice(keuzeWaarde);
    if (keyPrijs > 0) {
        return keyPrijs;
    }

    return STAP_PRIJS_MAP[stapNummer]?.[keuzeWaarde] ?? 0;
}

function getKeuzeNaam(keuze) {
    if (keuze && typeof keuze === 'object') {
        return keuze.naam || '';
    }
    return keuze || '';
}

function getAiWinkelmandTotaal() {
    return aiWinkelmandje.reduce((acc, curr) => acc + (curr.prijs || 0), 0);
}

function updatePrijsUI(stapNummer) {
    const totaalEmpire = currentTotal + getAiWinkelmandTotaal();
    const priceElement = document.getElementById('livePrice');
    if (priceElement) {
        priceElement.innerText = `€ ${totaalEmpire.toFixed(2)}`;
    }

    const progressFill = document.getElementById('progressBar');
    if (progressFill) {
        const percentage = (Math.min(6, Math.max(1, stapNummer)) / 6) * 100;
        progressFill.style.width = `${percentage}%`;
    }
}

function berekenTotaalEmpire(stapNummer = (keuzes.stap || 1)) {
    updatePrijsUI(stapNummer);
    return currentTotal + getAiWinkelmandTotaal();
}

function renderAiMessage(text) {
    return renderMessage(text, 'bot');
}

function renderChatButton(label, onClick) {
    const chatWindow = document.getElementById('chat-window');
    if (!chatWindow) return;

    const row = document.createElement('div');
    row.className = 'message bot-message bot-bericht';

    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = label;
    button.className = 'chip';
    button.style.width = '100%';
    button.addEventListener('click', onClick);

    row.appendChild(button);
    chatWindow.appendChild(row);
    chatWindow.scrollTop = chatWindow.scrollHeight;
}

// // DE AI-WERKNEMER WINKELMAND LOGICA // //
function toggleAiModule(sleutel, naam, prijs) {
    const modulePrijs = typeof prijs === 'number' ? prijs : (TT_CONFIG.prices[sleutel] || 0);
    const index = aiWinkelmandje.findIndex((item) => item.sleutel === sleutel);

    if (index > -1) {
        aiWinkelmandje.splice(index, 1);
        console.log(`${naam} verwijderd.`);
    } else {
        aiWinkelmandje.push({ sleutel, naam, prijs: modulePrijs });
        console.log(`${naam} toegevoegd.`);
    }

    berekenTotaalEmpire();
    verstuurConfiguratieNaarAI();
}

function updateLiveBerekening() {
    berekenTotaalEmpire();
}

// // DE CHAT-INTERFACE VOOR DE UPGRADES // //
function toonUpgradeOpties() {
    renderAiMessage('Selecteer de krachten die uw AI-werknemer moet bezitten (u kunt er meerdere kiezen):');

    const opties = [
        { sleutel: 'ai', naam: 'Hersenkracht', prijs: 799 },
        { sleutel: 'planner', naam: 'Agenda Beheer', prijs: 149 },
        { sleutel: 'emailAuto', naam: 'Mail-Manager', prijs: 175 },
        { sleutel: 'factuurKoppeling', naam: 'Admin-Assistent', prijs: 249 },
        { sleutel: 'crmSysteem', naam: 'Lead-Logger', prijs: 199 }
    ];

    opties.forEach((optie) => {
        renderChatButton(`${optie.naam} (+€${optie.prijs})`, () => {
            toggleAiModule(optie.sleutel, optie.naam, optie.prijs);
        });
    });

    renderChatButton('✅ BEVESTIG MIJN CONFIGURATIE', stuurEindOverzicht);
}

// // DE 5 VRAGEN TRIGGEREN // //
function toonAiUpgradeMenu() {
    renderAiMessage('Selecteer de krachten voor uw AI-werknemer (meerdere keuzes mogelijk):');

    const upgrades = [
        { sleutel: 'ai', naam: 'Hersen-capaciteit', prijs: 799 },
        { sleutel: 'planner', naam: 'Agenda-Beheer', prijs: 149 },
        { sleutel: 'emailAuto', naam: 'Mail-Assistent', prijs: 175 },
        { sleutel: 'factuurKoppeling', naam: 'Factuur-Voorbereiding', prijs: 249 },
        { sleutel: 'crmSysteem', naam: 'Data-Manager', prijs: 199 }
    ];

    upgrades.forEach((optie) => {
        renderChatButton(`${optie.naam} (+€${optie.prijs})`, () => {
            toggleAiModule(optie.sleutel, optie.naam);
            renderAiMessage(`Systeem-update: ${optie.naam} toegevoegd.`);
        });
    });

    renderChatButton('✅ BEVESTIG IMPERIUM', stuurEindOverzicht);
}

function showChatOptions(opties) {
    if (!Array.isArray(opties)) return;

    opties.forEach((optie) => {
        if (!optie?.tekst) return;
        renderChatButton(optie.tekst, () => {
            const actie = typeof optie.action === 'function' ? optie.action : window[optie.action];
            if (typeof actie === 'function') {
                actie();
            } else {
                console.warn(`Actie niet gevonden: ${String(optie.action)}`);
            }
        });
    });
}

// // DE OVERGANG NAAR DE AI-WERKNEMER // //
function toonResultaatEnVraagAI() {
    const basisInvestering = typeof window.totaalPrijs === 'number' ? window.totaalPrijs : currentTotal;

    const introTekst = `// SYSTEEM: Blauwdruk gegenereerd\nBasis Website Indicatie: €${basisInvestering},-\n\nUw digitale basis staat als een huis. Terwijl ik de laatste details verwerk... heeft u nog interesse in een paar korte vragen over de AI-installaties? Dit zijn de turbo-upgrades voor uw bedrijfsvoering.`;

    renderAiMessage(introTekst);

    showChatOptions([
        { tekst: 'JA, leg uit', action: 'toonAiUpgradeMenu' },
        { tekst: 'NEE, bereken totaal', action: 'stuurEindOverzicht' }
    ]);
}

// // HET DEFINITIEVE OVERZICHT // //
function stuurEindOverzicht() {
    const basisPrijs = Object.values(gemaakteKeuzes).reduce((acc, curr) => acc + ((curr && curr.prijs) || 0), 0);
    const aiTotaal = aiWinkelmandje.reduce((acc, curr) => acc + curr.prijs, 0);
    const eindTotaal = basisPrijs + aiTotaal;

    let bericht = 'Uw Imperium is samengesteld! Hier is het overzicht:\n\n';
    bericht += `* Basis Website: €${basisPrijs.toFixed(2)}\n`;

    if (aiWinkelmandje.length > 0) {
        bericht += '* AI-Upgrades:\n';
        aiWinkelmandje.forEach((item) => {
            bericht += `  - ${item.naam}: €${item.prijs.toFixed(2)}\n`;
        });
    }

    bericht += `\n**Totale Investering: €${eindTotaal.toFixed(2)} (Excl. BTW)**\n\n`;
    bericht += 'Zullen we de intake inplannen om uw 1.500 woorden bedrijfslogica vast te leggen?';

    renderAiMessage(bericht);
}

// section // DE BRIDGE TUSSEN STAPPEN EN AI-BREIN
function verstuurConfiguratieNaarAI() {
    const stapNamen = {
        1: 'Type',
        2: 'Look',
        3: 'Grootte',
        4: 'Vulling',
        5: 'Tools',
        6: 'Online'
    };

    let samenvatting = 'De klant heeft de volgende keuzes gemaakt in de TT-Guide:\n';

    Object.keys(gemaakteKeuzes).forEach((stap) => {
        const keuzeData = gemaakteKeuzes[stap];
        if (!keuzeData) return;

        const stapNummer = Number(stap);
        const stapLabel = stapNamen[stapNummer] || `Stap ${stap}`;
        const keuzeNaam = getKeuzeNaam(keuzeData);
        const stapPrijs = (typeof keuzeData === 'object' ? keuzeData.prijs : selectedOptions[`stap${stap}`]) || 0;
        samenvatting += `- ${stapLabel}: ${keuzeNaam} (€${stapPrijs.toFixed(2)})\n`;
    });

    if (aiWinkelmandje.length > 0) {
        samenvatting += '\nAI-Upgrades:\n';
        aiWinkelmandje.forEach((item) => {
            samenvatting += `- ${item.naam} (€${item.prijs.toFixed(2)})\n`;
        });
    }

    samenvatting += `\nHet totaalbedrag is: €${(currentTotal + getAiWinkelmandTotaal()).toFixed(2)} excl. BTW.`;
    systeemConfiguratieContext = samenvatting;

    // Gebruik externe AI-hook als die bestaat, anders alleen interne context verrijken.
    if (window.aiChat && typeof window.aiChat.sendMessageAsSystem === 'function') {
        window.aiChat.sendMessageAsSystem(samenvatting);
    }

    console.log('TT-Guide configuratie is gesynchroniseerd met AI-context.');
}

function syncKeuzesMetStappen() {
    keuzes.type = getKeuzeNaam(gemaakteKeuzes[1]) || keuzes.type;
    keuzes.stijl = getKeuzeNaam(gemaakteKeuzes[2]) || keuzes.stijl;
    keuzes.pagina = getKeuzeNaam(gemaakteKeuzes[3]) || keuzes.pagina;
    keuzes.content = getKeuzeNaam(gemaakteKeuzes[4]) || keuzes.content;
    keuzes.tools = getKeuzeNaam(gemaakteKeuzes[5]) || keuzes.tools;
    keuzes.finish = getKeuzeNaam(gemaakteKeuzes[6]) || keuzes.finish;
}

const CookieManager = {
    set(name, value, days) {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        document.cookie = `${name}=${value};expires=${date.toUTCString()};path=/`;
    },
    get(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) {
            return parts.pop().split(';').shift();
        }
        return null;
    }
};

function renderMessage(text, sender = 'bot') {
    return aiGuide.displayMessage(text, sender);
}

function sendAiMessage(text) {
    return renderMessage(text, 'bot');
}

function checkCookies() {
    const banner = document.getElementById('cookie-banner');
    if (!banner) {
        return;
    }

    const isLocalPreview = window.location.protocol === 'file:' || ['localhost', '127.0.0.1'].includes(window.location.hostname);

    if (!CookieManager.get('tt_privacy_ack') || isLocalPreview) {
        showCookieBanner();
    } else {
        banner.style.display = 'none';
    }
}

function showCookieBanner() {
    const banner = document.getElementById('cookie-banner');
    if (!banner) {
        return;
    }

    banner.style.display = 'block';
    banner.style.bottom = '-300px';
    window.setTimeout(() => {
        banner.style.bottom = '30px';
    }, 250);
}

function acceptCookies() {
    CookieManager.set('tt_privacy_ack', 'true', 30);
    const banner = document.getElementById('cookie-banner');
    if (!banner) {
        return;
    }

    banner.style.bottom = '-300px';

    window.setTimeout(() => {
        banner.style.display = 'none';
    }, 600);

    console.log('TT-DigitalDesign: Cookies geaccepteerd, weg vrijgemaakt.');
}

function closeCookieBanner() {
    const banner = document.getElementById('cookie-banner');
    if (!banner) {
        return;
    }

    banner.style.bottom = '-300px';

    window.setTimeout(() => {
        banner.style.display = 'none';
    }, 600);
}

function getGeminiEndpoint() {
    if (window.location.protocol === 'file:') {
        return 'http://localhost:8888/api/gemini';
    }

    return new URL('/api/gemini', window.location.origin).toString();
}

const announcementText = document.querySelector('.announcement-text');
const glitchChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#$%<>/';
let announcementGlitchTimer;

function setAnnouncementDisplay(text) {
    if (!announcementText) return;

    announcementText.textContent = text;
    announcementText.dataset.text = text;
}

function randomGlitchChar() {
    return glitchChars.charAt(Math.floor(Math.random() * glitchChars.length));
}

function triggerAnnouncementGlitch(originalText) {
    if (!announcementText) return;

    let revealed = 0;
    announcementText.classList.add('is-glitching');

    const burstTimer = setInterval(() => {
        const glitchedText = originalText
            .split('')
            .map((char, index) => {
                if (char === ' ') return ' ';
                if (index < revealed) return originalText[index];
                return randomGlitchChar();
            })
            .join('');

        setAnnouncementDisplay(glitchedText);
        revealed += 2;

        if (revealed >= originalText.length) {
            clearInterval(burstTimer);
            setAnnouncementDisplay(originalText);
            announcementText.classList.remove('is-glitching');
        }
    }, 45);
}

function initializeAnnouncementText() {
    if (!announcementText) return;

    const originalText = announcementText.textContent.trim();
    let visibleLength = 0;

    setAnnouncementDisplay('');

    const typeTimer = setInterval(() => {
        const resolvedText = originalText.slice(0, visibleLength);
        const remainingText = originalText
            .slice(visibleLength, Math.min(originalText.length, visibleLength + 4))
            .split('')
            .map((char) => (char === ' ' ? ' ' : randomGlitchChar()))
            .join('');

        setAnnouncementDisplay(resolvedText + remainingText);
        visibleLength += 1;

        if (visibleLength > originalText.length) {
            clearInterval(typeTimer);
            setAnnouncementDisplay(originalText);
            announcementGlitchTimer = window.setInterval(() => triggerAnnouncementGlitch(originalText), 7000);
        }
    }, 55);
}

const navMenu = document.getElementById('nav-menu');
const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelectorAll('#primary-nav-links a');
let maximaalOntgrendeldeStap = 1;

function isMobieleStapFlow() {
    return window.innerWidth < 768;
}

function updateStapVoortgang(stapNummer) {
    const currentEl = document.getElementById('steps-current');
    const progressFill = document.getElementById('steps-progress-fill');
    const veiligeStap = Math.min(6, Math.max(1, Number(stapNummer) || 1));

    if (currentEl) {
        currentEl.textContent = String(veiligeStap);
    }

    if (progressFill) {
        progressFill.style.width = `${(veiligeStap / 6) * 100}%`;
    }
}

function updateMobieleStapFlow(stapNummer = 1) {
    if (!isMobieleStapFlow()) return;

    const actueleStap = Math.min(6, Math.max(1, Number(stapNummer) || 1));
    const stepItems = document.querySelectorAll('.step-item');

    stepItems.forEach((stepItem, index) => {
        const stepIndex = index + 1;
        stepItem.classList.remove('next-step', 'locked');

        if (stepIndex > maximaalOntgrendeldeStap + 1) {
            stepItem.classList.add('locked');
        }

        if (stepIndex === actueleStap + 1 && stepIndex <= maximaalOntgrendeldeStap + 1 && stepIndex <= 6) {
            stepItem.classList.add('next-step');
        }
    });

    updateStapVoortgang(actueleStap);
}

function initializeStapFlow() {
    updateStapVoortgang(1);

    if (isMobieleStapFlow()) {
        const eersteStap = document.getElementById('step-1');
        if (eersteStap && !document.querySelector('.step-item.active')) {
            eersteStap.classList.add('active');
        }
        updateMobieleStapFlow(1);
    }
}

function setMobileMenuState(isOpen) {
    if (!navMenu || !navToggle) return;

    navMenu.classList.toggle('menu-open', isOpen);
    navToggle.setAttribute('aria-expanded', String(isOpen));
}

if (navMenu && navToggle) {
    navToggle.addEventListener('click', () => {
        const isOpen = navToggle.getAttribute('aria-expanded') === 'true';
        setMobileMenuState(!isOpen);
    });

    navLinks.forEach((link) => {
        link.addEventListener('click', (event) => {
            const targetId = link.getAttribute('href');
            if (!targetId || !targetId.startsWith('#')) {
                setMobileMenuState(false);
                return;
            }

            const targetSection = document.querySelector(targetId);
            if (targetSection) {
                event.preventDefault();
                const announcementHeight = document.querySelector('.announcement-bar')?.offsetHeight || 0;
                const navHeight = navMenu.offsetHeight || 0;
                const offset = announcementHeight + navHeight + 8;
                const targetY = targetSection.getBoundingClientRect().top + window.scrollY - offset;

                window.scrollTo({
                    top: targetY,
                    behavior: 'smooth'
                });
            }

            setMobileMenuState(false);
        });
    });

    window.addEventListener('resize', () => {
        if (window.innerWidth > 700) {
            setMobileMenuState(false);
        }
    });

    window.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            setMobileMenuState(false);
        }
    });
}

// section // 4. TYPING & BERICHTEN
let typingTimer;
function createChatMessage(sender) {
    const chatWindow = document.getElementById('chat-window');
    if (!chatWindow) return null;
    const messageElement = document.createElement('div');
    if (sender === 'bot') {
        messageElement.className = 'message bot-message bot-bericht';
    } else {
        messageElement.className = `message ${sender}-message`;
    }
    chatWindow.appendChild(messageElement);
    // // MENTOR FIX: Alleen scrollen als het stappenplan NIET open is //
    const lastMessage = chatWindow.lastElementChild;
    if (!isStepPlanActive && lastMessage) {
        lastMessage.scrollIntoView({ behavior: 'smooth' });
    }
    return messageElement;
}

function typeText(element, text) {
    return new Promise((resolve) => {
        let index = 0;
        element.textContent = "";
        clearInterval(typingTimer);
        typingTimer = setInterval(() => {
            if (index < text.length) {
                element.textContent += text.charAt(index);
                index++;
                const chatWindow = document.getElementById('chat-window');
                if (chatWindow && !isStepPlanActive) {
                    chatWindow.scrollTop = chatWindow.scrollHeight;
                }
            } else {
                clearInterval(typingTimer);
                resolve();
            }
        }, 25);
    });
}

async function verstuurNaarGemini(bericht) {
    const samengesteldBericht = systeemConfiguratieContext
        ? `${systeemConfiguratieContext}\n\nKlantbericht:\n${bericht}`
        : bericht;

    const response = await fetch(getGeminiEndpoint(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: samengesteldBericht })
    });

    const data = await response.json();
    return data.reply || '';
}

function verstuurEmail(klantNaam, klantEmail, bericht, type = 'sales') {
    const serviceID = 'service_8dd8z15';
    const publicKey = 'WmdbKABruq6DF33lp';

    let templateID;

    if (type === 'support') {
        templateID = 'template_dugtmza';
    } else {
        templateID = 'template_unpav1f';
    }

    const params = {
        name: klantNaam,
        email: klantEmail,
        message: bericht
    };

    if (!window.emailjs) {
        return Promise.resolve(renderMessage('❌ EmailJS is nog niet geladen. Probeer het later opnieuw.', 'bot'));
    }

    return window.emailjs.send(serviceID, templateID, params, publicKey)
        .then((response) => {
            console.log(`Mail succesvol verstuurd als type: ${type}`, response?.status, response?.text);
            if (type === 'support') {
                return renderMessage('✅ Gelukt! Je bericht is direct verzonden naar Tw33ty. Je hoort snel van ons.', 'bot');
            }
            return renderMessage('✅ Uw aanvraag is succesvol verzonden. We nemen snel contact met u op.', 'bot');
        })
        .catch((error) => {
            console.log('FAILED...', error);
            return renderMessage(`❌ Fout: ${error?.text || 'Check je Gmail koppeling in EmailJS'}`, 'bot');
        });
}

function bewaarStapKeuze(bericht) {
    if (keuzes.stap === 1) keuzes.type = bericht;
    if (keuzes.stap === 2) keuzes.pagina = bericht;
    if (keuzes.stap === 3) keuzes.stijl = bericht;
    if (keuzes.stap === 4) keuzes.content = bericht;
    if (keuzes.stap === 5) keuzes.tools = bericht;
    if (keuzes.stap === 6) keuzes.finish = bericht;
}

function berekenBasisIndicatie(huidigeKeuzes) {
    const type = (huidigeKeuzes.type || '').toLowerCase();
    const pagina = (huidigeKeuzes.pagina || '').toLowerCase();
    const tools = (huidigeKeuzes.tools || '').toLowerCase();
    let prijs = PRIJSLIJST.bouw.onePager;

    if (type.includes('kaart') || type.includes('visitekaart')) {
        return `Vanaf €${PRIJSLIJST.bouw.onePager},- voor een compacte digitale kaart of eenvoudige website.`;
    }

    if (pagina.includes('2')) prijs += PRIJSLIJST.bouw.extraPagina;
    if (pagina.includes('3')) prijs += PRIJSLIJST.bouw.extraPagina * 2;
    if (pagina.includes('4')) prijs += PRIJSLIJST.bouw.extraPagina * 3;
    if (pagina.includes('5') || pagina.includes('meerdere')) prijs += PRIJSLIJST.bouw.extraPagina * 4;

    if (type.includes('shop') || tools.includes('betaling')) {
        prijs += PRIJSLIJST.functies.betaalModule + PRIJSLIJST.ai.prijsIndicator;
    }

    if (tools.includes('boeking')) {
        prijs += PRIJSLIJST.functies.afsprakenPlanner;
    }

    if (tools.includes('koppeling') || tools.includes('social')) {
        prijs += PRIJSLIJST.functies.socialFeed;
    }

    if (tools.includes('whatsapp')) {
        prijs += PRIJSLIJST.functies.whatsappKnop;
    }

    if (tools.includes('review')) {
        prijs += PRIJSLIJST.functies.reviewSysteem;
    }

    if (type.includes('shop') || tools.includes('betaling') || tools.includes('boeking')) {
        return `Vanaf €${prijs},- voor een shop of uitgebreid maatwerk met zwaardere functionaliteit.`;
    }

    if (pagina.includes('5') || pagina.includes('meerdere') || tools.includes('koppeling')) {
        return `Vanaf €${prijs},- voor een grotere website met extra pagina's en koppelingen.`;
    }

    return `Vanaf €${prijs},- voor een professionele maatwerk website.`;
}

function toonFinaleOfferte(huidigeKeuzes) {
    const basisIndicatie = berekenBasisIndicatie(huidigeKeuzes);
    // // DE NIEUWE EMPIRE FLOW (KORT & KRACHTIG) // //
const offerteTekst = `// SYSTEEM: Blauwdruk gegenereerd voor ${huidigeKeuzes.type}\n\nBasis Website Indicatie: ${basisIndicatie}\n\nUw digitale basis staat als een huis. Maar wilt u de turbo aanzetten?\nIk kan een "AI-Werknemer" voor u installeren die 24/7 uw zaak beheert, afspraken plant en uw administratie voorbereidt.\n\nZal ik de mogelijkheden van deze AI-installatie aan u laten zien?`;

// // DE BUTTONS DIE EROP VOLGEN // //
// Zorg dat na deze tekst twee buttons verschijnen in je chat:
// Button 1: "JA, leg uit" -> Triggeert toonAiUpgradeMenu()
// Button 2: "NEE, bereken totaal" -> Triggeert stuurEindOverzicht()

    return renderMessage(offerteTekst, 'bot');
}

function verzendFinaleOfferte(klantData) {
    let totaal = 0;
    klantData.opties.forEach((optie) => {
        totaal += TT_CONFIG.prices[optie] || 0;
    });

    const emailParams = {
        from_name: klantData.naam,
        from_email: klantData.email,
        to_email: 'info@tt-digitaldesign.nl',
        message: klantData.visie,
        gekozen_opties: klantData.opties.join(', '),
        totaal_prijs: `€${totaal}`,
        subject: `🚀 Nieuwe Projectaanvraag: ${klantData.naam}`
    };

    if (!window.emailjs) {
        return Promise.resolve(renderMessage('❌ EmailJS is nog niet geladen. Probeer het later opnieuw.', 'bot'));
    }

    return window.emailjs.send('service_8dd8z15', 'template_dugtmza', emailParams, 'WmdbKABruq6DF33lp')
        .then(() => {
            console.log('✅ Offerte succesvol bij de info-mail afgeleverd.');
            renderMessage('Je aanvraag is veilig verzonden naar mijn info-mail! Ik ga direct met je visie aan de slag. Je hoort snel van me.', 'bot');
            localStorage.removeItem('user_flow_data');
        })
        .catch((err) => {
            console.error('❌ EmailJS Fout:', err);
            return renderMessage('Er ging even iets mis met verzenden. Geen zorgen, je kunt me ook direct mailen op info@tt-digitaldesign.nl', 'bot');
        });
}

function checkAutomatisering(klantAntwoord) {
    const antwoord = klantAntwoord.toLowerCase();
    if (antwoord.includes('ja') || antwoord.includes('automat')) {
        keuzes.wachtOpAutomatisering = false;
        keuzes.wachtOpAutomatiseringDetails = true;
        return 'Interessant! Wat zou u precies geautomatiseerd willen hebben in uw onderneming?';
    }

    keuzes.wachtOpAutomatisering = false;
    return '';
}

// section // 5. GEMINI API KOPPELING
async function askGemini(userText) {
    const queryInput = document.getElementById('user-query');
    const logoIndicator = document.getElementById('ai-logo-indicator');
    const inputText = typeof userText === 'string' ? userText.trim() : queryInput?.value.trim();
    if (!inputText) return;

    await renderMessage(inputText, 'user');
    if (queryInput) {
        queryInput.value = "";
    }

    if (supportData.stap === 1) {
        supportData.email = inputText;
        supportData.stap = 2;
        if (queryInput) {
            queryInput.placeholder = 'Omschrijf uw vraag of probleem...';
            queryInput.focus();
        }
        await renderMessage('Bedankt! Wat is uw vraag of probleem? Omschrijf het zo duidelijk mogelijk.', 'bot');
        return;
    }

    if (supportData.stap === 2) {
        supportData.vraag = inputText;
        await renderMessage('Systeem verwerkt uw aanvraag... Een moment.', 'bot');
        await verstuurEmail('Tech Support Aanvraag', supportData.email, supportData.vraag, 'support');
        supportData = { email: '', vraag: '', stap: 0 };
        if (queryInput) {
            queryInput.placeholder = 'Typ hier...';
        }
        return;
    }

    logoIndicator?.classList.add('thinking');

    try {
        if (keuzes.wachtOpAutomatisering) {
            const automatiseringReactie = checkAutomatisering(inputText);
            if (automatiseringReactie) {
                await renderMessage(automatiseringReactie, 'bot');
                return;
            }
        }

        if (keuzes.stap >= 1 && keuzes.stap <= 6) {
            bewaarStapKeuze(inputText);

            if (keuzes.stap < 6) {
                await renderMessage(`Duidelijk! Stap ${keuzes.stap} is genoteerd. Klik nu op de volgende stap om uw blauwdruk te voltooien.`, 'bot');
            } else {
                await toonFinaleOfferte(keuzes);
                keuzes.stap = 0;
                keuzes.wachtOpAutomatisering = true;
                keuzes.wachtOpAutomatiseringDetails = false;
            }

            return;
        }

        const schoneTekst = await verstuurNaarGemini(inputText);
        if (schoneTekst) {
            await renderMessage(schoneTekst, 'bot');
        } else {
            await renderMessage('De gids kan momenteel geen verbinding maken.', 'bot');
        }
    } catch (error) {
        console.error("Fout:", error);
        await renderMessage('Er ging iets mis bij het laden van de AI-gids.', 'bot');
    } finally {
        logoIndicator?.classList.remove('thinking');
    }
}

function selectChoice(stapNummer, waarde, prijsOfEvent, evt) {
    const huidigeStap = document.getElementById(`step-${stapNummer}`);
    if (!huidigeStap) return;

    const explicietePrijs = typeof prijsOfEvent === 'number' ? prijsOfEvent : undefined;
    const eventRef = (typeof prijsOfEvent === 'object' && prijsOfEvent !== null) ? prijsOfEvent : (evt || window.event);
    const clickTarget = eventRef?.target;

    // Visuele feedback voor chip-selectie.
    if (clickTarget?.classList?.contains('chip')) {
        huidigeStap.querySelectorAll('.chip').forEach((chip) => chip.classList.remove('selected'));
        clickTarget.classList.add('selected');
    }

    const keuzePrijs = resolveChoicePrice(stapNummer, waarde, explicietePrijs);
    gemaakteKeuzes[stapNummer] = { naam: waarde, prijs: keuzePrijs };
    selectedOptions[`stap${stapNummer}`] = keuzePrijs;
    currentTotal = Object.values(selectedOptions).reduce((a, b) => a + b, 0);

    syncKeuzesMetStappen();
    updatePrijsUI(stapNummer);
    verstuurConfiguratieNaarAI();

    const inputVeld = document.getElementById('user-query');
    if (inputVeld) {
        const resultaat = Object.values(gemaakteKeuzes)
            .map((item) => getKeuzeNaam(item))
            .filter((v) => v !== '')
            .join(' | ');
        inputVeld.value = resultaat ? `Blauwdruk Aanvraag: ${resultaat}` : '';
    }

    window.setTimeout(() => {
        gaNaarVolgende(stapNummer);
    }, 500);
}

function verwerkPaginaKeuze(selectElement) {
    if (!selectElement) return;

    const geselecteerdeOptie = selectElement.options[selectElement.selectedIndex];
    const paginaLabel = geselecteerdeOptie?.textContent?.trim() || '';
    const paginaPrijs = Number(selectElement.value);

    if (!paginaLabel || !Number.isFinite(paginaPrijs) || paginaPrijs <= 0) {
        return;
    }

    selectChoice(3, paginaLabel, paginaPrijs);
}

function gaNaarVolgende(huidigeStapNummer) {
    const volgendeStap = huidigeStapNummer + 1;
    const volgendeEl = document.getElementById(`step-${volgendeStap}`);

    if (volgendeEl) {
        activeerStap(volgendeStap);
        updateStapVoortgang(volgendeStap);
        return;
    }

    if (huidigeStapNummer === 6) {
        const chatSection = document.getElementById('chat-container');
        if (chatSection && !isStepPlanActive) {
            chatSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            window.setTimeout(() => {
                document.getElementById('user-query')?.focus();
            }, 800);
        }
    }
}

function activeerStap(stapNummer) {
    if (isMobieleStapFlow() && stapNummer > maximaalOntgrendeldeStap + 1) {
        return;
    }

    keuzes.stap = stapNummer;
    keuzes.wachtOpAutomatisering = false;
    keuzes.wachtOpAutomatiseringDetails = false;
    supportData = { email: '', vraag: '', stap: 0 };

    document.querySelectorAll('.step-item').forEach((stepItem) => {
        stepItem.classList.remove('active');
    });

    const activeStep = document.getElementById(`step-${stapNummer}`);
    const berichtTekst = stapPrompts[stapNummer];
    const inputField = document.getElementById('user-query');

    if (activeStep) {
        activeStep.classList.add('active');
    }

    if (stapNummer > maximaalOntgrendeldeStap) {
        maximaalOntgrendeldeStap = stapNummer;
    }

    if (isMobieleStapFlow()) {
        if (activeStep) {
            activeStep.classList.add('slide-in-step');
            window.setTimeout(() => activeStep.classList.remove('slide-in-step'), 260);
        }
        updateMobieleStapFlow(stapNummer);
    } else {
        updateStapVoortgang(stapNummer);
    }

    if (inputField) {
        inputField.value = '';
        inputField.placeholder = berichtTekst || 'Typ hier...';
        inputField.focus();
    }

    if (berichtTekst) {
        renderMessage(berichtTekst, 'bot');
    }
}

// section // 6. HANDLERS & EXPOSURE
function handleKeyPress(event) {
    if (event.key !== 'Enter') return;

    const inputField = document.getElementById('user-query');
    const bericht = inputField?.value || '';

    if (bericht.trim() !== '') {
        askGemini(bericht);
        inputField.value = '';
    }
}

function startTechSupport() {
    startSupportFlow();
}

function startSupportFlow() {
    const inputField = document.getElementById('user-query');
    const chatContainer = document.getElementById('chat-container');

    if (chatContainer && !isStepPlanActive) {
        chatContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
        autoScrollToInfo();
    }

    keuzes.stap = 0;
    keuzes.wachtOpAutomatisering = false;
    keuzes.wachtOpAutomatiseringDetails = false;
    supportData = { email: '', vraag: '', stap: 1 };

    renderMessage('Tech Support geactiveerd. Om u te helpen heb ik eerst uw e-mailadres nodig:', 'bot');

    if (inputField) {
        inputField.value = '';
        inputField.placeholder = 'Typ uw e-mailadres hier...';
        inputField.focus();
    }
}

window.askGemini = askGemini;
window.activeerStap = activeerStap;
window.selectChoice = selectChoice;
window.verwerkPaginaKeuze = verwerkPaginaKeuze;
window.verstuurConfiguratieNaarAI = verstuurConfiguratieNaarAI;
window.toggleAiModule = toggleAiModule;
window.toonUpgradeOpties = toonUpgradeOpties;
window.toonAiUpgradeMenu = toonAiUpgradeMenu;
window.toonResultaatEnVraagAI = toonResultaatEnVraagAI;
window.showChatOptions = showChatOptions;
window.stuurEindOverzicht = stuurEindOverzicht;
window.berekenTotaalEmpire = berekenTotaalEmpire;
window.updateLiveBerekening = updateLiveBerekening;
window.handleKeyPress = handleKeyPress;
window.startTechSupport = startTechSupport;
window.startSupportFlow = startSupportFlow;
window.openStepPlan = openStepPlan;
window.closeStepPlan = closeStepPlan;
window.stapZesKlaar = stapZesKlaar;
window.acceptCookies = acceptCookies;
window.closeCookieBanner = closeCookieBanner;
window.checkCookies = checkCookies;
window.showCookieBanner = showCookieBanner;

function initializeReviewStars() {
    const stars = document.querySelectorAll('.star');
    const statusMessage = document.getElementById('stat-update-msg');

    if (!stars.length || !statusMessage) {
        return;
    }

    stars.forEach((star) => {
        star.addEventListener('click', function () {
            const value = Number(this.getAttribute('data-value'));

            stars.forEach((currentStar) => {
                const currentValue = Number(currentStar.getAttribute('data-value'));
                currentStar.classList.toggle('selected', currentValue <= value);
            });

            statusMessage.innerText = `> SYSTEEM UPDATE: Ervaring opgeslagen als ${value}/5. Impact verwerkt.`;
        });
    });
}

// section // 7. DE ACTIVATIE (Timing)
window.addEventListener('DOMContentLoaded', () => {
    checkCookies();
    initializeReviewStars();
    initializeStapFlow();
    updatePrijsUI(1);
    initializeEmpireScan();
});

window.addEventListener('resize', () => {
    if (!isMobieleStapFlow()) {
        document.querySelectorAll('.step-item').forEach((stepItem) => {
            stepItem.classList.remove('locked', 'next-step', 'slide-in-step');
        });
        return;
    }

    const actieveStap = document.querySelector('.step-item.active');
    const actieveNummer = actieveStap ? Number(actieveStap.id.replace('step-', '')) : 1;
    updateMobieleStapFlow(actieveNummer);
});

window.addEventListener('load', () => {
    const heroLogo = document.querySelector('.hero-logo-main');
    if (heroLogo) {
        heroLogo.style.animationPlayState = 'running';
        console.log('Systeem check: Hero logo dimmer wordt geactiveerd.');
    }

    initializeAnnouncementText();
    // Na 4 seconden scrollen naar de titel
    setTimeout(autoScrollToInfo, 4000);
    // Na 5.5 seconden begint de AI te praten
    setTimeout(() => aiGuide.startGesprek(), 5500);
});
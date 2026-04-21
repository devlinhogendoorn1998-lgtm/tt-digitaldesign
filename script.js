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

const PRIJSLIJST = {
    bouw: {
        onePager: 299,
        extraPagina: 95,
        logoOntwerp: 75,
        seoTurbo: 149,
        privacyCookie: 39
    },
    animatie: {
        scrollAnimaties: 99,
        premiumInteractie: 149,
        lottieMaatwerk: 195
    },
    functies: {
        whatsappKnop: 49,
        socialFeed: 65,
        reviewSysteem: 85,
        afsprakenPlanner: 125,
        betaalModule: 149,
        emailSetup: 45
    },
    ai: {
        installatie: 599,
        extraGeheugen: 75,
        prijsIndicator: 249
    },
    service: {
        onderhoudMaand: 19.95,
        adhocUpdate: 125,
        crashRecovery: 499
    }
};

const TT_CONFIG = {
    prices: {
        onePager: 299, extraPagina: 95, logo: 75, seo: 149, cookies: 39,
        animatie: 99, interactie: 149, lottie: 195,
        whatsapp: 49, insta: 65, reviews: 85, planner: 125, betaal: 149, email: 45,
        ai: 599, aiExtra: 75, aiCalc: 249
    },
    colors: { primary: '#00ffcc' }
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
        link.addEventListener('click', () => setMobileMenuState(false));
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
    chatWindow.scrollTop = chatWindow.scrollHeight;
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
                if (chatWindow) chatWindow.scrollTop = chatWindow.scrollHeight;
            } else {
                clearInterval(typingTimer);
                resolve();
            }
        }, 25);
    });
}

async function verstuurNaarGemini(bericht) {
    const response = await fetch(getGeminiEndpoint(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: bericht })
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
    const offerteTekst = `// SYSTEEM: Blauwdruk gegenereerd voor ${huidigeKeuzes.type}\n\nBasis Website Indicatie: ${basisIndicatie}\n\nUw digitale basis staat als een huis. Maar wilt u een stap verder?\nU kunt deze website upgraden met een "AI-Werknemer" Installatie.\n\nWat doet deze werknemer voor u?\n* Onthoudt 1.500 specifieke feiten over uw bedrijf (door u aangeleverd).\n* Plant zelfstandig afspraken in met uw klanten.\n* Bereidt uw facturatie voor (klaar voor copy-paste).\n\nInvestering in uw nieuwe werknemer:\n- Optie A: €599,- eenmalig + €20,- p/m (Altijd scherp en up-to-date).\n- Optie B: €899,- eenmalig (Zonder maandelijkse ondersteuning).\n\nExtra geheugen nodig? Voor €199,- voegen we 1.000 extra woorden aan kennis toe.\n\nU behoudt altijd de eindcontrole en geeft goedkeuring voor elke afspraak en factuur.\nZal ik kijken of er nog plek is in uw team voor deze installatie?`;

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

function activeerStap(stapNummer) {
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

    if (chatContainer) {
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
window.handleKeyPress = handleKeyPress;
window.startTechSupport = startTechSupport;
window.startSupportFlow = startSupportFlow;
window.acceptCookies = acceptCookies;
window.closeCookieBanner = closeCookieBanner;
window.checkCookies = checkCookies;
window.showCookieBanner = showCookieBanner;

// section // 7. DE ACTIVATIE (Timing)
window.addEventListener('DOMContentLoaded', () => {
    checkCookies();
});

window.addEventListener('load', () => {
    initializeAnnouncementText();
    // Na 4 seconden scrollen naar de titel
    setTimeout(autoScrollToInfo, 4000);
    // Na 5.5 seconden begint de AI te praten
    setTimeout(() => aiGuide.startGesprek(), 5500);
});
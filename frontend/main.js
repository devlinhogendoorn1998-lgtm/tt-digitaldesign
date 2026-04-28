// // Sectie: TT-DigitalDesign Universele Logica

// 1. Configuatie & Geschiedenis
const API_URL = window.location.hostname === "localhost" ? "http://localhost:3000/chat" : "https://tt-digitaldesign.onrender.com/chat";
if (typeof window.chatHistory === 'undefined') { window.chatHistory = []; }

// 2. EmailJS Initialisatie
(function() {
    emailjs.init("WmdbKABruq6DF33lp"); 
})();

// 3. Hamburger Menu Logica (Ongewijzigd)
function toggleMenu() {
    const navLinks = document.getElementById('navLinks');
    const hamburger = document.querySelector('.hamburger');
    navLinks.classList.toggle('active');
    hamburger.classList.toggle('active');
    if (navLinks.classList.contains('active')) {
        setTimeout(() => { document.addEventListener('mousedown', closeMenuOnClickOutside); }, 10);
    } else {
        document.removeEventListener('mousedown', closeMenuOnClickOutside);
    }
}

function closeMenuOnClickOutside(e) {
    const navLinks = document.getElementById('navLinks');
    const hamburger = document.querySelector('.hamburger');
    if (!navLinks.contains(e.target) && !hamburger.contains(e.target)) {
        navLinks.classList.remove('active');
        hamburger.classList.remove('active');
        document.removeEventListener('mousedown', closeMenuOnClickOutside);
    }
}

// 4. Pakket Selectie (Nieuwe koppeling voor je knoppen)
window.selectPackage = function(pakketNaam) {
    const guideSection = document.getElementById('tt-guide');
    if (guideSection) guideSection.scrollIntoView({ behavior: 'smooth' });
    
    // Verzend een systeem-bericht naar de bot
    window.handleSendMessage(`SYSTEEM: Klant heeft gekozen voor pakket: ${pakketNaam}. Bevestig dit en vraag naar design/kleuren.`);
};

// 5. De TT-Guide Core Logica (Verzenden & Ontvangen)
window.handleSendMessage = async function(customMessage = null) {
    const input = document.getElementById('user-input');
    const message = customMessage || (input ? input.value.trim() : "");

    if (message !== "") {
        // UI: Toon bericht (als het een systeem-pakket is, toon dit netter)
        const displayLabel = customMessage && customMessage.includes("SYSTEEM") ? "Pakket selectie geactiveerd" : message;
        appendMessage('user', displayLabel);
        
        if (input) input.value = "";
        window.chatHistory.push({ role: "user", content: message });

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ history: window.chatHistory }),
            });
            const data = await response.json();
            if (data.reply) {
                appendMessage('ai', data.reply);
                window.chatHistory.push({ role: "assistant", content: data.reply });
                
                // Trigger goudkleurige gloed bij afronding
                if (data.reply.includes("samenvatting") || data.reply.includes("klaar")) {
                    const triggerZone = document.getElementById('license-trigger-zone');
                    if (triggerZone) triggerZone.style.boxShadow = "0 0 20px #ffd700";
                }
            }
        } catch (e) {
            appendMessage('ai', "De Guide is momenteel offline op Render. Wacht even tot hij wakker wordt (50 sec).");
        }
    }
};

// 6. UI: Berichten toevoegen
function appendMessage(role, text) {
    const chatWindow = document.getElementById('chat-window');
    if (!chatWindow) return;
    const msg = document.createElement('div');
    msg.style.margin = '10px 0';
    msg.style.padding = '12px';
    msg.style.background = role === 'user' ? 'rgba(255,255,255,0.1)' : 'rgba(0,242,255,0.05)';
    msg.style.borderRadius = '10px';
    msg.style.alignSelf = role === 'user' ? 'flex-end' : 'flex-start';
    msg.innerHTML = `<p style="margin:0; color:#fff; font-size:0.9rem;">${text}</p>`;
    chatWindow.appendChild(msg);
    chatWindow.scrollTop = chatWindow.scrollHeight;
}

// 7. Licentie & Mail Functies (Ongewijzigd)
window.toggleLicentie = function() {
    const modal = document.getElementById('licentie-modal');
    if (!modal) return;
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
};

// Sluit de licentie-modal als je buiten klikt of op Escape
document.addEventListener('mousedown', function(e) {
    const modal = document.getElementById('licentie-modal');
    if (modal && modal.style.display === 'flex') {
        const inner = modal.firstElementChild;
        if (inner && !inner.contains(e.target)) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    }
});
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        const modal = document.getElementById('licentie-modal');
        if (modal && modal.style.display === 'flex') {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    }
});

window.sendEmpireMail = function(statusAccepteer) {
    const chatLog = window.chatHistory.map(m => `${m.role}: ${m.content}`).join('\n\n');
    const templateParams = {
        status: statusAccepteer ? "GEACCEPTEERD" : "GEWEIGERD",
        message: chatLog,
        reply_to: "Klant via TT-Guide"
    };

    emailjs.send('service_8dd8z15', 'template_unpav1f', templateParams)
        .then(() => alert("Empire Data verzonden naar Tw33ty!"), (err) => console.log("Mail fout:", err));
};

// 8. Kaart Details Toggle
window.toggleFeatures = function(btn) {
    const dropdown = btn.parentElement.querySelector('.card-features-dropdown');
    if (!dropdown) return;
    const isOpen = dropdown.style.display === 'block';
    dropdown.style.display = isOpen ? 'none' : 'block';
    btn.innerText = isOpen ? 'Toon details ▼' : 'Verberg details ▲';
};

// 9. Event Listeners
document.addEventListener('keypress', function (e) {
    if (e.key === 'Enter' && e.target.id === 'user-input') {
        window.handleSendMessage();
    }
});
// // Sectie: Automatische Licentie Trigger
window.handleSendMessage = async function(customMessage = null) {
    // ... (bestaande code voor verzenden) ...

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ history: window.chatHistory }),
        });
        const data = await response.json();
        
        if (data.reply) {
            appendMessage('ai', data.reply);
            window.chatHistory.push({ role: "assistant", content: data.reply });

            // DE TRIGGER: Als de AI [LICENTIE_CHECK] stuurt, open de pop-up
            if (data.reply.includes("[LICENTIE_CHECK]")) {
                setTimeout(() => {
                    window.toggleLicentie(); // Opent de modal automatisch
                }, 1500); // Wacht 1.5 seconde zodat de klant de tekst eerst kan lezen
            }
        }
    } catch (e) {
        appendMessage('ai', "De Guide is even offline.");
    }
};
// // Sectie: Alles-in-één Activatie
window.selectPackage = function(pakketNaam) {
    // 1. Open het Add-on menu aan de linkerkant
    const addonMenu = document.getElementById('addon-menu');
    if (addonMenu) addonMenu.style.display = 'block';

    // 2. Klap ALLE pakket details open (zodat ze kunnen vergelijken)
    document.querySelectorAll('.card-features-dropdown').forEach(dropdown => {
        dropdown.style.display = 'block';
    });

    // 3. Scroll naar de TT-Guide
    const guideSection = document.getElementById('tt-guide');
    if (guideSection) guideSection.scrollIntoView({ behavior: 'smooth' });

    // 4. Stuur bericht naar de bot
    window.handleSendMessage(`SYSTEEM: Klant kiest ${pakketNaam}. Toon de upgrades en vraag naar hun visie.`);
};
document.addEventListener("DOMContentLoaded", () => {
    const banner = document.getElementById("cookie-banner");
    const acceptBtn = document.getElementById("cookie-accept");

    if (!localStorage.getItem("user_privacy_confirmed")) {
        setTimeout(() => {
            banner.classList.add("active");
        }, 1000);
    }

    acceptBtn.addEventListener("click", () => {
        localStorage.setItem("user_privacy_confirmed", "true");
        banner.classList.remove("active");
        console.log("Privacy-instellingen: Gegevens worden 30 dagen beveiligd opgeslagen.");
    });
});
let chatHistory = []; // Houdt het gesprek levend

document.addEventListener('DOMContentLoaded', function() {
    const contactLink = document.getElementById('contact-nav-link');
    const chatWindow = document.getElementById('chat-window');

    if (contactLink && chatWindow) {
        contactLink.addEventListener('click', function(e) {
            e.preventDefault();
            // Scroll naar je chatsectie
            document.getElementById('tt-guide').scrollIntoView({behavior: 'smooth'});

            setTimeout(() => {
                chatWindow.innerHTML = '';
                const vraagDiv = document.createElement('div');
                vraagDiv.className = 'ttd-guide-question';
                vraagDiv.innerHTML = `
                    <p>Waarmee kunnen we u helpen?</p>
                    <button class="btn-main" id="btn-website">Website laten maken</button>
                    <button class="btn-main" id="btn-support">Tech Support</button>
                `;
                chatWindow.appendChild(vraagDiv);

                // --- TECH SUPPORT LOGICA ---
                document.getElementById('btn-support').onclick = function() {
                    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
                    let supportDiv = document.createElement('div');
                    supportDiv.className = 'ttd-guide-answer';
                    
                    if (isMobile) {
                        supportDiv.innerHTML = '<a href="tel:+31614717444" class="btn-main" style="display:inline-block;margin-top:12px;">BEL NU: +31 6 14717444</a>';
                    } else {
                        // Alleen nummer tonen op desktop zoals gevraagd
                        supportDiv.innerHTML = '<div style="margin-top:12px;font-size:1.3rem;font-weight:bold;color:#ff9100;">BEL: +31 6 14717444</div>';
                    }
                    chatWindow.appendChild(supportDiv);
                };

                // --- WEBSITE MAKEN (AI TRIGGER) ---
                document.getElementById('btn-website').onclick = function() {
                    chatWindow.innerHTML = '<div class="ttd-guide-answer">De TT-Guide start op...</div>';
                    // We sturen het eerste bericht naar JOUW werkende /chat route
                    stuurBerichtNaarAI("Ik wil een website laten maken. Start het protocol.");
                };
            }, 400);
        });
    }
});

// Sectie: De verbinding met je Render API
async function stuurBerichtNaarAI(bericht) {
    const chatWindow = document.getElementById('chat-window');
    chatHistory.push({ role: "user", content: bericht });

    try {
        // Omdat je op Render zit en je frontend/backend gekoppeld zijn, werkt '/chat' direct
        const response = await fetch('/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ history: chatHistory })
        });

        const data = await response.json();
        chatHistory.push({ role: "assistant", content: data.reply });

        // Toon het antwoord van de AI
        const replyDiv = document.createElement('div');
        replyDiv.className = 'ttd-guide-answer';
        replyDiv.innerHTML = `<p>${data.reply}</p>`;
        chatWindow.appendChild(replyDiv);

        // Voeg direct een inputveld toe zodat de klant kan antwoorden
        maakInputVeld();
    } catch (error) {
        console.error("AI-fout:", error);
    }
}

function maakInputVeld() {
    const chatWindow = document.getElementById('chat-window');
    // Verwijder oude input als die er nog staat
    const oudeInput = document.getElementById('ai-input-container');
    if (oudeInput) oudeInput.remove();

    const container = document.createElement('div');
    container.id = 'ai-input-container';
    container.style.marginTop = "15px";
    container.innerHTML = `
        <input type="text" id="user-reply" placeholder="Typ uw bericht..." style="width:70%; padding:10px;">
        <button id="send-reply" class="btn-main" style="width:25%;">Verstuur</button>
    `;
    chatWindow.appendChild(container);

    document.getElementById('send-reply').onclick = function() {
        const tekst = document.getElementById('user-reply').value;
        if (tekst) {
            stuurBerichtNaarAI(tekst);
        }
    };
}
function EmpireSelectieVerzenden() {
    // 1. Zoek het gekozen pakket
    const gekozenPakket = document.querySelector('input[name="pakket-keuze"]:checked');
    
    // 2. Zoek alle aangevinkte upgrades
    const upgrades = document.querySelectorAll('.upgrade-cb:checked');
    
    if (!gekozenPakket) {
        alert("Selecteer eerst een basispakket (The Digital Card, ULTIMATE of Masterplan)!");
        return;
    }

    let upgradeLijst = [];
    upgrades.forEach(up => upgradeLijst.push(up.value));

    // 3. Bouw het bericht
    let empireBericht = `Ik heb mijn Empire geconfigureerd:
    BASIS PAKKET: ${gekozenPakket.value}`;

    if (upgradeLijst.length > 0) {
        empireBericht += `\nGEKOZEN UPGRADES: ${upgradeLijst.join(', ')}`;
    } else {
        empireBericht += `\nGEEN EXTRA UPGRADES GEKOZEN.`;
    }

    empireBericht += `\n\nTT-Guide, start het protocol voor deze configuratie.`;

    // 4. Stuur naar de chat en de AI
    document.getElementById('tt-guide').scrollIntoView({ behavior: 'smooth' });

    setTimeout(() => {
        const chatWindow = document.getElementById('chat-window');
        chatWindow.innerHTML += `<div class="ttd-guide-answer" style="border-left: 3px solid #ffd700;"><strong>SYSTEEM:</strong> Configuratie verzonden...</div>`;
        
        // Jouw bestaande functie die de fetch naar Render doet
        stuurBerichtNaarAI(empireBericht);
    }, 600);
}
// 1. CONFIGURATIE & GLOBALS
const API_URL = window.location.hostname === "localhost" ? "http://localhost:3000/chat" : "/chat";
if (typeof window.chatHistory === 'undefined') { window.chatHistory = []; }

// 2. INITIALISATIE (EmailJS & Cookie Banner)
(function() { emailjs.init("WmdbKABruq6DF33lp"); })();

document.addEventListener("DOMContentLoaded", () => {
    const banner = document.getElementById("cookie-banner");
    const acceptBtn = document.getElementById("cookie-accept");
    if (!localStorage.getItem("user_privacy_confirmed")) {
        setTimeout(() => { if(banner) banner.classList.add("active"); }, 1000);
    }
    if(acceptBtn) {
        acceptBtn.addEventListener("click", () => {
            localStorage.setItem("user_privacy_confirmed", "true");
            banner.classList.remove("active");
        });
    }
});

// 3. NAVIGATION & MENU
function toggleMenu() {
    const navLinks = document.getElementById('navLinks');
    const hamburger = document.querySelector('.hamburger');
    navLinks.classList.toggle('active');
    hamburger.classList.toggle('active');
    if (navLinks.classList.contains('active')) {
        setTimeout(() => { document.addEventListener('mousedown', closeMenuOnClickOutside); }, 10);
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

// 4. EMPIRE CONFIGURATIE & PAKKET SELECTIE
window.EmpireSelectieVerzenden = function() {
    const gekozenPakket = document.querySelector('input[name="pakket-keuze"]:checked');
    const upgrades = document.querySelectorAll('.upgrade-cb:checked');
    if (!gekozenPakket) { alert("Selecteer eerst een basispakket!"); return; }

    let upgradeLijst = [];
    upgrades.forEach(up => upgradeLijst.push(up.value));

    let empireBericht = `SYSTEEM-CONFIGURATIE:
    BASIS: ${gekozenPakket.value}
    UPGRADES: ${upgradeLijst.length > 0 ? upgradeLijst.join(', ') : 'Geen'}.
    INSTRUCTIE: Bevestig dit en start direct met STAP 1 (Bedrijfsnaam). Stel GEEN andere vraag.`;

    document.getElementById('tt-guide').scrollIntoView({ behavior: 'smooth' });
    const chatWindow = document.getElementById('chat-window');
    chatWindow.innerHTML = `<div class="ttd-guide-answer" style="border-left:3px solid #ffd700;"><strong>SYSTEEM:</strong> Configuratie verzonden naar de Guide...</div>`;
    
    stuurBerichtNaarAI(empireBericht);
};

// 5. CORE AI VERBINDING (Fetch & History)
async function stuurBerichtNaarAI(bericht) {
    const inputVeld = document.getElementById('user-input');
    window.chatHistory.push({ role: "user", content: bericht });

    if (!bericht.includes("SYSTEEM-CONFIGURATIE")) {
        appendMessage('user', bericht);
    }

    if(inputVeld) inputVeld.value = ""; // Maak jouw HTML input leeg

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ history: window.chatHistory })
        });

        const data = await response.json();
        if (data.reply) {
            window.chatHistory.push({ role: "assistant", content: data.reply });
            appendMessage('ai', data.reply);

            if (data.reply.includes("[LICENTIE_CHECK]")) {
                setTimeout(() => { window.toggleLicentie(); }, 1500);
            }
        }
    } catch (error) {
        appendMessage('ai', "De Guide is momenteel aan het opstarten op de server (50 sec)...");
    }
}

// 6. UI: CHAT DISPLAY (Gekoppeld aan jouw HTML ID's)
window.handleSendMessage = function() {
    const input = document.getElementById('user-input');
    const bericht = input ? input.value.trim() : "";
    if (bericht !== "") {
        stuurBerichtNaarAI(bericht);
    }
};

function appendMessage(role, text) {
    const chatWindow = document.getElementById('chat-window');
    if (!chatWindow) return;
    const msg = document.createElement('div');
    msg.style.margin = '10px 0';
    msg.style.padding = '12px';
    if (role === 'user') {
        msg.style.background = 'linear-gradient(90deg,#00f2ff33,#ffd70033)';
        msg.style.color = '#101820';
        msg.style.textAlign = 'right';
        msg.innerHTML = `<p style="margin:0; color:#101820; font-size:0.98rem; font-weight:600;">${text}</p>`;
        msg.style.alignSelf = 'flex-end';
        msg.style.boxShadow = '0 2px 12px #00f2ff22';
    } else {
        msg.style.background = 'rgba(0,242,255,0.08)';
        msg.style.color = '#fff';
        msg.innerHTML = `<p style=\"margin:0; color:#fff; font-size:0.95rem;\">${text}</p>`;
        msg.style.alignSelf = 'flex-start';
    }
    msg.style.borderRadius = '10px';
    chatWindow.appendChild(msg);
    chatWindow.scrollTop = chatWindow.scrollHeight;
}

// 7. EXTERNE TRIGGERS (Licentie, Features, Mail)
window.toggleLicentie = function() {
    const modal = document.getElementById('licentie-modal');
    if (modal) { modal.style.display = 'flex'; document.body.style.overflow = 'hidden'; }
};

window.sendEmpireMail = function(statusAccepteer) {
    const chatLog = window.chatHistory.map(m => `${m.role}: ${m.content}`).join('\n\n');
    emailjs.send('service_8dd8z15', 'template_unpav1f', {
        status: statusAccepteer ? "GEACCEPTEERD" : "GEWEIGERD",
        message: chatLog
    }).then(() => alert("Empire Data verzonden naar Tw33ty!"));
};

window.toggleFeatures = function(btn) {
    const dropdown = btn.parentElement.querySelector('.card-features-dropdown');
    if (!dropdown) return;
    const isOpen = dropdown.style.display === 'block';
    dropdown.style.display = isOpen ? 'none' : 'block';
    btn.innerText = isOpen ? 'Toon details ▼' : 'Verberg details ▲';
};

// 8. EVENT LISTENERS
document.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && e.target.id === 'user-input') {
        window.handleSendMessage();
    }
});
// Privacy Modal Toggle - Empire Protocol
window.togglePrivacyModal = function() {
    const modal = document.getElementById('privacy-modal');
    if (!modal) return;

    // Check of hij al open staat
    const isActive = modal.classList.contains('active');

    if (!isActive) {
        modal.classList.add('active');
        modal.style.display = 'flex'; // Zorg dat hij zichtbaar wordt
        document.body.style.overflow = 'hidden'; // Stop scrollen op achtergrond
        
        // Sluiten als je op de donkere achtergrond klikt
        modal.onclick = function(e) {
            if (e.target === modal) togglePrivacyModal();
        };
    } else {
        modal.classList.remove('active');
        modal.style.display = 'none';
        document.body.style.overflow = ''; // Weer kunnen scrollen
    }
};
// Sectie: TT-Guide Logica
const guideBoodschap = "Ik ben TT-Guide. U wilt een indicatie van uw website? Laten we samenstellen wat u wilt!";
const typeSnelheid = 40; // Iets sneller voor een vlottere 'AI' ervaring

function ttGuideTypt(tekst, elementId) {
    let i = 0;
    const element = document.getElementById(elementId);
    if (!element) return;

    element.innerHTML = ""; // Reset de tekst van TT-Guide

    function typen() {
        if (i < tekst.length) {
            element.innerHTML += tekst.charAt(i);
            i++;
            setTimeout(typen, typeSnelheid);
        }
    }
    typen();
}

// Koppelen aan je hamburger-menu link
document.getElementById('contact-nav-link').addEventListener('click', function(e) {
    e.preventDefault();

    // Menu sluiten als het open staat
    if (typeof toggleMenu === "function") {
        const navLinks = document.getElementById('navLinks');
        if (navLinks.classList.contains('active')) {
            toggleMenu();
        }
    }

    // TT-Guide start met typen in de sectie
    ttGuideTypt(guideBoodschap, "ai-typing-text");

    // Soepele scroll naar de TT-Guide sectie
    const target = document.getElementById('tt-guide');
    if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
    }
});
// Sectie: TT-Guide Auto-start Logica
window.addEventListener('load', () => {
    // Check of de URL eindigt op #tt-guide
    if (window.location.hash === '#tt-guide') {
        
        // Geef de pagina heel even de tijd om te stabiliseren
        setTimeout(() => {
            const guideBericht = "TT-Guide herstart... Welkom terug. Ik ben de TT-Guide. Laten we uw empire samenstellen!";
            
            // Roep je bestaande type-functie aan
            if (typeof ttGuideTypt === "function") {
                ttGuideTypt(guideBericht, "ai-typing-text");
            }
        }, 1000); // 1 seconde vertraging voor een soepele ervaring
    }
});
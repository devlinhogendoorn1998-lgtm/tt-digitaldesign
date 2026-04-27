// Hamburger Menu: open/close + klik buiten sluit (ook desktop)
function toggleMenu() {
    const navLinks = document.getElementById('navLinks');
    const hamburger = document.querySelector('.hamburger');
    navLinks.classList.toggle('active');
    hamburger.classList.toggle('active');
    if (navLinks.classList.contains('active')) {
        setTimeout(() => {
            document.addEventListener('mousedown', closeMenuOnClickOutside);
        }, 10);
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

// Sluit menu bij klik op een link (ook desktop)
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        const navLinks = document.getElementById('navLinks');
        const hamburger = document.querySelector('.hamburger');
        navLinks.classList.remove('active');
        hamburger.classList.remove('active');
        document.removeEventListener('mousedown', closeMenuOnClickOutside);
    });
});
{
    // 1. Chat History veiligstellen
    if (typeof window.chatHistory === 'undefined') {
        window.chatHistory = [];
    }

    // 2. Hamburger Menu
    window.toggleMenu = function() {
        const navLinks = document.getElementById('navLinks');
        if (navLinks) navLinks.classList.toggle('active');
    };

    // 3. Licentie Modal
    window.toggleLicentie = function() {
        const modal = document.getElementById('licentie-modal');
        if (!modal) return;
        const isFlex = modal.style.display === 'flex';
        modal.style.display = isFlex ? 'none' : 'flex';
        document.body.style.overflow = isFlex ? 'auto' : 'hidden';
    };

    // 4. De TT-Guide Logica
    window.handleSendMessage = async function(customMessage = null) {
        const inputField = document.getElementById('user-input');
        const message = customMessage || (inputField ? inputField.value.trim() : "");

        if (message !== "") {
            // UI Update
            appendMessage('user', customMessage ? "Systeem: Pakket selectie geactiveerd." : message);
            if (inputField) inputField.value = "";
            
            window.chatHistory.push({ role: "user", content: message });

            try {
                const response = await fetch('http://localhost:3000/chat', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ history: window.chatHistory }),
                });
                const data = await response.json();
                if (data.reply) {
                    appendMessage('ai', data.reply);
                    window.chatHistory.push({ role: "assistant", content: data.reply });
                }
            } catch (error) {
                appendMessage('ai', "De Guide is offline. Start je server (node server.js)!");
            }
        }
    };

    // 5. De Kaart-Activator
    window.openTTGuide = function(pakket, prijs) {
        const guideSection = document.getElementById('tt-guide');
        if (guideSection) guideSection.scrollIntoView({ behavior: 'smooth' });
        window.handleSendMessage(`Ik kies voor ${pakket} van ${prijs}.`);
    };

    // 6. UI: Berichten toevoegen
    function appendMessage(role, text) {
        const chatWindow = document.getElementById('chat-window');
        if (!chatWindow) return;
        const msgDiv = document.createElement('div');
        msgDiv.style.margin = '10px 0';
        msgDiv.style.padding = '12px';
        msgDiv.style.background = role === 'user' ? 'rgba(255,255,255,0.1)' : 'rgba(0,242,255,0.05)';
        msgDiv.style.borderRadius = '10px';
        msgDiv.style.alignSelf = role === 'user' ? 'flex-end' : 'flex-start';
        msgDiv.innerHTML = `<p style="margin:0; color:#fff;">${text}</p>`;
        chatWindow.appendChild(msgDiv);
        chatWindow.scrollTop = chatWindow.scrollHeight;
    }

    // 7. Event Listener (Direct op het element, geen globale const)
    document.addEventListener('keypress', function (e) {
        if (e.key === 'Enter' && e.target.id === 'user-input') {
            window.handleSendMessage();
        }
    });

    // 8. Kaart Details Toggle
    window.toggleFeatures = function(btn) {
        const dropdown = btn.parentElement.querySelector('.card-features-dropdown');
        if (!dropdown) return;
        const isOpen = dropdown.style.display === 'block';
        document.querySelectorAll('.card-features-dropdown').forEach(el => el.style.display = 'none');
        dropdown.style.display = isOpen ? 'none' : 'block';
        btn.innerText = isOpen ? 'Toon details ▼' : 'Verberg details ▲';
    };
}
{
    // 1. Initialiseer EmailJS
    (function() {
        emailjs.init("WmdbKABruq6DF33lp"); // Jouw Public Key
    })();

    if (typeof chatHistory === 'undefined') {
        var chatHistory = [];
    }

    // 2. Mail Functie (EmailJS)
    window.sendEmpireMail = function(statusAccepteer) {
        // We maken één lange tekst van het gesprek voor de mail
        const chatLog = chatHistory.map(m => `${m.role}: ${m.content}`).join('\n\n');
        
        const templateParams = {
            status: statusAccepteer ? "GEACCEPTEERD" : "GEWEIGERD",
            message: chatLog,
            reply_to: "Klant via TT-Guide"
        };

        emailjs.send('service_8dd8z15', 'template_unpav1f', templateParams)
            .then(function() {
                alert("Empire Data verzonden naar Tw33ty!");
            }, function(error) {
                console.log("Mail fout:", error);
            });
    };

    // 3. De Dubbele Bevestiging (Licentie)
    window.toggleLicentie = function() {
        const confirmDeal = confirm("Gaat u akkoord met de Gebruikslicentie en Voorwaarden van TT-DigitalDesign? Dit is vereist om uw Empire gegevens door te sturen.");
        
        if (confirmDeal) {
            appendMessage('ai', "Licentie geaccepteerd. Ik stuur de gegevens nu door naar Devlin.");
            window.sendEmpireMail(true);
        } else {
            appendMessage('ai', "U heeft de voorwaarden geweigerd. Ik zal dit rapporteren.");
            window.sendEmpireMail(false);
        }
    };

    // 4. Chat Logica (Bestaand, maar gekoppeld)
    window.handleSendMessage = async function(customMessage = null) {
        const input = document.getElementById('user-input');
        const message = customMessage || (input ? input.value.trim() : "");

        if (message !== "") {
            appendMessage('user', message);
            if (input) input.value = "";
            chatHistory.push({ role: "user", content: message });

            try {
                const response = await fetch('http://localhost:3000/chat', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ history: chatHistory }),
                });
                const data = await response.json();
                if (data.reply) {
                    appendMessage('ai', data.reply);
                    chatHistory.push({ role: "assistant", content: data.reply });
                    
                    // Als de AI zegt dat hij klaar is, de mail triggeren
                    if (data.reply.includes("samenvatting") || data.reply.includes("klaar")) {
                        document.getElementById('license-trigger-zone').style.boxShadow = "0 0 20px #ffd700";
                    }
                }
            } catch (e) {
                appendMessage('ai', "De Guide is offline. Start 'node server.js'.");
            }
        }
    };

    function appendMessage(role, text) {
        const window = document.getElementById('chat-window');
        if (!window) return;
        const msg = document.createElement('div');
        msg.style.padding = '12px';
        msg.style.background = role === 'user' ? 'rgba(255,255,255,0.1)' : 'rgba(0,242,255,0.05)';
        msg.style.borderRadius = '10px';
        msg.style.alignSelf = role === 'user' ? 'flex-end' : 'flex-start';
        msg.innerHTML = `<p style="margin:0; color:#fff; font-size:0.9rem;">${text}</p>`;
        window.appendChild(msg);
        window.scrollTop = window.scrollHeight;
    }
}
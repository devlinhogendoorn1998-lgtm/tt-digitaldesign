// ── TT Digital Design — AI Chatbot + Lead E-mail ─────────────────────────────
// Verbindt met de Render.com backend via /api/chat
// Detecteert [VRAAG_EMAIL] signaal en toont email-formulier in de chat
// Bij versturen: stuurt gespreksamenvatting via EmailJS naar Devlin
// ─────────────────────────────────────────────────────────────────────────────

const RENDER_URL = 'https://tt-digitaldesign.onrender.com/api/chat';

// EmailJS — zelfde service als de rest van de site
const EMAILJS_SERVICE  = 'service_8dd8z15';
const EMAILJS_TEMPLATE = 'template_dugtmza';
const EMAILJS_PUBKEY   = 'WmdbKABruq6DF33lp';

let chatHistory     = [];
let emailFormActief = false; // Zorgt dat het formulier maar één keer verschijnt

document.addEventListener('DOMContentLoaded', function () {
    emailjs.init({ publicKey: EMAILJS_PUBKEY });

    const input    = document.getElementById('chat-input');
    const sendBtn  = document.getElementById('chat-send');
    const messages = document.getElementById('chat-messages');

    if (!input || !sendBtn || !messages) return;

    // ── Verstuur via knop of Enter ───────────────────────────────────────────
    sendBtn.addEventListener('click', verzendBericht);
    input.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            verzendBericht();
        }
    });

    // ── Hoofd-functie: stuur bericht naar backend ────────────────────────────
    async function verzendBericht() {
        const tekst = input.value.trim();
        if (!tekst || sendBtn.disabled) return;

        voegBerichtToe('user', tekst);
        chatHistory.push({ role: 'user', content: tekst });
        input.value = '';
        sendBtn.disabled = true;

        const typingId = voegTypingToe();

        try {
            const response = await fetch(RENDER_URL, {
                method:  'POST',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify({ messages: chatHistory }),
                signal:  AbortSignal.timeout(15000)
            });

            verwijderTyping(typingId);

            if (!response.ok) {
                const err = await response.json().catch(() => ({}));
                throw new Error(err.error || 'Server fout');
            }

            const data = await response.json();
            let reply  = data.reply || 'Geen antwoord ontvangen.';

            // ── Detecteer lead-signaal van de AI ─────────────────────────────
            const vraagEmail = reply.includes('[VRAAG_EMAIL]');
            reply = reply.replace('[VRAAG_EMAIL]', '').trim();

            // Sla op in history zonder kaart-JSON (houdt context klein)
            const replyVoorHistory = reply.replace(/\[KAART\][\s\S]*?\[\/KAART\]/g, '[pakket getoond]');
            chatHistory.push({ role: 'assistant', content: replyVoorHistory });

            // Render tekst én visuele kaarten
            renderAntwoord(reply);

            // Toon email-formulier als signaal aanwezig en nog niet getoond
            if (vraagEmail && !emailFormActief) {
                emailFormActief = true;
                voegEmailFormToe();
            }

        } catch (err) {
            verwijderTyping(typingId);
            const melding = err.name === 'TimeoutError'
                ? 'De AI reageert te langzaam. Probeer het opnieuw.'
                : 'Verbindingsfout. Controleer of de backend actief is op Render.';
            voegBerichtToe('ai', melding);
            console.warn('Chat fout:', err.message);
        } finally {
            sendBtn.disabled = false;
            input.focus();
        }
    }

    // ── Email-formulier in de chat injecteren ────────────────────────────────
    function voegEmailFormToe() {
        const wrapper = document.createElement('div');
        wrapper.id = 'chat-email-form';
        wrapper.style.cssText = [
            'background:rgba(212,175,55,0.06)',
            'border:1px solid rgba(212,175,55,0.3)',
            'border-radius:12px',
            'padding:1rem 1.1rem',
            'margin-top:0.75rem'
        ].join(';');

        wrapper.innerHTML =
            '<div style="display:flex;gap:0.6rem;align-items:center;">' +
                '<input type="email" id="chat-email-input"' +
                    ' placeholder="uw@email.nl" autocomplete="email"' +
                    ' aria-label="Uw e-mailadres voor de samenvatting"' +
                    ' style="flex:1;background:rgba(255,255,255,0.06);border:1px solid rgba(212,175,55,0.35);' +
                           'border-radius:8px;padding:0.6rem 0.9rem;color:#fff;font-size:0.88rem;' +
                           'font-family:inherit;outline:none;">' +
                '<button id="chat-email-send" type="button"' +
                    ' aria-label="Verstuur gespreksamenvatting per e-mail"' +
                    ' style="padding:0.6rem 1.1rem;background:linear-gradient(135deg,#d4af37,#b8902e);' +
                           'color:#111;border:none;border-radius:8px;font-weight:800;font-size:0.8rem;' +
                           'letter-spacing:0.06em;text-transform:uppercase;cursor:pointer;white-space:nowrap;">' +
                    'Verstuur' +
                '</button>' +
            '</div>' +
            '<div id="chat-email-status" style="display:none;font-size:0.8rem;margin-top:0.6rem;' +
                 'padding:0.5rem 0.8rem;border-radius:8px;"></div>';

        messages.appendChild(wrapper);
        messages.scrollTop = messages.scrollHeight;

        const emailInput = wrapper.querySelector('#chat-email-input');
        const emailBtn   = wrapper.querySelector('#chat-email-send');
        const statusEl   = wrapper.querySelector('#chat-email-status');

        setTimeout(function () { emailInput.focus(); }, 100);

        emailBtn.addEventListener('click', function () {
            verstuurSamenvatting(emailInput, emailBtn, statusEl);
        });
        emailInput.addEventListener('keydown', function (e) {
            if (e.key === 'Enter') verstuurSamenvatting(emailInput, emailBtn, statusEl);
        });
    }

    // ── EmailJS: stuur gespreksamenvatting naar Devlin ───────────────────────
    function verstuurSamenvatting(emailInput, emailBtn, statusEl) {
        const email = emailInput.value.trim();
        if (!email || !emailInput.validity.valid) {
            emailInput.style.borderColor = 'rgba(220,50,50,0.7)';
            emailInput.focus();
            return;
        }

        emailBtn.disabled    = true;
        emailBtn.textContent = '...';

        // Bouw leesbare samenvatting van het volledige gesprek
        const samenvatting = chatHistory.map(function (m) {
            return (m.role === 'user' ? 'Klant' : 'AI') + ':\n' + m.content;
        }).join('\n\n---\n\n');

        const datum = new Date().toLocaleString('nl-NL', {
            dateStyle: 'long',
            timeStyle: 'short'
        });

        emailjs.send(EMAILJS_SERVICE, EMAILJS_TEMPLATE, {
            name:    'AI Lead — ' + email,
            email:   email,
            subject: 'Nieuwe AI-lead via chatbot — ' + datum,
            message: samenvatting + '\n\n— AI'
        })
        .then(function () {
            toonStatus(statusEl,
                '\u2714 Verstuurd! Devlin neemt zo snel mogelijk contact op via ' + email,
                'success'
            );
            emailBtn.textContent = '\u2714 Verstuurd';
            emailInput.disabled  = true;
            voegBerichtToe('ai',
                'Uw wensen zijn doorgestuurd naar Devlin. Hij neemt zo snel mogelijk contact op via ' +
                email + '. Bedankt voor uw interesse in TT Digital Design!'
            );
        })
        .catch(function (err) {
            toonStatus(statusEl,
                '\u26A0 Versturen mislukt. Probeer opnieuw of mail naar info@ttdigitaldesign.nl',
                'error'
            );
            emailBtn.disabled    = false;
            emailBtn.textContent = 'Verstuur';
            console.error('EmailJS fout:', err);
        });
    }

    // ── Status feedback tonen ────────────────────────────────────────────────
    function toonStatus(el, msg, type) {
        el.textContent   = msg;
        el.style.display = 'block';
        if (type === 'success') {
            el.style.background = 'rgba(0,200,100,0.12)';
            el.style.border     = '1px solid rgba(0,200,100,0.4)';
            el.style.color      = '#4ade80';
        } else {
            el.style.background = 'rgba(220,50,50,0.12)';
            el.style.border     = '1px solid rgba(220,50,50,0.4)';
            el.style.color      = '#f87171';
        }
    }

    // ── Chat UI helpers ──────────────────────────────────────────────────────

    // Render een AI-antwoord: splits tekst en [KAART] blokken
    function renderAntwoord(reply) {
        const delen = reply.split(/(\[KAART\][\s\S]*?\[\/KAART\])/g);
        delen.forEach(function (deel) {
            deel = deel.trim();
            if (!deel) return;
            const kaartMatch = deel.match(/^\[KAART\]([\s\S]*?)\[\/KAART\]$/);
            if (kaartMatch) {
                try {
                    renderPakketKaart(JSON.parse(kaartMatch[1].trim()));
                } catch (e) {
                    voegBerichtToe('ai', deel); // fallback als JSON kapot is
                }
            } else {
                voegBerichtToe('ai', deel);
            }
        });
    }

    // Bouw een visuele pakket-kaart
    function renderPakketKaart(data) {
        const kaart = document.createElement('div');
        kaart.className = 'pakket-kaart';

        const waUrl = 'https://wa.me/31614717444?text=' +
            encodeURIComponent('Ik heb interesse in het ' + (data.naam || '') + ' pakket.');

        const featuresHtml = (data.features || []).map(function (f) {
            return '<li>\u2714 ' + escapeHtml(f) + '</li>';
        }).join('');

        kaart.innerHTML =
            (data.tag ? '<span class="pakket-kaart-tag">' + escapeHtml(data.tag) + '</span>' : '') +
            '<div class="pakket-kaart-naam">' + escapeHtml(data.naam || '') + '</div>' +
            '<div class="pakket-kaart-prijs">' + escapeHtml(data.prijs || '') + '</div>' +
            '<ul class="pakket-kaart-features">' + featuresHtml + '</ul>' +
            '<a href="' + waUrl + '" target="_blank" rel="noopener noreferrer"' +
               ' class="pakket-kaart-btn">SELECTEER DIT PAKKET</a>';

        messages.appendChild(kaart);
        messages.scrollTop = messages.scrollHeight;
    }

    // Voorkom XSS in kaart-inhoud
    function escapeHtml(str) {
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    function voegBerichtToe(rol, tekst) {
        const div    = document.createElement('div');
        div.className = 'chat-msg ' + rol;
        const bubble = document.createElement('span');
        bubble.className   = 'chat-bubble';
        bubble.textContent = tekst;
        div.appendChild(bubble);
        messages.appendChild(div);
        messages.scrollTop = messages.scrollHeight;
    }

    function voegTypingToe() {
        const id  = 'typing-' + Date.now();
        const div = document.createElement('div');
        div.className = 'chat-msg ai typing';
        div.id = id;
        const bubble = document.createElement('span');
        bubble.className   = 'chat-bubble';
        bubble.textContent = 'AI typt\u2026';
        div.appendChild(bubble);
        messages.appendChild(div);
        messages.scrollTop = messages.scrollHeight;
        return id;
    }

    function verwijderTyping(id) {
        const el = document.getElementById(id);
        if (el) el.remove();
    }
});

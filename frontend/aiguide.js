// ── TT Digital Design — AI Chatbot ──────────────────────────────────────────
// Verbindt met de backend op Render.com via /api/chat
// Pas RENDER_URL aan naar jouw eigen Render Web Service URL
// ─────────────────────────────────────────────────────────────────────────────

const RENDER_URL = 'https://tt-digitaldesign.onrender.com/api/chat';

// Gespreksgeschiedenis bijhouden (zodat de AI context onthoudt)
let chatHistory = [];

document.addEventListener('DOMContentLoaded', function () {
    const input    = document.getElementById('chat-input');
    const sendBtn  = document.getElementById('chat-send');
    const messages = document.getElementById('chat-messages');

    if (!input || !sendBtn || !messages) return;

    // Verstuur via knop
    sendBtn.addEventListener('click', verzendBericht);

    // Verstuur via Enter (Shift+Enter = nieuwe regel — niet van toepassing op input, maar voor zekerheid)
    input.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            verzendBericht();
        }
    });

    async function verzendBericht() {
        const tekst = input.value.trim();
        if (!tekst || sendBtn.disabled) return;

        // Gebruikersbericht tonen
        voegBerichtToe('user', tekst);
        chatHistory.push({ role: 'user', content: tekst });
        input.value = '';
        sendBtn.disabled = true;

        // Typing indicator
        const typingId = voegTypingToe();

        try {
            const response = await fetch(RENDER_URL, {
                method:  'POST',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify({ messages: chatHistory }),
                signal:  AbortSignal.timeout(15000)   // 15s timeout
            });

            verwijderTyping(typingId);

            if (!response.ok) {
                const err = await response.json().catch(() => ({}));
                throw new Error(err.error || 'Server fout');
            }

            const data  = await response.json();
            const reply = data.reply || 'Geen antwoord ontvangen.';

            chatHistory.push({ role: 'assistant', content: reply });
            voegBerichtToe('ai', reply);

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

    function voegBerichtToe(rol, tekst) {
        const div = document.createElement('div');
        div.className = 'chat-msg ' + rol;
        const bubble = document.createElement('span');
        bubble.className = 'chat-bubble';
        bubble.textContent = tekst;
        div.appendChild(bubble);
        messages.appendChild(div);
        messages.scrollTop = messages.scrollHeight;
        return div.id;
    }

    function voegTypingToe() {
        const id  = 'typing-' + Date.now();
        const div = document.createElement('div');
        div.className = 'chat-msg ai typing';
        div.id = id;
        const bubble = document.createElement('span');
        bubble.className = 'chat-bubble';
        bubble.textContent = 'AI typt…';
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

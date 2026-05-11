require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const OpenAI  = require('openai');
const path    = require('path');

const app  = express();
const PORT = process.env.PORT || 3000;

// ── CORS: sta alleen jouw frontend toe ──────────────────────────────────────
const allowedOrigins = [
    process.env.FRONTEND_URL || '*'   // zet op Render: https://jouwwebsite.nl
];
app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    }
}));
app.use(express.json({ limit: '10kb' }));

// ── Statische frontend serveren (optioneel, handig voor productie) ───────────
app.use(express.static(path.join(__dirname, '../frontend')));

// ── OpenAI client ─────────────────────────────────────────────────────────────
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ── Systeem-prompt: TT Digital Design AI assistent ───────────────────────────
const SYSTEM_PROMPT = `Je bent de AI-assistent van TT Digital Design — een premium webdevelopment bureau in Nederland.

Je helpt bezoekers met:
- Vragen over onze diensten: webdesign, AI-automatisering en hosting
- Uitleg over pakketten en prijzen (The Digital Card v.a. €349,99 | ULTIMATE v.a. €999 | Masterplan v.a. €1999)
- Hosting pakketten: Basis Cloud €14,94/mnd | Managed Pro €24,99/mnd | Smart Lease €49,99/mnd | Ultimate Lease €74,99/mnd
- AI automatisering mogelijkheden
- Contact en support

Toon altijd expertise, wees kort en krachtig, gebruik geen markdown of asterisken in je antwoorden.
Stuur warme leads altijd door naar de support pagina voor persoonlijk contact.
Bedrijfsnaam: TT Digital Design. Eigenaar: Devlin. Telefoon (spoed): +31 6 147 17 444. E-mail: info@ttdigitaldesign.nl`;

// ── /api/chat endpoint ────────────────────────────────────────────────────────
app.post('/api/chat', async (req, res) => {
    const { messages } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
        return res.status(400).json({ error: 'Ongeldig verzoek.' });
    }

    // Maximaal 20 berichten meesturen (context window bewaken)
    const history = messages.slice(-20).map(m => ({
        role:    m.role    === 'user' ? 'user' : 'assistant',
        content: String(m.content).slice(0, 1000)   // max 1000 tekens per bericht
    }));

    try {
        const completion = await openai.chat.completions.create({
            model:      'gpt-4o-mini',
            messages:   [{ role: 'system', content: SYSTEM_PROMPT }, ...history],
            max_tokens: 400,
            temperature: 0.7,
        });

        const reply = completion.choices[0].message.content;
        res.json({ reply });

    } catch (err) {
        console.error('OpenAI fout:', err.message);
        res.status(500).json({ error: 'AI is momenteel niet beschikbaar. Probeer het later opnieuw.' });
    }
});

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

// ── Alle andere routes → index (SPA fallback) ─────────────────────────────────
app.get('*', (_req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/home.html'));
});

app.listen(PORT, () => console.log(`TT Digital Design backend draait op poort ${PORT}`));

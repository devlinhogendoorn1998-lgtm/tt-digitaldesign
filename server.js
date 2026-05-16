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
const SYSTEM_PROMPT = `Jij bent de expert-medewerker van TT Digital Design. Je spreekt namens het bedrijf — niet als een bot, maar als iemand die het vak kent.

Devlin begon in de sloop en hovenierij. Harde sector, geen ruimte voor gezeur. Hij stapte over naar Precision Coding en bouwde TT Digital Design op één fundament: websites die presteren. Geen opvulling, geen excuses. Lighthouse 89+ is de norm, niet de uitzondering.

Mentaliteit: Niet lullen maar poetsen. Wees direct, deskundig, to-the-point. Gebruik altijd bullet points met vinkjes (✔) bij pakketpresentaties. Houd elk bericht scanbaar en krachtig. Gebruik NOOIT sterretjes of markdown-opmaak.

════════════════════════════════════════
DATA-REGEL — ABSOLUUT VERPLICHT
════════════════════════════════════════
Jij mag NOOIT informatie verzinnen. Alle prijzen, pakketten, functies en contactgegevens staan hieronder vastgelegd. Dit is de enige bron van waarheid. Als iets er niet in staat, zeg dan: "Dat weet ik niet zeker — vraag het Devlin op +31 6 14717444 of mail naar info@ttdigitaldesign.nl."

════════════════════════════════════════
COMMUNICATIEREGEL — ABSOLUUT VERPLICHT
════════════════════════════════════════
Jij bent een verkoper, geen vriend. Geen begroetingen zoals "Hallo", "Fijn dat u er bent" of andere opvulling. Dat kost tijd en converteert niet.

Als de klant begint met een begroeting ("hoi", "hallo", "hey", "hi", etc.) zonder specifieke vraag, reageer dan ALLEEN met dit menu:

"Goedendag! Ik ben de AI-assistent van TT Digital Design. Waar kan ik u direct mee helpen?

Website Bouw — Van visitekaartje tot Masterplan

Hosting & Cloud — Huur, beheer en lease

AI Integratie — Automatisering van uw business

Support — Hulp bij problemen of spoed

Kies een nummer of onderwerp."

Als de klant direct vraagt naar websites, hosting of prijzen: sla het menu volledig over en geef direct de gevraagde informatie zonder introductie.

════════════════════════════════════════
CONVERSATIE-STROOM — STRIKT VERPLICHT
════════════════════════════════════════

STAP 1 — TRECHTER:
Bij algemene vragen over diensten of prijzen toon je altijd het bovenstaande genummerde menu.

STAP 2 — CATEGORIE GEKOZEN:

Bij keuze 1 (Website Bouw): Toon de 3 website-pakketten met de [KAART] syntax.

Bij keuze 2 (Hosting & Cloud): Toon de 4 hosting-pakketten met de [KAART] syntax.

Bij keuze 3 (AI Integratie): Toon het AI-overzicht met vinkjes.

Bij keuze 4 (Support): Gebruik ALTIJD de escalatie-tekst naar Devlin.

STAP 3 — SPECIFIEK PAKKET:
Toon alleen de details van het gevraagde pakket. Gebruik de geheugenkoppeling om nummers (1, 2, 3) te koppelen aan het juiste pakket binnen de actieve categorie.

════════════════════════════════════════
KAART-DATA — KOPIEER EXACT
════════════════════════════════════════
Gebruik dit formaat letterlijk voor pakketten:
[KAART]{"naam":"NAAM","prijs":"PRIJS","tag":"","features":["Feature 1","Feature 2"]}[/KAART]

WEBSITE PAKKETTEN:
[KAART]{"naam":"The Digital Card","prijs":"€349,99 excl. BTW","tag":"","features":["Directe actieknop (bel, mail, WhatsApp)","Portfolio met 3 foto's","Smartphone-proof design","Slimme navigatie","Contact-ready","SEO-basis"]}[/KAART]

[KAART]{"naam":"ULTIMATE","prijs":"€999,99 excl. BTW","tag":"AANBEVOLEN","features":["6 volledige pagina's","24 foto's","Over Ons pagina","Automatische respons","Geavanceerde navigatie","SEO met statistieken"]}[/KAART]

[KAART]{"naam":"Masterplan","prijs":"€1.999,99 excl. BTW","tag":"","features":["12 afdelingspagina's","50 foto's","Logo & Branding","Deep SEO — Google Dominantie","Slim leadsysteem","Unieke regio-focus"]}[/KAART]

HOSTING & LEASE PAKKETTEN:
[KAART]{"naam":"Basis Cloud","prijs":"€14,94 per maand excl. BTW","tag":"","features":["Enterprise Edge Network","Global DDoS Protection","SSL certificaat","100GB bandbreedte","Zelfbeheer via CMS of code"]}[/KAART]

[KAART]{"naam":"Managed Pro","prijs":"€24,99 per maand excl. BTW","tag":"","features":["Alles van Basis Cloud","3x content updates per maand","Priority support","Formulier-integratie","Analytics dashboard"]}[/KAART]

[KAART]{"naam":"Smart Lease","prijs":"€49,99 per maand excl. BTW","tag":"","features":["Website inclusief 2 pagina's","Volledige hosting en onderhoud","Beveiliging inbegrepen","Eigendom na 12 maanden","Daarna €24,99 per maand"]}[/KAART]

[KAART]{"naam":"Ultimate Lease","prijs":"€74,99 per maand excl. BTW","tag":"","features":["Website inclusief 5 pagina's","Complete managed hosting","Minimaal 6 maanden contract","Eigendom na 12 maanden","Daarna €24,99 per maand"]}[/KAART]

════════════════════════════════════════
AI INTEGRATIE DATA
════════════════════════════════════════
✔ Klantvragen automatiseren (FAQ & gepersonaliseerde reacties)
✔ E-mail automatisering
✔ Facturen genereren als PDF
✔ CRM & lead management via Google Sheets
✔ Afspraken plannen
✔ Conversie optimalisatie

════════════════════════════════════════
PRIVACY & COOKIES
════════════════════════════════════════
Antwoord strikt: "Geen handel, alleen fundament. Gegevens blijven minimaal 30 dagen bewaard. Bij aankoop worden gegevens beveiligd opgeslagen op eigen afgeschermde servers. Wij verkopen NOOIT data aan derden. Alles is maximaal beveiligd. Voor vragen: info@ttdigitaldesign.nl"

════════════════════════════════════════
SUPPORT & ESCALATIE — STRIKT VERPLICHT
════════════════════════════════════════
Gebruik bij complexe vragen of code-hulp ALTIJD deze tekst:
"Voor deze specifieke vraag adviseer ik u om direct contact op te nemen met Devlin. U kunt uw vraag sturen naar support@ttdigitaldesign.nl voor een snelle reactie per mail. Heeft het grote spoed? Dan kunt u bellen of appen naar +31 6 14717444. Let op: bij spoed buiten de standaardvragen geldt een starttarief van €100,- en daarna €75,- per uur."

════════════════════════════════════════
VERKOOP & LEADS
════════════════════════════════════════

Geen onderhandeling. Bij korting: "Dat kan ik helaas niet regelen, maar vraag het Devlin — nee heb je, ja kun je krijgen."

Bij serieuze interesse, sluit af met: "Wilt u een samenvatting ontvangen voor Devlin? Typ uw e-mailadres." gevolgd door [VRAAG_EMAIL] op een nieuwe regel.

Bedrijfsnaam: TT Digital Design. Eigenaar: Devlin. Tel: +31 6 14717444. Mail: info@ttdigitaldesign.nl.`;

// ── /api/chat endpoint ────────────────────────────────────────────────────────
app.post('/api/chat', async (req, res) => {
    const { messages } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
        return res.status(400).json({ error: 'Ongeldig verzoek.' });
    }

    // Maximaal 20 berichten meesturen (context window bewaken)
    const history = messages.slice(-20).map(m => ({
        role:    m.role    === 'user' ? 'user' : 'assistant',
        content: String(m.content).slice(0, 4000)   // max 4000 tekens per bericht
    }));

    try {
        const completion = await openai.chat.completions.create({
            model:      'gpt-4o-mini',
            messages:   [{ role: 'system', content: SYSTEM_PROMPT }, ...history],
            max_tokens: 2000,
            temperature: 0.7,
        });

        const reply = completion.choices[0].message.content
            .replace(/\*\*(.*?)\*\*/g, '$1')   // verwijder bold-sterretjes
            .replace(/\*(.*?)\*/g, '$1')        // verwijder italic-sterretjes
            .replace(/^\*\s/gm, '\u2022 ');    // vervang lijst-sterretjes door bullet
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

app.listen(PORT, () => console.log(`TT Digital Design backend draait op poort ${PORT}.`));

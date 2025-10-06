"use client";

import Link from "next/link";

export default function CookiePolicyPage() {
  return (
    <main className="w-full min-h-screen bg-white text-gray-900 px-6 md:px-20 py-24">
      <nav className="text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:underline">Home</Link> &gt; <span>Cookie Policy</span>
      </nav>

      <h1 className="text-3xl font-bold text-[#C73A3A] mb-8">Cookie Policy</h1>

      <div className="prose prose-lg max-w-none text-gray-800">
        <p><strong>Ultimo aggiornamento:</strong> 30/04/2025</p>

        <p>
          La presente Cookie Policy spiega cosa sono i cookie e come li utilizziamo sul sito <strong>cbbettonagli.it</strong>.
          Ti invitiamo a leggere attentamente quanto segue per capire che tipo di dati raccogliamo, come vengono utilizzati e come puoi gestirli.
        </p>

        <h2>Cosa sono i cookie?</h2>
        <p>
          I cookie sono piccoli file di testo che i siti web salvano sul tuo dispositivo (computer, smartphone, tablet) mentre navighi.
          Servono a migliorare la tua esperienza di navigazione, memorizzare le tue preferenze o raccogliere informazioni statistiche.
        </p>

        <h2>Tipi di cookie utilizzati</h2>
        <ul>
          <li><strong>Cookie tecnici (necessari):</strong> garantiscono il corretto funzionamento del sito.</li>
          <li><strong>Cookie di preferenza:</strong> memorizzano le tue scelte (es. lingua, layout).</li>
          <li><strong>Cookie analitici:</strong> raccolgono dati anonimi per fini statistici. Usiamo Google Analytics in forma anonimizzata.</li>
          <li><strong>Cookie di marketing:</strong> non utilizziamo direttamente cookie di profilazione, ma servizi esterni potrebbero farlo.</li>
        </ul>

        <h2>Gestione dei cookie</h2>
        <p>Puoi modificare le tue preferenze in ogni momento o disabilitare i cookie tramite le impostazioni del browser:</p>
        <ul>
          <li><a href="https://support.google.com/chrome/answer/95647?hl=it" target="_blank">Google Chrome</a></li>
          <li><a href="https://support.mozilla.org/it/kb/Gestione%20dei%20cookie" target="_blank">Mozilla Firefox</a></li>
          <li><a href="https://support.apple.com/it-it/guide/safari/sfri11471/mac" target="_blank">Safari</a></li>
          <li><a href="https://support.microsoft.com/it-it/help/4027947/microsoft-edge-delete-cookies" target="_blank">Edge</a></li>
        </ul>

        <h2>Servizi di terze parti</h2>
        <p>
          Il sito può contenere collegamenti o integrazioni con:
          WhatsApp, Google Maps, Facebook, YouTube, LinkedIn. Tali servizi possono installare cookie indipendenti.
          Si invita a consultare le rispettive privacy policy.
        </p>

        <h2>Modifiche alla cookie policy</h2>
        <p>
          Ci riserviamo il diritto di aggiornare questa policy. Le modifiche saranno comunicate attraverso banner o avvisi nel sito.
        </p>

        <h2>Contatti</h2>
        <p>
          Per maggiori informazioni contattaci:
          <br />📧 <a href="mailto:info@cbbettonagli.it">info@cbbettonagli.it</a>
          <br />📞 <a href="tel:+39035690535">+39 035 690535</a>
        </p>
      </div>
    </main>
  );
}


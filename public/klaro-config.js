// public/klaro-config.js
var klaroConfig = {
  version: 1,
  elementID: "klaro",
  storageMethod: "localStorage",
  htmlTexts: true,
  acceptAll: true,
  hideDeclineAll: false,
  mustConsent: false,
  default: false,
  translations: {
    it: {
      consentModal: {
        title: "Gestione dei cookie",
        description: "Qui puoi decidere quali cookie accettare. Puoi modificare la tua scelta in qualsiasi momento.",
      },
      consentNotice: {
        description: "Utilizziamo i cookie per offrirti la migliore esperienza sul nostro sito.",
        learnMore: "Personalizza",
      },
      ok: "Accetta tutto",
      acceptSelected: "Accetta selezionati",
      decline: "Rifiuta",
    },
  },
  services: [
    {
      name: "google-analytics",
      title: "Google Analytics",
      purposes: ["analytics"],
      cookies: [/^_ga/, /^_gid/, /^_gat/],
      required: false,
      default: false,
    },
    {
      name: "youtube",
      title: "YouTube Video",
      purposes: ["media"],
      cookies: [/youtube\.com/],
      required: false,
      default: false,
    },
  ],
};
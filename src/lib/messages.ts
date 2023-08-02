import { AvailableLanguages, LanguageLocales } from "./configure.js"
import invariant from "./invariant.js";

export function getLanguage() {
  //TODO: use config file to set language
  let locale = Intl.DateTimeFormat().resolvedOptions().locale ?? (process.env.LANG)?.split('.')[0];
  return locale as AvailableLanguages;
}

type CliPossibleAnswers = {
  "yes"?: string;
  "no"?: string;
  "combine"?: string;
  "regenerate"?: string;
  "none"?: string;
  "open-ended"?: string;
}

type CliPrompt = {
  text: string;
  answers?: CliPossibleAnswers;
}

type CliMessages = {
  prompts: {
    "enter-openai-key": CliPrompt;
    "unstaged-commits-confirm-add": CliPrompt;
    "accept-which-summary": CliPrompt;
    "combine-summaries-selection": CliPrompt;
    "accept-yes-no": CliPrompt;
    "update-now": CliPrompt;
  },
  messages: {
    "staging-all-files": string;
    "openai-key-required": string;
    "using-cached-summaries": string;
    "summaries-combined-confirmation": string;
    "aborting-commit": string;
    "selected-commit-message": string;
    "welcome": string;
    "description": string;
    "openai-api-key-instructons": string;
    "commit-message-options": string;
    "ava-is-combining-summaries": string;
    "ava-is-working": string;
    "characters": string;
    "summarizing": string;
    "summarized": string;
    "summaries": string;
    "diffs": string;
    "update-available-header": string;
    "update-available-body": string;
    "run": string;
    "to-update": string;
    "update-confirmation": string;
    "version": string;
    "update-command-description": string;
    "release-notes-command-description": string;
    "configure-command-description": string;
    "generate-command-description": string;
    "option-all-description": string;
    "option-verbose-description": string;
    "option-length-description": string;
    "option-configure-description": string;
    "example-1": string;
    "example-2": string;
    "example-3": string;
    "usage": string;
    "display-help-for-a-command": string;
    "display-version-information": string;
  }
  errors: {
    "no-diff": string;
  }
}

type Messages = {
  [key in AvailableLanguages]: CliMessages | undefined;
};

const DEFAULT_CLI_POSSIBLE_ANSWERS: CliPossibleAnswers = {
  "yes": "y",
  "no": "n",
  "combine": "c",
  "regenerate": "r",
  "none": "n",
  "open-ended": "open-ended",
}

export function convertAnswerToDefault(prompt: CliPrompt, answer: string, defaultValue?: string): string {
  const promptAnswers = prompt.answers ?? DEFAULT_CLI_POSSIBLE_ANSWERS;
  const foundItem = Object.keys(promptAnswers).find(key => (promptAnswers as Record<string, string>)[key] === answer) as keyof CliPossibleAnswers;
  const result = DEFAULT_CLI_POSSIBLE_ANSWERS[foundItem]
  if (!result && defaultValue) {
    return defaultValue;
  }
  invariant(result, `Could not find answer for ${answer} in ${JSON.stringify(promptAnswers)}, and no defaultValue was provided.`);
  return result.trim().toLowerCase();
}

const Messages: Messages = {
  "en-US": undefined,
  "aa": undefined,
  "ab": undefined,
  "ae": undefined,
  "af-ZA": undefined,
  "af": undefined,
  "ak": undefined,
  "am": undefined,
  "an": undefined,
  "ar-AE": undefined,
  "ar-BH": undefined,
  "ar-DZ": undefined,
  "ar-EG": undefined,
  "ar-IQ": undefined,
  "ar-JO": undefined,
  "ar-KW": undefined,
  "ar-LB": undefined,
  "ar-LY": undefined,
  "ar-MA": undefined,
  "ar-OM": undefined,
  "ar-QA": undefined,
  "ar-SA": undefined,
  "ar-SY": undefined,
  "ar-TN": undefined,
  "ar-YE": undefined,
  "ar": undefined,
  "as": undefined,
  "av": undefined,
  "ay": undefined,
  "az": undefined,
  "ba": undefined,
  "be-BY": undefined,
  "be": undefined,
  "bg-BG": undefined,
  "bg": undefined,
  "bh": undefined,
  "bi": undefined,
  "bm": undefined,
  "bn": undefined,
  "bo": undefined,
  "br": undefined,
  "bs": undefined,
  "ca-ES": undefined,
  "ca": undefined,
  "ce": undefined,
  "ch": undefined,
  "co": undefined,
  "cr": undefined,
  "cs-CZ": undefined,
  "cs": undefined,
  "cu": undefined,
  "cv": undefined,
  "Cy-az-AZ": undefined,
  "Cy-sr-SP": undefined,
  "Cy-uz-UZ": undefined,
  "cy": undefined,
  "da-DK": undefined,
  "da": undefined,
  "de-AT": undefined,
  "de-CH": undefined,
  "de-DE": undefined,
  "de-LI": undefined,
  "de-LU": undefined,
  "de": undefined,
  "div-MV": undefined,
  "dv": undefined,
  "dz": undefined,
  "ee": undefined,
  "el-GR": undefined,
  "el": undefined,
  "en-AU": undefined,
  "en-BZ": undefined,
  "en-CA": undefined,
  "en-CB": undefined,
  "en-GB": undefined,
  "en-IE": undefined,
  "en-JM": undefined,
  "en-NZ": undefined,
  "en-PH": undefined,
  "en-TT": undefined,
  "en-ZA": undefined,
  "en-ZW": undefined,
  "en": {
    prompts: {
      "enter-openai-key": {
        text: "Enter your OpenAI API key > ", answers: {
          "open-ended": "open-ended",
        }
      },
      "unstaged-commits-confirm-add": {
        text: "You have unstaged commits. Do you want to stage them before generating the commit messages? (Y, n) > ",
      },
      "accept-which-summary": { text: "Accept which summary? (#, [n]one, [c]ombine, [r]egenerate) >" },
      "combine-summaries-selection": { text: "Enter the numbers of the commit messages to combine, separated by spaces > " },
      "accept-yes-no": { text: "Accept? (Y, n) > " },
      "update-now": { text: "Would you like to update now? (Y, n) > " },
    },
    messages: {
      "staging-all-files": "Staging all files...",
      "openai-key-required": "You must set the OPENAI_API_KEY environment variable, or run `ava-commit --configure`",
      "using-cached-summaries": "Using cached summaries and commit messages from previous run.",
      "summaries-combined-confirmation": "Combined commit message:",
      "aborting-commit": "Aborting commit",
      "selected-commit-message": "Selected commit message: ",
      "welcome": "Welcome to {name}, the AI-powered commit message generator.",
      "description": "This tool will help you write better commit messages.",
      "openai-api-key-instructons": "To use this tool, you'll need an OpenAI API key. You can get one here: 🔗 https://platform.openai.com/account/api-keys",
      "commit-message-options": "Commit message options:",
      "ava-is-combining-summaries": "Ava is combining {summaryCount} summaries...",
      "ava-is-working": "Ava is working...",
      "characters": "characters",
      "summarizing": "Summarizing",
      "summarized": "Summarized",
      "summaries": "summaries",
      "diffs": "diffs",
      "update-available-header": "An update is available",
      "update-available-body": "is out of date. The latest version is",
      "run": "Run",
      "to-update": "to update",
      "update-confirmation": "The following packages have been updated: ",
      "version": "Version",
      "update-command-description": "Check for updates",
      "release-notes-command-description": "Generates release notes based on what's changed since the most recent tag",
      "configure-command-description": "Configure the tool",
      "generate-command-description": "Generate a commit message",
      "option-all-description": "All commits, not just staged",
      "option-verbose-description": "Verbose output",
      "option-length-description": "Length of commit message",
      "option-configure-description": "Configure the tool",
      "example-1": "$ ava-commit generate                # create a commit message for staged files with all defaults",
      "example-2": "$ ava-commit generate --all          # create a commit message for staged files, bypassing the check for staged files",
      "example-3": "$ ava-commit generate --length 150   # create a commit message for staged files, targeting max summary of 150 characters",
      "usage": "command [options]",
      "display-help-for-a-command": "Display help for a command",
      "display-version-information": "Display version information",
    },
    errors: {
      "no-diff": "No changes to commit",
    }
  },
  "eo": undefined,
  "es-AR": undefined,
  "es-BO": undefined,
  "es-CL": undefined,
  "es-CO": undefined,
  "es-CR": undefined,
  "es-DO": undefined,
  "es-EC": undefined,
  "es-ES": undefined,
  "es-GT": undefined,
  "es-HN": undefined,
  "es-MX": undefined,
  "es-NI": undefined,
  "es-PA": undefined,
  "es-PE": undefined,
  "es-PR": undefined,
  "es-PY": undefined,
  "es-SV": undefined,
  "es-UY": undefined,
  "es-VE": undefined,
  "es": {
    prompts: {
      "enter-openai-key": { text: "Introduzca su clave de API de OpenAI > ", answers: {} },
      "unstaged-commits-confirm-add": {
        text: "Tiene commits sin preparar. ¿Desea prepararlos antes de generar los mensajes de commit? (S)i, (n)o > ", answers: {
          "yes": "S",
          "no": "n",
        }
      },
      "accept-which-summary": { text: "¿Qué resumen desea aceptar? (#, [n]inguno, [c]ombinar, [r]egenerar) >" },
      "combine-summaries-selection": { text: "Introduzca los números de los mensajes de commit a combinar, separados por espacios > " },
      "accept-yes-no": {
        text: "¿Aceptar? (S)i, (n)o > ", answers: {
          "yes": "S",
          "no": "n",
        }
      },
      "update-now": { text: "¿Desea actualizar ahora? (S)i, (n)o > ", answers: { "yes": "S", "no": "n" } },
    },
    messages: {
      "staging-all-files": "Preparando todos los archivos...",
      "openai-key-required": "Debe establecer la variable de entorno OPENAI_API_KEY, o ejecutar `ava-commit --configure`",
      "using-cached-summaries": "Usando resúmenes y mensajes de commit en caché de la ejecución anterior.",
      "summaries-combined-confirmation": "Mensaje de commit combinado:",
      "aborting-commit": "Abortando commit",
      "selected-commit-message": "Mensaje de commit seleccionado: ",
      "welcome": "Bienvenido a {name}, el generador de mensajes de commit con IA.",
      "description": "Esta herramienta le ayudará a escribir mejores mensajes de commit.",
      "ava-is-combining-summaries": "Ava está combinando {summaryCount} resúmenes...",
      "ava-is-working": "Ava está trabajando...",
      "characters": "caracteres",
      "summarizing": "Resumiendo",
      "summarized": "Resumido",
      "summaries": "resúmenes",
      "diffs": "diferencias",
      "update-available-header": "Hay una actualización disponible",
      "update-available-body": "está obsoleto. La última versión es",
      "run": "Ejecutar",
      "to-update": "para actualizar",
      "update-confirmation": "Los siguientes paquetes se han actualizado:",
      "commit-message-options": "Opciones del mensaje de commit:",
      "openai-api-key-instructons": "Para utilizar esta herramienta, necesitará una clave de API de OpenAI. Puede obtener una aquí: 🔗 https://platform.openai.com/account/api-keys",
      "version": "Version",
      "update-command-description": "Comprueba si hay actualizaciones",
      "release-notes-command-description": "Genera notas de lanzamiento basadas en lo que ha cambiado desde la etiqueta más reciente",
      "configure-command-description": "Configura la herramienta",
      "generate-command-description": "Genera un mensaje de commit",
      "option-all-description": "Todos los commits, no solo los preparados",
      "option-verbose-description": "Salida detallada",
      "option-length-description": "Longitud del mensaje de commit",
      "option-configure-description": "Configura la herramienta",
      "example-1": "$ ava-commit generate                # crea un mensaje de commit para los archivos preparados con todos los valores predeterminados",
      "example-2": "$ ava-commit generate --all          # crea un mensaje de commit para los archivos preparados, omitiendo la comprobación de archivos preparados",
      "example-3": "$ ava-commit generate --length 150   # crea un mensaje de commit para los archivos preparados, apuntando a un resumen máximo de 150 caracteres",
      "usage": "comando [opciones]",
      "display-help-for-a-command": "Muestra la ayuda para un comando",
      "display-version-information": "Muestra información de la versión",
    },
    errors: {
      "no-diff": "No hay cambios para hacer commit",
    }
  },
  "et-EE": undefined,
  "et": undefined,
  "eu-ES": undefined,
  "eu": undefined,
  "fa-IR": undefined,
  "fa": undefined,
  "ff": undefined,
  "fi-FI": undefined,
  "fi": undefined,
  "fj": undefined,
  "fo-FO": undefined,
  "fo": undefined,
  "fr-BE": undefined,
  "fr-CA": undefined,
  "fr-CH": undefined,
  "fr-FR": undefined,
  "fr-LU": undefined,
  "fr-MC": undefined,
  "fr": {
    prompts: {
      "enter-openai-key": { text: "Entrez votre clé API OpenAI > ", answers: {} },
      "unstaged-commits-confirm-add": {
        text: "Vous avez des commits non indexés. Voulez-vous les indexer avant de générer les messages de commit ? (O)ui, (n)o > ", answers: {
          "yes": "O",
          "no": "n",
        }
      },
      "accept-which-summary": { text: "Accepter quel résumé ? #, [n]un, [c]ombiner, [r]égénérer >" },
      "combine-summaries-selection": { text: "Entrez les numéros des messages de commit à combiner, séparés par des espaces > " },
      "accept-yes-no": {
        text: "Accepter ? (O)ui, (n)o > ", answers: {
          "yes": "O",
          "no": "n",
        }
      },
      "update-now": { text: "Voulez-vous mettre à jour maintenant ? (O)ui, (n)o > ", answers: { "yes": "O", "no": "n" } },

    },
    messages: {
      "staging-all-files": "Indexation de tous les fichiers...",
      "openai-key-required": "Vous devez définir la variable d'environnement OPENAI_API_KEY, ou exécuter `ava-commit --configure`",
      "using-cached-summaries": "Utilisation des résumés et messages de commit en cache de la précédente exécution.",
      "summaries-combined-confirmation": "Message de commit combiné :",
      "aborting-commit": "Annulation du commit",
      "selected-commit-message": "Message de commit sélectionné : ",
      "welcome": "Bienvenue sur {name}, le générateur de messages de commit alimenté par l'IA.",
      "description": "Cet outil vous aidera à rédiger de meilleurs messages de commit.",
      "openai-api-key-instructons": "Pour utiliser cet outil, vous aurez besoin d'une clé API OpenAI. Vous pouvez en obtenir une ici : 🔗 https://platform.openai.com/account/api-keys",
      "commit-message-options": "Options du message de commit :",
      "ava-is-combining-summaries": "Ava combine {summaryCount} résumés...",
      "ava-is-working": "Ava travaille...",
      "characters": "caractères",
      "summarizing": "Résumé",
      "summarized": "Résumé",
      "summaries": "résumés",
      "diffs": "différences",
      "update-available-header": "Une mise à jour est disponible",
      "update-available-body": "est obsolète. La dernière version est",
      "run": "Exécutez",
      "to-update": "pour mettre à jour",
      "update-confirmation": "Les packages suivants ont été mis à jour :",
      "version": "Version",
      "update-command-description": "Vérifiez les mises à jour",
      "release-notes-command-description": "Génère les notes de version en fonction de ce qui a changé depuis la dernière étiquette",
      "configure-command-description": "Configurez l'outil",
      "generate-command-description": "Génère un message de commit",
      "option-all-description": "Tous les commits, pas seulement indexés",
      "option-verbose-description": "Sortie détaillée",
      "option-length-description": "Longueur du message de commit",
      "option-configure-description": "Configurez l'outil",
      "example-1": "$ ava-commit generate                # crée un message de commit pour les fichiers indexés avec toutes les valeurs par défaut",
      "example-2": "$ ava-commit generate --all          # crée un message de commit pour les fichiers indexés, en contournant la vérification des fichiers indexés",
      "example-3": "$ ava-commit generate --length 150   # crée un message de commit pour les fichiers indexés, ciblant un résumé maximal de 150 caractères",
      "usage": "commande [options]",
      "display-help-for-a-command": "Afficher l'aide pour une commande",
      "display-version-information": "Afficher les informations de version",
    },
    errors: {
      "no-diff": "Aucun changement à commiter",
    },
  },
  "fy": undefined,
  "ga": undefined,
  "gd": undefined,
  "gl-ES": undefined,
  "gl": undefined,
  "gn": undefined,
  "gu-IN": undefined,
  "gu": undefined,
  "gv": undefined,
  "ha": undefined,
  "he-IL": undefined,
  "he": undefined,
  "hi-IN": undefined,
  "hi": undefined,
  "ho": undefined,
  "hr-HR": undefined,
  "hr": undefined,
  "ht": undefined,
  "hu-HU": undefined,
  "hu": undefined,
  "hy-AM": undefined,
  "hy": undefined,
  "hz": undefined,
  "ia": undefined,
  "id-ID": undefined,
  "id": undefined,
  "ie": undefined,
  "ig": undefined,
  "ii": undefined,
  "ik": undefined,
  "io": undefined,
  "is-IS": undefined,
  "is": undefined,
  "it-CH": undefined,
  "it-IT": undefined,
  "it": {
    prompts: {
      "enter-openai-key": { text: "Inserisci la tua chiave API di OpenAI > " },
      "unstaged-commits-confirm-add": {
        text: "Hai dei commit non in stage. Vuoi metterli in stage prima di generare i messaggi di commit? (S)i, (n)o > ", answers: {
          "yes": "S",
          "no": "n",
        }
      },
      "accept-which-summary": { text: "Quale riepilogo vuoi accettare? (#, [n]essuno, [c]ombina, [r]igenera) >" },
      "combine-summaries-selection": { text: "Inserisci i numeri dei messaggi di commit da combinare, separati da spazi > " },
      "accept-yes-no": {
        text: "Accetti? (S)i, (n)o > ", answers: {
          "yes": "S",
          "no": "n",
        }
      },
      "update-now": { text: "Vuoi aggiornare ora? (S)i, (n)o > ", answers: { "yes": "S", "no": "n" } },
    },
    messages: {
      "staging-all-files": "Mettendo in stage tutti i file...",
      "openai-key-required": "Devi impostare la variabile di ambiente OPENAI_API_KEY, o eseguire `ava-commit --configure`",
      "using-cached-summaries": "Utilizzando i riepiloghi e i messaggi di commit in cache dalla precedente esecuzione.",
      "summaries-combined-confirmation": "Messaggio di commit combinato:",
      "aborting-commit": "Interrompendo il commit",
      "selected-commit-message": "Messaggio di commit selezionato: ",
      "welcome": "Benvenuto a {name}, il generatore di messaggi di commit alimentato da AI.",
      "description": "Questo strumento ti aiuterà a scrivere messaggi di commit migliori.",
      "openai-api-key-instructons": "Per utilizzare questo strumento, avrai bisogno di una chiave API di OpenAI. Puoi ottenerne una qui: 🔗 https://platform.openai.com/account/api-keys",
      "commit-message-options": "Opzioni del messaggio di commit:",
      "ava-is-combining-summaries": "Ava sta combinando {summaryCount} riepiloghi...",
      "ava-is-working": "Ava sta lavorando...",
      "characters": "caratteri",
      "summarizing": "Riassumendo",
      "summarized": "Riassunto",
      "summaries": "riepiloghi",
      "diffs": "differenze",
      "update-available-header": "È disponibile un aggiornamento",
      "update-available-body": "è obsoleto. L'ultima versione è",
      "run": "Esegui",
      "to-update": "per aggiornare",
      "update-confirmation": "I seguenti pacchetti sono stati aggiornati:",
      "version": "Versione",
      "update-command-description": "Controlla gli aggiornamenti",
      "release-notes-command-description": "Genera le note di rilascio in base a ciò che è cambiato dalla tag più recente",
      "configure-command-description": "Configura lo strumento",
      "generate-command-description": "Genera un messaggio di commit",
      "option-all-description": "Tutti i commit, non solo quelli in stage",
      "option-verbose-description": "Output dettagliato",
      "option-length-description": "Lunghezza del messaggio di commit",
      "option-configure-description": "Configura lo strumento",
      "example-1": "$ ava-commit generate                # crea un messaggio di commit per i file in stage con tutti i valori predefiniti",
      "example-2": "$ ava-commit generate --all          # crea un messaggio di commit per i file in stage, bypassando il controllo dei file in stage",
      "example-3": "$ ava-commit generate --length 150   # crea un messaggio di commit per i file in stage, puntando a un riepilogo massimo di 150 caratteri",
      "usage": "command [options]",
      "display-help-for-a-command": "Visualizza l'aiuto per un comando",
      "display-version-information": "Visualizza le informazioni sulla versione",
    },
    errors: {
      "no-diff": "Nessuna modifica da commitare",
    }
  },
  "iu": undefined,
  "ja-JP": undefined,
  "ja": undefined,
  "jv": undefined,
  "ka-GE": undefined,
  "ka": undefined,
  "kg": undefined,
  "ki": undefined,
  "kj": undefined,
  "kk-KZ": undefined,
  "kk": undefined,
  "kl": undefined,
  "km": undefined,
  "kn-IN": undefined,
  "kn": undefined,
  "ko-KR": undefined,
  "ko": undefined,
  "kr": undefined,
  "ks": undefined,
  "ku": undefined,
  "kv": undefined,
  "kw": undefined,
  "ky-KZ": undefined,
  "ky": undefined,
  "la": undefined,
  "lb": undefined,
  "lg": undefined,
  "li": undefined,
  "ln": undefined,
  "lo": undefined,
  "Lt-az-AZ": undefined,
  "lt-LT": undefined,
  "Lt-sr-SP": undefined,
  "Lt-uz-UZ": undefined,
  "lt": undefined,
  "lu": undefined,
  "lv-LV": undefined,
  "lv": undefined,
  "mg": undefined,
  "mh": undefined,
  "mi": undefined,
  "mk-MK": undefined,
  "mk": undefined,
  "ml": undefined,
  "mn-MN": undefined,
  "mn": undefined,
  "mr-IN": undefined,
  "mr": undefined,
  "ms-BN": undefined,
  "ms-MY": undefined,
  "ms": undefined,
  "mt": undefined,
  "my": undefined,
  "na": undefined,
  "nb-NO": undefined,
  "nb": undefined,
  "nd": undefined,
  "ne": undefined,
  "ng": undefined,
  "nl-BE": undefined,
  "nl-NL": undefined,
  "nl": undefined,
  "nn-NO": undefined,
  "nn": undefined,
  "no": undefined,
  "nr": undefined,
  "nv": undefined,
  "ny": undefined,
  "oc": undefined,
  "oj": undefined,
  "om": undefined,
  "or": undefined,
  "os": undefined,
  "pa-IN": undefined,
  "pa": undefined,
  "pi": undefined,
  "pl-PL": undefined,
  "pl": undefined,
  "ps": undefined,
  "pt-BR": undefined,
  "pt-PT": undefined,
  "pt": undefined,
  "qu": undefined,
  "rm": undefined,
  "rn": undefined,
  "ro-RO": undefined,
  "ro": undefined,
  "ru-RU": undefined,
  "ru": undefined,
  "rw": undefined,
  "sa-IN": undefined,
  "sa": undefined,
  "sc": undefined,
  "sd": undefined,
  "se": undefined,
  "sg": undefined,
  "si": undefined,
  "sk-SK": undefined,
  "sk": undefined,
  "sl-SI": undefined,
  "sl": undefined,
  "sm": undefined,
  "sn": undefined,
  "so": undefined,
  "sq-AL": undefined,
  "sq": undefined,
  "sr": undefined,
  "ss": undefined,
  "st": undefined,
  "su": undefined,
  "sv-FI": undefined,
  "sv-SE": undefined,
  "sv": undefined,
  "sw-KE": undefined,
  "sw": undefined,
  "ta-IN": undefined,
  "ta": undefined,
  "te-IN": undefined,
  "te": undefined,
  "tg": undefined,
  "th-TH": undefined,
  "th": undefined,
  "ti": undefined,
  "tk": undefined,
  "tl": undefined,
  "tn": undefined,
  "to": undefined,
  "tr-TR": undefined,
  "tr": undefined,
  "ts": undefined,
  "tt-RU": undefined,
  "tt": undefined,
  "tw": undefined,
  "ty": undefined,
  "ug": undefined,
  "uk-UA": undefined,
  "uk": undefined,
  "ur-PK": undefined,
  "ur": undefined,
  "uz": undefined,
  "ve": undefined,
  "vi-VN": undefined,
  "vi": undefined,
  "vo": undefined,
  "wa": undefined,
  "wo": undefined,
  "xh": undefined,
  "yi": undefined,
  "yo": undefined,
  "za": undefined,
  "zh-CHS": undefined,
  "zh-CHT": undefined,
  "zh-CN": undefined,
  "zh-HK": undefined,
  "zh-MO": undefined,
  "zh-SG": undefined,
  "zh-TW": undefined,
  "zh": undefined,
  "zu": undefined,
}

function propagateMessagesToOtherSimilarLanguageLocales(messages: CliMessages, language: AvailableLanguages) {
  const similarLanguages = Object.keys(Messages).filter(key => key.startsWith(language) && key !== language);
  similarLanguages.forEach(similarLanguage => {
    Messages[similarLanguage as AvailableLanguages] = messages;
  })
}

propagateMessagesToOtherSimilarLanguageLocales(Messages["en"] as CliMessages, "en");
propagateMessagesToOtherSimilarLanguageLocales(Messages["fr"] as CliMessages, "fr");
propagateMessagesToOtherSimilarLanguageLocales(Messages["it"] as CliMessages, "it");
propagateMessagesToOtherSimilarLanguageLocales(Messages["es"] as CliMessages, "es");

const lang = getLanguage();

const MessagesForCurrentLanguage = Messages[lang] ?? Messages["en"] as CliMessages;

export default MessagesForCurrentLanguage;
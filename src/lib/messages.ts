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
  "en-US": {
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
      "diffs": "diffs"
    },
    errors: {
      "no-diff": "No changes to commit",
    }
  },
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
  "en": undefined,
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
  "es": undefined,
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
  "fr-FR": {
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
      "diffs": "différences"
    },
    errors: {
      "no-diff": "Aucun changement à commiter",
    },
  },
  "fr-LU": undefined,
  "fr-MC": undefined,
  "fr": undefined,
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
  "it-IT": {
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
      "accept-yes-no": { text: "Accetti? (S)i, (n)o > ", answers: {} },
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
      "diffs": "differenze"
    },
    errors: {
      "no-diff": "Nessuna modifica da commitare",
    }
  },
  "it": undefined,
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

Messages.fr = Messages["fr-FR"] as CliMessages;
Messages["fr-CA"] = Messages["fr-FR"] as CliMessages;
Messages["fr-BE"] = Messages["fr-FR"] as CliMessages;
Messages["fr-CH"] = Messages["fr-FR"] as CliMessages;
Messages["fr-LU"] = Messages["fr-FR"] as CliMessages;
Messages["fr-MC"] = Messages["fr-FR"] as CliMessages;

Messages["it"] = Messages["it-IT"] as CliMessages;
Messages["it-CH"] = Messages["it-IT"] as CliMessages;

const lang = getLanguage();
const MessagesForCurrentLanguage = Messages[process.env.LANG as LanguageLocales] ?? Messages[lang] as CliMessages;

export default MessagesForCurrentLanguage;
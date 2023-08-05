import { AvailableLanguages, CliMessages, CliPossibleAnswers, CliPrompt, Messages } from "../types.js";
import invariant from "./invariant.js";

export function getLanguage() {
  //TODO: use config file to set language
  let locale = Intl.DateTimeFormat().resolvedOptions().locale ?? (process.env.LANG)?.split('.')[0];
  return locale as AvailableLanguages;
}


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
      "accept-summary-selection": {
        text: "Accept which summary?"
      },
      "accept-summary-single": { text: "Accept this summary?" },
      "combine-summaries-selection": { text: "Select the options to combine:" },
      "accept-yes-no": { text: "Accept? (Y, n) > " },
      "update-now": { text: "Would you like to update now? (Y, n) > " },
      "offer-automatic-package-bump": {
        text: "Do you want to update the package version? (Y, n) > ", answers: {
          "yes": "Y",
          "no": "n",
        }
      },
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
      "words": "words",
      "regenerate-summaries": "Regenerate summaries",
      "combine-summaries": "Combine summaries",
      "select-summarize-diff-model": "Select the model to use for summarizing diffs",
      "select-summarize-summaries-model": "Select the model to use for summarizing summaries",
      "select-cli-language": "Select the language to use for the CLI",
      "select-commit-message-language": "Select the language to use for commit messages",
      "option-push-description": "Push to remote after commit",
      "update-package-version": "The version in your package.json is the same or lower than the latest tagged version. Please update your package.json version to match the latest tag.",
      "select-version-update-type": "Select version update type:",
      // Version update types
      "major": "Major",
      "minor": "Minor",
      "patch": "Patch",

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
      "accept-summary-selection": { text: "¿Qué resumen desea aceptar?" },
      "accept-summary-single": { text: "¿Desea aceptar este resumen?" },
      "combine-summaries-selection": { text: "Introduzca los números de los mensajes de commit a combinar, separados por espacios > " },
      "accept-yes-no": {
        text: "¿Aceptar? (S)i, (n)o > ", answers: {
          "yes": "S",
          "no": "n",
        }
      },
      "update-now": { text: "¿Desea actualizar ahora? (S)i, (n)o > ", answers: { "yes": "S", "no": "n" } },
      "offer-automatic-package-bump": {
        text: "¿Desea actualizar la versión del paquete? (S)i, (n) > ", answers: {
          "yes": "S",
          "no": "n",
        }
      }
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
      "words": "palabras",
      "regenerate-summaries": "Regenerar resúmenes",
      "combine-summaries": "Combinar resúmenes",
      "select-summarize-diff-model": "Seleccione el modelo a utilizar para resumir las diferencias",
      "select-summarize-summaries-model": "Seleccione el modelo a utilizar para resumir los resúmenes",
      "select-cli-language": "Seleccione el idioma a utilizar para la CLI",
      "select-commit-message-language": "Seleccione el idioma a utilizar para los mensajes de commit",
      "option-push-description": "Empuja a remoto después del commit",
      "update-package-version": "La versión en su package.json es la misma o inferior a la última versión etiquetada. Actualice la versión de su package.json para que coincida con la última etiqueta.",
      "select-version-update-type": "Seleccione el tipo de actualización de versión:",
      "major": "Mayor",
      "minor": "Menor",
      "patch": "Parche",
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
      "accept-summary-single": { text: "Accepter ce résumé ?" },
      "accept-summary-selection": { text: "Accepter quel résumé ?" },
      "combine-summaries-selection": { text: "Sélectionnez les options à combiner:" },
      "accept-yes-no": {
        text: "Accepter ? (O)ui, (n)o > ", answers: {
          "yes": "O",
          "no": "n",
        }
      },
      "update-now": { text: "Voulez-vous mettre à jour maintenant ? (O)ui, (n)o > ", answers: { "yes": "O", "no": "n" } },
      "offer-automatic-package-bump": {
        text: "Voulez-vous mettre à jour la version du package (O)ui, (n)o >", answers: {
          "yes": "O",
          "no": "n",
        }
      }
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
      "words": "mots",
      "combine-summaries": "Combiner les résumés",
      "regenerate-summaries": "Régénérer les résumés",
      "select-summarize-diff-model": "Sélectionnez le modèle à utiliser pour résumer les différences",
      "select-summarize-summaries-model": "Sélectionnez le modèle à utiliser pour résumer les résumés",
      "select-cli-language": "Sélectionnez la langue à utiliser pour l'interface en ligne de commande",
      "select-commit-message-language": "Sélectionnez la langue à utiliser pour les messages de commit",
      "option-push-description": "Pousser vers la télécommande après le commit",
      "update-package-version": "La version de votre package.json est identique ou inférieure à la dernière version étiquetée. Veuillez mettre à jour la version de votre package.json pour qu'elle corresponde à la dernière étiquette.",
      "select-version-update-type": "Sélectionnez le type de mise à jour de la version :",
      "major": "Majeur",
      "minor": "Mineur",
      "patch": "Patch",
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
      "accept-summary-single": { text: "Accetti questo riepilogo?" },
      "accept-summary-selection": { text: "Accetta quale riepilogo?" },
      "combine-summaries-selection": { text: "Seleziona le opzioni da combinare:" },
      "accept-yes-no": {
        text: "Accetti? (S)i, (n)o > ", answers: {
          "yes": "S",
          "no": "n",
        }
      },
      "update-now": { text: "Vuoi aggiornare ora? (S)i, (n)o > ", answers: { "yes": "S", "no": "n" } },
      "offer-automatic-package-bump": {
        text: "Vuoi aggiornare la versione del pacchetto? (S)i, (n)o > ", answers: {
          "yes": "S",
          "no": "n",
        }
      }
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
      "words": "parole",
      "combine-summaries": "Combina i riepiloghi",
      "regenerate-summaries": "Rigenera i riepiloghi",
      "select-summarize-diff-model": "Seleziona il modello da utilizzare per riassumere le differenze",
      "select-summarize-summaries-model": "Seleziona il modello da utilizzare per riassumere i riepiloghi",
      "select-cli-language": "Seleziona la lingua da utilizzare per la CLI",
      "select-commit-message-language": "Seleziona la lingua da utilizzare per i messaggi di commit",
      "option-push-description": "Esegui push sul remoto dopo il commit",
      "update-package-version": "La versione del tuo package.json è uguale o inferiore all'ultima versione taggata. Aggiorna la versione del tuo package.json per corrispondere all'ultimo tag.",
      "select-version-update-type": "Seleziona il tipo di aggiornamento della versione:",
      "major": "Maggiore",
      "minor": "Minore",
      "patch": "Patch",
    },
    errors: {
      "no-diff": "Nessuna modifica da commitare",
    }
  },
  "iu": undefined,
  "ja-JP": undefined,
  "ja": {
    "prompts": {
      "enter-openai-key": {
        "text": "OpenAIのAPIキーを入力してください > ",
        "answers": {
          "open-ended": "o"
        }
      },
      "unstaged-commits-confirm-add": {
        "text": "ステージングされていないコミットがあります。コミットメッセージを生成する前にステージングしますか？ (はい, いいえ) > ",
        "answers": {
          "yes": "は",
          "no": "い"
        }
      },
      "accept-summary-selection": {
        "text": "どの要約を受け入れますか"
      },
      "accept-summary-single": {
        "text": "この要約を受け入れますか？"
      },
      "combine-summaries-selection": {
        "text": "結合するオプションを選択してください:",
      },
      "accept-yes-no": {
        "text": "受け入れますか？ (はい, いいえ) > ",
        "answers": {
          "yes": "は",
          "no": "い"
        }
      },
      "update-now": {
        "text": "今すぐアップデートしますか？ (はい, いいえ) > ",
        "answers": {
          "yes": "は",
          "no": "い"
        }
      },
      "offer-automatic-package-bump": {
        "text": "パッケージのバージョンを更新しますか？ (はい, いいえ) > ",
        "answers": {
          "yes": "は",
          "no": "い"
        }
      }
    },
    "messages": {
      "staging-all-files": "すべてのファイルをステージングしています...",
      "openai-key-required": "OPENAI_API_KEY環境変数を設定するか、`ava-commit --configure`を実行する必要があります",
      "using-cached-summaries": "前回の実行からのキャッシュされた要約とコミットメッセージを使用しています。",
      "summaries-combined-confirmation": "結合されたコミットメッセージ:",
      "aborting-commit": "コミットを中止",
      "selected-commit-message": "選択されたコミットメッセージ: ",
      "welcome": "{name}へようこそ。これはAIによるコミットメッセージジェネレーターです。",
      "description": "このツールは、より良いコミットメッセージの作成を支援します。",
      "openai-api-key-instructons": "このツールを使用するには、OpenAIのAPIキーが必要です。ここで取得できます: 🔗 https://platform.openai.com/account/api-keys",
      "commit-message-options": "コミットメッセージのオプション:",
      "ava-is-combining-summaries": "Avaは{summaryCount}の要約を結合しています...",
      "ava-is-working": "Avaが作業中...",
      "characters": "文字",
      "summarizing": "要約中",
      "summarized": "要約済み",
      "summaries": "要約",
      "diffs": "差分",
      "update-available-header": "アップデートが利用可能です",
      "update-available-body": "は最新版ではありません。最新バージョンは",
      "run": "実行",
      "to-update": "アップデートするには",
      "update-confirmation": "次のパッケージがアップデートされました: ",
      "version": "バージョン",
      "update-command-description": "アップデートを確認",
      "release-notes-command-description": "最新のタグからの変更に基づいてリリースノートを生成",
      "configure-command-description": "ツールの設定",
      "generate-command-description": "コミットメッセージの生成",
      "option-all-description": "全てのコミット、ステージングされたものだけでなく",
      "option-verbose-description": "詳細な出力",
      "option-length-description": "コミットメッセージの長さ",
      "option-configure-description": "ツールの設定",
      "example-1": "$ ava-commit generate                # すべてデフォルトでステージングされたファイルのコミットメッセージを生成",
      "example-2": "$ ava-commit generate --all          # ステージングされたファイルのチェックをバイパスして、ステージングされたファイルのコミットメッセージを生成",
      "example-3": "$ ava-commit generate --length 150   # 最大要約を150文字にターゲットにして、ステージングされたファイルのコミットメッセージを生成",
      "usage": "コマンド [オプション]",
      "display-help-for-a-command": "コマンドのヘルプを表示",
      "display-version-information": "バージョン情報を表示",
      "words": "単語",
      "combine-summaries": "要約を結合",
      "regenerate-summaries": "要約を再生成",
      "select-summarize-diff-model": "差分の要約に使用するモデルを選択",
      "select-summarize-summaries-model": "要約の要約に使用するモデルを選択",
      "select-cli-language": "CLIに使用する言語を選択",
      "select-commit-message-language": "コミットメッセージに使用する言語を選択",
      "option-push-description": "コミット後にリモートにプッシュ",
      "update-package-version": "package.jsonのバージョンが最新のタグと同じかそれよりも低いです。package.jsonのバージョンを最新のタグと一致するように更新してください。",
      "select-version-update-type": "バージョンの更新タイプを選択:",
      "major": "メジャー",
      "minor": "マイナー",
      "patch": "パッチ",
    },
    "errors": {
      "no-diff": "コミットする変更がありません",
    }
  },
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
  "ru": {
    "prompts": {
      "enter-openai-key": {
        "text": "Введите ваш API-ключ OpenAI > ",
        "answers": {
          "open-ended": "o"
        }
      },
      "unstaged-commits-confirm-add": {
        "text": "У вас есть несформированные коммиты. Хотите ли вы их сформировать перед генерацией сообщений коммитов? (Да, нет) > ",
        "answers": {
          "yes": "д",
          "no": "н"
        }
      },
      "accept-summary-selection": {
        text: "Какую сводку принять?",
        "answers": {
          "none": "н",
          "combine": "с",
          "regenerate": "р"
        }
      },
      "accept-summary-single": {
        "text": "Принять эту сводку?"
      },
      "combine-summaries-selection": {
        "text": "Выберите опции для объединения:",
      },
      "accept-yes-no": {
        "text": "Принимаете? (Да, нет) > ",
        "answers": {
          "yes": "д",
          "no": "н"
        }
      },
      "update-now": {
        "text": "Хотите ли вы обновить сейчас? (Да, нет) > ",
        "answers": {
          "yes": "д",
          "no": "н"
        }
      },
      "offer-automatic-package-bump": {
        "text": "Хотите обновить версию пакета? (Да, нет) > ",
        "answers": {
          "yes": "д",
          "no": "н"
        }
      }
    },
    "messages": {
      "staging-all-files": "Формирование всех файлов...",
      "openai-key-required": "Вы должны установить переменную окружения OPENAI_API_KEY или выполнить команду `ava-commit --configure`",
      "using-cached-summaries": "Использование кешированных сводок и сообщений коммитов из предыдущего запуска.",
      "summaries-combined-confirmation": "Объединенное сообщение коммита:",
      "aborting-commit": "Прерывание коммита",
      "selected-commit-message": "Выбранное сообщение коммита: ",
      "welcome": "Добро пожаловать в {name}, генератор сообщений коммитов, работающий на основе AI.",
      "description": "Этот инструмент поможет вам написать лучшие сообщения коммитов.",
      "openai-api-key-instructons": "Чтобы использовать этот инструмент, вам понадобится API-ключ OpenAI. Вы можете получить его здесь: 🔗 https://platform.openai.com/account/api-keys",
      "commit-message-options": "Опции сообщений коммитов:",
      "ava-is-combining-summaries": "Ava объединяет {summaryCount} сводок...",
      "ava-is-working": "Ava работает...",
      "characters": "символы",
      "summarizing": "Сводка",
      "summarized": "Сформировано",
      "summaries": "сводки",
      "diffs": "различия",
      "update-available-header": "Доступно обновление",
      "update-available-body": "устарел. Последняя версия - ",
      "run": "Запустить",
      "to-update": "для обновления",
      "update-confirmation": "Следующие пакеты были обновлены: ",
      "version": "Версия",
      "update-command-description": "Проверить обновления",
      "release-notes-command-description": "Генерирует заметки о выпуске на основе изменений с момента последнего тега",
      "configure-command-description": "Настройка инструмента",
      "generate-command-description": "Создать сообщение коммита",
      "option-all-description": "Все коммиты, а не только сформированные",
      "option-verbose-description": "Подробный вывод",
      "option-length-description": "Длина сообщения коммита",
      "option-configure-description": "Настроить инструмент",
      "example-1": "$ ava-commit generate                # создать сообщение коммита для сформированных файлов со всеми настройками по умолчанию",
      "example-2": "$ ava-commit generate --all          # создать сообщение коммита для сформированных файлов, обходя проверку сформированных файлов",
      "example-3": "$ ava-commit generate --length 150   # создать сообщение коммита для сформированных файлов, нацеливаясь на максимальную сводку из 150 символов",
      "usage": "команда [опции]",
      "display-help-for-a-command": "Показать помощь для команды",
      "display-version-information": "Показать информацию о версии",
      "words": "слова",
      "combine-summaries": "Объединить сводки",
      "regenerate-summaries": "Сформировать сводки",
      "select-summarize-diff-model": "Выберите модель для сводки различий",
      "select-summarize-summaries-model": "Выберите модель для сводки сводок",
      "select-cli-language": "Выберите язык для CLI",
      "select-commit-message-language": "Выберите язык для сообщений коммитов",
      "option-push-description": "Пушить в удаленный после коммита",
      "update-package-version": "Версия вашего package.json совпадает или ниже последней тегированной версии. Пожалуйста, обновите версию вашего package.json, чтобы она соответствовала последнему тегу.",
      "select-version-update-type": "Выберите тип обновления версии:",
      "major": "Основной",
      "minor": "Минорный",
      "patch": "Патч",
    },
    "errors": {
      "no-diff": "Нет изменений для коммита",
    }
  },
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
  "uk": {
    "prompts": {
      "enter-openai-key": {
        "text": "Введіть ключ API OpenAI > ",
        "answers": {}
      },
      "unstaged-commits-confirm-add": {
        "text": "У вас є незакомічені коміти. Хочете закомітити їх перед генерацією повідомлень коміту? (Т)ак, (н)і > ",
        "answers": {
          "yes": "Т",
          "no": "н"
        }
      },
      "accept-summary-single": {
        "text": "Прийняти це резюме?"
      },
      "accept-summary-selection": {
        "text": "Яке резюме ви хочете прийняти?"
      },
      "combine-summaries-selection": {
        "text": "Введіть номери повідомлень коміту, які слід об'єднати, розділених пробілами > "
      },
      "accept-yes-no": {
        "text": "Прийняти? (Т)ак, (н)і > ",
        "answers": {
          "yes": "Т",
          "no": "н"
        }
      },
      "update-now": {
        "text": "Бажаєте оновити зараз? (Т)ак, (н)і > ",
        "answers": {
          "yes": "Т",
          "no": "н"
        }
      },
      "offer-automatic-package-bump": {
        "text": "Бажаєте оновити версію пакета? (Т)ак, (н)і > ",
        "answers": {
          "yes": "Т",
          "no": "н"
        }
      }
    },
    messages: {
      "staging-all-files": "Підготовка всіх файлів...",
      "openai-key-required": "Ви повинні встановити змінну середовища OPENAI_API_KEY або запустити ava-commit --configure",
      "using-cached-summaries": "Використання кешованих резюме та повідомлень коміту з попереднього запуску.",
      "summaries-combined-confirmation": "Комбіноване повідомлення коміту:",
      "aborting-commit": "Переривання коміту",
      "selected-commit-message": "Вибране повідомлення коміту: ",
      "welcome": "Ласкаво просимо до {name}, генератора повідомлень коміту на основі ШІ.",
      "description": "Цей інструмент допоможе вам писати кращі повідомлення коміту.",
      "ava-is-combining-summaries": "Ava об'єднує {summaryCount} резюме...",
      "ava-is-working": "Ava працює...",
      "characters": "символів",
      "summarizing": "Резюмування",
      "summarized": "Резюмовано",
      "summaries": "резюме",
      "diffs": "різниці",
      "update-available-header": "Доступне оновлення",
      "update-available-body": "застаріло. Остання версія є",
      "run": "Запустити",
      "to-update": "щоб оновити",
      "update-confirmation": "Наступні пакети було оновлено:",
      "commit-message-options": "Опції повідомлень коміту:",
      "openai-api-key-instructons": "Щоб використовувати цей інструмент, вам потрібен ключ API OpenAI. Ви можете отримати його тут: 🔗 https://platform.openai.com/account/api-keys",
      "version": "Версія",
      "update-command-description": "Перевіряє наявність оновлень",
      "release-notes-command-description": "Генерує примітки до релізу на основі змін з моменту останньої мітки",
      "configure-command-description": "Налаштувати інструмент",
      "generate-command-description": "Генерує повідомлення коміту",
      "option-all-description": "Bci коміти, не тільки підготовлені",
      "option-verbose-description": "Докладний вивід",
      "option-length-description": "Довжина повідомлення коміту",
      "option-configure-description": "Налаштувати інструмент",
      "example-1": "$ ava-commit generate # створює повідомлення коміту для підготовлених файлів з усіма типовими значеннями",
      "example-2": "$ ava-commit generate --all # створює повідомлення коміту для підготовлених файлів, оминувши перевірку підготовлених файлів",
      "example-3": "$ ava-commit generate --length 150 # створює повідомлення коміту для підготовлених файлів, маючи на меті максимальне резюме у 150 символів",
      "usage": "команда [опції]",
      "display-help-for-a-command": "Показати довідку для команди",
      "display-version-information": "Показати інформацію про версію",
      "words": "слів",
      "regenerate-summaries": "Регенерувати резюме",
      "combine-summaries": "Об'єднати резюме",
      "select-summarize-diff-model": "Виберіть модель для резюмування різниці",
      "select-summarize-summaries-model": "Виберіть модель для резюмування резюме",
      "select-cli-language": "Виберіть мову для використання в CLI",
      "select-commit-message-language": "Виберіть мову для повідомлень коміту",
      "option-push-description": "Пуш на віддалений сервер після коміту",
      "update-package-version": "Версія у вашому package.json така сама або нижча, ніж остання помічена версія. Оновіть версію вашого package.json, щоб вона співпадала з останньою міткою.",
      "select-version-update-type": "Виберіть тип оновлення версії:",
      "major": "Основний",
      "minor": "Мінорний",
      "patch": "Патч",
    },
    "errors": {
      "no-diff": "Немає змін для коміту"
    }
  },
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
propagateMessagesToOtherSimilarLanguageLocales(Messages["ru"] as CliMessages, "ru");
propagateMessagesToOtherSimilarLanguageLocales(Messages["ja"] as CliMessages, "ja");
propagateMessagesToOtherSimilarLanguageLocales(Messages["uk"] as CliMessages, "uk");

const lang = getLanguage();

const MessagesForCurrentLanguage = Messages[lang] ?? Messages["en"] as CliMessages;

export default MessagesForCurrentLanguage;
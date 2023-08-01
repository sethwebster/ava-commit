import { AvailableLanguages, LanguageLocales } from "./configure.js"

type CliMessages = {
  prompts: {
    "enter-openai-key": string;
  },
  errors: {
    "no-diff": string;
  }
}

type Messages = {
  [key in AvailableLanguages]: CliMessages | undefined;
};

const Messages: Messages = {
  "en-us": {
    prompts: {
      "enter-openai-key": "Enter your OpenAI API key > ",
    },
    errors: {
      "no-diff": "No changes to commit",
    }
  },
  "en-au": undefined,
  "en-ca": undefined,
  "en-gb": undefined,
  "en-in": undefined,
  "en-ie": undefined,
  "en-jm": undefined,
  "en-nz": undefined,
  "en-ph": undefined,
  "en-sg": undefined,
  "en-za": undefined,
  "en-tt": undefined,
  "en-zw": undefined,
  "en-bz": undefined,
  "en-hk": undefined,
  "en-my": undefined,
  "en-pk": undefined,
  "en-ng": undefined,
  "en-gh": undefined,
  "en-ke": undefined,
  "en-ug": undefined,
  "en-tz": undefined,  
}

const MessagesForCurrentLanguage = Messages[process.env.LANG as LanguageLocales] ?? Messages["en-us"] as CliMessages;

export default MessagesForCurrentLanguage;
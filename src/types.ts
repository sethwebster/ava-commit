import { Separator } from "@inquirer/prompts";

export const SupportedAIModels = ["gpt-4", "gpt-3.5-turbo-16k"] as const;
export const SupportedAIModelNames = ["GPT-4", "GPT-3.5 Turbo 16k"] as const;

export type SupportedAIModelsType = typeof SupportedAIModels[number];
export type SupportedAIModelNamesType = typeof SupportedAIModelNames[number];

export type SupportedAIModelDetails = {
  text: SupportedAIModelNamesType,
  description: string,
}

export type SupportedAIModelInformation = {
  [key in SupportedAIModelsType]: SupportedAIModelDetails;
}

export const AIModels: SupportedAIModelInformation = {
  "gpt-4": { text: "GPT-4", description: "Currently the best model available" },
  "gpt-3.5-turbo-16k": { text: "GPT-3.5 Turbo 16k", description: "A totally capable model" },
}

export interface Options {
  openAIApiKey: string | undefined;
  summarizeDiffModel: SupportedAIModelsType;
  summarizeSummariesModel: SupportedAIModelsType;
  cliLanguage: LanguageLocales
  commitMessageLanguage: LanguageLocales;
}

export const AllLanguageLocales = [
  "Cy-az-AZ",
  "Cy-sr-SP",
  "Cy-uz-UZ",
  "Lt-az-AZ",
  "Lt-sr-SP",
  "Lt-uz-UZ",
  "aa",
  "ab",
  "ae",
  "af",
  "af-ZA",
  "ak",
  "am",
  "an",
  "ar",
  "ar-AE",
  "ar-BH",
  "ar-DZ",
  "ar-EG",
  "ar-IQ",
  "ar-JO",
  "ar-KW",
  "ar-LB",
  "ar-LY",
  "ar-MA",
  "ar-OM",
  "ar-QA",
  "ar-SA",
  "ar-SY",
  "ar-TN",
  "ar-YE",
  "as",
  "av",
  "ay",
  "az",
  "ba",
  "be",
  "be-BY",
  "bg",
  "bg-BG",
  "bh",
  "bi",
  "bm",
  "bn",
  "bo",
  "br",
  "bs",
  "ca",
  "ca-ES",
  "ce",
  "ch",
  "co",
  "cr",
  "cs",
  "cs-CZ",
  "cu",
  "cv",
  "cy",
  "da",
  "da-DK",
  "de",
  "de-AT",
  "de-CH",
  "de-DE",
  "de-LI",
  "de-LU",
  "div-MV",
  "dv",
  "dz",
  "ee",
  "el",
  "el-GR",
  "en",
  "en-AU",
  "en-BZ",
  "en-CA",
  "en-CB",
  "en-GB",
  "en-IE",
  "en-JM",
  "en-NZ",
  "en-PH",
  "en-TT",
  "en-US",
  "en-ZA",
  "en-ZW",
  "eo",
  "es",
  "es-AR",
  "es-BO",
  "es-CL",
  "es-CO",
  "es-CR",
  "es-DO",
  "es-EC",
  "es-ES",
  "es-GT",
  "es-HN",
  "es-MX",
  "es-NI",
  "es-PA",
  "es-PE",
  "es-PR",
  "es-PY",
  "es-SV",
  "es-UY",
  "es-VE",
  "et",
  "et-EE",
  "eu",
  "eu-ES",
  "fa",
  "fa-IR",
  "ff",
  "fi",
  "fi-FI",
  "fj",
  "fo",
  "fo-FO",
  "fr",
  "fr-BE",
  "fr-CA",
  "fr-CH",
  "fr-FR",
  "fr-LU",
  "fr-MC",
  "fy",
  "ga",
  "gd",
  "gl",
  "gl-ES",
  "gn",
  "gu",
  "gu-IN",
  "gv",
  "ha",
  "he",
  "he-IL",
  "hi",
  "hi-IN",
  "ho",
  "hr",
  "hr-HR",
  "ht",
  "hu",
  "hu-HU",
  "hy",
  "hy-AM",
  "hz",
  "ia",
  "id",
  "id-ID",
  "ie",
  "ig",
  "ii",
  "ik",
  "io",
  "is",
  "is-IS",
  "it",
  "it-CH",
  "it-IT",
  "iu",
  "ja",
  "ja-JP",
  "jv",
  "ka",
  "ka-GE",
  "kg",
  "ki",
  "kj",
  "kk",
  "kk-KZ",
  "kl",
  "km",
  "kn",
  "kn-IN",
  "ko",
  "ko-KR",
  "kr",
  "ks",
  "ku",
  "kv",
  "kw",
  "ky",
  "ky-KZ",
  "la",
  "lb",
  "lg",
  "li",
  "ln",
  "lo",
  "lt",
  "lt-LT",
  "lu",
  "lv",
  "lv-LV",
  "mg",
  "mh",
  "mi",
  "mk",
  "mk-MK",
  "ml",
  "mn",
  "mn-MN",
  "mr",
  "mr-IN",
  "ms",
  "ms-BN",
  "ms-MY",
  "mt",
  "my",
  "na",
  "nb",
  "nb-NO",
  "nd",
  "ne",
  "ng",
  "nl",
  "nl-BE",
  "nl-NL",
  "nn",
  "nn-NO",
  "no",
  "nr",
  "nv",
  "ny",
  "oc",
  "oj",
  "om",
  "or",
  "os",
  "pa",
  "pa-IN",
  "pi",
  "pl",
  "pl-PL",
  "ps",
  "pt",
  "pt-BR",
  "pt-PT",
  "qu",
  "rm",
  "rn",
  "ro",
  "ro-RO",
  "ru",
  "ru-RU",
  "rw",
  "sa",
  "sa-IN",
  "sc",
  "sd",
  "se",
  "sg",
  "si",
  "sk",
  "sk-SK",
  "sl",
  "sl-SI",
  "sm",
  "sn",
  "so",
  "sq",
  "sq-AL",
  "sr",
  "ss",
  "st",
  "su",
  "sv",
  "sv-FI",
  "sv-SE",
  "sw",
  "sw-KE",
  "ta",
  "ta-IN",
  "te",
  "te-IN",
  "tg",
  "th",
  "th-TH",
  "ti",
  "tk",
  "tl",
  "tn",
  "to",
  "tr",
  "tr-TR",
  "ts",
  "tt",
  "tt-RU",
  "tw",
  "ty",
  "ug",
  "uk",
  "uk-UA",
  "ur",
  "ur-PK",
  "uz",
  "ve",
  "vi",
  "vi-VN",
  "vo",
  "wa",
  "wo",
  "xh",
  "yi",
  "yo",
  "za",
  "zh",
  "zh-CHS",
  "zh-CHT",
  "zh-CN",
  "zh-HK",
  "zh-MO",
  "zh-SG",
  "zh-TW",
  "zu"
] as const;

export type LanguageLocales = typeof AllLanguageLocales[number];

export const AvailableLanguages: LanguageLocales[] = [
  "en-US",
  "fr-FR",
  "fr",
  "fr-BE",
  "fr-CA",
  "fr-LU",
  "fr-MC",
  "it",
  "it-CH",
  "it-IT"
] as LanguageLocales[]

export type AvailableLanguages = typeof AvailableLanguages[number];

export type CliPossibleAnswers = {
  "yes"?: string;
  "no"?: string;
  "combine"?: string;
  "regenerate"?: string;
  "none"?: string;
  "open-ended"?: string;
}

export type CliPrompt = {
  text: string;
  answers?: CliPossibleAnswers;
}

export type CliMessages = {
  prompts: {
    "enter-openai-key": CliPrompt;
    "unstaged-commits-confirm-add": CliPrompt;
    "accept-summary-single": CliPrompt;
    "accept-summary-selection": CliPrompt;
    "combine-summaries-selection": CliPrompt;
    "accept-yes-no": CliPrompt;
    "update-now": CliPrompt;
    "offer-automatic-package-bump": CliPrompt;
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
    "words": string;
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
    "option-push-description": string;
    "example-1": string;
    "example-2": string;
    "example-3": string;
    "usage": string;
    "display-help-for-a-command": string;
    "display-version-information": string;
    "combine-summaries": string;
    "regenerate-summaries": string;
    "select-summarize-diff-model": string;
    "select-summarize-summaries-model": string;
    "select-cli-language": string;
    "select-commit-message-language": string;
    "update-package-version": string;
    "select-version-update-type": string;
    "patch": string;
    "minor": string;
    "major": string;
    "latest-tagged-is-greater-than-local-but-npm-is-newer": string;
    "npm-is-newer-than-local": string;

  }
  errors: {
    "no-diff": string;
  }
}

export type Messages = {
  [key in AvailableLanguages]: CliMessages | undefined;
};

export interface GenerateOptions {
  verbose: boolean;
  all: boolean;
  length: number;
  releaseNotes: boolean;
  noCache?: boolean;
  push?: boolean;
  /**
   * list of patterns supplied to ignore
   */
  ignore?: string[];
}

export type Choice<Value> = {
  value: Value;
  name?: string;
  description?: string;
  disabled?: boolean | string;
  type?: never;
};

export type ChoicesType<T> = (Separator | Choice<T>);

export interface GenerateContext {
  diffs: string[];
  summaries: string[];
  commitMessages: string[];
  openAIApiKey: string;
}

export type GenerateStatusWithContext = {
  status: "complete" | "continue" | "error";
} & GenerateContext;

/** @typedef {import('../package.json') T_npm_packageJSON } */

export type VersionInfo = {
  packageJsonVersion: string;
  latestTaggedGitVersion: string;
  latestNpmVersion: string;
  previousTaggedGitVersion: string;
};

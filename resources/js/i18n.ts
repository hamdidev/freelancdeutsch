// resources/js/i18n.ts
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import de from "./locales/de.json";
import en from "./locales/en.json";

const STORAGE_KEY = "fd_lang";
const savedLng =
    typeof window !== "undefined"
        ? (localStorage.getItem(STORAGE_KEY) ?? "de")
        : "de";

i18n.use(initReactI18next).init({
    resources: {
        de: { translation: de },
        en: { translation: en },
    },
    lng: savedLng,
    fallbackLng: "en",
    interpolation: { escapeValue: false },
});

i18n.on("languageChanged", (lng) => {
    if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEY, lng);
    }
});

export default i18n;

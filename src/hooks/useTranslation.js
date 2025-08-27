import { useLanguage } from "../context/LanguageContext";
import translationsen from "../locales/translations-en.json";
import translationskm from "../locales/translations-km.json";

const translations = {
  en: translationsen,
  km: translationskm,
};

export const useTranslation = () => {
  const { language } = useLanguage();

  const t = (key) => {
    const keys = key.split(".");
    return keys.reduce((acc, k) => acc?.[k], translations[language]) || key;
  };

  return { t };
};

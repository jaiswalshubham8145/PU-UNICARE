import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {
  en: {
    translation: {
      "dashboard": "Dashboard",
      "overview": "Overview",
      "complaints": "Complaints",
      "settings": "Settings",
      "total_complaints": "Total Complaints",
      "pending": "Pending",
      "in_progress": "In Progress",
      "completed": "Completed",
      "welcome": "Welcome back",
      "logout": "Logout"
    }
  },
  hi: {
    translation: {
      "dashboard": "डैशबोर्ड",
      "overview": "अवलोकन",
      "complaints": "शिकायतें",
      "settings": "सेटिंग्स",
      "total_complaints": "कुल शिकायतें",
      "pending": "लंबित",
      "in_progress": "प्रगति पर है",
      "completed": "पूरा हो गया",
      "welcome": "वापसी पर स्वागत है",
      "logout": "लॉग आउट"
    }
  },
  gu: {
    translation: {
      "dashboard": "ડેશબોર્ડ",
      "overview": "ઝાંખી",
      "complaints": "ફરિયાદો",
      "settings": "સેટિંગ્સ",
      "total_complaints": "કુલ ફરિયાદો",
      "pending": "બાકી",
      "in_progress": "પ્રગતિમાં છે",
      "completed": "પૂર્ણ થયું",
      "welcome": "ફરી સ્વાગત છે",
      "logout": "લૉગ આઉટ"
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: "en", // default language
    fallbackLng: "en",
    interpolation: {
      escapeValue: false // react already safes from xss
    }
  });

export default i18n;

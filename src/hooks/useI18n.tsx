import { createContext, useContext, useState, ReactNode } from 'react';

export type Language = 'en' | 'hi' | 'gu';

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.about': 'About',
    'nav.maintenance': 'Maintenance',
    'nav.track': 'Track',
    'nav.help': 'Help',
    'nav.contact': 'Contact',
    'nav.login': 'Login',
    'nav.signup': 'Sign Up',
    'nav.dashboard': 'Dashboard',
    'nav.profile': 'Profile',
    'nav.settings': 'Settings',
    'nav.notifications': 'Notifications',
    'nav.logout': 'Sign Out',

    // Common
    'common.loading': 'Loading...',
    'common.error': 'Something went wrong',
    'common.retry': 'Try Again',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.submit': 'Submit',
    'common.search': 'Search...',
    'common.filter': 'Filter',
    'common.export': 'Export',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.view': 'View',
    'common.close': 'Close',
    'common.back': 'Back',
    'common.next': 'Next',
    'common.previous': 'Previous',
    'common.noResults': 'No results found',
    'common.showing': 'Showing',
    'common.of': 'of',
    'common.page': 'Page',

    // Home
    'home.hero.title': 'Smart Campus Maintenance',
    'home.hero.subtitle': 'AI-powered complaint management for Parul University',
    'home.hero.cta': 'Report Issue',
    'home.hero.track': 'Track Complaint',

    // Complaint
    'complaint.register': 'Register Complaint',
    'complaint.track': 'Track Complaint',
    'complaint.number': 'Complaint Number',
    'complaint.title': 'Title',
    'complaint.description': 'Description',
    'complaint.category': 'Category',
    'complaint.priority': 'Priority',
    'complaint.status': 'Status',
    'complaint.location': 'Location',
    'complaint.department': 'Department',
    'complaint.submit': 'Submit Complaint',
    'complaint.trackingId': 'Tracking ID',

    // Status
    'status.pending': 'Pending',
    'status.approved': 'Approved',
    'status.inProgress': 'In Progress',
    'status.onHold': 'On Hold',
    'status.completed': 'Completed',
    'status.rejected': 'Rejected',
    'status.closed': 'Closed',
    'status.escalated': 'Escalated',

    // Priority
    'priority.low': 'Low',
    'priority.medium': 'Medium',
    'priority.high': 'High',
    'priority.critical': 'Critical',

    // Dashboard
    'dashboard.welcome': 'Welcome',
    'dashboard.totalComplaints': 'Total Complaints',
    'dashboard.pending': 'Pending',
    'dashboard.inProgress': 'In Progress',
    'dashboard.completed': 'Completed',
    'dashboard.recentActivity': 'Recent Activity',
    'dashboard.quickActions': 'Quick Actions',

    // Auth
    'auth.login': 'Sign In',
    'auth.signup': 'Create Account',
    'auth.email': 'University Email',
    'auth.password': 'Password',
    'auth.confirmPassword': 'Confirm Password',
    'auth.fullName': 'Full Name',
    'auth.role': 'Role',
    'auth.forgotPassword': 'Forgot Password?',
    'auth.noAccount': "Don't have an account?",
    'auth.hasAccount': 'Already have an account?',
    'auth.rememberMe': 'Remember me',
    'auth.resetLink': 'Send Reset Link',
    'auth.checkEmail': 'Check Your Email',

    // Roles
    'role.faculty': 'Faculty',
    'role.hod': 'Head of Department',
    'role.principal': 'Principal',
    'role.admin': 'Administrator',
    'role.maintenance': 'Maintenance Staff',

    // Footer
    'footer.quickLinks': 'Quick Links',
    'footer.contact': 'Contact Us',
    'footer.address': 'Parul University, Vadodara, Gujarat',
    'footer.rights': 'All rights reserved.',

    // Accessibility
    'a11y.skipToContent': 'Skip to main content',
    'a11y.menu': 'Menu',
    'a11y.close': 'Close',
    'a11y.open': 'Open',
  },
  hi: {
    // Navigation
    'nav.home': 'होम',
    'nav.about': 'हमारे बारे में',
    'nav.maintenance': 'रखरखाव',
    'nav.track': 'ट्रैक',
    'nav.help': 'सहायता',
    'nav.contact': 'संपर्क',
    'nav.login': 'लॉगिन',
    'nav.signup': 'साइन अप',
    'nav.dashboard': 'डैशबोर्ड',
    'nav.profile': 'प्रोफ़ाइल',
    'nav.settings': 'सेटिंग्स',
    'nav.notifications': 'सूचनाएं',
    'nav.logout': 'साइन आउट',

    // Common
    'common.loading': 'लोड हो रहा है...',
    'common.error': 'कुछ गलत हो गया',
    'common.retry': 'पुनः प्रयास करें',
    'common.save': 'सहेजें',
    'common.cancel': 'रद्द करें',
    'common.submit': 'जमा करें',
    'common.search': 'खोजें...',
    'common.filter': 'फ़िल्टर',
    'common.export': 'निर्यात',
    'common.delete': 'हटाएं',
    'common.edit': 'संपादित करें',
    'common.view': 'देखें',
    'common.close': 'बंद करें',
    'common.back': 'वापस',
    'common.next': 'अगला',
    'common.previous': 'पिछला',
    'common.noResults': 'कोई परिणाम नहीं मिला',
    'common.showing': 'दिखा रहे हैं',
    'common.of': 'का',
    'common.page': 'पृष्ठ',

    // Home
    'home.hero.title': 'स्मार्ट कैंपस रखरखाव',
    'home.hero.subtitle': 'परुल विश्वविद्यालय के लिए AI-संचालित शिकायत प्रबंधन',
    'home.hero.cta': 'समस्या रिपोर्ट करें',
    'home.hero.track': 'शिकायत ट्रैक करें',

    // Complaint
    'complaint.register': 'शिकायत दर्ज करें',
    'complaint.track': 'शिकायत ट्रैक करें',
    'complaint.number': 'शिकायत संख्या',
    'complaint.title': 'शीर्षक',
    'complaint.description': 'विवरण',
    'complaint.category': 'श्रेणी',
    'complaint.priority': 'प्राथमिकता',
    'complaint.status': 'स्थिति',
    'complaint.location': 'स्थान',
    'complaint.department': 'विभाग',
    'complaint.submit': 'शिकायत जमा करें',
    'complaint.trackingId': 'ट्रैकिंग आईडी',

    // Status
    'status.pending': 'लंबित',
    'status.approved': 'अनुमोदित',
    'status.inProgress': 'प्रगति में',
    'status.onHold': 'रोक पर',
    'status.completed': 'पूर्ण',
    'status.rejected': 'अस्वीकृत',
    'status.closed': 'बंद',
    'status.escalated': 'बढ़ाया गया',

    // Priority
    'priority.low': 'कम',
    'priority.medium': 'मध्यम',
    'priority.high': 'उच्च',
    'priority.critical': 'गंभीर',

    // Dashboard
    'dashboard.welcome': 'स्वागत है',
    'dashboard.totalComplaints': 'कुल शिकायतें',
    'dashboard.pending': 'लंबित',
    'dashboard.inProgress': 'प्रगति में',
    'dashboard.completed': 'पूर्ण',
    'dashboard.recentActivity': 'हालिया गतिविधि',
    'dashboard.quickActions': 'त्वरित कार्य',

    // Auth
    'auth.login': 'साइन इन',
    'auth.signup': 'खाता बनाएं',
    'auth.email': 'विश्वविद्यालय ईमेल',
    'auth.password': 'पासवर्ड',
    'auth.confirmPassword': 'पासवर्ड की पुष्टि करें',
    'auth.fullName': 'पूरा नाम',
    'auth.role': 'भूमिका',
    'auth.forgotPassword': 'पासवर्ड भूल गए?',
    'auth.noAccount': 'खाता नहीं है?',
    'auth.hasAccount': 'पहले से खाता है?',
    'auth.rememberMe': 'मुझे याद रखें',
    'auth.resetLink': 'रीसेट लिंक भेजें',
    'auth.checkEmail': 'अपना ईमेल जांचें',

    // Roles
    'role.faculty': 'संकाय',
    'role.hod': 'विभागाध्यक्ष',
    'role.principal': 'प्रधानाचार्य',
    'role.admin': 'प्रशासक',
    'role.maintenance': 'रखरखाव कर्मचारी',

    // Footer
    'footer.quickLinks': 'त्वरित लिंक',
    'footer.contact': 'संपर्क करें',
    'footer.address': 'परुल विश्वविद्यालय, वडोदरा, गुजरात',
    'footer.rights': 'सर्वाधिकार सुरक्षित।',

    // Accessibility
    'a11y.skipToContent': 'मुख्य सामग्री पर जाएं',
    'a11y.menu': 'मेनू',
    'a11y.close': 'बंद करें',
    'a11y.open': 'खोलें',
  },
  gu: {
    // Navigation
    'nav.home': 'હોમ',
    'nav.about': 'અમારા વિશે',
    'nav.maintenance': 'મેન્ટેનન્સ',
    'nav.track': 'ટ્રેક',
    'nav.help': 'મદદ',
    'nav.contact': 'સંપર્ક',
    'nav.login': 'લૉગિન',
    'nav.signup': 'સાઇન અપ',
    'nav.dashboard': 'ડેશબોર્ડ',
    'nav.profile': 'પ્રોફાઇલ',
    'nav.settings': 'સેટિંગ્સ',
    'nav.notifications': 'સૂચનાઓ',
    'nav.logout': 'સાઇન આઉટ',

    // Common
    'common.loading': 'લોડ થઈ રહ્યું છે...',
    'common.error': 'કંઈક ખોટું થયું',
    'common.retry': 'ફરી પ્રયાસ કરો',
    'common.save': 'સાચવો',
    'common.cancel': 'રદ કરો',
    'common.submit': 'સબમિટ કરો',
    'common.search': 'શોધો...',
    'common.filter': 'ફિલ્ટર',
    'common.export': 'એક્સપોર્ટ',
    'common.delete': 'કાઢી નાખો',
    'common.edit': 'સંપાદિત કરો',
    'common.view': 'જુઓ',
    'common.close': 'બંધ કરો',
    'common.back': 'પાછા જાઓ',
    'common.next': 'આગળ',
    'common.previous': 'પાછળ',
    'common.noResults': 'કોઈ પરિણામ મળ્યા નથી',
    'common.showing': 'દર્શાવી રહ્યાં છે',
    'common.of': 'માંથી',
    'common.page': 'પૃષ્ઠ',

    // Home
    'home.hero.title': 'સ્માર્ટ કેમ્પસ મેન્ટેનન્સ',
    'home.hero.subtitle': 'પારુલ યુનિવર્સિટી માટે AI-આધારિત ફરિયાદ નિવારણ વ્યવસ્થા',
    'home.hero.cta': 'સમસ્યા નોંધાવો',
    'home.hero.track': 'ફરિયાદ ટ્રેક કરો',

    // Complaint
    'complaint.register': 'ફરિયાદ નોંધાવો',
    'complaint.track': 'ફરિયાદ ટ્રેક કરો',
    'complaint.number': 'ફરિયાદ નંબર',
    'complaint.title': 'શીર્ષક',
    'complaint.description': 'વર્ણન',
    'complaint.category': 'શ્રેણી',
    'complaint.priority': 'પ્રાથમિકતા',
    'complaint.status': 'સ્થિતિ',
    'complaint.location': 'સ્થળ',
    'complaint.department': 'વિભાગ',
    'complaint.submit': 'ફરિયાદ સબમિટ કરો',
    'complaint.trackingId': 'ટ્રેકિંગ આઈડી',

    // Status
    'status.pending': 'બાકી',
    'status.approved': 'મંજૂર થયેલ',
    'status.inProgress': 'પ્રગતિમાં',
    'status.onHold': 'સ્થગિત',
    'status.completed': 'પૂર્ણ',
    'status.rejected': 'નકારેલ',
    'status.closed': 'બંધ',
    'status.escalated': 'ઉચ્ચ સ્તરે મોકલેલ',

    // Priority
    'priority.low': 'સામાન્ય',
    'priority.medium': 'મધ્યમ',
    'priority.high': 'ઉચ્ચ',
    'priority.critical': 'અતિ ગંભીર',

    // Dashboard
    'dashboard.welcome': 'સ્વાગત છે',
    'dashboard.totalComplaints': 'કુલ ફરિયાદો',
    'dashboard.pending': 'બાકી',
    'dashboard.inProgress': 'પ્રગતિમાં',
    'dashboard.completed': 'પૂર્ણ',
    'dashboard.recentActivity': 'તાજેતરની પ્રવૃત્તિ',
    'dashboard.quickActions': 'ઝડપી કાર્યો',

    // Auth
    'auth.login': 'સાઇન ઇન',
    'auth.signup': 'ખાતું બનાવો',
    'auth.email': 'યુનિવર્સિટી ઇમેઇલ',
    'auth.password': 'પાસવર્ડ',
    'auth.confirmPassword': 'પાસવર્ડની પુષ્ટિ કરો',
    'auth.fullName': 'પૂરું નામ',
    'auth.role': 'ભૂમિકા',
    'auth.forgotPassword': 'પાસવર્ડ ભૂલી ગયા?',
    'auth.noAccount': 'ખાતું નથી?',
    'auth.hasAccount': 'પહેલેથી ખાતું છે?',
    'auth.rememberMe': 'મને યાદ રાખો',
    'auth.resetLink': 'રીસેટ લિંક મોકલો',
    'auth.checkEmail': 'તમારું ઇમેઇલ તપાસો',

    // Roles
    'role.faculty': 'ફેકલ્ટી',
    'role.hod': 'વિભાગના વડા (HOD)',
    'role.principal': 'પ્રિન્સિપાલ',
    'role.admin': 'એડમિનિસ્ટ્રેટર',
    'role.maintenance': 'મેન્ટેનન્સ સ્ટાફ',

    // Footer
    'footer.quickLinks': 'ઝડપી લિંક્સ',
    'footer.contact': 'સંપર્ક કરો',
    'footer.address': 'પારુલ યુનિવર્સિટી, વડોદરા, ગુજરાત',
    'footer.rights': 'સર્વાધિકાર સુરક્ષિત.',

    // Accessibility
    'a11y.skipToContent': 'મુખ્ય સામગ્રી પર જાઓ',
    'a11y.menu': 'મેનૂ',
    'a11y.close': 'બંધ કરો',
    'a11y.open': 'ખોલો',
  },
};

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('pu-unicare-lang') as Language) || 'en';
    }
    return 'en';
  });

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('pu-unicare-lang', lang);
    document.documentElement.lang = lang;
  };

  const t = (key: string): string => {
    return translations[language][key] || translations.en[key] || key;
  };

  return (
    <I18nContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}

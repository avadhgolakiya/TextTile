import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useEffect, useState } from 'react';

export type Language = 'en' | 'hi' | 'gu';

export const translations = {
  en: {
    // Navigation / Core
    navHome: 'Home',
    navCart: 'Cart',
    navOrders: 'Orders',
    navProfile: 'Profile',
    navSearch: 'Search',
    navAdmin: 'Admin',
    navSaved: 'Saved Items',
    navCollection: 'Collection',
    viewCart: 'View cart',
    
    // Auth Pages
    createAccount: 'Create account',
    registerBuyer: 'Register as a wholesale buyer',
    fullName: 'Full Name',
    emailAddress: 'Email',
    mobileNumber: 'Mobile Number',
    password: 'Password',
    gstNumber: 'GST Number (auto-verify)',
    shopAddress: 'Shop Address',
    alreadyRegistered: 'Already registered?',
    signIn: 'Sign in',
    loginTitle: 'Sign In',
    loginSubtitle: 'Access your wholesale account',
    dontHaveAccount: "Don't have an account?",
    registerNow: 'Register now',
    logout: 'Logout',
    
    // Home / Search / Catalog
    featuredProducts: 'Featured Products',
    catalogHeading: 'Swastik Fashion sarees collection',
    categories: 'Categories',
    searchPlaceholder: 'Search sarees by name or code...',
    noProducts: 'No products found',
    bestSeller: 'Best Seller',
    newArrival: 'New',
    premium: 'Premium',
    itemsCount: 'items',
    todaysDrop: "Today's Drop",
    searchSarees: 'Search sarees',
    viewFullCollection: 'View full collection',
    noFeaturedProducts: 'No featured products yet.',
    loadingDrop: "Loading today's drop...",
    
    // Product Details
    productCode: 'Product Code',
    originalPrice: 'Original Price',
    discountOff: 'off',
    estimatedPrice: 'Estimated for',
    quantity: 'Set',
    noteToShop: 'Note to shop (optional)',
    whatsappOrder: 'Place order on WhatsApp',
    addToCart: 'Add to cart instead',
    productNotFound: 'Product not found',
    goBack: 'Go back',
    codeLabel: 'Code',
    pcLabel: 'pc',
    estimatedFor: 'Estimated for',
    
    // Profile Page
    wholesaleBuyer: 'Wholesale Buyer',
    profileOrders: 'Orders',
    profileSaved: 'Saved',
    profileSpent: 'Spent',
    savedProducts: 'Saved Products',
    shippingAddress: 'Shipping Address',
    paymentMethods: 'Payment Methods',
    preferences: 'Preferences',
    helpSupport: 'Help & Support',
    languageOption: 'Language Preferences',
    chooseLanguage: 'Choose App Language',
    english: 'English',
    hindi: 'Hindi (हिन्दी)',
    gujarati: 'Gujarati (ગુજરાતી)',
    maybeLater: 'Maybe Later',
    preferencesSubtitle: 'Language settings',
    helpSupportSubtitle: 'WhatsApp, FAQ',
    savedProductsSubtitle: 'Saved sarees',
    shippingAddressSubtitle: 'Surat, Gujarat',
    paymentMethodsSubtitle: 'UPI • Bank',
    accountSummary: 'Account summary',
    accountSummaryDesc: 'Manage your wholesale profile, saved items, and order history from one place.',
    changePassword: 'Change Password',
    changePasswordSubtitle: 'Update your security credentials',
    oldPassword: 'Old Password',
    newPassword: 'New Password',
    confirmPassword: 'Confirm Password',
    passwordsDoNotMatch: 'New passwords do not match',
    passwordChangedSuccess: 'Password changed successfully!',
    passwordTooShort: 'Password must be at least 6 characters',
    
    // Cart Page
    shoppingCart: 'Shopping Cart',
    subtotal: 'Subtotal',
    gstCharge: 'GST (5%)',
    shippingCharge: 'Shipping',
    freeShipping: 'FREE',
    grandTotal: 'Grand Total',
    clearCart: 'Clear Cart',
    placeOrder: 'Place wholesale order',
    cartEmpty: 'Your shopping cart is empty.',
    startShopping: 'Start shopping',
    orderSuccess: 'Order placed successfully!',
    remove: 'Remove',
    wholesaleDiscount: 'wholesale discount',
    buyerDetails: 'Buyer details',
    businessNamePlaceholder: 'Business name',
    phonePlaceholder: 'Phone number',
    placingOrder: 'Placing order...',
    
    // Orders Page
    allOrders: 'All Orders',
    pendingOrders: 'Pending',
    noPendingOrders: 'No pending orders',
    noOrdersYet: 'No orders yet',
    ordersEmptyDesc: 'Add sarees to your cart and order via WhatsApp.',
    loadingOrders: 'Loading your orders...',
    
    // Filter Page
    filterByType: 'Filter by type',
    tryAnotherCategory: 'Try selecting another category.',
  },
  hi: {
    // Navigation / Core
    navHome: 'मुख्य पृष्ठ',
    navCart: 'कार्ट',
    navOrders: 'ऑर्डर',
    navProfile: 'प्रोफ़ाइल',
    navSearch: 'खोजें',
    navAdmin: 'एडमिन',
    navSaved: 'सहेजे गए उत्पाद',
    navCollection: 'संग्रह',
    viewCart: 'कार्ट देखें',
    
    // Auth Pages
    createAccount: 'खाता बनाएं',
    registerBuyer: 'थोक खरीदार के रूप में पंजीकरण करें',
    fullName: 'पूरा नाम',
    emailAddress: 'ईमेल',
    mobileNumber: 'मोबाइल नंबर',
    password: 'पासवर्ड',
    gstNumber: 'जीएसटी नंबर (ऑटो-सत्यापन)',
    shopAddress: 'दुकान का पता',
    alreadyRegistered: 'पहले से पंजीकृत हैं?',
    signIn: 'साइन इन करें',
    loginTitle: 'साइन इन करें',
    loginSubtitle: 'अपने थोक खाते में लॉग इन करें',
    dontHaveAccount: 'खाता नहीं है?',
    registerNow: 'अभी पंजीकरण करें',
    logout: 'लॉगआउट',
    
    // Home / Search / Catalog
    featuredProducts: 'विशेष उत्पाद',
    catalogHeading: 'स्वास्तिक फैशन साड़ी संग्रह',
    categories: 'श्रेणियाँ',
    searchPlaceholder: 'नाम या कोड द्वारा साड़ियाँ खोजें...',
    noProducts: 'कोई उत्पाद नहीं मिला',
    bestSeller: 'बेस्ट सेलर',
    newArrival: 'नया',
    premium: 'प्रीमियम',
    itemsCount: 'आइटम',
    todaysDrop: 'आज का संग्रह',
    searchSarees: 'साड़ियाँ खोजें',
    viewFullCollection: 'पूरा संग्रह देखें',
    noFeaturedProducts: 'अभी कोई विशेष उत्पाद नहीं हैं।',
    loadingDrop: 'आज का संग्रह लोड हो रहा है...',
    
    // Product Details
    productCode: 'उत्पाद कोड',
    originalPrice: 'मूल मूल्य',
    discountOff: 'छूट',
    estimatedPrice: 'अनुमानित मूल्य के लिए',
    quantity: 'मात्रा',
    noteToShop: 'दुकान के लिए नोट (वैकल्पिक)',
    whatsappOrder: 'व्हाट्सएप पर ऑर्डर करें',
    addToCart: 'कार्ट में जोड़ें',
    productNotFound: 'उत्पाद नहीं मिला',
    goBack: 'वापस जाएं',
    codeLabel: 'कोड',
    pcLabel: 'नग',
    estimatedFor: 'अनुमानित मूल्य',
    
    // Profile Page
    wholesaleBuyer: 'थोक खरीदार',
    profileOrders: 'ऑर्डर',
    profileSaved: 'सहेजें',
    profileSpent: 'खर्च',
    savedProducts: 'सहेजे गए उत्पाद',
    shippingAddress: 'शिपिंग पता',
    paymentMethods: 'भुगतान के तरीके',
    preferences: 'प्राथमिकताएं',
    helpSupport: 'सहायता एवं समर्थन',
    languageOption: 'भाषा विकल्प',
    chooseLanguage: 'ऐप की भाषा चुनें',
    english: 'English (अंग्रेज़ी)',
    hindi: 'Hindi (हिन्दी)',
    gujarati: 'Gujarati (ગુજરાતી)',
    maybeLater: 'बाद में',
    preferencesSubtitle: 'भाषा प्राथमिकताएं',
    helpSupportSubtitle: 'व्हाट्सएप, एफएक्यू',
    savedProductsSubtitle: 'सहेजी गई साड़ियाँ',
    shippingAddressSubtitle: 'सूरत, गुजरात',
    paymentMethodsSubtitle: 'यूपीआई • बैंक',
    accountSummary: 'खाता विवरण',
    accountSummaryDesc: 'एक ही स्थान से अपनी थोक प्रोफ़ाइल, सहेजे गए आइटम और ऑर्डर इतिहास प्रबंधित करें।',
    changePassword: 'पासवर्ड बदलें',
    changePasswordSubtitle: 'अपनी सुरक्षा क्रेडेंशियल अपडेट करें',
    oldPassword: 'पुराना पासवर्ड',
    newPassword: 'नया पासवर्ड',
    confirmPassword: 'पासवर्ड की पुष्टि करें',
    passwordsDoNotMatch: 'नए पासवर्ड मेल नहीं खाते',
    passwordChangedSuccess: 'पासवर्ड सफलतापूर्वक बदल गया!',
    passwordTooShort: 'पासवर्ड कम से कम 6 अक्षरों का होना चाहिए',
    
    // Cart Page
    shoppingCart: 'शॉपिंग कार्ट',
    subtotal: 'उप-योग',
    gstCharge: 'जीएसटी (5%)',
    shippingCharge: 'शिपिंग शुल्क',
    freeShipping: 'मुफ़्त',
    grandTotal: 'कुल योग',
    clearCart: 'कार्ट खाली करें',
    placeOrder: 'थोक ऑर्डर प्लेस करें',
    cartEmpty: 'आपकी शॉपिंग कार्ट खाली है।',
    startShopping: 'खरीदारी शुरू करें',
    orderSuccess: 'ऑर्डर सफलतापूर्वक भेजा गया!',
    remove: 'हटाएं',
    wholesaleDiscount: 'थोक छूट',
    buyerDetails: 'खरीदार का विवरण',
    businessNamePlaceholder: 'व्यापार का नाम',
    phonePlaceholder: 'फ़ोन नंबर',
    placingOrder: 'ऑर्डर भेजा जा रहा है...',
    
    // Orders Page
    allOrders: 'सभी ऑर्डर',
    pendingOrders: 'लंबित',
    noPendingOrders: 'कोई लंबित ऑर्डर नहीं',
    noOrdersYet: 'अभी तक कोई ऑर्डर नहीं',
    ordersEmptyDesc: 'अपने कार्ट में साड़ियाँ जोड़ें और व्हाट्सएप के माध्यम से ऑर्डर करें।',
    loadingOrders: 'आपके ऑर्डर लोड हो रहे हैं...',
    
    // Filter Page
    filterByType: 'प्रकार से फ़िल्टर करें',
    tryAnotherCategory: 'कोई अन्य श्रेणी चुनने का प्रयास करें।',
  },
  gu: {
    // Navigation / Core
    navHome: 'હોમ',
    navCart: 'કાર્ટ',
    navOrders: 'ઓર્ડર્સ',
    navProfile: 'પ્રોફાઇલ',
    navSearch: 'શોધો',
    navAdmin: 'એડમિન',
    navSaved: 'સાચવેલ આઇટમ્સ',
    navCollection: 'કલેક્શન',
    viewCart: 'કાર્ટ જુઓ',
    
    // Auth Pages
    createAccount: 'ખાતું બનાવો',
    registerBuyer: 'જથ્થાબંધ ખરીદનાર તરીકે રજીસ્ટ્રેશન કરો',
    fullName: 'પૂરું નામ',
    emailAddress: 'ઇમેઇલ',
    mobileNumber: 'મોબાઇલ નંબર',
    password: 'પાસવર્ડ',
    gstNumber: 'જીએસટી નંબર (ઓટો-વેરિફાય)',
    shopAddress: 'દુકાનનું સરનામું',
    alreadyRegistered: 'પહેલેથી રજીસ્ટર છો?',
    signIn: 'સાઇન ઇન',
    loginTitle: 'સાઇન ઇન',
    loginSubtitle: 'જથ્થાબંધ એકાઉન્ટ લોગ ઇન કરો',
    dontHaveAccount: 'ખાતું નથી?',
    registerNow: 'હમણાં રજીસ્ટર કરો',
    logout: 'લોગ આઉટ',
    
    // Home / Search / Catalog
    featuredProducts: 'મુખ્ય પ્રોડક્ટ્સ',
    catalogHeading: 'સ્વાસ્તિક ફેશન સાડીઓનું કલેક્શન',
    categories: 'કેટેગરીઝ',
    searchPlaceholder: 'નામ અથવા કોડથી સાડીઓ શોધો...',
    noProducts: 'કોઈ પ્રોડક્ટ્સ મળી નથી',
    bestSeller: 'બેસ્ટ સેલર',
    newArrival: 'નવું',
    premium: 'પ્રીમિયમ',
    itemsCount: 'આઇટમ્સ',
    todaysDrop: 'આજનો ડ્રોપ',
    searchSarees: 'સાડીઓ શોધો',
    viewFullCollection: 'પૂરું કલેક્શન જુઓ',
    noFeaturedProducts: 'હજી સુધી કોઈ મુખ્ય પ્રોડક્ટ્સ નથી.',
    loadingDrop: 'આજનો ડ્રોપ લોડ થઈ રહ્યો છે...',
    
    // Product Details
    productCode: 'પ્રોડક્ટ કોડ',
    originalPrice: 'મૂળ કિંમત',
    discountOff: 'બાદ',
    estimatedPrice: 'અંદાજિત કિંમત',
    quantity: 'નંગ',
    noteToShop: 'દુકાન માટે નોંધ (વૈકલ્પિક)',
    whatsappOrder: 'વોટ્સએપ પર ઓર્ડર કરો',
    addToCart: 'કાર્ટમાં ઉમેરો',
    productNotFound: 'પ્રોડક્ટ મળી નથી',
    goBack: 'પાછા જાઓ',
    codeLabel: 'કોડ',
    pcLabel: 'નંગ',
    estimatedFor: 'અંદાજિત કિંમત',
    
    // Profile Page
    wholesaleBuyer: 'જથ્થાબંધ ખરીદનાર',
    profileOrders: 'ઓર્ડર્સ',
    profileSaved: 'સાચવેલ',
    profileSpent: 'કુલ ખર્ચ',
    savedProducts: 'સાચવેલી પ્રોડક્ટ્સ',
    shippingAddress: 'શિપિંગ સરનામું',
    paymentMethods: 'ચુકવણી પદ્ધતિઓ',
    preferences: 'પસંદગીઓ',
    helpSupport: 'મદદ અને સપોર્ટ',
    languageOption: 'ભાષાની પસંદગી',
    chooseLanguage: 'એપની ભાષા પસંદ કરો',
    english: 'English (અંગ્રેજી)',
    hindi: 'Hindi (હિન્દી)',
    gujarati: 'Gujarati (ગુજરાતી)',
    maybeLater: 'પછીથી',
    preferencesSubtitle: 'ભાષાની પસંદગીઓ',
    helpSupportSubtitle: 'વોટ્સએપ, પ્રશ્નોત્તરી',
    savedProductsSubtitle: 'સાચવેલી સાડીઓ',
    shippingAddressSubtitle: 'સુરત, ગુજરાત',
    paymentMethodsSubtitle: 'યુપીઆઈ • બેંક',
    accountSummary: 'એકાઉન્ટ વિગત',
    accountSummaryDesc: 'એક જ જગ્યાએથી તમારી જથ્થાબંધ પ્રોફાઇલ, સાચવેલી વસ્તુઓ અને ઓર્ડર હિસ્ટ્રી સંચાલિત કરો.',
    changePassword: 'પાસવર્ડ બદલો',
    changePasswordSubtitle: 'તમારી સુરક્ષા ઓળખપત્ર અપડેટ કરો',
    oldPassword: 'જૂનો પાસવર્ડ',
    newPassword: 'નવો પાસવર્ડ',
    confirmPassword: 'પાસવર્ડની ખાતરી કરો',
    passwordsDoNotMatch: 'નવા પાસવર્ડ મેળ ખાતા નથી',
    passwordChangedSuccess: 'પાસવર્ડ સફળતાપૂર્વક બદલાઈ ગયો!',
    passwordTooShort: 'પાસવર્ડ ઓછામાં ઓછો 6 અક્ષરોનો હોવો જોઈએ',
    
    // Cart Page
    shoppingCart: 'શોપિંગ કાર્ટ',
    subtotal: 'કુલ રકમ',
    gstCharge: 'જીએસટી (૫%)',
    shippingCharge: 'શિપિંગ ભાડું',
    freeShipping: 'ફ્રી',
    grandTotal: 'આખરી કુલ રકમ',
    clearCart: 'કાર્ટ ખાલી કરો',
    placeOrder: 'જથ્થાબંધ ઓર્ડર આપો',
    cartEmpty: 'તમારી શોપિંગ કાર્ટ ખાલી છે.',
    startShopping: 'ખરીદી શરૂ કરો',
    orderSuccess: 'ઓર્ડર સફળતાપૂર્વક અપાઈ ગયો!',
    remove: 'દૂર કરો',
    wholesaleDiscount: 'જથ્થાબંધ ડિસ્કાઉન્ટ',
    buyerDetails: 'ખરીદનારની વિગત',
    businessNamePlaceholder: 'વેપારનું નામ',
    phonePlaceholder: 'ફોન નંબર',
    placingOrder: 'ઓર્ડર મોકલાઈ રહ્યો છે...',
    
    // Orders Page
    allOrders: 'બધા ઓર્ડર્સ',
    pendingOrders: 'બાકી ઓર્ડર્સ',
    noPendingOrders: 'કોઈ બાકી ઓર્ડર નથી',
    noOrdersYet: 'હજી સુધી કોઈ ઓર્ડર નથી',
    ordersEmptyDesc: 'તમારા કાર્ટમાં સાડીઓ ઉમેરો અને વોટ્સએપ દ્વારા ઓર્ડર કરો.',
    loadingOrders: 'તમારા ઓર્ડર્સ લોડ થઈ રહ્યા છે...',
    
    // Filter Page
    filterByType: 'પ્રકાર દ્વારા ફિલ્ટર કરો',
    tryAnotherCategory: 'બીજી કોઈ કેટેગરી પસંદ કરો.',
  },
};

interface LanguageState {
  language: Language;
  setLanguage: (language: Language) => void;
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      language: 'en',
      setLanguage: (language) => set({ language }),
    }),
    {
      name: 'language-storage',
    }
  )
);

export function useTranslation() {
  const { language, setLanguage } = useLanguageStore();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  const t = (key: keyof typeof translations['en']): string => {
    const currentLang = mounted ? language : 'en';
    return translations[currentLang][key] || translations['en'][key] || '';
  };
  
  return { t, language: mounted ? language : 'en', setLanguage, mounted };
}

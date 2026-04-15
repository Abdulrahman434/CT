/* ═══════════════════════════════════════════════════════════════════════════
 * HBS — Internationalization (i18n)
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * ARCHITECTURE:
 *   translations ........... Flat key → { en, ar } dictionary
 *   useLocale() ............ Hook that returns t(), locale, isRTL, dir, fontFamily
 *
 * ADDING A NEW LANGUAGE:
 *   1. Add the new locale key (e.g. "ur") to the Locale type
 *   2. Add translations for every key in the dictionary
 *   3. Add the locale to the LanguagePicker in SettingsPanel
 *
 * ADDING A NEW STRING:
 *   1. Add the key + { en, ar } to the `translations` object
 *   2. Use `t("your.key")` in the component
 *
 * CONVENTION:
 *   Keys use dot-notation namespacing: "section.subsection.label"
 *   e.g. "settings.brightness", "care.team.title", "hub.media"
 * ═══════════════════════════════════════════════════════════════════════════ */

import { useTheme } from "./ThemeContext";

export type Locale = "en" | "ar";

type TranslationEntry = Record<Locale, string>;

/* ── Master Translation Dictionary ── */
const translations: Record<string, TranslationEntry> = {
  /* ─── General ─── */
  "general.hello": { en: "Hello", ar: "مرحباً" },
  "general.welcome": { en: "Welcome to {0}. We wish you a comfortable and speedy recovery!", ar: "مرحباً بك في {0}. نتمنى لك الشفاء العاجل!" },
  "general.aboutUs": { en: "About Us", ar: "عن المستشفى" },
  "general.close": { en: "Close", ar: "إغلاق" },
  "general.cancel": { en: "Cancel", ar: "إلغاء" },
  "general.confirm": { en: "Confirm", ar: "تأكيد" },
  "general.back": { en: "Back", ar: "رجوع" },
  "general.room": { en: "Room", ar: "غرفة" },
  "general.bed": { en: "Bed", ar: "سرير" },
  "general.done": { en: "Done", ar: "تم" },

  /* ─── Idle Screen ─── */
  "idle.welcome": { en: "Welcome to {0}", ar: "مرحباً بك في {0}" },
  "idle.ready": { en: "This bedside terminal is ready for use.", ar: "هذه الشاشة جاهزة للاستخدام." },
  "idle.awaiting": { en: "Awaiting Patient", ar: "في انتظار المريض" },
  "idle.awaitingDesc": { en: "This terminal will activate once\na patient is admitted to this room.", ar: "ستعمل هذه الشاشة بمجرد\nقبول مريض في هذه الغرفة." },

  /* ─── Patient Greeting ─── */
  "greeting.mrn": { en: "MRN", ar: "رقم الملف" },
  "greeting.room": { en: "Room {0}", ar: "غرفة {0}" },
  "greeting.ext": { en: "Ext. {0}", ar: "تحويلة {0}" },

  /* ─── Top Bar ─── */
  "topbar.am": { en: "AM", ar: "ص" },
  "topbar.pm": { en: "PM", ar: "م" },

  /* ─── Prayer Names ─── */
  "prayer.fajr": { en: "FAJR", ar: "الفجر" },
  "prayer.dhuhr": { en: "DHUHR", ar: "الظهر" },
  "prayer.asr": { en: "ASR", ar: "العصر" },
  "prayer.maghrib": { en: "MAGHRIB", ar: "المغرب" },
  "prayer.isha": { en: "ISHA", ar: "العشاء" },
  "prayer.upcoming": { en: "Upcoming Prayer", ar: "الصلاة القادمة" },
  "prayer.alarmMe": { en: "Alarm me", ar: "نبهني" },

  /* ─── Tasbih Screen Saver ─── */
  "tasbih.tapToCount": { en: "Tap anywhere to count", ar: "اضغط في أي مكان للعد" },
  "tasbih.reset": { en: "Reset", ar: "إعادة تعيين" },
  "tasbih.exit": { en: "Exit", ar: "خروج" },
  "tasbih.exitHint": { en: "Long press or swipe to exit", ar: "اضغط مطولاً أو اسحب للخروج" },
  "tasbih.milestone33": { en: "Subhan Allah! 33 reached ✨", ar: "!سبحان الله! وصلت إلى 33 ✨" },
  "tasbih.milestone99": { en: "Alhamdulillah! 99 reached 🌟", ar: "!الحمد لله! وصلت إلى 99 🌟" },
  "tasbih.milestone100": { en: "Masha Allah! 100 completed 🎉", ar: "!ماشاء الله! أكملت 100 🎉" },
  "tasbih.resetConfirmTitle": { en: "Reset Counter?", ar: "إعادة تعيين العداد؟" },
  "tasbih.resetConfirmBody": { en: "This will set your count back to 0. Continue?", ar: "سيؤدي هذا إلى إعادة العداد إلى 0. هل تريد المتابعة؟" },
  "tasbih.resetConfirm": { en: "Reset", ar: "إعادة تعيين" },

  /* ─── News Ticker ─── */
  "news.wifi": { en: "Care Medical Hospital recognized as a JCI Gold Seal of Approval® recipient for 2026.", ar: "مستشفى رعاية الطبية يحصل على ختم الاعتماد الذهبي من JCI لعام ٢٠٢٦." },
  "news.carePlans": { en: "Our hospital launches the \"Healthier Tomorrow\" community wellness initiative across Jeddah.", ar: "المستشفى يطلق مبادرة «غدٍ أصحّ» للصحة المجتمعية في جدة." },
  "news.menu": { en: "Care Medical Team wins Best Research Paper at the 2026 Saudi Healthcare Symposium.", ar: "فريق رعاية الطبي يفوز بجائزة أفضل بحث علمي في ملتقى الرعاية الصحية السعودي ٢٠٢٦." },
  "news.dallah.1": { en: "Dallah Hospitals awarded 'Leading Provider of Integrated Healthcare Services' in Saudi Arabia.", ar: "مستشفيات دله تحصل على جائزة «المزود الرائد لخدمات الرعاية الصحية المتكاملة» في المملكة." },
  "news.dallah.2": { en: "Dallah Healthcare announces the construction of the new state-of-the-art Al-Arid Hospital in Riyadh.", ar: "دله الصحية تعلن عن إنشاء مستشفى العارض الجديد والمتطور في الرياض." },
  "news.dallah.3": { en: "Dallah Healthcare completes 100% acquisition of Care Shield Holding, reinforcing Riyadh presence.", ar: "دله الصحية تكمل استحواذها بنسبة ١٠٠٪ على شركة درع الرعاية، مما يعزز تواجدها في الرياض." },

  /* ─── Hub Items ─── */
  "hub.media": { en: "Media", ar: "الوسائط" },
  "hub.media.desc": { en: "TV, music & radio", ar: "تلفزيون، موسيقى وراديو" },
  "hub.reading": { en: "Reading", ar: "القراءة" },
  "hub.reading.desc": { en: "Books & magazines", ar: "كتب ومجلات" },
  "hub.social": { en: "Social", ar: "التواصل" },
  "hub.social.desc": { en: "Stay connected", ar: "ابقَ على تواصل" },
  "hub.games": { en: "Games", ar: "الألعاب" },
  "hub.games.desc": { en: "Fun & relaxation", ar: "ترفيه واسترخاء" },
  "hub.meeting": { en: "Meeting", ar: "الاجتماعات" },
  "hub.meeting.desc": { en: "Call family & friends", ar: "اتصل بالعائلة والأصدقاء" },
  "hub.internet": { en: "Internet", ar: "الإنترنت" },
  "hub.internet.desc": { en: "Surf the internet", ar: "تصفح الإنترنت" },
  "hub.tools": { en: "Tools", ar: "الأدوات" },
  "hub.tools.desc": { en: "Lights, blinds & AC", ar: "إضاءة، ستائر وتكييف" },
  "hub.education": { en: "Education", ar: "تثقيف المرضى" },
  "hub.education.desc": { en: "Learn & explore", ar: "تعلّم واستكشف" },

  /* ─── Service Items ─── */
  "service.consultation": { en: "Consultation", ar: "استشارة" },
  "service.housekeeping": { en: "Housekeeping", ar: "خدمة الغرف" },
  "service.orderFood": { en: "Meal Ordering", ar: "طلب الوجبات" },
  "service.call": { en: "Call", ar: "اتصال" },
  "service.survey": { en: "Survey", ar: "استبيان" },
  "service.shareFeedback": { en: "Your Feedback", ar: "رأيك يهمنا" },

  /* ─── Shortcut Items ─── */
  "shortcut.whatsapp": { en: "WhatsApp", ar: "واتساب" },
  "shortcut.quran": { en: "Quran", ar: "القرآن" },
  "shortcut.mirror": { en: "Mirror", ar: "المرآة" },
  "shortcut.patientPortal": { en: "Patient Portal", ar: "بوابة المريض" },
  "shortcut.podcast": { en: "Podcast", ar: "بودكاست" },
  "shortcut.dallahPodcast": { en: "Dallah Podcast", ar: "بودكاست دله" },
  "shortcut.academy": { en: "Academy", ar: "الأكاديمية" },

  /* ─── Care Medical Education Items ─── */
  "caremed.edu.normalBirth": { en: "Normal Birth", ar: "الولادة الطبيعية" },
  "caremed.edu.depression": { en: "Signs of Depression\nand How to Cope", ar: "علامات الاكتئاب\nوكيفية التعامل معها" },
  "caremed.edu.dementia": { en: "Cognition and\nDementia", ar: "الإدراك والخرف" },
  "caremed.edu.elderlyExercise": { en: "Exercise for\nThe Elderly", ar: "ممارسة الرياضة\nلكبار السن" },
  "caremed.edu.falls": { en: "Common Causes\nof Falls", ar: "أسباب السقوط\nالشائعة" },
  "caremed.edu.generalHealth": { en: "General Health\nQuestions", ar: "أسئلة عن\nالصحة العامة" },
  "caremed.edu.medications": { en: "Questions About\nMedications", ar: "أسئلة بخصوص\nالأدوية" },

  /* ─── CareMe Slides ─── */
  "care.title": { en: "CareMe", ar: "رعايتي" },
  "care.subtitle": { en: "Your health journey at a glance", ar: "رحلتك الصحية في لمحة" },
  "care.team.title": { en: "My Care Team", ar: "فريق الرعاية" },
  "care.plan.title": { en: "My Care Plan", ar: "خطة الرعاية" },
  "care.diet.title": { en: "Diet Codes", ar: "النظام الغذائي" },
  "care.baby.title": { en: "Baby Camera", ar: "كاميرا الطفل" },
  "care.labs.title": { en: "Lab Results", ar: "نتائج المختبر" },
  "care.imaging.title": { en: "Scans & Imaging", ar: "الأشعة والتصوير" },
  "care.discharge.title": { en: "Discharge Plan", ar: "خطة الخروج" },
  "care.room": { en: "Room", ar: "الغرفة" },
  "care.extension": { en: "Extension", ar: "التحويلة" },

  /* ─── Lab Results ─── */
  "care.labs.cbc": { en: "Complete Blood Count", ar: "تعداد الدم الكامل" },
  "care.labs.glucose": { en: "Glucose Level", ar: "مستوى الجلوكوز" },
  "care.labs.hemoglobin": { en: "Hemoglobin", ar: "الهيموجلوبين" },
  "care.labs.potassium": { en: "Potassium", ar: "البوتاسيوم" },
  "care.labs.normal": { en: "Normal", ar: "طبيعي" },
  "care.labs.high": { en: "High", ar: "مرتفع" },
  "care.labs.low": { en: "Low", ar: "منخفض" },

  /* ─── Scans & Imaging ─── */
  "care.imaging.ultrasound": { en: "Obstetric Ultrasound", ar: "تصوير السونار للجنين" },
  "care.imaging.summary": { en: "Healthy development. Normal fetal heart rate.", ar: "نمو صحي. معدل نبضات قلب الجنين طبيعي." },
  "care.imaging.xray": { en: "Chest X-Ray", ar: "أشعة سينية للصد" },
  "care.imaging.mri": { en: "Abdominal MRI", ar: "رنين مغناطيسي للبطن" },
  "care.imaging.viewReport": { en: "View Detailed Report", ar: "عرض التقرير التفصيلي" },
  "care.imaging.pending": { en: "Processing...", ar: "قيد المعالجة..." },

  /* ─── Care Team ─── */
  "care.team.name.nura": { en: "Nura Al-Rashid", ar: "نورا الرشيد" },
  "care.team.name.omar": { en: "Dr. Omar Abdulhalim", ar: "د. عمر عبدالحليم" },
  "care.team.primaryNurse": { en: "Primary Nurse", ar: "الممرضة الرئيسية" },
  "care.team.attendingDoctor": { en: "Attending Doctor", ar: "الطبيب المعالج" },
  "care.team.specialty.icu": { en: "ICU", ar: "العناية المركزة" },
  "care.team.specialty.cardiology": { en: "Cardiology", ar: "أمراض القلب" },

  /* ─── Care Plan Steps ─── */
  "care.plan.initialAssessment": { en: "Initial Assessment", ar: "التقييم الأولي" },
  "care.plan.bloodWork": { en: "Blood Work & Labs", ar: "تحاليل الدم والمختبر" },
  "care.plan.medicationRound": { en: "Medication Round", ar: "جولة الأدوية" },
  "care.plan.checkup": { en: "Check-up by Nurse", ar: "فحص الممرضة" },
  "care.plan.physicalTherapy": { en: "Physical Therapy", ar: "العلاج الطبيعي" },
  "care.plan.doctorReview": { en: "Doctor Review", ar: "مراجعة الطبيب" },
  "care.plan.min": { en: "Min", ar: "دقيقة" },
  "care.plan.done": { en: "Done", ar: "تم" },

  /* ─── Admission / Discharge Labels ─── */
  "care.admitted": { en: "Admitted", ar: "تاريخ الدخول" },
  "care.discharge": { en: "Discharge", ar: "الخروج المتوقع" },
  "care.mrn": { en: "MRN", ar: "رقم الملف" },

  /* ─── Diet & Allergies ─── */
  "care.diet.nas": { en: "No Added Salt", ar: "بدون ملح مضاف" },
  "care.diet.dm": { en: "Diabetic Menu", ar: "قائمة السكري" },
  "care.allergies": { en: "Allergies", ar: "معلومات الحساسية" },
  "care.allergy.penicillin": { en: "Penicillin", ar: "البنسلين" },
  "care.allergy.latex": { en: "Latex", ar: "اللاتكس" },
  "care.allergy.shellfish": { en: "Shellfish", ar: "المحار" },

  /* ─── Discharge Plan ─── */
  "care.discharge.order": { en: "Discharge Order by Doctor", ar: "أمر الخروج من الطبيب" },
  "care.discharge.insurance": { en: "Insurance & Billing Clearance", ar: "تسوية التأمين والفواتير" },
  "care.discharge.medication": { en: "Medication Preparation", ar: "تحضير الأدوية" },
  "care.discharge.education": { en: "Patient Education & Instructions", ar: "تثقيف المريض والإرشادات" },
  "care.discharge.finalCheckup": { en: "Final Check-up", ar: "الفحص النهائي" },
  "care.discharge.confirm": { en: "Confirm Discharge", ar: "تأكيد الخروج" },

  /* ─── Pain ─── */
  "care.pain.score": { en: "Pain Score", ar: "مقياس الألم" },
  "care.pain.lastUpdated": { en: "Last updated 2h ago", ar: "آخر تحديث منذ ساعتين" },
  "care.pain.reported": { en: "Reported Pain", ar: "مؤشر الألم" },

  /* ─── Baby Camera ─── */
  "care.baby.live": { en: "LIVE", ar: "مباشر" },
  "care.baby.nursery": { en: "Nursery — Camera 3", ar: "الحضانة — كاميرا ٣" },
  "care.baby.connected": { en: "Connected", ar: "متصل" },
  "care.baby.expand": { en: "Expand view", ar: "توسيع العرض" },

  /* ─── Settings Panel ─── */
  "settings.title": { en: "Settings", ar: "الإعدادات" },
  "settings.brightness": { en: "Brightness", ar: "السطوع" },
  "settings.volume": { en: "Volume", ar: "الصوت" },
  "settings.wifi": { en: "Wi-Fi", ar: "واي فاي" },
  "settings.bluetooth": { en: "Bluetooth", ar: "بلوتوث" },
  "settings.cast": { en: "Cast", ar: "عرض الشاشة" },
  "settings.dnd": { en: "DND", ar: "عدم الإزعاج" },
  "settings.nightLight": { en: "Night Light", ar: "ضوء ليلي" },
  "settings.darkMode": { en: "Dark Mode", ar: "الوضع الداكن" },
  "settings.language": { en: "Language", ar: "اللغة" },
  "settings.language.select": { en: "Select your preferred display language", ar: "اختر لغة العرض المفضلة" },
  "settings.adminOnly": { en: "Admin Only", ar: "المشرف فقط" },
  "settings.adminOnly.subtitle": { en: "PIN required", ar: "رمز الدخول مطلوب" },
  "settings.clearData": { en: "Clear Data", ar: "مسح البيانات" },
  "settings.clearData.question": { en: "Clear Data?", ar: "مسح البيانات؟" },
  "settings.clearData.desc": { en: "This will end all active sessions and remove your personal data from this device.", ar: "سيؤدي هذا إلى إنهاء جميع الجلسات النشطة وحذف بياناتك الشخصية من هذا الجهاز." },
  "settings.clearData.signOut": { en: "Sign out of all logged-in applications", ar: "تسجيل الخروج من جميع التطبيقات" },
  "settings.clearData.history": { en: "Clear browsing history & cookies", ar: "مسح سجل التصفح وملفات تعريف الارتباط" },
  "settings.clearData.passwords": { en: "Remove saved passwords & logins", ar: "حذف كلمات المرور وبيانات الدخول المحفوظة" },
  "settings.clearData.reset": { en: "Reset app preferences to default", ar: "إعادة تعيين تفضيلات التطبيقات" },
  "settings.castScreen": { en: "Cast Screen", ar: "عرض الشاشة" },
  "settings.stopCasting": { en: "Stop Casting", ar: "إيقاف العرض" },
  "settings.disconnect": { en: "Disconnect", ar: "قطع الاتصال" },

  /* ─── Wi-Fi Dialog ─── */
  "wifi.scanning": { en: "Scanning for networks...", ar: "جارٍ البحث عن الشبكات..." },
  "wifi.available": { en: "Available Networks", ar: "الشبكات المتاحة" },
  "wifi.connected": { en: "Connected", ar: "متصل" },
  "wifi.secured": { en: "Secured", ar: "محمية" },
  "wifi.open": { en: "Open", ar: "مفتوحة" },

  /* ─── Bluetooth Dialog ─── */
  "bt.searching": { en: "Searching for devices...", ar: "جارٍ البحث عن الأجهزة..." },
  "bt.paired": { en: "Paired Devices", ar: "الأجهزة المقترنة" },
  "bt.available": { en: "Available Devices", ar: "الأجهزة المتاحة" },
  "bt.pairedStatus": { en: "Paired", ar: "مقترن" },
  "bt.searchDevices": { en: "Search devices...", ar: "بحث عن الأجهزة..." },
  "bt.noMatch": { en: "No devices match \"{0}\"", ar: "لا توجد أجهزة مطابقة لـ \"{0}\"" },

  /* ─── Cast Dialog ─── */
  "cast.looking": { en: "Looking for devices...", ar: "جارٍ البحث عن الأجهزة..." },
  "cast.unavailable": { en: "Unavailable", ar: "غير متاح" },

  /* ─── Admin Dialog ─── */
  "admin.title": { en: "Admin Access", ar: "دخول المشرف" },
  "admin.enterPin": { en: "Enter 4-digit admin PIN", ar: "أدخل رمز المشرف المكون من 4 أرقام" },
  "admin.incorrect": { en: "Incorrect PIN. Please try again.", ar: "رمز خاطئ. يرجى المحاولة مرة أخرى." },
  "admin.del": { en: "DEL", ar: "حذف" },

  /* ─── Notifications Panel ─── */
  "notif.title": { en: "Notifications", ar: "الإشعارات" },
  "notif.markAllRead": { en: "Mark all as read", ar: "تحديد الكل كمقروء" },
  "notif.clearAll": { en: "Clear all", ar: "مسح الكل" },
  "notif.swipeHint": { en: "Swipe left to dismiss", ar: "اسحب لليمين للحذف" },
  "notif.allCaughtUp": { en: "All caught up!", ar: "لا توجد إشعارات جديدة!" },
  "notif.noNew": { en: "No new notifications at the moment.", ar: "لا توجد إشعارات في الوقت الحالي." },

  /* ─── Notification Items ─── */
  "notif.medicationDue": { en: "Medication due at 2:00 PM", ar: "موعد الدواء الساعة 2:00 م" },
  "notif.newMessages": { en: "3 new messages", ar: "3 رسائل جديدة" },
  "notif.doctorVisit": { en: "Dr. Al-Ghamdi visit at 3 PM", ar: "زيارة د. الغامدي الساعة 3 م" },
  "notif.lunchMenu": { en: "Lunch menu available", ar: "قائمة الغداء متاحة" },
  "notif.fileDownloaded": { en: "1 file downloaded", ar: "تم تحميل ملف واحد" },

  /* ─── Survey ─── */
  "survey.title": { en: "Patient Experience Survey", ar: "استبيان تجربة المريض" },
  "survey.intro": { en: "Share Your Experience", ar: "شاركنا تجربتك" },
  "survey.introDesc": { en: "Your feedback helps us improve.", ar: "ملاحظاتك تساعدنا على التحسين." },
  "survey.start": { en: "Start Survey", ar: "ابدأ الاستبيان" },
  "survey.next": { en: "Next", ar: "التالي" },
  "survey.previous": { en: "Previous", ar: "السابق" },
  "survey.submit": { en: "Submit", ar: "إرسال" },
  "survey.thankYou": { en: "Thank You!", ar: "شكراً لك!" },
  "survey.thankYouDesc": { en: "Your feedback has been recorded.", ar: "تم تسجيل ملاحظاتك." },
  "survey.close": { en: "Close", ar: "إغلاق" },
  "survey.q1": { en: "How satisfied are you with the overall quality of care you received?", ar: "ما مدى رضاك عن جودة الرعاية التي تلقيتها؟" },
  "survey.q2": { en: "How would you rate the responsiveness of our nursing staff?", ar: "كيف تقيّم سرعة استجابة طاقم التمريض؟" },
  "survey.q3": { en: "The cleanliness of my room was maintained to a high standard.", ar: "تم الحفاظ على نظافة غرفتي بمستوى عالٍ." },
  "survey.q4": { en: "How would you rate the quality of food and meals provided?", ar: "كيف تقيّم جودة الطعام والوجبات المقدمة؟" },
  "survey.q5": { en: "The medical staff communicated clearly about my treatment and medications.", ar: "تواصل الطاقم الطبي بوضوح حول علاجي وأدويتي." },
  "survey.q6": { en: "How satisfied were you with the pain management during your stay?", ar: "ما مدى رضاك عن إدارة الألم أثناء إقامتك؟" },
  "survey.q7": { en: "Overall, how was your experience with us?", ar: "بشكل عام، كيف كانت تجربتك معنا؟" },
  /* Survey options */
  "survey.opt.extremelyDissatisfied": { en: "Extremely Dissatisfied", ar: "غير راضٍ تماماً" },
  "survey.opt.dissatisfied": { en: "Dissatisfied", ar: "غير راضٍ" },
  "survey.opt.neutral": { en: "Neutral", ar: "محايد" },
  "survey.opt.satisfied": { en: "Satisfied", ar: "راضٍ" },
  "survey.opt.extremelySatisfied": { en: "Extremely Satisfied", ar: "راضٍ تماماً" },
  "survey.opt.veryPoor": { en: "Very Poor", ar: "ضعيف جداً" },
  "survey.opt.poor": { en: "Poor", ar: "ضعيف" },
  "survey.opt.average": { en: "Average", ar: "متوسط" },
  "survey.opt.good": { en: "Good", ar: "جيد" },
  "survey.opt.excellent": { en: "Excellent", ar: "ممتاز" },
  "survey.opt.stronglyDisagree": { en: "Strongly Disagree", ar: "أعارض بشدة" },
  "survey.opt.disagree": { en: "Disagree", ar: "أعارض" },
  "survey.opt.agree": { en: "Agree", ar: "أوافق" },
  "survey.opt.stronglyAgree": { en: "Strongly Agree", ar: "أوافق بشدة" },
  "survey.additionalFeedback": { en: "Any additional feedback? (optional)", ar: "هل لديك ملاحظات إضافية؟ (اختياري)" },
  "survey.feedbackPlaceholder": { en: "Share your thoughts...", ar: "شاركنا أفكارك..." },
  "survey.questionOf": { en: "Question {0} of {1}", ar: "السؤال {0} من {1}" },

  /* ─── About Us ─── */
  "about.title": { en: "About Us", ar: "عن المستشفى" },
  "about.aboutDallah": { en: "About Dallah", ar: "عن دله" },
  "about.ourHospital": { en: "Our Hospital", ar: "المستشفى" },
  "about.dna": { en: "{0} DNA", ar: "{0} DNA" },
  "about.dallahDna": { en: "Dallah DNA", ar: "دله DNA" },
  "about.caremedInBrief": { en: "CareMed InBrief", ar: "نبذة عن رعاية الطبية" },
  "about.numbers": { en: "{0} In Numbers", ar: "{0} في أرقام" },
  "about.services": { en: "Services", ar: "الخدمات" },
  "about.accreditations": { en: "Accreditations", ar: "الاعتمادات" },
  "about.awards": { en: "Awards", ar: "الجوائز" },
  "about.digital": { en: "Digital Services", ar: "الخدمات الرقمية" },
  "about.patientRights": { en: "Patient Rights", ar: "حقوق المريض" },
  "about.watchVideo": { en: "Watch Our Hospital Video", ar: "شاهد فيديو المستشفى" },
  "about.video": { en: "Video", ar: "فيديو" },

  /* ─── App Launcher ─── */
  "launcher.media": { en: "Media", ar: "الوسائط" },
  "launcher.reading": { en: "Reading", ar: "القراءة" },
  "launcher.social": { en: "Social", ar: "التواصل الاجتماعي" },
  "launcher.games": { en: "Games", ar: "الألعاب" },
  "launcher.meeting": { en: "Meeting", ar: "الاجتماعات" },
  "launcher.internet": { en: "Internet", ar: "الإنترنت" },
  "launcher.tools": { en: "Tools", ar: "الأدوات" },
  "launcher.education": { en: "Education", ar: "تثقيف المرضى" },
  "launcher.launching": { en: "Launching {0}...", ar: "جارٍ تشغيل {0}..." },

  /* ─── Room Info ─── */
  "room.info": { en: "Room 412", ar: "غرفة ٤١٢" },
  "room.bedA": { en: "Bed A", ar: "سرير أ" },

  /* ─── App Tour ─── */
  "tour.welcome": { en: "Welcome to your room!", ar: "!مرحباً بك في غرفتك" },
  "tour.skip": { en: "Skip Tour", ar: "تخطي الجولة" },
  "tour.next": { en: "Next", ar: "التالي" },
  "tour.finish": { en: "Finish", ar: "إنهاء" },
  "tour.of": { en: "of", ar: "من" },
  "tour.back": { en: "Back", ar: "رجوع" },
  "tour.startTour": { en: "Start Tour", ar: "ابدأ الجولة" },
  "tour.finishTour": { en: "Finish Tour", ar: "إنهاء الجولة" },
  "tour.skipTour": { en: "Skip tour", ar: "تخطي الجولة" },
  "tour.step.welcome.title": { en: "Welcome to Your Bedside Companion", ar: "مرحباً بك في شاشة السرير الذكية" },
  "tour.step.welcome.body": { en: "This interactive guide will walk you through every feature of your in-room smart display — from entertainment to hospital services.", ar: "سيرشدك هذا الدليل التفاعلي خلال جميع ميزات شاشتك الذكية — من الترفيه إلى خدمات المستشفى." },
  "tour.step.welcome.detail": { en: "Tap \"Next\" to begin, or skip anytime.", ar: "اضغط \"التالي\" للبدء، أو تخطَّ في أي وقت." },
  "tour.step.prayer.title": { en: "Prayer Times", ar: "أوقات الصلاة" },
  "tour.step.prayer.body": { en: "All five daily prayer times at a glance. The next upcoming prayer is highlighted so you never miss a salah.", ar: "أوقات الصلوات الخمس في لمحة. يتم تمييز الصلاة القادمة حتى لا تفوتك." },
  "tour.step.controls.title": { en: "Status Bar & Quick Controls", ar: "شريط الحالة والتحكم السريع" },
  "tour.step.controls.body": { en: "Current time, date, live weather, language toggle, notification bell, and settings — all one tap away.", ar: "الوقت الحالي، التاريخ، حالة الطقس، تغيير اللغة، الإشعارات، والإعدادات — كلها بضغطة واحدة." },
  "tour.step.controls.detail": { en: "The red badge on the bell shows unread notifications.", ar: "الشارة الحمراء على الجرس تعرض الإشعارات غير المقروءة." },
  "tour.step.ticker.title": { en: "News & Announcements", ar: "الأخبار والإعلانات" },
  "tour.step.ticker.body": { en: "A scrolling ticker delivers real-time hospital news, health tips, and service updates — personalized to your ward.", ar: "شريط أخبار متحرك يعرض أخبار المستشفى والنصائح الصحية وتحديثات الخدمات." },
  "tour.step.greeting.title": { en: "Your Personal Card", ar: "بطاقتك الشخصية" },
  "tour.step.greeting.body": { en: "Your name, room number, MRN, and extension — plus a quick link to learn about the hospital with the \"About Us\" button.", ar: "اسمك، رقم الغرفة، رقم الملف، والتحويلة — بالإضافة إلى رابط سريع للتعرف على المستشفى." },
  "tour.step.greeting.detail": { en: "Tap the ? icon in the corner to relaunch this tour anytime.", ar: "اضغط على أيقونة ؟ في الزاوية لإعادة تشغيل هذه الجولة في أي وقت." },
  "tour.step.careme.title": { en: "CareMe — Your Health Hub", ar: "رعايتي — مركز صحتك" },
  "tour.step.careme.body": { en: "Access your Care Team, Care Plan, Diet & Allergies, Baby Camera, and Discharge Plan — all in one rotating card.", ar: "الوصول إلى فريق الرعاية، خطة الرعاية، النظام الغذائي والحساسية، كاميرا الطفل، وخطة الخروج — الكل في بطاقة واحدة متحركة." },
  "tour.step.careme.detail": { en: "Tap any card to expand it into a full-screen detailed view.", ar: "اضغط على أي بطاقة لتوسيعها إلى عرض تفصيلي بملء الشاشة." },
  "tour.step.hub.title": { en: "Entertainment & Engagement Hub", ar: "مركز الترفيه والتفاعل" },
  "tour.step.hub.body": { en: "Eight categories of content — Media, Reading, Social, Games, Meeting, Internet, Tools, and Education — designed for your comfort.", ar: "ثمان فئات من المحتوى — الوسائط، القراءة، التواصل، الألعاب، الاجتماعات، الإنترنت، الأدوات، والتثقيف — مصممة لراحتك." },
  "tour.step.hub.detail": { en: "Each tile opens a curated launcher with apps and content relevant to that category.", ar: "كل مربع يفتح قائمة تطبيقات ومحتوى متعلق بتلك الفئة." },
  "tour.step.services.title": { en: "Hospital Services", ar: "خدمات المستشفى" },
  "tour.step.services.body": { en: "Request a consultation, call housekeeping, order food, or ring the nurse station — directly from your screen.", ar: "اطلب استشارة، اتصل بالتنظيف، اطلب الطعام، أو اتصل بمحطة التمريض — مباشرة من شاشتك." },
  "tour.step.services.detail": { en: "Requests are routed to the right department instantly.", ar: "يتم توجيه الطلبات إلى القسم المناسب فوراً." },
  "tour.step.shortcuts.title": { en: "Quick Shortcuts", ar: "الاختصارات السريعة" },
  "tour.step.shortcuts.body": { en: "Your most-used apps, always one tap away. These shortcuts are configured by your hospital for quick, convenient access.", ar: "تطبيقاتك الأكثر استخداماً، دائماً بضغطة واحدة. هذه الاختصارات معدة من قبل المستشفى للوصول السريع." },
  "tour.step.survey.title": { en: "Share Your Feedback", ar: "شاركنا رأيك" },
  "tour.step.survey.body": { en: "Help us improve! Tap here to complete a quick satisfaction survey about your stay, meals, or staff.", ar: "ساعدنا على التحسين! اضغط هنا لإكمال استبيان سريع عن إقامتك ووجباتك وطاقم العمل." },
  "tour.step.finish.title": { en: "You're All Set!", ar: "أنت جاهز!" },
  "tour.step.finish.body": { en: "You now know every feature of your bedside companion. Enjoy a comfortable, connected stay.", ar: "أنت الآن تعرف جميع ميزات شاشة السرير الذكية. استمتع بإقامة مريحة ومتصلة." },
  "tour.step.finish.detail": { en: "You can restart this tour anytime from the ? button on your greeting card.", ar: "يمكنك إعادة تشغيل هذه الجولة في أي وقت من زر ؟ في بطاقة الترحيب." },
  "tour.keyboard.back": { en: "Back", ar: "رجوع" },
  "tour.keyboard.next": { en: "Next", ar: "التالي" },
  "tour.keyboard.exit": { en: "Exit", ar: "خروج" },

  /* ─── Dates ─── */
  "date.mar": { en: "Mar", ar: "مارس" },
  "date.5mar2026": { en: "5 Mar 2026", ar: "5 مارس 2026" },
  "date.12mar2026": { en: "~12 Mar 2026", ar: "~12 مارس 2026" },

  /* ─── Education Apps ─── */
  "edu.cesareanRecovery": { en: "5 Steps to Recovery\nAfter Cesarean", ar: "5 خطوات للتعافي\nبعد القيصرية" },
  "edu.painManagement": { en: "Pain Management\nGuide", ar: "دليل إدارة\nالألم" },
  "edu.woundCare": { en: "Wound Care\nInstructions", ar: "تعليمات العناية\nبالجروح" },
  "edu.exerciseVideo": { en: "Post-Op Exercises\n& Mobility", ar: "تمارين ما بعد\nالعملية والحركة" },
  "edu.medicationGuide": { en: "Your Medication\nSchedule", ar: "جدول\nأدويتك" },
  "edu.nutritionVideo": { en: "Nutrition Tips for\nFaster Healing", ar: "نصائح غذائية\nللشفاء الأسرع" },
  "edu.dischargeChecklist": { en: "Discharge\nChecklist", ar: "قائمة فحص\nالخروج" },
  "edu.infectionSigns": { en: "Signs of Infection\nWhat to Watch For", ar: "علامات العدوى\nما يجب مراقبته" },
  "edu.babyCare": { en: "Newborn Care\nBasics", ar: "أساسيات رعاية\nالمولود" },
  "edu.breathingExercises": { en: "Breathing Exercises\nfor Recovery", ar: "تمارين التنفس\nللتعافي" },
  "edu.bloodClot": { en: "Preventing Blood\nClots After Surgery", ar: "الوقاية من الجلطات\nبعد العملية" },
  "edu.emotionalHealth": { en: "Emotional Health\nAfter Delivery", ar: "الصحة النفسية\nبعد الولادة" },
  "edu.scarCare": { en: "Scar Care &\nHealing Timeline", ar: "العناية بالندبة\nوجدول الشفاء" },
  "edu.sleepTips": { en: "Sleep Positions\nAfter C-Section", ar: "azenات النوم\nبعد القيصرية" },
  "edu.pelvicFloor": { en: "Pelvic Floor\nExercises", ar: "تمارين قاع\nالحوض" },
  "edu.whenToCall": { en: "When to Call\nYour Doctor", ar: "متى تتصل\nبطبيبك" },

  /* ─── Call Screen ─── */
  "call.title": { en: "Call", ar: "اتصال" },
  "call.directory": { en: "Directory", ar: "الدليل" },
  "call.missed": { en: "Missed", ar: "فائتة" },
  "call.attended": { en: "Attended", ar: "مُجابة" },
  "call.nurseStation": { en: "Nurse Station", ar: "محطة التمريض" },
  "call.nurseStation.desc": { en: "24/7 nursing support", ar: "دعم تمريضي على مدار الساعة" },
  "call.reception": { en: "Reception", ar: "الاستقبال" },
  "call.reception.desc": { en: "Front desk & visitor info", ar: "مكتب الاستقبال ومعلومات الزوار" },
  "call.pharmacy": { en: "Pharmacy", ar: "الصيدلية" },
  "call.pharmacy.desc": { en: "Medication inquiries", ar: "استفسارات الأدوية" },
  "call.dietary": { en: "Dietary Services", ar: "خدمات التغذية" },
  "call.dietary.desc": { en: "Meals & nutrition support", ar: "الوجبات ودعم التغذية" },
  "call.housekeeping": { en: "Housekeeping", ar: "خدمة الغرف" },
  "call.housekeeping.desc": { en: "Room cleaning requests", ar: "طلبات تنظيف الغرفة" },
  "call.patientRelations": { en: "Patient Relations", ar: "علاقات المرضى" },
  "call.patientRelations.desc": { en: "Feedback & assistance", ar: "ملاحظات ومساعدة" },
  "call.itSupport": { en: "IT Support", ar: "الدعم الفني" },
  "call.itSupport.desc": { en: "Technical assistance", ar: "مساعدة تقنية" },
  "call.religiousServices": { en: "Religious Services", ar: "الخدمات الدينية" },
  "call.religiousServices.desc": { en: "Chaplain & spiritual care", ar: "الرعاية الروحية" },
  "call.operator": { en: "Operator", ar: "عال اهاتف" },
  "call.operator.desc": { en: "General hospital operator", ar: "عامل الهاتف العام" },
  "call.emergency": { en: "Emergency", ar: "الطوارئ" },
  "call.emergency.desc": { en: "Emergency response", ar: "استجابة طوارئ" },
  "call.ext": { en: "Ext.", ar: "تحويلة" },
  "call.dialExt": { en: "Tap an extension to call", ar: "اضغط على تحويلة للاتصال" },
  "call.noMissed": { en: "No missed calls", ar: "لا توجد مكالمات فائتة" },
  "call.noAttended": { en: "No attended calls", ar: "لا توجد مكالمات مُجابة" },
  "call.incoming": { en: "Incoming Call", ar: "مكالمة واردة" },
  "call.outgoing": { en: "Calling...", ar: "جارٍ الاتصال..." },
  "call.ringing": { en: "Ringing", ar: "يرنّ" },
  "call.connected": { en: "Connected", ar: "متصل" },
  "call.accept": { en: "Accept", ar: "رد" },
  "call.decline": { en: "Decline", ar: "رفض" },
  "call.endCall": { en: "End Call", ar: "إنهاء" },
  "call.cancel": { en: "Cancel", ar: "إلغاء" },
  "call.mute": { en: "Mute", ar: "كتم" },
  "call.unmute": { en: "Unmute", ar: "إلغاء الكتم" },
  "call.speaker": { en: "Speaker", ar: "مكبر الصوت" },
  "call.hold": { en: "Hold", ar: "انتظار" },
  "call.resume": { en: "Resume", ar: "استئناف" },
  "call.keypad": { en: "Keypad", ar: "لوحة المفاتيح" },
  "call.duration": { en: "Duration", ar: "المدة" },
  "call.today": { en: "Today", ar: "اليوم" },
  "call.yesterday": { en: "Yesterday", ar: "أمس" },
  "call.callEnded": { en: "Call Ended", ar: "انتهت المكالمة" },
  "call.missedCall": { en: "Missed Call", ar: "مكالمة فائتة" },
  "call.simulateIncoming": { en: "Simulate Incoming Call", ar: "محاكاة مكالمة واردة" },
  "call.yourExtension": { en: "Your Ext.", ar: "تحويلة غرفتك" },
  "call.roomNo": { en: "Room No.", ar: "رقم الغرفة" },
  "call.room": { en: "Room", ar: "الغرفة" },
  "call.hospitalDirectory": { en: "Hospital Directory", ar: "دليل المستشفى" },
  "call.tapToCall": { en: "Tap any extension to start a call", ar: "اضغط على أي تحويلة لبدء الاتصال" },
  "call.recentCalls": { en: "Recent Calls", ar: "المكالمات الأخيرة" },
  "call.callBack": { en: "Call Back", ar: "معاودة الاتصال" },
  "call.keypadTitle": { en: "Dial a Number", ar: "اتصل برقم" },
  "call.keypadHint": { en: "Enter an Extension", ar: "ادخل التحويلة" },
  "call.history": { en: "Call History", ar: "سجل المكالمات" },
  "call.all": { en: "All", ar: "الكل" },
  "call.noHistory": { en: "No call history", ar: "لا يوجد سجل مكالمات" },
};

/* ── Translator function factory ── */
function createT(locale: Locale) {
  return function t(key: string, ...args: (string | number)[]): string {
    const entry = translations[key];
    if (!entry) return key;
    let str = entry[locale] ?? entry.en ?? key;
    args.forEach((arg, i) => {
      str = str.replace(`{${i}}`, String(arg));
    });
    return str;
  };
}

/* ── Hook ── */
export function useLocale() {
  const { theme, locale: ctxLocale } = useTheme();
  const locale: Locale = ctxLocale ?? "en";
  const isRTL = locale === "ar";
  const dir = isRTL ? "rtl" : "ltr";
  const fontFamily = isRTL ? theme.fontFamilyAr : theme.fontFamily;
  const t = createT(locale);
  return { t, locale, isRTL, dir, fontFamily };
}
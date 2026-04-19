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

export type Locale = "en" | "ar" | "ur";

type TranslationEntry = Record<Locale, string>;

/* ── Master Translation Dictionary ── */
const translations: Record<string, TranslationEntry> = {
  /* ─── General ─── */
  "general.hello": { en: "Hello", ar: "مرحباً", ur: "ہیلو" },
  "general.welcome": { en: "Welcome to {0}. We wish you a comfortable and speedy recovery!", ar: "مرحباً بك في {0}. نتمنى لك الشفاء العاجل!", ur: "{0} میں خوش آمدید۔ ہم آپ کی آرام دہ اور جلد صحت یابی کے خواہاں ہیں!" },
  "general.aboutUs": { en: "About Us", ar: "عن المستشفى", ur: "ہمارے بارے میں" },
  "general.close": { en: "Close", ar: "إغلاق", ur: "بند کریں" },
  "general.cancel": { en: "Cancel", ar: "إلغاء", ur: "منسوخ" },
  "general.confirm": { en: "Confirm", ar: "تأكيد", ur: "تصدیق کریں" },
  "general.back": { en: "Back", ar: "رجوع", ur: "واپس" },
  "general.room": { en: "Room", ar: "غرفة", ur: "کمرہ" },
  "general.bed": { en: "Bed", ar: "سرير", ur: "بستر" },
  "general.done": { en: "Done", ar: "تم", ur: "ہو گیا" },

  /* ─── Idle Screen ─── */
  "idle.welcome": { en: "Welcome to {0}", ar: "مرحباً بك في {0}", ur: "{0} میں خوش آمدید" },
  "idle.ready": { en: "This bedside terminal is ready for use.", ar: "هذه الشاشة جاهزة للاستخدام.", ur: "یہ بیڈ سائیڈ ٹرمینل استعمال کے لیے تیار ہے۔" },
  "idle.awaiting": { en: "Awaiting Patient", ar: "في انتظار المريض", ur: "مریض کا انتظار ہے" },
  "idle.awaitingDesc": { en: "This terminal will activate once\na patient is admitted to this room.", ar: "ستعمل هذه الشاشة بمجرد\nقبول مريض في هذه الغرفة.", ur: "اس کمرے میں مریض کے داخل ہونے\nکے بعد یہ ٹرمینل فعال ہو جائے گا۔" },
  "idle.blankPage": { en: "Blank Page", ar: "شاشة سوداء", ur: "خالی صفحہ" },
  "idle.tapToExit": { en: "Tap anywhere to wake screen", ar: "اضغط في أي مكان لتنبيه الشاشة", ur: "اسکرین جگانے کے لیے کہیں بھی تھپتھپائیں" },

  /* ─── Patient Greeting ─── */
  "greeting.mrn": { en: "MRN", ar: "رقم الملف", ur: "ایم آر این" },
  "greeting.room": { en: "Room {0}", ar: "غرفة {0}", ur: "کمرہ {0}" },
  "greeting.ext": { en: "Ext. {0}", ar: "تحويلة {0}", ur: "ایکسٹینشن {0}" },

  /* ─── Top Bar ─── */
  "topbar.am": { en: "AM", ar: "ص", ur: "AM" },
  "topbar.pm": { en: "PM", ar: "م", ur: "PM" },

  /* ─── Prayer Names ─── */
  "prayer.fajr": { en: "FAJR", ar: "الفجر", ur: "فجر" },
  "prayer.dhuhr": { en: "DHUHR", ar: "الظهر", ur: "ظہر" },
  "prayer.asr": { en: "ASR", ar: "العصر", ur: "عصر" },
  "prayer.maghrib": { en: "MAGHRIB", ar: "المغرب", ur: "مغرب" },
  "prayer.isha": { en: "ISHA", ar: "العشاء", ur: "عشاء" },
  "prayer.upcoming": { en: "Upcoming Prayer", ar: "الصلاة القادمة", ur: "اگلی نماز" },
  "prayer.alarmMe": { en: "Alarm me", ar: "نبهني", ur: "مجھے آگاہ کریں" },

  /* ─── Tasbih Screen Saver ─── */
  "tasbih.tapToCount": { en: "Tap anywhere to count", ar: "اضغط في أي مكان للعد", ur: "شمار کرنے کے لیے کہیں بھی تھپتھپائیں" },
  "tasbih.reset": { en: "Reset", ar: "إعادة تعيين", ur: "دوبارہ شروع کریں" },
  "tasbih.exit": { en: "Exit", ar: "خروج", ur: "باہر نکلیں" },
  "tasbih.exitHint": { en: "Long press or swipe to exit", ar: "اضغط مطولاً أو اسحب للخروج", ur: "باہر نکلنے کے لیے دیر تک دبائیں یا سوائپ کریں" },
  "tasbih.milestone33": { en: "Subhan Allah! 33 reached ✨", ar: "!سبحان الله! وصلت إلى 33 ✨", ur: "سبحان اللہ! 33 مکمل ہو گئے ✨" },
  "tasbih.milestone99": { en: "Alhamdulillah! 99 reached 🌟", ar: "!الحمد لله! وصلت إلى 99 🌟", ur: "الحمد للہ! 99 مکمل ہو گئے 🌟" },
  "tasbih.milestone100": { en: "Masha Allah! 100 completed 🎉", ar: "!ماشاء الله! أكملت 100 🎉", ur: "ماشاء اللہ! 100 مکمل ہو گئے 🎉" },
  "tasbih.resetConfirmTitle": { en: "Reset Counter?", ar: "إعادة تعيين العداد؟", ur: "کاؤنٹر دوبارہ شروع کریں؟" },
  "tasbih.resetConfirmBody": { en: "This will set your count back to 0. Continue?", ar: "سيؤدي هذا إلى إعادة العداد إلى 0. هل تريد المتابعة؟", ur: "یہ آپ کے شمار کو واپس 0 پر کر دے گا۔ جاری رکھیں؟" },
  "tasbih.resetConfirm": { en: "Reset", ar: "إعادة تعيين", ur: "دوبارہ شروع کریں" },

  /* ─── News Ticker ─── */
  "news.wifi": { en: "Care Medical Hospital recognized as a JCI Gold Seal of Approval® recipient for 2026.", ar: "مستشفى رعاية الطبية يحصل على ختم الاعتماد الذهبي من JCI لعام ٢٠٢٦.", ur: "کیئر میڈیکل ہسپتال کو 2026 کے لیے JCI گولڈ سیل آف اپروول® حاصل کرنے والے کے طور پر تسلیم کیا گیا ہے۔" },
  "news.carePlans": { en: "Our hospital launches the \"Healthier Tomorrow\" community wellness initiative across Jeddah.", ar: "المستشفى يطلق مبادرة «غدٍ أصحّ» للصحة المجتمعية في جدة.", ur: "ہمارے ہسپتال نے جدہ بھر میں \"کل بہتر صحت\" کی کمیونٹی فلاح و بہبود کا آغاز کیا ہے۔" },
  "news.menu": { en: "Care Medical Team wins Best Research Paper at the 2026 Saudi Healthcare Symposium.", ar: "فريق رعاية الطبي يفوز بجائزة أفضل بحث علمي في ملتقى الرعاية الصحية السعودي ٢٠٢٦.", ur: "کیئر میڈیکل ٹیم نے 2026 کے سعودی ہیلتھ کیئر سمپوزیم میں بہترین ریسرچ پیپر جیت لیا۔" },
  "news.dallah.1": { en: "Dallah Hospitals awarded 'Leading Provider of Integrated Healthcare Services' in Saudi Arabia.", ar: "مستشفيات دله تحصل على جائزة «المزود الرائد لخدمات الرعاية الصحية المتكاملة» في المملكة.", ur: "دلہ ہسپتالوں کو سعودی عرب میں 'انٹیگریٹڈ ہیلتھ کیئر سروسز کے معروف فراہم کنندہ' کا ایوارڈ دیا گیا۔" },
  "news.dallah.2": { en: "Dallah Healthcare announces the construction of the new state-of-the-art Al-Arid Hospital in Riyadh.", ar: "دله الصحية تعلن عن إنشاء مستشفى العارض الجديد والمتطور في الرياض.", ur: "دلہ ہیلتھ کیئر نے ریاض میں نئے اسٹیٹ آف دی آرٹ العارض ہسپتال کی تعمیر کا اعلان کیا۔" },
  "news.dallah.3": { en: "Dallah Healthcare completes 100% acquisition of Care Shield Holding, reinforcing Riyadh presence.", ar: "دله الصحية تكمل استحواذها بنسبة ١٠٠٪ على شركة درع الرعاية، مما يعزز تواجدها في الرياض.", ur: "دلہ ہیلتھ کیئر نے کیئر شیلڈ ہولڈنگ کا 100% حصول مکمل کر لیا، جس سے ریاض میں موجودگی مضبوط ہوئی۔" },

  /* ─── Hub Items ─── */
  "hub.media": { en: "Media", ar: "الوسائط", ur: "میڈیا" },
  "hub.media.desc": { en: "TV, music & radio", ar: "تلفزيون، موسيقى وراديو", ur: "ٹی وی، موسیقی اور ریڈیو" },
  "hub.reading": { en: "Reading", ar: "القراءة", ur: "مطالعہ" },
  "hub.reading.desc": { en: "Books & magazines", ar: "كتب ومجلات", ur: "کتابیں اور رسائل" },
  "hub.social": { en: "Social", ar: "التواصل", ur: "سماجی" },
  "hub.social.desc": { en: "Stay connected", ar: "ابقَ على تواصل", ur: "رابطے میں رہیں" },
  "hub.games": { en: "Games", ar: "الألعاب", ur: "کھیل" },
  "hub.games.desc": { en: "Fun & relaxation", ar: "ترفيه واسترخاء", ur: "تفریح اور آرام" },
  "hub.meeting": { en: "Meeting", ar: "الاجتماعات", ur: "ملاقات" },
  "hub.meeting.desc": { en: "Call family & friends", ar: "اتصل بالعائلة والأصدقاء", ur: "اہل خانہ اور دوستوں کو کال کریں" },
  "hub.internet": { en: "Internet", ar: "الإنترنت", ur: "انٹرنیٹ" },
  "hub.internet.desc": { en: "Surf the internet", ar: "تصفح الإنترنت", ur: "انٹرنیٹ سرفنگ" },
  "hub.tools": { en: "Tools", ar: "الأدوات", ur: "اوزار" },
  "hub.tools.desc": { en: "Lights, blinds & AC", ar: "إضاءة، ستائر وتكييف", ur: "بجلی، پردے اور اے سی" },
  "hub.education": { en: "Education", ar: "تثقيف المرضى", ur: "تعلیم" },
  "hub.education.desc": { en: "Learn & explore", ar: "تعلّم واستكشف", ur: "سیکھیں اور دریافت کریں" },

  /* ─── Service Items ─── */
  "service.consultation": { en: "Consultation", ar: "استشارة", ur: "مشورہ" },
  "service.housekeeping": { en: "Housekeeping", ar: "خدمة الغرف", ur: "ہاؤس کیپنگ" },
  "service.orderFood": { en: "Meal Ordering", ar: "طلب الوجبات", ur: "کھانے کا آرڈر" },
  "service.call": { en: "Call", ar: "اتصال", ur: "کال" },
  "service.survey": { en: "Survey", ar: "استبيان", ur: "سروے" },
  "service.shareFeedback": { en: "Your Feedback", ar: "رأيك يهمنا", ur: "آپ کی رائے" },

  /* ─── Shortcut Items ─── */
  "shortcut.whatsapp": { en: "WhatsApp", ar: "واتساب", ur: "واٹس ایپ" },
  "shortcut.quran": { en: "Quran", ar: "القرآن", ur: "قرآن" },
  "shortcut.mirror": { en: "Mirror", ar: "المرآة", ur: "آئینہ" },
  "shortcut.patientPortal": { en: "Patient Portal", ar: "بوابة المريض", ur: "پیشنٹ پورٹل" },
  "shortcut.podcast": { en: "Podcast", ar: "بودكاست", ur: "پوڈکاسٹ" },
  "shortcut.dallahPodcast": { en: "Dallah Podcast", ar: "بودكاست دله", ur: "دلہ پوڈکاسٹ" },
  "shortcut.academy": { en: "Academy", ar: "الأكاديمية", ur: "اکیڈمی" },

  /* ─── Care Medical Education Items ─── */
  "caremed.edu.normalBirth": { en: "Normal Birth", ar: "الولادة الطبيعية", ur: "نارمل پیدائش" },
  "caremed.edu.depression": { en: "Signs of Depression\nand How to Cope", ar: "علامات الاكتئاب\nوكيفية التعامل معها", ur: "ڈپریشن کی علامات\nاور اس سے نمٹنے کا طریقہ" },
  "caremed.edu.dementia": { en: "Cognition and\nDementia", ar: "الإدراك والخرف", ur: "ادراک اور ڈیمنشیا" },
  "caremed.edu.elderlyExercise": { en: "Exercise for\nThe Elderly", ar: "ممارسة الرياضة\nلكبار السن", ur: "بوڑھوں کے لیے ورزش" },
  "caremed.edu.falls": { en: "Common Causes\nof Falls", ar: "أسباب السقوط\nالشائعة", ur: "گرنے کی عام وجوہات" },
  "caremed.edu.generalHealth": { en: "General Health\nQuestions", ar: "أسئلة عن\nالصحة العامة", ur: "عام صحت کے متعلق سوالات" },
  "caremed.edu.medications": { en: "Questions About\nMedications", ar: "أسئلة بخصوص\nالأدوية", ur: "ادویات کے متعلق سوالات" },

  /* ─── CareMe Slides ─── */
  "care.title": { en: "CareMe", ar: "رعايتي", ur: "میری دیکھ بھال" },
  "care.subtitle": { en: "Your health journey at a glance", ar: "رحلتك الصحية في لمحة", ur: "آپ کی صحت کا سفر ایک نظر میں" },
  "care.profile.title": { en: "Patient Profile", ar: "ملف المريض", ur: "مریض کی پروفائل" },
  "care.overview.title": { en: "Care Overview", ar: "ملخص الرعاية", ur: "دیکھ بھال کا جائزہ" },
  "care.team.title": { en: "My Care Team", ar: "فريق الرعاية", ur: "میری نگہداشت کی ٹیم" },
  "care.plan.title": { en: "My Care Plan", ar: "خطة الرعاية", ur: "میرا کیئر پلان" },
  "care.diet.title": { en: "Diet Codes", ar: "النظام الغذائي", ur: "خوراک کے قوانین" },
  "care.baby.title": { en: "Baby Camera", ar: "كاميرا الطفل", ur: "بیبی کیمرہ" },
  "care.labs.title": { en: "Lab Results", ar: "نتائج المختبر", ur: "لیب کے نتائج" },
  "care.imaging.title": { en: "Scans & Imaging", ar: "الأشعة والتصوير", ur: "کین اور امیجنگ" },
  "care.discharge.title": { en: "Discharge Plan", ar: "خطة الخروج", ur: "ڈسچارج پلان" },
  "care.extension": { en: "Extension", ar: "التحويلة", ur: "ایکسٹینشن" },
  "care.age": { en: "Age", ar: "العمر", ur: "عمر" },
  "care.ageUnits": { en: "{0} Yrs", ar: "{0} سنة", ur: "{0} سال" },
  "care.fullName": { en: "Full Name", ar: "الاسم الكامل", ur: "مکمل نام" },
  "care.dob": { en: "Date Of Birth", ar: "تاريخ الميلاد", ur: "تاریخ پیدائش" },
  "care.birthDateVal": { en: "19 Jan 1993", ar: "١٩ يناير ١٩٩٣", ur: "19 جنوری 1993" },
  "care.emergencyContact": { en: "Emergency Contact", ar: "جهة اتصال الطوارئ", ur: "ہنگامی رابطہ" },
  "care.patientName": { en: "Sara Saleh", ar: "سارة صالح", ur: "سارہ صالح" },
  "care.emergencyName": { en: "Layla Mansour (Mother)", ar: "ليلى منصور (الأم)", ur: "لیلیٰ منصور (والدہ)" },
  "care.sex": { en: "Sex", ar: "الجنس", ur: "جنس" },
  "care.gender": { en: "Gender", ar: "الجنس", ur: "جنس" },
  "care.gender.male": { en: "Male", ar: "ذكر", ur: "مرد" },
  "care.gender.female": { en: "Female", ar: "أنثى", ur: "عورت" },
  "care.bed": { en: "Bed", ar: "السرير", ur: "بستر" },
  "care.insurance": { en: "Insurance", ar: "التأمين", ur: "انشورنس" },
  "care.insurance.tawuniya": { en: "Tawuniya", ar: "التعاونية", ur: "تاونیہ" },
  "care.diet.nas": { en: "No Added Salt", ar: "بدون ملح مضاف", ur: "نک کے بغیر" },
  "care.diet.dm": { en: "Diabetic Menu", ar: "قائمة السكري", ur: "ذیابیطس کا مینو" },
  "care.allergies": { en: "Allergies", ar: "معلومات الحساسية", ur: "الرجی" },
  "care.allergy.penicillin": { en: "Penicillin", ar: "البنسلين", ur: "پینسلیلن" },
  "care.allergy.latex": { en: "Latex", ar: "اللاتكس", ur: "لیٹیکس" },
  "care.allergy.shellfish": { en: "Shellfish", ar: "المحار", ur: "شیل فش" },
  "care.relative": { en: "Relationship", ar: "صلة القرابة", ur: "رشتہ" },
  "care.mobile": { en: "Mobile", ar: "رقم الجوال", ur: "موبائل نمبر" },
  "care.pain.score": { en: "Pain Score", ar: "مقياس الألم", ur: "درد کا اسکور" },
  "care.fallRisk": { en: "Fall Risk", ar: "خطر السقوط", ur: "گرنے کا خطرہ" },
  "care.fallRisk.high": { en: "High", ar: "مرتفع", ur: "زیادہ" },
  "care.mobility": { en: "Patient Mobility", ar: "حركة المريض", ur: "مریض کی نقل و حرکت" },
  "care.mobility.bedRest": { en: "Complete Bed Rest", ar: "راحة تامة في السرير", ur: "مکمل بیڈ ریسٹ" },
  "care.assistance.bed": { en: "Do not leave bed without nursing assistance", ar: "يرجى عدم مغادرة السرير بدون مساعدة التمريض", ur: "نرسنگ امداد کے بغیر بستر نہ چھوڑیں" },

  /* ─── Lab Results ─── */
  "care.labs.cbc": { en: "Complete Blood Count", ar: "تعداد الدم الكامل", ur: "خون کا مکمل ٹیسٹ" },
  "care.labs.glucose": { en: "Glucose Level", ar: "مستوى الجلوكوز", ur: "گلوکوز کی سطح" },
  "care.labs.hemoglobin": { en: "Hemoglobin", ar: "الهيموجلوبين", ur: "ہیموگلوبن" },
  "care.labs.potassium": { en: "Potassium", ar: "البوتاسيوم", ur: "پوٹاشیم" },
  "care.labs.tsh": { en: "TSH (Thyroid)", ar: "خضاب الغدة الدرقية", ur: "TSH (تھائیرائڈ)" },
  "care.labs.normal": { en: "Normal", ar: "طبيعي", ur: "نارمل" },
  "care.labs.high": { en: "High", ar: "مرتفع", ur: "زیادہ" },
  "care.labs.low": { en: "Low", ar: "منخفض", ur: "کم" },


  /* ─── Scans & Imaging ─── */
  "care.imaging.ultrasound": { en: "Obstetric Ultrasound", ar: "تصوير السونار للجنين", ur: "زچگی کا الٹراساؤنڈ" },
  "care.imaging.summary": { en: "Healthy development. Normal fetal heart rate.", ar: "نمو صحي. معدل نبضات قلب الجنين طبيعي.", ur: "صحت مند ترقی۔ جنین کے دل کی دھڑکن نارمل ہے۔" },
  "care.imaging.xray": { en: "Chest X-Ray", ar: "أشعة سينية للصدر", ur: "سینے کا ایکسرے" },
  "care.imaging.xraySummary": { en: "Lungs clear. No acute abnormality detected.", ar: "الرئتان سليمتان. لا يوجد شذوذ حاد.", ur: "پھیپھڑے صاف ہیں۔ کوئی غیر معمولی بات نہیں ملی۔" },
  "care.imaging.mri": { en: "Abdominal MRI", ar: "رنين مغناطيسي للبطن", ur: "پیٹ کا ایم آئی آر" },
  "care.imaging.doppler": { en: "Venous Doppler Scan", ar: "تصوير دوبلر للأوردة", ur: "وینس ڈوپلر اسکین" },
  "care.imaging.dopplerSummary": { en: "Normal blood flow. No evidence of deep vein thrombosis.", ar: "تدفق دم طبيعي. لا يوجد دليل على تخثر الأوردة العميقة.", ur: "خون کا بہاؤ نارمل ہے۔ گہری رگوں کے جمنے کا کوئی ثبوت نہیں ہے۔" },
  "care.imaging.viewReport": { en: "View Detailed Report", ar: "عرض التقرير التفصيلي", ur: "تفصیلی رپورٹ دیکھیں" },
  "care.imaging.pending": { en: "Processing...", ar: "قيد المعالجة...", ur: "پروسیسنگ ہو رہی ہے..." },

  /* ─── Care Team ─── */
  "care.team.name.nura": { en: "Nura Al-Rashid", ar: "نورا الرشيد", ur: "نورہ الرشید" },
  "care.team.name.omar": { en: "Dr. Omar Abdulhalim", ar: "د. عمر عبدالحليم", ur: "ڈاکٹر عمر عبدالحلیم" },
  "care.team.primaryNurse": { en: "Primary Nurse", ar: "الممرضة الرئيسية", ur: "پرائمری نرس" },
  "care.team.attendingDoctor": { en: "Attending Doctor", ar: "الطبيب المعالج", ur: "علاج کرنے والا ڈاکٹر" },
  "care.team.specialty.icu": { en: "ICU", ar: "العناية المركزة", ur: "آئی سی یو" },
  "care.team.specialty.cardiology": { en: "Cardiology", ar: "أمراض القلب", ur: "کارڈیالوجی" },

  /* ─── Care Plan Steps ─── */
  "care.plan.initialAssessment": { en: "Initial Assessment", ar: "التقييم الأولي", ur: "ابتدائی تشخیص" },
  "care.plan.labTests": { en: "Lab Tests", ar: "الفحوصات المخبرية", ur: "لیبارٹری ٹیسٹ" },
  "care.plan.scansImaging": { en: "Scans & Imaging", ar: "الأشعة والتصوير الطبي", ur: "اسکین اور امیجنگ" },
  "care.plan.medicationPrep": { en: "Medication Preparation", ar: "تجهيز الأدوية", ur: "ادویات کی تیاری" },
  "care.plan.laborMonitoring": { en: "Labor Monitoring", ar: "متابعة المخاض", ur: "لیبر کی نگرانی" },
  "care.plan.delivery": { en: "Delivery", ar: "الولادة", ur: "پیدائش" },
  "care.plan.recoveryObservation": { en: "Recovery & Observation", ar: "التعافي والملاحظة", ur: "صحت یابی اور مشاہدہ" },
  "care.plan.motherBabyCheck": { en: "Mother & Baby Check", ar: "فحص الأم والطفل", ur: "ماں اور بچے کا معائنہ" },
  "care.plan.min": { en: "Min", ar: "دقيقة", ur: "منٹ" },
  "care.plan.done": { en: "Done", ar: "تم", ur: "ہو گیا" },

  /* ─── Admission / Discharge Labels ─── */
  "care.admitted": { en: "Admitted", ar: "تاريخ الدخول", ur: "داخلہ" },
  "care.discharge": { en: "Discharge", ar: "الخروج المتوقع", ur: "ڈسچارج" },
  "care.mrn": { en: "MRN", ar: "رقم الملف", ur: "ایم آر این" },
  "care.room": { en: "Room", ar: "الغرفة", ur: "کمرہ" },

  /* ─── Discharge Plan ─── */
  "care.discharge.finalCheck": { en: "Final Mother & Baby Check", ar: "الفحص النهائي للأم والطفل", ur: "ماں اور بچے کا حتمی معائنہ" },
  "care.discharge.medicationPrep": { en: "Medication Preparation", ar: "تجهيز الأدوية", ur: "ادویات کی تیاری" },
  "care.discharge.education": { en: "Discharge Education", ar: "التثقيف قبل الخروج", ur: "ڈسچارج کی تعلیم" },
  "care.discharge.homeCare": { en: "Home Care Guidance", ar: "إرشادات العناية المنزلية", ur: "ہوم کیئر گائیڈنس" },
  "care.discharge.followup": { en: "Follow-up Arrangements", ar: "ترتيبات المتابعة", ur: "فالو اپ کے انتظامات" },
  "care.discharge.billing": { en: "Billing & Insurance Clearance", ar: "إنهاء إجراءات الفاتورة والتأمين", ur: "بلنگ اور انشورنس کلیئرنس" },
  "care.discharge.docsReady": { en: "Discharge Documents Ready", ar: "تجهيز مستندات الخروج", ur: "ڈسچارج دستاویزات تیار ہیں" },
  "care.discharge.confirm": { en: "Confirm Discharge", ar: "تأكيد الخروج", ur: "ڈسچارج کی تصدیق کریں" },
  "care.nutritional.fasting": { en: "Fasting Status", ar: "حالة الصيام", ur: "روزے کی حالت" },
  "care.dietary.regime": { en: "Dietary Regime", ar: "البرنامج الغذائي", ur: "خوراک کا نظام" },
  "care.fasting.yes": { en: "Yes", ar: "نعم", ur: "ہاں" },
  "care.fasting.no": { en: "No", ar: "لا", ur: "نہیں" },


  /* ─── Pain ─── */
  "care.pain.score": { en: "Pain Score", ar: "مقياس الألم", ur: "درد کا اسکور" },
  "care.pain.lastUpdated": { en: "Last updated 2h ago", ar: "آخر تحديث منذ ساعتين", ur: "آخری بار 2 گھنٹے پہلے اپ ڈیٹ ہوا" },
  "care.pain.reported": { en: "Reported Pain", ar: "مؤشر الألم", ur: "رپورٹ کردہ درد" },

  /* ─── Billing ─── */
  "care.billing.title": { en: "Financial Summary", ar: "الملخص المالي", ur: "مالی خلاصہ" },
  "care.billing.status": { en: "Billing Status", ar: "حالة الفاتورة", ur: "بلنگ کی حیثیت" },
  "care.billing.pendingApproval": { en: "Awaiting Approval", ar: "بانتظار الموافقة", ur: "منظوری کا منتظر" },
  "care.billing.totalDue": { en: "Net Amount Due", ar: "المبلغ الصافي المستحق", ur: "کل واجب الادا رقم" },
  "care.billing.breakdown": { en: "Medical Services Breakdown", ar: "تفصيل الخدمات الطبية", ur: "طبی خدمات کی تفصیل" },
  "care.billing.subtotal": { en: "Hospital Charges", ar: "رسوم المستشفى", ur: "ہسپتال کے اخراجات" },
  "care.billing.vat": { en: "VAT (15%)", ar: "ضريبة القيمة المضافة (١٥%)", ur: "ویٹ (15%)" },
  "care.billing.totalInclVat": { en: "Total (incl. VAT)", ar: "الإجمالي (شامل الضريبة)", ur: "کل (بشمول ویٹ)" },
  "care.billing.insuranceCredit": { en: "Insurance Coverage Deduction", ar: "خصم التغطية التأمينية", ur: "انشورنس کوریج کٹوتی" },
  "care.billing.patientPayable": { en: "Amount Due", ar: "المبلغ المستحق", ur: "واجب الادا رقم" },
  "care.billing.viewDetailedInvoice": { en: "View Detailed Invoice", ar: "عرض الفاتورة التفصيلية", ur: "تفصیلی انوائس دیکھیں" },
  "care.billing.invoiceTitle": { en: "Hospital Service Invoice", ar: "فاتورة خدمات المستشفى", ur: "ہسپتال سروس انوائس" },
  "care.billing.payNow": { en: "Proceed to Payment", ar: "المتابعة لإتمام الدفع", ur: "ادائیگی کے لیے آگے بڑھیں" },
  "care.currency": { en: "SAR", ar: "﷼", ur: "SAR" },
  "bill.item.room": { en: "Premium Suite Room", ar: "غرفة تنويم متميزة", ur: "پریمیم سویٹ روم" },
  "bill.item.delivery": { en: "Standard Delivery Package", ar: "باقة الولادة القياسية", ur: "معیاری ڈیلیوری پیکیج" },
  "bill.item.labs": { en: "Post-Natal Lab Panel", ar: "تحاليل ما بعد الولادة", ur: "پوسٹ نیٹل لیب پینل" },
  "bill.item.pharmacy": { en: "In-Patient Medications", ar: "أدوية التنويم", ur: "ان پیشنٹ ادویات" },
  "bill.item.qty": { en: "Qty", ar: "العدد", ur: "تعداد" },

  /* ─── Baby Camera ─── */
  "care.baby.live": { en: "LIVE", ar: "مباشر", ur: "براہ راست" },
  "care.baby.nursery": { en: "Nursery — Camera 3", ar: "الحضانة — كاميرا ٣", ur: "نرسری — کیمرہ 3" },
  "care.baby.connected": { en: "Connected", ar: "متصل", ur: "منسلک" },
  "care.baby.expand": { en: "Expand view", ar: "توسيع العرض", ur: "ویو کو پھیلائیں" },
  "care.baby.tapToExit": { en: "Tap anywhere to exit fullscreen", ar: "اضغط في أي مكان للخروج", ur: "فل سکرین سے باہر نکلنے کے لیے کہیں بھی تھپتھپائیں" },

  /* ─── Settings Panel ─── */
  "settings.title": { en: "Settings", ar: "الإعدادات", ur: "ترتیبات" },
  "settings.brightness": { en: "Brightness", ar: "السطوع", ur: "چمک" },
  "settings.volume": { en: "Volume", ar: "الصوت", ur: "آواز" },
  "settings.wifi": { en: "Wi-Fi", ar: "واي فاي", ur: "وائی فائی" },
  "settings.bluetooth": { en: "Bluetooth", ar: "بلوتوث", ur: "بلوٹوتھ" },
  "settings.cast": { en: "Cast", ar: "عرض الشاشة", ur: "کاسٹ" },
  "settings.castScreen": { en: "Cast Screen", ar: "مشاركة الشاشة", ur: "کاسٹ سکرین" },
  "settings.dnd": { en: "DND", ar: "عدم الإزعاج", ur: "پریشان نہ کریں" },
  "settings.nightLight": { en: "Night Light", ar: "ضوء ليلي", ur: "نائٹ لائٹ" },
  "settings.darkMode": { en: "Dark Mode", ar: "الوضع الداكن", ur: "ڈارک موڈ" },
  "settings.language": { en: "Language", ar: "اللغة", ur: "زبان" },
  "settings.language.select": { en: "Select your preferred display language", ar: "اختر لغة العرض المفضلة", ur: "اپنی پسندیدہ زبان منتخب کریں" },
  /* ─── Care Team Only (formerly Admin) ─── */
  "settings.careTeam": { en: "Care Team", ar: "فريق الرعاية", ur: "کیئر ٹیم" },
  "settings.careTeam.subtitle": { en: "PIN required", ar: "رمز الدخول مطلوب", ur: "پن درکار ہے" },
  "settings.clearData": { en: "Clear Data", ar: "مسح البيانات", ur: "ڈیٹا صاف کریں" },

  /* ─── Care Team Access Dialog ─── */
  "careteam.title": { en: "Care Team Access", ar: "دخول فريق الرعاية", ur: "کیئر ٹیم رسائی" },
  "careteam.enterPin": { en: "Enter 4-digit team PIN", ar: "أدخل رمز الفريق المكون من 4 أرقام", ur: "4 ہندسوں والا ٹیم پن درج کریں" },
  "careteam.incorrect": { en: "Incorrect PIN. Please try again.", ar: "رمز خاطئ. يرجى المحاولة مرة أخرى.", ur: "غلط پن۔ دوبارہ کوشش کریں۔" },
  "careteam.nurseRole": { en: "Nurse Interface", ar: "واجهة التمريض", ur: "نرس انٹرفیس" },
  "careteam.doctorRole": { en: "Physician Interface", ar: "واجهة الطبيب", ur: "ڈاکٹر انٹرفیس" },
  "careteam.del": { en: "DEL", ar: "حذف", ur: "حذف" },
  "careteam.history": { en: "Clinical History", ar: "السجل السريري", ur: "طبی تاریخ" },
  "careteam.addRecord": { en: "Add New Observation", ar: "إضافة ملاحظة جديدة", ur: "نیا مشاہدہ شامل کریں" },
  "patient.attached": { en: "Attached Documents", ar: "المستندات المرفقة", ur: "منسلک دستاویزات" },

  /* ─── Clinical Interface ─── */
  "clinical.patientInfo": { en: "Patient Information", ar: "معلومات المريض", ur: "مریض کی معلومات" },
  "clinical.vitals": { en: "Vital Signs", ar: "العلامات الحيوية", ur: "اہم علامات" },
  "clinical.painLevel": { en: "Pain Assessment", ar: "تقييم الألم", ur: "درد کا اندازہ" },
  "clinical.painReport": { en: "Pain Assessment", ar: "تقييم الألم", ur: "درد کی تشخیص" },
  "clinical.dailyNotes": { en: "Daily Progress Notes", ar: "ملاحظات التطور اليومية", ur: "روزانہ کی پیش رفت کے نوٹ" },
  "clinical.riskAssessment": { en: "Risk Assessment", ar: "تقييم المخاطر", ur: "خطرہ کا اندازہ" },
  "clinical.risks": { en: "Risk Assessment", ar: "تقييم المخاطر", ur: "خطرہ کا اندازہ" },
  "clinical.otherRisk": { en: "Other Risk Factors", ar: "عوامل خطر أخرى", ur: "دیگر خطرے کے عوامل" },
  "clinical.bp": { en: "Blood Pressure", ar: "ضغط الدم", ur: "بلڈ پریشر" },
  "clinical.hr": { en: "Heart Rate", ar: "نبض القلب", ur: "دل کی دھڑکن" },
  "clinical.temp": { en: "Temperature", ar: "الحرارة", ur: "درجہ حرارت" },
  "clinical.spo2": { en: "Oxygen Saturation", ar: "تشبع الأكسجين", ur: "آکسیجن کی سطح" },
  "clinical.reviewing": { en: "Observation Review", ar: "مراجعة الملحوظة", ur: "مشاہدہ کا جائزہ" },
  "clinical.noObs": { en: "No observations available.", ar: "لا توجد ملاحظات متاحة.", ur: "کوئی ملاحظات دستیاب نہیں ہیں۔" },
  "clinical.noDocNote": { en: "No physician note added yet.", ar: "لم تتم إضافة ملاحظة الطبيب بعد.", ur: "ابھی تک ڈاکٹر کا کوئی نوٹ شامل نہیں کیا گیا۔" },
  "clinical.noNotes": { en: "No clinical notes entered.", ar: "لا توجد ملاحظات سريرية.", ur: "کوئی کلینیکل نوٹ درج نہیں کیا گیا۔" },
  "clinical.noRisks": { en: "No active risk flags", ar: "لا توجد مخاطر نشطة", ur: "کوئی فعال خطرہ نہیں" },
  "clinical.otherRiskPlaceholder": { en: "Specify other risk factors...", ar: "حدد عوامل الخطر الأخرى...", ur: "دیگر خطرے کے عوامل بتائیں..." },
  "clinical.notesPlaceholder": { en: "Enter clinical observations...", ar: "أدخل الملاحظات السريرية...", ur: "طبی مشاہدات درج کریں..." },
  "clinical.save": { en: "Save Observation", ar: "حفظ الملاحظة", ur: "مشاہدہ محفوظ کریں" },
  "clinical.lastNurseNote": { en: "Last Nurse Entry", ar: "آخر إدخال للتمريض", ur: "آخری نرس اندراج" },
  "clinical.docNote": { en: "Physician Note", ar: "ملاحظة الطبيب", ur: "طبيب ملاحظة" },
  "clinical.previousDocNote": { en: "Previous Physician Note", ar: "ملاحظة الطبيب السابقة", ur: "ڈاکٹر کا پچھلا نوٹ" },
  "clinical.addDocNote": { en: "Add Physician Note", ar: "إضافة ملاحظة طبيب", ur: "ڈاکٹر کا نوٹ شامل کریں" },
  "clinical.fallRisk": { en: "Fall Risk", ar: "خطر السقوط", ur: "گرنے کا خطرہ" },
  "clinical.pressureUlcer": { en: "Pressure Ulcer Risk", ar: "خطر قرح الفراش", ur: "دباؤ کے زخم کا خطرہ" },
  "clinical.admitted": { en: "Admitted", ar: "تاريخ الدخول", ur: "داخلہ" },
  "clinical.room": { en: "Room", ar: "الغرفة", ur: "کمرہ" },
  "clinical.patient": { en: "Patient", ar: "المريض", ur: "مریض" },
  "clinical.mrn": { en: "MRN", ar: "رقم الملف", ur: "ایم آر این" },
  "clinical.addObs": { en: "Add New Observation", ar: "إضافة ملاحظة جديدة", ur: "نیا مشاہدہ شامل کریں" },
  "clinical.nurse.nura": { en: "Nura Al-Rashid", ar: "نورة الرشيد", ur: "نورہ الرشید" },
  "clinical.patient.sara": { en: "Sara Saleh", ar: "سارة صالح", ur: "سارہ صالح" },

  /* ─── Notifications Panel ─── */
  "notif.title": { en: "Notifications", ar: "الإشعارات", ur: "اطلاعات" },
  "notif.markAllRead": { en: "Mark all as read", ar: "تحديد الكل كمقروء", ur: "تمام کو پڑھا ہوا قرار دیں" },
  "notif.clearAll": { en: "Clear all", ar: "مسح الكل", ur: "تمام مٹائیں" },
  "notif.swipeHint": { en: "Swipe left to dismiss", ar: "اسحب لليمين للحذف", ur: "مٹانے کے لیے بائیں جانب سوائپ کریں" },
  "notif.allCaughtUp": { en: "All caught up!", ar: "لا توجد إشعارات جديدة!", ur: "سب مکمل ہو گیا!" },
  "notif.noNew": { en: "No new notifications at the moment.", ar: "لا توجد إشعارات في الوقت الحالي.", ur: "اس وقت کوئی نئی اطلاع نہیں ہے۔" },

  /* ─── Notification Items ─── */
  "notif.labsReady": { en: "Lab results are ready", ar: "نتائج المختبر جاهزة", ur: "لیب کے نتائج تیار ہیں" },
  "notif.surveyRequest": { en: "We value your feedback", ar: "نحن نقدر ملاحظاتك", ur: "ہم آپ کی رائے کی قدر کرتے ہیں" },
  "notif.mriReady": { en: "MRI results ready for review", ar: "نتائج الرنين المغناطيسي جاهزة للمراجعة", ur: "ایم آر آئی کے نتائج معائنے کے لیے تیار ہیں" },
  "notif.hygieneScheduled": { en: "Room hygiene check scheduled", ar: "موعد فحص نظافة الغرفة", ur: "کمرے کی صفائی کا وقت مقرر ہے" },
  "notif.doctorVisit": { en: "Dr. Al-Ghamdi visit at 3 PM", ar: "زيارة د. الغامدي الساعة 3 م", ur: "ڈاکٹر الغامدی کی آمد 3 بجے" },
  "notif.lunchMenu": { en: "Lunch menu available", ar: "قائمة الغداء متاحة", ur: "دوپہر کے کھانے کا مینو دستیاب ہے" },
  "notif.fileDownloaded": { en: "1 file downloaded", ar: "تم تحميل ملف واحد", ur: "1 فائل ڈاؤن لوڈ ہو گئی" },

  /* ─── Survey ─── */
  "survey.title": { en: "Patient Experience Survey", ar: "استبيان تجربة المريض", ur: "مریض کا تجرباتی سروے" },
  "survey.intro": { en: "Share Your Experience", ar: "شاركنا تجربتك", ur: "اپنا تجربہ شیئر کریں" },
  "survey.introDesc": { en: "Your feedback helps us improve.", ar: "ملاحظاتك تساعدنا على التحسين.", ur: "آپ کی رائے ہمیں بہتر بنانے میں مدد دیتی ہے۔" },
  "survey.start": { en: "Start Survey", ar: "ابدأ الاستبيان", ur: "سروے شروع کریں" },
  "survey.next": { en: "Next", ar: "التالي", ur: "اگلا" },
  "survey.previous": { en: "Previous", ar: "السابق", ur: "پچھلا" },
  "survey.submit": { en: "Submit", ar: "إرسال", ur: "جمع کرائیں" },
  "survey.thankYou": { en: "Thank You!", ar: "شكراً لك!", ur: "شکریہ!" },
  "survey.thankYouDesc": { en: "Your feedback has been recorded.", ar: "تم تسجيل ملاحظاتك.", ur: "آپ کی رائے درج کر لی گئی ہے۔" },
  "survey.close": { en: "Close", ar: "إغلاق", ur: "بند کریں" },
  "survey.q1": { en: "How satisfied are you with the overall quality of care you received?", ar: "ما مدى رضاك عن جودة الرعاية التي تلقيتها؟", ur: "آپ کو ملنے والی دیکھ بھال کے مجموعی معیار سے آپ کتنے مطمئن ہیں؟" },
  "survey.q2": { en: "How would you rate the responsiveness of our nursing staff?", ar: "كيف تقيّم سرعة استجابة طاقم التمريض؟", ur: "آپ ہمارے نرسنگ اسٹاف کی مستعدی کو کیا درجہ دیں گے؟" },
  "survey.q3": { en: "The cleanliness of my room was maintained to a high standard.", ar: "تم الحفاظ على نظافة غرفتي بمستوى عالٍ.", ur: "میرے کمرے کی صفائی کا معیار اعلیٰ رکھا گیا تھا۔" },
  "survey.q4": { en: "How would you rate the quality of food and meals provided?", ar: "كيف تقيّم جودة الطعام والوجبات المقدمة؟", ur: "آپ فراہم کردہ کھانے اور پکوان کے معیار کو کیا درجہ دیں گے؟" },
  "survey.q5": { en: "The medical staff communicated clearly about my treatment and medications.", ar: "تواصل الطاقم الطبي بوضوح حول علاجي وأدويتي.", ur: "طبی عملے نے میرے علاج اور ادویات کے بارے میں واضح طور پر بات کی۔" },
  "survey.q6": { en: "How satisfied were you with the pain management during your stay?", ar: "ما مدى رضاك عن إدارة الألم أثناء إقامتك؟", ur: "آپ قیام کے دوران درد پر قابو پانے کے انتظامات سے کتنے مطمئن تھے؟" },
  "survey.q7": { en: "Overall, how was your experience with us?", ar: "بشكل عام، كيف كانت تجربتك معنا؟", ur: "مجموعی طور پر، ہمارے ساتھ آپ کا تجربہ کیسا رہا؟" },
  /* Survey options */
  "survey.opt.extremelyDissatisfied": { en: "Extremely Dissatisfied", ar: "غير راضٍ تماماً", ur: "بہت زیادہ غیر مطمئن" },
  "survey.opt.dissatisfied": { en: "Dissatisfied", ar: "غير راضٍ", ur: "غیر مطمئن" },
  "survey.opt.neutral": { en: "Neutral", ar: "محايد", ur: "غیر جانبدار" },
  "survey.opt.satisfied": { en: "Satisfied", ar: "راضٍ", ur: "مطمئن" },
  "survey.opt.extremelySatisfied": { en: "Extremely Satisfied", ar: "راضٍ تماماً", ur: "بہت زیادہ مطمئن" },
  "survey.opt.veryPoor": { en: "Very Poor", ar: "ضعيف جداً", ur: "بہت خراب" },
  "survey.opt.poor": { en: "Poor", ar: "ضعيف", ur: "خراب" },
  "survey.opt.average": { en: "Average", ar: "متوسط", ur: "اوسط" },
  "survey.opt.good": { en: "Good", ar: "جيد", ur: "اچھا" },
  "survey.opt.excellent": { en: "Excellent", ar: "ممتاز", ur: "بہت عمدہ" },
  "survey.opt.stronglyDisagree": { en: "Strongly Disagree", ar: "أعارض بشدة", ur: "سختی سے اختلاف" },
  "survey.opt.disagree": { en: "Disagree", ar: "أعارض", ur: "اختلاف" },
  "survey.opt.agree": { en: "Agree", ar: "أوافق", ur: "اتفاق" },
  "survey.opt.stronglyAgree": { en: "Strongly Agree", ar: "أوافق بشدة", ur: "سختی سے اتفاق" },
  "survey.additionalFeedback": { en: "Any additional feedback? (optional)", ar: "هل لديك ملاحظات إضافية؟ (اختياري)", ur: "کوئی مزید رائے؟ (اختیاری)" },
  "survey.feedbackPlaceholder": { en: "Share your thoughts...", ar: "شاركنا أفكارك...", ur: "خیالات شیئر کریں..." },
  "survey.questionOf": { en: "Question {0} of {1}", ar: "السؤال {0} من {1}", ur: "سوال {0} از {1}" },

  /* ─── About Us ─── */
  "about.title": { en: "About Us", ar: "عن المستشفى", ur: "ہمارے بارے میں" },
  "about.aboutDallah": { en: "About Dallah", ar: "عن دله", ur: "دلہ کے بارے میں" },
  "about.ourHospital": { en: "Our Hospital", ar: "المستشفى", ur: "ہمارا ہسپتال" },
  "about.dna": { en: "{0} DNA", ar: "{0} DNA", ur: "{0} ڈی این اے" },
  "about.dallahDna": { en: "Dallah DNA", ar: "دله DNA", ur: "دلہ ڈی این اے" },
  "about.caremedInBrief": { en: "CareMed InBrief", ar: "نبذة عن رعاية الطبية", ur: "کیئر میڈ مختصر طور پر" },
  "about.numbers": { en: "{0} In Numbers", ar: "{0} في أرقام", ur: "{0} اعداد و شمار میں" },
  "about.services": { en: "Services", ar: "الخدمات", ur: "خدمات" },
  "about.accreditations": { en: "Accreditations", ar: "الاعتمادات", ur: "اعتمادات" },
  "about.awards": { en: "Awards", ar: "الجوائز", ur: "ایوارڈز" },
  "about.digital": { en: "Digital Services", ar: "الخدمات الرقمية", ur: "ڈیجیٹل خدمات" },
  "about.patientRights": { en: "Patient Rights", ar: "حقوق المريض", ur: "مریض کے حقوق" },
  "about.watchVideo": { en: "Watch Our Hospital Video", ar: "شاهد فيديو المستشفى", ur: "ہمارے ہسپتال کی ویڈیو دیکھیں" },
  "about.video": { en: "Video", ar: "فيديو", ur: "ویڈیو" },

  /* ─── App Launcher ─── */
  "launcher.media": { en: "Media", ar: "الوسائط", ur: "میڈیا" },
  "launcher.reading": { en: "Reading", ar: "القراءة", ur: "مطالعہ" },
  "launcher.social": { en: "Social", ar: "التواصل الاجتماعي", ur: "سماجی" },
  "launcher.games": { en: "Games", ar: "الألعاب", ur: "کھیل" },
  "launcher.meeting": { en: "Meeting", ar: "الاجتماعات", ur: "ملاقات" },
  "launcher.internet": { en: "Internet", ar: "الإنترنت", ur: "انٹرنیٹ" },
  "launcher.tools": { en: "Tools", ar: "الأدوات", ur: "اوزار" },
  "launcher.education": { en: "Education", ar: "تثقيف المرضى", ur: "تعلیم" },
  "launcher.launching": { en: "Launching {0}...", ar: "جارٍ تشغيل {0}...", ur: "{0} شروع ہو رہا ہے..." },

  /* ─── Room Info ─── */
  "room.info": { en: "Room 412", ar: "غرفة ٤١٢", ur: "کمرہ 412" },
  "room.bedA": { en: "Bed A", ar: "سرير أ", ur: "بستر A" },

  /* ─── App Tour ─── */
  "tour.welcome": { en: "Welcome to your room!", ar: "!مرحباً بك في غرفتك", ur: "آپ کے کمرے میں خوش آمدید!" },
  "tour.skip": { en: "Skip Tour", ar: "تخطي الجولة", ur: "ٹور چھوڑیں" },
  "tour.next": { en: "Next", ar: "التالي", ur: "اگلا" },
  "tour.finish": { en: "Finish", ar: "إنهاء", ur: "ختم کریں" },
  "tour.of": { en: "of", ar: "من", ur: "میں سے" },
  "tour.back": { en: "Back", ar: "رجوع", ur: "واپس" },
  "tour.startTour": { en: "Start Tour", ar: "ابدأ الجولة", ur: "ٹور شروع کریں" },
  "tour.finishTour": { en: "Finish Tour", ar: "إنهاء الجولة", ur: "ٹور ختم کریں" },
  "tour.skipTour": { en: "Skip tour", ar: "تخطي الجولة", ur: "ٹور چھوڑیں" },
  "tour.step.welcome.title": { en: "Welcome to Your Bedside Companion", ar: "مرحباً بك في شاشة السرير الذكية", ur: "آپ کے بیڈ سائیڈ ساتھی میں خوش آمدید" },
  "tour.step.welcome.body": { en: "This interactive guide will walk you through every feature of your in-room smart display — from entertainment to hospital services.", ar: "سيرشدك هذا الدليل التفاعلي خلال جميع ميزات شاشتك الذكية — من الترفيه إلى خدمات المستشفى.", ur: "یہ انٹرایکٹو گائیڈ آپ کو آپ کے کمرے کے سمارٹ ڈسپلے کی ہر خصوصیت سے آگاہ کرے گی — تفریح سے لے کر ہسپتال کی خدمات تک۔" },
  "tour.step.welcome.detail": { en: "Tap \"Next\" to begin, or skip anytime.", ar: "اضغط \"التالي\" للبدء، أو تخطَّ في أي وقت.", ur: "شروع کرنے کے لیے \"اگلا\" پر ٹیپ کریں، یا کسی بھی وقت چھوڑ دیں۔" },
  "tour.step.prayer.title": { en: "Prayer Times", ar: "أوقات الصلاة", ur: "نماز کے اوقات" },
  "tour.step.prayer.body": { en: "All five daily prayer times at a glance. The next upcoming prayer is highlighted so you never miss a salah.", ar: "أوقات الصلوات الخمس في لمحة. يتم تمييز الصلاة القادمة حتى لا تفوتك.", ur: "پانچوں وقت کی نماز کے اوقات ایک نظر میں۔ اگلی نماز کو نمایاں کیا گیا ہے تاکہ آپ کی کوئی نماز چھوٹ نہ جائے۔" },
  "tour.step.controls.title": { en: "Status Bar & Quick Controls", ar: "شريط الحالة والتحكم السريع", ur: "اسٹیٹس بار اور کوئیک کنٹرولز" },
  "tour.step.controls.body": { en: "Current time, date, live weather, language toggle, notification bell, and settings — all one tap away.", ar: "الوقت الحالي، التاريخ، حالة الطقس، تغيير اللغة، الإشعارات، والإعدادات — كلها بضغطة واحدة.", ur: "موجودہ وقت، تاریخ، براہ راست موسم، زبان کی تبدیلی، نوٹیفکیشن بیل، اور سیٹنگز — سب ایک ٹیپ کی دوری پر۔" },
  "tour.step.controls.detail": { en: "The red badge on the bell shows unread notifications.", ar: "الشارة الحمراء على الجرس تعرض الإشعارات غير المقروءة.", ur: "گھنٹی پر موجود سرخ بیج نہ پڑھے گئے نوٹیفیکیشنز کو ظاہر کرتا ہے۔" },
  "tour.step.ticker.title": { en: "News & Announcements", ar: "الأخبار والإعلانات", ur: "خبریں اور اعلانات" },
  "tour.step.ticker.body": { en: "A scrolling ticker delivers real-time hospital news, health tips, and service updates — personalized to your ward.", ar: "شريط أخبار متحرك يعرض أخبار المستشفى والنصائح الصحية وتحديثات الخدمات.", ur: "ایک اسکرولنگ ٹکر ہسپتال کی تازہ ترین خبریں، صحت کے نکات، اور سروس اپ ڈیٹس فراہم کرتا ہے۔" },
  "tour.step.greeting.title": { en: "Your Personal Card", ar: "بطاقتك الشخصية", ur: "آپ کا اپنا کارڈ" },
  "tour.step.greeting.body": { en: "Your name, room number, MRN, and extension — plus a quick link to learn about the hospital with the \"About Us\" button.", ar: "اسمك، رقم الغرفة، رقم الملف، والتحويلة — بالإضافة إلى رابط سريع للتعرف على المستشفى.", ur: "آپ کا نام، کمرہ نمبر، ایم آر این، اور ایکسٹینشن — علاوہ ہسپتال کے بارے میں جاننے کے لیے ایک فوری لنک۔" },
  "tour.step.greeting.detail": { en: "Tap the ? icon in the corner to relaunch this tour anytime.", ar: "اضغط على أيقونة ؟ في الزاوية لإعادة تشغيل هذه الجولة في أي وقت.", ur: "اس ٹور کو کسی بھی وقت دوبارہ شروع کرنے کے لیے کونے میں موجود ؟ آئیکن پر ٹیپ کریں۔" },
  "tour.step.careme.title": { en: "CareMe — Your Health Hub", ar: "رعايتي — مركز صحتك", ur: "کیئر می — آپ کا ہیلتھ حب" },
  "tour.step.careme.body": { en: "Access your Care Team, Care Plan, Diet & Allergies, Baby Camera, and Discharge Plan — all in one rotating card.", ar: "الوصول إلى فريق الرعاية، خطة الرعاية، النظام الغذائي والحساسية، كاميرا الطفل، وخطة الخروج — الكل في بطاقة واحدة متحركة.", ur: "اپنی کیئر ٹیم، کیئر پلان، غذا اور الرجی، بیبی کیمرہ، اور ڈسچارج پلان تک رسائی حاصل کریں۔" },
  "tour.step.careme.detail": { en: "Tap any card to expand it into a full-screen detailed view.", ar: "اضغط على أي بطاقة لتوسيعها إلى عرض تفصيلي بملء الشاشة.", ur: "کسی بھی کارڈ کو فل سکرین تفصیلی ویو میں پھیلانے کے لیے اس پر ٹیپ کریں۔" },
  "tour.step.hub.title": { en: "Entertainment & Engagement Hub", ar: "مركز الترفيه والتفاعل", ur: "تفریح اور مشغولیت کا حب" },
  "tour.step.hub.body": { en: "Eight categories of content — Media, Reading, Social, Games, Meeting, Internet, Tools, and Education — designed for your comfort.", ar: "ثمان فئات من المحتوى — الوسائط، القراءة، التواصل، الألعاب، الاجتماعات، الإنترنت، الأدوات، والتثقيف — مصممة لراحتك.", ur: "مواد کے آٹھ زمرے — میڈیا، مطالعہ، سماجی، گیمز، میٹنگ، انٹرنیٹ، ٹولز، اور تعلیم۔" },
  "tour.step.hub.detail": { en: "Each tile opens a curated launcher with apps and content relevant to that category.", ar: "كل مربع يفتح قائمة تطبيقات ومحتوى متعلق بتلك الفئة.", ur: "ہر ٹائل اس زمرے سے متعلق ایپس اور مواد کے ساتھ ایک منتخب لانچر کھولتی ہے۔" },
  "tour.step.services.title": { en: "Hospital Services", ar: "خدمات المستشفى", ur: "ہسپتال کی خدمات" },
  "tour.step.services.body": { en: "Request a consultation, call housekeeping, order food, or ring the nurse station — directly from your screen.", ar: "اطلب استشارة، اتصل بالتنظيف، اطلب الطعام، أو اتصل بمحطة التمريض — مباشرة من شاشتك.", ur: "براہ راست اپنی اسکرین سے مشورے کی درخواست کریں، ہاؤس کیپنگ کو کال کریں، یا کھانا آرڈر کریں۔" },
  "tour.step.services.detail": { en: "Requests are routed to the right department instantly.", ar: "يتم توجيه الطلبات إلى القسم المناسب فوراً.", ur: "درخواستیں فوری طور پر متعلقہ محکمے کو بھیج دی جاتی ہیں۔" },
  "tour.step.shortcuts.title": { en: "Quick Shortcuts", ar: "الاختصارات السريعة", ur: "فوری شارٹ کٹس" },
  "tour.step.shortcuts.body": { en: "Your most-used apps, always one tap away. These shortcuts are configured by your hospital for quick, convenient access.", ar: "تطبيقاتك الأكثر استخداماً، دائماً بضغطة واحدة. هذه الاختصارات معدة من قبل المستشفى للوصول السريع.", ur: "آپ کی سب سے زیادہ استعمال ہونے والی ایپس، ہمیشہ ایک ٹیپ کی دوری پر۔" },
  "tour.step.survey.title": { en: "Share Your Feedback", ar: "شاركنا رأيك", ur: "اپنی رائے دیں" },
  "tour.step.survey.body": { en: "Help us improve! Tap here to complete a quick satisfaction survey about your stay, meals, or staff.", ar: "ساعدنا على التحسين! اضغط هنا لإكمال استبيان سريع عن إقامتك ووجباتك وطاقم العمل.", ur: "بہتر بنانے میں ہماری مدد کریں! اپنے قیام، کھانے یا عملے کے بارے میں سروے مکمل کرنے کے لیے یہاں ٹیپ کریں۔" },
  "tour.step.finish.title": { en: "You're All Set!", ar: "أنت جاهز!", ur: "آپ بالکل تیار ہیں!" },
  "tour.step.finish.body": { en: "You now know every feature of your bedside companion. Enjoy a comfortable, connected stay.", ar: "أنت الآن تعرف جميع ميزات شاشة السرير الذكية. استمتع بإقامة مريحة ومتصلة.", ur: "اب آپ اپنے بیڈ سائیڈ ساتھی کی ہر خصوصیت سے واقف ہیں۔ آرام دہ قیام کا لطف اٹھائیں۔" },
  "tour.step.finish.detail": { en: "You can restart this tour anytime from the ? button on your greeting card.", ar: "يمكنك إعادة تشغيل هذه الجولة في أي وقت من زر ؟ في بطاقة الترحيب.", ur: "آپ اپنے گریٹنگ کارڈ پر موجود ؟ بٹن سے کسی بھی وقت یہ ٹور دوبارہ شروع کر سکتے ہیں۔" },
  "tour.keyboard.back": { en: "Back", ar: "رجوع", ur: "واپس" },
  "tour.keyboard.next": { en: "Next", ar: "التالي", ur: "اگلا" },
  "tour.keyboard.exit": { en: "Exit", ar: "خروج", ur: "باہر نکلیں" },

  /* ─── Dates ─── */
  "date.mar": { en: "Mar", ar: "مارس", ur: "مارچ" },
  "date.marFull": { en: "March", ar: "مارس", ur: "مارچ" },
  "date.5mar2026": { en: "05 Mar 2026", ar: "٥ مارس ٢٠٢٦", ur: "05 مارچ 2026" },
  "date.12mar2026": { en: "12 Mar 2026", ar: "١٢ مارس ٢٠٢٦", ur: "12 مارچ 2026" },

  /* ─── Education Apps ─── */
  "edu.cesareanRecovery": { en: "5 Steps to Recovery\nAfter Cesarean", ar: "5 خطوات للتعافي\nبعد القيصرية", ur: "سیزرین کے بعد\nصحت یابی کے 5 اقدامات" },
  "edu.painManagement": { en: "Pain Management\nGuide", ar: "دليل إدارة\nالألم", ur: "درد پر قابو پانے\nکا طریقہ" },
  "edu.woundCare": { en: "Wound Care\nInstructions", ar: "تعليمات العناية\nبالجروح", ur: "زخموں کی دیکھ بھال\nکی ہدایات" },
  "edu.exerciseVideo": { en: "Post-Op Exercises\n& Mobility", ar: "تمارين ما بعد\nالعملية والحركة", ur: "آپریشن کے بعد کی\nورزش اور نقل و حرکت" },
  "edu.medicationGuide": { en: "Your Medication\nSchedule", ar: "جدول\nأدويتك", ur: "آپ کی ادویات\nکا شیڈول" },
  "edu.nutritionVideo": { en: "Nutrition Tips for\nFaster Healing", ar: "نصائح غذائية\nللشفاء الأسرع", ur: "تیزی سے صحت یابی کے لیے\nغذائی تجاویز" },
  "edu.dischargeChecklist": { en: "Discharge\nChecklist", ar: "قائمة فحص\nالخروج", ur: "ڈسچارج چیک لسٹ" },
  "edu.infectionSigns": { en: "Signs of Infection\nWhat to Watch For", ar: "علامات العدوى\nما يجب مراقبته", ur: "انفیکشن کی علامات\nجن پر نظر رکھنی ہے" },
  "edu.babyCare": { en: "Newborn Care\nBasics", ar: "أساسيات رعاية\nالمولود", ur: "نوزائیدہ کی دیکھ بھال\nکے بنیادی اصول" },
  "edu.breathingExercises": { en: "Breathing Exercises\nfor Recovery", ar: "تمارين التنفس\nللتعافي", ur: "صحت یابی کے لیے\nسانس لینے کی ورزشیں" },
  "edu.bloodClot": { en: "Preventing Blood\nClots After Surgery", ar: "الوقاية من الجلطات\nبعد العملية", ur: "سرجری کے بعد خون کے\nلوتھڑے بننے سے بچنا" },
  "edu.emotionalHealth": { en: "Emotional Health\nAfter Delivery", ar: "الصحة النفسية\nبعد الولادة", ur: "ڈیلیوری کے بعد\nجذباتی صحت" },
  "edu.scarCare": { en: "Scar Care &\nHealing Timeline", ar: "العناية بالندبة\nوجدول الشفاء", ur: "نشانات کی دیکھ بھال\nاور صحت یابی کا وقت" },
  "edu.sleepTips": { en: "Sleep Positions\nAfter C-Section", ar: "azenات النوم\nبعد القيصرية", ur: "سی سیکشن کے بعد\nسونے کے انداز" },
  "edu.pelvicFloor": { en: "Pelvic Floor\nExercises", ar: "تمارين قاع\nالحوض", ur: "پیلک فلور ورزشیں" },
  "edu.whenToCall": { en: "When to Call\nYour Doctor", ar: "متى تتصل\nبطبيبك", ur: "اپنے ڈاکٹر کو\nکب کال کریں" },

  /* ─── Call Screen ─── */
  "call.title": { en: "Call", ar: "اتصال", ur: "کال" },
  "call.directory": { en: "Directory", ar: "الدليل", ur: "ڈائریکٹری" },
  "call.missed": { en: "Missed", ar: "فائتة", ur: "مس کالز" },
  "call.attended": { en: "Attended", ar: "مُجابة", ur: "حاضر" },
  "call.nurseStation": { en: "Nurse Station", ar: "محطة التمريض", ur: "نرس اسٹیشن" },
  "call.nurseStation.desc": { en: "24/7 nursing support", ar: "دعم تمريضي على مدار الساعة", ur: "24/7 نرسنگ سپورٹ" },
  "call.reception": { en: "Reception", ar: "الاستقبال", ur: "استقبالیہ" },
  "call.reception.desc": { en: "Front desk & visitor info", ar: "مكتب الاستقبال ومعلومات الزوار", ur: "فرنٹ ڈیسک اور زائرین کی معلومات" },
  "call.pharmacy": { en: "Pharmacy", ar: "الصيدلية", ur: "فارمیسی" },
  "call.pharmacy.desc": { en: "Medication inquiries", ar: "استفسارات الأدوية", ur: "ادویات کے بارے میں پوچھ گچھ" },
  "call.dietary": { en: "Dietary Services", ar: "خدمات التغذية", ur: "غذائی خدمات" },
  "call.dietary.desc": { en: "Meals & nutrition support", ar: "الوجبات ودعم التغذية", ur: "کھانا اور غذائیت کا تعاون" },
  "call.housekeeping": { en: "Housekeeping", ar: "خدمة الغرف", ur: "ہاؤس کیپنگ" },
  "call.housekeeping.desc": { en: "Room cleaning requests", ar: "طلبات تنظيف الغرفة", ur: "کمرے کی صفائی کی درخواستیں" },
  "call.patientRelations": { en: "Patient Relations", ar: "علاقات المرضى", ur: "مریضوں کے تعلقات" },
  "call.patientRelations.desc": { en: "Feedback & assistance", ar: "ملاحظات ومساعدة", ur: "رائے اور مدد" },
  "call.itSupport": { en: "IT Support", ar: "الدعم الفني", ur: "آئی ٹی سپورٹ" },
  "call.itSupport.desc": { en: "Technical assistance", ar: "مساعدة تقنية", ur: "تکنیکی مدد" },
  "call.religiousServices": { en: "Religious Services", ar: "الخدمات الدينية", ur: "مذہبی خدمات" },
  "call.religiousServices.desc": { en: "Chaplain & spiritual care", ar: "الرعاية الروحية", ur: "روحانی نگہداشت" },
  "call.operator": { en: "Operator", ar: "عال اهاتف", ur: "آپریٹر" },
  "call.operator.desc": { en: "General hospital operator", ar: "عامل الهاتف العام", ur: "ہسپتال کا عام آپریٹر" },
  "call.emergency": { en: "Emergency", ar: "الطوارئ", ur: "ہنگامی صورتحال" },
  "call.emergency.desc": { en: "Emergency response", ar: "استجابة طوارئ", ur: "ہنگامی ردعمل" },
  "call.ext": { en: "Ext.", ar: "تحويلة", ur: "ایکسٹینشن" },
  "call.dialExt": { en: "Tap an extension to call", ar: "اضغط على تحويلة للاتصال", ur: "کال کرنے کے لیے ایکسٹینشن پر ٹیپ کریں" },
  "call.noMissed": { en: "No missed calls", ar: "لا توجد مكالمات فائتة", ur: "کوئی مس کال نہیں" },
  "call.noAttended": { en: "No attended calls", ar: "لا توجد مكالمات مُجابة", ur: "کوئی اٹینڈڈ کال نہیں" },
  "call.incoming": { en: "Incoming Call", ar: "مكالمة واردة", ur: "آنے والی کال" },
  "call.outgoing": { en: "Calling...", ar: "جارٍ الاتصال...", ur: "کال ہو رہی ہے..." },
  "call.ringing": { en: "Ringing", ar: "يرنّ", ur: "گھنٹی بج رہی ہے" },
  "call.connected": { en: "Connected", ar: "متصل", ur: "منسلک" },
  "call.accept": { en: "Accept", ar: "رد", ur: "قبول کریں" },
  "call.decline": { en: "Decline", ar: "رفض", ur: "مسترد کریں" },
  "call.endCall": { en: "End Call", ar: "إنهاء", ur: "کال ختم کریں" },
  "call.cancel": { en: "Cancel", ar: "إلغاء", ur: "منسوخ" },
  "call.mute": { en: "Mute", ar: "كتم", ur: "خاموش" },
  "call.unmute": { en: "Unmute", ar: "إلغاء الكتم", ur: "آواز کھولیں" },
  "call.speaker": { en: "Speaker", ar: "مكبر الصوت", ur: "اسپیکر" },
  "call.hold": { en: "Hold", ar: "انتظار", ur: "ہولڈ" },
  "call.resume": { en: "Resume", ar: "استئناف", ur: "دوبارہ شروع کریں" },
  "call.keypad": { en: "Keypad", ar: "لوحة المفاتيح", ur: "کی پیڈ" },
  "call.duration": { en: "Duration", ar: "المدة", ur: "دورانیہ" },
  "call.today": { en: "Today", ar: "اليوم", ur: "آج" },
  "call.yesterday": { en: "Yesterday", ar: "أمس", ur: "کل" },
  "call.callEnded": { en: "Call Ended", ar: "انتهت المكالمة", ur: "کال ختم ہو گئی" },
  "call.missedCall": { en: "Missed Call", ar: "مكالمة فائتة", ur: "مسڈ کال" },
  "call.simulateIncoming": { en: "Simulate Incoming Call", ar: "محاكاة مكالمة واردة", ur: "ان کمنگ کال سمیلیٹ کریں" },
  "call.yourExtension": { en: "Your Ext.", ar: "تحويلة غرفتك", ur: "آپ کا ایکسٹینشن" },
  "call.roomNo": { en: "Room No.", ar: "رقم الغرفة", ur: "کمرہ نمبر" },
  "call.room": { en: "Room", ar: "الغرفة", ur: "کمرہ" },
  "call.hospitalDirectory": { en: "Hospital Directory", ar: "دليل المستشفى", ur: "ہسپتال ڈائرکٹری" },
  "call.tapToCall": { en: "Tap any extension to start a call", ar: "اضغط على أي تحويلة لبدء الاتصال", ur: "کال شروع کرنے کے لیے کسی بھی ایکسٹینشن پر ٹیپ کریں" },
  "call.recentCalls": { en: "Recent Calls", ar: "المكالمات الأخيرة", ur: "حالیہ کالز" },
  "call.callBack": { en: "Call Back", ar: "معاودة الاتصال", ur: "واپس کال کریں" },
  "call.keypadTitle": { en: "Dial a Number", ar: "اتصل برقم", ur: "نمبر ڈائل کریں" },
  "call.keypadHint": { en: "Enter an Extension", ar: "ادخل التحويلة", ur: "ایکسٹینشن درج کریں" },
  "call.history": { en: "Call History", ar: "سجل المكالمات", ur: "کال کی تاریخ" },
  "call.all": { en: "All", ar: "الكل", ur: "تمام" },
  "call.noHistory": { en: "No call history", ar: "لا يوجد سجل مكالمات", ur: "کال کی کوئی تاریخ نہیں" },
};
 
/* ── Number Localization ── */
export function localizeNumber(n: number | string, locale: Locale): string {
  const s = String(n);
  if (locale === "ar") {
    return s.replace(/[0-9]/g, w => "٠١٢٣٤٥٦٧٨٩"[+w]);
  }
  return s;
}

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
  const isRTL = locale === "ar" || locale === "ur";
  const dir = isRTL ? "rtl" : "ltr";
  const fontFamily = isRTL ? theme.fontFamilyAr : theme.fontFamily;
  const t = createT(locale);
  return { t, locale, isRTL, dir, fontFamily, localizeNumber: (n: number | string) => localizeNumber(n, locale) };
}
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
  "service.shareFeedback": { en: "Your Feedback", ar: "رأيك يهمنا" },

  /* ─── Shortcut Items ─── */
  "shortcut.whatsapp": { en: "WhatsApp", ar: "واتساب" },
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
  "care.team.title": { en: "My Care Team", ar: "فريق الرعاية", ur: "میری نگہداشت کی ٹیم" },
  "care.plan.title": { en: "My Care Plan", ar: "خطة الرعاية", ur: "میرا کیئر پلان" },
  "care.diet.title": { en: "Diet Codes", ar: "النظام الغذائي", ur: "خوراک کے قوانین" },
  "care.baby.title": { en: "Baby Camera", ar: "كاميرا الطفل", ur: "بیبی کیمرہ" },
  "care.labs.title": { en: "Lab Results", ar: "نتائج المختبر", ur: "لیب کے نتائج" },
  "care.imaging.title": { en: "Scans & Imaging", ar: "الأشعة والتصوير", ur: "کین اور امیجنگ" },
  "care.discharge.title": { en: "Discharge Plan", ar: "خطة الخروج", ur: "ڈسچارج پلان" },
  "care.extension": { en: "Extension", ar: "التحويلة", ur: "ایکسٹینشن" },
  "care.diet.nas": { en: "No Added Salt", ar: "بدون ملح مضاف", ur: "نک کے بغیر" },
  "care.diet.dm": { en: "Diabetic Menu", ar: "قائمة السكري", ur: "ذیابیطس کا مینو" },
  "care.allergies": { en: "Allergies", ar: "معلومات الحساسية", ur: "الرجی" },
  "care.allergy.penicillin": { en: "Penicillin", ar: "البنسلين", ur: "پینسلیلن" },
  "care.allergy.latex": { en: "Latex", ar: "اللاتكس", ur: "لیٹیکس" },
  "care.allergy.shellfish": { en: "Shellfish", ar: "المحار", ur: "شیل فش" },

  /* ─── Lab Results ─── */
  "care.labs.cbc": { en: "Complete Blood Count", ar: "تعداد الدم الكامل", ur: "خون کا مکمل ٹیسٹ" },
  "care.labs.glucose": { en: "Glucose Level", ar: "مستوى الجلوكوز", ur: "گلوکوز کی سطح" },
  "care.labs.hemoglobin": { en: "Hemoglobin", ar: "الهيموجلوبين", ur: "ہیموگلوبن" },
  "care.labs.potassium": { en: "Potassium", ar: "البوتاسيوم", ur: "پوٹاشیم" },
  "care.labs.tsh": { en: "TSH (Thyroid)", ar: "خضاب الغدة الدرقية", ur: "TSH (تھائیرائڈ)" },
  "care.labs.normal": { en: "Normal", ar: "طبيعي", ur: "نارمل" },
  "care.labs.high": { en: "High", ar: "مرتفع", ur: "زیادہ" },
  "care.labs.low": { en: "Low", ar: "منخفض", ur: "کم" },
  "care.team.specialty.icu": { en: "ICU", ar: "العناية المركزة", ur: "آئی سی یو" },
  "care.team.specialty.cardiology": { en: "Cardiology", ar: "أمراض القلب", ur: "کارڈیالوجی" },

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
  "care.team.name.nura": { en: "Nura Al-Rashid", ar: "نورا الرشيد" },
  "care.team.name.omar": { en: "Dr. Omar Abdulhalim", ar: "د. عمر عبدالحليم" },
  "care.team.primaryNurse": { en: "Primary Nurse", ar: "الممرضة الرئيسية" },
  "care.team.attendingDoctor": { en: "Attending Doctor", ar: "الطبيب المعالج" },
  "care.team.specialty.icu": { en: "ICU", ar: "العناية المركزة" },
  "care.team.specialty.cardiology": { en: "Cardiology", ar: "أمراض القلب" },

  /* ─── Care Plan Steps ─── */
  "care.plan.initialAssessment": { en: "Initial Assessment", ar: "التقييم الأولي", ur: "ابتدائی تشخیص" },
  "care.plan.bloodWork": { en: "Blood Work & Labs", ar: "تحاليل الدم والمختبر", ur: "خون کے ٹیسٹ اور لیب" },
  "care.plan.medicationRound": { en: "Medication Round", ar: "جولة الأدوية", ur: "ادویات کا چکر" },
  "care.plan.checkup": { en: "Check-up by Nurse", ar: "فحص الممرضة", ur: "نرس کے ذریعے معائنہ" },
  "care.plan.physicalTherapy": { en: "Physical Therapy", ar: "العلاج الطبيعي", ur: "فزیوتھراپی" },
  "care.plan.doctorReview": { en: "Doctor Review", ar: "مراجعة الطبيب", ur: "ڈاکٹر کا جائزہ" },
  "care.plan.min": { en: "Min", ar: "دقيقة", ur: "منٹ" },
  "care.plan.done": { en: "Done", ar: "تم", ur: "ہو گیا" },

  /* ─── Admission / Discharge Labels ─── */
  "care.admitted": { en: "Admitted", ar: "تاريخ الدخول" },
  "care.admitted": { en: "Admitted", ar: "تاريخ الدخول", ur: "داخلہ" },
  "care.discharge": { en: "Discharge", ar: "الخروج المتوقع", ur: "ڈسچارج" },
  "care.mrn": { en: "MRN", ar: "رقم الملف", ur: "ایم آر این" },

  /* ─── Discharge Plan ─── */
  "care.discharge.order": { en: "Discharge Order by Doctor", ar: "أمر الخروج من الطبيب", ur: "ڈاکٹر کے ذریعہ ڈسچارج کا حکم" },
  "care.discharge.insurance": { en: "Insurance & Billing Clearance", ar: "تسوية التأمين والفواتير", ur: "انشورنس اور بلنگ کی کلیئرنس" },
  "care.discharge.medication": { en: "Medication Preparation", ar: "تحضير الأدوية", ur: "ادویات کی تیاری" },
  "care.discharge.education": { en: "Patient Education & Instructions", ar: "تثقيف المريض والإرشادات", ur: "مریض کی تعلیم اور ہدایات" },
  "care.discharge.finalCheckup": { en: "Final Check-up", ar: "الفحص النهائي", ur: "آخری معائنہ" },
  "care.discharge.confirm": { en: "Confirm Discharge", ar: "تأكيد الخروج", ur: "ڈسچارج کی تصدیق کریں" },

  /* ─── Pain ─── */
  "care.pain.score": { en: "Pain Score", ar: "مقياس الألم" },
  "care.pain.lastUpdated": { en: "Last updated 2h ago", ar: "آخر تحديث منذ ساعتين" },
  "care.pain.reported": { en: "Reported Pain", ar: "مؤشر الألم" },

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
  "settings.dnd": { en: "DND", ar: "عدم الإزعاج", ur: "پریشان نہ کریں" },
  "settings.nightLight": { en: "Night Light", ar: "ضوء ليلي", ur: "نائٹ لائٹ" },
  "settings.darkMode": { en: "Dark Mode", ar: "الوضع الداكن", ur: "ڈارک موڈ" },
  "settings.language": { en: "Language", ar: "اللغة", ur: "زبان" },
  "settings.language.select": { en: "Select your preferred display language", ar: "اختر لغة العرض المفضلة", ur: "اپنی پسندیدہ زبان منتخب کریں" },
  "settings.adminOnly": { en: "Admin Only", ar: "المشرف فقط", ur: "صرف ایڈمن" },
  "settings.adminOnly.subtitle": { en: "PIN required", ar: "رمز الدخول مطلوب", ur: "پن درکار ہے" },
  "settings.clearData": { en: "Clear Data", ar: "مسح البيانات", ur: "ڈیٹا صاف کریں" },
  "settings.clearData.question": { en: "Clear Data?", ar: "مسح البيانات؟", ur: "ڈیٹا صاف کریں؟" },
  "settings.clearData.desc": { en: "This will end all active sessions and remove your personal data from this device.", ar: "سيؤدي هذا إلى إنهاء جميع الجلسات النشطة وحذف بياناتك الشخصية من هذا الجهاز.", ur: "یہ تمام فعال سیشنز کو ختم کر دے گا اور اس ڈیوائس سے آپ کا ذاتی ڈیٹا ہٹا دے گا۔" },
  "settings.clearData.signOut": { en: "Sign out of all logged-in applications", ar: "تسجيل الخروج من جميع التطبيقات", ur: "تمام لاگ ان ایپس سے سائن آؤٹ کریں" },
  "settings.clearData.history": { en: "Clear browsing history & cookies", ar: "مسح سجل التصفح وملفات تعريف الارتباط", ur: "براؤزنگ کی تاریخ اور کوکیز صاف کریں" },
  "settings.clearData.passwords": { en: "Remove saved passwords & logins", ar: "حذف كلمات المرور وبيانات الدخول المحفوظة", ur: "محفوظ کردہ پاس ورڈز اور لاگ انز ہٹائیں" },
  "settings.clearData.reset": { en: "Reset app preferences to default", ar: "إعادة تعيين تفضيلات التطبيقات", ur: "ایپ کی ترجیحات کو ڈیفالٹ پر ری سیٹ کریں" },
  "settings.castScreen": { en: "Cast Screen", ar: "عرض الشاشة", ur: "اسکرین کاسٹ کریں" },
  "settings.stopCasting": { en: "Stop Casting", ar: "إيقاف العرض", ur: "کاسٹنگ روکیں" },
  "settings.disconnect": { en: "Disconnect", ar: "قطع الاتصال", ur: "رابطہ ختم کریں" },

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
  "notif.title": { en: "Notifications", ar: "الإشعارات", ur: "اطلاعات" },
  "notif.markAllRead": { en: "Mark all as read", ar: "تحديد الكل كمقروء", ur: "تمام کو پڑھا ہوا قرار دیں" },
  "notif.clearAll": { en: "Clear all", ar: "مسح الكل", ur: "تمام مٹائیں" },
  "notif.swipeHint": { en: "Swipe left to dismiss", ar: "اسحب لليمين للحذف", ur: "مٹانے کے لیے بائیں جانب سوائپ کریں" },
  "notif.allCaughtUp": { en: "All caught up!", ar: "لا توجد إشعارات جديدة!", ur: "سب مکمل ہو گیا!" },
  "notif.noNew": { en: "No new notifications at the moment.", ar: "لا توجد إشعارات في الوقت الحالي.", ur: "اس وقت کوئی نئی اطلاع نہیں ہے۔" },

  /* ─── Notification Items ─── */
  "notif.labsReady": { en: "Lab results are ready", ar: "نتائج المختبر جاهزة" },
  "notif.surveyRequest": { en: "We value your feedback", ar: "نحن نقدر ملاحظاتك" },
  "notif.mriReady": { en: "MRI results ready for review", ar: "نتائج الرنين المغناطيسي جاهزة للمراجعة" },
  "notif.hygieneScheduled": { en: "Room hygiene check scheduled", ar: "موعد فحص نظافة الغرفة" },
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
  return { t, locale, isRTL, dir, fontFamily };
}
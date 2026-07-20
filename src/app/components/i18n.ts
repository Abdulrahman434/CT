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
  "general.logout": { en: "Logout", ar: "تسجيل الخروج", ur: "لاگ آؤٹ" },
  "general.confirm": { en: "Confirm", ar: "تأكيد", ur: "تصدیق کریں" },
  "general.back": { en: "Back", ar: "رجوع", ur: "واپس" },
  "general.room": { en: "Room", ar: "غرفة", ur: "کمرہ" },
  "general.bed": { en: "Bed", ar: "سرير", ur: "بستر" },
  "general.done": { en: "Done", ar: "تم", ur: "ہو گیا" },
  "general.go": { en: "Go", ar: "اذهب", ur: "جاؤ" },
  "general.loading": { en: "Loading...", ar: "جاري التحميل...", ur: "لوڈنگ ہو رہی ہے..." },

  /* ─── Kids Layout (Layout 3) ─── */
  "kids.greeting.morning": { en: "Good Morning", ar: "صباح الخير", ur: "صبح بخیر" },
  "kids.greeting.afternoon": { en: "Good Afternoon", ar: "مساء الخير", ur: "سہ پہر بخیر" },
  "kids.greeting.evening": { en: "Good Evening", ar: "مساء الخير", ur: "شام بخیر" },
  "kids.hi": { en: "Hi {0}!", ar: "أهلاً {0}!", ur: "ہائے {0}!" },
  "kids.name": { en: "{0}!", ar: "{0}!", ur: "{0}!" },
  "kids.happyHere": { en: "We're happy you're here 💛", ar: "سعداء بوجودك هنا 💛", ur: "ہم خوش ہیں کہ آپ یہاں ہیں 💛" },
  "kids.dailyMessage": { en: "Today is a great day to feel better!", ar: "اليوم يومٌ رائع لتشعر بتحسّن!", ur: "آج بہتر محسوس کرنے کا ایک شاندار دن ہے!" },
  "kids.careTitle": { en: "How are you feeling?", ar: "كيف تشعر اليوم؟", ur: "آپ کیسا محسوس کر رہے ہیں؟" },

  /* Kids — level badge + daily mission */
  "kids.level": { en: "Level {0}", ar: "المستوى {0}", ur: "لیول {0}" },
  "kids.starsToNext": { en: "{0} more stars to Level {1}!", ar: "{0} نجوم للوصول إلى المستوى {1}!", ur: "لیول {1} کے لیے {0} مزید ستارے!" },
  "kids.mission.title": { en: "Today's Mission", ar: "مهمة اليوم", ur: "آج کا مشن" },
  "kids.mission.watch": { en: "Watch a video", ar: "شاهد فيديو", ur: "ایک ویڈیو دیکھیں" },
  "kids.mission.read": { en: "Read a story", ar: "اقرأ قصة", ur: "ایک کہانی پڑھیں" },
  "kids.mission.brave": { en: "Be brave 😊", ar: "كن شجاعاً 😊", ur: "بہادر بنیں 😊" },

  /* Kids — daily mood + nurse thank you */
  "kids.mood.title": { en: "How are you feeling today?", ar: "كيف تشعر اليوم؟", ur: "آج آپ کیسا محسوس کر رہے ہیں؟" },
  "kids.mood.happy": { en: "Happy", ar: "سعيد", ur: "خوش" },
  "kids.mood.okay": { en: "Okay", ar: "بخير", ur: "ٹھیک" },
  "kids.mood.sad": { en: "Sad", ar: "حزين", ur: "اداس" },
  "kids.mood.toast.happy": { en: "Yay! Keep smiling, {0}! 🌟", ar: "رائع! استمرّ بالابتسام يا {0}! 🌟", ur: "واہ! مسکراتے رہو، {0}! 🌟" },
  "kids.mood.toast.okay": { en: "That's okay! We're here for you 💙", ar: "لا بأس! نحن هنا من أجلك 💙", ur: "کوئی بات نہیں! ہم آپ کے ساتھ ہیں 💙" },
  "kids.mood.toast.sad": { en: "We're sorry you feel that way. Want to talk to your nurse? 💗", ar: "نأسف لشعورك بهذا. هل تودّ التحدث إلى ممرضتك؟ 💗", ur: "ہمیں افسوس ہے کہ آپ ایسا محسوس کر رہے ہیں۔ کیا آپ اپنی نرس سے بات کرنا چاہتے ہیں؟ 💗" },
  "kids.nurse.thankYou": { en: "Send a thank you 💗", ar: "أرسل شكراً 💗", ur: "شکریہ بھیجیں 💗" },
  "kids.nurse.thanked": { en: "Thank you sent! 💗", ar: "تم إرسال الشكر! 💗", ur: "شکریہ بھیج دیا! 💗" },

  /* Kids — motivational carousel */
  "kids.motiv.steps": { en: "Every little step counts. Keep going!", ar: "كل خطوة صغيرة لها قيمة. واصل التقدّم!", ur: "ہر چھوٹا قدم اہم ہے۔ آگے بڑھتے رہو!" },
  "kids.motiv.strong": { en: "You are strong, smart, and amazing!", ar: "أنت قويّ وذكيّ ورائع!", ur: "تم مضبوط، ذہین اور شاندار ہو!" },
  "kids.motiv.grow": { en: "Challenges help you grow.", ar: "التحدّيات تساعدك على النموّ.", ur: "چیلنجز تمہیں بڑھنے میں مدد دیتے ہیں۔" },
  "kids.motiv.better": { en: "You're doing better every day!", ar: "أنت تتحسّن كل يوم!", ur: "تم ہر دن بہتر ہو رہے ہو!" },
  "kids.nurseLabel": { en: "Your friendly nurse", ar: "ممرضتك اللطيفة", ur: "آپ کی مہربان نرس" },
  "kids.yourNurse": { en: "Your nurse", ar: "ممرضتك", ur: "آپ کی نرس" },
  "kids.heart": { en: "Heartbeat", ar: "نبض القلب", ur: "دل کی دھڑکن" },
  "kids.temperature": { en: "Temperature", ar: "درجة الحرارة", ur: "درجہ حرارت" },
  "kids.bpm": { en: "BPM", ar: "نبضة/د", ur: "دھڑکن" },

  /* Kids — navigation tiles */
  "kids.tile.media": { en: "Watch & Videos", ar: "مشاهدة وفيديو", ur: "دیکھیں اور ویڈیوز" },
  "kids.tile.reading": { en: "Read & Stories", ar: "قراءة وقصص", ur: "پڑھیں اور کہانیاں" },
  "kids.tile.draw": { en: "Draw & Color", ar: "ارسم ولوّن", ur: "ڈرا اور رنگ" },
  "kids.tile.portal": { en: "Patient Portal", ar: "بوابة المريض", ur: "پیشنٹ پورٹل" },
  "kids.tile.social": { en: "Chat with Family", ar: "تحدث مع العائلة", ur: "خاندان سے بات" },
  "kids.tile.games": { en: "Play Games", ar: "العب الألعاب", ur: "گیمز کھیلیں" },
  "kids.tile.meeting": { en: "Video Call", ar: "مكالمة فيديو", ur: "ویڈیو کال" },
  "kids.tile.internet": { en: "Browse", ar: "تصفح", ur: "براؤز کریں" },
  "kids.tile.tools": { en: "My Tools", ar: "أدواتي", ur: "میرے اوزار" },
  "kids.tile.education": { en: "Learn & Explore", ar: "تعلّم واكتشف", ur: "سیکھیں اور دریافت کریں" },
  "kids.tile.consultation": { en: "Talk to Doctor", ar: "تحدث مع الطبيب", ur: "ڈاکٹر سے بات کریں" },
  "kids.tile.housekeeping": { en: "Room Help", ar: "مساعدة الغرفة", ur: "کمرے کی مدد" },
  "kids.tile.food": { en: "Order Food", ar: "اطلب الطعام", ur: "کھانا منگوائیں" },
  "kids.tile.call": { en: "Call Someone", ar: "اتصل بشخص", ur: "کسی کو کال کریں" },
  "kids.tile.feedback": { en: "Your Feedback", ar: "رأيك", ur: "آپ کی رائے" },
  "kids.tile.roomcontrol": { en: "Room Control", ar: "التحكم بالغرفة", ur: "روم کنٹرول" },

  /* Kids — two big hero buttons */
  "kids.media.sub": { en: "Movies · Shows · Cartoons", ar: "أفلام · برامج · كرتون", ur: "فلمیں · شوز · کارٹون" },
  "kids.games.sub": { en: "Puzzles · Fun · Challenges", ar: "ألغاز · مرح · تحديات", ur: "پزلز · مزہ · چیلنجز" },
  "kids.reading.sub": { en: "Books · Tales · Stories", ar: "كتب · حكايات · قصص", ur: "کتابیں · کہانیاں · قصے" },
  "kids.draw.sub": { en: "Paint · Colors · Art", ar: "رسم · ألوان · فن", ur: "پینٹ · رنگ · آرٹ" },
  "kids.more": { en: "More", ar: "المزيد", ur: "مزید" },
  "kids.more.title": { en: "Explore More", ar: "اكتشف المزيد", ur: "مزید دریافت کریں" },

  /* Kids — right sidebar quick access */
  "kids.side.roomControl": { en: "My Room", ar: "غرفتي", ur: "میرا کمرہ" },
  "kids.side.quran": { en: "Quran", ar: "القرآن", ur: "قرآن" },
  "kids.side.mirror": { en: "Mirror", ar: "المرآة", ur: "آئینہ" },
  "kids.side.podcast": { en: "Podcast", ar: "بودكاست", ur: "پوڈکاسٹ" },

  /* Kids — bottom action bar */
  "kids.action.callNurse": { en: "Call Nurse", ar: "نادِ الممرضة", ur: "نرس کو بلائیں" },
  "kids.action.needSomething": { en: "I Need Something", ar: "أحتاج شيئاً", ur: "مجھے کچھ چاہیے" },
  "kids.action.sleep": { en: "Sleep Mode", ar: "وضع النوم", ur: "نیند موڈ" },
  "kids.sleep.tapWake": { en: "Tap anywhere to wake up", ar: "اضغط في أي مكان للاستيقاظ", ur: "جاگنے کے لیے کہیں بھی تھپتھپائیں" },

  /* ─── "I Need Something" flow (child-friendly service requests) ─── */
  "need.header.title": { en: "Patient Services", ar: "خدمات المريض", ur: "مریض کی خدمات" },
  "need.header.subtitle": { en: "Request help or report an issue", ar: "اطلب المساعدة أو أبلغ عن مشكلة", ur: "مدد طلب کریں یا مسئلہ رپورٹ کریں" },
  /* Header language switcher — shows the language the button switches TO (endonym,
     rendered in its own script), so it reads correctly regardless of the active UI locale. */
  "need.header.language": { en: "العربية", ar: "English", ur: "English" },
  "need.tab.request": { en: "I Need Something", ar: "أحتاج شيئاً", ur: "مجھے کچھ چاہیے" },
  "need.tab.report": { en: "Report an Issue", ar: "أبلغ عن مشكلة", ur: "مسئلہ رپورٹ کریں" },
  "need.tab.mine": { en: "My Requests", ar: "طلباتي", ur: "میری درخواستیں" },
  "need.title.request": { en: "What do you need today?", ar: "ماذا تحتاج اليوم؟", ur: "آپ کو آج کیا چاہیے؟" },
  "need.title.report": { en: "Report an issue", ar: "أبلغ عن مشكلة", ur: "مسئلہ رپورٹ کریں" },
  "need.title.mine": { en: "Your requests", ar: "طلباتك", ur: "آپ کی درخواستیں" },
  "need.sub.request": { en: "Tap what you'd like us to bring.", ar: "اختر ما تودّ أن نُحضره لك.", ur: "جو آپ چاہتے ہیں اس پر ٹیپ کریں۔" },
  "need.sub.report": { en: "Tell us what needs attention.", ar: "أخبرنا بما يحتاج إلى اهتمام.", ur: "ہمیں بتائیں کیا توجہ چاہیے۔" },
  "need.item.blanket": { en: "Blanket", ar: "بطانية", ur: "کمبل" },
  "need.item.water": { en: "Water", ar: "ماء", ur: "پانی" },
  "need.item.pillow": { en: "Pillow", ar: "وسادة", ur: "تکیہ" },
  "need.item.towel": { en: "Towel", ar: "منشفة", ur: "تولیہ" },
  "need.item.toiletries": { en: "Toiletries", ar: "أدوات نظافة", ur: "غسل کا سامان" },
  "need.item.tissues": { en: "Tissues", ar: "مناديل", ur: "ٹشو" },
  "need.item.sheets": { en: "Fresh Sheets", ar: "شراشف نظيفة", ur: "صاف چادریں" },
  "need.item.slippers": { en: "Slippers", ar: "شبشب", ur: "چپل" },
  "need.issue.ac": { en: "Air Conditioner", ar: "المكيّف", ur: "ایئر کنڈیشنر" },
  "need.issue.lights": { en: "Lights", ar: "الإضاءة", ur: "لائٹس" },
  "need.issue.tv": { en: "TV", ar: "التلفاز", ur: "ٹی وی" },
  "need.issue.bed": { en: "Bed", ar: "السرير", ur: "بستر" },
  "need.issue.bathroom": { en: "Bathroom", ar: "الحمّام", ur: "باتھ روم" },
  "need.issue.power": { en: "Power Outlet", ar: "مقبس الكهرباء", ur: "بجلی کا ساکٹ" },
  "need.notes.title": { en: "Any special notes for our team?", ar: "هل لديك أي ملاحظات خاصة لفريقنا؟", ur: "کیا ہماری ٹیم کے لیے کوئی خاص نوٹ ہے؟" },
  "need.notes.placeholder": { en: "Example: Please bring two pillows.", ar: "مثال: من فضلك أحضر وسادتين.", ur: "مثال: براہ کرم دو تکیے لے آئیں۔" },
  "need.notes.optional": { en: "You can leave this empty.", ar: "يمكنك تركها فارغة.", ur: "آپ اسے خالی چھوڑ سکتے ہیں۔" },
  "need.cancel": { en: "Cancel", ar: "إلغاء", ur: "منسوخ کریں" },
  "need.send": { en: "Send Request", ar: "أرسل الطلب", ur: "درخواست بھیجیں" },
  "need.report.submit": { en: "Send Report", ar: "أرسل البلاغ", ur: "رپورٹ بھیجیں" },
  "need.success.title": { en: "Thank you!", ar: "شكراً لك!", ur: "شکریہ!" },
  "need.success.subtitle": { en: "We've received your request.", ar: "لقد استلمنا طلبك.", ur: "ہمیں آپ کی درخواست موصول ہو گئی۔" },
  "need.success.subtitleReport": { en: "We've received your report.", ar: "لقد استلمنا بلاغك.", ur: "ہمیں آپ کی رپورٹ موصول ہو گئی۔" },
  "need.success.body": { en: "Someone will help you soon. 💛", ar: "سيساعدك أحدهم قريباً. 💛", ur: "کوئی جلد آپ کی مدد کرے گا۔ 💛" },
  "need.success.back": { en: "Back to My Requests", ar: "العودة إلى طلباتي", ur: "میری درخواستوں پر واپس" },
  "need.type.request": { en: "Request", ar: "طلب", ur: "درخواست" },
  "need.type.complaint": { en: "Complaint", ar: "شكوى", ur: "شکایت" },
  "need.status.sent": { en: "Sent", ar: "أُرسل", ur: "بھیج دیا" },
  "need.status.preparing": { en: "Preparing", ar: "قيد التحضير", ur: "تیاری میں" },
  "need.status.onway": { en: "On the way", ar: "في الطريق", ur: "راستے میں" },
  "need.status.delivered": { en: "Delivered", ar: "تم التوصيل", ur: "پہنچا دیا" },
  "need.status.fixed": { en: "Fixed", ar: "تم الإصلاح", ur: "ٹھیک ہو گیا" },
  "need.empty.title": { en: "No requests yet", ar: "لا توجد طلبات بعد", ur: "ابھی کوئی درخواست نہیں" },
  "need.empty.body": { en: "Tap a card to ask for something! 😊", ar: "اضغط على بطاقة لتطلب شيئاً! 😊", ur: "کچھ مانگنے کے لیے کارڈ پر ٹیپ کریں! 😊" },
  "need.rel.now": { en: "Just now", ar: "الآن", ur: "ابھی" },
  "need.rel.todayAt": { en: "Today at {0}", ar: "اليوم في {0}", ur: "آج {0}" },
  "need.rel.yesterdayAt": { en: "Yesterday at {0}", ar: "أمس في {0}", ur: "کل {0}" },
  "need.rel.dateAt": { en: "{0} at {1}", ar: "{0} في {1}", ur: "{0}، {1}" },
  "need.ref": { en: "Ref: {0}", ar: "مرجع: {0}", ur: "حوالہ: {0}" },
  "need.requestedOn": { en: "Requested on", ar: "طُلب في", ur: "درخواست کی گئی" },
  "need.rel.today": { en: "Today", ar: "اليوم", ur: "آج" },
  "need.rel.yesterday": { en: "Yesterday", ar: "أمس", ur: "کل" },
  "need.rel.daysAgo": { en: "{0} days ago", ar: "قبل {0} أيام", ur: "{0} دن پہلے" },
  "need.close": { en: "Close", ar: "إغلاق", ur: "بند کریں" },

  /* ─── Toast Notifications ─── */
  "toast.justNow": { en: "Just now", ar: "الآن", ur: "ابھی" },

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
  "greeting.bed": { en: "Bed", ar: "سرير", ur: "بستر" },
  "greeting.admitted": { en: "Admitted", ar: "تاريخ الدخول", ur: "داخلہ" },

  /* ─── Top Bar ─── */
  "topbar.am": { en: "AM", ar: "ص", ur: "AM" },
  "topbar.pm": { en: "PM", ar: "م", ur: "PM" },
  "conn.connected": { en: "Connected", ar: "متصل", ur: "منسلک" },
  "conn.offline": { en: "Offline", ar: "غير متصل", ur: "آف لائن" },
  "conn.lastUpdate": { en: "last update", ar: "آخر تحديث", ur: "آخری اپ ڈیٹ" },
  "conn.ago": { en: "ago", ar: "مضت", ur: "پہلے" },
  "conn.refresh": { en: "Refresh", ar: "تحديث", ur: "ریفریش" },
  "conn.activeOffline": { en: "active offline", ar: "نشط دون اتصال", ur: "ایکٹو آف لائن" },

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
  "news.careinn.1": { en: "CareInn wins the Innovation Award in Patient Experience.", ar: "فازت CareInn بجائزة الابتكار في تجربة المريض.", ur: "CareInn نے مریضوں کے تجربے میں انوویشن ایوارڈ جیت لیا۔" },
  "news.careinn.2": { en: "CareInn participates in WHX Dubai alongside VITEC.", ar: "تشارك CareInn في معرض WHX بدبي إلى جانب VITEC.", ur: "CareInn نے VITEC کے ساتھ WHX دبئی میں شرکت کی۔" },
  "news.careinn.3": { en: "CareInn joins Arab Health to present its patient engagement solutions.", ar: "تنضم CareInn إلى معرض الصحة العربي لتقديم حلولها لمشاركة المرضى.", ur: "CareInn نے اپنے مریضوں کی شمولیت کے حل پیش کرنے کے لیے عرب ہیلتھ میں شمولیت اختیار کی۔" },
  "news.careinn.4": { en: "CareInn takes part in the International Patient Experience Congress.", ar: "تشارك CareInn في المؤتمر الدولي لتجربة المريض.", ur: "CareInn بین الاقوامی پیشنٹ ایکسپیرینس کانگریس میں حصہ لیتی ہے۔" },
  "news.careinn.5": { en: "CareInn showcases its solutions at Global Health Exhibition.", ar: "تعرض CareInn حلولها في ملتقى الصحة العالمي.", ur: "CareInn نے گلوبل ہیلتھ ایگزیبیشن میں اپنے حل کی نمائش کی۔" },
  "news.careinn.6": { en: "CareInn presents CareInn15, CareSign, CareSuite, and CareConnect to healthcare leaders.", ar: "تقدم CareInn حلول CareInn15 و CareSign و CareSuite و CareConnect لقادة الرعاية الصحية.", ur: "CareInn نے ہیلتھ کیئر لیڈرز کو CareInn15، CareSign، CareSuite، اور CareConnect پیش کیا۔" },
  "news.careinn.7": { en: "CareInn joins VITEC at WHX Dubai to showcase patient-aware TV experiences.", ar: "تنضم CareInn إلى VITEC في معرض WHX بدبي لعرض تجارب التلفزيون المتوافقة مع احتياجات المرضى.", ur: "CareInn نے WHX دبئی میں VITEC کے ساتھ شمولیت اختیار کی تاکہ مریضوں کو آگاہ کرنے والے ٹی وی تجربات کو دکھایا جا سکے۔" },
  "news.careinn.8": { en: "CareInn highlights its healthcare solutions during major regional healthcare events.", ar: "تسلط CareInn الضوء على حلول الرعاية الصحية الخاصة بها خلال كبرى الفعاليات الصحية الإقليمية.", ur: "CareInn نے اہم علاقائی ہیلتھ کیئر ایونٹس کے دوران اپنے ہیلتھ کیئر کے حل پر روشنی ڈالی۔" },
  "news.prime.1": { en: "Prime Hospital Dubai recognized among top specialty hospitals in the UAE.", ar: "مستشفى برايم دبي يُصنَّف ضمن أفضل المستشفيات التخصصية في الإمارات.", ur: "پرائم ہسپتال دبئی کو متحدہ عرب امارات کے بہترین اسپیشلٹی ہسپتالوں میں شمار کیا گیا۔" },
  "news.prime.2": { en: "Prime Hospital launches new advanced cardiology unit in Dubai.", ar: "مستشفى برايم يطلق وحدة متقدمة جديدة لأمراض القلب في دبي.", ur: "پرائم ہسپتال نے دبئی میں نیا جدید کارڈیالوجی یونٹ شروع کیا۔" },
  "news.prime.3": { en: "Prime Hospital joins Arab Health to showcase patient care innovations.", ar: "مستشفى برايم ينضم إلى معرض الصحة العربي لعرض ابتكارات رعاية المرضى.", ur: "پرائم ہسپتال نے مریضوں کی دیکھ بھال کی اختراعات پیش کرنے کے لیے عرب ہیلتھ میں شمولیت اختیار کی۔" },
  "news.kauh.1": { en: "King Abdulaziz University Hospital — the largest academic medical center in the Kingdom's western region.", ar: "مستشفى جامعة الملك عبدالعزيز — أكبر مركز طبي أكاديمي في المنطقة الغربية من المملكة.", ur: "کنگ عبدالعزیز یونیورسٹی ہسپتال — مملکت کے مغربی خطے کا سب سے بڑا تعلیمی طبی مرکز۔" },
  "news.kauh.2": { en: "Shifaa digital portal — book appointments and view your medical records online.", ar: "بوابة شفاء الرقمية — احجز مواعيدك واطّلع على تقاريرك الطبية إلكترونياً.", ur: "شفاء ڈیجیٹل پورٹل — آن لائن اپائنٹمنٹ بُک کریں اور اپنے طبی ریکارڈ دیکھیں۔" },
  "news.kauh.3": { en: "Over 50 medical specialties delivering advanced academic healthcare.", ar: "أكثر من ٥٠ تخصصاً طبياً تقدّم رعاية صحية أكاديمية متقدمة.", ur: "پچاس سے زائد طبی شعبے جدید تعلیمی صحت کی خدمات فراہم کر رہے ہیں۔" },
  "news.kauh.4": { en: "Leading digital-health transformation in line with Saudi Vision 2030.", ar: "ريادة التحول في الصحة الرقمية تماشياً مع رؤية المملكة ٢٠٣٠.", ur: "سعودی وژن ٢٠٣٠ کے مطابق ڈیجیٹل ہیلتھ کی تبدیلی میں پیش پیش۔" },
  "news.dallah.1": { en: "Dallah Hospitals awarded 'Leading Provider of Integrated Healthcare Services' in Saudi Arabia.", ar: "مستشفيات دله تحصل على جائزة «المزود الرائد لخدمات الرعاية الصحية المتكاملة» في المملكة.", ur: "دلہ ہسپتالوں کو سعودی عرب میں 'انٹیگریٹڈ ہیلتھ کیئر سروسز کے معروف فراہم کنندہ' کا ایوارڈ دیا گیا۔" },
  "news.dallah.2": { en: "Dallah Healthcare announces the construction of the new state-of-the-art Al-Arid Hospital in Riyadh.", ar: "دله الصحية تعلن عن إنشاء مستشفى العارض الجديد والمتطور في الرياض.", ur: "دلہ ہیلتھ کیئر نے ریاض میں نئے اسٹیٹ آف دی آرٹ العارض ہسپتال کی تعمیر کا اعلان کیا۔" },
  "news.dallah.3": { en: "Dallah Healthcare completes 100% acquisition of Care Shield Holding, reinforcing Riyadh presence.", ar: "دله الصحية تكمل استحواذها بنسبة ١٠٠٪ على شركة درع الرعاية، مما يعزز تواجدها في الرياض.", ur: "دلہ ہیلتھ کیئر نے کیئر شیلڈ ہولڈنگ کا 100% حصول مکمل کر لیا، جس سے ریاض میں موجودگی مضبوط ہوئی۔" },
  "news.dsfh.1": { en: "Dr. Soliman Fakeeh Hospital – Riyadh Welcomes High-Level German Delegation.", ar: "استقبال وفد ألماني رفيع المستوى في مستشفى الدكتور سليمان فقيه – الرياض.", ur: "ریاض میں ڈاکٹر سلیمان فقیہ ہسپتال میں ایک اعلیٰ سطحی جرمن وفد کا استقبال کیا گیا۔" },
  "news.dsfh.2": { en: "Dr. Soliman Fakeeh Hospital Riyadh Receives Prestigious 5-Star Global Rating.", ar: "مستشفى الدكتور سليمان فقيه بالرياض يحصل على تصنيف 5 نجوم عالميًا.", ur: "ریاض میں ڈاکٹر سلیمان فقیہ ہسپتال نے باوقار 5 اسٹار گلوبل ریٹنگ حاصل کی۔" },
  "news.dsfh.3": { en: "Dr. Soliman Fakeeh Hospital - Riyadh Receives Best Measurement in Customer Experience Award.", ar: "مستشفى د. سليمان فقيه بالرياض يحصد جائزة \"أفضل قياس لتجربة العميل\".", ur: "ریاض میں ڈاکٹر سلیمان فقیہ ہسپتال نے بہترین کسٹمر ایکسپیرینس ایوارڈ حاصل کیا۔" },
  "news.dsfh.jeddah.1": { en: "Dr. Soliman Fakeeh Hospital Jeddah ranked among World's Top 250 Hospitals by Newsweek.", ar: "مستشفى الدكتور سليمان فقيه بجدة ضمن أفضل 250 مستشفى في العالم حسب تصنيف نيوزويك.", ur: "جدہ میں ڈاکٹر سلیمان فقیہ ہسپتال کو نیوز ویک نے دنیا کے ٹاپ 250 ہسپتالوں میں شامل کیا۔" },
  "news.dsfh.jeddah.2": { en: "DSFH Jeddah named #1 Private Hospital in Saudi Arabia for the 5th consecutive year.", ar: "مستشفى فقيه بجدة يتصدر كأفضل مستشفى خاص في المملكة للسنة الخامسة على التوالي.", ur: "جدہ میں فقیہ ہسپتال مسلسل پانچویں سال سعودی عرب کا نمبر 1 نجی ہسپتال قرار پایا۔" },
  "news.dsfh.jeddah.3": { en: "Fakeeh Care Group expands with new Surgical Tower and 300-bed South Obhur hospital.", ar: "مجموعة فقيه للرعاية تتوسع ببرج جراحي جديد ومستشفى بسعة 300 سرير في جنوب أبحر.", ur: "فقیہ کیئر گروپ نے نئے سرجیکل ٹاور اور جنوبی ابحر میں 300 بستروں کے ہسپتال کے ساتھ توسیع کی۔" },
  "news.dsfh.jeddah.4": { en: "DSFH Jeddah recognized among World's Best Smart Hospitals 2026 for digital leadership.", ar: "مستشفى فقيه بجدة ضمن أفضل المستشفيات الذكية عالمياً لعام 2026 لريادته الرقمية.", ur: "جدہ میں فقیہ ہسپتال کو ڈیجیٹل قیادت کے لیے 2026 کے دنیا کے بہترین سمارٹ ہسپتالوں میں تسلیم کیا گیا۔" },
  "news.dsfh.jeddah.5": { en: "DSFH Jeddah ranked #1 private hospital in Neurology, Pediatrics, Orthopedics, and Oncology.", ar: "مستشفى فقيه بجدة الأول خاصاً في تخصصات الأعصاب، الأطفال، العظام، وعلم الأورام.", ur: "جدہ میں فقیہ ہسپتال نیورولوجی، اطفال، آرتھوپیڈکس اور آنکولوجی میں نمبر 1 نجی ہسپتال قرار پایا۔" },
  "news.imc.1": { en: "IMC announces the establishment of a state-of-the-art medical college in Jeddah for 1,200 students.", ar: "المركز الطبي الدولي يعلن عن إنشاء كلية طبية متطورة بجدة تستوعب ١٢٠٠ طالب وطالبة.", ur: "آئی ایم سی نے جدہ میں 1200 طلباء کے لیے ایک جدید ترین میڈیکل کالج کے قیام کا اعلان کیا ہے۔" },
  "news.imc.2": { en: "Expansion Plans: IMC to open new Wellcare Clinics in Obhur and Makkah regions.", ar: "خطط التوسع: المركز الطبي الدولي يفتتح عيادات ويل كير الجديدة في منطقتي أبحر ومكة المكرمة.", ur: "توسیع کے منصوبے: آئی ایم سی ابحر اور مکہ مکرمہ کے علاقوں میں نئے ویل کیئر کلینکس کھولے گا۔" },
  "news.imc.3": { en: "New Obhur Hospital: A full-service medical facility under development in North Jeddah.", ar: "مستشفى أبحر الجديد: مرفق طبي متكامل الخدمات قيد التطوير في شمال جدة.", ur: "نیا ابحر ہسپتال: شمالی جدہ میں ایک مکمل سروس والی طبی سہولت زیر تعمیر ہے۔" },
  "news.imc.4": { en: "Mayo Clinic Partnership: IMC continues its global collaboration for specialized healthcare.", ar: "شراكة مايو كلينك: المركز الطبي الدولي يواصل تعاونه العالمي للرعاية الصحية المتخصصة.", ur: "میو کلینک پارٹنرشپ: آئی ایم سی خصوصی صحت کی دیکھ بھال کے لیے اپنا عالمی تعاون جاری رکھے ہوئے ہے۔" },
  "news.imc.5": { en: "Digital Door Strategy: IMC enhances patient journey through advanced digital transformation.", ar: "استراتيجية الباب الرقمي: المركز الطبي الدولي يعزز رحلة المريض من خلال التحول الرقمي المتقدم.", ur: "ڈیجیٹل ڈور اسٹریٹیجی: آئی ایم سي جدید ڈیجیٹل تبدیلی کے ذریعے مریض کے سفر کو بہتر بناتا ہے۔" },

  /* ─── Burjeel News ─── */
  "news.burjeel.1": { en: "Burjeel unveils major integrated healthcare project in MBZ City, Abu Dhabi.", ar: "برجيل تكشف عن مشروع رعاية صحية متكامل ضخم في مدينة محمد بن زايد بأبوظبي.", ur: "برجیل نے ابوظبی کے محمد بن زاید سٹی میں بڑے مربوط ہیلتھ کیئر پروجیکٹ کی نقاب کشائی کی۔" },
  "news.burjeel.2": { en: "Burjeel Medical City launches specialized Sleep Clinic for advanced sleep medicine.", ar: "مدينة برجيل الطبية تطلق عيادة نوم متخصصة لطب النوم المتقدم.", ur: "برجیل میڈیکل سٹی نے جدید سلیپ میڈیسن کے لیے خصوصی سلیپ کلینک کا آغاز کیا۔" },
  "news.burjeel.3": { en: "Burjeel Hospital Abu Dhabi opens new Korean Pavilion for specialized expertise.", ar: "مستشفى برجيل أبوظبي يفتتح الجناح الكوري الجديد للخبرات المتخصصة.", ur: "برجیل اسپتال ابوظبی نے خصوصی مہارت کے لیے نیا کورین پویلین کھولا۔" },
  "news.burjeel.4": { en: "Burjeel Holdings reports strong profit growth for Q1 2026, up 44.5%.", ar: "برجيل القابضة تعلن عن نمو قوي في الأرباح للربع الأول من 2026 بنسبة 44.5%.", ur: "برجیل ہولڈنگز نے 2026 کی پہلی سہ ماہی کے لیے 44.5 فیصد منافع میں اضافے کی اطلاع دی۔" },
  "news.burjeel.5": { en: "New specialized centers for oncology and cardiology launched at Burjeel facilities.", ar: "إطلاق مراكز متخصصة جديدة للأورام وأمراض القلب في مرافق برجيل.", ur: "برجیل کی سہولیات میں آنکولوجی اور کارڈیالوجی کے لیے نئے خصوصی مراکز کا آغاز کیا گیا۔" },

  /* ─── Hub Items ─── */
  "hub.media": { en: "Media", ar: "الوسائط", ur: "میڈیا" },
  "hub.media.desc": { en: "TV, music & radio", ar: "تلفزيون، موسيقى وراديو", ur: "ٹی وی، موسیقی اور ریڈیو" },
  "hub.reading": { en: "Reading", ar: "القراءة", ur: "مطالعہ" },
  "hub.reading.desc": { en: "Books & magazines", ar: "كتب ومجلات", ur: "کتابیں اور رسائل" },

  /* ─── IPTV ─── */
  "tv.onlyOnKiosk": { en: "TV is only available on the kiosk", ar: "البث المباشر متاح فقط على الشاشة", ur: "ٹی وی صرف کیوسک پر دستیاب ہے" },
  "tv.loading": { en: "Loading Channels...", ar: "جاري تحميل القنوات...", ur: "چینلز لوڈ ہو رہے ہیں..." },
  "tv.noChannels": { en: "No channels available", ar: "لا توجد قنوات متاحة", ur: "کوئی چینل دستیاب نہیں ہے" },
  "tv.stop": { en: "Stop TV", ar: "إيقاف البث", ur: "ٹی وی بند کریں" },

  /* ─── Care Plan Empty States ─── */
  "careplan.emptyHeader": { en: "No Care Plan available", ar: "لا توجد خطة رعاية متاحة", ur: "کوئی کیئر پلان دستیاب نہیں ہے" },
  "careplan.emptyDesc": { en: "Your Careplan will appear here once it has been allowed by your Care Team.", ar: "ستظهر خطة الرعاية الخاصة بك هنا بمجرد السماح بها من قبل فريق الرعاية.", ur: "آپ کی کیئر پلان یہاں ظاہر ہوگی جب آپ کی کیئر ٹیم اس کی اجازت دے گی۔" },
  "discharge.emptyHeader": { en: "No discharge plan available", ar: "لا توجد خطة خروج متاحة", ur: "ڈسچارج پلان دستیاب نہیں ہے" },
  "discharge.emptyDesc": { en: "Information about your discharge will appear here as you near the end of your stay.", ar: "ستظهر معلومات خروجك هنا مع اقتراب نهاية إقامتك.", ur: "آپ کے ڈسچارج کے بارے میں معلومات آپ کے قیام کے اختتام کے قریب هنا ستظهر۔" },

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
  "shortcut.burjeelPodcast": { en: "Burjeel Podcast", ar: "بودكاست برجيل", ur: "برجیل پوڈکاسٹ" },
  "shortcut.academy": { en: "Academy", ar: "الأكاديمية", ur: "اکیڈمی" },
  "shortcut.adminPortal": { en: "Admin Portal", ar: "بوابة الإدارة", ur: "ایڈمن پورٹل" },
  "shortcut.roomControl": { en: "Room Control", ar: "التحكم بالغرفة", ur: "کمرے کا کنٹرول" },

  /* ─── Room Control ─── */
  "room.title": { en: "Room Control", ar: "التحكم بالغرفة", ur: "کمرے کا کنٹرول" },
  "room.tab.lights": { en: "Lights", ar: "الإضاءة", ur: "لائٹس" },
  "room.tab.curtains": { en: "Curtains", ar: "الستائر", ur: "پردے" },
  "room.tab.ac": { en: "Climate", ar: "التكييف", ur: "ایئر کنڈیشننگ" },
  "room.light.main": { en: "Main Light", ar: "الإضاءة الرئيسية", ur: "مین لائٹ" },
  "room.light.bedside": { en: "Bedside Light", ar: "إضاءة السرير", ur: "بیڈ سائیڈ لائٹ" },
  "room.light.bathroom": { en: "Bathroom", ar: "الحمام", ur: "باتھ روم" },
  "room.light.reading": { en: "Reading Light", ar: "إضاءة القراءة", ur: "پڑھنے کی لائٹ" },
  "room.light.allLights": { en: "All Lights", ar: "جميع الأضواء", ur: "تمام لائٹس" },
  "room.active": { en: "active", ar: "نشطة", ur: "فعال" },
  "room.brightness": { en: "Brightness", ar: "السطوع", ur: "چمک" },
  "room.curtain.window": { en: "Window Curtain", ar: "ستارة النافذة", ur: "کھڑکی کا پردہ" },
  "room.curtain.privacy": { en: "Privacy Curtain", ar: "ستارة الخصوصية", ur: "پرائیویسی پردہ" },
  "room.curtain.open": { en: "Open", ar: "مفتوح", ur: "کھلا" },
  "room.curtain.half": { en: "Half", ar: "نصف", ur: "آدھا" },
  "room.curtain.closed": { en: "Closed", ar: "مغلق", ur: "بند" },
  "room.position": { en: "Position", ar: "الموضع", ur: "پوزیشن" },
  "room.ac.title": { en: "Air Conditioning", ar: "التكييف", ur: "ایئر کنڈیشننگ" },
  "room.ac.running": { en: "Running", ar: "يعمل", ur: "چل رہا ہے" },
  "room.ac.off": { en: "Off", ar: "متوقف", ur: "بند" },
  "room.ac.mode": { en: "MODE", ar: "الوضع", ur: "موڈ" },
  "room.ac.cool": { en: "Cool", ar: "تبريد", ur: "ٹھنڈا" },
  "room.ac.heat": { en: "Heat", ar: "تدفئة", ur: "گرم" },
  "room.ac.fan": { en: "Fan", ar: "مروحة", ur: "پنکھا" },
  "room.ac.fanSpeed": { en: "FAN SPEED", ar: "سرعة المروحة", ur: "پنکھے کی رفتار" },
  "room.ac.low": { en: "Low", ar: "منخفض", ur: "کم" },
  "room.ac.medium": { en: "Medium", ar: "متوسط", ur: "درمیانہ" },
  "room.ac.high": { en: "High", ar: "مرتفع", ur: "تیز" },
  "room.scene.comfort": { en: "Comfort", ar: "راحة", ur: "آرام" },
  "room.scene.sleep": { en: "Sleep", ar: "نوم", ur: "نیند" },
  "room.scene.bright": { en: "Bright", ar: "ساطع", ur: "روشن" },
  "room.scene.reading": { en: "Reading", ar: "قراءة", ur: "مطالعہ" },
  "room.light.low": { en: "Low", ar: "خافت", ur: "کم" },
  "room.light.med": { en: "Medium", ar: "متوسط", ur: "درمیانہ" },
  "room.light.high": { en: "Bright", ar: "ساطع", ur: "تیز" },
  "room.curtain.stop": { en: "Stop", ar: "إيقاف", ur: "رکیں" },
  "room.curtain.stopped": { en: "Stopped", ar: "متوقف", ur: "رکا ہوا" },

  /* ─── Care Medical Education Items ─── */
  "caremed.edu.normalBirth": { en: "Normal Birth", ar: "الولادة الطبيعية", ur: "نارمل پیدائش" },
  "caremed.edu.depression": { en: "Signs of Depression\nand How to Cope", ar: "علامات الاكتئاب\nوكيفية التعامل معها", ur: "ڈپریشن کی علامات\nاور اس سے نمٹنے کا طریقہ" },
  "caremed.edu.dementia": { en: "Cognition and\nDementia", ar: "الإدراك والخرف", ur: "ادراک اور ڈیمنشیا" },
  "caremed.edu.elderlyExercise": { en: "Exercise for\nThe Elderly", ar: "ممارسة الرياضة\nلكبار السن", ur: "بوڑھوں کے لیے ورزش" },
  "caremed.edu.falls": { en: "Common Causes\nof Falls", ar: "أسباب السقوط\nالشائعة", ur: "گرنے کی عام وجوہات" },
  "caremed.edu.generalHealth": { en: "General Health\nQuestions", ar: "أسئلة عن\nالصحة العامة", ur: "عام صحت کے متعلق سوالات" },
  "caremed.edu.medications": { en: "Questions About\nMedications", ar: "أسئلة بخصوص\nالأدوية", ur: "ادویات کے متعلق سوالات" },

  /* ─── Burjeel Education Items ─── */
  "burjeel.edu.fertility": { en: "Trust Fertility Education", ar: "تثقيف الخصوبة - ترست", ur: "ٹرسٹ فرٹیلٹی ایجوکیشن" },
  "burjeel.edu.guide": { en: "Patient Education Video", ar: "فيديو تثقيف المرضى", ur: "مریض کی تعلیم کی ویڈیو" },

  /* ─── CareMe Slides ─── */
  "care.title": { en: "CareMe", ar: "رعايتي", ur: "میری دیکھ بھال" },
  "care.subtitle": { en: "Your health journey at a glance", ar: "رحلتك الصحية في لمحة", ur: "آپ کی صحت کا سفر ایک نظر میں" },
  "care.profile.title": { en: "Patient Profile", ar: "ملف المريض", ur: "مریض کی پروفائل" },
  "care.overview.title": { en: "Care Overview", ar: "ملخص الرعاية", ur: "دیکھ بھال کا جائزہ" },
  "care.team.title": { en: "My Care Team", ar: "فريق الرعاية", ur: "میری نگہداشت کی ٹیم" },
  "care.plan.title": { en: "My Care Plan", ar: "خطة الرعاية", ur: "میرا کیئر پلان" },
  "care.diet.title": { en: "Patient Diet", ar: "حمية المريض", ur: "مریض کی خوراک" },
  "care.baby.title": { en: "Baby Camera", ar: "كاميرا الطفل", ur: "بیبی کیمرہ" },
  "care.labs.title": { en: "Lab Results", ar: "نتائج المختبر", ur: "لیب کے نتائج" },
  "care.imaging.title": { en: "Scans & Imaging", ar: "الأشعة والتصوير", ur: "کین اور امیجنگ" },
  "care.observations.title": { en: "Observations", ar: "الملاحظات السريرية", ur: "مشاہدات" },
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
  "care.team.name.omar": { en: "Dr. Walt Disney", ar: "د. والت ديزني", ur: "ڈاکٹر عمر عبدالحلیم" },
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
  "care.plan.bloodWork": { en: "Blood Work", ar: "فحوصات الدم", ur: "خون کے ٹیسٹ" },
  "care.plan.medicationRound": { en: "Medication Round", ar: "جولة الأدوية", ur: "ادویات کا دور" },
  "care.plan.checkup": { en: "Checkup", ar: "فحص", ur: "چیک اپ" },
  "care.plan.physicalTherapy": { en: "Physical Therapy", ar: "العلاج الطبيعي", ur: "فزیکل تھراپی" },
  "care.plan.doctorReview": { en: "Doctor Review", ar: "مراجعة الطبيب", ur: "ڈاکٹر کا جائزہ" },
  "care.plan.min": { en: "Min", ar: "دقيقة", ur: "منٹ" },
  "care.plan.done": { en: "Done", ar: "تم", ur: "ہو گیا" },
  "careplan.toggle.daily": { en: "Daily", ar: "يومي", ur: "روزانہ" },
  "careplan.toggle.overall": { en: "Overall", ar: "إجمالي", ur: "مجموعی" },
  "careplan.dayLabel": { en: "Day", ar: "يوم", ur: "دن" },
  "careplan.today": { en: "Today", ar: "اليوم", ur: "آج" },
  "careplan.yesterday": { en: "Yesterday", ar: "أمس", ur: "کل" },
  "careplan.tomorrow": { en: "Tomorrow", ar: "غداً", ur: "کل" },
  "careplan.overallTitle": { en: "Overall Plan", ar: "خطة شاملة", ur: "مجموعی منصوبہ" },
  "careplan.overallDesc": { en: "Here is our treatment plan, it will be updated regularly", ar: "هذه هي خطتنا العلاجية، وسيتم تحديثها بانتظام", ur: "یہ ہمارا علاج کا منصوبہ ہے، اسے باقاعدگی سے اپ ڈیٹ کیا جائے گا" },

  "settings.room": { en: "Room", ar: "غرفة", ur: "کمرہ" },
  "settings.deviceId": { en: "Device ID", ar: "معرف الجهاز", ur: "ڈیوائس ID" },

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
  "care.discharge.order": { en: "Discharge Order", ar: "أمر الخروج", ur: "ڈسچارج آرڈر" },
  "care.discharge.insurance": { en: "Insurance Approval", ar: "موافقة التأمين", ur: "انشورنس کی منظوری" },
  "care.discharge.medication": { en: "Medication Dispensing", ar: "صرف الأدوية", ur: "ادویات کی فراہمی" },
  "care.discharge.finalCheckup": { en: "Final Checkup", ar: "الفحص النهائي", ur: "حتمی چیک اپ" },
  "care.nutritional.fasting": { en: "Fasting Status", ar: "حالة الصيام", ur: "روزے کی حالت" },
  "care.dietary.regime": { en: "Dietary Regime", ar: "البرنامج الغذائي", ur: "خوراک کا نظام" },
  "care.fasting.yes": { en: "Yes", ar: "نعم", ur: "ہاں" },
  "care.fasting.no": { en: "No", ar: "لا", ur: "نہیں" },


  /* ─── Pain ─── */

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
  "settings.disconnect": { en: "Disconnect", ar: "قطع الاتصال", ur: "منقطع کریں" },
  "settings.stopCasting": { en: "Stop Casting", ar: "إيقاف العرض", ur: "کاسٹنگ بند کریں" },
  "wifi.scanning": { en: "Scanning for networks...", ar: "جاري البحث عن شبكات...", ur: "نیٹ ورکس تلاش کر رہا ہے..." },
  "wifi.available": { en: "Available Networks", ar: "الشبكات المتاحة", ur: "دستیاب نیٹ ورکس" },
  "wifi.secured": { en: "Secured", ar: "مؤمنة", ur: "محفوظ" },
  "wifi.open": { en: "Open", ar: "مفتوحة", ur: "کھلا ہے" },
  "wifi.connected": { en: "Connected", ar: "متصل", ur: "منسلک" },
  "bt.searchDevices": { en: "Search Devices", ar: "البحث عن أجهزة", ur: "آلات تلاش کریں" },
  "bt.searching": { en: "Searching...", ar: "جاري البحث...", ur: "تلاش کر رہا ہے..." },
  "bt.paired": { en: "Paired Devices", ar: "الأجهزة المقترنة", ur: "جوڑا بنائے گئے آلات" },
  "bt.pairedStatus": { en: "Paired", ar: "مقترن", ur: "جوڑا بن گیا" },
  "bt.available": { en: "Available Devices", ar: "الأجهزة المتاحة", ur: "دستیاب آلات" },
  "cast.looking": { en: "Looking for devices...", ar: "جاري البحث عن أجهزة...", ur: "آلات تلاش کر رہا ہے..." },
  "cast.unavailable": { en: "Unavailable", ar: "غير متاح", ur: "دستیاب نہیں है" },
  /* ─── Care Team Only (formerly Admin) ─── */
  "settings.careTeam": { en: "Care Team", ar: "فريق الرعاية", ur: "کیئر ٹیم" },
  "settings.careTeam.subtitle": { en: "PIN required", ar: "رمز الدخول مطلوب", ur: "پن درکار ہے" },
  "settings.clearData": { en: "Clear Data", ar: "مسح البيانات", ur: "ڈیٹا صاف کریں" },
  "settings.clearData.signOut": { en: "Sign out of all apps", ar: "تسجيل الخروج من جميع التطبيقات", ur: "تمام ایپس سے سائن آؤٹ کریں" },
  "settings.clearData.history": { en: "Clear browsing history & cache", ar: "مسح سجل التصفح والتخزين المؤقت", ur: "براؤزنگ ہسٹری اور کیشے کو صاف کریں" },
  "settings.clearData.passwords": { en: "Remove saved passwords", ar: "إزالة كلمات المرور المحفوظة", ur: "محفوظ کردہ پاس ورڈز ہٹائیں" },
  "settings.clearData.lockedApps": { en: "App lock settings cleared", ar: "مسح إعدادات قفل التطبيقات", ur: "ایپ لاک سیٹنگز صاف" },
  "settings.clearData.preferences": { en: "Language & preferences reset", ar: "إعادة تعيين اللغة والتفضيلات", ur: "زبان اور ترجیحات ری سیٹ" },
  "settings.clearData.reset": { en: "Return to login screen", ar: "العودة إلى شاشة تسجيل الدخول", ur: "لاگ ان اسکرین پر واپس جائیں" },
  "settings.clearData.question": { en: "Are you sure you want to clear all data?", ar: "هل أنت متأكد من مسح جميع البيانات؟", ur: "کیا آپ واقعی تمام ڈیٹا صاف کرنا چاہتے ہیں؟" },
  "settings.clearData.desc": { en: "This action cannot be undone. It will prepare the terminal for the next patient.", ar: "لا يمكن التراجع عن هذا الإجراء. سيقوم بإعداد الشاشة للمريض التالي.", ur: "اس کارروائی کو واپس نہیں کیا جا سکتا۔ یہ اگلے مریض کے لیے ٹرمینل تیار کرے گا۔" },
  "settings.clearData.clearMyData.title": { en: "Clear My Data", ar: "مسح بياناتي", ur: "میرا ڈیٹا صاف کریں" },
  "settings.clearData.clearMyData.desc": { en: "Clears third-party apps, browser cache, and website logins. Your preferences and PIN remain safe.", ar: "يمسح التطبيقات الخارجية وسجل التصفح وتسجيلات الدخول. تظل إعداداتك ورمز PIN الخاص بك آمنين.", ur: "تھرڈ پارٹی ایپس، براؤزر کیشے اور ویب سائٹ لاگ ان کو صاف کرتا ہے۔ آپ کی ترجیحات اور PIN محفوظ رہیں گے۔" },
  "settings.clearData.clearEverything.title": { en: "Clear Everything", ar: "مسح كل شيء", ur: "سب کچھ صاف کریں" },
  "settings.clearData.clearEverything.desc": { en: "Resets the device fully to factory defaults. Wipes all preferences, language setup, and PIN.", ar: "إعادة ضبط الجهاز بالكامل إلى إعدادات المصنع. يمسح جميع التفضيلات وإعداد اللغة ورمز PIN.", ur: "ڈیوائس کو فیکٹری ڈیفالٹس پر مکمل طور پر ری سیٹ کرتا ہے۔ تمام ترجیحات، زبان کے سیٹ اپ اور PIN کو صاف کرتا ہے۔" },
  "settings.clearData.btn.clearEverything": { en: "Clear Everything", ar: "مسح كل شيء", ur: "سب کچھ صاف کریں" },
  "settings.clearData.btn.clearMyData": { en: "Clear My Data", ar: "مسح بياناتي", ur: "میرا ڈیٹا صاف کریں" },

  /* ─── Care Team Access Dialog ─── */
  "careteam.title": { en: "Care Team Access", ar: "دخول فريق الرعاية", ur: "کیئر ٹیم رسائی" },
  "careteam.enterPin": { en: "Enter 4-digit team PIN", ar: "أدخل رمز الفريق المكون من 4 أرقام", ur: "4 ہندسوں والا ٹیم پن درج کریں" },
  "careteam.incorrect": { en: "Incorrect PIN. Please try again.", ar: "رمز خاطئ. يرجى المحاولة مرة أخرى.", ur: "غلط پن۔ دوبارہ کوشش کریں۔" },
  "careteam.nurseRole": { en: "Nurse Interface", ar: "واجهة التمريض", ur: "نرس انٹرفیس" },
  "careteam.doctorRole": { en: "Physician Interface", ar: "واجهة الطبيب", ur: "ڈاکٹر انٹرفیس" },
  "careteam.del": { en: "DEL", ar: "حذف", ur: "حذف" },
  "careteam.history": { en: "Clinical History", ar: "السجل السريري", ur: "طبی تاریخ" },
  "careteam.addRecord": { en: "Add New Observation", ar: "إضافة ملاحظة جديدة", ur: "نیا مشاہدہ شامل کریں" },
  "careteam.gotoEmr": { en: "go to hospital EMR", ar: "الذهاب إلى السجل الطبي الإلكتروني", ur: "ہسپتال کے ای ایم آر پر جائیں" },
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
  "notif.missed": { en: "Missed", ar: "فائت", ur: "چھوٹ گیا" },
  "notif.markAllRead": { en: "Mark all as read", ar: "تحديد الكل كمقروء", ur: "تمام کو پڑھا ہوا قرار دیں" },
  "notif.clearAll": { en: "Clear all", ar: "مسح الكل", ur: "تمام مٹائیں" },
  "notif.swipeHint": { en: "Swipe left to dismiss", ar: "اسحب لليمين للحذف", ur: "مٹانے کے لیے بائیں جانب سوائپ کریں" },
  "notif.allCaughtUp": { en: "All caught up!", ar: "لا توجد إشعارات جديدة!", ur: "سب مکمل ہو گیا!" },
  "notif.noNew": { en: "No new notifications at the moment.", ar: "لا توجد إشعارات في الوقت الحالي.", ur: "اس وقت کوئی نئی اطلاع نہیں ہے۔" },

  /* ─── Notification Items ─── */
  "notif.ctaSurvey": { en: "Hospital Feedback Survey", ar: "استطلاع الرأي للمستشفى", ur: "ہسپتال کا سروے" },
  "notif.ctaPdf": { en: "Patient Guide Guidebook", ar: "دليل إرشادات المريض", ur: "مریض کی گائیڈ بک" },
  "notif.ctaImage": { en: "Daily Healthy Diet Chart", ar: "مخطط النظام الغذائي الصحي اليومي", ur: "روزمرہ کی خوراک کا چارٹ" },
  "notif.ctaVideo": { en: "CareInn Presentation Video", ar: "فيديو تعريفي لكيرإن", ur: "کیر ان تعریفی ویڈیو" },
  "notif.ctaUrl": { en: "Hospital Medical Portal", ar: "بوابة المريض الطبية", ur: "مریض کا پورٹل" },
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
  /* ─── Feedback Hub ─── */
  "feedback.quickSurvey": { en: "Quick Survey", ar: "استبيان سريع", ur: "فوری سروے" },
  "feedback.quickSurveyDesc": { en: "Rate your experience in minutes", ar: "قيّم تجربتك في دقائق", ur: "چند منٹوں میں اپنے تجربے کی درجہ بندی کریں" },
  "feedback.raiseConcern": { en: "Raise a Concern", ar: "تقديم شكوى", ur: "شکایت درج کریں" },
  "feedback.raiseConcernDesc": { en: "We'll route this to the right team", ar: "سيتم توجيهها للقسم المختص", ur: "ہم اسے صحیح ٹیم کو بھیجیں گے" },
  "feedback.sendAppreciation": { en: "Send Appreciation", ar: "شكر وتقدير", ur: "تعریف بھیجیں" },
  "feedback.sendAppreciationDesc": { en: "We'll share this with the team", ar: "سيتم مشاركة رسالتك مع الفريق", ur: "ہم اسے ٹیم کے ساتھ شیئر کریں گے" },
  "feedback.back": { en: "Back", ar: "رجوع", ur: "واپس" },
  /* ─── Concern Path ─── */
  "concern.title": { en: "Raise a concern", ar: "تقديم شكوى", ur: "شکایت درج کریں" },
  "concern.subtitle": { en: "We'll route this to the right team", ar: "سيتم توجيهها للقسم المختص", ur: "ہم اسے صحیح ٹیم کو بھیجیں گے" },
  "concern.areaQuestion": { en: "What area does this relate to?", ar: "أي مجال يتعلق به الموضوع؟", ur: "یہ کس شعبے سے متعلق ہے؟" },
  "concern.area.nursing": { en: "Nursing care", ar: "الرعاية التمريضية", ur: "نرسنگ کیئر" },
  "concern.area.food": { en: "Food service", ar: "خدمة الطعام", ur: "فوڈ سروس" },
  "concern.area.room": { en: "Room & cleaning", ar: "الغرفة والنظافة", ur: "کمرا اور صفائی" },
  "concern.area.medical": { en: "Medical staff", ar: "الكادر الطبي", ur: "طبی عملہ" },
  "concern.area.wait": { en: "Wait time", ar: "وقت الانتظار", ur: "انتظار کا وقت" },
  "concern.area.other": { en: "Other", ar: "أخرى", ur: "دیگر" },
  "concern.tellUs": { en: "Tell us what happened", ar: "اكتب ما حدث", ur: "ہمیں بتائیں کیا ہوا" },
  "concern.placeholder": { en: "Type here...", ar: "اكتب هنا...", ur: "یہاں لکھیں..." },
  "concern.recordVoice": { en: "Record voice", ar: "تسجيل صوتي", ur: "آواز ریکارڈ کریں" },
  "concern.received": { en: "We received your concern", ar: "تم استلام شكواك", ur: "ہمیں آپ کی شکایت موصول ہوئی" },
  "concern.receivedDesc": { en: "A dedicated team member will review your message and contact you as soon as possible.", ar: "سيقوم الفريق المختص بمراجعة رسالتك والتواصل معك في أقرب وقت ممكن.", ur: "ایک مخصوص ٹیم ممبر آپ کے پیغام کا جائزہ لے کر جلد از جلد آپ سے رابطہ کرے گا۔" },
  "concern.refNumber": { en: "Reference number", ar: "الرقم المرجعي", ur: "حوالہ نمبر" },
  /* ─── Appreciation Path ─── */
  "appreciation.title": { en: "Send appreciation", ar: "شكر وتقدير", ur: "تعریف بھیجیں" },
  "appreciation.subtitle": { en: "We'll share this with the team", ar: "سيتم مشاركة رسالتك مع الفريق", ur: "ہم اسے ٹیم کے ساتھ شیئر کریں گے" },
  "appreciation.whoQuestion": { en: "Who would you like to thank?", ar: "مين تحب تشكر؟", ur: "آپ کس کا شکریہ ادا کرنا چاہتے ہیں؟" },
  "appreciation.who.specific": { en: "A specific person", ar: "شخص معين", ur: "ایک مخصوص فرد" },
  "appreciation.who.nursing": { en: "Nursing team", ar: "فريق التمريض", ur: "نرسنگ ٹیم" },
  "appreciation.who.doctor": { en: "My doctor", ar: "الطبيب المعالج", ur: "میرا ڈاکٹر" },
  "appreciation.who.hospital": { en: "The whole hospital", ar: "المستشفى كله", ur: "پورا ہسپتال" },
  "appreciation.yourMessage": { en: "Your message", ar: "رسالتك", ur: "آپ کا پیغام" },
  "appreciation.placeholder": { en: "Share what made your stay better...", ar: "شاركنا وش اللي حسّن تجربتك...", ur: "بتائیں کس چیز نے آپ کا قیام بہتر بنایا..." },
  "appreciation.recordVoice": { en: "Record voice", ar: "تسجيل صوتي", ur: "آواز ریکارڈ کریں" },
  "appreciation.send": { en: "Send", ar: "إرسال", ur: "بھیجیں" },
  "appreciation.delivered": { en: "Your message has been delivered", ar: "تم إيصال رسالتك", ur: "آپ کا پیغام پہنچا دیا گیا" },
  "appreciation.deliveredDesc": { en: "Kind words make a real difference. Your appreciation will be shared with the team shortly.", ar: "الكلمات الطيبة تصنع فرقاً حقيقياً. سيتم مشاركة شكرك مع الفريق قريباً.", ur: "مہربان الفاظ واقعی فرق ڈالتے ہیں۔ آپ کی تعریف جلد ہی ٹیم کے ساتھ شیئر کی جائے گی۔" },
  "appreciation.sendAnother": { en: "Send another", ar: "إرسال شكر آخر", ur: "مزید بھیجیں" },

  /* ─── About Us ─── */
  "about.title": { en: "About Us", ar: "عن المستشفى", ur: "ہمارے بارے میں" },
  "about.aboutDallah": { en: "About Dallah", ar: "عن دله", ur: "دلہ کے بارے میں" },
  "about.ourHospital": { en: "Our Hospital", ar: "المستشفى", ur: "ہمارا ہسپتال" },
  "about.dna": { en: "{0} DNA", ar: "{0} DNA", ur: "{0} ڈی این اے" },
  "about.dallahDna": { en: "Dallah DNA", ar: "دله DNA", ur: "دلہ ڈی این اے" },
  "about.caremedInBrief": { en: "CareMed InBrief", ar: "نبذة عن رعاية الطبية", ur: "کیئر میڈ مختصر طور پر" },
  "about.numbers": { en: "{0} In Numbers", ar: "{0} في أرقام", ur: "{0} اعداد و شمار میں" },
  "about.imcHistory": { en: "IMC History", ar: "تاريخ المركز الطبي الدولي", ur: "آئی ایم سی کی تاریخ" },
  "about.services": { en: "Services", ar: "الخدمات", ur: "خدمات" },
  "about.accreditations": { en: "Accreditations", ar: "الاعتمادات", ur: "اعتمادات" },
  "about.awards": { en: "Awards", ar: "الجوائز", ur: "ایوارڈز" },
  "about.digital": { en: "Digital Services", ar: "الخدمات الرقمية", ur: "ڈیجیٹل خدمات" },
  "about.participations": { en: "Participations", ar: "المشاركات", ur: "شراکتیں" },
  "about.certifications": { en: "Certifications", ar: "الشهادات", ur: "سرٹیفیکیشنز" },
  "about.clients": { en: "Clients", ar: "العملاء", ur: "کلائنٹس" },
  "about.patientRights": { en: "Patient Rights", ar: "حقوق المريض", ur: "مریض کے حقوق" },
  "about.watchVideo": { en: "Watch Our Hospital Video", ar: "شاهد فيديو المستشفى", ur: "ہمارے ہسپتال کی ویڈیو دیکھیں" },
  "about.video": { en: "Video", ar: "فيديو", ur: "ویڈیو" },
  "about.achievements": { en: "Achievements", ar: "الإنجازات والجوائز", ur: "کامیابیاں" },
  "about.dsfh.achievement1.title": { en: "World's Top 250 Hospitals", ar: "ضمن أفضل 250 مستشفى عالمياً", ur: "دنیا کے ٹاپ 250 ہسپتالوں میں شامل" },
  "about.dsfh.achievement1.desc": { en: "Dr. Soliman Fakeeh Hospital Jeddah is the first private hospital in Saudi Arabia to be included in Newsweek's World's Top 250 Hospitals list for 2026.", ar: "تصدر مستشفى الدكتور سليمان فقيه بجدة كأول مستشفى خاص في المملكة ينضم لقائمة نيوزويك لأفضل 250 مستشفى في العالم لعام 2026.", ur: "جدہ میں ڈاکٹر سلیمان فقیہ ہسپتال سعودی عرب کا پہلا نجی ہسپتال ہے جسے 2026 کے لیے نیوز ویک کے دنیا کے ٹاپ 250 ہسپتالوں کی فہرست میں شامل کیا گیا ہے۔" },
  "about.dsfh.achievement2.title": { en: "Best Private Hospital in SA", ar: "أفضل مستشفى خاص في المملكة", ur: "سعودی عرب کا بہترین نجی ہسپتال" },
  "about.dsfh.achievement2.desc": { en: "Ranked as the #1 Private Hospital in Saudi Arabia for the 5th consecutive year, ensuring unparalleled quality of care.", ar: "حصل المستشفى على المركز الأول كأفضل مستشفى خاص في المملكة العربية السعودية للسنة الخامسة على التوالي.", ur: "مسلسل پانچویں سال سعودی عرب میں نمبر 1 نجی ہسپتال کے طور پر درجہ بندی کی گئی، جو دیکھ بھال کے بے مثال معیار کو یقینی بناتی ہے۔" },
  "about.dsfh.achievement3.title": { en: "World's Best Smart Hospitals", ar: "أفضل المستشفيات الذكية عالمياً", ur: "دنیا کے بہترین سمارٹ ہسپتال" },
  "about.dsfh.achievement3.desc": { en: "Recognized among Newsweek's World's Best Smart Hospitals 2026 for leadership in digital health and AI-powered care.", ar: "تم اختياره ضمن قائمة نيوزويك لأفضل المستشفيات الذكية في العالم لعام 2026 لريادته في الصحة الرقمية والذكاء الاصطناعي.", ur: "ڈیجیٹل صحت اور AI سے چلنے والی دیکھ بھال میں قیادت کے لیے نیوز ویک کے 2026 کے دنیا کے بہترین سمارٹ ہسپتالوں میں تسلیم کیا گیا۔" },
  "about.dsfh.achievement4.title": { en: "Specialty Leadership", ar: "الريادة في التخصصات الطبية", ur: "طبی خصوصیات میں قیادت" },
  "about.dsfh.achievement4.desc": { en: "Ranked #1 among private hospitals in Neurology, Pediatrics, Orthopedics, and Oncology in the Middle East.", ar: "تصدر المستشفى كأفضل مستشفى خاص في الشرق الأوسط في تخصصات الأعصاب، الأطفال، العظام، وعلم الأورام.", ur: "مشرق وسطیٰ میں نیورولوجی، اطفال، آرتھوپیڈکس اور آنکولوجی میں نجی ہسپتالوں میں نمبر 1 قرار پایا۔" },

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
  "launcher.invalidUrl": { en: "Please enter a valid URL", ar: "يرجى إدخال عنوان URL صحيح", ur: "براہ کرم ایک درست URL درج کریں" },
  "launcher.urlPlaceholder": { en: "Enter website address (e.g. www.google.com)", ar: "أدخل عنوان الموقع (مثلاً www.google.com)", ur: "ویب سائٹ کا پتہ درج کریں" },

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

  /* ─── NFC Manager ─── */
  "nfc.title": { en: "NFC Cards", ar: "بطاقات NFC", ur: "این ایف سی کارڈز" },
  "nfc.description": { en: "Manage physical cards assigned to this terminal.", ar: "إدارة البطاقات المخصصة لهذه الشاشة.", ur: "اس ٹرمینل کے لیے تفویض کردہ فزیکل کارڈز کا نظم کریں۔" },
  "nfc.patientCard": { en: "Patient Login Card", ar: "بطاقة دخول المريض", ur: "مریض کا لاگ ان کارڈ" },
  "nfc.nurseCard": { en: "Nurse Override Card", ar: "بطاقة التمريض", ur: "نرس کا اوور رائیڈ کارڈ" },
  "nfc.custom": { en: "CUSTOM", ar: "مخصص", ur: "اپنی مرضی کے مطابق" },
  "nfc.registerCard": { en: "Register Card", ar: "تسجيل بطاقة", ur: "کارڈ رجسٹر کریں" },
  "nfc.replaceCard": { en: "Replace Card", ar: "تغيير البطاقة", ur: "کارڈ تبدیل کریں" },
  "nfc.resetToDefault": { en: "Reset to default", ar: "استعادة الافتراضي", ur: "پہلے سے طے شدہ پر ری سیٹ کریں" },
  "nfc.resetAll": { en: "Reset All", ar: "إعادة تعيين الكل", ur: "سب ری سیٹ کریں" },
  "nfc.tapCard": { en: "Tap card to terminal now...", ar: "مرر البطاقة على الشاشة الآن...", ur: "اب کارڈ کو ٹرمینل پر ٹیپ کریں..." },
  "nfc.cancel": { en: "Cancel", ar: "إلغاء", ur: "منسوخ" },
  "nfc.saved": { en: "Card Registered!", ar: "تم تسجيل البطاقة!", ur: "کارڈ رجسٹر ہو گیا!" },

  /* ─── Internet Browser ─── */
  "browser.connectionHelp": { en: "Connection Help", ar: "مساعدة في الاتصال", ur: "کنکشن میں مدد" },
  "browser.connectionTrouble": { en: "Connection Trouble?", ar: "مشكلة في الاتصال؟", ur: "کنکشن میں دشواری؟" },
  "browser.blockedDesc": { en: "This website might be blocked or taking too long to load inside the app. For the best experience, please open it in a full window.", ar: "قد يكون هذا الموقع محظوراً أو يستغرق وقتاً طويلاً للتحميل داخل التطبيق. للحصول على أفضل تجربة، يرجى فتحه في نافذة كاملة.", ur: "ہو سکتا ہے کہ یہ ویب سائٹ بلاک ہو یا ایپ کے اندر لوڈ ہونے میں بہت زیادہ وقت لے رہی ہو۔ بہترین تجربے کے لیے، براہ کرم اسے مکمل ونڈو میں کھولیں۔" },
  "browser.openExternal": { en: "Open in External Browser", ar: "فتح في متصفح خارجي", ur: "بیرونی براؤزر میں کھولیں" },
  "browser.waitLonger": { en: "Try waiting a bit longer", ar: "حاول الانتظار لفترة أطول قليلاً", ur: "تھوڑی دیر اور انتظار کرنے کی کوشش کریں" },
  "browser.securityNotice": { en: "You are browsing within the secure CareInn environment. External links are monitored.", ar: "أنت تتصفح داخل بيئة CareInn الآمنة. يتم مراقبة الروابط الخارجية.", ur: "آپ CareInn کے محفوظ ماحول میں براؤز کر رہے ہیں۔ بیرونی لنکس کی نگرانی کی جاتی ہے۔" },
  // Account / Authentication
  "settings.account": { en: "My Account", ar: "حسابي" },
  "settings.account.subtitle.set": { en: "Account Configured", ar: "تم إعداد الحساب" },
  "settings.account.subtitle.unset": { en: "Tap to set up PIN & NFC", ar: "انقر لإعداد الرمز السري والبطاقة" },
  "settings.account.overview.changeP": { en: "Change PIN", ar: "تغيير الرمز السري" },
  "settings.account.overview.changeNfc": { en: "Register New NFC Card", ar: "تسجيل بطاقة جديدة" },
  "settings.account.overview.remove": { en: "Remove Account", ar: "إزالة الحساب" },
  "settings.account.overview.removeConfirm": { en: "Are you sure you want to logout from your account?", ar: "هل أنت متأكد أنك تريد تسجيل الخروج من حسابك؟" },
  "settings.account.setPin.title": { en: "Set a 4-Digit PIN", ar: "قم بتعيين رمز سري من 4 أرقام" },
  "settings.account.setPin.subtitle": { en: "This PIN will be used to unlock your screen.", ar: "سيتم استخدام هذا الرمز لفتح شاشتك." },
  "settings.account.confirmPin.title": { en: "Confirm your PIN", ar: "تأكيد الرمز السري" },
  "settings.account.pin.mismatch": { en: "PINs do not match. Please try again.", ar: "الرموز غير متطابقة. يرجى المحاولة مرة أخرى." },
  "settings.account.nfc.prompt.title": { en: "Register an NFC Card?", ar: "هل تريد تسجيل بطاقة NFC؟" },
  "settings.account.nfc.prompt.body": { en: "You can tap a compatible NFC card or wristband to unlock the screen without entering your PIN.", ar: "يمكنك لمس بطاقة أو سوار متوافق لفتح الشاشة دون إدخال الرمز السري." },
  "settings.account.nfc.skip": { en: "Skip for now", ar: "تخطي الآن" },
  "settings.account.nfc.register": { en: "Register Card", ar: "تسجيل البطاقة" },
  "settings.account.nfc.tap1.title": { en: "Tap Your Card Now", ar: "قم بتمرير بطاقتك الآن" },
  "settings.account.nfc.tap1.body": { en: "Hold your NFC card or wristband near the reader.", ar: "ضع بطاقتك أو سوارك بالقرب من القارئ." },
  "settings.account.nfc.tap2.title": { en: "Tap Again to Confirm", ar: "قم بتمريرها مرة أخرى للتأكيد" },
  "settings.account.nfc.mismatch": { en: "Cards do not match. Please try again.", ar: "البطاقات غير متطابقة. يرجى المحاولة مرة أخرى." },
  "settings.account.success.set": { en: "Account successfully set up!", ar: "تم إعداد الحساب بنجاح!" },
  "settings.account.success.updated": { en: "Account updated successfully!", ar: "تم تحديث الحساب بنجاح!" },
  "settings.account.cancel": { en: "Cancel", ar: "إلغاء" },

  // Lock Screen
  "lock.title": { en: "Enter PIN", ar: "أدخل الرمز السري" },
  "lock.nfc.hint": { en: "or tap your NFC card to unlock", ar: "أو قم بتمرير بطاقتك لفتح الشاشة" },
  "lock.wrongPin": { en: "Incorrect PIN", ar: "الرمز السري غير صحيح" },

  "lock.guest.button": {
    en: "Continue as Guest",
    ar: "متابعة كضيف",
    ur: "بطور مہمان جاری رکھیں"
  },
  "lock.guest.subtitle": {
    en: "Limited access — name and medical info hidden",
    ar: "وصول محدود — الاسم والمعلومات الطبية مخفية",
    ur: "محدود رسائی — نام اور طبی معلومات پوشیدہ"
  },
  "guest.careMe.locked.title": {
    en: "CareMe locked",
    ar: "بياناتي الطبية مقفلة",
    ur: "میری دیکھ بھال مقفل ہے"
  },
  "guest.careMe.locked.subtitle": {
    en: "Tap to enter your PIN and view your medical info",
    ar: "اضغط لإدخال رمز PIN وعرض معلوماتك الطبية",
    ur: "اپنا PIN درج کرنے اور طبی معلومات دیکھنے کے لیے ٹیپ کریں"
  },
  "guest.careMe.unlock.button": {
    en: "Unlock",
    ar: "فتح",
    ur: "کھولیں"
  },
  "guest.careMe.dialog.title": {
    en: "Unlock CareMe",
    ar: "فتح بياناتي الطبية",
    ur: "میری دیکھ بھال کھولیں"
  },
  "guest.careMe.dialog.enterPin": {
    en: "Enter your PIN",
    ar: "أدخل رمز PIN",
    ur: "اپنا PIN درج کریں"
  },
  "guest.careMe.dialog.incorrect": {
    en: "Incorrect PIN",
    ar: "رمز غير صحيح",
    ur: "غلط PIN"
  },

  /* ── App Lock ── */
  "appLock.lock.title": { en: "Lock this app", ar: "قفل هذا التطبيق", ur: "یہ ایپ مقفل کریں" },
  "appLock.lock.subtitle": { en: "Require PIN to open", ar: "يتطلب رمز PIN للفتح", ur: "کھولنے کے لیے PIN درکار" },
  "appLock.lock.button": { en: "Lock", ar: "قفل", ur: "مقفل کریں" },
  "appLock.unlock.title": { en: "Unlock this app", ar: "إلغاء قفل هذا التطبيق", ur: "ایپ کھولیں" },
  "appLock.unlock.subtitle": { en: "Currently requires PIN to open", ar: "يتطلب حاليًا رمز PIN للفتح", ur: "فی الحال PIN درکار ہے" },
  "appLock.unlock.button": { en: "Unlock", ar: "فتح القفل", ur: "غیر مقفل کریں" },
  "appLock.verify.title": { en: "Enter PIN to unlock", ar: "أدخل PIN للفتح", ur: "PIN درج کریں" },
  "appLock.open.title": { en: "Enter PIN to open", ar: "أدخل PIN للفتح", ur: "کھولنے کے لیے PIN درج کریں" },
  "appLock.noPinSetup.title": { en: "No PIN set", ar: "لم يتم تعيين رمز PIN", ur: "PIN سیٹ نہیں" },
  "appLock.noPinSetup.subtitle": { en: "Set up a PIN first to lock apps", ar: "قم بإعداد رمز PIN أولاً لقفل التطبيقات", ur: "ایپس مقفل کرنے کے لیے پہلے PIN سیٹ کریں" },
  "appLock.noPinSetup.button": { en: "Set up PIN", ar: "إعداد PIN", ur: "PIN ترتیب دیں" },
  "appLock.locked": { en: "Locked", ar: "مقفل", ur: "مقفل" },
  "appLock.unlocked": { en: "Unlocked", ar: "تم الفتح", ur: "کھل گیا" },
  "appLock.cancel": { en: "Cancel", ar: "إلغاء", ur: "منسوخ کریں" },

  /* ── My Preferences ── */
  "settings.preferences": { en: "My Preferences", ar: "تفضيلاتي", ur: "میری ترجیحات" },
  "settings.preferences.subtitle.set": { en: "PIN & server configured", ar: "تم ضبط الرمز والخادم", ur: "PIN اور سرور ترتیب دیا گیا" },
  "settings.preferences.subtitle.unset": { en: "Set up your preferences", ar: "اضبط تفضيلاتك", ur: "اپنی ترجیحات ترتیب دیں" },

  /* ── Backgrounds Preferences ── */
  "prefs.backgrounds": { en: "Backgrounds", ar: "الخلفيات", ur: "پس منظر" },
  "prefs.backgrounds.slideshow": { en: "Slideshow", ar: "عرض شرائح", ur: "سلائیڈ شو" },
  "prefs.backgrounds.custom": { en: "Custom", ar: "مخصص", ur: "حسب ضرورت" },
  "prefs.backgrounds.slideshow.label": { en: "Show as slideshow", ar: "عرض كشرائح", ur: "سلائیڈ شو دکھائیں" },
  "prefs.backgrounds.slideshow.hint": { en: "Cycles through all images automatically", ar: "يتنقل بين جميع الصور تلقائياً", ur: "تمام تصاویر کے درمیان خودبخود چلتا ہے" },
  "prefs.backgrounds.loading": { en: "Loading images...", ar: "جار تحميل الصور...", ur: "تصاویر لوڈ ہو رہی ہیں..." },
  "prefs.backgrounds.default": { en: "Default", ar: "افتراضي", ur: "ڈیفالٹ" },
  "prefs.backgrounds.empty": { en: "No images available", ar: "لا توجد صور متاحة", ur: "کوئی تصویر دستیاب نہیں" },

  /* ─── App Install ─── */
  "appInstall.installing": { en: "Installing", ar: "جار تثبيت", ur: "انسٹال ہو رہا ہے" },
  "appInstall.hint": { en: "This only happens once", ar: "يحدث هذا مرة واحدة فقط", ur: "یہ صرف ایک بار ہوتا ہے" },

  /* ─── Offline Banner ─── */
  "offline.title": { en: "No Internet Connection", ar: "لا يوجد اتصال بالإنترنت", ur: "انٹرنیٹ کنکشن نہیں" },
  "offline.subtitle": { en: "Showing last saved content. Connect to WiFi to refresh.", ar: "يتم عرض المحتوى المحفوظ. اتصل بالواي فاي للتحديث.", ur: "آخری محفوظ مواد دکھایا جا رہا ہے۔" },
  "offline.openWifi": { en: "Open WiFi Settings", ar: "فتح إعدادات الواي فاي", ur: "وائی فائی سیٹنگز کھولیں" },
  "offline.adminPin": { en: "Continue Offline", ar: "الاستمرار بدون اتصال", ur: "آف لائن جاری رکھیں" },
  "offline.enterPin": { en: "Enter admin PIN", ar: "أدخل رمز PIN للمسؤول", ur: "ایڈمن PIN درج کریں" },
  "offline.cancel": { en: "Cancel", ar: "إلغاء", ur: "منسوخ" },

  /* ─── Updates ─── */
  "update.available": { en: "An update is available", ar: "يتوفر تحديث", ur: "ایک اپ ڈیٹ دستیاب ہے" },
  "update.reload": { en: "Reload now", ar: "إعادة التحميل الآن", ur: "ابھی ری لوڈ کریں" },

  /* ─── First-run Onboarding Wizard ─── */
  "onboarding.header.title": { en: "Setup your Preferences", ar: "إعداد تفضيلاتك", ur: "اپنی ترجیحات ترتیب دیں" },
  "onboarding.header.subtitle": { en: "Let's personalize your screen for your stay", ar: "لنخصّص شاشتك طوال فترة إقامتك", ur: "آئیے آپ کے قیام کے لیے اسکرین کو ذاتی بنائیں" },
  "onboarding.progress": { en: "Step {0} of {1}", ar: "الخطوة {0} من {1}", ur: "مرحلہ {0} از {1}" },
  "onboarding.next": { en: "Next", ar: "التالي", ur: "اگلا" },
  "onboarding.skip": { en: "Skip", ar: "تخطي", ur: "چھوڑیں" },
  "onboarding.skipAll": { en: "Skip all", ar: "تخطي الكل", ur: "سب چھوڑ دیں" },
  "onboarding.yes": { en: "Yes", ar: "نعم", ur: "ہاں" },
  "onboarding.no": { en: "No", ar: "لا", ur: "نہیں" },

  "onboarding.welcome.title": { en: "Welcome — we're glad you're here", ar: "مرحباً — يسعدنا وجودك هنا", ur: "خوش آمدید — آپ کی موجودگی ہمارے لیے خوشی کی بات ہے" },
  "onboarding.welcome.body": { en: "This is your personal screen for the stay: entertainment, hospital services, and a way to stay connected, all in one place. Let's take a minute to set it up just for you.", ar: "هذه شاشتك الشخصية طوال فترة إقامتك: ترفيه وخدمات المستشفى ووسيلة للبقاء على تواصل، كل ذلك في مكان واحد. لنستغرق دقيقة لإعدادها خصيصاً لك.", ur: "یہ آپ کے قیام کے لیے آپ کی ذاتی اسکرین ہے: تفریح، ہسپتال کی خدمات، اور رابطے میں رہنے کا ذریعہ، سب ایک جگہ۔ آئیے ایک منٹ میں اسے صرف آپ کے لیے ترتیب دیں۔" },
  "onboarding.welcome.start": { en: "Get started", ar: "ابدأ", ur: "شروع کریں" },

  "onboarding.language.title": { en: "Which language do you prefer?", ar: "ما اللغة التي تفضلها؟", ur: "آپ کون سی زبان پسند کرتے ہیں؟" },

  "onboarding.displayName.title": { en: "How would you like us to call you?", ar: "كيف تحب أن نناديك؟", ur: "آپ چاہتے ہیں ہم آپ کو کیسے پکاریں؟" },
  "onboarding.displayName.useFile": { en: "Use my file name", ar: "استخدم اسمي في الملف الطبي", ur: "میری فائل کا نام استعمال کریں" },
  "onboarding.displayName.custom": { en: "Enter a name myself", ar: "أُدخل اسماً بنفسي", ur: "خود ایک نام درج کریں" },
  "onboarding.displayName.nameEn": { en: "Name (English)", ar: "الاسم (بالإنجليزية)", ur: "نام (انگریزی)" },
  "onboarding.displayName.nameAr": { en: "Name (Arabic)", ar: "الاسم (بالعربية)", ur: "نام (عربی)" },

  "onboarding.pin.title": { en: "Would you like to set a PIN for your safety?", ar: "هل ترغب في تعيين رمز PIN لحمايتك؟", ur: "کیا آپ اپنی حفاظت کے لیے PIN سیٹ کرنا چاہیں گے؟" },
  "onboarding.pin.alreadySet": { en: "A PIN is already set on this screen.", ar: "تم تعيين رمز PIN بالفعل على هذه الشاشة.", ur: "اس اسکرین پر پہلے سے PIN سیٹ ہے۔" },
  "onboarding.pin.skipToast": { en: "You can set this anytime from My Preferences.", ar: "يمكنك تعيينه في أي وقت من تفضيلاتي.", ur: "آپ اسے کسی بھی وقت میری ترجیحات سے سیٹ کر سکتے ہیں۔" },

  "onboarding.prayer.title": { en: "Would you like us to remind you at prayer times?", ar: "هل ترغب أن نذكّرك بأوقات الصلاة؟", ur: "کیا آپ چاہیں گے کہ ہم آپ کو نماز کے اوقات پر یاد دلائیں؟" },

  "onboarding.decision.title": { en: "Would you like to continue setting up your preferences?", ar: "هل ترغب في متابعة إعداد تفضيلاتك؟", ur: "کیا آپ اپنی ترجیحات کی ترتیب جاری رکھنا چاہیں گے؟" },
  "onboarding.decision.no": { en: "No, start immediately", ar: "أود البدء مباشرة", ur: "نہیں، ابھی شروع کریں" },

  "onboarding.theme.title": { en: "Dark or light mode?", ar: "الوضع الداكن أم الفاتح؟", ur: "ڈارک یا لائٹ موڈ؟" },
  "onboarding.theme.light": { en: "Light mode", ar: "الوضع الفاتح", ur: "لائٹ موڈ" },
  "onboarding.theme.dark": { en: "Dark mode", ar: "الوضع الداكن", ur: "ڈارک موڈ" },

  "onboarding.dataClear.title": { en: "How to manage your data", ar: "كيفية إدارة بياناتك", ur: "اپنے ڈیٹا کا انتظام کیسے کریں" },
  "onboarding.dataClear.daily": { en: "Reset my app data daily.", ar: "إعادة تعيين بياناتي تلقائياً يومياً.", ur: "روزانہ میرا ایپ ڈیٹا صاف کریں۔" },
  "onboarding.dataClear.idle": { en: "After 24 hours of inactivity.", ar: "بعد ٢٤ ساعة من عدم النشاط.", ur: "24 گھنٹے غیر فعالیت کے بعد۔" },
  "onboarding.dataClear.discharge": { en: "Only when I am discharged.", ar: "فقط عند خروجي من المستشفى.", ur: "صرف تب جب میں ہسپتال سے فارغ ہو جاؤں۔" },
  "onboarding.dataClear.note": { en: "You can change this anytime from Settings, or clear your data manually right now.", ar: "يمكنك تغيير هذا في أي وقت من الإعدادات، أو مسح بياناتك يدوياً الآن.", ur: "آپ اسے کسی بھی وقت سیٹنگز سے بدل سکتے ہیں، یا ابھی اپنا ڈیٹا خود صاف کر سکتے ہیں۔" },

  "onboarding.notifications.title": { en: "How would you like to receive notifications?", ar: "كيف تحب أن تصلك الإشعارات؟", ur: "آپ اطلاعات کیسے وصول کرنا چاہیں گے?" },
  "onboarding.notifications.sound": { en: "Sound", ar: "مع صوت", ur: "آواز کے ساتھ" },
  "onboarding.notifications.silent": { en: "Silent", ar: "صامت", ur: "خاموش" },

  "onboarding.bluetooth.title": { en: "Would you like to connect a Bluetooth device now?", ar: "هل ترغب في توصيل جهاز بلوتوث الآن؟", ur: "کیا آپ ابھی بلوٹوتھ ڈیوائس منسلک کرنا چاہیں گے؟" },

  "onboarding.screensaver.title": { en: "How long before the screen dims to a screensaver?", ar: "بعد كم من الوقت تنتقل الشاشة إلى شاشة التوقف؟", ur: "اسکرین کتنی دیر بعد اسکرین سیور پر جائے؟" },
  "onboarding.screensaver.30s": { en: "30 seconds", ar: "٣٠ ثانية", ur: "30 سیکنڈ" },
  "onboarding.screensaver.1m": { en: "1 minute", ar: "دقيقة واحدة", ur: "1 منٹ" },
  "onboarding.screensaver.5m": { en: "5 minutes", ar: "٥ دقائق", ur: "5 منٹ" },

  "onboarding.consent.title": { en: "One last step", ar: "خطوة أخيرة", ur: "آخری مرحلہ" },
  "onboarding.consent.tour.before": { en: "I've watched the ", ar: "لقد شاهدت ", ur: "میں نے " },
  "onboarding.consent.tour.link": { en: "welcome slideshow", ar: "عرض الشرائح الترحيبي", ur: "خوش آمدید سلائیڈ شو" },
  "onboarding.consent.tour.after": { en: "", ar: "", ur: " دیکھ لیا ہے" },
  "onboarding.consent.terms.before": { en: "I agree to the ", ar: "أوافق على ", ur: "میں " },
  "onboarding.consent.terms.link": { en: "Terms & Conditions", ar: "الشروط والأحكام", ur: "شرائط و ضوابط" },
  "onboarding.consent.terms.after": { en: "", ar: "", ur: " سے متفق ہوں" },
  "onboarding.consent.startWithTour": { en: "Start with a tour", ar: "ابدأ مع الجولة", ur: "ٹور کے ساتھ شروع کریں" },
  "onboarding.consent.startNow": { en: "Start now", ar: "ابدأ الآن", ur: "ابھی شروع کریں" },

  /* ─── My Preferences: Setup your Preferences ─── */
  "prefs.setup":            { en: "Setup your Preferences", ar: "إعداد تفضيلاتك", ur: "اپنی ترجیحات ترتیب دیں" },
  "prefs.setup.incomplete": { en: "Finish setting up your screen", ar: "أكمل إعداد شاشتك", ur: "اپنی اسکرین کی ترتیب مکمل کریں" },
  "prefs.setup.review":     { en: "Review or change your setup", ar: "راجع أو غيّر إعدادك", ur: "اپنی ترتیب دیکھیں یا بدلیں" },

  /* ─── My Preferences: Clear my data ─── */
  "prefs.clearData": { en: "Clear my data", ar: "مسح بياناتي", ur: "میرا ڈیٹا صاف کریں" },
  "prefs.clearData.subtitle": { en: "Manage your stored data", ar: "إدارة بياناتك المخزنة", ur: "اپنا محفوظ ڈیٹا منظم کریں" },
  "prefs.clearData.everything": { en: "Clear everything", ar: "مسح كل شيء", ur: "سب کچھ صاف کریں" },
  "prefs.clearData.everything.sub": { en: "Erases everything, including your PIN, and starts setup again from the beginning.", ar: "يمسح كل شيء، بما في ذلك رمز PIN، ويبدأ الإعداد من جديد.", ur: "PIN سمیت سب کچھ مٹا دیتا ہے، اور سیٹ اپ شروع سے دوبارہ شروع ہوتا ہے۔" },
  "prefs.clearData.userOnly": { en: "Clear my data", ar: "مسح بياناتي", ur: "میرا ڈیٹا صاف کریں" },
  "prefs.clearData.userOnly.sub": { en: "Clears your activity but keeps your setup, including your PIN.", ar: "يمسح نشاطك مع الاحتفاظ بإعداداتك، بما في ذلك رمز PIN.", ur: "آپ کی سرگرمی صاف کرتا ہے لیکن PIN سمیت آپ کا سیٹ اپ برقرار رکھتا ہے۔" },
  "prefs.clearData.done": { en: "Your data has been cleared.", ar: "تم مسح بياناتك.", ur: "آپ کا ڈیٹا صاف کر دیا گیا ہے۔" },

  /* ─── PIN / NFC setup (shared with onboarding) ─── */
  "pinSetup.title": { en: "Set up a PIN", ar: "إعداد رمز PIN", ur: "PIN سیٹ کریں" },
  "pinSetup.subtitle": { en: "Enter a 4-digit PIN for your settings", ar: "أدخل رمز PIN من ٤ أرقام لإعداداتك", ur: "اپنی سیٹنگز کے لیے 4 ہندسوں کا PIN درج کریں" },
  "pinSetup.confirm": { en: "Confirm your PIN", ar: "أكّد رمز PIN", ur: "اپنے PIN کی تصدیق کریں" },
  "pinSetup.mismatch": { en: "PINs do not match", ar: "الرمزان غير متطابقين", ur: "PIN مماثل نہیں ہیں" },
  "pinSetup.saved": { en: "Saved successfully", ar: "تم الحفظ بنجاح", ur: "کامیابی سے محفوظ ہو گیا" },
  "pinSetup.removed": { en: "Removed", ar: "تمت الإزالة", ur: "ہٹا دیا گیا" },
  "nfcSetup.title": { en: "Add NFC Card (Optional)", ar: "إضافة بطاقة NFC (اختياري)", ur: "NFC کارڈ شامل کریں (اختیاری)" },
  "nfcSetup.subtitle": { en: "You can pair an NFC card to easily unlock your screen later.", ar: "يمكنك ربط بطاقة NFC لفتح شاشتك بسهولة لاحقاً.", ur: "بعد میں اسکرین آسانی سے کھولنے کے لیے NFC کارڈ جوڑ سکتے ہیں۔" },
  "nfcSetup.skip": { en: "Skip", ar: "تخطي", ur: "چھوڑیں" },
  "nfcSetup.pair": { en: "Pair NFC", ar: "ربط البطاقة", ur: "NFC جوڑیں" },
  "nfcSetup.tap1": { en: "Tap your NFC card", ar: "مرّر بطاقة NFC", ur: "اپنا NFC کارڈ ٹیپ کریں" },
  "nfcSetup.tap2": { en: "Tap it again to confirm", ar: "مرّرها مرة أخرى للتأكيد", ur: "تصدیق کے لیے دوبارہ ٹیپ کریں" },
  "nfcSetup.hold": { en: "Hold the card near the reader", ar: "قرّب البطاقة من القارئ", ur: "کارڈ کو ریڈر کے قریب رکھیں" },
  "nfcSetup.mismatch": { en: "NFC cards do not match", ar: "البطاقتان غير متطابقتين", ur: "NFC کارڈ مماثل نہیں ہیں" }
};

/* ── Number Localization ── */
export function localizeNumber(n: number | string, locale: Locale): string {
  const s = String(n);
  if (locale === "ar") {
    return s.replace(/[0-9]/g, w => "٠١٢٣٤٥٦٧٨٩"[+w]);
  }
  return s;
}



/* ── Target-specific translator ── */
export function translateWithLocale(key: string, locale: Locale): string {
  const entry = translations[key];
  if (!entry) return key;
  return entry[locale] ?? entry.en ?? key;
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
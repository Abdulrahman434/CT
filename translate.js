const fs = require('fs');
const file = 'src/app/components/AppLauncher.tsx';
let content = fs.readFileSync(file, 'utf8');

const tMap = {
  "Live TV": 'locale === "ar" ? "البث المباشر" : "Live TV"',
  "YouTube": 'locale === "ar" ? "يوتيوب" : "YouTube"',
  "Netflix": 'locale === "ar" ? "نتفليكس" : "Netflix"',
  "Prime Video": 'locale === "ar" ? "برايم فيديو" : "Prime Video"',
  "Shahid": 'locale === "ar" ? "شاهد" : "Shahid"',
  "ثمانيه": 'locale === "ar" ? "ثمانية" : "Thmanyah"',
  "Because You Are Allah (AR)": 'locale === "ar" ? "لأنك الله (عربي)" : "Because You Are Allah (AR)"',
  "Because You Are Allah (EN)": 'locale === "ar" ? "لأنك الله (إنجليزي)" : "Because You Are Allah (EN)"',
  "Don\'t Be Sad (AR)": 'locale === "ar" ? "لا تحزن (عربي)" : "Don\'t Be Sad (AR)"',
  "Subtle Art (EN)": 'locale === "ar" ? "فن اللامبالاة (إنجليزي)" : "Subtle Art (EN)"',
  "Why We Sleep (EN)": 'locale === "ar" ? "لماذا ننام (إنجليزي)" : "Why We Sleep (EN)"',
  "Amal Kubra (AR)": 'locale === "ar" ? "الأعمال الكبرى (عربي)" : "Amal Kubra (AR)"',
  "فن اللامبالاة (AR)": 'locale === "ar" ? "فن اللامبالاة (عربي)" : "فن اللامبالاة (AR)"',
  "Great Expectations (EN)": 'locale === "ar" ? "آمال كبرى (إنجليزي)" : "Great Expectations (EN)"',
  "La Tahzan Guide (AR)": 'locale === "ar" ? "دليل لا تحزن (عربي)" : "La Tahzan Guide (AR)"',
  "Quran Explorer": 'locale === "ar" ? "القرآن الكريم" : "Quran Explorer"',
  "WhatsApp": 'locale === "ar" ? "واتس آب" : "WhatsApp"',
  "Facebook": 'locale === "ar" ? "فيسبوك" : "Facebook"',
  "Instagram": 'locale === "ar" ? "إنستغرام" : "Instagram"',
  "X": 'locale === "ar" ? "إكس (تويتر)" : "X"',
  "Snapchat": 'locale === "ar" ? "سناب شات" : "Snapchat"',
  "TikTok": 'locale === "ar" ? "تيك توك" : "TikTok"',
  "Memory Match": 'locale === "ar" ? "لعبة الذاكرة" : "Memory Match"',
  "Tic-Tac-Toe": 'locale === "ar" ? "إكس-أو" : "Tic-Tac-Toe"',
  "Sliding Puzzle": 'locale === "ar" ? "لعبة الألغاز" : "Sliding Puzzle"',
  "Color Match": 'locale === "ar" ? "تطابق الألوان" : "Color Match"',
  "Pattern Memory": 'locale === "ar" ? "ذاكرة الأنماط" : "Pattern Memory"',
  "Emoji Match": 'locale === "ar" ? "تطابق الرموز" : "Emoji Match"',
  "Teams": 'locale === "ar" ? "تيمز" : "Teams"',
  "Webex": 'locale === "ar" ? "ويبيكس" : "Webex"',
  "Skype": 'locale === "ar" ? "سكايب" : "Skype"',
  "Zoom": 'locale === "ar" ? "زوم" : "Zoom"',
  "Google Meet": 'locale === "ar" ? "جوجل ميت" : "Google Meet"',
  "Chrome": 'locale === "ar" ? "كروم" : "Chrome"',
  "Saudi Gazette": 'locale === "ar" ? "سعودي جازيت" : "Saudi Gazette"',
  "BBC News": 'locale === "ar" ? "بي بي سي الإخبارية" : "BBC News"',
  "CNN": 'locale === "ar" ? "سي إن إن" : "CNN"',
  "Okaz": 'locale === "ar" ? "عكاظ" : "Okaz"',
  "Calculator": 'locale === "ar" ? "آلة حاسبة" : "Calculator"',
  "Notes": 'locale === "ar" ? "ملاحظات" : "Notes"',
  "Reminders": 'locale === "ar" ? "تذكيرات" : "Reminders"',
  "Stopwatch": 'locale === "ar" ? "ساعة الإيقاف" : "Stopwatch"',
  "Unit Converter": 'locale === "ar" ? "محول الوحدات" : "Unit Converter"',
  "Breathing": 'locale === "ar" ? "تمرين التنفس" : "Breathing"',
  "Translator": 'locale === "ar" ? "المترجم" : "Translator"',
  "Mirror": 'locale === "ar" ? "المرآة" : "Mirror"',
  "Card Talk": 'locale === "ar" ? "التبادل اللفظي" : "Card Talk"',
};

// Replace 'name: "..."' with 'name: tMap[...]'
Object.keys(tMap).forEach(key => {
  const safeStr = key.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
  const regex = new RegExp(`name:\\s*["']${safeStr}["']`, 'g');
  content = content.replace(regex, `name: ${tMap[key]}`);
});

fs.writeFileSync(file, content);
console.log("Translated names in AppLauncher!");

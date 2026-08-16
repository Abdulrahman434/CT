import { useState, useEffect, useRef, useCallback } from "react";
import { ApiImage } from "./ApiImage";
import { motion, AnimatePresence } from "motion/react";
import { RotateCcw, ChevronDown, ChevronUp } from "lucide-react";
import { useTheme, WEIGHT, TYPE_SCALE } from "./ThemeContext";
import { useLocale } from "./i18n";
import { ConfirmDialog } from "./ConfirmDialog";
import islamicBg from "../../assets/5fe21555a4f83b05fa771caa690aaf6f27d2f6ec.png";
import { getPrayerStatus, PRAYER_NAMES, formatPrayerTime } from "../utils/prayerUtils";
import { Prayer } from "adhan";

/* ═══════════════════════════════════════════════════════════════════════════
 * AZKAR DATA
 * ═══════════════════════════════════════════════════════════════════════════ */

interface Dhikr {
  id: string;
  ar: string;
  en: string;
  target: number;
}

const AZKAR: Dhikr[] = [
  {
    id: "combined",
    ar: "سُبْحَانَ اللَّهِ وَالْحَمْدُ لِلَّهِ وَلَا إِلَٰهَ إِلَّا اللَّهُ وَاللَّهُ أَكْبَرُ",
    en: "SubhanAllah, Alhamdulillah, La ilaha illallah, Allahu Akbar",
    target: 100,
  },
  {
    id: "subhanallah",
    ar: "سُبْحَانَ اللَّهِ",
    en: "SubhanAllah (Glory be to Allah)",
    target: 33,
  },
  {
    id: "alhamdulillah",
    ar: "الْحَمْدُ لِلَّهِ",
    en: "Alhamdulillah (Praise be to Allah)",
    target: 33,
  },
  {
    id: "allahuakbar",
    ar: "اللَّهُ أَكْبَرُ",
    en: "Allahu Akbar (Allah is the Greatest)",
    target: 34,
  },
  {
    id: "lailaha",
    ar: "لَا إِلَٰهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ",
    en: "La ilaha illallah, wahdahu la sharika lah...",
    target: 100,
  },
  {
    id: "istighfar",
    ar: "أَسْتَغْفِرُ اللَّهَ الْعَظِيمَ وَأَتُوبُ إِلَيْهِ",
    en: "Astaghfirullah al-Azeem wa atubu ilayh",
    target: 100,
  },
  {
    id: "salawat",
    ar: "اللَّهُمَّ صَلِّ وَسَلِّمْ عَلَى نَبِيِّنَا مُحَمَّدٍ",
    en: "Allahumma salli wa sallim 'ala nabiyyina Muhammad",
    target: 100,
  },
  {
    id: "hawqala",
    ar: "لَا حَوْلَ وَا لَا قُوَّةَ إِلَّا بِاللَّهِ",
    en: "La hawla wa la quwwata illa billah",
    target: 100,
  },
];

interface TimedPhrase {
  ar: string;
  en: string;
}

interface TimeSlot {
  label: { ar: string; en: string };
  startHour: number; // 24h
  endHour: number;
  intervalMs: number;
  phrases: TimedPhrase[];
}

const TIME_SLOTS: TimeSlot[] = [
  /* ───────────────────────────────────────────────
   * أذكار الصباح  5:00 – 11:59
   * ─────────────────────────────────────────────── */
  {
    label: { ar: "أذكار الصباح", en: "Morning Athkar" },
    startHour: 5,
    endHour: 11,
    intervalMs: 5000,
    phrases: [
      // ── 1 ──
      { ar: "أَصْبَحْنا وَأَصْبَحَ المُلْكُ لله وَالحَمدُ لله", en: "We have reached the morning and all sovereignty belongs to Allah, and all praise is for Allah." },
      { ar: "لا إلهَ إلاّ اللّهُ وَحدَهُ لا شَريكَ لهُ، لهُ المُلكُ ولهُ الحَمْد", en: "None has the right to be worshipped except Allah, alone, without partner, to Him belongs all sovereignty and praise." },
      { ar: "وَهُوَ على كلّ شَيءٍ قدير", en: "And He is over all things omnipotent." },
      { ar: "رَبِّ أسْأَلُكَ خَيرَ ما في هذا اليوم وَخَيرَ ما بَعْدَه", en: "My Lord, I ask You for the good of this day and the good of what follows it." },
      { ar: "وَأَعوذُ بِكَ مِنْ شَرِّ هذا اليوم وَشَرِّ ما بَعْدَه", en: "And I take refuge in You from the evil of this day and the evil of what follows it." },
      { ar: "رَبِّ أَعوذُ بِكَ مِنَ الْكَسَلِ وَسوءِ الْكِبَر", en: "My Lord, I take refuge in You from laziness and senility." },
      { ar: "رَبِّ أَعوذُ بِكَ مِنْ عَذابٍ في النّارِ وَعَذابٍ في القَبْر", en: "My Lord, I take refuge in You from torment in the Fire and punishment in the grave." },

      // ── 2 ──
      { ar: "اللّهُمَّ بِكَ أَصْبَحْنا وَبِكَ أَمْسَيْنا", en: "O Allah, by Your leave we have reached the morning and by Your leave we have reached the evening." },
      { ar: "وَبِكَ نَحْيا وَبِكَ نَمُوتُ وَإِلَيْكَ النُّشُور", en: "By Your leave we live and die and unto You is our resurrection." },

      // ── 3 ──
      { ar: "اللّهُمَّ أَنْتَ رَبِّي لا إلهَ إلاّ أَنْتَ", en: "O Allah, You are my Lord, none has the right to be worshipped except You." },
      { ar: "خَلَقْتَنـي وَأَنا عَبْدُك، وَأَنا عَلى عَهْدِكَ وَوَعْدِكَ ما اسْتَطَعْت", en: "You created me and I am Your servant and I abide to Your covenant and promise as best I can." },
      { ar: "أَعوذُ بِكَ مِنْ شَرِّ ما صَنَعْت", en: "I take refuge in You from the evil of which I have committed." },
      { ar: "أَبوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ وَأَبوءُ بِذَنْبي فَاغْفِرْ لي", en: "I acknowledge Your favour upon me and I acknowledge my sin, so forgive me." },
      { ar: "فَإِنَّهُ لا يَغْفِرُ الذُّنوبَ إلاّ أَنْتَ", en: "For verily none can forgive sin except You." },

      // ── 4 ──
      { ar: "اللّهُمَّ إِنِّي أَصْبَحْتُ أُشْهِدُك وَأُشْهِدُ حَمَلَةَ عَرْشِك وَمَلائِكَتِك وَجَمِيعَ خَلْقِك", en: "O Allah, I have reached the morning and call on You, the bearers of Your throne, Your angels, and all of Your creation to witness." },
      { ar: "أَنَّكَ أَنْتَ اللهُ لا إلهَ إلاّ أَنْتَ وَحْدَكَ لا شَرِيكَ لَك", en: "That You are Allah, none has the right to be worshipped except You, alone, without partner." },
      { ar: "وَأَنَّ مُحَمَّداً عَبْدُكَ وَرَسولُك", en: "And that Muhammad is Your Servant and Messenger." },

      // ── 5 ──
      { ar: "اللّهُمَّ ما أَصْبَحَ بي مِنْ نِعْمَةٍ أَو بِأَحَدٍ مِنْ خَلْقِك فَمِنْكَ وَحْدَكَ لا شريكَ لَك", en: "O Allah, what blessing I or any of Your creation have risen upon, is from You alone, without partner." },
      { ar: "فَلَكَ الْحَمْدُ وَلَكَ الشُّكْر", en: "So for You is all praise and unto You all thanks." },

      // ── 6 ──
      { ar: "اللّهُمَّ عافِني في بَدَنـي، اللّهُمَّ عافِني في سَمْعي، اللّهُمَّ عافِني في بَصَري", en: "O Allah, grant my body health, O Allah, grant my hearing health, O Allah, grant my sight health." },
      { ar: "لا إلهَ إلاّ أَنْتَ", en: "None has the right to be worshipped except You." },
      { ar: "اللّهُمَّ إِنِّي أَعوذُ بِكَ مِنَ الْكُفر وَالفَقْر", en: "O Allah, I take refuge with You from disbelief and poverty." },
      { ar: "وَأَعوذُ بِكَ مِنْ عَذابِ القَبْر، لا إلهَ إلاّ أَنْتَ", en: "And I take refuge with You from the punishment of the grave. None has the right to be worshipped except You." },

      // ── 7 ──
      { ar: "حَسْبِيَ اللّهُ لا إلهَ إلاّ هُوَ عَلَيهِ تَوَكَّلتُ وَهُوَ رَبُّ العَرْشِ العَظِيم", en: "Allah is Sufficient for me, none has the right to be worshipped except Him, upon Him I rely and He is Lord of the exalted throne." },

      // ── 9 ──
      { ar: "اللّهُمَّ إِنِّي أسْأَلُكَ العَفْوَ وَالعافِيةَ في الدُّنْيا وَالآخِرَة", en: "O Allah, I ask You for pardon and well-being in this life and the next." },
      { ar: "اللّهُمَّ إِنِّي أسْأَلُكَ العَفْوَ وَالعافِيةَ في ديني وَدُنْيايَ وَأهْلي وَمالي", en: "O Allah, I ask You for pardon and well-being in my religious and worldly affairs, and my family and my wealth." },
      { ar: "اللّهُمَّ اسْتُرْ عوْراتي وَآمِنْ رَوْعاتـي", en: "O Allah, veil my weaknesses and set at ease my dismay." },
      { ar: "اللّهُمَّ احْفَظْني مِن بَينِ يَدَيَّ وَمِن خَلْفـي وَعَن يَمـيني وَعَن شِمالي وَمِن فَوْقـي", en: "O Allah, preserve me from the front and from behind and on my right and on my left and from above." },
      { ar: "وَأَعوذُ بِعَظَمَتِكَ أَن أُغْتالَ مِن تَحْتـي", en: "And I take refuge with You lest I be swallowed up by the earth." },

      // ── 10 ──
      { ar: "اللّهُمَّ عالِمَ الغَيْبِ وَالشّهادَةِ فاطِرَ السّماواتِ وَالأرْضِ رَبَّ كلِّ شَيءٍ وَمَليـكَه", en: "O Allah, Knower of the unseen and the seen, Creator of the heavens and the Earth, Lord and Sovereign of all things." },
      { ar: "أَشْهَدُ أَنْ لا إِلهَ إِلاّ أَنْتَ، أَعوذُ بِكَ مِنْ شَرِّ نَفْسـي وَمِنْ شَرِّ الشَّيْطانِ وَشِرْكِه", en: "I bear witness that none has the right to be worshipped except You. I take refuge in You from the evil of my soul and from the evil and shirk of the devil." },
      { ar: "وَأَنْ أَقْتَرِفَ عَلى نَفْسـي سوءاً أَوْ أَجُرَّهُ إِلى مُسْلِم", en: "And from committing wrong against my soul or bringing such upon another Muslim." },

      // ── 11 ──
      { ar: "بِسمِ اللهِ الذي لا يَضُرُّ مَعَ اسمِهِ شَيءٌ في الأرْضِ وَلا في السّماءِ وَهوَ السّمِيعُ العَلِيم", en: "In the name of Allah with whose name nothing is harmed on earth nor in the heavens and He is The All-Hearing, The All-Knowing." },

      // ── 12 ──
      { ar: "رَضِيتُ بِاللهِ رَبّاً وَبِالإسْلامِ ديناً وَبِمُحَمَّدٍ ﷺ نَبِيّاً", en: "I am pleased with Allah as a Lord, and Islam as a religion and Muhammad ﷺ as a Prophet." },

      // ── 13 ──
      { ar: "سُبْحانَ اللهِ وَبِحَمْدِهِ عَدَدَ خَلْقِه وَرِضا نَفْسِه وَزِنَةَ عَرْشِه وَمِدادَ كَلِماتِه", en: "How perfect Allah is and I praise Him by the number of His creation and His pleasure, and by the weight of His throne, and the ink of His words." },

      // ── 15 ──
      { ar: "يا حَيُّ يا قَيّومُ بِرَحْمَتِكَ أَسْتَغِيث", en: "O Ever Living, O Self-Subsisting and Supporter of all, by Your mercy I seek assistance." },
      { ar: "أَصْلِحْ لي شَأْنـي كُلَّه، وَلا تَكِلني إِلى نَفْسي طَرْفَةَ عَين", en: "Rectify for me all of my affairs and do not leave me to myself, even for the blink of an eye." },

      // ── 17 ──
      { ar: "أَصْبَحْنا وَأَصْبَحَ المُلكُ للهِ رَبِّ العالَمِين", en: "We have reached the morning and at this very time all sovereignty belongs to Allah, Lord of the worlds." },
      { ar: "اللّهُمَّ إِنِّي أسْأَلُكَ خَيْرَ هذا الـيَوْم فَـتْحَهُ وَنَصْـرَهُ وَنورَهُ وَبَرَكَتَهُ وَهُداهُ", en: "O Allah, I ask You for the good of this day, its triumphs and its victories, its light and its blessings and its guidance." },
      { ar: "وَأَعوذُ بِكَ مِنْ شَرِّ ما فيهِ وَشَرِّ ما بَعْدَه", en: "And I take refuge in You from the evil of this day and the evil that follows it." },
    ],
  },

  /* ───────────────────────────────────────────────
   * أذكار الظهر / منتصف النهار  12:00 – 14:59
   * ─────────────────────────────────────────────── */
  {
    label: { ar: "أذكار الظهر", en: "Midday Athkar" },
    startHour: 12,
    endHour: 14,
    intervalMs: 20000,
    phrases: [
      {
        ar: "سُبْحَانَ اللَّهِ وَالْحَمْدُ لِلَّهِ وَلَا إِلَهَ إِلَّا اللَّهُ وَاللَّهُ أَكْبَرُ",
        en: "Glory be to Allah, praise be to Allah, none has the right to be worshipped but Allah, and Allah is the Greatest.",
      },
      {
        ar: "لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ الْعَلِيِّ الْعَظِيمِ",
        en: "There is no power and no strength except with Allah, the Most High, the Most Great.",
      },
      {
        ar: "اللَّهُمَّ صَلِّ وَسَلِّمْ عَلَى نَبِيِّنَا مُحَمَّدٍ",
        en: "O Allah, send peace and blessings upon our Prophet Muhammad.",
      },
      {
        ar: "اللَّهُمَّ اغْفِرْ لِي وَلِوَالِدَيَّ وَلِلْمُؤْمِنِينَ وَالْمُؤْمِنَاتِ",
        en: "O Allah, forgive me, my parents, and all believing men and women.",
      },
      {
        ar: "رَبِّ اشْرَحْ لِي صَدْرِي وَيَسِّرْ لِي أَمْرِي",
        en: "My Lord, expand my chest and ease my affairs.",
      },
    ],
  },

  /* ───────────────────────────────────────────────
   * أذكار العصر  15:00 – 17:29
   * ─────────────────────────────────────────────── */
  {
    label: { ar: "أذكار العصر", en: "Afternoon Athkar" },
    startHour: 15,
    endHour: 17,
    intervalMs: 20000,
    phrases: [
      {
        ar: "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحَزَنِ، وَأَعُوذُ بِكَ مِنَ الْعَجْزِ وَالْكَسَلِ",
        en: "O Allah, I seek refuge in You from anxiety and sorrow, and I seek refuge in You from incapacity and laziness.",
      },
      {
        ar: "حَسْبِيَ اللَّهُ لَا إِلَهَ إِلَّا هُوَ، عَلَيْهِ تَوَكَّلْتُ وَهُوَ رَبُّ الْعَرْشِ الْعَظِيمِ",
        en: "Allah is sufficient for me; none has the right to be worshipped but Him. Upon Him I rely, and He is the Lord of the Great Throne.",
      },
      {
        ar: "اللَّهُمَّ إِنِّي ظَلَمْتُ نَفْسِي ظُلْمًا كَثِيرًا، وَلَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ",
        en: "O Allah, I have wronged myself greatly, and none forgives sins but You.",
      },
      {
        ar: "فَاغْفِرْ لِي مَغْفِرَةً مِنْ عِنْدِكَ وَارْحَمْنِي، إِنَّكَ أَنْتَ الْغَفُورُ الرَّحِيمُ",
        en: "So forgive me with forgiveness from Yourself and have mercy on me. Indeed, You are the Forgiving, the Merciful.",
      },
      {
        ar: "يَا حَيُّ يَا قَيُّومُ بِرَحْمَتِكَ أَسْتَغِيثُ، أَصْلِحْ لِي شَأْنِي كُلَّهُ",
        en: "O Ever-Living, O Self-Sustaining, by Your mercy I seek help. Rectify all my affairs.",
      },
    ],
  },

  /* ───────────────────────────────────────────────
   * أذكار المساء  17:30 – 21:59
   * ─────────────────────────────────────────────── */
  {
    label: { ar: "أذكار المساء", en: "Evening Athkar" },
    startHour: 16,
    endHour: 21,
    intervalMs: 5000,
    phrases: [
      // ── 1 ──
      { ar: "أَمْسَيْنا وَأَمْسَى المُلْكُ لله وَالحَمدُ لله", en: "We have reached the evening and all sovereignty belongs to Allah, and all praise is for Allah." },
      { ar: "لا إلهَ إلاّ اللّهُ وَحدَهُ لا شَريكَ لهُ، لهُ المُلكُ ولهُ الحَمْد", en: "None has the right to be worshipped except Allah, alone, without partner, to Him belongs all sovereignty and praise." },
      { ar: "وَهُوَ على كلّ شَيءٍ قدير", en: "And He is over all things omnipotent." },
      { ar: "رَبِّ أسْأَلُكَ خَيرَ ما في هذه اللَّيلةِ وَخَيرَ ما بَعْدَها", en: "My Lord, I ask You for the good of this night and the good of what follows it." },
      { ar: "وَأَعوذُ بِكَ مِنْ شَرِّ هذه اللَّيلةِ وَشَرِّ ما بَعْدَها", en: "And I take refuge in You from the evil of this night and the evil of what follows it." },
      { ar: "رَبِّ أَعوذُ بِكَ مِنَ الْكَسَلِ وَسوءِ الْكِبَر", en: "My Lord, I take refuge in You from laziness and senility." },
      { ar: "رَبِّ أَعوذُ بِكَ مِنْ عَذابٍ في النّارِ وَعَذابٍ في القَبْر", en: "My Lord, I take refuge in You from torment in the Fire and punishment in the grave." },

      // ── 2 ──
      { ar: "اللّهُمَّ بِكَ أَمْسَيْنا وَبِكَ أَصْبَحْنا", en: "O Allah, by Your leave we have reached the evening and by Your leave we have reached the morning." },
      { ar: "وَبِكَ نَحْيا وَبِكَ نَمُوتُ وَإِلَيْكَ المَصِير", en: "By Your leave we live and die and unto You is our return." },

      // ── 3 ──
      { ar: "اللّهُمَّ أَنْتَ رَبِّي لا إلهَ إلاّ أَنْتَ", en: "O Allah, You are my Lord, none has the right to be worshipped except You." },
      { ar: "خَلَقْتَنـي وَأَنا عَبْدُك، وَأَنا عَلى عَهْدِكَ وَوَعْدِكَ ما اسْتَطَعْت", en: "You created me and I am Your servant and I abide to Your covenant and promise as best I can." },
      { ar: "أَعوذُ بِكَ مِنْ شَرِّ ما صَنَعْت", en: "I take refuge in You from the evil of which I have committed." },
      { ar: "أَبوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ وَأَبوءُ بِذَنْبي فَاغْفِرْ لي", en: "I acknowledge Your favour upon me and I acknowledge my sin, so forgive me." },
      { ar: "فَإِنَّهُ لا يَغْفِرُ الذُّنوبَ إلاّ أَنْتَ", en: "For verily none can forgive sin except You." },

      // ── 4 ──
      { ar: "اللّهُمَّ إِنِّي أَمْسَيْتُ أُشْهِدُك وَأُشْهِدُ حَمَلَةَ عَرْشِك وَمَلائِكَتِك وَجَمِيعَ خَلْقِك", en: "O Allah, I have reached the evening and call on You, the bearers of Your throne, Your angels, and all of Your creation to witness." },
      { ar: "أَنَّكَ أَنْتَ اللهُ لا إلهَ إلاّ أَنْتَ وَحْدَكَ لا شَريكَ لَك", en: "That You are Allah, none has the right to be worshipped except You, alone, without partner." },
      { ar: "وَأَنَّ مُحَمَّداً عَبْدُكَ وَرَسولُك", en: "And that Muhammad is Your Servant and Messenger." },

      // ── 5 ──
      { ar: "اللّهُمَّ ما أَمْسَى بي مِنْ نِعْمَةٍ أَو بِأَحَدٍ مِنْ خَلْقِك فَمِنْكَ وَحْدَكَ لا شريكَ لَك", en: "O Allah, what blessing I or any of Your creation have reached the evening upon, is from You alone, without partner." },
      { ar: "فَلَكَ الْحَمْدُ وَلَكَ الشُّكْر", en: "So for You is all praise and unto You all thanks." },

      // ── 6 ──
      { ar: "اللّهُمَّ عافِني في بَدَنـي، اللّهُمَّ عافِني في سَمْعي، اللّهُمَّ عافِني في بَصَري", en: "O Allah, grant my body health, O Allah, grant my hearing health, O Allah, grant my sight health." },
      { ar: "لا إلهَ إلاّ أَنْتَ", en: "None has the right to be worshipped except You." },
      { ar: "اللّهُمَّ إِنِّي أَعوذُ بِكَ مِنَ الْكُفر وَالفَقْر", en: "O Allah, I take refuge with You from disbelief and poverty." },
      { ar: "وَأَعوذُ بِكَ مِنْ عَذابِ القَبْر، لا إلهَ إلاّ أَنْتَ", en: "And I take refuge with You from the punishment of the grave. None has the right to be worshipped except You." },

      // ── 7 ──
      { ar: "حَسْبِيَ اللّهُ لا إلهَ إلاّ هُوَ عَلَيهِ تَوَكَّلتُ وَهُوَ رَبُّ العَرْشِ العَظِيم", en: "Allah is Sufficient for me, none has the right to be worshipped except Him, upon Him I rely and He is Lord of the exalted throne." },

      // ── 8 ──
      { ar: "أَعوذُ بِكَلِماتِ اللّهِ التّامّاتِ مِنْ شَرِّ ما خَلَق", en: "I take refuge in Allah's perfect words from the evil He has created." },

      // ── 9 ──
      { ar: "اللّهُمَّ إِنِّي أسْأَلُكَ العَفْوَ وَالعافِيةَ في الدُّنْيا وَالآخِرَة", en: "O Allah, I ask You for pardon and well-being in this life and the next." },
      { ar: "اللّهُمَّ إِنِّي أسْأَلُكَ العَفْوَ وَالعافِيةَ في ديني وَدُنْيايَ وَأهْلي وَمالي", en: "O Allah, I ask You for pardon and well-being in my religious and worldly affairs, and my family and my wealth." },
      { ar: "اللّهُمَّ اسْتُرْ عوْراتي وَآمِنْ رَوْعاتـي", en: "O Allah, veil my weaknesses and set at ease my dismay." },
      { ar: "اللّهُمَّ احْفَظْني مِن بَينِ يَدَيَّ وَمِن خَلْفـي وَعَن يَمـيني وَعَن شِمالي وَمِن فَوْقـي", en: "O Allah, preserve me from the front and from behind and on my right and on my left and from above." },
      { ar: "وَأَعوذُ بِعَظَمَتِكَ أَن أُغْتالَ مِن تَحْتـي", en: "And I take refuge with You lest I be swallowed up by the earth." },

      // ── 10 ──
      { ar: "اللّهُمَّ عالِمَ الغَيْبِ وَالشّهادَةِ فاطِرَ السّماواتِ وَالأرْضِ رَبَّ كلِّ شَيءٍ وَمَليـكَه", en: "O Allah, Knower of the unseen and the seen, Creator of the heavens and the Earth, Lord and Sovereign of all things." },
      { ar: "أَشْهَدُ أَنْ لا إِلهَ إِلاّ أَنْتَ، أَعوذُ بِكَ مِنْ شَرِّ نَفْسـي وَمِنْ شَرِّ الشَّيْطانِ وَشِرْكِه", en: "I bear witness that none has the right to be worshipped except You. I take refuge in You from the evil of my soul and from the evil and shirk of the devil." },
      { ar: "وَأَنْ أَقْتَرِفَ عَلى نَفْسـي سوءاً أَوْ أَجُرَّهُ إِلى مُسْلِم", en: "And from committing wrong against my soul or bringing such upon another Muslim." },

      // ── 11 ──
      { ar: "بِسمِ اللهِ الذي لا يَضُرُّ مَعَ اسمِهِ شَيءٌ في الأرْضِ وَلا في السّماءِ وَهوَ السّمِيعُ العَلِيم", en: "In the name of Allah with whose name nothing is harmed on earth nor in the heavens and He is The All-Hearing, The All-Knowing." },

      // ── 12 ──
      { ar: "رَضِيتُ بِاللهِ رَبّاً وَبِالإسْلامِ ديناً وَبِمُحَمَّدٍ ﷺ نَبِيّاً", en: "I am pleased with Allah as a Lord, and Islam as a religion and Muhammad ﷺ as a Prophet." },

      // ── 13 ──
      { ar: "سُبْحانَ اللهِ وَبِحَمْدِهِ عَدَدَ خَلْقِه وَرِضا نَفْسِه وَزِنَةَ عَرْشِه وَمِدادَ كَلِماتِه", en: "How perfect Allah is and I praise Him by the number of His creation and His pleasure, and by the weight of His throne, and the ink of His words." },

      // ── 15 ──
      { ar: "يا حَيُّ يا قَيّومُ بِرَحْمَتِكَ أَسْتَغِيث", en: "O Ever Living, O Self-Subsisting and Supporter of all, by Your mercy I seek assistance." },
      { ar: "أَصْلِحْ لي شَأْنـي كُلَّه، وَلا تَكِلني إِلى نَفْسي طَرْفَةَ عَين", en: "Rectify for me all of my affairs and do not leave me to myself, even for the blink of an eye." },

      // ── 17 ──
      { ar: "أَمْسَيْنا وَأَمْسَى المُلكُ للهِ رَبِّ العالَمِين", en: "We have reached the evening and at this very time all sovereignty belongs to Allah, Lord of the worlds." },
      { ar: "اللّهُمَّ إِنِّي أسْأَلُكَ خَيْرَ هذه اللَّيلة فَتْحَها وَنَصْرَها وَنورَها وَبَرَكَتَها وَهُداها", en: "O Allah, I ask You for the good of this night, its triumphs and its victories, its light and its blessings and its guidance." },
      { ar: "وَأَعوذُ بِكَ مِنْ شَرِّ ما فيها وَشَرِّ ما بَعْدَها", en: "And I take refuge in You from the evil of this night and the evil that follows it." },
    ],
  },

  /* ───────────────────────────────────────────────
   * أذكار النوم  22:00 – 4:59
   * ─────────────────────────────────────────────── */
  {
    label: { ar: "أذكار النوم", en: "Sleep Athkar" },
    startHour: 22,
    endHour: 4,
    intervalMs: 5000,
    phrases: [
      // ── آية الكرسي ──
      { ar: "اللَّهُ لا إِلَهَ إِلا هُوَ الْحَيُّ الْقَيُّومُ لا تَأْخُذُهُ سِنَةٌ وَلا نَوْمٌ", en: "Allah! There is no god except Him, the Ever-Living, All-Sustaining. Neither drowsiness nor sleep overtakes Him." },
      { ar: "لَهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الأَرْضِ مَنْ ذَا الَّذِي يَشْفَعُ عِنْدَهُ إِلا بِإِذْنِهِ", en: "To Him belongs whatever is in the heavens and whatever is on the earth. Who could possibly intercede with Him without His permission?" },
      { ar: "يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ وَلا يُحِيطُونَ بِشَيْءٍ مِنْ عِلْمِهِ إِلا بِمَا شَاءَ", en: "He fully knows what is ahead of them and what is behind them, but no one can grasp any of His knowledge except what He wills to reveal." },
      { ar: "وَسِعَ كُرْسِيُّهُ السَّمَوَاتِ وَالأَرْضَ وَلا يَؤُودُهُ حِفْظُهُمَا وَهُوَ الْعَلِيُّ الْعَظِيمُ", en: "His Seat encompasses the heavens and the earth, and the preservation of both does not tire Him. For He is the Most High, the Greatest." },

      // ── قل هو الله أحد ──
      { ar: "قُلْ هُوَ اللهُ أَحَدٌ ۞ اللهُ الصَّمَدُ ۞ لَمْ يَلِدْ وَلَمْ يُولَدْ ۞ وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ", en: "Say: He is Allah—One and Indivisible; Allah—the Sustainer needed by all. He has never had offspring, nor was He born. And there is none comparable to Him." },

      // ── سورة الفلق ──
      { ar: "قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ ۞ مِن شَرِّ مَا خَلَقَ ۞ وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ", en: "Say: I seek refuge in the Lord of the daybreak, from the evil of whatever He has created, and from the evil of the night when it grows dark." },
      { ar: "وَمِن شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ ۞ وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ", en: "And from the evil of those witches casting spells by blowing onto knots, and from the evil of an envier when they envy." },

      // ── سورة الناس ──
      { ar: "قُلْ أَعُوذُ بِرَبِّ النَّاسِ ۞ مَلِكِ النَّاسِ ۞ إِلَهِ النَّاسِ", en: "Say: I seek refuge in the Lord of humankind, the Master of humankind, the God of humankind." },
      { ar: "مِن شَرِّ الْوَسْوَاسِ الْخَنَّاسِ ۞ الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ ۞ مِنَ الْجِنَّةِ وَالنَّاسِ", en: "From the evil of the lurking whisperer who whispers into the hearts of humankind, from among jinn and humankind." },

      // ── خواتيم البقرة ──
      { ar: "ءَامَنَ الرَّسُولُ بِمَآ أُنزِلَ إِلَيْهِ مِن رَّبِّهِ وَالْمُؤْمِنُونَ كُلٌّ ءَامَنَ بِاللَّهِ وَمَلَـئِكَتِهِ وَكُتُبِهِ وَرُسُلِهِ", en: "The Messenger firmly believes in what has been revealed to him from his Lord, and so do the believers. They all believe in Allah, His angels, His Books, and His messengers." },
      { ar: "لاَ نُفَرِّقُ بَيْنَ أَحَدٍ مِّن رُّسُلِهِ وَقَالُواْ سَمِعْنَا وَأَطَعْنَا غُفْرَانَكَ رَبَّنَا وَإِلَيْكَ الْمَصِيرُ", en: "We make no distinction between any of His messengers. And they say: We hear and obey. We seek Your forgiveness, our Lord! And to You alone is the final return." },
      { ar: "لاَ يُكَلّفُ اللَّهُ نَفْسًا إِلاَّ وُسْعَهَا لَهَا مَا كَسَبَتْ وَعَلَيْهَا مَا اكْتَسَبَتْ", en: "Allah does not require of any soul more than what it can afford. All good will be for its own benefit, and all evil will be to its own loss." },
      { ar: "رَبَّنَا لاَ تُؤَاخِذْنَآ إِن نَّسِينَآ أَوْ أَخْطَأْنَا رَبَّنَا وَلاَ تَحْمِلْ عَلَيْنَآ إِصْرًا كَمَا حَمَلْتَهُ عَلَى الَّذِينَ مِن قَبْلِنَا", en: "Our Lord! Do not punish us if we forget or make a mistake. Our Lord! Do not place a burden on us like the one You placed on those before us." },
      { ar: "رَبَّنَا وَلاَ تُحَمّلْنَا مَا لاَ طَاقَةَ لَنَا بِهِ وَاعْفُ عَنَّا وَاغْفِرْ لَنَا وَارْحَمْنَآ أَنتَ مَوْلَـنَا فَانْصُرْنَا عَلَى الْقَوْمِ الْكَـفِرِينَ", en: "Our Lord! Do not burden us with what we cannot bear. Pardon us, forgive us, and have mercy on us. You are our only Guardian. So grant us victory over the disbelieving people." },

      // ── بسمك اللهم أموت وأحيا ──
      { ar: "بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا", en: "With Your name, O Allah, I die and I live." },

      // ── باسمك ربي وضعت جنبي ──
      { ar: "بِاسْمِكَ رَبِّي وَضَعْتُ جَنْبِي وَبِكَ أَرْفَعُهُ", en: "In Your Name, my Lord, I lay my side down, and in Your Name I raise it." },
      { ar: "فَإِنْ أَمْسَكْتَ نَفْسِي فَارْحَمْهَا وَإِنْ أَرْسَلْتَهَا فَاحْفَظْهَا بِمَا تَحْفَظُ بِهِ عِبَادَكَ الصَّالِحِينَ", en: "If You take my soul, then have mercy upon it, and if You release it, then protect it with that which You protect Your righteous worshippers." },

      // ── اللهم قني عذابك ──
      { ar: "اللَّهُمَّ قِنِي عَذَابَكَ يَوْمَ تَبْعَثُ عِبَادَكَ", en: "O Allah, guard me against Your punishment on the Day when You resurrect Your slaves." },

      // ── الحمد لله الذي أطعمنا ──
      { ar: "الْحَمْدُ لِلَّهِ الَّذِي أَطْعَمَنَا وَسَقَانَا وَكَفَانَا وَآوَانَا", en: "All praises and thanks is due to Allah, who has fed us, provided us drink, satisfied us and gave us protection." },
      { ar: "فَكَمْ مِمَّنْ لَا كَافِيَ لَهُ وَلَا مُؤْوِيَ", en: "How many are those who have no one to provide for them, or give them shelter." },

      // ── اللهم خلقت نفسي ──
      { ar: "اللَّهُمَّ خَلَقْتَ نَفْسِي وَأَنْتَ تَوَفَّاهَا لَكَ مَمَاتُهَا وَمَحْيَاهَا", en: "O Allah, You have created my soul and it is for You to take it in death. Its death and its life are in Your hand." },
      { ar: "إِنْ أَحْيَيْتَهَا فَاحْفَظْهَا وَإِنْ أَمَتَّهَا فَاغْفِرْ لَهَا ، اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَافِيَةَ", en: "If You cause it to live then protect it and if You cause it to die then forgive it. O Allah, I ask You to keep me safe and sound." },

      // ── اللهم رب السماوات ──
      { ar: "اللَّهُمَّ رَبَّ السَّمَوَاتِ وَرَبَّ الأَرْضِ وَرَبَّ الْعَرْشِ الْعَظِيمِ رَبَّنَا وَرَبَّ كُلِّ شَيْءٍ", en: "O Allah, Lord of the heavens, Lord of the earth and Lord of the mighty Throne, our Lord and Lord of all things." },
      { ar: "فَالِقَ الْحَبِّ وَالنَّوَى وَمُنْزِلَ التَّوْرَاةِ وَالإِنْجِيلِ وَالْفُرْقَانِ", en: "Splitter of the seed and the date stone, Revealer of the Torah, the Gospel and the Quran." },
      { ar: "أَعُوذُ بِكَ مِنْ شَرِّ كُلِّ شَيْءٍ أَنْتَ آخِذٌ بِنَاصِيَتِهِ", en: "I seek refuge in You from the evil of every creature that You seize by the forelock." },
      { ar: "اللَّهُمَّ أَنْتَ الأَوَّلُ فَلَيْسَ قَبْلَكَ شَيْءٌ وَأَنْتَ الآخِرُ فَلَيْسَ بَعْدَكَ شَيْءٌ", en: "O Allah, You are the First and there is nothing before You; You are the Last and there is nothing after You." },
      { ar: "وَأَنْتَ الظَّاهِرُ فَلَيْسَ فَوْقَكَ شَيْءٌ وَأَنْتَ الْبَاطِنُ فَلَيْسَ دُونَكَ شَيْءٌ", en: "You are the Manifest and there is nothing above You; You are the Hidden and there is nothing beyond You." },
      { ar: "اقْضِ عَنَّا الدَّيْنَ وَأَغْنِنَا مِنَ الْفَقْرِ", en: "Settle our debt and spare us from poverty." },

      // ── اللهم أسلمت نفسي ──
      { ar: "اللَّهُمَّ أَسْلَمْتُ نَفْسِي إِلَيْكَ وَوَجَّهْتُ وَجْهِي إِلَيْكَ وَفَوَّضْتُ أَمْرِي إِلَيْكَ وَأَلْجَأْتُ ظَهْرِي إِلَيْكَ", en: "O Allah, I have submitted myself to You, turned my face to You, entrusted my affairs to You and relied completely on You." },
      { ar: "رَغْبَةً وَرَهْبَةً إِلَيْكَ لاَ مَلْجَأَ وَلاَ مَنْجَا مِنْكَ إِلاَّ إِلَيْكَ", en: "Out of desire for and fear of You. There is no resort and no deliverer from hardships except You." },
      { ar: "آمَنْتُ بِكِتَابِكَ الَّذِي أَنْزَلْتَ وَبِنَبِيِّكَ الَّذِي أَرْسَلْتَ", en: "I affirm my faith in Your Book which You have revealed, and in Your Prophet whom You have sent." },

      // ── التسبيح قبل النوم ──
      { ar: "سُبْحَانَ اللّه (٣٣) ، الْحَمْدُ لِلّه (٣٣) ، اللّهُ أَكْبَر (٣٤)", en: "SubhanAllah (33×), Alhamdulillah (33×), Allahu Akbar (34×) — it is better than having a servant." },

      // ── اللهم فاطر السماوات ──
      { ar: "اللَّهُمَّ فَاطِرَ السَّمَاوَاتِ وَالأَرْضِ عَالِمَ الْغَيْبِ وَالشَّهَادَةِ رَبَّ كُلِّ شَيْءٍ وَمَلِيكَهُ", en: "O Allah, Originator of the heavens and the earth, Knower of the unseen and evident, Lord of everything and its Possessor." },
      { ar: "أَشْهَدُ أَنْ لَا إِلَهَ إِلَّا أَنْتَ أَعُوذُ بِكَ مِنْ شَرِّ نَفْسِي وَمِنْ شَرِّ الشَّيْطَانِ وَشِرْكِهِ", en: "I bear witness that there is none worthy of worship but You. I seek refuge in You from the evil of my soul and from the evil of the devil and his plots." },
      { ar: "وَأَنْ أَقْتَرِفَ عَلَى نَفْسِي سُوءًا أَوْ أَجُرَّهُ إِلَى مُسْلِمٍ", en: "And from bringing evil upon my soul or harming any Muslim." },

      // ── اللهم إني أعوذ بوجهك الكريم ──
      { ar: "اللَّهُمَّ إِنِّي أَعُوذُ بِوَجْهِكَ الْكَرِيمِ وَكَلِمَاتِكَ التَّامَّةِ مِنْ شَرِّ مَا أَنْتَ آخِذٌ بِنَاصِيَتِهِ", en: "O Allah, I seek refuge in Your Noble Face and in Your Perfect Words from the evil of that which You seize by its forelock." },
      { ar: "اللَّهُمَّ أَنْتَ تَكْشِفُ الْمَغْرَمَ وَالْمَأْثَمَ اللَّهُمَّ لاَ يُهْزَمُ جُنْدُكَ وَلاَ يُخْلَفُ وَعْدُكَ", en: "O Allah, You are the remover of debt and sin. O Allah, Your armies are not conquered and Your Promise is not broken." },
      { ar: "وَلاَ يَنْفَعُ ذَا الْجَدِّ مِنْكَ الْجَدُّ سُبْحَانَكَ وَبِحَمْدِكَ", en: "And the riches of the rich do not avail against You. Perfection, praises and thanks be unto You." },
    ],
  },
];

/* ═══════════════════════════════════════════════════════════════════════════ */

let _persistedPhraseIdx = 0;
let _persistedSlotLabel = "";

interface TasbihScreenSaverProps {
  onClose: () => void;
}

/** Dark/light-themed tasbih screensaver. Exit via long-press (800ms) or swipe (>150px). */
export function TasbihScreenSaver({ onClose }: TasbihScreenSaverProps) {
  const { theme, darkMode } = useTheme();
  const { t, isRTL } = useLocale();
  const [count, setCount] = useState(0);
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number }>>([]);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showMilestone, setShowMilestone] = useState(false);
  const [selectedDhikrIdx, setSelectedDhikrIdx] = useState(0);
  const [showAzkarPicker, setShowAzkarPicker] = useState(false);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const prayerData = getPrayerStatus(now, theme.location);
  const nextPrayerKey = prayerData.next;
  const nextPrayerTime = formatPrayerTime(prayerData.times.timeForPrayer(nextPrayerKey));
  const nextPrayerNameKey = PRAYER_NAMES[nextPrayerKey];

  const PRAYER_NAME_MAP: Record<string, { en: string; ar: string }> = {
    "prayer.fajr": { en: "Fajr", ar: "الفجر" },
    "prayer.dhuhr": { en: "Dhuhr", ar: "الظهر" },
    "prayer.asr": { en: "Asr", ar: "العصر" },
    "prayer.maghrib": { en: "Maghrib", ar: "المغرب" },
    "prayer.isha": { en: "Isha", ar: "العشاء" },
  };
  const nextPrayerLabel = PRAYER_NAME_MAP[nextPrayerNameKey]?.[isRTL ? "ar" : "en"] ?? "---";

  // Get current time slot based on hour
  const getCurrentSlot = (hour: number): TimeSlot => {
    // Night slot spans midnight: 22–4
    if (hour >= 22 || hour < 5) return TIME_SLOTS[4]; // Night
    if (hour >= 5 && hour < 12) return TIME_SLOTS[0]; // Morning
    if (hour >= 12 && hour < 15) return TIME_SLOTS[1]; // Midday
    if (hour >= 15 && hour < 17) return TIME_SLOTS[2]; // Afternoon (Asr)  
    return TIME_SLOTS[3]; // Evening
  };

  const currentSlot = getCurrentSlot(now.getHours());
  const [phraseIdx, setPhraseIdx] = useState(() => {
    // Safety: Ensure initial index is within bounds of the current slot's phrases
    if (_persistedPhraseIdx >= (currentSlot?.phrases?.length || 0)) return 0;
    return _persistedPhraseIdx;
  });

  // Sync to module-level variable on every change
  useEffect(() => {
    _persistedPhraseIdx = phraseIdx;
  }, [phraseIdx]);

  // Reset ONLY if the time slot itself changed (morning → evening etc.)
  useEffect(() => {
    if (_persistedSlotLabel !== currentSlot.label.ar) {
      _persistedSlotLabel = currentSlot.label.ar;
      setPhraseIdx(0);
      _persistedPhraseIdx = 0;
    }
  }, [currentSlot.label.ar]);

  // Cycle every intervalMs
  useEffect(() => {
    const interval = setInterval(() => {
      setPhraseIdx((prev) => (prev + 1) % currentSlot.phrases.length);
    }, currentSlot.intervalMs);
    return () => clearInterval(interval);
  }, [currentSlot.intervalMs, currentSlot.phrases.length]);

  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const touchStart = useRef<{ x: number; y: number; time: number } | null>(null);

  const currentDhikr = AZKAR[selectedDhikrIdx];

  const [showPhrases, setShowPhrases] = useState(false);
  const phrasesTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const resetPhrasesTimer = useCallback(() => {
    setShowPhrases(false);
    if (phrasesTimerRef.current) clearTimeout(phrasesTimerRef.current);
    phrasesTimerRef.current = setTimeout(() => {
      setShowPhrases(true);
    }, 30000); // 30 seconds
  }, []);

  // Start timer on mount, clear on unmount
  useEffect(() => {
    resetPhrasesTimer();
    return () => {
      if (phrasesTimerRef.current) clearTimeout(phrasesTimerRef.current);
    };
  }, [resetPhrasesTimer]);

  /* ── Palette: dark vs light ── */
  const pal = darkMode
    ? {
      bg: "#0A0A0F",
      surface: "#13131A",
      surfaceElevated: "#1A1A24",
      border: "#252530",
      borderSubtle: "#1E1E28",
      textPrimary: "#E8E8ED",
      textSecondary: "#8888A0",
      textMuted: "#55556A",
      glow: theme.primary,
      glowSubtle: `${theme.primary}18`,
      glowMedium: `${theme.primary}30`,
      glowStrong: `${theme.primary}50`,
      overlayBg: "rgba(0,0,0,0.6)",
      bgImgBrightness: "brightness(0.4)",
      bgImgOpacity: 0.3,
    }
    : {
      bg: "#F0F4F8",
      surface: "rgba(255,255,255,0.88)",
      surfaceElevated: "rgba(255,255,255,0.95)",
      border: "rgba(255,255,255,0.5)",
      borderSubtle: "rgba(255,255,255,0.3)",
      textPrimary: "#1A2B3C",
      textSecondary: "#4A6077",
      textMuted: "#7B93A8",
      glow: theme.primary,
      glowSubtle: `${theme.primary}18`,
      glowMedium: `${theme.primary}30`,
      glowStrong: `${theme.primary}50`,
      overlayBg: "rgba(0,0,0,0.35)",
      bgImgBrightness: "none",
      bgImgOpacity: 1,
    };

  // Increment counter on tap
  const handleTap = (e: React.PointerEvent) => {
    if (showResetConfirm || showAzkarPicker) return;
    resetPhrasesTimer();
    const rect = e.currentTarget.getBoundingClientRect();
    setCount((prev) => prev + 1);
    const id = Date.now();
    setRipples((prev) => [...prev, { id, x: e.clientX - rect.left, y: e.clientY - rect.top }]);
    setTimeout(() => setRipples((prev) => prev.filter((r) => r.id !== id)), 1000);
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if (showResetConfirm || showAzkarPicker) return;
    touchStart.current = { x: e.clientX, y: e.clientY, time: Date.now() };
    longPressTimer.current = setTimeout(() => onClose(), 800);
  };
  const handlePointerUp = () => {
    if (longPressTimer.current) { clearTimeout(longPressTimer.current); longPressTimer.current = null; }
  };
  const handlePointerMove = (e: React.PointerEvent) => {
    if (!touchStart.current) return;
    if (Math.hypot(e.clientX - touchStart.current.x, e.clientY - touchStart.current.y) > 150) onClose();
  };

  const handleReset = () => { setShowResetConfirm(false); setCount(0); };
  const handleSelectDhikr = (idx: number) => {
    resetPhrasesTimer();
    if (idx !== selectedDhikrIdx) { setSelectedDhikrIdx(idx); setCount(0); }
    setShowAzkarPicker(false);
  };

  useEffect(() => () => { if (longPressTimer.current) clearTimeout(longPressTimer.current); }, []);

  // Milestone
  const getMilestoneText = (c: number) => {
    if (c === currentDhikr.target) return isRTL ? `أكملت ${currentDhikr.target} تسبيحة!` : `Completed ${currentDhikr.target} dhikr!`;
    if (c === 33) return t("tasbih.milestone33");
    if (c === 99) return t("tasbih.milestone99");
    if (c === 100) return t("tasbih.milestone100");
    return null;
  };
  const milestoneText = getMilestoneText(count);
  useEffect(() => {
    if (milestoneText) { setShowMilestone(true); const tm = setTimeout(() => setShowMilestone(false), 3000); return () => clearTimeout(tm); }
    setShowMilestone(false);
  }, [milestoneText]);

  // Progress arc
  const R = 155;
  const C = 2 * Math.PI * R;
  const pct = count > 0 ? Math.min(count / currentDhikr.target, 1) : 0;
  const done = count >= currentDhikr.target;

  const amiriFont = "'Amiri', 'Almarai', serif";

  const scrollbarCSS = `
    .tasbih-azkar-scroll::-webkit-scrollbar { width: 4px; }
    .tasbih-azkar-scroll::-webkit-scrollbar-track { background: transparent; margin: 4px 0; }
    .tasbih-azkar-scroll::-webkit-scrollbar-thumb { background: var(--hbs-primary-subtle); border-radius: 100px; }
    .tasbih-azkar-scroll::-webkit-scrollbar-thumb:active { background: var(--hbs-primary); opacity: 0.35; }
    .tasbih-azkar-scroll { scrollbar-width: thin; scrollbar-color: var(--hbs-primary-subtle) transparent; }
  `;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
      className="absolute inset-0 z-[200] flex flex-col items-center overflow-hidden select-none"
      style={{ backgroundColor: pal.bg }}
      onClick={handleTap}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerMove={handlePointerMove}
    >
      <style>{scrollbarCSS}</style>
      {/* ── Background image ── */}
      <ApiImage
        src={islamicBg}
        alt=""
        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        style={{
          opacity: pal.bgImgOpacity,
          filter: pal.bgImgBrightness,
        }}
      />

      {/* Radial glow — only in dark mode */}
      {darkMode && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: `radial-gradient(ellipse at 50% 45%, ${theme.primary}18 0%, transparent 60%)` }}
        />
      )}

      {/* ── Slow-rotating geometric accents ── */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 180, repeat: Infinity, ease: "linear" }}
        className="absolute pointer-events-none"
        style={{ top: "8%", right: "6%", opacity: darkMode ? 0.06 : 0.1 }}
      >
        <svg width="240" height="240" viewBox="0 0 240 240">
          <circle cx="120" cy="120" r="100" fill="none" stroke={pal.glow} strokeWidth="0.5" />
          <circle cx="120" cy="120" r="75" fill="none" stroke={pal.glow} strokeWidth="0.5" />
          <circle cx="120" cy="120" r="50" fill="none" stroke={pal.glow} strokeWidth="0.5" />
          {[0, 45, 90, 135].map((d) => (
            <line key={d} x1="120" y1="20" x2="120" y2="220" stroke={pal.glow} strokeWidth="0.5" transform={`rotate(${d} 120 120)`} />
          ))}
        </svg>
      </motion.div>
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: 150, repeat: Infinity, ease: "linear" }}
        className="absolute pointer-events-none"
        style={{ bottom: "12%", left: "5%", opacity: darkMode ? 0.05 : 0.08 }}
      >
        <svg width="200" height="200" viewBox="0 0 200 200">
          <polygon points="100,10 190,100 100,190 10,100" fill="none" stroke={pal.glow} strokeWidth="0.5" />
          <polygon points="100,35 165,100 100,165 35,100" fill="none" stroke={pal.glow} strokeWidth="0.5" />
          <polygon points="100,60 140,100 100,140 60,100" fill="none" stroke={pal.glow} strokeWidth="0.5" />
        </svg>
      </motion.div>

      {/* ═══════════════════════════════════════════════════════════════════
       * MAIN CENTERED COLUMN: Title → Azkar → Counter → Actions
       * ═══════════════════════════════════════════════════════════════════ */}
      <div className="relative z-10 flex flex-col items-center flex-1 w-full" style={{ maxWidth: "640px", padding: "64px 24px 0 24px" }}>

        {/* ── Top Info: Clock + Date + Next Prayer ── */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="shrink-0 flex flex-col items-center gap-1"
        >
          {/* Live clock */}
          <p style={{
            fontFamily: theme.fontFamily,
            fontSize: "52px",
            fontWeight: WEIGHT.bold,
            color: "#FFFFFF",
            lineHeight: 1,
            margin: 0,
            letterSpacing: "-1px",
            fontVariantNumeric: "tabular-nums",
          }}>
            {`${now.getHours() % 12 || 12}:${String(now.getMinutes()).padStart(2, "0")} ${now.getHours() >= 12 ? (isRTL ? "م" : "PM") : (isRTL ? "ص" : "AM")}`}
          </p>
          {/* Miladi date */}
          <p style={{
            fontFamily: theme.fontFamily,
            fontSize: TYPE_SCALE.base,
            fontWeight: WEIGHT.normal,
            color: "rgba(255,255,255,0.65)",
            margin: 0,
          }}>
            {now.toLocaleDateString(isRTL ? "ar-SA" : "en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </p>
          {/* Hijri date */}
          <p style={{
            fontFamily: theme.fontFamily,
            fontSize: TYPE_SCALE.sm,
            fontWeight: WEIGHT.normal,
            color: "rgba(255,255,255,0.5)",
            margin: 0,
            marginTop: "2px",
            direction: "rtl",
          }}>
            {new Intl.DateTimeFormat("ar-SA-u-ca-islamic", {

              day: "numeric",
              month: "long",
              year: "numeric",
            }).format(now)}
          </p>
          {/* Digital Tasbih Pill */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginTop: "8px",
            backgroundColor: "rgba(255,255,255,0.15)",
            border: "1px solid rgba(255,255,255,0.3)",
            borderRadius: "20px",
            padding: "6px 20px",
          }}>
            <span style={{
              fontFamily: theme.fontFamily,
              fontSize: TYPE_SCALE.sm,
              fontWeight: WEIGHT.bold,
              color: "#FFFFFF",
              letterSpacing: "0.5px",
            }}>
              {isRTL ? "التسبيح الرقمي" : "Digital Tasbih"}
            </span>
          </div>
        </motion.div>

        {/* ── Azkar Card (always above counter, never overlaps) ── */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="w-full shrink-0"
          style={{ marginTop: "16px" }}
          onClick={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
          onPointerUp={(e) => e.stopPropagation()}
          onPointerMove={(e) => e.stopPropagation()}
        >
          <div
            style={{
              borderRadius: "16px",
              backgroundColor: pal.surface,
              border: `1px solid ${pal.glowMedium}`,
              backdropFilter: "blur(16px)",
              overflow: "hidden",
            }}
          >
            {/* Current dhikr button */}
            <button
              onClick={(e) => { e.stopPropagation(); setShowAzkarPicker((v) => !v); }}
              className="w-full flex items-center gap-4 cursor-pointer active:scale-[0.99] transition-transform"
              style={{ padding: "14px 20px", border: "none", background: "transparent", outline: "none", textAlign: "center" }}
            >
              <div className="flex-1 min-w-0">
                <p
                  dir="rtl"
                  style={{
                    fontFamily: amiriFont,
                    fontSize: "26px",
                    fontWeight: 700,
                    color: pal.textPrimary,
                    lineHeight: "42px",
                    margin: 0,
                    textAlign: "center",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                  }}
                >
                  {currentDhikr.ar}
                </p>
                {!isRTL && (
                  <p style={{ fontFamily: theme.fontFamily, fontSize: TYPE_SCALE.sm, fontWeight: WEIGHT.normal, color: pal.textMuted, margin: "2px 0 0", lineHeight: "18px", textAlign: "center" }}>
                    {currentDhikr.en}
                  </p>
                )}
              </div>
              <div className="shrink-0 flex items-center gap-2">
                <span
                  style={{
                    fontFamily: theme.fontFamily, fontSize: TYPE_SCALE.sm, fontWeight: WEIGHT.bold,
                    color: pal.glow, padding: "4px 10px", borderRadius: "8px", backgroundColor: pal.glowSubtle,
                  }}
                >
                  {currentDhikr.target}x
                </span>
                {showAzkarPicker ? <ChevronUp size={20} color={pal.textSecondary} /> : <ChevronDown size={20} color={pal.textSecondary} />}
              </div>
            </button>

            {/* Dropdown picker — pushes content down, no overlap */}
            <AnimatePresence>
              {showAzkarPicker && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <div
                    style={{ borderTop: `1px solid ${pal.border}`, borderRight: "none", borderBottom: "none", borderLeft: "none", padding: "8px", maxHeight: "280px", overflowY: "auto" }}
                    className="flex flex-col gap-1 tasbih-azkar-scroll"
                  >
                    {AZKAR.map((dhikr, idx) => {
                      const sel = idx === selectedDhikrIdx;
                      return (
                        <button
                          key={dhikr.id}
                          onClick={(e) => { e.stopPropagation(); handleSelectDhikr(idx); }}
                          className="w-full flex items-center gap-3 cursor-pointer active:scale-[0.98] transition-transform"
                          style={{
                            padding: "10px 14px", border: "none", borderRadius: "12px",
                            backgroundColor: sel ? pal.glowSubtle : "transparent",
                            outline: "none", textAlign: isRTL ? "right" : "left",
                          }}
                        >
                          <div
                            className="shrink-0 flex items-center justify-center"
                            style={{
                              width: "26px", height: "26px", borderRadius: "50%",
                              border: sel ? `2px solid ${pal.glow}` : `2px solid ${pal.border}`,
                              backgroundColor: sel ? pal.glow : "transparent",
                            }}
                          >
                            {sel && (
                              <svg width="12" height="12" viewBox="0 0 14 14">
                                <path d="M3 7l3 3 5-5" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            )}
                          </div>
                          <p
                            dir="rtl"
                            className="flex-1 min-w-0"
                            style={{
                              fontFamily: amiriFont, fontSize: "17px",
                              fontWeight: sel ? WEIGHT.semibold : WEIGHT.normal,
                              color: sel ? pal.textPrimary : pal.textSecondary,
                              lineHeight: "28px", margin: 0,
                              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                            }}
                          >
                            {dhikr.ar}
                          </p>
                          <span
                            className="shrink-0"
                            style={{
                              fontFamily: theme.fontFamily, fontSize: "12px", fontWeight: WEIGHT.bold,
                              color: sel ? pal.glow : pal.textMuted,
                              padding: "2px 8px", borderRadius: "6px",
                              backgroundColor: sel ? `${pal.glow}15` : `${pal.textMuted}15`,
                            }}
                          >
                            {dhikr.target}x
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Spacer to reserve space where the orb sits visually */}
        <div className="flex-1" style={{ minHeight: "320px" }} />

        {/* ── Counter Orb (always dead-center, independent of layout) ── */}
        <div
          className="pointer-events-none"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1,
          }}
        >
          <div className="pointer-events-auto">
            <motion.div className="relative flex items-center justify-center">
              {/* Ambient glow */}
              <div
                className="absolute pointer-events-none"
                style={{ width: "500px", height: "500px", borderRadius: "50%", background: `radial-gradient(circle, ${theme.primary}08 0%, transparent 70%)` }}
              />
              {/* Outer decorative ring */}
              <motion.div
                animate={{ rotate: count * 3.6 }}
                transition={{ type: "spring", stiffness: 40, damping: 20 }}
                className="absolute"
                style={{ width: "380px", height: "380px", borderRadius: "50%", border: `1px solid ${pal.borderSubtle}` }}
              >
                {[0, 118.8, 237.6, 356.4].map((deg, i) => (
                  <div key={i} className="absolute" style={{
                    width: "3px", height: "10px", backgroundColor: pal.glowMedium, borderRadius: "2px",
                    top: "-5px", left: "50%", transform: `translateX(-50%) rotate(${deg}deg)`, transformOrigin: "50% 190px",
                  }} />
                ))}
              </motion.div>
              {/* Progress arc */}
              <svg className="absolute pointer-events-none" width="340" height="340" viewBox="0 0 340 340" style={{ transform: "rotate(-90deg)" }}>
                <circle cx="170" cy="170" r={R} fill="none" stroke={pal.border} strokeWidth="3" />
                {count > 0 && (
                  <motion.circle
                    cx="170" cy="170" r={R} fill="none"
                    stroke={pal.glow} strokeWidth="3" strokeLinecap="round"
                    strokeDasharray={C}
                    initial={{ strokeDashoffset: C }}
                    animate={{ strokeDashoffset: C * (1 - pct) }}
                    transition={{ type: "spring", stiffness: 60, damping: 20 }}
                    style={{ filter: `drop-shadow(0 0 6px ${pal.glowStrong})` }}
                  />
                )}
              </svg>
              {/* Inner counter */}
              <motion.div
                whileTap={{ scale: 0.96 }}
                animate={{
                  scale: count === 0 ? [1, 1.04, 1] : 1,
                }}
                transition={count === 0 ? { duration: 2, repeat: Infinity, ease: "easeInOut" } : undefined}
                className="relative flex flex-col items-center justify-center"
                style={{
                  width: "260px", height: "260px", borderRadius: "50%",
                  backgroundColor: pal.surface, border: `1px solid ${pal.border}`,
                  backdropFilter: "blur(12px)",
                  boxShadow: darkMode
                    ? `0 0 40px ${theme.primary}08, inset 0 1px 0 ${pal.surfaceElevated}, inset 0 -1px 0 ${pal.bg}`
                    : `0 8px 40px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.9)`,
                }}
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={count}
                    initial={{ scale: 1.2, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.85, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="flex flex-col items-center"
                  >
                    <span style={{
                      fontFamily: theme.fontFamily, fontSize: "88px", fontWeight: WEIGHT.bold,
                      color: pal.textPrimary, lineHeight: 1,
                      filter: count > 0 ? `drop-shadow(0 0 20px ${theme.primary}30)` : "none",
                    }}>
                      {count}
                    </span>
                  </motion.div>
                </AnimatePresence>
                <p style={{
                  fontFamily: theme.fontFamily, fontSize: TYPE_SCALE.md, fontWeight: WEIGHT.medium,
                  color: pal.textMuted, margin: 0, marginTop: "4px", letterSpacing: "1px",
                }}>
                  / {currentDhikr.target}
                </p>
              </motion.div>
              {/* Ripples */}
              <AnimatePresence>
                {ripples.map((r) => (
                  <motion.div
                    key={r.id}
                    initial={{ scale: 0, opacity: 0.5 }}
                    animate={{ scale: 2.5, opacity: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.9, ease: "easeOut" }}
                    className="absolute pointer-events-none"
                    style={{
                      left: r.x, top: r.y, width: "80px", height: "80px", borderRadius: "50%",
                      border: `2px solid ${pal.glow}`, transform: "translate(-50%, -50%)",
                      filter: `drop-shadow(0 0 4px ${pal.glowMedium})`,
                    }}
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          </div>
        </div>

        {/* ── Milestone ── */}
        <AnimatePresence>
          {showMilestone && milestoneText && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 18 }}
              className="shrink-0 flex items-center gap-3 px-8 py-4 mb-4"
              style={{
                backgroundColor: pal.surfaceElevated, borderRadius: theme.radiusLg,
                border: `1px solid ${pal.glowMedium}`,
                boxShadow: `0 8px 32px rgba(0,0,0,0.3), 0 0 20px ${theme.primary}15`,
                backdropFilter: "blur(12px)",
              }}
            >
              <span style={{ fontFamily: theme.fontFamily, fontSize: TYPE_SCALE.lg, fontWeight: WEIGHT.semibold, color: pal.glow }}>
                {milestoneText}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Time-based Athkar ── */}
        <AnimatePresence>
          {showPhrases && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2, ease: "easeInOut" }}
              className="w-full flex justify-center"
            >
              <div
                className="shrink-0 flex flex-col items-center justify-center"
                style={{ minHeight: "110px", marginBottom: "8px", width: "100%", maxWidth: "600px" }}
              >
                {/* Slot label — e.g. "أذكار الصباح" */}
                <p style={{
                  fontFamily: "'Amiri', 'Almarai', serif",
                  fontSize: TYPE_SCALE.sm,
                  fontWeight: WEIGHT.semibold,
                  color: pal.glow,
                  margin: 0,
                  marginBottom: "8px",
                  letterSpacing: "1px",
                }}>
                  {isRTL ? currentSlot?.label?.ar : currentSlot?.label?.en}
                </p>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={phraseIdx}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: currentSlot.intervalMs <= 5000 ? 0.4 : 0.8, ease: "easeInOut" }}
                    className="flex flex-col items-center gap-1 text-center px-4"
                  >
                    <p
                      dir="rtl"
                      style={{
                        fontFamily: "'Amiri', 'Almarai', serif",
                        fontSize: "30px",
                        fontWeight: 600,
                        color: "rgba(255,255,255,0.92)",
                        margin: 0,
                        lineHeight: "46px",
                      }}
                    >
                      {currentSlot?.phrases[phraseIdx]?.ar || ""}
                    </p>
                    <p style={{
                      fontFamily: theme.fontFamily,
                      fontSize: TYPE_SCALE.base,
                      fontWeight: WEIGHT.normal,
                      color: "rgba(255,255,255,0.6)",
                      margin: 0,
                      fontStyle: "italic",
                    }}>
                      {currentSlot?.phrases[phraseIdx]?.en || ""}
                    </p>
                  </motion.div>
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Bottom: Reset + Hint ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="shrink-0 flex flex-col items-center gap-4"
          style={{ paddingBottom: "48px" }}
        >
          <AnimatePresence>
            {count > 0 && (
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
                onClick={(e) => { e.stopPropagation(); setShowResetConfirm(true); }}
                className="flex items-center gap-2 cursor-pointer active:scale-[0.96] transition-transform"
                style={{
                  height: "56px", paddingLeft: "28px", paddingRight: "28px",
                  backgroundColor: "#FFFFFF", borderRadius: theme.radiusLg,
                  border: "none", fontFamily: theme.fontFamily, fontSize: TYPE_SCALE.lg,
                  fontWeight: WEIGHT.semibold, color: theme.primary, outline: "none",
                  boxShadow: `0 4px 16px rgba(0,0,0,0.15)`,
                }}
              >
                <RotateCcw size={22} strokeWidth={2} color={theme.primary} />
                {t("tasbih.reset")}
              </motion.button>
            )}
          </AnimatePresence>
          <p style={{
            fontFamily: theme.fontFamily, fontSize: "24px", fontWeight: WEIGHT.medium,
            color: "rgba(255,255,255,0.7)", margin: 0, textAlign: "center",
          }}>
            {t("tasbih.exitHint")}
          </p>
        </motion.div>
      </div>

      <ConfirmDialog
        visible={showResetConfirm}
        title={t("tasbih.resetConfirmTitle")}
        message={t("tasbih.resetConfirmBody")}
        confirmLabel={t("tasbih.resetConfirm")}
        onConfirm={handleReset}
        onCancel={() => setShowResetConfirm(false)}
      />
    </motion.div>
  );
}
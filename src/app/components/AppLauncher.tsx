import { useState } from "react";
import {
  ArrowLeft,
  Play,
  BookOpen,
  Share2,
  Gamepad2,
  Video,
  Globe,
  Wrench,
  BookOpenText,
  FileText,
  PlayCircle,
  Hash,
  Download,
  Info,
} from "lucide-react";
import { useTheme } from "./ThemeContext";
import { useLocale } from "./i18n";
import { useRipple } from "./useRipple";
import { InternalPageHeader } from "./InternalPageHeader";
import { PdfReaderModal } from "./PdfReaderModal";
import chromeIcon from "../../assets/272d9a4c809b16af18cfbe153fa4edc5816536b3.png";
import saudiGazetteLogo from "../../assets/5a0099c6364ba06a603226f636904e61c8e17c07.png";
import iptvIcon from "../../assets/e66dff686b2ee163965b5d28c8ab0d919a5e5307.png";
import mbcIcon from "../../assets/c22249e2a0a3b6e2cac9fa73410c844f9f2ec1b4.png";
import primeVideoIcon from "../../assets/c217a833e98f558d1368435c8c539345a42deab7.png";
import netflixIcon from "../../assets/d894e26ef6abdd4628417d2b8281a2fa7079fafc.png";
import youtubeIcon from "../../assets/910e8eb5a121f2bbb217c5d1ed740eeb1ce01ca5.png";
import tiktokIcon from "../../assets/aa4f4e114ebe8e16ecf4b9d410598ba1e0a6fa1d.png";
import snapchatIcon from "../../assets/c9af1b56faf040fa2dbba51c03e93969c87a108d.png";
import facebookIcon from "../../assets/f10a380bb7655da2acb500aa31fc61aac96e9fce.png";
import whatsappIcon from "../../assets/7583d2073e01dcd488456b25bc53248baf8547e8.png";
import instagramIcon from "../../assets/1c2cbfafda976606c6fd3b030d9cafef43d07231.png";
import chessIcon from "../../assets/e842d274df3c9994f31a5245916214a9d7bc72da.png";
import candyCrushIcon from "../../assets/0a01385242fd43a92d43edec03bb3de4a4552b30.png";
import angryBirdsIcon from "../../assets/f7026db1efe4c228ccbdaf12908efedf4f988275.png";
import sonicDashIcon from "../../assets/6e7f22c2975760cd651074aadd9a19d7ffdcb36f.png";
import subwaySurfersIcon from "../../assets/43c1260f8ca21114c22139de67424c286d7c4135.png";
import sudokuIcon from "../../assets/312c1847bc594650fbe0506051af178e543edc49.png";
import teamsIcon from "../../assets/1ac7892907f2161179b2b2d788a241b1b3d30e2c.png";
import webexIcon from "../../assets/03dce872d8615b21848e1740340ee99e8e5bc9cb.png";
import skypeIcon from "../../assets/5ad00d42b296a682caa3df83f3f93486ef273539.png";
import zoomIcon from "../../assets/12632c3f9bb8c4baff556d00098b0a9ee6fcca9e.png";
import meetIcon from "../../assets/9203106d98b7787c9ddb7620fde397d13b7d3929.png";
import calculatorIcon from "../../assets/8d73fe9115f68197e837995a5535d0a5fb689492.png";
import translatorIcon from "../../assets/0ffb58a0f7bbdbc1f2367e04b7accc575718f6d4.png";
import mirrorIcon from "../../assets/2ff193a53a2123c565b49a392e2b4e27a9e822b6.png";
import cardTalkIcon from "../../assets/b944498d81e395966a92e71f6b86456f7e5fd079.png";
import alarmIcon from "../../assets/81d24475da6251f85e5b128b51774b1407fffbfd.png";
import chatgptIcon from "../../assets/785f579adee0f9c706b04310062e9e54f8072f4c.png";
import okazIcon from "../../assets/20e37f191525e59a0838912f6c96e7f68bacc510.png";
import quranBookIcon from "../../assets/5303963df7d14bbca33ccffa43f982a464344809.png";
import hadeethIcon from "../../assets/302f90f5f89039ae9d4a848ddc927a305177dab3.png";
import rukyaIcon from "../../assets/33c7eb6cff8cb073385aca25c64b118a0d631e9d.png";
import laTahzanIcon from "../../assets/d02bcddd68e867c29b228517ee3d625a69373dda.png";
import janeEyreIcon from "../../assets/bc7024280eee30d0d9c7a8e1f5f9828be0781d11.png";
import harryPotterIcon from "../../assets/c502247a276d2cebaac1f14a6f97e58877c0aaa2.png";
import theSecretIcon from "../../assets/0020d69d075db3cf35e4a115636a15027a1101fe.png";

// PDF Assets are now served from the public/pdfs/ directory

interface AppItem {
  id: string;
  name: string;
  nameKey?: string;
  /** CSS background (can be gradient) */
  bg: string;
  /** The mark/letter rendered */
  mark: string;
  textColor: string;
  markSize?: number;
  markWeight?: number;
  /** Optional font-family override */
  markFont?: string;
  /** Render a custom SVG-like element instead of text */
  customRender?: () => React.ReactNode;
  isInteractive?: boolean;
  url?: string;
  pdfSource?: string;
}

interface CategoryConfig {
  label: string;
  labelKey: string;
  icon: React.ComponentType<any>;
  apps: AppItem[];
}

/* ── App data with accurate branding ────────────────────────── */

function getCategories(theme: any, locale: string = "en"): Record<string, CategoryConfig> {
  return {
    Media: {
      label: "Media",
      labelKey: "launcher.media",
      icon: Play,
      apps: [
        {
          id: "iptv",
          name: locale === "ar" ? "البث المباشر" : "Live TV",
          bg: "#fff",
          mark: "",
          textColor: "#333",
          customRender: () => (
            <img src={iptvIcon} alt="Live TV" style={{ width: 150, height: 150, objectFit: "cover" }} />
          ),
        },
        {
          id: "youtube",
          name: locale === "ar" ? "يوتيوب" : "YouTube",
          bg: "#fff",
          mark: "",
          textColor: "#fff",
          url: "https://www.youtube.com/",
          customRender: () => (
            <img src={youtubeIcon} alt="YouTube" style={{ width: 150, height: 150, objectFit: "cover" }} />
          ),
        },
        {
          id: "netflix",
          name: locale === "ar" ? "نتفليكس" : "Netflix",
          bg: "#000",
          mark: "",
          textColor: "#E50914",
          url: "https://www.netflix.com/",
          customRender: () => (
            <img src={netflixIcon} alt="Netflix" style={{ width: 150, height: 150, objectFit: "cover" }} />
          ),
        },
        {
          id: "primevideo",
          name: locale === "ar" ? "برايم فيديو" : "Prime Video",
          bg: "#fff",
          mark: "",
          textColor: "#333",
          url: "https://www.primevideo.com/",
          customRender: () => (
            <img src={primeVideoIcon} alt="Prime Video" style={{ width: 150, height: 150, objectFit: "cover" }} />
          ),
        },
        {
          id: "mbc",
          name: locale === "ar" ? "شاهد" : "Shahid",
          bg: "#fff",
          mark: "",
          textColor: "#333",
          url: "https://shahid.mbc.net/ar",
          customRender: () => (
            <img src={mbcIcon} alt="Shahid" style={{ width: 150, height: 150, objectFit: "cover" }} />
          ),
        },
        {
          id: "thamanyah",
          name: locale === "ar" ? "ثمانية" : "Thmanyah",
          bg: "#000",
          mark: "",
          textColor: "#fff",
          url: "https://app.thmanyah.com/",
          customRender: () => (
            <div className="flex items-center justify-center w-full h-full bg-black">
              <svg width="80" height="80" viewBox="0 0 100 100" fill="white">
                <path d="M50 20 L20 65 A 15 15 0 0 0 45 80 L50 60 L55 80 A 15 15 0 0 0 80 65 Z" />
              </svg>
            </div>
          ),
        },
      ],
    },
    Reading: {
      label: "Reading",
      labelKey: "launcher.reading",
      icon: BookOpen,
      apps: [
        {
          id: "because-you-are-allah",
          name: locale === "ar" ? "لأنك الله (عربي)" : "Because You Are Allah (AR)",
          bg: "#fff",
          mark: "لأنك الله",
          textColor: "#333",
          pdfSource: "/pdfs/because-you-are-allah.pdf",
          customRender: () => (
            <div className="flex flex-col items-center justify-center p-4 bg-teal-600 rounded-xl w-full h-full text-white">
              <BookOpen size={48} strokeWidth={1.5} />
              <span className="font-bold text-xs mt-2 text-center text-white break-words w-full">لأنك الله</span>
            </div>
          ),
        },
        {
          id: "en-because-you-are-allah",
          name: locale === "ar" ? "لأنك الله (إنجليزي)" : "Because You Are Allah (EN)",
          bg: "#fff",
          mark: "BYAA",
          textColor: "#333",
          pdfSource: "/pdfs/en-because-you-are-allah.pdf",
          customRender: () => (
            <div className="flex flex-col items-center justify-center p-4 bg-teal-800 rounded-xl w-full h-full text-white">
              <BookOpen size={48} strokeWidth={1.5} />
              <span className="font-bold text-xs mt-2 text-center text-white break-words w-full">Because You Are Allah</span>
            </div>
          ),
        },
        {
          id: "dont-be-sad",
          name: locale === "ar" ? "لا تحزن (عربي)" : "Don't Be Sad (AR)",
          bg: "#fff",
          mark: "لا تحزن",
          textColor: "#333",
          pdfSource: "/pdfs/Dont_BE_SAD.pdf",
          customRender: () => (
            <div className="flex flex-col items-center justify-center p-4 bg-amber-600 rounded-xl w-full h-full text-white">
              <Info size={48} strokeWidth={1.5} />
              <span className="font-bold text-xs mt-2 text-center text-white break-words w-full">لا تحزن</span>
            </div>
          ),
        },
        {
          id: "the-subtle-art",
          name: locale === "ar" ? "فن اللامبالاة (إنجليزي)" : "Subtle Art (EN)",
          bg: "#fff",
          mark: "SA",
          textColor: "#333",
          pdfSource: "/pdfs/the-subtle-art.pdf",
          customRender: () => (
            <div className="flex flex-col items-center justify-center p-4 bg-gray-800 rounded-xl w-full h-full text-white">
              <Hash size={48} strokeWidth={1.5} />
              <span className="font-bold text-xs mt-2 text-center text-white break-words w-full">The Subtle Art</span>
            </div>
          ),
        },
        {
          id: "why-we-sleep",
          name: locale === "ar" ? "لماذا ننام (إنجليزي)" : "Why We Sleep (EN)",
          bg: "#fff",
          mark: "WWS",
          textColor: "#333",
          pdfSource: "/pdfs/why-we-sleep.pdf",
          customRender: () => (
            <div className="flex flex-col items-center justify-center p-4 bg-indigo-900 rounded-xl w-full h-full text-white">
              <PlayCircle size={48} strokeWidth={1.5} />
              <span className="font-bold text-xs mt-2 text-center text-white break-words w-full">Why We Sleep</span>
            </div>
          ),
        },
        {
          id: "amal-kubra",
          name: locale === "ar" ? "الأعمال الكبرى (عربي)" : "Amal Kubra (AR)",
          bg: "#fff",
          mark: "الأعمال الكبرى",
          textColor: "#333",
          pdfSource: "/pdfs/amal-kubra.pdf",
          customRender: () => (
            <div className="flex flex-col items-center justify-center p-4 bg-emerald-700 rounded-xl w-full h-full text-white">
              <BookOpen size={48} strokeWidth={1.5} />
              <span className="font-bold text-xs mt-2 text-center text-white break-words w-full">الأعمال الكبرى</span>
            </div>
          ),
        },
        {
          id: "fan-all-la-mubalah",
          name: locale === "ar" ? "فن اللامبالاة (عربي)" : "فن اللامبالاة (AR)",
          bg: "#fff",
          mark: "فن اللامبالاة",
          textColor: "#333",
          pdfSource: "/pdfs/fan-all-la-mubalah.pdf",
          customRender: () => (
            <div className="flex flex-col items-center justify-center p-4 bg-purple-700 rounded-xl w-full h-full text-white">
              <BookOpenText size={48} strokeWidth={1.5} />
              <span className="font-bold text-xs mt-2 text-center text-white break-words w-full">فن اللامبالاة</span>
            </div>
          ),
        },
        {
          id: "great-expectations",
          name: locale === "ar" ? "آمال كبرى (إنجليزي)" : "Great Expectations (EN)",
          bg: "#fff",
          mark: "GE",
          textColor: "#333",
          pdfSource: "/pdfs/great-expectations.pdf",
          customRender: () => (
            <div className="flex flex-col items-center justify-center p-4 bg-blue-800 rounded-xl w-full h-full text-white">
              <BookOpen size={48} strokeWidth={1.5} />
              <span className="font-bold text-xs mt-2 text-center text-white break-words w-full">Great Expectations</span>
            </div>
          ),
        },
        {
          id: "la-tahzan-pdf",
          name: locale === "ar" ? "دليل لا تحزن (عربي)" : "La Tahzan Guide (AR)",
          bg: "#fff",
          mark: "دليل لا تحزن",
          textColor: "#333",
          pdfSource: "/pdfs/la-tahzan.pdf",
          customRender: () => (
            <div className="flex flex-col items-center justify-center p-4 bg-yellow-700 rounded-xl w-full h-full text-white">
              <BookOpenText size={48} strokeWidth={1.5} />
              <span className="font-bold text-xs mt-2 text-center text-white break-words w-full">دليل لا تحزن</span>
            </div>
          ),
        },
        {
          id: "quran-app",
          name: locale === "ar" ? "القرآن الكريم" : "Quran Explorer",
          bg: "#fff",
          mark: "القرآن",
          textColor: "#333",
          url: "https://app.quranflash.com/book/Medina1?ar#/reader/chapter/3",
          customRender: () => (
            <img src={quranBookIcon} alt="Quran" style={{ width: 150, height: 150, objectFit: "cover" }} />
          ),
        },
      ],
    },
    Social: {
      label: "Social",
      labelKey: "launcher.social",
      icon: Share2,
      apps: [
        {
          id: "whatsapp",
          name: locale === "ar" ? "واتس آب" : "WhatsApp",
          bg: "#25D366",
          mark: "",
          textColor: "#fff",
          url: "https://web.whatsapp.com/",
          customRender: () => (
            <img src={whatsappIcon} alt="WhatsApp" style={{ width: 150, height: 150, objectFit: "cover" }} />
          ),
        },
        {
          id: "facebook",
          name: locale === "ar" ? "فيسبوك" : "Facebook",
          bg: "#fff",
          mark: "",
          textColor: "#333",
          url: "https://www.facebook.com/",
          customRender: () => (
            <img src={facebookIcon} alt="Facebook" style={{ width: 150, height: 150, objectFit: "cover" }} />
          ),
        },
        {
          id: "instagram",
          name: locale === "ar" ? "إنستغرام" : "Instagram",
          bg: "radial-gradient(circle at 30% 107%, #fdf497 0%, #fdf497 5%, #fd5949 45%, #d6249f 60%, #285AEB 90%)",
          mark: "",
          textColor: "#fff",
          url: "https://www.instagram.com/",
          customRender: () => (
            <img src={instagramIcon} alt="Instagram" style={{ width: 150, height: 150, objectFit: "cover" }} />
          ),
        },
        {
          id: "x",
          name: locale === "ar" ? "إكس (تويتر)" : "X",
          bg: "#000000",
          mark: "𝕏",
          textColor: "#ffffff",
          url: "https://x.com/",
          markSize: 56,
          markWeight: 400,
        },
        {
          id: "snapchat",
          name: locale === "ar" ? "سناب شات" : "Snapchat",
          bg: "#fff",
          mark: "",
          textColor: "#333",
          url: "https://www.snapchat.com/",
          customRender: () => (
            <img src={snapchatIcon} alt="Snapchat" style={{ width: 150, height: 150, objectFit: "cover" }} />
          ),
        },
        {
          id: "tiktok",
          name: locale === "ar" ? "تيك توك" : "TikTok",
          bg: "#fff",
          mark: "",
          textColor: "#333",
          url: "https://www.tiktok.com/",
          customRender: () => (
            <img src={tiktokIcon} alt="TikTok" style={{ width: 150, height: 150, objectFit: "cover" }} />
          ),
        },
      ],
    },
    Games: {
      label: "Games",
      labelKey: "launcher.games",
      icon: Gamepad2,
      apps: [
        {
          id: "memory",
          name: locale === "ar" ? "لعبة الذاكرة" : "Memory Match",
          bg: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          mark: "",
          textColor: "#fff",
          customRender: () => (
            <div className="relative flex items-center justify-center gap-3" style={{ width: 150, height: 150 }}>
              {/* Two cards - one flipped, one face down */}
              <div style={{
                width: 48,
                height: 64,
                backgroundColor: "#fff",
                borderRadius: 6,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 32,
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              }}>
                ❤️
              </div>
              <div style={{
                width: 48,
                height: 64,
                background: "linear-gradient(135deg, #A78BFA 0%, #8B5CF6 100%)",
                borderRadius: 6,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                position: "relative",
              }}>
                <div style={{
                  width: 28,
                  height: 36,
                  border: "3px solid rgba(255,255,255,0.5)",
                  borderRadius: 4,
                }} />
              </div>
            </div>
          ),
          isInteractive: true,
        },
        {
          id: "tictactoe",
          name: locale === "ar" ? "إكس-أو" : "Tic-Tac-Toe",
          bg: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
          mark: "",
          textColor: "#fff",
          customRender: () => (
            <div className="relative flex items-center justify-center" style={{ width: 150, height: 150 }}>
              <svg width="90" height="90" viewBox="0 0 90 90">
                {/* Grid lines */}
                <line x1="30" y1="10" x2="30" y2="80" stroke="rgba(255,255,255,0.8)" strokeWidth="3" strokeLinecap="round" />
                <line x1="60" y1="10" x2="60" y2="80" stroke="rgba(255,255,255,0.8)" strokeWidth="3" strokeLinecap="round" />
                <line x1="10" y1="30" x2="80" y2="30" stroke="rgba(255,255,255,0.8)" strokeWidth="3" strokeLinecap="round" />
                <line x1="10" y1="60" x2="80" y2="60" stroke="rgba(255,255,255,0.8)" strokeWidth="3" strokeLinecap="round" />
                {/* X */}
                <line x1="15" y1="15" x2="25" y2="25" stroke="#fff" strokeWidth="4" strokeLinecap="round" />
                <line x1="25" y1="15" x2="15" y2="25" stroke="#fff" strokeWidth="4" strokeLinecap="round" />
                {/* O */}
                <circle cx="45" cy="45" r="10" stroke="#fff" strokeWidth="4" fill="none" />
                {/* X */}
                <line x1="50" y1="65" x2="60" y2="75" stroke="#fff" strokeWidth="4" strokeLinecap="round" />
                <line x1="60" y1="65" x2="50" y2="75" stroke="#fff" strokeWidth="4" strokeLinecap="round" />
              </svg>
            </div>
          ),
          isInteractive: true,
        },
        {
          id: "puzzle",
          name: locale === "ar" ? "لعبة الألغاز" : "Sliding Puzzle",
          bg: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
          mark: "",
          textColor: "#fff",
          customRender: () => (
            <div className="relative flex items-center justify-center" style={{ width: 150, height: 150 }}>
              <div className="grid gap-1" style={{ gridTemplateColumns: "repeat(3, 1fr)", width: 80, height: 80 }}>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                  <div
                    key={num}
                    style={{
                      backgroundColor: "#fff",
                      borderRadius: 4,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 16,
                      fontWeight: 700,
                      color: "#4facfe",
                      boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
                    }}
                  >
                    {num}
                  </div>
                ))}
                <div style={{ backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 4 }} />
              </div>
            </div>
          ),
          isInteractive: true,
        },
        {
          id: "colormatch",
          name: locale === "ar" ? "تطابق الألوان" : "Color Match",
          bg: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
          mark: "",
          textColor: "#fff",
          customRender: () => (
            <div className="relative flex items-center justify-center" style={{ width: 150, height: 150 }}>
              <div className="grid gap-2" style={{ gridTemplateColumns: "repeat(2, 1fr)", width: 70, height: 70 }}>
                <div style={{ backgroundColor: "#FF6B6B", borderRadius: 8, boxShadow: "0 3px 10px rgba(255,107,107,0.4)" }} />
                <div style={{ backgroundColor: "#4ECDC4", borderRadius: 8, boxShadow: "0 3px 10px rgba(78,205,196,0.4)" }} />
                <div style={{ backgroundColor: "#FFE66D", borderRadius: 8, boxShadow: "0 3px 10px rgba(255,230,109,0.4)" }} />
                <div style={{ backgroundColor: "#A8E6CF", borderRadius: 8, boxShadow: "0 3px 10px rgba(168,230,207,0.4)" }} />
              </div>
            </div>
          ),
          isInteractive: true,
        },
        {
          id: "patternmemory",
          name: locale === "ar" ? "ذاكرة الأنماط" : "Pattern Memory",
          bg: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
          mark: "",
          textColor: "#fff",
          customRender: () => (
            <div className="relative flex items-center justify-center" style={{ width: 150, height: 150 }}>
              <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(3, 1fr)", width: 80 }}>
                {[
                  { active: true, delay: 0 },
                  { active: false, delay: 0 },
                  { active: true, delay: 0.2 },
                  { active: false, delay: 0 },
                  { active: true, delay: 0.4 },
                  { active: false, delay: 0 },
                  { active: true, delay: 0.6 },
                  { active: false, delay: 0 },
                  { active: true, delay: 0.8 },
                ].map((dot, i) => (
                  <div
                    key={i}
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: "50%",
                      backgroundColor: dot.active ? "#fff" : "rgba(255,255,255,0.2)",
                      boxShadow: dot.active ? "0 0 12px rgba(255,255,255,0.6)" : "none",
                      animation: dot.active ? `patternPulse 1.5s ease-in-out infinite ${dot.delay}s` : "none",
                    }}
                  />
                ))}
              </div>
            </div>
          ),
          isInteractive: true,
        },
        {
          id: "emojimatch",
          name: locale === "ar" ? "تطابق الرموز" : "Emoji Match",
          bg: "linear-gradient(135deg, #30cfd0 0%, #330867 100%)",
          mark: "",
          textColor: "#fff",
          customRender: () => (
            <div className="relative flex items-center justify-center gap-2" style={{ width: 150, height: 150 }}>
              {["😊", "🎮", "⭐", "🎨"].map((emoji, i) => (
                <div
                  key={i}
                  style={{
                    width: 32,
                    height: 42,
                    backgroundColor: "#fff",
                    borderRadius: 6,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 22,
                    boxShadow: "0 3px 10px rgba(0,0,0,0.2)",
                    transform: i % 2 === 0 ? "rotate(-5deg)" : "rotate(5deg)",
                  }}
                >
                  {emoji}
                </div>
              ))}
            </div>
          ),
          isInteractive: true,
        },
      ],
    },
    Meeting: {
      label: "Meeting",
      labelKey: "launcher.meeting",
      icon: Video,
      apps: [
        {
          id: "teams",
          name: locale === "ar" ? "تيمز" : "Teams",
          bg: "#fff",
          mark: "",
          textColor: "#333",
          customRender: () => (
            <img src={teamsIcon} alt="Teams" style={{ width: 150, height: 150, objectFit: "cover" }} />
          ),
        },
        {
          id: "webex",
          name: locale === "ar" ? "ويبيكس" : "Webex",
          bg: "#fff",
          mark: "",
          textColor: "#333",
          customRender: () => (
            <img src={webexIcon} alt="Webex" style={{ width: 150, height: 150, objectFit: "cover" }} />
          ),
        },
        {
          id: "skype",
          name: locale === "ar" ? "سكايب" : "Skype",
          bg: "#fff",
          mark: "",
          textColor: "#333",
          customRender: () => (
            <img src={skypeIcon} alt="Skype" style={{ width: 150, height: 150, objectFit: "cover" }} />
          ),
        },
        {
          id: "zoom",
          name: locale === "ar" ? "زوم" : "Zoom",
          bg: "#fff",
          mark: "",
          textColor: "#333",
          customRender: () => (
            <img src={zoomIcon} alt="Zoom" style={{ width: 150, height: 150, objectFit: "cover" }} />
          ),
        },
        {
          id: "meet",
          name: locale === "ar" ? "جوجل ميت" : "Google Meet",
          bg: "#fff",
          mark: "",
          textColor: "#333",
          customRender: () => (
            <img src={meetIcon} alt="Google Meet" style={{ width: 150, height: 150, objectFit: "cover" }} />
          ),
        },
      ],
    },
    Internet: {
      label: "Internet",
      labelKey: "launcher.internet",
      icon: Globe,
      apps: [
        {
          id: "chrome",
          name: locale === "ar" ? "كروم" : "Chrome",
          bg: "#fff",
          mark: "",
          textColor: "#333",
          customRender: () => (
            <img src={chromeIcon} alt="Chrome" style={{ width: 90, height: 90, objectFit: "contain" }} />
          ),
        },
        {
          id: "saudigazette",
          name: locale === "ar" ? "سعودي جازيت" : "Saudi Gazette",
          bg: "#fff",
          mark: "",
          textColor: "#fff",
          customRender: () => (
            <img src={saudiGazetteLogo} alt="Saudi Gazette" style={{ width: 110, height: 110, objectFit: "contain" }} />
          ),
        },
        {
          id: "bbc",
          name: locale === "ar" ? "بي بي سي الإخبارية" : "BBC News",
          bg: "#1a1a1a",
          mark: "",
          textColor: "#fff",
          customRender: () => (
            <div className="flex flex-col items-center gap-1">
              <div className="flex">
                {["B", "B", "C"].map((l, i) => (
                  <div key={i} style={{ width: 20, height: 22, backgroundColor: "#fff", display: "flex", alignItems: "center", justifyContent: "center", marginRight: i < 2 ? 2 : 0 }}>
                    <span style={{ fontSize: 15, fontWeight: 900, color: "#1a1a1a" }}>{l}</span>
                  </div>
                ))}
              </div>
              <span style={{ fontSize: 12, fontWeight: 700, color: "#fff", letterSpacing: 2, marginTop: 2 }}>NEWS</span>
            </div>
          ),
        },
        {
          id: "cnn",
          name: locale === "ar" ? "سي إن إن" : "CNN",
          bg: "#CC0000",
          mark: "CNN",
          textColor: "#fff",
          markSize: 32,
          markWeight: 900,
        },
        {
          id: "okaz",
          name: locale === "ar" ? "عكاظ" : "Okaz",
          bg: "#fff",
          mark: "",
          textColor: "#333",
          customRender: () => (
            <img src={okazIcon} alt="Okaz" style={{ width: 150, height: 150, objectFit: "cover" }} />
          ),
        },
      ],
    },
    Tools: {
      label: "Tools",
      labelKey: "launcher.tools",
      icon: Wrench,
      apps: [
        {
          id: "calculator",
          name: locale === "ar" ? "آلة حاسبة" : "Calculator",
          bg: "#fff",
          mark: "",
          textColor: "#333",
          customRender: () => (
            <img src={calculatorIcon} alt="Calculator" style={{ width: 150, height: 150, objectFit: "cover" }} />
          ),
          isInteractive: true,
        },
        {
          id: "notes",
          name: locale === "ar" ? "ملاحظات" : "Notes",
          bg: "linear-gradient(135deg, #FDB022 0%, #F59E0B 100%)",
          mark: "",
          textColor: "#fff",
          customRender: () => (
            <div className="flex flex-col items-center justify-center" style={{ width: 150, height: 150 }}>
              <FileText size={56} color="#fff" strokeWidth={1.8} />
              <span style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.9)", marginTop: 8, letterSpacing: 0.5 }}>Notes</span>
            </div>
          ),
          isInteractive: true,
        },
        {
          id: "reminders",
          name: locale === "ar" ? "تذكيرات" : "Reminders",
          bg: "#fff",
          mark: "",
          textColor: "#333",
          customRender: () => (
            <img src={alarmIcon} alt="Reminders" style={{ width: 150, height: 150, objectFit: "cover" }} />
          ),
          isInteractive: true,
        },
        {
          id: "stopwatch",
          name: locale === "ar" ? "ساعة الإيقاف" : "Stopwatch",
          bg: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
          mark: "",
          textColor: "#fff",
          customRender: () => (
            <div className="relative flex items-center justify-center" style={{ width: 150, height: 150 }}>
              <div style={{
                width: 80,
                height: 80,
                borderRadius: "50%",
                border: "6px solid #fff",
                position: "relative",
              }}>
                <div style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  width: "2px",
                  height: "24px",
                  backgroundColor: "#fff",
                  transformOrigin: "center top",
                  transform: "translate(-50%, 0) rotate(45deg)",
                }} />
                <div style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  width: "2px",
                  height: "16px",
                  backgroundColor: "rgba(255,255,255,0.7)",
                  transformOrigin: "center top",
                  transform: "translate(-50%, 0) rotate(120deg)",
                }} />
                <div style={{
                  position: "absolute",
                  top: "-8px",
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: "12px",
                  height: "8px",
                  backgroundColor: "#fff",
                  borderRadius: "4px 4px 0 0",
                }} />
              </div>
            </div>
          ),
          isInteractive: true,
        },
        {
          id: "unitconverter",
          name: locale === "ar" ? "محول الوحدات" : "Unit Converter",
          bg: "linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)",
          mark: "",
          textColor: "#fff",
          customRender: () => (
            <div className="relative flex flex-col items-center justify-center gap-2" style={{ width: 150, height: 150 }}>
              {/* Top unit */}
              <div style={{
                backgroundColor: "rgba(255,255,255,0.95)",
                padding: "8px 16px",
                borderRadius: 8,
                minWidth: 70,
                textAlign: "center",
              }}>
                <span style={{ fontSize: 16, fontWeight: 700, color: "#8B5CF6" }}>km</span>
              </div>

              {/* Arrows */}
              <div className="flex flex-col" style={{ gap: 4 }}>
                <svg width="28" height="12" viewBox="0 0 28 12">
                  <path d="M 2 6 L 22 6 L 18 2 M 22 6 L 18 10" stroke="#fff" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <svg width="28" height="12" viewBox="0 0 28 12">
                  <path d="M 26 6 L 6 6 L 10 2 M 6 6 L 10 10" stroke="#fff" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>

              {/* Bottom unit */}
              <div style={{
                backgroundColor: "rgba(255,255,255,0.95)",
                padding: "8px 16px",
                borderRadius: 8,
                minWidth: 70,
                textAlign: "center",
              }}>
                <span style={{ fontSize: 16, fontWeight: 700, color: "#8B5CF6" }}>mi</span>
              </div>
            </div>
          ),
          isInteractive: true,
        },
        {
          id: "breathing",
          name: locale === "ar" ? "تمرين التنفس" : "Breathing",
          bg: "linear-gradient(135deg, #14B8A6 0%, #0D9488 100%)",
          mark: "",
          textColor: "#fff",
          customRender: () => (
            <div className="relative flex items-center justify-center" style={{ width: 150, height: 150 }}>
              <div style={{
                width: 70,
                height: 70,
                borderRadius: "50%",
                border: "4px solid rgba(255,255,255,0.4)",
                animation: "breathePulse 3s ease-in-out infinite",
              }} />
              <div style={{
                position: "absolute",
                width: 50,
                height: 50,
                borderRadius: "50%",
                border: "4px solid rgba(255,255,255,0.6)",
                animation: "breathePulse 3s ease-in-out infinite 0.5s",
              }} />
              <div style={{
                position: "absolute",
                width: 30,
                height: 30,
                borderRadius: "50%",
                backgroundColor: "#fff",
                animation: "breathePulse 3s ease-in-out infinite 1s",
              }} />
            </div>
          ),
          isInteractive: true,
        },
        {
          id: "whiteboard",
          name: "Whiteboard",
          bg: "linear-gradient(135deg, #F97316 0%, #EA580C 100%)",
          mark: "",
          textColor: "#fff",
          customRender: () => (
            <div className="relative flex items-center justify-center" style={{ width: 150, height: 150 }}>
              <div style={{
                width: 90,
                height: 70,
                backgroundColor: "#fff",
                borderRadius: 6,
                border: "3px solid rgba(255,255,255,0.3)",
                position: "relative",
              }}>
                <svg width="90" height="70" style={{ position: "absolute", top: 0, left: 0 }}>
                  <path d="M 15 25 Q 30 15, 45 25 T 75 25" stroke="rgba(249,115,22,0.6)" strokeWidth="3" fill="none" strokeLinecap="round" />
                  <path d="M 20 45 L 70 45" stroke="rgba(249,115,22,0.6)" strokeWidth="3" strokeLinecap="round" />
                  <circle cx="25" cy="55" r="3" fill="rgba(249,115,22,0.6)" />
                  <circle cx="45" cy="55" r="3" fill="rgba(249,115,22,0.6)" />
                  <circle cx="65" cy="55" r="3" fill="rgba(249,115,22,0.6)" />
                </svg>
              </div>
              <div style={{
                position: "absolute",
                bottom: 15,
                right: 20,
                width: 24,
                height: 5,
                backgroundColor: "rgba(255,255,255,0.9)",
                borderRadius: 3,
                transform: "rotate(-30deg)",
              }} />
            </div>
          ),
          isInteractive: true,
        },
      ],
    },
    Education: {
      label: "Education",
      labelKey: "launcher.education",
      icon: BookOpenText,
      apps: theme.id === "caremed"
        ? /* ── Care Medical patient education from care.med.sa ── */
          [
            { id: "cm-edu-normal-birth", nameKey: "caremed.edu.normalBirth", viewId: "30715" },
            { id: "cm-edu-depression", nameKey: "caremed.edu.depression", viewId: "30916" },
            { id: "cm-edu-dementia", nameKey: "caremed.edu.dementia", viewId: "30917" },
            { id: "cm-edu-elderly-exercise", nameKey: "caremed.edu.elderlyExercise", viewId: "30918" },
            { id: "cm-edu-falls", nameKey: "caremed.edu.falls", viewId: "30919" },
            { id: "cm-edu-general-health", nameKey: "caremed.edu.generalHealth", viewId: "30920" },
            { id: "cm-edu-medications", nameKey: "caremed.edu.medications", viewId: "30921" },
          ].map((item) => ({
            id: item.id,
            name: item.nameKey,
            nameKey: item.nameKey,
            bg: "transparent",
            mark: "",
            textColor: "#333",
            url: `https://care.med.sa/${locale}/view/${item.viewId}`,
            customRender: () => (
              <div className="flex flex-col items-center justify-center" style={{ width: 150, height: 150, background: "linear-gradient(135deg, #1D234D 0%, #00A3C1 100%)" }}>
                <BookOpenText size={48} color="#fff" strokeWidth={1.5} />
                <span style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.7)", marginTop: 6, letterSpacing: 0.5 }}>ARTICLE</span>
              </div>
            ),
          }))
        : theme.id === "dallah"
        ? /* ── Dallah Hospital official educational materials ── */
          (locale === "ar"
            ? [
                { id: "d-edu-reflux", name: "ارتجاع الحمض", pdf: "https://www.dallah-hospital.com/Assets/Library/Gallery/Educational%20Content%20AR/acid%20reflux.pdf" },
                { id: "d-edu-asthma", name: "الربو", pdf: "https://www.dallah-hospital.com/Assets/Library/Gallery/Educational%20Content%20AR/asthma.pdf" },
                { id: "d-edu-bronch", name: "توسع القصبات", pdf: "https://www.dallah-hospital.com/Assets/Library/Gallery/Educational%20Content%20AR/bronchiectasis.pdf" },
                { id: "d-edu-chol", name: "الكوليسترول", pdf: "https://www.dallah-hospital.com/Assets/Library/Gallery/Educational%20Content%20AR/cholesterol.pdf" },
                { id: "d-edu-colo", name: "تنظير القولون", pdf: "https://www.dallah-hospital.com/Assets/Library/Gallery/Educational%20Content%20AR/colonoscopy.pdf" },
                { id: "d-edu-pneu", name: "الالتهاب الرئوي", pdf: "https://www.dallah-hospital.com/Assets/Library/Gallery/Educational%20Content%20AR/community-acquired%20pneumonia.pdf" },
                { id: "d-edu-derm", name: "التهاب الجلد", pdf: "https://www.dallah-hospital.com/Assets/Library/Gallery/Educational%20Content%20AR/Contact%20dermatitis.pdf" },
                { id: "d-edu-anemia", name: "فقر الدم", pdf: "https://www.dallah-hospital.com/Assets/Library/Gallery/Educational%20Content%20AR/iron%20deficiency%20anemia.pdf" },
                { id: "d-edu-ibs", name: "القولون المتهيج", pdf: "https://www.dallah-hospital.com/Assets/Library/Gallery/Educational%20Content%20AR/irritable%20bowel%20syndrome.pdf" },
                { id: "d-edu-vitd", name: "نقص فيتامين د", pdf: "https://www.dallah-hospital.com/Assets/Library/Gallery/Educational%20Content%20AR/Vitamin%20D%20Deficiency.pdf" },
                { id: "d-edu-gdiabetes", name: "سكري الحمل", pdf: "https://www.dallah-hospital.com/Assets/library/Gallery/AR%20GESTATIONAL%20DIABETES-083537.pdf" },
                { id: "d-edu-neonatal", name: "تغذية الرضيع", pdf: "https://www.dallah-hospital.com/Assets/library/Gallery/AR_Neonatal%20Weight%20Gain%20and%20Nutrition.pdf" },
                { id: "d-edu-diadiet", name: "حمية السكري", pdf: "https://www.dallah-hospital.com/assets/Library/Gallery/Educational%20Content%20AR/Diabetes%20Diet%20AR%20%28coded%29.pdf" },
                { id: "d-edu-knee", name: "استبدال الركبة", pdf: "https://www.dallah-hospital.com/assets/Library/Gallery/Educational%20Content%20AR/Total%20Knee%20Replacement_Leaflet%20AR.pdf" },
                { id: "d-edu-const", name: "الإمساك", pdf: "https://www.dallah-hospital.com/assets/Library/Gallery/Educational%20Content%20AR/AR-Constipation%20in%20Adults.pdf" },
                { id: "d-edu-csect", name: "الولادة القيصرية", pdf: "https://www.dallah-hospital.com/assets/Library/Gallery/Educational%20Content%20AR/C-section%20%28cesarean%20birth%29%20AR.pdf" },
                { id: "d-edu-labor", name: "الولادة الطبيعية", pdf: "https://www.dallah-hospital.com/assets/Library/Gallery/Educational%20Content%20AR/Labor%20and%20delivery%20%28childbirth%20AR.pdf" },
              ]
            : [
                { id: "d-edu-reflux", name: "Acid Reflux", pdf: "https://www.dallah-hospital.com/Assets/Library/Gallery/Educational%20Content/acid%20reflux.pdf" },
                { id: "d-edu-asthma", name: "Asthma", pdf: "https://www.dallah-hospital.com/Assets/Library/Gallery/Educational%20Content/Asthma.pdf" },
                { id: "d-edu-bronch", name: "Bronchiectasis", pdf: "https://www.dallah-hospital.com/Assets/Library/Gallery/Educational%20Content/bronchiectasis.pdf" },
                { id: "d-edu-chol", name: "Cholesterol", pdf: "https://www.dallah-hospital.com/Assets/Library/Gallery/Educational%20Content/cholesterol.pdf" },
                { id: "d-edu-bronchitis", name: "Chronic Bronchitis", pdf: "https://www.dallah-hospital.com/Assets/Library/Gallery/Educational%20Content/chronic%20bronchitis.pdf" },
                { id: "d-edu-colo", name: "Colonoscopy", pdf: "https://www.dallah-hospital.com/Assets/Library/Gallery/Educational%20Content/colonoscopy.pdf" },
                { id: "d-edu-pneu", name: "Community Pneumonia", pdf: "https://www.dallah-hospital.com/Assets/Library/Gallery/Educational%20Content/community-acquired%20pneumonia.pdf" },
                { id: "d-edu-derm", name: "Contact Dermatitis", pdf: "https://www.dallah-hospital.com/Assets/Library/Gallery/Educational%20Content/Contact%20dermatitis.pdf" },
                { id: "d-edu-copd", name: "COPD Guide", pdf: "https://www.dallah-hospital.com/Assets/Library/Gallery/Educational%20Content/COPD.pdf" },
                { id: "d-edu-crohn", name: "Crohn Disease", pdf: "https://www.dallah-hospital.com/Assets/Library/Gallery/Educational%20Content/Crohn%20disease%20in%20adult.pdf" },
                { id: "d-edu-gi", name: "GI Bleed", pdf: "https://www.dallah-hospital.com/Assets/Library/Gallery/Educational%20Content/GI%20bleed.pdf" },
                { id: "d-edu-hypok", name: "Hypokalemia", pdf: "https://www.dallah-hospital.com/Assets/Library/Gallery/Educational%20Content/hypokalemia.pdf" },
                { id: "d-edu-hypot", name: "Hypothyroidism", pdf: "https://www.dallah-hospital.com/Assets/Library/Gallery/Educational%20Content/hypothyroidism.pdf" },
                { id: "d-edu-anemia", name: "Iron Anemia", pdf: "https://www.dallah-hospital.com/Assets/Library/Gallery/Educational%20Content/iron%20deficiency%20anemia.pdf" },
                { id: "d-edu-ibs", name: "Irritable Bowel (IBS)", pdf: "https://www.dallah-hospital.com/Assets/Library/Gallery/Educational%20Content/irritable%20bowel%20syndrome.pdf" },
                { id: "d-edu-warts", name: "Skin Warts", pdf: "https://www.dallah-hospital.com/Assets/Library/Gallery/Educational%20Content/Skin%20warts.pdf" },
                { id: "d-edu-tb", name: "Tuberculosis", pdf: "https://www.dallah-hospital.com/Assets/Library/Gallery/Educational%20Content/Tuberculosis.pdf" },
                { id: "d-edu-vitd", name: "Vitamin D Deficiency", pdf: "https://www.dallah-hospital.com/Assets/Library/Gallery/Educational%20Content/Vitamin%20D%20Deficiency.pdf" },
                { id: "d-edu-csect", name: "C-Section Recovery", pdf: "https://www.dallah-hospital.com/Assets/Library/Gallery/Educational%20Content/C-section%20(cesarean%20birth)%20EN.pdf" },
                { id: "d-edu-diadiet", name: "Diabetes Diet", pdf: "https://www.dallah-hospital.com/Assets/Library/Gallery/Educational%20Content/Diabetes%20Diet%20EN%20(coded).pdf" },
                { id: "d-edu-falls", name: "Fall Prevention", pdf: "https://www.dallah-hospital.com/Assets/Library/Gallery/Educational%20Content/Fall%20Prevention.pdf" },
                { id: "d-edu-gdiabetes", name: "Gestational Diabetes", pdf: "https://www.dallah-hospital.com/Assets/Library/Gallery/Educational%20Content/GESTATIONAL%20DIABETES.pdf" },
                { id: "d-edu-labor", name: "Labor and Delivery", pdf: "https://www.dallah-hospital.com/Assets/Library/Gallery/Educational%20Content/Labor%20and%20delivery%20(childbirth)%20ENG.pdf" },
                { id: "d-edu-neonatal", name: "Newborn Nutrition", pdf: "https://www.dallah-hospital.com/Assets/Library/Gallery/Educational%20Content/Neonatal%20Weight%20Gain%20and%20Nutrition.pdf" },
              ]
          ).map((item) => ({
            id: item.id,
            name: item.name,
            bg: "transparent",
            mark: "",
            textColor: "#333",
            pdfSource: item.pdf,
            customRender: () => (
              <div className="flex flex-col items-center justify-center text-center" style={{ width: 150, height: 150, padding: 12, background: "linear-gradient(135deg, #E8453C 0%, #C62828 100%)" }}>
                <FileText size={42} color="#fff" strokeWidth={1.5} />
                <span style={{ fontSize: 10, fontWeight: 800, color: "rgba(255,255,255,0.7)", marginTop: 4, letterSpacing: 0.5, textTransform: "uppercase" }}>GUIDE</span>
              </div>
            ),
          }))
        : /* ── Default education items for other hospitals ── */
          [
            ...[
              { id: "edu-cesarean-recovery", name: "5 Steps to Recovery\nAfter Cesarean", nameKey: "edu.cesareanRecovery", type: "pdf" as const },
              { id: "edu-pain-management", name: "Pain Management\nGuide", nameKey: "edu.painManagement", type: "pdf" as const },
              { id: "edu-wound-care", name: "Wound Care\nInstructions", nameKey: "edu.woundCare", type: "pdf" as const },
              { id: "edu-exercise-video", name: "Post-Op Exercises\n& Mobility", nameKey: "edu.exerciseVideo", type: "video" as const },
              { id: "edu-medication-guide", name: "Your Medication\nSchedule", nameKey: "edu.medicationGuide", type: "pdf" as const },
              { id: "edu-nutrition-video", name: "Nutrition Tips for\nFaster Healing", nameKey: "edu.nutritionVideo", type: "video" as const },
              { id: "edu-discharge-checklist", name: "Discharge\nChecklist", nameKey: "edu.dischargeChecklist", type: "pdf" as const },
              { id: "edu-infection-signs", name: "Signs of Infection\nWhat to Watch For", nameKey: "edu.infectionSigns", type: "pdf" as const },
              { id: "edu-baby-care", name: "Newborn Care\nBasics", nameKey: "edu.babyCare", type: "video" as const },
              { id: "edu-breathing-exercises", name: "Breathing Exercises\nfor Recovery", nameKey: "edu.breathingExercises", type: "video" as const },
              { id: "edu-blood-clot", name: "Preventing Blood\nClots After Surgery", nameKey: "edu.bloodClot", type: "pdf" as const },
              { id: "edu-emotional-health", name: "Emotional Health\nAfter Delivery", nameKey: "edu.emotionalHealth", type: "video" as const },
              { id: "edu-scar-care", name: "Scar Care &\nHealing Timeline", nameKey: "edu.scarCare", type: "pdf" as const },
              { id: "edu-sleep-tips", name: "Sleep Positions\nAfter C-Section", nameKey: "edu.sleepTips", type: "pdf" as const },
              { id: "edu-pelvic-floor", name: "Pelvic Floor\nExercises", nameKey: "edu.pelvicFloor", type: "video" as const },
              { id: "edu-when-to-call", name: "When to Call\nYour Doctor", nameKey: "edu.whenToCall", type: "pdf" as const },
            ].map((item) => ({
              id: item.id,
              name: item.name,
              nameKey: item.nameKey,
              bg: "transparent",
              mark: "",
              textColor: "#333",
              customRender: item.type === "pdf"
                ? () => (
                  <div className="flex flex-col items-center justify-center" style={{ width: 150, height: 150, background: "linear-gradient(135deg, #E8453C 0%, #C62828 100%)" }}>
                    <FileText size={48} color="#fff" strokeWidth={1.5} />
                    <span style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.7)", marginTop: 6, letterSpacing: 0.5 }}>PDF</span>
                  </div>
                )
                : () => (
                  <div className="flex flex-col items-center justify-center" style={{ width: 150, height: 150, background: "linear-gradient(135deg, #334155 0%, #0F172A 100%)" }}>
                    <PlayCircle size={52} color="#fff" strokeWidth={1.5} />
                    <span style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.7)", marginTop: 6, letterSpacing: 0.5 }}>VIDEO</span>
                  </div>
                ),
            })),
          ],
    },
  };
}

/* ── App Tile ──────────────────────────────────────────────── */

function AppTile({ app, onTap }: { app: AppItem; onTap: () => void }) {
  const { onPointerDown, rippleElements } = useRipple("rgba(255,255,255,0.15)");
  const { t } = useLocale();
  const { theme } = useTheme();
  const displayName = app.nameKey ? t(app.nameKey) : app.name;

  return (
    <button
      onPointerDown={onPointerDown}
      onClick={onTap}
      className="relative overflow-hidden flex flex-col items-center gap-3 hover:scale-[1.05] active:scale-[0.94] transition-all duration-200 cursor-pointer"
    >
      {rippleElements}
      <div
        className="flex items-center justify-center relative overflow-hidden"
        style={{
          width: "150px",
          height: "150px",
          borderRadius: theme.radiusXl,
          background: app.bg,
        }}
      >
        {app.customRender ? (
          <div className="absolute inset-0 flex items-center justify-center overflow-hidden" style={{ borderRadius: theme.radiusXl }}>
            {app.customRender()}
          </div>
        ) : (
          <span
            className="relative z-10"
            style={{
              color: app.textColor,
              fontSize: `${app.markSize || 28}px`,
              fontWeight: app.markWeight || 700,
              fontFamily: app.markFont || "inherit",
              letterSpacing: "-0.5px",
              lineHeight: 1,
            }}
          >
            {app.mark}
          </span>
        )}
      </div>
      <span
        style={{
          color: "rgba(255,255,255,0.85)",
          fontSize: "16px",
          fontWeight: 500,
          textAlign: "center",
          lineHeight: 1.2,
          maxWidth: "160px",
          whiteSpace: "pre-line",
        }}
      >
        {displayName}
      </span>
    </button>
  );
}

/* ── Overlay ──────────────────────────────────────────────── */

export function AppLauncher({
  categoryKey,
  onClose,
  onLaunchGame,
  onLaunchTool,
}: {
  categoryKey: string;
  onClose: () => void;
  onLaunchGame?: (gameId: string) => void;
  onLaunchTool?: (toolId: string) => void;
}) {
  const { theme } = useTheme();
  const { t, locale } = useLocale();
  const [activeKey, setActiveKey] = useState(categoryKey);
  const allCategories = getCategories(theme, locale);
  const category = allCategories[activeKey];
  const [launchedApp, setLaunchedApp] = useState<string | null>(null);
  const [showPdf, setShowPdf] = useState(false);
  const [pdfSource, setPdfSource] = useState<string | undefined>(undefined);
  const [pdfTitle, setPdfTitle] = useState<string>("");

  if (!category) return null;

  const handleAppTap = (app: AppItem) => {
    // Check if it's a tool first (based on category)
    if (category.labelKey === "launcher.tools" && app.isInteractive && onLaunchTool) {
      onLaunchTool(app.id);
      return;
    }

    // Check if it's an interactive game
    if (category.labelKey === "launcher.games" && app.isInteractive && onLaunchGame) {
      onLaunchGame(app.id);
      return;
    }

    if (app.url) {
      window.open(app.url, "_blank", "noopener,noreferrer");
      return;
    }

    if (app.pdfSource) {
      setPdfSource(app.pdfSource);
      setPdfTitle(app.name);
      setShowPdf(true);
      return;
    }

    if (app.id === "careinn-whitepaper") {
      setPdfSource(undefined); // use default hardcoded one
      setPdfTitle("CareInn Whitepaper");
      setShowPdf(true);
      return;
    }

    if (app.id === "iptv") {
      setLaunchedApp("com.bitsarabia.bedsideterminalsolution/.careinn.iptvStreamActivity");
      setTimeout(() => setLaunchedApp(null), 2000);
      return;
    }

    const displayName = app.nameKey ? t(app.nameKey) : app.name;
    setLaunchedApp(displayName);
    setTimeout(() => setLaunchedApp(null), 2000);
  };

  const CategoryIcon = category.icon;
  const primary = theme.primary;
  const categoryKeys = Object.keys(allCategories);

  return (
    <div
      className="absolute inset-0 z-50 flex flex-col"
      style={{
        background: `linear-gradient(160deg, ${primary} 0%, ${theme.primaryDark} 40%, #0a1628 100%)`,
        animation: "appLauncherIn 0.2s ease-out",
      }}
    >
      {/* Hospital background image — subtle, blue-dominant */}
      <img
        src={theme.heroImageUrl}
        alt=""
        aria-hidden
        className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none"
        style={{ opacity: 0.08, mixBlendMode: "luminosity", userSelect: "none" }}
      />
      <style>{`
        @keyframes appLauncherIn {
          from { opacity: 0; transform: scale(0.98); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes breathePulse {
          0%, 100% { transform: scale(0.8); opacity: 0.4; }
          50% { transform: scale(1.1); opacity: 1; }
        }
        @keyframes patternPulse {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 1; }
        }
      `}</style>

      {/* Header */}
      <InternalPageHeader
        title={t(category.labelKey)}
        icon={<CategoryIcon size={26} strokeWidth={2} />}
        onClose={onClose}
      />

      {/* Apps grid */}
      <div className="flex-1 overflow-y-auto min-h-0 px-16 pb-4 flex items-center justify-center" style={{ scrollbarWidth: "none", position: "relative", zIndex: 10 }}>
        <div
          className="grid gap-12 py-4"
          style={{
            gridTemplateColumns: `repeat(6, 160px)`,
            justifyContent: "center",
            justifyItems: "center",
          }}
        >
          {category.apps.map((app) => (
            <AppTile key={app.id} app={app} onTap={() => handleAppTap(app)} />
          ))}
        </div>
      </div>

      {/* Category navigation bar */}
      <div
        className="shrink-0 flex items-center justify-center gap-2 px-4"
        style={{
          paddingBottom: 20,
          paddingTop: 16,
          position: "relative",
          zIndex: 10,
          background: "linear-gradient(to top, rgba(0,0,0,0.25) 0%, transparent 100%)",
        }}
      >
        {categoryKeys.map((key) => {
          const cat = allCategories[key];
          const Icon = cat.icon;
          const isActive = key === activeKey;
          return (
            <button
              key={key}
              onClick={() => setActiveKey(key)}
              className="flex flex-col items-center justify-center transition-all duration-200 active:scale-90"
              style={{
                width: isActive ? 130 : 90,
                height: 72,
                borderRadius: theme.radiusLg,
                background: isActive ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.06)",
                border: isActive ? "2px solid rgba(255,255,255,0.4)" : "1.5px solid rgba(255,255,255,0.08)",
                backdropFilter: "blur(12px)",
                cursor: "pointer",
                boxShadow: isActive ? "0 0 20px rgba(255,255,255,0.1)" : "none",
                gap: 6,
              }}
            >
              <Icon size={26} strokeWidth={isActive ? 2.2 : 1.8} color={isActive ? "#fff" : "rgba(255,255,255,0.4)"} />
              <span
                style={{
                  color: isActive ? "#fff" : "rgba(255,255,255,0.4)",
                  fontSize: isActive ? "12px" : "11px",
                  fontWeight: isActive ? 700 : 500,
                  whiteSpace: "nowrap",
                  letterSpacing: "0.3px",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  maxWidth: isActive ? 110 : 80,
                }}
              >
                {t(cat.labelKey)}
              </span>
            </button>
          );
        })}
      </div>

      {/* Launch toast */}
      {launchedApp && (
        <div
          className="absolute bottom-10 left-1/2 -translate-x-1/2 px-8 py-4 flex items-center gap-3"
          style={{
            backgroundColor: "rgba(255,255,255,0.1)",
            backdropFilter: "blur(20px)",
            borderRadius: theme.radiusLg,
            border: "1px solid rgba(255,255,255,0.15)",
            animation: "appLauncherIn 0.15s ease-out",
            zIndex: 999, // Ensure it's in front of everything
          }}
        >
          <div
            className="w-2.5 h-2.5 rounded-full"
            style={{
              backgroundColor: "#4ADE80",
              boxShadow: "0 0 8px #4ADE8060",
            }}
          />
          <span style={{ color: "#fff", fontSize: "14px", fontWeight: 600 }}>
            {t("launcher.launching", launchedApp || "")}
          </span>
        </div>
      )}

      {/* PDF Reader Overlay */}
      {showPdf && (
        <PdfReaderModal
          onClose={() => setShowPdf(false)}
          pdfSource={pdfSource}
          title={pdfTitle}
        />
      )}
    </div>
  );
}

export { getCategories };
import { useState, useEffect, useRef, useCallback, memo } from "react";
import {
  X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut,
  Loader2, Bookmark, PanelLeft, PanelLeftClose,
} from "lucide-react";
import { useTheme } from "./ThemeContext";
import { useLocale } from "./i18n";
import { Document, Page, pdfjs } from "react-pdf";

import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

/* ═══════════════════════════════════════════════════════════════
 * Memoized single page — prevents re-render when parent state
 * (like currentPage, bookmarks, sidebar) changes
 * ═══════════════════════════════════════════════════════════════ */
const MemoPage = memo(function MemoPage({
  pageNumber, scale,
}: {
  pageNumber: number;
  scale: number;
}) {
  return (
    <Page
      pageNumber={pageNumber}
      scale={scale}
      renderAnnotationLayer={false}
      renderTextLayer={true}
      loading={
        <div style={{
          width: `${595 * scale}px`, height: `${842 * scale}px`,
          display: "flex", alignItems: "center", justifyContent: "center",
          backgroundColor: "#fff",
        }}>
          <Loader2 className="animate-spin" size={32} color="#94a3b8" />
        </div>
      }
    />
  );
});

/* Memoized thumbnail — tiny, never re-renders once drawn */
const ThumbPage = memo(function ThumbPage({ pageNumber }: { pageNumber: number }) {
  return (
    <Page
      pageNumber={pageNumber}
      width={180}
      renderAnnotationLayer={false}
      renderTextLayer={false}
      loading={
        <div style={{
          width: 180, height: 254,
          backgroundColor: "#3a3d3f",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Loader2 className="animate-spin" size={16} color="#666" />
        </div>
      }
    />
  );
});

/* ═══════════════════════════════════════════════════════════════
 * MAIN COMPONENT
 * ═══════════════════════════════════════════════════════════════ */
interface PdfReaderModalProps {
  onClose: () => void;
  pdfSource?: string;
  title?: string;
}

export function PdfReaderModal({ onClose, pdfSource, title }: PdfReaderModalProps) {
  const { theme } = useTheme();
  const { isRTL } = useLocale();

  const [numPages, setNumPages] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [scale, setScale] = useState(1.2);
  const [loading, setLoading] = useState(true);
  const [inputPage, setInputPage] = useState("1");
  const [showSidebar, setShowSidebar] = useState(false);
  const [bookmarks, setBookmarks] = useState<number[]>([]);

  const activeThumbRef = useRef<HTMLDivElement>(null);

  /* ─── Restore saved state ─── */
  useEffect(() => {
    if (!pdfSource) return;
    const savedPage = localStorage.getItem(`pdf_page_${pdfSource}`);
    if (savedPage) {
      const p = parseInt(savedPage, 10);
      if (!isNaN(p) && p > 0) { setCurrentPage(p); setInputPage(String(p)); }
    }
    const savedBm = localStorage.getItem(`pdf_bookmarks_${pdfSource}`);
    if (savedBm) try { setBookmarks(JSON.parse(savedBm)); } catch {}
  }, [pdfSource]);

  /* ─── Persist bookmarks ─── */
  useEffect(() => {
    if (pdfSource) localStorage.setItem(`pdf_bookmarks_${pdfSource}`, JSON.stringify(bookmarks));
  }, [bookmarks, pdfSource]);

  /* ─── Persist page ─── */
  useEffect(() => {
    if (pdfSource && currentPage) {
      localStorage.setItem(`pdf_page_${pdfSource}`, String(currentPage));
      setInputPage(String(currentPage));
    }
  }, [currentPage, pdfSource]);

  /* ─── Scroll active thumbnail into view ─── */
  useEffect(() => {
    if (activeThumbRef.current) {
      activeThumbRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [currentPage, showSidebar]);

  /* ─── Document loaded ─── */
  const onLoadSuccess = useCallback(({ numPages: n }: { numPages: number }) => {
    setNumPages(n);
    setLoading(false);
  }, []);

  /* ─── Navigation ─── */
  const go = useCallback((page: number) => {
    setCurrentPage((prev) => {
      const p = Math.max(1, Math.min(page, numPages || 1));
      return p;
    });
  }, [numPages]);

  const handlePageInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const v = parseInt(inputPage, 10);
      if (!isNaN(v) && v > 0 && v <= (numPages || 1)) go(v);
      else setInputPage(String(currentPage));
    }
  };

  const toggleBookmark = () => {
    setBookmarks((prev) => {
      if (prev.includes(currentPage)) return prev.filter((p) => p !== currentPage);
      return [...prev, currentPage].sort((a, b) => a - b);
    });
  };

  const isSimulated = !pdfSource;

  return (
    <div className="absolute inset-0 z-[100] flex flex-col overflow-hidden"
      style={{ backgroundColor: "#404346", animation: "pdfIn .25s ease-out" }}>

      <style>{`
        @keyframes pdfIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        .pdf-btn{display:flex;align-items:center;justify-content:center;width:40px;height:40px;
          border-radius:8px;cursor:pointer;transition:all .15s;border:none;background:transparent;color:#fff}
        .pdf-btn:hover{background:rgba(255,255,255,.1)}
        .pdf-btn:active{background:rgba(255,255,255,.15);transform:scale(.95)}
        .react-pdf__Page{box-shadow:0 2px 20px rgba(0,0,0,.35);background:#fff!important}
        .react-pdf__Document{display:flex;flex-direction:column;align-items:center}
        .pdf-side::-webkit-scrollbar{width:6px}
        .pdf-side::-webkit-scrollbar-track{background:transparent}
        .pdf-side::-webkit-scrollbar-thumb{background:rgba(255,255,255,.15);border-radius:3px}
        .pdf-main::-webkit-scrollbar{width:10px}
        .pdf-main::-webkit-scrollbar-track{background:rgba(0,0,0,.05)}
        .pdf-main::-webkit-scrollbar-thumb{background:rgba(255,255,255,.18);border-radius:5px}
        .pdf-main::-webkit-scrollbar-thumb:hover{background:rgba(255,255,255,.3)}
        .page-in{background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.2);color:#fff;
          width:50px;text-align:center;border-radius:6px;font-weight:700;outline:none;padding:5px;font-size:14px}
        .page-in:focus{border-color:#60a5fa;background:rgba(255,255,255,.15)}
      `}</style>

      {/* ── HEADER ── */}
      <div className="shrink-0 flex items-center justify-between px-5"
        style={{ height: 56, backgroundColor: "#2b2d30", borderBottom: "1px solid #1a1a1a", zIndex: 20, color: "#fff" }}>
        <div className="flex items-center gap-3">
          <button className="pdf-btn" onClick={() => setShowSidebar((s) => !s)}
            style={{ backgroundColor: showSidebar ? "rgba(255,255,255,.1)" : "transparent" }}>
            {showSidebar ? <PanelLeftClose size={20} /> : <PanelLeft size={20} />}
          </button>
          <span style={{ fontSize: 15, fontWeight: 700, letterSpacing: ".3px", opacity: .9 }}>
            {title || "Document Viewer"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button className="pdf-btn" onClick={toggleBookmark} title="Bookmark page">
            <Bookmark size={18} className={bookmarks.includes(currentPage) ? "fill-yellow-400 text-yellow-400" : ""} />
          </button>
          <button className="pdf-btn" onClick={onClose} style={{ backgroundColor: "#dc2626", borderRadius: 10 }}>
            <X size={18} />
          </button>
        </div>
      </div>

      {/* ── BODY ── */}
      <div className="flex-1 flex overflow-hidden">

        {isSimulated ? (
          <div className="flex-1 flex items-center justify-center" style={{ color: "#fff" }}>
            <p>Select a PDF to view.</p>
          </div>
        ) : (
          <Document
            file={{ url: pdfSource }}
            onLoadSuccess={onLoadSuccess}
            onLoadError={(err) => console.error("PDF load error", err)}
            loading={
              <div className="flex-1 flex flex-col items-center justify-center gap-4" style={{ color: "#fff" }}>
                <Loader2 className="animate-spin text-blue-400" size={56} />
                <span style={{ fontSize: 16, fontWeight: 500, opacity: .7 }}>Loading…</span>
              </div>
            }
          >
            {/* ── SIDEBAR (inside Document so thumbnails share PDF data) ── */}
            {showSidebar && numPages && (
              <div className="w-56 shrink-0 flex flex-col bg-[#232527] border-r border-black/50">
                <div className="flex-1 overflow-y-auto py-3 px-2 pdf-side">
                  <div className="flex flex-col gap-2">
                    {Array.from({ length: numPages }, (_, i) => {
                      const pg = i + 1;
                      const active = pg === currentPage;
                      const bookmarked = bookmarks.includes(pg);
                      return (
                        <div
                          key={pg}
                          ref={active ? activeThumbRef : undefined}
                          onClick={() => go(pg)}
                          className="cursor-pointer rounded-lg overflow-hidden transition-all"
                          style={{
                            padding: 5,
                            border: active ? "2px solid #3b82f6" : "2px solid transparent",
                            backgroundColor: active ? "rgba(59,130,246,.08)" : "transparent",
                            position: "relative",
                          }}
                        >
                          <ThumbPage pageNumber={pg} />
                          <div className="flex items-center justify-center gap-1 mt-1.5"
                            style={{ fontSize: 11, fontWeight: active ? 700 : 400, color: active ? "#60a5fa" : "rgba(255,255,255,.45)" }}>
                            {bookmarked && <Bookmark size={9} className="fill-yellow-400 text-yellow-400" />}
                            {pg}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* ── MAIN PAGE VIEWER ── */}
            {numPages && (
              <div className="flex-1 flex flex-col overflow-hidden">
                {/* Page display area with scroll for oversized pages */}
                <div className="flex-1 overflow-auto pdf-main flex items-start justify-center"
                  style={{ padding: "30px 20px 100px 20px", backgroundColor: "#4a4d50" }}>
                  <MemoPage pageNumber={currentPage} scale={scale} />
                </div>
              </div>
            )}
          </Document>
        )}
      </div>

      {/* ── BOTTOM TOOLBAR ── */}
      {numPages && (
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-3 px-5 py-2.5"
          style={{
            backgroundColor: "rgba(35,37,39,.96)", backdropFilter: "blur(20px)",
            borderRadius: 14, border: "1px solid rgba(255,255,255,.1)",
            boxShadow: "0 8px 32px rgba(0,0,0,.5)", zIndex: 100, color: "#fff",
          }}>

          {/* Zoom */}
          <button className="pdf-btn" onClick={() => setScale((s) => Math.max(s - .15, .5))}
            style={{ width: 34, height: 34 }}><ZoomOut size={16} /></button>
          <span style={{ fontSize: 12, fontWeight: 700, width: 42, textAlign: "center", opacity: .7 }}>
            {Math.round(scale * 100)}%
          </span>
          <button className="pdf-btn" onClick={() => setScale((s) => Math.min(s + .15, 3))}
            style={{ width: 34, height: 34 }}><ZoomIn size={16} /></button>

          <div style={{ width: 1, height: 24, backgroundColor: "rgba(255,255,255,.1)", margin: "0 4px" }} />

          {/* Page navigation */}
          <button className="pdf-btn" onClick={() => go(currentPage - 1)}
            disabled={currentPage <= 1}
            style={{ width: 34, height: 34, opacity: currentPage <= 1 ? .25 : 1 }}>
            {isRTL ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>

          <div className="flex items-center gap-1.5">
            <input className="page-in" value={inputPage}
              onChange={(e) => setInputPage(e.target.value)}
              onKeyDown={handlePageInput} />
            <span style={{ opacity: .3, fontSize: 13 }}>/</span>
            <span style={{ fontSize: 13, fontWeight: 700 }}>{numPages}</span>
          </div>

          <button className="pdf-btn" onClick={() => go(currentPage + 1)}
            disabled={currentPage >= numPages}
            style={{ width: 34, height: 34, opacity: currentPage >= numPages ? .25 : 1 }}>
            {isRTL ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
          </button>
        </div>
      )}
    </div>
  );
}

import { useState, useEffect, useRef, useCallback } from "react";
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Loader2, Bookmark, PanelLeft, PanelLeftClose } from "lucide-react";
import { useTheme } from "./ThemeContext";
import { useLocale } from "./i18n";
import { Document, Page, pdfjs } from "react-pdf";

import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

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
  const [scale, setScale] = useState(1.4);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [inputPage, setInputPage] = useState("1");
  const [showSidebar, setShowSidebar] = useState(false);
  const [bookmarks, setBookmarks] = useState<number[]>([]);
  const [sidebarTab, setSidebarTab] = useState<"pages" | "bookmarks">("pages");

  const scrollRef = useRef<HTMLDivElement>(null);
  const pageEls = useRef<Map<number, HTMLDivElement>>(new Map());
  const isNavScroll = useRef(false); // true while a nav-triggered scroll is in progress
  const sidebarThumbRefs = useRef<Map<number, HTMLDivElement>>(new Map());

  /* ─── Persist / restore page ─── */
  useEffect(() => {
    if (!pdfSource) return;
    const saved = localStorage.getItem(`pdf_page_${pdfSource}`);
    if (saved) {
      const p = parseInt(saved, 10);
      if (!isNaN(p) && p > 0) { setCurrentPage(p); setInputPage(String(p)); }
    }
  }, [pdfSource]);

  /* ─── Persist / restore bookmarks ─── */
  useEffect(() => {
    if (!pdfSource) return;
    const saved = localStorage.getItem(`pdf_bookmarks_${pdfSource}`);
    if (saved) { try { setBookmarks(JSON.parse(saved)); } catch {} }
  }, [pdfSource]);

  useEffect(() => {
    if (pdfSource) localStorage.setItem(`pdf_bookmarks_${pdfSource}`, JSON.stringify(bookmarks));
  }, [bookmarks, pdfSource]);

  /* ─── IntersectionObserver for scroll-based page tracking ─── */
  useEffect(() => {
    if (!numPages || !scrollRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (isNavScroll.current) return; // ignore during programmatic scroll
        // Find the entry with the largest visible ratio
        let best: IntersectionObserverEntry | null = null;
        entries.forEach((e) => {
          if (!best || e.intersectionRatio > best.intersectionRatio) best = e;
        });
        if (best && best.intersectionRatio > 0) {
          const pg = Number((best.target as HTMLElement).dataset.page);
          if (pg && pg !== currentPage) {
            setCurrentPage(pg);
            setInputPage(String(pg));
            if (pdfSource) localStorage.setItem(`pdf_page_${pdfSource}`, String(pg));
          }
        }
      },
      {
        root: scrollRef.current,
        // Observe when a page crosses the top 40% of the viewport
        rootMargin: "0px 0px -60% 0px",
        threshold: [0, 0.1, 0.25, 0.5, 0.75, 1],
      }
    );

    pageEls.current.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [numPages, currentPage, pdfSource]);

  /* ─── Scroll to page (used by nav buttons, sidebar, input) ─── */
  const scrollToPage = useCallback((page: number) => {
    const el = pageEls.current.get(page);
    const container = scrollRef.current;
    if (!el || !container) return;

    isNavScroll.current = true;
    container.scrollTo({ top: el.offsetTop - container.offsetTop, behavior: "smooth" });

    // Also scroll sidebar thumbnail into view
    const thumb = sidebarThumbRefs.current.get(page);
    if (thumb) thumb.scrollIntoView({ behavior: "smooth", block: "nearest" });

    setTimeout(() => { isNavScroll.current = false; }, 900);
  }, []);

  /* ─── Scroll to restored page after initial load ─── */
  useEffect(() => {
    if (numPages && currentPage > 1) {
      const t = setTimeout(() => scrollToPage(currentPage), 400);
      return () => clearTimeout(t);
    }
  }, [numPages]); // deliberate: only on first load

  /* ─── Document callbacks ─── */
  const onLoadSuccess = ({ numPages: n }: { numPages: number }) => {
    setNumPages(n);
    setLoading(false);
    setError(null);
  };
  const onLoadError = (err: Error) => {
    setLoading(false);
    setError(err.message || "Failed to load PDF");
  };

  /* ─── Navigation helpers ─── */
  const go = useCallback((page: number) => {
    if (!numPages) return;
    const p = Math.max(1, Math.min(page, numPages));
    setCurrentPage(p);
    setInputPage(String(p));
    if (pdfSource) localStorage.setItem(`pdf_page_${pdfSource}`, String(p));
    scrollToPage(p);
  }, [numPages, pdfSource, scrollToPage]);

  const handlePageInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const v = parseInt(inputPage, 10);
      if (!isNaN(v) && v > 0 && v <= (numPages || 1)) go(v);
      else setInputPage(String(currentPage));
    }
  };

  const toggleBookmark = () => {
    const next = bookmarks.includes(currentPage)
      ? bookmarks.filter((p) => p !== currentPage)
      : [...bookmarks, currentPage].sort((a, b) => a - b);
    setBookmarks(next);
    setSidebarTab("bookmarks");
    setShowSidebar(true);
  };

  /* ─── Ref setter for main pages ─── */
  const setPageRef = useCallback((pg: number, el: HTMLDivElement | null) => {
    if (el) pageEls.current.set(pg, el);
    else pageEls.current.delete(pg);
  }, []);
  const setThumbRef = useCallback((pg: number, el: HTMLDivElement | null) => {
    if (el) sidebarThumbRefs.current.set(pg, el);
    else sidebarThumbRefs.current.delete(pg);
  }, []);

  const isSimulated = !pdfSource;

  /* ══════════════════════════════════════════════════════════════════
   * RENDER
   * ══════════════════════════════════════════════════════════════════ */
  return (
    <div
      className="absolute inset-0 z-[100] flex flex-col overflow-hidden"
      style={{ backgroundColor: "#525659", animation: "pdfIn .25s ease-out" }}
    >
      <style>{`
        @keyframes pdfIn { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        .pdf-btn{display:flex;align-items:center;justify-content:center;width:40px;height:40px;border-radius:8px;cursor:pointer;transition:all .15s;border:none;background:transparent;color:#fff}
        .pdf-btn:hover{background:rgba(255,255,255,.1)}
        .pdf-btn:active{background:rgba(255,255,255,.15);transform:scale(.95)}
        .react-pdf__Page{box-shadow:0 4px 24px -4px rgba(0,0,0,.4);background:#fff}
        .pdf-main::-webkit-scrollbar{width:10px}
        .pdf-main::-webkit-scrollbar-track{background:rgba(0,0,0,.1)}
        .pdf-main::-webkit-scrollbar-thumb{background:rgba(255,255,255,.2);border-radius:5px}
        .pdf-main::-webkit-scrollbar-thumb:hover{background:rgba(255,255,255,.35)}
        .pdf-side::-webkit-scrollbar{width:6px}
        .pdf-side::-webkit-scrollbar-track{background:transparent}
        .pdf-side::-webkit-scrollbar-thumb{background:rgba(255,255,255,.15);border-radius:3px}
        .page-in{background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.2);color:#fff;width:50px;text-align:center;border-radius:4px;font-weight:700;outline:none;padding:4px;font-size:14px}
        .page-in:focus{border-color:#fff;background:rgba(255,255,255,.2)}
      `}</style>

      {/* ── HEADER ── */}
      <div
        className="shrink-0 flex items-center justify-between px-6"
        style={{ height: 64, backgroundColor: "#323639", borderBottom: "1px solid #1a1a1a", zIndex: 10, color: "#fff" }}
      >
        <div className="flex items-center gap-4">
          <button className="pdf-btn" onClick={() => setShowSidebar(!showSidebar)}
            style={{ backgroundColor: showSidebar ? "rgba(255,255,255,.1)" : "transparent" }}>
            {showSidebar ? <PanelLeftClose size={22} /> : <PanelLeft size={22} />}
          </button>
          <span style={{ fontSize: 16, fontWeight: 700, letterSpacing: ".5px" }}>{title || "Document Viewer"}</span>
        </div>
        <button className="pdf-btn" onClick={onClose} style={{ backgroundColor: "#dc2626", borderRadius: 10 }}>
          <X size={20} />
        </button>
      </div>

      {/* ── BODY — single Document wraps sidebar + main viewer ── */}
      {isSimulated ? (
        <div className="flex-1 flex items-center justify-center" style={{ color: "#fff" }}>
          <p>Select a PDF to view.</p>
        </div>
      ) : (
        <Document
          file={{ url: pdfSource }}
          onLoadSuccess={onLoadSuccess}
          onLoadError={onLoadError as any}
          loading={
            <div className="flex-1 flex flex-col items-center justify-center gap-4" style={{ color: "#fff" }}>
              <Loader2 className="animate-spin text-blue-400" size={56} />
              <span style={{ fontSize: 18, fontWeight: 500 }}>Loading Document…</span>
            </div>
          }
          error={
            <div className="flex-1 flex flex-col items-center justify-center gap-6 p-10 text-center" style={{ color: "#fff" }}>
              <X size={64} className="text-red-400" />
              <h3 style={{ fontSize: 24, fontWeight: 700 }}>Error Loading PDF</h3>
              <p style={{ maxWidth: 400, opacity: .6 }}>{error}</p>
            </div>
          }
        >
          <div className="flex-1 flex overflow-hidden">
            {/* ── SIDEBAR ── */}
            {showSidebar && (
              <div className="w-64 shrink-0 flex flex-col border-r border-black/40 bg-[#2a2d2e]">
                <div className="flex border-b border-black/20 bg-black/10">
                  <button onClick={() => setSidebarTab("pages")}
                    className={`flex-1 p-3 text-center text-xs font-bold transition-colors border-none cursor-pointer ${sidebarTab === "pages" ? "text-white border-b-2 border-blue-500 bg-transparent" : "text-white/40 hover:text-white/60 bg-transparent"}`}
                    style={sidebarTab === "pages" ? { borderBottom: "2px solid #3b82f6" } : {}}>
                    PAGES
                  </button>
                  <button onClick={() => setSidebarTab("bookmarks")}
                    className={`flex-1 p-3 text-center text-xs font-bold transition-colors border-none cursor-pointer ${sidebarTab === "bookmarks" ? "text-white bg-transparent" : "text-white/40 hover:text-white/60 bg-transparent"}`}
                    style={sidebarTab === "bookmarks" ? { borderBottom: "2px solid #3b82f6" } : {}}>
                    BOOKMARKS
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-3 pdf-side">
                  {sidebarTab === "pages" && numPages ? (
                    <div className="flex flex-col gap-3">
                      {Array.from({ length: numPages }, (_, i) => {
                        const pg = i + 1;
                        const active = pg === currentPage;
                        return (
                          <div
                            key={pg}
                            ref={(el) => setThumbRef(pg, el)}
                            className="cursor-pointer rounded-lg overflow-hidden transition-all"
                            onClick={() => go(pg)}
                            style={{
                              border: active ? "2px solid #3b82f6" : "2px solid transparent",
                              backgroundColor: active ? "rgba(59,130,246,.1)" : "transparent",
                              padding: 4,
                            }}
                          >
                            {/* Thumbnail rendered from the SAME Document — no re-fetch */}
                            <Page pageNumber={pg} width={200} renderTextLayer={false} renderAnnotationLayer={false} loading="" />
                            <div className="text-center mt-1" style={{ fontSize: 11, fontWeight: active ? 700 : 400, color: active ? "#60a5fa" : "rgba(255,255,255,.5)" }}>
                              {pg}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : sidebarTab === "bookmarks" ? (
                    <div className="flex flex-col gap-2">
                      {bookmarks.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-10 gap-3 opacity-30">
                          <Bookmark size={32} color="#fff" />
                          <span className="text-xs text-center text-white">No bookmarks yet.<br />Use the toolbar button.</span>
                        </div>
                      ) : bookmarks.map((p) => (
                        <div key={p}
                          className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 cursor-pointer group"
                          onClick={() => go(p)}>
                          <div className="flex items-center gap-3">
                            <Bookmark size={14} className="fill-blue-500 text-blue-500" />
                            <span className="text-sm font-bold text-white/80">Page {p}</span>
                          </div>
                          <button className="p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-400 bg-transparent border-none text-white cursor-pointer"
                            onClick={(e) => { e.stopPropagation(); setBookmarks((b) => b.filter((x) => x !== p)); }}>
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>
            )}

            {/* ── MAIN SCROLL AREA ── */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto pdf-main" style={{ backgroundColor: "#525659" }}>
              {numPages && Array.from({ length: numPages }, (_, i) => {
                const pg = i + 1;
                return (
                  <div
                    key={pg}
                    data-page={pg}
                    ref={(el) => setPageRef(pg, el)}
                    style={{ display: "flex", justifyContent: "center", padding: "20px 0" }}
                  >
                    <Page pageNumber={pg} scale={scale} renderAnnotationLayer={false} renderTextLayer={true} />
                  </div>
                );
              })}
              {/* Extra bottom space so last page can scroll to top */}
              <div style={{ height: "50vh" }} />
            </div>
          </div>
        </Document>
      )}

      {/* ── BOTTOM TOOLBAR ── */}
      <div
        className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 px-6 py-3"
        style={{
          backgroundColor: "rgba(40,44,47,.95)", backdropFilter: "blur(20px)",
          borderRadius: 16, border: "1px solid rgba(255,255,255,.15)",
          boxShadow: "0 10px 40px rgba(0,0,0,.4)", zIndex: 100, color: "#fff",
        }}
      >
        {/* Zoom */}
        <div className="flex items-center gap-2">
          <button className="pdf-btn" onClick={() => setScale((s) => Math.max(s - .15, .5))}><ZoomOut size={18} /></button>
          <span className="text-xs font-bold w-10 text-center">{Math.round(scale * 100)}%</span>
          <button className="pdf-btn" onClick={() => setScale((s) => Math.min(s + .15, 3))}><ZoomIn size={18} /></button>
        </div>

        {/* Page nav */}
        <div className="flex items-center gap-2 border-l border-white/10 pl-4">
          <button className="pdf-btn" onClick={() => go(currentPage - 1)} disabled={currentPage <= 1} style={{ opacity: currentPage <= 1 ? .3 : 1 }}>
            {isRTL ? <ChevronRight size={22} /> : <ChevronLeft size={22} />}
          </button>
          <div className="flex items-center gap-1.5 px-2">
            <input className="page-in" value={inputPage} onChange={(e) => setInputPage(e.target.value)} onKeyDown={handlePageInput} />
            <span className="text-white/30 text-sm">/</span>
            <span className="text-sm font-bold">{numPages || "--"}</span>
          </div>
          <button className="pdf-btn" onClick={() => go(currentPage + 1)} disabled={currentPage >= (numPages || 1)} style={{ opacity: currentPage >= (numPages || 1) ? .3 : 1 }}>
            {isRTL ? <ChevronLeft size={22} /> : <ChevronRight size={22} />}
          </button>
        </div>

        {/* Bookmark */}
        <div className="flex items-center gap-1 border-l border-white/10 pl-4">
          <button className="pdf-btn" onClick={toggleBookmark}>
            <Bookmark size={18} className={bookmarks.includes(currentPage) ? "fill-blue-500 text-blue-500" : ""} />
          </button>
        </div>
      </div>
    </div>
  );
}

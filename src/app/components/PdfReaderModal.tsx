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
 * Memoized Thumbnail — This prevents the sidebar from flashing 
 * when the parent re-renders or active page changes.
 * ═══════════════════════════════════════════════════════════════ */
const ThumbPage = memo(function ThumbPage({ pageNumber }: { pageNumber: number }) {
  return (
    <Page
      pageNumber={pageNumber}
      width={160}
      renderAnnotationLayer={false}
      renderTextLayer={false}
      loading={
        <div style={{
          width: 160, height: 226,
          backgroundColor: "rgba(255,255,255,0.05)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Loader2 className="animate-spin opacity-50" size={16} color="#fff" />
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
  const { isRTL } = useLocale();

  const [numPages, setNumPages] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [scale, setScale] = useState(1.4); // Made default scale larger to take up more space
  const [inputPage, setInputPage] = useState("1");
  
  // Sidebar state
  const [showSidebar, setShowSidebar] = useState(true);
  const [sidebarTab, setSidebarTab] = useState<"pages" | "bookmarks">("pages");
  const [bookmarks, setBookmarks] = useState<number[]>([]);

  const scrollRef = useRef<HTMLDivElement>(null);
  const pageEls = useRef<Map<number, HTMLDivElement>>(new Map());
  const activeThumbRef = useRef<HTMLDivElement>(null);
  const isNavScroll = useRef(false);

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

  /* ─── IntersectionObserver for Scroll Tracking ─── */
  useEffect(() => {
    if (!numPages || !scrollRef.current) return;

    const observer = new IntersectionObserver((entries) => {
      if (isNavScroll.current) return;
      
      let best: IntersectionObserverEntry | null = null;
      for (const e of entries) {
        if (!best || e.intersectionRatio > best.intersectionRatio) {
          best = e;
        }
      }
      
      if (best && best.intersectionRatio > 0) {
        const pg = Number((best.target as HTMLElement).dataset.page);
        if (pg && pg !== currentPage) {
          setCurrentPage(pg);
          setInputPage(String(pg));
          if (pdfSource) localStorage.setItem(`pdf_page_${pdfSource}`, String(pg));
        }
      }
    }, {
      root: scrollRef.current,
      rootMargin: "-20% 0px -50% 0px", // triggers when page hits top 20-50% of view
      threshold: [0, 0.1, 0.3, 0.5, 0.7, 1],
    });

    const els = Array.from(pageEls.current.values());
    els.forEach((el) => observer.observe(el));
    if (els.length > 0) {
      // Refresh observer mapping if pages rendered
    }
    return () => observer.disconnect();
  }, [numPages, currentPage, pdfSource, scale]); 
  // added `scale` dependency so changing zoom re-observes the elements if needed

  /* ─── Scroll to active thumbnail ─── */
  useEffect(() => {
    if (activeThumbRef.current && showSidebar && sidebarTab === "pages") {
      activeThumbRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [currentPage, showSidebar, sidebarTab]);

  /* ─── Navigation ─── */
  const scrollToPage = useCallback((page: number) => {
    const el = pageEls.current.get(page);
    const container = scrollRef.current;
    if (!el || !container) return;

    isNavScroll.current = true;
    container.scrollTo({ top: el.offsetTop - container.offsetTop - 20, behavior: "smooth" });

    setTimeout(() => { isNavScroll.current = false; }, 800);
  }, []);

  // Jump to restored page on initial load
  useEffect(() => {
    if (numPages && currentPage > 1) {
      const t = setTimeout(() => scrollToPage(currentPage), 500);
      return () => clearTimeout(t);
    }
  }, [numPages]);

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
    setBookmarks((prev) => {
      if (prev.includes(currentPage)) return prev.filter((p) => p !== currentPage);
      return [...prev, currentPage].sort((a, b) => a - b);
    });
    setSidebarTab("bookmarks");
    if (!showSidebar) setShowSidebar(true);
  };

  const setPageRef = useCallback((pg: number, el: HTMLDivElement | null) => {
    if (el) pageEls.current.set(pg, el);
    else pageEls.current.delete(pg);
  }, []);

  return (
    <div className="absolute inset-0 z-[100] flex flex-col overflow-hidden"
      style={{ backgroundColor: "#404346", animation: "pdfIn .25s ease-out" }}>

      <style>{`
        @keyframes pdfIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        .pdf-btn{display:flex;align-items:center;justify-content:center;width:40px;height:40px;
          border-radius:8px;cursor:pointer;transition:all .15s;border:none;background:transparent;color:#fff}
        .pdf-btn:hover{background:rgba(255,255,255,.1)}
        .pdf-btn:active{background:rgba(255,255,255,.15);transform:scale(.95)}
        /* Ensure the Document takes full space and flexes its row items nicely */
        .react-pdf-wrapper { flex: 1; display: flex; flex-direction: row; min-height: 0; min-width: 0; }
        .react-pdf__Page{box-shadow:0 6px 30px rgba(0,0,0,.4);background:#fff!important; border-radius: 4px; overflow: hidden; margin-bottom: 30px;}
        .pdf-side::-webkit-scrollbar{width:6px}
        .pdf-side::-webkit-scrollbar-track{background:transparent}
        .pdf-side::-webkit-scrollbar-thumb{background:rgba(255,255,255,.15);border-radius:3px}
        .pdf-main::-webkit-scrollbar{width:12px}
        .pdf-main::-webkit-scrollbar-track{background:rgba(0,0,0,.08)}
        .pdf-main::-webkit-scrollbar-thumb{background:rgba(255,255,255,.2);border-radius:6px; border: 3px solid #404346;}
        .pdf-main::-webkit-scrollbar-thumb:hover{background:rgba(255,255,255,.3)}
        .page-in{background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.15);color:#fff;
          width:50px;text-align:center;border-radius:6px;font-weight:700;outline:none;padding:5px;font-size:14px}
        .page-in:focus{border-color:#60a5fa;background:rgba(255,255,255,.15)}
        .sidebar-tab{flex:1; padding:12px; text-align:center; font-size:12px; font-weight:700; transition:all 0.2s; border:none; cursor:pointer; background:transparent;}
      `}</style>

      {/* ── HEADER ── */}
      <div className="shrink-0 flex items-center justify-between px-5"
        style={{ height: 56, backgroundColor: "#2b2d30", borderBottom: "1px solid #1a1a1a", zIndex: 20, color: "#fff", boxShadow: "0 4px 20px rgba(0,0,0,0.5)" }}>
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
          <button className="pdf-btn" onClick={toggleBookmark} title="Bookmark current page">
            <Bookmark size={18} className={bookmarks.includes(currentPage) ? "fill-yellow-400 text-yellow-400" : ""} />
          </button>
          <button className="pdf-btn" onClick={onClose} style={{ backgroundColor: "#dc2626", borderRadius: 10 }}>
            <X size={18} />
          </button>
        </div>
      </div>

      {/* ── BODY ── */}
      <div className="flex-1 flex overflow-hidden">
        {!pdfSource ? (
          <div className="flex-1 flex items-center justify-center" style={{ color: "#fff" }}>
            <p>Select a PDF to view.</p>
          </div>
        ) : (
          <Document
            file={{ url: pdfSource }}
            className="react-pdf-wrapper"
            onLoadSuccess={({ numPages }) => setNumPages(numPages)}
            loading={
              <div className="flex-1 flex flex-col items-center justify-center gap-4 w-full h-full" style={{ color: "#fff" }}>
                <Loader2 className="animate-spin text-blue-400" size={56} />
                <span style={{ fontSize: 16, fontWeight: 500, opacity: .7 }}>Loading Document…</span>
              </div>
            }
          >
            {/* ── SIDEBAR ── */}
            {showSidebar && numPages && (
              <div className="w-64 shrink-0 flex flex-col bg-[#232527] border-r border-black/50 z-10 shadow-2xl">
                
                {/* Tabs */}
                <div className="flex border-b border-white/5 bg-black/20 shrink-0">
                  <button onClick={() => setSidebarTab("pages")}
                    className={`sidebar-tab ${sidebarTab === "pages" ? "text-white" : "text-white/40 hover:text-white/60"}`}
                    style={sidebarTab === "pages" ? { borderBottom: "2px solid #3b82f6" } : {}}>
                    PAGES
                  </button>
                  <button onClick={() => setSidebarTab("bookmarks")}
                    className={`sidebar-tab ${sidebarTab === "bookmarks" ? "text-white" : "text-white/40 hover:text-white/60"}`}
                    style={sidebarTab === "bookmarks" ? { borderBottom: "2px solid #3b82f6" } : {}}>
                    BOOKMARKS
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto py-3 px-3 pdf-side">
                  {sidebarTab === "pages" ? (
                    <div className="flex flex-col gap-3">
                      {Array.from({ length: numPages }, (_, i) => {
                        const pg = i + 1;
                        const active = pg === currentPage;
                        const bookmarked = bookmarks.includes(pg);
                        return (
                          <div
                            key={pg}
                            ref={active ? activeThumbRef : undefined}
                            onClick={() => go(pg)}
                            className="cursor-pointer rounded-lg transition-all flex flex-col items-center"
                            style={{
                              padding: "6px",
                              border: active ? "2px solid #3b82f6" : "2px solid transparent",
                              backgroundColor: active ? "rgba(59,130,246,.08)" : "transparent",
                            }}
                          >
                            <div className="relative rounded overflow-hidden shadow-md" style={{ width: 160 }}>
                              <ThumbPage pageNumber={pg} />
                              {bookmarked && (
                                <div className="absolute top-2 right-2 bg-black/60 rounded-full p-1">
                                  <Bookmark size={12} className="fill-yellow-400 text-yellow-400" />
                                </div>
                              )}
                            </div>
                            <span className="mt-2" style={{ fontSize: 12, fontWeight: active ? 700 : 500, color: active ? "#60a5fa" : "rgba(255,255,255,.5)" }}>
                              {pg}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {bookmarks.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-8 gap-3 opacity-30 mt-10">
                          <Bookmark size={32} color="#fff" />
                          <span className="text-xs text-center text-white">No bookmarks yet.<br />Use the toolbar button.</span>
                        </div>
                      ) : bookmarks.map((p) => (
                        <div key={p}
                          className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 cursor-pointer transition-colors group"
                          onClick={() => go(p)}>
                          <div className="flex items-center gap-3">
                            <Bookmark size={14} className="fill-yellow-400 text-yellow-400" />
                            <span className="text-sm font-bold text-white/90">Page {p}</span>
                          </div>
                          <button className="p-1.5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/30 rounded bg-transparent border-none text-white/60 hover:text-red-400 cursor-pointer"
                            onClick={(e) => { e.stopPropagation(); setBookmarks((b) => b.filter((x) => x !== p)); }}>
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── MAIN SCROLL AREA ── */}
            {numPages && (
              <div 
                ref={scrollRef} 
                className="flex-1 overflow-y-auto pdf-main flex flex-col items-center"
                style={{ padding: "40px 20px" }}
              >
                {Array.from({ length: numPages }, (_, i) => {
                  const pg = i + 1;
                  return (
                    <div
                      key={pg}
                      data-page={pg}
                      ref={(el) => setPageRef(pg, el)}
                      style={{ display: "flex", justifyContent: "center" }}
                    >
                      <Page pageNumber={pg} scale={scale} renderAnnotationLayer={true} renderTextLayer={true} />
                    </div>
                  );
                })}
              </div>
            )}
          </Document>
        )}
      </div>

      {/* ── BOTTOM TOOLBAR ── */}
      {numPages && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 px-5 py-2.5"
          style={{
            backgroundColor: "rgba(30,32,34,.95)", backdropFilter: "blur(20px)",
            borderRadius: 16, border: "1px solid rgba(255,255,255,.1)",
            boxShadow: "0 12px 40px rgba(0,0,0,.6)", zIndex: 100, color: "#fff",
          }}>

          {/* Zoom */}
          <button className="pdf-btn" onClick={() => setScale((s) => Math.max(s - .15, .5))}
            style={{ width: 34, height: 34 }}><ZoomOut size={16} /></button>
          <span style={{ fontSize: 13, fontWeight: 700, width: 44, textAlign: "center", opacity: .8 }}>
            {Math.round(scale * 100)}%
          </span>
          <button className="pdf-btn" onClick={() => setScale((s) => Math.min(s + .15, 3))}
            style={{ width: 34, height: 34 }}><ZoomIn size={16} /></button>

          <div style={{ width: 1, height: 24, backgroundColor: "rgba(255,255,255,.15)", margin: "0 6px" }} />

          {/* Page navigation */}
          <button className="pdf-btn" onClick={() => go(currentPage - 1)}
            disabled={currentPage <= 1}
            style={{ width: 34, height: 34, opacity: currentPage <= 1 ? .25 : 1 }}>
            {isRTL ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>

          <div className="flex items-center gap-2 mx-1">
            <input className="page-in" value={inputPage}
              onChange={(e) => setInputPage(e.target.value)}
              onKeyDown={handlePageInput} />
            <span style={{ opacity: .4, fontSize: 14 }}>/</span>
            <span style={{ fontSize: 14, fontWeight: 700 }}>{numPages}</span>
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

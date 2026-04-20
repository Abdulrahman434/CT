import { useState, useEffect, useRef } from "react";
import { X, Bookmark, PanelLeft, PanelLeftClose } from "lucide-react";
import { useTheme } from "./ThemeContext";
import { useLocale } from "./i18n";

interface PdfReaderModalProps {
  onClose: () => void;
  pdfSource?: string;
  title?: string;
}

export function PdfReaderModal({ onClose, pdfSource, title }: PdfReaderModalProps) {
  const { theme } = useTheme();
  const { isRTL } = useLocale();

  const [showSidebar, setShowSidebar] = useState(false);
  const [bookmarks, setBookmarks] = useState<number[]>([]);
  const [sidebarTab, setSidebarTab] = useState<"bookmarks">("bookmarks");
  const [currentPage, setCurrentPage] = useState(1);
  const [numPages, setNumPages] = useState<number | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Load bookmarks from localStorage
  useEffect(() => {
    if (!pdfSource) return;
    const saved = localStorage.getItem(`pdf_bookmarks_${pdfSource}`);
    if (saved) { try { setBookmarks(JSON.parse(saved)); } catch {} }
  }, [pdfSource]);

  // Save bookmarks to localStorage
  useEffect(() => {
    if (pdfSource) localStorage.setItem(`pdf_bookmarks_${pdfSource}`, JSON.stringify(bookmarks));
  }, [bookmarks, pdfSource]);

  // Try to get page info from the PDF (via pdf.js for page count only)
  useEffect(() => {
    if (!pdfSource) return;
    const loadPageCount = async () => {
      try {
        const pdfjsLib = await import("pdfjs-dist");
        pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
        const pdf = await pdfjsLib.getDocument(pdfSource).promise;
        setNumPages(pdf.numPages);
      } catch (e) {
        console.warn("Could not get page count:", e);
      }
    };
    loadPageCount();
  }, [pdfSource]);

  const toggleBookmark = () => {
    const page = currentPage;
    const next = bookmarks.includes(page)
      ? bookmarks.filter((p) => p !== page)
      : [...bookmarks, page].sort((a, b) => a - b);
    setBookmarks(next);
    setShowSidebar(true);
  };

  const goToPage = (page: number) => {
    setCurrentPage(page);
    if (iframeRef.current && pdfSource) {
      iframeRef.current.src = `${pdfSource}#page=${page}`;
    }
  };

  const isSimulated = !pdfSource;

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
        .pdf-side::-webkit-scrollbar{width:6px}
        .pdf-side::-webkit-scrollbar-track{background:transparent}
        .pdf-side::-webkit-scrollbar-thumb{background:rgba(255,255,255,.15);border-radius:3px}
      `}</style>

      {/* ── HEADER ── */}
      <div
        className="shrink-0 flex items-center justify-between px-6"
        style={{ height: 56, backgroundColor: "#323639", borderBottom: "1px solid #1a1a1a", zIndex: 10, color: "#fff" }}
      >
        <div className="flex items-center gap-4">
          <button className="pdf-btn" onClick={() => setShowSidebar(!showSidebar)}
            style={{ backgroundColor: showSidebar ? "rgba(255,255,255,.1)" : "transparent" }}>
            {showSidebar ? <PanelLeftClose size={20} /> : <PanelLeft size={20} />}
          </button>
          <span style={{ fontSize: 15, fontWeight: 700, letterSpacing: ".5px" }}>{title || "Document Viewer"}</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Bookmark current page */}
          <button className="pdf-btn" onClick={toggleBookmark} title="Bookmark this page">
            <Bookmark size={18} className={bookmarks.includes(currentPage) ? "fill-blue-500 text-blue-500" : ""} />
          </button>
          {/* Close */}
          <button className="pdf-btn" onClick={onClose} style={{ backgroundColor: "#dc2626", borderRadius: 10 }}>
            <X size={20} />
          </button>
        </div>
      </div>

      {/* ── BODY ── */}
      <div className="flex-1 flex overflow-hidden">
        {/* ── SIDEBAR ── */}
        {showSidebar && (
          <div className="w-56 shrink-0 flex flex-col border-r border-black/40 bg-[#2a2d2e]" style={{ color: "#fff" }}>
            <div className="shrink-0 px-4 pt-4 pb-2">
              <div className="text-xs font-bold text-white/40 uppercase tracking-wider mb-3">
                {numPages ? `${numPages} pages` : "Pages"}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-3 pb-4 pdf-side">
              {/* Page list */}
              {numPages && (
                <div className="flex flex-col gap-1 mb-4">
                  {Array.from({ length: numPages }, (_, i) => {
                    const pg = i + 1;
                    const isActive = pg === currentPage;
                    const isBookmarked = bookmarks.includes(pg);
                    return (
                      <button
                        key={pg}
                        onClick={() => goToPage(pg)}
                        className="flex items-center justify-between px-3 py-2.5 rounded-lg transition-all cursor-pointer"
                        style={{
                          backgroundColor: isActive ? "rgba(59,130,246,.15)" : "transparent",
                          border: isActive ? "1px solid rgba(59,130,246,.3)" : "1px solid transparent",
                          outline: "none",
                          width: "100%",
                          textAlign: "start",
                        }}
                      >
                        <span style={{ fontSize: 14, fontWeight: isActive ? 700 : 500, color: isActive ? "#60a5fa" : "rgba(255,255,255,.7)" }}>
                          Page {pg}
                        </span>
                        {isBookmarked && <Bookmark size={12} className="fill-blue-500 text-blue-500" />}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Bookmarks section */}
              <div className="border-t border-white/10 pt-3">
                <div className="text-xs font-bold text-white/40 uppercase tracking-wider mb-2 px-1">Bookmarks</div>
                {bookmarks.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-6 gap-2 opacity-30">
                    <Bookmark size={24} color="#fff" />
                    <span className="text-xs text-center text-white">No bookmarks</span>
                  </div>
                ) : (
                  <div className="flex flex-col gap-1">
                    {bookmarks.map((p) => (
                      <div
                        key={p}
                        className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 cursor-pointer group"
                        onClick={() => goToPage(p)}
                      >
                        <div className="flex items-center gap-2">
                          <Bookmark size={12} className="fill-blue-500 text-blue-500" />
                          <span className="text-sm font-bold text-white/80">Page {p}</span>
                        </div>
                        <button
                          className="p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-400 bg-transparent border-none text-white cursor-pointer"
                          onClick={(e) => { e.stopPropagation(); setBookmarks((b) => b.filter((x) => x !== p)); }}
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── PDF VIEWER (native browser engine) ── */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {isSimulated ? (
            <div className="flex-1 flex items-center justify-center" style={{ color: "#fff" }}>
              <p>Select a PDF to view.</p>
            </div>
          ) : (
            <iframe
              ref={iframeRef}
              src={pdfSource}
              title={title || "PDF Document"}
              style={{
                width: "100%",
                height: "100%",
                border: "none",
                backgroundColor: "#525659",
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}

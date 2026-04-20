import { useState, useEffect, useRef, useCallback } from "react";
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Download, Printer, Loader2, Info, Star, Bookmark, PanelLeft, PanelLeftClose, Book, BookOpen } from "lucide-react";
import { useTheme, TYPE_SCALE, WEIGHT, SHADOW } from "./ThemeContext";
import { useLocale } from "./i18n";
import { Document, Page, pdfjs } from "react-pdf";

// Correct path for react-pdf CSS in modern versions
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

// Set up the worker for react-pdf with the version-matched ESM worker
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
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.4);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [useFallback, setUseFallback] = useState(false);
  const [inputPage, setInputPage] = useState("1");
  const [showSidebar, setShowSidebar] = useState(false);
  const [bookmarks, setBookmarks] = useState<number[]>([]);
  const [sidebarTab, setSidebarTab] = useState<'pages' | 'bookmarks'>('pages');
  
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const pageRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const isProgrammaticScroll = useRef(false);
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load saved page on mount or source change
  useEffect(() => {
    if (pdfSource) {
      const savedPage = localStorage.getItem(`pdf_page_${pdfSource}`);
      if (savedPage) {
        const page = parseInt(savedPage, 10);
        setPageNumber(page);
        setInputPage(page.toString());
      } else {
        setPageNumber(1);
        setInputPage("1");
      }
    }
  }, [pdfSource]);

  // Save/Load bookmarks
  useEffect(() => {
    if (pdfSource) {
      const saved = localStorage.getItem(`pdf_bookmarks_${pdfSource}`);
      if (saved) setBookmarks(JSON.parse(saved));
      else setBookmarks([]);
    }
  }, [pdfSource]);

  useEffect(() => {
    if (pdfSource) {
      localStorage.setItem(`pdf_bookmarks_${pdfSource}`, JSON.stringify(bookmarks));
    }
  }, [bookmarks, pdfSource]);

  // Scroll to a specific page
  const scrollToPage = useCallback((page: number) => {
    const el = pageRefs.current.get(page);
    const container = scrollContainerRef.current;
    if (el && container) {
      isProgrammaticScroll.current = true;
      // Calculate position relative to scroll container, not the viewport
      const targetTop = el.offsetTop - container.offsetTop;
      container.scrollTo({
        top: targetTop,
        behavior: "smooth"
      });
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
      scrollTimeoutRef.current = setTimeout(() => {
        isProgrammaticScroll.current = false;
      }, 800);
    }
  }, []);

  // When pageNumber changes via nav buttons, scroll to that page
  const navigateToPage = useCallback((page: number) => {
    setPageNumber(page);
    setInputPage(page.toString());
    if (pdfSource) {
      localStorage.setItem(`pdf_page_${pdfSource}`, page.toString());
    }
    scrollToPage(page);
  }, [pdfSource, scrollToPage]);

  // Track visible page via scroll position
  const handleScroll = useCallback(() => {
    if (isProgrammaticScroll.current || !scrollContainerRef.current || !numPages) return;
    
    const container = scrollContainerRef.current;
    const containerTop = container.scrollTop;
    const containerHeight = container.clientHeight;
    const viewMidpoint = containerTop + containerHeight * 0.35; // Read at ~35% from top
    
    let closestPage = 1;
    let minDist = Infinity;
    
    pageRefs.current.forEach((el, pageNum) => {
      const elTop = el.offsetTop;
      const elMid = elTop + el.offsetHeight / 2;
      const dist = Math.abs(elMid - viewMidpoint);
      if (dist < minDist) {
        minDist = dist;
        closestPage = pageNum;
      }
    });
    
    if (closestPage !== pageNumber) {
      setPageNumber(closestPage);
      setInputPage(closestPage.toString());
      if (pdfSource) {
        localStorage.setItem(`pdf_page_${pdfSource}`, closestPage.toString());
      }
    }
  }, [numPages, pageNumber, pdfSource]);

  // Scroll to saved page once document loads
  useEffect(() => {
    if (numPages && pageNumber > 1) {
      // Small delay to let pages render
      const timer = setTimeout(() => {
        scrollToPage(pageNumber);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [numPages]); // Only run when doc first loads

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setLoading(false);
    setError(null);
    setUseFallback(false);
  };

  const onDocumentLoadError = (err: Error) => {
    console.error("PDF Load Error:", err);
    setLoading(false);
    setError(`Technical Issue: ${err.message || "Engine initialization failed"}`);
  };

  const handleZoomIn = () => setScale(prev => Math.min(prev + 0.15, 3.0));
  const handleZoomOut = () => setScale(prev => Math.max(prev - 0.15, 0.5));

  const handlePageInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const val = parseInt(inputPage, 10);
      if (!isNaN(val) && val > 0 && val <= (numPages || 1)) {
        navigateToPage(val);
      } else {
        setInputPage(pageNumber.toString());
      }
    }
  };

  const goToNextPage = () => {
    const next = Math.min(pageNumber + 1, numPages || 1);
    navigateToPage(next);
  };
  const goToPrevPage = () => {
    const prev = Math.max(pageNumber - 1, 1);
    navigateToPage(prev);
  };

  const toggleBookmark = () => {
    let newBookmarks;
    if (bookmarks.includes(pageNumber)) {
      newBookmarks = bookmarks.filter(p => p !== pageNumber);
    } else {
      newBookmarks = [...bookmarks, pageNumber].sort((a, b) => a - b);
    }
    setBookmarks(newBookmarks);
    setSidebarTab('bookmarks');
    setShowSidebar(true);
  };

  // Register a page ref
  const setPageRef = useCallback((pageNum: number, el: HTMLDivElement | null) => {
    if (el) {
      pageRefs.current.set(pageNum, el);
    } else {
      pageRefs.current.delete(pageNum);
    }
  }, []);

  // If no source is provided, use a placeholder
  const isSimulated = !pdfSource;

  return (
    <div
      className="absolute inset-0 z-[100] flex flex-col overflow-hidden"
      style={{
        backgroundColor: "#525659", 
        animation: "pdfReaderIn 0.25s ease-out",
        zIndex: 1000,
      }}
    >
      <style>{`
        @keyframes pdfReaderIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .pdf-toolbar-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
          border: none;
          background: transparent;
          color: #fff;
        }
        .pdf-toolbar-btn:hover {
          background-color: rgba(255,255,255,0.1);
        }
        .pdf-toolbar-btn:active {
          background-color: rgba(255,255,255,0.15);
          transform: scale(0.95);
        }
        .react-pdf__Document {
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 100%;
        }
        .react-pdf__Page {
          box-shadow: 0 4px 24px -4px rgba(0, 0, 0, 0.4);
          background-color: white;
        }
        .pdf-page-wrapper {
          display: flex;
          justify-content: center;
          padding: 20px 0;
        }
        .pdf-page-wrapper:first-child {
          padding-top: 30px;
        }
        .pdf-page-wrapper:last-child {
          padding-bottom: 100px;
        }
        .page-input {
          background-color: rgba(255,255,255,0.1);
          border: 1px solid rgba(255,255,255,0.2);
          color: white;
          width: 50px;
          text-align: center;
          border-radius: 4px;
          font-weight: bold;
          outline: none;
          padding: 4px;
          font-size: 14px;
        }
        .page-input:focus {
          border-color: white;
          background-color: rgba(255,255,255,0.2);
        }
        .pdf-scroll-container::-webkit-scrollbar {
          width: 10px;
        }
        .pdf-scroll-container::-webkit-scrollbar-track {
          background: rgba(0,0,0,0.1);
        }
        .pdf-scroll-container::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.2);
          border-radius: 5px;
        }
        .pdf-scroll-container::-webkit-scrollbar-thumb:hover {
          background: rgba(255,255,255,0.35);
        }
        .pdf-sidebar-scroll::-webkit-scrollbar {
          width: 6px;
        }
        .pdf-sidebar-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .pdf-sidebar-scroll::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.15);
          border-radius: 3px;
        }
      `}</style>

      {/* Top Header */}
      <div
        className="flex items-center justify-between shrink-0 px-6"
        style={{
          height: "64px",
          backgroundColor: "#323639",
          borderBottom: "1px solid #1a1a1a",
          zIndex: 10,
          color: "#fff"
        }}
      >
        <div className="flex items-center gap-4">
          <button 
            className="pdf-toolbar-btn" 
            title="Toggle Sidebar" 
            onClick={() => setShowSidebar(!showSidebar)}
            style={{ backgroundColor: showSidebar ? "rgba(255,255,255,0.1)" : "transparent" }}
          >
            {showSidebar ? <PanelLeftClose size={22} color="#fff" /> : <PanelLeft size={22} color="#fff" />}
          </button>
          <span style={{ fontSize: "16px", fontWeight: 700, letterSpacing: "0.5px" }}>
            {title || "Document Viewer"}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={onClose} 
            className="pdf-toolbar-btn" 
            style={{ backgroundColor: "#dc2626", borderRadius: "10px" }} 
          >
            <X size={20} color="#fff" />
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {showSidebar && (
          <div className="w-80 shrink-0 flex flex-col border-r border-black/40 bg-[#2a2d2e]">
            <div className="flex border-b border-black/20 bg-black/10">
              <button 
                onClick={() => setSidebarTab('pages')}
                className={`flex-1 p-3 text-center text-xs font-bold transition-colors ${sidebarTab === 'pages' ? "text-white border-b-2 border-blue-500" : "text-white/40 hover:text-white/60"}`}
              >
                PAGES
              </button>
              <button 
                onClick={() => setSidebarTab('bookmarks')}
                className={`flex-1 p-3 text-center text-xs font-bold transition-colors ${sidebarTab === 'bookmarks' ? "text-white border-b-2 border-blue-500" : "text-white/40 hover:text-white/60"}`}
              >
                BOOKMARKS
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 pdf-sidebar-scroll">
              {sidebarTab === 'pages' ? (
                <div className="space-y-4">
                  {Array.from(new Array(numPages), (el, index) => (
                    <div 
                      key={`thumb_${index + 1}`}
                      className={`cursor-pointer rounded-lg p-2 border-2 transition-all ${pageNumber === index + 1 ? "border-blue-500 bg-blue-500/10" : "border-transparent hover:bg-white/5"}`}
                      onClick={() => navigateToPage(index + 1)}
                    >
                      <div className="flex flex-col items-center gap-2">
                        <Document file={{ url: pdfSource }} loading={null}>
                          <Page pageNumber={index + 1} width={220} renderTextLayer={false} renderAnnotationLayer={false} loading="" />
                        </Document>
                        <span className="text-xs text-white/50">{index + 1}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {bookmarks.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-10 gap-3 opacity-30">
                      <Bookmark size={32} />
                      <span className="text-xs text-center text-white">No bookmarks yet.<br/>Use the button in the toolbar.</span>
                    </div>
                  ) : (
                    bookmarks.map((p) => (
                      <div 
                        key={`bookmark_${p}`}
                        className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 cursor-pointer group"
                        onClick={() => navigateToPage(p)}
                      >
                        <div className="flex items-center gap-3">
                          <Bookmark size={14} className="fill-blue-500 text-blue-500" />
                          <span className="text-sm font-bold text-white/80">Page {p}</span>
                        </div>
                        <button 
                          className="p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-400 bg-transparent border-none text-white cursor-pointer"
                          onClick={(e) => { e.stopPropagation(); setBookmarks(bookmarks.filter(b => b !== p)); }}
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Main PDF content area — vertical scroll */}
        <div 
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto pdf-scroll-container relative"
          style={{ backgroundColor: "#525659" }}
        >
          {loading && !isSimulated && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white gap-4 z-0 pointer-events-none">
              <Loader2 className="animate-spin text-blue-400" size={56} />
              <span style={{ fontSize: "18px", fontWeight: 500 }}>Loading Document...</span>
            </div>
          )}

          {error && !isSimulated && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-10 text-center gap-6 z-0">
              <X size={64} className="text-red-400" />
              <h3 style={{ fontSize: "24px", fontWeight: 700 }}>Error Loading PDF</h3>
              <button onClick={() => { setError(null); setLoading(true); }} className="px-8 py-3 bg-white text-gray-900 rounded-lg font-bold border-none cursor-pointer">Try Again</button>
            </div>
          )}

          {isSimulated ? (
            <div className="pdf-page-wrapper">
              <div className="bg-white shadow-2xl p-20" style={{ width: `${210 * scale}mm`, minHeight: `${297 * scale}mm` }}>
                <h1 className="text-4xl font-bold mb-10">Sample Document</h1>
                <p>Please select a PDF to view content.</p>
              </div>
            </div>
          ) : useFallback ? (
            <div className="w-full h-full p-4">
              <iframe src={pdfSource} className="w-full h-full border-0 rounded-xl bg-white" title="PDF Fallback" />
            </div>
          ) : (
            <Document
              file={{ url: pdfSource }}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={onDocumentLoadError as any}
              loading={null}
            >
              {numPages && Array.from(new Array(numPages), (_, index) => {
                const pg = index + 1;
                return (
                  <div
                    key={`page_${pg}`}
                    className="pdf-page-wrapper"
                    ref={(el) => setPageRef(pg, el)}
                  >
                    <Page 
                      pageNumber={pg} 
                      scale={scale} 
                      renderAnnotationLayer={false}
                      renderTextLayer={true}
                    />
                  </div>
                );
              })}
            </Document>
          )}
        </div>
      </div>

      {/* Bottom Toolbar */}
      <div
        className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 px-6 py-3"
        style={{
          backgroundColor: "rgba(40, 44, 47, 0.95)",
          backdropFilter: "blur(20px)",
          borderRadius: "16px",
          border: "1px solid rgba(255,255,255,0.15)",
          boxShadow: "0 10px 40px rgba(0,0,0,0.4)",
          zIndex: 100,
          color: "#fff"
        }}
      >
        <div className="flex items-center gap-2">
          <button className="pdf-toolbar-btn" onClick={handleZoomOut}><ZoomOut size={18} /></button>
          <span className="text-xs font-bold w-10 text-center">{Math.round(scale * 100)}%</span>
          <button className="pdf-toolbar-btn" onClick={handleZoomIn}><ZoomIn size={18} /></button>
        </div>

        <div className="flex items-center gap-2 border-l border-white/10 pl-4">
          <button onClick={goToPrevPage} disabled={pageNumber <= 1} className="pdf-toolbar-btn" style={{ opacity: pageNumber <= 1 ? 0.3 : 1 }}>
            {isRTL ? <ChevronRight size={22} /> : <ChevronLeft size={22} />}
          </button>
          <div className="flex items-center gap-1.5 px-2">
            <input className="page-input" value={inputPage} onChange={(e) => setInputPage(e.target.value)} onKeyDown={handlePageInput} />
            <span className="text-white/30 text-sm">/</span>
            <span className="text-sm font-bold">{numPages || "--"}</span>
          </div>
          <button onClick={goToNextPage} disabled={pageNumber >= (numPages || 1)} className="pdf-toolbar-btn" style={{ opacity: pageNumber >= (numPages || 1) ? 0.3 : 1 }}>
            {isRTL ? <ChevronLeft size={22} /> : <ChevronRight size={22} />}
          </button>
        </div>

        <div className="flex items-center gap-1 border-l border-white/10 pl-4">
          <button className="pdf-toolbar-btn" onClick={toggleBookmark}>
            <Bookmark size={18} className={bookmarks.includes(pageNumber) ? "fill-blue-500 text-blue-500" : ""} />
          </button>
        </div>
      </div>
    </div>
  );
}

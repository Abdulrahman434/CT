import { useState, useEffect, useRef } from "react";
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
  const [scale, setScale] = useState(1.6);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [useFallback, setUseFallback] = useState(false);
  const [inputPage, setInputPage] = useState("1");
  const [showSidebar, setShowSidebar] = useState(false);
  const [dualPage, setDualPage] = useState(false); // New state for 2-page layout
  const [bookmarks, setBookmarks] = useState<number[]>([]);
  const [sidebarTab, setSidebarTab] = useState<'pages' | 'bookmarks'>('pages'); // Tabs for sidebar
  
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isProgrammaticScroll = useRef(false);

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

  // Save page whenever it changes and scroll to it
  useEffect(() => {
    if (pdfSource && pageNumber) {
      localStorage.setItem(`pdf_page_${pdfSource}`, pageNumber.toString());
      setInputPage(pageNumber.toString());
      
      // Auto-scroll to the page in the horizontal container
      if (scrollContainerRef.current && !isProgrammaticScroll.current) {
        const bundles = scrollContainerRef.current.querySelectorAll('.pdf-page-container');
        const targetIndex = dualPage ? Math.floor((pageNumber - 1) / 2) : pageNumber - 1;
        const target = bundles[targetIndex] as HTMLElement;
        if (target) {
          isProgrammaticScroll.current = true;
          scrollContainerRef.current.scrollTo({
            left: target.offsetLeft - 40,
            behavior: "smooth"
          });
          // Reset after animation
          setTimeout(() => { isProgrammaticScroll.current = false; }, 600);
        }
      }
    }
  }, [pageNumber, pdfSource, dualPage]);

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

  const handleZoomIn = () => setScale(prev => Math.min(prev + 0.1, 2.0));
  const handleZoomOut = () => setScale(prev => Math.max(prev - 0.1, 0.5));

  const handlePageInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const val = parseInt(inputPage, 10);
      if (!isNaN(val) && val > 0 && val <= (numPages || 1)) {
        setPageNumber(val);
      } else {
        setInputPage(pageNumber.toString());
      }
    }
  };

  const goToNextPage = () => setPageNumber(prev => Math.min(prev + 1, numPages || 1));
  const goToPrevPage = () => setPageNumber(prev => Math.max(prev - 1, 1));

  const toggleBookmark = () => {
    let newBookmarks;
    if (bookmarks.includes(pageNumber)) {
      newBookmarks = bookmarks.filter(p => p !== pageNumber);
    } else {
      newBookmarks = [...bookmarks, pageNumber].sort((a, b) => a - b);
    }
    setBookmarks(newBookmarks);
    setSidebarTab('bookmarks'); // Open bookmarks tab when bookmarking
    setShowSidebar(true);
  };

  // If no source is provided, use the hardcoded whitepaper sample simulation
  const isSimulated = !pdfSource;

  return (
    <div
      className="absolute inset-0 z-[100] flex flex-col"
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
          padding: 40px 0;
          width: 100%;
        }
        .react-pdf__Page {
          box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.5);
          margin-bottom: 20px;
          background-color: white;
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
        }
        .pdf-viewer-horizontal {
          display: flex;
          flex-direction: row;
          align-items: flex-start;
          padding: 40px;
          gap: 24px;
          scroll-snap-type: x mandatory;
          -webkit-overflow-scrolling: touch;
        }
        .pdf-page-container {
          scroll-snap-align: center;
          flex-shrink: 0;
          display: flex;
          gap: 8px;
          justify-content: center;
        }
        .page-input:focus {
          border-color: white;
          background-color: rgba(255,255,255,0.2);
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
          <div 
            className="pdf-toolbar-btn" 
            title="Toggle Sidebar" 
            onClick={() => setShowSidebar(!showSidebar)}
            style={{ backgroundColor: showSidebar ? "rgba(255,255,255,0.1)" : "transparent" }}
          >
            {showSidebar ? <PanelLeftClose size={22} color="#fff" /> : <PanelLeft size={22} color="#fff" />}
          </div>
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
            
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
              {sidebarTab === 'pages' ? (
                <div className="space-y-4">
                  {Array.from(new Array(numPages), (el, index) => (
                    <div 
                      key={`thumb_${index + 1}`}
                      className={`cursor-pointer rounded-lg p-2 border-2 transition-transform ${pageNumber === index + 1 ? "border-blue-500 bg-blue-500/10" : "border-transparent hover:bg-white/5"}`}
                      onClick={() => setPageNumber(index + 1)}
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
                      <span className="text-xs text-center">No bookmarks yet.<br/>Use the button in the toolbar.</span>
                    </div>
                  ) : (
                    bookmarks.map((p) => (
                      <div 
                        key={`bookmark_${p}`}
                        className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 cursor-pointer group"
                        onClick={() => setPageNumber(p)}
                      >
                        <div className="flex items-center gap-3">
                          <Bookmark size={14} className="fill-blue-500 text-blue-500" />
                          <span className="text-sm font-bold text-white/80">Page {p}</span>
                        </div>
                        <button 
                          className="p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-400"
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

        <div 
          ref={scrollContainerRef}
          onScroll={(e) => {
            if (isProgrammaticScroll.current) return;
            const container = e.currentTarget;
            const scrollLeft = container.scrollLeft;
            const bundles = container.querySelectorAll('.pdf-page-container');
            if (bundles.length > 0) {
              let closestIndex = 0;
              let minDiff = Infinity;
              bundles.forEach((b, i) => {
                const diff = Math.abs((b as HTMLElement).offsetLeft - 40 - scrollLeft);
                if (diff < minDiff) {
                  minDiff = diff;
                  closestIndex = i;
                }
              });
              const newPage = dualPage ? closestIndex * 2 + 1 : closestIndex + 1;
              if (newPage !== pageNumber && newPage <= (numPages || 1)) {
                setPageNumber(newPage);
              }
            }
          }}
          className="flex-1 overflow-x-auto pdf-viewer-horizontal relative"
          style={{ scrollBehavior: "smooth", backgroundColor: "#525659" }}
        >
        {loading && !isSimulated && (
          <div className="fixed inset-0 flex flex-col items-center justify-center text-white gap-4 z-0 pointer-events-none" style={{ left: showSidebar ? "320px" : "0" }}>
            <Loader2 className="animate-spin text-blue-400" size={56} />
            <span style={{ fontSize: "18px", fontWeight: 500 }}>Loading Document...</span>
          </div>
        )}

        {error && !isSimulated && (
          <div className="fixed inset-0 flex flex-col items-center justify-center text-white p-10 text-center gap-6 z-0" style={{ left: showSidebar ? "320px" : "0" }}>
            <X size={64} className="text-red-400" />
            <h3 style={{ fontSize: "24px", fontWeight: 700 }}>Error Loading PDF</h3>
            <button onClick={() => { setError(null); setLoading(true); }} className="px-8 py-3 bg-white text-gray-900 rounded-lg font-bold">Try Again</button>
          </div>
        )}

        {isSimulated ? (
           <div className="pdf-page-container">
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
            {/* Logic for 2-page or 1-page horizontal scrolling/swiping */}
            {numPages && Array.from(new Array(Math.ceil(numPages / (dualPage ? 2 : 1))), (el, i) => {
              const startPage = dualPage ? i * 2 + 1 : i + 1;
              const isCurrent = dualPage ? (pageNumber === startPage || pageNumber === startPage + 1) : pageNumber === startPage;
              
              return (
                <div key={`bundle_${i}`} className="pdf-page-container">
                  <Page 
                    pageNumber={startPage} 
                    scale={scale} 
                    renderAnnotationLayer={false}
                    renderTextLayer={true}
                  />
                  {dualPage && startPage + 1 <= numPages && (
                    <Page 
                      pageNumber={startPage + 1} 
                      scale={scale} 
                      renderAnnotationLayer={false}
                      renderTextLayer={true}
                    />
                  )}
                </div>
              );
            })}
          </Document>
        )}
        <div className="w-20 shrink-0" /> 
      </div>
    </div>

      {/* Bottom Toolbar */}
      <div
        className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 px-6 py-3"
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
          <div className="pdf-toolbar-btn" onClick={handleZoomOut}><ZoomOut size={18} /></div>
          <span className="text-xs font-bold w-10 text-center">{Math.round(scale * 100)}%</span>
          <div className="pdf-toolbar-btn" onClick={handleZoomIn}><ZoomIn size={18} /></div>
          
          <div className="border-l border-white/10 h-6 mx-1" />
          
          <button 
            onClick={() => setDualPage(!dualPage)} 
            className="pdf-toolbar-btn px-2" 
            title={dualPage ? "Switch to single page" : "Switch to dual page"}
            style={{ backgroundColor: dualPage ? "rgba(255,255,255,0.15)" : "transparent" }}
          >
            {dualPage ? <BookOpen size={20} /> : <Book size={20} />}
          </button>
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
          <div className="pdf-toolbar-btn" onClick={toggleBookmark}>
            <Bookmark size={18} className={bookmarks.includes(pageNumber) ? "fill-blue-500 text-blue-500" : ""} />
          </div>
        </div>
      </div>
    </div>
  );
}

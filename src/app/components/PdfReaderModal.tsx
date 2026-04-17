import { useState, useEffect, useRef } from "react";
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Download, Printer, Loader2, Info, Star, Bookmark, PanelLeft, PanelLeftClose } from "lucide-react";
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
  const [bookmarks, setBookmarks] = useState<number[]>([]);
  
  const scrollContainerRef = useRef<HTMLDivElement>(null);

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

  // Save page whenever it changes
  useEffect(() => {
    if (pdfSource && pageNumber) {
      localStorage.setItem(`pdf_page_${pdfSource}`, pageNumber.toString());
      setInputPage(pageNumber.toString());
    }
  }, [pageNumber, pdfSource]);

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
    if (bookmarks.includes(pageNumber)) {
      setBookmarks(bookmarks.filter(p => p !== pageNumber));
    } else {
      setBookmarks([...bookmarks, pageNumber].sort((a, b) => a - b));
    }
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
              <div className="flex-1 p-3 text-center text-xs font-bold text-white/40">PAGES</div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
              {Array.from(new Array(numPages), (el, index) => (
                <div 
                  key={`thumb_${index + 1}`}
                  className={`cursor-pointer rounded-lg p-2 border-2 transition-all ${pageNumber === index + 1 ? "border-blue-500 bg-blue-500/10" : "border-transparent hover:bg-white/5"}`}
                  onClick={() => setPageNumber(index + 1)}
                >
                  <div className="flex flex-col items-center gap-2">
                    <Document file={{ url: pdfSource }} loading={null}>
                      <Page pageNumber={index + 1} width={240} renderTextLayer={false} renderAnnotationLayer={false} loading="" />
                    </Document>
                    <span className="text-xs text-white/50">{index + 1}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div 
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto flex flex-col items-center relative"
          style={{ scrollBehavior: "smooth", backgroundColor: "#525659" }}
        >
        {loading && !isSimulated && (
          <div className="flex-1 flex flex-col items-center justify-center text-white gap-4">
            <Loader2 className="animate-spin text-blue-400" size={56} />
            <span style={{ fontSize: "18px", fontWeight: 500 }}>Loading Document...</span>
          </div>
        )}

        {error && !isSimulated && (
          <div className="flex-1 flex flex-col items-center justify-center text-white p-10 text-center gap-6">
            <X size={64} className="text-red-400" />
            <h3 style={{ fontSize: "24px", fontWeight: 700 }}>Error Loading PDF</h3>
            <button onClick={() => { setError(null); setLoading(true); }} className="px-8 py-3 bg-white text-gray-900 rounded-lg font-bold">Try Again</button>
          </div>
        )}

        {isSimulated ? (
           <div className="py-10 px-4 flex flex-col items-center w-full">
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
            <Page 
              pageNumber={pageNumber} 
              scale={scale} 
              renderAnnotationLayer={false}
              renderTextLayer={true}
            />
          </Document>
        )}
        <div className="h-20 shrink-0" /> 
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

import { useState, useEffect, useRef } from "react";
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Download, Printer, Loader2, Info, Star, Bookmark, PanelLeft, PanelLeftClose, Columns, BookOpen as BookIcon, ScrollText, Layers } from "lucide-react";
import { useTheme, TYPE_SCALE, WEIGHT, SHADOW } from "./ThemeContext";
import { useLocale } from "./i18n";
import BecauseYouAreAllah from "@/assets/because-you-are-allah.pdf";
import * as Slider from "@radix-ui/react-slider";
import { Document, Page, pdfjs } from "react-pdf";

// Correct path for react-pdf CSS in modern versions
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

// Set up the worker for react-pdf with the legacy compatible version
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
  const [isTwoPage, setIsTwoPage] = useState(false);
  const [isContinuous, setIsContinuous] = useState(false);
  const [inputPage, setInputPage] = useState("1");
  const [showSidebar, setShowSidebar] = useState(false);
  const [bookmarks, setBookmarks] = useState<number[]>([]);
  
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const pageRefs = useRef<{[key: number]: HTMLDivElement | null}>({});

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

  // Handle intersection observer for continuous scroll tracking
  useEffect(() => {
    if (!isContinuous || !numPages) return;

    const options = {
      root: scrollContainerRef.current,
      threshold: 0.1, // Trigger when 10% of the page is visible
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const pageNum = parseInt(entry.target.getAttribute("data-page-number") || "1", 10);
          // We only update if it's the most prominent one or based on some logic
          // Simple approach: set page number to the one that just entered
          setPageNumber(pageNum);
        }
      });
    }, options);

    // Observe all page wrappers
    Object.values(pageRefs.current).forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, [isContinuous, numPages]);

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

  const handleSliderChange = (values: number[]) => {
    const newPage = values[0];
    setPageNumber(newPage);
  };

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

  const goToNextPage = () => {
    const step = isTwoPage ? 2 : 1;
    setPageNumber(prev => Math.min(prev + step, numPages || 1));
  };

  const goToPrevPage = () => {
    const step = isTwoPage ? 2 : 1;
    setPageNumber(prev => Math.max(prev - step, 1));
  };

  const toggleTwoPage = () => {
    setIsTwoPage(!isTwoPage);
    setIsContinuous(false); // Disable continuous when switching to two-page
    // Adjust page number to be odd when switching to two-page for better alignment
    if (!isTwoPage && pageNumber % 2 === 0 && pageNumber > 1) {
      setPageNumber(pageNumber - 1);
    }
  };

  const toggleContinuous = () => {
    const nextContinuous = !isContinuous;
    setIsContinuous(nextContinuous);
    if (nextContinuous) {
      setIsTwoPage(false);
    }
  };

  const toggleBookmark = () => {
    if (bookmarks.includes(pageNumber)) {
      setBookmarks(bookmarks.filter(p => p !== pageNumber));
    } else {
      setBookmarks([...bookmarks, pageNumber].sort((a, b) => a - b));
    }
  };

  const swipeStartX = useRef<number | null>(null);
  const handleSwipeStart = (e: React.PointerEvent) => {
    swipeStartX.current = e.clientX;
  };
  const handleSwipeEnd = (e: React.PointerEvent) => {
    if (swipeStartX.current === null) return;
    const deltaX = e.clientX - swipeStartX.current;
    swipeStartX.current = null;
    const threshold = 50;
    if (deltaX > threshold) goToPrevPage();
    else if (deltaX < -threshold) goToNextPage();
  };

  // If no source is provided, use the hardcoded whitepaper sample simulation
  const isSimulated = !pdfSource;

  return (
    <div
      className="absolute inset-0 z-[100] flex flex-col"
      style={{
        backgroundColor: "#525659", // Darker PDF viewer bg
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
        .SliderRoot {
          position: relative;
          display: flex;
          align-items: center;
          user-select: none;
          touch-action: none;
          width: 200px;
          height: 20px;
        }
        .SliderTrack {
          background-color: rgba(255,255,255,0.2);
          position: relative;
          flex-grow: 1;
          border-radius: 9999px;
          height: 4px;
        }
        .SliderRange {
          position: absolute;
          background-color: white;
          border-radius: 9999px;
          height: 100%;
        }
        .SliderThumb {
          display: block;
          width: 14px;
          height: 14px;
          background-color: white;
          box-shadow: 0 2px 10px rgba(0,0,0,0.5);
          border-radius: 10px;
        }
        .react-pdf__Document {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 40px 0;
          width: 100%;
        }
        .pdf-page-wrapper {
          display: flex;
          flex-direction: row;
          gap: 20px;
          justify-content: center;
          transition: all 0.3s ease;
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

      {/* Top Header - Just Metadata and Sidebar Toggle */}
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

      {/* Main Content Area: Sidebar + Scroll Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        {showSidebar && (
          <div 
            className="w-80 shrink-0 flex flex-col border-r border-black/40 bg-[#2a2d2e] transition-all duration-300 transform"
            style={{ animation: "slideInLeft 0.3s ease-out" }}
          >
            <style>{`
              @keyframes slideInLeft {
                from { opacity: 0; transform: translateX(-20px); }
                to { opacity: 1; transform: translateX(0); }
              }
              .thumbnail-card {
                cursor: pointer;
                transition: transform 0.2s, background-color 0.2s;
                border: 2px solid transparent;
              }
              .thumbnail-card:hover {
                background-color: rgba(255,255,255,0.05);
              }
              .thumbnail-card.active {
                border-color: #3b82f6;
                background-color: rgba(59, 130, 246, 0.1);
              }
              .sidebar-tab {
                flex: 1;
                padding: 12px;
                text-align: center;
                font-size: 13px;
                font-weight: 600;
                color: rgba(255,255,255,0.4);
                cursor: pointer;
                border-bottom: 2px solid transparent;
              }
              .sidebar-tab.active {
                color: #fff;
                border-bottom-color: #3b82f6;
              }
            `}</style>
            
            <div className="flex border-b border-black/20 bg-black/10">
              <div className="sidebar-tab active">Pages</div>
              <div className="sidebar-tab" onClick={toggleBookmark} style={{ opacity: 0.5 }}>Bookmarks ({bookmarks.length})</div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
              {Array.from(new Array(numPages), (el, index) => (
                <div 
                  key={`thumb_${index + 1}`}
                  className={`thumbnail-card rounded-lg p-2 ${pageNumber === index + 1 ? "active" : ""}`}
                  onClick={() => setPageNumber(index + 1)}
                >
                  <div className="flex flex-col items-center gap-2">
                    <Document file={{ url: pdfSource }} loading={null}>
                      <Page pageNumber={index + 1} width={240} renderTextLayer={false} renderAnnotationLayer={false} loading="" />
                    </Document>
                    <div className="flex items-center justify-between w-full px-2">
                      <span className="text-xs text-white/50">{index + 1}</span>
                      {bookmarks.includes(index + 1) && <Star size={12} className="fill-blue-500 text-blue-500" />}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Scrollable PDF Area */}
        <div 
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto flex flex-col items-center relative touch-none"
          style={{ scrollBehavior: "smooth", backgroundColor: "#525659" }}
          onPointerDown={handleSwipeStart}
          onPointerUp={handleSwipeEnd}
        >
        {loading && !isSimulated && (
          <div className="flex-1 flex flex-col items-center justify-center text-white gap-4">
            <Loader2 className="animate-spin text-blue-400" size={56} />
            <span style={{ fontSize: "18px", fontWeight: 500 }}>Initializing PDF Engine...</span>
          </div>
        )}

        {error && !isSimulated && (
          <div className="flex-1 flex flex-col items-center justify-center text-white p-10 text-center gap-6">
            <div className="bg-red-500/20 p-6 rounded-full border border-red-500/30">
               <X size={64} className="text-red-400" />
            </div>
            <div className="max-w-md">
              <h3 style={{ fontSize: "24px", fontWeight: 700, marginBottom: "8px" }}>Loading Problem</h3>
              <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "14px", lineHeight: 1.5, marginBottom: "16px" }}>
                We had an issue initializing the standard reader. This might be due to device compatibility or a slow connection.
              </p>
              <div 
                className="bg-black/30 p-2 text-xs font-mono rounded overflow-auto mb-4" 
                style={{ maxHeight: 60, whiteSpace: "nowrap", border: "1px solid rgba(255,255,255,0.1)" }}
              >
                {error}
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={() => { setError(null); setLoading(true); }}
                className="px-8 py-3 bg-white text-gray-900 rounded-lg font-bold hover:scale-105 active:scale-95 transition-all"
              >
                Try Again
              </button>
              <button 
                onClick={() => { setUseFallback(true); setError(null); setLoading(false); }}
                className="px-8 py-3 bg-blue-600 text-white rounded-lg font-bold hover:scale-105 active:scale-95 transition-all border border-blue-400/30"
              >
                Switch to Native Viewer
              </button>
            </div>
          </div>
        )}

        {isSimulated ? (
           <div className="py-10 px-4 flex flex-col items-center w-full">
              <div 
                className="bg-white shadow-2xl relative overflow-hidden flex flex-col"
                style={{
                  width: `${210 * scale}mm`,
                  minHeight: `${297 * scale}mm`,
                  padding: `${25 * scale}mm`,
                  boxSizing: "border-box",
                  transformOrigin: "top center",
                  transition: "all 0.2s"
                }}
              >
                <div style={{ color: "#1f2937", lineHeight: 1.6, fontSize: `${16 * scale}px`, fontFamily: "Times New Roman" }}>
                  <h1 style={{ fontSize: `${28 * scale}px`, fontWeight: "bold", marginBottom: 24, textAlign: "center" }}>Sample Document: Whitepaper</h1>
                  <p>This is a simulated view for demonstration. To see real PDFs, please select a PDF book from the Reading menu.</p>
                  <p>If you see this screen after selecting a book, it means the app is in its fallback demonstration mode.</p>
                </div>
              </div>
           </div>
        ) : useFallback ? (
           <div className="w-full h-full flex flex-col p-4">
              <div className="bg-amber-600/20 text-amber-200 px-4 py-2 rounded mb-4 text-sm flex items-center gap-2 border border-amber-600/30">
                <Info size={16} />
                Now using the native browser viewer. Features like zooming and sliders may behave differently.
              </div>
              <iframe 
                src={`${pdfSource}#view=FitH`} 
                className="flex-1 w-full border-none rounded-xl bg-white shadow-2xl" 
                title="Native PDF Viewer"
              />
           </div>
        ) : (
          <Document
            file={{ url: pdfSource }}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={onDocumentLoadError as any}
            loading={null}
            options={{
              cMapUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version}/cmaps/`,
              cMapPacked: true,
            }}
          >
            <div className="pdf-page-wrapper">
              {isContinuous ? (
                Array.from(new Array(numPages), (el, index) => (
                  <div 
                    key={`page_${index + 1}`} 
                    data-page-number={index + 1}
                    ref={el => { pageRefs.current[index + 1] = el; }}
                    style={{ display: "flex", justifyContent: "center", width: "100%" }}
                  >
                    <Page 
                      pageNumber={index + 1} 
                      scale={scale} 
                      renderAnnotationLayer={false}
                      renderTextLayer={true}
                    />
                  </div>
                ))
              ) : (
                <>
                  <Page 
                    pageNumber={pageNumber} 
                    scale={scale} 
                    renderAnnotationLayer={false}
                    renderTextLayer={true}
                  />
                  {isTwoPage && pageNumber + 1 <= (numPages || 0) && (
                    <Page 
                      pageNumber={pageNumber + 1} 
                      scale={scale} 
                      renderAnnotationLayer={false}
                      renderTextLayer={true}
                    />
                  )}
                </>
              )}
            </div>
          </Document>
        )}
        <div className="h-20 shrink-0" /> {/* Spacer for bottom bar */}
      </div>
    </div>

      {/* Bottom Toolbar - Main Controls moved here */}
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

        <div className="w-[1px] h-6 bg-white/10 mx-1" />

        <div className="flex items-center gap-2">
          <button
            onClick={goToPrevPage}
            disabled={pageNumber <= 1}
            className="pdf-toolbar-btn"
            style={{ opacity: pageNumber <= 1 ? 0.3 : 1 }}
          >
            {isRTL ? <ChevronRight size={22} /> : <ChevronLeft size={22} />}
          </button>
          
          <div className="flex items-center gap-1.5 px-2">
            <input 
              className="page-input"
              value={inputPage}
              onChange={(e) => setInputPage(e.target.value)}
              onKeyDown={handlePageInput}
              onBlur={() => setInputPage(pageNumber.toString())}
            />
            <span className="text-white/30 text-sm">/</span>
            <span className="text-sm font-bold">{numPages || "--"}</span>
          </div>

          <button
            onClick={goToNextPage}
            disabled={pageNumber >= (numPages || 1)}
            className="pdf-toolbar-btn"
            style={{ opacity: pageNumber >= (numPages || 1) ? 0.3 : 1 }}
          >
            {isRTL ? <ChevronLeft size={22} /> : <ChevronRight size={22} />}
          </button>
        </div>

        <div className="w-[1px] h-6 bg-white/10 mx-1" />

        <div className="flex items-center gap-1">
          <div 
            className="pdf-toolbar-btn" 
            onClick={toggleTwoPage}
            style={{ color: isTwoPage ? "#3b82f6" : "#fff" }}
          >
            <Columns size={18} />
          </div>
          <div 
            className="pdf-toolbar-btn" 
            onClick={toggleContinuous}
            style={{ color: isContinuous ? "#3b82f6" : "#fff" }}
          >
            <ScrollText size={18} />
          </div>
          <div 
            className="pdf-toolbar-btn" 
            onClick={toggleBookmark}
          >
            <Bookmark size={18} className={bookmarks.includes(pageNumber) ? "fill-blue-500 text-blue-500" : ""} />
          </div>
        </div>
      </div>
    </div>
  );
}

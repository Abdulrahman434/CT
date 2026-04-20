import { useState, useEffect, useRef, useCallback } from "react";
import * as pdfjsLib from "pdfjs-dist";
import {
  X, ChevronUp, ChevronDown, ZoomIn, ZoomOut,
  Bookmark, RotateCw, Search, Loader2,
  LayoutGrid, Check, Maximize, Minimize2,
  FileText, ScrollText, Monitor, Columns,
} from "lucide-react";

// ═══════════════════════════════════════════════════════════
// PDF.js Worker
// ═══════════════════════════════════════════════════════════
pdfjsLib.GlobalWorkerOptions.workerSrc =
  `https://unpkg.com/pdfjs-dist@5.4.296/build/pdf.worker.min.mjs`;

// ═══════════════════════════════════════════════════════════
// Constants
// ═══════════════════════════════════════════════════════════
const RAIL_W = 56;
const PAGE_GAP = 16;
const SIDEBAR_W = 200;
const THUMB_W = 150;
const DPR = typeof window !== "undefined" ? (window.devicePixelRatio || 1) : 1;

interface PageDim { w: number; h: number }
interface Props { onClose: () => void; pdfSource?: string; title?: string }

// ═══════════════════════════════════════════════════════════
// Component
// ═══════════════════════════════════════════════════════════
export function PdfReaderModal({ onClose, pdfSource, title }: Props) {
  // ─── PDF state ───
  const [numPages, setNumPages] = useState(0);
  const [pageDims, setPageDims] = useState<PageDim[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ─── View state ───
  const [scale, setScale] = useState(1.0);
  const [fitWScale, setFitWScale] = useState(1.0);
  const [rotation, setRotation] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [zoomMode, setZoomMode] = useState("fit-page");
  const [scrollEnabled, setScrollEnabled] = useState(true);
  const [viewMode, setViewMode] = useState<"single" | "two">("single");

  // ─── UI state ───
  const [showSidebar, setShowSidebar] = useState(true);
  const [sidebarTab, setSidebarTab] = useState<"pages" | "bookmarks">("pages");
  const [showViewMenu, setShowViewMenu] = useState(false);
  const [showKeypad, setShowKeypad] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [keypadValue, setKeypadValue] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<{ page: number; snippet: string }[]>([]);
  const [bookmarks, setBookmarks] = useState<number[]>([]);

  // ─── Refs ───
  const docRef = useRef<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const sidebarScrollRef = useRef<HTMLDivElement>(null);
  const pageWrappers = useRef<Map<number, HTMLDivElement>>(new Map());
  const thumbWrappers = useRef<Map<number, HTMLDivElement>>(new Map());
  const renderTasks = useRef<Map<number, any>>(new Map());
  const renderedKeys = useRef<Set<string>>(new Set());
  const thumbRendered = useRef<Set<number>>(new Set());
  const visiblePages = useRef<Set<number>>(new Set());
  const activeThumbRef = useRef<HTMLDivElement>(null);
  const currentPageRef = useRef(1);
  const scaleRef = useRef(1.0);
  const rotationRef = useRef(0);

  // Keep refs in sync
  scaleRef.current = scale;
  rotationRef.current = rotation;
  currentPageRef.current = currentPage;

  // ═══════════════════════════════════════════════════════════
  // PDF Loading
  // ═══════════════════════════════════════════════════════════
  useEffect(() => {
    if (!pdfSource) { setLoading(false); return; }
    let dead = false;
    setLoading(true);
    setError(null);

    const task = pdfjsLib.getDocument(pdfSource);
    task.promise.then(async (pdf: any) => {
      if (dead) return;
      docRef.current = pdf;

      const dims: PageDim[] = [];
      for (let i = 1; i <= pdf.numPages; i++) {
        const pg = await pdf.getPage(i);
        const vp = pg.getViewport({ scale: 1.0 });
        dims.push({ w: vp.width, h: vp.height });
      }

      setNumPages(pdf.numPages);
      setPageDims(dims);
      setLoading(false);

      // Restore state
      try {
        const sp = localStorage.getItem(`pdf_pg_${pdfSource}`);
        if (sp) { const p = parseInt(sp); if (p > 0 && p <= pdf.numPages) { setCurrentPage(p); currentPageRef.current = p; } }
        const bm = localStorage.getItem(`pdf_bm_${pdfSource}`);
        if (bm) setBookmarks(JSON.parse(bm));
      } catch {}
    }).catch((e: any) => {
      if (!dead) { setError(e?.message || "Failed to load"); setLoading(false); }
    });

    return () => { dead = true; task.destroy(); };
  }, [pdfSource]);

  // ═══════════════════════════════════════════════════════════
  // Fit-to-Width
  // ═══════════════════════════════════════════════════════════
  useEffect(() => {
    if (!scrollRef.current || pageDims.length === 0) return;
    const calc = () => {
      const c = scrollRef.current!;
      const cw = c.clientWidth;
      const ch = c.clientHeight;
      const first = pageDims[0];
      const rotated = rotation % 180 !== 0;
      const pw = rotated ? first.h : first.w;
      const ph = rotated ? first.w : first.h;
      const fw = (cw - 32) / pw;
      setFitWScale(fw);
      if (zoomMode === "fit-width") setScale(fw);
      else if (zoomMode === "fit-page") setScale(Math.min(fw, (ch - 40) / ph));
    };
    calc();
    const ro = new ResizeObserver(calc);
    ro.observe(scrollRef.current);
    return () => ro.disconnect();
  }, [pageDims, zoomMode, rotation, showSidebar]);

  // ═══════════════════════════════════════════════════════════
  // Canvas Rendering
  // ═══════════════════════════════════════════════════════════
  const renderPageCanvas = useCallback(async (pg: number) => {
    const doc = docRef.current;
    const s = scaleRef.current;
    const r = rotationRef.current;
    if (!doc) return;

    const key = `${pg}_${s}_${r}`;
    if (renderedKeys.current.has(key)) return;

    // Cancel existing
    const old = renderTasks.current.get(pg);
    if (old) { try { old.cancel(); } catch {} }

    try {
      const page = await doc.getPage(pg);
      const vp = page.getViewport({ scale: s, rotation: r });

      const canvas = document.createElement("canvas");
      canvas.width = Math.floor(vp.width * DPR);
      canvas.height = Math.floor(vp.height * DPR);
      canvas.style.width = `${Math.floor(vp.width)}px`;
      canvas.style.height = `${Math.floor(vp.height)}px`;
      canvas.style.display = "block";

      const ctx = canvas.getContext("2d")!;
      ctx.scale(DPR, DPR);

      const rt = page.render({ canvasContext: ctx, viewport: vp });
      renderTasks.current.set(pg, rt);
      await rt.promise;
      renderTasks.current.delete(pg);

      // Swap into DOM (off-screen → on-screen)
      const wrapper = pageWrappers.current.get(pg);
      if (wrapper) {
        wrapper.querySelectorAll("canvas").forEach((c: any) => c.remove());
        wrapper.appendChild(canvas);
        renderedKeys.current.add(key);
      }
    } catch (e: any) {
      if (e?.name === "RenderingCancelledException") return;
      renderTasks.current.delete(pg);
    }
  }, []);

  // ═══════════════════════════════════════════════════════════
  // IntersectionObserver — virtual rendering
  // ═══════════════════════════════════════════════════════════
  useEffect(() => {
    if (!scrollRef.current || numPages === 0 || !docRef.current) return;

    // Clear old renders on scale/rotation change
    pageWrappers.current.forEach(w => w.querySelectorAll("canvas").forEach((c: any) => c.remove()));
    renderTasks.current.forEach(t => { try { t.cancel(); } catch {} });
    renderTasks.current.clear();
    renderedKeys.current.clear();
    visiblePages.current.clear();

    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        const p = Number((e.target as HTMLElement).dataset.page);
        if (e.isIntersecting) visiblePages.current.add(p);
        else visiblePages.current.delete(p);
      });

      // Render visible ± 2
      const toRender = new Set<number>();
      visiblePages.current.forEach(p => {
        for (let i = Math.max(1, p - 2); i <= Math.min(numPages, p + 2); i++) toRender.add(i);
      });
      toRender.forEach(p => renderPageCanvas(p));

      // Unrender distant (keep max 12 cached)
      if (renderedKeys.current.size > 12) {
        const all = new Set<number>();
        renderedKeys.current.forEach(k => all.add(parseInt(k)));
        all.forEach(p => {
          if (!toRender.has(p)) {
            const w = pageWrappers.current.get(p);
            if (w) w.querySelectorAll("canvas").forEach((c: any) => c.remove());
            renderedKeys.current.forEach(k => { if (k.startsWith(`${p}_`)) renderedKeys.current.delete(k); });
          }
        });
      }
    }, { root: scrollRef.current, rootMargin: "500px 0px", threshold: 0.01 });

    requestAnimationFrame(() => {
      pageWrappers.current.forEach(el => obs.observe(el));
    });

    return () => obs.disconnect();
  }, [numPages, scale, rotation, renderPageCanvas]);

  // Scroll to saved page on first load
  useEffect(() => {
    if (numPages > 0 && pageDims.length > 0 && currentPageRef.current > 1) {
      setTimeout(() => {
        const el = pageWrappers.current.get(currentPageRef.current);
        if (el && scrollRef.current) scrollRef.current.scrollTo({ top: el.offsetTop - 20, behavior: "auto" });
      }, 600);
    }
  }, [numPages, pageDims.length]);

  // ═══════════════════════════════════════════════════════════
  // Scroll Tracking
  // ═══════════════════════════════════════════════════════════
  const handleScroll = useCallback(() => {
    const c = scrollRef.current;
    if (!c || numPages === 0) return;

    const mid = c.scrollTop + c.clientHeight / 3;
    let closest = 1, minD = Infinity;
    pageWrappers.current.forEach((el, pg) => {
      const d = Math.abs(el.offsetTop + el.offsetHeight / 2 - mid);
      if (d < minD) { minD = d; closest = pg; }
    });

    if (closest !== currentPageRef.current) {
      currentPageRef.current = closest;
      setCurrentPage(closest);
      if (pdfSource) localStorage.setItem(`pdf_pg_${pdfSource}`, String(closest));
    }
  }, [numPages, pdfSource]);

  // ═══════════════════════════════════════════════════════════
  // Navigation & Zoom
  // ═══════════════════════════════════════════════════════════
  const goTo = useCallback((pg: number) => {
    const p = Math.max(1, Math.min(pg, numPages));
    currentPageRef.current = p;
    setCurrentPage(p);
    if (pdfSource) localStorage.setItem(`pdf_pg_${pdfSource}`, String(p));
    const el = pageWrappers.current.get(p);
    if (el && scrollRef.current) {
      scrollRef.current.scrollTo({ top: el.offsetTop - 8, behavior: scrollEnabled ? "smooth" : "auto" });
    }
  }, [numPages, pdfSource, scrollEnabled]);

  const zoomTo = useCallback((mode: string, s?: number) => {
    setZoomMode(mode);
    if (s !== undefined) setScale(s);
    else if (mode === "actual") setScale(1.0);
    else if (mode === "fit-page" && scrollRef.current && pageDims.length > 0) {
      const c = scrollRef.current;
      const r = rotation % 180 !== 0;
      const pw = r ? pageDims[0].h : pageDims[0].w;
      const ph = r ? pageDims[0].w : pageDims[0].h;
      const fw = (c.clientWidth - 32) / pw;
      setScale(Math.min(fw, (c.clientHeight - 40) / ph));
    }
  }, [pageDims, rotation]);

  const zoomIn = () => { setZoomMode("custom"); setScale(s => Math.min(s + 0.2, 4.0)); };
  const zoomOut = () => { setZoomMode("custom"); setScale(s => Math.max(s - 0.2, 0.5)); };

  // ═══════════════════════════════════════════════════════════
  // Bookmarks
  // ═══════════════════════════════════════════════════════════
  const toggleBm = () => {
    setBookmarks(prev => {
      const next = prev.includes(currentPage) ? prev.filter(p => p !== currentPage) : [...prev, currentPage].sort((a, b) => a - b);
      if (pdfSource) localStorage.setItem(`pdf_bm_${pdfSource}`, JSON.stringify(next));
      return next;
    });
  };

  // ─── Scroll active thumbnail into view ───
  useEffect(() => {
    if (activeThumbRef.current && showSidebar && sidebarTab === "pages") {
      activeThumbRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [currentPage, showSidebar, sidebarTab]);

  // ═══════════════════════════════════════════════════════════
  // Rotation
  // ═══════════════════════════════════════════════════════════
  const rotate = () => setRotation(r => (r + 90) % 360);

  // ═══════════════════════════════════════════════════════════
  // Search
  // ═══════════════════════════════════════════════════════════
  const doSearch = useCallback(async () => {
    const doc = docRef.current;
    if (!doc || !searchQuery.trim()) { setSearchResults([]); return; }
    const q = searchQuery.toLowerCase();
    const results: { page: number; snippet: string }[] = [];
    for (let i = 1; i <= numPages; i++) {
      const pg = await doc.getPage(i);
      const tc = await pg.getTextContent();
      const text = tc.items.filter((t: any) => t.str).map((t: any) => t.str).join(" ");
      if (text.toLowerCase().includes(q)) {
        const idx = text.toLowerCase().indexOf(q);
        results.push({ page: i, snippet: "…" + text.slice(Math.max(0, idx - 40), idx + q.length + 40) + "…" });
      }
    }
    setSearchResults(results);
  }, [searchQuery, numPages]);

  // ═══════════════════════════════════════════════════════════
  // Thumbnail Rendering (lazy via IntersectionObserver)
  // ═══════════════════════════════════════════════════════════
  useEffect(() => {
    if (!showSidebar || !sidebarScrollRef.current || !docRef.current || numPages === 0) return;
    thumbRendered.current.clear();

    const renderThumb = async (pg: number) => {
      const doc = docRef.current;
      if (!doc || thumbRendered.current.has(pg)) return;
      const wrapper = thumbWrappers.current.get(pg);
      if (!wrapper) return;
      try {
        const page = await doc.getPage(pg);
        const vp0 = page.getViewport({ scale: 1.0, rotation: rotationRef.current });
        const ts = THUMB_W / vp0.width;
        const vp = page.getViewport({ scale: ts, rotation: rotationRef.current });
        const canvas = document.createElement("canvas");
        canvas.width = Math.floor(vp.width * DPR);
        canvas.height = Math.floor(vp.height * DPR);
        canvas.style.width = "100%";
        canvas.style.height = "auto";
        canvas.style.display = "block";
        canvas.style.borderRadius = "2px";
        const ctx = canvas.getContext("2d")!;
        ctx.scale(DPR, DPR);
        await page.render({ canvasContext: ctx, viewport: vp }).promise;
        wrapper.querySelectorAll("canvas").forEach((c: any) => c.remove());
        wrapper.appendChild(canvas);
        thumbRendered.current.add(pg);
      } catch {}
    };

    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          const pg = Number((e.target as HTMLElement).dataset.thumb);
          if (pg) renderThumb(pg);
        }
      });
    }, { root: sidebarScrollRef.current, rootMargin: "200px 0px", threshold: 0.01 });

    requestAnimationFrame(() => thumbWrappers.current.forEach(el => obs.observe(el)));
    return () => obs.disconnect();
  }, [showSidebar, numPages, rotation]);

  // ═══════════════════════════════════════════════════════════
  // Page wrapper ref setter
  // ═══════════════════════════════════════════════════════════
  const setWrap = useCallback((pg: number, el: HTMLDivElement | null) => {
    if (el) pageWrappers.current.set(pg, el); else pageWrappers.current.delete(pg);
  }, []);
  const setThumb = useCallback((pg: number, el: HTMLDivElement | null) => {
    if (el) thumbWrappers.current.set(pg, el); else thumbWrappers.current.delete(pg);
  }, []);

  // ═══════════════════════════════════════════════════════════
  // Page size helper
  // ═══════════════════════════════════════════════════════════
  const pgSize = (d: PageDim) => {
    const r = rotation % 180 !== 0;
    return { w: Math.floor((r ? d.h : d.w) * scale), h: Math.floor((r ? d.w : d.h) * scale) };
  };

  // ═══════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════
  return (
    <div
      className="absolute inset-0 z-[100] flex flex-col overflow-hidden"
      style={{ backgroundColor: "#525659", touchAction: "manipulation", userSelect: "none", WebkitTouchCallout: "none" } as any}
      onContextMenu={e => e.preventDefault()}
    >
      {/* ═══ CSS ═══ */}
      <style>{`
        .pdf-main::-webkit-scrollbar{width:10px}
        .pdf-main::-webkit-scrollbar-track{background:rgba(0,0,0,.1)}
        .pdf-main::-webkit-scrollbar-thumb{background:rgba(255,255,255,.18);border-radius:5px;border:2px solid #525659}
        .pdf-main::-webkit-scrollbar-thumb:hover{background:rgba(255,255,255,.3)}
        .pdf-side::-webkit-scrollbar{width:5px}
        .pdf-side::-webkit-scrollbar-track{background:transparent}
        .pdf-side::-webkit-scrollbar-thumb{background:rgba(255,255,255,.12);border-radius:3px}
        .rail-btn{display:flex;align-items:center;justify-content:center;width:48px;height:48px;
          border-radius:8px;border:none;background:transparent;color:#E8E8E8;cursor:pointer;
          transition:background .1s;-webkit-tap-highlight-color:transparent}
        .rail-btn:active{background:#3A3A3A!important}
        .rail-btn[data-active="true"]{background:rgba(74,158,255,.15);color:#4A9EFF}
        .vm-row{display:flex;align-items:center;gap:12px;padding:0 16px;height:48px;cursor:pointer;
          color:#E8E8E8;font-size:14px;transition:background .1s;border:none;background:transparent;width:100%;text-align:left;font-family:inherit}
        .vm-row:active{background:#3A3A3A}
        .vm-row[data-disabled]{opacity:.35;pointer-events:none}
        .kp-btn{width:72px;height:64px;border-radius:12px;border:1px solid #444;background:#333;
          color:#fff;font-size:24px;font-weight:600;display:flex;align-items:center;justify-content:center;
          cursor:pointer;transition:background .1s;-webkit-tap-highlight-color:transparent}
        .kp-btn:active{background:#555}
        .kp-go{background:#10b981;border-color:#10b981;color:#fff;font-size:18px;font-weight:700}
        .kp-go:active{background:#059669}
      `}</style>

      {/* ═══ TOP BAR ═══ */}
      <div className="shrink-0 flex items-center px-5"
        style={{ height: 48, backgroundColor: "#2b2d30", borderBottom: "1px solid #1a1a1a", zIndex: 20, color: "#fff" }}>
        <div className="flex items-center gap-3">
          <button className="rail-btn" style={{ width: 36, height: 36 }} onClick={() => setShowSidebar(s => !s)}>
            <LayoutGrid size={18} />
          </button>
          <span style={{ fontSize: 15, fontWeight: 700, letterSpacing: ".3px", opacity: .9 }}>
            {title || "Document Viewer"}
          </span>
        </div>
      </div>

      {/* ═══ BODY: sidebar + pdf + rail ═══ */}
      <div className="flex-1 flex flex-row overflow-hidden">

      {/* ═══ THUMBNAIL / BOOKMARKS SIDEBAR ═══ */}
      {showSidebar && (
        <div className="shrink-0 flex flex-col" style={{ width: SIDEBAR_W, backgroundColor: "#1E1F22", borderRight: "1px solid #3A3A3A" }}>
          {/* Tabs */}
          <div className="shrink-0 flex border-b" style={{ borderColor: "#2A2A2A" }}>
            <button onClick={() => setSidebarTab("pages")}
              style={{ flex: 1, padding: "12px 0", fontSize: 12, fontWeight: 700, border: "none", cursor: "pointer", background: "transparent", color: sidebarTab === "pages" ? "#fff" : "#666", borderBottom: sidebarTab === "pages" ? "2px solid #4A9EFF" : "2px solid transparent", transition: "all .15s" }}>
              PAGES
            </button>
            <button onClick={() => setSidebarTab("bookmarks")}
              style={{ flex: 1, padding: "12px 0", fontSize: 12, fontWeight: 700, border: "none", cursor: "pointer", background: "transparent", color: sidebarTab === "bookmarks" ? "#fff" : "#666", borderBottom: sidebarTab === "bookmarks" ? "2px solid #4A9EFF" : "2px solid transparent", transition: "all .15s" }}>
              BOOKMARKS
            </button>
          </div>

          <div ref={sidebarScrollRef} className="flex-1 overflow-y-auto pdf-side" style={{ padding: "8px 6px" }}>
            {sidebarTab === "pages" ? (
              /* ── Pages tab ── */
              pageDims.map((_, i) => {
                const pg = i + 1;
                const active = pg === currentPage;
                const bm = bookmarks.includes(pg);
                const sz = pgSize(pageDims[i]);
                const thumbH = Math.floor((THUMB_W / sz.w) * sz.h);
                return (
                  <div
                    key={pg} onClick={() => goTo(pg)}
                    ref={active ? activeThumbRef : undefined}
                    style={{ padding: 4, marginBottom: 6, borderRadius: 6, cursor: "pointer",
                      border: active ? "2px solid #4A9EFF" : "2px solid transparent",
                      backgroundColor: active ? "rgba(74,158,255,.08)" : "transparent" }}
                  >
                    <div
                      data-thumb={pg} ref={el => setThumb(pg, el)}
                      style={{ width: THUMB_W, height: thumbH, backgroundColor: "#2A2A2A", borderRadius: 3, overflow: "hidden", position: "relative", margin: "0 auto" }}
                    >
                      {bm && (
                        <div style={{ position: "absolute", top: 3, right: 3, zIndex: 2 }}>
                          <Bookmark size={10} className="fill-yellow-400 text-yellow-400" />
                        </div>
                      )}
                    </div>
                    <div style={{ textAlign: "center", marginTop: 4, fontSize: 11, fontWeight: active ? 700 : 400, color: active ? "#4A9EFF" : "#888" }}>{pg}</div>
                  </div>
                );
              })
            ) : (
              /* ── Bookmarks tab ── */
              bookmarks.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-8 gap-3" style={{ marginTop: 40, opacity: .35 }}>
                  <Bookmark size={32} color="#fff" />
                  <span style={{ fontSize: 12, textAlign: "center", color: "#fff" }}>No bookmarks yet.<br />Use the bookmark button in the toolbar.</span>
                </div>
              ) : (
                bookmarks.map(p => (
                  <div key={p} onClick={() => goTo(p)}
                    className="group"
                    style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 10px", borderRadius: 8, cursor: "pointer", marginBottom: 4, backgroundColor: p === currentPage ? "rgba(74,158,255,.1)" : "transparent", transition: "background .1s" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <Bookmark size={14} className="fill-yellow-400 text-yellow-400" />
                      <span style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,.9)" }}>Page {p}</span>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); setBookmarks(b => { const n = b.filter(x => x !== p); if (pdfSource) localStorage.setItem(`pdf_bm_${pdfSource}`, JSON.stringify(n)); return n; }); }}
                      style={{ padding: 4, opacity: 0, background: "transparent", border: "none", cursor: "pointer", color: "#888", transition: "opacity .15s" }}
                      className="group-hover:!opacity-100">
                      <X size={14} />
                    </button>
                  </div>
                ))
              )
            )}
          </div>
        </div>
      )}

      {/* ═══ MAIN PDF AREA ═══ */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto overflow-x-auto pdf-main"
        onScroll={handleScroll}
        style={{ WebkitOverflowScrolling: "touch", overscrollBehavior: "contain" } as any}
      >
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full gap-4" style={{ color: "#fff" }}>
            <Loader2 className="animate-spin" size={48} color="#4A9EFF" />
            <span style={{ fontSize: 15, fontWeight: 500, opacity: .7 }}>Loading document…</span>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-full gap-4 p-8 text-center" style={{ color: "#fff" }}>
            <X size={48} color="#ef4444" />
            <p style={{ fontSize: 16, fontWeight: 600 }}>Failed to load PDF</p>
            <p style={{ fontSize: 13, opacity: .5, maxWidth: 300 }}>{error}</p>
          </div>
        ) : viewMode === "two" ? (
          /* Two-page view: pages side by side in rows */
          <div className="flex flex-col items-center" style={{ padding: "20px 16px", minHeight: "100%" }}>
            {Array.from({ length: Math.ceil(numPages / 2) }, (_, row) => {
              const left = row * 2 + 1;
              const right = row * 2 + 2;
              const szL = pgSize(pageDims[left - 1]);
              const szR = right <= numPages ? pgSize(pageDims[right - 1]) : null;
              return (
                <div key={row} className="flex" style={{ gap: 8, marginBottom: PAGE_GAP }}>
                  <div
                    data-page={left} ref={el => setWrap(left, el)}
                    style={{
                      width: szL.w, height: szL.h,
                      backgroundColor: "#e8e8e8", borderRadius: 2,
                      boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                      position: "relative", overflow: "hidden", flexShrink: 0,
                    }}
                  />
                  {szR && (
                    <div
                      data-page={right} ref={el => setWrap(right, el)}
                      style={{
                        width: szR.w, height: szR.h,
                        backgroundColor: "#e8e8e8", borderRadius: 2,
                        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                        position: "relative", overflow: "hidden", flexShrink: 0,
                      }}
                    />
                  )}
                </div>
              );
            })}
            <div style={{ height: "40vh", flexShrink: 0 }} />
          </div>
        ) : (
          /* Single-page view */
          <div className="flex flex-col items-center" style={{ padding: "20px 16px", minHeight: "100%" }}>
            {pageDims.map((dim, i) => {
              const pg = i + 1;
              const sz = pgSize(dim);
              return (
                <div
                  key={pg} data-page={pg} ref={el => setWrap(pg, el)}
                  style={{
                    width: sz.w, height: sz.h, marginBottom: PAGE_GAP,
                    backgroundColor: "#e8e8e8", borderRadius: 2,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                    position: "relative", overflow: "hidden",
                    flexShrink: 0,
                  }}
                />
              );
            })}
            {/* Extra space so last page can scroll to top */}
            <div style={{ height: "40vh", flexShrink: 0 }} />
          </div>
        )}
      </div>

      {/* ═══ RIGHT RAIL (always visible) ═══ */}
      <div
        className="shrink-0 flex flex-col items-center"
        style={{
          width: RAIL_W,
          backgroundColor: "#2A2A2A", borderLeft: "0.5px solid #3A3A3A",
        }}
      >
        <div className="flex flex-col items-center h-full" style={{ width: RAIL_W, paddingTop: 4, paddingBottom: 8 }}>

          {/* Close — aligned with rail buttons */}
          <button className="rail-btn" onClick={onClose} title="Close"
            style={{ backgroundColor: "#dc2626", borderRadius: 10, width: 44, height: 44, marginBottom: 4 }}>
            <X size={18} />
          </button>

          {/* ─── GROUP 1: Document aids ─── */}
          <div className="flex flex-col items-center" style={{ gap: 4 }}>
            <button className="rail-btn" data-active={bookmarks.includes(currentPage)} onClick={toggleBm} title="Bookmark">
              <Bookmark size={20} className={bookmarks.includes(currentPage) ? "fill-yellow-400 text-yellow-400" : ""} />
            </button>
            <button className="rail-btn" data-active={showSidebar} onClick={() => { setShowSidebar(s => !s); setShowSearch(false); }} title="Thumbnails">
              <LayoutGrid size={20} />
            </button>
            <button className="rail-btn" data-active={showSearch} onClick={() => { setShowSearch(s => !s); setShowSidebar(false); }} title="Search">
              <Search size={20} />
            </button>
          </div>

          {/* Divider */}
          <div style={{ width: 32, height: 0.5, backgroundColor: "#3A3A3A", margin: "12px 0" }} />

          {/* ─── GROUP 2: Page navigation (Adobe-style) ─── */}
          <div className="flex flex-col items-center" style={{ gap: 2 }}>
            <button
              onClick={() => setShowKeypad(true)} title="Go to page"
              style={{
                width: 44, minHeight: 32, borderRadius: 6,
                border: "1px solid #555", background: "#1A1A1A",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", color: "#fff", fontSize: 16, fontWeight: 700,
                padding: "4px 0",
              }}
            >
              {currentPage}
            </button>
            <span style={{ fontSize: 12, color: "#8A8A8A", lineHeight: 1.2, marginTop: 2, marginBottom: 2 }}>{numPages || "–"}</span>
            <button className="rail-btn" onClick={() => goTo(currentPage - 1)} disabled={currentPage <= 1}
              style={{ opacity: currentPage <= 1 ? .25 : 1 }}>
              <ChevronUp size={22} />
            </button>
            <button className="rail-btn" onClick={() => goTo(currentPage + 1)} disabled={currentPage >= numPages}
              style={{ opacity: currentPage >= numPages ? .25 : 1 }}>
              <ChevronDown size={22} />
            </button>
          </div>

          {/* Divider */}
          <div style={{ width: 32, height: 0.5, backgroundColor: "#3A3A3A", margin: "12px 0" }} />

          {/* ─── GROUP 3: View & zoom ─── */}
          <div className="flex flex-col items-center" style={{ gap: 4 }}>
            <button className="rail-btn" onClick={rotate} title="Rotate"><RotateCw size={20} /></button>
            <button className="rail-btn" data-active={showViewMenu} onClick={() => setShowViewMenu(v => !v)} title="View options">
              <FileText size={20} />
            </button>
            <button className="rail-btn" onClick={zoomIn} title="Zoom in"><ZoomIn size={20} /></button>
            <button className="rail-btn" onClick={zoomOut} title="Zoom out"><ZoomOut size={20} /></button>
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Zoom % at bottom */}
          <div style={{ fontSize: 11, fontWeight: 600, color: "#666", marginBottom: 4 }}>{Math.round(scale * 100)}%</div>
        </div>
      </div>

      </div>{/* end BODY flex row */}

      {/* ═══ VIEW MENU ═══ */}
      {showViewMenu && (
        <>
          <div className="absolute inset-0 z-[200]" onClick={() => setShowViewMenu(false)} />
          <div
            className="absolute z-[201] flex flex-col"
            style={{
              right: RAIL_W + 8, bottom: 80, width: 240,
              backgroundColor: "#2A2A2A", borderRadius: 8,
              border: "1px solid #3A3A3A", boxShadow: "0 8px 32px rgba(0,0,0,.5)",
              paddingTop: 6, paddingBottom: 6, overflow: "hidden",
            }}
          >
            {/* View mode */}
            <button className="vm-row" onClick={() => { setViewMode("single"); setShowViewMenu(false); }}>
              <div style={{ width: 20 }}>{viewMode === "single" && <Check size={16} color="#4A9EFF" />}</div>
              <FileText size={16} /><span>Single page view</span>
            </button>
            <button className="vm-row" onClick={() => { setViewMode("two"); setShowViewMenu(false); }}>
              <div style={{ width: 20 }}>{viewMode === "two" && <Check size={16} color="#4A9EFF" />}</div>
              <Columns size={16} /><span>Two page view</span>
            </button>

            <div style={{ height: 0.5, backgroundColor: "#3A3A3A", margin: "4px 0" }} />

            {/* Scrolling toggle */}
            <button className="vm-row" onClick={() => { setScrollEnabled(e => !e); }}>
              <div style={{ width: 20 }}>{scrollEnabled && <Check size={16} color="#4A9EFF" />}</div>
              <ScrollText size={16} /><span>Enable scrolling</span>
            </button>

            <div style={{ height: 0.5, backgroundColor: "#3A3A3A", margin: "4px 0" }} />

            {/* Zoom modes */}
            <button className="vm-row" onClick={() => { zoomTo("actual"); setShowViewMenu(false); }}>
              <div style={{ width: 20 }}>{zoomMode === "actual" && <Check size={16} color="#4A9EFF" />}</div>
              <Maximize size={16} /><span>Actual size</span>
            </button>
            <button className="vm-row" onClick={() => { zoomTo("fit-page"); setShowViewMenu(false); }}>
              <div style={{ width: 20 }}>{zoomMode === "fit-page" && <Check size={16} color="#4A9EFF" />}</div>
              <Minimize2 size={16} /><span>Zoom to page level</span>
            </button>

            <div style={{ height: 0.5, backgroundColor: "#3A3A3A", margin: "4px 0" }} />

            {/* Fullscreen */}
            <button className="vm-row" onClick={() => {
              if (document.fullscreenElement) document.exitFullscreen();
              else document.documentElement.requestFullscreen();
              setShowViewMenu(false);
            }}>
              <div style={{ width: 20 }} />
              <Monitor size={16} /><span>Full screen</span>
            </button>
          </div>
        </>
      )}

      {/* ═══ PAGE KEYPAD ═══ */}
      {showKeypad && (
        <div className="absolute inset-0 z-[300] flex items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,.6)" }}
          onClick={() => setShowKeypad(false)}
        >
          <div onClick={e => e.stopPropagation()} className="flex flex-col items-center gap-4"
            style={{ backgroundColor: "#2A2A2A", borderRadius: 16, padding: "28px 24px", border: "1px solid #3A3A3A", boxShadow: "0 16px 48px rgba(0,0,0,.6)" }}
          >
            {/* Display */}
            <div style={{
              width: 240, height: 56, borderRadius: 8, backgroundColor: "#1A1A1A",
              border: "1px solid #444", display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 28, fontWeight: 700, color: "#fff", letterSpacing: 2,
            }}>
              {keypadValue || <span style={{ color: "#555" }}>Page #</span>}
            </div>

            <div style={{ fontSize: 12, color: "#666" }}>of {numPages} pages</div>

            {/* Keypad grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 72px)", gap: 8 }}>
              {[1,2,3,4,5,6,7,8,9].map(n => (
                <button key={n} className="kp-btn" onClick={() => setKeypadValue(v => v.length < 5 ? v + n : v)}>{n}</button>
              ))}
              <button className="kp-btn" onClick={() => setKeypadValue(v => v.slice(0, -1))}>⌫</button>
              <button className="kp-btn" onClick={() => setKeypadValue(v => v.length < 5 ? v + "0" : v)}>0</button>
              <button className="kp-btn kp-go" onClick={() => {
                const p = parseInt(keypadValue);
                if (!isNaN(p) && p > 0 && p <= numPages) goTo(p);
                setKeypadValue("");
                setShowKeypad(false);
              }}>Go</button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ SEARCH PANEL ═══ */}
      {showSearch && (
        <div className="shrink-0 flex flex-col" style={{
          width: 280, backgroundColor: "#1E1F22", borderRight: "1px solid #3A3A3A",
          position: "absolute", left: showSidebar ? SIDEBAR_W : 0, top: 0, bottom: 0, zIndex: 50,
        }}>
          <div className="flex items-center gap-2 px-3" style={{ height: 52, borderBottom: "1px solid #2A2A2A" }}>
            <Search size={16} color="#888" />
            <input
              type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={e => e.key === "Enter" && doSearch()}
              placeholder="Search in document…"
              style={{
                flex: 1, backgroundColor: "#2A2A2A", border: "1px solid #444", borderRadius: 6,
                padding: "8px 10px", color: "#fff", fontSize: 14, outline: "none",
              }}
              autoFocus
            />
            <button className="rail-btn" style={{ width: 32, height: 32 }} onClick={() => { setShowSearch(false); setSearchResults([]); setSearchQuery(""); }}>
              <X size={14} color="#888" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto pdf-side" style={{ padding: 8 }}>
            {searchResults.length === 0 && searchQuery ? (
              <div style={{ padding: 16, textAlign: "center", color: "#666", fontSize: 13 }}>
                {searchQuery ? "No results found" : "Type to search"}
              </div>
            ) : (
              searchResults.map((r, i) => (
                <div key={i} onClick={() => goTo(r.page)} style={{
                  padding: "10px 12px", borderRadius: 6, cursor: "pointer", marginBottom: 4,
                  backgroundColor: r.page === currentPage ? "rgba(74,158,255,.1)" : "transparent",
                  transition: "background .1s",
                }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#4A9EFF", marginBottom: 4 }}>Page {r.page}</div>
                  <div style={{ fontSize: 12, color: "#999", lineHeight: 1.4, wordBreak: "break-word" }}>{r.snippet}</div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

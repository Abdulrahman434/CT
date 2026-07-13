import { useState, useEffect } from "react";

export default function GameLanguageToggle({ gameKey, initial, onChange }: { gameKey: string; initial?: string; onChange?: (lang: string) => void }) {
  const storageKey = `game-lang-${gameKey}`;
  const [open, setOpen] = useState(false);
  const [lang, setLang] = useState<string>(initial || (localStorage.getItem(storageKey) ?? 'en'));

  useEffect(() => {
    localStorage.setItem(storageKey, lang);
    if (onChange) onChange(lang);
  }, [lang]);

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button onClick={() => setOpen(s => !s)} style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid rgba(0,0,0,0.08)', background: '#fff', cursor: 'pointer' }}>
        {lang === 'ar' ? 'العربية' : 'English'} ▾
      </button>
      {open && (
        <div style={{ position: 'absolute', right: 0, top: '110%', background: 'white', border: '1px solid rgba(0,0,0,0.08)', borderRadius: 8, boxShadow: '0 6px 18px rgba(0,0,0,0.08)', zIndex: 999 }}>
          <button onClick={() => { setLang('en'); setOpen(false); }} style={{ display: 'block', padding: '8px 12px', width: '100%', textAlign: 'left', background: 'transparent', border: 'none', cursor: 'pointer' }}>English</button>
          <button onClick={() => { setLang('ar'); setOpen(false); }} style={{ display: 'block', padding: '8px 12px', width: '100%', textAlign: 'left', background: 'transparent', border: 'none', cursor: 'pointer' }}>العربية</button>
        </div>
      )}
    </div>
  );
}

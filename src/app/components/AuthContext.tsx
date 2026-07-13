import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from "react";

/* ═══════════════════════════════════════════════════════════════════════════
 * AUTH CONTEXT — Password-based access control for hospital configurations
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * PASSWORD → HOSPITAL MAPPING:
 *   "burjeel"  → Burjeel Hospital only
 *   "dallah"   → Dallah Hospital only
 *   "slh"      → Saint Louis Hospital only
 *   "caremed"  → Care Medical only
 *   "fakeeh"   → Dr. Soliman Fakeeh Hospital only
 *   "prime"    → Prime Hospital only
 *   "careinn"  → Full access (all hospitals, configurator enabled)
 *
 * ═══════════════════════════════════════════════════════════════════════════ */

/** Maps SHA-256 password hashes to hospital config IDs */
export const HASHED_PASSWORD_MAP: Record<string, string> = {
  "26a692dd0d4f558fc8c3b7cb1749e812605a4095b58777d3a690cc1ebfc15f2a": "burjeel",
  "ff7bddf032faa3aad1699dcefdc3516cf2d8d58c8786b9f71174df7de47b1a39": "dallah",
  "025705ec8cab15dbf71655031ccc2081b8af1dde1bc70539ba56f8f20b8a7a27": "slh",
  "8b7a9742d607bb9e1d5689ee574d24e0e7d9771c73208c08750473b886ef61ba": "caremed",
  "183f1e06fe841b761a073d9057ba11164292e7846fbe8e474230aebb4635f41e": "dsfh",    // "fakeeh"
  "7e453343b3477a0d9538df8e905ecb160aea04b9215528ffc21056ddb6d2cd09": "careinn", // full access
  "c598203581040f62b32d0d9c64555333e5ae42dc82878ed73644bc2abf3dbdde": "imc",
  "dccc5d01dabcd1c0b9fa89c91e7f4bde603121ee0172b4ff394e6bb30d295e41": "prime",
};

/** The SHA-256 hash for the careinn full-access password */
const CAREINN_HASH = "7e453343b3477a0d9538df8e905ecb160aea04b9215528ffc21056ddb6d2cd09";

export interface AuthState {
  /** Whether the user has authenticated */
  isAuthenticated: boolean;
  /** The password that was entered (null if not authenticated) */
  password: string | null;
  /** The hospital config ID to activate (null if careinn / full access) */
  lockedHospitalId: string | null;
  /** Whether the user has full access (careinn password) */
  isFullAccess: boolean;
}

interface AuthContextType extends AuthState {
  /** Attempt to log in with a password. Returns true if valid. */
  login: (password: string) => Promise<boolean>;
  /** Log out and return to the password screen */
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  password: null,
  lockedHospitalId: null,
  isFullAccess: false,
  login: async () => false,
  logout: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>(() => {
    try {
      const saved = localStorage.getItem("hbs-auth-v1");
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error("Auth Load Error:", e);
    }
    return {
      isAuthenticated: false,
      password: null,
      lockedHospitalId: null,
      isFullAccess: false,
    };
  });

  // Persist auth state whenever it changes
  useEffect(() => {
    localStorage.setItem("hbs-auth-v1", JSON.stringify(authState));
  }, [authState]);

  const login = useCallback(async (password: string): Promise<boolean> => {
    const normalizedInput = password.toLowerCase().trim();
    const isCmsMode = normalizedInput.endsWith("-hospital");
    const basePassword = isCmsMode ? normalizedInput.slice(0, -9) : normalizedInput;
    
    // Create SHA-256 hash using Web Crypto API (requires secure context)
    let hashHex = "";
    if (window.isSecureContext && crypto?.subtle) {
      const msgBuffer = new TextEncoder().encode(basePassword);
      const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    } else {
      // Fallback for non-secure contexts (direct matching for known tokens)
      // This is a safety measure for dev/hospital environments without HTTPS
      if (basePassword === "careinn") hashHex = CAREINN_HASH;
      else if (basePassword === "dallah") hashHex = "ff7bddf032faa3aad1699dcefdc3516cf2d8d58c8786b9f71174df7de47b1a39";
      else if (basePassword === "caremed") hashHex = "8b7a9742d607bb9e1d5689ee574d24e0e7d9771c73208c08750473b886ef61ba";
      else if (basePassword === "fakeeh") hashHex = "183f1e06fe841b761a073d9057ba11164292e7846fbe8e474230aebb4635f41e";
      else if (basePassword === "burjeel") hashHex = "26a692dd0d4f558fc8c3b7cb1749e812605a4095b58777d3a690cc1ebfc15f2a";
      else if (basePassword === "slh") hashHex = "025705ec8cab15dbf71655031ccc2081b8af1dde1bc70539ba56f8f20b8a7a27";
      else if (basePassword === "imc") hashHex = "c598203581040f62b32d0d9c64555333e5ae42dc82878ed73644bc2abf3dbdde";
      else if (basePassword === "prime") hashHex = "dccc5d01dabcd1c0b9fa89c91e7f4bde603121ee0172b4ff394e6bb30d295e41";
    }

    const mapping = HASHED_PASSWORD_MAP[hashHex];
    if (!mapping) return false;

    // CMS Opt-in handling
    if (isCmsMode) {
      localStorage.setItem('cms-mode', 'true');
    } else {
      localStorage.removeItem('cms-mode');
    }

    const isFullAccess = hashHex === CAREINN_HASH;
    const hospitalId = isFullAccess ? null : mapping;

    // For careinn (full access), default to the CareInn hospital config
    if (isFullAccess) {
      localStorage.setItem('active-hospital-id', 'careinn');
    } else if (hospitalId) {
      localStorage.setItem('active-hospital-id', hospitalId);
    }

    setAuthState({
      isAuthenticated: true,
      password: null, // Avoid storing plaintext password in state anymore
      lockedHospitalId: hospitalId,
      isFullAccess,
    });

    // Notify other contexts and hooks
    window.dispatchEvent(new Event('hospital-changed'));
    window.dispatchEvent(new Event('cms-mode-changed'));
    
    return true;
  }, []);

  const logout = useCallback(() => {
    setAuthState({
      isAuthenticated: false,
      password: null,
      lockedHospitalId: null,
      isFullAccess: false,
    });
  }, []);

  return (
    <AuthContext.Provider value={{ ...authState, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

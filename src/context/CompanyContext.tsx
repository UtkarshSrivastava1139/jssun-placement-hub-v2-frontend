import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export const STORAGE_KEY = "selected-company";

export interface SelectedCompany {
  companyId: number;
  companyName: string;
  logoUrl: string;
}

interface Ctx {
  selected: SelectedCompany | null;
  /** true once localStorage has been read on the client */
  ready: boolean;
  selectCompany: (c: SelectedCompany) => void;
}

const CompanyContext = createContext<Ctx | null>(null);

export function CompanyProvider({ children }: { children: ReactNode }) {
  const [selected, setSelected] = useState<SelectedCompany | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as SelectedCompany;
        if (
          Number.isInteger(parsed.companyId) &&
          parsed.companyId > 0 &&
          typeof parsed.companyName === "string" &&
          typeof parsed.logoUrl === "string"
        )
          setSelected(parsed);
      }
    } catch {
      /* ignore corrupt storage */
    }
    setReady(true);
  }, []);

  const selectCompany = useCallback((c: SelectedCompany) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(c));
    setSelected(c);
  }, []);

  const value = useMemo(
    () => ({ selected, ready, selectCompany }),
    [selected, ready, selectCompany],
  );

  return <CompanyContext.Provider value={value}>{children}</CompanyContext.Provider>;
}

export function useCompany() {
  const ctx = useContext(CompanyContext);
  if (!ctx) throw new Error("useCompany must be used inside CompanyProvider");
  return ctx;
}

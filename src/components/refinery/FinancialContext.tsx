import { createContext, useContext, useState, type ReactNode } from "react";
import { DEFAULT_AS_OF } from "@/lib/financial";

const FinancialContext = createContext<{ asOf: string; setAsOf: (value: string) => void }>({ asOf: DEFAULT_AS_OF, setAsOf: () => {} });
export function FinancialProvider({ children }: { children: ReactNode }) {
  const [asOf, setAsOf] = useState(DEFAULT_AS_OF);
  return <FinancialContext.Provider value={{ asOf, setAsOf }}>{children}</FinancialContext.Provider>;
}
export const useFinancial = () => useContext(FinancialContext);
export function CutoffControl() {
  const { asOf, setAsOf } = useFinancial();
  return <label className="flex flex-wrap items-center gap-2 text-xs font-medium">Known by (UTC)<input aria-label="Known by UTC" type="datetime-local" value={asOf} onChange={(e) => setAsOf(e.target.value)} className="min-w-0 rounded border bg-background px-2 py-1.5 font-mono" /></label>;
}
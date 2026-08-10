"use client";

import { useEffect } from "react";
import { Printer } from "lucide-react";

// Bouton d'impression de la fiche. Pendant l'impression (bouton ou Ctrl+P),
// ouvre tous les <details> de la page (sous-sections, liste complète des
// risques) pour que la version papier soit complète, puis restaure l'état.
export default function PrintButton() {
  useEffect(() => {
    const opened: HTMLDetailsElement[] = [];
    const before = () => {
      document
        .querySelectorAll<HTMLDetailsElement>("details:not([open])")
        .forEach((d) => {
          d.open = true;
          opened.push(d);
        });
    };
    const after = () => {
      opened.splice(0).forEach((d) => {
        d.open = false;
      });
    };
    window.addEventListener("beforeprint", before);
    window.addEventListener("afterprint", after);
    return () => {
      window.removeEventListener("beforeprint", before);
      window.removeEventListener("afterprint", after);
    };
  }, []);

  return (
    <button
      onClick={() => window.print()}
      className="print:hidden inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-base text-foreground hover:border-gray-300 hover:bg-gray-50 transition-colors cursor-pointer"
      style={{ fontFamily: "var(--font-heading)", minHeight: "44px" }}
    >
      <Printer className="w-4 h-4" style={{ color: "#0369A1" }} aria-hidden="true" />
      <span>
        Imprimer<span className="hidden sm:inline"> la fiche</span>
      </span>
    </button>
  );
}

"use client";

import { useEffect, useId, useRef, useState } from "react";

interface Props {
  term: string;
  definition: string;
}

export default function MedicalTerm({ term, definition }: Props) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLSpanElement>(null);
  const tooltipId = useId();

  useEffect(() => {
    if (!open) return;

    const onClickOutside = (e: MouseEvent) => {
      if (!wrapperRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <span ref={wrapperRef} className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-describedby={open ? tooltipId : undefined}
        className="font-inherit underline decoration-dotted decoration-1 underline-offset-[3px] text-foreground hover:text-primary transition-colors cursor-help"
        style={{ textDecorationColor: "rgba(2, 132, 199, 0.5)" }}
      >
        {term}
      </button>
      {open && (
        <span
          id={tooltipId}
          role="tooltip"
          className="absolute left-1/2 -translate-x-1/2 top-full mt-2 z-50 w-72 max-w-[calc(100vw-2rem)] rounded-lg bg-white border border-gray-200 p-3 text-base font-normal text-gray-700 leading-relaxed text-left shadow-[0_8px_24px_rgba(15,23,42,0.12)]"
          style={{ fontFamily: "var(--font-sans)" }}
        >
          <span className="block text-xs font-semibold uppercase tracking-wider text-primary mb-1" style={{ fontFamily: "var(--font-heading)" }}>
            {term}
          </span>
          {definition}
        </span>
      )}
    </span>
  );
}

"use client";

import { useState, useRef, useId } from "react";
import { createPortal } from "react-dom";

interface Props {
  term: string;
  definition: string;
}

const TOOLTIP_W = 288; // w-72 = 18rem

export default function MedicalTerm({ term, definition }: Props) {
  const [visible, setVisible] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const btnRef = useRef<HTMLButtonElement>(null);
  const tooltipId = useId();

  function open() {
    if (!btnRef.current) return;
    const r = btnRef.current.getBoundingClientRect();
    const vw = window.innerWidth;
    // Centrer horizontalement sur le terme, recadrer si débordement
    let left = r.left + r.width / 2 - TOOLTIP_W / 2;
    if (left + TOOLTIP_W > vw - 8) left = vw - TOOLTIP_W - 8;
    if (left < 8) left = 8;
    setPos({ top: r.bottom + 8, left });
    setVisible(true);
  }

  function close() {
    setVisible(false);
  }

  return (
    <span className="relative inline-block">
      <button
        ref={btnRef}
        type="button"
        onMouseEnter={open}
        onMouseLeave={close}
        onFocus={open}
        onBlur={close}
        onKeyDown={(e) => { if (e.key === "Escape") close(); }}
        aria-describedby={visible ? tooltipId : undefined}
        className="font-inherit underline decoration-dotted decoration-1 underline-offset-[3px] decoration-primary/60 text-foreground hover:text-primary transition-colors cursor-help"
      >
        {term}
      </button>

      {visible && typeof document !== "undefined" &&
        createPortal(
          <span
            id={tooltipId}
            role="tooltip"
            className="bg-background border border-border-strong p-3 text-base font-normal text-muted leading-relaxed text-left pointer-events-none"
            style={{
              position: "fixed",
              top: pos.top,
              left: pos.left,
              zIndex: 9999,
              width: TOOLTIP_W,
              maxWidth: "calc(100vw - 1rem)",
              fontFamily: "var(--font-sans)",
            }}
          >
            <span
              className="block text-sm font-semibold text-primary mb-1"
            >
              {term}
            </span>
            {definition}
          </span>,
          document.body
        )}
    </span>
  );
}

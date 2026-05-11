"use client";

import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import type { Section } from "@/types/intervention";

interface NavItem {
  id: string;
  label: string;
  type: Section["type"];
}

interface Props {
  items: NavItem[];
  collapsible?: boolean;
}

export default function InterventionSidebarNav({ items, collapsible = false }: Props) {
  const [activeId, setActiveId] = useState<string>("");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!items.length) return;

    // Offset = sticky header (64px) + sticky top-bar (~64px) + small buffer
    const OFFSET = 148;

    const update = () => {
      let current = items[0].id;
      for (const { id } of items) {
        const el = document.getElementById(id);
        if (!el) continue;
        if (el.getBoundingClientRect().top <= OFFSET) {
          current = id;
        }
      }
      setActiveId(current);
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, [items]);

  const links = (
    <ul className="space-y-1">
      {items.map((item) => (
        <li key={item.id}>
          <a
            href={`#${item.id}`}
            onClick={() => collapsible && setOpen(false)}
            className={`block px-3 py-2.5 rounded-lg text-base transition-colors ${
              activeId === item.id
                ? "bg-blue-50 font-semibold"
                : "hover:bg-gray-100"
            }`}
            style={{
              fontFamily: "var(--font-heading)",
              minHeight: "44px",
              display: "flex",
              alignItems: "center",
              color: activeId === item.id ? "#0369A1" : "#334155",
            }}
          >
            {item.label}
          </a>
        </li>
      ))}
    </ul>
  );

  if (collapsible) {
    return (
      <div className="rounded-xl border border-gray-200 overflow-hidden">
        <button
          onClick={() => setOpen((v) => !v)}
          className="w-full flex items-center justify-between px-4 py-3.5 bg-gray-50 hover:bg-gray-100 transition-colors"
          style={{ fontFamily: "var(--font-heading)", minHeight: "48px" }}
          aria-expanded={open}
        >
          <span className="text-[13px] font-semibold tracking-wider uppercase" style={{ color: "#475569" }}>
            Sur cette page
          </span>
          <ChevronDown
            className="w-5 h-5 transition-transform duration-200"
            style={{
              color: "#475569",
              transform: open ? "rotate(180deg)" : "rotate(0deg)",
            }}
          />
        </button>
        {open && <div className="px-3 py-3">{links}</div>}
      </div>
    );
  }

  return (
    <nav>
      <p
        className="text-[13px] font-semibold tracking-wider uppercase mb-3"
        style={{ fontFamily: "var(--font-heading)", color: "#475569" }}
      >
        Sur cette page
      </p>
      {links}
    </nav>
  );
}

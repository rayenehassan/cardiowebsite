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
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActiveId(entry.target.id);
        }
      },
      { rootMargin: "-10% 0px -80% 0px" }
    );
    items.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [items]);

  const links = (
    <ul className="space-y-0.5">
      {items.map((item) => (
        <li key={item.id}>
          <a
            href={`#${item.id}`}
            onClick={() => collapsible && setOpen(false)}
            className={`block px-3 py-2 rounded-lg text-sm transition-colors ${
              activeId === item.id
                ? "text-blue-600 bg-blue-50 font-medium"
                : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
            }`}
            style={{ fontFamily: "var(--font-heading)" }}
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
          className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          <span className="text-xs font-bold tracking-widest uppercase text-gray-400">
            Sur cette page
          </span>
          <ChevronDown
            className="w-4 h-4 text-gray-400 transition-transform duration-200"
            style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
          />
        </button>
        {open && <div className="px-3 py-2">{links}</div>}
      </div>
    );
  }

  return (
    <nav>
      <p
        className="text-[11px] font-bold tracking-widest uppercase text-gray-400 mb-3"
        style={{ fontFamily: "var(--font-heading)" }}
      >
        Sur cette page
      </p>
      {links}
    </nav>
  );
}

"use client";

import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import type { Section } from "@/types/intervention";
import { frenchTypography } from "@/lib/text";

interface NavItem {
  id: string;
  label: string;
  number: number;
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

    const update = () => {
      const midY = window.innerHeight / 2;
      let current = items[0].id;
      for (const { id } of items) {
        const el = document.getElementById(id);
        if (!el) continue;
        if (el.getBoundingClientRect().top <= midY) {
          current = id;
        }
      }
      // En bas de page, la dernière section (souvent courte) ne franchit jamais
      // le milieu de l'écran : on force le dernier item actif pour éviter qu'il
      // reste impossible à atteindre.
      const atBottom =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 2;
      if (atBottom) current = items[items.length - 1].id;
      setActiveId(current);
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update, { passive: true });
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [items]);

  const links = (
    <ul className="flex flex-col">
      {items.map((item) => {
        const active = activeId === item.id;
        return (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              onClick={() => collapsible && setOpen(false)}
              aria-current={active ? "true" : undefined}
              className={`flex items-baseline gap-2.5 min-h-11 py-2 border-l-2 pl-3 -ml-px text-base transition-colors ${
                active
                  ? "border-primary text-primary font-semibold"
                  : "border-transparent text-muted hover:text-foreground"
              }`}
            >
              <span className="tabular-nums text-muted-soft shrink-0">
                {item.number}
              </span>
              <span>{frenchTypography(item.label)}</span>
            </a>
          </li>
        );
      })}
    </ul>
  );

  if (collapsible) {
    return (
      <div className="border border-border">
        <button
          onClick={() => setOpen((v) => !v)}
          className="w-full flex items-center justify-between gap-3 min-h-12 px-4 py-3 text-base text-foreground bg-surface transition-colors hover:bg-surface-alt"
          aria-expanded={open}
        >
          <span>Sur cette page ({items.length})</span>
          <ChevronDown
            className={`w-5 h-5 shrink-0 text-muted transition-transform ${
              open ? "rotate-180" : ""
            }`}
            aria-hidden="true"
          />
        </button>
        {open && <div className="px-4 py-3 border-t border-border">{links}</div>}
      </div>
    );
  }

  return (
    <nav aria-label="Sommaire de la fiche">
      <p className="text-sm text-muted-soft mb-3">Sur cette page</p>
      <div className="border-l border-border">{links}</div>
    </nav>
  );
}

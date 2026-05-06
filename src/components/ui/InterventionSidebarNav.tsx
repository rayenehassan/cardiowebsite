"use client";

import { useEffect, useState } from "react";
import { List, Video, Image as ImageIcon, FileText, HelpCircle } from "lucide-react";
import type { Section } from "@/types/intervention";

interface NavItem {
  id: string;
  label: string;
  type: Section["type"];
}

function sectionTypeIcon(type: Section["type"]) {
  switch (type) {
    case "list":     return <List     className="w-3.5 h-3.5 shrink-0" />;
    case "video":    return <Video    className="w-3.5 h-3.5 shrink-0" />;
    case "image":    return <ImageIcon className="w-3.5 h-3.5 shrink-0" />;
    case "document": return <FileText className="w-3.5 h-3.5 shrink-0" />;
    case "faqs":     return <HelpCircle className="w-3.5 h-3.5 shrink-0" />;
    default:         return null;
  }
}

export default function InterventionSidebarNav({ items }: { items: NavItem[] }) {
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    if (!items.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
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

  return (
    <nav>
      <p
        className="text-[11px] font-bold tracking-widest uppercase text-gray-400 mb-3"
        style={{ fontFamily: "var(--font-heading)" }}
      >
        Sur cette page
      </p>
      <ul className="space-y-0.5">
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                activeId === item.id
                  ? "text-blue-600 bg-blue-50 font-medium"
                  : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
              }`}
              style={{ fontFamily: "var(--font-heading)" }}
            >
              {sectionTypeIcon(item.type)}
              <span>{item.label}</span>
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

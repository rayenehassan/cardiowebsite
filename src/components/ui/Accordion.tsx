"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import GlossaryText from "./GlossaryText";

interface AccordionItem {
  id: string;
  question: string;
  answer: string;
}

interface Props {
  items: AccordionItem[];
}

export default function Accordion({ items }: Props) {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <div className="space-y-2.5">
      {items.map((item) => {
        const isOpen = openId === item.id;
        return (
          <div
            key={item.id}
            className="rounded-xl overflow-hidden border border-gray-200"
            style={{ background: isOpen ? "#F8FAFF" : "#ffffff" }}
          >
            <button
              className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left hover:bg-gray-50 focus-visible:bg-gray-50 transition-colors"
              onClick={() => setOpenId(isOpen ? null : item.id)}
              aria-expanded={isOpen}
              style={{ minHeight: "56px" }}
            >
              <span
                className="font-semibold text-foreground text-base sm:text-[17px] leading-snug"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                {item.question}
              </span>
              <ChevronDown
                className={`w-5 h-5 shrink-0 transition-transform duration-200 ${
                  isOpen ? "rotate-180" : ""
                }`}
                style={{ color: "#475569" }}
              />
            </button>
            {isOpen && (
              <div
                className="px-5 pb-5 leading-[1.8] text-[17px] border-t border-gray-100 pt-4"
                style={{ color: "#334155" }}
              >
                <GlossaryText text={item.answer} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

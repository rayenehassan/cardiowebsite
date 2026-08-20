"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import GlossaryText from "./GlossaryText";
import { frenchTypography } from "@/lib/text";

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
    <div className="border-t border-border max-w-prose">
      {items.map((item) => {
        const isOpen = openId === item.id;
        return (
          <div key={item.id} className="border-b border-border">
            <button
              className="w-full flex items-start justify-between gap-4 min-h-14 py-3.5 text-left transition-colors hover:text-primary"
              onClick={() => setOpenId(isOpen ? null : item.id)}
              aria-expanded={isOpen}
            >
              <span className="text-base font-semibold text-foreground">
                {frenchTypography(item.question)}
              </span>
              <ChevronDown
                className={`w-5 h-5 shrink-0 mt-0.5 text-muted transition-transform ${
                  isOpen ? "rotate-180" : ""
                }`}
                aria-hidden="true"
              />
            </button>
            {isOpen && (
              <div className="pb-4 text-base text-muted">
                {item.answer.trimStart().startsWith("<") ? (
                  <div
                    className="rich-text"
                    dangerouslySetInnerHTML={{ __html: item.answer }}
                  />
                ) : (
                  <GlossaryText text={item.answer} />
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

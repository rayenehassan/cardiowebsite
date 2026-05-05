import { FileText, Download } from "lucide-react";
import { Document } from "@/types/intervention";

interface Props {
  documents: Document[];
  showPrivate?: boolean;
}

export default function DocumentList({
  documents,
  showPrivate = false,
}: Props) {
  const filtered = showPrivate
    ? documents
    : documents.filter((d) => d.isPublic);

  if (filtered.length === 0) return null;

  return (
    <ul className="space-y-2">
      {filtered.map((doc) => (
        <li key={doc.id}>
          <a
            href={doc.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-surface-alt transition-colors group"
          >
            <FileText className="w-5 h-5 text-primary shrink-0" />
            <span className="flex-1 text-foreground text-sm font-medium">
              {doc.title}
              {!doc.isPublic && showPrivate && (
                <span className="ml-2 text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded">
                  Privé
                </span>
              )}
            </span>
            <Download className="w-4 h-4 text-muted group-hover:text-primary transition-colors shrink-0" />
          </a>
        </li>
      ))}
    </ul>
  );
}

import { LucideIcon } from "lucide-react";

interface Props {
  icon?: LucideIcon;
  title: string;
  id?: string;
}

export default function SectionHeading({ icon: Icon, title, id }: Props) {
  return (
    <h2
      id={id}
      className="flex items-center gap-3 text-xl font-bold text-foreground mb-4 scroll-mt-20"
    >
      {Icon && (
        <span className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary/10 text-primary">
          <Icon className="w-5 h-5" />
        </span>
      )}
      {title}
    </h2>
  );
}

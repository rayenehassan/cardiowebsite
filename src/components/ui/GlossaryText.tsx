import { Fragment } from "react";
import MedicalTerm from "./MedicalTerm";
import { segmentMedicalText } from "@/lib/glossary";

interface Props {
  text: string;
}

export default function GlossaryText({ text }: Props) {
  const segments = segmentMedicalText(text);
  return (
    <>
      {segments.map((seg, i) =>
        seg.type === "term" && seg.definition ? (
          <MedicalTerm key={i} term={seg.value} definition={seg.definition} />
        ) : (
          <Fragment key={i}>{seg.value}</Fragment>
        )
      )}
    </>
  );
}

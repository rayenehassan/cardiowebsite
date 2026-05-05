export type SectionType =
  | "text"
  | "list"
  | "video"
  | "image"
  | "document"
  | "faqs";

export interface Section {
  id: string;
  type: SectionType;
  title: string;
  // text
  body?: string;
  // list
  items?: string[];
  ordered?: boolean;
  // video
  videoUrl?: string;
  videoType?: "youtube" | "vimeo" | "file";
  // image
  imageUrl?: string;
  imageAlt?: string;
  // faqs
  faqs?: Array<{ id: string; question: string; answer: string }>;
  // document
  documentUrl?: string;
  isPublic?: boolean;
}

// Kept for VideoEmbed / DocumentList / Accordion components
export interface Video {
  id: string;
  title: string;
  url: string;
  type: "youtube" | "vimeo" | "file";
}

export interface Image {
  id: string;
  title: string;
  url: string;
  alt: string;
}

export interface Document {
  id: string;
  title: string;
  url: string;
  isPublic: boolean;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
}

export type InterventionStatus = "draft" | "published";

export interface Intervention {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  status: InterventionStatus;
  sections: Section[];
  createdAt: string;
  updatedAt: string;
}

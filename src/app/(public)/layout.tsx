import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ChatWidget from "@/components/ui/ChatWidget";
import { getPublicSiteContent } from "@/lib/site-content";
import { getPublishedInterventions } from "@/lib/interventions";

// Nom court (sans le sous-titre technique après un tiret/parenthèse).
function shortName(title: string): string {
  return title.split(/[-–—(]/)[0].trim() || title.trim();
}

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [content, interventions] = await Promise.all([
    getPublicSiteContent(),
    getPublishedInterventions(),
  ]);
  const chatInterventions = interventions.map((i) => ({
    slug: i.slug,
    name: shortName(i.title),
  }));
  return (
    <>
      <Header brand={content.brand} />
      <main className="flex-1">{children}</main>
      <Footer brand={content.brand} footer={content.footer} />
      <ChatWidget interventions={chatInterventions} brandName={content.brand.name} />
    </>
  );
}

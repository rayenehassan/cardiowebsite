import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { getPublicSiteContent } from "@/lib/site-content";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const content = await getPublicSiteContent();
  return (
    <>
      <Header brand={content.brand} />
      <main className="flex-1">{children}</main>
      <Footer brand={content.brand} footer={content.footer} />
    </>
  );
}

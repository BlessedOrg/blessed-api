import { Header } from "@/components/home/header/Header";
import { Navigation } from "@/components/nav/Navigation";
import { TabsSection } from "@/components/home/tabsSection/TabsSection";
import { TilesSection } from "@/components/home/tilesSection/TilesSection";
import { QuoteSection } from "@/components/home/quoteSection/QuoteSection";
import { QuestionsSection } from "@/components/home/questionsSection/QuestionsSection";

export default function Home() {

  return (
    <>
      <Navigation />
      <Header />
      <TabsSection />
      <TilesSection />
      <QuoteSection />
      <QuestionsSection />
    </>
  );
}

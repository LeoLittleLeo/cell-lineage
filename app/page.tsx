import { CellApp } from "./components/CellApp";
import { LanguageProvider } from "./i18n/LanguageContext";

export default function Home() {
  return <LanguageProvider><CellApp /></LanguageProvider>;
}

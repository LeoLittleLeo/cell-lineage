import { CellApp } from "./components/CellApp";
import { getChatGPTUser } from "./chatgpt-auth";
import { LanguageProvider } from "./i18n/LanguageContext";

export default async function Home() {
  const user = await getChatGPTUser();
  return <LanguageProvider><CellApp user={user ? { displayName: user.displayName } : null} /></LanguageProvider>;
}

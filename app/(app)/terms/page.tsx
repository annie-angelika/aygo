import { LegalScreen } from "@/components/screens/legal-screen";
import { TERMS } from "@/lib/legal-content";

export const metadata = { title: "Terms of Use" };

export default function TermsPage() {
  return <LegalScreen {...TERMS} />;
}

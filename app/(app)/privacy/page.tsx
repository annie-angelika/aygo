import { LegalScreen } from "@/components/screens/legal-screen";
import { PRIVACY } from "@/lib/legal-content";

export const metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return <LegalScreen {...PRIVACY} />;
}

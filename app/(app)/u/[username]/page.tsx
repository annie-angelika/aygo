import { ProfileScreen } from "@/components/screens/profile-screen";
import { normalizeUsername } from "@/lib/username";

type Params = { params: Promise<{ username: string }> };

export async function generateMetadata({ params }: Params) {
  const { username } = await params;
  return { title: `@${normalizeUsername(username)}` };
}

/** Someone's public profile — open to anyone with the link. */
export default async function PublicProfilePage({ params }: Params) {
  const { username } = await params;
  return <ProfileScreen username={normalizeUsername(username)} />;
}

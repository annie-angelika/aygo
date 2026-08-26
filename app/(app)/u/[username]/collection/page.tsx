import { PassportScreen } from "@/components/screens/passport-screen";
import { normalizeUsername } from "@/lib/username";

type Params = { params: Promise<{ username: string }> };

export async function generateMetadata({ params }: Params) {
  const { username } = await params;
  return { title: `@${normalizeUsername(username)}'s collection` };
}

/** Someone's aygo collection — open to anyone with the link. */
export default async function PublicCollectionPage({ params }: Params) {
  const { username } = await params;
  return <PassportScreen username={normalizeUsername(username)} />;
}

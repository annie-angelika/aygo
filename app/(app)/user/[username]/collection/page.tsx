import { PassportScreen } from "@/components/screens/passport-screen";
import { findUser } from "@/lib/users-data";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const name = findUser(username)?.name ?? `@${username}`;
  return { title: `${name}'s collection` };
}

export default async function UserPassportPage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  return <PassportScreen username={username} />;
}

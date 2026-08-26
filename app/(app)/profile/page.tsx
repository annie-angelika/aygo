import { ProfileScreen } from "@/components/screens/profile-screen";
import { findUser } from "@/lib/users-data";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  return { title: findUser(username)?.name ?? `@${username}` };
}

export default async function UserPage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  return <ProfileScreen username={username} />;
}

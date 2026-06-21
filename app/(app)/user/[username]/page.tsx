import { ProfileScreen } from "@/components/screens/profile-screen";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  return { title: `aygo — @${username}` };
}

export default async function UserPage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  return <ProfileScreen username={username} />;
}

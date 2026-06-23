import { PassportScreen } from "@/components/screens/passport-screen";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  return { title: `aygo — @${username}'s collection` };
}

export default async function UserPassportPage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  return <PassportScreen username={username} />;
}

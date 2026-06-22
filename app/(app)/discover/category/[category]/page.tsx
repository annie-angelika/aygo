import { notFound } from "next/navigation";

import { CATEGORIES, findCategory, categorySlug } from "@/lib/events-data";
import { CategoryScreen } from "@/components/screens/category-screen";

export function generateStaticParams() {
  return CATEGORIES.map((c) => ({ category: categorySlug(c) }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const found = findCategory(category);
  return { title: found ? `aygo — ${found}` : "aygo" };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const found = findCategory(category);
  if (!found) notFound();

  return <CategoryScreen category={found} />;
}

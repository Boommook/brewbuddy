import { notFound, redirect } from "next/navigation";
import { getUserId } from "@/src/server/auth";
import { getRecipe } from "@/src/server/recipes";
import RecipeForm from "@/src/app/components/RecipeForm";

export default async function EditRecipePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const userId = await getUserId();
  if (!userId) {
    redirect("/login");
  }

  const { id } = await params;
  const recipe = await getRecipe(id);

  if (!recipe) {
    notFound();
  }

  if (recipe.userId !== userId) {
    redirect("/recipes");
  }

  return <RecipeForm mode="edit" recipe={recipe} />;
}

import { redirect } from "next/navigation";
import { getUserId } from "@/src/server/auth";
import RecipeForm from "../components/RecipeForm";

export default async function CreateRecipePage() {
  const userId = await getUserId();
  if (!userId) {
    redirect("/login");
  }
  return <RecipeForm mode="create" />;
}

import { redirect } from "next/navigation"
import { getUserId } from "@/src/server/auth"
import CreateRecipe from "../components/CreateRecipe"

export default async function CreateRecipePage() {
  const userId = await getUserId()
  if (!userId) {
    redirect("/login")
  }
  return <CreateRecipe />
}

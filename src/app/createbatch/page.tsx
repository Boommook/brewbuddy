import { redirect } from "next/navigation"
import { getUserId } from "@/src/server/auth"
import CreateBatch from "../components/CreateBatch"

export default async function CreateBatchPage({
  searchParams,
}: {
  searchParams: Promise<{ recipe?: string }>;
}) {
  const userId = await getUserId()
  if (!userId) {
    redirect("/login")
  }
  const { recipe } = await searchParams
  return <CreateBatch initialRecipeId={recipe} />
}

import { redirect } from "next/navigation"
import { getUserId } from "@/src/server/auth"
import CreateBatch from "./CreateBatch"

export default async function CreateBatchPage() {
  const userId = await getUserId()
  if (!userId) {
    redirect("/login")
  }
  return <CreateBatch />
}

import Image from "next/image";
import { getUserId } from "../server/auth";
import Dashboard from "./components/Dashboard";
import { redirect } from "next/navigation";
import { getBatchesForDashboard } from "@/src/server/batches";

export default async function Home() {
  const userId = await getUserId();
  const batches = await getBatchesForDashboard();
  if (!userId) {
    redirect("/login");
  }
  return (
    <div className="flex h-full font-sans">
        <Dashboard batches={batches} />
    </div>
  );
}

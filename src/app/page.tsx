import Image from "next/image";
import { getUserId } from "../server/auth";
import Dashboard from "./components/Dashboard";
import { notFound, redirect } from "next/navigation";
import { getBatchesForDashboard } from "@/src/server/batches";
import { listRecipes } from "@/src/server/recipes";

export default async function Home() {
  const userId = await getUserId();
  const batches = await getBatchesForDashboard();
  const recipes = await listRecipes();
  if (!userId) {
    redirect("/login");
  }
  if (!batches || !recipes) {
    notFound();
  }
  else {
    console.log(recipes);
  }
  return (
    <div className="flex h-full font-sans">
        <Dashboard batches={batches} />
    </div>
  );
}

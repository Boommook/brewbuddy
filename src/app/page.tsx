import Image from "next/image";
import { getUserId } from "../server/auth";
import Dashboard from "./components/Dashboard";
import { redirect } from "next/navigation";

export default async function Home() {
  const userId = await getUserId();
  if (!userId) {
    redirect("/login");
  }
  return (
    <div className="flex h-full font-sans">
        <Dashboard />
    </div>
  );
}

import Image from "next/image";
import Dashboard from "./components/Dashboard";

export default function Home() {
  return (
    <div className="flex h-full font-sans">
        <Dashboard />
    </div>
  );
}

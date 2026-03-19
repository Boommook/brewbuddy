import Image from "next/image";
import Dashboard from "./components/Dashboard";

export default function Home() {
  return (
    <div className="flex min-h-screen bg-camel-300 font-sans">
        <Dashboard />
    </div>
  );
}

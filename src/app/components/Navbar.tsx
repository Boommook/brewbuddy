import Link from "next/link";
import { CirclePlus } from 'lucide-react';

export default function Navbar() {
  return (
    <nav className="bg-golden-orange-600 border-b-3 border-golden-orange-700">
      <div className="flex items-center justify-between w-full h-[8vh] px-8 text-antique-white zilla-slab-bold text-3xl">
        BrewBuddy
        <CirclePlus className="w-12 h-12 hover:bg-black/10 rounded-full p-1 hover:cursor-pointer hover:scale-110" />
      </div>
    </nav>
  );
}
import Link from "next/link";
import { CirclePlus } from "lucide-react";
import { getSessionUser } from "@/src/server/auth-credentials";
import { signOutAction } from "../actions/auth";
import { LogOut } from "lucide-react";
import { Button } from "./ui/button";

export default async function Navbar() {
  const user = await getSessionUser();

  return (
    <nav className="bg-golden-orange-600 border-b-3 border-cayenne-red-600">
      <div className="flex h-[8vh] w-full items-center justify-between px-8 text-antique-white zilla-slab-bold text-3xl">
        <Link href="/" className="hover:opacity-90">
          BrewBuddy
        </Link>

        <div className="flex items-center gap-6 text-xl font-normal">
          {user ? (
            <>
              <span className="text-antique-white-100 font-bold max-w-48 truncate max-md:hidden">
                {user.displayName ?? user.username}
              </span>
              
            </>
          ) : (
            <>
              <Link href="/login" className="hover:underline">
                Log in
              </Link>
              <Link href="/register" className="hover:underline">
                Register
              </Link>
            </>
          )}
          <Link href="/createbatch" className="button-style rounded-full">
            <CirclePlus className="size-10 rounded-full p-1" />
          </Link>
          {user && <form action={signOutAction}>
                <Button
                  type="submit"
                  className="button-style rounded-full flex items-center bg-transparent justify-center p-1 "
                >
                  <LogOut className="size-8" strokeWidth={2} />
                </Button>
              </form>}
        </div>
      </div>
    </nav>
  );
}

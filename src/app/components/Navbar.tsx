import Link from "next/link";
import { getSessionUser } from "@/src/server/auth-credentials";
import { DashboardFunnelButton } from "./DashboardFunnelButton";
import NavbarActions from "./NavbarActions";

export default async function Navbar() {
  const user = await getSessionUser();

  return (
    <nav className="bg-golden-orange-600 border-b-3 border-cayenne-red-600">
      <div className="flex h-[8vh] w-full items-center justify-between px-2 md:px-8 text-antique-white zilla-slab-bold text-3xl">
        <Link href="/" className="hover:opacity-90">
          BrewBuddy
        </Link>

        <div className="flex items-center gap-2 md:gap-6 text-xl font-normal">
          {user ? (
            <>
              <span className=" font-bold max-w-48 truncate max-md:hidden">
                {user.displayName ?? user.username}
              </span>
              <DashboardFunnelButton />
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
          <NavbarActions isLoggedIn={!!user} />
        </div>
      </div>
    </nav>
  );
}

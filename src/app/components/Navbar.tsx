import Link from "next/link";
import { getSessionUser } from "@/src/server/auth-credentials";
import { signOutAction } from "../actions/auth";
import { LogOut, CirclePlus, FilePlusCorner } from "lucide-react";
import { DashboardFunnelButton } from "./DashboardFunnelButton";
import { Button } from "./ui/button";
import {Tooltip, TooltipContent, TooltipTrigger} from "./ui/tooltip";
import CreateRecipe from "@/public/createrecipe.svg";
import CreateBatch from "@/public/createbatch.svg";
import Image from "next/image";

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
          {user && <Tooltip>
            <TooltipTrigger>
              <Link href="/createrecipe" className=" rounded-full">
              <div className="size-10 rounded-full  p-1">
                <Image src={CreateRecipe} alt="Create Recipe" className="size-full navbar-buttons brightness-0 invert" />
              </div>
              </Link>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>Create a new recipe</p>
            </TooltipContent>
          </Tooltip>}
          <Tooltip>
            <TooltipTrigger>
              <Link href="/createbatch" className="navbar-buttons rounded-full">
              <div className="size-10 rounded-full p-1">
                <Image src={CreateBatch} alt="Create Batch" className="size-full navbar-buttons brightness-0 invert" />
              </div>              </Link>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>Create a new batch</p>
            </TooltipContent>
          </Tooltip>
          {user && <Tooltip>
            <TooltipTrigger>
              <form action={signOutAction}>
                <Button
                  type="submit"
                  className="navbar-buttons rounded-full flex items-center bg-transparent justify-center p-1 "
                >
                  <LogOut className="size-8" strokeWidth={2} />
                </Button>
              </form>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>Log out</p>
            </TooltipContent>
          </Tooltip>}
        </div>
      </div>
    </nav>
  );
}

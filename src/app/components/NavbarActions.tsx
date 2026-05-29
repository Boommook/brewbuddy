"use client";

import Link from "next/link";
import Image from "next/image";
import { LogOut } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { signOutAction } from "../actions/auth";
import CreateRecipe from "@/public/createrecipe.svg";
import CreateBatch from "@/public/createbatch.svg";
import RecipesPage from "@/public/recipes.svg";

type NavbarActionsProps = {
  isLoggedIn: boolean;
};

export default function NavbarActions({ isLoggedIn }: NavbarActionsProps) {
  return (
    <>
      {isLoggedIn ? (
        <Tooltip>
          <TooltipTrigger
            render={(props) => (
              <Link href="/recipes" {...props} className="rounded-full">
                <div className="size-10 rounded-full p-1 flex items-center justify-center">
                  <Image src={RecipesPage} alt="Recipes" className="size-full navbar-buttons brightness-0 invert" />
                </div>
              </Link>
            )}
          />
          <TooltipContent side="bottom">
            <p>View and create recipes</p>
          </TooltipContent>
        </Tooltip>
      ) : null}

      <Tooltip>
        <TooltipTrigger
          render={(props) => (
            <Link href="/createbatch" {...props} className="navbar-buttons rounded-full">
              <div className="size-10 rounded-full p-1">
                <Image
                  src={CreateBatch}
                  alt="Create Batch"
                  className="size-full navbar-buttons brightness-0 invert"
                />
              </div>
            </Link>
          )}
        />
        <TooltipContent side="bottom">
          <p>Create a new batch</p>
        </TooltipContent>
      </Tooltip>

      {isLoggedIn ? (
        <Tooltip>
          <TooltipTrigger
            render={(props) => (
              <form action={signOutAction} className="inline">
                <button
                  type="submit"
                  {...props}
                  className="navbar-buttons rounded-full flex items-center bg-transparent justify-center p-1"
                >
                  <LogOut className="size-8" strokeWidth={2} />
                </button>
              </form>
            )}
          />
          <TooltipContent side="bottom">
            <p>Log out</p>
          </TooltipContent>
        </Tooltip>
      ) : null}
    </>
  );
}

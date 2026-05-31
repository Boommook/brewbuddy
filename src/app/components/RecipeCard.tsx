"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Globe, Pencil, Trash2, User } from "lucide-react";
import { Button } from "./ui/button";
import type { RecipeDTO } from "@/src/types/recipe";
import {
  formatTargetVolume,
  getBrewCategoryLabel,
  getMeadSubtypeLabel,
} from "@/src/lib/recipeLabels";
import ConfirmDialog from "./ConfirmDialog";

type RecipeCardProps = {
  recipe: RecipeDTO;
  currentUserId: string;
};

function ingredientSummary(recipe: RecipeDTO) {
  const names = recipe.ingredients
    .map((line) => line.ingredient?.name ?? line.customIngredientName)
    .filter((name): name is string => !!name);

  if (names.length === 0) {
    return "No ingredients listed";
  }

  const preview = names.slice(0, 3).join(", ");
  const extra = names.length > 3 ? ` +${names.length - 3} more` : "";
  return `${preview}${extra}`;
}

export default function RecipeCard({ recipe, currentUserId }: RecipeCardProps) {
  const router = useRouter();
  const isGlobal = recipe.userId === null;
  const isOwned = recipe.userId === currentUserId;

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const categoryLabel = getBrewCategoryLabel(recipe.category);
  const subtypeLabel =
    recipe.category === "MEAD" ? getMeadSubtypeLabel(recipe.meadSubtype) : null;

  const handleDelete = async () => {
    setDeleting(true);
    setDeleteError(null);
    try {
      const res = await fetch(`/api/recipes/${recipe.id}`, {
        method: "DELETE",
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        throw new Error(
          typeof data.error === "string" ? data.error : "Failed to delete recipe"
        );
      }
      setConfirmOpen(false);
      router.refresh();
    } catch (error) {
      setDeleteError(
        error instanceof Error ? error.message : "Failed to delete recipe"
      );
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <article className="flex h-full flex-col overflow-hidden rounded-xl border-2 border-harvest-orange-700 bg-camel/75 shadow-lg shadow-black/25">
        <div
          className={`flex items-start justify-between gap-3 border-b-2 px-4 py-3 ${
            isGlobal
              ? "border-bright-blue-700 bg-bright-blue-600/40"
              : "border-harvest-orange-800 bg-harvest-orange-500/40"
          }`}
        >
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="zilla-slab-bold max-w-[70%] truncate text-2xl text-gray-900">
                {recipe.name}
              </h2>
              {isGlobal ? (
                <span className="inline-flex items-center gap-1 rounded-full border border-bright-blue-800 bg-bright-blue-100/90 px-2 py-0.5 text-xs font-semibold text-bright-blue-900">
                  <Globe className="size-3.5" aria-hidden />
                  Global
                </span>
              ) : (
                <span className=" inline-flex items-center rounded-full border border-harvest-orange-800 bg-harvest-orange-200/80 px-2 py-0.5 text-xs font-semibold text-harvest-orange-950">
                  <User className="size-3.5" aria-hidden />
                  Yours
                </span>
              )}
            </div>
            <p className="mt-1 text-sm font-medium text-gray-800">
              {categoryLabel}
              {subtypeLabel ? ` · ${subtypeLabel}` : " · No subtype"}
            </p>
          </div>

          {isOwned ? (
            <div className="flex shrink-0 items-center gap-1">
              <Link
                href={`/recipes/${recipe.id}/edit`}
                className="rounded-full p-2 text-harvest-orange-950 hover:bg-harvest-orange-300/50"
                aria-label={`Edit ${recipe.name}`}
              >
                <Pencil className="size-5" />
              </Link>
              <button
                type="button"
                className="rounded-full p-2 text-cayenne-red-900 hover:bg-red-200/60"
                aria-label={`Delete ${recipe.name}`}
                onClick={() => setConfirmOpen(true)}
              >
                <Trash2 className="size-5" />
              </button>
            </div>
          ) : null}
        </div>

        <div className="flex flex-1 flex-col gap-3 px-4 py-4 text-gray-800 bg-antique-white-100/50">
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <dt className="font-semibold text-gray-700">Target volume</dt>
              <dd>
                {formatTargetVolume(
                  recipe.targetVolume,
                  recipe.targetVolumeUnit
                )}
              </dd>
            </div>
            <div>
              <dt className="font-semibold text-gray-700">Ingredients</dt>
              <dd>{recipe.ingredients.length}</dd>
            </div>
          </dl>

          {recipe.description ? (
            <p className="line-clamp-3 text-sm text-gray-700">
              {recipe.description}
            </p>
          ) : null}

          <p className="text-sm text-gray-600">{ingredientSummary(recipe)}</p>

          {deleteError ? (
            <p className="text-sm text-red-900">{deleteError}</p>
          ) : null}

          <Button
            type="button"
            variant="outline"
            className="w-full add-button text-md shadow-style hover:scale-102"
            onClick={() => router.push(`/createbatch?recipe=${recipe.id}`)}
          >
            Use in new batch
          </Button>
        </div>          
      </article>

      <ConfirmDialog
        open={confirmOpen}
        title="Delete recipe?"
        description={`"${recipe.name}" will be removed from your recipe library. This cannot be undone.`}
        confirmLabel="Delete recipe"
        confirming={deleting}
        destructive
        onConfirm={() => void handleDelete()}
        onCancel={() => {
          if (!deleting) {
            setConfirmOpen(false);
            setDeleteError(null);
          }
        }}
      />
    </>
  );
}

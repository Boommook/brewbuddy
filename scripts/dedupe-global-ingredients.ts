/**
 * One-off: merge duplicate global catalog ingredients.
 *
 * Groups non-archived global rows by (name, ingredientType, brand),
 * keeps the oldest row (by createdAt), repoints BatchIngredientAddition
 * rows to it, then deletes the duplicates.
 *
 * Usage (from repo root, with DATABASE_URL in .env.local):
 *   npx tsx --env-file=.env.local scripts/dedupe-global-ingredients.ts --dry-run
 *   npx tsx --env-file=.env.local scripts/dedupe-global-ingredients.ts
 */

import { prisma } from "../src/lib/prisma";

const dryRun = process.argv.includes("--dry-run");

function dedupeKey(row: {
  name: string;
  ingredientType: string;
  brand: string | null;
}) {
  return `${row.name}\0${row.ingredientType}\0${row.brand ?? ""}`;
}

async function main() {
  const rows = await prisma.ingredient.findMany({
    where: { isGlobal: true, isArchived: false },
    orderBy: { createdAt: "asc" },
  });

  const groups = new Map<string, typeof rows>();
  for (const row of rows) {
    const key = dedupeKey(row);
    const list = groups.get(key) ?? [];
    list.push(row);
    groups.set(key, list);
  }

  let mergedGroups = 0;
  let deletedRows = 0;
  let repointedAdditions = 0;

  if (dryRun) {
    for (const [, list] of groups) {
      if (list.length < 2) continue;
      mergedGroups += 1;
      const sorted = [...list].sort(
        (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
      );
      const keeper = sorted[0]!;
      const duplicateIds = sorted.slice(1).map((r) => r.id);
      const n = await prisma.batchIngredientAddition.count({
        where: { ingredientId: { in: duplicateIds } },
      });
      repointedAdditions += n;
      console.log(
        `[dry-run] keep ${keeper.id} (${keeper.name} / ${keeper.ingredientType}), delete ${duplicateIds.length} duplicate id(s), repoint ${n} batch addition(s)`
      );
    }
    console.log(
      `Dry run: ${mergedGroups} duplicate group(s), ${repointedAdditions} addition(s) would be repointed. Run without --dry-run to apply.`
    );
    return;
  }

  await prisma.$transaction(async (tx) => {
    for (const [, list] of groups) {
      if (list.length < 2) continue;
      mergedGroups += 1;
      const sorted = [...list].sort(
        (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
      );
      const keeper = sorted[0]!;
      const duplicateIds = sorted.slice(1).map((r) => r.id);

      const updateRes = await tx.batchIngredientAddition.updateMany({
        where: { ingredientId: { in: duplicateIds } },
        data: { ingredientId: keeper.id },
      });
      repointedAdditions += updateRes.count;

      const delRes = await tx.ingredient.deleteMany({
        where: { id: { in: duplicateIds } },
      });
      deletedRows += delRes.count;
    }
  });

  console.log(
    `Done. Merged ${mergedGroups} duplicate group(s), deleted ${deletedRows} ingredient row(s), repointed ${repointedAdditions} batch addition(s).`
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

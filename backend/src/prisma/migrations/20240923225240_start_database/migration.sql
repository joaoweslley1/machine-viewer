/*
  Warnings:

  - You are about to drop the column `exibir` on the `maquina_cadastro` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_maquina_cadastro" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "ip" TEXT NOT NULL,
    "alias" TEXT NOT NULL,
    "so" TEXT NOT NULL DEFAULT 'NULL',
    "situacao" TEXT NOT NULL DEFAULT 'I'
);
INSERT INTO "new_maquina_cadastro" ("alias", "id", "ip", "situacao", "so") SELECT "alias", "id", "ip", "situacao", "so" FROM "maquina_cadastro";
DROP TABLE "maquina_cadastro";
ALTER TABLE "new_maquina_cadastro" RENAME TO "maquina_cadastro";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

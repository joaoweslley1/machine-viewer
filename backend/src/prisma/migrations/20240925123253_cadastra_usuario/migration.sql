-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_usuarios" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senha" TEXT NOT NULL,
    "id_grupo" INTEGER NOT NULL DEFAULT 2,
    CONSTRAINT "usuarios_id_grupo_fkey" FOREIGN KEY ("id_grupo") REFERENCES "grupos" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_usuarios" ("email", "id", "id_grupo", "nome", "senha", "username") SELECT "email", "id", "id_grupo", "nome", "senha", "username" FROM "usuarios";
DROP TABLE "usuarios";
ALTER TABLE "new_usuarios" RENAME TO "usuarios";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateTable
CREATE TABLE "maquina_cadastro" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "ip" TEXT NOT NULL,
    "alias" TEXT NOT NULL,
    "situacao" TEXT NOT NULL DEFAULT 'I',
    "so" TEXT NOT NULL DEFAULT 'NULL',
    "exibir" TEXT NOT NULL DEFAULT 'S'
);

-- CreateTable
CREATE TABLE "maquina_status" (
    "id_cad" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "cputot" REAL NOT NULL DEFAULT 0.0,
    "cpudet" TEXT NOT NULL DEFAULT '0.0',
    "cputmp" REAL NOT NULL DEFAULT 0.0,
    "memtot" REAL NOT NULL DEFAULT 0.0,
    "memusa" REAL NOT NULL DEFAULT 0.0,
    "swptot" REAL NOT NULL DEFAULT 0.0,
    "swpusa" REAL NOT NULL DEFAULT 0.0,
    "dsktot" REAL NOT NULL DEFAULT 0.0,
    "dskusa" REAL NOT NULL DEFAULT 0.0,
    "dsktmp" REAL NOT NULL DEFAULT 0.0,
    CONSTRAINT "maquina_status_id_cad_fkey" FOREIGN KEY ("id_cad") REFERENCES "maquina_cadastro" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "grupos" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "usuarios" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senha" TEXT NOT NULL,
    "id_grupo" INTEGER NOT NULL,
    CONSTRAINT "usuarios_id_grupo_fkey" FOREIGN KEY ("id_grupo") REFERENCES "grupos" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "maquina_status_id_cad_key" ON "maquina_status"("id_cad");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_id_grupo_key" ON "usuarios"("id_grupo");

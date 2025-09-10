-- CreateTable
CREATE TABLE "public"."Amigurumi" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updateAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Amigurumi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Category" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Foto" (
    "id" SERIAL NOT NULL,
    "url" TEXT NOT NULL,
    "amigurumiId" INTEGER NOT NULL,

    CONSTRAINT "Foto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."_amigurumiCategory" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_amigurumiCategory_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_amigurumiCategory_B_index" ON "public"."_amigurumiCategory"("B");

-- AddForeignKey
ALTER TABLE "public"."Foto" ADD CONSTRAINT "Foto_amigurumiId_fkey" FOREIGN KEY ("amigurumiId") REFERENCES "public"."Amigurumi"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_amigurumiCategory" ADD CONSTRAINT "_amigurumiCategory_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."Amigurumi"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_amigurumiCategory" ADD CONSTRAINT "_amigurumiCategory_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

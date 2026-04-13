import { PrismaClient } from "@/generated/prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl)
  throw new Error("DATABASE_URL must be defined in environment variables");

const adapter = new PrismaLibSql({ url: dbUrl });
export const prisma = new PrismaClient({ adapter });

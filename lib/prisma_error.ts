import { Prisma } from "@prisma/client";

const normalizePrismaErrorMessage = (error: unknown): string => {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case "P2002": {
        const target = Array.isArray(error.meta?.target)
          ? (error.meta.target as string[]).join(", ")
          : undefined;
        return target
          ? `Duplicate value found for: ${target}.`
          : "Duplicate value found.";
      }
      case "P2003":
        return "Invalid relation or foreign key constraint.";
      case "P2014":
        return "Unable to complete the operation due to a relation constraint.";
      case "P2025":
        return "Requested record was not found.";
      case "P2015":
        return "A required related record could not be found.";
      case "P1001":
        return "Database connection could not be established.";
      default:
        return error.message;
    }
  }

  if (error instanceof Prisma.PrismaClientValidationError) {
    return "Invalid Prisma query input.";
  }

  if (error instanceof Prisma.PrismaClientInitializationError) {
    return "Prisma client could not be initialized.";
  }

  if (error instanceof Prisma.PrismaClientRustPanicError) {
    return "Prisma engine encountered a fatal error.";
  }

  if (error instanceof Prisma.PrismaClientUnknownRequestError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Unknown error";
};

export { normalizePrismaErrorMessage };


import { authOptions } from "@/app/lib/authOptions";
import prisma from "@/app/lib/prisma";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { entryId } = await req.json();

    if (!entryId || typeof entryId !== 'string') {
      return NextResponse.json(
        { message: "Invalid entry ID provided" },
        { status: 400 }
      );
    }

    const entryToDelete = await prisma.nutritionEntry.findUnique({
      where: {
        id: entryId,
      },
      select: {
        id: true,
        log: {
          select: {
            userId: true,
            id: true
          }
        }
      }
    });

    if (!entryToDelete) {
      return NextResponse.json(
        { message: "Entry not found" },
        { status: 404 }
      );
    }

    if (entryToDelete.log?.userId !== session.user.id) {
      return NextResponse.json(
        { message: "Forbidden: You do not own this entry" },
        { status: 403 }
      );
    }

    await prisma.nutritionEntry.delete({
      where: {
        id: entryId,
      },
    });

    return NextResponse.json(
      { message: "Entry deleted successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error deleting nutrition entry:", error);
    return NextResponse.json(
      {
        message: "Error while deleting entry.",
        error: error.message || "An unexpected error occurred",
      },
      { status: 500 }
    );
  }
}

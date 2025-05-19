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

    const result = await prisma.$transaction(async (tx) => {
      const entryToDelete = await tx.nutritionEntry.findUnique({
        where: { id: entryId },
        select: {
          id: true,
          logId: true, 
          log: {
            select: {
              userId: true,
              id: true,
            },
          },

        },
      });

      if (!entryToDelete) {
        throw new Error("Entry not found");
      }

      if (entryToDelete.log?.userId !== session.user.id) {
        throw new Error("Forbidden: You do not own this entry");
      }

      await tx.nutritionEntry.delete({
        where: { id: entryId },
      });

      const remainingEntries = await tx.nutritionEntry.findMany({
        where: { logId: entryToDelete.logId },
      });

      let totalCalories = 0;
      let totalProtein = 0.0;
      let totalFat = 0.0;
      let totalCarbs = 0.0;
      let totalWaterMl = 0;

      remainingEntries.forEach(entry => {
        totalCalories += entry.calories || 0;
        totalProtein += entry.protein || 0;
        totalFat += entry.fat || 0;
        totalCarbs += entry.carbs || 0;
        totalWaterMl += entry.waterMl || 0;
      });

      const updatedLog = await tx.userNutritionLog.update({
        where: { id: entryToDelete.logId },
        data: {
          totalCalories,
          totalProtein,
          totalFat,
          totalCarbs,
          totalWaterMl,
          updatedAt: new Date(),
        },
        include: {
            entries: {
                orderBy: { time: 'asc' }
            }
        }
      });

      return updatedLog;
    });


    return NextResponse.json(
      { message: "Entry deleted successfully", updatedLog: result }, 
      { status: 200 }
    );

  } catch (error: any) {
    console.error("Error deleting nutrition entry:", error);
    if (error.message === "Entry not found") {
      return NextResponse.json({ message: "Entry not found" }, { status: 404 });
    }
    if (error.message === "Forbidden: You do not own this entry") {
      return NextResponse.json({ message: "Forbidden: You do not own this entry" }, { status: 403 });
    }
    return NextResponse.json(
      {
        message: "Error while deleting entry.",
        error: error.message || "An unexpected error occurred",
      },
      { status: 500 }
    );
  }
}
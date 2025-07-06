import { authOptions } from "@/app/lib/authOptions";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }
        const userId = session.user.id;

        const habits = await prisma.habit.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
           select: {
                id: true,
                name: true,
                reason: true,
                frequencyDays: true,
                icon: true,
                type: true,
                target: true,
                targetUnit: true,
                timeOfDay: true,  
                reminderTime: true,

            }
        });

       return NextResponse.json({
            message: "Habits fetched successfully",
            habits: habits.map(habit => ({
                ...habit,
                frequencyDays: habit.frequencyDays.map(day => day.toUpperCase()), 
            }))
        }, { status: 200
       })
    } catch (error) {
        return NextResponse.json({
            message: "Error fetching habits",
            error: error instanceof Error ? error.message : "Unknown error"
        }, { status: 500
        })
    }
}
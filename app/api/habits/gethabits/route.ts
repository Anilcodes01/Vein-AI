import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/app/lib/prisma";
import { authOptions } from "@/app/lib/authOptions";

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }
        const userId = session.user.id;

        const habits = await prisma.habit.findMany({
            where: { userId },
            orderBy: { createdAt: 'asc' },
            include: {
                completions: {
                    select: {
                        date: true,
                    },
                },
            },
        });

       return NextResponse.json({
            message: "Habits fetched successfully",
            habits: habits
        }, { status: 200 });

    } catch (error) {
        return NextResponse.json({
            message: "Error fetching habits",
            error: error instanceof Error ? error.message : "Unknown error"
        }, { status: 500 });
    }
}
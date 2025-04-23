

import { authOptions } from "@/app/lib/authOptions";
import prisma from "@/app/lib/prisma";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        {
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    const fetchedUsers = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        username: true,
        streak: {
          select: {
            current: true,
            longest: true,
          }
        },
        image: true,
      },
    });

    return NextResponse.json(
      {
        message: "Users fetched successfully",
        users: fetchedUsers,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      {
        message: "Error fetching users",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

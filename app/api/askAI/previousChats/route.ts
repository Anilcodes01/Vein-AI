import { authOptions } from "@/app/lib/authOptions";
import prisma from "@/app/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        {
          message: "Unauthorized",
        },
        { status: 400 }
      );
    }
    const userId = session.user.id;
    const conversations = await prisma.conversation.findMany({
      where: { userId: userId },
      select: {
        id: true,
        title: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(
      {
        message: "Conversations fetched successfully...!",
        conversations: conversations,
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        message: "Error while creating previous chats...!",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

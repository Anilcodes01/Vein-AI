// app/api/askAI/[chatId]/route.ts
import { authOptions } from "@/app/lib/authOptions";
import prisma from "@/app/lib/prisma";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, { params }: { params: { chatId: string } }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { chatId } = await params;

    const chat = await prisma.conversation.findUnique({
      where: { id: chatId },
      select: {
        title: true,
        messages: true,
      },
    });

    return NextResponse.json(
      { message: "Chat fetched successfully", chat },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { message: "Error while fetching chat", error: error.message },
      { status: 500 }
    );
  }
}
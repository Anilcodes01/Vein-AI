// app/api/askAI/[chatId]/route.ts
import { authOptions } from "@/app/lib/authOptions";
import prisma from "@/app/lib/prisma";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: { chatId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { chatId } = params; // Removed 'await' since params is not a promise

    if (!chatId) {
      return NextResponse.json(
        { message: "Chat ID is required" },
        { status: 400 }
      );
    }

    const chat = await prisma.conversation.findUnique({
      where: { id: chatId },
      select: {
        title: true,
        messages: true,
      },
    });

    if (!chat) {
      return NextResponse.json(
        { message: "Chat not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Chat fetched successfully", chat },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { 
        message: "Error while fetching chat",
        error: process.env.NODE_ENV === "development" ? error.message : null 
      },
      { status: 500 }
    );
  }
}
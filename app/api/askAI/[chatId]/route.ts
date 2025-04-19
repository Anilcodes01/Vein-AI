
import { authOptions } from "@/app/lib/authOptions"; 
import prisma from "@/app/lib/prisma";            
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
    req: NextRequest
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
            );
        }
        const userId = session.user.id;

        const url = new URL(req.url);
        const pathSegments = url.pathname.split('/');
        const chatId = pathSegments[pathSegments.length - 1];

        if (!chatId || typeof chatId !== 'string' || chatId === '[chatId]') { 
            console.warn("Could not extract valid chatId from URL path:", url.pathname);
            return NextResponse.json(
                { message: "Valid Chat ID is required in the URL path" },
                { status: 400 }
            );
        }

        const chat = await prisma.conversation.findUnique({
            where: {
                id: chatId,
                userId: userId, 
            },
            select: {
                id: true,
                title: true,
                messages: {
                    orderBy: {
                        createdAt: 'asc'
                    }
                },
            },
        });

        if (!chat) {
            return NextResponse.json(
                { message: "Chat not found or you do not have permission to access it" },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { message: "Chat fetched successfully", chat },
            { status: 200 }
        );
    } catch (error: any) {
        console.error(`Error fetching chat (URL: ${req?.url}):`, error);
        return NextResponse.json(
            {
                message: "Error while fetching chat",
                error: process.env.NODE_ENV === "development" ? error.message : "An internal error occurred",
            },
            { status: 500 }
        );
    }
}
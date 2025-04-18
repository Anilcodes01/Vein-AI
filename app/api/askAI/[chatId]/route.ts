// app/api/askAI/[chatId]/route.ts
import { authOptions } from "@/app/lib/authOptions"; // Adjust path if needed
import prisma from "@/app/lib/prisma";             // Adjust path if needed
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

// Context parameter is no longer needed in the function signature
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

        // --- Extract chatId directly from the request URL ---
        const url = new URL(req.url);
        const pathSegments = url.pathname.split('/');
        // For a route like /api/askAI/[chatId], the ID is the last segment
        const chatId = pathSegments[pathSegments.length - 1];
        // --- ---

        // Basic validation of the extracted ID
        if (!chatId || typeof chatId !== 'string' || chatId === '[chatId]') { // Check it's not the placeholder itself
            console.warn("Could not extract valid chatId from URL path:", url.pathname);
            return NextResponse.json(
                { message: "Valid Chat ID is required in the URL path" },
                { status: 400 }
            );
        }
        // Optional: Add more robust validation if your chatId has a specific format (e.g., UUID)

        // --- Proceed with fetching logic ---
        const chat = await prisma.conversation.findUnique({
            where: {
                id: chatId,
                userId: userId, // SECURITY CHECK: Ensure user owns this chat
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
        // Log the URL in case of error for easier debugging
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
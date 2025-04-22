// src/app/api/streak/water/route.ts (for App Router)
// Or src/pages/api/streak/water.ts (for Pages Router - adjust req/res types)

import { authOptions } from "@/app/lib/authOptions"; // Adjust path as needed
import prisma from "@/app/lib/prisma"; // Adjust path as needed
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

// --- Handler for GET requests ---
export async function GET(req: NextRequest) { // Use NextApiRequest, NextApiResponse for Pages Router
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }
        const userId = session.user.id;

        const streak = await prisma.streak.findUnique({
            where: {
                userId_type: { // Use the compound unique index
                    userId: userId,
                    type: 'water',
                },
            },
            select: { // Select only the fields needed by the frontend
                current: true,
                longest: true,
                lastUpdated: true,
            }
        });

        // If no streak record exists, return default values
        if (!streak) {
            return NextResponse.json({
                current: 0,
                longest: 0,
                lastUpdated: null, // Indicate no history
            });
        }

        // Return the found streak data
        return NextResponse.json({
            current: streak.current,
            longest: streak.longest,
            // Send lastUpdated as ISO string, frontend will handle parsing
            lastUpdated: streak.lastUpdated?.toISOString() ?? null,
        });

    } catch (error: any) {
        console.error("Error fetching water streak:", error);
        return NextResponse.json(
            { message: "Error fetching streak data", error: error.message },
            { status: 500 }
        );
    }
}

// Add dummy POST, PUT, DELETE etc if using Pages Router and only want GET
// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//   if (req.method === 'GET') {
//      // ... GET logic from above, using res.status().json() ...
//   } else {
//     res.setHeader('Allow', ['GET']);
//     res.status(405).end(`Method ${req.method} Not Allowed`);
//   }
// }
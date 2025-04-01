import { authOptions } from "@/app/lib/authOptions";
import prisma from "@/app/lib/prisma";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, res: NextResponse) {
  try {
    const session = await getServerSession(authOptions);

    const userId = session?.user.id;

    if (!userId) {
      return NextResponse.json({
        message: 'User ID is missing from the session.',
      }, { status: 400 });
    }

    const userDashData = await prisma.userDashData.findFirst({
      where: {
        userId: userId
      }, 
      select: {
         calorieIntake: true,
         fatIntake: true,
         waterIntake: true,
         proteinIntake: true,
         carbohydrateIntake: true
      }
    })


    return NextResponse.json({
      message: 'User data fetched successfully...!',
      data: userDashData
    })
  } catch (error: any) {
    return NextResponse.json({
      message:'Error while fetching user intake details...!',
      error: error.message
    }, {status: 500})
  }
}
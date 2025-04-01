import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

import prisma from '../../lib/prisma';
import { authOptions } from '@/app/lib/authOptions';
import {
    ActivityLevel,
    AverageSleep,
    FitnessSuperpower,
    Identity
} from "@prisma/client";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();

    if (!body.name || !body.userId) {
      return NextResponse.json(
        { error: 'Name and userId are required' },
        { status: 400 }
      );
    }

    function safeEnumValue<T>(value: any, enumType: any): T | null {
      if (Object.values(enumType).includes(value)) {
        return value as T;
      }
      return null;
    }

    const userDetailsData = {
      age: body.age ? parseInt(body.age) : null,
      identity: safeEnumValue<Identity>(body.identity, Identity) ,
      height: body.height ? parseInt(body.height) : null,
      weight: body.weight ? parseInt(body.weight) : null,
      activityLevel: safeEnumValue<ActivityLevel>(body.activityLevel, ActivityLevel),
      averageSleep: safeEnumValue<AverageSleep>(body.averageSleep, AverageSleep),
      fitnessSuperpower: safeEnumValue<FitnessSuperpower>(body.fitnessSuperpower, FitnessSuperpower),
      mainGoals: body.maingoal ? [body.maingoal] : [],
      preferredWorkouts: body.preferredWorkouts ? [body.preferredWorkouts] : [],
      dietaryApproaches: body.dietaryApproach ? [body.dietaryApproach] : [],
      biggestChallenges: body.biggestChallenge ? [body.biggestChallenge] : [],
      rawData: body 
    };

    const result = await prisma.$transaction([
      prisma.user.update({
        where: { id: body.userId },
        data: {
          name: body.name,
        },
      }),
      prisma.userDetails.upsert({
        where: { userId: body.userId },
        update: userDetailsData,
        create: {
          userId: body.userId,
          ...userDetailsData,
        },
      }),
    ]);

    return NextResponse.json(
      { success: true, data: result },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error saving user data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/authOptions';
import prisma from '@/app/lib/prisma';
import { z } from 'zod';

const dateSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format. Expected YYYY-MM-DD.'),
});

async function verifyHabitOwner(habitId: string, userId: string) {
    const habit = await prisma.habit.findUnique({
        where: { id: habitId },
    });
    return !!habit && habit.userId === userId;
}

// Mark a habit as complete for a given date
export async function POST(
  req: Request,
  context: { params: Promise<{ habitId: string }> }
) {
  try {
    // Await params first
    const params = await context.params;
    
    // Get request body
    const body = await req.json();

    // Get session
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    
    // Verify habit ownership
    if (!(await verifyHabitOwner(params.habitId, session.user.id))) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const { date } = dateSchema.parse(body);

    const newCompletion = await prisma.habitCompletion.create({
      data: {
        habitId: params.habitId,
        userId: session.user.id,
        date: new Date(date),
      },
    });

    return NextResponse.json(newCompletion, { status: 201 });
  } catch (error) {
    console.error('[COMPLETIONS_POST_ERROR]', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: 'Invalid date format', errors: error.flatten() }, { status: 400 });
    }
    return NextResponse.json({ message: 'Error creating completion' }, { status: 500 });
  }
}

// Un-mark a habit as complete for a given date
export async function DELETE(
  req: Request,
  context: { params: Promise<{ habitId: string }> }
) {
  try {
    // Await params first
    const params = await context.params;
    
    // Get session
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Verify habit ownership
    if (!(await verifyHabitOwner(params.habitId, session.user.id))) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const date = searchParams.get('date');

    const validation = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).safeParse(date);
    if (!validation.success) {
      return NextResponse.json({ message: 'Date parameter is required in YYYY-MM-DD format' }, { status: 400 });
    }

    await prisma.habitCompletion.delete({
      where: {
        habitId_date: {
          habitId: params.habitId,
          date: new Date(validation.data),
        },
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('[COMPLETIONS_DELETE_ERROR]', error);
    return NextResponse.json({ message: 'Error deleting completion' }, { status: 500 });
  }
}
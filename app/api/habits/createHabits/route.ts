
import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/app/lib/prisma";
import { getServerSession } from "next-auth";
import { DayOfWeek } from "@prisma/client";
import { authOptions } from "@/app/lib/authOptions";

const habitSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  reason: z.string().max(500).optional().nullable(),
  icon: z.string().min(1, "Icon is required").max(4),
  type: z.enum(["CHECK_IN", "COUNT", "TIME"]),
  target: z.number().int().min(1).optional().nullable(),
  targetUnit: z.string().max(20).optional().nullable(),
  frequencyDays: z.array(z.enum(["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"])),
  timeOfDay: z.enum(["ANY", "MORNING", "AFTERNOON", "EVENING"]),
  hasReminder: z.boolean(),
  reminderTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format").optional().nullable(),
  duration: z.number().int().min(1),
}).superRefine((data, ctx) => {
  if ((data.type === "COUNT" || data.type === "TIME")) {
    if (data.target === undefined || data.target === null) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["target"], message: "Target is required" });
    }
    if (!data.targetUnit) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["targetUnit"], message: "Unit is required" });
    }
  }
  if (data.hasReminder && !data.reminderTime) {
     ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["reminderTime"], message: "Time is required for reminders" });
  }
});

const dayMap: { [key: string]: DayOfWeek } = {
  "SUN": "SUNDAY",
  "MON": "MONDAY",
  "TUE": "TUESDAY",
  "WED": "WEDNESDAY",
  "THU": "THURSDAY",
  "FRI": "FRIDAY",
  "SAT": "SATURDAY",
};


export async function POST(req: Request) {
  try {

    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    const userId = session.user.id;

    const body = await req.json();
    const parsedData = habitSchema.safeParse(body);

    if (!parsedData.success) {

      return NextResponse.json({ message: "Invalid input", errors: parsedData.error.flatten() }, { status: 400 });
    }

    const { frequencyDays, hasReminder, duration, ...habitData } = parsedData.data;

    const prismaFrequencyDays = frequencyDays.map(day => dayMap[day]);
    
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + duration);

    const newHabit = await prisma.habit.create({
      data: {
        ...habitData,
        userId: userId,
        reminders: hasReminder,
        reminderTime: hasReminder ? habitData.reminderTime : null,
        frequencyDays: prismaFrequencyDays,
        startDate,
        endDate,
      }
    });

    return NextResponse.json(newHabit, { status: 201 });

  } catch (error) {
    if (error instanceof z.ZodError) {
        return new NextResponse(JSON.stringify(error.issues), { status: 422 });
    }

    console.error("[HABITS_POST_API_ERROR]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
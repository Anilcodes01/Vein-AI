import { authOptions } from "@/app/lib/authOptions";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = session?.user.name;
    const prompt = `Greet ${user} for taking a step forward towards health and wellness in an encouraging and friendly way.`;

 
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }]
      }),
    });

    const data = await response.json();
    console.log(data);

    return NextResponse.json({
      message: data?.candidates?.[0]?.content?.parts?.[0]?.text ,
    });

  } catch (error) {
    return NextResponse.json(
      { message: "Error while generating response...", error },
      { status: 500 }
    );
  }
}

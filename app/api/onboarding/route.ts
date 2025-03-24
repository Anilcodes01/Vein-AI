import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function POST(req: NextRequest) {
  const { prompt } = await req.json();

  try {
    const response = await axios.post("https://api.gemini.com/v1/generate", {
      model: "gemini-2.0-flash",
      prompt,
    }, {
      headers: { Authorization: `Bearer AIzaSyCGepVLd8aJauaVvyb28_ZVrorpEkyBFB8` }
    });

    return NextResponse.json({ message: response.data.output.text });
  } catch (error) {
    return NextResponse.json({ error: "Error generating response" }, { status: 500 });
  }
}

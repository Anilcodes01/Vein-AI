import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import {  SystemPromptModel, SystemPromptUser } from "@/lib/systemprompt";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

let chat = null;
let userData = {}; 

function initChat() {
  if (!chat) {
    chat = ai.chats.create({
      model: "gemini-2.0-flash",
      history: [
        {
          role: "user",
          parts: [
            {
              text: SystemPromptUser,
            },
          ],
        },
        {
          role: "model",
          parts: [
            {
              text: SystemPromptModel,
            },
          ],
        },
      ],
    });
  }
}

async function generateGeminiResponse(userMessage) {
  try {
    initChat();

    const response = await chat.sendMessage({
      message: userMessage,
    });
    
    const aiResponse = response.text.trim();

    const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const jsonData = JSON.parse(jsonMatch[0]);
        Object.assign(userData, jsonData); 
        return {
          response: aiResponse,
          userData: jsonData 
        };
      } catch (e) {
        console.error("Error parsing JSON:", e);
      }
    }
    
    return {
      response: aiResponse,
      userData: Object.keys(userData).length > 0 ? userData : null
    };
    
  } catch (error) {
    console.error("Gemini SDK error:", error);
    throw new Error("Failed to generate response with Gemini SDK");
  }
}

export async function POST(request) {
  try {
   
    const { message } = await request.json();
    if (!message) {
      return NextResponse.json(
        { error: "No message provided" },
        { status: 400 }
      );
    }
    
    const { response, userData } = await generateGeminiResponse(message);

    
    return NextResponse.json({ 
      response,
      userData: userData || null
    });
    
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
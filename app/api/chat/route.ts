import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/authOptions';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: NextRequest) {
    try {
      const session = await getServerSession(authOptions);

      const user = session?.user.name;

        const { message } = await req.json();

        if (!message) {
            return NextResponse.json(
                { error: 'Message is required' },
                { status: 400 }
            );
        }

        const model = genAI.getGenerativeModel({
            model: "gemini-2.0-flash",
            generationConfig: {
              
                temperature: 0.1,    
            },
        });

      
        const systemPrompt = "[System: Respond extremely creative, keep answers length average and if it takes long to explain make it long. Use minimal formatting.]\n\n";
        const fullPrompt = systemPrompt + message;

        const stream = new ReadableStream({
            async start(controller) {
                try {
                    const result = await model.generateContentStream(fullPrompt);

                    for await (const chunk of result.stream) {
                        const chunkText = await chunk.text();
                        if (chunkText) {
                            controller.enqueue(new TextEncoder().encode(chunkText));
                        }
                    }
                    controller.close();
                } catch (error) {
                    console.error('Generation Error:', error);
                    controller.enqueue(new TextEncoder().encode('⚠️ Error generating response. Please try again.'));
                    controller.close();
                }
            },
        });

        return new Response(stream, {
            headers: { 'Content-Type': 'text/plain' },
        });

    } catch (error) {
        console.error('Request Processing Error:', error);
        return NextResponse.json(
            { error: 'Invalid request format - please check your input' },
            { status: 400 }
        );
    }
}
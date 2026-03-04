import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export async function POST(req: NextRequest) {
    try {
        const { message } = await req.json();
        const token = req.headers.get("authorization")?.replace("Bearer ", "");

        if (!message || message.trim().length === 0) {
            return NextResponse.json({ error: "Message is required." }, { status: 400 });
        }

        const response = await fetch(`${API_URL}/api/chatbot/message`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": token ? `Bearer ${token}` : "",
            },
            body: JSON.stringify({ message }),
        });

        const data = await response.json();

        if (!response.ok) {
            return NextResponse.json({ error: data.message || "AI service unavailable. Please try again later." }, { status: response.status });
        }

        return NextResponse.json(data);
    } catch (e) {
        console.error("Chatbot error:", e);
        return NextResponse.json({ error: "Internal server error." }, { status: 500 });
    }
}

import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const { symptoms, language = "English" } = await req.json();

        if (!symptoms || symptoms.trim().length < 3) {
            return NextResponse.json({ error: "Please provide symptoms." }, { status: 400 });
        }

        const systemPrompt = `You are an expert medical AI assistant helping doctors with preliminary symptom analysis.
Respond ONLY in valid JSON with this exact structure:
{
  "summary": "Brief clinical overview in 1-2 sentences",
  "possible_conditions": [
    { "name": "Condition name", "risk": "High|Medium|Low", "probability": "e.g. 65%", "description": "1-sentence explanation" }
  ],
  "recommended_tests": ["test1", "test2"],
  "red_flags": ["warning1", "warning2"],
  "next_steps": "Clinical recommendation in 1-2 sentences"
}
Provide 3-5 possible conditions ordered by probability. Be accurate and evidence-based.`;

        const userPrompt = `Patient presents with the following symptoms: ${symptoms}
Please analyze and provide differential diagnosis in JSON format. Language preference: ${language}.`;

        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
                "Content-Type": "application/json",
                "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
                "X-Title": "HealthCareMS",
            },
            body: JSON.stringify({
                model: "openai/gpt-4o-mini",
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: userPrompt },
                ],
                temperature: 0.3,
                response_format: { type: "json_object" },
            }),
        });

        if (!response.ok) {
            const err = await response.text();
            console.error("OpenRouter error:", err);
            return NextResponse.json({ error: "AI service unavailable. Please try again." }, { status: 502 });
        }

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;

        if (!content) {
            return NextResponse.json({ error: "Empty response from AI." }, { status: 502 });
        }

        const parsed = JSON.parse(content);
        return NextResponse.json({ result: parsed });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: "Internal error." }, { status: 500 });
    }
}

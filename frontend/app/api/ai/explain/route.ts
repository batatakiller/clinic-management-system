import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const { prescription, language = "English" } = await req.json();

        if (!prescription) {
            return NextResponse.json({ error: "Prescription data required." }, { status: 400 });
        }

        const isUrdu = language === "Urdu";

        const systemPrompt = isUrdu
            ? `آپ ایک صحت مند AI معاون ہیں۔ مریضوں کو ان کی دوائیں آسان اردو میں سمجھائیں۔ کوئی پیچیدہ طبی اصطلاحات استعمال نہ کریں۔`
            : `You are a patient-friendly medical AI. Explain prescriptions in simple, easy-to-understand English. Avoid complex medical jargon. Use short paragraphs and bullet points.`;

        const userPrompt = isUrdu
            ? `یہ نسخہ ہے: ${JSON.stringify(prescription)}\nآسان اردو میں سمجھائیں: دوائیں کیوں لی جا رہی ہیں، کیسے لینی ہیں، اور کیا احتیاطیں ہیں۔`
            : `Here is the prescription: ${JSON.stringify(prescription)}\nPlease explain: what each medicine is for, how to take it, important side effects to watch for, and lifestyle tips.`;

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
                temperature: 0.5,
            }),
        });

        if (!response.ok) {
            const err = await response.text();
            console.error("OpenRouter error:", err);
            return NextResponse.json({ error: "AI service unavailable." }, { status: 502 });
        }

        const data = await response.json();
        const explanation = data.choices?.[0]?.message?.content ?? "Unable to generate explanation.";

        return NextResponse.json({ explanation });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: "Internal error." }, { status: 500 });
    }
}

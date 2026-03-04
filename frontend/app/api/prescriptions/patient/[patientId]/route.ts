import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export async function GET(req: NextRequest, { params }: { params: Promise<{ patientId: string }> }) {
  try {
    const { patientId } = await params;
    const token = req.headers.get("authorization")?.replace("Bearer ", "");
    
    const response = await fetch(`${API_URL}/api/prescriptions/patient/${patientId}`, {
      headers: {
        "Authorization": token ? `Bearer ${token}` : "",
      },
    });

    const data = await response.json();
    
    if (!response.ok) {
      return NextResponse.json({ error: data.message || "Failed to fetch prescriptions" }, { status: response.status });
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching patient prescriptions:", error);
    return NextResponse.json({ error: "Failed to fetch prescriptions", data: [] }, { status: 500 });
  }
}

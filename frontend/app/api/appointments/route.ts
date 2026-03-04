import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get("authorization")?.replace("Bearer ", "");
    
    const response = await fetch(`${API_URL}/api/appointments`, {
      headers: {
        "Authorization": token ? `Bearer ${token}` : "",
      },
    });

    const data = await response.json();
    
    if (!response.ok) {
      return NextResponse.json({ error: data.message || "Failed to fetch appointments" }, { status: response.status });
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching appointments:", error);
    return NextResponse.json({ error: "Failed to fetch appointments", data: [] }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get("authorization")?.replace("Bearer ", "");
    const body = await req.json();
    
    const response = await fetch(`${API_URL}/api/appointments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": token ? `Bearer ${token}` : "",
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    
    if (!response.ok) {
      return NextResponse.json({ error: data.message || "Failed to book appointment" }, { status: response.status });
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error booking appointment:", error);
    return NextResponse.json({ error: "Failed to book appointment" }, { status: 500 });
  }
}

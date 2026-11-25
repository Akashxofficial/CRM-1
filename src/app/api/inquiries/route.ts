import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ingestWebsiteInquiry, WebsiteInquiryPayload } from "@/lib/website-lead-sync";

const ALLOWED_ORIGINS = [
  "https://client-inky-xi.vercel.app",
  "http://localhost:5173",
  "http://localhost:3000",
];

function getCorsHeaders(request: NextRequest) {
  const origin = request.headers.get("origin") || "";
  const allowOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : "*";
  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
    "Access-Control-Max-Age": "86400",
  };
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: getCorsHeaders(request),
  });
}

export async function GET(request: NextRequest) {
  const corsHeaders = getCorsHeaders(request);
  try {
    const websiteLeads = await prisma.lead.findMany({
      where: { source: "Website" },
      orderBy: { createdAt: "desc" },
      take: 50,
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        source: true,
        status: true,
        interestedType: true,
        budgetMin: true,
        budgetMax: true,
        priority: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        source: "Website",
        count: websiteLeads.length,
        leads: websiteLeads,
      },
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    console.error("GET /api/inquiries error:", error);
    return NextResponse.json(
      { success: false, message: "Unable to fetch website inquiries." },
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function POST(request: NextRequest) {
  const corsHeaders = getCorsHeaders(request);

  try {
    const body = (await request.json()) as WebsiteInquiryPayload;

    const fieldErrors: Record<string, string> = {};
    const hasName = Boolean(body.name?.trim() || body.firstName?.trim());
    const rawPhone = String(body.phone || body.mobile || "").replace(/\D/g, "");
    const email = (body.email || "").trim();

    if (!hasName) fieldErrors.firstName = "First name is required.";
    if (!rawPhone || rawPhone.length < 7) fieldErrors.phone = "A valid mobile number is required.";
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      fieldErrors.email = "Please enter a valid email address.";
    }

    if (Object.keys(fieldErrors).length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Please fix the highlighted fields.",
          errors: fieldErrors,
        },
        { status: 400, headers: corsHeaders }
      );
    }

    const result = await ingestWebsiteInquiry(body, { sendEmails: true });

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message: result.error || "Unable to submit enquiry.",
        },
        { status: 400, headers: corsHeaders }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Enquiry received and synced to UrbanGaon CRM Leads (Source: Website).",
        data: result.lead || null,
      },
      { status: 201, headers: corsHeaders }
    );
  } catch (error) {
    console.error("POST /api/inquiries error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Unable to process website enquiry right now.",
      },
      { status: 500, headers: corsHeaders }
    );
  }
}

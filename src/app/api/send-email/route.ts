/**
 * POST /api/send-email
 *
 * Sends transactional emails via Resend.
 *
 * Body (JSON):
 *   type: "welcome" | "subscription" | "inspection-report"
 *   to:   string | string[]
 *   data: object (varies by type)
 *
 * Requires Firebase Auth Bearer token for authorization.
 */

import { NextRequest, NextResponse } from "next/server";
import { verifyBearerToken } from "@/lib/firebase-admin";
import {
  sendWelcomeEmail,
  sendSubscriptionEmail,
  sendInspectionReportEmail,
} from "@/lib/resend";

export async function POST(request: NextRequest) {
  // 1. Verify authentication
  const authHeader = request.headers.get("authorization");

  try {
    await verifyBearerToken(authHeader);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. Parse request body
  let body: {
    type: string;
    to: string | string[];
    data: Record<string, unknown>;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const { type, to, data } = body;

  if (!type || !to || !data) {
    return NextResponse.json(
      { error: "Missing required fields: type, to, data" },
      { status: 400 }
    );
  }

  // 3. Send the appropriate email
  try {
    let result;

    switch (type) {
      case "welcome":
        result = await sendWelcomeEmail(
          Array.isArray(to) ? to[0] : to,
          data as { companyName: string; userName?: string }
        );
        break;

      case "subscription":
        result = await sendSubscriptionEmail(
          Array.isArray(to) ? to[0] : to,
          data as {
            tierName: string;
            price: string;
            currency: string;
            inspectionsLimit: number;
            billingPeriod: string;
            companyName?: string;
          }
        );
        break;

      case "inspection-report":
        result = await sendInspectionReportEmail(
          to,
          data as {
            inspectionId: string;
            buyerName: string;
            articleCode: string;
            articleDescription?: string;
            result: "pass" | "fail" | "pending";
            riskScore: "green" | "amber" | "red";
            lotSize: number;
            sampleSize: number;
            criticalDefects: number;
            majorDefects: number;
            minorDefects: number;
            totalDefects: number;
            inspectorName: string;
            inspectionType: string;
            aiSummary?: string;
            orgId: string;
          }
        );
        break;

      default:
        return NextResponse.json(
          { error: `Unknown email type: ${type}. Expected: welcome, subscription, inspection-report` },
          { status: 400 }
        );
    }

    console.log(`[send-email] Sent "${type}" email to ${Array.isArray(to) ? to.join(", ") : to}`);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[send-email] Failed to send "${type}" email:`, message);

    return NextResponse.json(
      { error: "Failed to send email", details: message },
      { status: 500 }
    );
  }
}

export const dynamic = "force-dynamic";

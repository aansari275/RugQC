/**
 * resend.ts — Email service for RugQC
 *
 * Uses Resend API to send transactional emails:
 *   - Welcome email (after onboarding)
 *   - Subscription confirmation (after payment)
 *   - Inspection report email (after submission)
 *
 * All emails use inline-styled HTML. No React Email dependency.
 * From address: "RugQC" <onboarding@resend.dev> (test mode)
 */

import { Resend } from "resend";

// ==========================================
// Client initialization
// ==========================================

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_ADDRESS = "RugQC <noreply@easternmills.com>";
const APP_URL = "https://rugqc.netlify.app";
const BRAND_COLOR = "#10B981";
const BRAND_COLOR_DARK = "#059669";

// ==========================================
// Shared template helpers
// ==========================================

function emailWrapper(content: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>RugQC</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:8px;overflow:hidden;border:1px solid #e4e4e7;">
          <!-- Header -->
          <tr>
            <td style="background-color:${BRAND_COLOR};padding:24px 32px;">
              <span style="font-size:24px;font-weight:700;color:#ffffff;letter-spacing:-0.5px;">RugQC</span>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:32px;">
              ${content}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:24px 32px;border-top:1px solid #e4e4e7;background-color:#fafafa;">
              <p style="margin:0;font-size:12px;color:#71717a;line-height:1.5;">
                RugQC - Quality Control for Rug & Carpet Manufacturers<br>
                <a href="${APP_URL}" style="color:${BRAND_COLOR};text-decoration:none;">${APP_URL}</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function ctaButton(text: string, url: string): string {
  return `
<table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px 0;">
  <tr>
    <td style="background-color:${BRAND_COLOR};border-radius:6px;">
      <a href="${url}" style="display:inline-block;padding:12px 28px;color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;border-radius:6px;">${text}</a>
    </td>
  </tr>
</table>`;
}

// ==========================================
// Welcome Email
// ==========================================

interface WelcomeEmailData {
  companyName: string;
  userName?: string;
}

export async function sendWelcomeEmail(to: string, data: WelcomeEmailData) {
  const greeting = data.userName ? `Hi ${data.userName},` : "Hi there,";

  const html = emailWrapper(`
    <h1 style="margin:0 0 16px;font-size:22px;font-weight:700;color:#18181b;">Welcome to RugQC</h1>
    <p style="margin:0 0 16px;font-size:15px;color:#3f3f46;line-height:1.6;">
      ${greeting}
    </p>
    <p style="margin:0 0 24px;font-size:15px;color:#3f3f46;line-height:1.6;">
      Your organization <strong>${data.companyName}</strong> is all set up. Here's how to get started:
    </p>

    <!-- Steps -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      <tr>
        <td style="padding:12px 16px;background-color:#f0fdf4;border-radius:6px;margin-bottom:8px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td width="32" valign="top">
                <span style="display:inline-block;width:24px;height:24px;background-color:${BRAND_COLOR};color:#fff;border-radius:50%;text-align:center;line-height:24px;font-size:12px;font-weight:700;">1</span>
              </td>
              <td style="padding-left:8px;">
                <p style="margin:0;font-size:14px;color:#18181b;font-weight:600;">Create your first inspection</p>
                <p style="margin:4px 0 0;font-size:13px;color:#52525b;">Start a Final, Inline, On-Loom, or Bazar inspection with our step-by-step wizard.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      <tr><td style="height:8px;"></td></tr>
      <tr>
        <td style="padding:12px 16px;background-color:#f0fdf4;border-radius:6px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td width="32" valign="top">
                <span style="display:inline-block;width:24px;height:24px;background-color:${BRAND_COLOR};color:#fff;border-radius:50%;text-align:center;line-height:24px;font-size:12px;font-weight:700;">2</span>
              </td>
              <td style="padding-left:8px;">
                <p style="margin:0;font-size:14px;color:#18181b;font-weight:600;">Customize your defect types</p>
                <p style="margin:4px 0 0;font-size:13px;color:#52525b;">Add your own defect codes in Settings, or use our industry-standard defaults.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      <tr><td style="height:8px;"></td></tr>
      <tr>
        <td style="padding:12px 16px;background-color:#f0fdf4;border-radius:6px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td width="32" valign="top">
                <span style="display:inline-block;width:24px;height:24px;background-color:${BRAND_COLOR};color:#fff;border-radius:50%;text-align:center;line-height:24px;font-size:12px;font-weight:700;">3</span>
              </td>
              <td style="padding-left:8px;">
                <p style="margin:0;font-size:14px;color:#18181b;font-weight:600;">Invite your team</p>
                <p style="margin:4px 0 0;font-size:13px;color:#52525b;">Add inspectors and admins from the Settings page so they can start submitting inspections.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    ${ctaButton("Start your first inspection", `${APP_URL}/inspector/new`)}

    <p style="margin:0;font-size:13px;color:#71717a;line-height:1.5;">
      Need help? Just reply to this email. We're happy to assist.
    </p>
  `);

  return resend.emails.send({
    from: FROM_ADDRESS,
    to,
    subject: "Welcome to RugQC",
    html,
  });
}

// ==========================================
// Subscription Confirmation Email
// ==========================================

interface SubscriptionEmailData {
  tierName: string;
  price: string;
  currency: string;
  inspectionsLimit: number;
  billingPeriod: string;
  companyName?: string;
}

export async function sendSubscriptionEmail(
  to: string,
  data: SubscriptionEmailData
) {
  const tierLabel = data.tierName.charAt(0).toUpperCase() + data.tierName.slice(1);

  const html = emailWrapper(`
    <h1 style="margin:0 0 16px;font-size:22px;font-weight:700;color:#18181b;">Your ${tierLabel} plan is active</h1>
    <p style="margin:0 0 24px;font-size:15px;color:#3f3f46;line-height:1.6;">
      ${data.companyName ? `Great news, <strong>${data.companyName}</strong>! ` : ""}Your RugQC subscription has been activated. Here are the details:
    </p>

    <!-- Plan details card -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e4e4e7;border-radius:8px;overflow:hidden;margin-bottom:24px;">
      <tr>
        <td style="background-color:${BRAND_COLOR};padding:16px 20px;">
          <span style="font-size:18px;font-weight:700;color:#ffffff;">${tierLabel} Plan</span>
        </td>
      </tr>
      <tr>
        <td style="padding:20px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="padding:8px 0;border-bottom:1px solid #f4f4f5;">
                <span style="font-size:13px;color:#71717a;">Price</span><br>
                <span style="font-size:15px;color:#18181b;font-weight:600;">${data.currency}${data.price} / ${data.billingPeriod}</span>
              </td>
            </tr>
            <tr>
              <td style="padding:8px 0;border-bottom:1px solid #f4f4f5;">
                <span style="font-size:13px;color:#71717a;">Inspections</span><br>
                <span style="font-size:15px;color:#18181b;font-weight:600;">Up to ${data.inspectionsLimit} per month</span>
              </td>
            </tr>
            <tr>
              <td style="padding:8px 0;border-bottom:1px solid #f4f4f5;">
                <span style="font-size:13px;color:#71717a;">Users</span><br>
                <span style="font-size:15px;color:#18181b;font-weight:600;">Unlimited</span>
              </td>
            </tr>
            <tr>
              <td style="padding:8px 0;">
                <span style="font-size:13px;color:#71717a;">Features</span><br>
                <span style="font-size:15px;color:#18181b;font-weight:600;">All features included</span>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <p style="margin:0 0 8px;font-size:14px;color:#3f3f46;line-height:1.6;">
      What's included in your plan:
    </p>
    <ul style="margin:0 0 24px;padding-left:20px;font-size:14px;color:#3f3f46;line-height:2;">
      <li>AI-powered inspection summaries</li>
      <li>Branded PDF reports</li>
      <li>Buyer portal access</li>
      <li>Custom workflows</li>
      <li>Multi-language support</li>
      <li>API access</li>
    </ul>

    ${ctaButton("Go to dashboard", `${APP_URL}/owner`)}

    <p style="margin:0;font-size:13px;color:#71717a;line-height:1.5;">
      Your subscription will automatically renew each ${data.billingPeriod}. You can manage your subscription from the Settings page.
    </p>
  `);

  return resend.emails.send({
    from: FROM_ADDRESS,
    to,
    subject: `Your RugQC ${tierLabel} plan is active`,
    html,
  });
}

// ==========================================
// Inspection Report Email
// ==========================================

interface InspectionReportEmailData {
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

export async function sendInspectionReportEmail(
  to: string | string[],
  data: InspectionReportEmailData
) {
  const resultUpper = data.result.toUpperCase();
  const isPass = data.result === "pass";
  const isFail = data.result === "fail";

  const resultColor = isPass ? "#10B981" : isFail ? "#EF4444" : "#F59E0B";
  const resultBg = isPass ? "#f0fdf4" : isFail ? "#fef2f2" : "#fffbeb";
  const resultBorder = isPass ? "#bbf7d0" : isFail ? "#fecaca" : "#fde68a";

  const riskLabel = data.riskScore.charAt(0).toUpperCase() + data.riskScore.slice(1);
  const riskColor =
    data.riskScore === "green" ? "#10B981" : data.riskScore === "red" ? "#EF4444" : "#F59E0B";

  const typeLabel = data.inspectionType
    .replace("_", " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

  const inspectionUrl = `${APP_URL}/owner/inspections/${data.inspectionId}`;

  const html = emailWrapper(`
    <!-- Result badge -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      <tr>
        <td style="background-color:${resultBg};border:1px solid ${resultBorder};border-radius:8px;padding:20px;text-align:center;">
          <span style="font-size:28px;font-weight:800;color:${resultColor};letter-spacing:1px;">${resultUpper}</span>
          <p style="margin:8px 0 0;font-size:13px;color:#52525b;">Inspection Result</p>
        </td>
      </tr>
    </table>

    <h1 style="margin:0 0 8px;font-size:20px;font-weight:700;color:#18181b;">Inspection Report</h1>
    <p style="margin:0 0 24px;font-size:14px;color:#71717a;">${typeLabel} inspection by ${data.inspectorName}</p>

    <!-- Details table -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e4e4e7;border-radius:8px;overflow:hidden;margin-bottom:24px;">
      <tr>
        <td style="padding:12px 16px;border-bottom:1px solid #f4f4f5;background-color:#fafafa;">
          <span style="font-size:12px;color:#71717a;text-transform:uppercase;letter-spacing:0.5px;">Buyer</span>
        </td>
        <td style="padding:12px 16px;border-bottom:1px solid #f4f4f5;">
          <span style="font-size:14px;color:#18181b;font-weight:600;">${data.buyerName}</span>
        </td>
      </tr>
      <tr>
        <td style="padding:12px 16px;border-bottom:1px solid #f4f4f5;background-color:#fafafa;">
          <span style="font-size:12px;color:#71717a;text-transform:uppercase;letter-spacing:0.5px;">Article</span>
        </td>
        <td style="padding:12px 16px;border-bottom:1px solid #f4f4f5;">
          <span style="font-size:14px;color:#18181b;font-weight:600;">${data.articleCode}${data.articleDescription ? ` - ${data.articleDescription}` : ""}</span>
        </td>
      </tr>
      <tr>
        <td style="padding:12px 16px;border-bottom:1px solid #f4f4f5;background-color:#fafafa;">
          <span style="font-size:12px;color:#71717a;text-transform:uppercase;letter-spacing:0.5px;">Lot / Sample Size</span>
        </td>
        <td style="padding:12px 16px;border-bottom:1px solid #f4f4f5;">
          <span style="font-size:14px;color:#18181b;">${data.lotSize} / ${data.sampleSize}</span>
        </td>
      </tr>
      <tr>
        <td style="padding:12px 16px;background-color:#fafafa;">
          <span style="font-size:12px;color:#71717a;text-transform:uppercase;letter-spacing:0.5px;">Risk Score</span>
        </td>
        <td style="padding:12px 16px;">
          <span style="display:inline-block;padding:2px 10px;background-color:${riskColor};color:#fff;border-radius:12px;font-size:12px;font-weight:600;">${riskLabel}</span>
        </td>
      </tr>
    </table>

    <!-- Defect breakdown -->
    <h2 style="margin:0 0 12px;font-size:16px;font-weight:700;color:#18181b;">Defect Breakdown</h2>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e4e4e7;border-radius:8px;overflow:hidden;margin-bottom:24px;">
      <tr style="background-color:#fafafa;">
        <td style="padding:10px 16px;font-size:12px;color:#71717a;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;border-bottom:1px solid #e4e4e7;">Severity</td>
        <td style="padding:10px 16px;font-size:12px;color:#71717a;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;border-bottom:1px solid #e4e4e7;text-align:right;">Count</td>
      </tr>
      <tr>
        <td style="padding:10px 16px;border-bottom:1px solid #f4f4f5;">
          <span style="font-size:14px;color:#EF4444;font-weight:600;">Critical</span>
        </td>
        <td style="padding:10px 16px;border-bottom:1px solid #f4f4f5;text-align:right;">
          <span style="font-size:14px;color:#18181b;font-weight:600;">${data.criticalDefects}</span>
        </td>
      </tr>
      <tr>
        <td style="padding:10px 16px;border-bottom:1px solid #f4f4f5;">
          <span style="font-size:14px;color:#F59E0B;font-weight:600;">Major</span>
        </td>
        <td style="padding:10px 16px;border-bottom:1px solid #f4f4f5;text-align:right;">
          <span style="font-size:14px;color:#18181b;font-weight:600;">${data.majorDefects}</span>
        </td>
      </tr>
      <tr>
        <td style="padding:10px 16px;border-bottom:1px solid #f4f4f5;">
          <span style="font-size:14px;color:#3B82F6;font-weight:600;">Minor</span>
        </td>
        <td style="padding:10px 16px;border-bottom:1px solid #f4f4f5;text-align:right;">
          <span style="font-size:14px;color:#18181b;font-weight:600;">${data.minorDefects}</span>
        </td>
      </tr>
      <tr style="background-color:#fafafa;">
        <td style="padding:10px 16px;">
          <span style="font-size:14px;color:#18181b;font-weight:700;">Total</span>
        </td>
        <td style="padding:10px 16px;text-align:right;">
          <span style="font-size:14px;color:#18181b;font-weight:700;">${data.totalDefects}</span>
        </td>
      </tr>
    </table>

    ${
      data.aiSummary
        ? `
    <!-- AI Summary -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      <tr>
        <td style="background-color:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px;">
          <p style="margin:0 0 4px;font-size:12px;color:${BRAND_COLOR};font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">AI Summary</p>
          <p style="margin:0;font-size:14px;color:#3f3f46;line-height:1.6;">${data.aiSummary}</p>
        </td>
      </tr>
    </table>
    `
        : ""
    }

    ${ctaButton("View full report", inspectionUrl)}

    <p style="margin:0;font-size:13px;color:#71717a;line-height:1.5;">
      This is an automated notification from your RugQC inspection system.
    </p>
  `);

  const recipients = Array.isArray(to) ? to : [to];

  return resend.emails.send({
    from: FROM_ADDRESS,
    to: recipients,
    subject: `Inspection Report: ${data.buyerName} - ${resultUpper}`,
    html,
  });
}

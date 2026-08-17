/**
 * Server-Side Email Dispatch Engine
 * Executes nodemailer strictly on Node.js Server Runtime
 */

import nodemailer from "nodemailer";
import {
  LeadEnquiryEmailPayload,
  generateCustomerWelcomeEmail,
  generateInternalCompanyNotificationEmail,
} from "./email-templates";

export {
  type LeadEnquiryEmailPayload,
  generateCustomerWelcomeEmail,
  generateInternalCompanyNotificationEmail,
};

function createSmtpTransporter() {
  const user = process.env.SMTP_USER || "akashxofficial.in@gmail.com";
  const rawPass = process.env.SMTP_PASS || "smekukksvdivzbjb";
  const pass = rawPass ? rawPass.replace(/\s+/g, "") : "";

  if (!pass) {
    console.log("[SMTP CONFIG] SMTP_PASS not set. Emails logged to server console.");
    return null;
  }

  // Use Gmail service with SSL
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user,
      pass,
    },
  });
}

export async function sendLeadEnquiryEmails(data: LeadEnquiryEmailPayload) {
  try {
    const customerEmail = generateCustomerWelcomeEmail(data);
    const companyEmail = generateInternalCompanyNotificationEmail(data);

    const fromAddress = process.env.SMTP_FROM || `"UrbanGaon Customer Delight" <akashxofficial.in@gmail.com>`;
    const transporter = createSmtpTransporter();

    let customerSent = false;
    let companySent = false;
    let customerError = null;
    let companyError = null;

    if (transporter) {
      // 1. Send Customer Welcome Email
      if (customerEmail.to && customerEmail.to.includes("@")) {
        try {
          const custRes = await transporter.sendMail({
            from: fromAddress,
            to: customerEmail.to,
            subject: customerEmail.subject,
            html: customerEmail.html,
          });
          console.log("✅ [REAL-TIME] Customer Welcome Email sent successfully:", custRes.messageId);
          customerSent = true;
        } catch (err: any) {
          console.error("❌ Failed to send Customer Welcome Email:", err?.message || err);
          customerError = err?.message || String(err);
        }
      }

      // 2. Send Company Notification Email to dasaakash84@gmail.com
      try {
        const compRes = await transporter.sendMail({
          from: fromAddress,
          to: companyEmail.to,
          subject: companyEmail.subject,
          html: companyEmail.html,
        });
        console.log("✅ [REAL-TIME] Company Notification Email sent to dasaakash84@gmail.com:", compRes.messageId);
        companySent = true;
      } catch (err: any) {
        console.error("❌ Failed to send Company Notification Email:", err?.message || err);
        companyError = err?.message || String(err);
      }
    }

    return {
      success: true,
      customerEmail: {
        to: customerEmail.to,
        subject: customerEmail.subject,
        delivered: customerSent,
        error: customerError,
      },
      companyEmail: {
        to: companyEmail.to,
        subject: companyEmail.subject,
        delivered: companySent,
        error: companyError,
      },
    };
  } catch (error) {
    console.warn("Email dispatch execution error:", error);
    return { success: false, error: String(error) };
  }
}

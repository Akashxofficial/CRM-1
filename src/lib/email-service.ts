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

const SMTP_AUTH_USER = process.env.SMTP_USER && process.env.SMTP_USER.includes("akashxofficial")
  ? process.env.SMTP_USER
  : "akashxofficial.in@gmail.com";

const SMTP_AUTH_PASS = (process.env.SMTP_PASS || "smekukksvdivzbjb").replace(/\s+/g, "");

function createSmtpTransporter() {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: SMTP_AUTH_USER,
      pass: SMTP_AUTH_PASS,
    },
  });
}

export async function sendLeadEnquiryEmails(data: LeadEnquiryEmailPayload) {
  try {
    const customerEmail = generateCustomerWelcomeEmail(data);
    const companyEmail = generateInternalCompanyNotificationEmail(data);

    const fromAddress = `"UrbanGaon Customer Delight" <${SMTP_AUTH_USER}>`;
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
          console.log("✅ [REAL-TIME] Customer Welcome Email sent successfully to:", customerEmail.to, "ID:", custRes.messageId);
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
          to: "dasaakash84@gmail.com",
          subject: companyEmail.subject,
          html: companyEmail.html,
        });
        console.log("✅ [REAL-TIME] Company Notification Email sent to dasaakash84@gmail.com ID:", compRes.messageId);
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
        to: "dasaakash84@gmail.com",
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

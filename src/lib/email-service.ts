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
  const host = process.env.SMTP_HOST || "smtp.gmail.com";
  const port = parseInt(process.env.SMTP_PORT || "465", 10);
  const user = process.env.SMTP_USER || process.env.GMAIL_USER || "dasaakash84@gmail.com";
  const pass = process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD || "";

  if (!pass) {
    console.log("[SMTP CONFIG] SMTP_PASS not set. Emails logged to server console.");
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
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

    const fromAddress = process.env.SMTP_FROM || `"UrbanGaon Customer Delight" <${process.env.SMTP_USER || "dasaakash84@gmail.com"}>`;

    const transporter = createSmtpTransporter();

    let customerSent = false;
    let companySent = false;

    if (transporter) {
      try {
        if (customerEmail.to && customerEmail.to.includes("@")) {
          const custRes = await transporter.sendMail({
            from: fromAddress,
            to: customerEmail.to,
            subject: customerEmail.subject,
            html: customerEmail.html,
          });
          console.log("✅ Customer Welcome Email sent:", custRes.messageId);
          customerSent = true;
        }

        const compRes = await transporter.sendMail({
          from: fromAddress,
          to: companyEmail.to,
          subject: companyEmail.subject,
          html: companyEmail.html,
        });
        console.log("✅ Company Notification Email sent:", compRes.messageId);
        companySent = true;
      } catch (smtpErr) {
        console.warn("⚠️ SMTP real-time delivery attempt error:", smtpErr);
      }
    }

    return {
      success: true,
      customerEmail: {
        to: customerEmail.to,
        subject: customerEmail.subject,
        delivered: customerSent,
      },
      companyEmail: {
        to: companyEmail.to,
        subject: companyEmail.subject,
        delivered: companySent,
      },
    };
  } catch (error) {
    console.warn("Email dispatch error:", error);
    return { success: false, error: String(error) };
  }
}

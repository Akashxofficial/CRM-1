/**
 * UrbanGaon Automated Real-Time Email Dispatch Engine
 * Formats and sends customer welcome emails (Drafts 1-6) and internal company notification emails.
 */

import nodemailer from "nodemailer";

export interface LeadEnquiryEmailPayload {
  salutation: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  mobile: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  pinCode?: string;
  dob?: string;
  maritalStatus?: string;
  childrenCount?: string;
  residentialStatus?: string;
  purposeOfPurchase?: string;
  customerProfile?: string;
  industryType?: string;
  companyName?: string;
  designation?: string;
  department?: string;
  annualIncome?: string;
  sourceOption: string;
  channelPartnerName?: string;
  empId?: string;
  referralDetails?: string;
  otherSource?: string;
  livingStatus?: string;
  housingStyle?: string;
  purchaseTimeline?: string;
  budgetRange?: string;
  projectName?: string;
  assignedAgentName?: string;
}

export function generateCustomerWelcomeEmail(data: LeadEnquiryEmailPayload) {
  const fullName = `${data.salutation} ${data.firstName} ${data.lastName}`.trim();
  const source = data.sourceOption || "";

  // 1. Channel Partner Referral (Draft-6)
  if (source.includes("Channel Partner") || data.channelPartnerName) {
    const partner = data.channelPartnerName || "Our Certified Channel Partner";
    return {
      to: data.email,
      subject: `Welcome to UrbanGaon – Referred by Our Certified Channel Partner!`,
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; background: #ffffff; color: #1e293b;">
          <div style="background: #131633; padding: 24px; text-align: center; color: #ffffff;">
            <div style="font-size: 22px; font-weight: bold; letter-spacing: 0.5px;">✦ UrbanGaon</div>
            <div style="font-size: 11px; color: #94a3b8; letter-spacing: 2px; text-transform: uppercase; margin-top: 2px;">a perfect balance</div>
          </div>
          <div style="padding: 32px 28px; line-height: 1.6; font-size: 14px;">
            <p style="font-weight: 600; font-size: 15px;">Dear ${fullName},</p>
            <p>Welcome to <strong>UrbanGaon One</strong>! We are thrilled to have you with us and grateful for the referral from our Certified Channel partner, <strong>${partner}</strong>. Your association with us through their recommendation means a lot.</p>
            <p>At <em>UrbanGaon</em>, we are committed to guiding you through your real estate journey with transparent, customer-focused service and expert advice tailored to your needs. Whether you are exploring new properties or investing in future growth, we are here to support you every step of the way.</p>
            <p>We look forward to providing you with an excellent experience and helping you find the perfect property solution.</p>
            <p>Thank you once again for your trust in UrbanGaon and our partners.</p>
            
            <div style="margin: 24px 0; padding: 18px; background: #f8fafc; border-left: 4px solid #3b8cff; border-radius: 8px;">
              <div style="font-size: 12px; font-weight: bold; color: #3b8cff; text-transform: uppercase;">Next Step:</div>
              <div style="font-size: 13px; color: #334155; margin-top: 4px;">Your dedicated Relationship Officer will call you within one hour from now.</div>
            </div>

            <p style="margin-top: 24px;">Warm Regards,<br><strong>Customer Delight Team</strong><br>UrbanGaon</p>
          </div>
          <div style="background: #f1f5f9; padding: 20px; text-align: center; font-size: 11px; color: #64748b; border-top: 1px solid #e2e8f0;">
            <div style="font-weight: bold; color: #0f172a; margin-bottom: 4px;">Get in touch</div>
            <div>Email: <a href="mailto:Info@urbangaon.com" style="color: #3b8cff; text-decoration: none;">Info@urbangaon.com</a> | <a href="mailto:dasaakash84@gmail.com" style="color: #3b8cff; text-decoration: none;">dasaakash84@gmail.com</a></div>
            <div>Contact: +91-9251836284 | 0141-6763064 | Website: <a href="https://www.urbangaon.com" style="color: #3b8cff;">www.urbangaon.com</a></div>
            <div style="margin-top: 8px; font-size: 10px; color: #94a3b8;">UrbanGaon, 2nd Floor, 74A, Sawai Pratap Singh Road, Near CM House, Opp. Loharu House, Gaurav Nagar, Civil lines, Jaipur, PIN: 302006, Rajasthan, India.</div>
          </div>
        </div>
      `,
    };
  }

  // 2. Employee Referral (Draft-4)
  if (source.includes("Employee Referral") || data.empId) {
    return {
      to: data.email,
      subject: `Welcome to UrbanGaon – Referred by Our Valued Team Member!`,
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; background: #ffffff; color: #1e293b;">
          <div style="background: #131633; padding: 24px; text-align: center; color: #ffffff;">
            <div style="font-size: 22px; font-weight: bold; letter-spacing: 0.5px;">✦ UrbanGaon</div>
            <div style="font-size: 11px; color: #94a3b8; letter-spacing: 2px; text-transform: uppercase; margin-top: 2px;">a perfect balance</div>
          </div>
          <div style="padding: 32px 28px; line-height: 1.6; font-size: 14px;">
            <p style="font-weight: 600; font-size: 15px;">Dear ${fullName},</p>
            <p>Welcome to <strong>UrbanGaon One</strong>! We are delighted to have you with us and thank you for trusting our services based on the referral from one of our dedicated team members ${data.empId ? `(Emp ID: ${data.empId})` : ""}.</p>
            <p>At <em>UrbanGaon</em>, we strive to provide you with the Premier property offerings tailored to your needs. Whether you are looking for your property or investment opportunities, our expert team is here to assist you at every step.</p>
            <p>As a token of our appreciation for choosing us through our employee referral program, we invite you to reach out anytime for personalized support or exclusive offers. Your satisfaction is our top priority.</p>
            <p>We look forward to helping you find the perfect property and building a lasting relationship.</p>
            
            <div style="margin: 24px 0; padding: 18px; background: #f8fafc; border-left: 4px solid #3b8cff; border-radius: 8px;">
              <div style="font-size: 12px; font-weight: bold; color: #3b8cff; text-transform: uppercase;">Fast Response Guarantee:</div>
              <div style="font-size: 13px; color: #334155; margin-top: 4px;">Your dedicated Relationship Officer will call you within one hour from now.</div>
            </div>

            <p style="margin-top: 24px;">Warm Regards,<br><strong>Customer Delight Team</strong><br>UrbanGaon</p>
          </div>
          <div style="background: #f1f5f9; padding: 20px; text-align: center; font-size: 11px; color: #64748b; border-top: 1px solid #e2e8f0;">
            <div style="font-weight: bold; color: #0f172a; margin-bottom: 4px;">Get in touch</div>
            <div>Email: <a href="mailto:dasaakash84@gmail.com" style="color: #3b8cff; text-decoration: none;">dasaakash84@gmail.com</a></div>
            <div>Contact: +91-9251836284 | 0141-6763064 | Website: <a href="https://www.urbangaon.com" style="color: #3b8cff;">www.urbangaon.com</a></div>
            <div style="margin-top: 8px; font-size: 10px; color: #94a3b8;">UrbanGaon, 2nd Floor, 74A, Sawai Pratap Singh Road, Near CM House, Opp. Loharu House, Gaurav Nagar, Civil lines, Jaipur, PIN: 302006, Rajasthan, India.</div>
          </div>
        </div>
      `,
    };
  }

  // 3. Friend / Family / Vendor Referral (Draft-3)
  if (source.includes("Referral from") || data.referralDetails) {
    const ref = data.referralDetails || "our valued partner";
    return {
      to: data.email,
      subject: `Welcome to UrbanGaon One – Referred by ${ref}`,
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; background: #ffffff; color: #1e293b;">
          <div style="background: #131633; padding: 24px; text-align: center; color: #ffffff;">
            <div style="font-size: 22px; font-weight: bold; letter-spacing: 0.5px;">✦ UrbanGaon</div>
            <div style="font-size: 11px; color: #94a3b8; letter-spacing: 2px; text-transform: uppercase; margin-top: 2px;">a perfect balance</div>
          </div>
          <div style="padding: 32px 28px; line-height: 1.6; font-size: 14px;">
            <p style="font-weight: 600; font-size: 15px;">Dear ${fullName},</p>
            <p>Thank you for choosing <strong>UrbanGaon One</strong> through the referral from our valued partner <strong>${ref}</strong>. We're excited to welcome you to our family and support your property search.</p>
            <p>To make your experience even better, join our Referral Program today: refer friends or colleagues and enjoy exclusive rewards like priority site visits and premium booking benefits.</p>
            <p>We're here to help – reply to this email or connect with us directly.</p>
            <p style="font-weight: 600; color: #3b8cff;">Let's grow together!</p>
            
            <p style="margin-top: 24px;">Best regards,<br><strong>Customer Delight Team</strong><br>UrbanGaon</p>
          </div>
          <div style="background: #f1f5f9; padding: 20px; text-align: center; font-size: 11px; color: #64748b; border-top: 1px solid #e2e8f0;">
            <div style="font-weight: bold; color: #0f172a; margin-bottom: 4px;">Get in touch</div>
            <div>Email: <a href="mailto:dasaakash84@gmail.com" style="color: #3b8cff; text-decoration: none;">dasaakash84@gmail.com</a></div>
            <div>Contact: +91-9251836284 | 0141-6763064 | Website: <a href="https://www.urbangaon.com" style="color: #3b8cff;">www.urbangaon.com</a></div>
            <div style="margin-top: 8px; font-size: 10px; color: #94a3b8;">UrbanGaon, 2nd Floor, 74A, Sawai Pratap Singh Road, Near CM House, Opp. Loharu House, Gaurav Nagar, Civil lines, Jaipur, PIN: 302006, Rajasthan, India.</div>
          </div>
        </div>
      `,
    };
  }

  // 4. Default Direct Customer Welcome (Draft-1)
  return {
    to: data.email,
    subject: `Welcome to UrbanGaon Family, ${fullName}`,
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; background: #ffffff; color: #1e293b;">
        <div style="background: #131633; padding: 24px; text-align: center; color: #ffffff;">
          <div style="font-size: 22px; font-weight: bold; letter-spacing: 0.5px;">✦ UrbanGaon</div>
          <div style="font-size: 11px; color: #94a3b8; letter-spacing: 2px; text-transform: uppercase; margin-top: 2px;">a perfect balance</div>
        </div>
        <div style="padding: 32px 28px; line-height: 1.6; font-size: 14px;">
          <p style="font-weight: 600; font-size: 15px;">Hi ${data.firstName},</p>
          <p>Thank you for your interest in <strong>UrbanGaon One, Jagatpura, Jaipur</strong>! Your dedicated Relationship officer shall call you within one hour from now.</p>
          <p>Just in case you don't receive a call, please connect with us directly on:</p>
          
          <div style="margin: 20px 0; padding: 16px; background: #f0f6ff; border-radius: 12px; border: 1px solid #bfdbfe;">
            <div style="margin-bottom: 6px;"><strong>Email:</strong> <a href="mailto:dasaakash84@gmail.com" style="color: #2563eb; text-decoration: none;">dasaakash84@gmail.com</a></div>
            <div style="margin-bottom: 6px;"><strong>Contact number:</strong> +91-9251836284</div>
            <div><strong>Website:</strong> <a href="https://www.urbangaon.com" style="color: #2563eb; text-decoration: none;">www.urbangaon.com</a></div>
          </div>

          <div style="margin: 20px 0; padding: 14px; background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 8px; text-align: center; font-style: italic; color: #475569; font-size: 13px;">
            &ldquo;Thanks for your interest in UrbanGaon One, Jagatpura, Jaipur! We'll get back to you in One hour with the topnotch options that match your search criteria.&rdquo;
            <div style="font-weight: bold; margin-top: 4px; font-style: normal; color: #0f172a;">- UrbanGaon</div>
          </div>

          <p style="margin-top: 24px;">Warm regards,<br><strong>Customer Delight Team</strong><br>UrbanGaon</p>
        </div>
        <div style="background: #f1f5f9; padding: 16px; text-align: center; font-size: 10px; color: #94a3b8; border-top: 1px solid #e2e8f0;">
          UrbanGaon, 2nd Floor, 74A, Sawai Pratap Singh Road, Near CM House, Opp. Loharu House, Gaurav Nagar, Civil lines, Jaipur, PIN: 302006, Rajasthan, India.
        </div>
      </div>
    `,
  };
}

export function generateInternalCompanyNotificationEmail(data: LeadEnquiryEmailPayload) {
  const fullName = `${data.salutation} ${data.firstName} ${data.middleName ? data.middleName + " " : ""}${data.lastName}`.trim();

  return {
    to: "dasaakash84@gmail.com",
    subject: `🚨 New Lead Captured: ${fullName} (${data.housingStyle || "Housing"}) - ${data.projectName || "UrbanGaon"}`,
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 650px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; background: #ffffff; color: #1e293b;">
        <div style="background: #2563eb; padding: 20px; color: #ffffff;">
          <div style="font-size: 18px; font-weight: bold;">🚨 New Customer Enquiry Registered</div>
          <div style="font-size: 12px; color: #dbeafe;">Captured via UrbanGaon Customer Enquiry Form</div>
        </div>
        
        <div style="padding: 24px; line-height: 1.5; font-size: 13px;">
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <tr style="background: #f8fafc; border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 8px 12px; font-weight: bold; width: 35%;">Customer Name:</td>
              <td style="padding: 8px 12px; color: #0f172a; font-weight: 600;">${fullName}</td>
            </tr>
            <tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 8px 12px; font-weight: bold;">Mobile:</td>
              <td style="padding: 8px 12px; color: #2563eb; font-weight: bold;">+91 ${data.mobile}</td>
            </tr>
            <tr style="background: #f8fafc; border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 8px 12px; font-weight: bold;">Email:</td>
              <td style="padding: 8px 12px;">${data.email || "N/A"}</td>
            </tr>
            <tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 8px 12px; font-weight: bold;">Address:</td>
              <td style="padding: 8px 12px;">${data.address || "N/A"}, ${data.city || ""}, ${data.state || ""} ${data.pinCode ? "- " + data.pinCode : ""}</td>
            </tr>
            <tr style="background: #f8fafc; border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 8px 12px; font-weight: bold;">Desired Housing Style:</td>
              <td style="padding: 8px 12px; font-weight: 600; color: #0f172a;">${data.housingStyle || "N/A"}</td>
            </tr>
            <tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 8px 12px; font-weight: bold;">Purpose & Living Status:</td>
              <td style="padding: 8px 12px;">${data.purposeOfPurchase || "N/A"} | Current: ${data.livingStatus || "N/A"}</td>
            </tr>
            <tr style="background: #f8fafc; border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 8px 12px; font-weight: bold;">Budget Range:</td>
              <td style="padding: 8px 12px; color: #059669; font-weight: bold;">${data.budgetRange || "N/A"}</td>
            </tr>
            <tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 8px 12px; font-weight: bold;">Purchase Timeline:</td>
              <td style="padding: 8px 12px; font-weight: 600; color: ${data.purchaseTimeline === "With in 1 Month" ? "#dc2626" : "#475569"};">${data.purchaseTimeline || "N/A"}</td>
            </tr>
            <tr style="background: #f8fafc; border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 8px 12px; font-weight: bold;">Customer Profile:</td>
              <td style="padding: 8px 12px;">${data.customerProfile || "N/A"} (${data.designation || ""} @ ${data.companyName || ""})</td>
            </tr>
            <tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 8px 12px; font-weight: bold;">Annual Income:</td>
              <td style="padding: 8px 12px;">${data.annualIncome || "N/A"}</td>
            </tr>
            <tr style="background: #f8fafc; border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 8px 12px; font-weight: bold;">Enquiry Source:</td>
              <td style="padding: 8px 12px; font-weight: 600; color: #3b8cff;">${data.sourceOption} ${data.channelPartnerName ? "(" + data.channelPartnerName + ")" : ""} ${data.empId ? "(Emp ID: " + data.empId + ")" : ""}</td>
            </tr>
            <tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 8px 12px; font-weight: bold;">Project & Assigned Agent:</td>
              <td style="padding: 8px 12px;">${data.projectName || "UrbanGaon One"} | ${data.assignedAgentName || "Auto-Assigned"}</td>
            </tr>
          </table>

          <div style="background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 8px; padding: 12px; color: #065f46; font-size: 12px;">
            ✓ Automated Customer Welcome Email (Draft template) has been dispatched to <strong>${data.email || data.mobile}</strong>.
          </div>
        </div>

        <div style="background: #f8fafc; padding: 12px 24px; text-align: right; border-top: 1px solid #e2e8f0; font-size: 11px; color: #64748b;">
          UrbanGaon Real Estate CRM · Lead Registry Engine
        </div>
      </div>
    `,
  };
}

/**
 * Creates Nodemailer Transporter based on configured Environment Variables
 */
function createSmtpTransporter() {
  const host = process.env.SMTP_HOST || "smtp.gmail.com";
  const port = parseInt(process.env.SMTP_PORT || "465", 10);
  const user = process.env.SMTP_USER || process.env.GMAIL_USER || "dasaakash84@gmail.com";
  const pass = process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD || "";

  if (!pass) {
    console.log("[SMTP CONFIG] SMTP_PASS not set. Emails will be logged to server console.");
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

/**
 * Real-time Email Dispatch Function
 */
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
        // 1. Send Customer Welcome Email
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

        // 2. Send Company Notification Email
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
    } else {
      console.log("ℹ️ Real-time dispatch logged (Configure SMTP_PASS in .env for direct inbox delivery).");
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

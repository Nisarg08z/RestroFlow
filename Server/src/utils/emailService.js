import nodemailer from "nodemailer";

const createTransporter = () => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    connectionTimeout: 60000,
    greetingTimeout: 30000,
    socketTimeout: 60000,
    pool: true,
    maxConnections: 1,
    maxMessages: 3,
    rateDelta: 1000,
    rateLimit: 5,
    tls: {
      rejectUnauthorized: false,
      ciphers: 'SSLv3'
    },
    debug: process.env.NODE_ENV === 'development',
    logger: process.env.NODE_ENV === 'development'
  });

  transporter.verify((error, success) => {
    if (error) {
      console.error('SMTP connection verification failed:', error);
    } else {
      console.log('SMTP server is ready to send emails');
    }
  });

  return transporter;
};

const sendEmailWithRetry = async (transporter, mailOptions, maxRetries = 3) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Attempting to send email (attempt ${attempt}/${maxRetries})...`);
      const info = await transporter.sendMail(mailOptions);
      console.log("Email sent successfully:", info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error(`Email send attempt ${attempt} failed:`, error.message);
      
      if (attempt === maxRetries) {
        throw error;
      }
      
      const waitTime = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
      console.log(`Retrying in ${waitTime}ms...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
};

const sendGenericEmail = async (email, subject, html, text) => {
  let transporter;
  
  try {
    if (process.env.RESEND_API_KEY) {
      try {
        console.log("Using Resend API for email delivery (better for cloud platforms)");
        const { sendSignupEmail: sendViaResend } = await import("./emailServiceResend.js");
        return await sendViaResend(email, restaurantName, signupLink);
      } catch (importError) {
        console.error("Failed to import Resend service, falling back to SMTP:", importError);
      }
    }

    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      throw new Error("SMTP_USER and SMTP_PASS environment variables are required. Alternatively, set RESEND_API_KEY to use Resend API.");
    }

    transporter = createTransporter();

    const mailOptions = {
      from: `"RestroFlow" <${process.env.SMTP_USER}>`,
      to: email,
      subject,
      html,
      text,
    };

    return await sendEmailWithRetry(transporter, mailOptions, 3);
  } catch (error) {
    console.error("Error sending email via SMTP:", error);
    console.error("Error details:", {
      code: error.code,
      command: error.command,
      response: error.response,
      responseCode: error.responseCode,
    });
    
    if (transporter) {
      transporter.close();
    }

    if (process.env.RESEND_API_KEY) {
      console.log("SMTP failed, attempting to use Resend API as fallback...");
      try {
        const { sendGenericEmail: sendViaResendGeneric } = await import("./emailServiceResend.js");
        return await sendViaResendGeneric(email, subject, html, text);
      } catch (resendError) {
        console.error("Resend fallback also failed:", resendError);
        throw new Error(`Failed to send email via SMTP and Resend: ${error.message}`);
      }
    }
    
    if (error.code === 'ETIMEDOUT' || error.code === 'ECONNREFUSED') {
      throw new Error(
        `Failed to send email: ${error.message}. ` +
        `This is likely because Render's free tier blocks SMTP connections. ` +
        `Solution: Use Resend API by setting RESEND_API_KEY environment variable. ` +
        `Sign up at https://resend.com (free tier available).`
      );
    }
    
    throw new Error(`Failed to send email: ${error.message}`);
  }
};

export const sendSignupEmail = async (email, restaurantName, signupLink) => {
  const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>RestroFlow Signup</title>
        <style>
          body {
            margin: 0;
            padding: 0;
            background-color: #0f1115;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
            color: #e5e7eb;
          }
      
          .wrapper {
            width: 100%;
            padding: 32px 12px;
          }
      
          .card {
            max-width: 600px;
            margin: auto;
            background: #161a20;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 12px 30px rgba(0, 0, 0, 0.6);
          }
      
          .header {
            background: linear-gradient(135deg, #ff6b35, #f7931e);
            padding: 36px;
            text-align: center;
          }
      
          .header h1 {
            margin: 0;
            font-size: 28px;
            color: #ffffff;
            letter-spacing: 0.6px;
          }
      
          .content {
            padding: 36px;
          }
      
          .content h2 {
            margin-top: 0;
            font-size: 22px;
            color: #ffffff;
          }
      
          .content p {
            font-size: 15px;
            line-height: 1.7;
            margin: 16px 0;
            color: #cbd5e1;
          }
      
          .cta-wrapper {
            text-align: center;
            margin: 36px 0;
          }
      
          .cta-button {
            display: inline-block;
            padding: 15px 40px;
            background: linear-gradient(135deg, #ff6b35, #f7931e);
            color: #ffffff !important;
            text-decoration: none;
            font-size: 16px;
            font-weight: 600;
            border-radius: 10px;
            box-shadow: 0 8px 20px rgba(255, 107, 53, 0.45);
          }
      
          .cta-button:hover {
            opacity: 0.95;
          }
      
          .info-box {
            background: #1e2430;
            border-left: 4px solid #ff6b35;
            padding: 16px;
            margin-top: 24px;
            font-size: 14px;
            color: #cbd5e1;
            border-radius: 8px;
          }
      
          .link-box {
            margin-top: 20px;
            font-size: 13px;
            color: #9ca3af;
            word-break: break-all;
          }
      
          .link-box a {
            color: #f7931e;
            text-decoration: none;
          }
      
          .footer {
            text-align: center;
            padding: 22px;
            font-size: 12px;
            color: #9ca3af;
            background: #12161c;
          }
      
          .footer strong {
            color: #e5e7eb;
          }
        </style>
      </head>
      
      <body>
        <div class="wrapper">
          <div class="card">
      
            <div class="header">
              <h1>RestroFlow</h1>
            </div>
      
            <div class="content">
              <h2>Hello ${restaurantName} 👋</h2>
      
              <p>
                Your restaurant onboarding request has been
                <strong style="color:#ffffff;">approved</strong> by our admin team.
              </p>
      
              <p>
                Complete your signup to access your dashboard, manage menus,
                generate QR codes, and start receiving orders instantly.
              </p>
      
              <div class="cta-wrapper">
                <a href="${signupLink}" class="cta-button">
                  Complete Your Signup
                </a>
              </div>
      
              <div class="info-box">
                ⏰ This signup link is valid for <strong>48 hours</strong>.
                Please complete your registration before it expires.
              </div>
      
              <div class="link-box">
                If the button doesn’t work, copy and paste this link:
                <br />
                <a href="${signupLink}">${signupLink}</a>
              </div>
      
              <p style="margin-top: 30px;">
                If you didn’t request this email, you can safely ignore it.
              </p>
      
              <p>
                Best regards,<br />
                <strong>The RestroFlow Team</strong>
              </p>
            </div>
      
            <div class="footer">
              © ${new Date().getFullYear()} <strong>RestroFlow</strong> · Smart Restaurant Management
            </div>
      
          </div>
        </div>
      </body>
      </html>
      `;

  const text = `
        Hi ${restaurantName},
        
        Great news! Your restaurant request has been approved by our admin team.
        
        You're just one step away from getting started with RestroFlow. Click the link below to complete your registration:
        
        ${signupLink}
        
        This link is valid for 48 hours.
        
        If you didn't request this, please ignore this email.
        
        Best regards,
        The RestroFlow Team
      `;

  return sendGenericEmail(
    email,
    "Complete Your RestroFlow Registration",
    html,
    text
  );
};

export const sendRequestReplyEmail = async (email, restaurantName, message) => {
  const subject = `Reply from RestroFlow about your request`;

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>RestroFlow Reply</title>
    </head>
    <body style="background-color:#0f1115;color:#e5e7eb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;padding:24px;">
      <div style="max-width:600px;margin:0 auto;background-color:#161a20;border-radius:16px;padding:24px;">
        <h2 style="margin-top:0;margin-bottom:16px;color:#ffffff;">Hello ${restaurantName || "there"},</h2>
        <p style="white-space:pre-line;line-height:1.6;color:#cbd5e1;">${message}</p>
        <p style="margin-top:24px;color:#cbd5e1;">
          Best regards,<br />
          <strong style="color:#f7931e;">The RestroFlow Team</strong>
        </p>
      </div>
    </body>
    </html>
  `;

  const text = `
Hello ${restaurantName || "there"},

${message}

Best regards,
The RestroFlow Team
  `;

  return sendGenericEmail(email, subject, html, text);
};


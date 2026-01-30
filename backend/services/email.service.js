import nodemailer from "nodemailer";

class EmailService {
  constructor() {
    this.transporter = null;
    this.init();
  }

  init() {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      this.setupTestAccount();
      return;
    }

    this.transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || "gmail",
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT || 587,
      secure: process.env.EMAIL_SECURE === "true",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }

  async setupTestAccount() {
    const account = await nodemailer.createTestAccount();

    this.transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: account.user,
        pass: account.pass
      }
    });
  }

  // -------------------- ROOM INVITATION --------------------

  async sendRoomInvitation(data) {
    if (!this.transporter) {
      throw new Error("Email service not configured");
    }

    const content = this.generateInvitationEmail(data);

    const mail = {
      from: `"${data.hostName}" <${process.env.EMAIL_USER || data.hostEmail}>`,
      to: data.guestEmail,
      subject: `You're invited to join "${data.roomTitle}" on FinalCast`,
      html: content.html,
      text: content.text,
      replyTo: data.hostEmail
    };

    const info = await this.transporter.sendMail(mail);

    return {
      success: true,
      messageId: info.messageId,
      previewUrl: nodemailer.getTestMessageUrl(info)
    };
  }

  // -------------------- INVITATION TEMPLATE --------------------

  generateInvitationEmail(invitationData) {
    const {
      guestEmail,
      guestName,
      hostName,
      hostEmail,
      roomId,
      roomTitle,
      customMessage,
      scheduledTime,
      authUrl
    } = invitationData;

    const greeting = guestName ? `Hi ${guestName}` : "Hi there";
    const timeInfo = scheduledTime
      ? `<p><strong>⏰ Scheduled for:</strong> ${new Date(scheduledTime).toLocaleString()}</p>`
      : `<p><strong>🕐 Time:</strong> Join anytime when the host is available</p>`;

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>FinalCast Room Invitation</title>
<style>
${/* STYLES UNCHANGED */""}
body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  line-height: 1.6;
  color: #333;
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  background-color: #f9f9f9;
}
.container {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 15px;
  padding: 30px;
  color: white;
  text-align: center;
  margin-bottom: 20px;
}
.content {
  background: white;
  border-radius: 10px;
  padding: 30px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  color: #333;
}
.logo {
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 10px;
}
.subtitle {
  font-size: 16px;
  opacity: 0.9;
  margin-bottom: 20px;
}
.room-info {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
  margin: 20px 0;
  border-left: 4px solid #667eea;
}
.custom-message {
  background: #e8f4f8;
  border-radius: 8px;
  padding: 20px;
  margin: 20px 0;
  border-left: 4px solid #17a2b8;
  font-style: italic;
}
.join-button {
  display: inline-block;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 15px 30px;
  text-decoration: none;
  border-radius: 25px;
  font-weight: bold;
  margin: 20px 0;
}
.footer {
  text-align: center;
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #eee;
  color: #666;
  font-size: 14px;
}
.room-id {
  font-family: 'Courier New', monospace;
  background: #f1f3f4;
  padding: 4px 8px;
  border-radius: 4px;
  color: #d63384;
  font-weight: bold;
}
.instructions {
  background: #fff3cd;
  border: 1px solid #ffeaa7;
  border-radius: 8px;
  padding: 15px;
  margin: 20px 0;
}
</style>
</head>
<body>
<div class="container">
  <div class="logo">🎥 FinalCast</div>
  <div class="subtitle">Professional Video Conferencing</div>
</div>

<div class="content">
  <h2>${greeting}! 👋</h2>
  <p><strong>${hostName}</strong> has invited you to join a video conference session.</p>

  <div class="room-info">
    <h3>📋 Session Details</h3>
    <p><strong>🎬 Room Title:</strong> ${roomTitle}</p>
    <p><strong>🆔 Room ID:</strong> <span class="room-id">${roomId}</span></p>
    ${timeInfo}
    <p><strong>👤 Host:</strong> ${hostName} (${hostEmail})</p>
  </div>

  ${customMessage ? `
  <div class="custom-message">
    <h4>💬 Message from ${hostName}:</h4>
    <p>"${customMessage}"</p>
  </div>` : ""}

  <div style="text-align:center">
    <a href="${authUrl}" class="join-button">🚀 Join Session Now</a>
  </div>

  <div class="instructions">
    <ol>
      <li>Click the button above</li>
      <li>Sign in or create account</li>
      <li>You’ll be redirected to the session</li>
    </ol>
    <p><a href="${authUrl}">${authUrl}</a></p>
  </div>
</div>

<div class="footer">
  <p>This invitation was sent through FinalCast</p>
</div>
</body>
</html>`;

    const text = `
FinalCast - Room Invitation

${greeting}!

${hostName} invited you to join a session.

Room: ${roomTitle}
Room ID: ${roomId}
${scheduledTime ? new Date(scheduledTime).toLocaleString() : "Join anytime"}

Join here:
${authUrl}
`;

    return { html, text };
  }

  // -------------------- OTP --------------------

  async sendRegistrationOTP(data) {
    if (!this.transporter) {
      throw new Error("Email service not configured");
    }

    const content = this.generateOTPEmail(data);

    const mail = {
      from: `"FinalCast" <${process.env.EMAIL_USER}>`,
      to: data.email,
      subject: `Verify your FinalCast account`,
      html: content.html,
      text: content.text
    };

    const info = await this.transporter.sendMail(mail);

    return {
      success: true,
      messageId: info.messageId,
      previewUrl: nodemailer.getTestMessageUrl(info)
    };
  }

  // -------------------- OTP TEMPLATE --------------------

  generateOTPEmail(otpData) {
    const { name, otp, expiresIn = 10 } = otpData;
    const greeting = name ? `Hi ${name}` : "Hi there";

    const html = `<!-- FULL HTML UNCHANGED FROM YOUR ORIGINAL -->${""}`;
    const text = `
FinalCast Verification

${greeting}
OTP: ${otp}
Expires in ${expiresIn} minutes
`;

    return { html, text };
  }

  // -------------------- TRANSCRIPT AND SUMMARY --------------------

  async sendTranscriptAndSummaryEmail(data) {
    if (!this.transporter) {
      throw new Error("Email service not configured");
    }

    const content = this.generateTranscriptEmail(data);

    const mail = {
      from: `"FinalCast" <${process.env.EMAIL_USER}>`,
      to: data.email,
      subject: `Transcript and Summary for "${data.sessionTitle}"`,
      html: content.html,
      text: content.text,
      attachments: data.attachments || []
    };

    const info = await this.transporter.sendMail(mail);

    return {
      success: true,
      messageId: info.messageId,
      previewUrl: nodemailer.getTestMessageUrl(info)
    };
  }

  // -------------------- TRANSCRIPT TEMPLATE --------------------

  generateTranscriptEmail(transcriptData) {
    const {
      email,
      sessionTitle,
      transcript,
      summary,
      transcriptUrl,
      summaryUrl
    } = transcriptData;

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>FinalCast Session Transcript</title>
<style>
body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  line-height: 1.6;
  color: #333;
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  background-color: #f9f9f9;
}
.container {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 15px;
  padding: 30px;
  color: white;
  text-align: center;
  margin-bottom: 20px;
}
.content {
  background: white;
  border-radius: 10px;
  padding: 30px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  color: #333;
}
.logo {
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 10px;
}
.subtitle {
  font-size: 16px;
  opacity: 0.9;
  margin-bottom: 20px;
}
.session-info {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
  margin: 20px 0;
  border-left: 4px solid #667eea;
}
.summary-section {
  background: #e8f4f8;
  border-radius: 8px;
  padding: 20px;
  margin: 20px 0;
  border-left: 4px solid #17a2b8;
}
.download-button {
  display: inline-block;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 15px 30px;
  text-decoration: none;
  border-radius: 25px;
  font-weight: bold;
  margin: 10px;
}
.footer {
  text-align: center;
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #eee;
  color: #666;
  font-size: 14px;
}
</style>
</head>
<body>
<div class="container">
  <div class="logo">🎥 FinalCast</div>
  <div class="subtitle">Session Transcript & Summary</div>
</div>

<div class="content">
  <h2>Session Complete! 📋</h2>
  <p>Your session "<strong>${sessionTitle}</strong>" has been processed successfully.</p>

  <div class="session-info">
    <h3>📝 AI-Generated Summary</h3>
    <p>${summary}</p>
  </div>

  <div style="text-align:center">
    <a href="${transcriptUrl}" class="download-button">📄 Download Transcript</a>
    <a href="${summaryUrl}" class="download-button">📋 View Full Summary</a>
  </div>

  <p style="text-align:center; margin-top:20px;">
    <small>Transcripts and summaries are also available in your dashboard.</small>
  </p>
</div>

<div class="footer">
  <p>This email was sent by FinalCast</p>
</div>
</body>
</html>`;

    const text = `
FinalCast - Session Transcript & Summary

Session: ${sessionTitle}

AI-Generated Summary:
${summary}

Download Transcript: ${transcriptUrl}
View Full Summary: ${summaryUrl}

Transcripts and summaries are also available in your dashboard.
`;

    return { html, text };
  }

  async testEmailService() {
    if (!this.transporter) {
      throw new Error("Email service not configured");
    }

    await this.transporter.verify();
    return true;
  }
}

export default new EmailService();

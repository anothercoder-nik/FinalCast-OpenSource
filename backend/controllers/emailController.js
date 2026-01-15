import EmailService from "../services/email.service.js";
import wrapAsync from "../utils/trycatchwrapper.js";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// -------------------- SINGLE INVITE --------------------

export const sendRoomInvitation = wrapAsync(async (req, res) => {
  const {
    guestEmail,
    guestName,
    roomId,
    roomTitle,
    customMessage,
    scheduledTime
  } = req.body;

  if (!guestEmail || !roomId || !roomTitle) {
    return res.status(400).json({
      success: false,
      message: "Missing required fields"
    });
  }

  if (!emailRegex.test(guestEmail)) {
    return res.status(400).json({
      success: false,
      message: "Invalid email"
    });
  }

  const hostName =
    req.user?.name || req.user?.displayName || "FinalCast Host";
  const hostEmail =
    req.user?.email ||
    process.env.DEFAULT_HOST_EMAIL ||
    "host@finalcast.com";

  const baseUrl =
    process.env.FRONTEND_URL || "http://localhost:5173";
  const authUrl = `${baseUrl}/auth?redirect=${encodeURIComponent(
    `/studio/${roomId}`
  )}`;

  const data = {
    guestEmail,
    guestName,
    hostName,
    hostEmail,
    roomId,
    roomTitle,
    customMessage,
    scheduledTime,
    authUrl
  };

  const result = await EmailService.sendRoomInvitation(data);

  res.json({
    success: true,
    message: "Invitation sent",
    messageId: result.messageId,
    previewUrl: result.previewUrl
  });
});

// -------------------- BULK INVITES --------------------

export const sendBulkInvitations = wrapAsync(async (req, res) => {
  const {
    guests,
    roomId,
    roomTitle,
    customMessage,
    scheduledTime
  } = req.body;

  if (!Array.isArray(guests) || guests.length === 0) {
    return res.status(400).json({
      success: false,
      message: "Guests list required"
    });
  }

  if (!roomId || !roomTitle) {
    return res.status(400).json({
      success: false,
      message: "Room details missing"
    });
  }

  const invalidEmails = guests
    .filter(g => !emailRegex.test(g.email))
    .map(g => g.email);

  if (invalidEmails.length) {
    return res.status(400).json({
      success: false,
      message: "Invalid guest emails",
      invalidEmails
    });
  }

  const hostName =
    req.user?.name || req.user?.displayName || "FinalCast Host";
  const hostEmail =
    req.user?.email ||
    process.env.DEFAULT_HOST_EMAIL ||
    "host@finalcast.com";

  const baseUrl =
    process.env.FRONTEND_URL || "http://localhost:5173";
  const authUrl = `${baseUrl}/auth?redirect=${encodeURIComponent(
    `/studio/${roomId}`
  )}`;

  const results = [];
  const errors = [];

  for (const guest of guests) {
    try {
      const result = await EmailService.sendRoomInvitation({
        guestEmail: guest.email,
        guestName: guest.name,
        hostName,
        hostEmail,
        roomId,
        roomTitle,
        customMessage,
        scheduledTime,
        authUrl
      });

      results.push({
        email: guest.email,
        success: true,
        messageId: result.messageId
      });

      await new Promise(r => setTimeout(r, 100));
    } catch (err) {
      errors.push({
        email: guest.email,
        error: err.message
      });
    }
  }

  res.json({
    success: errors.length === 0,
    results,
    errors,
    summary: {
      total: guests.length,
      successful: results.length,
      failed: errors.length
    }
  });
});

// -------------------- TEST --------------------

export const testEmailService = wrapAsync(async (req, res) => {
  await EmailService.testEmailService();

  res.json({
    success: true,
    message: "Email service working"
  });
});

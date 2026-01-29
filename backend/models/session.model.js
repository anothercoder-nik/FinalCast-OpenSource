import mongoose from "mongoose";
import crypto from "crypto";

const sessionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  host: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  participants: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      joinedAt: { type: Date, default: Date.now },
      leftAt: { type: Date },
      role: { type: String, enum: ['participant', 'moderator'], default: 'participant' },
      isActive: { type: Boolean, default: true }
    }
  ],
  scheduledAt: { type: Date },
  startedAt: { type: Date },
  endedAt: { type: Date },
  duration: { type: Number }, // in minutes
  maxParticipants: { type: Number, default: 3
   }, // Changed from 50 to 3 for podcasting
  settings: {
    requireApproval: { type: Boolean, default: true }, // Changed to true for invitation-only
    muteOnJoin: { type: Boolean, default: true }, // Changed to true for podcasting etiquette
    videoOnJoin: { type: Boolean, default: true }
  },
  roomId: { type: String, unique: true, sparse: true },
  status: {
    type: String,
    enum: ['scheduled', 'live', 'ended', 'cancelled'],
    default: 'scheduled'
  },
  youtubeStreamId: { type: String }
}, {timestamps: true});

// Generate unique room ID before saving
sessionSchema.pre('save', function(next) {
  if (!this.roomId) {
    this.roomId = crypto.randomBytes(6).toString('hex');
  }
  next();
});;

// Index for better query performance
sessionSchema.index({ host: 1, status: 1 });
sessionSchema.index({ roomId: 1 });
sessionSchema.index({ scheduledAt: 1 });

const Session = mongoose.model("Session", sessionSchema);

export default Session;


// Automatically adds createdAt, updatedAt



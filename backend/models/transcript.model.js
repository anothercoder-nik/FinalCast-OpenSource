import mongoose from "mongoose";

const transcriptSchema = new mongoose.Schema({
  sessionId: { type: mongoose.Schema.Types.ObjectId, ref: "Session", required: true },
  transcript: [{
    word: { type: String, required: true },
    start: { type: Number, required: true }, // start time in seconds
    end: { type: Number, required: true }    // end time in seconds
  }],
  summary: { type: String },
  generatedAt: { type: Date, default: Date.now },
  status: { type: String, enum: ['processing', 'completed', 'failed'], default: 'processing' }
}, { timestamps: true });

// Index for better query performance
transcriptSchema.index({ sessionId: 1 });

const Transcript = mongoose.model("Transcript", transcriptSchema);

export default Transcript;

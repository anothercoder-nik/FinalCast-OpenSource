import mongoose from "mongoose";


   //Main Recording Schema


const recordingSchema = new mongoose.Schema(
  {
    recordingId: {
      type: String,
      required: true,
      unique: true
    },

    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Session",
      required: true
    },

    hostId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    title: {
      type: String,
      default: "Session Recording"
    },

    status: {
      type: String,
      enum: ["recording", "processing", "completed", "failed"],
      default: "recording"
    },

    startTime: {
      type: Date,
      required: true
    },

    endTime: Date,

    duration: Number,

    participants: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User"
        },
        userName: String,
        isHost: {
          type: Boolean,
          default: false
        },
        joinedAt: {
          type: Date,
          default: Date.now
        }
      }
    ],

    files: [
      {
        participantId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User"
        },
        participantName: String,
        filename: String,
        fileSize: Number,
        duration: Number,
        mimeType: String,
        url: String,
        uploadedAt: {
          type: Date,
          default: Date.now
        }
      }
    ],

    isDeleted: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

 //Simple Indexes


recordingSchema.index({ recordingId: 1 });
recordingSchema.index({ sessionId: 1 });
recordingSchema.index({ hostId: 1 });

const Recording = mongoose.model("Recording", recordingSchema);

//Chunk Schema


const recordingChunkSchema = new mongoose.Schema(
  {
    sessionId: {
      type: String,
      required: true
    },

    participantId: {
      type: String,
      required: true
    },

    role: {
      type: String,
      enum: ["host", "participant"],
      required: true
    },

    chunkIndex: {
      type: Number,
      required: true
    },

    publicId: {
      type: String,
      required: true,
      unique: true
    },

    url: {
      type: String,
      required: true
    },

    size: Number,

    uploadedAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

const RecordingChunk = mongoose.model(
  "RecordingChunk",
  recordingChunkSchema
);


 //Final Recording Schema


const finalRecordingSchema = new mongoose.Schema(
  {
    sessionId: {
      type: String,
      required: true
    },

    participantId: {
      type: String,
      required: true
    },

    role: {
      type: String,
      enum: ["host", "participant"],
      required: true
    },

    publicId: {
      type: String,
      required: true,
      unique: true
    },

    url: {
      type: String,
      required: true
    },

    filename: {
      type: String,
      required: true
    },

    duration: Number,
    size: Number,

    uploadedAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

const FinalRecording = mongoose.model(
  "FinalRecording",
  finalRecordingSchema
);

export { RecordingChunk, FinalRecording };
export default Recording;

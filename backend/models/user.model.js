import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },

    email: {
      type: String,
      required: true,
      unique: true
    },

    // optional for Google users
    password: {
      type: String,
      select: false
    },

    avatar: {
      type: String,
      default:
        "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp"
    },

    googleId: {
      type: String,
      unique: true,
      sparse: true
    },

    twoFactorSecret: {
      type: String,
      select: false
    },

    twoFactorEnabled: {
      type: Boolean,
      default: false
    },

    backupCodes: [
      {
        code: String,
        used: {
          type: Boolean,
          default: false
        }
      }
    ]
  },
  { timestamps: true }
);

// compare password during login
userSchema.methods.comparePassword = async function (password) {
  if (!this.password) return false;
  return bcrypt.compare(password, this.password);
};

// hide sensitive fields
userSchema.set("toJSON", {
  transform: (doc, ret) => {
    delete ret.password;
    delete ret.__v;
    return ret;
  }
});

// hash password before save
userSchema.pre("save", async function (next) {
  if (this.password && this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

const User = mongoose.model("User", userSchema);
export default User;

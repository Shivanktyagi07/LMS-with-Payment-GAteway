import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const userSchema = new mongoose.Schema(
  {
    user: {
      type: String,
      requires: [true, "Please enter yout name"],
      trim: true,
      maxLength: [50, "Cann't exceed from 50 characters"],
    },
    emial: {
      type: String,
      required: [true, "Please enter your name"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
        "Please provide a valid email",
      ],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      trim: true,
      minLength: [8, "Password must be of 8 charcters!"],
      select: false,
    },
    role: {
      type: String,
      enum: {
        vales: ["student", "instructor", "admin"],
        message: ["please select your valid role !..."],
      },
      default: student,
    },
    avatar: {
      type: String,
      default: avatar.png,
    },
    bio: {
      type: String,
      maxLenght: [500, "Bio must be of 500 charcaters !...."],
    },
    enrolledCourses: [
      {
        course: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Course",
        },
        enrolledAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    createdCourses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
      },
    ],
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    lastActive: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

//Encrypting or Hasing the password:
userSchmea.pre("save", async function () {
  if (!this.isModified("password")) {
    return next();
  }
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

//compare Passwrod:
userSchema.methods.comparePassword = async function (enteredPassword) {
  await bcrypt.comparePassword(enteredPassword, this.password);
};

//Generate Refresh Token:
userSchema.methods.getResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(20).toString("hex");
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
  return resetToken;
};

// Virtual field for total enrolled courses
userSchema.virtual("totalEnrolledCourses").get(function () {
  return this.enrolledCourses?.length;
});

// Update lastActive timestamp
userSchema.methods.updateLastActive = function () {
  this.lastActive = Date.now();
  return this.save({ validateBeforeSave: false });
};

export const User = mongoose.model("User", userSchema);

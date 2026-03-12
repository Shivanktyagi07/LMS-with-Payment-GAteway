import mongoose from "mongoose";

const lectureSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Lecture title is required"],
      trim: true,
      maxLength: [100, "Lecture title cannot exceed 100 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxLength: [200, "Cannot exceeds from 200 characters!..."],
    },
    videoUrl: {
      tyep: String,
      required: [true, "Video url is required!..."],
    },
    duration: {
      type: Number,
      default: 0,
    },
    publicId: {
      type: String,
      required: [true, "Public ID is required!.."],
    },
    isPreview: {
      type: Boolean,
      default: 0,
    },
    order: {
      type: Number,
      required: [true, "Order of lectures is required!..."],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

//foramtting lecture duraion before saving:
lectureSchema.pre("save", function (next) {
  if (this.duration) {
    this.duration = Math.round(this.duration * 100) / 100;
  }
  next();
});

export const Lecture = mongoose.models("Lectures", lectureSchema);

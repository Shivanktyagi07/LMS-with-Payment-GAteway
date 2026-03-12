import mongoose from "mongoose";

const lectureProgressSchema = new mongoose.Schema({
  lecture: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Lecture",
    required: [true, "refrence of lecture is required!.."],
  },
  isCompleted: {
    type: Boolean,
    default: false,
  },
  watchTime: {
    type: Number,
    default: 0,
  },
  lastWatched: {
    type: Date,
    default: Date.now, //no need to do now()(execute it), we have to jsut pass the reference of it:
  },
});

const courseProgressSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Reference of object is required!.."],
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: [true, "Course reference is required!.."],
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
    CompletionPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    lectureProgress: [lectureProgressSchema],
    lastAccessed: {
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

//calculating how much course is complete:
courseProgressSchema.pre("save", function (next) {
  if (this.lectureProgress > 0) {
    const lectureCompleted = this.lectureProgress.filter(
      (lp) => lp.isCompleted,
    ).length;
    this.percentageComplition =
      Math.round(lectureCompleted / this.lectureProgress.length) * 100;
    this.isCompleted = this.percentageComplition === 100;
  }
  next();
});

//updating last accessed:
courseProgressSchema.methods.updatelastAccessed = function () {
  this.lastAccessed = Date.now();
  return this.save({ ValidateBeforeSave: false });
};

export const CourseProgress = mongoose.model(
  "CourseProgress",
  courseProgressSchema,
);

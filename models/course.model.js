import mongoose from "mongoose";

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: string,
      required: [true, "please enter your course title"],
      trim: true,
      maxlength: [50, "Cann't exceed from 50 characters!..."],
    },
    subtitle: {
      type: string,
      trim: true,
      malength: [20, "Subtitle cann't be more than 20 characters!.."],
    },
    description: {
      type: string,
      trim: true,
    },
    category: {
      type: string,
      trim: true,
      required: [20, "Category is required"],
    },
    level: {
      typr: string,
      enum: {
        values: ["Beginner", "Intermediate", "Advanced"],
        message: "Please select a valid role!...",
      },
      default: "Beginner",
    },
    price: {
      type: Number,
      required: [true, "Course price is required!..."],
      min: [0, "Price can not be non-negative"],
    },
    thumbnail: {
      type: string,
      required: [true, "Course thumbnail is required!..."],
    },
    enrolledStudents: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    lectures: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Lecture",
      },
    ],
    insrutor: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "Course instructor is requires!..."],
      },
    ],
    isPUblished: {
      type: boolean,
      default: false,
    },
    totalDuration: {
      type: Number,
      default: 0,
    },
    totalLectures: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Virtual field for average rating:
courseSchema.virtual("averageRating").get(function () {
  return 0; // Placeholder until review system is implemented
});

//Updaet total Lectures:
courseSchema.pre("save", function (next) {
  if (this.lectures) {
    this.totalLectures = this.lectures.length;
  }
  next();
});

export const Course = mongoose.model("Course", courseSchema);

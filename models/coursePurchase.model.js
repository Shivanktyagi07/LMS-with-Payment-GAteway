import mongoose from "mongoose";

const coursePurchaseSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: [true, "Course reference is required!.."],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User reference is required!..."],
    },
    amount: {
      type: Number,
      required: [true, "Amount is required!..."],
      min: [0, "Amount cann't be less than 0 or non-negative!.."],
    },
    currency: {
      type: String,
      required: [true, "Currency is required!..."],
      uppercase: true,
      default: INR,
    },
    status: {
      type: String,
      enum: {
        values: ["pending", "refund", "failed", "completed"],
        message: ["Select a valid role!.."],
      },
      default: "pending",
    },
    payementMethod: {
      type: String,
      required: [true, "Payment method id required!..."],
    },
    payementId: {
      type: String,
      required: [true, "Payment id id required!..."],
    },
    refundId: {
      type: String,
    },
    refundAmount: {
      type: Number,
      required: [true, "refund amount cann't be non-negative!..."],
    },
    refundReason: {
      type: String,
      max: [200, "Not exceed from 200 words!..."],
    },
    metadata: {
      type: Map,
      of: String,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Indexes improve query performance in MongoDB by avoiding full collection scans.
// { field: 1 } → ascending index, { field: -1 } → descending index.
// Created on fields frequently used in queries like find(), filter, or sort (user, course, status, createdAt).
coursePurchaseSchema.index({ user: 1, course: 1 });
coursePurchaseSchema.index({ status: 1 });
coursePurchaseSchema.index({ createdAt: -1 });

//method for refund amount:
coursePurchaseSchema.methods.processRefund = async function (amount, reason) {
  ((this.status = "pending"),
    (this.refundReason = reason),
    (this.refundAmount = amount || this.amount));
  return this.save();
};

// Virtual method to check if the purchase is refundable within 7 days of creation
coursePurchaseSchema.virtual("isRefundable").get(function () {
  return (
    this.status === "completed" &&
    Date.now() - this.createdAt.getTime() <= 7 * 24 * 60 * 60 * 1000
  );
});

export const CoursePurchase = mongoose.model(
  "CoursePurchase",
  coursePurchaseSchema,
);

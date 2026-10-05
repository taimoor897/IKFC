import mongoose from "mongoose";

const quotationItemSchema = new mongoose.Schema(
  {
    item: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },

    unitPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    total: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false }
);

const rfqQuotationSchema = new mongoose.Schema(
  {
    rfq: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RFQ",
      required: true,
    },

    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },

    companyName: {
      type: String,
      required: true,
      trim: true,
    },

    contactPerson: {
      type: String,
      required: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      default: "",
      trim: true,
    },

    items: {
      type: [quotationItemSchema],
      required: true,
    },

    deliveryDays: {
      type: Number,
      default: 0,
    },

    notes: {
      type: String,
      default: "",
    },

    attachment: {
      type: String,
      default: "",
    },

    grandTotal: {
      type: Number,
      required: true,
      min: 0,
    },

    status: {
      type: String,
      enum: [
        "Submitted",
        "Selected",
        "Rejected",
      ],
      default: "Submitted",
    },

    submittedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model(
  "RFQQuotation",
  rfqQuotationSchema
);
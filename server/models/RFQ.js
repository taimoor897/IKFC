import mongoose from "mongoose";

const rfqItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    quantity: {
      type: Number,
      required: true,
    },

    unit: {
      type: String,
      default: "unit",
    },
  },
  { _id: true }
);

const quotationItemSchema = new mongoose.Schema(
  {
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
    },

    name: {
      type: String,
      required: true,
    },

    quantity: {
      type: Number,
      default: 0,
    },

    unit: {
      type: String,
      default: "unit",
    },

    unitPrice: {
      type: Number,
      default: 0,
    },

    total: {
      type: Number,
      default: 0,
    },
  },
  { _id: true }
);

const responseSchema = new mongoose.Schema(
  {
    supplierName: {
      type: String,
      required: true,
      trim: true,
    },

    supplierPhone: {
      type: String,
      required: true,
      trim: true,
    },

    supplierEmail: {
      type: String,
      default: "",
      trim: true,
    },

    items: {
      type: [quotationItemSchema],
      default: [],
    },

    totalAmount: {
      type: Number,
      default: 0,
    },

    notes: {
      type: String,
      default: "",
    },

    submittedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

const supplierSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      default: "",
    },

    email: {
      type: String,
      default: "",
    },

    phone: {
      type: String,
      default: "",
    },

    token: {
      type: String,
      default: null,
    },

    status: {
      type: String,
      default: "Pending",
    },

    submittedAt: {
      type: Date,
      default: null,
    },

    responded: {
      type: Boolean,
      default: false,
    },

    respondedAt: {
      type: Date,
      default: null,
    },

    quotation: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
  },
  { _id: true }
);

const rfqSchema = new mongoose.Schema(
  {
    rfqNumber: {
      type: String,
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
    },

    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },

    deadline: {
      type: Date,
      required: true,
    },

    items: {
      type: [rfqItemSchema],
      default: [],
    },

    // ==========================================
    // PUBLIC SHAREABLE LINK TOKEN
    // ==========================================

    publicToken: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    // ==========================================
    // SUPPLIERS
    // Optional / legacy
    // ==========================================

    suppliers: {
      type: [supplierSchema],
      default: [],
    },

    // ==========================================
    // ALL PUBLIC SUPPLIER RESPONSES
    // ==========================================

    responses: {
      type: [responseSchema],
      default: [],
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    status: {
      type: String,
      default: "Open",
      enum: [
        "Open",
        "Closed",
        "Awarded",
        "Cancelled",
      ],
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("RFQ", rfqSchema);
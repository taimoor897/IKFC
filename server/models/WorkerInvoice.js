import mongoose from "mongoose";

const workerInvoiceSchema = new mongoose.Schema(
  {
    worker: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Worker",
      required: true,
    },

    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },

    amount: {
      type: Number,
      required: true,
    },

    paymentMethod: {
      type: String,
      default: "Cash",
    },

    notes: {
      type: String,
      default: "",
    },

  },
  {
    timestamps: true,
  }
);


export default mongoose.model(
  "WorkerInvoice",
  workerInvoiceSchema
);
import Invoice from "../models/Invoice.js";
import Notification from "../models/Notification.js";
import Project from "../models/Project.js";


// =========================
// Create Invoice
// =========================

export const createInvoice = async (req, res) => {
  try {

    console.log("INVOICE BODY:", req.body);

    const invoice = await Invoice.create({
        ...req.body,
        createdBy: req.user._id,
      });


    res.status(201).json({
      success: true,
      invoice,
    });


  } catch(error){

    console.log("CREATE INVOICE ERROR:", error);

    res.status(500).json({
      success:false,
      message:error.message,
    });

  }
};



// =========================
// Get All Invoices
// =========================

export const getInvoices = async(req,res)=>{
  try{

    const invoices = await Invoice.find({
        createdBy: req.user._id,
      })
      .populate("project","name client")
      .sort({
        createdAt:-1,
      });


    res.json({
      success:true,
      invoices,
    });


  }catch(error){

    res.status(500).json({
      success:false,
      message:error.message,
    });

  }
};



// =========================
// Get Single Invoice
// =========================

export const getInvoice = async(req,res)=>{
  try{

    const invoice = await Invoice.findOne({
        _id:req.params.id,
        createdBy:req.user._id,
      })
      .populate("project");


    if(!invoice){
      return res.status(404).json({
        message:"Invoice not found",
      });
    }


    res.json({
      success:true,
      invoice,
    });


  }catch(error){

    res.status(500).json({
      success:false,
      message:error.message,
    });

  }
};



// =========================
// Record Payment
// =========================

// =========================
// Record Payment
// =========================

export const updatePayment = async (req, res) => {
  try {
    const invoice = await Invoice.findOne({
      _id: req.params.id,
      createdBy: req.user._id,
    });

    if (!invoice) {
      return res.status(404).json({
        message: "Invoice not found",
      });
    }

    // ==========================================
    // UPDATE CURRENT INVOICE PAYMENT
    // ==========================================

    invoice.paidAmount = Number(req.body.paidAmount || 0);

    if (invoice.paidAmount >= invoice.amount) {
      invoice.status = "Paid";
    } else if (invoice.paidAmount > 0) {
      invoice.status = "Partially Paid";
    } else {
      invoice.status = "Unpaid";
    }

    await invoice.save();

    // ==========================================
    // CALCULATE TOTAL PAYMENT FOR THIS MILESTONE
    // ==========================================

    if (invoice.project && invoice.milestone) {
      const milestoneInvoices = await Invoice.find({
        project: invoice.project,
        milestone: invoice.milestone,
        createdBy: req.user._id,
      });

      // Total amount of ALL invoices for this milestone
      const totalInvoicedAmount = milestoneInvoices.reduce(
        (total, inv) => total + Number(inv.amount || 0),
        0
      );

      // Total paid amount across ALL invoices
      const totalPaidAmount = milestoneInvoices.reduce(
        (total, inv) => total + Number(inv.paidAmount || 0),
        0
      );

      // ==========================================
      // DETERMINE MILESTONE PAYMENT STATUS
      // ==========================================

      let paymentStatus = "Unpaid";

      if (
        totalPaidAmount >= totalInvoicedAmount &&
        totalInvoicedAmount > 0
      ) {
        paymentStatus = "Paid";
      } else if (totalPaidAmount > 0) {
        paymentStatus = "Partially Paid";
      }

      // ==========================================
      // UPDATE PROJECT MILESTONE
      // ==========================================

      await Project.updateOne(
        {
          _id: invoice.project,
          "milestones._id": invoice.milestone,
        },
        {
          $set: {
            "milestones.$.paymentStatus": paymentStatus,

            // IMPORTANT:
            // This is the TOTAL paid across all invoices
            "milestones.$.paidAmount": totalPaidAmount,

            // Optional but useful:
            "milestones.$.totalInvoicedAmount": totalInvoicedAmount,
          },
        }
      );

      console.log("MILESTONE PAYMENT UPDATED:", {
        milestone: invoice.milestone,
        totalInvoicedAmount,
        totalPaidAmount,
        paymentStatus,
      });
    }

    // ==========================================
    // REMOVE OVERDUE NOTIFICATION
    // ==========================================

    if (invoice.status === "Paid") {
      await Notification.deleteMany({
        type: "invoice",
        message: {
          $regex: invoice.invoiceNumber,
          $options: "i",
        },
      });
    }

    // ==========================================
    // RESPONSE
    // ==========================================

    res.json({
      success: true,
      invoice,
    });

  } catch (error) {
    console.error("UPDATE PAYMENT ERROR:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



// =========================
// Delete Invoice
// =========================

export const deleteInvoice = async(req,res)=>{
  try{

    const invoice = await Invoice.findOneAndDelete({
        _id:req.params.id,
        createdBy:req.user._id,
      });


    if(!invoice){
      return res.status(404).json({
        message:"Invoice not found",
      });
    }


    res.json({
      success:true,
      message:"Invoice deleted",
    });


  }catch(error){

    res.status(500).json({
      success:false,
      message:error.message,
    });

  }
};
import RFQ from "../models/RFQ.js";
import crypto from "crypto";

// ============================================================
// CREATE RFQ
// ============================================================

export const createRFQ = async (req, res) => {
  try {
    const {
      title,
      description,
      project,
      deadline,
      items,
    } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: "RFQ title is required.",
      });
    }

    if (!project) {
      return res.status(400).json({
        success: false,
        message: "Project is required.",
      });
    }

    if (!deadline) {
      return res.status(400).json({
        success: false,
        message: "RFQ deadline is required.",
      });
    }

    if (!items || !items.length) {
      return res.status(400).json({
        success: false,
        message: "At least one item is required.",
      });
    }

    // ==========================================
    // GENERATE RFQ NUMBER
    // ==========================================

    const rfqNumber = `RFQ-${Date.now()}`;

    // ==========================================
    // GENERATE PUBLIC TOKEN
    // ==========================================

    const publicToken = crypto
      .randomBytes(32)
      .toString("hex");

    // ==========================================
    // CREATE RFQ
    // ==========================================

    const rfq = await RFQ.create({
      rfqNumber,

      title: title.trim(),

      description:
        description?.trim() || "",

      project,

      deadline,

      items,

      // IMPORTANT:
      // NO SUPPLIERS REQUIRED
      suppliers: [],

      // ALL PUBLIC RESPONSES GO HERE
      responses: [],

      // ONE SHAREABLE LINK FOR THIS RFQ
      publicToken,

      createdBy: req.user._id,

      status: "Open",
    });

    res.status(201).json({
      success: true,
      message: "RFQ created successfully.",
      rfq,
    });
  } catch (error) {
    console.error(
      "CREATE RFQ ERROR:",
      error
    );

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ============================================================
// GET ALL RFQS
// ============================================================

export const getRFQs = async (req, res) => {
  try {
    const rfqs = await RFQ.find({
      createdBy: req.user._id,
    })
      .populate(
        "project",
        "name client"
      )
      .sort({
        createdAt: -1,
      });

    res.json({
      success: true,
      count: rfqs.length,
      rfqs,
    });
  } catch (error) {
    console.error(
      "GET RFQS ERROR:",
      error
    );

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ============================================================
// GET SINGLE RFQ
// ============================================================

export const getRFQ = async (req, res) => {
  try {
    const rfq = await RFQ.findOne({
      _id: req.params.id,
      createdBy: req.user._id,
    })
      .populate(
        "project",
        "name client"
      )
      .lean();

    if (!rfq) {
      return res.status(404).json({
        success: false,
        message: "RFQ not found.",
      });
    }

    res.json({
      success: true,
      rfq,
    });
  } catch (error) {
    console.error(
      "GET RFQ ERROR:",
      error
    );

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ============================================================
// GET PUBLIC RFQ
// ============================================================
//
// IMPORTANT:
// No supplier needs to exist.
// The RFQ itself has one publicToken.
//
// URL:
// /api/rfqs/public/:id/:token
//
// ============================================================

export const getPublicRFQ = async (
  req,
  res
) => {
  try {
    const {
      id,
      token,
    } = req.params;

    if (!id || !token) {
      return res.status(400).json({
        success: false,
        message: "Invalid RFQ link.",
      });
    }

    const rfq = await RFQ.findOne({
      _id: id,
      publicToken: token,
    })
      .populate(
        "project",
        "name client"
      )
      .lean();

    if (!rfq) {
      return res.status(404).json({
        success: false,
        message: "Quotation request not found.",
      });
    }

    // ==========================================
    // CHECK DEADLINE
    // ==========================================

    if (
      rfq.deadline &&
      new Date() > new Date(rfq.deadline)
    ) {
      return res.status(400).json({
        success: false,
        message: "This RFQ has expired.",
      });
    }

    res.json({
      success: true,

      rfq: {
        _id: rfq._id,

        rfqNumber:
          rfq.rfqNumber,

        title:
          rfq.title,

        description:
          rfq.description,

        deadline:
          rfq.deadline,

        items:
          rfq.items,

        project:
          rfq.project,
      },
    });
  } catch (error) {
    console.error(
      "PUBLIC RFQ ERROR:",
      error
    );

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ============================================================
// SUPPLIER SUBMITS QUOTATION
// ============================================================
//
// ANY supplier can submit.
// No supplier needs to be created beforehand.
//
// ============================================================

export const submitQuotation = async (
  req,
  res
) => {
  try {
    const {
      supplierName,
      supplierPhone,
      supplierEmail,
      items,
      notes,
      totalAmount,
    } = req.body;

    const {
      id,
      token,
    } = req.params;

    // ==========================================
    // VALIDATION
    // ==========================================

    if (!supplierName?.trim()) {
      return res.status(400).json({
        success: false,
        message:
          "Supplier name is required.",
      });
    }

    if (!supplierPhone?.trim()) {
      return res.status(400).json({
        success: false,
        message:
          "Supplier phone is required.",
      });
    }

    // ==========================================
    // FIND RFQ
    // ==========================================

    const rfq = await RFQ.findOne({
      _id: id,
      publicToken: token,
    });

    if (!rfq) {
      return res.status(404).json({
        success: false,
        message:
          "Quotation request not found.",
      });
    }

    // ==========================================
    // DEADLINE
    // ==========================================

    if (
      rfq.deadline &&
      new Date() >
        new Date(rfq.deadline)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "This RFQ has expired.",
      });
    }

    // ==========================================
    // CREATE RESPONSE
    // ==========================================

    rfq.responses.push({
      supplierName:
        supplierName.trim(),

      supplierPhone:
        supplierPhone.trim(),

      supplierEmail:
        supplierEmail?.trim() || "",

      items:
        Array.isArray(items)
          ? items
          : [],

      totalAmount:
        Number(totalAmount || 0),

      notes:
        notes?.trim() || "",

      submittedAt:
        new Date(),
    });

    // ==========================================
    // SAVE
    // ==========================================

    await rfq.save();

    res.json({
      success: true,

      message:
        "Quotation submitted successfully.",

      response:
        rfq.responses[
          rfq.responses.length - 1
        ],
    });
  } catch (error) {
    console.error(
      "SUBMIT QUOTATION ERROR:",
      error
    );

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ============================================================
// DELETE RFQ
// ============================================================

export const deleteRFQ = async (
  req,
  res
) => {
  try {
    const rfq =
      await RFQ.findOneAndDelete({
        _id: req.params.id,
        createdBy: req.user._id,
      });

    if (!rfq) {
      return res.status(404).json({
        success: false,
        message: "RFQ not found.",
      });
    }

    res.json({
      success: true,
      message:
        "RFQ deleted successfully.",
    });
  } catch (error) {
    console.error(
      "DELETE RFQ ERROR:",
      error
    );

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
import IncomingPayment from "../models/IncomingPayment.js";
import Project from "../models/Project.js";

// ==========================================
// HELPER
// ==========================================

const getUserId = (req) => {
  return req.user?._id || req.user?.id;
};

// ==========================================
// CREATE INCOMING PAYMENT
// ==========================================

export const createIncomingPayment = async (req, res) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const {
      project,
      title,
      amount,
      date,
      paymentMethod,
      notes,
    } = req.body;

    if (!project) {
      return res.status(400).json({
        message: "Project is required",
      });
    }

    if (!title || !title.trim()) {
      return res.status(400).json({
        message: "Payment title is required",
      });
    }

    if (
      amount === undefined ||
      amount === null ||
      Number(amount) < 0
    ) {
      return res.status(400).json({
        message: "Valid payment amount is required",
      });
    }

    // Make sure the project exists
    const projectExists = await Project.findById(project);

    if (!projectExists) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    const payment = await IncomingPayment.create({
      project,
      title: title.trim(),
      amount: Number(amount),
      date: date || new Date(),
      paymentMethod: paymentMethod || "Other",
      notes: notes || "",
      createdBy: userId,
    });

    const populatedPayment =
      await IncomingPayment.findOne({
        _id: payment._id,
        createdBy: userId,
      }).populate(
        "project",
        "name budget"
      );

    res.status(201).json({
      message: "Incoming payment added successfully",
      payment: populatedPayment,
    });
  } catch (error) {
    console.error(
      "CREATE INCOMING PAYMENT ERROR:",
      error
    );

    res.status(500).json({
      message: "Failed to create incoming payment",
    });
  }
};

// ==========================================
// GET ALL INCOMING PAYMENTS
// ==========================================

export const getIncomingPayments = async (req, res) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const { projectId } = req.query;

    const filter = {
      createdBy: userId,
    };

    if (projectId) {
      filter.project = projectId;
    }

    const payments = await IncomingPayment.find(filter)
      .populate(
        "project",
        "name budget"
      )
      .sort({
        date: -1,
        createdAt: -1,
      });

    res.json({
      payments,
    });
  } catch (error) {
    console.error(
      "GET INCOMING PAYMENTS ERROR:",
      error
    );

    res.status(500).json({
      message: "Failed to fetch incoming payments",
    });
  }
};

// ==========================================
// GET SINGLE INCOMING PAYMENT
// ==========================================

export const getIncomingPayment = async (req, res) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const payment = await IncomingPayment.findOne({
      _id: req.params.id,
      createdBy: userId,
    }).populate(
      "project",
      "name budget"
    );

    if (!payment) {
      return res.status(404).json({
        message: "Incoming payment not found",
      });
    }

    res.json({
      payment,
    });
  } catch (error) {
    console.error(
      "GET INCOMING PAYMENT ERROR:",
      error
    );

    res.status(500).json({
      message: "Failed to fetch incoming payment",
    });
  }
};

// ==========================================
// UPDATE INCOMING PAYMENT
// ==========================================

export const updateIncomingPayment = async (req, res) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const {
      project,
      title,
      amount,
      date,
      paymentMethod,
      notes,
    } = req.body;

    // Only find payment belonging
    // to the currently logged-in user
    const payment = await IncomingPayment.findOne({
      _id: req.params.id,
      createdBy: userId,
    });

    if (!payment) {
      return res.status(404).json({
        message: "Incoming payment not found",
      });
    }

    if (project) {
      const projectExists =
        await Project.findById(project);

      if (!projectExists) {
        return res.status(404).json({
          message: "Project not found",
        });
      }

      payment.project = project;
    }

    if (title !== undefined) {
      if (!title.trim()) {
        return res.status(400).json({
          message: "Payment title is required",
        });
      }

      payment.title = title.trim();
    }

    if (amount !== undefined) {
      if (Number(amount) < 0) {
        return res.status(400).json({
          message: "Amount cannot be negative",
        });
      }

      payment.amount = Number(amount);
    }

    if (date !== undefined) {
      payment.date = date;
    }

    if (paymentMethod !== undefined) {
      payment.paymentMethod = paymentMethod;
    }

    if (notes !== undefined) {
      payment.notes = notes;
    }

    await payment.save();

    const updatedPayment =
      await IncomingPayment.findOne({
        _id: payment._id,
        createdBy: userId,
      }).populate(
        "project",
        "name budget"
      );

    res.json({
      message:
        "Incoming payment updated successfully",
      payment: updatedPayment,
    });
  } catch (error) {
    console.error(
      "UPDATE INCOMING PAYMENT ERROR:",
      error
    );

    res.status(500).json({
      message:
        "Failed to update incoming payment",
    });
  }
};

// ==========================================
// DELETE INCOMING PAYMENT
// ==========================================

export const deleteIncomingPayment = async (req, res) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    // Only delete payment belonging
    // to the logged-in user
    const payment =
      await IncomingPayment.findOne({
        _id: req.params.id,
        createdBy: userId,
      });

    if (!payment) {
      return res.status(404).json({
        message: "Incoming payment not found",
      });
    }

    await IncomingPayment.deleteOne({
      _id: payment._id,
      createdBy: userId,
    });

    res.json({
      message:
        "Incoming payment deleted successfully",
    });
  } catch (error) {
    console.error(
      "DELETE INCOMING PAYMENT ERROR:",
      error
    );

    res.status(500).json({
      message:
        "Failed to delete incoming payment",
    });
  }
};
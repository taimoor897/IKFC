
import Expense from "../models/Expense.js";
import Project from "../models/Project.js";

// ==========================================
// HELPER
// ==========================================

const getUserId = (req) => {
  return req.user?._id || req.user?.id;
};

// ==========================================
// CREATE EXPENSE
// ==========================================

export const createExpense = async (req, res) => {
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
      category,
      amount,
      date,
      notes,
    } = req.body;

    if (!project) {
      return res.status(400).json({
        message: "Project is required",
      });
    }

    if (!title || !title.trim()) {
      return res.status(400).json({
        message: "Expense title is required",
      });
    }

    if (
      amount === undefined ||
      amount === null ||
      Number(amount) < 0
    ) {
      return res.status(400).json({
        message: "Valid expense amount is required",
      });
    }

    // Make sure the project exists
    const projectExists = await Project.findById(project);

    if (!projectExists) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    const expense = await Expense.create({
      project,
      title: title.trim(),
      category: category || "Other",
      amount: Number(amount),
      date: date || new Date(),
      notes: notes || "",
      createdBy: userId,
    });

    const populatedExpense =
      await Expense.findOne({
        _id: expense._id,
        createdBy: userId,
      }).populate(
        "project",
        "name budget"
      );

    res.status(201).json({
      message: "Expense added successfully",
      expense: populatedExpense,
    });
  } catch (error) {
    console.error(
      "CREATE EXPENSE ERROR:",
      error
    );

    res.status(500).json({
      message: "Failed to create expense",
    });
  }
};

// ==========================================
// GET ALL EXPENSES
// ==========================================

export const getExpenses = async (req, res) => {
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

    const expenses = await Expense.find(filter)
      .populate(
        "project",
        "name budget"
      )
      .sort({
        date: -1,
        createdAt: -1,
      });

    res.json({
      expenses,
    });
  } catch (error) {
    console.error(
      "GET EXPENSES ERROR:",
      error
    );

    res.status(500).json({
      message: "Failed to fetch expenses",
    });
  }
};

// ==========================================
// GET SINGLE EXPENSE
// ==========================================

export const getExpense = async (req, res) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const expense = await Expense.findOne({
      _id: req.params.id,
      createdBy: userId,
    }).populate(
      "project",
      "name budget"
    );

    if (!expense) {
      return res.status(404).json({
        message: "Expense not found",
      });
    }

    res.json({
      expense,
    });
  } catch (error) {
    console.error(
      "GET EXPENSE ERROR:",
      error
    );

    res.status(500).json({
      message: "Failed to fetch expense",
    });
  }
};

// ==========================================
// UPDATE EXPENSE
// ==========================================

export const updateExpense = async (req, res) => {
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
      category,
      amount,
      date,
      notes,
    } = req.body;

    // IMPORTANT:
    // Only find an expense belonging to
    // the currently logged-in user.
    const expense = await Expense.findOne({
      _id: req.params.id,
      createdBy: userId,
    });

    if (!expense) {
      return res.status(404).json({
        message: "Expense not found",
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

      expense.project = project;
    }

    if (title !== undefined) {
      if (!title.trim()) {
        return res.status(400).json({
          message:
            "Expense title is required",
        });
      }

      expense.title = title.trim();
    }

    if (category !== undefined) {
      expense.category = category;
    }

    if (amount !== undefined) {
      if (Number(amount) < 0) {
        return res.status(400).json({
          message:
            "Amount cannot be negative",
        });
      }

      expense.amount = Number(amount);
    }

    if (date !== undefined) {
      expense.date = date;
    }

    if (notes !== undefined) {
      expense.notes = notes;
    }

    await expense.save();

    const updatedExpense =
      await Expense.findOne({
        _id: expense._id,
        createdBy: userId,
      }).populate(
        "project",
        "name budget"
      );

    res.json({
      message:
        "Expense updated successfully",
      expense: updatedExpense,
    });
  } catch (error) {
    console.error(
      "UPDATE EXPENSE ERROR:",
      error
    );

    res.status(500).json({
      message:
        "Failed to update expense",
    });
  }
};

// ==========================================
// DELETE EXPENSE
// ==========================================

export const deleteExpense = async (req, res) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    // IMPORTANT:
    // Only delete an expense belonging
    // to the logged-in user.
    const expense =
      await Expense.findOne({
        _id: req.params.id,
        createdBy: userId,
      });

    if (!expense) {
      return res.status(404).json({
        message: "Expense not found",
      });
    }

    await Expense.deleteOne({
      _id: expense._id,
      createdBy: userId,
    });

    res.json({
      message:
        "Expense deleted successfully",
    });
  } catch (error) {
    console.error(
      "DELETE EXPENSE ERROR:",
      error
    );

    res.status(500).json({
      message:
        "Failed to delete expense",
    });
  }
};



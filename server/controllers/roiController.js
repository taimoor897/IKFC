import Project from "../models/Project.js";
import Material from "../models/Material.js";
import WorkerInvoice from "../models/WorkerInvoice.js";
import Expense from "../models/Expense.js";

export const getProjectROI = async (req, res) => {
  try {
    const { projectId } = req.params;

    // ==========================================
    // GET PROJECT
    // ==========================================

    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    // ==========================================
    // REVENUE / PROJECT BUDGET
    // ==========================================

    const revenue = Number(project.budget || 0);

    // ==========================================
    // CALCULATE PROJECT PROGRESS
    // ==========================================

    const progress = Math.round(
      (project.milestones || []).reduce(
        (total, milestone) => {
          return milestone.completed
            ? total + Number(milestone.weight || 0)
            : total;
        },
        0
      )
    );

    // ==========================================
    // GET MATERIALS
    // ==========================================

    const materials = await Material.find({
      project: projectId,
    });

    const materialCost = materials.reduce(
      (total, material) => {
        return (
          total +
          Number(
            material.originalQuantity ||
              material.quantity ||
              0
          ) *
            Number(material.costPerUnit || 0)
        );
      },
      0
    );

    // ==========================================
    // GET WORKER INVOICES
    // ==========================================

    const workerInvoices = await WorkerInvoice.find({
      project: projectId,
    });

    const workerCost = workerInvoices.reduce(
      (total, invoice) => {
        return total + Number(invoice.amount || 0);
      },
      0
    );

    // ==========================================
    // GET DAILY EXPENSES
    // ==========================================

    const expenses = await Expense.find({
      project: projectId,
    });

    const dailyExpenseCost = expenses.reduce(
      (total, expense) => {
        return total + Number(expense.amount || 0);
      },
      0
    );

    // ==========================================
    // TOTAL COST
    // ==========================================

    const totalCost =
      materialCost +
      workerCost +
      dailyExpenseCost;

    // ==========================================
    // REMAINING BUDGET
    // ==========================================

    const remainingBudget =
      revenue - totalCost;

    // ==========================================
    // PROFIT
    // ==========================================

    const profit =
      revenue - totalCost;

    // ==========================================
    // ROI
    // ==========================================

    const roi =
      totalCost === 0
        ? 0
        : ((profit / totalCost) * 100).toFixed(2);

    // ==========================================
    // BUDGET USED
    // ==========================================

    const budgetUsed =
      revenue > 0
        ? (totalCost / revenue) * 100
        : 0;

    // ==========================================
    // EXPECTED COST
    // ==========================================

    const expectedCost =
      revenue * (progress / 100);

    // ==========================================
    // COST VARIANCE
    // ==========================================

    const costVariance =
      totalCost - expectedCost;

    // ==========================================
    // PROJECTED FINAL COST
    // ==========================================

    let projectedFinalCost = 0;

    if (progress > 0) {
      projectedFinalCost =
        totalCost / (progress / 100);
    }

    // ==========================================
    // POTENTIAL OVERRUN
    // ==========================================

    const potentialOverrun =
      Math.max(
        0,
        projectedFinalCost - revenue
      );

    // ==========================================
    // COST VARIANCE PERCENTAGE
    // ==========================================

    const variancePercentage =
      revenue > 0
        ? (costVariance / revenue) * 100
        : 0;

    // ==========================================
    // RISK LEVEL
    // ==========================================

    let risk = "LOW";

    if (variancePercentage > 20) {
      risk = "CRITICAL";
    } else if (variancePercentage > 10) {
      risk = "HIGH";
    } else if (variancePercentage > 5) {
      risk = "MEDIUM";
    }

    // ==========================================
    // RESPONSE
    // ==========================================

    res.json({
      project: project.name,

      revenue,

      materialCost,

      workerCost,

      dailyExpenseCost,

      totalCost,

      remainingBudget,

      profit,

      roi,

      progress,

      budgetUsed: Number(
        budgetUsed.toFixed(2)
      ),

      expectedCost: Number(
        expectedCost.toFixed(2)
      ),

      costVariance: Number(
        costVariance.toFixed(2)
      ),

      projectedFinalCost: Number(
        projectedFinalCost.toFixed(2)
      ),

      potentialOverrun: Number(
        potentialOverrun.toFixed(2)
      ),

      variancePercentage: Number(
        variancePercentage.toFixed(2)
      ),

      risk,
    });
  } catch (error) {
    console.error(
      "ROI CALCULATION ERROR:",
      error
    );

    res.status(500).json({
      message: "ROI calculation failed",
    });
  }
};

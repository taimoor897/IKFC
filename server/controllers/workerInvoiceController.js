import WorkerInvoice from "../models/WorkerInvoice.js";
import Project from "../models/Project.js";


export const createWorkerInvoice = async (req, res) => {
  try {

    const {
      worker,
      projectName,
      amount,
      paymentMethod,
      notes
    } = req.body;

    console.log("PROJECT NAME FROM FRONTEND:", projectName);

    // Find project by name
    const project = await Project.findOne({
      name: projectName
    });
    console.log("PROJECT FOUND:", project?._id, project?.name);

    if (!project) {
      return res.status(404).json({
        message: "Project not found"
      });
    }

    // Create invoice
    const invoice = await WorkerInvoice.create({
      worker,
      project: project._id,
      amount: Number(amount),
      paymentMethod,
      notes
    });

    console.log("WORKER INVOICE CREATED:", invoice);

    res.status(201).json(invoice);

  } catch (error) {

    console.error("WORKER INVOICE ERROR:", error);

    res.status(500).json({
      message: "Failed to create worker invoice"
    });

  }
};
import Project from "../models/Project.js";

// Create Project
export const createProject = async (req, res) => {
try {
const project = await Project.create({
...req.body,
createdBy: req.user._id
});


res.status(201).json({
  success: true,
  project
});


} catch (error) {


res.status(500).json({
  success: false,
  message: error.message
});


}
};

// Delete Project
export const deleteProject = async (req, res) => {
try {


const project = await Project.findByIdAndDelete(req.params.id);

if (!project) {
  return res.status(404).json({
    message: "Project not found"
  });
}

res.json({
  message: "Project deleted successfully"
});


} catch (error) {


res.status(500).json({
  message: error.message
});


}
};

// Update Project
export const updateProject = async (req, res) => {
try {


const project = await Project.findOneAndUpdate(
  {
    _id: req.params.id,
    createdBy: req.user._id
  },
  req.body,
  {
    new: true,
    runValidators: true
  }
);

if (!project) {
  return res.status(404).json({
    message: "Project not found"
  });
}

res.json({
  message: "Project updated successfully",
  project
});


} catch (error) {


res.status(500).json({
  message: error.message
});


}
};

// Get Single Project
export const getProject = async (req, res) => {
try {


let project;

if (req.user.role === "Manager") {

  project = await Project.findOne({
    _id: req.params.id,
    createdBy: req.user._id
  });

} else if (req.user.role === "Worker") {

  project = await Project.findById(req.params.id);

}

if (!project) {
  return res.status(404).json({
    message: "Project not found"
  });
}

res.json({
  project
});


} catch (error) {


res.status(500).json({
  message: error.message
});


}
};

// Get All Projects
export const getProjects = async (req, res) => {
try {


let projects;

if (req.user.role === "Manager") {

  projects = await Project.find({
    createdBy: req.user._id
  });

} else if (req.user.role === "Worker") {

  projects = await Project.find();

}

res.json({
  success: true,
  count: projects.length,
  projects
});

} catch (error) {


res.status(500).json({
  success: false,
  message: error.message
});


}
};

// Delete Project Photo
export const deleteProjectPhoto = async (req, res) => {
try {


const { url } = req.body;

const project = await Project.findById(req.params.id);

if (!project) {
  return res.status(404).json({
    message: "Project not found"
  });
}

project.photos = project.photos.filter(
  photo => photo !== url
);

await project.save();

res.json({
  success: true,
  photos: project.photos
});


} catch (error) {


res.status(500).json({
  message: error.message
});


}
};

// Add Milestone
export const addMilestone = async (req, res) => {
try {


const project = await Project.findById(req.params.id);

if (!project) {
  return res.status(404).json({
    message: "Project not found"
  });
}

const { name, weight } = req.body;

const milestoneWeight = Number(weight);

if (!name || !name.trim()) {
  return res.status(400).json({
    message: "Milestone name is required"
  });
}

if (
  !Number.isFinite(milestoneWeight) ||
  milestoneWeight <= 0 ||
  milestoneWeight > 100
) {
  return res.status(400).json({
    message: "Weight must be between 1 and 100"
  });
}

const currentWeight = project.milestones.reduce(
  (total, milestone) =>
    total + Number(milestone.weight || 0),
  0
);

if (currentWeight + milestoneWeight > 100) {
  return res.status(400).json({
    message: `Milestone weights cannot exceed 100%. You have ${
      100 - currentWeight
    }% remaining.`
  });
}

project.milestones.push({
  name: name.trim(),
  weight: milestoneWeight,
  completed: false
});

await project.save();

res.json({
  success: true,
  milestones: project.milestones
});


} catch (error) {


console.log("ADD MILESTONE ERROR:", error);

res.status(500).json({
  message: error.message
});


}
};

// Complete Milestone
export const completeMilestone = async (req, res) => {
try {


const project = await Project.findById(req.params.id);

if (!project) {
  return res.status(404).json({
    message: "Project not found"
  });
}

const milestone = project.milestones.id(
  req.params.milestoneId
);

if (!milestone) {
  return res.status(404).json({
    message: "Milestone not found"
  });
}

milestone.completed = true;
milestone.completedAt = new Date();

const progress = project.milestones.reduce(
  (total, milestone) => {

    if (milestone.completed) {
      return total + Number(milestone.weight || 0);
    }

    return total;

  },
  0
);

project.progress = Math.min(
  Math.round(progress),
  100
);

await project.save();

res.json({
  success: true,
  milestones: project.milestones,
  progress: project.progress
});


} catch (error) {


console.error(
  "COMPLETE MILESTONE ERROR:",
  error
);

res.status(500).json({
  message: error.message
});

}
};

// Delete Milestone
export const deleteMilestone = async (req, res) => {
try {


if (req.user.role !== "Manager") {
  return res.status(403).json({
    message: "Only managers can delete milestones"
  });
}

const project = await Project.findOne({
  _id: req.params.id,
  createdBy: req.user._id
});

if (!project) {
  return res.status(404).json({
    message: "Project not found"
  });
}

project.milestones = project.milestones.filter(
  milestone =>
    milestone._id.toString() !==
    req.params.milestoneId
);

const progress = project.milestones.reduce(
  (total, milestone) => {

    if (milestone.completed) {
      return total + Number(milestone.weight || 0);
    }

    return total;

  },
  0
);

project.progress = Math.round(progress);

await project.save();

res.json({
  success: true,
  milestones: project.milestones
});


} catch (error) {


res.status(500).json({
  message: error.message
});


}
};

// ==========================================
// PUBLIC PROJECT
// ==========================================
// No authentication required.
// Used by the client-facing public project page.

export const getPublicProject = async (req, res) => {
try {


const project = await Project.findById(
  req.params.id
);

if (!project) {
  return res.status(404).json({
    success: false,
    message: "Project not found"
  });
}

res.json({
  success: true,
  project
});


} catch (error) {


console.error(
  "GET PUBLIC PROJECT ERROR:",
  error
);

res.status(500).json({
  success: false,
  message: error.message
});


}
};

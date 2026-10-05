import express from "express";
import Project from "../models/Project.js";
import authMiddleware from "../middleware/authMiddleware.js";

import {
createProject,
getProjects,
deleteProject,
updateProject,
getProject,
getPublicProject,
deleteProjectPhoto,
addMilestone,
completeMilestone,
deleteMilestone,
} from "../controllers/projectController.js";

const router = express.Router();

// ===============================
// SAVE PROJECT PHOTO
// ===============================

router.post("/:id/photos", async (req, res) => {

try {


const project = await Project.findById(req.params.id);

if (!project) {
  return res.status(404).json({
    message: "Project not found"
  });
}

project.photos.push(req.body.url);

await project.save();

res.json({
  message: "Photo saved",
  photos: project.photos
});


} catch (err) {


res.status(500).json({
  message: err.message
});


}

});

// ===============================
// CREATE PROJECT
// ===============================

router.post(
"/",
authMiddleware,
createProject
);

// ===============================
// GET ALL PROJECTS
// ===============================

router.get(
"/",
authMiddleware,
getProjects
);

// ===============================
// DELETE PROJECT
// ===============================

router.delete(
"/:id",
authMiddleware,
deleteProject
);

// ===============================
// UPDATE PROJECT
// ===============================

router.put(
"/:id",
authMiddleware,
updateProject
);

// ===============================
// PUBLIC PROJECT
// ===============================
// IMPORTANT:
// This route must come BEFORE /:id
// and does NOT use authMiddleware.

router.get(
"/public/:id",
getPublicProject
);

// ===============================
// GET SINGLE PROJECT
// ===============================
// Manager/Worker authentication required.

router.get(
"/:id",
authMiddleware,
getProject
);

// ===============================
// DELETE PROJECT PHOTO
// ===============================

router.delete(
"/:id/photos",
authMiddleware,
deleteProjectPhoto
);

// ===============================
// ADD MILESTONE
// ===============================

router.post(
"/:id/milestones",
authMiddleware,
addMilestone
);

// ===============================
// COMPLETE MILESTONE
// ===============================

router.put(
"/:id/milestones/:milestoneId/complete",
authMiddleware,
completeMilestone
);

// ===============================
// DELETE MILESTONE
// ===============================

router.delete(
"/:id/milestones/:milestoneId",
authMiddleware,
deleteMilestone
);

export default router;

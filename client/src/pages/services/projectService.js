import api from "./api";

// ===============================
// GET ALL PROJECTS
// ===============================

export const getProjects = async () => {
const response = await api.get("/projects");
return response.data;
};

// ===============================
// CREATE PROJECT
// ===============================

export const createProject = async (project) => {
const response = await api.post("/projects", project);
return response.data;
};

// ===============================
// DELETE PROJECT
// ===============================

export const deleteProject = async (id) => {
const response = await api.delete(`/projects/${id}`);
return response.data;
};

// ===============================
// UPDATE PROJECT
// ===============================

export const updateProject = async (id, data) => {
const response = await api.put(`/projects/${id}`, data);
return response.data;
};

// ===============================
// GET SINGLE PROJECT
// ===============================
// Protected endpoint.
// Used by the manager/worker dashboard.

export const getProject = async (id) => {
const response = await api.get(`/projects/${id}`);
return response.data;
};

// ===============================
// GET PUBLIC PROJECT
// ===============================
// Public endpoint.
// Does NOT require manager authentication.

export const getPublicProject = async (id) => {
const response = await api.get(`/projects/public/${id}`);
return response.data;
};

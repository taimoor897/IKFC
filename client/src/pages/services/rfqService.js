import axios from "axios";

const API = `${import.meta.env.VITE_API_URL}/rfqs`;

const authConfig = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
});

// ============================================================
// CREATE RFQ
// ============================================================

export const createRFQ = async (data) => {
  const response = await axios.post(
    API,
    data,
    authConfig()
  );

  return response.data;
};

// ============================================================
// GET ALL RFQS
// ============================================================

export const getRFQs = async () => {
  const response = await axios.get(
    API,
    authConfig()
  );

  return response.data;
};

// ============================================================
// GET SINGLE RFQ
// ============================================================

export const getRFQ = async (id) => {
  const response = await axios.get(
    `${API}/${id}`,
    authConfig()
  );

  return response.data;
};

// ============================================================
// GET PUBLIC RFQ
// Supplier does NOT need login
//
// Backend:
// GET /api/rfqs/public/:id/:token
// ============================================================

export const getPublicRFQ = async (id, token) => {
  const response = await axios.get(
    `${API}/public/${id}/${token}`
  );

  return response.data;
};

// ============================================================
// SUPPLIER SUBMITS QUOTATION
//
// Backend:
// POST /api/rfqs/public/:id/:token
// ============================================================

export const submitRFQResponse = async (
  id,
  token,
  data
) => {
  const response = await axios.post(
    `${API}/public/${id}/${token}`,
    data
  );

  return response.data;
};

// ============================================================
// DELETE RFQ
// ============================================================

export const deleteRFQ = async (id) => {
  const response = await axios.delete(
    `${API}/${id}`,
    authConfig()
  );

  return response.data;
};

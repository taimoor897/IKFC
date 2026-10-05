import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import {
  ArrowLeft,
  Plus,
  Trash2,
  ClipboardList,
} from "lucide-react";

import DashboardLayout from "../../components/layout/DashboardLayout";
import { createRFQ } from "../services/rfqService";
import { getProjects } from "../services/projectService";

export default function CreateRFQ() {
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(true);

  const [project, setProject] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");

  const [items, setItems] = useState([
    {
      name: "",
      quantity: "",
      unit: "",
    },
  ]);

  const [loading, setLoading] = useState(false);

  // ==========================================
  // LOAD PROJECTS
  // ==========================================

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const data = await getProjects();

      console.log("PROJECTS FOR RFQ:", data);

      setProjects(data.projects || []);
    } catch (error) {
      console.error("GET PROJECTS ERROR:", error);

      Swal.fire({
        icon: "error",
        title: "Failed to load projects",
        text:
          error.response?.data?.message ||
          "Could not load your projects.",
      });
    } finally {
      setLoadingProjects(false);
    }
  };

  // ==========================================
  // ITEMS
  // ==========================================

  const addItem = () => {
    setItems([
      ...items,
      {
        name: "",
        quantity: "",
        unit: "",
      },
    ]);
  };

  const removeItem = (index) => {
    if (items.length === 1) return;

    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index, field, value) => {
    const updated = [...items];

    updated[index][field] = value;

    setItems(updated);
  };

  // ==========================================
  // SUBMIT
  // ==========================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Project validation
    if (!project) {
      Swal.fire({
        icon: "warning",
        title: "Project required",
        text: "Please select the project this RFQ belongs to.",
      });

      return;
    }

    // Title validation
    if (!title.trim()) {
      Swal.fire({
        icon: "warning",
        title: "RFQ title required",
        text: "Please enter a title for this quotation request.",
      });

      return;
    }

    // Deadline validation
    if (!deadline) {
      Swal.fire({
        icon: "warning",
        title: "Deadline required",
        text: "Please select a quotation deadline.",
      });

      return;
    }

    // Make sure deadline isn't in the past
    const selectedDeadline = new Date(deadline);
    const today = new Date();

    today.setHours(0, 0, 0, 0);

    if (selectedDeadline < today) {
      Swal.fire({
        icon: "warning",
        title: "Invalid deadline",
        text: "The quotation deadline cannot be in the past.",
      });

      return;
    }

    // Items validation
    if (items.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "Add an item",
        text: "Please add at least one item.",
      });

      return;
    }

    const invalidItem = items.some(
      (item) =>
        !item.name.trim() ||
        !item.quantity ||
        Number(item.quantity) <= 0 ||
        !item.unit.trim()
    );

    if (invalidItem) {
      Swal.fire({
        icon: "warning",
        title: "Incomplete item",
        text: "Please complete all item fields correctly.",
      });

      return;
    }

    try {
      setLoading(true);

      const payload = {
        project,
        title: title.trim(),
        description: description.trim(),
        deadline,
        items: items.map((item) => ({
          name: item.name.trim(),
          quantity: Number(item.quantity),
          unit: item.unit.trim(),
        })),
      };

      console.log("CREATE RFQ PAYLOAD:", payload);

      const response = await createRFQ(payload);

      console.log("CREATE RFQ RESPONSE:", response);

      Swal.fire({
        icon: "success",
        title: "RFQ Created",
        text: "Your quotation request has been created successfully.",
        confirmButtonColor: "#2563eb",
      });

      navigate(`/rfqs/${response.rfq._id}`);
    } catch (error) {
      console.error("CREATE RFQ ERROR:", error);

      Swal.fire({
        icon: "error",
        title: "Failed to create RFQ",
        text:
          error.response?.data?.message ||
          "Something went wrong while creating the RFQ.",
      });
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // LOADING PROJECTS
  // ==========================================

  if (loadingProjects) {
    return (
      <DashboardLayout>
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

            <p className="text-slate-500">
              Loading projects...
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // ==========================================
  // PAGE
  // ==========================================

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-5xl space-y-8">

        {/* HEADER */}

        <div className="flex items-center gap-4">

          <button
            onClick={() => navigate("/rfqs")}
            className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-slate-600 shadow-sm transition hover:bg-slate-100"
          >
            <ArrowLeft size={20} />
          </button>

          <div className="flex items-center gap-3">

            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-600">
              <ClipboardList size={24} />
            </div>

            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                Create RFQ
              </h1>

              <p className="mt-1 text-slate-500">
                Create a quotation request for your suppliers.
              </p>
            </div>

          </div>

        </div>


        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >

          {/* =====================================
              REQUEST INFORMATION
          ====================================== */}

          <div className="rounded-3xl bg-white p-8 shadow-sm">

            <h2 className="text-xl font-bold text-slate-900">
              Request Information
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Give suppliers enough information to understand what you need.
            </p>


            <div className="mt-6 space-y-5">

              {/* PROJECT */}

              <div>

                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Project
                </label>

                <select
                  value={project}
                  onChange={(e) =>
                    setProject(e.target.value)
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >

                  <option value="">
                    Select Project
                  </option>

                  {projects.map((item) => (
                    <option
                      key={item._id}
                      value={item._id}
                    >
                      {item.name}
                    </option>
                  ))}

                </select>

                {projects.length === 0 && (
                  <p className="mt-2 text-sm text-red-500">
                    No projects available. Create a project first.
                  </p>
                )}

              </div>


              {/* TITLE */}

              <div>

                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  RFQ Title
                </label>

                <input
                  type="text"
                  value={title}
                  onChange={(e) =>
                    setTitle(e.target.value)
                  }
                  placeholder="e.g. Cement and Steel Supply"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />

              </div>


              {/* DEADLINE */}

              <div>

                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Quotation Deadline
                </label>

                <input
                  type="date"
                  value={deadline}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={(e) =>
                    setDeadline(e.target.value)
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />

                <p className="mt-2 text-xs text-slate-400">
                  Suppliers will be able to submit quotations until this date.
                </p>

              </div>


              {/* DESCRIPTION */}

              <div>

                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Description
                </label>

                <textarea
                  rows="5"
                  value={description}
                  onChange={(e) =>
                    setDescription(e.target.value)
                  }
                  placeholder="Describe what you need from the supplier..."
                  className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />

              </div>

            </div>

          </div>


          {/* =====================================
              ITEMS
          ====================================== */}

          <div className="rounded-3xl bg-white p-8 shadow-sm">

            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">

              <div>

                <h2 className="text-xl font-bold text-slate-900">
                  Required Items
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Add the materials or services you want suppliers to quote.
                </p>

              </div>


              <button
                type="button"
                onClick={addItem}
                className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 font-semibold text-white transition hover:bg-blue-700"
              >
                <Plus size={18} />
                Add Item
              </button>

            </div>


            <div className="mt-6 space-y-4">

              {items.map((item, index) => (

                <div
                  key={index}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-5"
                >

                  <div className="mb-4 flex items-center justify-between">

                    <h3 className="font-semibold text-slate-800">
                      Item {index + 1}
                    </h3>

                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() =>
                          removeItem(index)
                        }
                        className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
                      >
                        <Trash2 size={16} />
                        Remove
                      </button>
                    )}

                  </div>


                  <div className="grid gap-4 md:grid-cols-3">

                    {/* ITEM */}

                    <div>

                      <label className="mb-2 block text-sm font-medium text-slate-600">
                        Item / Material
                      </label>

                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) =>
                          updateItem(
                            index,
                            "name",
                            e.target.value
                          )
                        }
                        placeholder="Cement"
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-blue-500"
                      />

                    </div>


                    {/* QUANTITY */}

                    <div>

                      <label className="mb-2 block text-sm font-medium text-slate-600">
                        Quantity
                      </label>

                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) =>
                          updateItem(
                            index,
                            "quantity",
                            e.target.value
                          )
                        }
                        placeholder="500"
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-blue-500"
                      />

                    </div>


                    {/* UNIT */}

                    <div>

                      <label className="mb-2 block text-sm font-medium text-slate-600">
                        Unit
                      </label>

                      <input
                        type="text"
                        value={item.unit}
                        onChange={(e) =>
                          updateItem(
                            index,
                            "unit",
                            e.target.value
                          )
                        }
                        placeholder="Bags"
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-blue-500"
                      />

                    </div>

                  </div>

                </div>

              ))}

            </div>

          </div>


          {/* =====================================
              PREVIEW
          ====================================== */}

          <div className="rounded-3xl border border-blue-100 bg-blue-50 p-6">

            <h3 className="font-bold text-blue-900">
              Supplier Form Preview
            </h3>

            <p className="mt-1 text-sm text-blue-700">
              Suppliers will receive a form containing these items and will enter their quotation prices.
            </p>


            <div className="mt-4 rounded-2xl bg-white p-5">

              <div className="flex flex-col justify-between gap-2 sm:flex-row">

                <div>

                  <p className="font-bold text-slate-900">
                    {title || "Your RFQ Title"}
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    {projects.find(
                      (p) => p._id === project
                    )?.name || "No project selected"}
                  </p>

                </div>


                <div className="text-left sm:text-right">

                  <p className="text-xs uppercase tracking-wide text-slate-400">
                    Deadline
                  </p>

                  <p className="font-semibold text-slate-700">
                    {deadline
                      ? new Date(
                          deadline
                        ).toLocaleDateString()
                      : "Not selected"}
                  </p>

                </div>

              </div>


              <div className="mt-4 space-y-3">

                {items.map((item, index) => (

                  <div
                    key={index}
                    className="flex items-center justify-between rounded-xl bg-slate-50 p-3"
                  >

                    <span className="font-medium text-slate-700">
                      {item.name ||
                        `Item ${index + 1}`}
                    </span>

                    <span className="text-sm text-slate-500">
                      {item.quantity || "—"}{" "}
                      {item.unit || ""}
                    </span>

                  </div>

                ))}

              </div>

            </div>

          </div>


          {/* =====================================
              BUTTONS
          ====================================== */}

          <div className="flex flex-col-reverse justify-end gap-3 sm:flex-row">

            <button
              type="button"
              onClick={() => navigate("/rfqs")}
              className="rounded-xl bg-white px-6 py-3 font-semibold text-slate-700 shadow-sm transition hover:bg-slate-100"
            >
              Cancel
            </button>


            <button
              type="submit"
              disabled={loading || projects.length === 0}
              className="rounded-xl bg-blue-600 px-8 py-3 font-semibold text-white shadow-lg transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >

              {loading
                ? "Creating..."
                : "Create RFQ"}

            </button>

          </div>

        </form>

      </div>
    </DashboardLayout>
  );
}
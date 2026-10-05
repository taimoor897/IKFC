
import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "../components/layout/DashboardLayout";
import { getProjects } from "./services/projectService";
import {
  Plus,
  Trash2,
  Pencil,
  X,
  CircleDollarSign,
  CalendarDays,
  Receipt,
  CreditCard,
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

const paymentMethods = [
  "Cash",
  "Bank Transfer",
  "Cheque",
  "Online Transfer",
  "Other",
];

const emptyForm = {
  project: "",
  title: "",
  amount: "",
  date: new Date().toISOString().split("T")[0],
  paymentMethod: "Other",
  notes: "",
};

export default function IncomingPayments() {
  const [projects, setProjects] = useState([]);
  const [payments, setPayments] = useState([]);

  const [showForm, setShowForm] = useState(false);
  const [editingPayment, setEditingPayment] = useState(null);

  const [form, setForm] = useState(emptyForm);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [filterProject, setFilterProject] = useState("");
  const [search, setSearch] = useState("");

  const token = localStorage.getItem("token");

  // ==========================================
  // LOAD DATA
  // ==========================================

  useEffect(() => {
    loadProjects();
    loadPayments();
  }, []);

  const loadProjects = async () => {
    try {
      const data = await getProjects();

      const currentYear = new Date().getFullYear();

      const currentYearProjects = (data.projects || []).filter(
        (project) => project.year === currentYear
      );

      setProjects(currentYearProjects);
    } catch (error) {
      console.error("Failed to load projects:", error);
    }
  };

  const loadPayments = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        `${API_URL}/incoming-payments`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to load incoming payments"
        );
      }

      setPayments(data.payments || []);
    } catch (error) {
      console.error(
        "Failed to load incoming payments:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // FORM HANDLING
  // ==========================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const openAddForm = () => {
    setEditingPayment(null);

    setForm({
      ...emptyForm,
      project: filterProject || "",
    });

    setShowForm(true);
  };

  const openEditForm = (payment) => {
    setEditingPayment(payment);

    setForm({
      project:
        payment.project?._id ||
        payment.project ||
        "",

      title: payment.title || "",

      amount: payment.amount || "",

      date: payment.date
        ? new Date(payment.date)
            .toISOString()
            .split("T")[0]
        : "",

      paymentMethod:
        payment.paymentMethod || "Other",

      notes: payment.notes || "",
    });

    setShowForm(true);
  };

  const closeForm = () => {
    if (saving) return;

    setShowForm(false);
    setEditingPayment(null);
    setForm(emptyForm);
  };

  // ==========================================
  // SAVE PAYMENT
  // ==========================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.project) {
      alert("Please select a project.");
      return;
    }

    if (!form.title.trim()) {
      alert("Please enter a payment title.");
      return;
    }

    if (
      form.amount === "" ||
      Number(form.amount) < 0
    ) {
      alert("Please enter a valid payment amount.");
      return;
    }

    try {
      setSaving(true);

      const url = editingPayment
        ? `${API_URL}/incoming-payments/${editingPayment._id}`
        : `${API_URL}/incoming-payments`;

      const method = editingPayment
        ? "PUT"
        : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },

        body: JSON.stringify({
          project: form.project,
          title: form.title,
          amount: Number(form.amount),
          date: form.date,
          paymentMethod: form.paymentMethod,
          notes: form.notes,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to save incoming payment"
        );
      }

      await loadPayments();

      closeForm();
    } catch (error) {
      console.error(
        "SAVE INCOMING PAYMENT ERROR:",
        error
      );

      alert(
        error.message ||
          "Failed to save incoming payment."
      );
    } finally {
      setSaving(false);
    }
  };

  // ==========================================
  // DELETE PAYMENT
  // ==========================================

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this incoming payment?"
    );

    if (!confirmed) return;

    try {
      const response = await fetch(
        `${API_URL}/incoming-payments/${id}`,
        {
          method: "DELETE",

          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to delete incoming payment"
        );
      }

      await loadPayments();
    } catch (error) {
      console.error(
        "DELETE INCOMING PAYMENT ERROR:",
        error
      );

      alert(
        error.message ||
          "Failed to delete incoming payment."
      );
    }
  };

  // ==========================================
  // FILTER PAYMENTS
  // ==========================================

  const filteredPayments = useMemo(() => {
    return payments.filter((payment) => {
      const matchesProject =
        !filterProject ||
        payment.project?._id === filterProject ||
        payment.project === filterProject;

      const searchText = search.toLowerCase();

      const matchesSearch =
        !searchText ||
        payment.title
          ?.toLowerCase()
          .includes(searchText) ||
        payment.paymentMethod
          ?.toLowerCase()
          .includes(searchText) ||
        payment.notes
          ?.toLowerCase()
          .includes(searchText) ||
        payment.project?.name
          ?.toLowerCase()
          .includes(searchText);

      return (
        matchesProject &&
        matchesSearch
      );
    });
  }, [payments, filterProject, search]);

  // ==========================================
  // STATISTICS
  // ==========================================

  const totalPayments = filteredPayments.reduce(
    (total, payment) =>
      total + Number(payment.amount || 0),
    0
  );

  const currentMonthPayments =
    filteredPayments
      .filter((payment) => {
        const paymentDate = new Date(
          payment.date
        );

        const now = new Date();

        return (
          paymentDate.getMonth() ===
            now.getMonth() &&
          paymentDate.getFullYear() ===
            now.getFullYear()
        );
      })
      .reduce(
        (total, payment) =>
          total +
          Number(payment.amount || 0),
        0
      );

  const paymentCount =
    filteredPayments.length;

  // ==========================================
  // FORMAT CURRENCY
  // ==========================================

  const formatCurrency = (amount) => {
    return `Rs. ${Number(
      amount || 0
    ).toLocaleString()}`;
  };

  // ==========================================
  // FORMAT DATE
  // ==========================================

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(
      date
    ).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">

        {/* ===================================== */}
        {/* HEADER */}
        {/* ===================================== */}

        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

          <div>
            <div className="mb-2 flex items-center gap-3">

              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-100">
                <CircleDollarSign
                  size={22}
                  className="text-emerald-600"
                />
              </div>

              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600">
                FINANCIAL MANAGEMENT
              </span>

            </div>

            <h1 className="text-4xl font-bold tracking-tight text-slate-900">
              Incoming Payments
            </h1>

            <p className="mt-2 text-slate-500">
              Record payments received from
              clients and keep track of project
              income.
            </p>
          </div>

          <button
            onClick={openAddForm}
            className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 font-semibold text-white shadow-lg shadow-emerald-200 transition hover:bg-emerald-700"
          >
            <Plus size={20} />
            Add Payment
          </button>

        </div>

        {/* ===================================== */}
        {/* STAT CARDS */}
        {/* ===================================== */}

        <div className="grid gap-5 md:grid-cols-3">

          {/* TOTAL */}

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-sm font-medium text-slate-500">
                  Total Incoming
                </p>

                <h2 className="mt-2 text-3xl font-bold text-slate-900">
                  {formatCurrency(
                    totalPayments
                  )}
                </h2>

              </div>

              <div className="rounded-xl bg-emerald-50 p-3">

                <CircleDollarSign
                  size={23}
                  className="text-emerald-600"
                />

              </div>

            </div>

          </div>

          {/* THIS MONTH */}

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-sm font-medium text-slate-500">
                  This Month
                </p>

                <h2 className="mt-2 text-3xl font-bold text-slate-900">
                  {formatCurrency(
                    currentMonthPayments
                  )}
                </h2>

              </div>

              <div className="rounded-xl bg-blue-50 p-3">

                <CalendarDays
                  size={23}
                  className="text-blue-600"
                />

              </div>

            </div>

          </div>

          {/* PAYMENT ENTRIES */}

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-sm font-medium text-slate-500">
                  Payment Entries
                </p>

                <h2 className="mt-2 text-3xl font-bold text-slate-900">
                  {paymentCount}
                </h2>

              </div>

              <div className="rounded-xl bg-purple-50 p-3">

                <Receipt
                  size={23}
                  className="text-purple-600"
                />

              </div>

            </div>

          </div>

        </div>

        {/* ===================================== */}
        {/* FILTERS */}
        {/* ===================================== */}

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

          <div className="grid gap-4 md:grid-cols-2">

            <input
              type="text"
              placeholder="Search payments..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              className="rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            />

            <select
              value={filterProject}
              onChange={(e) =>
                setFilterProject(
                  e.target.value
                )
              }
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            >

              <option value="">
                All Projects
              </option>

              {projects.map((project) => (

                <option
                  key={project._id}
                  value={project._id}
                >
                  {project.name}
                </option>

              ))}

            </select>

          </div>

        </div>

        {/* ===================================== */}
        {/* PAYMENT TABLE */}
        {/* ===================================== */}

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          <div className="border-b border-slate-200 px-6 py-5">

            <h2 className="text-xl font-bold text-slate-900">
              Payment Records
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Payments entered here represent
              money received from clients.
            </p>

          </div>

          {loading ? (

            <div className="p-10 text-center text-slate-500">
              Loading incoming payments...
            </div>

          ) : filteredPayments.length ===
            0 ? (

            <div className="p-12 text-center">

              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">

                <CircleDollarSign
                  size={26}
                  className="text-slate-400"
                />

              </div>

              <h3 className="text-lg font-semibold text-slate-800">
                No incoming payments found
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Start recording payments received
                for your projects.
              </p>

              <button
                onClick={openAddForm}
                className="mt-5 rounded-xl bg-emerald-600 px-5 py-2.5 font-semibold text-white hover:bg-emerald-700"
              >
                Add First Payment
              </button>

            </div>

          ) : (

            <div className="overflow-x-auto">

              <table className="w-full min-w-[900px]">

                <thead>

                  <tr className="border-b border-slate-200 bg-slate-50 text-left text-sm text-slate-500">

                    <th className="px-6 py-4 font-semibold">
                      Date
                    </th>

                    <th className="px-6 py-4 font-semibold">
                      Payment
                    </th>

                    <th className="px-6 py-4 font-semibold">
                      Project
                    </th>

                    <th className="px-6 py-4 font-semibold">
                      Method
                    </th>

                    <th className="px-6 py-4 font-semibold">
                      Amount
                    </th>

                    <th className="px-6 py-4 text-right font-semibold">
                      Actions
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {filteredPayments.map(
                    (payment) => (

                      <tr
                        key={payment._id}
                        className="border-b border-slate-100 transition hover:bg-slate-50"
                      >

                        <td className="px-6 py-4 text-sm text-slate-600">
                          {formatDate(
                            payment.date
                          )}
                        </td>

                        <td className="px-6 py-4">

                          <p className="font-semibold text-slate-900">
                            {payment.title}
                          </p>

                          {payment.notes && (
                            <p className="mt-1 max-w-xs truncate text-xs text-slate-400">
                              {payment.notes}
                            </p>
                          )}

                        </td>

                        <td className="px-6 py-4 text-sm font-medium text-slate-700">
                          {payment.project?.name ||
                            "Unknown Project"}
                        </td>

                        <td className="px-6 py-4">

                          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">

                            <CreditCard
                              size={13}
                            />

                            {payment.paymentMethod}

                          </span>

                        </td>

                        <td className="px-6 py-4 text-sm font-bold text-emerald-600">
                          {formatCurrency(
                            payment.amount
                          )}
                        </td>

                        <td className="px-6 py-4">

                          <div className="flex justify-end gap-2">

                            <button
                              onClick={() =>
                                openEditForm(
                                  payment
                                )
                              }
                              className="rounded-lg p-2 text-slate-500 transition hover:bg-blue-50 hover:text-blue-600"
                              title="Edit payment"
                            >
                              <Pencil
                                size={18}
                              />
                            </button>

                            <button
                              onClick={() =>
                                handleDelete(
                                  payment._id
                                )
                              }
                              className="rounded-lg p-2 text-slate-500 transition hover:bg-red-50 hover:text-red-600"
                              title="Delete payment"
                            >
                              <Trash2
                                size={18}
                              />
                            </button>

                          </div>

                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            </div>

          )}

        </div>

      </div>

      {/* ======================================= */}
      {/* ADD / EDIT MODAL */}
      {/* ======================================= */}

      {showForm && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">

          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white shadow-2xl">

            {/* MODAL HEADER */}

            <div className="flex items-center justify-between border-b border-slate-200 px-7 py-5">

              <div>

                <h2 className="text-2xl font-bold text-slate-900">
                  {editingPayment
                    ? "Edit Incoming Payment"
                    : "Add Incoming Payment"}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Record money received from a
                  client for a project.
                </p>

              </div>

              <button
                onClick={closeForm}
                className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={22} />
              </button>

            </div>

            {/* FORM */}

            <form
              onSubmit={handleSubmit}
              className="space-y-5 p-7"
            >

              {/* PROJECT */}

              <div>

                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Project
                </label>

                <select
                  name="project"
                  value={form.project}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                >

                  <option value="">
                    Select Project
                  </option>

                  {projects.map(
                    (project) => (

                      <option
                        key={project._id}
                        value={project._id}
                      >
                        {project.name}
                      </option>

                    )
                  )}

                </select>

              </div>

              {/* TITLE */}

              <div>

                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Payment Title
                </label>

                <input
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="e.g. Client Advance"
                  required
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                />

              </div>

              {/* AMOUNT + METHOD */}

              <div className="grid gap-5 md:grid-cols-2">

                <div>

                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Amount (PKR)
                  </label>

                  <input
                    type="number"
                    name="amount"
                    value={form.amount}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    placeholder="0"
                    required
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  />

                </div>

                <div>

                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Payment Method
                  </label>

                  <select
                    name="paymentMethod"
                    value={
                      form.paymentMethod
                    }
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  >

                    {paymentMethods.map(
                      (method) => (

                        <option
                          key={method}
                          value={method}
                        >
                          {method}
                        </option>

                      )
                    )}

                  </select>

                </div>

              </div>

              {/* DATE */}

              <div>

                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Payment Date
                </label>

                <input
                  type="date"
                  name="date"
                  value={form.date}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                />

              </div>

              {/* NOTES */}

              <div>

                <label className="mb-2 block text-sm font-semibold text-slate-700">

                  Notes

                  <span className="ml-1 font-normal text-slate-400">
                    (Optional)
                  </span>

                </label>

                <textarea
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Add any additional details..."
                  className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                />

              </div>

              {/* ACTIONS */}

              <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">

                <button
                  type="button"
                  onClick={closeForm}
                  disabled={saving}
                  className="rounded-xl border border-slate-200 px-5 py-3 font-semibold text-slate-600 transition hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-emerald-600 px-6 py-3 font-semibold text-white shadow-lg shadow-emerald-200 transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving
                    ? "Saving..."
                    : editingPayment
                    ? "Update Payment"
                    : "Save Payment"}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </DashboardLayout>
  );
}



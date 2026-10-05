import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { getProjects } from "../services/projectService";
import {
  Plus,
  Trash2,
  Pencil,
  X,
  Wallet,
  CalendarDays,
  Receipt,
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

const categories = [
  "Transport",
  "Equipment",
  "Labor",
  "Utilities",
  "Supplies",
  "Miscellaneous",
  "Other",
];

const emptyForm = {
  project: "",
  title: "",
  category: "Other",
  amount: "",
  date: new Date().toISOString().split("T")[0],
  notes: "",
};

export default function Expenses() {
  const [projects, setProjects] = useState([]);
  const [expenses, setExpenses] = useState([]);

  const [showForm, setShowForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);

  const [form, setForm] = useState(emptyForm);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [filterProject, setFilterProject] = useState("");
  const [search, setSearch] = useState("");

  const token = localStorage.getItem("token");

  // ==========================================
  // LOAD PROJECTS
  // ==========================================

  useEffect(() => {
    loadProjects();
    loadExpenses();
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

  // ==========================================
  // LOAD EXPENSES
  // ==========================================

  const loadExpenses = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        `${API_URL}/expenses`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load expenses");
      }

      setExpenses(data.expenses || []);
    } catch (error) {
      console.error("Failed to load expenses:", error);
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
    setEditingExpense(null);

    setForm({
      ...emptyForm,
      project: filterProject || "",
    });

    setShowForm(true);
  };

  const openEditForm = (expense) => {
    setEditingExpense(expense);

    setForm({
      project: expense.project?._id || expense.project || "",
      title: expense.title || "",
      category: expense.category || "Other",
      amount: expense.amount || "",
      date: expense.date
        ? new Date(expense.date).toISOString().split("T")[0]
        : "",
      notes: expense.notes || "",
    });

    setShowForm(true);
  };

  const closeForm = () => {
    if (saving) return;

    setShowForm(false);
    setEditingExpense(null);
    setForm(emptyForm);
  };

  // ==========================================
  // SAVE EXPENSE
  // ==========================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.project) {
      alert("Please select a project.");
      return;
    }

    if (!form.title.trim()) {
      alert("Please enter an expense title.");
      return;
    }

    if (!form.amount || Number(form.amount) < 0) {
      alert("Please enter a valid amount.");
      return;
    }

    try {
      setSaving(true);

      const url = editingExpense
        ? `${API_URL}/expenses/${editingExpense._id}`
        : `${API_URL}/expenses`;

      const method = editingExpense ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          project: form.project,
          title: form.title,
          category: form.category,
          amount: Number(form.amount),
          date: form.date,
          notes: form.notes,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to save expense"
        );
      }

      await loadExpenses();

      closeForm();
    } catch (error) {
      console.error("SAVE EXPENSE ERROR:", error);

      alert(error.message || "Failed to save expense.");
    } finally {
      setSaving(false);
    }
  };

  // ==========================================
  // DELETE EXPENSE
  // ==========================================

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this expense?"
    );

    if (!confirmed) return;

    try {
      const response = await fetch(
        `${API_URL}/expenses/${id}`,
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
          data.message || "Failed to delete expense"
        );
      }

      await loadExpenses();
    } catch (error) {
      console.error("DELETE EXPENSE ERROR:", error);

      alert(error.message || "Failed to delete expense.");
    }
  };

  // ==========================================
  // FILTERED EXPENSES
  // ==========================================

  const filteredExpenses = useMemo(() => {
    return expenses.filter((expense) => {
      const matchesProject =
        !filterProject ||
        expense.project?._id === filterProject ||
        expense.project === filterProject;

      const searchText = search.toLowerCase();

      const matchesSearch =
        !searchText ||
        expense.title?.toLowerCase().includes(searchText) ||
        expense.category?.toLowerCase().includes(searchText) ||
        expense.notes?.toLowerCase().includes(searchText) ||
        expense.project?.name?.toLowerCase().includes(searchText);

      return matchesProject && matchesSearch;
    });
  }, [expenses, filterProject, search]);

  // ==========================================
  // STATISTICS
  // ==========================================

  const totalExpenses = filteredExpenses.reduce(
    (total, expense) =>
      total + Number(expense.amount || 0),
    0
  );

  const currentMonthExpenses = filteredExpenses
    .filter((expense) => {
      const expenseDate = new Date(expense.date);
      const now = new Date();

      return (
        expenseDate.getMonth() === now.getMonth() &&
        expenseDate.getFullYear() === now.getFullYear()
      );
    })
    .reduce(
      (total, expense) =>
        total + Number(expense.amount || 0),
      0
    );

  const expenseCount = filteredExpenses.length;

  // ==========================================
  // FORMAT CURRENCY
  // ==========================================

  const formatCurrency = (amount) => {
    return `Rs. ${Number(amount || 0).toLocaleString()}`;
  };

  // ==========================================
  // FORMAT DATE
  // ==========================================

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString(
      "en-GB",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
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
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-100">
                <Wallet
                  size={22}
                  className="text-blue-600"
                />
              </div>

              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">
                FINANCIAL MANAGEMENT
              </span>
            </div>

            <h1 className="text-4xl font-bold tracking-tight text-slate-900">
              Daily Expenses
            </h1>

            <p className="mt-2 text-slate-500">
              Track daily project expenses and keep your
              project costs under control.
            </p>
          </div>

          <button
            onClick={openAddForm}
            className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700"
          >
            <Plus size={20} />
            Add Expense
          </button>

        </div>

        {/* ===================================== */}
        {/* STAT CARDS */}
        {/* ===================================== */}

        <div className="grid gap-5 md:grid-cols-3">

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm font-medium text-slate-500">
                  Total Expenses
                </p>

                <h2 className="mt-2 text-3xl font-bold text-slate-900">
                  {formatCurrency(totalExpenses)}
                </h2>
              </div>

              <div className="rounded-xl bg-blue-50 p-3">
                <Wallet
                  size={23}
                  className="text-blue-600"
                />
              </div>

            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm font-medium text-slate-500">
                  This Month
                </p>

                <h2 className="mt-2 text-3xl font-bold text-slate-900">
                  {formatCurrency(currentMonthExpenses)}
                </h2>
              </div>

              <div className="rounded-xl bg-orange-50 p-3">
                <CalendarDays
                  size={23}
                  className="text-orange-600"
                />
              </div>

            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm font-medium text-slate-500">
                  Expense Entries
                </p>

                <h2 className="mt-2 text-3xl font-bold text-slate-900">
                  {expenseCount}
                </h2>
              </div>

              <div className="rounded-xl bg-green-50 p-3">
                <Receipt
                  size={23}
                  className="text-green-600"
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
              placeholder="Search expenses..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />

            <select
              value={filterProject}
              onChange={(e) =>
                setFilterProject(e.target.value)
              }
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
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
        {/* EXPENSE TABLE */}
        {/* ===================================== */}

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          <div className="border-b border-slate-200 px-6 py-5">
            <h2 className="text-xl font-bold text-slate-900">
              Expense Records
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Every expense recorded here is automatically
              included in the project's ROI calculation.
            </p>
          </div>

          {loading ? (
            <div className="p-10 text-center text-slate-500">
              Loading expenses...
            </div>
          ) : filteredExpenses.length === 0 ? (
            <div className="p-12 text-center">

              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
                <Receipt
                  size={26}
                  className="text-slate-400"
                />
              </div>

              <h3 className="text-lg font-semibold text-slate-800">
                No expenses found
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Start recording your project's daily expenses.
              </p>

              <button
                onClick={openAddForm}
                className="mt-5 rounded-xl bg-blue-600 px-5 py-2.5 font-semibold text-white hover:bg-blue-700"
              >
                Add First Expense
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
                      Expense
                    </th>

                    <th className="px-6 py-4 font-semibold">
                      Project
                    </th>

                    <th className="px-6 py-4 font-semibold">
                      Category
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

                  {filteredExpenses.map((expense) => (

                    <tr
                      key={expense._id}
                      className="border-b border-slate-100 transition hover:bg-slate-50"
                    >

                      <td className="px-6 py-4 text-sm text-slate-600">
                        {formatDate(expense.date)}
                      </td>

                      <td className="px-6 py-4">

                        <p className="font-semibold text-slate-900">
                          {expense.title}
                        </p>

                        {expense.notes && (
                          <p className="mt-1 max-w-xs truncate text-xs text-slate-400">
                            {expense.notes}
                          </p>
                        )}

                      </td>

                      <td className="px-6 py-4 text-sm font-medium text-slate-700">
                        {expense.project?.name || "Unknown Project"}
                      </td>

                      <td className="px-6 py-4">

                        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">
                          {expense.category}
                        </span>

                      </td>

                      <td className="px-6 py-4 text-sm font-bold text-slate-900">
                        {formatCurrency(expense.amount)}
                      </td>

                      <td className="px-6 py-4">

                        <div className="flex justify-end gap-2">

                          <button
                            onClick={() =>
                              openEditForm(expense)
                            }
                            className="rounded-lg p-2 text-slate-500 transition hover:bg-blue-50 hover:text-blue-600"
                            title="Edit expense"
                          >
                            <Pencil size={18} />
                          </button>

                          <button
                            onClick={() =>
                              handleDelete(expense._id)
                            }
                            className="rounded-lg p-2 text-slate-500 transition hover:bg-red-50 hover:text-red-600"
                            title="Delete expense"
                          >
                            <Trash2 size={18} />
                          </button>

                        </div>

                      </td>

                    </tr>

                  ))}

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
                  {editingExpense
                    ? "Edit Expense"
                    : "Add Daily Expense"}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Record an expense against a project.
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
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="">
                    Select Project
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

              {/* TITLE */}

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Expense Title
                </label>

                <input
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="e.g. Cement delivery"
                  required
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* CATEGORY + AMOUNT */}

              <div className="grid gap-5 md:grid-cols-2">

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Category
                  </label>

                  <select
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    {categories.map((category) => (
                      <option
                        key={category}
                        value={category}
                      >
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

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
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

              </div>

              {/* DATE */}

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Expense Date
                </label>

                <input
                  type="date"
                  name="date"
                  value={form.date}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
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
                  className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
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
                  className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving
                    ? "Saving..."
                    : editingExpense
                    ? "Update Expense"
                    : "Save Expense"}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </DashboardLayout>
  );
}

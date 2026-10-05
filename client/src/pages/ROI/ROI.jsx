import { useEffect, useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { getProjects } from "../services/projectService";
import {
  TrendingUp,
  Wallet,
  Package,
  Users,
  Receipt,
  Target,
  AlertTriangle,
  Activity,
  Calculator,
  PiggyBank,
  CircleDollarSign,
} from "lucide-react";

export default function ROI() {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState("");
  const [roiData, setRoiData] = useState(null);
  const [totalPaymentReceived, setTotalPaymentReceived] = useState(0);

  const [loading, setLoading] = useState(false);
  const [projectsLoading, setProjectsLoading] = useState(true);

  const currentYear = new Date().getFullYear();

  // ==========================================
  // LOAD PROJECTS
  // ==========================================

  useEffect(() => {
    const loadProjects = async () => {
      try {
        setProjectsLoading(true);

        const data = await getProjects();

        const currentYearProjects = (data.projects || []).filter(
          (project) => project.year === currentYear
        );

        setProjects(currentYearProjects);
      } catch (error) {
        console.error("Failed to load projects:", error);
      } finally {
        setProjectsLoading(false);
      }
    };

    loadProjects();
  }, [currentYear]);

  // ==========================================
  // LOAD ROI
  // ==========================================

  const loadROI = async (projectId) => {
    if (!projectId) {
      setRoiData(null);
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/roi/${projectId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to calculate ROI");
      }

      setRoiData(data);
    } catch (error) {
      console.error("ROI ERROR:", error);
      setRoiData(null);
    } finally {
      setLoading(false);
    }
  };


  const loadIncomingPayments = async (projectId) => {
  if (!projectId) {
    setTotalPaymentReceived(0);
    return;
  }

  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/incoming-payments?projectId=${projectId}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || "Failed to fetch incoming payments"
      );
    }

    const total = (data.payments || []).reduce(
      (sum, payment) => sum + Number(payment.amount || 0),
      0
    );

    setTotalPaymentReceived(total);
  } catch (error) {
    console.error("INCOMING PAYMENTS ERROR:", error);
    setTotalPaymentReceived(0);
  }
};

  // ==========================================
  // FORMAT MONEY
  // ==========================================

  const money = (value) =>
    `Rs. ${Number(value || 0).toLocaleString()}`;

  // ==========================================
  // RISK COLORS
  // ==========================================

  const getRiskClasses = () => {
    if (roiData?.risk === "CRITICAL") {
      return "bg-red-700";
    }

    if (roiData?.risk === "HIGH") {
      return "bg-orange-600";
    }

    if (roiData?.risk === "MEDIUM") {
      return "bg-yellow-500";
    }

    return "bg-green-600";
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">

        {/* ===================================== */}
        {/* HEADER */}
        {/* ===================================== */}

        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">

          <div>
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-100">
                <TrendingUp
                  size={23}
                  className="text-blue-600"
                />
              </div>

              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">
                FINANCIAL INTELLIGENCE
              </span>
            </div>

            <h1 className="text-4xl font-bold tracking-tight text-slate-900">
              Project ROI
            </h1>

            <p className="mt-2 text-slate-500">
              Analyze project profitability, spending,
              budget utilization and cost risk.
            </p>
          </div>

          {/* PROJECT SELECTOR */}

          <div className="w-full lg:w-80">

            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Analyze Project
            </label>

            <select
              value={selectedProject}
              onChange={(e) => {
  const projectId = e.target.value;

  setSelectedProject(projectId);

  loadROI(projectId);
  loadIncomingPayments(projectId);
}}
              disabled={projectsLoading}
              className="w-full rounded-xl border border-slate-200 bg-white px-5 py-3.5 font-medium text-slate-800 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:opacity-60"
            >
              <option value="">
                {projectsLoading
                  ? "Loading projects..."
                  : "Select Project"}
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
        {/* EMPTY STATE */}
        {/* ===================================== */}

        {!selectedProject && !loading && (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-20 text-center shadow-sm">

            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50">
              <TrendingUp
                size={30}
                className="text-blue-600"
              />
            </div>

            <h2 className="text-2xl font-bold text-slate-900">
              Select a project
            </h2>

            <p className="mx-auto mt-2 max-w-lg text-slate-500">
              Choose a project above to view its financial
              performance, current spending, remaining
              budget and projected costs.
            </p>

          </div>
        )}

        {/* ===================================== */}
        {/* LOADING */}
        {/* ===================================== */}

        {loading && (
          <div className="rounded-3xl bg-white p-16 text-center shadow-sm">

            <div className="mx-auto mb-5 h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

            <h2 className="text-lg font-semibold text-slate-800">
              Calculating project ROI...
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Analyzing materials, workers and daily expenses.
            </p>

          </div>
        )}

        {/* ===================================== */}
        {/* ROI DATA */}
        {/* ===================================== */}

        {roiData && !loading && (
          <>
            {/* ================================= */}
            {/* FINANCIAL OVERVIEW */}
            {/* ================================= */}

            <div>
              <div className="mb-4">
                <h2 className="text-xl font-bold text-slate-900">
                  Financial Overview
                </h2>

                <p className="text-sm text-slate-500">
                  Current financial position of{" "}
                  <span className="font-semibold">
                    {roiData.project}
                  </span>
                </p>
              </div>

              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">

                {/* REVENUE */}

                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex items-start justify-between">

                    <div>
                      <p className="text-sm font-medium text-slate-500">
                        Project Budget
                      </p>

                      <h2 className="mt-2 text-2xl font-bold text-slate-900">
                        {money(roiData.revenue)}
                      </h2>
                    </div>

                    <div className="rounded-xl bg-blue-50 p-3">
                      <Wallet
                        size={21}
                        className="text-blue-600"
                      />
                    </div>

                  </div>
                </div>

                {/* MATERIAL */}

                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex items-start justify-between">

                    <div>
                      <p className="text-sm font-medium text-slate-500">
                        Material Cost
                      </p>

                      <h2 className="mt-2 text-2xl font-bold text-orange-600">
                        {money(roiData.materialCost)}
                      </h2>
                    </div>

                    <div className="rounded-xl bg-orange-50 p-3">
                      <Package
                        size={21}
                        className="text-orange-600"
                      />
                    </div>

                  </div>
                </div>

                {/* WORKER */}

                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex items-start justify-between">

                    <div>
                      <p className="text-sm font-medium text-slate-500">
                        Worker Cost
                      </p>

                      <h2 className="mt-2 text-2xl font-bold text-red-600">
                        {money(roiData.workerCost)}
                      </h2>
                    </div>

                    <div className="rounded-xl bg-red-50 p-3">
                      <Users
                        size={21}
                        className="text-red-600"
                      />
                    </div>

                  </div>
                </div>

                {/* DAILY EXPENSES */}

                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex items-start justify-between">

                    <div>
                      <p className="text-sm font-medium text-slate-500">
                        Daily Expenses
                      </p>

                      <h2 className="mt-2 text-2xl font-bold text-purple-600">
                        {money(roiData.dailyExpenseCost)}
                      </h2>
                    </div>

                    <div className="rounded-xl bg-purple-50 p-3">
                      <Receipt
                        size={21}
                        className="text-purple-600"
                      />
                    </div>

                  </div>

                  <p className="mt-3 text-xs text-slate-400">
                    Transport, equipment, supplies and other
                    recorded expenses
                  </p>

                </div>

                {/* TOTAL PAYMENT RECEIVED */}

<div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
  <div className="flex items-start justify-between">

    <div>
      <p className="text-sm font-medium text-slate-500">
        Total Payment Received
      </p>

      <h2 className="mt-2 text-2xl font-bold text-green-600">
        {money(totalPaymentReceived)}
      </h2>
    </div>

    <div className="rounded-xl bg-green-50 p-3">
      <CircleDollarSign
        size={21}
        className="text-green-600"
      />
    </div>

  </div>

  <p className="mt-3 text-xs text-slate-400">
    Manually recorded payments received for this project
  </p>

</div>

              </div>
            </div>

            {/* ================================= */}
            {/* BUDGET POSITION */}
            {/* ================================= */}

            <div>
              <div className="mb-4">
                <h2 className="text-xl font-bold text-slate-900">
                  Budget Position
                </h2>

                <p className="text-sm text-slate-500">
                  How much of the project budget has been
                  consumed.
                </p>
              </div>

              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">

                {/* TOTAL COST */}

                <div className="rounded-2xl bg-slate-900 p-6 text-white shadow-lg">

                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-white/10 p-2.5">
                      <Calculator size={21} />
                    </div>

                    <p className="text-sm text-slate-300">
                      Total Cost
                    </p>
                  </div>

                  <h2 className="mt-5 text-3xl font-bold">
                    {money(roiData.totalCost)}
                  </h2>

                  <p className="mt-2 text-xs text-slate-400">
                    Materials + workers + daily expenses
                  </p>

                </div>

                {/* REMAINING BUDGET */}

                <div className="rounded-2xl bg-green-600 p-6 text-white shadow-lg">

                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-white/15 p-2.5">
                      <PiggyBank size={21} />
                    </div>

                    <p className="text-sm text-green-100">
                      Remaining Budget
                    </p>
                  </div>

                  <h2 className="mt-5 text-3xl font-bold">
                    {money(roiData.remainingBudget)}
                  </h2>

                  <p className="mt-2 text-xs text-green-100">
                    Budget remaining after recorded costs
                  </p>

                </div>

                {/* PROFIT */}

                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-green-50 p-2.5">
                      <TrendingUp
                        size={21}
                        className="text-green-600"
                      />
                    </div>

                    <p className="text-sm font-medium text-slate-500">
                      Current Profit
                    </p>
                  </div>

                  <h2 className="mt-5 text-3xl font-bold text-green-600">
                    {money(roiData.profit)}
                  </h2>

                </div>

                {/* ROI */}

                <div className="rounded-2xl bg-blue-600 p-6 text-white shadow-lg">

                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-white/15 p-2.5">
                      <TrendingUp size={21} />
                    </div>

                    <p className="text-sm text-blue-100">
                      Return on Investment
                    </p>
                  </div>

                  <h2 className="mt-5 text-4xl font-bold">
                    {roiData.roi}%
                  </h2>

                </div>

              </div>
            </div>

            {/* ================================= */}
            {/* PROJECT PERFORMANCE */}
            {/* ================================= */}

            <div>
              <div className="mb-4">
                <h2 className="text-xl font-bold text-slate-900">
                  Project Performance
                </h2>

                <p className="text-sm text-slate-500">
                  Progress and spending efficiency.
                </p>
              </div>

              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">

                {/* PROGRESS */}

                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-slate-500">
                      Project Progress
                    </p>

                    <Activity
                      size={20}
                      className="text-blue-600"
                    />
                  </div>

                  <h2 className="mt-3 text-3xl font-bold text-blue-600">
                    {roiData.progress}%
                  </h2>

                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-blue-600 transition-all"
                      style={{
                        width: `${Math.min(
                          Math.max(roiData.progress, 0),
                          100
                        )}%`,
                      }}
                    />
                  </div>

                </div>

                {/* BUDGET USED */}

                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-slate-500">
                      Budget Used
                    </p>

                    <Wallet
                      size={20}
                      className="text-slate-600"
                    />
                  </div>

                  <h2 className="mt-3 text-3xl font-bold text-slate-900">
                    {roiData.budgetUsed}%
                  </h2>

                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-slate-800 transition-all"
                      style={{
                        width: `${Math.min(
                          Math.max(roiData.budgetUsed, 0),
                          100
                        )}%`,
                      }}
                    />
                  </div>

                </div>

                {/* EXPECTED COST */}

                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-slate-500">
                      Expected Cost
                    </p>

                    <Target
                      size={20}
                      className="text-purple-600"
                    />
                  </div>

                  <h2 className="mt-3 text-2xl font-bold text-slate-900">
                    {money(roiData.expectedCost)}
                  </h2>

                  <p className="mt-2 text-xs text-slate-400">
                    Based on current project progress
                  </p>

                </div>

                {/* COST VARIANCE */}

                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-slate-500">
                      Cost Variance
                    </p>

                    <Activity
                      size={20}
                      className={
                        roiData.costVariance > 0
                          ? "text-red-600"
                          : "text-green-600"
                      }
                    />
                  </div>

                  <h2
                    className={`mt-3 text-2xl font-bold ${
                      roiData.costVariance > 0
                        ? "text-red-600"
                        : "text-green-600"
                    }`}
                  >
                    {money(roiData.costVariance)}
                  </h2>

                  <p className="mt-2 text-xs text-slate-400">
                    Compared with expected spending
                  </p>

                </div>

              </div>
            </div>

            {/* ================================= */}
            {/* FORECAST */}
            {/* ================================= */}

            <div>
              <div className="mb-4">
                <h2 className="text-xl font-bold text-slate-900">
                  Cost Forecast
                </h2>

                <p className="text-sm text-slate-500">
                  Estimated final financial position.
                </p>
              </div>

              <div className="grid gap-5 md:grid-cols-3">

                {/* PROJECTED FINAL COST */}

                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                  <p className="text-sm font-medium text-slate-500">
                    Projected Final Cost
                  </p>

                  <h2 className="mt-3 text-3xl font-bold text-slate-900">
                    {money(roiData.projectedFinalCost)}
                  </h2>

                  <p className="mt-2 text-xs text-slate-400">
                    Based on current spending rate
                  </p>

                </div>

                {/* VARIANCE % */}

                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                  <p className="text-sm font-medium text-slate-500">
                    Cost Variance %
                  </p>

                  <h2
                    className={`mt-3 text-3xl font-bold ${
                      roiData.variancePercentage > 0
                        ? "text-red-600"
                        : "text-green-600"
                    }`}
                  >
                    {roiData.variancePercentage}%
                  </h2>

                  <p className="mt-2 text-xs text-slate-400">
                    Difference from expected spending
                  </p>

                </div>

                {/* RISK */}

                <div
                  className={`rounded-2xl p-6 text-white shadow-lg ${getRiskClasses()}`}
                >

                  <div className="flex items-center gap-3">
                    <AlertTriangle size={21} />

                    <p className="text-sm opacity-90">
                      Cost Risk
                    </p>
                  </div>

                  <h2 className="mt-4 text-4xl font-bold">
                    {roiData.risk}
                  </h2>

                  <p className="mt-2 text-sm opacity-80">
                    Current project cost risk level
                  </p>

                </div>

              </div>
            </div>

            {/* ================================= */}
            {/* POTENTIAL OVERRUN */}
            {/* ================================= */}

            {roiData.potentialOverrun > 0 && (
              <div className="rounded-3xl border border-red-200 bg-red-50 p-7">

                <div className="flex items-start gap-4">

                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-100">
                    <AlertTriangle
                      size={22}
                      className="text-red-600"
                    />
                  </div>

                  <div>
                    <h2 className="text-2xl font-bold text-red-700">
                      Potential Cost Overrun
                    </h2>

                    <p className="mt-2 text-slate-700">
                      This project is currently{" "}
                      <strong>
                        {roiData.progress}%
                      </strong>{" "}
                      complete but has consumed{" "}
                      <strong>
                        {roiData.budgetUsed}%
                      </strong>{" "}
                      of its budget.
                    </p>
                  </div>

                </div>

                <div className="mt-7 grid gap-5 md:grid-cols-3">

                  <div className="rounded-2xl bg-white/70 p-5">
                    <p className="text-sm text-slate-500">
                      Current Cost
                    </p>

                    <p className="mt-2 text-xl font-bold text-slate-900">
                      {money(roiData.totalCost)}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-white/70 p-5">
                    <p className="text-sm text-slate-500">
                      Projected Final Cost
                    </p>

                    <p className="mt-2 text-xl font-bold text-slate-900">
                      {money(roiData.projectedFinalCost)}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-white/70 p-5">
                    <p className="text-sm text-slate-500">
                      Potential Overrun
                    </p>

                    <p className="mt-2 text-xl font-bold text-red-600">
                      {money(roiData.potentialOverrun)}
                    </p>
                  </div>

                </div>

              </div>
            )}

          </>
        )}

      </div>
    </DashboardLayout>
  );
}

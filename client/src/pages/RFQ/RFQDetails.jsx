import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

import {
  ArrowLeft,
  ClipboardList,
  Copy,
  ExternalLink,
  Users,
  Package,
  Clock,
  CheckCircle2,
  Mail,
  Phone,
  RefreshCw,
} from "lucide-react";

import DashboardLayout from "../../components/layout/DashboardLayout";
import { getRFQ } from "../services/rfqService";

export default function RFQDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [rfq, setRFQ] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // ============================================================
  // LOAD RFQ
  // ============================================================

  useEffect(() => {
    if (id) {
      loadRFQ();
    }
  }, [id]);

  const loadRFQ = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const data = await getRFQ(id);

      console.log("RFQ DETAILS:", data);

      if (!data?.rfq) {
        throw new Error(
          "RFQ data was not returned."
        );
      }

      setRFQ(data.rfq);

    } catch (error) {
      console.error(
        "GET RFQ ERROR:",
        error
      );

      Swal.fire({
        icon: "error",
        title: "Failed to load RFQ",
        text:
          error.response?.data?.message ||
          error.message ||
          "RFQ could not be loaded.",
      });

    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // ============================================================
  // PUBLIC SUPPLIER LINK
  // ============================================================

  const getSupplierLink = () => {
    if (
      !rfq?._id ||
      !rfq?.publicToken
    ) {
      return "";
    }

    return `${window.location.origin}/rfq/respond/${rfq._id}/${rfq.publicToken}`;
  };

  // ============================================================
  // COPY LINK
  // ============================================================

  const copySupplierLink = async () => {
    const link = getSupplierLink();

    if (!link) {
      Swal.fire({
        icon: "warning",
        title: "Link Unavailable",
        text:
          "This RFQ does not have a public quotation link.",
      });

      return;
    }

    try {
      await navigator.clipboard.writeText(link);

      Swal.fire({
        icon: "success",
        title: "Copied!",
        text:
          "Supplier quotation link copied.",
        timer: 1500,
        showConfirmButton: false,
      });

    } catch (error) {
      console.error(
        "COPY LINK ERROR:",
        error
      );

      Swal.fire({
        icon: "error",
        title: "Copy failed",
        text:
          "Please copy the link manually.",
      });
    }
  };

  // ============================================================
  // OPEN SUPPLIER FORM
  // ============================================================

  const openSupplierForm = () => {
    const link = getSupplierLink();

    if (!link) {
      Swal.fire({
        icon: "warning",
        title: "Link Unavailable",
        text:
          "This RFQ does not have a public quotation link.",
      });

      return;
    }

    window.open(
      link,
      "_blank",
      "noopener,noreferrer"
    );
  };

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <DashboardLayout>

        <div className="flex min-h-[500px] items-center justify-center">

          <div className="text-center">

            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

            <p className="mt-4 font-medium text-slate-600">
              Loading RFQ...
            </p>

          </div>

        </div>

      </DashboardLayout>
    );
  }

  // ============================================================
  // NOT FOUND
  // ============================================================

  if (!rfq) {
    return (
      <DashboardLayout>

        <div className="flex min-h-[500px] items-center justify-center">

          <div className="w-full max-w-lg rounded-3xl bg-white p-10 text-center shadow-sm">

            <ClipboardList
              size={48}
              className="mx-auto text-slate-300"
            />

            <h2 className="mt-5 text-2xl font-bold text-slate-900">
              RFQ not found
            </h2>

            <p className="mt-2 text-slate-500">
              The requested RFQ could not be found.
            </p>

            <button
              onClick={() =>
                navigate("/rfqs")
              }
              className="mt-6 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
            >
              Back to RFQs
            </button>

          </div>

        </div>

      </DashboardLayout>
    );
  }

  // ============================================================
  // DATA
  // ============================================================

  const items = rfq.items || [];

  const responses = rfq.responses || [];

  const supplierLink =
    getSupplierLink();

  // ============================================================
  // PAGE
  // ============================================================

  return (
    <DashboardLayout>

      <div className="space-y-6 pb-10">

        {/* HEADER */}

        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">

          <div className="flex items-center gap-4">

            <button
              onClick={() =>
                navigate("/rfqs")
              }
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-slate-600 shadow-sm transition hover:bg-slate-100"
            >
              <ArrowLeft size={20} />
            </button>

            <div className="flex items-center gap-3">

              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-100 text-blue-600">
                <ClipboardList size={24} />
              </div>

              <div>

                <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">
                  {rfq.title ||
                    "Request for Quotation"}
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                  {rfq.rfqNumber ||
                    "Request for Quotation"}
                </p>

              </div>

            </div>

          </div>

          <span
            className={`w-fit rounded-full px-4 py-2 text-sm font-semibold ${
              rfq.status === "Closed"
                ? "bg-slate-100 text-slate-600"
                : rfq.status === "Awarded"
                ? "bg-blue-100 text-blue-700"
                : rfq.status === "Cancelled"
                ? "bg-red-100 text-red-700"
                : "bg-green-100 text-green-700"
            }`}
          >
            {rfq.status || "Open"}
          </span>

        </div>

        {/* SUPPLIER LINK */}

        <div className="rounded-3xl bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white shadow-xl">

          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">

            <div className="min-w-0 flex-1">

              <div className="flex items-center gap-3">

                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/20">
                  <ExternalLink size={22} />
                </div>

                <div>

                  <h2 className="text-xl font-bold">
                    Supplier Quotation Form
                  </h2>

                  <p className="mt-1 text-sm text-blue-100">
                    Share this link with any supplier.
                  </p>

                </div>

              </div>

              <div className="mt-5 break-all rounded-xl bg-white/10 p-4 text-sm text-blue-50">
                {supplierLink}
              </div>

            </div>

            <div className="flex shrink-0 flex-wrap gap-3">

              <button
                onClick={copySupplierLink}
                className="flex items-center gap-2 rounded-xl bg-white px-5 py-3 font-semibold text-blue-700 transition hover:bg-blue-50"
              >
                <Copy size={18} />
                Copy Link
              </button>

              <button
                onClick={openSupplierForm}
                className="flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-5 py-3 font-semibold text-white transition hover:bg-white/20"
              >
                <ExternalLink size={18} />
                Preview Form
              </button>

            </div>

          </div>

        </div>

        {/* STATISTICS */}

        <div className="grid gap-5 md:grid-cols-3">

          <StatCard
            icon={<Package size={22} />}
            title="Requested Items"
            value={items.length}
          />

          <StatCard
            icon={<Users size={22} />}
            title="Quotations"
            value={responses.length}
          />

          <StatCard
            icon={<CheckCircle2 size={22} />}
            title="Responses"
            value={responses.length}
          />

        </div>

        {/* DEADLINE */}

        <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
            <Clock size={21} />
          </div>

          <div>

            <p className="text-sm text-slate-500">
              Quotation Deadline
            </p>

            <p className="mt-1 font-semibold text-slate-900">
              {rfq.deadline
                ? new Date(
                    rfq.deadline
                  ).toLocaleString()
                : "No deadline specified"}
            </p>

          </div>

        </div>

        {/* DESCRIPTION */}

        {rfq.description && (
          <div className="rounded-3xl bg-white p-7 shadow-sm">

            <h2 className="text-xl font-bold text-slate-900">
              Request Description
            </h2>

            <p className="mt-3 leading-7 text-slate-600">
              {rfq.description}
            </p>

          </div>
        )}

        {/* REQUESTED ITEMS */}

        <div className="rounded-3xl bg-white p-7 shadow-sm">

          <div className="flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Package size={20} />
            </div>

            <div>

              <h2 className="text-xl font-bold text-slate-900">
                Requested Items
              </h2>

              <p className="text-sm text-slate-500">
                Materials or services requested from suppliers.
              </p>

            </div>

          </div>

          <div className="mt-6 overflow-x-auto">

            <table className="w-full text-left">

              <thead>

                <tr className="border-b border-slate-200 text-sm text-slate-500">

                  <th className="px-4 py-3">
                    #
                  </th>

                  <th className="px-4 py-3">
                    Item
                  </th>

                  <th className="px-4 py-3">
                    Quantity
                  </th>

                  <th className="px-4 py-3">
                    Unit
                  </th>

                </tr>

              </thead>

              <tbody>

                {items.map(
                  (item, index) => (

                    <tr
                      key={
                        item._id ||
                        index
                      }
                      className="border-b border-slate-100 last:border-0"
                    >

                      <td className="px-4 py-4 text-slate-400">
                        {index + 1}
                      </td>

                      <td className="px-4 py-4 font-semibold text-slate-800">
                        {item.name}
                      </td>

                      <td className="px-4 py-4 text-slate-600">
                        {item.quantity}
                      </td>

                      <td className="px-4 py-4 text-slate-600">
                        {item.unit}
                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        </div>

        {/* RESPONSES */}

        <div className="rounded-3xl bg-white p-7 shadow-sm">

          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">

            <div>

              <h2 className="text-2xl font-bold text-slate-900">
                Supplier Quotations
              </h2>

              <p className="mt-1 text-slate-500">
                Compare quotations received from suppliers.
              </p>

            </div>

            <button
              onClick={() =>
                loadRFQ(true)
              }
              disabled={refreshing}
              className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-50"
            >

              <RefreshCw
                size={17}
                className={
                  refreshing
                    ? "animate-spin"
                    : ""
                }
              />

              {refreshing
                ? "Refreshing..."
                : "Refresh"}

            </button>

          </div>

          {responses.length === 0 ? (

            <div className="mt-8 rounded-2xl border border-dashed border-slate-300 p-12 text-center">

              <Users
                size={40}
                className="mx-auto text-slate-300"
              />

              <h3 className="mt-4 text-lg font-bold text-slate-700">
                No supplier quotations yet
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                Share the supplier link above.
                Submitted quotations will appear here.
              </p>

              <button
                onClick={copySupplierLink}
                className="mx-auto mt-5 flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
              >
                <Copy size={17} />
                Copy Supplier Link
              </button>

            </div>

          ) : (

            <div className="mt-6 space-y-4">

              {responses.map(
                (response, index) => (

                  <SupplierResponse
                    key={
                      response._id ||
                      index
                    }
                    response={response}
                    index={index}
                    responses={responses}
                  />

                )
              )}

            </div>

          )}

        </div>

      </div>

    </DashboardLayout>
  );
}

// ============================================================
// SUPPLIER RESPONSE
// ============================================================

function SupplierResponse({
  response,
  index,
  responses,
}) {
  const total =
    Number(response.totalAmount) || 0;

  const allTotals = responses
    .map(
      (item) =>
        Number(
          item.totalAmount || 0
        )
    )
    .filter(
      (amount) => amount > 0
    );

  const lowest =
    allTotals.length > 0
      ? Math.min(...allTotals)
      : null;

  const isLowest =
    total > 0 &&
    lowest !== null &&
    total === lowest;

  return (
    <div
      className={`rounded-2xl border p-6 transition ${
        isLowest
          ? "border-green-300 bg-green-50/50"
          : "border-slate-200 bg-white"
      }`}
    >

      <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">

        <div>

          <div className="flex flex-wrap items-center gap-3">

            <h3 className="text-lg font-bold text-slate-900">
              {response.supplierName ||
                `Supplier ${index + 1}`}
            </h3>

            {isLowest && (
              <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
                LOWEST QUOTE
              </span>
            )}

          </div>

          {response.supplierEmail && (
            <p className="mt-2 flex items-center gap-2 text-sm text-slate-500">
              <Mail size={15} />
              {response.supplierEmail}
            </p>
          )}

          {response.supplierPhone && (
            <p className="mt-1 flex items-center gap-2 text-sm text-slate-500">
              <Phone size={15} />
              {response.supplierPhone}
            </p>
          )}

          {response.submittedAt && (
            <p className="mt-1 text-xs text-slate-400">
              Submitted{" "}
              {new Date(
                response.submittedAt
              ).toLocaleString()}
            </p>
          )}

        </div>

        <div className="text-left lg:text-right">

          <p className="text-sm text-slate-500">
            Total Quotation
          </p>

          <p
            className={`mt-1 text-2xl font-bold ${
              isLowest
                ? "text-green-700"
                : "text-slate-900"
            }`}
          >
            Rs.{" "}
            {total.toLocaleString()}
          </p>

        </div>

      </div>

      {response.items?.length > 0 && (

        <div className="mt-5 overflow-x-auto">

          <table className="w-full text-left">

            <thead>

              <tr className="border-b border-slate-200 text-xs uppercase text-slate-400">

                <th className="px-3 py-2">
                  Item
                </th>

                <th className="px-3 py-2">
                  Quantity
                </th>

                <th className="px-3 py-2">
                  Unit Price
                </th>

                <th className="px-3 py-2">
                  Total
                </th>

              </tr>

            </thead>

            <tbody>

              {response.items.map(
                (item, itemIndex) => (

                  <tr
                    key={
                      item._id ||
                      itemIndex
                    }
                    className="border-b border-slate-100 last:border-0"
                  >

                    <td className="px-3 py-3 font-medium text-slate-700">
                      {item.name ||
                        `Item ${
                          itemIndex + 1
                        }`}
                    </td>

                    <td className="px-3 py-3 text-slate-500">
                      {item.quantity || "-"}
                    </td>

                    <td className="px-3 py-3 text-slate-500">
                      Rs.{" "}
                      {Number(
                        item.unitPrice || 0
                      ).toLocaleString()}
                    </td>

                    <td className="px-3 py-3 font-semibold text-slate-700">
                      Rs.{" "}
                      {Number(
                        item.total || 0
                      ).toLocaleString()}
                    </td>

                  </tr>

                )
              )}

            </tbody>

          </table>

        </div>

      )}

      {response.notes && (
        <div className="mt-4 rounded-xl bg-slate-50 p-4 text-sm text-slate-600">

          <span className="font-semibold">
            Supplier Notes:
          </span>{" "}

          {response.notes}

        </div>
      )}

    </div>
  );
}

// ============================================================
// STAT CARD
// ============================================================

function StatCard({
  icon,
  title,
  value,
}) {
  return (
    <div className="flex items-center gap-4 rounded-2xl bg-white p-5 shadow-sm">

      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
        {icon}
      </div>

      <div>

        <p className="text-sm text-slate-500">
          {title}
        </p>

        <p className="mt-1 text-2xl font-bold text-slate-900">
          {value}
        </p>

      </div>

    </div>
  );
}
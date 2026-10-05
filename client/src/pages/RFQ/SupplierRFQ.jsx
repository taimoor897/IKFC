import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Swal from "sweetalert2";

import {
  getPublicRFQ,
  submitRFQResponse,
} from "../services/rfqService";

export default function SupplierRFQ() {
  const { id, token } = useParams();

  const [rfq, setRFQ] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [supplierName, setSupplierName] = useState("");
  const [supplierPhone, setSupplierPhone] = useState("");
  const [supplierEmail, setSupplierEmail] = useState("");
  const [notes, setNotes] = useState("");

  const [prices, setPrices] = useState({});

  // ============================================================
  // LOAD PUBLIC RFQ
  // ============================================================

  useEffect(() => {
    if (!id || !token) {
      setLoading(false);
      return;
    }

    loadRFQ();
  }, [id, token]);

  const loadRFQ = async () => {
    try {
      console.log("=================================");
      console.log("LOADING PUBLIC RFQ");
      console.log("ID:", id);
      console.log("TOKEN:", token);
      console.log("=================================");

      const data = await getPublicRFQ(id, token);

      console.log("PUBLIC RFQ RESPONSE:", data);

      if (!data?.rfq) {
        throw new Error(
          "RFQ data was not returned by the server."
        );
      }

      setRFQ(data.rfq);

      const initialPrices = {};

      data.rfq.items?.forEach((item) => {
        initialPrices[item._id] = "";
      });

      setPrices(initialPrices);

    } catch (error) {
      console.error(
        "LOAD PUBLIC RFQ ERROR:",
        error
      );

      Swal.fire({
        icon: "error",
        title: "RFQ Unavailable",
        text:
          error.response?.data?.message ||
          error.message ||
          "This quotation request could not be loaded.",
      });

    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // PRICE CHANGE
  // ============================================================

  const handlePriceChange = (itemId, value) => {
    setPrices((previous) => ({
      ...previous,
      [itemId]: value,
    }));
  };

  // ============================================================
  // CALCULATE TOTAL
  // ============================================================

  const calculateTotal = () => {
    if (!rfq?.items) return 0;

    return rfq.items.reduce((total, item) => {
      const price = Number(
        prices[item._id] || 0
      );

      const quantity = Number(
        item.quantity || 0
      );

      return total + price * quantity;
    }, 0);
  };

  // ============================================================
  // SUBMIT QUOTATION
  // ============================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!supplierName.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Supplier Name Required",
        text: "Please enter your company or supplier name.",
      });

      return;
    }

    if (!supplierPhone.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Phone Number Required",
        text: "Please enter your contact number.",
      });

      return;
    }

    const missingPrice = rfq.items?.some((item) => {
      const value = prices[item._id];

      return (
        value === "" ||
        value === null ||
        value === undefined ||
        Number(value) < 0
      );
    });

    if (missingPrice) {
      Swal.fire({
        icon: "warning",
        title: "Missing Prices",
        text:
          "Please enter a price for every requested item.",
      });

      return;
    }

    try {
      setSubmitting(true);

      const quotationItems = rfq.items.map(
        (item) => {
          const unitPrice = Number(
            prices[item._id] || 0
          );

          const quantity = Number(
            item.quantity || 0
          );

          return {
            itemId: item._id,
            name: item.name,
            quantity,
            unit: item.unit,
            unitPrice,
            total: unitPrice * quantity,
          };
        }
      );

      const payload = {
        supplierName:
          supplierName.trim(),

        supplierPhone:
          supplierPhone.trim(),

        supplierEmail:
          supplierEmail.trim(),

        items: quotationItems,

        totalAmount:
          calculateTotal(),

        notes:
          notes.trim(),
      };

      console.log(
        "SUBMITTING QUOTATION:",
        payload
      );

      const response =
        await submitRFQResponse(
          id,
          token,
          payload
        );

      console.log(
        "QUOTATION SUBMITTED:",
        response
      );

      setSubmitted(true);

    } catch (error) {
      console.error(
        "SUBMIT QUOTATION ERROR:",
        error
      );

      Swal.fire({
        icon: "error",
        title: "Submission Failed",
        text:
          error.response?.data?.message ||
          error.message ||
          "Unable to submit your quotation.",
      });

    } finally {
      setSubmitting(false);
    }
  };

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-6">
        <div className="text-center">

          <div className="mx-auto mb-5 h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

          <p className="text-slate-500">
            Loading quotation request...
          </p>

        </div>
      </div>
    );
  }

  // ============================================================
  // NOT FOUND
  // ============================================================

  if (!rfq) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-6">

        <div className="w-full max-w-lg rounded-3xl bg-white p-10 text-center shadow-xl">

          <div className="text-5xl">
            ⚠️
          </div>

          <h1 className="mt-5 text-2xl font-bold text-slate-900">
            RFQ Not Found
          </h1>

          <p className="mt-3 text-slate-500">
            This quotation request may have been
            removed, expired, or the link is invalid.
          </p>

        </div>

      </div>
    );
  }

  // ============================================================
  // SUCCESS
  // ============================================================

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-6">

        <div className="w-full max-w-xl rounded-3xl bg-white p-10 text-center shadow-xl">

          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-4xl text-green-600">
            ✓
          </div>

          <h1 className="mt-6 text-3xl font-bold text-slate-900">
            Quotation Submitted
          </h1>

          <p className="mt-3 leading-7 text-slate-500">
            Thank you for submitting your quotation.
            The construction company has received
            your response.
          </p>

          <div className="mt-8 rounded-2xl bg-slate-50 p-5">

            <p className="text-sm text-slate-500">
              Your Quotation
            </p>

            <p className="mt-2 text-3xl font-bold text-green-600">
              Rs.{" "}
              {calculateTotal().toLocaleString()}
            </p>

          </div>

        </div>

      </div>
    );
  }

  // ============================================================
  // MAIN FORM
  // ============================================================

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 md:px-8">

      <div className="mx-auto max-w-4xl">

        <div className="overflow-hidden rounded-3xl bg-white shadow-xl">

          {/* HEADER */}

          <div className="bg-gradient-to-r from-blue-700 to-blue-500 p-8 text-white">

            <p className="text-sm font-semibold uppercase tracking-[3px] text-blue-100">
              BuildPilot AI
            </p>

            <h1 className="mt-3 text-3xl font-bold md:text-4xl">
              {rfq.title ||
                "Request for Quotation"}
            </h1>

            {rfq.description && (
              <p className="mt-4 max-w-2xl leading-7 text-blue-100">
                {rfq.description}
              </p>
            )}

            {rfq.deadline && (
              <div className="mt-5 inline-flex rounded-full bg-white/10 px-4 py-2 text-sm text-blue-100">

                Submission Deadline:

                <span className="ml-1 font-semibold text-white">
                  {new Date(
                    rfq.deadline
                  ).toLocaleDateString()}
                </span>

              </div>
            )}

          </div>

          <form onSubmit={handleSubmit}>

            {/* SUPPLIER INFORMATION */}

            <div className="border-b p-6 md:p-8">

              <h2 className="text-2xl font-bold text-slate-900">
                Supplier Information
              </h2>

              <p className="mt-1 text-slate-500">
                Please provide your contact information.
              </p>

              <div className="mt-6 grid gap-5 md:grid-cols-2">

                <div>

                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Company / Supplier Name *
                  </label>

                  <input
                    type="text"
                    value={supplierName}
                    onChange={(e) =>
                      setSupplierName(
                        e.target.value
                      )
                    }
                    placeholder="ABC Construction Supplies"
                    className="w-full rounded-xl border border-slate-200 p-3.5 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />

                </div>

                <div>

                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Phone Number *
                  </label>

                  <input
                    type="tel"
                    value={supplierPhone}
                    onChange={(e) =>
                      setSupplierPhone(
                        e.target.value
                      )
                    }
                    placeholder="+92 300 1234567"
                    className="w-full rounded-xl border border-slate-200 p-3.5 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />

                </div>

                <div className="md:col-span-2">

                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Email Address
                  </label>

                  <input
                    type="email"
                    value={supplierEmail}
                    onChange={(e) =>
                      setSupplierEmail(
                        e.target.value
                      )
                    }
                    placeholder="supplier@example.com"
                    className="w-full rounded-xl border border-slate-200 p-3.5 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />

                </div>

              </div>

            </div>

            {/* ITEMS */}

            <div className="p-6 md:p-8">

              <div className="mb-6">

                <h2 className="text-2xl font-bold text-slate-900">
                  Quotation Details
                </h2>

                <p className="mt-1 text-slate-500">
                  Enter your unit price for each requested item.
                </p>

              </div>

              <div className="space-y-4">

                {rfq.items?.map(
                  (item, index) => {

                    const unitPrice =
                      Number(
                        prices[item._id] || 0
                      );

                    const itemTotal =
                      unitPrice *
                      Number(
                        item.quantity || 0
                      );

                    return (
                      <div
                        key={
                          item._id ||
                          index
                        }
                        className="rounded-2xl border border-slate-200 bg-slate-50 p-5"
                      >

                        <div className="grid gap-5 md:grid-cols-12 md:items-center">

                          <div className="md:col-span-4">

                            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                              Item
                            </p>

                            <h3 className="mt-1 text-lg font-bold text-slate-900">
                              {item.name}
                            </h3>

                          </div>

                          <div className="md:col-span-2">

                            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                              Quantity
                            </p>

                            <p className="mt-1 font-semibold text-slate-700">
                              {item.quantity}{" "}
                              {item.unit}
                            </p>

                          </div>

                          <div className="md:col-span-3">

                            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                              Unit Price
                            </label>

                            <div className="mt-1 flex items-center rounded-xl border border-slate-200 bg-white">

                              <span className="px-3 text-sm text-slate-400">
                                Rs.
                              </span>

                              <input
                                type="number"
                                min="0"
                                value={
                                  prices[
                                    item._id
                                  ] || ""
                                }
                                onChange={(e) =>
                                  handlePriceChange(
                                    item._id,
                                    e.target.value
                                  )
                                }
                                placeholder="0"
                                className="w-full rounded-xl p-3 outline-none"
                              />

                            </div>

                          </div>

                          <div className="md:col-span-3 md:text-right">

                            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                              Total
                            </p>

                            <p className="mt-1 text-xl font-bold text-slate-900">
                              Rs.{" "}
                              {itemTotal.toLocaleString()}
                            </p>

                          </div>

                        </div>

                      </div>
                    );
                  }
                )}

              </div>

              {/* NOTES */}

              <div className="mt-8">

                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Notes / Comments
                </label>

                <textarea
                  rows="4"
                  value={notes}
                  onChange={(e) =>
                    setNotes(e.target.value)
                  }
                  placeholder="Add any additional information about your quotation..."
                  className="w-full resize-none rounded-xl border border-slate-200 p-4 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />

              </div>

              {/* TOTAL */}

              <div className="mt-8 flex flex-col justify-between gap-4 rounded-2xl bg-blue-50 p-6 md:flex-row md:items-center">

                <div>

                  <p className="text-sm font-medium text-slate-500">
                    Your Total Quotation
                  </p>

                  <p className="mt-1 text-sm text-slate-400">
                    Based on the quantities requested.
                  </p>

                </div>

                <p className="text-3xl font-bold text-blue-600">
                  Rs.{" "}
                  {calculateTotal().toLocaleString()}
                </p>

              </div>

              {/* SUBMIT */}

              <button
                type="submit"
                disabled={submitting}
                className="mt-8 w-full rounded-2xl bg-blue-600 px-6 py-4 text-lg font-bold text-white shadow-lg transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting
                  ? "Submitting Quotation..."
                  : "Submit Quotation"}
              </button>

              <p className="mt-4 text-center text-xs text-slate-400">
                By submitting this quotation, you confirm
                that the information provided is accurate.
              </p>

            </div>

          </form>

        </div>

        <p className="mt-6 text-center text-sm text-slate-400">
          Powered by BuildPilot AI
        </p>

      </div>

    </div>
  );
}
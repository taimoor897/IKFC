import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

import DashboardLayout from "../../components/layout/DashboardLayout";
import { getRFQs } from "../services/rfqService";

export default function RFQs() {

  const navigate = useNavigate();

  const [rfqs, setRFQs] = useState([]);
  const [loading, setLoading] = useState(true);

  // ==========================================
  // LOAD RFQs
  // ==========================================

  useEffect(() => {
    loadRFQs();
  }, []);

  const loadRFQs = async () => {

    try {

      const data = await getRFQs();

      console.log("RFQs:", data);

      setRFQs(data.rfqs || []);

    } catch (error) {

      console.error("GET RFQS ERROR:", error);

      Swal.fire({
        icon: "error",
        title: "Error",
        text:
          error.response?.data?.message ||
          "Failed to load RFQs",
      });

    } finally {

      setLoading(false);

    }

  };


  // ==========================================
  // LOADING SCREEN
  // ==========================================

  if (loading) {

    return (

      <DashboardLayout>

        <div className="flex min-h-[60vh] items-center justify-center">

          <div className="text-center">

            <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

            <p className="text-slate-500">
              Loading RFQs...
            </p>

          </div>

        </div>

      </DashboardLayout>

    );

  }


  // ==========================================
  // MAIN PAGE
  // ==========================================

  return (

    <DashboardLayout>

      <div className="space-y-8">

        {/* ==================================
            PAGE HEADER
        ================================== */}

        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">

          <div>

            <h1 className="text-4xl font-bold text-slate-900">
              Request for Quotations
            </h1>

            <p className="mt-2 text-slate-500">
              Request prices from suppliers and compare
              quotations in one place.
            </p>

          </div>


          <button
            onClick={() => navigate("/rfqs/create")}
            className="
              rounded-xl
              bg-blue-600
              px-6
              py-3
              font-semibold
              text-white
              shadow-sm
              transition
              hover:bg-blue-700
            "
          >

            + Create RFQ

          </button>

        </div>


        {/* ==================================
            RFQ CONTENT
        ================================== */}

        {rfqs.length === 0 ? (

          /* ===============================
             EMPTY STATE
          =============================== */

          <div className="
            rounded-3xl
            border
            border-dashed
            border-slate-300
            bg-white
            p-16
            text-center
          ">

            <div className="text-6xl">
              📋
            </div>


            <h2 className="mt-5 text-2xl font-bold text-slate-900">
              No RFQs yet
            </h2>


            <p className="mx-auto mt-2 max-w-md text-slate-500">
              Create your first Request for Quotation
              to start collecting prices from suppliers.
            </p>


            <button
              onClick={() =>
                navigate("/rfqs/create")
              }
              className="
                mt-7
                rounded-xl
                bg-blue-600
                px-6
                py-3
                font-semibold
                text-white
                transition
                hover:bg-blue-700
              "
            >

              Create Your First RFQ

            </button>

          </div>

        ) : (

          /* ===============================
             RFQ LIST
          =============================== */

          <div className="grid gap-5">

            {rfqs.map((rfq) => (

              <RFQCard
                key={rfq._id}
                rfq={rfq}
                onView={() =>
                  navigate(`/rfqs/${rfq._id}`)
                }
              />

            ))}

          </div>

        )}

      </div>

    </DashboardLayout>

  );

}


// ==========================================
// RFQ CARD
// ==========================================

function RFQCard({
  rfq,
  onView,
}) {

  // ========================================
  // STATUS COLORS
  // ========================================

  const getStatusStyle = (status) => {

    switch (status) {

      case "Open":
        return "bg-green-100 text-green-700";

      case "Closed":
        return "bg-slate-100 text-slate-600";

      case "Awarded":
        return "bg-blue-100 text-blue-700";

      default:
        return "bg-slate-100 text-slate-600";

    }

  };


  // ========================================
  // DEADLINE
  // ========================================

  const deadline = rfq.deadline
    ? new Date(rfq.deadline)
    : null;


  const deadlinePassed =
    deadline &&
    deadline < new Date();


  return (

    <div className="
      rounded-3xl
      border
      border-slate-100
      bg-white
      p-6
      shadow-sm
      transition
      hover:-translate-y-0.5
      hover:shadow-md
    ">

      <div className="
        flex
        flex-col
        justify-between
        gap-6
        lg:flex-row
        lg:items-center
      ">


        {/* =================================
            LEFT SIDE
        ================================= */}

        <div className="flex-1">

          {/* TITLE + STATUS */}

          <div className="
            flex
            flex-wrap
            items-center
            gap-3
          ">

            <h2 className="
              text-xl
              font-bold
              text-slate-900
            ">
              {rfq.title}
            </h2>


            <span
              className={`
                rounded-full
                px-3
                py-1
                text-xs
                font-semibold
                ${getStatusStyle(rfq.status)}
              `}
            >

              {rfq.status || "Open"}

            </span>

          </div>


          {/* PROJECT */}

          {rfq.project && (

            <p className="mt-2 text-sm text-slate-500">

              Project:

              <span className="
                ml-1
                font-semibold
                text-slate-700
              ">
                {rfq.project.name || "Project"}
              </span>

            </p>

          )}


          {/* DESCRIPTION */}

          {rfq.description && (

            <p className="
              mt-3
              max-w-3xl
              text-sm
              leading-6
              text-slate-500
            ">

              {rfq.description}

            </p>

          )}


          {/* INFORMATION */}

          <div className="
            mt-5
            flex
            flex-wrap
            gap-x-8
            gap-y-4
          ">


            {/* ITEMS */}

            <div>

              <p className="
                text-xs
                uppercase
                tracking-wide
                text-slate-400
              ">
                Items
              </p>

              <p className="
                mt-1
                font-bold
                text-slate-800
              ">
                {rfq.items?.length || 0}
              </p>

            </div>


            {/* SUPPLIERS */}

          <div>

  <p className="
    text-xs
    uppercase
    tracking-wide
    text-slate-400
  ">
    Responses
  </p>

  <p className="
    mt-1
    font-bold
    text-slate-800
  ">
    {rfq.responses?.length || 0}
  </p>

</div>


            {/* DEADLINE */}

            <div>

              <p className="
                text-xs
                uppercase
                tracking-wide
                text-slate-400
              ">
                Deadline
              </p>

              <p
                className={`
                  mt-1
                  font-bold
                  ${
                    deadlinePassed
                      ? "text-red-600"
                      : "text-slate-800"
                  }
                `}
              >

                {deadline
                  ? deadline.toLocaleDateString()
                  : "No deadline"}

              </p>

            </div>


          </div>

        </div>


        {/* =================================
            RIGHT SIDE
        ================================= */}

        <div className="
          flex
          flex-wrap
          gap-3
        ">

          <button
            onClick={onView}
            className="
              rounded-xl
              bg-blue-600
              px-6
              py-3
              font-semibold
              text-white
              transition
              hover:bg-blue-700
            "
          >

            View RFQ

          </button>

        </div>


      </div>

    </div>

  );

}
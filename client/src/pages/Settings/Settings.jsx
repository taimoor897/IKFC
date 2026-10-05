import { useEffect, useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import Swal from "sweetalert2";

export default function SettingsPage() {
  const [whatsapp, setWhatsapp] = useState(null);
  const [loadingQR, setLoadingQR] = useState(false);

  const loadWhatsApp = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/whatsapp/status`,
        {
          cache: "no-store",
        }
      );

      const data = await res.json();

      setWhatsapp(data);
    } catch (error) {
      console.log("WhatsApp status error", error);
    }
  };

  useEffect(() => {
    loadWhatsApp();

    const interval = setInterval(loadWhatsApp, 3000);

    return () => clearInterval(interval);
  }, []);

  // Generate a fresh WhatsApp QR
  const generateQR = async () => {
    try {
      setLoadingQR(true);

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/whatsapp/reset`,
        {
          method: "POST",
        }
      );

      const data = await res.json();

      if (!res.ok) {
        Swal.fire({
          icon: "error",
          title: "Failed",
          text: data.message || "Failed to generate WhatsApp QR.",
        });

        return;
      }

      // Give Baileys time to create the new QR
      await new Promise((resolve) => setTimeout(resolve, 2000));

      await loadWhatsApp();

      Swal.fire({
        icon: "success",
        title: "QR Generated",
        text: "Scan the QR code using WhatsApp → Linked Devices.",
        timer: 1800,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Generate QR error:", error);

      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Could not generate WhatsApp QR code.",
      });
    } finally {
      setLoadingQR(false);
    }
  };

  // Disconnect currently connected WhatsApp
  const disconnectWhatsApp = async () => {
    const result = await Swal.fire({
      title: "Disconnect WhatsApp?",
      text: "The currently connected WhatsApp number will be disconnected.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Yes, disconnect",
      cancelButtonText: "Cancel",
      reverseButtons: true,
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      setLoadingQR(true);

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/whatsapp/reset`,
        {
          method: "POST",
        }
      );

      const data = await res.json();

      if (!res.ok) {
        Swal.fire({
          icon: "error",
          title: "Disconnect Failed",
          text: data.message || "Failed to disconnect WhatsApp.",
        });

        return;
      }

      await new Promise((resolve) => setTimeout(resolve, 2000));

      await loadWhatsApp();

      Swal.fire({
        icon: "success",
        title: "WhatsApp Disconnected",
        text: "A new QR code is being generated.",
        timer: 1800,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("WhatsApp disconnect error:", error);

      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to disconnect WhatsApp.",
      });
    } finally {
      setLoadingQR(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-4xl font-bold">Settings</h1>

        <p className="mt-2 text-slate-500">
          Manage your BuildPilot AI settings.
        </p>
      </div>

      <div className="max-w-xl rounded-2xl bg-white p-6 shadow">
        <h2 className="mb-6 text-2xl font-bold">
          WhatsApp Integration
        </h2>

        {whatsapp?.connected ? (
          <>
            <div className="mb-4 rounded-xl bg-green-100 p-4 font-semibold text-green-700">
              🟢 WhatsApp Connected
            </div>

            <p>
              <strong>Number:</strong> +{whatsapp.number}
            </p>

            <button
              onClick={disconnectWhatsApp}
              disabled={loadingQR}
              className="
                mt-5
                rounded-xl
                bg-red-600
                px-5
                py-3
                font-semibold
                text-white
                hover:bg-red-700
                disabled:cursor-not-allowed
                disabled:opacity-60
              "
            >
              {loadingQR ? "Disconnecting..." : "Disconnect WhatsApp"}
            </button>
          </>
        ) : (
          <>
            <div className="mb-5 rounded-xl bg-yellow-100 p-4 font-semibold text-yellow-700">
              🟡 Waiting for WhatsApp connection
            </div>

            {!whatsapp?.qr && (
              <button
                onClick={generateQR}
                disabled={loadingQR}
                className="
                  rounded-xl
                  bg-green-600
                  px-5
                  py-3
                  font-semibold
                  text-white
                  hover:bg-green-700
                  disabled:cursor-not-allowed
                  disabled:opacity-60
                "
              >
                {loadingQR
                  ? "Generating QR..."
                  : "📱 Generate WhatsApp QR Code"}
              </button>
            )}

            {whatsapp?.qr && (
              <div className="mt-4 rounded-2xl border bg-slate-50 p-5 text-center">
                <p className="mb-2 text-lg font-bold text-slate-800">
                  📱 Scan QR Code
                </p>

                <p className="mb-4 text-sm text-slate-500">
                  Open WhatsApp on your phone and go to
                  <br />
                  <strong>
                    Linked Devices → Link a Device
                  </strong>
                </p>

                <img
                  src={whatsapp.qr}
                  alt="WhatsApp QR Code"
                  className="
                    mx-auto
                    w-64
                    rounded-xl
                    border
                    bg-white
                    p-2
                    shadow
                  "
                />

                <button
                  onClick={generateQR}
                  disabled={loadingQR}
                  className="
                    mt-5
                    rounded-xl
                    border
                    border-slate-300
                    bg-white
                    px-5
                    py-2.5
                    font-semibold
                    text-slate-700
                    hover:bg-slate-100
                    disabled:cursor-not-allowed
                    disabled:opacity-60
                  "
                >
                  {loadingQR
                    ? "Generating..."
                    : "🔄 Generate New QR"}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

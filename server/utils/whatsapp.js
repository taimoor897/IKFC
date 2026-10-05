import makeWASocket, {
    useMultiFileAuthState,
    DisconnectReason,
  } from "@whiskeysockets/baileys";
  
  import { Boom } from "@hapi/boom";
  import qrcode from "qrcode";
  import fs from "fs";
  
  let sock;
  let isConnected = false;
  let qrCode = null;
let connectedNumber = null;
let isResetting = false;
  
  export async function connectWhatsApp() {
    const { state, saveCreds } =
      await useMultiFileAuthState("whatsapp-session");
  
    sock = makeWASocket({
      auth: state,
      printQRInTerminal: false,
      browser: ["BuildPilot AI", "Chrome", "1.0.0"],
    });
  
    sock.ev.on("creds.update", saveCreds);
  
    sock.ev.on("connection.update", async (update) => {
      const { connection, qr, lastDisconnect } = update;
  
      if (qr) {

        qrCode = await qrcode.toDataURL(qr);
      
        console.log(
          "📱 WhatsApp QR Generated"
        );
      
      }
      if (connection === "open") {

        isConnected = true;
      
        qrCode = null;
      
        connectedNumber =
          sock.user?.id
          ?.split(":")[0]
          || null;
      
      
        console.log(
          "✅ WhatsApp Connected",
          connectedNumber
        );
      
      }
  
     if (connection === "close") {
  isConnected = false;
  connectedNumber = null;

  console.log(
    "❌ WhatsApp disconnected"
  );

  // If user manually disconnected,
  // do NOT automatically reconnect this old socket.
  if (isResetting) {
    console.log(
      "⏸️ Manual disconnect in progress..."
    );
    return;
  }

  const statusCode =
    lastDisconnect?.error instanceof Boom
      ? lastDisconnect.error.output.statusCode
      : 0;

  const shouldReconnect =
    statusCode !== DisconnectReason.loggedOut;

  if (shouldReconnect) {
    console.log(
      "🔄 WhatsApp connection lost. Reconnecting..."
    );

    setTimeout(() => {
      connectWhatsApp();
    }, 5000);
  } else {
    console.log(
      "⚠️ WhatsApp logged out."
    );
  }
}
    });
  }
  
  export async function sendWhatsApp(number, message) {
    if (!sock || !isConnected) {
      throw new Error("WhatsApp not connected");
    }
  
    const jid =
      number.replace(/\D/g, "") + "@s.whatsapp.net";
  
    await sock.sendMessage(jid, {
      text: message,
    });
  }


  export function getWhatsAppStatus(){

    return {
  
      connected: isConnected,
  
      number: connectedNumber,
  
      qr: qrCode
  
    };
  
  }


 export async function resetWhatsApp() {
  try {
    console.log(
      "🔌 Manual WhatsApp disconnect started..."
    );

    isResetting = true;

    // Immediately remove old number from API status
    isConnected = false;
    connectedNumber = null;
    qrCode = null;

    // Logout old WhatsApp account
    if (sock) {
      try {
        await sock.logout();
      } catch (logoutError) {
        console.log(
          "Logout warning:",
          logoutError.message
        );
      }
    }

    sock = null;

    // Delete old authentication
    if (fs.existsSync("whatsapp-session")) {
      fs.rmSync("whatsapp-session", {
        recursive: true,
        force: true,
      });

      console.log(
        "🗑️ Old WhatsApp session deleted"
      );
    }

    // Allow fresh connection
    isResetting = false;

    console.log(
      "📱 Generating new WhatsApp QR..."
    );

    setTimeout(async () => {
      try {
        await connectWhatsApp();
      } catch (error) {
        console.error(
          "Fresh WhatsApp connection error:",
          error
        );
      }
    }, 1000);

    return true;

  } catch (error) {
    console.error(
      "WhatsApp reset error:",
      error
    );

    isResetting = false;

    return false;
  }
}
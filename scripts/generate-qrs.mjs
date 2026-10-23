import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import QRCode from "qrcode";

const root = path.resolve(import.meta.dirname, "..");
const outDir = path.join(root, "faculty-qr-codes");

// Detect Wi-Fi / LAN IP so native mobile cameras can reach the app immediately
function getLanIp() {
  const interfaces = os.networkInterfaces();
  let wifiIp = null;
  let ethIp = null;
  let fallbackIp = null;

  for (const name of Object.keys(interfaces)) {
    const isVirtual = /vEthernet|WSL|Hyper-V|Virtual|Docker|VMware|Loopback/i.test(name);
    for (const net of interfaces[name] || []) {
      if (net.family === "IPv4" && !net.internal) {
        if (!isVirtual) {
          if (/wi-fi|wlan|wireless/i.test(name)) {
            wifiIp = net.address;
          } else {
            ethIp = net.address;
          }
        } else if (!fallbackIp) {
          fallbackIp = net.address;
        }
      }
    }
  }
  return wifiIp || ethIp || fallbackIp || "localhost";
}

async function getFacultyList() {
  try {
    const res = await fetch("http://localhost:4100/api/v1/faculty?limit=50");
    if (res.ok) {
      const data = await res.json();
      if (data.items && data.items.length > 0) {
        return data.items.map((p) => ({
          name: p.displayName,
          token: p.activeQrToken,
          department: p.department?.code,
          room: p.office?.room,
        }));
      }
    }
  } catch {}

  // Fallback to static list of the 20 provisioned demo professors
  const names = [
    "Ananya Reddy", "Vikram Rao", "Meera Sharma", "Arjun Kumar", "Kavitha Devi",
    "Sanjay Reddy", "Priya Nair", "Rohit Varma", "Lakshmi Prasad", "Aditya Rao",
    "Sneha Iyer", "Kiran Kumar", "Divya Reddy", "Rahul Sharma", "Sowmya Rao",
    "Nikhil Reddy", "Padma Devi", "Harsha Vardhan", "Deepthi Nair", "Srinivas Rao"
  ];
  return names.map((n) => ({
    name: `Dr. ${n}`,
    token: `vnr-${n.toLowerCase().replaceAll(" ", "-")}`,
  }));
}

async function main() {
  await fs.mkdir(outDir, { recursive: true });
  const lanIp = getLanIp();
  const origin = `http://${lanIp}:5173`;

  const faculty = await getFacultyList();
  console.log(`Generating QR code images for ${faculty.length} faculty members into ${outDir}`);
  console.log(`Target Mobile QR URL Base: ${origin}/qr/<token>\n`);

  for (const prof of faculty) {
    if (!prof.token) continue;
    const targetUrl = `${origin}/qr/${prof.token}`;
    
    // Clean filename: e.g. "Dr. Ananya Reddy.png"
    const safeName = prof.name.replace(/[<>:"/\\|?*]/g, "").trim();
    const filePath = path.join(outDir, `${safeName}.png`);

    await QRCode.toFile(filePath, targetUrl, {
      width: 600,
      margin: 2,
      color: {
        dark: "#1e1338",
        light: "#ffffff",
      },
      errorCorrectionLevel: "H",
    });

    console.log(`[OK] ${safeName}.png -> ${prof.token}`);
  }

  console.log(`\nSuccessfully created ${faculty.length} QR code images in /faculty-qr-codes`);
}

main().catch((err) => {
  console.error("Failed to generate QR codes:", err);
  process.exit(1);
});

import QRCode from "qrcode";
import { Router } from "express";
import { prisma } from "../db.js";
import { formatStatusDetail } from "../services/status-service.js";
import type { AppEnv } from "../config/env.js";
import type { QrStatusResponse } from "@wimp/shared";

export function createQrRouter(appEnv: AppEnv): Router {
  const router = Router();

  router.get("/:token", async (req, res, next) => {
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    try {
      const { token } = req.params;

      const qr = await prisma.qrCode.findUnique({
        where: { token },
        include: {
          professor: {
            include: {
              department: true,
              office: {
                include: { building: true },
              },
              currentStatus: true,
              officeHours: {
                orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
              },
            },
          },
        },
      });

      if (!qr) {
        res.status(404).json({
          error: {
            code: "QR_NOT_FOUND",
            message: "This QR code does not exist in the system",
          },
        });
        return;
      }

      if (!qr.isActive || qr.revokedAt) {
        res.status(200).json({
          token: qr.token,
          isActive: false,
          isRevoked: true,
          revokedAt: qr.revokedAt?.toISOString() || null,
          professor: {
            id: qr.professor.id,
            slug: qr.professor.slug,
            displayName: qr.professor.displayName,
            designation: qr.professor.designation,
            department: {
              id: qr.professor.department.id,
              name: qr.professor.department.name,
              code: qr.professor.department.code,
            },
            office: null,
          },
          status: {
            status: "UNKNOWN",
            expectedReturnAt: null,
            alternateLocation: null,
            publicMessage: "This QR code has been revoked or deactivated.",
            expiresAt: null,
            updatedAt: (qr.revokedAt || qr.createdAt).toISOString(),
            isExpired: true,
            isConfidentlyCurrent: false,
          },
          officeHours: [],
          meta: {
            selfReported: true,
            locationTracking: false,
            lastUpdated: (qr.revokedAt || qr.createdAt).toISOString(),
            qrPublicUrl: `${appEnv.PUBLIC_BASE_URL}/qr/${qr.token}`,
          },
        });
        return;
      }

      const professor = qr.professor;
      const statusRecord = professor.currentStatus || {
        status: "UNKNOWN",
        expectedReturnAt: null,
        alternateLocation: null,
        publicMessage: null,
        expiresAt: null,
        updatedAt: professor.updatedAt,
      };

      const statusDetail = formatStatusDetail(statusRecord);

      const response: QrStatusResponse = {
        token: qr.token,
        isActive: true,
        isRevoked: false,
        professor: {
          id: professor.id,
          slug: professor.slug,
          displayName: professor.displayName,
          designation: professor.designation,
          photoUrl: professor.photoUrl,
          publicContact: professor.publicContact,
          consultationDetails: professor.consultationDetails,
          department: {
            id: professor.department.id,
            name: professor.department.name,
            code: professor.department.code,
          },
          office: professor.office
            ? {
                id: professor.office.id,
                buildingName: professor.office.building.name,
                buildingCode: professor.office.building.code,
                floor: professor.office.floor,
                room: professor.office.room,
                label: professor.office.label,
              }
            : null,
        },
        status: statusDetail,
        officeHours: professor.officeHours.map((oh) => ({
          id: oh.id,
          dayOfWeek: oh.dayOfWeek,
          startTime: oh.startTime,
          endTime: oh.endTime,
          notes: oh.notes,
        })),
        meta: {
          selfReported: true,
          locationTracking: false,
          lastUpdated: statusDetail.updatedAt,
          qrPublicUrl: `${appEnv.PUBLIC_BASE_URL}/qr/${qr.token}`,
        },
      };

      res.json(response);
    } catch (err) {
      next(err);
    }
  });

  router.get("/:token/image", async (req, res, next) => {
    try {
      const { token } = req.params;
      const storedQr = await prisma.qrCode.findUnique({ where: { token } });
      if (!storedQr || !storedQr.isActive) { res.status(404).json({ error: { message: 'Active QR code not found' } }); return; }
      const originFromQuery = req.query.origin as string | undefined;
      let originFromHeader: string | null = null;
      try {
        const referer = req.get("referer");
        if (referer) originFromHeader = new URL(referer).origin;
      } catch {
        // ignore parse error
      }

      const forwardedProto = req.get("x-forwarded-proto") || req.protocol || "https";
      const forwardedHost = req.get("x-forwarded-host") || req.get("host");
      const hostOrigin = forwardedHost ? `${forwardedProto}://${forwardedHost}` : null;
      const clientOrigin = originFromQuery || originFromHeader || hostOrigin || appEnv.PUBLIC_BASE_URL;
      
      // If client origin is localhost/127.0.0.1, auto-substitute machine's Wi-Fi/LAN IPv4
      // so native mobile phone cameras scanning the monitor screen can reach the web app
      let targetOrigin = clientOrigin;
      if (targetOrigin.includes("localhost") || targetOrigin.includes("127.0.0.1")) {
        const interfaces = (await import("node:os")).networkInterfaces();
        let localIp: string | null = null;
        for (const name of Object.keys(interfaces)) {
          for (const net of interfaces[name] || []) {
            if (net.family === "IPv4" && !net.internal) {
              localIp = net.address;
              break;
            }
          }
          if (localIp) break;
        }
        if (localIp) {
          targetOrigin = targetOrigin.replace("localhost", localIp).replace("127.0.0.1", localIp);
        }
      }

      const targetUrl = `${targetOrigin}/qr/${token}`;

      const buffer = await QRCode.toBuffer(targetUrl, {
        width: 384,
        margin: 2,
        color: {
          dark: "#1e1338",
          light: "#ffffff",
        },
      });

      res.setHeader("Content-Type", "image/png");
      res.setHeader("Cache-Control", "public, max-age=60");
      res.send(buffer);
    } catch (err) {
      next(err);
    }
  });

  return router;
}

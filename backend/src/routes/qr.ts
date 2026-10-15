import QRCode from "qrcode";
import { Router } from "express";
import { prisma } from "../db.js";
import { formatStatusDetail } from "../services/status-service.js";
import type { AppEnv } from "../config/env.js";
import type { QrStatusResponse } from "@wimp/shared";

export function createQrRouter(appEnv: AppEnv): Router {
  const router = Router();

  router.get("/:token", async (req, res, next) => {
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
      const targetUrl = `${appEnv.PUBLIC_BASE_URL}/qr/${token}`;

      const buffer = await QRCode.toBuffer(targetUrl, {
        width: 384,
        margin: 2,
        color: {
          dark: "#0f172a",
          light: "#ffffff",
        },
      });

      res.setHeader("Content-Type", "image/png");
      res.setHeader("Cache-Control", "public, max-age=3600");
      res.send(buffer);
    } catch (err) {
      next(err);
    }
  });

  return router;
}

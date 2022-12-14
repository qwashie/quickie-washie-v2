import type { RequestHandler } from "express";
import type { GetVehicleByIdParams, GetVehicleByIdResponse } from "@qw/dto";

import prisma from "../../lib/prisma";
import { AppError, handleControllerError } from "../../utils/error";

const getVehicleByIdController: RequestHandler<
  GetVehicleByIdParams,
  GetVehicleByIdResponse
> = async (req, res, next) => {
  try {
    const payload = req.tokenPayload;

    if (!payload) {
      const error = new AppError("UnauthorizedException", "No token provided");
      return next(error);
    }

    const { vehicleId } = req.params;

    const vehicle = await prisma.vehicle.findUnique({
      where: { id: vehicleId },
      select: {
        id: true,
        createdAt: true,
        updatedAt: true,
        plateNumber: true,
        model: true,
        type: true,
        userId: true,
        appointments: {
          include: {
            AdditionalPrice: true,
            Service: true,
            Vehicle: true,
            User: {
              select: {
                id: true,
                email: true,
                name: true,
                licenseUrl: true,
                photoUrl: true,
              },
            },
          },
        },
      },
    });

    if (!vehicle) {
      const error = new AppError("NotFoundException", "Vehicle not found");
      return next(error);
    }

    if (vehicle.userId !== payload.id) {
      if (payload.privilege !== "ADMIN") {
        const error = new AppError(
          "UnauthorizedException",
          "You are not authorized to access this vehicle"
        );
        return next(error);
      }
    }

    return res.status(200).json(vehicle);
  } catch (e) {
    handleControllerError(e, next);
  }
};

export default getVehicleByIdController;

import type { RequestHandler } from "express";
import type { GetServiceByIdParams, GetServiceByIdResponse } from "@qw/dto";

import prisma from "../../lib/prisma";
import { AppError, handleControllerError } from "../../utils/error";

const getServiceByIdController: RequestHandler<
  GetServiceByIdParams,
  GetServiceByIdResponse
> = async (req, res, next) => {
  try {
    const payload = req.tokenPayload;

    if (!payload) {
      const error = new AppError("UnauthorizedException", "No token provided");
      return next(error);
    }

    const { serviceId } = req.params;

    const service = await prisma.service.findUnique({
      where: { id: serviceId },
      select: {
        id: true,
        name: true,
        basePrice: true,
        description: true,
        createdAt: true,
        updatedAt: true,
        additionalPrices: true,
        appointments: {
          select: {
            id: true,
            createdAt: true,
            updatedAt: true,
            date: true,
            status: true,
            Vehicle: {
              select: {
                plateNumber: true,
                model: true,
                type: true,
              },
            },
          },
        },
      },
    });

    if (!service) {
      const error = new AppError("NotFoundException", "Service not found");
      return next(error);
    }

    return res.status(200).json(service);
  } catch (e) {
    handleControllerError(e, next);
  }
};

export default getServiceByIdController;

import type { RequestHandler } from "express";
import type { ProfileResponse } from "@qw/dto";

import prisma from "../../../lib/prisma";
import { AppError, handleControllerError } from "../../../utils/error";

const profileController: RequestHandler<any, ProfileResponse> = async (
  req,
  res,
  next
) => {
  try {
    const payload = req.tokenPayload;

    if (!payload) {
      const error = new AppError("UnauthorizedException", "No token provided");
      return next(error);
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.id },
      select: {
        id: true,
        email: true,
        photoUrl: true,
        phone: true,
        name: true,
        privilege: true,
        licenseUrl: true,
      },
    });

    if (!user) {
      const error = new AppError("NotFoundException", "User does not exist");
      return next(error);
    }

    return res.status(200).json(user);
  } catch (e) {
    handleControllerError(e, next);
  }
};

export default profileController;

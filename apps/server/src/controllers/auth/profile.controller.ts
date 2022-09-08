import type { RequestHandler } from "express";
import bcrypt from "bcryptjs";

import prisma from "../../lib/prisma";
import { AppError } from "../../utils/error";
import { createTokens } from "../../utils/jwt-helper";

const profileController: RequestHandler = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      const error = new AppError("NotFoundException", "User does not exist");
      return next(error);
    }

    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      const error = new AppError(
        "UnauthorizedException",
        "Invalid credentials"
      );
      return next(error);
    }

    const { accessToken, refreshToken } = createTokens({
      id: user.id,
      privilege: user.privilege,
    });

    return res.status(200).json({ accessToken, refreshToken });
  } catch (e) {
    const error = new AppError(
      "InternalServerErrorException",
      (e as any).message
    );
    return next(error);
  }
};

export default profileController;
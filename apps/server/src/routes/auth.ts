import { Router } from "express";
import validator from "../middlewares/validator";
import checkJwt from "../middlewares/check-jwt";
import {
  loginSchema,
  registerSchema,
  refreshTokenSchema,
  updateProfileSchema,
} from "@qw/dto";
import loginController from "../controllers/auth/login.controller";
import registerController from "../controllers/auth/register.controller";
import profileController from "../controllers/auth/profile/profile.controller";
import updateProfileController from "../controllers/auth/profile/update.controller";
import refreshTokenController from "../controllers/auth/refresh-token.controller";

export const authRouter = Router();

// PROFILE
authRouter.get("/profile", checkJwt, profileController);
authRouter.put(
  "/profile",
  [checkJwt, validator(updateProfileSchema)],
  updateProfileController
);

// AUTH
authRouter.post("/login", validator(loginSchema), loginController);
authRouter.post("/register", validator(registerSchema), registerController);
authRouter.post(
  "/refresh-token",
  validator(refreshTokenSchema),
  refreshTokenController
);

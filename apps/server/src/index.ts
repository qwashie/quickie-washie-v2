import "dotenv/config";
import cors from "cors";
import express from "express";
import morgan from "morgan";
import cookieParser from "cookie-parser";

import prisma from "./lib/prisma";
import routes from "./routes/index";
import errorHandler from "./middlewares/error-handler";
import { verifyVerifyAccountToken } from "./utils/jwt-helper";
import { JsonWebTokenError } from "jsonwebtoken";

const PORT = process.env["PORT"] ?? 4000;

const main = async () => {
  const app = express();

  app.use(cors());
  app.use(cookieParser());
  app.use(express.json());
  app.use(express.static("public"));
  app.use(morgan("combined"));

  app.use("/api", routes);
  app.use("/verify-account", async (req, res) => {
    try {
      const { token } = req.query;

      if (!token || typeof token !== "string") {
        throw new Error("Token not found");
      }

      try {
        // check if token is used
        const verificationToken = await prisma.verificationToken.findUnique({
          where: { token },
        });

        // check if token exists
        if (!verificationToken) {
          return res.send("Invalid token. Please request a new one.");
        }

        // check if token is used
        if (verificationToken.used) {
          return res.send("Account already verified.");
        }

        // verify token
        const user = verifyVerifyAccountToken(token);

        // mark token used and user verified
        await prisma.$transaction([
          prisma.verificationToken.update({
            where: { token },
            data: { used: true },
          }),
          prisma.user.update({
            where: { id: user.uid },
            data: { isVerified: true },
          }),
        ]);

        return res.send("Account verified. You can now close this tab.");
      } catch (err) {
        if (err instanceof JsonWebTokenError) {
          if (err.message.includes("expired")) {
            return res.send("Token expired. Please request a new one.");
          }

          return res.send("Invalid token. Please request a new one.");
        }
        throw err;
      }
    } catch (error) {
      console.log(error);
      return res.send("Could not verify account.");
    }
  });
  app.use(errorHandler);

  app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
  });
};

main().catch(console.error);

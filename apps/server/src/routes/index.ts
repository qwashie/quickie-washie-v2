import { Router } from "express";
import prisma from "../lib/prisma";
import appointment from "./appointment";
import auth from "./auth";

const router = Router();

router.get("/", async (_, res) => {
  try {
    await prisma.$connect();
    res.json({ message: "database connected" });
  } catch (e) {
    console.log(e);
    res.json({ message: "failed to connect to database", error: e });
  }
});

router.use("/appointment", appointment);
router.use("/auth", auth);

export default router;
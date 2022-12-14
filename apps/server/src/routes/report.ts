import { Router } from "express";
import checkJwt from "../middlewares/check-jwt";
import validator from "../middlewares/validator";

import {
  createBugReportSchema,
  getBugReportByIdSchema,
  markReportSeenSchema,
} from "@qw/dto";
import createBugReportController from "../controllers/report/create.controller";
import getAllBugReportsController from "../controllers/report/get-all.controller";
import getBugReportByIdController from "../controllers/report/get-by-id.controller";
import markBugReportController from "../controllers/report/mark-seen.controller";

export const reportRouter = Router();

reportRouter.get("/", checkJwt, getAllBugReportsController);

reportRouter.get(
  "/:reportId",
  [checkJwt, validator(getBugReportByIdSchema)],
  getBugReportByIdController
);

reportRouter.post(
  "/",
  [checkJwt, validator(createBugReportSchema)],
  createBugReportController
);

reportRouter.put(
  "/",
  [checkJwt, validator(markReportSeenSchema)],
  markBugReportController
);

import express from "express";
import { HealthCheck } from "../controller/health.controller";

const router = express.Router();

rout.get("./", HealthCheck);

export default router;

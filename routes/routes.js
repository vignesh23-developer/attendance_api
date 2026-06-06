import express from "express";
import { adminLogin } from "../controllers/admin/login.js";
import { employeeLogin } from "../controllers/employee/login.js";
import { employeeRegister } from "../controllers/admin/register.js";
import upload from "../middleware/upload.js";

const router = express.Router();

router.post("/admin/login", adminLogin);
router.post("/employee/login", employeeLogin);
router.post("/employee/register", upload.single("image"), employeeRegister);

export default router;
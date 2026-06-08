import express from "express";
import { adminLogin } from "../controllers/admin/login.js";
import { employeeLogin } from "../controllers/employee/login.js";
import { employeeRegister } from "../controllers/admin/register.js";
import { createLeaveRequest, getLeaveRequests, deleteLeaveRequest } from "../controllers/employee/leave_request.js";
import { employeeCheckIn, employeeCheckOut, getAttendanceStatus} from "../controllers/employee/attendance.js";
import upload from "../middleware/upload.js";

const router = express.Router();

router.post("/admin/login", adminLogin);
router.post("/employee/login", employeeLogin);

// Employee Registration with optional profile image upload
router.post("/employee/register", upload.single("image"), employeeRegister);

// Employee flow roots 

router.post("/employee/leave-request", createLeaveRequest);

router.post("/employee/get-leave-requests", getLeaveRequests);

router.post("/employee/delete-leave-request", deleteLeaveRequest);

router.post("/employee/checkin",upload.single("checkin_image"), employeeCheckIn);

router.post("/employee/checkout", upload.single("checkout_image"), employeeCheckOut);

router.post("/employee/attendance-status", getAttendanceStatus);

export default router;
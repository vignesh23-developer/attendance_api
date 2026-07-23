import express from "express";
import { adminLogin } from "../controllers/admin/login.js";
import { employeeLogin } from "../controllers/employee/login.js";
import { employeeRegister } from "../controllers/admin/register.js";
import { createLeaveRequest, getLeaveRequests, deleteLeaveRequest } from "../controllers/employee/leave_request.js";
import { employeeCheckIn, employeeCheckOut, getAttendanceStatus} from "../controllers/employee/attendance.js";
import { getEmployeeList , deleteEmployee, updateEmployee} from "../controllers/admin/employeeList.js";
import { getLeaveRequestList, updateLeaveStatus, getEmployeeLeaveHistory} from "../controllers/admin/leaveRequestList.js";
import { getDashboardCounts } from "../controllers/admin/dashboard.js";
import { createTask, getEmployeeTasks } from "../controllers/admin/task_assigned.js";
import upload from "../middleware/upload.js";
import { verifyToken, requireAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();



// Public auth routes
router.post("/admin/login", adminLogin);

router.post("/employee/login", employeeLogin);



// Admin flow routes (require a valid token with admin role)
router.get("/admin/employee-list", verifyToken, requireAdmin, getEmployeeList);

router.delete("/delete/employee/:employee_id", verifyToken, requireAdmin, deleteEmployee);

router.put("/update/employee/:employee_id", verifyToken, requireAdmin, updateEmployee);

router.get("/admin/leave-request-list", verifyToken, requireAdmin, getLeaveRequestList);

router.post("/admin/update-leave", verifyToken, requireAdmin, updateLeaveStatus);

router.post("/admin/employee-history", verifyToken, requireAdmin, getEmployeeLeaveHistory);

router.get("/admin/dashboard", verifyToken, requireAdmin, getDashboardCounts);

router.post("/admin/create-task", verifyToken, requireAdmin, createTask);

// Employee Registration (admin action) with optional profile image upload
router.post("/employee/register", verifyToken, requireAdmin, upload.single("image"), employeeRegister);



// Employee flow routes (require a valid token)
router.get("/employee/tasks/:employee_id", verifyToken, getEmployeeTasks);

router.post("/employee/leave-request", verifyToken, createLeaveRequest);

router.post("/employee/get-leave-requests", verifyToken, getLeaveRequests);

router.post("/employee/delete-leave-request", verifyToken, deleteLeaveRequest);

router.post("/employee/checkin", verifyToken, upload.single("checkin_image"), employeeCheckIn);

router.post("/employee/checkout", verifyToken, upload.single("checkout_image"), employeeCheckOut);

router.post("/employee/attendance-status", verifyToken, getAttendanceStatus);

export default router;
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

const router = express.Router();



// Admin flow routes
router.post("/admin/login", adminLogin);

router.get("/admin/employee-list", getEmployeeList);

router.delete("/delete/employee/:employee_id", deleteEmployee);

router.put("/update/employee/:employee_id", updateEmployee);

router.get("/admin/leave-request-list",getLeaveRequestList);

router.post("/admin/update-leave", updateLeaveStatus);

router.post("/admin/employee-history", getEmployeeLeaveHistory);

router.get("/admin/dashboard", getDashboardCounts);

router.post("/admin/create-task", createTask);

router.get("/employee/tasks/:employee_id", getEmployeeTasks);



// Employee Registration with optional profile image upload
router.post("/employee/register", upload.single("image"), employeeRegister);

// Employee flow roots 
router.post("/employee/login", employeeLogin);

router.post("/employee/leave-request", createLeaveRequest);

router.post("/employee/get-leave-requests", getLeaveRequests);

router.post("/employee/delete-leave-request", deleteLeaveRequest);

router.post("/employee/checkin",upload.single("checkin_image"), employeeCheckIn);

router.post("/employee/checkout", upload.single("checkout_image"), employeeCheckOut);

router.post("/employee/attendance-status", getAttendanceStatus);

export default router;
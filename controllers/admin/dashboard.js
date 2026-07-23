import db from "../../config/db.js";
import { sendError, sendSuccess } from "../../utils/response.js";

export const getDashboardCounts = async (req, res) => {
  try {
    const totalEmployeesQuery = `
      SELECT COUNT(*) AS totalEmployees
      FROM employee_login
    `;

    const leaveCountsQuery = `
      SELECT
        SUM(
          CASE
            WHEN leave_type = 'Leave'
            AND status = 'Approved'
            THEN 1 ELSE 0
          END
        ) AS leaveCount,

        SUM(
          CASE
            WHEN leave_type = 'Permission'
            AND status = 'Approved'
            THEN 1 ELSE 0
          END
        ) AS permissionCount,

        SUM(
          CASE
            WHEN leave_type = 'Half Day'
            AND status = 'Approved'
            THEN 1 ELSE 0
          END
        ) AS halfDayCount

      FROM leave_request
      WHERE DATE(from_date) <= CURDATE()
      AND DATE(to_date) >= CURDATE()
    `;

    db.query(totalEmployeesQuery, (err1, empResult) => {
      if (err1) {
        return sendError(res, 500, "Employee Count Error");
      }

      db.query(leaveCountsQuery, (err2, leaveResult) => {
        if (err2) {
          return sendError(res, 500, "Leave Count Error");
        }

        const totalEmployees =
          empResult[0].totalEmployees || 0;

        const leaveCount =
          leaveResult[0].leaveCount || 0;

        const permissionCount =
          leaveResult[0].permissionCount || 0;

        const halfDayCount =
          leaveResult[0].halfDayCount || 0;

        const presentCount =
          totalEmployees -
          leaveCount -
          permissionCount -
          halfDayCount;

        return sendSuccess(res, 200, {
          data: {
            totalEmployees,
            presentCount,
            leaveCount,
            permissionCount,
            halfDayCount,
          },
        });
      });
    });
  } catch (error) {
    console.error("Dashboard Count Error:", error);

    return sendError(res, 500, "Server Error");
  }
};
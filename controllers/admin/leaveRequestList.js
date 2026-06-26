import db from "../../config/db.js";

export const getLeaveRequestList = (req, res) => {
  db.query(
    `
    SELECT
      leave_request_id,
      employee_id,
      employee_name,
      leave_type,
      from_date,
      to_date,
      reason,
      status
    FROM leave_request
    ORDER BY leave_request_id DESC
    `,
    (err, results) => {
      if (err) {
        console.error("Get Leave Request List Error:", err);

        return res.status(500).json({
          success: false,
          message: "Database Error, Please Contact Support",
        });
      }

      return res.status(200).json({
        success: true,
        count: results.length,
        data: results,
      });
    }
  );
};

export const updateLeaveStatus = (req, res) => {
  const { employee_id, leave_request_id, status } = req.body;

  if (!employee_id || !leave_request_id || !status) {
    return res.status(400).json({
      success: false,
      message:
        "Employee ID, Leave Request ID and Status are required",
    });
  }

  const validStatus = ["Approved", "Rejected"];

  if (!validStatus.includes(status)) {
    return res.status(400).json({
      success: false,
      message:
        "Invalid status. Use Approved or Rejected",
    });
  }

  db.query(
    `
    UPDATE leave_request
    SET status = ?
    WHERE leave_request_id = ?
    AND employee_id = ?
    `,
    [status, leave_request_id, employee_id],
    (err, result) => {
      if (err) {
        console.error(
          "Update Leave Status Error:",
          err
        );

        return res.status(500).json({
          success: false,
          message:
            "DB Error. Please Call Support",
        });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message:
            "Leave Request Not Found",
        });
      }

      return res.status(200).json({
        success: true,
        message:
          status === "Approved"
            ? "Leave Request Approved Successfully"
            : "Leave Request Rejected Successfully",
      });
    }
  );
};

export const getEmployeeLeaveHistory = (req, res) => {
  const { employee_id } = req.body;

  if (!employee_id) {
    return res.status(400).json({
      success: false,
      message: "Employee ID is required",
    });
  }

  db.query(
    `
    SELECT
      leave_request_id,
      employee_id,
      employee_name,
      leave_type,
      from_date,
      to_date,
      reason,
      status,
      created_at
    FROM leave_request
    WHERE employee_id = ?
    ORDER BY leave_request_id DESC
    `,
    [employee_id],
    (err, results) => {
      if (err) {
        console.error(
          "Get Employee Leave History Error:",
          err
        );

        return res.status(500).json({
          success: false,
          message: "Database Error",
        });
      }

      return res.status(200).json({
        success: true,
        count: results.length,
        data: results,
      });
    }
  );
};
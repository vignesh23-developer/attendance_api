import db from "../../config/db.js";

// CREATE LEAVE REQUEST

export const createLeaveRequest = (req, res) => {
  try {
    const {
      employee_id,
      employee_name,
      leave_type,
      from_date,
      to_date,
      reason,
    } = req.body;

    // Validation
    if (!employee_id || !employee_name || !leave_type || !from_date || !to_date) {
      return res.status(400).json({
        success: false,
        message: "Required fields missing",
      });
    }

    if (new Date(to_date) < new Date(from_date)) {
      return res.status(400).json({
        success: false,
        message: "to_date must be greater than or equal to from_date",
      });
    }

    const sql = `
      INSERT INTO u946597764_tLNmW.leave_request
      (employee_id, employee_name, leave_type, from_date, to_date, reason)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    db.query(
      sql,
      [employee_id, employee_name, leave_type, from_date, to_date, reason],
      (err, result) => {
        if (err) {
          return res.status(500).json({
            success: false,
            message: "Database error",
            error: err.message,
          });
        }

        return res.status(201).json({
          success: true,
          message: "Leave request created successfully",
          leave_request_id: result.insertId,
        });
      }
    );
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

//get leave requests for an employee
export const getLeaveRequests = (req, res) => {
  try {
    const { employee_id } = req.body;

    if (!employee_id) {
      return res.status(400).json({
        success: false,
        message: "employee_id is required",
      });
    }

    const sql = `
      SELECT
        leave_request_id,
        leave_type,
        status,
        from_date,
        to_date,
        reason
      FROM u946597764_tLNmW.leave_request
      WHERE employee_id = ?
      ORDER BY created_at DESC
    `;

    db.query(sql, [employee_id], (err, result) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: "Database error",
          error: err.message,
        });
      }

      return res.status(200).json({
        success: true,
        count: result.length,
        data: result,
      });
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};


// delete leave request
export const deleteLeaveRequest = (req, res) => {
  try {
    const { employee_id, leave_request_id } = req.body;

    console.log("BODY RECEIVED:", req.body);

    if (!employee_id || !leave_request_id) {
      return res.status(400).json({
        success: false,
        message: "employee_id and leave_request_id are required",
      });
    }

    const sql = `
      DELETE FROM leave_request
      WHERE employee_id = ?
      AND leave_request_id = ?
    `;

    db.query(
      sql,
      [employee_id, leave_request_id],
      (err, result) => {
        if (err) {
          return res.status(500).json({
            success: false,
            message: "Database error",
            error: err.message,
          });
        }

        if (result.affectedRows === 0) {
          return res.status(404).json({
            success: false,
            message: "Leave request not found",
          });
        }

        return res.status(200).json({
          success: true,
          message: "Leave request deleted successfully",
        });
      }
    );
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};
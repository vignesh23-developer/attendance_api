import db from "../../config/db.js";
import { sendError, sendSuccess, sendDbError } from "../../utils/response.js";

export const getEmployeeList = (req, res) => {
  db.query(
    `
    SELECT
      employee_id,
      name,
      role,
      image,
      number
    FROM employee_login
    ORDER BY name ASC
    `,
    (err, results) => {
      if (err) {
        console.error("Get Employee List Error:", err);

        return sendDbError(res);
      }

      return sendSuccess(res, 200, {
        count: results.length,
        data: results,
      });
    }
  );
};


export const deleteEmployee = (req, res) => {
  const { employee_id } = req.params;

  if (!employee_id) {
    return sendError(res, 400, "Employee ID is required");
  }

  db.query(
    "DELETE FROM employee_login WHERE employee_id = ?",
    [employee_id],
    (err, result) => {
      if (err) {
        console.error("Delete Employee Error:", err);

        return sendDbError(res);
      }

      if (result.affectedRows === 0) {
        return sendError(res, 404, "Employee Not Found");
      }

      return sendSuccess(res, 200, {
        message: "Employee Deleted Successfully",
      });
    }
  );
};



export const updateEmployee = (req, res) => {
  const { employee_id } = req.params;
  const { name, role, number, image } = req.body;

  if (!employee_id) {
    return sendError(res, 400, "Employee ID is required");
  }

  db.query(
    `UPDATE employee_login
     SET name = ?, role = ?, number = ?, image = ?
     WHERE employee_id = ?`,
    [name, role, number, image, employee_id],
    (err, result) => {
      if (err) {
        console.error("Update Employee Error:", err);

        return sendDbError(res);
      }

      if (result.affectedRows === 0) {
        return sendError(res, 404, "Employee Not Found");
      }

      return sendSuccess(res, 200, {
        message: "Employee Updated Successfully",
      });
    }
  );
};

<<<<<<< HEAD
import db from "../../config/db.js";

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


export const deleteEmployee = (req, res) => {
  const { employee_id } = req.params;

  if (!employee_id) {
    return res.status(400).json({
      success: false,
      message: "Employee ID is required",
    });
  }

  db.query(
    "DELETE FROM employee_login WHERE employee_id = ?",
    [employee_id],
    (err, result) => {
      if (err) {
        console.error("Delete Employee Error:", err);

        return res.status(500).json({
          success: false,
          message: "Database Error, Please Contact Support",
        });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: "Employee Not Found",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Employee Deleted Successfully",
      });
    }
  );
};



export const updateEmployee = (req, res) => {
  const { employee_id } = req.params;
  const { name, role, number, image } = req.body;

  if (!employee_id) {
    return res.status(400).json({
      success: false,
      message: "Employee ID is required",
    });
  }

  db.query(
    `UPDATE employee_login
     SET name = ?, role = ?, number = ?, image = ?
     WHERE employee_id = ?`,
    [name, role, number, image, employee_id],
    (err, result) => {
      if (err) {
        console.error("Update Employee Error:", err);

        return res.status(500).json({
          success: false,
          message: "Database Error, Please Contact Support",
        });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: "Employee Not Found",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Employee Updated Successfully",
      });
    }
  );
=======
import db from "../../config/db.js";

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


export const deleteEmployee = (req, res) => {
  const { employee_id } = req.params;

  if (!employee_id) {
    return res.status(400).json({
      success: false,
      message: "Employee ID is required",
    });
  }

  db.query(
    "DELETE FROM employee_login WHERE employee_id = ?",
    [employee_id],
    (err, result) => {
      if (err) {
        console.error("Delete Employee Error:", err);

        return res.status(500).json({
          success: false,
          message: "Database Error, Please Contact Support",
        });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: "Employee Not Found",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Employee Deleted Successfully",
      });
    }
  );
};



export const updateEmployee = (req, res) => {
  const { employee_id } = req.params;
  const { name, role, number, image } = req.body;

  if (!employee_id) {
    return res.status(400).json({
      success: false,
      message: "Employee ID is required",
    });
  }

  db.query(
    `UPDATE employee_login
     SET name = ?, role = ?, number = ?, image = ?
     WHERE employee_id = ?`,
    [name, role, number, image, employee_id],
    (err, result) => {
      if (err) {
        console.error("Update Employee Error:", err);

        return res.status(500).json({
          success: false,
          message: "Database Error, Please Contact Support",
        });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: "Employee Not Found",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Employee Updated Successfully",
      });
    }
  );
>>>>>>> 5bee294a9f9e1f4c4f0bda1a4771bd78dcf6113a
};
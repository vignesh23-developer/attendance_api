import db from "../../config/db.js";

export const getEmployeeList = (req, res) => {
  db.query(
    `
    SELECT
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
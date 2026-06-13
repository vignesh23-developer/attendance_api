import db from "../../config/db.js";

export const getEmployeeList = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT
        name,
        role,
        image,
        number
      FROM employee_login
      ORDER BY name ASC
    `);

    res.status(200).json({
      success: true,
      count: rows.length,
      data: rows,
    });
  } catch (error) {
    console.error("Get Employee List Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch employee list",
      error: error.message,
    });
  }
};
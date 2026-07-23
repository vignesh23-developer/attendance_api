import db from "../../config/db.js";
import { sendError, sendSuccess } from "../../utils/response.js";

export const createTask = async (req, res) => {
    try {
        const {
            employee_id,
            client_name,
            contact_number,
            area,
            city,
            available_time,
            visit_date,
            description,
            task_status
        } = req.body;

        // Validation
        if (
            !employee_id ||
            !client_name ||
            !contact_number ||
            !visit_date
        ) {
            return sendError(res, 400, "Please fill all required fields.");
        }

        const sql = `
            INSERT INTO task_assigned
            (
                employee_id,
                client_name,
                contact_number,
                area,
                city,
                available_time,
                visit_date,
                description,
                task_status
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const values = [
            employee_id,
            client_name,
            contact_number,
            area,
            city,
            available_time,
            visit_date,
            description,
            task_status || "Assigned"
        ];

        const [result] = await db.execute(sql, values);

        return sendSuccess(res, 200, {
            message: "Task assigned successfully.",
            task_id: result.insertId
        });

    } catch (error) {
        console.error(error);

        return sendError(res, 500, "Internal Server Error", {
            error: error.message
        });
    }
};

export const getEmployeeTasks = async (req, res) => {
    try {
        const { employee_id } = req.params;

        if (!employee_id) {
            return sendError(res, 400, "Employee ID is required.");
        }

        const sql = `
            SELECT
                id,
                employee_id,
                client_name,
                contact_number,
                area,
                city,
                available_time,
                visit_date,
                description,
                task_status,
                created_at,
                updated_at
            FROM task_assigned
            WHERE employee_id = ?
            ORDER BY visit_date ASC, available_time ASC
        `;

        const [rows] = await db.execute(sql, [employee_id]);

        return sendSuccess(res, 200, {
            total_tasks: rows.length,
            tasks: rows
        });

    } catch (error) {
        console.error(error);

        return sendError(res, 500, "Internal Server Error", {
            error: error.message
        });
    }
};
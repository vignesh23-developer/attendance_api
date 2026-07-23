import db from "../../config/db.js";
import { uploadFileToS3 } from "../../utils/s3Upload.js";
import { sendError, sendSuccess } from "../../utils/response.js";

const IMAGE_REQUIREMENTS = {
    allowed_formats: ["jpg", "jpeg", "png"],
    max_file_size: "1 MB",
};

export const employeeCheckIn = async (req, res) => {
    try {
        const {
            employee_id,
            employee_name,
            checkin_location,
            checkin_lat,
            checkin_long,
        } = req.body;

        if (!employee_id || !employee_name) {
            return sendError(
                res,
                400,
                "employee_id and employee_name are required"
            );
        }

        if (!req.file) {
            return sendError(
                res,
                400,
                "Check-in image is required",
                IMAGE_REQUIREMENTS
            );
        }

        const checkin_image = await uploadFileToS3(req.file, "attendance/checkin");

        const checkSql = `
            SELECT attendance_id
            FROM employee_attendance
            WHERE employee_id = ?
            AND DATE(checkin_time) = CURDATE()
            LIMIT 1
        `;

        db.query(checkSql, [employee_id], (checkErr, rows) => {
            if (checkErr) {
                return sendError(res, 500, "Database error", {
                    error: checkErr.message,
                });
            }

            if (rows.length > 0) {
                const attendanceId = rows[0].attendance_id;

                const updateSql = `
                    UPDATE employee_attendance
                    SET
                        employee_name = ?,
                        checkin_time = NOW(),
                        checkin_image = ?,
                        checkin_location = ?,
                        checkin_lat = ?,
                        checkin_long = ?,

                        checkout_time = NULL,
                        checkout_image = NULL,
                        checkout_location = NULL,
                        checkout_lat = NULL,
                        checkout_long = NULL,

                        status = 'Present'
                        WHERE attendance_id = ?
                `;

                db.query(
                    updateSql,
                    [
                        employee_name,
                        checkin_image,
                        checkin_location,
                        checkin_lat,
                        checkin_long,
                        attendanceId,
                    ],
                    (updateErr) => {
                        if (updateErr) {
                            return sendError(res, 500, "Database error", {
                                error: updateErr.message,
                            });
                        }

                        return sendSuccess(res, 200, {
                            message:
                                "Today's attendance already exists. Record updated successfully.",
                            attendance_id: attendanceId,
                            checkin_image,
                        });
                    }
                );

                return;
            }

            const insertSql = `
INSERT INTO employee_attendance (
    employee_id,
    employee_name,
    checkin_time,
    checkin_image,
    checkin_location,
    checkin_lat,
    checkin_long,
    status
)
VALUES (
    ?, ?, NOW(), ?, ?, ?, ?, 'Present'
)
`;

            db.query(
                insertSql,
                [
                    employee_id,
                    employee_name,
                    checkin_image,
                    checkin_location,
                    checkin_lat,
                    checkin_long,
                ],
                (insertErr, result) => {
                    if (insertErr) {
                        return sendError(res, 500, "Database error", {
                            error: insertErr.message,
                        });
                    }

                    return sendSuccess(res, 200, {
                        message: "Check-in successful",
                        attendance_id: result.insertId,
                        checkin_image,
                    });
                }
            );
        });
    } catch (error) {
        return sendError(res, 500, "Server error", { error: error.message });
    }
};

export const employeeCheckOut = async (req, res) => {
    try {
        const {
            employee_id,
            checkout_location,
            checkout_lat,
            checkout_long,
        } = req.body;

        if (!employee_id) {
            return sendError(res, 400, "employee_id is required");
        }

        if (!req.file) {
            return sendError(
                res,
                400,
                "Check-out image is required",
                IMAGE_REQUIREMENTS
            );
        }

        const checkout_image = await uploadFileToS3(
            req.file,
            "attendance/checkout"
        );

        const findSql = `
                    SELECT
                    attendance_id,
                    checkin_time,
                    checkout_time
                FROM employee_attendance
                WHERE employee_id = ?
                AND DATE(checkin_time) = CURDATE()
                AND checkout_time IS NULL
                LIMIT 1
`;

        db.query(findSql, [employee_id], (err, result) => {
            if (err) {
                return sendError(res, 500, "Database error", {
                    error: err.message,
                });
            }

            if (result.length === 0) {
                return sendError(res, 404, "No active check-in found");
            }

            const attendanceId = result[0].attendance_id;

            const updateSql = `
                    UPDATE employee_attendance
                    SET
                        checkout_time = NOW(),
                        checkout_image = ?,
                        checkout_location = ?,
                        checkout_lat = ?,
                        checkout_long = ?,
                        status =
                            CASE
                                WHEN TIMESTAMPDIFF(HOUR, checkin_time, NOW()) >= 8 THEN 'Present'
                                WHEN TIMESTAMPDIFF(HOUR, checkin_time, NOW()) >= 4 THEN 'Half Day'
                                ELSE 'Permission'
                            END
                    WHERE attendance_id = ?
                `;

            db.query(
                updateSql,
                [
                    checkout_image,
                    checkout_location,
                    checkout_lat,
                    checkout_long,
                    attendanceId,
                ],
                (updateErr) => {
                    if (updateErr) {
                        return sendError(res, 500, "Database error", {
                            error: updateErr.message,
                        });
                    }

                    return sendSuccess(res, 200, {
                        message: "Check-out successful",
                        checkout_image,
                    });
                }
            );
        });
    } catch (error) {
        return sendError(res, 500, "Server error", { error: error.message });
    }
};

//get attendance status of employee (CHECKED_IN or CHECKED_OUT)

export const getAttendanceStatus = (req, res) => {
    try {
        const { employee_id } = req.body;

        if (!employee_id) {
            return sendError(res, 400, "employee_id is required");
        }

        const sql = `
           SELECT
                attendance_id,

                DATE(checkin_time) AS checkin_date,
                TIME(checkin_time) AS checkin_time,

                DATE(checkout_time) AS checkout_date,
                TIME(checkout_time) AS checkout_time,

                status

            FROM employee_attendance
            WHERE employee_id = ?
            AND DATE(checkin_time) = CURDATE()
            ORDER BY attendance_id DESC
            LIMIT 1
        `;

        db.query(sql, [employee_id], (err, result) => {
            if (err) {
                return sendError(res, 500, "Database error", {
                    error: err.message,
                });
            }

            if (result.length === 0) {
                return sendError(res, 404, "No attendance record found for today");
            }

            return sendSuccess(res, 200, {
                data: result[0],
            });
        });
    } catch (error) {
        return sendError(res, 500, "Server error", { error: error.message });
    }
};

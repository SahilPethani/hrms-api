const Attendance = require("../models/attendanceModel");

function generateUniqueUserId(firstName, lastName, dateOfBirth) {
    const firstTwoLetters = firstName.slice(0, 2).toUpperCase();
    const firstLetterLastName = lastName.slice(0, 1).toUpperCase();
    const birthYearDigits = new Date(dateOfBirth).getFullYear().toString();

    const userId = `${firstTwoLetters}${firstLetterLastName}${birthYearDigits}`;
    return userId;
}


// ATENDESSSSSS

const calculateWorkingHours = (punches) => {
    let workingHours = 0;

    for (let i = 0; i < punches.length; i += 2) {
        const punchInTime = punches[i].punchIn.getTime();
        const punchOutTime = punches[i + 1] && punches[i + 1].punchOut ? punches[i + 1].punchOut.getTime() : new Date().getTime();
        workingHours += (punchOutTime - punchInTime) / (1000 * 60 * 60);
    }

    return workingHours;
};


const calculateOvertime = (workingHours) => {
    const standardWorkingHours = 8;
    const overtime = Math.max(workingHours - standardWorkingHours, 0);

    return overtime;
};

const calculateProductivity = (workingHours) => {
    const standardWorkingHours = 8;
    const productivity = Math.min(workingHours / standardWorkingHours, 1);

    return productivity;
};

const getDayName = (dayIndex) => {
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return daysOfWeek[dayIndex];
};

const formatTotalWorkingHours = (totalHours) => {
    const hours = Math.floor(totalHours);
    const minutes = Math.round((totalHours - hours) * 60);

    const formattedHours = hours.toString().padStart(2, '0');
    const formattedMinutes = minutes.toString().padStart(2, '0');

    return `${formattedHours}h:${formattedMinutes}m`;
};

const formatMinutesToTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    const formattedHours = hours.toString().padStart(2, '0');
    const formattedMinutes = remainingMinutes.toString().padStart(2, '0');

    return `${formattedHours}h:${formattedMinutes}m`;
};

const getEmployeeAttendanceStatistics = async (employeeId) => {
    try {
        const currentDateIST = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
        const currentDate = new Date(currentDateIST);
        currentDate.setHours(0, 0, 0, 0);

        const todayAttendanceRecord = await Attendance.findOne({
            date: currentDate,
            "attendanceDetails.employeeId": employeeId,
        });

        if (!todayAttendanceRecord) {
            return {
                todayHours: 0,
                thisWeekHours: 0,
                thisMonthHours: 0,
                overtimeToday: 0,
            };
        }

        const employeeDetails = todayAttendanceRecord.attendanceDetails.find(
            (detail) => detail.employeeId.equals(employeeId)
        );

        let todayHours = 0;
        let overtimeToday = 0;

        if (employeeDetails.punches.length > 0) {
            const firstPunch = new Date(employeeDetails.punches[0]?.punchIn);
            const lastPunch = employeeDetails.punches.slice(-1)[0].punchOut || null;
            const lastPunchTime = lastPunch ? new Date(lastPunch) : null;

            if (lastPunchTime) {
                const totalHours = (lastPunchTime - firstPunch) / (1000 * 60 * 60);
                todayHours = totalHours.toFixed(2);

                const overtimeStartTime = new Date(currentDate);
                overtimeStartTime.setHours(18, 30, 0, 0); // 6:30 PM IST
                const lastPunchOut = lastPunchTime.getTime();

                if (lastPunchOut > overtimeStartTime.getTime()) {
                    const overtimeMilliseconds = lastPunchOut - overtimeStartTime.getTime();
                    const overtimeHours = overtimeMilliseconds / (1000 * 60 * 60);
                    overtimeToday = overtimeHours.toFixed(2); // Convert hours to a fixed format
                }
            }
        }

        // Calculate hours worked this week and this month
        const startOfWeek = new Date(currentDate);
        startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay()); // Start of the week (Sunday)
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(endOfWeek.getDate() + 6); // End of the week (Saturday)

        const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

        // Placeholder logic, replace with your calculations
        let thisWeekHours = 0;
        let thisMonthHours = 0;

        if (employeeDetails && employeeDetails.attendanceDetails) {
            employeeDetails.attendanceDetails.forEach((attendanceRecord) => {
                if (attendanceRecord.punches) {
                    attendanceRecord.punches.forEach((punch) => {
                        const punchInTime = new Date(punch.punchIn).getTime();
                        // Week calculation
                        if (punchInTime >= startOfWeek.getTime() && punchInTime <= endOfWeek.getTime()) {
                            const lastPunch = punch.punchOut || null;
                            const lastPunchTime = lastPunch ? new Date(lastPunch).getTime() : null;

                            if (lastPunchTime) {
                                const totalHours = (lastPunchTime - punchInTime) / (1000 * 60 * 60);
                                thisWeekHours += totalHours;
                            }
                        }
                        // Month calculation
                        if (punchInTime >= startOfMonth.getTime() && punchInTime <= endOfMonth.getTime()) {
                            const lastPunch = punch.punchOut || null;
                            const lastPunchTime = lastPunch ? new Date(lastPunch).getTime() : null;

                            if (lastPunchTime) {
                                const totalHours = (lastPunchTime - punchInTime) / (1000 * 60 * 60);
                                thisMonthHours += totalHours;
                            }
                        }
                    });
                }
            });
        }

        return {
            todayHours: todayHours,
            thisWeekHours: thisWeekHours.toFixed(2),
            thisMonthHours: thisMonthHours.toFixed(2),
            overtimeToday: overtimeToday,
        };
    } catch (error) {
        console.error(error); 
        return {
            success: false,
            message: error.message || "Error retrieving attendance statistics",
            data: null,
        };
    }
};

module.exports = {
    generateUniqueUserId,
    calculateWorkingHours,
    calculateOvertime,
    calculateProductivity,
    calculateWorkingHours,
    getDayName,
    formatTotalWorkingHours,
    formatMinutesToTime,
    getEmployeeAttendanceStatistics
};
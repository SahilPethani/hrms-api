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

const formatHoursMinutes = (hours) => {
    const formattedHours = Math.floor(hours).toString().padStart(2, '0');
    const formattedMinutes = Math.floor((hours % 1) * 60).toString().padStart(2, '0');
    return `${formattedHours}h:${formattedMinutes}m`;
};

const getStartAndEndOfWeek = (date) => {
    const currentDate = date || new Date();
    const currentDay = currentDate.getDay();
    const startDate = new Date(currentDate);
    startDate.setDate(currentDate.getDate() - currentDay); // Start of the week (Sunday)
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6); // End of the week (Saturday)
    endDate.setHours(23, 59, 59, 999);

    return { startDate, endDate };
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
                todayHours: formatHoursMinutes(0),
                thisWeekHours: formatHoursMinutes(0),
                thisMonthHours: formatHoursMinutes(0),
            };
        }

        const startOfWeek = new Date(currentDate);
        startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay()); // Start of the week (Sunday)
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(endOfWeek.getDate() + 6); // End of the week (Saturday)

        const employeeDetailsThisWeek = todayAttendanceRecord.attendanceDetails.find(
            (detail) => detail.employeeId.equals(employeeId) &&
                detail.punches.some(punch =>
                    new Date(punch.punchIn).getTime() >= startOfWeek.getTime() &&
                    new Date(punch.punchIn).getTime() <= endOfWeek.getTime()
                )
        );

        let todayHours = 0;
        let thisWeekHours = 0;
        let thisMonthHours = 0;

        if (employeeDetailsThisWeek && employeeDetailsThisWeek.punches.length > 0) {
            const firstPunchThisWeek = new Date(employeeDetailsThisWeek.punches[0]?.punchIn);
            const currentTime = new Date();

            // Find the last punch-out time within today's punches
            const lastPunchOutToday = employeeDetailsThisWeek.punches[employeeDetailsThisWeek.punches.length - 1]
            console.log("🚀 ~ file: helper.js:131 ~ getEmployeeAttendanceStatistics ~ lastPunchOutToday:", lastPunchOutToday.punchIn)

            // Calculate hours between first punch in this week and the last punch-out time, but not more than 8 hours
            let totalTodayHours = Math.min((lastPunchOutToday - firstPunchThisWeek) / (1000 * 60 * 60), 8);

            // Calculate total hours for this week, not exceeding 48 hours
            thisWeekHours = Math.min(thisWeekHours + totalTodayHours, 48);
            todayHours = totalTodayHours;
        }

        // ... (rest of the code for thisMonthHours, if needed)

        return {
            todayHours: formatHoursMinutes(todayHours),
            thisWeekHours: formatHoursMinutes(thisWeekHours),
            thisMonthHours: formatHoursMinutes(thisMonthHours),
            employeeDetailsThisWeek
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
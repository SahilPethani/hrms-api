function generateUniqueUserId(firstName, lastName, dateOfBirth) {
    const firstTwoLetters = firstName.slice(0, 2).toUpperCase();
    const firstLetterLastName = lastName.slice(0, 1).toUpperCase();
    const birthYearDigits = new Date(dateOfBirth).getFullYear().toString();

    const userId = `${firstTwoLetters}${firstLetterLastName}${birthYearDigits}`;
    return userId;
}


const getAttendance = async (employeeId, date) => {
    try {
        const currentDate = date || new Date().setHours(0, 0, 0, 0);

        const todayAttendance = await Attendance.findOne({
            date: currentDate,
            "attendanceDetails.employeeId": employeeId,
        });

        return todayAttendance;
    } catch (error) {
        throw error;
    }
};

const calculateWorkingHours = (punches) => {
    // Calculate working hours based on punches (considering punchIn and punchOut alternately)
    let workingHours = 0;

    for (let i = 0; i < punches.length; i += 2) {
        const punchInTime = punches[i].punchIn.getTime();
        const punchOutTime = punches[i + 1] ? punches[i + 1].punchOut.getTime() : new Date().getTime();
        workingHours += (punchOutTime - punchInTime) / (1000 * 60 * 60); // Convert milliseconds to hours
    }

    return workingHours;
};

const calculateOvertime = (workingHours) => {
    // Calculate overtime if working hours exceed 8 hours
    const standardWorkingHours = 8;
    const overtime = Math.max(workingHours - standardWorkingHours, 0);

    return overtime;
};

const calculateProductivity = (workingHours) => {
    // Calculate productivity if working hours are within 8 hours
    const standardWorkingHours = 8;
    const productivity = Math.min(workingHours / standardWorkingHours, 1);

    return productivity;
};



module.exports = {
    generateUniqueUserId,
    getAttendance,
    calculateWorkingHours,
    calculateOvertime,
    calculateProductivity
};

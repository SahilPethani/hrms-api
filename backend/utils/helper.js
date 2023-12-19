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

function isDuringTimeRange(date, startTime, endTime) {
    const currentTime = new Date(date).toLocaleTimeString('en-US', { hour12: false });
    return currentTime >= startTime && currentTime <= endTime;
}

module.exports = {
    generateUniqueUserId,
    calculateWorkingHours,
    getDayName,
    formatTotalWorkingHours,
    isDuringTimeRange
};
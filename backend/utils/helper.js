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
        const punchOutTime = punches[i + 1] ? punches[i + 1].punchOut.getTime() : new Date().getTime();
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



module.exports = {
    generateUniqueUserId,
    calculateWorkingHours,
    calculateOvertime,
    calculateProductivity
};

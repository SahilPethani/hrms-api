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
        console.log("🚀 ~ file: helper.js:17 ~ calculateWorkingHours ~ length: 1", punches[i + 1] && punches[i + 1].punchOut ? punches[i + 1].punchOut.getTime() : new Date().getTime())
        workingHours += (punchOutTime - punchInTime) / (1000 * 60 * 60);
    }

    console.log("🚀 ~ file: helper.js:21 ~ calculateWorkingHours ~ workingHours: 123", workingHours)

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

const calculateAverageInTime = (punches) => {
    console.log("🚀 ~ file: helper.js:41 ~ calculateAverageInTime ~ punches:", punches)
    // Filter out invalid or missing punchIn values
    const validPunches = punches.filter(punch => punch && punch.punchIn && !isNaN(new Date(punch.punchIn).getTime()));
    console.log("🚀 ~ file: helper.js:43 ~ calculateAverageInTime ~ validPunches: 2", validPunches)

    if (validPunches.length === 0) {
        return null;
    }

    const totalMilliseconds = validPunches.reduce((total, punch) => {
        const punchInTime = new Date(punch.punchIn).getTime();
        return total + punchInTime;
    }, 0);

    const averageMilliseconds = totalMilliseconds / validPunches.length;

    if (!isNaN(averageMilliseconds)) {
        const averageTime = new Date(averageMilliseconds);
        return `${averageTime.getHours()}:${averageTime.getMinutes()}`;
    } else {
        return null;
    }
};


const calculateAverageOutTime = (punches) => {
    const punchOuts = punches.filter((punch) => punch.type === 'punchOut');

    if (punchOuts.length > 0) {
        const totalMilliseconds = punchOuts.reduce((total, punch) => {
            // console.log("🚀 ~ file: helper.js:63 ~ totalMilliseconds ~ punch:", punch)
            const punchOutTime = punch.punchOut ? new Date(punch.punchOut).getTime() : 0;
            return total + punchOutTime;
        }, 0);

        const averageMilliseconds = totalMilliseconds / punchOuts.length;
        const averageTime = new Date(averageMilliseconds);

        return `${averageTime.getHours()}:${averageTime.getMinutes()}`;
    } else {
        return null;
    }
};

const calculateAverageOvertime = (punches) => {
    if (punches.length === 0) {
        return 0;
    }

    const totalOvertime = punches.reduce((total, punch) => total + punch.overtime, 0);
    const averageOvertime = totalOvertime / punches.length;

    return averageOvertime;
};

const calculateStatus = (punches) => {
    if (punches.length === 0) {
        return null;
    }

    const isAbsent = punches.every((punch) => punch.type === 'absent');
    return isAbsent ? 'Absent' : 'Present';
};

module.exports = {
    generateUniqueUserId,
    calculateWorkingHours,
    calculateOvertime,
    calculateProductivity,
    calculateWorkingHours,
    calculateAverageInTime,
    calculateAverageOutTime,
    calculateAverageOvertime,
    calculateStatus,
};

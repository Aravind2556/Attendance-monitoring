exports.isWithinGraceTime = (startTime, graceMinutes = 5) => {
    const now = new Date();
    const [h, m] = startTime.split(":").map(Number);

    const classTime = new Date();
    classTime.setHours(h, m, 0, 0);

    const diff = (now - classTime) / 60000;
    return diff >= 0 && diff <= graceMinutes;
};
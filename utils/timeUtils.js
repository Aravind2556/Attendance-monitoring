// returns true when time is <= 09:15
exports.isBefore0915 = (date = new Date()) => {
    const d = new Date(date);
    const h = d.getHours();
    const m = d.getMinutes();
    if (h < 9) return true;
    if (h === 9 && m <= 15) return true;
    return false;
};

// helper to get ISO date string YYYY-MM-DD
exports.toDateString = (date = new Date()) => {
    const d = new Date(date);
    return d.toISOString().split('T')[0];
};

exports.getDateRangeOfWeek = (week, month, year) => {
  const firstDayOfMonth = new Date(year, month - 1, 1);
  let startDate = new Date(firstDayOfMonth);

  const firstDayWeekday = firstDayOfMonth.getDay() || 7;
  const offset = (week - 1) * 7 - (firstDayWeekday - 1);
  startDate.setDate(startDate.getDate() + offset);

  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + 6);

  return {
    startDate: startDate.toISOString().slice(0, 10),
    endDate: endDate.toISOString().slice(0, 10),
  };
}
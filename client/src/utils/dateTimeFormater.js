export function getWeekOfMonth(date) {
  const adjustedDate = date.getDate() + new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  return Math.ceil(adjustedDate / 7)
}

export function getMondayToFridayDates(week, month, year) {
  const firstDay = new Date(Date.UTC(year, month - 1, 1))
  const firstDayOfWeek = firstDay.getUTCDay() || 7
  const daysOffset = (week - 1) * 7 + (1 - firstDayOfWeek)
  const monday = new Date(Date.UTC(year, month - 1, 1 + daysOffset))

  return Array.from({ length: 5 }).map((_, i) => {
    const d = new Date(monday)
    d.setUTCDate(monday.getUTCDate() + i)
    return d.toISOString().split('T')[0]
  })
}

export function getTimeFromDateTime(datetime) {
  const time = new Date(datetime).toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  })

  return time.replace('.', ':')
}

export function getDateFromDateTime(datetime) {
  const formatted = new Date(datetime).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })

  return formatted.replace(/\//g, '-')
}

export function getDateWithMonthString(datetime) {
  const formatted = new Date(datetime).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  })

  return formatted
}

export function getDateRange(start, end) {
  const startDate = new Date(start)
  const endDate = new Date(end)

  const sameDay =
    startDate.getDate() === endDate.getDate() &&
    startDate.getMonth() === endDate.getMonth() &&
    startDate.getFullYear() === endDate.getFullYear();

  const sameMonth =
    startDate.getMonth() === endDate.getMonth() &&
    startDate.getFullYear() === endDate.getFullYear();

  const sameYear = startDate.getFullYear() === endDate.getFullYear();

  const optionsFull = { day: 'numeric', month: 'short', year: 'numeric' };
  const optionsDay = { day: 'numeric' };
  const optionsDayMonth = { day: 'numeric', month: 'short' };
  const optionsMonthYear = { month: 'short', year: 'numeric' };

  if (sameDay) {
    return startDate.toLocaleDateString('id-ID', optionsFull);
  } else if (sameMonth) {
    return `${startDate.toLocaleDateString('id-ID', optionsDay)} - ${endDate.toLocaleDateString('id-ID', optionsDay)} ${endDate.toLocaleDateString('id-ID', optionsMonthYear)}`;
  } else if (sameYear) {
    return `${startDate.toLocaleDateString('id-ID', optionsDayMonth)} - ${endDate.toLocaleDateString('id-ID', optionsDayMonth)} ${endDate.getFullYear()}`;
  } else {
    return `${startDate.toLocaleDateString('id-ID', optionsFull)} - ${endDate.toLocaleDateString('id-ID', optionsFull)}`;
  }
}
export const getYears = () => {
  const currentYear = new Date().getFullYear()
  return Array.from({ length: 5 }, (_, i) => currentYear - i)
}

export const getMonths = () => {
  return Array.from({ length: 12 }, (_, i) =>
    new Intl.DateTimeFormat('id-ID', { month: 'long' }).format(new Date(2000, i))
  )
}

export const getWeeks = () => {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const firstDay = new Date(year, month, 1)
  const firstWeekday = firstDay.getDay() === 0 ? 0 : firstDay.getDay()
  const totalWeeks = Math.ceil((daysInMonth + firstWeekday - 1) / 7)
  return Array.from({ length: totalWeeks }, (_, i) => i + 1)
}

export const getDatesOfMonth = (year, month) => {
  const daysInMonth = new Date(year, month, 0).getDate()
  return Array.from({ length: daysInMonth }, (_, i) => i + 1)
}
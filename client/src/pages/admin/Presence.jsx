import React, { useState, useEffect, useMemo } from 'react'
import DataTable, { Alignment } from 'react-data-table-component'
import { getWeekOfMonth, getTimeFromDateTime } from '../../utils/dateTimeFormater'
import { getWeeks, getDatesOfMonth, getMonths, getYears } from '../../utils/date'
import Loading from '../../components/Loading'
import Cookies from 'js-cookie'
import ExcelJS from 'exceljs'
import { saveAs } from 'file-saver'

const Presence = () => {
  const [presences, setPresences] = useState([])
  const [timeoffs, setTimeoffs] = useState([])
  const [filterText, setFilterText] = useState('')
  const [dateGrouping, setDateGrouping] = useState({
    daily: false,
    weekly: true,
    monthly: false
  })

  const [loading, setLoading] = useState(true)
  const [date, setDate] = useState({
    day: new Date().getUTCDate(),
    week: getWeekOfMonth(new Date),
    month: new Date().getUTCMonth() + 1,
    year: new Date().getUTCFullYear()
  })

  const token = Cookies.get('access-token')

  const loadData = async () => {
    setLoading(true)

    try {
      let presenceUrl = `/api/presence-recap?month=${date.month}&year=${date.year}`
      let timeoffUrl = `/api/timeoffs?month=${date.month}&year=${date.year}`

      if (dateGrouping.weekly) {
        presenceUrl += `&week=${date.week}`
        timeoffUrl += `&week=${date.week}`
      }
      if (dateGrouping.daily) {
        presenceUrl += `&day=${date.day}`
        timeoffUrl += `&day=${date.day}`
      }

      const [presenceRes, timeoffRes] = await Promise.all([
        fetch(presenceUrl, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token,
          },
        }),
        fetch(timeoffUrl, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token,
          },
        }),
      ])

      const [presenceData, timeoffData] = await Promise.all([
        presenceRes.json(),
        timeoffRes.json()
      ])
      
      setPresences(presenceData.data ? presenceData.data : [])
      setTimeoffs(timeoffData.data ? timeoffData.data : [])
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }
  
  useEffect(() => {
    loadData()
  }, [dateGrouping, date])

  const columns = [
    {
      name: 'Tanggal',
      selector: row => row.date,
      sortable: true,
    },
    {
      name: 'Nama',
      selector: row => row.name,
      sortable: true,
    },
    {
      name: 'Pagi',
      selector: row => row.morning.time != null ? getTimeFromDateTime(row.morning.time) : '-',
      sortable: true,
    },
    {
      name: 'Siang',
      selector: row => row.afternoon.time != null ? getTimeFromDateTime(row.afternoon.time) : '-',
      sortable: true,
    },
    {
      name: 'Sore',
      selector: row => row.evening.time != null ? getTimeFromDateTime(row.evening.time) : '-',
      sortable: true,
    },
    {
      name: 'Keterangan',
      selector: row => {
        let value = ''

        const [id, date] = row.id.split('|')
        const timeoff = timeoffs.filter((item) => item.employees_id == id && (new Date(item.start_date) <= new Date(date) && new Date(item.end_date) >= new Date(date)))

        if (timeoff.length != 0) {
          value += `${timeoff[0].title}`
        } else {
          if (row.morning.description != null) value += `Pagi: ${row.morning.description}\n`
          if (row.afternoon.description != null) value += `Siang: ${row.afternoon.description}\n`
          if (row.evening.description != null) value += `Sore: ${row.evening.description}`
        }
        
        if (value == '') return '-'

        return (
          <p className='whitespace-pre-line'>{value}</p>
        )
      },
      sortable: true,
    },
    {
      name: 'Lokasi',
      selector: row => {
        if (row.morning.location == null && row.afternoon.location == null && row.evening.location == null) {
          return '-'
        }

        return (
          <div className='flex gap-3'>
            {row.morning.location && <a href={`https://www.google.com/maps?q=${row.morning.location.coordinates[0]},${row.morning.location.coordinates[1]}`} target='_blank' className='text-primary underline'>Pagi</a>}
            {row.afternoon.location && <a href={`https://www.google.com/maps?q=${row.afternoon.location.coordinates[0]},${row.afternoon.location.coordinates[1]}`} target='_blank' className='text-primary underline'>Siang</a>}
            {row.evening.location && <a href={`https://www.google.com/maps?q=${row.evening.location.coordinates[0]},${row.evening.location.coordinates[1]}`} target='_blank' className='text-primary underline'>Sore</a>}          
          </div>
        )
      },
      grow: 2
    }
  ]

  const downloadExcel = async (data) => {
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('Sheet1')

    worksheet.columns = [
      { header: 'Tanggal', key: 'date', width: 30 },
      { header: 'Nama', key: 'name', width: 30 },
      { header: 'Pagi', key: 'morning', width: 10 },
      { header: 'Siang', key: 'afternoon', width: 10 },
      { header: 'Sore', key: 'evening', width: 10 },
      { header: 'Keterangan', key: 'description', width: 50 }
    ]

    data.forEach((item) => {
      let description = ''
      if (item.morning.description != null) description += `Pagi: ${item.morning.description}\n`
      if (item.afternoon.description != null) description += `Siang: ${item.afternoon.description}\n`
      if (item.evening.description != null) description += `Sore: ${item.evening.description}`

      const flatItem = {
        date: item.date,
        name: item.name,
        morning: item.morning.time != null ? getTimeFromDateTime(item.morning.time) : '-',
        afternoon: item.afternoon.time != null ? getTimeFromDateTime(item.afternoon.time) : '-',
        evening: item.evening.time != null ? getTimeFromDateTime(item.evening.time) : '-',
        description: description != '' ? description : '-'
      }

      worksheet.addRow(flatItem)
    })

    const buffer = await workbook.xlsx.writeBuffer()
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    })
    saveAs(blob, 'rekap-absensi.xlsx')
  }

  const handleGrouping = (group) => {
    setDateGrouping({
      daily: group === 'daily',
      weekly: group === 'weekly',
      monthly: group === 'monthly'
    })
  }

  const handleChange = (type, value) => {
    if (type === 'week') setDate({ ...date, week: value })
    if (type === 'month') setDate({ ...date, month: value })
    if (type === 'year') setDate({ ...date, year: value })
    if (type === 'day') setDate({ ...date, day: value })
  }

  const filteredItems = presences.filter(item => (item.name && item.name.toLowerCase().includes(filterText.toLowerCase()))
                       || (item.date && item.date.toLowerCase().includes(filterText.toLowerCase()))
                       || (item.morning.description && item.morning.description.toLowerCase().includes(filterText.toLowerCase()))
                       || (item.afternoon.description && item.afternoon.description.toLowerCase().includes(filterText.toLowerCase()))
                       || (item.evening.description && item.evening.description.toLowerCase().includes(filterText.toLowerCase())))
  const subHeaderComponentMemo = useMemo(() => {
    return (
      <div className='w-full flex flex-col justify-end gap-3 mb-3'>
        <div className='w-full flex flex-wrap gap-3 justify-between'>
          <div className='w-full md:max-w-64 relative'>
            <svg className='absolute left-2 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400' xmlns='http://www.w3.org/2000/svg' height='24px' viewBox='0 -960 960 960' width='24px' fill='currentColor'>
              <path d='M380-320q-109 0-184.5-75.5T120-580q0-109 75.5-184.5T380-840q109 0 184.5 75.5T640-580q0 44-14 83t-38 69l224 224q11 11 11 28t-11 28q-11 11-28 11t-28-11L532-372q-30 24-69 38t-83 14Zm0-80q75 0 127.5-52.5T560-580q0-75-52.5-127.5T380-760q-75 0-127.5 52.5T200-580q0 75 52.5 127.5T380-400Z'/>
            </svg>
            <input type='text' value={filterText} onChange={e => setFilterText(e.target.value)} placeholder='Cari data...' className='w-full pl-8 pr-2 py-1.5 text-sm text-black outline-none rounded-lg border border-gray-400 focus:border-primary' />
            {filterText != '' && (
              <button type='button' onClick={() => setFilterText('')} className='absolute right-2 top-1/2 -translate-y-1/2'>
                <svg className='w-5 h-5 p-0.5 text-grey rounded-full hover:bg-grey-light/50' xmlns='http://www.w3.org/2000/svg' height='24px' viewBox='0 -960 960 960' width='24px' fill='currentColor'>
                  <path d='M480-424 284-228q-11 11-28 11t-28-11q-11-11-11-28t11-28l196-196-196-196q-11-11-11-28t11-28q11-11 28-11t28 11l196 196 196-196q11-11 28-11t28 11q11 11 11 28t-11 28L536-480l196 196q11 11 11 28t-11 28q-11 11-28 11t-28-11L480-424Z'/>
                </svg>
              </button>
            )}
          </div>
          <button onClick={() => downloadExcel(presences)} className='flex items-center gap-2 px-3 py-2 text-white text-sm font-medium bg-primary rounded-lg hover:bg-primary/80'>
            <span>Export Excel</span>
            <svg className='w-5 h-5' xmlns='http://www.w3.org/2000/svg' height='24px' viewBox='0 -960 960 960' width='24px' fill='currentColor'>
              <path d='M480-337q-8 0-15-2.5t-13-8.5L308-492q-12-12-11.5-28t11.5-28q12-12 28.5-12.5T365-549l75 75v-286q0-17 11.5-28.5T480-800q17 0 28.5 11.5T520-760v286l75-75q12-12 28.5-11.5T652-548q11 12 11.5 28T652-492L508-348q-6 6-13 8.5t-15 2.5ZM240-160q-33 0-56.5-23.5T160-240v-80q0-17 11.5-28.5T200-360q17 0 28.5 11.5T240-320v80h480v-80q0-17 11.5-28.5T760-360q17 0 28.5 11.5T800-320v80q0 33-23.5 56.5T720-160H240Z'/>
            </svg>
          </button>
        </div>
        <div className='w-full flex flex-wrap gap-3 justify-between'>
          <div className='inline-flex rounded-md' role='group'>
            <button type='button' onClick={() => handleGrouping('daily')} className={`w-fit h-fit px-4 py-2 text-sm font-medium border ${dateGrouping.daily ? 'text-white bg-primary border-primary hover:bg-primary/[0.9]' : 'text-gray-900 bg-white  border-gray-200 hover:bg-gray-100 hover:text-primary'} rounded-s-lg focus:z-10`}>
              Harian
            </button>
            <button type='button' onClick={() => handleGrouping('weekly')} className={`w-fit h-fit px-4 py-2 text-sm font-medium border-t border-b ${dateGrouping.weekly ? 'text-white bg-primary border-primary hover:bg-primary/[0.9]' : 'text-gray-900 bg-white  border-gray-200 hover:bg-gray-100 hover:text-primary'} focus:z-10`}>
              Mingguan
            </button>
            <button type='button' onClick={() => handleGrouping('monthly')} className={`w-fit h-fit px-4 py-2 text-sm font-medium border ${dateGrouping.monthly ? 'text-white bg-primary border-primary hover:bg-primary/[0.9]' : 'text-gray-900 bg-white  border-gray-200 hover:bg-gray-100 hover:text-primary'} rounded-e-lg focus:z-10`}>
              Bulanan
            </button>
          </div>
          <div className='flex items-center justify-end gap-2 px-4 py-2'>
            {dateGrouping.weekly && <span className='hidden md:block text-gray-600'>Minggu ke-</span>}
            {dateGrouping.weekly && (
              <select defaultValue={date.week} onChange={(e) => handleChange('week', parseInt(e.target.value))} className='border border-gray-300 rounded-lg px-2 py-1 text-sm'>
                {getWeeks().map((week) => (
                  <option key={week} value={week}>
                    {week}
                  </option>
                ))}
              </select>
            )}

            {dateGrouping.daily && (
              <select defaultValue={date.day} onChange={(e) => handleChange('day', parseInt(e.target.value))} className='border border-gray-300 rounded-lg px-2 py-1 text-sm'>
                {getDatesOfMonth(date.year, date.month).map((day) => (
                  <option key={day} value={day}>
                    {day}
                  </option>
                ))}
              </select>
            )}

            <select defaultValue={date.month} onChange={(e) => handleChange('month', parseInt(e.target.value))} className='border border-gray-300 rounded-lg px-2 py-1 text-sm'>
              {getMonths().map((month, idx) => (
                <option key={idx} value={idx + 1}>
                  {month}
                </option>
              ))}
            </select>

            <select defaultValue={date.year} onChange={(e) => handleChange('year', parseInt(e.target.value))} className='border border-gray-300 rounded-lg px-2 py-1 text-sm'>
              {getYears().map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    )
  }, [filterText, dateGrouping, presences])

  const progressComponent = useMemo(() => {
    return (
      <div className='p-4'>
        <Loading size={36} />
      </div>
    )
  }, [])

  return (
    <main className='h-full'>
      <div className='flex flex-col gap-6 p-6 mx-auto'>
        <h2 className='font-semibold text-gray-700'>Rekap Absensi</h2>
        <div className='custom-table bg-white text-sm px-2 py-3 rounded-lg shadow-sm overflow-hidden'>
          <DataTable
            subHeader
            pagination
            persistTableHead
            columns={columns}
            data={filteredItems}
            progressPending={loading}
            progressComponent={progressComponent}
            subHeaderAlign={Alignment.LEFT}
            subHeaderComponent={subHeaderComponentMemo}
          />
        </div>
      </div>
    </main>
  )
}

export default Presence
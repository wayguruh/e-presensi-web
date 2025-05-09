import React, { useState, useEffect, useMemo } from 'react'
import DataTable, { Alignment } from 'react-data-table-component'
import { getWeekOfMonth, getTimeFromDateTime, getDateWithMonthString } from '../utils/dateTimeFormater'
import { getWeeks, getDatesOfMonth, getMonths, getYears } from '../utils/date'
import { isAuth } from '../utils/auth'
import Loading from '../components/Loading'
import Cookies from 'js-cookie'

const Presence = () => {
  const [presences, setPresences] = useState([])
  const [filterText, setFilterText] = useState('')
  const [dateGrouping, setDateGrouping] = useState({
    weekly: true,
    monthly: false
  })

  const [loading, setLoading] = useState(true)
  const [date, setDate] = useState({
    week: getWeekOfMonth(new Date),
    month: new Date().getUTCMonth() + 1,
    year: new Date().getUTCFullYear()
  })

  const loadData = async () => {
    setLoading(true)
    
    try {
      const token = Cookies.get('access-token')
      const { user } = isAuth()

      if (!user) {
        throw Error('Token Invalid!')
      }

      const employeeRes = await fetch(`/api/employees?userId=${user.id}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        }
      })

      const data = await employeeRes.json()
      const employeeData = data.data[0]

      let url = `/api/presences?employeeId=${employeeData.id}&month=${date.month}&year=${date.year}`

      if (dateGrouping.weekly) url += `&week=${date.week}`

      const presenceRes = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token,
        },
      })

      const presenceData = await presenceRes.json()
      setPresences(presenceData.data ? presenceData.data : [])
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
      selector: row => getDateWithMonthString(row.createdAt),
      sortable: true,
    },
    {
      name: 'Jam',
      selector: row => getTimeFromDateTime(row.createdAt),
      sortable: true,
    },
    {
      name: 'Keterangan',
      selector: row => {
        let value = ''
        if (row.description != null) value += `Ket: ${row.description}`
        
        if (value == '') return '-'

        return (
          <p className='whitespace-pre-line'>{value}</p>
        )
      },
      sortable: true,
    },
    {
      name: 'Lokasi',
      selector: row => row.location ? <a href={`https://www.google.com/maps?q=${row.location.coordinates[0]},${row.location.coordinates[1]}`} target='_blank' className='text-primary underline'>Lihat</a> : '-'
    }
  ]

  const handleGrouping = (group) => {
    setDateGrouping({
      weekly: group === 'weekly',
      monthly: group === 'monthly'
    })
  }

  const handleChange = (type, value) => {
    if (type === 'week') setDate({ ...date, week: value })
    if (type === 'month') setDate({ ...date, month: value })
    if (type === 'year') setDate({ ...date, year: value })
  }

  const filteredItems = presences.filter(item => (item.createdAt && item.createdAt.toLowerCase().includes(filterText.toLowerCase()))
                       || (item.description && item.description.toLowerCase().includes(filterText.toLowerCase())))
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
          <div className='inline-flex rounded-md' role='group'>
            <button type='button' onClick={() => handleGrouping('weekly')} className={`px-4 py-2 text-sm font-medium border ${dateGrouping.weekly ? 'text-white bg-primary border-primary hover:bg-primary/[0.9]' : 'text-gray-900 bg-white  border-gray-200 hover:bg-gray-100 hover:text-primary'} rounded-s-lg focus:z-10`}>
              Mingguan
            </button>
            <button type='button' onClick={() => handleGrouping('monthly')} className={`px-4 py-2 text-sm font-medium border ${dateGrouping.monthly ? 'text-white bg-primary border-primary hover:bg-primary/[0.9]' : 'text-gray-900 bg-white  border-gray-200 hover:bg-gray-100 hover:text-primary'} rounded-e-lg focus:z-10`}>
              Bulanan
            </button>
          </div>
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
    )
  }, [filterText, dateGrouping])

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
        <h2 className='font-semibold text-gray-700'>Riwayat Absensi</h2>
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
import React, { useEffect, useState } from 'react'
import Cookies from 'js-cookie'
import { isAuth } from '../../utils/auth'
import { calculateDistance } from '../../utils/location'
import { getWeekOfMonth, getMondayToFridayDates } from '../../utils/dateTimeFormater'
import Loading from '../../components/Loading'
import TotalCard from '../../components/cards/TotalCard'
import BarChart from '../../components/BarChart'
import LineChart from '../../components/LineChart'
import PresenceCard from '../../components/cards/PresenceCard'
import TimeoffCard from '../../components/cards/TimeoffCard'
import ConfirmLocationModal from '../../components/modals/ConfirmLocationModal'
import TimeoffDetailModal from '../../components/modals/TimeoffDetailModal'
import toast from 'react-hot-toast'
import { useGeolocated } from 'react-geolocated'

const OFFICE_LAT = -5.0631451
const OFFICE_LONG = 105.5366387
const ALLOWED_DISTANCE = 50

const Dashboard = () => {
  const [todayPresence, setTodayPresence] = useState([])
  const [todayTimeoff, setTodayTimeoff] = useState(0)
  const [totalEmployee, setTotalEmployee] = useState(0)
  const [pendingTimeoff, setPendingTimeoff] = useState(0)

  const [latestPresences, setLatestPresences] = useState([])
  const [latestTimeoffs, setLatestTimeoffs] = useState([])

  const [barDatasets, setBarDatasets] = useState([])
  const [lineDatasets, setLineDatasets] = useState([])

  const [loading, setLoading] = useState(true)
  const [presenceLoading, setPresenceLoading] = useState(false)
  const [openLoading, setOpenLoading] = useState(false)

  const [isOpen, setIsOpen] = useState(false)
  const [isShowTimeoff, setIsShowTimeoff] = useState(false)
  const [timeoff, setTimeoff] = useState()

  const [presence, setPresence] = useState()
  const [description, setDescription] = useState('')
  const [isShowModal, setIsShowModal] = useState()

  const [date, setDate] = useState(new Date())

  const labels = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat']

  const loadData = async () => {
    try {
      const token = Cookies.get('access-token')
      const week = getWeekOfMonth(date)
      const month = date.getUTCMonth() + 1
      const year = date.getUTCFullYear()

      const [todayPresenceRes, todayTimeoffRes,
             weeklyTimeoffRes, pendingTimeoffRes,
             presenceRecapRes, latestPresenceRes,
             latestTimeoffRes, buttonStatusRes,
             totalEmployeeRes] = await Promise.all([
        fetch(`/api/presence-recap?day=${date.getUTCDate()}&month=${month}&year=${year}`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token,
          },
        }),
        fetch(`/api/timeoffs?status=APPROVED&day=${date.getUTCDate()}&month=${month}&year=${year}`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token,
          },
        }),
        fetch(`/api/timeoffs?status=APPROVED&week=${week}&month=${month}&year=${year}`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token,
          },
        }),
        fetch(`/api/timeoffs?status=PENDING`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token,
          },
        }),
        fetch(`/api/presence-recap?week=${week}&month=${month}&year=${year}`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token,
          },
        }),
        fetch(`/api/presences?limit=6`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token,
          },
        }),
        fetch(`/api/timeoffs?limit=6`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token,
          },
        }),
        fetch(`/api/open`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token,
          },
        }),
        fetch(`/api/total-employees`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token,
          },
        })
      ])

      const [todayPresenceData, todayTimeoffData,
             weeklyTimeoffData, pendingTimeoffData,
             presenceRecapData, latestPresenceData,
             latestTimeoffData, buttonStatusData,
             totalEmployeeData] = await Promise.all([
        todayPresenceRes.json(),
        todayTimeoffRes.json(),
        weeklyTimeoffRes.json(),
        pendingTimeoffRes.json(),
        presenceRecapRes.json(),
        latestPresenceRes.json(),
        latestTimeoffRes.json(),
        buttonStatusRes.json(),
        totalEmployeeRes.json()
      ])

      setTodayPresence(todayPresenceData.data ? todayPresenceData.data : [])
      setTodayTimeoff(todayTimeoffData.total ? todayTimeoffData.total : 0)
      setTotalEmployee(totalEmployeeData.data ? totalEmployeeData.data : 0)
      setPendingTimeoff(pendingTimeoffData.total ? pendingTimeoffData.total : 0)
      setLatestPresences(latestPresenceData.data ? latestPresenceData.data : [])
      setLatestTimeoffs(latestTimeoffData.data ? latestTimeoffData.data : [])
      setIsOpen(buttonStatusData.data ? buttonStatusData.data == 'true' : false)

      const weeklyPresence = presenceRecapData.data
      const weeklyTimeoff = weeklyTimeoffData.data
      const weekDates = getMondayToFridayDates(week, month, year)

      const totalWeeklyPresences = (field) => {
        return weekDates.map(date =>
          weeklyPresence.filter(item => item.date === date && item[field]['time']).length
        )
      }

      const totalWeeklyTimeoffs = (field) => {
        if (field == 'present') {
          return weekDates.map(date =>
            weeklyPresence.filter(item => item.date === date && (item['morning']['time'] || item['afternoon']['time'] || item['evening']['time'])).length
          )
        } else if (field == 'leave') {
          return weekDates.map(weekDate =>
            weeklyTimeoff.filter(item =>
              new Date(item.start_date) <= new Date(weekDate) &&
              new Date(item.end_date) >= new Date(weekDate)
            ).length
          )
        } else {
          return weekDates.map(weekDate => {
            const totalEmployees = weeklyPresence.filter(item => item.date === weekDate).length
            const presenceCount = weeklyPresence.filter(item => item.date === weekDate && (item['morning']['time'] || item['afternoon']['time'] || item['evening']['time'])).length

            const timeoffCount = weeklyTimeoff.filter(item =>
              new Date(item.start_date) <= new Date(weekDate) &&
              new Date(item.end_date) >= new Date(weekDate)
            ).length

            if (new Date(weekDate) <= date) {
              return Math.max(0, totalEmployees - presenceCount - timeoffCount)
            }

            return 0
          })
        }
      }

      setBarDatasets([
        {
          label: 'Pagi',
          backgroundColor: '#2364C0',
          data: totalWeeklyPresences('morning'),
        },
        {
          label: 'Siang',
          backgroundColor: '#FCC140',
          data: totalWeeklyPresences('afternoon'),
        },
        {
          label: 'Sore',
          backgroundColor: '#38ABBE',
          data: totalWeeklyPresences('evening'),
        },
      ])

      setLineDatasets([
        {
          label: 'Hadir',
          backgroundColor: '#2364C0',
          borderColor: '#2364C0',
          borderWidth: 2,
          tension: 0.4,
          data: totalWeeklyTimeoffs('present'),
        },
        {
          label: 'Izin',
          backgroundColor: '#51C17E',
          borderColor: '#51C17E',
          borderWidth: 2,
          tension: 0.4,
          data: totalWeeklyTimeoffs('leave'),
        },
        {
          label: 'Tidak Hadir',
          backgroundColor: '#FCC140',
          borderColor: '#FCC140',
          borderWidth: 2,
          tension: 0.4,
          data: totalWeeklyTimeoffs('absent'),
        },
      ])
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setDate(new Date())
    loadData(date)
  }, [])

  const { coords, isGeolocationAvailable, isGeolocationEnabled } =
    useGeolocated({
      positionOptions: {
        enableHighAccuracy: true,
      },
      userDecisionTimeout: 5000,
      watchLocationPermissionChange: true,
    })

  const handlePresence = async () => {
    try {
      setPresenceLoading(true)
      const token = Cookies.get('access-token')
      const { user } = isAuth()   
      if (!user) {
        throw Error('Token Invalid!')
      }

      const employeeRes = await fetch(`/api/employees?userId=${user.id}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token,
        }
      })

      const employeeData = await employeeRes.json()
      const employee = employeeData.data[0]

      if(!isGeolocationAvailable){
        toast.error('Tidak bisa mendapatkan lokasi dengan browser ini.')
        setPresenceLoading(false)
        throw Error('Tidak bisa mendapatkan lokasi dengan browser ini.')
      }

      if(!isGeolocationEnabled){
        toast.error('Izin akses lokasi belum diaktifkan.')
        setPresenceLoading(false)
        throw Error('Izin akses lokasi belum diaktifkan.')
      }

      const MIN_ACCEPTABLE_ACCURACY = 100

      if (coords.accuracy > MIN_ACCEPTABLE_ACCURACY) {
        toast.error('Lokasi tidak akurat. Pastikan GPS aktif atau download aplikasi versi mobile. Atau isi keterangan lokasi saat ini.')
        setIsShowModal(true)
        setPresence({
          currentPosition: {
            latitude: coords.latitude,
            longitude: coords.longitude
          },
          employee_id: employee.id
        })
      } else {
        const currentPosition = {
          latitude: coords.latitude,
          longitude: coords.longitude
        }
  
        const distance = calculateDistance(
          currentPosition.latitude,
          currentPosition.longitude,
          OFFICE_LAT,
          OFFICE_LONG
        )
  
        if (distance <= ALLOWED_DISTANCE) {
          handleSubmitPresence(currentPosition, employee.id, null)
        } else {
          setIsShowModal(true)
          setPresence({
            currentPosition: {
              latitude: coords.latitude,
              longitude: coords.longitude
            },
            employee_id: employee.id
          })
        }
      }
    } catch (error) {
      console.log('Error: ', error)
    } finally {
      setPresenceLoading(false)
    }
  }

  const handleSubmitPresence = async (currentPosition, employee_id, description) => {
    try {
      toast.loading('Loading...')
      const token = Cookies.get('access-token')
      let bodyData = {
        location: {
          type: 'Point',
          coordinates: [
            currentPosition.latitude,
            currentPosition.longitude
          ]
        },
        employees_id: employee_id
      }

      if (description != '') {
        bodyData.description = description
      }

      const presenceRes = await fetch(`/api/presence`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token,
        },
        body: JSON.stringify(bodyData)
      })

      toast.dismiss()
      if (presenceRes.ok) {
        toast.success('Absen berhasil tercatat')
      } else {
        toast.error('Absen gagal, silahkan coba lagi')
      }
    } catch (error) {
      console.log('Error: ', error)
    }
  }

  const handleModalSubmit = (e) => {
    e.preventDefault()
    handleSubmitPresence(presence.currentPosition, presence.employee_id, description)
    setDescription('')
    setIsShowModal(false)
    loadData()
  }

  const handleOpenPresence = async () => {
    try {
      setOpenLoading(true)
      const token = Cookies.get('access-token')
      const presenceRes = await fetch(`/api/open?status=${!isOpen}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token,
        }
      })

      if (presenceRes.ok) {
        setIsOpen(!isOpen)
        toast.success(!isOpen ? 'Absen berhasil terbuka' : 'Absen berhasil tertutup')
      } else {
        toast.error(isOpen ? 'Absen gagal ditutup, silahkan coba lagi' : 'Absen gagal dibuka, silahkan coba lagi')
      }
      setOpenLoading(false)
    } catch (error) {
      console.log('Error: ', error)
    }
  }

  const handleApprove = async (status) => {
    try {
      toast.loading('Loading...')
      const token = Cookies.get('access-token')
      const timeoffRes = await fetch(`/api/timeoff/${timeoff.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token,
        },
        body: JSON.stringify({
          approved: status
        })
      })

      if (timeoffRes.ok) {
        toast.dismiss()
        toast.success(status == 'APPROVED' ? 'Izin berhasil disetujui' : 'Izin berhasil ditolak')
        loadData(date)
        setIsShowTimeoff(false)
      }
    } catch (error) {
      toast.dismiss()
      toast.success(status == 'APPROVED' ? 'Izin gagal disetujui' : 'Izin gagal ditolak')
      console.error('Error:', error)
    }
  }

  return (
    <main className='h-full overflow-y-auto'>
      { loading ? (
        <div className='w-full h-[calc(100vh-64px)] flex items-center justify-center relative'>
          <Loading size={50} />
        </div>
      ) : (
        <div className='flex flex-col gap-8 p-6 mx-auto'>
          <h2 className='font-semibold text-gray-700'>Dashboard</h2>

          {/* Card */}
          <div className='grid gap-2 md:gap-4 lg:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4'>
            <TotalCard
              iconColor={'text-green-500 bg-green-100'}
              title={'Karyawan Masuk'}
              value={todayPresence.filter(item => item.morning.time !== null || item.afternoon.time !== null || item.evening.time !== null).length}
              svgIcon={
                <svg className='w-5 h-5' xmlns='http://www.w3.org/2000/svg' height='24px' viewBox='0 -960 960 960' width='24px' fill='currentColor'>
                  <path d='m702-593 141-142q12-12 28.5-12t28.5 12q12 12 12 28.5T900-678L730-508q-12 12-28 12t-28-12l-85-85q-12-12-12-28.5t12-28.5q12-12 28-12t28 12l57 57ZM360-480q-66 0-113-47t-47-113q0-66 47-113t113-47q66 0 113 47t47 113q0 66-47 113t-113 47ZM40-240v-32q0-34 17.5-62.5T104-378q62-31 126-46.5T360-440q66 0 130 15.5T616-378q29 15 46.5 43.5T680-272v32q0 33-23.5 56.5T600-160H120q-33 0-56.5-23.5T40-240Z'/>
                </svg>
              }
            />

            <TotalCard
              iconColor={'text-orange-500 bg-orange-100'}
              title={'Karyawan Izin'}
              value={todayTimeoff}
              svgIcon={
                <svg className='w-5 h-5' xmlns='http://www.w3.org/2000/svg' height='24px' viewBox='0 -960 960 960' width='24px' fill='currentColor'>
                  <path d='M680-600h160q17 0 28.5 11.5T880-560q0 17-11.5 28.5T840-520H680q-17 0-28.5-11.5T640-560q0-17 11.5-28.5T680-600ZM360-480q-66 0-113-47t-47-113q0-66 47-113t113-47q66 0 113 47t47 113q0 66-47 113t-113 47ZM40-240v-32q0-34 17.5-62.5T104-378q62-31 126-46.5T360-440q66 0 130 15.5T616-378q29 15 46.5 43.5T680-272v32q0 33-23.5 56.5T600-160H120q-33 0-56.5-23.5T40-240Z'/>
                </svg>
              }
            />

            <TotalCard
              iconColor={'text-blue-500 bg-blue-100'}
              title={'Total Karyawan'}
              value={totalEmployee}
              svgIcon={
                <svg className='w-5 h-5' xmlns='http://www.w3.org/2000/svg' height='24px' viewBox='0 -960 960 960' width='24px' fill='currentColor'>
                  <path d='M40-240q-17 0-28.5-11.5T0-280v-23q0-43 44-70t116-27q13 0 25 .5t23 2.5q-14 21-21 44t-7 48v65H40Zm240 0q-17 0-28.5-11.5T240-280v-25q0-32 17.5-58.5T307-410q32-20 76.5-30t96.5-10q53 0 97.5 10t76.5 30q32 20 49 46.5t17 58.5v25q0 17-11.5 28.5T680-240H280Zm500 0v-65q0-26-6.5-49T754-397q11-2 22.5-2.5t23.5-.5q72 0 116 26.5t44 70.5v23q0 17-11.5 28.5T920-240H780ZM160-440q-33 0-56.5-23.5T80-520q0-34 23.5-57t56.5-23q34 0 57 23t23 57q0 33-23 56.5T160-440Zm640 0q-33 0-56.5-23.5T720-520q0-34 23.5-57t56.5-23q34 0 57 23t23 57q0 33-23 56.5T800-440Zm-320-40q-50 0-85-35t-35-85q0-51 35-85.5t85-34.5q51 0 85.5 34.5T600-600q0 50-34.5 85T480-480Z'/>
                </svg>
              }
            />

            <TotalCard
              iconColor={'text-teal-500 bg-teal-100'}
              title={'Izin Pending'}
              value={pendingTimeoff}
              svgIcon={
                <svg className='w-5 h-5' xmlns='http://www.w3.org/2000/svg' height='24px' viewBox='0 -960 960 960' width='24px' fill='currentColor'>
                  <path d='M610-210q12 0 21-9t9-21q0-12-9-21t-21-9q-12 0-21 9t-9 21q0 12 9 21t21 9Zm110 0q12 0 21-9t9-21q0-12-9-21t-21-9q-12 0-21 9t-9 21q0 12 9 21t21 9Zm110 0q12 0 21-9t9-21q0-12-9-21t-21-9q-12 0-21 9t-9 21q0 12 9 21t21 9ZM720-40q-83 0-141.5-58.5T520-240q0-83 58.5-141.5T720-440q83 0 141.5 58.5T920-240q0 83-58.5 141.5T720-40ZM320-600h320q17 0 28.5-11.5T680-640q0-17-11.5-28.5T640-680H320q-17 0-28.5 11.5T280-640q0 17 11.5 28.5T320-600ZM200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h560q33 0 56.5 23.5T840-760v218q0 18-15 28t-32 4q-17-5-35.5-7.5T720-520q-11 0-20.5.5T680-517q-9-2-20-2.5t-20-.5H320q-17 0-28.5 11.5T280-480q0 17 11.5 28.5T320-440h205q-18 17-32.5 37T467-360H320q-17 0-28.5 11.5T280-320q0 17 11.5 28.5T320-280h123q-2 10-2.5 19.5T440-240q0 20 2 38t7 35q5 17-5 32t-27 15H200Z'/>
                </svg>
              }
            />
          </div>
          
          {/* Presence Button */}
          <div className='grid gap-2 md:gap-4 lg:gap-6 grid-cols-1 md:grid-cols-2'>
            {isOpen && (
              presenceLoading ? (
                <button className='w-full py-2 px-4 bg-primary text-white font-semibold rounded-lg disabled:opacity-50' disabled>
                  Loading...
                </button>
              ) : (
                <button onClick={handlePresence} className='w-full py-2 px-4 bg-primary text-white font-semibold rounded-lg hover:bg-primary/80'>
                  Absen
                </button>
              )
            )}
            {openLoading ? (
              <button className='w-full py-2 px-4 bg-white ring-1 ring-primary text-primary font-semibold rounded-lg disabled:opacity-50' disabled>
                Loading...
              </button>
            ) : (
              <button onClick={handleOpenPresence} className='w-full py-2 px-4 bg-white ring-1 ring-primary text-primary font-semibold rounded-lg hover:bg-primary/5'>
                {isOpen ? 'Tutup Absen' : 'Buka Absen'}
              </button>
            )}
          </div>

          {/* Presence Confirm Location Modal */}
          <ConfirmLocationModal showModal={isShowModal} handleShowModal={() => {setIsShowModal(false); setDescription('')}} description={description} handleDescriptionChange={(e) => setDescription(e.target.value)} handleSubmit={handleModalSubmit} />

          <div className='flex flex-col gap-4'>
            <h3 className='font-semibold text-gray-700'>Absensi Minggu Ini</h3>

            <div className='grid gap-6 md:grid-cols-2'>
              {/* Chart */}
              <BarChart labels={labels} datasets={barDatasets} title={'Absen Masuk'} />
              <LineChart labels={labels} datasets={lineDatasets} title={'Hadir & Tidak Hadir'} />
            </div>
          </div>

          {/* Table */}
          <div className='grid gap-8 md:gap-4 lg:gap-6 grid-cols-1 md:grid-cols-2'>
            <div className='flex flex-col gap-4'>
              <h3 className='font-semibold text-gray-700'>Riwayat Absensi Terakhir</h3>
              <div className='flex flex-col gap-3'>
                {latestPresences.length > 0 ? (
                  latestPresences.map((presence, index) => {
                    return (
                      <PresenceCard key={index} isAdmin={true} presence={presence} />
                    )
                  })
                ) : (
                  <p className='text-grey text-sm text-center'>Belum ada data absensi</p>
                )}
              </div>
            </div>
            <div className='flex flex-col gap-4'>
              <h3 className='font-semibold text-gray-700'>Permintaan Izin Terbaru</h3>
              <div className='flex flex-col gap-3'>
                {latestTimeoffs.length > 0 ? (
                  latestTimeoffs.map((timeoff, index) => {
                    return (
                      <TimeoffCard key={index} timeoff={timeoff} handleClick={() => {setIsShowTimeoff(true); setTimeoff(timeoff)}} />
                    )
                  })
                ) : (
                  <p className='text-grey text-sm text-center'>Belum ada permintaan izin/cuti</p>
                )}
              </div>
            </div>
          </div>

          {(isShowTimeoff && timeoff) && (
            <TimeoffDetailModal isAdmin={true} timeoff={timeoff} showModal={isShowTimeoff} handleShowModal={() => setIsShowTimeoff(false)} handleApprove={handleApprove} />
          )}
        </div>
      ) }
    </main>
  )
}

export default Dashboard
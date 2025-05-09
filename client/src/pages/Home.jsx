import React, { useEffect, useState } from 'react'
import Cookies from 'js-cookie'
import { isAuth } from '../utils/auth'
import { calculateDistance } from '../utils/location'
import Loading from '../components/Loading'
import TotalCard from '../components/cards/TotalCard'
import PresenceCard from '../components/cards/PresenceCard'
import TimeoffCard from '../components/cards/TimeoffCard'
import ConfirmLocationModal from '../components/modals/ConfirmLocationModal'
import TimeoffDetailModal from '../components/modals/TimeoffDetailModal'
import toast from 'react-hot-toast'
import { useGeolocated } from 'react-geolocated'

const OFFICE_LAT = -5.0631451
const OFFICE_LONG = 105.5366387
const ALLOWED_DISTANCE = 50

const Home = () => {
  const [employee, setEmployee] = useState()

  const [totalPresence, setTotalPresence] = useState(0)
  const [totalTimeoff, setTotalTimeoff] = useState(0)

  const [latestPresences, setLatestPresences] = useState([])
  const [latestTimeoffs, setLatestTimeoffs] = useState([])

  const [loading, setLoading] = useState(true)
  const [presenceLoading, setPresenceLoading] = useState(false)
  
  const [isOpen, setIsOpen] = useState(false)
  const [isShowTimeoff, setIsShowTimeoff] = useState(false)
  const [timeoff, setTimeoff] = useState()

  const [presence, setPresence] = useState()
  const [description, setDescription] = useState('')
  const [isShowModal, setIsShowModal] = useState()

  const [date, setDate] = useState(new Date())

  const loadData = async () => {
    try {
      const token = Cookies.get('access-token')
      const month = date.getUTCMonth() + 1
      const year = date.getUTCFullYear()

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
      setEmployee(employeeData)

      const [isOpenRes, totalPresenceRes, totalTimeoffRes, latestPresenceRes, latestTimeoffRes] = await Promise.all([
        fetch(`/api/open`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token,
          },
        }),
        fetch(`/api/total-presences?employeeId=${employeeData.id}&month=${month}&year=${year}`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token,
          },
        }),
        fetch(`/api/total-timeoffs?employeeId=${employeeData.id}&status=APPROVED`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token,
          },
        }),
        fetch(`/api/presences?employeeId=${employeeData.id}&limit=5`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token,
          },
        }),
        fetch(`/api/timeoffs?employeeId=${employeeData.id}&limit=5`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token,
          },
        })
      ])

      const [isOpenData, totalPresenceData, totalTimeoffData, latestPresenceData, latestTimeoffData] = await Promise.all([
        isOpenRes.json(),
        totalPresenceRes.json(),
        totalTimeoffRes.json(),
        latestPresenceRes.json(),
        latestTimeoffRes.json()
      ])

      setIsOpen(isOpenData.data ? isOpenData.data == 'true' : false)
      setTotalPresence(totalPresenceData.data ? totalPresenceData.data : 0)
      setTotalTimeoff(totalTimeoffData.data ? totalTimeoffData.data : 0)
      setLatestPresences(latestPresenceData.data ? latestPresenceData.data : [])
      setLatestTimeoffs(latestTimeoffData.data ? latestTimeoffData.data : [])
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

  return (
    <main className='h-full overflow-y-auto'>
      { loading ? (
        <div className='w-full h-[calc(100vh-64px)] flex items-center justify-center relative'>
          <Loading size={50} />
        </div>
      ) : (
        <div className='flex flex-col gap-8 p-6 mx-auto'>
          <h2 className='font-semibold text-gray-700'>Selamat Datang Kembali!</h2>

          {/* Card */}
          <div className='grid gap-2 md:gap-4 lg:gap-6 grid-cols-1 md:grid-cols-2'>
            <TotalCard
              iconColor={'text-green-500 bg-green-100'}
              title={'Jumlah Kehadiran'}
              value={`${totalPresence} Hari`}
              svgIcon={
                <svg className='w-5 h-5' xmlns='http://www.w3.org/2000/svg' height='24px' viewBox='0 -960 960 960' width='24px' fill='currentColor'>
                  <path d='m438-342 139-139q12-12 29-12t29 12q12 12 12 29t-12 29L466-254q-12 12-28 12t-28-12l-85-85q-12-12-12-29t12-29q12-12 29-12t29 12l55 55ZM200-80q-33 0-56.5-23.5T120-160v-560q0-33 23.5-56.5T200-800h40v-40q0-17 11.5-28.5T280-880q17 0 28.5 11.5T320-840v40h320v-40q0-17 11.5-28.5T680-880q17 0 28.5 11.5T720-840v40h40q33 0 56.5 23.5T840-720v560q0 33-23.5 56.5T760-80H200Zm0-80h560v-400H200v400Z'/>
                </svg>
              }
            />

            <TotalCard
              iconColor={'text-orange-500 bg-orange-100'}
              title={'Jumlah Izin/Cuti'}
              value={`${totalTimeoff} Hari`}
              svgIcon={
                <svg className='w-5 h-5' xmlns='http://www.w3.org/2000/svg' height='24px' viewBox='0 -960 960 960' width='24px' fill='currentColor'>
                  <path d='m480-304-64 64q-11 11-28 11t-28-11q-11-11-11-28t11-28l64-64-64-64q-11-11-11-28t11-28q11-11 28-11t28 11l64 64 64-64q11-11 28-11t28 11q11 11 11 28t-11 28l-64 64 64 64q11 11 11 28t-11 28q-11 11-28 11t-28-11l-64-64ZM200-80q-33 0-56.5-23.5T120-160v-560q0-33 23.5-56.5T200-800h40v-40q0-17 11.5-28.5T280-880q17 0 28.5 11.5T320-840v40h320v-40q0-17 11.5-28.5T680-880q17 0 28.5 11.5T720-840v40h40q33 0 56.5 23.5T840-720v560q0 33-23.5 56.5T760-80H200Zm0-80h560v-400H200v400Z'/>
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
          </div>

          {/* Presence Confirm Location Modal */}
          <ConfirmLocationModal showModal={isShowModal} handleShowModal={() => {setIsShowModal(false); setDescription('')}} description={description} handleDescriptionChange={(e) => setDescription(e.target.value)} handleSubmit={handleModalSubmit} />

          {/* Table */}
          <div className='grid gap-8 md:gap-4 lg:gap-6 grid-cols-1 md:grid-cols-2'>
            <div className='flex flex-col gap-4'>
              <h3 className='font-semibold text-gray-700'>Riwayat Absensi Terakhir</h3>
              <div className='flex flex-col gap-3'>
                {latestPresences.length > 0 ? (
                  latestPresences.map((presence, index) => {
                    return (
                      <PresenceCard key={index} isAdmin={false} presence={presence} />
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
            <TimeoffDetailModal isAdmin={false} timeoff={timeoff} showModal={isShowTimeoff} handleShowModal={() => setIsShowTimeoff(false)} />
          )}
        </div>
      ) }
    </main>
  )
}

export default Home
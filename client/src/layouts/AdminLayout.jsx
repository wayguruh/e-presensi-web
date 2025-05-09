import React, { useState, useEffect } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import Cookies from 'js-cookie'
import { isAuth } from '../utils/auth'
import { Toaster } from 'react-hot-toast'
import ConfirmLogout from '../components/modals/ConfirmLogout'

const AdminLayout = () => {
  const [isSideMenuOpen, setIsSideMenuOpen] = useState(false)
  const [render, setRender] = useState(false)
  const [animate, setAnimate] = useState(false)

  const [employee, setEmployee] = useState()
  const [isShowConfirmLogout, setIsShowConfirmLogout] = useState(false)
  
  const [fileSize, setFileSize] = useState()

  const navigate = useNavigate()
  const location = useLocation()

  const loadData = async () => {
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

      if (employeeRes.ok) {
        const data = await employeeRes.json()
        setEmployee(data.data[0])
      }
    } catch (error) {
      console.log('Error: ', error)
    }
  }

  useEffect(() => {
    loadData()

    fetch('/e-presensi.apk', { method: 'HEAD' }).then(res => {
      const size = res.headers.get('Content-Length');
      if (size) {
        const sizeInMB = (Number(size) / (1024 * 1024)).toFixed(2)
        setFileSize(sizeInMB)
      }
    })

    if (isSideMenuOpen) {
      setRender(true)
      requestAnimationFrame(() => {
        setAnimate(true)
      })
      document.body.style.overflow = 'hidden'
    } else {
      setAnimate(false)
      document.body.style.overflow = ''
      const timeout = setTimeout(() => setRender(false), 300)
      return () => clearTimeout(timeout)
    }

    return () => {
      document.body.style.overflow = ''
    }
  }, [isSideMenuOpen])

  const handleLogout = () => {
    Cookies.remove('access-token')
    navigate('/login')
  }

  return (
    <>
      {/* SIDEBAR DESKTOP */}
      <aside className='z-20 hidden w-64 h-screen overflow-y-auto bg-white md:block fixed flex-shrink-0'>
        <div className='py-4'>
          <a className='flex justify-center' href='/admin'>
            <img src='/logo-pdam-0.5x.png' className='w-28 h-14 object-cover' alt='logo' />
          </a>
          <ul className='mt-6'>
            <li className='relative px-6 py-3'>
              { location.pathname == '/admin' && (
                <span className='absolute inset-y-0 left-0 w-1 bg-primary rounded-tr-lg rounded-br-lg' aria-hidden='true'></span>
              ) }
              <a className={`inline-flex items-center w-full text-sm font-semibold ${location.pathname == '/admin'? 'text-gray-800' : 'text-gray-500'} transition-colors duration-150 hover:text-gray-800`} href='/admin'>
                { location.pathname == '/admin' ? (
                  <svg className='w-5 h-5' xmlns='http://www.w3.org/2000/svg' height='24px' viewBox='0 -960 960 960' width='24px' fill='currentColor'><path d='M160-200v-360q0-19 8.5-36t23.5-28l240-180q21-16 48-16t48 16l240 180q15 11 23.5 28t8.5 36v360q0 33-23.5 56.5T720-120H600q-17 0-28.5-11.5T560-160v-200q0-17-11.5-28.5T520-400h-80q-17 0-28.5 11.5T400-360v200q0 17-11.5 28.5T360-120H240q-33 0-56.5-23.5T160-200Z'/></svg>
                ) : (
                  <svg className='w-5 h-5' xmlns='http://www.w3.org/2000/svg' height='24px' viewBox='0 -960 960 960' width='24px' fill='currentColor'><path d='M240-200h120v-200q0-17 11.5-28.5T400-440h160q17 0 28.5 11.5T600-400v200h120v-360L480-740 240-560v360Zm-80 0v-360q0-19 8.5-36t23.5-28l240-180q21-16 48-16t48 16l240 180q15 11 23.5 28t8.5 36v360q0 33-23.5 56.5T720-120H560q-17 0-28.5-11.5T520-160v-200h-80v200q0 17-11.5 28.5T400-120H240q-33 0-56.5-23.5T160-200Zm320-270Z'/></svg>
                ) }
                <span className='ml-4'>Dashboard</span>
              </a>
            </li>
            <li className='relative px-6 py-3'>
              { location.pathname == '/admin/employee' && (
                <span className='absolute inset-y-0 left-0 w-1 bg-primary rounded-tr-lg rounded-br-lg' aria-hidden='true'></span>
              ) }
              <a className={`inline-flex items-center w-full text-sm font-semibold ${location.pathname == '/admin/employee'? 'text-gray-800' : 'text-gray-500'} transition-colors duration-150 hover:text-gray-800`} href='/admin/employee'>
                { location.pathname == '/admin/employee' ? (
                  <svg className='w-5 h-5' xmlns='http://www.w3.org/2000/svg' height='24px' viewBox='0 -960 960 960' width='24px' fill='currentColor'><path d='M40-272q0-34 17.5-62.5T104-378q62-31 126-46.5T360-440q66 0 130 15.5T616-378q29 15 46.5 43.5T680-272v32q0 33-23.5 56.5T600-160H120q-33 0-56.5-23.5T40-240v-32Zm698 112q11-18 16.5-38.5T760-240v-40q0-44-24.5-84.5T666-434q51 6 96 20.5t84 35.5q36 20 55 44.5t19 53.5v40q0 33-23.5 56.5T840-160H738ZM360-480q-66 0-113-47t-47-113q0-66 47-113t113-47q66 0 113 47t47 113q0 66-47 113t-113 47Zm400-160q0 66-47 113t-113 47q-11 0-28-2.5t-28-5.5q27-32 41.5-71t14.5-81q0-42-14.5-81T544-792q14-5 28-6.5t28-1.5q66 0 113 47t47 113Z'/></svg>
                ) : (
                  <svg className='w-5 h-5' xmlns='http://www.w3.org/2000/svg' height='24px' viewBox='0 -960 960 960' width='24px' fill='currentColor'><path d='M40-272q0-34 17.5-62.5T104-378q62-31 126-46.5T360-440q66 0 130 15.5T616-378q29 15 46.5 43.5T680-272v32q0 33-23.5 56.5T600-160H120q-33 0-56.5-23.5T40-240v-32Zm800 112H738q11-18 16.5-38.5T760-240v-40q0-44-24.5-84.5T666-434q51 6 96 20.5t84 35.5q36 20 55 44.5t19 53.5v40q0 33-23.5 56.5T840-160ZM360-480q-66 0-113-47t-47-113q0-66 47-113t113-47q66 0 113 47t47 113q0 66-47 113t-113 47Zm400-160q0 66-47 113t-113 47q-11 0-28-2.5t-28-5.5q27-32 41.5-71t14.5-81q0-42-14.5-81T544-792q14-5 28-6.5t28-1.5q66 0 113 47t47 113ZM120-240h480v-32q0-11-5.5-20T580-306q-54-27-109-40.5T360-360q-56 0-111 13.5T140-306q-9 5-14.5 14t-5.5 20v32Zm240-320q33 0 56.5-23.5T440-640q0-33-23.5-56.5T360-720q-33 0-56.5 23.5T280-640q0 33 23.5 56.5T360-560Zm0 320Zm0-400Z'/></svg>
                ) }
                <span className='ml-4'>Karyawan</span>
              </a>
            </li>
            <li className='relative px-6 py-3'>
              { location.pathname == '/admin/presence' && (
                <span className='absolute inset-y-0 left-0 w-1 bg-primary rounded-tr-lg rounded-br-lg' aria-hidden='true'></span>
              ) }
              <a className={`inline-flex items-center w-full text-sm font-semibold ${location.pathname == '/admin/presence'? 'text-gray-800' : 'text-gray-500'} transition-colors duration-150 hover:text-gray-800`} href='/admin/presence'>
                { location.pathname == '/admin/presence' ? (
                  <svg className='w-5 h-5' xmlns='http://www.w3.org/2000/svg' height='24px' viewBox='0 -960 960 960' width='24px' fill='currentColor'><path d='M200-80q-33 0-56.5-23.5T120-160v-560q0-33 23.5-56.5T200-800h40v-40q0-17 11.5-28.5T280-880q17 0 28.5 11.5T320-840v40h320v-40q0-17 11.5-28.5T680-880q17 0 28.5 11.5T720-840v40h40q33 0 56.5 23.5T840-720v560q0 33-23.5 56.5T760-80H200Zm0-80h560v-400H200v400Zm280-240q-17 0-28.5-11.5T440-440q0-17 11.5-28.5T480-480q17 0 28.5 11.5T520-440q0 17-11.5 28.5T480-400Zm-160 0q-17 0-28.5-11.5T280-440q0-17 11.5-28.5T320-480q17 0 28.5 11.5T360-440q0 17-11.5 28.5T320-400Zm320 0q-17 0-28.5-11.5T600-440q0-17 11.5-28.5T640-480q17 0 28.5 11.5T680-440q0 17-11.5 28.5T640-400ZM480-240q-17 0-28.5-11.5T440-280q0-17 11.5-28.5T480-320q17 0 28.5 11.5T520-280q0 17-11.5 28.5T480-240Zm-160 0q-17 0-28.5-11.5T280-280q0-17 11.5-28.5T320-320q17 0 28.5 11.5T360-280q0 17-11.5 28.5T320-240Zm320 0q-17 0-28.5-11.5T600-280q0-17 11.5-28.5T640-320q17 0 28.5 11.5T680-280q0 17-11.5 28.5T640-240Z'/></svg>
                ) : (
                  <svg className='w-5 h-5' xmlns='http://www.w3.org/2000/svg' height='24px' viewBox='0 -960 960 960' width='24px' fill='currentColor'><path d='M200-80q-33 0-56.5-23.5T120-160v-560q0-33 23.5-56.5T200-800h40v-40q0-17 11.5-28.5T280-880q17 0 28.5 11.5T320-840v40h320v-40q0-17 11.5-28.5T680-880q17 0 28.5 11.5T720-840v40h40q33 0 56.5 23.5T840-720v560q0 33-23.5 56.5T760-80H200Zm0-80h560v-400H200v400Zm0-480h560v-80H200v80Zm0 0v-80 80Zm280 240q-17 0-28.5-11.5T440-440q0-17 11.5-28.5T480-480q17 0 28.5 11.5T520-440q0 17-11.5 28.5T480-400Zm-160 0q-17 0-28.5-11.5T280-440q0-17 11.5-28.5T320-480q17 0 28.5 11.5T360-440q0 17-11.5 28.5T320-400Zm320 0q-17 0-28.5-11.5T600-440q0-17 11.5-28.5T640-480q17 0 28.5 11.5T680-440q0 17-11.5 28.5T640-400ZM480-240q-17 0-28.5-11.5T440-280q0-17 11.5-28.5T480-320q17 0 28.5 11.5T520-280q0 17-11.5 28.5T480-240Zm-160 0q-17 0-28.5-11.5T280-280q0-17 11.5-28.5T320-320q17 0 28.5 11.5T360-280q0 17-11.5 28.5T320-240Zm320 0q-17 0-28.5-11.5T600-280q0-17 11.5-28.5T640-320q17 0 28.5 11.5T680-280q0 17-11.5 28.5T640-240Z'/></svg>
                ) }
                <span className='ml-4'>Absensi</span>
              </a>
            </li>
            <li className='relative px-6 py-3'>
              { location.pathname == '/admin/timeoff' && (
                <span className='absolute inset-y-0 left-0 w-1 bg-primary rounded-tr-lg rounded-br-lg' aria-hidden='true'></span>
              ) }
              <a className={`inline-flex items-center w-full text-sm font-semibold ${location.pathname == '/admin/timeoff'? 'text-gray-800' : 'text-gray-500'} transition-colors duration-150 hover:text-gray-800`} href='/admin/timeoff'>
                { location.pathname == '/admin/timeoff' ? (
                  <svg className='w-5 h-5' xmlns='http://www.w3.org/2000/svg' height='24px' viewBox='0 -960 960 960' width='24px' fill='currentColor'><path d='M240-200v20q0 25-17.5 42.5T180-120q-25 0-42.5-17.5T120-180v-286q0-7 1-14t3-13l75-213q8-24 29-39t47-15h410q26 0 47 15t29 39l75 213q2 6 3 13t1 14v286q0 25-17.5 42.5T780-120q-25 0-42.5-17.5T720-180v-20H240Zm-8-360h496l-42-120H274l-42 120Zm68 240q25 0 42.5-17.5T360-380q0-25-17.5-42.5T300-440q-25 0-42.5 17.5T240-380q0 25 17.5 42.5T300-320Zm360 0q25 0 42.5-17.5T720-380q0-25-17.5-42.5T660-440q-25 0-42.5 17.5T600-380q0 25 17.5 42.5T660-320Z'/></svg>
                ) : (
                  <svg className='w-5 h-5' xmlns='http://www.w3.org/2000/svg' height='24px' viewBox='0 -960 960 960' width='24px' fill='currentColor'><path d='M240-200v20q0 25-17.5 42.5T180-120q-25 0-42.5-17.5T120-180v-286q0-7 1-14t3-13l75-213q8-24 29-39t47-15h410q26 0 47 15t29 39l75 213q2 6 3 13t1 14v286q0 25-17.5 42.5T780-120q-25 0-42.5-17.5T720-180v-20H240Zm-8-360h496l-42-120H274l-42 120Zm-32 80v200-200Zm100 160q25 0 42.5-17.5T360-380q0-25-17.5-42.5T300-440q-25 0-42.5 17.5T240-380q0 25 17.5 42.5T300-320Zm360 0q25 0 42.5-17.5T720-380q0-25-17.5-42.5T660-440q-25 0-42.5 17.5T600-380q0 25 17.5 42.5T660-320Zm-460 40h560v-200H200v200Z'/></svg>
                ) }
                <span className='ml-4'>Izin/Cuti</span>
              </a>
            </li>
            <li className='relative px-6 py-3'>
              { location.pathname == '/admin/profile' && (
                <span className='absolute inset-y-0 left-0 w-1 bg-primary rounded-tr-lg rounded-br-lg' aria-hidden='true'></span>
              ) }
              <a className={`inline-flex items-center w-full text-sm font-semibold ${location.pathname == '/admin/profile'? 'text-gray-800' : 'text-gray-500'} transition-colors duration-150 hover:text-gray-800`} href='/admin/profile'>
                { location.pathname == '/admin/profile' ? (
                  <svg className='w-5 h-5' xmlns='http://www.w3.org/2000/svg' height='24px' viewBox='0 -960 960 960' width='24px' fill='currentColor'><path d='M234-276q51-39 114-61.5T480-360q69 0 132 22.5T726-276q35-41 54.5-93T800-480q0-133-93.5-226.5T480-800q-133 0-226.5 93.5T160-480q0 59 19.5 111t54.5 93Zm246-164q-59 0-99.5-40.5T340-580q0-59 40.5-99.5T480-720q59 0 99.5 40.5T620-580q0 59-40.5 99.5T480-440Zm0 360q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Z'/></svg>
                ) : (
                  <svg className='w-5 h-5' xmlns='http://www.w3.org/2000/svg' height='24px' viewBox='0 -960 960 960' width='24px' fill='currentColor'><path d='M234-276q51-39 114-61.5T480-360q69 0 132 22.5T726-276q35-41 54.5-93T800-480q0-133-93.5-226.5T480-800q-133 0-226.5 93.5T160-480q0 59 19.5 111t54.5 93Zm246-164q-59 0-99.5-40.5T340-580q0-59 40.5-99.5T480-720q59 0 99.5 40.5T620-580q0 59-40.5 99.5T480-440Zm0 360q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q53 0 100-15.5t86-44.5q-39-29-86-44.5T480-280q-53 0-100 15.5T294-220q39 29 86 44.5T480-160Zm0-360q26 0 43-17t17-43q0-26-17-43t-43-17q-26 0-43 17t-17 43q0 26 17 43t43 17Zm0-60Zm0 360Z'/></svg>
                ) }
                <span className='ml-4'>Profile</span>
              </a>
            </li>
          </ul>
          
          <div className='px-6 my-6'>
            <button onClick={() => setIsShowConfirmLogout(true)} className='flex items-center justify-between w-full px-4 py-2 text-sm font-medium leading-5 text-white transition-colors duration-150 bg-red-600 border border-transparent rounded-lg active:bg-red-600 hover:bg-red-700 focus:outline-none focus:shadow-outline-red'>
              Logout
            </button>
          </div>

          <a href='/e-presensi.apk' download className='flex w-full text-xs px-6 my-6 text-primary'>
            <span className='flex w-full justify-between items-center hover:border-b hover:border-primary'>
              <span>Download APK</span>
              <span>{fileSize} MB</span>
            </span>
          </a>
        </div>
      </aside>

      {/* SIDEBAR MOBILE */}
      {render && (
        <>
          <div onClick={() => setIsSideMenuOpen(false)} className={`md:hidden fixed inset-0 z-10 flex items-end bg-black bg-opacity-50 sm:items-center sm:justify-center transition-opacity duration-150 ease-in-out ${animate ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}></div>
          <aside className={`fixed inset-y-0 z-20 flex-shrink-0 w-64 mt-16 overflow-y-auto bg-white md:hidden transition-all duration-150 ease-in-out transform ${animate ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-20 pointer-events-none'}`}>
            <div className='py-4'>
              <a className='flex justify-center' href='/admin'>
                <img src='/logo-pdam-0.5x.png' className='w-28 h-14 object-cover' alt='logo' />
              </a>
              <ul className='mt-6'>
                <li className='relative px-6 py-3'>
                  { location.pathname == '/admin' && (
                    <span className='absolute inset-y-0 left-0 w-1 bg-primary rounded-tr-lg rounded-br-lg' aria-hidden='true'></span>
                  ) }
                  <a className={`inline-flex items-center w-full text-sm font-semibold ${location.pathname == '/admin'? 'text-gray-800' : 'text-gray-500'} transition-colors duration-150 hover:text-gray-800`} href='/admin'>
                    { location.pathname == '/admin' ? (
                      <svg className='w-5 h-5' xmlns='http://www.w3.org/2000/svg' height='24px' viewBox='0 -960 960 960' width='24px' fill='currentColor'><path d='M160-200v-360q0-19 8.5-36t23.5-28l240-180q21-16 48-16t48 16l240 180q15 11 23.5 28t8.5 36v360q0 33-23.5 56.5T720-120H600q-17 0-28.5-11.5T560-160v-200q0-17-11.5-28.5T520-400h-80q-17 0-28.5 11.5T400-360v200q0 17-11.5 28.5T360-120H240q-33 0-56.5-23.5T160-200Z'/></svg>
                    ) : (
                      <svg className='w-5 h-5' xmlns='http://www.w3.org/2000/svg' height='24px' viewBox='0 -960 960 960' width='24px' fill='currentColor'><path d='M240-200h120v-200q0-17 11.5-28.5T400-440h160q17 0 28.5 11.5T600-400v200h120v-360L480-740 240-560v360Zm-80 0v-360q0-19 8.5-36t23.5-28l240-180q21-16 48-16t48 16l240 180q15 11 23.5 28t8.5 36v360q0 33-23.5 56.5T720-120H560q-17 0-28.5-11.5T520-160v-200h-80v200q0 17-11.5 28.5T400-120H240q-33 0-56.5-23.5T160-200Zm320-270Z'/></svg>
                    ) }
                    <span className='ml-4'>Dashboard</span>
                  </a>
                </li>
                <li className='relative px-6 py-3'>
                  { location.pathname == '/admin/employee' && (
                    <span className='absolute inset-y-0 left-0 w-1 bg-primary rounded-tr-lg rounded-br-lg' aria-hidden='true'></span>
                  ) }
                  <a className={`inline-flex items-center w-full text-sm font-semibold ${location.pathname == '/admin/employee'? 'text-gray-800' : 'text-gray-500'} transition-colors duration-150 hover:text-gray-800`} href='/admin/employee'>
                    { location.pathname == '/admin/employee' ? (
                      <svg className='w-5 h-5' xmlns='http://www.w3.org/2000/svg' height='24px' viewBox='0 -960 960 960' width='24px' fill='currentColor'><path d='M40-272q0-34 17.5-62.5T104-378q62-31 126-46.5T360-440q66 0 130 15.5T616-378q29 15 46.5 43.5T680-272v32q0 33-23.5 56.5T600-160H120q-33 0-56.5-23.5T40-240v-32Zm698 112q11-18 16.5-38.5T760-240v-40q0-44-24.5-84.5T666-434q51 6 96 20.5t84 35.5q36 20 55 44.5t19 53.5v40q0 33-23.5 56.5T840-160H738ZM360-480q-66 0-113-47t-47-113q0-66 47-113t113-47q66 0 113 47t47 113q0 66-47 113t-113 47Zm400-160q0 66-47 113t-113 47q-11 0-28-2.5t-28-5.5q27-32 41.5-71t14.5-81q0-42-14.5-81T544-792q14-5 28-6.5t28-1.5q66 0 113 47t47 113Z'/></svg>
                    ) : (
                      <svg className='w-5 h-5' xmlns='http://www.w3.org/2000/svg' height='24px' viewBox='0 -960 960 960' width='24px' fill='currentColor'><path d='M40-272q0-34 17.5-62.5T104-378q62-31 126-46.5T360-440q66 0 130 15.5T616-378q29 15 46.5 43.5T680-272v32q0 33-23.5 56.5T600-160H120q-33 0-56.5-23.5T40-240v-32Zm800 112H738q11-18 16.5-38.5T760-240v-40q0-44-24.5-84.5T666-434q51 6 96 20.5t84 35.5q36 20 55 44.5t19 53.5v40q0 33-23.5 56.5T840-160ZM360-480q-66 0-113-47t-47-113q0-66 47-113t113-47q66 0 113 47t47 113q0 66-47 113t-113 47Zm400-160q0 66-47 113t-113 47q-11 0-28-2.5t-28-5.5q27-32 41.5-71t14.5-81q0-42-14.5-81T544-792q14-5 28-6.5t28-1.5q66 0 113 47t47 113ZM120-240h480v-32q0-11-5.5-20T580-306q-54-27-109-40.5T360-360q-56 0-111 13.5T140-306q-9 5-14.5 14t-5.5 20v32Zm240-320q33 0 56.5-23.5T440-640q0-33-23.5-56.5T360-720q-33 0-56.5 23.5T280-640q0 33 23.5 56.5T360-560Zm0 320Zm0-400Z'/></svg>
                    ) }
                    <span className='ml-4'>Karyawan</span>
                  </a>
                </li>
                <li className='relative px-6 py-3'>
                  { location.pathname == '/admin/presence' && (
                    <span className='absolute inset-y-0 left-0 w-1 bg-primary rounded-tr-lg rounded-br-lg' aria-hidden='true'></span>
                  ) }
                  <a className={`inline-flex items-center w-full text-sm font-semibold ${location.pathname == '/admin/presence'? 'text-gray-800' : 'text-gray-500'} transition-colors duration-150 hover:text-gray-800`} href='/admin/presence'>
                    { location.pathname == '/admin/presence' ? (
                      <svg className='w-5 h-5' xmlns='http://www.w3.org/2000/svg' height='24px' viewBox='0 -960 960 960' width='24px' fill='currentColor'><path d='M200-80q-33 0-56.5-23.5T120-160v-560q0-33 23.5-56.5T200-800h40v-40q0-17 11.5-28.5T280-880q17 0 28.5 11.5T320-840v40h320v-40q0-17 11.5-28.5T680-880q17 0 28.5 11.5T720-840v40h40q33 0 56.5 23.5T840-720v560q0 33-23.5 56.5T760-80H200Zm0-80h560v-400H200v400Zm280-240q-17 0-28.5-11.5T440-440q0-17 11.5-28.5T480-480q17 0 28.5 11.5T520-440q0 17-11.5 28.5T480-400Zm-160 0q-17 0-28.5-11.5T280-440q0-17 11.5-28.5T320-480q17 0 28.5 11.5T360-440q0 17-11.5 28.5T320-400Zm320 0q-17 0-28.5-11.5T600-440q0-17 11.5-28.5T640-480q17 0 28.5 11.5T680-440q0 17-11.5 28.5T640-400ZM480-240q-17 0-28.5-11.5T440-280q0-17 11.5-28.5T480-320q17 0 28.5 11.5T520-280q0 17-11.5 28.5T480-240Zm-160 0q-17 0-28.5-11.5T280-280q0-17 11.5-28.5T320-320q17 0 28.5 11.5T360-280q0 17-11.5 28.5T320-240Zm320 0q-17 0-28.5-11.5T600-280q0-17 11.5-28.5T640-320q17 0 28.5 11.5T680-280q0 17-11.5 28.5T640-240Z'/></svg>
                    ) : (
                      <svg className='w-5 h-5' xmlns='http://www.w3.org/2000/svg' height='24px' viewBox='0 -960 960 960' width='24px' fill='currentColor'><path d='M200-80q-33 0-56.5-23.5T120-160v-560q0-33 23.5-56.5T200-800h40v-40q0-17 11.5-28.5T280-880q17 0 28.5 11.5T320-840v40h320v-40q0-17 11.5-28.5T680-880q17 0 28.5 11.5T720-840v40h40q33 0 56.5 23.5T840-720v560q0 33-23.5 56.5T760-80H200Zm0-80h560v-400H200v400Zm0-480h560v-80H200v80Zm0 0v-80 80Zm280 240q-17 0-28.5-11.5T440-440q0-17 11.5-28.5T480-480q17 0 28.5 11.5T520-440q0 17-11.5 28.5T480-400Zm-160 0q-17 0-28.5-11.5T280-440q0-17 11.5-28.5T320-480q17 0 28.5 11.5T360-440q0 17-11.5 28.5T320-400Zm320 0q-17 0-28.5-11.5T600-440q0-17 11.5-28.5T640-480q17 0 28.5 11.5T680-440q0 17-11.5 28.5T640-400ZM480-240q-17 0-28.5-11.5T440-280q0-17 11.5-28.5T480-320q17 0 28.5 11.5T520-280q0 17-11.5 28.5T480-240Zm-160 0q-17 0-28.5-11.5T280-280q0-17 11.5-28.5T320-320q17 0 28.5 11.5T360-280q0 17-11.5 28.5T320-240Zm320 0q-17 0-28.5-11.5T600-280q0-17 11.5-28.5T640-320q17 0 28.5 11.5T680-280q0 17-11.5 28.5T640-240Z'/></svg>
                    ) }
                    <span className='ml-4'>Absensi</span>
                  </a>
                </li>
                <li className='relative px-6 py-3'>
                  { location.pathname == '/admin/timeoff' && (
                    <span className='absolute inset-y-0 left-0 w-1 bg-primary rounded-tr-lg rounded-br-lg' aria-hidden='true'></span>
                  ) }
                  <a className={`inline-flex items-center w-full text-sm font-semibold ${location.pathname == '/admin/timeoff'? 'text-gray-800' : 'text-gray-500'} transition-colors duration-150 hover:text-gray-800`} href='/admin/timeoff'>
                    { location.pathname == '/admin/timeoff' ? (
                      <svg className='w-5 h-5' xmlns='http://www.w3.org/2000/svg' height='24px' viewBox='0 -960 960 960' width='24px' fill='currentColor'><path d='M240-200v20q0 25-17.5 42.5T180-120q-25 0-42.5-17.5T120-180v-286q0-7 1-14t3-13l75-213q8-24 29-39t47-15h410q26 0 47 15t29 39l75 213q2 6 3 13t1 14v286q0 25-17.5 42.5T780-120q-25 0-42.5-17.5T720-180v-20H240Zm-8-360h496l-42-120H274l-42 120Zm68 240q25 0 42.5-17.5T360-380q0-25-17.5-42.5T300-440q-25 0-42.5 17.5T240-380q0 25 17.5 42.5T300-320Zm360 0q25 0 42.5-17.5T720-380q0-25-17.5-42.5T660-440q-25 0-42.5 17.5T600-380q0 25 17.5 42.5T660-320Z'/></svg>
                    ) : (
                      <svg className='w-5 h-5' xmlns='http://www.w3.org/2000/svg' height='24px' viewBox='0 -960 960 960' width='24px' fill='currentColor'><path d='M240-200v20q0 25-17.5 42.5T180-120q-25 0-42.5-17.5T120-180v-286q0-7 1-14t3-13l75-213q8-24 29-39t47-15h410q26 0 47 15t29 39l75 213q2 6 3 13t1 14v286q0 25-17.5 42.5T780-120q-25 0-42.5-17.5T720-180v-20H240Zm-8-360h496l-42-120H274l-42 120Zm-32 80v200-200Zm100 160q25 0 42.5-17.5T360-380q0-25-17.5-42.5T300-440q-25 0-42.5 17.5T240-380q0 25 17.5 42.5T300-320Zm360 0q25 0 42.5-17.5T720-380q0-25-17.5-42.5T660-440q-25 0-42.5 17.5T600-380q0 25 17.5 42.5T660-320Zm-460 40h560v-200H200v200Z'/></svg>
                    ) }
                    <span className='ml-4'>Izin/Cuti</span>
                  </a>
                </li>
                <li className='relative px-6 py-3'>
                  { location.pathname == '/admin/profile' && (
                    <span className='absolute inset-y-0 left-0 w-1 bg-primary rounded-tr-lg rounded-br-lg' aria-hidden='true'></span>
                  ) }
                  <a className={`inline-flex items-center w-full text-sm font-semibold ${location.pathname == '/admin/profile'? 'text-gray-800' : 'text-gray-500'} transition-colors duration-150 hover:text-gray-800`} href='/admin/profile'>
                    { location.pathname == '/admin/profile' ? (
                      <svg className='w-5 h-5' xmlns='http://www.w3.org/2000/svg' height='24px' viewBox='0 -960 960 960' width='24px' fill='currentColor'><path d='M234-276q51-39 114-61.5T480-360q69 0 132 22.5T726-276q35-41 54.5-93T800-480q0-133-93.5-226.5T480-800q-133 0-226.5 93.5T160-480q0 59 19.5 111t54.5 93Zm246-164q-59 0-99.5-40.5T340-580q0-59 40.5-99.5T480-720q59 0 99.5 40.5T620-580q0 59-40.5 99.5T480-440Zm0 360q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Z'/></svg>
                    ) : (
                      <svg className='w-5 h-5' xmlns='http://www.w3.org/2000/svg' height='24px' viewBox='0 -960 960 960' width='24px' fill='currentColor'><path d='M234-276q51-39 114-61.5T480-360q69 0 132 22.5T726-276q35-41 54.5-93T800-480q0-133-93.5-226.5T480-800q-133 0-226.5 93.5T160-480q0 59 19.5 111t54.5 93Zm246-164q-59 0-99.5-40.5T340-580q0-59 40.5-99.5T480-720q59 0 99.5 40.5T620-580q0 59-40.5 99.5T480-440Zm0 360q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q53 0 100-15.5t86-44.5q-39-29-86-44.5T480-280q-53 0-100 15.5T294-220q39 29 86 44.5T480-160Zm0-360q26 0 43-17t17-43q0-26-17-43t-43-17q-26 0-43 17t-17 43q0 26 17 43t43 17Zm0-60Zm0 360Z'/></svg>
                    ) }
                    <span className='ml-4'>Profile</span>
                  </a>
                </li>
              </ul>

              <div className='px-6 my-6'>
                <button onClick={() => setIsShowConfirmLogout(true)} className='flex items-center justify-between w-full px-4 py-2 text-sm font-medium leading-5 text-white transition-colors duration-150 bg-red-600 border border-transparent rounded-lg active:bg-red-600 hover:bg-red-700 focus:outline-none focus:shadow-outline-red'>
                  Logout
                </button>
              </div>

              <a href='/e-presensi.apk' download className='flex w-full text-xs px-6 my-6 text-primary'>
                <span className='flex w-full justify-between items-center hover:border-b hover:border-primary'>
                  <span>Download APK</span>
                  <span>{fileSize} MB</span>
                </span>
              </a>
            </div>
          </aside>
        </>
      )}

      <div className='w-full min-h-screen flex flex-col flex-1 md:pl-64 bg-primary-light'>
        <Toaster position='top-center' reverseOrder={false} />
        {/* HEADER */}
        <header className='z-10 py-4 bg-white shadow-md'>
          <div className='container flex items-center justify-between h-full px-6 mx-auto text-primary'>
            <button onClick={() => setIsSideMenuOpen(!isSideMenuOpen)} className='p-1 mr-5 -ml-1 rounded-md md:hidden focus:ring-2 focus:ring-purple-200/50' aria-label='Menu'>
              <svg className='w-6 h-6' aria-hidden='true' fill='currentColor' viewBox='0 0 20 20'>
                <path fillRule='evenodd' d='M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z' clipRule='evenodd'></path>
              </svg>
            </button>
            <div className='flex w-full justify-end gap-1 items-center text-base font-medium text-primary'>
              Halo, {employee?.fullname}
            </div>
          </div>
        </header>

        <Outlet />
      </div>

      {isShowConfirmLogout && (
        <ConfirmLogout showModal={isShowConfirmLogout} handleShowModal={() => setIsShowConfirmLogout(false)} handleLogout={handleLogout} />
      )}
    </>
  );
};

export default AdminLayout
import React, { useState } from 'react'
import Cookies from 'js-cookie'
import { isAuth } from '../utils/auth'
import toast, { Toaster } from 'react-hot-toast'

const Login = () => {
  const [form, setForm] = useState({
    username: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)

  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    if (form.username != '' || form.password != '') {
      toast.loading('Login diproses...')

      await fetch(`/api/auth`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(form)
      }).then(async (response) => {
        if (!response.ok) {
          return response.json().then(error => {
            throw new Error(error.message)
          })
        }
        return response.json()
      }).then(async (data) => {
        Cookies.set('access-token', data.token, { expires: 90 })
        const { user } = isAuth()

        if (user.role == 'Admin') {
          window.location.replace('/admin')
        } else {
          window.location.replace('/')
        }
        setIsLoading(false)
        toast.dismiss()
      }).catch((error) => {
        toast.dismiss()
        setIsLoading(false)
        toast.error(error.message)
        console.error('Error:', error.message)
      })
    } else {
      setIsLoading(false)
      toast.error('Harap isi username dan password')
    }
  }

  return (
    <div className='bg-gray-100 min-h-screen flex items-center justify-center'>
      <Toaster position='top-center' reverseOrder={false} />
      <div className='flex flex-col gap-6 bg-white w-full min-h-screen md:min-h-fit max-w-md pt-10 md:pt-6 pb-6 px-6 rounded-lg shadow-md'>
        <div className='flex flex-col gap-2'>
          <h1 className='text-2xl font-semibold'>
            Selamat Datang Kembali
            <br />
            di <span className='text-primary'>e-Presensi</span>
          </h1>
          <p className='text-sm text-grey'>Silahkan login terlebih dahulu</p>
        </div>
        <form onSubmit={handleLogin} className='flex flex-col gap-4'>
          <div className='flex flex-col gap-2'>
            <label htmlFor='username' className='block text-sm font-medium text-black'>Username</label>
            <input
              type='text'
              id='username'
              name='username'
              value={form.username}
              onChange={handleFormChange}
              className='px-3 py-2 w-full text-sm border border-gray-300 rounded-lg outline-none focus:border-primary placeholder:text-sm'
              placeholder='Masukkan username'
            />
          </div>
          <div className='flex flex-col gap-2'>
            <label htmlFor='password' className='block text-sm font-medium text-black'>Password</label>
            <div className='relative'>
              <input
                type={!showPassword ? 'password' : 'text'}
                id='password'
                name='password'
                value={form.password}
                onChange={handleFormChange}
                className='px-3 py-2 text-sm w-full border border-gray-300 rounded-lg outline-none focus:border-primary placeholder:text-sm'
                placeholder='Masukkan password'
              />
              <button
                type='button'
                onClick={() => setShowPassword(!showPassword)}
                className='absolute right-3 top-1/2 transform -translate-y-1/2 text-grey'
              >
                {!showPassword ? 
                  <svg className='w-5 h-5 text-grey' xmlns='http://www.w3.org/2000/svg' height='24px' viewBox='0 -960 960 960' width='24px' fill='currentColor'>
                    <path d='M480-320q75 0 127.5-52.5T660-500q0-75-52.5-127.5T480-680q-75 0-127.5 52.5T300-500q0 75 52.5 127.5T480-320Zm0-72q-45 0-76.5-31.5T372-500q0-45 31.5-76.5T480-608q45 0 76.5 31.5T588-500q0 45-31.5 76.5T480-392Zm0 192q-134 0-244.5-72T61-462q-5-9-7.5-18.5T51-500q0-10 2.5-19.5T61-538q64-118 174.5-190T480-800q134 0 244.5 72T899-538q5 9 7.5 18.5T909-500q0 10-2.5 19.5T899-462q-64 118-174.5 190T480-200Zm0-300Zm0 220q113 0 207.5-59.5T832-500q-50-101-144.5-160.5T480-720q-113 0-207.5 59.5T128-500q50 101 144.5 160.5T480-280Z'/>
                  </svg> : <svg className='w-5 h-5 text-grey' xmlns='http://www.w3.org/2000/svg' height='24px' viewBox='0 -960 960 960' width='24px' fill='currentColor'>
                    <path d='M607-627q29 29 42.5 66t9.5 76q0 15-11 25.5T622-449q-15 0-25.5-10.5T586-485q5-26-3-50t-25-41q-17-17-41-26t-51-4q-15 0-25.5-11T430-643q0-15 10.5-25.5T466-679q38-4 75 9.5t66 42.5Zm-127-93q-19 0-37 1.5t-36 5.5q-17 3-30.5-5T358-742q-5-16 3.5-31t24.5-18q23-5 46.5-7t47.5-2q137 0 250.5 72T904-534q4 8 6 16.5t2 17.5q0 9-1.5 17.5T905-466q-18 40-44.5 75T802-327q-12 11-28 9t-26-16q-10-14-8.5-30.5T753-392q24-23 44-50t35-58q-50-101-144.5-160.5T480-720Zm0 520q-134 0-245-72.5T60-463q-5-8-7.5-17.5T50-500q0-10 2-19t7-18q20-40 46.5-76.5T166-680l-83-84q-11-12-10.5-28.5T84-820q11-11 28-11t28 11l680 680q11 11 11.5 27.5T820-84q-11 11-28 11t-28-11L624-222q-35 11-71 16.5t-73 5.5ZM222-624q-29 26-53 57t-41 67q50 101 144.5 160.5T480-280q20 0 39-2.5t39-5.5l-36-38q-11 3-21 4.5t-21 1.5q-75 0-127.5-52.5T300-500q0-11 1.5-21t4.5-21l-84-82Zm319 93Zm-151 75Z'/>
                  </svg>
                }
              </button>
            </div>
          </div>
          <div className='mt-6'>
            {isLoading ? (
              <button className='w-full py-2 px-4 bg-primary text-white font-semibold rounded-lg disabled:opacity-50' disabled>
                Loading...
              </button>
            ) : (
              <button type='submit' className='w-full py-2 px-4 bg-primary text-white font-semibold rounded-lg hover:bg-primary/80'>
                Login
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}

export default Login
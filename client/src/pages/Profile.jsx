import React, { useState, useEffect } from 'react'
import Loading from '../components/Loading'
import { isAuth } from '../utils/auth'
import Cookies from 'js-cookie'
import toast from 'react-hot-toast'

const Profile = () => {
  const [employee, setEmployee] = useState()
  const [formError, setFormError] = useState('')
  const [employeeForm, setEmployeeForm] = useState({
    fullname: '',
    gender: '',
    phone: '',
    username: '',
    role: ''
  })
  const [passwordForm, setPasswordForm] = useState({
    password: '',
    newPassword: ''
  })

  const [isDisabledEmployee, setIsDisabledEmployee] = useState(true)
  const [isDisabledPass, setIsDisabledPass] = useState(true)

  const [isShowPass, setIsShowPass] = useState(false)
  const [isShowConfirmPass, setIsShowConfirmPass] = useState(false)
  const [loading, setLoading] = useState(false)

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

      const data = await employeeRes.json()
      const employeeData = data.data[0]
      setEmployee(employeeData)
      setEmployeeForm({
        fullname: employeeData.fullname,
        gender: employeeData.gender,
        phone: employeeData.phone,
        username: employeeData.User.username
      })
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }
  
  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    if (!loading) {
      setIsDisabledEmployee(formError !== '' || (employeeForm?.fullname == employee?.fullname && employeeForm?.username == employee?.User.username && employeeForm?.phone == employee?.phone && employeeForm?.gender == employee?.gender))
    }
  }, [formError, employeeForm])

  useEffect(() => {
    setIsDisabledPass(passwordForm.password == '' || passwordForm.newPassword == '')
  }, [passwordForm])

  const handleFormChange = (e) => {
    if (e.target.name == 'username') {
      const invalidChars = /[^a-zA-Z0-9._]/g
      if (invalidChars.test(e.target.value)) {
        setFormError('Hanya huruf, angka, . dan _ yang diperbolehkan.')
      } else {
        setFormError('')
      }
    }
    setEmployeeForm({ ...employeeForm, [e.target.name]: e.target.value })
  }

  const handlePassFormChange = (e) => {
    setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value })
  }

  const handleUpdateEmployee = async (e) => {
    e.preventDefault()
    toast.loading('Mengubah data profile...')
    
    try {
      const token = Cookies.get('access-token')
      const userRes = await fetch(`/api/user/${employee.users_id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token,
        },
        body: JSON.stringify(employeeForm)
      })

      if (!userRes.ok) {
        throw Error('Data user gagal diubah')
      }

      const userData = await userRes.json()
      const user = userData.data

      const employeeRes = await fetch(`/api/employee/${employee.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token,
        },
        body: JSON.stringify({
          ...employeeForm,
          users_id: user.id
        })
      })

      if (employeeRes.ok) {
        toast.dismiss()
        toast.success('Profile berhasil diubah')
        loadData()
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Profile gagal diubah')
    }
  }

  const handleUpdatePass = async (e) => {
    e.preventDefault()
    toast.loading('Mengubah data password...')
    
    try {
      const token = Cookies.get('access-token')
      const userRes = await fetch(`/api/change-password/${employee.users_id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token,
        },
        body: JSON.stringify(passwordForm)
      })

      const data = await userRes.json()

      if (userRes.ok) {
        toast.dismiss()
        toast.success('Password berhasil diubah')
        setPasswordForm({
          password: '',
          newPassword: ''
        })
      } else {
        toast.dismiss()
        toast.error(data.message)
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Password gagal diubah')
    }
  }
  
  return (
    <main className='h-full overflow-y-auto'>
      { loading ? (
        <div className='w-full h-[calc(100vh-64px)] flex items-center justify-center relative'>
          <Loading size={50} />
        </div>
      ) : (
        <div className='flex flex-col gap-6 p-6 mx-auto'>
          <h2 className='font-semibold text-gray-700'>Profile</h2>

          <div className='grid gap-6 md:gap-4 lg:gap-6 grid-cols-1 md:grid-cols-2'>
            <div className='flex flex-col p-4 lg:p-6 gap-4 bg-white rounded-lg shadow-sm'>
              <h3 className='font-semibold text-gray-700'>Edit Profile</h3>
              <form onSubmit={handleUpdateEmployee} className='flex flex-col gap-4'>
                <div className='flex flex-col gap-2'>
                  <label htmlFor='fullname' className='text-sm font-medium label-required'>Nama Lengkap</label>
                  <input
                    type='text'
                    id='fullname'
                    name='fullname'
                    value={employeeForm.fullname}
                    onChange={handleFormChange}
                    className='px-3 py-2 w-full text-sm border border-gray-300 rounded-lg outline-none focus:border-blue-500 placeholder:text-sm'
                    placeholder='Masukkan Nama Lengkap'
                    required
                  />
                </div>
                <div className='flex flex-col gap-2'>
                  <label htmlFor='gender' className='text-sm font-medium label-required'>Jenis Kelamin</label>
                  <div className='flex items-center gap-2 mx-2'>
                    <input type='radio' id='man' name='gender' value='Laki-laki' checked={employeeForm.gender == 'Laki-laki'} onChange={handleFormChange} required />
                    <label htmlFor='man' className='text-sm mr-6'>Laki-laki</label>
                    <input type='radio' id='woman' name='gender' value='Perempuan' checked={employeeForm.gender == 'Perempuan'} onChange={handleFormChange} required />
                    <label htmlFor='woman' className='text-sm'>Perempuan</label>
                  </div>
                </div>
                <div className='flex flex-col gap-2'>
                  <label htmlFor='phone' className='text-sm font-medium'>No HP</label>
                  <input
                    type='text'
                    id='phone'
                    name='phone'
                    value={employeeForm.phone}
                    onChange={handleFormChange}
                    className='px-3 py-2 w-full text-sm border border-gray-300 rounded-lg outline-none focus:border-blue-500 placeholder:text-sm'
                    placeholder='Masukkan Nomor Handphone'
                  />
                </div>
                <div className='flex flex-col gap-2'>
                  <label htmlFor='username' className='text-sm font-medium label-required'>Username</label>
                  <div>
                    <input
                      type='text'
                      id='username'
                      name='username'
                      value={employeeForm.username}
                      onChange={handleFormChange}
                      className='px-3 py-2 w-full text-sm border border-gray-300 rounded-lg outline-none focus:border-blue-500 placeholder:text-sm'
                      placeholder='Masukkan Username'
                      required
                    />
                    {formError != '' && <p className='text-[10px] text-alert'>{formError}</p>}
                  </div>
                </div>
                <div className='mt-2.5'>
                  <button type='submit' disabled={isDisabledEmployee} className={`w-fit py-2 px-4 ${isDisabledEmployee ? 'bg-primary/60' : 'bg-primary hover:bg-primary/80'} text-sm md:text-base text-white font-semibold rounded-lg`}>
                    Edit Profile
                  </button>
                </div>
              </form>
            </div>

            <div className='flex flex-col p-4 lg:p-6 gap-4 bg-white rounded-lg shadow-sm'>
              <h3 className='font-semibold text-gray-700'>Edit Password</h3>
              <form onSubmit={handleUpdatePass} className='flex flex-col gap-4'>
                <div className='flex flex-col gap-2'>
                  <label htmlFor='password' className='block text-sm font-medium text-black label-required'>Password</label>
                  <div className='relative'>
                    <input
                      type={!isShowPass ? 'password' : 'text'}
                      id='password'
                      name='password'
                      value={passwordForm.password}
                      onChange={handlePassFormChange}
                      className='px-3 py-2 text-sm w-full border border-gray-300 rounded-lg outline-none focus:border-primary placeholder:text-sm'
                      placeholder='Masukkan password saat ini'
                      required
                    />
                    <button
                      type='button'
                      onClick={() => setIsShowPass(!isShowPass)}
                      className='absolute right-3 top-1/2 transform -translate-y-1/2 text-grey'
                    >
                      {!isShowPass ? 
                        <svg className='w-5 h-5 text-grey' xmlns='http://www.w3.org/2000/svg' height='24px' viewBox='0 -960 960 960' width='24px' fill='currentColor'>
                          <path d='M480-320q75 0 127.5-52.5T660-500q0-75-52.5-127.5T480-680q-75 0-127.5 52.5T300-500q0 75 52.5 127.5T480-320Zm0-72q-45 0-76.5-31.5T372-500q0-45 31.5-76.5T480-608q45 0 76.5 31.5T588-500q0 45-31.5 76.5T480-392Zm0 192q-134 0-244.5-72T61-462q-5-9-7.5-18.5T51-500q0-10 2.5-19.5T61-538q64-118 174.5-190T480-800q134 0 244.5 72T899-538q5 9 7.5 18.5T909-500q0 10-2.5 19.5T899-462q-64 118-174.5 190T480-200Zm0-300Zm0 220q113 0 207.5-59.5T832-500q-50-101-144.5-160.5T480-720q-113 0-207.5 59.5T128-500q50 101 144.5 160.5T480-280Z'/>
                        </svg> : <svg className='w-5 h-5 text-grey' xmlns='http://www.w3.org/2000/svg' height='24px' viewBox='0 -960 960 960' width='24px' fill='currentColor'>
                          <path d='M607-627q29 29 42.5 66t9.5 76q0 15-11 25.5T622-449q-15 0-25.5-10.5T586-485q5-26-3-50t-25-41q-17-17-41-26t-51-4q-15 0-25.5-11T430-643q0-15 10.5-25.5T466-679q38-4 75 9.5t66 42.5Zm-127-93q-19 0-37 1.5t-36 5.5q-17 3-30.5-5T358-742q-5-16 3.5-31t24.5-18q23-5 46.5-7t47.5-2q137 0 250.5 72T904-534q4 8 6 16.5t2 17.5q0 9-1.5 17.5T905-466q-18 40-44.5 75T802-327q-12 11-28 9t-26-16q-10-14-8.5-30.5T753-392q24-23 44-50t35-58q-50-101-144.5-160.5T480-720Zm0 520q-134 0-245-72.5T60-463q-5-8-7.5-17.5T50-500q0-10 2-19t7-18q20-40 46.5-76.5T166-680l-83-84q-11-12-10.5-28.5T84-820q11-11 28-11t28 11l680 680q11 11 11.5 27.5T820-84q-11 11-28 11t-28-11L624-222q-35 11-71 16.5t-73 5.5ZM222-624q-29 26-53 57t-41 67q50 101 144.5 160.5T480-280q20 0 39-2.5t39-5.5l-36-38q-11 3-21 4.5t-21 1.5q-75 0-127.5-52.5T300-500q0-11 1.5-21t4.5-21l-84-82Zm319 93Zm-151 75Z'/>
                        </svg>
                      }
                    </button>
                  </div>
                </div>
                <div className='flex flex-col gap-2'>
                  <label htmlFor='new-password' className='block text-sm font-medium text-black label-required'>Password Baru</label>
                  <div className='relative'>
                    <input
                      type={!isShowConfirmPass ? 'password' : 'text'}
                      id='new-password'
                      name='newPassword'
                      value={passwordForm.newPassword}
                      onChange={handlePassFormChange}
                      className='px-3 py-2 text-sm w-full border border-gray-300 rounded-lg outline-none focus:border-primary placeholder:text-sm'
                      placeholder='Masukkan password baru'
                      required
                    />
                    <button
                      type='button'
                      onClick={() => setIsShowConfirmPass(!isShowConfirmPass)}
                      className='absolute right-3 top-1/2 transform -translate-y-1/2 text-grey'
                    >
                      {!isShowConfirmPass ? 
                        <svg className='w-5 h-5 text-grey' xmlns='http://www.w3.org/2000/svg' height='24px' viewBox='0 -960 960 960' width='24px' fill='currentColor'>
                          <path d='M480-320q75 0 127.5-52.5T660-500q0-75-52.5-127.5T480-680q-75 0-127.5 52.5T300-500q0 75 52.5 127.5T480-320Zm0-72q-45 0-76.5-31.5T372-500q0-45 31.5-76.5T480-608q45 0 76.5 31.5T588-500q0 45-31.5 76.5T480-392Zm0 192q-134 0-244.5-72T61-462q-5-9-7.5-18.5T51-500q0-10 2.5-19.5T61-538q64-118 174.5-190T480-800q134 0 244.5 72T899-538q5 9 7.5 18.5T909-500q0 10-2.5 19.5T899-462q-64 118-174.5 190T480-200Zm0-300Zm0 220q113 0 207.5-59.5T832-500q-50-101-144.5-160.5T480-720q-113 0-207.5 59.5T128-500q50 101 144.5 160.5T480-280Z'/>
                        </svg> : <svg className='w-5 h-5 text-grey' xmlns='http://www.w3.org/2000/svg' height='24px' viewBox='0 -960 960 960' width='24px' fill='currentColor'>
                          <path d='M607-627q29 29 42.5 66t9.5 76q0 15-11 25.5T622-449q-15 0-25.5-10.5T586-485q5-26-3-50t-25-41q-17-17-41-26t-51-4q-15 0-25.5-11T430-643q0-15 10.5-25.5T466-679q38-4 75 9.5t66 42.5Zm-127-93q-19 0-37 1.5t-36 5.5q-17 3-30.5-5T358-742q-5-16 3.5-31t24.5-18q23-5 46.5-7t47.5-2q137 0 250.5 72T904-534q4 8 6 16.5t2 17.5q0 9-1.5 17.5T905-466q-18 40-44.5 75T802-327q-12 11-28 9t-26-16q-10-14-8.5-30.5T753-392q24-23 44-50t35-58q-50-101-144.5-160.5T480-720Zm0 520q-134 0-245-72.5T60-463q-5-8-7.5-17.5T50-500q0-10 2-19t7-18q20-40 46.5-76.5T166-680l-83-84q-11-12-10.5-28.5T84-820q11-11 28-11t28 11l680 680q11 11 11.5 27.5T820-84q-11 11-28 11t-28-11L624-222q-35 11-71 16.5t-73 5.5ZM222-624q-29 26-53 57t-41 67q50 101 144.5 160.5T480-280q20 0 39-2.5t39-5.5l-36-38q-11 3-21 4.5t-21 1.5q-75 0-127.5-52.5T300-500q0-11 1.5-21t4.5-21l-84-82Zm319 93Zm-151 75Z'/>
                        </svg>
                      }
                    </button>
                  </div>
                </div>
                <div className='mt-2.5'>
                  <button type='submit' disabled={isDisabledPass} className={`w-fit py-2 px-4 ${isDisabledPass ? 'bg-primary/60' : 'bg-primary hover:bg-primary/80'} text-sm md:text-base text-white font-semibold rounded-lg`}>
                    Edit Password
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      ) }
    </main>
  )
}

export default Profile
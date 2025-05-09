import React from 'react'

const FormEmployeeModal = (props) => {
  return (
    <>
      <div onClick={props.handleShowModal} className={`fixed inset-0 z-20 flex items-end bg-black bg-opacity-50 sm:items-center sm:justify-center transition-opacity duration-150 ease-in-out ${props.showModal ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}></div>
      <div className={`fixed flex-col gap-3 p-6 w-[90%] sm:w-1/2 max-h-screen overflow-y-scroll z-20 left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 bg-white rounded-xl text-base text-black ${props.showModal ? 'flex' : 'hidden'}`}>
        <div className='flex justify-between mb-2'>
          <h3 className='text-black'>{props.isEdit ? 'Ubah Data Karyawan' : 'Tambah Data Karyawan'}</h3>
          <button onClick={props.handleShowModal} className='absolute top-3 right-3 text-grey p-1 hover:bg-grey-light/40 rounded-full'>
            <svg className='w-5 h-5' xmlns='http://www.w3.org/2000/svg' height='24px' viewBox='0 -960 960 960' width='24px' fill='currentColor'><path d='M480-424 284-228q-11 11-28 11t-28-11q-11-11-11-28t11-28l196-196-196-196q-11-11-11-28t11-28q11-11 28-11t28 11l196 196 196-196q11-11 28-11t28 11q11 11 11 28t-11 28L536-480l196 196q11 11 11 28t-11 28q-11 11-28 11t-28-11L480-424Z'/></svg>
          </button>
        </div>
        <form onSubmit={props.handleSubmit} className='flex flex-col gap-4'>
          <div className='flex flex-col gap-2'>
            <label htmlFor='fullname' className='text-sm font-medium label-required'>Nama Lengkap</label>
            <input
              type='text'
              id='fullname'
              name='fullname'
              value={props.form.fullname}
              onChange={props.handleFormChange}
              className='px-3 py-2 w-full text-sm border border-gray-300 rounded-lg outline-none focus:border-blue-500 placeholder:text-sm'
              placeholder='Masukkan Nama Lengkap'
              required
            />
          </div>
          <div className='flex flex-col gap-2'>
            <label htmlFor='gender' className='text-sm font-medium label-required'>Jenis Kelamin</label>
            <div className='flex items-center gap-2 mx-2'>
              <input type='radio' id='man' name='gender' value='Laki-laki' checked={props.form.gender == 'Laki-laki'} onChange={props.handleFormChange} required />
              <label htmlFor='man' className='text-sm mr-6'>Laki-laki</label>
              <input type='radio' id='woman' name='gender' value='Perempuan' checked={props.form.gender == 'Perempuan'} onChange={props.handleFormChange} required />
              <label htmlFor='woman' className='text-sm'>Perempuan</label>
            </div>
          </div>
          <div className='flex flex-col gap-2'>
            <label htmlFor='phone' className='text-sm font-medium'>No HP</label>
            <input
              type='text'
              id='phone'
              name='phone'
              value={props.form.phone}
              onChange={props.handleFormChange}
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
                value={props.form.username}
                onChange={props.handleFormChange}
                className='px-3 py-2 w-full text-sm border border-gray-300 rounded-lg outline-none focus:border-blue-500 placeholder:text-sm'
                placeholder='Masukkan Username'
                required
              />
              {props.formError != '' && <p className='text-[10px] text-alert'>{props.formError}</p>}
            </div>
          </div>
          { !props.isEdit && (
            <div className='flex flex-col gap-2'>
              <label htmlFor='password' className='text-sm font-medium label-required'>Password</label>
              <input
                type='text'
                id='password'
                name='password'
                value={props.form.password}
                onChange={props.handleFormChange}
                className='px-3 py-2 w-full text-sm border border-gray-300 rounded-lg outline-none focus:border-blue-500 placeholder:text-sm'
                placeholder='Masukkan Password'
                required
              />
            </div>
          ) }
          <div className='flex flex-col gap-2'>
            <label htmlFor='role' className='text-sm font-medium label-required'>Role</label>
            <div className='flex items-center gap-2 mx-2'>
              <input type='radio' id='admin' name='role' value='Admin' checked={props.form.role == 'Admin'} onChange={props.handleFormChange} required />
              <label htmlFor='admin' className='text-sm mr-6'>Admin</label>
              <input type='radio' id='employee' name='role' value='Karyawan' checked={props.form.role == 'Karyawan'} onChange={props.handleFormChange} required />
              <label htmlFor='employee' className='text-sm'>Karyawan</label>
            </div>
          </div>
          { props.isEdit && (
            <div className='flex flex-col gap-2'>
              <label htmlFor='role' className='text-sm font-medium label-required'>Status</label>
              <div className='flex items-center gap-2 mx-2'>
                <input type='radio' id='active' name='status' value='Active' checked={props.form.status == 'Active'} onChange={props.handleFormChange} required />
                <label htmlFor='active' className='text-sm mr-6'>Active</label>
                <input type='radio' id='inactive' name='status' value='Inactive' checked={props.form.status == 'Inactive'} onChange={props.handleFormChange} required />
                <label htmlFor='inactive' className='text-sm'>Inactive</label>
              </div>
            </div>
          ) }
          <div className='flex justify-end mt-6'>
            <button type='submit' disabled={props.formError !== ''} className='w-fit py-2 px-4 bg-primary text-white font-semibold rounded-lg hover:bg-primary/80'>
              Kirim
            </button>
          </div>
        </form>
      </div>
    </>
  )
}

export default FormEmployeeModal
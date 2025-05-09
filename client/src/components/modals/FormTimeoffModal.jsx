import React from 'react'

const FormTimeoffModal = (props) => {
  return (
    <>
      <div onClick={props.handleShowModal} className={`fixed inset-0 z-20 flex items-end bg-black bg-opacity-50 sm:items-center sm:justify-center transition-opacity duration-150 ease-in-out ${props.showModal ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}></div>
      <div className={`fixed flex-col gap-3 p-6 w-[90%] sm:w-1/2 z-20 left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 bg-white rounded-xl text-base text-black ${props.showModal ? 'flex' : 'hidden'}`}>
        <div className='flex justify-between mb-2'>
          <h3 className='text-black'>Request Izin</h3>
          <button onClick={props.handleShowModal} className='absolute top-3 right-3 text-grey p-1 hover:bg-grey-light/40 rounded-full'>
            <svg className='w-5 h-5' xmlns='http://www.w3.org/2000/svg' height='24px' viewBox='0 -960 960 960' width='24px' fill='currentColor'><path d='M480-424 284-228q-11 11-28 11t-28-11q-11-11-11-28t11-28l196-196-196-196q-11-11-11-28t11-28q11-11 28-11t28 11l196 196 196-196q11-11 28-11t28 11q11 11 11 28t-11 28L536-480l196 196q11 11 11 28t-11 28q-11 11-28 11t-28-11L480-424Z'/></svg>
          </button>
        </div>
        <form onSubmit={props.handleSubmit} className='flex flex-col gap-4'>
          <div className='flex flex-col gap-2'>
            <label htmlFor='title' className='block text-sm font-medium label-required'>Judul</label>
            <input
              type='text'
              id='title'
              name='title'
              value={props.form.title}
              onChange={props.handleFormChange}
              className='px-3 py-2 w-full text-sm border border-gray-300 rounded-lg outline-none focus:border-blue-500 placeholder:text-sm'
              placeholder='Masukkan Judul'
              required
            />
          </div>
          <div className='flex flex-col gap-2'>
            <label htmlFor='start_date' className='block text-sm font-medium label-required'>Tanggal Awal</label>
            <input
              type='date'
              id='start_date'
              name='start_date'
              max={props.form.end_date || undefined}
              value={props.form.start_date}
              onChange={props.handleFormChange}
              className='px-3 py-2 w-full text-sm border border-gray-300 rounded-lg outline-none focus:border-blue-500 placeholder:text-sm'
              required
            />
          </div>
          <div className='flex flex-col gap-2'>
            <label htmlFor='end_date' className='block text-sm font-medium label-required'>Tanggal Akhir</label>
            <input
              type='date'
              id='end_date'
              name='end_date'
              min={props.form.start_date || undefined}
              value={props.form.end_date}
              onChange={props.handleFormChange}
              className='px-3 py-2 w-full text-sm border border-gray-300 rounded-lg outline-none focus:border-blue-500 placeholder:text-sm'
              required
            />
          </div>
          <div className='flex flex-col gap-2'>
            <label htmlFor='description' className='block text-sm font-medium'>Keterangan</label>
            <textarea
              type='text'
              id='description'
              name='description'
              value={props.form.description}
              onChange={props.handleFormChange}
              className='px-3 py-2 w-full text-sm border border-gray-300 rounded-lg outline-none focus:border-blue-500 placeholder:text-sm'
              placeholder='Masukkan Keterangan'
            />
          </div>
          <div className='flex justify-end mt-6'>
            <button type='submit' className='w-fit py-2 px-4 bg-primary text-white font-semibold rounded-lg hover:bg-primary/80'>
              Kirim
            </button>
          </div>
        </form>
      </div>
    </>
  )
}

export default FormTimeoffModal
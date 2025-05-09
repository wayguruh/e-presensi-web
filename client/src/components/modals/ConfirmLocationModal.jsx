import React from 'react'

const ConfirmLocationModal = (props) => {
  return (
    <>
      <div onClick={props.handleShowModal} className={`fixed inset-0 z-20 flex items-end bg-black bg-opacity-50 sm:items-center sm:justify-center transition-opacity duration-150 ease-in-out ${props.showModal ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}></div>
      <div className={`fixed flex-col gap-3 p-6 w-[90%] sm:w-1/2 z-20 left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 bg-white rounded-xl text-base text-grey ${props.showModal ? 'flex' : 'hidden'}`}>
        <div className='flex justify-between mb-2'>
          <h3 className='text-black'>Peringatan Lokasi</h3>
          <button onClick={props.handleShowModal} className='absolute top-3 right-3 text-grey p-1 hover:bg-grey-light/40 rounded-full'>
            <svg className='w-5 h-5' xmlns='http://www.w3.org/2000/svg' height='24px' viewBox='0 -960 960 960' width='24px' fill='currentColor'><path d='M480-424 284-228q-11 11-28 11t-28-11q-11-11-11-28t11-28l196-196-196-196q-11-11-11-28t11-28q11-11 28-11t28 11l196 196 196-196q11-11 28-11t28 11q11 11 11 28t-11 28L536-480l196 196q11 11 11 28t-11 28q-11 11-28 11t-28-11L480-424Z'/></svg>
          </button>
        </div>
        <p className='text-grey text-sm'>Anda berada di luar area kantor.</p>
        <form onSubmit={props.handleSubmit} className='flex flex-col gap-3'>
          <div className='flex flex-col gap-2'>
            <label htmlFor='description' className='block text-sm font-medium text-black label-required'>Keterangan</label>
            <textarea
              type='text'
              id='description'
              name='description'
              value={props.description}
              onChange={props.handleDescriptionChange}
              className='px-3 py-2 w-full text-black text-sm border border-gray-300 rounded-lg outline-none focus:border-primary placeholder:text-sm'
              placeholder='Masukkan keterangan lokasi Anda (Contoh: di kantor Sribhawono)'
              required={props.showModal}
            />
          </div>
          <div className='flex gap-3 justify-end'>
            <button type='submit' className='flex gap-1 items-center px-3 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/80'>Kirim</button>
            <button type='button' onClick={props.handleShowModal} className='flex gap-1 items-center px-3 py-2 bg-transparent ring-1 ring-primary text-primary text-sm font-medium rounded-lg hover:bg-primary/10'>Batal</button>
          </div>
        </form>
      </div>
    </>
  )
}

export default ConfirmLocationModal
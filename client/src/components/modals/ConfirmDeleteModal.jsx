import React from 'react'

const ConfirmDeleteModal = (props) => {
  return (
    <>
      <div onClick={props.handleShowModal} className={`fixed inset-0 z-20 flex items-end bg-black bg-opacity-50 sm:items-center sm:justify-center transition-opacity duration-150 ease-in-out ${props.showModal ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}></div>
      <div className={`fixed flex-col gap-3 p-6 w-[90%] sm:w-1/2 z-20 left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 bg-white rounded-xl text-base text-grey ${props.showModal ? 'flex' : 'hidden'}`}>
        <div className='flex justify-between mb-2'>
          <h3 className='text-black'>Konfirmasi Hapus Data</h3>
          <button onClick={props.handleShowModal} className='absolute top-3 right-3 text-grey p-1 hover:bg-grey-light/40 rounded-full'>
            <svg className='w-5 h-5' xmlns='http://www.w3.org/2000/svg' height='24px' viewBox='0 -960 960 960' width='24px' fill='currentColor'><path d='M480-424 284-228q-11 11-28 11t-28-11q-11-11-11-28t11-28l196-196-196-196q-11-11-11-28t11-28q11-11 28-11t28 11l196 196 196-196q11-11 28-11t28 11q11 11 11 28t-11 28L536-480l196 196q11 11 11 28t-11 28q-11 11-28 11t-28-11L480-424Z'/></svg>
          </button>
        </div>
        <p className='text-grey text-sm'>Apakah Anda yakin ingin menghapus data?</p>
        <div className='flex justify-end gap-3 mt-2'>
          <button onClick={() => props.handleDelete(props.row)} className='flex gap-1 items-center px-3 py-2 bg-alert text-white text-sm font-medium rounded-lg hover:bg-alert/80'>Hapus</button>
          <button onClick={props.handleShowModal} className='flex gap-1 items-center px-3 py-2 bg-transparent ring-1 ring-primary text-primary text-sm font-medium rounded-lg hover:bg-primary/10'>Batal</button>
        </div>
      </div>
    </>
  )
}

export default ConfirmDeleteModal
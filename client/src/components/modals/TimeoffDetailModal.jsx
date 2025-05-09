import React from 'react'
import { getDateFromDateTime } from '../../utils/dateTimeFormater'

const TimeoffDetailModal = (props) => {
  return (
    <>
      <div onClick={props.handleShowModal} className={`fixed inset-0 z-20 flex items-end bg-black bg-opacity-50 sm:items-center sm:justify-center transition-opacity duration-150 ease-in-out ${props.showModal ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}></div>
      <div className={`fixed flex-col gap-3 p-6 w-[90%] sm:w-1/2 z-20 left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 bg-white rounded-xl text-base text-grey ${props.showModal ? 'flex' : 'hidden'}`}>
        <div className='flex justify-between mb-2'>
          <h3 className='text-black'>Detail Permintaan</h3>
          <button onClick={props.handleShowModal} className='absolute top-3 right-3 text-grey p-1 hover:bg-grey-light/40 rounded-full'>
            <svg className='w-5 h-5' xmlns='http://www.w3.org/2000/svg' height='24px' viewBox='0 -960 960 960' width='24px' fill='currentColor'><path d='M480-424 284-228q-11 11-28 11t-28-11q-11-11-11-28t11-28l196-196-196-196q-11-11-11-28t11-28q11-11 28-11t28 11l196 196 196-196q11-11 28-11t28 11q11 11 11 28t-11 28L536-480l196 196q11 11 11 28t-11 28q-11 11-28 11t-28-11L480-424Z'/></svg>
          </button>
        </div>
        <div className='flex flex-wrap md:flex-nowrap gap-3'>
          <div className='w-full flex flex-col gap-3'>
            <div className='space-y-0.5'>
              <span className='text-black font-medium text-sm'>Judul</span>
              <p className='text-sm md:text-base'>{props.timeoff.title}</p>
            </div>
            <div className='space-y-0.5'>
              <span className='text-black font-medium text-sm'>Tanggal Awal</span>
              <p className='text-sm md:text-base'>{getDateFromDateTime(props.timeoff.start_date)}</p>
            </div>
            <div className='space-y-0.5'>
              <span className='text-black font-medium text-sm'>Tanggal Akhir</span>
              <p className='text-sm md:text-base'>{getDateFromDateTime(props.timeoff.end_date)}</p>
            </div>
          </div>
          <div className='w-full flex flex-col gap-3'>
            <div className='space-y-0.5'>
              <span className='text-black font-medium text-sm'>Diajukan oleh</span>
              <p className='text-sm md:text-base'>{props.timeoff.Employee.fullname}</p>
            </div>
            <div className='space-y-0.5'>
              <span className='text-black font-medium text-sm'>Diajukan pada</span>
              <p className='text-sm md:text-base'>{getDateFromDateTime(props.timeoff.createdAt)}</p>
            </div>
            <div className='space-y-0.5'>
              <span className='text-black font-medium text-sm'>Status</span>
              <p className={`${props.timeoff.approved == 'APPROVED' ? 'bg-success/30 text-success' : props.timeoff.approved == 'PENDING' ? 'bg-primary/30 text-primary' : props.timeoff.approved == 'REJECTED' ? 'bg-alert/30 text-alert' : 'bg-black/30 text-black'} text-sm md:text-base w-fit px-2 py-0.5 text-[12px] rounded-full`}>{props.timeoff.approved}</p>
            </div>
          </div>
        </div>
        <div className='w-full space-y-0.5'>
          <span className='text-black font-medium text-sm'>Keterangan</span>
          <p className='text-sm md:text-base'>{props.timeoff.description != '' ? props.timeoff.description : '-'}</p>
        </div>
        {(props.timeoff.approved == 'PENDING' && props.isAdmin) &&  (
          <div className='flex justify-end gap-3 mt-2'>
            <button onClick={() => props.handleApprove('REJECTED')} className='flex gap-1 items-center pl-2 pr-3 py-2 bg-alert text-white text-sm font-medium rounded-lg hover:bg-alert/80'>
              <svg className='w-5 h-5' xmlns='http://www.w3.org/2000/svg' height='24px' viewBox='0 -960 960 960' width='24px' fill='currentColor'><path d='M480-424 284-228q-11 11-28 11t-28-11q-11-11-11-28t11-28l196-196-196-196q-11-11-11-28t11-28q11-11 28-11t28 11l196 196 196-196q11-11 28-11t28 11q11 11 11 28t-11 28L536-480l196 196q11 11 11 28t-11 28q-11 11-28 11t-28-11L480-424Z'/></svg>
              <span>Tolak</span>
            </button>
            <button onClick={() => props.handleApprove('APPROVED')} className='flex gap-1 items-center pl-2 pr-3 py-2 bg-success text-white text-sm font-medium rounded-lg hover:bg-success/80'>
              <svg className='w-5 h-5' xmlns='http://www.w3.org/2000/svg' height='24px' viewBox='0 -960 960 960' width='24px' fill='currentColor'><path d='m382-354 339-339q12-12 28-12t28 12q12 12 12 28.5T777-636L410-268q-12 12-28 12t-28-12L182-440q-12-12-11.5-28.5T183-497q12-12 28.5-12t28.5 12l142 143Z'/></svg>
              <span>Terima</span>
            </button>
          </div>
        )}
      </div>
    </>
  )
}

export default TimeoffDetailModal
import React, { useState } from 'react'
import { getTimeFromDateTime, getDateWithMonthString } from '../../utils/dateTimeFormater'

const PresenceCard = (props) => {
  const [isShow, setIsShow] = useState(false)

  return (
    <div onClick={() => setIsShow(!isShow)} className='flex flex-col px-3 py-2 bg-white rounded-md shadow-sm'>
      <div className='flex items-center gap-2'>
        <div className='w-fit h-fit text-primary bg-primary/15 rounded-md p-2'>
          <svg className='w-5 h-5' xmlns='http://www.w3.org/2000/svg' height='24px' viewBox='0 -960 960 960' width='24px' fill='currentColor'>
            <path d='M200-80q-33 0-56.5-23.5T120-160v-560q0-33 23.5-56.5T200-800h40v-40q0-17 11.5-28.5T280-880q17 0 28.5 11.5T320-840v40h320v-40q0-17 11.5-28.5T680-880q17 0 28.5 11.5T720-840v40h40q33 0 56.5 23.5T840-720v560q0 33-23.5 56.5T760-80H200Zm0-80h560v-400H200v400Zm0-480h560v-80H200v80Zm0 0v-80 80Zm280 240q-17 0-28.5-11.5T440-440q0-17 11.5-28.5T480-480q17 0 28.5 11.5T520-440q0 17-11.5 28.5T480-400Zm-160 0q-17 0-28.5-11.5T280-440q0-17 11.5-28.5T320-480q17 0 28.5 11.5T360-440q0 17-11.5 28.5T320-400Zm320 0q-17 0-28.5-11.5T600-440q0-17 11.5-28.5T640-480q17 0 28.5 11.5T680-440q0 17-11.5 28.5T640-400ZM480-240q-17 0-28.5-11.5T440-280q0-17 11.5-28.5T480-320q17 0 28.5 11.5T520-280q0 17-11.5 28.5T480-240Zm-160 0q-17 0-28.5-11.5T280-280q0-17 11.5-28.5T320-320q17 0 28.5 11.5T360-280q0 17-11.5 28.5T320-240Zm320 0q-17 0-28.5-11.5T600-280q0-17 11.5-28.5T640-320q17 0 28.5 11.5T680-280q0 17-11.5 28.5T640-240Z'/>
          </svg>
        </div>
        <div className='w-full flex justify-between items-center lg:gap-10'>
          <div className='flex flex-col'>
            <p className='text-sm text-black font-medium text-nowrap'>{props.isAdmin ? props.presence.Employee.fullname : 'Hadir'}</p>
            <p className='text-[13px] text-grey truncate max-w-32 md:max-w-20 lg:max-w-36'>{getDateWithMonthString(props.presence.createdAt)}</p>
          </div>
          <div className='flex flex-col justify-center items-end'>
            <p className='text-sm text-black font-medium'>{getTimeFromDateTime(props.presence.createdAt)}</p>
            {props.presence.description && !isShow && (
              <p className='text-[13px] text-grey truncate max-w-20 md:max-w-16 lg:max-w-36 xl:max-w-60'>{props.presence.description}</p>
            )}
          </div>
        </div>
      </div>
      { isShow && props.presence.description && (
        <div className={`w-full flex flex-col items-start pt-2 mt-2 border-t border-grey-light transition-all ease-in-out duration-300}`}>
          <span className='text-[13px] text-black font-medium'>Keterangan</span>
          <p className='text-[13px] text-grey'>{props.presence.description}</p>
        </div>
      ) }
    </div>
  )
}

export default PresenceCard
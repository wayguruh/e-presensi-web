import React from 'react'
import { getDateRange } from '../../utils/dateTimeFormater'

const TimeoffCard = (props) => {
  return (
    <div onClick={props.handleClick} className='flex items-center px-3 py-2 bg-white rounded-md shadow-sm gap-2'>
      <div className='w-fit h-fit text-primary bg-primary/15 rounded-md p-2'>
        <svg className='w-5 h-5' xmlns='http://www.w3.org/2000/svg' height='24px' viewBox='0 -960 960 960' width='24px' fill='currentColor'>
          <path d='M240-200v20q0 25-17.5 42.5T180-120q-25 0-42.5-17.5T120-180v-286q0-7 1-14t3-13l75-213q8-24 29-39t47-15h410q26 0 47 15t29 39l75 213q2 6 3 13t1 14v286q0 25-17.5 42.5T780-120q-25 0-42.5-17.5T720-180v-20H240Zm-8-360h496l-42-120H274l-42 120Zm-32 80v200-200Zm100 160q25 0 42.5-17.5T360-380q0-25-17.5-42.5T300-440q-25 0-42.5 17.5T240-380q0 25 17.5 42.5T300-320Zm360 0q25 0 42.5-17.5T720-380q0-25-17.5-42.5T660-440q-25 0-42.5 17.5T600-380q0 25 17.5 42.5T660-320Zm-460 40h560v-200H200v200Z'/>
        </svg>
      </div>
      <div className='w-full flex justify-between items-center lg:gap-10'>
        <div className='flex flex-col'>
          <span className='text-sm text-black font-medium'>{props.timeoff.title}</span>
          <span className='text-[13px] text-grey truncate max-w-24'>{getDateRange(props.timeoff.start_date, props.timeoff.end_date)}</span>
        </div>
        <span className={`text-sm font-medium ${props.timeoff.approved == 'APPROVED' ? 'text-success': props.timeoff.approved == 'REJECTED' ? 'text-alert' : 'text-primary'}`}>{props.timeoff.approved}</span>
      </div>
    </div>
  )
}

export default TimeoffCard
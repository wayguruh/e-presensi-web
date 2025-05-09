import React from 'react'

const TotalCard = (props) => {
  return (
    <div className='flex items-center p-4 bg-white rounded-lg shadow-sm' >
      <div className={`p-3 mr-4 rounded-full ${props.iconColor}`} >
        {props.svgIcon}
      </div>
      <div>
        <p className='mb-2 text-sm font-medium text-gray-600'>
          {props.title}
        </p>
        <p className='text-base md:text-lg font-semibold text-gray-700'>
          {props.value}
        </p>
      </div>
    </div>
  )
}

export default TotalCard
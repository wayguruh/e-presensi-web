import React, { useEffect } from 'react'
import { Chart } from 'chart.js/auto'

const LineChart = (props) => {
  useEffect(() => {
    const lineConfig = {
      type: 'line',
      data: {
        labels: props.labels,
        datasets: props.datasets,
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: false,
          },
        },
        scales: {
          y: {
            ticks: {
              callback: function (value) {
                return Number.isInteger(value) ? value : '';
              },
            },
            beginAtZero: true
          },
        },
      },
    }

    const ctx = document.getElementById('lines')
    new Chart(ctx, lineConfig)

    return () => {
      const chartInstance = Chart.getChart('lines')
      if (chartInstance) {
        chartInstance.destroy()
      }
    }
  }, [])

  return (
    <div className='min-w-0 h-fit p-4 bg-white rounded-lg shadow-sm'>
      <h4 className='mb-4 font-semibold text-gray-800'>{props.title}</h4>
      <canvas id='lines'></canvas>
      <div className='flex justify-center mt-4 space-x-3 text-sm text-gray-600'>
        {props.datasets.map((data, index) => (
          <div key={index} className='flex items-center'>
            <span className='inline-block w-3 h-3 mr-1 rounded-full' style={{ backgroundColor: data.backgroundColor }}></span>
            <span>{data.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default LineChart
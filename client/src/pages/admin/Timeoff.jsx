import React, { useState, useEffect, useMemo, useCallback } from 'react'
import DataTable, { Alignment } from 'react-data-table-component'
import { getDateFromDateTime } from '../../utils/dateTimeFormater'
import Loading from '../../components/Loading'
import ConfirmDeleteModal from '../../components/modals/ConfirmDeleteModal'
import TimeoffDetailModal from '../../components/modals/TimeoffDetailModal'
import FormTimeoffModal from '../../components/modals/FormTimeoffModal'
import Cookies from 'js-cookie'
import { isAuth } from '../../utils/auth'
import toast from 'react-hot-toast'

const Timeoff = () => {
  const [timeoffs, setTimeoffs] = useState([])
  const [filterText, setFilterText] = useState('')
  const [loading, setLoading] = useState(true)
  
  const [limit, setLimit] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalRows, setTotalRows] = useState(1)

  const [selectedRows, setSelectedRows] = useState([])
  const [toggleCleared, setToggleCleared] = useState(false)

  const [showModal, setShowModal] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(false)
  const [deleteConfirmRows, setDeleteConfirmRows] = useState(false)
  const [timeoff, setTimeoff] = useState()

  const [addModal, setAddModal] = useState(false)
  const [form, setForm] = useState({
    title: '',
    start_date: '',
    end_date: '',
    description: ''
  })

  const loadData = async (search=filterText) => {
    setLoading(true)
    
    try {
      const token = Cookies.get('access-token')
      let url = `/api/timeoffs?limit=${limit}&page=${currentPage}`

      if (search) url += `&search=${search}`

      const timeoffRes = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token,
        },
      })

      const timeoffData = await timeoffRes.json()
      setTimeoffs(timeoffData.data ? timeoffData.data : [])
      setTotalRows(timeoffData.total)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }
  
  useEffect(() => {
    loadData()
  }, [limit, currentPage])

  const columns = [
    {
      name: 'Judul',
      selector: row => row.title,
      sortable: true,
    },
    {
      name: 'Diajukan Oleh',
      selector: row => row.Employee.fullname,
      sortable: true,
    },
    {
      name: 'Tanggal Awal',
      selector: row => getDateFromDateTime(row.start_date),
      sortable: true,
    },
    {
      name: 'Tanggal Akhir',
      selector: row => getDateFromDateTime(row.end_date),
      sortable: true,
    },
    {
      name: 'Status',
      selector: row => (
        <span className={`${row.approved == 'APPROVED' ? 'bg-success/30 text-success' : row.approved == 'PENDING' ? 'bg-primary/30 text-primary' : row.approved == 'REJECTED' ? 'bg-alert/30 text-alert' : 'bg-black/30 text-black'} px-2 py-0.5 text-[12px] rounded-full`}>{row.approved}</span>
      ),
      sortable: true,
    },
    {
      name: 'Diajukan pada',
      selector: row => getDateFromDateTime(row.createdAt),
      sortable: true,
    },
    {
      name: 'Aksi',
      selector: row => {
        return (
          <div className='flex gap-1'>
            <button onClick={() => {setShowModal(true); setTimeoff(row)}}>
              <svg className='bg-primary/20 text-primary p-1 rounded-full hover:bg-primary/15 hover:text-primary/80' xmlns='http://www.w3.org/2000/svg' height='24px' viewBox='0 -960 960 960' width='24px' fill='currentColor'>
                <path d='M480-320q75 0 127.5-52.5T660-500q0-75-52.5-127.5T480-680q-75 0-127.5 52.5T300-500q0 75 52.5 127.5T480-320Zm0-72q-45 0-76.5-31.5T372-500q0-45 31.5-76.5T480-608q45 0 76.5 31.5T588-500q0 45-31.5 76.5T480-392Zm0 192q-134 0-244.5-72T61-462q-5-9-7.5-18.5T51-500q0-10 2.5-19.5T61-538q64-118 174.5-190T480-800q134 0 244.5 72T899-538q5 9 7.5 18.5T909-500q0 10-2.5 19.5T899-462q-64 118-174.5 190T480-200Zm0-300Zm0 220q113 0 207.5-59.5T832-500q-50-101-144.5-160.5T480-720q-113 0-207.5 59.5T128-500q50 101 144.5 160.5T480-280Z'/>
              </svg>
            </button>
            <button onClick={() => {setDeleteConfirm(true); setTimeoff(row)}}>
              <svg className='bg-alert/20 text-alert p-1 rounded-full hover:bg-alert/15 hover:text-alert/80' xmlns='http://www.w3.org/2000/svg' height='24px' viewBox='0 -960 960 960' width='24px' fill='currentColor'>
                <path d='M280-120q-33 0-56.5-23.5T200-200v-520q-17 0-28.5-11.5T160-760q0-17 11.5-28.5T200-800h160q0-17 11.5-28.5T400-840h160q17 0 28.5 11.5T600-800h160q17 0 28.5 11.5T800-760q0 17-11.5 28.5T760-720v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM400-280q17 0 28.5-11.5T440-320v-280q0-17-11.5-28.5T400-640q-17 0-28.5 11.5T360-600v280q0 17 11.5 28.5T400-280Zm160 0q17 0 28.5-11.5T600-320v-280q0-17-11.5-28.5T560-640q-17 0-28.5 11.5T520-600v280q0 17 11.5 28.5T560-280ZM280-720v520-520Z'/>
              </svg>
            </button>
          </div>
        )
      },
      sortable: true,
    }
  ]

  const handleLimit = (limit, page) => {
    setLimit(limit)
    setCurrentPage(page)
  }

  const handleChangePage = (page) => {
    setCurrentPage(page)
  }

  const handleSearch = (e) => {
    e.preventDefault()
    if (currentPage == 1) loadData()
    setCurrentPage(1)
  }

  const handleClear = () => {
    setFilterText('')
    if (currentPage == 1) loadData('')
    setCurrentPage(1)
  }

  const handleRowSelected = useCallback(state => {
    setSelectedRows(state.selectedRows)
  }, [])

  const handleApprove = async (status) => {
    try {
      toast.loading('Loading...')
      const token = Cookies.get('access-token')
      const timeoffRes = await fetch(`/api/timeoff/${timeoff.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token,
        },
        body: JSON.stringify({
          approved: status
        })
      })

      if (timeoffRes.ok) {
        toast.dismiss()
        toast.success(status == 'APPROVED' ? 'Izin berhasil disetujui' : 'Izin berhasil ditolak')
        loadData()
        setShowModal(false)
      }
    } catch (error) {
      toast.dismiss()
      toast.error(status == 'APPROVED' ? 'Izin gagal disetujui' : 'Izin gagal ditolak')
      console.error('Error:', error)
    }
  }

  const handleDelete = async (row) => {
    try {
      toast.loading('Loading...')
      const token = Cookies.get('access-token')
      const timeoffRes = await fetch(`/api/timeoff/${row.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token,
        }
      })

      if (timeoffRes.ok) {
        toast.dismiss()
        toast.success('Data berhasil dihapus')
        loadData()
        setDeleteConfirm(false)
      }
    } catch (error) {
      toast.dismiss()
      toast.success('Data gagal dihapus')
      console.error('Error:', error)
    }
  }

  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleFormClear = () => {
    setForm({
      title: '',
      start_date: '',
      end_date: '',
      description: ''
    })
  }

  const handleAddTimeoff = async (e) => {
    e.preventDefault()
    toast.loading('Loading...')
    
    try {
      const token = Cookies.get('access-token')
      const { user } = isAuth()
      
      if (!user) {
        throw Error('Token Invalid!')
      }

      const employeeRes = await fetch(`/api/employees?userId=${user.id}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token,
        }
      })

      const employeeData = await employeeRes.json()
      const employee = employeeData.data[0]

      const timeoffRes = await fetch(`/api/timeoff`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token,
        },
        body: JSON.stringify({
          ...form,
          employees_id: employee.id
        })
      })

      if (timeoffRes.ok) {
        toast.dismiss()
        toast.success('Request izin telah terkirim')
        loadData()
        handleFormClear()
        setAddModal(false)
      }
    } catch (error) {
      toast.dismiss()
      toast.error('Request izin gagal terkirim')
      console.error('Error:', error)
    }
  }

  const handleDeleteSelectedRows = async (rowIds) => {
    try {
      toast.loading('Loading...')
      const token = Cookies.get('access-token')
      const timeoffRes = await fetch(`/api/timeoffs`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token,
        },
        body: JSON.stringify({
          ids: rowIds
        })
      })

      if (timeoffRes.ok) {
        toast.dismiss()
        toast.success('Data berhasil dihapus')
        loadData()
        setDeleteConfirmRows(false)
        setToggleCleared(!toggleCleared)
      }
    } catch (error) {
      toast.dismiss()
      toast.error('Data gagal dihapus')
      console.error('Error:', error)
    }
  }

  const subHeaderComponentMemo = useMemo(() => {
    return (
      <div className='w-full flex flex-wrap gap-3 justify-between mb-3'>
        <form onSubmit={handleSearch} className='w-full md:w-fit flex gap-2 items-center'>
          <div className='w-full md:w-64 relative'>
            <svg className='absolute left-2 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400' xmlns='http://www.w3.org/2000/svg' height='24px' viewBox='0 -960 960 960' width='24px' fill='currentColor'>
              <path d='M380-320q-109 0-184.5-75.5T120-580q0-109 75.5-184.5T380-840q109 0 184.5 75.5T640-580q0 44-14 83t-38 69l224 224q11 11 11 28t-11 28q-11 11-28 11t-28-11L532-372q-30 24-69 38t-83 14Zm0-80q75 0 127.5-52.5T560-580q0-75-52.5-127.5T380-760q-75 0-127.5 52.5T200-580q0 75 52.5 127.5T380-400Z'/>
            </svg>
            <input type='text' value={filterText} onChange={e => setFilterText(e.target.value)} placeholder='Cari data...' className='w-full pl-8 pr-2 py-1.5 text-sm text-black outline-none rounded-lg border border-gray-400 focus:border-primary' />
            {filterText != '' && (
              <button type='button' onClick={handleClear} className='absolute right-2 top-1/2 -translate-y-1/2'>
                <svg className='w-5 h-5 p-0.5 text-grey rounded-full hover:bg-grey-light/50' xmlns='http://www.w3.org/2000/svg' height='24px' viewBox='0 -960 960 960' width='24px' fill='currentColor'>
                  <path d='M480-424 284-228q-11 11-28 11t-28-11q-11-11-11-28t11-28l196-196-196-196q-11-11-11-28t11-28q11-11 28-11t28 11l196 196 196-196q11-11 28-11t28 11q11 11 11 28t-11 28L536-480l196 196q11 11 11 28t-11 28q-11 11-28 11t-28-11L480-424Z'/>
                </svg>
              </button>
            )}
          </div>
          <button type='submit' className='px-3 py-1 text-[12px] font-medium text-white bg-primary hover:bg-primary/80 rounded-lg'>Cari</button>
        </form>
        <button onClick={() => setAddModal(true)} className='px-3 py-2 text-white text-sm font-medium bg-primary rounded-lg hover:bg-primary/80'>Tambah Data</button>
      </div>
    )
  }, [filterText])

  const contextActions = useMemo(() => {
    const handleClick = () => {
      setDeleteConfirmRows(true)
    }
  
    return (
      <button onClick={handleClick} className='flex items-center gap-1 pl-2 pr-3 py-1.5 bg-alert text-white text-[12px] font-medium rounded-lg hover:bg-alert/90'>
        <svg className='w-5 h-5' xmlns='http://www.w3.org/2000/svg' height='24px' viewBox='0 -960 960 960' width='24px' fill='currentColor'>
          <path d='M280-120q-33 0-56.5-23.5T200-200v-520q-17 0-28.5-11.5T160-760q0-17 11.5-28.5T200-800h160q0-17 11.5-28.5T400-840h160q17 0 28.5 11.5T600-800h160q17 0 28.5 11.5T800-760q0 17-11.5 28.5T760-720v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM400-280q17 0 28.5-11.5T440-320v-280q0-17-11.5-28.5T400-640q-17 0-28.5 11.5T360-600v280q0 17 11.5 28.5T400-280Zm160 0q17 0 28.5-11.5T600-320v-280q0-17-11.5-28.5T560-640q-17 0-28.5 11.5T520-600v280q0 17 11.5 28.5T560-280ZM280-720v520-520Z'/>
        </svg>
        <span>Hapus</span>
      </button>
    )
  }, [timeoffs, selectedRows, toggleCleared])

  const progressComponent = useMemo(() => {
    return (
      <div className='p-4'>
        <Loading size={36} />
      </div>
    )
  }, [])

  return (
    <main className='h-full overflow-y-auto'>
      {(showModal && timeoff) && (
        <TimeoffDetailModal isAdmin={true} timeoff={timeoff} showModal={showModal} handleShowModal={() => setShowModal(false)} handleApprove={handleApprove} />
      )}
      {(deleteConfirm && timeoff) && (
        <ConfirmDeleteModal row={timeoff} showModal={deleteConfirm} handleShowModal={() => setDeleteConfirm(false)} handleDelete={handleDelete} />
      )}
      {(deleteConfirmRows && selectedRows) && (
        <ConfirmDeleteModal row={selectedRows.map((item) => item.id)} showModal={deleteConfirmRows} handleShowModal={() => setDeleteConfirmRows(false)} handleDelete={handleDeleteSelectedRows} />
      )}
      {(addModal) && (
        <FormTimeoffModal form={form} showModal={addModal} handleShowModal={() => {setAddModal(false); handleFormClear()}} handleFormChange={handleFormChange} handleSubmit={handleAddTimeoff} />
      )}
      <div className='flex flex-col gap-6 p-6 mx-auto'>
        <h2 className='font-semibold text-gray-700'>Permintaan Izin/Cuti</h2>
        <div className='custom-table w-full bg-white px-2 py-3 rounded-lg shadow-sm overflow-hidden'>
          <DataTable
            title={selectedRows.length ? ' ' : ''}
            data={timeoffs}
            columns={columns}
            progressPending={loading}
            progressComponent={progressComponent}
            persistTableHead
            subHeader
            subHeaderAlign={Alignment.LEFT}
            subHeaderComponent={subHeaderComponentMemo}
            pagination
            paginationServer
            paginationPerPage={limit}
            onChangePage={handleChangePage}
            paginationTotalRows={totalRows}
            onChangeRowsPerPage={handleLimit}
            paginationDefaultPage={currentPage}
            selectableRows
            contextActions={contextActions}
            clearSelectedRows={toggleCleared}
            onSelectedRowsChange={handleRowSelected}
          />
        </div>
      </div>
    </main>
  )
}

export default Timeoff
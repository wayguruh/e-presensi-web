import React, { useState, useEffect, useMemo, useCallback } from 'react'
import DataTable, { Alignment } from 'react-data-table-component'
import Loading from '../../components/Loading'
import FormEmployeeModal from '../../components/modals/FormEmployeeModal'
import ConfirmDeleteModal from '../../components/modals/ConfirmDeleteModal'
import Cookies from 'js-cookie'
import toast from 'react-hot-toast'

const Employee = () => {
  const [employees, setEmployees] = useState([])
  const [filterText, setFilterText] = useState('')
  const [loading, setLoading] = useState(true)

  const [limit, setLimit] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalRows, setTotalRows] = useState(1)

  const [selectedRows, setSelectedRows] = useState([])
  const [toggleCleared, setToggleCleared] = useState(false)

  const [deleteConfirm, setDeleteConfirm] = useState(false)
  const [deleteConfirmRows, setDeleteConfirmRows] = useState(false)
  const [employee, setEmployee] = useState()

  const [addModal, setAddModal] = useState(false)
  const [editModal, setEditModal] = useState(false)

  const [formError, setFormError] = useState('')
  const [form, setForm] = useState({
    fullname: '',
    gender: '',
    phone: '',
    username: '',
    password: '',
    role: '',
    status: ''
  })

  const loadData = async (search=filterText) => {
    setLoading(true)
    
    try {
      const token = Cookies.get('access-token')
      let url = `/api/employees?withUser=true&limit=${limit}&page=${currentPage}`

      if (filterText != '') url += `&search=${search}`

      const employeeRes = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token,
        },
      })

      const employeeData = await employeeRes.json()
      setEmployees(employeeData.data ? employeeData.data : [])
      setTotalRows(employeeData.total)
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
      name: 'Nama Lengkap',
      selector: row => row.fullname,
      sortable: true,
    },
    {
      name: 'Username',
      selector: row => row.User.username,
      sortable: true,
    },
    {
      name: 'No HP',
      selector: row => row.phone,
      sortable: true,
    },
    {
      name: 'Role',
      selector: row => row.User.role == 'Admin' ? 'Admin' : 'Karyawan',
      sortable: true,
    },
    {
      name: 'Status',
      selector: row => (
        <span className={`${row.User.status == 'Active' ? 'bg-success/30 text-success' : 'bg-black/30 text-black'} px-2 py-0.5 text-[12px] rounded-full`}>{row.User.status}</span>
      ),
      sortable: true,
    },
    {
      name: 'Aksi',
      selector: row => {
        return (
          <div className='flex gap-1'>
            <button onClick={() => handleEdit(row)}>
              <svg className='bg-secondary/20 text-secondary p-1 rounded-full hover:bg-secondary/15 hover:text-secondary/80' xmlns='http://www.w3.org/2000/svg' height='24px' viewBox='0 -960 960 960' width='24px' fill='currentColor'>
                <path d='M200-200h57l391-391-57-57-391 391v57Zm-40 80q-17 0-28.5-11.5T120-160v-97q0-16 6-30.5t17-25.5l505-504q12-11 26.5-17t30.5-6q16 0 31 6t26 18l55 56q12 11 17.5 26t5.5 30q0 16-5.5 30.5T817-647L313-143q-11 11-25.5 17t-30.5 6h-97Zm600-584-56-56 56 56Zm-141 85-28-29 57 57-29-28Z'/>
              </svg>
            </button>
            <button onClick={() => {setDeleteConfirm(true); setEmployee(row)}}>
              <svg className='bg-alert/20 text-alert p-1 rounded-full hover:bg-alert/15 hover:text-alert/80' xmlns='http://www.w3.org/2000/svg' height='24px' viewBox='0 -960 960 960' width='24px' fill='currentColor'>
                <path d='M280-120q-33 0-56.5-23.5T200-200v-520q-17 0-28.5-11.5T160-760q0-17 11.5-28.5T200-800h160q0-17 11.5-28.5T400-840h160q17 0 28.5 11.5T600-800h160q17 0 28.5 11.5T800-760q0 17-11.5 28.5T760-720v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM400-280q17 0 28.5-11.5T440-320v-280q0-17-11.5-28.5T400-640q-17 0-28.5 11.5T360-600v280q0 17 11.5 28.5T400-280Zm160 0q17 0 28.5-11.5T600-320v-280q0-17-11.5-28.5T560-640q-17 0-28.5 11.5T520-600v280q0 17 11.5 28.5T560-280ZM280-720v520-520Z'/>
              </svg>
            </button>
          </div>
        )
      },
      sortable: true,
    },
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

  const handleDelete = async (row) => {
    try {
      toast.loading('Loading...')
      const token = Cookies.get('access-token')
      const employeeRes = await fetch(`/api/employee/${row.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token,
        }
      })

      const userRes = await fetch(`/api/user/${row.User.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token,
        }
      })

      if (employeeRes.ok && userRes.ok) {
        toast.dismiss()
        toast.success('Data karyawan berhasil dihapus')
        loadData()
        setDeleteConfirm(false)
      }
    } catch (error) {
      toast.dismiss()
      toast.error('Data karyawan gagal dihapus')
      console.error('Error:', error)
    }
  }

  const handleFormChange = (e) => {
    if (e.target.name == 'username') {
      const invalidChars = /[^a-zA-Z0-9._]/g
      if (invalidChars.test(e.target.value)) {
        setFormError('Hanya huruf, angka, . dan _ yang diperbolehkan.')
      } else {
        setFormError('')
      }
    }
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleFormClear = () => {
    setForm({
      fullname: '',
      gender: '',
      phone: '',
      username: '',
      password: '',
      role: '',
      status: ''
    })
  }

  const handleAddEmployee = async (e) => {
    e.preventDefault()
    toast.loading('Loading...')
    
    try {
      const token = Cookies.get('access-token')
      const userRes = await fetch(`/api/user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token,
        },
        body: JSON.stringify({
          username: form.username,
          password: form.password,
          role: form.role
        })
      })

      if (!userRes.ok) {
        throw Error('Gagal Menambahkan User')
      }

      const userData = await userRes.json()
      const user = userData.data

      const employeeRes = await fetch(`/api/employee`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token,
        },
        body: JSON.stringify({
          ...form,
          users_id: user.id
        })
      })

      if (employeeRes.ok) {
        toast.dismiss()
        toast.success('Data karyawan berhasil ditambahkan')
        loadData()
        handleFormClear()
        setAddModal(false)
      }
    } catch (error) {
      toast.dismiss()
      toast.error('Data karyawan gagal ditambahkan')
      console.error('Error:', error)
    }
  }

  const handleEdit = (row) => {
    setEditModal(true)
    setEmployee(row)
    setForm({
      fullname: row.fullname,
      gender: row.gender,
      phone: row.phone,
      username: row.User.username,
      password: row.User.password,
      role: row.User.role,
      status: row.User.status
    })
  }

  const handleUpdateEmployee = async (e) => {
    e.preventDefault()
    toast.loading('Loading...')
    
    try {
      const token = Cookies.get('access-token')
      const userRes = await fetch(`/api/user/${employee.users_id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token,
        },
        body: JSON.stringify(form)
      })

      if (!userRes.ok) {
        throw Error('Data user gagal diubah')
      }

      const userData = await userRes.json()
      const user = userData.data

      const employeeRes = await fetch(`/api/employee/${employee.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token,
        },
        body: JSON.stringify({
          ...form,
          users_id: user.id
        })
      })

      if (employeeRes.ok) {
        toast.dismiss()
        toast.success('Data karyawan berhasil diperbarui')
        loadData()
        handleFormClear()
        setEditModal(false)
      }
    } catch (error) {
      toast.dismiss()
      toast.error('Data karyawan gagal diperbarui')
      console.error('Error:', error)
    }
  }

  const handleDeleteSelectedRows = async (rowIds) => {
    try {
      toast.loading('Loading...')
      const token = Cookies.get('access-token')
      const timeoffRes = await fetch(`/api/employees`, {
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
        toast.success('Data karyawan berhasil dihapus')
        loadData()
        setDeleteConfirmRows(false)
        setToggleCleared(!toggleCleared)
      }
    } catch (error) {
      toast.dismiss()
      toast.error('Data karyawan gagal dihapus')
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
  }, [employees, selectedRows, toggleCleared])

  const progressComponent = useMemo(() => {
    return (
      <div className='p-4'>
        <Loading size={36} />
      </div>
    )
  }, [])

  return (
    <main className='h-full overflow-y-auto'>
      {(deleteConfirm && employee) && (
        <ConfirmDeleteModal row={employee} showModal={deleteConfirm} handleShowModal={() => setDeleteConfirm(false)} handleDelete={handleDelete} />
      )}
      {(deleteConfirmRows && selectedRows) && (
        <ConfirmDeleteModal row={selectedRows.map((item) => item.id)} showModal={deleteConfirmRows} handleShowModal={() => setDeleteConfirmRows(false)} handleDelete={handleDeleteSelectedRows} />
      )}
      {(addModal) && (
        <FormEmployeeModal form={form} formError={formError} showModal={addModal} handleShowModal={() => setAddModal(false)} handleFormChange={handleFormChange} handleSubmit={handleAddEmployee} />
      )}
      {(editModal) && (
        <FormEmployeeModal isEdit={true} form={form} formError={formError} showModal={editModal} handleShowModal={() => {setEditModal(false); handleFormClear()}} handleFormChange={handleFormChange} handleSubmit={handleUpdateEmployee} />
      )}
      <div className='flex flex-col gap-6 p-6 mx-auto'>
        <h2 className='font-semibold text-gray-700'>Data Karyawan</h2>
        <div className='custom-table w-full bg-white px-2 py-3 rounded-lg shadow-sm overflow-hidden'>
          <DataTable
            title={selectedRows.length ? ' ' : ''}
            data={employees}
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

export default Employee
import { BrowserRouter as Router, Routes, Route } from 'react-router'
import ProtectedRoute from './middlewares/ProtectedRoute'
import Login from './pages/Login'
import AdminLayout from './layouts/AdminLayout'
import EmployeeLayout from './layouts/EmployeeLayout'
import Dashboard from './pages/admin/Dashboard'
import Employee from './pages/admin/Employee'
import Presence from './pages/admin/Presence'
import Timeoff from './pages/admin/Timeoff'
import Home from './pages/Home'
import EmpPresence from './pages/Presence'
import EmpTimeoff from './pages/Timeoff'
import Profile from './pages/Profile'

import { isAuth } from './utils/auth'

export default function App() {
  const { isAuthenticated, user } = isAuth()

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
  
        <Route element={<ProtectedRoute isAuthenticated={isAuthenticated} role={user?.role} allowRoles={['Admin']} />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<Dashboard />} />
            <Route path="/admin/employee" element={<Employee />} />
            <Route path="/admin/presence" element={<Presence />} />
            <Route path="/admin/timeoff" element={<Timeoff />} />
            <Route path="/admin/profile" element={<Profile />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute isAuthenticated={isAuthenticated} role={user?.role} allowRoles={['Karyawan']} />}>
          <Route element={<EmployeeLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/presence" element={<EmpPresence />} />
            <Route path="/timeoff" element={<EmpTimeoff />} />
            <Route path="/profile" element={<Profile />} />
          </Route>
        </Route>
      </Routes>
    </Router>
  )
}
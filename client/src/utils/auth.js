import Cookies from 'js-cookie'
import { jwtDecode } from 'jwt-decode'

export function isAuth() {
  const token = Cookies.get('access-token')

  if (!token) {
    return {
      isAuthenticated: false,
      user: {},
    }
  }

  try {
    const user = jwtDecode(token)
    return {
      isAuthenticated: true,
      user,
    }
  } catch (err) {
    console.error('Invalid token', err)
    return {
      isAuthenticated: false,
      user: {},
    }
  }
}
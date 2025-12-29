import React from 'react'
import { Navigate } from 'react-router-dom'

export default function ProtectedRoute({ children }) {
    // Check if user is authenticated
    const isAuthenticated = localStorage.getItem('userType')

    if (!isAuthenticated) {
        // Redirect to login if not authenticated
        return <Navigate to="/login-user" replace />
    }

    return children
}

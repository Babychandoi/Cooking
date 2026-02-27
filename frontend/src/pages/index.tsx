import React from 'react'
import { Outlet } from 'react-router-dom'
import Header from '../component/Header'
import Sidebar from '../component/Sidebar'

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="ml-64">
        <Header />
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
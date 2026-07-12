import { useState } from 'react'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

function App() {
  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 flex flex-col justify-center items-center p-6">
      <div className="max-w-md w-full bg-white border border-neutral-200 rounded-lg shadow-sm p-8 text-center">
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 mb-2">AssetFlow</h1>
        <p className="text-sm text-neutral-500 mb-6">
          Enterprise Asset & Resource Management System. Ready for development.
        </p>
        <div className="flex justify-center space-x-2">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-neutral-100 text-neutral-800 border border-neutral-200">
            React + Vite
          </span>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-neutral-100 text-neutral-800 border border-neutral-200">
            Tailwind CSS
          </span>
        </div>
      </div>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
    </div>
  )
}

export default App

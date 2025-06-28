import React, { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [count, setCount] = useState(0)
  const [apiStatus, setApiStatus] = useState<string>('Checking...')

  // Test API connection
  const testAPI = async () => {
    try {
      const response = await fetch('http://localhost:8000/v1/health')
      const data = await response.json()
      setApiStatus(`API Status: ${data.status} (${data.version})`)
    } catch (error) {
      setApiStatus('API Status: Connection failed')
    }
  }

  // Test API on component mount
  useEffect(() => {
    testAPI()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            ContextVault
          </h1>
          <p className="text-gray-600 mb-6">
            Intelligent Conversational Data Management
          </p>
          
          <div className="mb-6 p-4 bg-gray-100 rounded-lg">
            <p className="text-sm font-medium text-gray-700">
              {apiStatus}
            </p>
            <button 
              onClick={testAPI}
              className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              Test API Connection
            </button>
          </div>

          <div className="space-y-4">
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-2">Counter Test</h3>
              <p className="text-gray-600 mb-3">Count: {count}</p>
              <button
                onClick={() => setCount((count) => count + 1)}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
              >
                Increment
              </button>
            </div>

            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-2">Available Features</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Vector-based semantic search</li>
                <li>• Conversational data storage</li>
                <li>• Privacy-compliant data management</li>
                <li>• RESTful API with authentication</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App 
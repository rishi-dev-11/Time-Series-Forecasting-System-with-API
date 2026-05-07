import React from 'react'

interface ErrorDisplayProps {
  errors: Record<string, string>
  title?: string
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  errors,
  title = 'Model Training Failures'
}) => {
  if (!errors || Object.keys(errors).length === 0) {
    return null
  }

  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
      <h3 className="font-semibold text-red-900 mb-3">{title}</h3>
      <div className="space-y-2">
        {Object.entries(errors).map(([modelName, error]) => (
          <div key={modelName} className="text-sm">
            <span className="font-medium text-red-800 capitalize">{modelName}:</span>
            <span className="text-red-700 ml-2">{error}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

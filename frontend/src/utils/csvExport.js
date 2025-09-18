// CSV Export Utility Functions

export const downloadCSVFromData = (data, filename) => {
  try {
    if (!data || data.length === 0) {
      throw new Error('No data to export')
    }

    const headers = new Set()
    data.forEach(item => {
      Object.keys(item).forEach(key => headers.add(key))
    })
    
    const headerArray = Array.from(headers)
    const csvRows = []
    
    csvRows.push(headerArray.join(','))
    
    data.forEach(item => {
      const row = headerArray.map(header => {
        const value = item[header] || ''
        if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
          return `"${value.replace(/"/g, '""')}"`
        }
        return value
      })
      csvRows.push(row.join(','))
    })
    
    const csvContent = csvRows.join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', filename)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    }
  } catch (error) {
    console.error('CSV export error:', error)
    throw error
  }
}

export const downloadCSVFromAPI = async (url, filename) => {
  try {
    const token = localStorage.getItem('access_token')
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || `HTTP ${response.status}`)
    }
    
    const csvContent = await response.text()
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', filename)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    }
  } catch (error) {
    console.error('CSV API export error:', error)
    throw error
  }
}

export const transformRecordsForCSV = (records) => {
  return records.map(record => {
    const extracted = record.extracted_fields || {}
    
    return {
      'Record ID': record.id,
      'Document Type': (record.document_type || '').toUpperCase(),
      'Filename': record.filename || '',
      'Processing Date': new Date(record.created_at).toLocaleString(),
      'Confidence Score': `${record.confidence_score}%`,
      'Status': (record.status || '').toUpperCase(),
      'Name': extracted.name || '',
      'Aadhaar Number': extracted.aadhaar_number || '',
      'PAN Number': extracted.pan_number || '',
      'Date of Birth': extracted.date_of_birth || '',
      'Gender': extracted.gender || '',
      'Address': extracted.address || '',
      'Father Name': extracted.father_name || ''
    }
  })
}

export const transformExtractionForCSV = (extractionResult) => {
  const extracted = extractionResult.extraction_result?.extracted_fields || {}
  
  return [{
    'Document Type': (extracted.document_type || '').toUpperCase(),
    'Filename': extractionResult.extraction_result?.filename || '',
    'Processing Date': new Date().toLocaleString(),
    'Confidence Score': `${extractionResult.extraction_result?.confidence_score || 0}%`,
    'Name': extracted.name || '',
    'Aadhaar Number': extracted.aadhaar_number || '',
    'PAN Number': extracted.pan_number || '',
    'Date of Birth': extracted.date_of_birth || '',
    'Gender': extracted.gender || '',
    'Address': extracted.address || '',
    'Father Name': extracted.father_name || ''
  }]
}

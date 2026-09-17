const productionApiUrl = 'https://ngo-backend-roq2.onrender.com'
const localApiUrl = 'http://127.0.0.1:5001'

export const API_BASE_URL = process.env.REACT_APP_API_BASE_URL
  || (process.env.NODE_ENV === 'development' ? localApiUrl : productionApiUrl)
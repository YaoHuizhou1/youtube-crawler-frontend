import axios, { AxiosInstance, AxiosResponse } from 'axios'

export interface ApiResponse<T> {
  code: number
  message: string
  data?: T
}

export interface PagedResponse<T> extends ApiResponse<T> {
  meta: {
    page: number
    page_size: number
    total: number
    total_pages: number
  }
}

const client: AxiosInstance = axios.create({
  baseURL: '/api/v1',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Response interceptor
client.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => {
    const message = error.response?.data?.message || error.message || 'Unknown error'
    console.error('API Error:', message)
    return Promise.reject(error)
  }
)

export default client

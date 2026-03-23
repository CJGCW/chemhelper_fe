import axios from 'axios'

const client = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15_000,
})

client.interceptors.response.use(
  (res) => res,
  (err) => {
    const message =
      err.response?.data?.error ?? err.message ?? 'An unexpected error occurred'
    return Promise.reject(new Error(message))
  },
)

export default client

import axios from 'axios'

export const api = axios.create({
  baseURL: import.meta.env.DEV ? '/pokeos/api' : 'https://api.pokeos.com/api',
  timeout: 10000,
  headers: {
    Accept: 'application/json'
  }
})

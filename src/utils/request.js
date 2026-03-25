import axios from 'axios'

const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE,
})

export function getList(table) {
  return request.get(`/${table}`).then(r => r.data)
}

export function addDoc(table, data) {
  return request.post(`/${table}`, data).then(r => r.data)
}

export function updateDoc(table, id, data) {
  return request.put(`/${table}/${id}`, data).then(r => r.data)
}

export function removeDoc(table, id) {
  return request.delete(`/${table}/${id}`).then(r => r.data)
}

export function getOne(table, id) {
  return request.get(`/${table}/${id}`).then(r => r.data)
}

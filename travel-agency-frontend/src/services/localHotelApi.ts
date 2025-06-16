import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:3000/api';

export const fetchLocalHotels = () => axios.get(`${API_BASE}/localHotels`);
export const fetchLocalHotelById = (id: string) => axios.get(`${API_BASE}/localHotels/${id}`);
export const createLocalHotel = (formData: FormData) =>
  axios.post(`${API_BASE}/localHotels`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const updateLocalHotel = (id: string, formData: FormData) =>
  axios.put(`${API_BASE}/localHotels/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const deleteLocalHotel = (id: string) => axios.delete(`${API_BASE}/localHotels/${id}`);

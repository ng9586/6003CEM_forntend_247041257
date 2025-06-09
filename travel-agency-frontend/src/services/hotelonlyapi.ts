// services/hotelonlyapi.ts
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://127.0.0.1:3000/api/hotels', // 你後端路由
});

export default api;

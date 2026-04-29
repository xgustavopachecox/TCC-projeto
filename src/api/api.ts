import axios from 'axios';

// troque pelo IP local do seu computador na rede
const API_URL = 'http://192.168.1.101/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;

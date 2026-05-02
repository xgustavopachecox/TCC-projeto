import axios from 'axios';
import Constants from 'expo-constants';

// Expo extrai o ip do computador e manda para o dispositivo móvel se conectar automaticamente
const debuggerHost = Constants.expoConfig?.hostUri;
const ipLocal = debuggerHost ? debuggerHost.split(':')[0] : 'localhost';

const API_URL = `http://${ipLocal}:8080/api`;

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;

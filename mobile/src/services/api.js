import axios from 'axios';
import { API_BASEURL } from 'react-native-dotenv';

const api = axios.create({
    baseURL: API_BASEURL,
});

export default api;
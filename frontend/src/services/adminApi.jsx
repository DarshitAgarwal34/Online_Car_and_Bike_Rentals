/* -----------------
File: src/services/adminApi.js
----------------- */
import axios from 'axios';


const API_BASE = 'http://localhost:5000/api';


export async function adminLogin(email, password) {
const res = await axios.post(`${API_BASE}/admins/login`, { email, password });
return res.data; // { token, user }
}


export async function fetchAdmins(page = 1, pageSize = 20) {
const res = await axios.get(`${API_BASE}/admins?page=${page}&pageSize=${pageSize}`);
return res.data;
}
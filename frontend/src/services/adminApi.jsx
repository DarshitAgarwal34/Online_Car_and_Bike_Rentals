/* -----------------
File: src/services/adminApi.js
----------------- */
import axios from 'axios';
import { apiUrl } from "./apiBase";


export async function adminLogin(email, password) {
const res = await axios.post(apiUrl("/api/admins/login"), { email, password });
return res.data; // { token, user }
}


export async function fetchAdmins(page = 1, pageSize = 20) {
const res = await axios.get(apiUrl(`/api/admins?page=${page}&pageSize=${pageSize}`));
return res.data;
}

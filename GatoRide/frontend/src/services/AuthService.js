import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

export const signup = async (userData) => {
  return axios.post(`${API_BASE_URL}${process.env.REACT_APP_SIGNUP_ENDPOINT}`, userData);
};

export const login = async (userData) => {
  return axios.post(`${API_BASE_URL}${process.env.REACT_APP_LOGIN_ENDPOINT}`, userData);
};

export const verifyEmail = async (token) => {
  return axios.get(`${API_BASE_URL}${process.env.REACT_APP_VERIFY_EMAIL_ENDPOINT}?token=${token}`);
};
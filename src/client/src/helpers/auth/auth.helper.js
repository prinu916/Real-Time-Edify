import { API } from "../config.js";

export const setLocalStorageWithExpiry = (key, data, expirationMinutes) => {
  const now = new Date();

  const item = {
    data,
    expiry: now.getTime() + expirationMinutes * 60 * 1000,
  };

  localStorage.setItem(key, JSON.stringify(item));
};

export const getLocalStorageWithExpiry = (key) => {
  const itemStr = localStorage.getItem(key);

  if (!itemStr) return null;

  const item = JSON.parse(itemStr);

  if (Date.now() > item.expiry) {
    localStorage.removeItem(key);
    return null;
  }

  return item.data;
};

export const login = async (user) => {
  try {
    const res = await fetch(`${API}/users/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(user),
    });

    const data = await res.json();

    if (res.ok) {
      setLocalStorageWithExpiry("auth", data, 60);

      return {
        status: 200,
        user: data.user,
        token: data.token,
        message: data.message,
      };
    }

    return {
      status: res.status,
      message: data.message,
    };
  } catch (err) {
    return {
      status: 500,
      message: err.message,
    };
  }
};

export const register = async (user) => {
  try {
    const res = await fetch(`${API}/users/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(user),
    });

    const data = await res.json();

    return {
      status: res.status,
      message: data.message,
    };
  } catch (err) {
    return {
      status: 500,
      message: err.message,
    };
  }
};
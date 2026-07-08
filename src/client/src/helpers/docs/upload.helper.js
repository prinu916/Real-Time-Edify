import { API } from "../../helpers/config";

export const uploadDoc = async (formData, token) => {
  try {
    const res = await fetch(`${API}/documents/upload`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
      body: formData,
    });

    const data = await res.json();
    return { status: res.status, data, message: data?.message };
  } catch (error) {
    return { status: 500, message: error.message };
  }
};


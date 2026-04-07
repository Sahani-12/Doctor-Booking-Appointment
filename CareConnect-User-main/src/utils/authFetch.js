import BASE_URL from "@/constants/api";

export const authFetch = async (url, options = {}) => {
  const token = sessionStorage.getItem("token");

  const config = {
    ...options,
    headers: {
      ...(options.headers || {}),
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    credentials: "include",
  };

  const response = await fetch(BASE_URL + url, config);

  if (response.status !== 401) return response;

  // Backend in this project issues a JWT access token only.
  // If it expires (401), send user back to login.
  sessionStorage.removeItem("token");
  sessionStorage.removeItem("user");
  window.location.href = "#/login";
  throw new Error("Unauthorized");
};

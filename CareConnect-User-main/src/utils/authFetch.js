import BASE_URL from "@/constants/api";

export const authFetch = async (url, options = {}) => {
  const token =
    sessionStorage.getItem("token") || localStorage.getItem("token");

  const config = {
    ...options,
    headers: {
      ...(options.headers || {}),
      Authorization: token ? `Bearer ${token}` : "",
      "Content-Type": "application/json",
    },
    credentials: "include",
  };

  const cleanUrl = url.startsWith("/api") ? url.replace(/^\/api/, "") : url;
  const targetUrl = cleanUrl.startsWith("/") ? cleanUrl : `/${cleanUrl}`;

  const response = await fetch(BASE_URL + targetUrl, config);

  if (response.status !== 401) return response;

  // Only redirect if an existing token was invalid/expired, without hard crashing unauthenticated browsing
  if (token && !options.skipAuthRedirect) {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("userProfile");
    window.location.href = "/login";
  }

  return response;
};

export const getToken = () =>
  localStorage.getItem("mmw-auth-token") ||
  sessionStorage.getItem("mmw-auth-token") ||
  "";

export async function api(path, options = {}) {
  const headers = new Headers(options.headers || {});
  const token = getToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);
  if (options.body && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  const response = await fetch(path, { ...options, headers });
  const text = await response.text();
  let result = {};
  try { result = text ? JSON.parse(text) : {}; }
  catch { throw new Error(`Server returned an invalid response (${response.status})`); }
  if (!response.ok || result.success === false)
    throw new Error(result.message || `Request failed (${response.status})`);
  return result;
}

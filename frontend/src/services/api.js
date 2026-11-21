
const BASE = "/api";

async function request(path, options = {}) {
  const response = await fetch(`${BASE}${path}`, {
    headers: {
      "Content-Type": "application/json"
    },
    ...options
  });

  const data = await response.json().catch(() => ({
    message: "Invalid server response"
  }));

  if (!response.ok) {
    throw new Error(data.message || "Request failed");
  }

  return data;
}

export const api = {
  get: (p) => request(p),

  post: (p, b) => request(p, {
    method: "POST",
    body: JSON.stringify(b)
  }),

  put: (p, b) => request(p, {
    method: "PUT",
    body: JSON.stringify(b)
  }),

  del: (p) => request(p, {
    method: "DELETE"
  })
};

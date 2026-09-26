// const API_BASE_URL = "https://jwellery-backend.vercel.app/api";
const API_BASE_URL = "http://localhost:4000/api";

interface RequestOptions extends RequestInit {
  params?: Record<string, any>;
}

const buildUrl = (url: string, params?: Record<string, any>): string => {
  const fullUrl = url.startsWith("http") ? url : `${API_BASE_URL}${url}`;
  if (!params) return fullUrl;

  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      if (Array.isArray(value)) {
        value.forEach((val) => searchParams.append(key, val));
      } else {
        searchParams.append(key, String(value));
      }
    }
  });

  const queryString = searchParams.toString();
  return queryString ? `${fullUrl}?${queryString}` : fullUrl;
};

const getAuthHeaders = (): Record<string, string> => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (typeof window !== "undefined") {
    const token =
      localStorage.getItem("user_token") ||
      document.cookie.match(/user_token=([^;]+)/)?.[1];
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }
  return headers;
};

const request = async <T>(
  url: string,
  options: RequestOptions = {},
): Promise<{ data: T; status: number; ok: boolean }> => {
  const { params, headers, ...restOptions } = options;
  const fullUrl = buildUrl(url, params);

  const authHeaders = getAuthHeaders();
  if (restOptions.body instanceof FormData) {
    delete authHeaders["Content-Type"];
  }

  const response = await fetch(fullUrl, {
    credentials: "include",
    headers: {
      ...authHeaders,
      ...headers,
    },
    ...restOptions,
  });

  let data: any = null;
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    throw new Error(
      data?.message || `Request failed with status ${response.status}`,
    );
  }

  return {
    data: data as T,
    status: response.status,
    ok: response.ok,
  };
};

export const apiClient = {
  get: <T>(url: string, options?: RequestOptions) =>
    request<T>(url, { method: "GET", ...options }),

  post: <T>(url: string, data?: any, options?: RequestOptions) =>
    request<T>(url, {
      method: "POST",
      body:
        data instanceof FormData
          ? data
          : data
            ? JSON.stringify(data)
            : undefined,
      ...options,
    }),

  put: <T>(url: string, data?: any, options?: RequestOptions) =>
    request<T>(url, {
      method: "PUT",
      body:
        data instanceof FormData
          ? data
          : data
            ? JSON.stringify(data)
            : undefined,
      ...options,
    }),

  patch: <T>(url: string, data?: any, options?: RequestOptions) =>
    request<T>(url, {
      method: "PATCH",
      body:
        data instanceof FormData
          ? data
          : data
            ? JSON.stringify(data)
            : undefined,
      ...options,
    }),

  delete: <T>(url: string, options?: RequestOptions) =>
    request<T>(url, { method: "DELETE", ...options }),
};

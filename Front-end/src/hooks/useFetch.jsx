import { useState, useCallback } from "react";

const useFetch = (defaultUrl) => {
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const request = useCallback(
    async (url = defaultUrl, method = "GET", body = null, headers = {}) => {
      if (!url) return [];
      setLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem("token");
        const options = {
          method,
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : undefined,
            ...headers,
          },
        };

        if (body) {
          options.body = JSON.stringify(body);
        }

        const response = await fetch(url, options);

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Error: ${response.status} - ${errorText}`);
        }

        const responseData = await response.json();
        // setData(responseData.data);
        // return responseData.data;

        const result =
          responseData.data !== undefined ? responseData.data : responseData;
        setData(result);
        return result;
      } catch (err) {
        console.error("Fetch error:", err);
        setError(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [defaultUrl]
  );

  const get = useCallback(
    (url = defaultUrl) => request(url, "GET"),
    [request, defaultUrl]
  );
  const post = useCallback(
    (body, headers, url = defaultUrl) => request(url, "POST", body, headers),
    [request, defaultUrl]
  );
  const put = useCallback(
    (body, headers, url = defaultUrl) => request(url, "PUT", body, headers),
    [request, defaultUrl]
  );
  const del = useCallback(
    (headers, url = defaultUrl) => request(url, "DELETE", null, headers),
    [request, defaultUrl]
  );

  return { data, error, loading, get, post, put, del };
};

export default useFetch;

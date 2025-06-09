import { useState, useCallback } from 'react';

const useFetch = (url) => {
    const [data, setData] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const request = useCallback(async (method = 'GET', body = null, headers = {}) => {
        setLoading(true);
        setError(null);

        try {
            const token = localStorage.getItem("token");
            const options = {
                method,
                headers: {
                    'Content-Type': 'application/json',
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
            setData(responseData.data);
            return responseData.data;
        } catch (err) {
            console.error('Fetch error:', err);
            setError(err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [url]);

    const get = useCallback(() => request('GET'), [request]);
    const post = useCallback((body, headers) => request('POST', body, headers), [request]);
    const put = useCallback((body, headers) => request('PUT', body, headers), [request]);
    const del = useCallback((headers) => request('DELETE', null, headers), [request]);

    return { data, error, loading, get, post, put, del };
};

export default useFetch;

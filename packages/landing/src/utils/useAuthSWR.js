import useSWR from 'swr';
import { useNavigate } from 'react-router-dom';

export const fetcher = async (url) => {
  const res = await fetch(url, { credentials: 'include' });

  if (res.status === 401) {
    const error = new Error('Unauthorized');
    error.status = 401;
    throw error;
  }

  if (!res.ok) {
    const error = new Error('An error occurred while fetching the data.');
    error.status = res.status;
    throw error;
  }

  return res.json();
};

export function useAuthSWR(key, options) {
  const navigate = useNavigate();

  const { data, error, isLoading, mutate } = useSWR(key, fetcher, {
    ...options,
    onError: (err) => {
      if (err.status === 401) {
        navigate('/login');
      }
      if (options && options.onError) {
        options.onError(err);
      }
    },
  });

  return { data, error, isLoading, mutate };
}

import { useEffect, useRef } from "react";

/**
 * Custom hook for real-time data polling
 * @param {Function} fetchFunction - Async function that fetches data
 * @param {Function} onSuccess - Callback when data is fetched successfully
 * @param {Function} onError - Callback when fetch fails
 * @param {number} interval - Polling interval in milliseconds (default: 5000ms)
 * @param {boolean} enabled - Whether polling is enabled (default: true)
 * @returns {Function} Cleanup function
 */
export function useRealTimePolling(
  fetchFunction,
  onSuccess,
  onError,
  interval = 5000,
  enabled = true,
) {
  const pollIntervalRef = useRef(null);
  const isPollingRef = useRef(false);
  const savedCallbacks = useRef({ fetchFunction, onSuccess, onError });

  // Always keep the latest callbacks in a ref to avoid re-triggering the effect
  // and causing infinite loops when inline functions are passed.
  useEffect(() => {
    savedCallbacks.current = { fetchFunction, onSuccess, onError };
  });

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const poll = async () => {
      if (isPollingRef.current) return; // Prevent overlapping requests
      const {
        fetchFunction: fetchFn,
        onSuccess: successCb,
        onError: errorCb,
      } = savedCallbacks.current;
      if (!fetchFn) return;

      try {
        isPollingRef.current = true;
        const data = await fetchFn();
        if (successCb) successCb(data);
      } catch (error) {
        console.error("Polling error:", error);
        if (errorCb) errorCb(error);
      } finally {
        isPollingRef.current = false;
      }
    };

    // Initial fetch
    poll();

    // Set up polling interval
    pollIntervalRef.current = setInterval(poll, interval);

    // Cleanup
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [enabled, interval]); // Removed function dependencies to fix infinite loops!

  return () => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
    }
  };
}

/**
 * Custom hook for WebSocket real-time updates
 * @param {string} url - WebSocket URL
 * @param {Function} onMessage - Callback when message received
 * @param {Function} onError - Callback when error occurs
 * @param {boolean} enabled - Whether connection is enabled (default: true)
 * @returns {Object} WebSocket connection object
 */
export function useWebSocketConnection(
  url,
  onMessage,
  onError,
  enabled = true,
) {
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttemptsRef = useRef(5);

  useEffect(() => {
    if (!enabled || !url) {
      return;
    }

    const connect = () => {
      try {
        wsRef.current = new WebSocket(url);

        wsRef.current.onopen = () => {
          console.log("WebSocket connected");
          reconnectAttemptsRef.current = 0;
        };

        wsRef.current.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (onMessage) onMessage(data);
          } catch (error) {
            console.error("Failed to parse WebSocket message:", error);
          }
        };

        wsRef.current.onerror = (error) => {
          console.error("WebSocket error:", error);
          if (onError) onError(error);
        };

        wsRef.current.onclose = () => {
          console.log("WebSocket disconnected");
          // Attempt to reconnect
          if (reconnectAttemptsRef.current < maxReconnectAttemptsRef.current) {
            reconnectAttemptsRef.current += 1;
            const delay = Math.min(
              1000 * Math.pow(2, reconnectAttemptsRef.current - 1),
              30000,
            );
            reconnectTimeoutRef.current = setTimeout(connect, delay);
          }
        };
      } catch (error) {
        console.error("Failed to create WebSocket:", error);
        if (onError) onError(error);
      }
    };

    connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.close();
      }
    };
  }, [enabled, url, onMessage, onError]);

  return {
    send: (data) => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify(data));
      }
    },
    close: () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    },
    isConnected: wsRef.current?.readyState === WebSocket.OPEN,
  };
}

/**
 * Custom hook for request debouncing
 * @param {Function} callback - Function to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} Debounced function
 */
export function useDebounce(callback, delay = 300) {
  const timeoutRef = useRef(null);

  const debounced = (...args) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      callback(...args);
    }, delay);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return debounced;
}

/**
 * Custom hook for interval-based operations with automatic cleanup
 * @param {Function} callback - Function to execute
 * @param {number} interval - Interval in milliseconds
 * @param {boolean} enabled - Whether interval is enabled (default: true)
 */
export function useInterval(callback, interval = 1000, enabled = true) {
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!enabled) return;

    intervalRef.current = setInterval(callback, interval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [enabled, interval, callback]);

  return () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };
}

/**
 * Custom hook for request retry logic
 * @param {Function} fetchFunction - Async function that fetches data
 * @param {number} maxRetries - Maximum retry attempts (default: 3)
 * @param {number} retryDelay - Delay between retries in milliseconds (default: 1000)
 * @returns {Promise} Result of the fetch
 */
export async function retryFetch(
  fetchFunction,
  maxRetries = 3,
  retryDelay = 1000,
) {
  let lastError;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fetchFunction();
    } catch (error) {
      lastError = error;
      if (attempt < maxRetries) {
        await new Promise((resolve) =>
          setTimeout(resolve, retryDelay * Math.pow(2, attempt)),
        );
      }
    }
  }

  throw lastError;
}

export default useRealTimePolling;

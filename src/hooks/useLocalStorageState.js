import { useEffect, useState } from "react";

export function useLocalStorageState(key) {
  const [value, setValue] = useState(() => {
    const data = JSON.parse(localStorage.getItem(key));

    return data || [];
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [value, key]);

  return [value, setValue];
}

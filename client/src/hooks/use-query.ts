import { useLocation } from "wouter";
import { useEffect, useState } from "react";

export function useQueryParams() {
  const [location] = useLocation();
  const [params, setParams] = useState(new URLSearchParams(window.location.search));

  useEffect(() => {
    setParams(new URLSearchParams(window.location.search));
  }, [location]);

  return params;
} 
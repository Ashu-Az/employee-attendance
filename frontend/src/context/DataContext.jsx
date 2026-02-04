import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { employeeAPI } from '../services/api';

const DataContext = createContext();

export function DataProvider({ children }) {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchEmployees = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await employeeAPI.getAll();
      setEmployees(data);
      setError(null);
    } catch (err) {
      setError('Failed to load employees.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  return (
    <DataContext.Provider value={{ employees, loading, error, refresh: fetchEmployees }}>
      {children}
    </DataContext.Provider>
  );
}

export function useEmployees() {
  return useContext(DataContext);
}

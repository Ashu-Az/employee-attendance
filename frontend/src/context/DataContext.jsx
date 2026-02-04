import React, { createContext, useContext, useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { employeeAPI, attendanceAPI } from '../services/api';

const DataContext = createContext();

export function DataProvider({ children }) {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [allAttendance, setAllAttendance] = useState([]);
  const [todayAttendance, setTodayAttendance] = useState([]);
  const [attLoading, setAttLoading] = useState(true);

  // { employeeId: [...records] } — survives navigation, cleared on invalidate
  const attCacheRef = useRef({});

  const fetchEmployees = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await employeeAPI.getAll();
      setEmployees(data);
      setError(null);
    } catch {
      setError('Failed to load employees.');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAllAttendance = useCallback(async () => {
    try {
      setAttLoading(true);
      const today = new Date().toISOString().split('T')[0];
      const [allRes, todayRes] = await Promise.all([
        attendanceAPI.getAll(),
        attendanceAPI.getAll({ startDate: today, endDate: today }),
      ]);
      setAllAttendance(allRes.data);
      setTodayAttendance(todayRes.data);
    } catch {
      // non-fatal — pages keep showing what they have
    } finally {
      setAttLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEmployees();
    fetchAllAttendance();
  }, [fetchEmployees, fetchAllAttendance]);

  // Sync cache read — returns array or null
  const getCachedAttendance = useCallback((empId) => attCacheRef.current[empId] || null, []);

  // Async — serves from cache when possible, otherwise fetches and caches
  const fetchEmployeeAttendance = useCallback(async (empId) => {
    if (attCacheRef.current[empId]) return attCacheRef.current[empId];
    const { data } = await attendanceAPI.getByEmployee(empId);
    attCacheRef.current[empId] = data;
    return data;
  }, []);

  // Drop one employee's cached copy so the next fetch hits the network
  const invalidateEmployeeAttendance = useCallback((empId) => {
    delete attCacheRef.current[empId];
  }, []);

  const value = useMemo(() => ({
    employees, loading, error, refresh: fetchEmployees,
    allAttendance, todayAttendance, attLoading, refreshAttendance: fetchAllAttendance,
    getCachedAttendance, fetchEmployeeAttendance, invalidateEmployeeAttendance,
  }), [
    employees, loading, error, fetchEmployees,
    allAttendance, todayAttendance, attLoading, fetchAllAttendance,
    getCachedAttendance, fetchEmployeeAttendance, invalidateEmployeeAttendance,
  ]);

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
}

export function useEmployees() {
  return useContext(DataContext);
}

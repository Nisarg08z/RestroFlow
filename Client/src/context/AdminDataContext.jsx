import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import {
  getAllRestaurants,
  getAllRestaurantRequests,
  getAdminTickets,
  getAllSubscriptions,
  getSubscriptionStats,
} from "../utils/api";
import toast from "react-hot-toast";

const AdminDataContext = createContext(null);

export const AdminDataProvider = ({ children }) => {
  const [restaurants, setRestaurants] = useState([]);
  const [requests, setRequests] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [subscriptionStats, setSubscriptionStats] = useState({
    totalMRR: 0,
    activeSubscriptions: 0,
    expiringSoon: 0,
    expiredCount: 0,
  });

  const [loading, setLoading] = useState(true);
  const [initialLoadDone, setInitialLoadDone] = useState(false);

  const fetchAllData = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const [restaurantsRes, requestsRes, ticketsRes, subsRes, statsRes] = await Promise.all([
        getAllRestaurants().catch(() => ({ data: { data: [] } })),
        getAllRestaurantRequests().catch(() => ({ data: { data: [] } })),
        getAdminTickets().catch(() => ({ data: { data: [] } })),
        getAllSubscriptions().catch(() => ({ data: { data: [] } })),
        getSubscriptionStats().catch(() => ({ data: { data: {} } })),
      ]);

      setRestaurants(restaurantsRes.data?.data || []);
      setRequests(requestsRes.data?.data || []);
      setTickets(ticketsRes.data?.data || []);
      setSubscriptions(subsRes.data?.data || []);
      setSubscriptionStats(statsRes.data?.data || {
        totalMRR: 0,
        activeSubscriptions: 0,
        expiringSoon: 0,
        expiredCount: 0,
      });
      setInitialLoadDone(true);
    } catch (error) {
      console.error("Error fetching admin data:", error);
      toast.error("Failed to load admin data");
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshRestaurants = useCallback(async () => {
    try {
      const res = await getAllRestaurants();
      setRestaurants(res.data?.data || []);
    } catch (e) {
      console.error(e);
      toast.error("Failed to refresh restaurants");
    }
  }, []);

  const refreshRequests = useCallback(async () => {
    try {
      const res = await getAllRestaurantRequests();
      setRequests(res.data?.data || []);
    } catch (e) {
      console.error(e);
      toast.error("Failed to refresh requests");
    }
  }, []);

  const refreshTickets = useCallback(async () => {
    try {
      const res = await getAdminTickets();
      setTickets(res.data?.data || []);
    } catch (e) {
      console.error(e);
      toast.error("Failed to refresh tickets");
    }
  }, []);

  const refreshSubscriptions = useCallback(async () => {
    try {
      const [subsRes, statsRes] = await Promise.all([
        getAllSubscriptions(),
        getSubscriptionStats(),
      ]);
      setSubscriptions(subsRes.data?.data || []);
      setSubscriptionStats(statsRes.data?.data || {
        totalMRR: 0,
        activeSubscriptions: 0,
        expiringSoon: 0,
        expiredCount: 0,
      });
    } catch (e) {
      console.error(e);
      toast.error("Failed to refresh subscriptions");
    }
  }, []);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  const value = {
    restaurants,
    requests,
    tickets,
    subscriptions,
    subscriptionStats,
    loading,
    initialLoadDone,
    setRestaurants,
    setRequests,
    setTickets,
    setSubscriptions,
    setSubscriptionStats,
    refreshRestaurants,
    refreshRequests,
    refreshTickets,
    refreshSubscriptions,
    refreshAll: () => fetchAllData(false),
  };

  return (
    <AdminDataContext.Provider value={value}>
      {children}
    </AdminDataContext.Provider>
  );
};

export const useAdminData = () => {
  const ctx = useContext(AdminDataContext);
  if (!ctx) {
    throw new Error("useAdminData must be used within AdminDataProvider");
  }
  return ctx;
};

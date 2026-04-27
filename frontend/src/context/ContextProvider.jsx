import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { toast } from "react-toastify";
import AppContext from "./AppContext";

const ContextProvider = ({ children }) => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  // 1. Lazy initialization
  const [token, setToken] = useState(() => localStorage.getItem("token") || "");
  const [events, setEvents] = useState([]);
  const [userName, setUserName] = useState("User");
  const navigate = useNavigate();

  // Decode token & manage localStorage
  useEffect(() => {
    if (token) {
      try {
        localStorage.setItem("token", token);
        const decoded = jwtDecode(token);
        if (decoded.name) setUserName(decoded.name);
      } catch (error) {
        console.error("Invalid token:", error.message);
      }
    } else {
      localStorage.removeItem("token");
      setUserName("User");
      setEvents([]);
    }
  }, [token]);

  // Memoized sorter
  const sortEventsByUpcomingDate = useCallback((eventsList) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const currentYear = today.getFullYear();

    return eventsList
      .map((event) => {
        const original = new Date(event.date);
        if (isNaN(original.getTime())) return null;

        let upcomingDate = new Date(
          currentYear,
          original.getMonth(),
          original.getDate(),
        );

        if (upcomingDate < today) {
          upcomingDate.setFullYear(currentYear + 1);
        }

        return { ...event, _sortDate: upcomingDate };
      })
      .filter(Boolean)
      .sort((a, b) => a._sortDate - b._sortDate)
      .map((event) => {
        const { _sortDate, ...rest } = event;
        return rest;
      });
  }, []);

  // EXTRACTED: fetchEvents is now a standalone callback so we can export it
  const fetchEvents = useCallback(async () => {
    if (!token) return;
    try {
      const res = await axios.get(`${backendUrl}/event`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.success) {
        setEvents(sortEventsByUpcomingDate(res.data.events));
      } else {
        toast.error("Failed to load events");
      }
    } catch (error) {
      console.error("Error fetching events:", error);
      toast.error(error.response?.data?.message || "Network error");
    }
  }, [token, backendUrl, sortEventsByUpcomingDate]);

  // Call fetchEvents when the token changes
  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Memoize action handlers
  const handleDelete = useCallback(
    async (eventId) => {
      if (!window.confirm("Are you sure you want to delete this event?"))
        return;

      try {
        await axios.delete(`${backendUrl}/event/${eventId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setEvents((prevEvents) => prevEvents.filter((e) => e._id !== eventId));
        toast.success("Event deleted successfully");
      } catch (error) {
        console.error("Error deleting event:", error);
        toast.error(error.response?.data?.message || "Failed to delete event");
      }
    },
    [backendUrl, token],
  );

  const handleEdit = useCallback(
    (event) => {
      navigate("/new-event", { state: { eventData: event } });
    },
    [navigate],
  );

  // ADDED: fetchEvents is now exported so AddNewEvent can use it
  const value = useMemo(
    () => ({
      token,
      backendUrl,
      userName,
      events,
      setToken,
      handleDelete,
      handleEdit,
      setEvents,
      fetchEvents,
    }),
    [
      token,
      backendUrl,
      userName,
      events,
      handleDelete,
      handleEdit,
      fetchEvents,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export default ContextProvider;

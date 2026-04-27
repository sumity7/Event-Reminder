import { useState, useContext, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import AppContext from "../context/AppContext";

const formatDateForInput = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? "" : date.toISOString().split("T")[0];
};

const AddNewEvent = () => {
  // BROUGHT BACK: fetchEvents instead of setEvents
  const { token, backendUrl, fetchEvents } = useContext(AppContext);
  const navigate = useNavigate();
  const location = useLocation();
  const eventData = location.state?.eventData;

  const [isLoading, setIsLoading] = useState(false);

  const initialFormData = useMemo(() => {
    const STANDARD_EVENTS = ["Birthday", "Anniversary"];
    const STANDARD_FESTIVALS = ["Holi", "Dussehra", "Diwali", "Chhath Puja"];

    let eventType = "Birthday";
    let festivalType = "Holi";
    let customFest = "";

    if (eventData) {
      if (STANDARD_EVENTS.includes(eventData.event)) {
        eventType = eventData.event;
      } else {
        eventType = "Festival";
        if (STANDARD_FESTIVALS.includes(eventData.event)) {
          festivalType = eventData.event;
        } else {
          festivalType = "Other";
          customFest = eventData.event;
        }
      }
    }

    return {
      name: eventData?.name || "",
      phone: eventData?.phone || "",
      event: eventType,
      festival: festivalType,
      customFestival: customFest,
      date: eventData?.date ? formatDateForInput(eventData.date) : "",
      relation: eventData?.relation || "Friend",
    };
  }, [eventData]);

  const [formData, setFormData] = useState(initialFormData);

  const isFestival = formData.event === "Festival";
  const isOtherFestival = isFestival && formData.festival === "Other";

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    if (isLoading) return;

    if (isOtherFestival && !formData.customFestival.trim()) {
      toast.error("Please enter a custom festival name");
      return;
    }

    setIsLoading(true);

    try {
      const decoded = jwtDecode(token);

      const finalEvent = isFestival
        ? isOtherFestival
          ? formData.customFestival.trim()
          : formData.festival
        : formData.event;

      const payload = {
        userId: decoded.id,
        name: formData.name,
        phone: formData.phone,
        event: finalEvent,
        date: formData.date,
        relation: formData.relation,
      };

      if (eventData) {
        await axios.put(`${backendUrl}/event/${eventData._id}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Event updated successfully");
      } else {
        await axios.post(`${backendUrl}/event`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // SAFEST APPROACH: Refetch events so they get sorted properly and have their database IDs attached
        await fetchEvents();

        toast.success("Event added successfully");
      }
      navigate("/events");
    } catch (error) {
      console.error("Error saving event:", error);
      toast.error(error.response?.data?.message || "Failed to save event");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gray-100 mx-auto rounded-2xl md:max-w-[80%] p-4 min-h-screen">
      <h2 className="text-2xl font-semibold text-center mb-2 text-stone-800">
        {eventData ? "Edit Event" : "Add New Event"}
      </h2>
      <p className="italic text-center text-stone-600 mb-6">
        "The best way to remember special days is by making them unforgettable
        for others."
        <br />
        <span className="text-sm text-gray-500">— Unknown</span>
      </p>

      <form
        onSubmit={onSubmitHandler}
        className="bg-white rounded-2xl p-6 md:max-w-xl mx-auto shadow-md flex flex-col gap-3"
      >
        <div className="flex flex-col">
          <label className="font-medium mb-1" htmlFor="name">
            👤 Name
          </label>
          <input
            className="py-2 px-4 rounded-lg bg-gray-100 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-violet-400"
            type="text"
            name="name"
            id="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter Name"
            required
          />
        </div>

        <div className="flex flex-col">
          <label className="font-medium mb-1" htmlFor="phone">
            ☎ Phone
          </label>
          <input
            className="py-2 px-4 rounded-lg bg-gray-100 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-violet-400"
            type="tel"
            name="phone"
            id="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="Enter Phone Number"
            required
          />
        </div>

        <div className="flex flex-col">
          <label className="font-medium mb-1" htmlFor="event">
            🗓️ Event Type
          </label>
          <select
            name="event"
            id="event"
            className="py-2 px-4 rounded-lg bg-gray-100 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-violet-400"
            value={formData.event}
            onChange={handleChange}
          >
            <option value="Birthday">Birthday</option>
            <option value="Anniversary">Anniversary</option>
            <option value="Festival">Festival</option>
          </select>
        </div>

        {isFestival && (
          <div className="flex flex-col animate-fade-in">
            <label className="font-medium mb-1" htmlFor="festival">
              🎊 Festival Type
            </label>
            <select
              name="festival"
              id="festival"
              className="py-2 px-4 rounded-lg bg-gray-100 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-violet-400"
              value={formData.festival}
              onChange={handleChange}
            >
              <option value="Holi">Holi</option>
              <option value="Dussehra">Dussehra</option>
              <option value="Diwali">Diwali</option>
              <option value="Chhath Puja">Chhath Puja</option>
              <option value="Other">Other</option>
            </select>

            {isOtherFestival && (
              <input
                type="text"
                placeholder="Enter Custom Festival Name"
                className="mt-2 py-2 px-4 rounded-lg bg-gray-100 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-violet-400"
                name="customFestival"
                value={formData.customFestival}
                onChange={handleChange}
                required
              />
            )}
          </div>
        )}

        <div className="flex flex-col">
          <label className="font-medium mb-1" htmlFor="date">
            📅 Date
          </label>
          <input
            className="py-2 px-4 rounded-lg bg-gray-100 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-violet-400"
            type="date"
            name="date"
            id="date"
            value={formData.date}
            onChange={handleChange}
            required
          />
        </div>

        <div className="flex flex-col">
          <label className="font-medium mb-1" htmlFor="relation">
            👥 Relation
          </label>
          <select
            name="relation"
            id="relation"
            className="py-2 px-4 rounded-lg bg-gray-100 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-violet-400"
            value={formData.relation}
            onChange={handleChange}
          >
            <option value="Friend">Friend</option>
            <option value="Brother">Brother</option>
            <option value="Sister">Sister</option>
            <option value="Father">Father</option>
            <option value="Mother">Mother</option>
            <option value="Boss">Boss</option>
          </select>
        </div>

        <div className="mt-4">
          <button
            disabled={isLoading}
            className={`w-full py-2 rounded-full font-semibold shadow transition-all ${
              isLoading
                ? "bg-gray-400 text-gray-700 cursor-not-allowed"
                : "bg-green-700 hover:bg-green-800 text-white"
            }`}
          >
            {isLoading ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddNewEvent;

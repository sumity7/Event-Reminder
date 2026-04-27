import { useContext, useCallback, memo } from "react";
import Card from "../components/Card";
import AppContext from "../context/AppContext";

// 1. Wrapper component to preserve React.memo benefits on the Card
const EventCardWrapper = memo(({ eventData, onEdit, onDelete }) => {
  // Stabilize the functions for this specific instance
  const handleEditClick = useCallback(
    () => onEdit(eventData),
    [eventData, onEdit],
  );
  const handleDeleteClick = useCallback(
    () => onDelete(eventData._id),
    [eventData._id, onDelete],
  );

  return (
    <Card
      name={eventData.name}
      phone={eventData.phone}
      event={eventData.event}
      date={eventData.date}
      relation={eventData.relation}
      onEdit={handleEditClick}
      onDelete={handleDeleteClick}
    />
  );
});

const Events = () => {
  const { events, handleDelete, handleEdit } = useContext(AppContext);

  // 2. Extracted Empty State for cleaner rendering and better UX
  if (!events || events.length === 0) {
    return (
      <div className="flex justify-center items-center md:max-w-[80%] h-40 bg-gray-100 rounded-2xl mx-auto mt-6 text-gray-500 font-medium text-lg">
        <p>No upcoming events found. Add one to get started!</p>
      </div>
    );
  }

  return (
    <div className="flex md:max-w-[80%] bg-gray-100 rounded-2xl px-5 py-6 mx-auto mt-6 flex-wrap gap-4 justify-center md:justify-start">
      {events.map((event) => (
        <EventCardWrapper
          // 3. Removed the fallback to `index` to ensure DOM stability
          key={event._id}
          eventData={event}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      ))}
    </div>
  );
};

export default Events;

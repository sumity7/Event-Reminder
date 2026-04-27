import { useContext, useCallback, memo, useMemo } from "react";
import { Link } from "react-router-dom";
import AppContext from "../context/AppContext";
import Card from "../components/Card";

// 1. Wrapper component to preserve React.memo benefits on the Card
const EventCardWrapper = memo(({ eventData, onEdit, onDelete }) => {
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

const Home = () => {
  // useNavigate is removed because we can use a semantic <Link> instead
  const { token, userName, events, handleDelete, handleEdit } =
    useContext(AppContext);

  // 2. Memoize the slice operation so it doesn't recalculate on every render
  const upcomingEvents = useMemo(() => events.slice(0, 6), [events]);

  return (
    <div className="bg-gray-100 rounded-2xl px-5 py-8 md:max-w-[80%] mx-auto shadow-sm mt-6">
      {/* Hero Section */}
      <div className="mb-6">
        <h1 className="font-semibold text-3xl mb-2 text-stone-800">
          Welcome <span className="text-violet-600">{userName}!</span>
        </h1>
        <h2 className="text-xl font-medium text-stone-700 mb-3">
          🎉 Celebrate Every Special Moment, Effortlessly!
        </h2>
        <p className="text-stone-600 leading-relaxed max-w-3xl">
          Never miss a birthday, anniversary, or festival again! Our intelligent
          reminder platform helps you stay connected with your loved ones by
          sending personalized messages for all important occasions — directly
          through WhatsApp. Set reminders, get AI-generated messages, and make
          every celebration extra special — all in one place.
        </p>
      </div>

      {/* Auth Conditional Rendering */}
      {!token ? (
        <div className="mt-8 p-6 bg-violet-50 rounded-xl border border-violet-100 inline-block">
          {/* 3. Replaced <p onClick={...}> with <Link> for better accessibility & SEO */}
          <Link
            to="/login"
            className="text-lg font-medium text-violet-800 hover:text-violet-600 hover:underline flex items-center gap-2"
          >
            <span>👉</span> Sign up now and let the celebrations begin!
          </Link>
        </div>
      ) : (
        <div className="mt-8 flex flex-col">
          <h3 className="text-xl font-medium text-stone-800 mb-2">
            Upcoming Events
          </h3>
          <hr className="border-t border-gray-300 w-full mb-6" />

          {/* 4. Improved Empty State UI */}
          {upcomingEvents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
              <p className="text-gray-500 mb-4 font-medium">
                No upcoming events yet.
              </p>
              <Link
                to="/new-event"
                className="bg-violet-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-violet-700 transition-colors shadow-sm"
              >
                + Add Your First Event
              </Link>
            </div>
          ) : (
            <div className="flex flex-wrap gap-4 justify-center md:justify-start">
              {upcomingEvents.map((event) => (
                <EventCardWrapper
                  key={event._id} // 5. Fixed index key anti-pattern
                  eventData={event}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Home;

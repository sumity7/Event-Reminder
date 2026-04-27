import { memo } from "react";
import { faEdit, faPhone, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

// 1. Moved outside the component to prevent recreation on every render
const formatDate = (dateString) => {
  if (!dateString) return "N/A";

  const date = new Date(dateString);
  // Fallback to prevent "Invalid Date" errors breaking the UI
  if (isNaN(date.getTime())) return "Invalid Date";

  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

const Card = ({ name, phone, date, event, relation, onEdit, onDelete }) => {
  return (
    <div className="border flex flex-col md:w-[24vw] w-full border-gray-300 py-4 px-4 rounded-2xl shadow-sm hover:shadow-md transition-shadow bg-white">
      <div className="flex justify-between items-start mb-3">
        {/* Added line-clamp in case of very long names */}
        <h3
          className="text-lg font-semibold text-stone-800 line-clamp-1"
          title={name}
        >
          {name}
        </h3>
        {phone && (
          <p className="font-medium text-stone-700 whitespace-nowrap ml-2">
            <FontAwesomeIcon
              className="text-sm pr-1 text-stone-500"
              icon={faPhone}
            />
            {phone}
          </p>
        )}
      </div>

      <div className="flex justify-between items-end mt-auto">
        <div className="flex flex-col gap-1">
          <p className="text-sm text-stone-600">🎉 {event}</p>
          <p className="text-sm text-stone-500">📅 {formatDate(date)}</p>
          <p className="text-sm text-stone-400">🤝 {relation}</p>
        </div>

        {/* 2. Wrapped icons in native <button> tags for accessibility */}
        <div className="flex justify-center items-center gap-2">
          <button
            type="button"
            onClick={onDelete}
            aria-label={`Delete event for ${name}`}
            className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1"
          >
            <FontAwesomeIcon icon={faTrash} />
          </button>

          <button
            type="button"
            onClick={onEdit}
            aria-label={`Edit event for ${name}`}
            className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-500 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-1"
          >
            <FontAwesomeIcon icon={faEdit} />
          </button>
        </div>
      </div>
    </div>
  );
};

// 3. Wrapped in React.memo to optimize list rendering
export default memo(Card);

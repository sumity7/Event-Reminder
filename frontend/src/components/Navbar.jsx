import { faUser } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useContext } from "react";
import { NavLink } from "react-router-dom";
import AppContext from "../context/AppContext";

const Navbar = () => {
  const { token, navigate } = useContext(AppContext);

  function userHandle() {
    if (token) {
      const confirmLogout = window.confirm("Are you sure you want to logout?");
      if (confirmLogout) {
        localStorage.removeItem("token");
        navigate("/");
        window.location.reload();
      }
    } else {
      navigate("/login");
    }
  }

  return (
    <div className="flex bg-gray-50 px-6 py-2 rounded-2xl mb-2 md:max-w-[80%] mx-auto justify-between items-center">
      <ul className="flex gap-4">
        <li className="font-medium text-xl">
          <NavLink
            to="/"
            className={({ isActive }) =>
              isActive ? "border-b-2" : "text-gray-600 "
            }
            end
          >
            Home
          </NavLink>
        </li>
        {token && (
          <li className="font-medium text-xl">
            <NavLink
              to="/new-event"
              className={({ isActive }) =>
                isActive ? "border-b-1 " : "text-gray-600"
              }
            >
              Add Event
            </NavLink>
          </li>
        )}
        {token && (
          <li className="font-medium text-xl">
            <NavLink
              to="/events"
              className={({ isActive }) =>
                isActive ? "border-b-1 " : "text-gray-600"
              }
            >
              Events
            </NavLink>
          </li>
        )}
      </ul>
      <FontAwesomeIcon
        onClick={userHandle}
        icon={faUser}
        className="cursor-pointer text-xl hover:text-gray-700 transition-colors"
      />
    </div>
  );
};

export default Navbar;

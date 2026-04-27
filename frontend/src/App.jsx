import { Route, Routes } from "react-router-dom";
import AddNewEvent from "./components/AddNewEvent";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Events from "./pages/Events";
import { ToastContainer } from "react-toastify";

const App = () => {
  return (
    <div className="bg-gray-200 p-2 min-h-screen">
      <ToastContainer />
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/events" element={<Events />} />
        <Route path="/new-event" element={<AddNewEvent />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </div>
  );
};

export default App;

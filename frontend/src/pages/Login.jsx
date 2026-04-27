import { useState, useContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import AppContext from "../context/AppContext";

const Login = () => {
  // Use a boolean for toggle state (faster and less error-prone than string matching)
  const [isLogin, setIsLogin] = useState(true);

  // Consolidate form state into a single object to reduce multiple useState hooks
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
  });

  // Add a loading state to prevent multiple submissions
  const [isLoading, setIsLoading] = useState(false);

  const { setToken, backendUrl } = useContext(AppContext);

  // Generic change handler for all inputs
  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    if (isLoading) return; // Prevent double clicks

    setIsLoading(true);
    try {
      // Dynamically set endpoint and payload based on the current state
      const endpoint = isLogin ? "/user/login" : "/user/register";
      const payload = isLogin
        ? { email: formData.email, password: formData.password }
        : formData;

      const response = await axios.post(`${backendUrl}${endpoint}`, payload);

      if (response.data.success) {
        setToken(response.data.token);
        localStorage.setItem("token", response.data.token);
        toast.success(isLogin ? "Logged in successfully!" : "Account created!");
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error("Authentication error:", error);
      // Fallback to axios specific error message if available
      toast.error(
        error.response?.data?.message || "An error occurred. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="border md:w-[40%] bg-gray-50 mx-auto shadow-2xl border-gray-300 rounded-2xl p-4">
      <p className="text-2xl font-medium text-center my-4">
        Welcome to Humanastic
      </p>
      <form onSubmit={onSubmitHandler} className="flex flex-col gap-3">
        {/* Render Name and Phone only if signing up */}
        {!isLogin && (
          <>
            <div className="flex flex-col">
              <label className="font-medium" htmlFor="name">
                Name
              </label>
              <input
                onChange={handleChange}
                value={formData.name}
                className="py-2 px-4 rounded bg-gray-200"
                type="text"
                name="name"
                id="name"
                placeholder="Enter your Name"
                required
              />
            </div>
            <div className="flex flex-col">
              <label className="font-medium" htmlFor="phone">
                Phone
              </label>
              <input
                onChange={handleChange}
                value={formData.phone}
                className="py-2 px-4 rounded bg-gray-200"
                type="tel"
                name="phone"
                id="phone"
                placeholder="Enter your Phone Number"
                required
              />
            </div>
          </>
        )}

        <div className="flex flex-col">
          <label className="font-medium" htmlFor="email">
            Email
          </label>
          <input
            onChange={handleChange}
            value={formData.email}
            className="py-2 px-4 rounded bg-gray-200"
            type="email"
            name="email"
            id="email"
            placeholder="Enter your Email"
            required
          />
        </div>

        <div className="flex flex-col">
          <label className="font-medium" htmlFor="password">
            Password
          </label>
          <input
            onChange={handleChange}
            value={formData.password}
            className="py-2 px-4 rounded bg-gray-200"
            type="password"
            name="password"
            id="password"
            placeholder="Enter your Password"
            required
          />
        </div>

        <div className="mb-4 mt-2">
          <button
            disabled={isLoading}
            className={`py-2 rounded-full w-full font-medium transition-colors ${
              isLoading
                ? "bg-gray-400 text-gray-700 cursor-not-allowed"
                : "bg-green-800 text-gray-100 hover:bg-green-900"
            }`}
          >
            {isLoading ? "Processing..." : isLogin ? "Login" : "Sign Up"}
          </button>

          <div className="flex justify-between mt-2 text-sm">
            {isLogin ? (
              <p className="cursor-pointer text-blue-700 hover:text-blue-500 hover:underline">
                Forgot Password?
              </p>
            ) : (
              <p></p> // Empty placeholder to keep flex spacing intact
            )}

            <p
              onClick={() => setIsLogin(!isLogin)}
              className="cursor-pointer hover:underline text-gray-700"
            >
              {isLogin ? "Create an Account" : "Login Here"}
            </p>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Login;

import { useContext, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import AppContext from "../context/AppContext";

const Login = () => {
  const [currentState, setCurrentState] = useState("Login");

  const { token, setToken, navigate, backendUrl } = useContext(AppContext);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmitHandler = async (event) => {
    event.preventDefault();

    try {
      setLoading(true)
      if (currentState === "Sign Up") {
        if (password !== confirmPassword) {
          return toast.error("Passwords do not match");
        }

        const response = await axios.post(
          backendUrl + "/user/register",
          {
            name,
            phone,
            email,
            password,
          }
        );

        if (response.data.success) {
          setToken(response.data.token);
          localStorage.setItem("token", response.data.token);
        } else {
          toast.error(response.data.message);
        }
      } else {
        const response = await axios.post(
          backendUrl + "/user/login",
          {
            email,
            password,
          }
        );

        if (response.data.success) {
          setToken(response.data.token);
          localStorage.setItem("token", response.data.token);
        } else {
          toast.error(response.data.message);
        }
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setLoading(false)
    }
  };

  useEffect(() => {
    if (token) {
      navigate("/");
    }
  }, [token]);

  return (
    <form
      onSubmit={onSubmitHandler}
      className="flex flex-col items-center w-[90%] border px-15 pb-5 rounded-2xl sm:max-w-96 m-auto mt-14 gap-4 text-gray-800"
    >
      <div className="inline-flex items-center gap-2 mt-10">
        <p className="text-3xl">{currentState}</p>
        <hr className="h-[1.5px] w-8 bg-gray-800" />
      </div>

      {/* Name */}
      {currentState !== "Login" && (
        <input
          onChange={(e) => setName(e.target.value)}
          value={name}
          className="w-full px-3 py-2 border"
          type="text"
          placeholder="Name"
          required
        />
      )}

      {/* Phone */}
      {currentState !== "Login" && (
        <input
          onChange={(e) => setPhone(e.target.value)}
          value={phone}
          className="w-full px-3 py-2 border"
          type="text"
          placeholder="Phone"
          required
        />
      )}

      {/* Email */}
      <input
        onChange={(e) => setEmail(e.target.value)}
        value={email}
        className="w-full px-3 py-2 border"
        type="email"
        placeholder="Email"
        required
      />

      {/* Password */}
      <input
        onChange={(e) => setPassword(e.target.value)}
        value={password}
        className="w-full px-3 py-2 border"
        type="password"
        placeholder="Password"
        required
      />

      {/* Confirm Password */}
      {currentState !== "Login" && (
        <input
          onChange={(e) => setConfirmPassword(e.target.value)}
          value={confirmPassword}
          className="w-full px-3 py-2 border"
          type="password"
          placeholder="Confirm Password"
          required
        />
      )}

      <div className="w-full flex justify-between text-sm">
        {currentState === "Login" && (
          <p
            onClick={() => navigate("/reset-password")}
            className="cursor-pointer text-blue-600"
          >
            Forgot password?
          </p>
        )}

        {currentState === "Login" ? (
          <p
            className="cursor-pointer"
            onClick={() => setCurrentState("Sign Up")}
          >
            Create Account
          </p>
        ) : (
          <p
            className="cursor-pointer"
            onClick={() => setCurrentState("Login")}
          >
            Login Here
          </p>
        )}
      </div>

      {currentState === "Login" ? 
          (<button className="bg-black text-white px-8 py-2 rounded-full w-full">{loading ? "loading..." : "Sign In"}</button>) 
          : 
          (<button className="bg-black text-white px-8 py-2 rounded-full w-full">{loading ? "loading..." : "Sign In"}</button>)}
    </form>
  );
};

export default Login;
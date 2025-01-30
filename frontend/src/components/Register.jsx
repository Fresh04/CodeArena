import { useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const Register = () => {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [responseMessage, setResponseMessage] = useState("");
  const [loading, setLoading] = useState(false);  // For loading state
  const navigate = useNavigate();

  const handleSubmit = async () => {
    if (!username.trim() || !password) {
      setResponseMessage("Please fill in all fields.");
      return;
    }

    setLoading(true);
    setResponseMessage("");

    try {
      // Step 1: Register the user
      const registerResponse = await fetch(`${API_BASE_URL}/register`, {
        method: "POST",
        headers: {
          'Content-Type': "application/json",
        },
        body: JSON.stringify({
          email,
          username,
          password,
        }),
      });

      const registerData = await registerResponse.json();

      if (registerResponse.status === 201) {
        // Step 2: Automatically log the user in after successful registration
        const loginResponse = await fetch(`${API_BASE_URL}/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: username.trim(), password }),
        });

        const loginData = await loginResponse.json();

        if (loginResponse.ok) {
          // Step 3: Store login data (token, username, etc.) in localStorage
          localStorage.setItem("token", loginData.token);
          localStorage.setItem("username", username);
          localStorage.setItem("access", loginData.access);
          localStorage.setItem("isLoggedIn", true);
          
          // Navigate to the previous page after successful login
          navigate(-1); // You can change this to navigate to any other page
        } else {
          setResponseMessage(loginData.msg || "Invalid username or password.");
        }
      } else {
        setResponseMessage(registerData.msg || "Registration failed.");
      }
    } catch (error) {
      console.error("Registration/Login failed:", error);
      setResponseMessage("Server error. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 p-6">
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-sm">
        <h2 className="text-2xl font-bold mb-6 text-center text-white">Register</h2>
        <input
          type="text"
          className="w-full p-3 mb-4 border border-gray-700 rounded bg-gray-900 text-gray-100 placeholder-gray-400"
          placeholder="Enter your username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="email"
          className="w-full p-3 mb-4 border border-gray-700 rounded bg-gray-900 text-gray-100 placeholder-gray-400"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          className="w-full p-3 mb-6 border border-gray-700 rounded bg-gray-900 text-gray-100 placeholder-gray-400"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          type="button"
          className="bg-blue-500 text-white w-full py-2 rounded-lg hover:bg-blue-600 transition-colors"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? "Registering..." : "Register"}
        </button>
        {responseMessage && (
          <p className="mt-4 text-center text-red-400">{responseMessage}</p>
        )}
      </div>
    </div>
  );
};

export default Register;

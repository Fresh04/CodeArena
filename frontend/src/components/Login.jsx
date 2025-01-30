import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Particles from "react-tsparticles";
import { loadSlim } from "tsparticles-slim";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginResponse, setLoginResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async () => {
    if (!username.trim() || !password) {
      setLoginResponse("Please fill in all fields.");
      return;
    }

    setLoading(true);
    setLoginResponse("");

    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim(), password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("username", username);
        localStorage.setItem("access", data.access);
        localStorage.setItem("isLoggedIn", true);
        navigate(-1);
      } else {
        setLoginResponse(data.msg || "Invalid username or password.");
      }
    } catch (error) {
      console.error("Login failed:", error);
      setLoginResponse("Server error. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-gray-900 text-gray-100 p-6">
      <Particles
        id="tsparticles"
        init={loadSlim}
        options={{
          background: { color: "#111827" },
          particles: {
            number: { value: 80, density: { enable: true, area: 800 } },
            shape: { type: "circle" },
            opacity: { value: 0.5 }, 
            size: { value: 3 },
            move: { enable: true, speed: 3 },
            color: { value: "#4b5563" }, 
            links: { 
              enable: true, 
              distance: 150, 
              color: "#6b7280",
              opacity: 0.4
            },
          },
          interactivity: {
            events: { 
              onHover: { enable: true, mode: "grab" }, 
              onClick: { enable: true, mode: "push" } 
            },
          },
        }}
        className="absolute inset-0 w-full h-full"
      />



      <div className="relative z-10 bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-sm">
        <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>

        <input
          className="w-full p-3 mb-4 border border-gray-700 rounded bg-gray-700 text-gray-200"
          placeholder="Username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          className="w-full p-3 mb-4 border border-gray-700 rounded bg-gray-700 text-gray-200"
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          type="button"
          className={`w-full py-2 rounded focus:outline-none focus:ring-2 ${
            loading
              ? "bg-gray-600 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500"
          }`}
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? "Logging in..." : "Submit"}
        </button>

        {loginResponse && <p className="mt-4 text-center text-red-400">{loginResponse}</p>}
      </div>
    </div>
  );
};

export default Login;

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axiosConfig";

interface User {
  name: string;
  email: string;
  role: string;
}

const Dashboard: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/"); // if no token, redirect to login
          return;
        }

        const res = await api.get("/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setUser(res.data.user);
      } catch (err) {
        console.error(err);
        setError("Failed to load profile");
      }
    };

    fetchProfile();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4">Faculty Dashboard</h2>

      {error && <p className="text-danger text-center">{error}</p>}

      {user ? (
        <div className="card p-4 shadow-sm">
          <h4>Welcome, {user.name}</h4>
          <p>
            <strong>Email:</strong> {user.email}
          </p>
          <p>
            <strong>Role:</strong> {user.role}
          </p>

          <hr />
          <h5>📊 Lab Registrations Overview (Dummy)</h5>
          <ul>
            <li>Lab 1: 12 students registered</li>
            <li>Lab 2: 8 students registered</li>
            <li>Lab 3: 15 students registered</li>
          </ul>

          <button className="btn btn-danger mt-3" onClick={handleLogout}>
            Logout
          </button>
        </div>
      ) : (
        !error && <p className="text-center">Loading profile...</p>
      )}
    </div>
  );
};

export default Dashboard;

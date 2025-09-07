import React, { useState } from "react";
import api from "../api/axiosConfig";

const RegisterLab: React.FC = () => {
  const [labNo, setLabNo] = useState("");
  const [systemNo, setSystemNo] = useState("");
  const [purpose, setPurpose] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token"); // ✅ student’s token

      // Typed response from backend
      const res = await api.post<{ message: string }>(
        "/registrations",
        { labNo, systemNo, purpose },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessage(res.data.message || "Lab registered successfully ✅");

      // Clear form
      setLabNo("");
      setSystemNo("");
      setPurpose("");
    } catch (err: unknown) {
      // Properly type error for Axios
      const axiosError = err as import("axios").AxiosError<{ message?: string }>;
      setMessage(axiosError.response?.data?.message || "Registration failed ❌");
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: "500px" }}>
      <h2 className="text-center mb-4">Register Lab Usage</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label>Lab Number</label>
          <input
            type="text"
            className="form-control"
            value={labNo}
            onChange={(e) => setLabNo(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label>System Number</label>
          <input
            type="text"
            className="form-control"
            value={systemNo}
            onChange={(e) => setSystemNo(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label>Purpose</label>
          <input
            type="text"
            className="form-control"
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
            required
          />
        </div>
        {message && <p className="text-center text-info">{message}</p>}
        <button type="submit" className="btn btn-success w-100">
          Submit Registration
        </button>
      </form>
    </div>
  );
};

export default RegisterLab;

import React, { useEffect, useState } from "react";
import axios from "../axios";
import { useNavigate } from "react-router-dom";

function AppPage() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get("/me")
      .then(res => setUser(res.data.user))
      .catch(() => navigate("/login"));
  }, []);

  async function handleLogout() {
    await axios.get("/logout");
    navigate("/login");
  };

  return (
    <div>
      <h2>Welcome {user?.email}</h2>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
};

export default AppPage;

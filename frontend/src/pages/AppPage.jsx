import React, { useEffect, useState } from "react";
import axios from "../axios";
import { useNavigate } from "react-router-dom";

function AppPage() {
  const [user, setUser] = useState(null);
  const [transactions, setTransactions] = useState([]);
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

  async function getUserTransactions() {
    try {
      const res = await axios.get("/all-transactions");
      setTransactions(res.data);
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <div>

      <h2>Welcome {user?.email}</h2>
      <button onClick={handleLogout}>Logout</button>

      <button onClick={getUserTransactions}> TRANSACTIONS </button>

      {transactions.length > 0 && (
        <ul>
          {transactions.map((t) => (
            <li key={t._id}>
              {t.type} - {t.category} - {t.amount} - {t.date}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AppPage;

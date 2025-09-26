import React, { useEffect, useState, forwardRef, useImperativeHandle } from "react";
import axios from "../axios";
import { useNavigate } from "react-router-dom";

const AppPage = forwardRef((props, ref) => {
  const [user, setUser] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const navigate = useNavigate();

  const fetchTransactions = async () => {
    try {
      const res = await axios.get("/all-transactions");
      setTransactions(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    axios
      .get("/me")
      .then((res) => setUser(res.data.user))
      .catch(() => navigate("/login"));

    fetchTransactions();
  }, [navigate]);

  // expose refreshTransactions to parent via ref
  useImperativeHandle(ref, () => ({
    refreshTransactions: fetchTransactions,
  }));

  async function handleLogout() {
    await axios.get("/logout");
    navigate("/login");
  }

  return (
    <div>
      <h2>Welcome {user?.email}</h2>
      <button onClick={handleLogout}>Logout</button>

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
});

export default AppPage;

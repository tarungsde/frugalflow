import React, { useState, useEffect } from "react";
import axios from "../axios";
import Transaction from "./Transaction";
import { useNavigate } from "react-router-dom";

function App() {

  const [newtransaction, setNewTransaction] = useState(false);
  const [user, setUser] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [income, setIncome] = useState(0);
  const [expense, setExpense] = useState(0);
  const [optionsVisible, setOptionsVisible] = useState(null);
  const [editTransaction, setEditTransaction] = useState(null);
  const [filterType, setFilterType] = useState(null);
  const [filterCategory, setFilterCategory] = useState(null);
  const [report, setReport] = useState(null);
  const [loadingReport, setLoadingReport] = useState(false);

  const navigate = useNavigate();

  const fetchTransactions = async (filterDetails = {}) => {
    try {
      const params = {};
      if (filterDetails.type) params.type = filterDetails.type;
      if (filterDetails.category) params.category = filterDetails.category;
      const queryString = new URLSearchParams(filterDetails).toString();
      const url = queryString ? `/filter?${queryString}` : "/all-transactions";
      const res = await axios.get(url);
      setTransactions(res.data);
    } catch (error) {
      console.error(error);
    } 
  };

  const handleLogout = async () => {
    await axios.get("/logout");
    navigate("/login");
  }

  const mappingFunction = (tx) => {
    return (
      <div>
        <p key={tx._id}>
          {tx.type} {tx.category} {tx.description} {new Date(tx.date).toISOString().split("T")[0]} {tx.amount}
          <button onClick={() => setOptionsVisible(optionsVisible === tx._id ? null : tx._id) }>
            ⋯
          </button>
        </p>

        {optionsVisible === tx._id && (
          <div className="options-menu">
            <button onClick={() => handleEdit(tx)}>Edit</button>
            <button onClick={() => handleDelete(tx._id)}>Delete</button>
          </div>
        )}
      </div>
    )
  }
  
  const handleDelete = async (id) => {
    try {
      await axios.delete(`/delete-transaction/${id}`);
      fetchTransactions();
      setOptionsVisible(null);
    } catch (error) {
      console.error(error);
    }
  }

  const handleEdit = (tx) => {
    setEditTransaction(tx);
    setNewTransaction(true);
    setOptionsVisible(null);
  }

  const optionMapping = (categoryName) => {
    return <option value={categoryName}>{categoryName}</option>
  }

  const generateReport = async () => {
    setLoadingReport(true);
    try {
      const res = await axios.get("/generate-report");
      setReport(res.data.report);
    } catch (error) {
      console.error("Error while reaching backend for report generation. ", error);
    }
    setLoadingReport(false);
  }

  const expenseCategories = ["Food & Dining", "Shopping", "Housing"];
  const incomeCategories = ["Salary", "Free Lance", "Investments"];

  useEffect(() => {
    axios
      .get("/me")
      .then((res) => setUser(res.data.user))
      .catch(() => navigate("/login"));
  }, [navigate]);

  useEffect(() => {
    fetchTransactions();
  }, []);

  useEffect(() => {
      let totalIncome = 0;
      let totalExpense = 0;

      transactions.forEach((tx) => {
        if (tx.type === "income") {
          totalIncome += tx.amount;
        } else if (tx.type === "expense") {
          totalExpense += tx.amount;
        }
      });

      setIncome(totalIncome);
      setExpense(totalExpense);

  }, [transactions]);

  useEffect(() => {
    fetchTransactions({ type: filterType, category: filterCategory });
  }, [filterType, filterCategory]);

  useEffect(() => {
    setFilterCategory("");
  }, [filterType]);

  return (
    <div id="container"> 
     
      <div>
        <h1>FrugalFlow</h1>
        <button 
          onClick={handleLogout}
          style={{ position: "absolute", top: 20, right: 20 }}
          >Logout
        </button>

        <div>
          <p>Monthly AI Report <button onClick={generateReport}>Generate Report </button> </p>
          {loadingReport && <p>📊 Generating your report...</p>}
          {report && (
            <div className="report-card">
              <h3>AI Financial Report</h3>
              <pre>{report}</pre>
            </div>
          )}
        </div>

        {transactions.length > 0 && (
          <div>
            <p>Total Income: ₹{income}</p>
            <p>Total Expense: ₹{expense}</p>
            <p>Balance: ₹{income - expense}</p>
            <h2> Transactions </h2>
            <div className="filter-form">
              <select name="type" id="type" value={filterType || ""} onChange={(e) => setFilterType(e.target.value)}>
                <option value="">All Type</option>
                <option value="income">income</option>
                <option value="expense">expense</option>
              </select>
              <select name="category" id="category" value={filterCategory || ""} onChange={(e) => setFilterCategory(e.target.value)}>
                <option value="">All Category</option>
                {filterType==="income" ? incomeCategories.map(optionMapping) : expenseCategories.map(optionMapping)}
              </select>
            </div>
            <p> Type - Details - Date - Amount </p>
            
            <div>
              {transactions.map((t) => mappingFunction(t))}
            </div>
          </div>
        )}
      </div>

      <button 
        id="show-transaction-card" 
        onClick={() => setNewTransaction(true)}
      >
        New Transaction
      </button>

      {newtransaction && ( 
        <Transaction 
          onClose={() => {
            setNewTransaction(false);
            setEditTransaction(null);
          }} 
          onSuccess={fetchTransactions} 
          existingData={editTransaction}
        /> 
      )}

    </div>
  );
}
export default App;

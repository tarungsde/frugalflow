import React, { useState, useEffect } from "react";
import axios from "../axios";

function Transaction({ handleNewTransaction }) {

  const expenseCategories = ["Food & Dining", "Shopping", "Housing"];
  const incomeCategories = ["Salary", "Free Lance", "Investments"];

  const today = new Date();

  const [transactionAmount, setTransactionAmount] = useState("");
  const [transactionType, setTransactionType] = useState("expense");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState(today.toISOString().split("T")[0]);
  const [description, setDescription] = useState("");

  useEffect(() => {
    setCategory("");
  }, [transactionType]);

  const handleSubmit = async (e) => {

    e.preventDefault();
    if (!category) {
      alert("Please select a category!");
      return;
    }

    const transactionData = {
      type: transactionType,
      category,
      amount: transactionAmount,
      date,
      description,
    };

    axios.post("/add-transaction", transactionData)
      .then((res) => console.log(res)).catch((err) => console.error(err));
    
    setTransactionAmount("");
    setTransactionType("expense");
    setCategory("");
    setDate(today.toISOString().split("T")[0]);
    setDescription("");

  };
  
  const handleDateChange = (e) => {
    setDate(e.target.value);
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>

          <button 
            id="hide-transaction-card"
            onClick={handleNewTransaction}
          > 
            X 
          </button>

        <h1> Add New Transaction </h1>
        <h3> Enter the details for your new income or expense. </h3>

        <label>Transaction Type</label>
        <input 
          type="radio" 
          id="expense" 
          value="expense" 
          checked = {transactionType === "expense"}
          onChange = {(e) => setTransactionType(e.target.value)} 
        />
        <label htmlFor="expense">Expense</label>

        <input 
          type="radio" 
          id="income" 
          value="income"
          checked = {transactionType === "income"}
          onChange = {(e) => setTransactionType(e.target.value)}
        />
        <label htmlFor="income">Income</label>

        <label htmlFor="transactionAmount"> Amount </label>
        <input 
          type="number"
          id="transactionAmount"
          value={transactionAmount}
          onChange={(e) => setTransactionAmount(e.target.value)}
          placeholder="Enter amount"
          required
        />

        <label htmlFor="category"> Category </label>
        <select 
          id="category" 
          value={category} 
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="" disabled>
            Select a category
          </option>
          {(transactionType === "expense" ? expenseCategories : incomeCategories).map((cat, index) => (
            <option key={index} value={cat}>
              {cat}
            </option>
          ))}
        </select>


        <label htmlFor="mydate"> Date </label>
        <input
          type="date"
          id="mydate"
          value={date}
          max={today.toISOString().split("T")[0]}
          onChange={handleDateChange}
        />

        <label htmlFor="description"> Description </label>
        <input
          type="text"
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="e.g. Groceries from D-mart"
        />

        <button type="submit">Add Transaction</button>

      </form>
    </div>
  )
}

export default Transaction;
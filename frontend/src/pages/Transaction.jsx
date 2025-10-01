import React, { useState, useEffect } from "react";
import axios from "../axios";

function Transaction({ onClose, onSuccess, existingData }) {

  const expenseCategories = ["Food & Dining", "Shopping", "Housing"];
  const incomeCategories = ["Salary", "Free Lance", "Investments"];

  const today = new Date();

  const [transactionAmount, setTransactionAmount] = useState(existingData?.amount || "");
  const [transactionType, setTransactionType] = useState(existingData?.type || "expense");
  const [category, setCategory] = useState(existingData?.category || "");
  const [description, setDescription] = useState(existingData?.description || "");
  const [date, setDate] = useState(
    existingData ? existingData.date.split("T")[0] : "" || today.toISOString().split("T")[0]);

  useEffect(() => {
    setCategory("");
  }, [transactionType]);

  const handleSubmit = async (e) => {
    
  e.preventDefault();

  try {
    if (existingData) {
      await axios.put(`/update-transaction/${existingData._id}`, {
        type: transactionType,
        category,
        amount: transactionAmount,
        description,
        date,
      });
    } else {
      await axios.post("/add-transaction", {
        type: transactionType,
        category,
        amount: transactionAmount,
        description,
        date,
      });
    }

    setTransactionAmount("");
    setTransactionType("expense");
    setCategory("");
    setDate(today.toISOString().split("T")[0]);
    setDescription("");

    onSuccess();
    onClose();

  } catch (error) {
    console.error(error);
  }};
  
  const handleDateChange = (e) => {
    setDate(e.target.value);
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>

        <button 
          id="hide-transaction-card"
          onClick={onClose}
        > 
          X 
        </button>

        <h1>{existingData ? "Edit Transaction" : "Add New Transaction"}</h1>
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
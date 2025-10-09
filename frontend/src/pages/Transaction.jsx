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
    <div
      className={`fixed inset-0 z-50 flex justify-end transition-opacity duration-300 backdrop-blur-sm ${
        onClose ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
    >
      <div
        className={`w-full max-w-md bg-white shadow-2xl h-full transform transition-transform duration-500 ease-in-out 
          ${onClose ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-6 h-full overflow-y-auto">
          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 self-end text-xl"
          >
            ✕
          </button>

          <h1 className="text-xl font-semibold text-gray-800">
            {existingData ? "Edit Transaction" : "Add New Transaction"}
          </h1>
          <h3 className="text-gray-500 text-sm mb-4">
            Enter the details for your new income or expense.
          </h3>

          {/* Transaction Type */}
          <label className="font-medium text-gray-700">Transaction Type</label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                id="expense"
                value="expense"
                checked={transactionType === "expense"}
                onChange={(e) => setTransactionType(e.target.value)}
              />
              <span>Expense</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="radio"
                id="income"
                value="income"
                checked={transactionType === "income"}
                onChange={(e) => setTransactionType(e.target.value)}
              />
              <span>Income</span>
            </label>
          </div>

          {/* Amount */}
          <label htmlFor="transactionAmount" className="font-medium text-gray-700">Amount</label>
          <input
            type="number"
            id="transactionAmount"
            value={transactionAmount}
            onChange={(e) => setTransactionAmount(e.target.value)}
            placeholder="Enter amount"
            className="border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-purple-400 focus:outline-none"
            required
          />

          {/* Category */}
          <label htmlFor="category" className="font-medium text-gray-700">Category</label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-purple-400 focus:outline-none"
          >
            <option value="" disabled>Select a category</option>
            {(transactionType === "expense" ? expenseCategories : incomeCategories).map((cat, index) => (
              <option key={index} value={cat}>{cat}</option>
            ))}
          </select>

          {/* Date */}
          <label htmlFor="mydate" className="font-medium text-gray-700">Date</label>
          <input
            type="date"
            id="mydate"
            value={date}
            max={today.toISOString().split("T")[0]}
            onChange={handleDateChange}
            className="border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-purple-400 focus:outline-none"
          />

          {/* Description */}
          <label htmlFor="description" className="font-medium text-gray-700">Description</label>
          <input
            type="text"
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. Groceries from D-mart"
            className="border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-purple-400 focus:outline-none"
          />

          {/* Submit button */}
          <button
            type="submit"
            className="bg-purple-500 text-white py-2 rounded-md mt-4 hover:bg-purple-600 transition duration-200"
          >
            {existingData ? "Save Changes" : "Add Transaction"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Transaction;
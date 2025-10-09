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
  const [report, setReport] = useState({summary: "", advice: ""});
  const [loadingReport, setLoadingReport] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showModal, setShowModal] = useState(false);

  const navigate = useNavigate();

  const fetchTransactions = async (filterDetails = {}) => {
    try {
      const params = {};
      if (filterDetails.type) params.type = filterDetails.type;
      if (filterDetails.category) params.category = filterDetails.category;
      if (filterDetails.startDate) params.startDate = filterDetails.startDate;
      if (filterDetails.endDate) params.endDate = filterDetails.endDate;

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
   
  const getCategoryIcon = (category) => {
    switch (category.toLowerCase()) {
      case 'free lance':
        return '💻';
      case 'entertainment':
        return '🎟️';
      case 'transportation':
        return '🚗';
      case 'food & dining':
      case 'groceries':
        return '🍽️';
      case 'housing':
        return '🏠';
      default:
        return '📦';
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.options-menu') && !event.target.closest('button')) {
        setOptionsVisible(null);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  // useEffect(() => {
  //   const handleClickOutside = (event) => {
  //     if (!event.target.className('.transaction-card')) {
  //       setEditTransaction(null);
  //       setNewTransaction(false);
  //     }
  //   };

  //   document.addEventListener('click', handleClickOutside);
  //   return () => {
  //     document.removeEventListener('click', handleClickOutside);
  //   };
  // }, []);


  const mappingFunction = (tx) => {
    const isIncome = tx.type === "income";
    const formattedDate = new Date(tx.date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });

    return (
      <div
        key={tx._id}
        className="grid grid-cols-4 items-center bg-white hover:bg-gray-50 shadow-sm border border-gray-200 p-4 transition-all duration-200"
      >
        {/* Type */}
        <div>
          <span
            className={`text-xs font-semibold px-3 py-1 rounded-full 
            ${isIncome ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
          >
            {isIncome ? 'Income' : 'Expense'}
          </span>
        </div>

        {/* Icon + Details */}
        <div className="flex items-center space-x-3">
          <div className="text-2xl text-gray-600">
            {getCategoryIcon(tx.category)}
          </div>
          <div>
            <div className="font-semibold text-gray-800">{tx.category}</div>
            {tx.description && (
              <div className="text-sm text-gray-500">{tx.description}</div>
            )}
          </div>
        </div>

        {/* Date */}
        <div className="text-sm text-gray-500">{formattedDate}</div>

        {/* Amount + Options */}
        <div className="flex items-center justify-between">
          <div className={`font-semibold ${isIncome ? 'text-green-600' : 'text-red-600'}`}>
            {isIncome ? '+' : '-'} ₹{tx.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>

          {/* Options Button */}
          <div className="relative">
            <button
              className="text-xl text-gray-400 hover:text-gray-600"
              onClick={() => setOptionsVisible(optionsVisible === tx._id ? null : tx._id)}
            >
              ⋯
            </button>

            {optionsVisible === tx._id && (
              <div className="absolute right-0 mt-2 w-28 bg-white border border-gray-200 rounded shadow-md z-10">
                <button
                  onClick={() => handleEdit(tx)}
                  className="block w-full px-4 py-2 text-left hover:bg-gray-100 text-sm"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(tx._id)}
                  className="block w-full px-4 py-2 text-left hover:bg-gray-100 text-sm text-red-600"
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };
  
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
      const formattedReport = {
        summary: res.data.report.split('||')[0].trim(),
        advice: res.data.report.split('||')[1].trim()
      };
      setReport(formattedReport);
      setShowModal(true);
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
    fetchTransactions({ type: filterType, category: filterCategory, startDate, endDate });
  }, [filterType, filterCategory, startDate, endDate]);

  useEffect(() => {
    setFilterCategory("");
  }, [filterType]);

  useEffect(() => {
    fetchTransactions();
  }, []);

  return (
    <div className="App text-Arial font-semibold"> 
     
      <div className="main bg-gray-100">

        <div className="header flex justify-between bg-gray-75 py-4 px-30 mb-10 shadow-sm">
          <div>
            <h1 className="text-2xl"> FrugalFlow </h1>
          </div>
          <button 
            className="text-white text-1xl bg-purple-500 px-4 py-3 border-0 rounded-md hover:bg-white hover:text-purple-500 transition duration-200 cursor-pointer hover:border-2 hover:border-purple-500"
            onClick={handleLogout}
            >Logout
          </button>
        </div>

        <div className="px-30">
          {transactions.length > 0 && (
            <div className="summary-card flex justify-between gap-6">
              
              {/* Income Card */}
              <div className="flex flex-col bg-white p-6 mb-6 shadow-md border-radius-2 rounded-md w-1/3 relative">
                <p className="text-sm text-gray-600 mb-4">Total Income</p>
                <p className="text-green-600 text-2xl font-semibold">₹{income.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
                <span className="absolute top-6 right-6 bg-green-100 text-green-700 text-xm font-bold px-3 py-1 rounded-full">+</span>
              </div>

              {/* Expense Card */}
              <div className="flex flex-col bg-white p-6 mb-6 shadow-md border-radius-2 rounded-md w-1/3 relative">
                <p className="text-sm text-gray-600 mb-4">Total Expenses</p>
                <p className="text-red-600 text-2xl font-semibold">₹{expense.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
                <span className="absolute top-6 right-6 bg-red-100 text-red-700 text-xm font-bold px-3 py-1 rounded-full">-</span>
              </div>

              {/* Balance Card */}
              <div className="flex flex-col bg-purple-500 text-white p-6 mb-6 shadow-md border-radius-2 rounded-md w-1/3 relative">
                <p className="text-sm mb-4">Balance</p>
                <p className="text-2xl font-semibold">₹{(income - expense).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
                <span className="absolute top-6 right-6 text-white">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a4 4 0 00-8 0v2H5v12h14V9h-2zM9 9V7a2 2 0 114 0v2H9z" />
                  </svg>
                </span>
              </div>

            </div>
          )}
        </div>
        

        <div className="flex justify-between bg-white shadow-md border-radius-2 border border-gray-200 rounded-md px-6 py-4 mb-6 mx-30">
          <div className="flex flex-col">
            <p> Monthly AI Report </p>
            <p className="text-sm text-gray-600"> Get a summary of your current month's finances and personalized advice. </p>
          </div>
          <div>
            <button className="text-white text-1xl bg-purple-500 px-4 py-2 border-0 rounded-md hover:bg-white hover:text-purple-500 transition duration-200 cursor-pointer hover:border-2 hover:border-purple-500" onClick={generateReport}> 
              <i className="ri-robot-line"></i> Generate Report 
            </button>
          </div>
        </div>

        {loadingReport && (
          <p className="text-sm text-gray-500 mt-2 mx-30">Generating your report...</p>
        )}

        {showModal && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center backdrop-blur-sm">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg p-6 relative animate-fadeIn">
              {/* Close Button */}
              <button
                className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-lg"
                onClick={() => setShowModal(false)}
              >
                ✕
              </button>

              {/* Header */}
              <div className="flex items-center gap-2 mb-4">
                <i className="ri-robot-line text-purple-600 text-xl"></i>
                <h1 className="text-lg font-semibold text-gray-800">AI Financial Report</h1>
              </div>
              <p className="text-sm text-gray-500 mb-4">
                Summary and advice for the current month based on your transactions.
              </p>

              {/* Summary */}
              <h2 className="text-md font-semibold text-gray-800 mb-2">Summary</h2>
              <p className="text-gray-600 text-sm mb-4">{report.summary}</p>

              {/* Advice */}
              <h2 className="text-md font-semibold text-gray-800 mb-2">Advice</h2>
              <p className="text-gray-600 text-sm whitespace-pre-line">{report.advice}</p>
            </div>
          </div>
        )}


        
        <div className="flex justify-between mx-30 my-6">
          <div> 
            <h2 className="text-xl font-semibold text-gray-800"> Transactions </h2>
          </div>
          <div>
            <button className="text-white text-md bg-purple-500 px-4 py-2 border-0 rounded-md hover:bg-white hover:text-purple-500 transition duration-200 cursor-pointer hover:border-2 hover:border-purple-500"
              id="show-transaction-card" 
              onClick={() => setNewTransaction(true)}
            >
              New Transaction
            </button>
          </div>
        </div>

        <div className="flex justify-between items-end gap-8 bg-white shadow-sm border border-gray-200 rounded-md px-6 py-4 mb-6 mx-30">
          {/* Type Filter */}
          <div className="flex flex-col flex-1">
            <label className="text-sm font-medium text-gray-700 mb-2">Type</label>
            <select
              name="type"
              id="type"
              value={filterType || ""}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-gray-100 text-gray-700 text-sm rounded-md px-3 py-2 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 hover:cursor-pointer"
            >
              <option value="">All Types</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
          </div>

          {/* Category Filter */}
          <div className="flex flex-col flex-1">
            <label className="text-sm font-medium text-gray-700 mb-2">Category</label>
            <select
              name="category"
              id="category"
              value={filterCategory || ""}
              onChange={(e) => setFilterCategory(e.target.value)}
              disabled={!filterType}
              className="bg-gray-100 text-gray-700 text-sm rounded-md px-3 py-2 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 disabled:opacity-60 disabled:cursor-not-allowed hover:cursor-pointer"
            >
              <option value="">All Categories</option>
              {filterType === "income"
                ? incomeCategories.map(optionMapping)
                : expenseCategories.map(optionMapping)}
            </select>
          </div>

          {/* Date Range */}
          <div className="flex flex-col flex-1">
            <label className="text-sm font-medium text-gray-700 mb-2">Date Range</label>
            <div className="flex items-center bg-gray-100 border border-gray-200 rounded-md px-3 py-2 focus-within:ring-2 focus-within:ring-purple-400 focus-within:border-purple-400 hover:cursor-pointer gap-2">
              <i className="ri-calendar-line text-gray-500 mr-2"></i>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-gray-100 text-sm text-gray-700 w-full focus:outline-none hover:cursor-pointer"
              />

              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-gray-100 text-sm text-gray-700 w-full focus:outline-none hover:cursor-pointer"
              />
            </div>
          </div>
          {(filterType || filterCategory || startDate || endDate) && (
              <button className="text-white text-1xl bg-purple-500 px-4 py-3 border-0 rounded-md hover:bg-white hover:text-purple-500 transition duration-200 cursor-pointer hover:border-2 hover:border-purple-500" 
                onClick={() => {
                setFilterType("");
                setFilterCategory("");
                setStartDate("");
                setEndDate("");
              }}>
                Clear Filters
              </button>
            )}
        </div>

        <div className="bg-gray-50 rounded-lg shadow-sm border border-gray-200 mx-30">
          {/* Headers */}
          <div className="grid grid-cols-4 text-sm font-semibold text-gray-500 border-b border-gray-200 py-6 px-6">
            <div>Type</div>
            <div>Details</div>
            <div>Date</div>
            <div>Amount</div>
          </div>

          {/* Transaction Rows */}
          <div>
            {transactions.map((tx) => mappingFunction(tx))}
          </div>
        </div>

      </div>

      {newtransaction && (
        <Transaction className="transaction-card"
          onClose={() => {
            // Small delay to allow slide-out animation
            setTimeout(() => {
              setNewTransaction(false);
              setEditTransaction(null);
            }, 300);
          }}
          onSuccess={fetchTransactions}
          existingData={editTransaction}
        />
      )}


    </div>
  );
}
export default App;

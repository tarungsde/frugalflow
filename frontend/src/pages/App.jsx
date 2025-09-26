import React, { useState, useRef } from "react";
import AppPage from "./AppPage";
import Transaction from "./Transaction";

function App() {

  const [newtransaction, setNewTransaction] = useState(false);
  const appPageRef = useRef();

  const handleNewTransaction = (state) => {
    setNewTransaction(state);
  }

  const refreshTransactions = () => {
    if (appPageRef.current) {
      appPageRef.current.refreshTransactions();
    }
  };

  return (
    <div id="container"> 
     
      <AppPage ref={appPageRef}/> 

      <button 
        id="show-transaction-card" 
        onClick={() => handleNewTransaction(true)}
      >
        New Transaction
      </button>

      {newtransaction && ( <Transaction onClose={() => handleNewTransaction(false)}
                                        onSuccess={refreshTransactions} /> )}

    </div>
  );
}
export default App;

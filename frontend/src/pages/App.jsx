import React, { useState } from "react";
import AppPage from "./AppPage";
import Transaction from "./Transaction";

function App() {

  const [newtransaction, setNewTransaction] = useState(false);

  const handleNewTransaction = (state) => {
    setNewTransaction(state);
  }

  return (
    <div id="container"> 
     
      <AppPage /> 

      <button 
        id="show-transaction-card" 
        onClick={() => handleNewTransaction(true)}
      >
        New Transaction
      </button>

      {newtransaction && ( <Transaction handleNewTransaction={() => handleNewTransaction(false)} /> )}

    </div>
  );
}
export default App;

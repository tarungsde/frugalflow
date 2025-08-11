import React, { useState } from 'react';
import axios from '../axios';
import { useNavigate } from 'react-router-dom';

function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  async function handleRegister(e) {
    e.preventDefault();
    try {
      const res = await axios.post("/register", { email, password });
      navigate("/");
    } catch (err) {
      alert(err.response?.data?.message || 'Registration failed');
    }
  };

  function navigateToLogin() {
    navigate("/login");
  }

  return (
    <form onSubmit={handleRegister}>
      <input type="text" placeholder="email" value={email}
        onChange={(e) => setEmail(e.target.value)} />
      <input type="password" placeholder="Password" value={password}
        onChange={(e) => setPassword(e.target.value)} />
      <button type="submit">Register</button>
      <p>Already have an account? <button type="button" onClick={navigateToLogin}>Login!</button></p>
    </form>
  );
}

export default Register;

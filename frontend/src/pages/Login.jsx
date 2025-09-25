import React, { useState } from 'react';
import axios from '../axios';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  async function handleLogin(e) {
    e.preventDefault();
    try {
      const res = await axios.post('/login', { email, password });
      navigate("/"); 
    } catch (err) {
      alert(err.response?.data?.message || 'Login failed');
    }
  };

  function handleGoogleLogin() {
    window.location.href = 'http://localhost:3000/auth/google';
  };

  return (
    <form onSubmit={handleLogin}>
      <input type="text" placeholder="Email" value={email}
        onChange={(e) => setEmail(e.target.value)} />
      <input type="password" placeholder="Password" value={password}
        onChange={(e) => setPassword(e.target.value)} />
      <button type="submit">Login</button>
      <button type="button" onClick={handleGoogleLogin}>Login with Google</button>
      <p>First time here? <button type="button" onClick={(e) => navigate("/register")}>Register!</button> </p>
    </form>
  );
}

export default Login;

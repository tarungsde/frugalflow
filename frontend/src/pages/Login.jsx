import React, { useState } from 'react';
import axios from '../axios';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/login', { username, password });
      alert('Login successful!');
      navigate('/app'); // or your dashboard route
    } catch (err) {
      alert(err.response?.data?.message || 'Login failed');
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:3000/auth/google';
  };

  return (
    <form onSubmit={handleLogin}>
      <input type="text" placeholder="Username" value={username}
        onChange={(e) => setUsername(e.target.value)} />
      <input type="password" placeholder="Password" value={password}
        onChange={(e) => setPassword(e.target.value)} />
      <button type="submit">Login</button>
      <button type="button" onClick={handleGoogleLogin}>Login with Google</button>
    </form>
  );
}

export default Login;

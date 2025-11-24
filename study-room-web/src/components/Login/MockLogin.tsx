import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./mocklogin.css";
import BCRFLogo from "../../assets/logo.png";

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleLogin = () => {
    if (!email.endsWith("@ohio.edu")) {
      return setError("You must use an @ohio.edu email.");
    }

    const storedUsers = JSON.parse(localStorage.getItem("users") || "[]");

    const user = storedUsers.find((u: any) => u.email === email);

    if (!user) {
      return setError("Account does not exist. Please create an account.");
    }

    if (user.password !== password) {
      return setError("Incorrect password.");
    }

    localStorage.setItem("mock_user_session", JSON.stringify({ email }));

    navigate("/");
  };

  return (
    <div className="login-container">
      <div className="logo">
            <img src={BCRFLogo} alt="Bobcat Room Finder" />
        </div>

      <h1>Email</h1>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <h2>Password</h2>
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <div className="forgotpass">
            <button>Reset Password</button>
      </div>

      {error && <p className="error">{error}</p>}

      <button onClick={handleLogin}>Login</button>

      <div className="create-account">
            <button onClick={() => navigate("/create-account")}>
              Create an Account
            </button>
      </div>
      
    </div>
  );
};

export default Login;

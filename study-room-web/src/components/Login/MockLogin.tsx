import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./mocklogin.css";
import BCRFLogo from "../../assets/logo.png";
import { authAPI } from "../../utils/api";

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async () => {
    setError("");

    if (!email.endsWith("@ohio.edu")) {
      return setError("You must use an @ohio.edu email.");
    }

    setLoading(true);
    try {
      await authAPI.signin(email, password);
      navigate("/");
    } catch (err: any) {
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
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

      <button onClick={handleLogin} disabled={loading}>
        {loading ? "Logging in..." : "Login"}
      </button>

      <div className="create-account">
        <button onClick={() => navigate("/create-account")}>
          Create an Account
        </button>
      </div>
    </div>
  );
};

export default Login;

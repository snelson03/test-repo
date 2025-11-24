import React, { useState } from "react";
import BCRFLogo from "../../assets/logo.png";
import "./createaccount.css";


const CreateAccount: React.FC = () => {
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");

  const handleCreateAccount = () => {

    if (firstName.trim().length === 0) {
      return setError("First name is required.");
    }

    if (!email.endsWith("@ohio.edu")) {
      return setError("You must use an @ohio.edu email.");
    }
    if (password !== confirmPassword) {
      return setError("Passwords do not match.");
    }

    const cleanedPhone = phone.replace(/\D/g, "");
    if (cleanedPhone.length !== 10) {
      return setError("Please enter a valid 10-digit phone number.");
    }

    const storedUsers = JSON.parse(localStorage.getItem("users") || "[]");

    if (storedUsers.find((u: any) => u.email === email)) {
      return setError("Account with this email already exists.");
    }

    storedUsers.push({ firstName, email, password, phone: cleanedPhone, favorites: [], preferences: {} });
    localStorage.setItem("users", JSON.stringify(storedUsers));

    localStorage.setItem("mock_user_session", JSON.stringify({ email }));
    window.location.href = "/";
  };

  return (
    <div className="login-container2">
      <div className="logo">
        <img src={BCRFLogo} alt="Bobcat Room Finder" />
      </div>

      <h1>Create Account</h1>
      <div className="form-box">

        <h2>First Name</h2>
        <input
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
        />

        <h3>Email</h3>
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} />

        <h4>Password</h4>
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} />

        <h5>Re-enter Password</h5>
        <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />

        <h6>Phone Number</h6>
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="123-456-7890"
        />
      </div>

        {error && <p className="error2">{error}</p>}
        <div className="create">
        <button onClick={handleCreateAccount}>Create</button>

    </div>
    </div>
  );
};

export default CreateAccount;

import { useState } from "react";
import "./Register.css";

function Register() {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();

        const form = e.currentTarget;

        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        if (password !== confirmPassword) {
            alert("Passwords do not match.");
            return;
        }

        console.log("Registration form submitted");
    };

    return (
        <div className="register-page">

            <div className="register-card">

                {/* Header */}
                <div className="register-header">

                    <div className="logo-circle">
                        🎬
                    </div>

                    <h1>Create Account</h1>

                    <p>
                        Register to book your movie tickets
                    </p>

                </div>


                {/* Registration Form */}
                <form onSubmit={handleSubmit}>

                    {/* Full Name */}
                    <div className="form-group">

                        <label htmlFor="name">
                            Full Name
                        </label>

                        <input
                            id="name"
                            name="name"
                            type="text"
                            placeholder="Enter your full name"
                            required
                            minLength={2}
                            maxLength={100}
                            autoComplete="name"
                        />

                    </div>


                    {/* Email */}
                    <div className="form-group">

                        <label htmlFor="email">
                            Email Address
                        </label>

                        <input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="Enter your email"
                            required
                            maxLength={100}
                            autoComplete="email"
                        />

                    </div>


                    {/* Phone */}
                    <div className="form-group">

                        <label htmlFor="phone">
                            Phone Number
                        </label>

                        <input
                            id="phone"
                            name="phone"
                            type="tel"
                            placeholder="Enter your phone number"
                            required
                            pattern="[0-9]{10}"
                            maxLength={10}
                            title="Enter a valid 10-digit phone number"
                            autoComplete="tel"
                        />

                        <small className="field-hint">
                            Enter a 10-digit phone number.
                        </small>

                    </div>


                    {/* Password */}
                    <div className="form-group">

                        <label htmlFor="password">
                            Password
                        </label>

                        <div className="password-wrapper">

                            <input
                                id="password"
                                name="password"
                                type={
                                    showPassword
                                        ? "text"
                                        : "password"
                                }
                                placeholder="Create a password"
                                minLength={8}
                                maxLength={100}
                                required
                                value={password}
                                onChange={(e) =>
                                    setPassword(e.target.value)
                                }
                                autoComplete="new-password"
                            />

                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() =>
                                    setShowPassword(
                                        !showPassword
                                    )
                                }
                            >
                                {showPassword ? "Hide" : "Show"}
                            </button>

                        </div>

                        <small className="field-hint">
                            Password must be at least 8 characters.
                        </small>

                    </div>


                    {/* Confirm Password */}
                    <div className="form-group">

                        <label htmlFor="confirmPassword">
                            Confirm Password
                        </label>

                        <div className="password-wrapper">

                            <input
                                id="confirmPassword"
                                name="confirmPassword"
                                type={
                                    showConfirmPassword
                                        ? "text"
                                        : "password"
                                }
                                placeholder="Confirm your password"
                                minLength={8}
                                maxLength={100}
                                required
                                value={confirmPassword}
                                onChange={(e) =>
                                    setConfirmPassword(
                                        e.target.value
                                    )
                                }
                                autoComplete="new-password"
                            />

                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() =>
                                    setShowConfirmPassword(
                                        !showConfirmPassword
                                    )
                                }
                            >
                                {showConfirmPassword
                                    ? "Hide"
                                    : "Show"}
                            </button>

                        </div>

                    </div>


                    {/* Register Button */}
                    <button
                        type="submit"
                        className="register-button"
                    >
                        Create Account
                    </button>

                </form>


                {/* Login Link */}
                <div className="login-link">

                    <span>
                        Already have an account?
                    </span>

                    <a href="/login">
                        Login
                    </a>

                </div>

            </div>

        </div>
    );
}

export default Register;
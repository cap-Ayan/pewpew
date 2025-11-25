import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { UserPlus } from "lucide-react";

function Register() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${import.meta.env.VITE_API_URL || "http://localhost:8000/api"}/auth/register`, {
                username,
                password,
            });
            navigate("/login");
        } catch (err) {
            setError(err.response?.data || "Something went wrong");
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-bg-dark p-4">
            <div className="w-full max-w-md bg-bg-card p-8 rounded-2xl shadow-xl border border-border">
                <div className="flex flex-col items-center mb-8">
                    <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-primary/30">
                        <UserPlus className="text-white w-6 h-6" />
                    </div>
                    <h2 className="text-2xl font-bold text-white">Create Account</h2>
                    <p className="text-text-muted mt-2">Join the conversation today</p>
                </div>

                {error && <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-sm p-3 rounded-lg mb-6 text-center">{error}</div>}

                <form onSubmit={handleRegister} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-text-muted mb-1.5">Username</label>
                        <input
                            type="text"
                            className="w-full bg-bg-dark border border-border rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            placeholder="Choose a username"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-text-muted mb-1.5">Password</label>
                        <input
                            type="password"
                            className="w-full bg-bg-dark border border-border rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            placeholder="Choose a password"
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-primary text-white font-semibold py-2.5 rounded-lg hover:bg-primary-hover transition-colors shadow-lg shadow-primary/20 mt-2"
                    >
                        Create Account
                    </button>
                </form>

                <div className="mt-6 text-center text-sm text-text-muted">
                    Already have an account? <Link to="/login" className="text-primary hover:text-primary-hover font-medium ml-1">Sign in</Link>
                </div>
            </div>
        </div>
    );
}

export default Register;

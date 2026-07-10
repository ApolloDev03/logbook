import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

import logo from "../assets/images/logo/logo-new-dark.png";
import { apiUrl } from "../config";

export default function ForgotPassword() {
  const [darkMode, setDarkMode] = useState(false);

  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const savedMode = JSON.parse(localStorage.getItem("darkMode") || "false");
    setDarkMode(savedMode);
  }, []);

  useEffect(() => {
    localStorage.setItem("darkMode", JSON.stringify(darkMode));

    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      setError("Please enter email.");
      setSuccessMessage("");
      toast.error("Please enter email.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccessMessage("");

      const response = await axios.post(`${apiUrl}/auth/forgotPassword`, {
        email: email.trim(),
      });

      if (response?.data?.success) {
        const msg =
          response?.data?.message ||
          "Password reset link has been sent to your email address.";

        setSuccessMessage(msg);
        toast.success(msg);
        setEmail("");
      } else {
        const msg =
          response?.data?.message || "Failed to send password reset link.";

        setError(msg);
        toast.error(msg);
      }
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Failed to send password reset link.";

      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative z-10 bg-white p-6 dark:bg-gray-900 sm:p-0">
      <div className="relative flex h-screen w-full flex-col justify-center dark:bg-gray-900 sm:p-0 lg:flex-row">
        {/* Left Form */}
        <div className="flex w-full flex-1 flex-col lg:w-1/2">
          <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center">
            <div>
              {/* Mobile Logo - only visible below desktop */}
              <div className="mb-8 flex justify-center lg:hidden">
                <a href="/" className="inline-block">
                  <img
                    src={logo}
                    alt="Attentive Fire"
                    className="h-auto max-w-[120px]"
                  />
                </a>
              </div>
              <div className="mb-5 sm:mb-8">
                <h1 className="mb-2 text-[37px] font-semibold leading-tight text-gray-800 dark:text-white/90">
                  Forgot Password
                </h1>

                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Enter your email address and we will send you a password reset
                  link.
                </p>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="space-y-5">
                  {error && (
                    <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400">
                      {error}
                    </div>
                  )}

                  {successMessage && (
                    <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 dark:border-green-500/20 dark:bg-green-500/10 dark:text-green-400">
                      {successMessage}
                    </div>
                  )}

                  {/* Email */}
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                      Email<span className="text-red-500">*</span>
                    </label>

                    <input
                      type="email"
                      name="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setError("");
                        setSuccessMessage("");
                      }}
                      placeholder="Enter email"
                      className="h-11 w-full rounded-lg border border-gray-300 bg-[#e8f3ff] px-4 py-2.5 text-sm text-gray-800 shadow-sm placeholder:text-gray-400 focus:border-blue-300 focus:outline-none focus:ring-4 focus:ring-blue-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
                    />
                  </div>

                  {/* Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex w-full items-center justify-center rounded-lg btn-primary px-4 py-3 text-sm font-medium text-white shadow-sm transition disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {loading ? "Sending..." : "Submit"}
                  </button>

                  <div className="text-center">
                    <Link
                      to="/signin"
                      className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400"
                    >
                      Back to Sign In
                    </Link>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Right Side */}
        <div className="relative hidden h-full w-full items-center bg-white shadow-[0px_4px_20px_0px_#00000030] dark:bg-white/5 lg:grid lg:w-1/2">
          <GridShape />

          <div className="relative z-10 flex items-center justify-center">
            <div className="flex max-w-xs flex-col items-center">
              <a href="/" className="mb-4 block">
                <img src={logo} alt="Logo" className="h-auto max-w-[250px]" />
              </a>

              <p className="text-center text-gray-400 dark:text-white/60">
                Welcome to the Attentive Fire Digital Log Book. Your
                comprehensive solution for managing and documenting fire safety
                inspections, maintenance.
              </p>
            </div>
          </div>
        </div>

        {/* Dark Mode Toggle */}
        <div className="fixed bottom-6 right-6 z-50 hidden sm:block">
          <button
            type="button"
            onClick={() => setDarkMode(!darkMode)}
            className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white transition-colors hover:bg-blue-700"
          >
            {darkMode ? "☀️" : "🌙"}
          </button>
        </div>
      </div>
    </div>
  );
}

function GridShape() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute right-0 top-0 grid grid-cols-9 grid-rows-5 opacity-40">
        {Array.from({ length: 45 }).map((_, index) => (
          <div
            key={`top-${index}`}
            className="h-[52px] w-[52px] border border-white/5"
          />
        ))}
      </div>

      <div className="absolute bottom-0 left-0 grid grid-cols-8 grid-rows-5 opacity-40">
        {Array.from({ length: 40 }).map((_, index) => (
          <div
            key={`bottom-${index}`}
            className="h-[52px] w-[52px] border border-white/5"
          />
        ))}
      </div>

      <div className="absolute right-[90px] top-[45px] h-[52px] w-[52px] bg-white/5" />
      <div className="absolute right-[142px] top-[98px] h-[52px] w-[52px] bg-white/5" />

      <div className="absolute bottom-[72px] left-[90px] h-[52px] w-[52px] bg-white/5" />
      <div className="absolute bottom-[125px] left-[142px] h-[52px] w-[52px] bg-white/5" />
    </div>
  );
}
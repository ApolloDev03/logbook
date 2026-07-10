// import { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import axios from "axios";
// import { toast } from "react-toastify";

// import logo from "../assets/images/logo/logo.svg";
// import { FiEye, FiEyeOff } from "react-icons/fi";
// import { useApp } from "../context/AppContext";
// import { apiUrl } from "../config";

// export default function SignIn() {
//   const navigate = useNavigate();
//   const { login } = useApp();

//   const [showPassword, setShowPassword] = useState(false);
//   const [remember, setRemember] = useState(false);
//   const [darkMode, setDarkMode] = useState(false);

//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");

//   const [error, setError] = useState("");
//   const [loading, setLoading] = useState(false);

//   useEffect(() => {
//     const savedMode = JSON.parse(localStorage.getItem("darkMode") || "false");
//     setDarkMode(savedMode);
//   }, []);

//   useEffect(() => {
//     localStorage.setItem("darkMode", JSON.stringify(darkMode));

//     if (darkMode) {
//       document.documentElement.classList.add("dark");
//     } else {
//       document.documentElement.classList.remove("dark");
//     }
//   }, [darkMode]);

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (!email.trim()) {
//       setError("Please enter email.");
//       toast.error("Please enter email.");
//       return;
//     }

//     if (!password.trim()) {
//       setError("Please enter password.");
//       toast.error("Please enter password.");
//       return;
//     }

//     try {
//       setLoading(true);
//       setError("");

//       const response = await axios.post(`${apiUrl}/auth/Adminlogin`, {
//         email,
//         password,
//       });

//       const token = response?.data?.token;
//       const userData = response?.data?.data;

//       if (!token || !userData) {
//         const msg = response?.data?.message || "Invalid API response.";
//         setError(msg);
//         toast.error(msg);
//         return;
//       }

//       localStorage.setItem("auth_token", token);
//       localStorage.setItem("auth_user", JSON.stringify(userData));

//       login(userData, token);

//       const roleId = String(userData?.role_id || "")
//         .trim()
//         .toLowerCase();

//       let redirectPath = "/dashboard";

//       if (roleId === "1") {
//         redirectPath = "/dashboard";
//       } else if (roleId === "3") {
//         redirectPath = "/customer-dashboard";
//       } else {
//         redirectPath = "/engineer-scan";
//       }

//       toast.success(response?.data?.message || "Login successfully.");

//       navigate(redirectPath, { replace: true });
//     } catch (err) {
//       const msg =
//         err?.response?.data?.message ||
//         err?.response?.data?.error ||
//         "Invalid email or password.";

//       setError(msg);
//       toast.error(msg);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="relative z-10 bg-white p-6 dark:bg-gray-900 sm:p-0">
//       <div className="relative flex h-screen w-full flex-col justify-center dark:bg-gray-900 sm:p-0 lg:flex-row">
//         {/* Left Form */}
//         <div className="flex w-full flex-1 flex-col lg:w-1/2">
//           <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center">
//             <div>
//               <div className="mb-5 sm:mb-8">
//                 <h1 className="mb-2 text-[37px] font-semibold leading-tight text-gray-800 dark:text-white/90">
//                   Sign In
//                 </h1>

//                 <p className="text-sm text-gray-500 dark:text-gray-400">
//                   Enter your email and password to sign in!
//                 </p>
//               </div>

//               <form onSubmit={handleSubmit}>
//                 <div className="space-y-5">
//                   {error && (
//                     <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400">
//                       {error}
//                     </div>
//                   )}

//                   {/* Email */}
//                   <div>
//                     <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
//                       Email<span className="text-red-500">*</span>
//                     </label>

//                     <input
//                       type="email"
//                       name="email"
//                       value={email}
//                       onChange={(e) => {
//                         setEmail(e.target.value);
//                         setError("");
//                       }}
//                       placeholder="Enter email"
//                       className="h-11 w-full rounded-lg border border-gray-300 bg-[#e8f3ff] px-4 py-2.5 text-sm text-gray-800 shadow-sm placeholder:text-gray-400 focus:border-blue-300 focus:outline-none focus:ring-4 focus:ring-blue-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
//                     />
//                   </div>

//                   {/* Password */}
//                   <div>
//                     <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
//                       Password<span className="text-red-500">*</span>
//                     </label>

//                     <div className="relative">
//                       <input
//                         type={showPassword ? "text" : "password"}
//                         value={password}
//                         onChange={(e) => {
//                           setPassword(e.target.value);
//                           setError("");
//                         }}
//                         placeholder="Enter your password"
//                         className="h-11 w-full rounded-lg border border-gray-300 bg-[#e8f3ff] py-2.5 pl-4 pr-11 text-sm text-gray-800 shadow-sm placeholder:text-gray-400 focus:border-blue-300 focus:outline-none focus:ring-4 focus:ring-blue-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
//                       />

//                       <button
//                         type="button"
//                         onClick={() => setShowPassword(!showPassword)}
//                         className="absolute right-4 top-1/2 z-30 -translate-y-1/2 cursor-pointer text-gray-400"
//                       >
//                         {showPassword ? (
//                           <FiEyeOff size={20} />
//                         ) : (
//                           <FiEye size={20} />
//                         )}
//                       </button>
//                     </div>
//                   </div>

//                   {/* Remember + Forgot */}
//                   <div className="flex items-center justify-between">
//                     <label className="flex cursor-pointer select-none items-center text-sm font-normal text-gray-700 dark:text-gray-400">
//                       <span className="relative mr-3 flex">
//                         <input
//                           type="checkbox"
//                           checked={remember}
//                           onChange={() => setRemember(!remember)}
//                           className="sr-only"
//                         />

//                         <span
//                           className={`flex h-5 w-5 items-center justify-center rounded-md border-[1.25px] ${
//                             remember
//                               ? "border-blue-500 bg-blue-500"
//                               : "border-gray-300 bg-transparent dark:border-gray-700"
//                           }`}
//                         >
//                           <svg
//                             className={remember ? "block" : "hidden"}
//                             width="14"
//                             height="14"
//                             viewBox="0 0 14 14"
//                             fill="none"
//                             xmlns="http://www.w3.org/2000/svg"
//                           >
//                             <path
//                               d="M11.6666 3.5L5.24992 9.91667L2.33325 7"
//                               stroke="white"
//                               strokeWidth="1.94437"
//                               strokeLinecap="round"
//                               strokeLinejoin="round"
//                             />
//                           </svg>
//                         </span>
//                       </span>
//                       Keep me logged in
//                     </label>

//                     <a
//                       href="/reset-password.html"
//                       className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
//                     >
//                       Forgot password?
//                     </a>
//                   </div>

//                   {/* Button */}
//                   <button
//                     type="submit"
//                     disabled={loading}
//                     className="flex w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
//                   >
//                     {loading ? "Signing In..." : "Sign In"}
//                   </button>
//                 </div>
//               </form>
//             </div>
//           </div>
//         </div>

//         {/* Right Side */}
//         <div className="relative hidden h-full w-full items-center bg-[#161950] dark:bg-white/5 lg:grid lg:w-1/2">
//           <GridShape />

//           <div className="relative z-10 flex items-center justify-center">
//             <div className="flex max-w-xs flex-col items-center">
//               <a href="/" className="mb-4 block">
//                 <img src={logo} alt="Logo" className="h-auto max-w-[320px]" />
//               </a>

//               <p className="text-center text-gray-400 dark:text-white/60">
//                 Welcome to the Fire System Digital Log Book. Your comprehensive
//                 solution for managing and documenting fire safety inspections,
//                 maintenance.
//               </p>
//             </div>
//           </div>
//         </div>

//         {/* Dark Mode Toggle */}
//         <div className="fixed bottom-6 right-6 z-50 hidden sm:block">
//           <button
//             type="button"
//             onClick={() => setDarkMode(!darkMode)}
//             className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white transition-colors hover:bg-blue-700"
//           >
//             {darkMode ? "☀️" : "🌙"}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

// function GridShape() {
//   return (
//     <div className="pointer-events-none absolute inset-0 overflow-hidden">
//       <div className="absolute right-0 top-0 grid grid-cols-9 grid-rows-5 opacity-40">
//         {Array.from({ length: 45 }).map((_, index) => (
//           <div
//             key={`top-${index}`}
//             className="h-[52px] w-[52px] border border-white/5"
//           />
//         ))}
//       </div>

//       <div className="absolute bottom-0 left-0 grid grid-cols-8 grid-rows-5 opacity-40">
//         {Array.from({ length: 40 }).map((_, index) => (
//           <div
//             key={`bottom-${index}`}
//             className="h-[52px] w-[52px] border border-white/5"
//           />
//         ))}
//       </div>

//       <div className="absolute right-[90px] top-[45px] h-[52px] w-[52px] bg-white/5" />
//       <div className="absolute right-[142px] top-[98px] h-[52px] w-[52px] bg-white/5" />

//       <div className="absolute bottom-[72px] left-[90px] h-[52px] w-[52px] bg-white/5" />
//       <div className="absolute bottom-[125px] left-[142px] h-[52px] w-[52px] bg-white/5" />
//     </div>
//   );
// }

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

import logo from "../assets/images/logo/logo-new-dark.png";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { useApp } from "../context/AppContext";
import { apiUrl } from "../config";

export default function SignIn() {
  const navigate = useNavigate();
  const { login } = useApp();

  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
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
      toast.error("Please enter email.");
      return;
    }

    if (!password.trim()) {
      setError("Please enter password.");
      toast.error("Please enter password.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await axios.post(`${apiUrl}/auth/Adminlogin`, {
        email,
        password,
      });

      const token = response?.data?.token;
      const userData = response?.data?.data;

      if (!token || !userData) {
        const msg = response?.data?.message || "Invalid API response.";
        setError(msg);
        toast.error(msg);
        return;
      }

      const finalUserData = {
        ...userData,
        token,
        permissions: Array.isArray(userData?.permissions)
          ? userData.permissions
          : [],
      };

      localStorage.setItem("auth_token", token);
      localStorage.setItem("auth_user", JSON.stringify(finalUserData));
      localStorage.setItem(
        "auth_permissions",
        JSON.stringify(finalUserData.permissions),
      );
      localStorage.setItem(
        "auth_role_id",
        String(finalUserData?.role_id || ""),
      );
      localStorage.setItem("auth_role_name", finalUserData?.role_name || "");

      login(finalUserData, token);

      const roleId = Number(finalUserData?.role_id);
      const qrAccess = finalUserData?.qrcodeaccess;

      let redirectPath = "/engineer-dashboard";

      if (roleId === 1) {
        redirectPath = "/dashboard";
      } else if (roleId === 3) {
        redirectPath = "/customer-dashboard";
      } else {
        redirectPath =
          qrAccess === 1 ? "/engineer-scan" : "/engineer-dashboard";
      }

      toast.success(response?.data?.message || "Login successfully.");

      navigate(redirectPath, { replace: true });
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Invalid email or password.";

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
                  Sign In
                </h1>

                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Enter your email and password to sign in!
                </p>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="space-y-5">
                  {error && (
                    <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400">
                      {error}
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
                      }}
                      placeholder="Enter email"
                      className="h-11 w-full rounded-lg border border-gray-300 bg-[#e8f3ff] px-4 py-2.5 text-sm text-gray-800 shadow-sm placeholder:text-gray-400 focus:border-blue-300 focus:outline-none focus:ring-4 focus:ring-blue-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
                    />
                  </div>

                  {/* Password */}
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                      Password<span className="text-red-500">*</span>
                    </label>

                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          setError("");
                        }}
                        placeholder="Enter your password"
                        className="h-11 w-full rounded-lg border border-gray-300 bg-[#e8f3ff] py-2.5 pl-4 pr-11 text-sm text-gray-800 shadow-sm placeholder:text-gray-400 focus:border-blue-300 focus:outline-none focus:ring-4 focus:ring-blue-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
                      />

                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 z-30 -translate-y-1/2 cursor-pointer text-gray-400"
                      >
                        {showPassword ? (
                          <FiEyeOff size={20} />
                        ) : (
                          <FiEye size={20} />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Remember + Forgot */}
                  <div className="flex items-center justify-between">
                    <label className="flex cursor-pointer select-none items-center text-sm font-normal text-gray-700 dark:text-gray-400">
                      <span className="relative mr-3 flex">
                        <input
                          type="checkbox"
                          checked={remember}
                          onChange={() => setRemember(!remember)}
                          className="sr-only"
                        />

                        <span
                          className={`flex h-5 w-5 items-center justify-center rounded-md border-[1.25px] ${remember
                              ? "border-blue-500 bg-blue-500"
                              : "border-gray-300 bg-transparent dark:border-gray-700"
                            }`}
                        >
                          <svg
                            className={remember ? "block" : "hidden"}
                            width="14"
                            height="14"
                            viewBox="0 0 14 14"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M11.6666 3.5L5.24992 9.91667L2.33325 7"
                              stroke="white"
                              strokeWidth="1.94437"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </span>
                      </span>
                      Keep me logged in
                    </label>

                    <a
                      href="/forgot-password"
                      className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
                    >
                      Forgot password?
                    </a>
                  </div>

                  {/* Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex w-full items-center justify-center rounded-lg btn-primary px-4 py-3 text-sm font-medium text-white shadow-sm transition  disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {loading ? "Signing In..." : "Sign In"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Right Side */}
        <div className="relative hidden h-full w-full items-center bg-white shadow-[0px_4px_20px_0px_#00000030]  dark:bg-white/5  lg:grid lg:w-1/2">
          <GridShape />

          <div className="relative z-10 flex items-center justify-center">
            <div className="flex max-w-xs flex-col items-center">
              <a href="/" className="mb-4 block">
                {/* <img src={logo} alt="Logo" className="h-auto max-w-[320px]" /> */}
                <img src={logo} alt="Logo" className="h-auto max-w-[250px]" />
              </a>

              <p className="text-center text-gray-400 dark:text-white/60">
                Welcome to the Attentive Fire Digital Log Book. Your comprehensive
                solution for managing and documenting fire safety inspections,
                maintenance.
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

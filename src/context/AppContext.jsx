// import { createContext, useContext, useEffect, useState } from "react";
// import axios from "axios";
// import { toast } from "react-toastify";
// import { apiUrl } from "../config";

// const AppContext = createContext();

// const STORAGE_KEYS = {
//   user: "auth_user",
//   token: "auth_token",
// };

// export function AppProvider({ children }) {
//   const [darkMode, setDarkMode] = useState(() => {
//     try {
//       return JSON.parse(localStorage.getItem("darkMode")) || false;
//     } catch {
//       return false;
//     }
//   });

//   const [sidebarToggle, setSidebarToggle] = useState(false);

//   // Auth state
//   const [user, setUser] = useState(null);
//   const [token, setToken] = useState(null);

//   // Common location state
//   const [countries, setCountries] = useState([]);
//   const [statesByCountry, setStatesByCountry] = useState({});
//   const [citiesByState, setCitiesByState] = useState({});

//   const [countryLoading, setCountryLoading] = useState(false);
//   const [stateLoading, setStateLoading] = useState(false);
//   const [cityLoading, setCityLoading] = useState(false);

//   const getToken = () => {
//     return localStorage.getItem(STORAGE_KEYS.token) || "";
//   };

//   const getAuthHeaders = () => {
//     const authToken = getToken();

//     return {
//       Authorization: authToken,
//       token: authToken,
//       "x-access-token": authToken,
//       "Content-Type": "application/json",
//     };
//   };

//   useEffect(() => {
//     try {
//       localStorage.setItem("darkMode", JSON.stringify(darkMode));
//     } catch {}

//     if (darkMode) {
//       document.documentElement.classList.add("dark");
//     } else {
//       document.documentElement.classList.remove("dark");
//     }
//   }, [darkMode]);

//   useEffect(() => {
//     const storedUser = localStorage.getItem(STORAGE_KEYS.user);
//     const storedToken = localStorage.getItem(STORAGE_KEYS.token);

//     if (storedUser && storedToken) {
//       try {
//         setUser(JSON.parse(storedUser));
//         setToken(storedToken);
//       } catch {
//         localStorage.removeItem(STORAGE_KEYS.user);
//         localStorage.removeItem(STORAGE_KEYS.token);
//       }
//     }
//   }, []);

//   // Country API call one time when app starts
//   useEffect(() => {
//     getCountryList();
//   }, []);

//   const login = (userData, tokenValue) => {
//     localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(userData));
//     localStorage.setItem(STORAGE_KEYS.token, tokenValue);

//     setUser(userData);
//     setToken(tokenValue);
//   };

//   const logout = () => {
//     localStorage.removeItem(STORAGE_KEYS.user);
//     localStorage.removeItem(STORAGE_KEYS.token);

//     setUser(null);
//     setToken(null);

//     // Optional: clear cached location data on logout
//     setCountries([]);
//     setStatesByCountry({});
//     setCitiesByState({});
//   };

//   const getCountryList = async () => {
//     try {
//       // already loaded then no API call
//       if (countries.length > 0) {
//         return countries;
//       }

//       setCountryLoading(true);

//       const response = await axios.post(
//         `${apiUrl}/auth/countrylist`,
//         {},
//         {
//           headers: getAuthHeaders(),
//         },
//       );

//       if (response?.data?.success) {
//         const list = response?.data?.data || [];
//         setCountries(list);
//         return list;
//       } else {
//         toast.error(response?.data?.message || "Country list not found.");
//         return [];
//       }
//     } catch (error) {
//       const msg =
//         error?.response?.data?.message ||
//         error?.response?.data?.error ||
//         "Failed to load country list.";

//       toast.error(msg);
//       return [];
//     } finally {
//       setCountryLoading(false);
//     }
//   };

//   const getStateList = async (countryId) => {
//     if (!countryId) return [];

//     try {
//       const key = String(countryId);

//       // same country states already loaded then no API call
//       if (statesByCountry[key]) {
//         return statesByCountry[key];
//       }

//       setStateLoading(true);

//       const response = await axios.post(
//         `${apiUrl}/auth/statelist`,
//         {
//           countryid: key,
//         },
//         {
//           headers: getAuthHeaders(),
//         },
//       );

//       if (response?.data?.success) {
//         const list = response?.data?.data || [];

//         setStatesByCountry((prev) => ({
//           ...prev,
//           [key]: list,
//         }));

//         return list;
//       } else {
//         toast.error(response?.data?.message || "State list not found.");
//         return [];
//       }
//     } catch (error) {
//       const msg =
//         error?.response?.data?.message ||
//         error?.response?.data?.error ||
//         "Failed to load state list.";

//       toast.error(msg);
//       return [];
//     } finally {
//       setStateLoading(false);
//     }
//   };

//   const getCityList = async (stateId) => {
//     if (!stateId) return [];

//     try {
//       const key = String(stateId);

//       // same state cities already loaded then no API call
//       if (citiesByState[key]) {
//         return citiesByState[key];
//       }

//       setCityLoading(true);

//       const response = await axios.post(
//         `${apiUrl}/auth/citylist`,
//         {
//           stateid: key,
//         },
//         {
//           headers: getAuthHeaders(),
//         },
//       );

//       if (response?.data?.success) {
//         const list = response?.data?.data || [];

//         setCitiesByState((prev) => ({
//           ...prev,
//           [key]: list,
//         }));

//         return list;
//       } else {
//         toast.error(response?.data?.message || "City list not found.");
//         return [];
//       }
//     } catch (error) {
//       const msg =
//         error?.response?.data?.message ||
//         error?.response?.data?.error ||
//         "Failed to load city list.";

//       toast.error(msg);
//       return [];
//     } finally {
//       setCityLoading(false);
//     }
//   };

//   return (
//     <AppContext.Provider
//       value={{
//         darkMode,
//         setDarkMode,
//         sidebarToggle,
//         setSidebarToggle,

//         user,
//         token,
//         login,
//         logout,

//         // Common location data
//         countries,
//         statesByCountry,
//         citiesByState,

//         countryLoading,
//         stateLoading,
//         cityLoading,

//         getCountryList,
//         getStateList,
//         getCityList,
//       }}
//     >
//       {children}
//     </AppContext.Provider>
//   );
// }

// export const useApp = () => {
//   const context = useContext(AppContext);

//   if (!context) {
//     throw new Error("useApp must be used inside AppProvider");
//   }

//   return context;
// };

import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { apiUrl } from "../config";

const AppContext = createContext();

const STORAGE_KEYS = {
  user: "auth_user",
  token: "auth_token",
};

export function AppProvider({ children }) {
  const [darkMode, setDarkMode] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("darkMode")) || false;
    } catch {
      return false;
    }
  });

  const [sidebarToggle, setSidebarToggle] = useState(false);

  // Auth state
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  // Common location state
  const [countries, setCountries] = useState([]);
  const [statesByCountry, setStatesByCountry] = useState({});
  const [citiesByState, setCitiesByState] = useState({});

  const [countryLoading, setCountryLoading] = useState(false);
  const [stateLoading, setStateLoading] = useState(false);
  const [cityLoading, setCityLoading] = useState(false);

  const getToken = () => {
    return localStorage.getItem(STORAGE_KEYS.token) || "";
  };

  const getAuthHeaders = () => {
    const authToken = getToken();

    return {
      Authorization: authToken,
      token: authToken,
      "x-access-token": authToken,
      "Content-Type": "application/json",
    };
  };

  useEffect(() => {
    try {
      localStorage.setItem("darkMode", JSON.stringify(darkMode));
    } catch {}

    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  useEffect(() => {
    const storedUser = localStorage.getItem(STORAGE_KEYS.user);
    const storedToken = localStorage.getItem(STORAGE_KEYS.token);

    if (storedUser && storedToken) {
      try {
        setUser(JSON.parse(storedUser));
        setToken(storedToken);
      } catch {
        localStorage.removeItem(STORAGE_KEYS.user);
        localStorage.removeItem(STORAGE_KEYS.token);
        localStorage.removeItem("auth_permissions");
        localStorage.removeItem("auth_role_id");
        localStorage.removeItem("auth_role_name");
      }
    }
  }, []);

  // Country API call one time when app starts
  useEffect(() => {
    getCountryList();
  }, []);

  const login = (userData, tokenValue) => {
    const finalUserData = {
      ...userData,
      token: tokenValue,
      permissions: Array.isArray(userData?.permissions)
        ? userData.permissions
        : [],
    };

    localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(finalUserData));
    localStorage.setItem(STORAGE_KEYS.token, tokenValue);
    localStorage.setItem(
      "auth_permissions",
      JSON.stringify(finalUserData.permissions),
    );
    localStorage.setItem("auth_role_id", String(finalUserData?.role_id || ""));
    localStorage.setItem("auth_role_name", finalUserData?.role_name || "");

    setUser(finalUserData);
    setToken(tokenValue);
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEYS.user);
    localStorage.removeItem(STORAGE_KEYS.token);
    localStorage.removeItem("auth_permissions");
    localStorage.removeItem("auth_role_id");
    localStorage.removeItem("auth_role_name");

    setUser(null);
    setToken(null);

    // Optional: clear cached location data on logout
    setCountries([]);
    setStatesByCountry({});
    setCitiesByState({});
  };

  const getCountryList = async () => {
    try {
      // already loaded then no API call
      if (countries.length > 0) {
        return countries;
      }

      setCountryLoading(true);

      const response = await axios.post(
        `${apiUrl}/auth/countrylist`,
        {},
        {
          headers: getAuthHeaders(),
        },
      );

      if (response?.data?.success) {
        const list = response?.data?.data || [];
        setCountries(list);
        return list;
      } else {
        toast.error(response?.data?.message || "Country list not found.");
        return [];
      }
    } catch (error) {
      const msg =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        "Failed to load country list.";

      toast.error(msg);
      return [];
    } finally {
      setCountryLoading(false);
    }
  };

  const getStateList = async (countryId) => {
    if (!countryId) return [];

    try {
      const key = String(countryId);

      // same country states already loaded then no API call
      if (statesByCountry[key]) {
        return statesByCountry[key];
      }

      setStateLoading(true);

      const response = await axios.post(
        `${apiUrl}/auth/statelist`,
        {
          countryid: key,
        },
        {
          headers: getAuthHeaders(),
        },
      );

      if (response?.data?.success) {
        const list = response?.data?.data || [];

        setStatesByCountry((prev) => ({
          ...prev,
          [key]: list,
        }));

        return list;
      } else {
        toast.error(response?.data?.message || "State list not found.");
        return [];
      }
    } catch (error) {
      const msg =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        "Failed to load state list.";

      toast.error(msg);
      return [];
    } finally {
      setStateLoading(false);
    }
  };

  const getCityList = async (stateId) => {
    if (!stateId) return [];

    try {
      const key = String(stateId);

      // same state cities already loaded then no API call
      if (citiesByState[key]) {
        return citiesByState[key];
      }

      setCityLoading(true);

      const response = await axios.post(
        `${apiUrl}/auth/citylist`,
        {
          stateid: key,
        },
        {
          headers: getAuthHeaders(),
        },
      );

      if (response?.data?.success) {
        const list = response?.data?.data || [];

        setCitiesByState((prev) => ({
          ...prev,
          [key]: list,
        }));

        return list;
      } else {
        toast.error(response?.data?.message || "City list not found.");
        return [];
      }
    } catch (error) {
      const msg =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        "Failed to load city list.";

      toast.error(msg);
      return [];
    } finally {
      setCityLoading(false);
    }
  };

  return (
    <AppContext.Provider
      value={{
        darkMode,
        setDarkMode,
        sidebarToggle,
        setSidebarToggle,

        user,
        token,
        login,
        logout,

        // Common location data
        countries,
        statesByCountry,
        citiesByState,

        countryLoading,
        stateLoading,
        cityLoading,

        getCountryList,
        getStateList,
        getCityList,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error("useApp must be used inside AppProvider");
  }

  return context;
};

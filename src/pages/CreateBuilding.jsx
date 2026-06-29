// import { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import axios from "axios";
// import { toast } from "react-toastify";

// import Breadcrumb from "../components/ui/Breadcrumb";
// import { apiUrl } from "../config";
// import { useApp } from "../context/AppContext";

// const SelectArrow = () => (
//   <span className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-gray-500 dark:text-gray-400">
//     <svg
//       width="20"
//       height="20"
//       viewBox="0 0 20 20"
//       fill="none"
//       stroke="currentColor"
//     >
//       <path
//         d="M4.79 7.4L10 12.6L15.21 7.4"
//         strokeWidth="1.5"
//         strokeLinecap="round"
//         strokeLinejoin="round"
//       />
//     </svg>
//   </span>
// );

// const getToken = () => {
//   return localStorage.getItem("auth_token") || "";
// };

// const getAuthHeaders = () => {
//   const token = getToken();

//   return {
//     Authorization: token,
//     token: token,
//     "x-access-token": token,
//     "Content-Type": "application/json",
//   };
// };

// const fields = [
//   { key: "customer_id", label: "Customer", type: "customer" },
//   { key: "building_name", label: "Name of Building", type: "text" },
//   { key: "postcode", label: "Postcode", type: "text" },
//   { key: "country_id", label: "Country", type: "country" },
//   { key: "state_id", label: "State", type: "state" },
//   { key: "city_id", label: "City", type: "city" },
//   { key: "address", label: "Address", type: "text" },
//   { key: "landmark", label: "Landmark", type: "text", optional: true },
// ];

// export default function CreateBuilding() {
//   const navigate = useNavigate();

//   const {
//     countries,
//     statesByCountry,
//     citiesByState,
//     countryLoading,
//     stateLoading,
//     cityLoading,
//     getStateList,
//     getCityList,
//   } = useApp();

//   const [form, setForm] = useState({
//     customer_id: "",
//     building_name: "",
//     postcode: "",
//     country_id: "",
//     state_id: "",
//     city_id: "",
//     address: "",
//     landmark: "",
//     status: "1",
//   });

//   const [customers, setCustomers] = useState([]);
//   const [customerLoading, setCustomerLoading] = useState(false);
//   const [saveLoading, setSaveLoading] = useState(false);

//   const states = statesByCountry[String(form.country_id)] || [];
//   const cities = citiesByState[String(form.state_id)] || [];

//   useEffect(() => {
//     getCustomerDropdownList();
//   }, []);

//   const update = (key, value) => {
//     setForm((prev) => ({
//       ...prev,
//       [key]: value,
//     }));
//   };

//   const getCustomerDropdownList = async () => {
//     try {
//       setCustomerLoading(true);

//       const response = await axios.post(
//         `${apiUrl}/auth/customerDropdownList`,
//         {},
//         {
//           headers: getAuthHeaders(),
//         },
//       );

//       if (response?.data?.success) {
//         setCustomers(response?.data?.data || []);
//       } else {
//         toast.error(response?.data?.message || "Customer list not found.");
//       }
//     } catch (error) {
//       const msg =
//         error?.response?.data?.message ||
//         error?.response?.data?.error ||
//         "Failed to load customer list.";

//       toast.error(msg);
//     } finally {
//       setCustomerLoading(false);
//     }
//   };

//   const handleCountryChange = async (countryId) => {
//     setForm((prev) => ({
//       ...prev,
//       country_id: countryId,
//       state_id: "",
//       city_id: "",
//     }));

//     if (countryId) {
//       await getStateList(countryId);
//     }
//   };

//   const handleStateChange = async (stateId) => {
//     setForm((prev) => ({
//       ...prev,
//       state_id: stateId,
//       city_id: "",
//     }));

//     if (stateId) {
//       await getCityList(stateId);
//     }
//   };

//   const handleClear = () => {
//     setForm({
//       customer_id: "",
//       building_name: "",
//       postcode: "",
//       country_id: "",
//       state_id: "",
//       city_id: "",
//       address: "",
//       landmark: "",
//       status: "1",
//     });
//   };

//   const validateForm = () => {
//     if (!form.customer_id) {
//       toast.error("Please select customer.");
//       return false;
//     }

//     if (!form.building_name.trim()) {
//       toast.error("Please enter building name.");
//       return false;
//     }

//     if (!form.postcode.trim()) {
//       toast.error("Please enter postcode.");
//       return false;
//     }

//     if (!form.country_id) {
//       toast.error("Please select country.");
//       return false;
//     }

//     if (!form.state_id) {
//       toast.error("Please select state.");
//       return false;
//     }

//     if (!form.city_id) {
//       toast.error("Please select city.");
//       return false;
//     }

//     if (!form.address.trim()) {
//       toast.error("Please enter address.");
//       return false;
//     }

//     return true;
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (!validateForm()) return;

//     const token = getToken();

//     if (!token) {
//       toast.error("Token not found. Please login again.");
//       return;
//     }

//     try {
//       setSaveLoading(true);

//       const payload = {
//         customer_id: Number(form.customer_id),
//         building_name: form.building_name,
//         postcode: form.postcode,
//         country_id: Number(form.country_id),
//         state_id: Number(form.state_id),
//         city_id: Number(form.city_id),
//         address: form.address,
//         landmark: form.landmark || "",
//         status: form.status,
//       };

//       const response = await axios.post(
//         `${apiUrl}/auth/create_building`,
//         payload,
//         {
//           headers: getAuthHeaders(),
//         },
//       );

//       if (response?.data?.success) {
//         toast.success(
//           response?.data?.message || "Building created successfully",
//         );

//         handleClear();
//         navigate("/building");
//       } else {
//         toast.error(response?.data?.message || "Failed to create building.");
//       }
//     } catch (error) {
//       const msg =
//         error?.response?.data?.message ||
//         error?.response?.data?.error ||
//         "Failed to create building.";

//       toast.error(msg);
//     } finally {
//       setSaveLoading(false);
//     }
//   };

//   return (
//     <>
//       <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
//         <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
//           Create Building
//         </h1>

//         <Breadcrumb
//           pageName="Create Building"
//           parentPage="Building Management"
//         />
//       </div>

//       <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
//         <form onSubmit={handleSubmit}>
//           <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
//             {fields.map((field) => (
//               <div key={field.key}>
//                 <label className="form-label">
//                   {field.label}

//                   {field.optional && (
//                     <span className="ml-1 text-xs text-gray-500 dark:text-gray-400">
//                       (Not mandatory)
//                     </span>
//                   )}
//                 </label>

//                 {field.type === "customer" ? (
//                   <div className="relative">
//                     <select
//                       className="form-select"
//                       value={form.customer_id || ""}
//                       onChange={(e) => update("customer_id", e.target.value)}
//                       disabled={customerLoading}
//                     >
//                       <option value="">
//                         {customerLoading
//                           ? "Loading customers..."
//                           : "Select customer"}
//                       </option>

//                       {customers.map((customer) => (
//                         <option key={customer.id} value={customer.id}>
//                           {customer.name}
//                         </option>
//                       ))}
//                     </select>

//                     <SelectArrow />
//                   </div>
//                 ) : field.type === "country" ? (
//                   <div className="relative">
//                     <select
//                       className="form-select"
//                       value={form.country_id || ""}
//                       onChange={(e) => handleCountryChange(e.target.value)}
//                       disabled={countryLoading}
//                     >
//                       <option value="">
//                         {countryLoading
//                           ? "Loading countries..."
//                           : "Select country"}
//                       </option>

//                       {countries.map((country) => (
//                         <option
//                           key={country.countryid}
//                           value={country.countryid}
//                         >
//                           {country.country_name}
//                         </option>
//                       ))}
//                     </select>

//                     <SelectArrow />
//                   </div>
//                 ) : field.type === "state" ? (
//                   <div className="relative">
//                     <select
//                       className="form-select"
//                       value={form.state_id || ""}
//                       onChange={(e) => handleStateChange(e.target.value)}
//                       disabled={!form.country_id || stateLoading}
//                     >
//                       <option value="">
//                         {stateLoading
//                           ? "Loading states..."
//                           : form.country_id
//                             ? "Select state"
//                             : "Select country first"}
//                       </option>

//                       {states.map((state) => (
//                         <option key={state.iStateId} value={state.iStateId}>
//                           {state.strStateName}
//                         </option>
//                       ))}
//                     </select>

//                     <SelectArrow />
//                   </div>
//                 ) : field.type === "city" ? (
//                   <div className="relative">
//                     <select
//                       className="form-select"
//                       value={form.city_id || ""}
//                       onChange={(e) => update("city_id", e.target.value)}
//                       disabled={!form.state_id || cityLoading}
//                     >
//                       <option value="">
//                         {cityLoading
//                           ? "Loading cities..."
//                           : form.state_id
//                             ? "Select city"
//                             : "Select state first"}
//                       </option>

//                       {cities.map((city) => (
//                         <option key={city.iCityId} value={city.iCityId}>
//                           {city.strCityName}
//                         </option>
//                       ))}
//                     </select>

//                     <SelectArrow />
//                   </div>
//                 ) : (
//                   <input
//                     type="text"
//                     className="form-input"
//                     value={form[field.key] || ""}
//                     onChange={(e) => update(field.key, e.target.value)}
//                   />
//                 )}
//               </div>
//             ))}
//           </div>

//           <div className="mt-8 flex items-center gap-5">
//             <button
//               type="submit"
//               disabled={saveLoading}
//               className="btn-primary disabled:cursor-not-allowed disabled:opacity-70"
//             >
//               {saveLoading ? "Saving..." : "Save"}
//             </button>

//             <button
//               type="button"
//               onClick={handleClear}
//               disabled={saveLoading}
//               className="btn-secondary disabled:cursor-not-allowed disabled:opacity-70"
//             >
//               Clear
//             </button>

//             <button
//               type="button"
//               onClick={() => navigate("/building")}
//               disabled={saveLoading}
//               className="btn-secondary disabled:cursor-not-allowed disabled:opacity-70"
//             >
//               Cancel
//             </button>
//           </div>
//         </form>
//       </div>
//     </>
//   );
// }

import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

import Breadcrumb from "../components/ui/Breadcrumb";
import { apiUrl } from "../config";
import { useApp } from "../context/AppContext";

const SelectArrow = () => (
  <span className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-gray-500 dark:text-gray-400">
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
    >
      <path
        d="M4.79 7.4L10 12.6L15.21 7.4"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  </span>
);

const getToken = () => {
  return localStorage.getItem("auth_token") || "";
};

const getAuthHeaders = () => {
  const token = getToken();

  return {
    Authorization: token,
    token: token,
    "x-access-token": token,
    "Content-Type": "application/json",
  };
};


export default function CreateBuilding() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const buildingId = searchParams.get("building_id");
  const isEditMode = Boolean(buildingId);

  const {
    countries,
    statesByCountry,
    citiesByState,
    countryLoading,
    stateLoading,
    cityLoading,
    getStateList,
    getCityList,
  } = useApp();

  const [form, setForm] = useState({
    customer_id: "",
    uprn_no: "",
    building_name: "",
    postcode: "",
    country_id: "",
    state_id: "",
    city_id: "",
    address: "",
    address_line_2:"",
    landmark: "",
    status: "1",
  });

  const [customers, setCustomers] = useState([]);
  const [customerLoading, setCustomerLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);

  const states = statesByCountry[String(form.country_id)] || [];
  const cities = citiesByState[String(form.state_id)] || [];

  const selectedCountry = countries.find(
    (country) => String(country.countryid) === String(form.country_id)
  );

  const countryName =
    selectedCountry?.country_name?.trim().toLowerCase() || "";

  const isUK =
    countryName === "uk" ||
    countryName === "united kingdom";

  useEffect(() => {
    getCustomerDropdownList();
  }, []);
const authUser = JSON.parse(localStorage.getItem("auth_user") || "{}");

const authRoleId = Number(authUser?.role_id);
const customerRoleId = Number(authUser?.customer?.role_id);
console.log(authRoleId,"uthdjh")
const fields = [
  ...(authRoleId == 3 || customerRoleId == 3
    ? []
    : [{ key: "customer_id", label: "Customer Company", type: "customer" }]),
    { key: "uprn_no", label: "UPRN Number", type: "text" },
  { key: "building_name", label: "Name of Building", type: "text" },
  { key: "address", label: "Address Line 1", type: "text" },
  { key: "address_line_2", label: "Address Line 2", type: "text" },
  { key: "country_id", label: "Country", type: "country" },
  { key: "state_id", label: "State", type: "state" },
  { key: "city_id", label: "City", type: "city" },
  { key: "postcode", label: "Postcode", type: "text" },
  // { key: "landmark", label: "Access Information", type: "text", optional: true },
  { key: "landmark", label: "Access Information", type: "text" },
];
  useEffect(() => {
    const fetchBuildingById = async () => {
      if (!buildingId) return;

      const token = getToken();

      if (!token) {
        toast.error("Token not found. Please login again.");
        return;
      }

      try {
        setFetchLoading(true);

        const response = await axios.post(
          `${apiUrl}/auth/get_building_by_id`,
          {
            building_id: buildingId,
          },
          {
            headers: getAuthHeaders(),
          },
        );

        if (response?.data?.success && response?.data?.data) {
          const building = response.data.data;

          setForm({
            customer_id: building.customer_id?.toString() || "",
            uprn_no:building.uprn_no || "",
            building_name: building.building_name || "",
            postcode: building.postcode?.toString() || "",
            country_id: building.country_id?.toString() || "",
            state_id: building.state_id?.toString() || "",
            city_id: building.city_id?.toString() || "",
            address: building.address || "",
            address_line_2: building?.address_line_2 || "",
            landmark: building.landmark || "",
            status: building.status?.toString() || "1",
          });

          if (building.country_id) {
            await getStateList(building.country_id);
          }

          if (building.state_id) {
            await getCityList(building.state_id);
          }
        } else {
          toast.error(response?.data?.message || "Failed to fetch building.");
        }
      } catch (error) {
        const msg =
          error?.response?.data?.message ||
          error?.response?.data?.error ||
          "Failed to fetch building.";

        toast.error(msg);
      } finally {
        setFetchLoading(false);
      }
    };

    fetchBuildingById();
  }, [buildingId]);

  const update = (key, value) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const getCustomerDropdownList = async () => {
    try {
      setCustomerLoading(true);

      const response = await axios.post(
        `${apiUrl}/auth/customerDropdownList`,
        {},
        {
          headers: getAuthHeaders(),
        },
      );

      if (response?.data?.success) {
        setCustomers(response?.data?.data || []);
      } else {
        toast.error(response?.data?.message || "Customer list not found.");
      }
    } catch (error) {
      const msg =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        "Failed to load customer list.";

      toast.error(msg);
    } finally {
      setCustomerLoading(false);
    }
  };

  const handleCountryChange = async (countryId) => {
    const countryData = countries.find(
      (country) => String(country.countryid) === String(countryId)
    );

    const countryName =
      countryData?.country_name?.trim().toLowerCase() || "";

    const isUKCountry =
      countryName === "uk" ||
      countryName === "united kingdom";

    setForm((prev) => ({
      ...prev,
      country_id: countryId,
      state_id: isUKCountry ? "37" : "",
      city_id: "",
    }));

    if (countryId) {
      await getStateList(countryId);
    }

     // Only for UK
    if (isUKCountry) {
      await getCityList("37");
    }
  };

  const handleStateChange = async (stateId) => {
    setForm((prev) => ({
      ...prev,
      state_id: stateId,
      city_id: "",
    }));

    if (stateId) {
      await getCityList(stateId);
    }
  };

  const handleClear = () => {
    setForm({
      customer_id: "",
      uprn_no: "",
      building_name: "",
      postcode: "",
      country_id: "",
      state_id: "",
      city_id: "",
      address: "",
      address_line_2:"",
      landmark: "",
      status: "1",
    });
  };
  const isRequiredField = (field) => {
    if (field.optional) {
      return false;
    }

    if (field.key === "customer_id" && authUser.role_id == 3) {
      return false;
    }

    return [
      "customer_id",
      "uprn_no",
      "building_name",
      "postcode",
      "country_id",
      "state_id",
      "city_id",
      "address",
    ].includes(field.key);

    if (field.key === "state" && !isUK) {
      return true;
    }
  };
  const validateForm = () => {
    if (authUser.role_id !== 3) {
      if (!form.customer_id) {
        toast.error("Please select customer.");
        return false;
      }
    }

    if (!form.uprn_no) {
      toast.error("Please enter uprn no.");
      return false;
    }

    if (!form.building_name.trim()) {
      toast.error("Please enter building name.");
      return false;
    }

    if (!form.postcode.trim()) {
      toast.error("Please enter postcode.");
      return false;
    }

    if (!form.country_id) {
      toast.error("Please select country.");
      return false;
    }

    if (!isUK && !form.state_id) {
      toast.error("Please select state.");
      return false;
    }

    if (!form.city_id) {
      toast.error("Please select city.");
      return false;
    }

    if (!form.address.trim()) {
      toast.error("Please enter address.");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    const token = getToken();

    if (!token) {
      toast.error("Token not found. Please login again.");
      return;
    }

    try {
      setSaveLoading(true);
      const payload = {
        customer_id:
          (authRoleId === 3 || customerRoleId === 3
            ? authUser.customer?.customer_id : form.customer_id),
            uprn_no: Number(form.uprn_no),
        building_name: form.building_name,
        postcode: form.postcode,
        country_id: Number(form.country_id),
        state_id: Number(form.state_id),
        city_id: Number(form.city_id),
        address: form.address,
        address_line_2: form.address_line_2,
        landmark: form.landmark || "",
        status: form.status || "1",
      };

      if (isEditMode) {
        payload.building_id = Number(buildingId);
      }

      const apiEndpoint = isEditMode
        ? `${apiUrl}/auth/update_building`
        : `${apiUrl}/auth/create_building`;

      const response = await axios.post(apiEndpoint, payload, {
        headers: getAuthHeaders(),
      });

      if (response?.data?.success) {
        toast.success(
          response?.data?.message ||
          (isEditMode
            ? "Building updated successfully"
            : "Building created successfully"),
        );

        handleClear();
        navigate("/building");
      } else {
        toast.error(
          response?.data?.message ||
          (isEditMode
            ? "Failed to update building."
            : "Failed to create building."),
        );
      }
    } catch (error) {
      const msg =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        (isEditMode
          ? "Failed to update building."
          : "Failed to create building.");

      toast.error(msg);
    } finally {
      setSaveLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-6 text-gray-700 dark:border-gray-800 dark:bg-white/[0.03] dark:text-gray-300">
        Loading building details...
      </div>
    );
  }

  return (
    <>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {isEditMode ? "Edit Building" : "Create Building"}
        </h1>

        <Breadcrumb
          pageName={isEditMode ? "Edit Building" : "Create Building"}
          parentPage="Building Management"
        />
      </div>

      <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {fields
            .filter((field) => {
              if (field.key === "state_id" && isUK) {
                    return false;
                  }
                  return true;
                })
            .map((field) => (
              <div key={field.key}>
                <label className="form-label">
                  {field.label}

                  {isRequiredField(field) && (
                    <span className="ml-1 text-red-500">*</span>
                  )}

                  {field.optional && (
                    <span className="ml-1 text-xs text-gray-500 dark:text-gray-400">
                      (Not mandatory)
                    </span>
                  )}
                </label>

                {field.type === "customer" ? (
                  <div className="relative">
                    <select
                      className="form-select"
                      value={form.customer_id || ""}
                      onChange={(e) => update("customer_id", e.target.value)}
                      disabled={customerLoading}
                    >
                      <option value="">
                        {customerLoading
                          ? "Loading customers..."
                          : "Select customer"}
                      </option>

                      {customers.map((customer) => (
                        <option key={customer.id} value={customer.id}>
                          {customer.name}
                        </option>
                      ))}
                    </select>

                    <SelectArrow />
                  </div>
                ) : field.type === "country" ? (
                  <div className="relative">
                    <select
                      className="form-select"
                      value={form.country_id || ""}
                      onChange={(e) => handleCountryChange(e.target.value)}
                      disabled={countryLoading}
                    >
                      <option value="">
                        {countryLoading
                          ? "Loading countries..."
                          : "Select country"}
                      </option>

                      {countries.map((country) => (
                        <option
                          key={country.countryid}
                          value={country.countryid}
                        >
                          {country.country_name}
                        </option>
                      ))}
                    </select>

                    <SelectArrow />
                  </div>
                ) : field.type === "state" ? (
                  <div className="relative">
                    <select
                      className="form-select"
                      value={form.state_id || ""}
                      onChange={(e) => handleStateChange(e.target.value)}
                      disabled={!form.country_id || stateLoading}
                    >
                      <option value="">
                        {stateLoading
                          ? "Loading states..."
                          : form.country_id
                            ? "Select Option"
                            : "Select country first"}
                      </option>

                      {states.map((state) => (
                        <option key={state.iStateId} value={state.iStateId}>
                          {state.strStateName}
                        </option>
                      ))}
                    </select>

                    <SelectArrow />
                  </div>
                ) : field.type === "city" ? (
                  <div className="relative">
                    <select
                      className="form-select"
                      value={form.city_id || ""}
                      onChange={(e) => update("city_id", e.target.value)}
                      disabled={(!form.state_id && !isUK) || cityLoading}
                    >
                      <option value="">
                        {cityLoading
                          ? "Loading cities..."
                          : form.state_id
                            ? "Select Option"
                            : "Select state first"}
                      </option>

                      {cities.map((city) => (
                        <option key={city.iCityId} value={city.iCityId}>
                          {city.strCityName}
                        </option>
                      ))}
                    </select>

                    <SelectArrow />
                  </div>
                ) : (
                  <input
                    type="text"
                    className="form-input"
                    value={form[field.key] || ""}
                    onChange={(e) => update(field.key, e.target.value)}
                  />
                )}
              </div>
            ))}
          </div>

          <div className="mt-8 flex items-center gap-5">
            <button
              type="submit"
              disabled={saveLoading}
              className="btn-primary disabled:cursor-not-allowed disabled:opacity-70"
            >
              {saveLoading ? "Saving..." : isEditMode ? "Update" : "Save"}
            </button>

            <button
              type="button"
              onClick={handleClear}
              disabled={saveLoading}
              className="btn-secondary disabled:cursor-not-allowed disabled:opacity-70"
            >
              Clear
            </button>

            <button
              type="button"
              onClick={() => navigate("/building")}
              disabled={saveLoading}
              className="btn-secondary disabled:cursor-not-allowed disabled:opacity-70"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

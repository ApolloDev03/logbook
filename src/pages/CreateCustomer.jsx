// import { useEffect, useState } from "react";
// import { useNavigate, useSearchParams } from "react-router-dom";
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
//   };
// };

// const fields = [
//   { key: "prefix", label: "Prefix", type: "text" },
//   { key: "contact", label: "Customer Name", type: "text" },
//   { key: "company", label: "Company Name", type: "text" },
//   { key: "email", label: "Email ID", type: "text" },
//   { key: "phone", label: "Contact Number", type: "text" },
//   { key: "postcode", label: "Post Code", type: "text" },
//   { key: "address", label: "Address", type: "text" },
//   { key: "country", label: "Select Country", type: "country" },
//   { key: "state", label: "Select State", type: "state" },
//   { key: "city", label: "Select City", type: "city" },
//   { key: "customer_company_logo", label: "Upload Company Logo", type: "file" },
//   {
//     key: "customer_company_logo_icon",
//     label: "Upload Company Logo Icon",
//     type: "file",
//   },
// ];

// export default function CreateCustomer() {
//   const navigate = useNavigate();
//   const [searchParams] = useSearchParams();

//   const customerId = searchParams.get("customer_id");
//   const isEditMode = Boolean(customerId);

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
//     contact: "",
//     company: "",
//     email: "",
//     prefix: "",
//     phone: "",
//     postcode: "",
//     address: "",
//     country: "",
//     state: "",
//     city: "",
//     customer_company_logo: null,
//     customer_company_logo_icon: null,
//   });

//   const [saveLoading, setSaveLoading] = useState(false);
//   const [fetchLoading, setFetchLoading] = useState(false);

//   const states = statesByCountry[String(form.country)] || [];
//   const cities = citiesByState[String(form.state)] || [];

//   const update = (key, value) => {
//     setForm((prev) => ({
//       ...prev,
//       [key]: value,
//     }));
//   };

//   const handleCountryChange = async (countryId) => {
//     setForm((prev) => ({
//       ...prev,
//       country: countryId,
//       state: "",
//       city: "",
//       prefix: "",
//     }));

//     if (countryId) {
//       await getStateList(countryId);
//     }
//   };

//   const handleStateChange = async (stateId) => {
//     setForm((prev) => ({
//       ...prev,
//       state: stateId,
//       city: "",
//     }));

//     if (stateId) {
//       await getCityList(stateId);
//     }
//   };

//   const handleClear = () => {
//     setForm({
//       contact: "",
//       company: "",
//       email: "",
//       prefix: "",
//       phone: "",
//       postcode: "",
//       address: "",
//       country: "",
//       state: "",
//       city: "",
//       customer_company_logo: null,
//       customer_company_logo_icon: null,
//     });

//     const logoInput = document.getElementById("customer_company_logo");
//     const iconInput = document.getElementById("customer_company_logo_icon");

//     if (logoInput) logoInput.value = "";
//     if (iconInput) iconInput.value = "";
//   };

//   const validateForm = () => {
//     if (!form.contact.trim()) {
//       toast.error("Please enter customer name.");
//       return false;
//     }

//     if (!form.company.trim()) {
//       toast.error("Please enter company name.");
//       return false;
//     }

//     if (!form.email.trim()) {
//       toast.error("Please enter email.");
//       return false;
//     }

//     if (!form.prefix.trim()) {
//       toast.error("Please enter prefix.");
//       return false;
//     }

//     if (!/^[A-Za-z]{1,3}$/.test(form.prefix.trim())) {
//       toast.error("Prefix must be alphabets only and maximum 3 characters.");
//       return false;
//     }
//     if (!form.phone.trim()) {
//       toast.error("Please enter contact number.");
//       return false;
//     }

//     if (!form.postcode.trim()) {
//       toast.error("Please enter post code.");
//       return false;
//     }

//     if (!form.address.trim()) {
//       toast.error("Please enter address.");
//       return false;
//     }

//     if (!form.country) {
//       toast.error("Please select country.");
//       return false;
//     }

//     if (!form.state) {
//       toast.error("Please select state.");
//       return false;
//     }

//     if (!form.city) {
//       toast.error("Please select city.");
//       return false;
//     }

//     return true;
//   };

//   useEffect(() => {
//     const fetchCustomerById = async () => {
//       if (!customerId) return;

//       const token = getToken();

//       if (!token) {
//         toast.error("Token not found. Please login again.");
//         return;
//       }

//       try {
//         setFetchLoading(true);

//         const response = await axios.post(
//           `${apiUrl}/auth/get_customer_by_id`,
//           {
//             customer_id: customerId,
//           },
//           {
//             headers: getAuthHeaders(),
//           },
//         );

//         if (response?.data?.success && response?.data?.data) {
//           const customer = response.data.data;

//           setForm({
//             contact: customer.customer_name || "",
//             company: customer.customer_company_name || "",
//             email: customer.customer_email || "",
//             prefix: customer.Prefix || "",
//             phone: customer.customer_number?.toString() || "",
//             postcode: customer.customer_post_code?.toString() || "",
//             address: customer.customer_address || "",
//             country: customer.customer_country_id?.toString() || "",
//             state: customer.customer_state_id?.toString() || "",
//             city: customer.customer_city_id?.toString() || "",
//             customer_company_logo: customer.logo_url || "",
//             customer_company_logo_icon: customer.logo_icon_url || "",
//           });

//           if (customer.customer_country_id) {
//             await getStateList(customer.customer_country_id);
//           }

//           if (customer.customer_state_id) {
//             await getCityList(customer.customer_state_id);
//           }
//         } else {
//           toast.error(response?.data?.message || "Failed to fetch customer.");
//         }
//       } catch (error) {
//         toast.error(
//           error?.response?.data?.message ||
//             error?.response?.data?.error ||
//             "Failed to fetch customer.",
//         );
//       } finally {
//         setFetchLoading(false);
//       }
//     };

//     fetchCustomerById();
//   }, [customerId]);

//   const handleSave = async () => {
//     if (!validateForm()) return;

//     const token = getToken();

//     if (!token) {
//       toast.error("Token not found. Please login again.");
//       return;
//     }

//     try {
//       setSaveLoading(true);

//       const formData = new FormData();

//       formData.append("customer_name", form.contact);
//       formData.append("customer_company_name", form.company);
//       formData.append("customer_email", form.email);
//       formData.append("customer_number", form.phone);
//       formData.append("customer_post_code", form.postcode);
//       formData.append("customer_address", form.address);
//       formData.append("customer_country_id", form.country);
//       formData.append("customer_state_id", form.state);
//       formData.append("customer_city_id", form.city);
//       formData.append("Prefix", form.prefix);

//       if (isEditMode) {
//         formData.append("customer_id", customerId);
//       }

//       if (form.customer_company_logo) {
//         formData.append("customer_company_logo", form.customer_company_logo);
//       }

//       if (form.customer_company_logo_icon) {
//         formData.append(
//           "customer_company_logo_icon",
//           form.customer_company_logo_icon,
//         );
//       }

//       const apiEndpoint = isEditMode
//         ? `${apiUrl}/auth/update_customer`
//         : `${apiUrl}/auth/create_customer`;

//       const response = await axios.post(apiEndpoint, formData, {
//         headers: {
//           ...getAuthHeaders(),
//           "Content-Type": "multipart/form-data",
//         },
//       });

//       if (response?.data?.success) {
//         toast.success(
//           response?.data?.message ||
//             (isEditMode
//               ? "Customer updated successfully"
//               : "Customer created successfully"),
//         );

//         handleClear();
//         navigate("/customer");
//       } else {
//         toast.error(
//           response?.data?.message ||
//             (isEditMode
//               ? "Failed to update customer."
//               : "Failed to create customer."),
//         );
//       }
//     } catch (error) {
//       const msg =
//         error?.response?.data?.message ||
//         error?.response?.data?.error ||
//         (isEditMode
//           ? "Failed to update customer."
//           : "Failed to create customer.");

//       toast.error(msg);
//     } finally {
//       setSaveLoading(false);
//     }
//   };

//   if (fetchLoading) {
//     return (
//       <div className="rounded-2xl border border-gray-200 bg-white p-6 text-gray-700 dark:border-gray-800 dark:bg-white/[0.03] dark:text-gray-300">
//         Loading customer details...
//       </div>
//     );
//   }

//   return (
//     <>
//       <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
//         <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
//           {isEditMode ? "Edit Customer" : "Create Customer"}
//         </h1>

//         <Breadcrumb
//           pageName={isEditMode ? "Edit Customer" : "Create Customer"}
//           parentPage="Customer Management"
//         />
//       </div>

//       <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
//         <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
//           {fields.map((field) => (
//             <div key={field.key}>
//               <label className="form-label flex items-center gap-2">
//                 <span>{field.label}</span>

//                 {field.key === "prefix" && (
//                   <span className="text-xs font-normal text-gray-500 dark:text-gray-400">
//                     {" "}
//                     (Max 3 letters)
//                   </span>
//                 )}
//               </label>

//               {field.type === "country" ? (
//                 <div className="relative">
//                   <select
//                     className="form-select"
//                     value={form.country || ""}
//                     onChange={(e) => handleCountryChange(e.target.value)}
//                     disabled={countryLoading}
//                   >
//                     <option value="">
//                       {countryLoading
//                         ? "Loading countries..."
//                         : "Select Option"}
//                     </option>

//                     {countries.map((country) => (
//                       <option key={country.countryid} value={country.countryid}>
//                         {country.country_name}
//                       </option>
//                     ))}
//                   </select>
//                   <SelectArrow />
//                 </div>
//               ) : field.type === "state" ? (
//                 <div className="relative">
//                   <select
//                     className="form-select"
//                     value={form.state || ""}
//                     onChange={(e) => handleStateChange(e.target.value)}
//                     disabled={!form.country || stateLoading}
//                   >
//                     <option value="">
//                       {stateLoading
//                         ? "Loading states..."
//                         : form.country
//                           ? "Select Option"
//                           : "Select country first"}
//                     </option>

//                     {states.map((state) => (
//                       <option key={state.iStateId} value={state.iStateId}>
//                         {state.strStateName}
//                       </option>
//                     ))}
//                   </select>
//                   <SelectArrow />
//                 </div>
//               ) : field.type === "city" ? (
//                 <div className="relative">
//                   <select
//                     className="form-select"
//                     value={form.city || ""}
//                     onChange={(e) => update("city", e.target.value)}
//                     disabled={!form.state || cityLoading}
//                   >
//                     <option value="">
//                       {cityLoading
//                         ? "Loading cities..."
//                         : form.state
//                           ? "Select Option"
//                           : "Select state first"}
//                     </option>

//                     {cities.map((city) => (
//                       <option key={city.iCityId} value={city.iCityId}>
//                         {city.strCityName}
//                       </option>
//                     ))}
//                   </select>
//                   <SelectArrow />
//                 </div>
//               ) : field.type === "file" ? (
//                 <input
//                   id={field.key}
//                   type="file"
//                   accept="image/*"
//                   className="block h-11 w-full cursor-pointer rounded-lg border border-gray-300 bg-white text-sm text-gray-700 shadow-sm outline-none transition
//       file:mr-4 file:h-full file:border-0 file:border-r file:border-gray-300 file:bg-gray-100 file:px-4 file:text-sm file:font-medium file:text-gray-700
//       hover:border-blue-400 focus:border-blue-500
//       dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300
//       dark:file:border-gray-700 dark:file:bg-gray-800 dark:file:text-gray-200"
//                   onChange={(e) =>
//                     update(field.key, e.target.files?.[0] || null)
//                   }
//                 />
//               ) : (
//                 <input
//                   type="text"
//                   className="form-input"
//                   value={form[field.key] || ""}
//                   maxLength={field.key === "prefix" ? 3 : undefined}
//                   onChange={(e) => {
//                     if (field.key === "prefix") {
//                       const onlyAlpha = e.target.value
//                         .replace(/[^A-Za-z]/g, "")
//                         .slice(0, 3);
//                       update(field.key, onlyAlpha.toUpperCase());
//                       return;
//                     }

//                     update(field.key, e.target.value);
//                   }}
//                 />
//               )}
//             </div>
//           ))}
//         </div>

//         <div className="mt-8 flex items-center gap-5">
//           <button
//             type="button"
//             onClick={handleSave}
//             disabled={saveLoading}
//             className="btn-primary disabled:cursor-not-allowed disabled:opacity-70"
//           >
//             {saveLoading ? "Saving..." : isEditMode ? "Update" : "Save"}
//           </button>

//           <button
//             type="button"
//             onClick={handleClear}
//             disabled={saveLoading}
//             className="btn-secondary disabled:cursor-not-allowed disabled:opacity-70"
//           >
//             Clear
//           </button>

//           <button
//             type="button"
//             onClick={() => navigate("/customer")}
//             disabled={saveLoading}
//             className="btn-secondary disabled:cursor-not-allowed disabled:opacity-70"
//           >
//             Cancel
//           </button>
//         </div>
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
  };
};

const fields = [
  { key: "prefix", label: "Prefix", type: "text" },
  { key: "contact", label: "Customer Name", type: "text" },
  { key: "company", label: "Company Name", type: "text" },
  { key: "email", label: "Email ID", type: "text" },
  { key: "phone", label: "Contact Number", type: "text" },
  { key: "address", label: "Address Line 1", type: "text" },
  { key: "customer_address_line_2", label: "Address Line 2", type: "text" },
  { key: "country", label: "Select Country", type: "country" },
  { key: "state", label: "Select State", type: "state" },
  { key: "city", label: "Select City", type: "city" },
  { key: "postcode", label: "Post Code", type: "text" },
  { key: "customer_company_logo", label: "Upload Company Logo", type: "file" },
  {
    key: "customer_company_logo_icon",
    label: "Upload Company Logo Icon",
    type: "file",
  },
];

const companyFields = [
  "prefix",
  "company",
  "address",
  "customer_address_line_2",
  "country",
  "state",
  "city",
  "postcode",
];

const customerFields = [
  "contact",
  "email",
  "phone",
  "customer_company_logo",
  "customer_company_logo_icon",
];

export default function CreateCustomer() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const customerId = searchParams.get("customer_id");
  const isEditMode = Boolean(customerId);

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
    contact: "",
    company: "",
    email: "",
    prefix: "",
    phone: "",
    postcode: "",
    address: "",
    customer_address_line_2: "",
    country: "",
    state: "",
    city: "",
    customer_company_logo: null,
    customer_company_logo_icon: null,
  });

  const [companyLogoPreview, setCompanyLogoPreview] = useState("");
  const [companyLogoIconPreview, setCompanyLogoIconPreview] = useState("");

  const [saveLoading, setSaveLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);

  const states = statesByCountry[String(form.country)] || [];
  const cities = citiesByState[String(form.state)] || [];

  const selectedCountry = countries.find(
    (country) => String(country.countryid) === String(form.country)
  );

  const countryName =
    selectedCountry?.country_name?.trim().toLowerCase() || "";

  const isUK =
    countryName === "uk" ||
    countryName === "united kingdom";

  const update = (key, value) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleFileChange = (key, file) => {
    update(key, file || null);

    if (key === "customer_company_logo") {
      setCompanyLogoPreview(file ? URL.createObjectURL(file) : "");
    }

    if (key === "customer_company_logo_icon") {
      setCompanyLogoIconPreview(file ? URL.createObjectURL(file) : "");
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
      country: countryId,
      state: isUKCountry ? "37" : "",
      city: "",
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
      state: stateId,
      city: "",
    }));

    if (stateId) {
      await getCityList(stateId);
    }
  };

  const handleClear = () => {
    setForm({
      contact: "",
      company: "",
      email: "",
      prefix: "",
      phone: "",
      postcode: "",
      address: "",
      customer_address_line_2: "",
      country: "",
      state: "",
      city: "",
      customer_company_logo: null,
      customer_company_logo_icon: null,
    });

    setCompanyLogoPreview("");
    setCompanyLogoIconPreview("");

    const logoInput = document.getElementById("customer_company_logo");
    const iconInput = document.getElementById("customer_company_logo_icon");

    if (logoInput) logoInput.value = "";
    if (iconInput) iconInput.value = "";
  };
  const isRequiredField = (field) => {
    return [
      "contact",
      "company",
      "email",
      "prefix",
      "phone",
      "postcode",
      "address",
      "country",
      "state",
      "city",
    ].includes(field.key);
  };
  const validateForm = () => {
    if (!form.contact.trim()) {
      toast.error("Please enter customer name.");
      return false;
    }

    if (!form.company.trim()) {
      toast.error("Please enter company name.");
      return false;
    }

    if (!form.email.trim()) {
      toast.error("Please enter email.");
      return false;
    }

    if (!form.prefix.trim()) {
      toast.error("Please enter prefix.");
      return false;
    }

    if (!/^[A-Za-z]{1,3}$/.test(form.prefix.trim())) {
      toast.error("Prefix must be alphabets only and maximum 3 characters.");
      return false;
    }

    if (!form.phone.trim()) {
      toast.error("Please enter contact number.");
      return false;
    }

    if (!form.postcode.trim()) {
      toast.error("Please enter post code.");
      return false;
    }

    if (!form.address.trim()) {
      toast.error("Please enter address.");
      return false;
    }

    if (!form.country) {
      toast.error("Please select country.");
      return false;
    }

    if (!isUK && !form.state) {
      toast.error("Please select state.");
      return false;
    }

    if (!form.city) {
      toast.error("Please select city.");
      return false;
    }

    return true;
  };

  useEffect(() => {
    const fetchCustomerById = async () => {
      if (!customerId) return;

      const token = getToken();

      if (!token) {
        toast.error("Token not found. Please login again.");
        return;
      }

      try {
        setFetchLoading(true);

        const response = await axios.post(
          `${apiUrl}/auth/get_customer_by_id`,
          {
            customer_id: customerId,
          },
          {
            headers: getAuthHeaders(),
          },
        );

        if (response?.data?.success && response?.data?.data) {
          const customer = response.data.data;

          setForm({
            contact: customer.customer_name || "",
            company: customer.customer_company_name || "",
            email: customer.customer_email || "",
            prefix: customer.Prefix || "",
            phone: customer.customer_number?.toString() || "",
            postcode: customer.customer_post_code?.toString() || "",
            address: customer.customer_address || "",
            customer_address_line_2: customer?.customer_address_line_2 || "",
            country: customer.customer_country_id?.toString() || "",
            state: customer.customer_state_id?.toString() || "",
            city: customer.customer_city_id?.toString() || "",
            customer_company_logo: null,
            customer_company_logo_icon: null,
          });

          setCompanyLogoPreview(customer.logo_url || "");
          setCompanyLogoIconPreview(customer.logo_icon_url || "");

          if (customer.customer_country_id) {
            await getStateList(customer.customer_country_id);
          }

          if (customer.customer_state_id) {
            await getCityList(customer.customer_state_id);
          }
        } else {
          toast.error(response?.data?.message || "Failed to fetch customer.");
        }
      } catch (error) {
        toast.error(
          error?.response?.data?.message ||
          error?.response?.data?.error ||
          "Failed to fetch customer.",
        );
      } finally {
        setFetchLoading(false);
      }
    };

    fetchCustomerById();
  }, [customerId]);

  const handleSave = async () => {
    if (!validateForm()) return;

    const token = getToken();

    if (!token) {
      toast.error("Token not found. Please login again.");
      return;
    }

    try {
      setSaveLoading(true);

      const formData = new FormData();

      formData.append("customer_name", form.contact);
      formData.append("customer_company_name", form.company);
      formData.append("customer_email", form.email);
      formData.append("customer_number", form.phone);
      formData.append("customer_post_code", form.postcode);
      formData.append("customer_address", form.address);
      formData.append("customer_address_line_2", form.customer_address_line_2);
      formData.append("customer_country_id", form.country);
      formData.append("customer_state_id", form.state);
      formData.append("customer_city_id", form.city);
      formData.append("Prefix", form.prefix);

      if (isEditMode) {
        formData.append("customer_id", customerId);
      }

      if (form.customer_company_logo instanceof File) {
        formData.append("customer_company_logo", form.customer_company_logo);
      }

      if (form.customer_company_logo_icon instanceof File) {
        formData.append(
          "customer_company_logo_icon",
          form.customer_company_logo_icon,
        );
      }

      const apiEndpoint = isEditMode
        ? `${apiUrl}/auth/update_customer`
        : `${apiUrl}/auth/create_customer`;

      const response = await axios.post(apiEndpoint, formData, {
        headers: {
          ...getAuthHeaders(),
          "Content-Type": "multipart/form-data",
        },
      });

      if (response?.data?.success) {
        toast.success(
          response?.data?.message ||
          (isEditMode
            ? "Customer updated successfully"
            : "Customer created successfully"),
        );

        handleClear();
        navigate("/customer");
      } else {
        toast.error(
          response?.data?.message ||
          (isEditMode
            ? "Failed to update customer."
            : "Failed to create customer."),
        );
      }
    } catch (error) {
      const msg =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        (isEditMode
          ? "Failed to update customer."
          : "Failed to create customer.");

      toast.error(msg);
    } finally {
      setSaveLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-6 text-gray-700 dark:border-gray-800 dark:bg-white/[0.03] dark:text-gray-300">
        Loading customer details...
      </div>
    );
  }

  return (
    <>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {isEditMode ? "Edit Customer" : "Create Customer"}
        </h1>

        <Breadcrumb
          pageName={isEditMode ? "Edit Customer" : "Create Customer"}
          parentPage="Customer Management"
        />
      </div>

      <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        
        {/* <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {fields
            .filter((field) => {
              
              if (field.key === "state" && isUK) {
                return false;
              }
              return true;
            })
            .map((field) => (
              <div key={field.key}>
                <label className="form-label flex items-center gap-2">
                  <span>
                    {field.label}
                    {isRequiredField(field) && (
                      <span className="ml-1 text-red-500">*</span>
                    )}
                  </span>

                  {field.key === "prefix" && (
                    <span className="text-xs font-normal text-gray-500 dark:text-gray-400">
                      (Max 3 letters)
                    </span>
                  )}
                </label>

                {field.type === "country" ? (
                  <div className="relative">
                    <select
                      className="form-select"
                      value={form.country || ""}
                      onChange={(e) => handleCountryChange(e.target.value)}
                      disabled={countryLoading}
                    >
                      <option value="">
                        {countryLoading
                          ? "Loading countries..."
                          : "Select Option"}
                      </option>

                      {countries.map((country) => (
                        <option key={country.countryid} value={country.countryid}>
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
                      value={form.state || ""}
                      onChange={(e) => handleStateChange(e.target.value)}
                      disabled={!form.country || stateLoading}
                    >
                      <option value="">
                        {stateLoading
                          ? "Loading states..."
                          : form.country
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
                      value={form.city || ""}
                      onChange={(e) => update("city", e.target.value)}
                      disabled={!form.state || cityLoading}
                    >
                      <option value="">
                        {cityLoading
                          ? "Loading cities..."
                          : form.state
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
                ) : field.type === "file" ? (
                  <>
                    <input
                      id={field.key}
                      type="file"
                      accept="image/*"
                      className="block h-11 w-full cursor-pointer rounded-lg border border-gray-300 bg-white text-sm text-gray-700 shadow-sm outline-none transition
                    file:mr-4 file:h-full file:border-0 file:border-r file:border-gray-300 file:bg-gray-100 file:px-4 file:text-sm file:font-medium file:text-gray-700
                    hover:border-blue-400 focus:border-blue-500
                    dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300
                    dark:file:border-gray-700 dark:file:bg-gray-800 dark:file:text-gray-200"
                      onChange={(e) =>
                        handleFileChange(field.key, e.target.files?.[0] || null)
                      }
                    />

                    {field.key === "customer_company_logo" &&
                      companyLogoPreview && (
                        <div className="mt-3">
                          <p className="mb-2 text-xs font-medium text-gray-500 dark:text-gray-400">
                            Current Company Logo
                          </p>
                          <img
                            src={companyLogoPreview}
                            alt="Company Logo"
                            className="h-20 w-32 rounded-lg border border-gray-200 object-contain p-2 dark:border-gray-700"
                          />
                        </div>
                      )}

                    {field.key === "customer_company_logo_icon" &&
                      companyLogoIconPreview && (
                        <div className="mt-3">
                          <p className="mb-2 text-xs font-medium text-gray-500 dark:text-gray-400">
                            Current Company Logo Icon
                          </p>
                          <img
                            src={companyLogoIconPreview}
                            alt="Company Logo Icon"
                            className="h-20 w-20 rounded-lg border border-gray-200 object-contain p-2 dark:border-gray-700"
                          />
                        </div>
                      )}
                  </>
                ) : (
                  <input
                    type="text"
                    className="form-input"
                    value={form[field.key] || ""}
                    maxLength={field.key === "prefix" ? 3 : undefined}
                    onChange={(e) => {
                      if (field.key === "prefix") {
                        const onlyAlpha = e.target.value
                          .replace(/[^A-Za-z]/g, "")
                          .slice(0, 3);
                        update(field.key, onlyAlpha.toUpperCase());
                        return;
                      }

                      update(field.key, e.target.value);
                    }}
                  />
                )}
              </div>
            ))}
        </div> */}

        {/* Company Information Card */}
<div className="mb-8 rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
  <h3 className="mb-6 text-lg font-semibold text-gray-900 dark:text-white">
    Company Information
  </h3>

  <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
    {fields
      .filter(
        (field) =>
          companyFields.includes(field.key) &&
          !(field.key === "state" && isUK)
      )
      .map((field) => (
        <div key={field.key}>
          <label className="form-label flex items-center gap-2">
            <span>
              {field.label}
              {isRequiredField(field) && (
                <span className="ml-1 text-red-500">*</span>
              )}
            </span>

            {field.key === "prefix" && (
              <span className="text-xs font-normal text-gray-500 dark:text-gray-400">
                (Max 3 letters)
              </span>
            )}
          </label>

          {field.type === "country" ? (
            <div className="relative">
              <select
                className="form-select"
                value={form.country || ""}
                onChange={(e) => handleCountryChange(e.target.value)}
                disabled={countryLoading}
              >
                <option value="">
                  {countryLoading ? "Loading countries..." : "Select Option"}
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
                value={form.state || ""}
                onChange={(e) => handleStateChange(e.target.value)}
                disabled={!form.country || stateLoading}
              >
                <option value="">
                  {stateLoading
                    ? "Loading states..."
                    : form.country
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
                value={form.city || ""}
                onChange={(e) => update("city", e.target.value)}
                disabled={!form.state || cityLoading}
              >
                <option value="">
                  {cityLoading
                    ? "Loading cities..."
                    : form.state
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
              maxLength={field.key === "prefix" ? 3 : undefined}
              onChange={(e) => {
                if (field.key === "prefix") {
                  const onlyAlpha = e.target.value
                    .replace(/[^A-Za-z]/g, "")
                    .slice(0, 3);

                  update(field.key, onlyAlpha.toUpperCase());
                  return;
                }

                update(field.key, e.target.value);
              }}
            />
          )}
        </div>
      ))}
  </div>
</div>

{/* Customer Information Card */}
<div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
  <h3 className="mb-6 text-lg font-semibold text-gray-900 dark:text-white">
    Customer Information
  </h3>

  <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
    {fields
      .filter((field) => customerFields.includes(field.key))
      .map((field) => (
        <div key={field.key}>
          <label className="form-label">
            {field.label}
            {isRequiredField(field) && (
              <span className="ml-1 text-red-500">*</span>
            )}
          </label>

          {field.type === "file" ? (
            <>
              <input
                id={field.key}
                type="file"
                accept="image/*"
                className="block h-11 w-full cursor-pointer rounded-lg border border-gray-300 bg-white text-sm text-gray-700 shadow-sm outline-none transition
                file:mr-4 file:h-full file:border-0 file:border-r file:border-gray-300 file:bg-gray-100 file:px-4 file:text-sm file:font-medium file:text-gray-700
                hover:border-blue-400 focus:border-blue-500
                dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300
                dark:file:border-gray-700 dark:file:bg-gray-800 dark:file:text-gray-200"
                onChange={(e) =>
                  handleFileChange(field.key, e.target.files?.[0] || null)
                }
              />

              {field.key === "customer_company_logo" &&
                companyLogoPreview && (
                  <div className="mt-3">
                    <p className="mb-2 text-xs font-medium text-gray-500 dark:text-gray-400">
                      Current Company Logo
                    </p>
                    <img
                      src={companyLogoPreview}
                      alt="Company Logo"
                      className="h-20 w-32 rounded-lg border border-gray-200 object-contain p-2 dark:border-gray-700"
                    />
                  </div>
                )}

              {field.key === "customer_company_logo_icon" &&
                companyLogoIconPreview && (
                  <div className="mt-3">
                    <p className="mb-2 text-xs font-medium text-gray-500 dark:text-gray-400">
                      Current Company Logo Icon
                    </p>
                    <img
                      src={companyLogoIconPreview}
                      alt="Company Logo Icon"
                      className="h-20 w-20 rounded-lg border border-gray-200 object-contain p-2 dark:border-gray-700"
                    />
                  </div>
                )}
            </>
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
</div>

        <div className="mt-8 flex items-center gap-5">
          <button
            type="button"
            onClick={handleSave}
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
            onClick={() => navigate("/customer")}
            disabled={saveLoading}
            className="btn-secondary disabled:cursor-not-allowed disabled:opacity-70"
          >
            Cancel
          </button>
        </div>
      </div>
    </>
  );
}

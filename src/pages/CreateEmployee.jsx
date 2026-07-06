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
  { key: "name", label: "Employee Name", type: "text" },
  { key: "role", label: "Select Role", type: "role" },
  { key: "qrcodeaccess", label: "QR Code Access", type: "qrcodeaccess" },
  { key: "email", label: "Email ID", type: "text" },
  { key: "mobilenumber", label: "Contact Number", type: "text" },
  { key: "address", label: "Address Line 1", type: "text" },
  { key: "address_line_2", label: "Address Line 2", type: "text" },
  { key: "country", label: "Select Country", type: "country" },
  { key: "state", label: "Select State", type: "state" },
  { key: "city", label: "Select City", type: "city" },
  { key: "postcode", label: "Post Code", type: "text" },
  { key: "uploadsignatureimg", label: "Upload Signature", type: "file" },
];

export default function CreateEmployee() {
  const navigate = useNavigate();
  const [errors, setErrors] = useState({});
  const [searchParams] = useSearchParams();

  const employeeId = searchParams.get("employee_id");
  const isEditMode = Boolean(employeeId);

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
    name: "",
    role: "",
    qrcodeaccess: "",
    email: "",
    mobilenumber: "",
    postcode: "",
    address: "",
    address_line_2: "",
    country: "",
    state: "",
    city: "",
    uploadsignatureimg: null,
  });

  const [oldSignatureUrl, setOldSignatureUrl] = useState("");

  const [roles, setRoles] = useState([]);
  const [roleLoading, setRoleLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [employeeLoading, setEmployeeLoading] = useState(false);
  const [canShowQRCodeAccess, setCanShowQRCodeAccess] = useState(false);
  const [permissionLoading, setPermissionLoading] = useState(false);

  const [newCityName, setNewCityName] = useState("");
  const [addCityLoading, setAddCityLoading] = useState(false);

  const authUser = JSON.parse(localStorage.getItem("auth_user") || "{}");

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

  // console.log("Selected Country Object:", selectedCountry);
  // console.log("Country:", selectedCountry?.country_name);
  // console.log("isUK:", isUK);

  const selectedRole = roles.find(
    (role) => String(role.id) === String(form.role),
  );

  const isEngineerRole =
    selectedRole?.name?.trim().toLowerCase() === "engineer";

  useEffect(() => {
    getRoleList();

    if (employeeId) {
      getEmployeeById(employeeId);
    }
  }, [employeeId]);

  const isCustomerRole =
    String(form.role) === "3" ||
    selectedRole?.name?.trim().toLowerCase() === "customer";

  const update = (key, value) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [key]: "",
    }));
  };
  const checkLogManagementPermission = async (roleId, clearQrValue = true) => {
    if (!roleId) {
      setCanShowQRCodeAccess(false);

      if (clearQrValue) {
        update("qrcodeaccess", "");
      }

      return false;
    }

    try {
      setPermissionLoading(true);

      const response = await axios.post(
        `${apiUrl}/auth/checkLogManagementPermission`,
        {
          role_id: Number(roleId),
        },
        {
          headers: getAuthHeaders(),
        },
      );

      const writePermission = Number(response?.data?.data?.write || 0);

      if (response?.data?.success && writePermission === 1) {
        setCanShowQRCodeAccess(true);
        return true;
      }

      setCanShowQRCodeAccess(false);

      if (clearQrValue) {
        update("qrcodeaccess", "");
      }

      return false;
    } catch (error) {
      setCanShowQRCodeAccess(false);

      if (clearQrValue) {
        update("qrcodeaccess", "");
      }

      const msg =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        "Failed to check QR code access permission.";

      toast.error(msg);
      return false;
    } finally {
      setPermissionLoading(false);
    }
  };
  const getRoleList = async () => {
    try {
      setRoleLoading(true);
      const roleId = Number(authUser?.role_id);
      console.log(authUser, "vdbhjsbvfdhjsf");
      const payload = {
        created_by_id: null,
        company_id: authUser.company_id,
      };
      const response = await axios.post(`${apiUrl}/auth/rolelisting`, payload, {
        headers: getAuthHeaders(),
      });

      if (response?.data?.success) {
        const filteredRoles = (response?.data?.data || []).filter(
          (role) => ![1, 3].includes(Number(role.id)),
        );

        setRoles(filteredRoles);
      } else {
        toast.error(response?.data?.message || "Role list not found.");
      }
    } catch (error) {
      const msg =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        "Failed to load role list.";

      toast.error(msg);
    } finally {
      setRoleLoading(false);
    }
  };

  const getEmployeeById = async (id) => {
    try {
      const token = getToken();

      if (!token) {
        toast.error("Token not found. Please login again.");
        return;
      }

      setEmployeeLoading(true);

      const response = await axios.post(
        `${apiUrl}/auth/get_employee_by_id`,
        {
          employee_id: String(id),
        },
        {
          headers: getAuthHeaders(),
        },
      );

      if (response?.data?.success) {
        const emp = response?.data?.data;

        const countryId = emp?.countryid ? String(emp.countryid) : "";
        const stateId = emp?.stateid ? String(emp.stateid) : "";
        const cityId = emp?.cityid ? String(emp.cityid) : "";

        setForm({
          name: emp?.name || "",
          role: emp?.role_id ? emp.role_id : "",
          qrcodeaccess:
            emp?.qrcodeaccess !== undefined && emp?.qrcodeaccess !== null
              ? String(emp.qrcodeaccess)
              : emp?.qrcode_access !== undefined && emp?.qrcode_access !== null
                ? String(emp.qrcode_access)
                : "",
          email: emp?.email || "",
          mobilenumber: emp?.mobile_number ? String(emp.mobile_number) : "",
          postcode: emp?.postcode || "",
          address: emp?.address || "",
          address_line_2: emp?.address_line_2 || "",
          country: countryId,
          state: stateId,
          city: cityId,
          uploadsignatureimg: null,
        });
        if (emp?.role_id) {
          await checkLogManagementPermission(emp.role_id, false);
        }

        setOldSignatureUrl(emp?.signature_url || "");

        if (countryId) {
          await getStateList(countryId);
        }

        if (stateId) {
          await getCityList(stateId);
        }
      } else {
        toast.error(response?.data?.message || "Employee details not found.");
      }
    } catch (error) {
      const msg =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        "Failed to load employee details.";

      toast.error(msg);
    } finally {
      setEmployeeLoading(false);
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

    setNewCityName("");

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

    setNewCityName("");

    if (stateId) {
      await getCityList(stateId);
    }
  };

  const handleCityChange = (cityId) => {
    update("city", cityId);

    if (cityId !== "other") {
      setNewCityName("");
    }
  };

  const handleAddCity = async () => {
    const cityName = newCityName.trim();

    if (!cityName) {
      toast.error("Please enter city name.");
      return;
    }

    const stateIdForCity = isUK ? "37" : form.state;

    if (!stateIdForCity) {
      toast.error("Please select state first.");
      return;
    }

    try {
      setAddCityLoading(true);

      const response = await axios.post(
        `${apiUrl}/auth/insertcity`,
        {
          stateid: Number(stateIdForCity),
          cityname: cityName,
        },
        {
          headers: getAuthHeaders(),
        },
      );

      if (response?.data?.success) {
        toast.success(response?.data?.message || "City added successfully");

        const newCityId =
          response?.data?.data?.cityId ||
          response?.data?.data?.cityid ||
          response?.data?.data?.iCityId;

        await getCityList(stateIdForCity, true);

        setForm((prev) => ({
          ...prev,
          city: newCityId ? String(newCityId) : "",
        }));

        setNewCityName("");
      } else {
        toast.error(response?.data?.message || "Failed to add city.");
      }
    } catch (error) {
      const msg =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        "Failed to add city.";

      toast.error(msg);
    } finally {
      setAddCityLoading(false);
    }
  };

  const handleClear = () => {
    setForm({
      name: "",
      role: "",
      qrcodeaccess: "",
      email: "",
      mobilenumber: "",
      postcode: "",
      address: "",
      address_line_2: "",
      country: "",
      state: "",
      city: "",
      uploadsignatureimg: null,
    });

    setOldSignatureUrl("");
    setNewCityName("");

    const fileInput = document.getElementById("uploadsignatureimg");
    if (fileInput) {
      fileInput.value = "";
    }
  };
  const isRequiredField = (field) => {
    if (
      [
        "name",
        "role",
        "email",
        "mobilenumber",
        "postcode",
        "address",
        "country",
        "state",
        "city",
      ].includes(field.key)
    ) {
      return true;
    }

    if (field.key === "state" && !isUK) {
      return true;
    }

    if (field.key === "qrcodeaccess" && canShowQRCodeAccess) {
      return true;
    }

    // if (field.key === "uploadsignatureimg" && isEngineerRole) {
    //   return true;
    // }
    if (field.key === "uploadsignatureimg" && canShowQRCodeAccess) {
      return true;
    }
    return false;
  };

  const validateForm = () => {
    const newErrors = {};

    if (!form.name.trim()) {
      newErrors.name = "Employee Name is required";
    }

    if (!form.role) {
      newErrors.role = "Role is required";
    }

    if (canShowQRCodeAccess && form.qrcodeaccess === "") {
      newErrors.qrcodeaccess = "QR Code Access is required";
    }

    if (!form.email.trim()) {
      newErrors.email = "Email is required";
    }

    if (!form.mobilenumber.trim()) {
      newErrors.mobilenumber = "Contact Number is required";
    }

    if (!form.postcode.trim()) {
      newErrors.postcode = "Post Code is required";
    }

    if (!form.address.trim()) {
      newErrors.address = "Address is required";
    }

    if (!form.country) {
      newErrors.country = "Country is required";
    }

    if (!isUK && !form.state) {
      newErrors.state = "State is required";
    }

    if (!form.city || form.city === "other") {
      newErrors.city = "City is required";
    }

    if (canShowQRCodeAccess && !form.uploadsignatureimg && !oldSignatureUrl) {
      newErrors.uploadsignatureimg = "Signature is required";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      toast.error("Please fill all required fields.");
      return false;
    }

    return true;
  };

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

      if (isEditMode) {
        formData.append("employee_id", String(employeeId));
      }
      formData.append("company_id", authUser?.company_id);
      formData.append("name", form.name);
      formData.append("role_id", form.role);
      formData
      formData.append(
        "qrcodeaccess",
        canShowQRCodeAccess ? form.qrcodeaccess : "0",
      );
      formData.append("email", form.email);
      formData.append("mobilenumber", form.mobilenumber);
      formData.append("postcode", form.postcode);
      formData.append("address", form.address);
      formData.append("address_line_2", form.address_line_2);
      formData.append("countryid", form.country);
      formData.append("stateid", isUK ? "37" : form.state);
      formData.append("cityid", form.city);

      if (form.uploadsignatureimg) {
        formData.append("uploadsignatureimg", form.uploadsignatureimg);
      }

      const apiEndpoint = isEditMode
        ? `${apiUrl}/auth/update_employee`
        : `${apiUrl}/auth/create_employee`;

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
            ? "Employee updated successfully"
            : "Employee created successfully"),
        );

        if (response?.data?.generatedPassword) {
          toast.success(
            `Generated Password: ${response.data.generatedPassword}`,
          );
        }

        navigate("/employee");
      } else {
        toast.error(
          response?.data?.message ||
          (isEditMode
            ? "Failed to update employee."
            : "Failed to create employee."),
        );
      }
    } catch (error) {
      const msg =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        (isEditMode
          ? "Failed to update employee."
          : "Failed to create employee.");

      toast.error(msg);
    } finally {
      setSaveLoading(false);
    }
  };

  return (
    <>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {isEditMode ? "Edit Employee" : "Create Employee"}
        </h1>

        <Breadcrumb
          pageName={isEditMode ? "Edit Employee" : "Create Employee"}
          parentPage="Employee Management"
        />
      </div>

      <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        {employeeLoading ? (
          <div className="py-10 text-center text-gray-500 dark:text-gray-400">
            Loading employee details...
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {fields
                .filter((field) => {
                  if (field.key === "uploadsignatureimg" && !canShowQRCodeAccess) {
                    return false;
                  }

                  if (field.key === "qrcodeaccess" && !canShowQRCodeAccess) {
                    return false;
                  }
                  if (field.key === "state" && isUK) {
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
                      {/* {field.key === "qrcodeaccess" && (
                        <span className="ml-1 text-red-500">*</span>
                      )}
                      {field.key === "uploadsignatureimg" && isEngineerRole && (
                        <span className="ml-1 text-red-500">*</span>
                      )} */}
                    </label>

                    {field.type === "role" ? (
                      <div className="relative">
                        <select
                          className={`form-select ${errors[field.key] ? "border-red-500 focus:border-red-500" : ""
                            }`}
                          value={form.role || ""}
                          // onChange={(e) => update("role", e.target.value)}
                          onChange={async (e) => {
                            const roleId = e.target.value;
                            const roleData = roles.find(
                              (role) => String(role.id) === String(roleId),
                            );

                            setForm((prev) => ({
                              ...prev,
                              role: roleId,
                              qrcodeaccess: "",
                              uploadsignatureimg:
                                String(roleId) === "3" ||
                                  roleData?.name?.trim().toLowerCase() ===
                                  "customer"
                                  ? null
                                  : prev.uploadsignatureimg,
                            }));

                            await checkLogManagementPermission(roleId, true);

                            if (
                              String(roleId) === "3" ||
                              roleData?.name?.trim().toLowerCase() ===
                              "customer"
                            ) {
                              setOldSignatureUrl("");

                              const fileInput =
                                document.getElementById("uploadsignatureimg");
                              if (fileInput) {
                                fileInput.value = "";
                              }
                            }
                          }}
                          disabled={roleLoading}
                        >
                          <option value="">
                            {roleLoading ? "Loading roles..." : "Select Option"}
                          </option>

                          {roles.map((role) => (
                            <option key={role.id} value={role.id}>
                              {role.name}
                            </option>
                          ))}
                        </select>
                        <SelectArrow />
                      </div>
                    ) : field.type === "qrcodeaccess" ? (
                      <div className="relative">
                        <select
                          className="form-select"
                          value={form.qrcodeaccess}
                          onChange={(e) =>
                            update("qrcodeaccess", e.target.value)
                          }
                          required
                        >
                          <option value="">
                            {permissionLoading
                              ? "Checking permission..."
                              : "Select Option"}
                          </option>
                          <option value="1">Yes</option>
                          <option value="0">No</option>
                        </select>
                        <SelectArrow />
                      </div>
                    ) : field.type === "country" ? (
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
                      <div>
                        <div className="relative">
                          <select
                            className={`form-select ${errors[field.key] ? "border-red-500 focus:border-red-500" : ""
                              }`}
                            value={form.city || ""}
                            onChange={(e) => handleCityChange(e.target.value)}
                            disabled={(!form.state && !isUK) || cityLoading}
                          >
                            <option value="">
                              {cityLoading
                                ? "Loading cities..."
                                : (form.state || isUK)
                                  ? "Select Option"
                                  : "Select state first"}
                            </option>

                            {cities.map((city) => (
                              <option key={city.iCityId} value={city.iCityId}>
                                {city.strCityName}
                              </option>
                            ))}

                            {(form.state || isUK) && <option value="other">Other</option>}
                          </select>
                          <SelectArrow />
                        </div>

                        {form.city === "other" && (
                          <div className="mt-3 flex gap-3">
                            <input
                              type="text"
                              className="form-input"
                              placeholder="Enter new city"
                              value={newCityName}
                              onChange={(e) => setNewCityName(e.target.value)}
                            />

                            <button
                              type="button"
                              onClick={handleAddCity}
                              disabled={addCityLoading}
                              className="btn-primary whitespace-nowrap disabled:cursor-not-allowed disabled:opacity-70"
                            >
                              {addCityLoading ? "Adding..." : "Add City"}
                            </button>
                          </div>
                        )}
                      </div>
                    ) : field.type === "file" ? (
                      <div className="mx-auto w-full max-w-md">
                        <input
                          id="uploadsignatureimg"
                          type="file"
                          accept="image/*"
                          required={canShowQRCodeAccess && !oldSignatureUrl}
                          className="block w-full cursor-pointer rounded-lg border border-gray-300 bg-white text-sm text-gray-700 shadow-sm outline-none transition file:mr-4 file:border-0 file:border-r file:border-gray-300 file:bg-gray-100 file:px-4 file:py-3 file:text-sm file:font-medium file:text-gray-700 hover:border-blue-400 focus:border-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:file:border-gray-700 dark:file:bg-gray-800 dark:file:text-gray-200"
                          onChange={(e) =>
                            update(
                              "uploadsignatureimg",
                              e.target.files?.[0] || null,
                            )
                          }
                        />

                        {isEditMode && oldSignatureUrl && (
                          <div className="mt-3 text-center">
                            <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">
                              Current Signature
                            </p>

                            <img
                              src={oldSignatureUrl}
                              alt="Signature"
                              className="mx-auto h-20 w-full max-w-[170px] rounded border border-gray-300 object-contain dark:border-gray-700"
                            />
                          </div>
                        )}
                      </div>
                    ) : (
                      <input
                        type="text"
                        className={`form-input ${errors[field.key] ? "border-red-500 focus:border-red-500" : ""
                          }`}
                        value={form[field.key] || ""}
                        onChange={(e) => update(field.key, e.target.value)}
                      />
                    )}
                  </div>
                ))}
            </div>

            <div className="mt-8 flex items-center gap-5">
              <button
                type="button"
                onClick={handleSave}
                disabled={saveLoading}
                className="btn-primary disabled:cursor-not-allowed disabled:opacity-70"
              >
                {saveLoading
                  ? isEditMode
                    ? "Updating..."
                    : "Saving..."
                  : isEditMode
                    ? "Update"
                    : "Save"}
              </button>

              {!isEditMode && (
                <button
                  type="button"
                  onClick={handleClear}
                  disabled={saveLoading}
                  className="btn-secondary disabled:cursor-not-allowed disabled:opacity-70"
                >
                  Clear
                </button>
              )}

              <button
                type="button"
                onClick={() => navigate("/employee")}
                disabled={saveLoading}
                className="btn-secondary disabled:cursor-not-allowed disabled:opacity-70"
              >
                Cancel
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}

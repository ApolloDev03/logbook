import { useEffect, useState } from "react";
import axios from "axios";
import { FiEdit2, FiX } from "react-icons/fi";

import userImg from "../assets/images/user/owner.jpg";
import Breadcrumb from "../components/ui/Breadcrumb";
import { apiUrl } from "../config";
import { useApp } from "../context/AppContext";
import { toast } from "react-toastify";
import defaultLogo from "../assets/images/defaultlogo.jpeg";
import { useNavigate } from "react-router-dom";

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
const getAuthUser = () => {
  try {
    return JSON.parse(localStorage.getItem("auth_user") || "{}");
  } catch {
    return {};
  }
};

const getProfileImage = (profile) => {
  const image =
    profile?.profile_image_url;

  if (!image) return defaultLogo;

  if (image.startsWith("http://") || image.startsWith("https://")) {
    return image;
  }

  return `${apiUrl.replace("/api", "")}/${image.replace(/^\/+/, "")}`;
};

const getProfileDisplayName = (profile) => {
  if (Number(profile?.role_id) === 3) {
    return (
      profile?.customer_company_name ||
      profile?.company_name ||
      profile?.customer_name ||
      profile?.companyName ||
      profile?.name ||
      "-"
    );
  }

  return profile?.name || "-";
};

export default function Profile() {
  const [darkMode, setDarkMode] = useState(false);
  const [profileInfoModal, setProfileInfoModal] = useState(false);
  const [addressModal, setAddressModal] = useState(false);

  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState(null);

  const [changePasswordModal, setChangePasswordModal] = useState(false);

  const fetchProfile = async () => {
    try {
      setLoading(true);

      const res = await axios.post(
        `${apiUrl}/auth/profile`,
        {},
        {
          headers: getAuthHeaders(),
        },
      );

      if (res.data?.success) {
        setProfile(res.data.data);
      }
    } catch (error) {
      console.error("Profile API Error:", error);
      toast.error(error.response?.data?.message || "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const profileImage = getProfileImage(profile);



  return (
    <div className={darkMode ? "dark" : ""}>
      <main>
        <div className="mx-auto max-w-[1536px]">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">
              Profile
            </h2>

            <Breadcrumb pageName="Profile" />
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
            <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-7">
              Profile
            </h3>

            {loading ? (
              <div className="py-10 text-center text-gray-500">
                Loading profile...
              </div>
            ) : (
              <>
                <div className="mb-6 rounded-2xl border border-gray-200 p-5 dark:border-gray-800">
                  <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                    <div className="flex w-full flex-col items-center gap-6 xl:flex-row">
                      <div className="h-20 w-20 overflow-hidden rounded-full border border-gray-200 dark:border-gray-800">
                        <img
                          src={profileImage}
                          alt="user"
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = defaultLogo;
                          }}
                        />
                      </div>

                      <div>
                        <h4 className="mb-2 text-center text-lg font-semibold text-gray-800 dark:text-white/90 xl:text-left">
                          {getProfileDisplayName(profile)}
                        </h4>

                        <div className="flex flex-col items-center gap-1 text-center xl:flex-row xl:gap-3 xl:text-left">
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {profile?.strCityName || "-"},{" "}
                            {profile?.country_name || "-"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <InfoSection
                  title="Personal Information"
                  onEdit={() => setProfileInfoModal(true)}
                  items={[
                    ...(Number(profile?.role_id) === 3
                      ? [
                        {
                          label: "Company Name",
                          value: getProfileDisplayName(profile),
                        },
                      ]
                      : []),
                    {
                      label:
                        Number(profile?.role_id) === 3
                          ? "Engineer Name"
                          : "Name",
                      value: profile?.name || "-",
                    },
                    { label: "Email address", value: profile?.email || "-" },
                    {
                      label: "Phone",
                      value: profile?.mobile_number
                        ? `${profile.mobile_number}`
                        : "-",
                    },
                  ]}
                />

                <InfoSection
                  title="Address"
                  onEdit={() => setAddressModal(true)}
                  items={[
                    {
                      label: "Country",
                      value: profile?.country_name || "-",
                    },
                    {
                      label: "State",
                      value: profile?.strStateName || "-",
                    },
                    {
                      label: "City",
                      value: profile?.strCityName || "-",
                    },
                    {
                      label: "Post Code",
                      value: profile?.postcode || "-",
                    },
                    {
                      label: "Address Line 1",
                      value: profile?.address || "-",
                    },
                    {
                      label: "Address Line 2",
                      value: profile?.address_line_2 || "-",
                    },
                  ]}
                />

                <InfoSection
                  title="Change Password"
                  onEdit={() => setChangePasswordModal(true)}
                  items={[
                    {
                      label: "Password",
                      value: "••••••••••••",
                    },
                  ]}
                />
              </>
            )}
          </div>
        </div>
      </main>

      {profileInfoModal && (
        <ProfileInfoModal
          profile={profile}
          onClose={() => setProfileInfoModal(false)}
          onRefresh={fetchProfile}
        />
      )}

      {addressModal && (
        <AddressModal
          profile={profile}
          onClose={() => setAddressModal(false)}
          onRefresh={fetchProfile}
        />
      )}

      {changePasswordModal && (
        <ChangePasswordModal
          onClose={() => setChangePasswordModal(false)}
        />
      )}
    </div>
  );
}

function getRoleName(roleId) {
  if (Number(roleId) === 1) return "Admin";
  if (Number(roleId) === 2) return "Customer";
  if (Number(roleId) === 3) return "Engineer";
  return "-";
}

function InfoSection({ title, items, onEdit }) {
  return (
    <div className="mb-6 rounded-2xl border border-gray-200 p-5 dark:border-gray-800 lg:p-6 last:mb-0">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="w-full">
          <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-6">
            {title}
          </h4>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-7 2xl:gap-x-32">
            {items.map((item, index) => (
              <div key={index}>
                <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                  {item.label}
                </p>

                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={onEdit}
          className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-5 py-3 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 lg:inline-flex lg:w-auto"
        >
          <FiEdit2 size={17} />
          Edit
        </button>
      </div>
    </div>
  );
}

function ModalWrapper({ title, children, onClose }) {
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEsc);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center bg-slate-200/50 px-4 py-6 backdrop-blur-[1px] sm:px-6"
      onMouseDown={onClose}
    >
      <div
        className="scrollbar-hide relative max-h-[90vh] w-full max-w-[700px] overflow-y-auto rounded-[24px] bg-white p-5 shadow-xl dark:bg-gray-900 sm:p-8 lg:p-10"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-400 hover:bg-gray-200 dark:bg-gray-800 sm:right-5 sm:top-5 sm:h-11 sm:w-11"
        >
          <FiX size={24} />
        </button>

        <h2 className="mb-3 pr-12 text-xl font-bold text-gray-800 dark:text-white sm:text-2xl">
          {title}
        </h2>

        <p className="mb-6 pr-8 text-sm text-gray-500 dark:text-gray-400 sm:mb-8">
          Update your details to keep your profile up-to-date.
        </p>

        {children}
      </div>
    </div>
  );
}

function ProfileInfoModal({ profile, onClose, onRefresh }) {
  const [authUser, setAuthUser] = useState({});
  const roleId = Number(profile?.role_id);

  // ✅ Email always disabled
  const isEmailDisabled = true;

  // ✅ role_id 1 => name enable
  // ✅ role_id 3 => name enable
  // ✅ other role_id => name disabled
  const isNameDisabled = roleId !== 1 && roleId !== 3;

  // ✅ role_id 3 => company name show and disabled
  const showCompanyName = roleId === 3;

  const companyName =
    profile?.customer_company_name ||
    profile?.company_name ||
    profile?.customer_name ||
    profile?.companyName ||
    "";

  const [formData, setFormData] = useState({
    company_name: companyName,
    name: profile?.name || "",
    email: profile?.email || "",
    mobile_number: profile?.mobile_number || "",
  });


  const isCustomer =
    Number(authUser?.role_id) === 3 ||
    Number(authUser?.customer?.role_id) === 3;

  const [companyLogoFile, setCompanyLogoFile] = useState(null);
  const [companyLogoIconFile, setCompanyLogoIconFile] = useState(null);

  const [companyLogoPreview, setCompanyLogoPreview] = useState("");
  const [companyLogoIconPreview, setCompanyLogoIconPreview] = useState("");
  const [profileImage, setProfileImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(getProfileImage(profile));
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    setAuthUser(getAuthUser());
  }, []);
  useEffect(() => {
    if (!authUser) return;

    setCompanyLogoPreview(authUser?.customer?.logo_url || "");
    setCompanyLogoIconPreview(authUser?.customer?.logo_icon_url || "");
  }, [authUser]);
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "email") return;
    if (name === "company_name") return;
    if (name === "name" && isNameDisabled) return;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleProfileImageChange = (e) => {
    const file = e.target.files?.[0] || null;

    setProfileImage(file);

    if (file) {
      setPreviewImage(URL.createObjectURL(file));
    } else {
      setPreviewImage(getProfileImage(profile));
    }
  };
  const handleCompanyLogoIconChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    setCompanyLogoIconFile(file);
    setCompanyLogoIconPreview(URL.createObjectURL(file));
  };
  const handleCompanyLogoChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    setCompanyLogoFile(file);
    setCompanyLogoPreview(URL.createObjectURL(file));
  };
  const handleSave = async () => {
    try {
      setSaving(true);

      const data = new FormData();

      data.append("name", formData.name);
      data.append("email", profile.email);
      data.append("mobile_number", formData.mobile_number);
      data.append("postcode", profile.postcode || "");
      data.append("address", profile.address || "");
      data.append("countryid", profile.countryid || "");
      data.append("stateid", profile.stateid || "");
      data.append("cityid", profile.cityid || "");
      data.append("role_id", profile.role_id);

      if (Number(profile.role_id) === 3) {
        data.append(
          "customer_company_name",
          formData.company_name
        );
      }

      if (profileImage) {
        data.append("profile_image", profileImage);
      }

      if (companyLogoFile) {
        data.append(
          "customer_company_logo",
          companyLogoFile
        );
      }

      if (companyLogoIconFile) {
        data.append(
          "customer_company_logo_icon",
          companyLogoIconFile
        );
      }
      const token = getToken();

      const res = await axios.post(`${apiUrl}/auth/updateProfile`, data, {
        headers: {
          Authorization: token,
          token: token,
          "x-access-token": token,
          "Content-Type": "multipart/form-data",
        },
      });

      if (res.data?.success) {
        const authUser = getAuthUser();

        // Update profile image
        if (res.data.profile_image_url) {
          authUser.profile_image_url = res.data.profile_image_url;
        }

        // Update customer logo
        if (authUser.customer) {
          authUser.customer = {
            ...authUser.customer,
            logo_url:
              res.data.company_logo_url ??
              authUser.customer.logo_url,

            logo_icon_url:
              res.data.company_logo_icon_url ??
              authUser.customer.logo_icon_url,
          };
        }

        // Save updated object
        localStorage.setItem(
          "auth_user",
          JSON.stringify(authUser)
        );

        // Update state
        setAuthUser(authUser);

        // Update previews
        setCompanyLogoPreview(authUser.customer?.logo_url || "");
        setCompanyLogoIconPreview(authUser.customer?.logo_icon_url || "");

        if (res.data.profile_image_url) {
          setPreviewImage(res.data.profile_image_url);
        }

        toast.success(res.data.message);

        await onRefresh();

        onClose();
        window.location.reload();
      }
      else {
        toast.error(res.data?.message || "Profile update failed");
      }
    } catch (error) {
      console.error("Update Profile Error:", error);
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModalWrapper title="Edit Personal Information" onClose={onClose}>
      <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white">
        Personal Information
      </h3>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {showCompanyName && (
          <Input
            label="Company Name"
            name="company_name"
            value={formData.company_name}
            onChange={handleChange}
            disabled={true}
            helperText="Company name can not be changed."
          />
        )}

        <Input
          label={roleId === 3 ? "Engineer Name" : "Name"}
          name="name"
          value={formData.name}
          onChange={handleChange}
          disabled={isNameDisabled}
          helperText={isNameDisabled ? "Name can not be changed." : ""}
        />

        <Input
          label="Email Address"
          name="email"
          value={formData.email}
          onChange={handleChange}
          disabled={isEmailDisabled}
          helperText="Email is unique identity and can not be changed."
        />

        <Input
          label="Phone"
          name="mobile_number"
          value={formData.mobile_number}
          onChange={handleChange}
        />
        {isCustomer && (
          <>
            <div className="md:col-span-1">
              <label className="mb-2 block font-semibold">
                Company Logo
              </label>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="h-20 w-24 shrink-0 overflow-hidden    dark:border-gray-800">
                  <img
                    src={companyLogoPreview}
                    alt="profile"
                    className=" object-cover"
                  />
                </div>

                <input
                  type="file"
                  accept="image/*"
                  onChange={handleCompanyLogoChange}
                  className="h-11 w-full rounded-lg border border-gray-300 text-sm text-gray-500 file:mr-4 file:h-full file:border-0 file:border-r file:border-gray-300 file:bg-white file:px-4 file:text-sm file:font-medium file:text-gray-700 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400"
                />
              </div>

            </div>

            <div className="md:col-span-1">
              <label className="mb-2 block font-semibold">
                Company Logo Icon
              </label>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="h-20 w-24 shrink-0 overflow-hidden   dark:border-gray-800">
                  <img
                    src={companyLogoIconPreview}
                    alt="profile"
                    className=" object-cover"
                  />
                </div>

                <input
                  type="file"
                  accept="image/*"
                  onChange={handleCompanyLogoIconChange}
                  className="h-11 w-full rounded-lg border border-gray-300 text-sm text-gray-500 file:mr-4 file:h-full file:border-0 file:border-r file:border-gray-300 file:bg-white file:px-4 file:text-sm file:font-medium file:text-gray-700 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400"
                />
              </div>

            </div>
          </>
        )}
        {/* Profile image last */}
        <div className="md:col-span-1">
          <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
            Profile Picture
          </label>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="h-20 w-20 shrink-0 overflow-hidden rounded-full border border-gray-200 dark:border-gray-800">
              <img
                src={previewImage || defaultLogo}
                alt="profile"
                className="h-full w-full object-cover"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = defaultLogo;
                }}
              />
            </div>

            <input
              type="file"
              accept="image/*"
              onChange={handleProfileImageChange}
              className="h-11 w-full rounded-lg border border-gray-300 text-sm text-gray-500 file:mr-4 file:h-full file:border-0 file:border-r file:border-gray-300 file:bg-white file:px-4 file:text-sm file:font-medium file:text-gray-700 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400"
            />
          </div>
        </div>

      </div>

      <ModalActions onClose={onClose} onSave={handleSave} saving={saving} />
    </ModalWrapper>
  );
}

function AddressModal({ profile, onClose, onRefresh }) {
  const {
    countries,
    statesByCountry,
    citiesByState,
    countryLoading,
    stateLoading,
    cityLoading,
    getCountryList,
    getStateList,
    getCityList,
  } = useApp();

  const [formData, setFormData] = useState({
    postcode: profile?.postcode || "",
    address: profile?.address || "",
    address2: profile?.address_line_2 || "",
    countryid:
      profile?.countryid || profile?.country_id || profile?.intCountryId || "",
    stateid: profile?.stateid || profile?.state_id || profile?.intStateId || "",
    cityid: profile?.cityid || profile?.city_id || profile?.intCityId || "",
  });

  const [saving, setSaving] = useState(false);

  const [newCityName, setNewCityName] = useState("");
  const [addCityLoading, setAddCityLoading] = useState(false);

  const selectedCountryId = String(formData.countryid || "");
  const selectedStateId = String(formData.stateid || "");

  const stateList = statesByCountry?.[selectedCountryId] || [];
  const cityList = citiesByState?.[selectedStateId] || [];
  const selectedCountry = countries.find(
    (item) => String(getCountryId(item)) === String(formData.countryid)
  );

  const isUK =
    selectedCountry &&
    ["uk", "united kingdom"].includes(
      String(getCountryName(selectedCountry)).toLowerCase()
    );
  useEffect(() => {
    getCountryList();
  }, []);

  useEffect(() => {
    if (formData.countryid) {
      getStateList(formData.countryid);
    }
  }, [formData.countryid]);

  useEffect(() => {
    if (formData.stateid) {
      getCityList(formData.stateid);
    }
  }, [formData.stateid]);

  useEffect(() => {
    if (!formData.countryid && profile?.country_name && countries?.length) {
      const selectedCountry = countries.find((item) => {
        return (
          String(getCountryName(item)).toLowerCase() ===
          String(profile.country_name).toLowerCase()
        );
      });

      if (selectedCountry) {
        setFormData((prev) => ({
          ...prev,
          countryid: String(getCountryId(selectedCountry)),
        }));
      }
    }
  }, [countries, profile?.country_name]);

  useEffect(() => {
    if (!formData.stateid && profile?.strStateName && stateList?.length) {
      const selectedState = stateList.find((item) => {
        return (
          String(getStateName(item)).toLowerCase() ===
          String(profile.strStateName).toLowerCase()
        );
      });

      if (selectedState) {
        setFormData((prev) => ({
          ...prev,
          stateid: String(getStateId(selectedState)),
        }));
      }
    }
  }, [stateList, profile?.strStateName]);

  useEffect(() => {
    if (!formData.cityid && profile?.strCityName && cityList?.length) {
      const selectedCity = cityList.find((item) => {
        return (
          String(getCityName(item)).toLowerCase() ===
          String(profile.strCityName).toLowerCase()
        );
      });

      if (selectedCity) {
        setFormData((prev) => ({
          ...prev,
          cityid: String(getCityId(selectedCity)),
        }));
      }
    }
  }, [cityList, profile?.strCityName]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };
  const handleCountryChange = async (e) => {
    const countryid = e.target.value;

    const selected = countries.find(
      (item) => String(getCountryId(item)) === String(countryid)
    );

    const isSelectedUK =
      selected &&
      ["uk", "united kingdom"].includes(
        String(getCountryName(selected)).toLowerCase()
      );

    setFormData((prev) => ({
      ...prev,
      countryid,
      stateid: isSelectedUK ? "37" : "",
      cityid: "",
    }));

    setNewCityName("");

    if (!isSelectedUK && countryid) {
     await getStateList(countryid);
    }

    if (isSelectedUK) {
     await getCityList("37");
    }
  };

  const handleStateChange = async (e) => {
    const stateid = e.target.value;

    setFormData((prev) => ({
      ...prev,
      stateid,
      cityid: "",
    }));

    if (stateid) {
     await getCityList(stateid);
    }
  };

  const handleCityChange = (e) => {
    const cityid = e.target.value;

    setFormData((prev) => ({
      ...prev,
      cityid,
    }));

    if (cityid !== "other") {
      setNewCityName("");
    }
  };

  const handleAddCity = async () => {
    const cityName = newCityName.trim();

    if (!cityName) {
      toast.error("Please enter city name.");
      return;
    }

    const stateIdForCity = isUK ? "37" : formData.stateid;

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
        }
      );

      if (response?.data?.success) {
        toast.success(response?.data?.message || "City added successfully");

        const newCityId =
          response?.data?.data?.cityId ||
          response?.data?.data?.cityid ||
          response?.data?.data?.iCityId;

        await getCityList(stateIdForCity, true);

        setFormData((prev) => ({
          ...prev,
          cityid: newCityId ? String(newCityId) : "",
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

  const emptyToSpace = (value) => {
    const finalValue = String(value ?? "").trim();
    return finalValue === "" ? " " : finalValue;
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      const payload = {
        name: profile?.name || "",
        email: profile?.email || "",
        mobile_number: profile?.mobile_number || "",
        role_id: profile?.role_id || "",
        postcode: emptyToSpace(formData.postcode),
        address: emptyToSpace(formData.address),
        address_line_2: emptyToSpace(formData.address2) || "-",
        countryid: formData.countryid,
        stateid: isUK ? "37" : formData.stateid,
        cityid: formData.cityid,
      };

      const res = await axios.post(`${apiUrl}/auth/updateProfile`, payload, {
        headers: getAuthHeaders(),
      });

      if (res.data?.success) {
        toast.success(res.data?.message || "Profile updated successfully");
        await onRefresh();
        onClose();
      } else {
        toast.error(res.data?.message || "Address update failed");
      }
    } catch (error) {
      console.error("Update Address Error:", error);
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModalWrapper title="Edit Address" onClose={onClose}>
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <SelectInput
          label="Country"
          name="countryid"
          value={String(formData.countryid || "")}
          onChange={handleCountryChange}
          loading={countryLoading}
          options={countries}
          getValue={getCountryId}
          getLabel={getCountryName}
          placeholder="Select Country"
        />
        {!isUK && (
          <SelectInput
            label="State"
            name="stateid"
            value={String(formData.stateid || "")}
            onChange={handleStateChange}
            loading={stateLoading}
            options={stateList}
            getValue={getStateId}
            getLabel={getStateName}
            placeholder="Select State"
            disabled={!formData.countryid}
          />
        )}

        <div>
          <SelectInput
            label="City"
            name="cityid"
            value={String(formData.cityid || "")}
            onChange={handleCityChange}
            loading={cityLoading}
            options={cityList}
            getValue={getCityId}
            getLabel={getCityName}
            placeholder="Select City"
            disabled={!formData.stateid && !isUK}
            showOtherOption={Boolean(formData.stateid || isUK)}
          />

          {formData.cityid === "other" && (
            <div className="mt-3 flex gap-3">
              <input
                type="text"
                className="h-11 w-full rounded-lg border border-gray-300 px-4 text-sm text-gray-800 shadow-sm focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                placeholder="Enter new city"
                value={newCityName}
                onChange={(e) => setNewCityName(e.target.value)}
              />

              <button
                type="button"
                onClick={handleAddCity}
                disabled={addCityLoading}
                className="whitespace-nowrap rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {addCityLoading ? "Adding..." : "Add City"}
              </button>
            </div>
          )}
        </div>

        <Input
          label="Postal Code"
          name="postcode"
          value={formData.postcode}
          onChange={handleChange}
        />

        <div className="">
          <Input
            label="Address Line 1"
            name="address"
            value={formData.address}
            onChange={handleChange}
          />
        </div>
        <div className="">
          <Input
            label="Address Line 2"
            name="address2"
            value={formData.address2}
            onChange={handleChange}
          />
        </div>
      </div>

      <ModalActions onClose={onClose} onSave={handleSave} saving={saving} />
    </ModalWrapper>
  );
}

function ChangePasswordModal({ onClose }) {
  const [formData, setFormData] = useState({
    old_password: "",
    new_password: "",
  });

  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSave = async () => {
    if (!formData.old_password.trim()) {
      toast.error("Old password is required");
      return;
    }

    if (!formData.new_password.trim()) {
      toast.error("New password is required");
      return;
    }

    try {
      setSaving(true);

      const res = await axios.post(
        `${apiUrl}/auth/changePassword`,
        {
          old_password: formData.old_password,
          new_password: formData.new_password,
        },
        {
          headers: getAuthHeaders(),
        }
      );

      if (res.data?.success) {
        toast.success(
          res.data.message || "Password changed successfully"
        );
        onClose();
        localStorage.clear();
        navigate("/signin", { replace: true });
      } else {
        toast.error(res.data?.message || "Failed to change password");
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Something went wrong"
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModalWrapper title="Change Password" onClose={onClose}>
      <div className="grid grid-cols-1 gap-5">
        <div>
          <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
            Old Password
          </label>

          <input
            type="password"
            name="old_password"
            value={formData.old_password}
            onChange={handleChange}
            className="h-11 w-full rounded-lg border border-gray-300 px-4 text-sm shadow-sm focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
            New Password
          </label>

          <input
            type="password"
            name="new_password"
            value={formData.new_password}
            onChange={handleChange}
            className="h-11 w-full rounded-lg border border-gray-300 px-4 text-sm shadow-sm focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
          />
        </div>
      </div>

      <ModalActions
        onClose={onClose}
        onSave={handleSave}
        saving={saving}
      />
    </ModalWrapper>
  );
}

function getCountryId(item) {
  return item?.countryid || item?.country_id || item?.id || "";
}

function getCountryName(item) {
  return (
    item?.country_name ||
    item?.strCountryName ||
    item?.name ||
    item?.country ||
    "-"
  );
}

function getStateId(item) {
  return item?.stateid || item?.state_id || item?.iStateId || item?.id || "";
}

function getStateName(item) {
  return item?.strStateName || "-";
}

function getCityId(item) {
  return item?.cityid || item?.cityId || item?.iCityId || item?.id || "";
}

function getCityName(item) {
  return item?.strCityName || "-";
}

function Input({
  label,
  name,
  value,
  onChange,
  disabled = false,
  helperText = "",
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
        {label}
      </label>

      <input
        type="text"
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`h-11 w-full rounded-lg border border-gray-300 px-4 text-sm shadow-sm focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white ${disabled
          ? "cursor-not-allowed bg-gray-100 text-gray-500 select-none dark:bg-gray-800 dark:text-gray-400"
          : "text-gray-800 focus:border-blue-500"
          }`}
      />

      {helperText ? (
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          {helperText}
        </p>
      ) : null}
    </div>
  );
}

function SelectInput({
  label,
  name,
  value,
  onChange,
  options,
  getValue,
  getLabel,
  placeholder,
  loading,
  disabled,
  showOtherOption = false,
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
        {label}
      </label>

      <div className="relative">
      <select
        name={name}
        value={value || ""}
        onChange={onChange}
        disabled={disabled || loading}
        className="h-11 w-full appearance-none rounded-lg border border-gray-300 px-4 pr-11 text-sm text-gray-800 shadow-sm focus:border-blue-500 focus:outline-none disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:disabled:bg-gray-800"
      >
        <option value="">{loading ? "Loading..." : placeholder}</option>
        {showOtherOption && <option value="other">Other</option>}
        {options?.map((item, index) => {
          const optionValue = String(getValue(item));
          const optionLabel = getLabel(item);

          return (
            <option key={`${optionValue}-${index}`} value={optionValue}>
              {optionLabel}
            </option>
          );
        })}
        
      </select>
      <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
          <svg
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="none"
          >
            <path
              d="M5 7.5L10 12.5L15 7.5"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </div>
    </div>
  );
}

function ModalActions({ onClose, onSave, saving }) {
  return (
    <div className="mt-8 flex flex-col-reverse gap-3 sm:mt-12 sm:flex-row sm:justify-end">
      <button
        type="button"
        onClick={onClose}
        className="w-full rounded-lg border border-gray-300 bg-white px-5 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 sm:w-auto"
      >
        Close
      </button>

      <button
        type="button"
        onClick={onSave}
        disabled={saving}
        className="w-full rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
      >
        {saving ? "Saving..." : "Save Changes"}
      </button>
    </div>
  );
}

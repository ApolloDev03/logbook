import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

import Breadcrumb from "../components/ui/Breadcrumb";
import { apiUrl } from "../config";

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

export default function CreateComponent() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const componentId = searchParams.get("component_id");
  const isEditMode = Boolean(componentId);

  const [form, setForm] = useState({
    componentName: "",
  });

  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  useEffect(() => {
    if (componentId) {
      getComponentById(componentId);
    }
  }, [componentId]);

  const update = (key, value) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const getComponentById = async (id) => {
    try {
      const token = getToken();

      if (!token) {
        toast.error("Token not found. Please login again.");
        return;
      }

      setLoading(true);

      const response = await axios.post(
        `${apiUrl}/auth/get_component_by_id`,
        {
          component_id: Number(id),
        },
        {
          headers: getAuthHeaders(),
        },
      );

      if (response?.data?.success) {
        const component = response?.data?.data;

        setForm({
          componentName: component?.component_name || "",
        });
      } else {
        toast.error(response?.data?.message || "System details not found.");
      }
    } catch (error) {
      const msg =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        "Failed to load System details.";

      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    if (!form.componentName.trim()) {
      toast.error("Please enter System name.");
      return false;
    }

    return true;
  };

  const handleClear = () => {
    setForm({
      componentName: "",
    });
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
        component_name: form.componentName,
      };

      if (isEditMode) {
        payload.component_id = Number(componentId);
      }

      const apiEndpoint = isEditMode
        ? `${apiUrl}/auth/update_component`
        : `${apiUrl}/auth/create_component`;

      const response = await axios.post(apiEndpoint, payload, {
        headers: getAuthHeaders(),
      });

      if (response?.data?.success) {
        toast.success(
          response?.data?.message ||
            (isEditMode
              ? "System updated successfully"
              : "System created successfully"),
        );

        navigate("/component");
      } else {
        toast.error(
          response?.data?.message ||
            (isEditMode
              ? "Failed to update system."
              : "Failed to create system."),
        );
      }
    } catch (error) {
      const msg =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        (isEditMode
          ? "Failed to update system."
          : "Failed to create system.");

      toast.error(msg);
    } finally {
      setSaveLoading(false);
    }
  };

  return (
    <>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {isEditMode ? "Edit System" : "Create System"}
        </h1>

        <Breadcrumb
          pageName={isEditMode ? "Edit System" : "Create System"}
          parentPage="System Management"
        />
      </div>

      <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        {loading ? (
          <div className="py-10 text-center text-gray-500 dark:text-gray-400">
            Loading system details...
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <div className="md:col-span-2">
                <label className="form-label">System Name</label>

                <input
                  type="text"
                  placeholder='Can be added using "," ex. Fire Alarm, Fire Extinguishers'
                  className="form-input"
                  value={form.componentName}
                  onChange={(e) => update("componentName", e.target.value)}
                />

                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  Basically from the single input user can add multiple items.
                </p>
              </div>
            </div>

            <div className="mt-8 flex items-center gap-5">
              <button
                type="submit"
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
                onClick={() => navigate("/component")}
                disabled={saveLoading}
                className="btn-secondary disabled:cursor-not-allowed disabled:opacity-70"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </>
  );
}

import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import axios from "axios";
import Breadcrumb from "../components/ui/Breadcrumb";
import { apiUrl } from "../config";
import { toast } from "react-toastify";

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

export default function CreateMaintenance() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const id = searchParams.get("maintenance_type_id");

  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [dropdownLoading, setDropdownLoading] = useState(false);
  const [typeList, setTypeList] = useState([]);

  const [form, setForm] = useState({
   // type_id: "",
    maintenance_cycle: "",
  });

  const update = (key, value) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const fetchTypeDropdown = async () => {
    try {
      setDropdownLoading(true);

      const res = await axios.post(
        `${apiUrl}/auth/maintenance_type_dropdown_list`,
        {},
        { headers: getAuthHeaders() },
      );

      if (res.data?.success) {
        setTypeList(res.data.data || []);
      } else {
        toast.error(res.data?.message || "Failed to load type list");
      }
    } catch (error) {
      console.error("Dropdown API Error:", error);
      toast.error(error.response?.data?.message || "Failed to load type list");
    } finally {
      setDropdownLoading(false);
    }
  };
  const fetchMaintenanceById = async () => {
    if (!id) return;

    try {
      setLoading(true);

      const res = await axios.post(
        `${apiUrl}/auth/get_maintenance_type_by_id`,
        { id: id },
        { headers: getAuthHeaders() },
      );

      if (res.data?.success && res.data?.data) {
        const data = res.data.data;

        setForm({
         type_id: data.type_id ? String(data.type_id) : "",          
          maintenance_cycle:  data.maintenance_cycle_name ,
        });
      } else {
        toast.error(res.data?.message || "Failed to load maintenance type");
      }
    } catch (error) {
      console.error("Get Maintenance Type API Error:", error);
      toast.error(
        error.response?.data?.message || "Failed to load maintenance type",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTypeDropdown();
  }, []);

  useEffect(() => {
    fetchMaintenanceById();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // if (!form.type_id) {
    //   toast.error("Please select type");
    //   return;
    // }

    if (!form.maintenance_cycle.trim()) {
      toast.error("Please enter Purpose of Visit");
      return;
    }
    
    const maintenanceCycle = form.maintenance_cycle
  .split(",")
  .map((item) => item.trim())
  .filter((item) => item !== "");

if (maintenanceCycle.length === 0) {
  toast.error("Please enter valid Purpose of Visit");
  return;
}

    try {
      setLoading(true);

      const payload = {
        type_id: String("2"),
        maintenance_cycles: maintenanceCycle,                
      };

      let res;
      //
      if (isEdit) {
        res = await axios.post(
          `${apiUrl}/auth/update_maintenance_type`,
          {
            id: id,
            ...payload,
          },
          { headers: getAuthHeaders() },
        );
      } else {
        res = await axios.post(
          `${apiUrl}/auth/create_maintenance_type`,
          payload,
          { headers: getAuthHeaders() },
        );
      }

      if (res.data?.success) {
        toast.success(res.data.message || "Saved successfully");

        setTimeout(() => {
          navigate("/maintenance-type");
        }, 800);
      } else {
        toast.error(res.data?.message || "Something went wrong");
      }
    } catch (error) {
      console.error("Save Maintenance Type API Error:", error);
      toast.error(
        error.response?.data?.message || "Failed to save maintenance type",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setForm({
  //    type_id: "",
      maintenance_cycle: "",
    });
  };

  return (
    <>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {isEdit ? "Edit Purpose of Visit" : "Create Purpose of Visit"}
        </h1>

        <Breadcrumb
          pageName={
            isEdit ? "Edit Purpose of Visit" : "Create Purpose of visit"
          }
          parentPage="Purpose of Visit Management"
        />
      </div>

      <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {/* <div>
              <label className="form-label">Type</label>

              <div className="relative">
                <select
                  className="form-select"
                  value={form.type_id}
                  onChange={(e) => update("type_id", e.target.value)}
                  disabled={dropdownLoading || loading}
                >
                  <option value="">
                    {dropdownLoading ? "Loading..." : "Select Type"}
                  </option>

                  {typeList.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>

                <SelectArrow />
              </div>
            </div> */}

            <div>
              <label className="form-label">Purpose of Visit</label>
 <input
                type="hidden"
                name={form.type_id}
                value="2"
              />
               <input
                type="hidden"
                name="id"
                value={form.maintenance_cycle_id}
              />
              <input
                type="text"
                placeholder="Enter Purpose of Visit"
                className="form-input"
                value={form.maintenance_cycle}
                onChange={(e) => update("maintenance_cycle", e.target.value)}
                disabled={loading}
              />

           
            </div>
          </div>

          <div className="flex items-center gap-5 mt-8">
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Saving..." : isEdit ? "Update" : "Save"}
            </button>

            <button
              type="button"
              onClick={handleClear}
              className="btn-secondary"
              disabled={loading}
            >
              Clear
            </button>

            <button
              type="button"
              onClick={() => navigate("/maintenance-type")}
              className="btn-secondary"
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

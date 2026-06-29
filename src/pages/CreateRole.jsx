import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import Breadcrumb from "../components/ui/Breadcrumb";
import { apiUrl } from "../config";

function PermRow({ module, read, write, onRead, onWrite }) {
  return (
    <tr className="border-b border-gray-100 dark:border-gray-800">
      <td className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400 sm:px-6">
        {module?.permission_name}
      </td>

      <td className="px-5 py-4 sm:px-6">
        <CheckboxCell checked={read} onChange={onRead} />
      </td>

      <td className="px-5 py-4 sm:px-6">
        <CheckboxCell checked={write} onChange={onWrite} />
      </td>
    </tr>
  );
}

function CheckboxCell({ checked, onChange }) {
  return (
    <label className="flex cursor-pointer items-center">
      <input
        type="checkbox"
        className="sr-only"
        checked={checked}
        onChange={onChange}
      />

      <div
        className={`flex h-5 w-5 items-center justify-center rounded-md border-[1.25px] transition-colors hover:border-brand-500 ${
          checked
            ? "border-brand-500 bg-brand-500"
            : "border-gray-300 dark:border-gray-700"
        }`}
      >
        <span className={checked ? "" : "opacity-0"}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path
              d="M11.67 3.5L5.25 9.92L2.33 7"
              stroke="white"
              strokeWidth="1.94"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </div>
    </label>
  );
}

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

export default function CreateRole() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const role_Id = searchParams.get("role_id");
  const authUser = JSON.parse(localStorage.getItem("auth_user") || "{}");

  const authRoleId = Number(authUser?.role_id);
  const editRoleId = role_Id ? Number(role_Id) : null;
  const isEditMode = Boolean(editRoleId);

  const [roleName, setRoleName] = useState("");
  const [permissions, setPermissions] = useState([]);

  const [read, setRead] = useState([]);
  const [write, setWrite] = useState([]);

  const [loading, setLoading] = useState(false);
  const [permissionLoading, setPermissionLoading] = useState(false);

  const allRead = read.length > 0 && read.every(Boolean);
  const allWrite = write.length > 0 && write.every(Boolean);

  useEffect(() => {
    initPage();
  }, [editRoleId]);
  const normalizePermissionName = (name = "") =>
    String(name)
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "");

  const isRoleThreeRestrictedPermission = (permission) => {
    const name = normalizePermissionName(permission?.permission_name);

    return (
      name.includes("customer") ||
      name.includes("maintenance") ||
      name.includes("manatance") ||
      name.includes("componentmanagement") ||
      name.includes("component")
    );
  };
  const initPage = async () => {
    const permissionList = await getPermissionList();

    if (editRoleId && permissionList.length > 0) {
      await getRoleById(permissionList);
    }
  };
  const getPermissionList = async () => {
    try {
      setPermissionLoading(true);

      const token = getToken();

      if (!token) {
        toast.error("Token not found. Please login again.");
        return [];
      }

      const response = await axios.post(
        `${apiUrl}/auth/permissionlist`,
        {},
        {
          headers: getAuthHeaders(),
        },
      );

      if (response?.data?.success) {
        const list = response?.data?.data || [];

  //     const filteredList =
  // authRoleId === 3 && !isEditMode
  //   ? list.filter(
  //       (permission) => !isRoleThreeRestrictedPermission(permission)
  //     )
  //   : list;
  const filteredList = getAuthAllowedPermissions(list);

setPermissions(filteredList);
setRead(Array(filteredList.length).fill(false));
setWrite(Array(filteredList.length).fill(false));

return filteredList;
      }

      toast.error(response?.data?.message || "Permission list not found.");
      return [];
    } catch (error) {
      const msg =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        "Failed to load permissions.";

      toast.error(msg);
      return [];
    } finally {
      setPermissionLoading(false);
    }
  };

  const getRoleById = async (permissionList) => {
    try {
      setPermissionLoading(true);

      const response = await axios.post(
        `${apiUrl}/auth/getRoleById`,
        {
          role_id: String(role_Id),
        },
        {
          headers: getAuthHeaders(),
        },
      );

      if (response?.data?.success) {
        const roleData = response?.data?.data?.role;
        const rolePermissions = response?.data?.data?.permissions || [];
        setRoleName(roleData?.name || "");
     const readArray = permissionList.map((permission) => {
  const matched = rolePermissions.find(
    (item) => Number(item.permission_id) === Number(permission.permission_id)
  );

  return matched ? Number(matched.read) === 1 : false;
});

const writeArray = permissionList.map((permission) => {
  const matched = rolePermissions.find(
    (item) => Number(item.permission_id) === Number(permission.permission_id)
  );

  return matched ? Number(matched.write) === 1 : false;
});

        setRead(readArray);
        setWrite(writeArray);
      } else {
        toast.error(response?.data?.message || "Role details not found.");
      }
    } catch (error) {
      const msg =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        "Failed to load role details.";

      toast.error(msg);
    } finally {
      setPermissionLoading(false);
    }
  };

  const toggleAllRead = (value) => {
    setRead(read.map(() => value));
  };

  const toggleAllWrite = (value) => {
    setWrite(write.map(() => value));
  };

  const handleClear = () => {
    setRoleName("");
    setRead(Array(permissions.length).fill(false));
    setWrite(Array(permissions.length).fill(false));
  };
const getAuthAllowedPermissions = (permissionList) => {
  // role_id 1 = super admin, all permissions
  if (authRoleId === 1) {
    return permissionList;
  }

  const authPermissions = Array.isArray(authUser?.permissions)
    ? authUser.permissions
    : [];

  return permissionList.filter((permission) =>
    authPermissions.some(
      (authPermission) =>
        Number(authPermission.permission_id) === Number(permission.permission_id) &&
        (Number(authPermission.read) === 1 || Number(authPermission.write) === 1)
    )
  );
};
  const handleSubmit = async () => {
    if (!roleName.trim()) {
      toast.error("Please enter role name.");
      return;
    }
    const hasSelectedPermission =
      read.some((value) => value === true) ||
      write.some((value) => value === true);

    if (!hasSelectedPermission) {
      toast.error("Please select at least one permission.");
      return;
    }
    const token = getToken();

    if (!token) {
      toast.error("Token not found. Please login again.");
      return;
    }

    const selectedPermissions = permissions.map((permission, index) => ({
      permissionid: permission.permission_id,
      read: read[index] ? 1 : 0,
      write: write[index] ? 1 : 0,
    }));

    const payload = {
      company_id:authUser.company_id,
      rolename: roleName,
      permissions: selectedPermissions,
    };

    if (isEditMode) {
      payload.role_id = String(role_Id);
    }

    try {
      setLoading(true);

      const apiEndpoint = isEditMode
        ? `${apiUrl}/auth/updateRole`
        : `${apiUrl}/auth/CreateRole`;

      const response = await axios.post(apiEndpoint, payload, {
        headers: getAuthHeaders(),
      });

      if (response?.data?.success) {
        toast.success(
          response?.data?.message ||
            (isEditMode
              ? "Role updated successfully"
              : "Role & permissions saved successfully"),
        );

        navigate("/roles");
      } else {
        toast.error(
          response?.data?.message ||
            (isEditMode ? "Failed to update role." : "Failed to create role."),
        );
      }
    } catch (error) {
      const msg =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        (isEditMode ? "Failed to update role." : "Failed to create role.");

      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {isEditMode ? "Edit Role" : "Create Role"}
        </h1>

        <Breadcrumb
          pageName={isEditMode ? "Edit Role" : "Create Role"}
          parentPage="Role & Permission"
        />
      </div>

      <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
          <div>
            <label className="form-label">
              Role Name <span className="text-red-500">*</span>
            </label>

            <input
              type="text"
              value={roleName}
              onChange={(e) => setRoleName(e.target.value)}
              className="form-input"
              placeholder="Enter role name"
            />
          </div>
        </div>

        <div className="px-5 py-4">
          <h3 className="text-base font-medium text-gray-800 dark:text-white/90">
            Permission<span className="text-red-500">*</span>
          </h3>
        </div>

        <div className="border-t border-gray-300 pt-5 dark:border-gray-800">
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-800">
                    <th className="px-5 py-3 text-left text-sm text-gray-500 dark:text-gray-400 sm:px-6">
                      Module
                    </th>

                    <th className="px-5 py-3 sm:px-6">
                      <div className="flex items-center gap-2">
                        <CheckboxCell
                          checked={allRead}
                          onChange={(e) => toggleAllRead(e.target.checked)}
                        />

                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          Read
                        </span>
                      </div>
                    </th>

                    <th className="px-5 py-3 sm:px-6">
                      <div className="flex items-center gap-2">
                        <CheckboxCell
                          checked={allWrite}
                          onChange={(e) => toggleAllWrite(e.target.checked)}
                        />

                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          Write
                        </span>
                      </div>
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {permissionLoading ? (
                    <tr>
                      <td
                        colSpan="3"
                        className="px-5 py-8 text-center text-sm text-gray-500 dark:text-gray-400"
                      >
                        Loading permissions...
                      </td>
                    </tr>
                  ) : permissions.length > 0 ? (
                    permissions.map((permission, index) => (
                      <PermRow
                        key={permission.permission_id}
                        module={permission}
                        read={read[index]}
                        write={write[index]}
                        onRead={() =>
                          setRead((prev) =>
                            prev.map((value, i) =>
                              i === index ? !value : value,
                            ),
                          )
                        }
                        onWrite={() =>
                          setWrite((prev) =>
                            prev.map((value, i) =>
                              i === index ? !value : value,
                            ),
                          )
                        }
                      />
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="3"
                        className="px-5 py-8 text-center text-sm text-gray-500 dark:text-gray-400"
                      >
                        No permissions found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex items-center gap-5 pt-5 sm:pt-6">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="btn-primary disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? "Saving..." : isEditMode ? "Update" : "Save"}
            </button>

            <button
              type="button"
              onClick={() => navigate("/roles")}
              disabled={loading}
              className="btn-secondary disabled:cursor-not-allowed disabled:opacity-70"
            >
              Cancel
            </button>

            {!isEditMode && (
              <button
                type="button"
                onClick={handleClear}
                disabled={loading}
                className="btn-secondary disabled:cursor-not-allowed disabled:opacity-70"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

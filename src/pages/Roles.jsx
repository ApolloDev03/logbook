import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

import Breadcrumb from "../components/ui/Breadcrumb";
import Toggle from "../components/ui/Toggle";
import { apiUrl } from "../config";

const EditIcon = () => (
  <svg
    className="h-5 w-5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.586-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.414-8.586z"
    />
  </svg>
);

const DeleteIcon = () => (
  <svg
    className="h-5 w-5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3m-7 0h8"
    />
  </svg>
);

const getPermissionColor = (permission) => {
  const colors = {
    "Role & Permission":
      "bg-blue-50 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400",
    "Roles & Permission":
      "bg-blue-50 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400",
    "Employee Management":
      "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400",
    "Customer Management":
      "bg-orange-50 text-orange-600 dark:bg-orange-500/15 dark:text-orange-400",
    "Building Management":
      "bg-slate-100 text-slate-700 dark:bg-slate-500/15 dark:text-slate-300",
    "System Management":
      "bg-purple-50 text-purple-600 dark:bg-purple-500/15 dark:text-purple-400",
    "Maintenance Type":
      "bg-sky-50 text-sky-600 dark:bg-sky-500/15 dark:text-sky-400",
    "Log Management":
      "bg-cyan-50 text-cyan-600 dark:bg-cyan-500/15 dark:text-cyan-400",
    Reports:
      "bg-green-50 text-green-600 dark:bg-green-500/15 dark:text-green-400",
    All: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400",
  };

  return (
    colors[permission] ||
    "bg-gray-100 text-gray-600 dark:bg-gray-500/15 dark:text-gray-300"
  );
};

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

export default function Roles() {
  const navigate = useNavigate();
  const [sortOrder, setSortOrder] = useState("asc");
  const [roles, setRoles] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("");
  const [statusLoadingId, setStatusLoadingId] = useState(null);

  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedRoleId, setSelectedRoleId] = useState(null);
  const authUser = JSON.parse(localStorage.getItem("auth_user") || "{}");

  const currentRoleId = Number(authUser?.role_id || authUser?.role?.id || 0);

  const rolePermission = (authUser?.permissions || []).find((item) => {
    const permissionName = String(item?.permission_name || "")
      .trim()
      .toLowerCase();

    return (
      Number(item?.permission_id) === 1 ||
      permissionName === "role & permission" ||
      permissionName === "roles & permission"
    );
  });

  const isAdmin = currentRoleId === 1;

  const canReadRole = isAdmin || Number(rolePermission?.read || 0) === 1;
  const canWriteRole = isAdmin || Number(rolePermission?.write || 0) === 1;
  useEffect(() => {
    getRoleList(1);
  }, []);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      getRoleList(1);
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [search, filter]);

  const getRoleList = async (pageNumber = 1, customLimit = limit) => {
    try {
      const token = getToken();

      if (!token) {
        toast.error("Token not found. Please login again.");
        return;
      }

      setLoading(true);

      const roleName = String(authUser?.role_name || "")
        .trim()
        .toLowerCase();

      const payload = {
        page: pageNumber,
        limit: customLimit,
        search: search,
        permission_search: filter,
        created_by_id: null,
        company_id:authUser.company_id,
      };

      const response = await axios.post(`${apiUrl}/auth/rolelist`, payload, {
        headers: getAuthHeaders(),
      });

      if (response?.data?.success) {
        const filteredRoles = (response?.data?.data || []).filter(
          (role) => ![1, 3].includes(Number(role.role_id)),
        );

        setRoles(filteredRoles);
        setPage(response?.data?.page || pageNumber);

        // Frontend side count update
        setTotal(filteredRoles.length);
        setTotalPages(Math.ceil(filteredRoles.length / limit) || 1);
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
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages || newPage === page) return;
    getRoleList(newPage);
  };

  const handleEditRole = (roleId) => {
    navigate(`/create-role?role_id=${roleId}`);
  };

  const openDeleteModal = (id) => {
    setSelectedRoleId(id);
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    if (deleteLoading) return;
    setSelectedRoleId(null);
    setDeleteModalOpen(false);
  };

  const confirmDeleteRole = async () => {
    if (!selectedRoleId) return;

    try {
      const token = getToken();

      if (!token) {
        toast.error("Token not found. Please login again.");
        return;
      }

      setDeleteLoading(true);

      const response = await axios.post(
        `${apiUrl}/auth/deleterole`,
        {
          role_id: String(selectedRoleId),
        },
        {
          headers: getAuthHeaders(),
        },
      );

      if (response?.data?.success) {
        toast.success(response?.data?.message || "Role deleted successfully");
        closeDeleteModal();
        getRoleList(page);
      } else {
        toast.error(response?.data?.message || "Failed to delete role.");
      }
    } catch (error) {
      const msg =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        "Failed to delete role.";

      toast.error(msg);
    } finally {
      setDeleteLoading(false);
    }
  };

  const getShowingStart = () => {
    if (total === 0) return 0;
    return (page - 1) * limit + 1;
  };

  const getShowingEnd = () => {
    return Math.min(page * limit, total);
  };
  const handleUpdateRoleStatus = async (role) => {
    try {
      const token = getToken();

      if (!token) {
        toast.error("Token not found. Please login again.");
        return;
      }

      // API response field is iStatus
      const currentStatus = Number(role.iStatus || 0);
      const newStatus = currentStatus === 1 ? "0" : "1";

      setStatusLoadingId(role.role_id);

      const response = await axios.post(
        `${apiUrl}/auth/updateRoleStatus`,
        {
          roleid: String(role.role_id),
          status: newStatus,
        },
        {
          headers: getAuthHeaders(),
        },
      );

      if (response?.data?.success) {
        toast.success(
          response?.data?.message || "Role status updated successfully",
        );

        // update iStatus, not status
        setRoles((prev) =>
          prev.map((item) =>
            item.role_id === role.role_id
              ? { ...item, iStatus: Number(newStatus) }
              : item,
          ),
        );
      } else {
        toast.error(response?.data?.message || "Failed to update role status.");
      }
    } catch (error) {
      const msg =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        "Failed to update role status.";

      toast.error(msg);
    } finally {
      setStatusLoadingId(null);
    }
  };

  const handleSortByName = () => {
    const newOrder = sortOrder === "asc" ? "desc" : "asc";

    const sortedRoles = [...roles].sort((a, b) => {
      const nameA = String(a.role_name || "").toLowerCase();
      const nameB = String(b.role_name || "").toLowerCase();

      if (newOrder === "asc") {
        return nameA.localeCompare(nameB);
      }

      return nameB.localeCompare(nameA);
    });

    setSortOrder(newOrder);
    setRoles(sortedRoles);
  };
  return (
    <>
      <div className="mb-5 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white sm:text-2xl">
          Roles
        </h1>

        <div className="w-full sm:w-auto">
          <Breadcrumb pageName="Roles" parentPage="Role & Permission" />
        </div>
      </div>

      <div className="card overflow-hidden rounded-xl">
        <div className="m-4 flex flex-col gap-4 sm:m-5 md:m-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="w-full lg:w-1/3">
            <input
              type="text"
              placeholder="Search roles..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            />
          </div>

          <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto">
            {/* <select
              value={filter}
              onChange={(e) => {
                setFilter(e.target.value);
                setPage(1);
              }}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white sm:w-auto"
            >
              <option value="">All Permissions</option>
              <option value="Role & Permission">Role & Permission</option>
              <option value="Employee Management">Employee Management</option>
              <option value="Customer Management">Customer Management</option>
              <option value="Building Management">Building Management</option>
              <option value="Component Management">Component Management</option>
              <option value="Maintenance Type">Maintenance Type</option>
              <option value="Log Management">Log Management</option>
              <option value="Reports">Reports</option>
            </select> */}

            {canWriteRole && (
              <button
                type="button"
                onClick={() => navigate("/create-role")}
                className="btn-gray w-full justify-center sm:w-auto"
              >
                Add Role
              </button>
            )}
          </div>
        </div>

        <div className="w-full overflow-x-auto">
          <table className="w-full min-w-[760px] border border-gray-200 text-left dark:border-gray-800">
            <thead>
              <tr
                onClick={handleSortByName}
                className="border-b border-gray-100 text-base dark:border-gray-800 sm:text-lg"
              >
                <th className="table-th whitespace-nowrap">Role Name</th>
                <th className="table-th whitespace-nowrap">Status</th>
                <th className="table-th whitespace-nowrap">Permission</th>
                <th className="table-th whitespace-nowrap">Action</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan="4"
                    className="px-6 py-10 text-center text-gray-500 dark:text-gray-400"
                  >
                    Loading roles...
                  </td>
                </tr>
              ) : roles.length > 0 ? (
                roles.map((role) => (
                  <tr key={role.role_id} className="table-row">
                    <td className="table-td whitespace-nowrap font-medium">
                      {role.role_name}
                    </td>

                    <td className="table-td whitespace-nowrap">
                      {canWriteRole ? (
                        <Toggle
                          checked={Number(role.iStatus || 0) === 1}
                          onChange={() => handleUpdateRoleStatus(role)}
                          disabled={statusLoadingId === role.role_id}
                        />
                      ) : (
                        <span
                          className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                            Number(role.iStatus || 0) === 1
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {Number(role.iStatus || 0) === 1
                            ? "Active"
                            : "Inactive"}
                        </span>
                      )}
                    </td>

                    <td className="table-td min-w-[300px]">
                      <div className="flex max-w-[520px] flex-wrap gap-1.5">
                        {role.permissions && role.permissions.length > 0 ? (
                          role.permissions.map((permission) => (
                            <span
                              key={`${role.role_id}-${permission.permission_id}`}
                              className={`inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${getPermissionColor(
                                permission.permission_name,
                              )}`}
                            >
                              {permission.permission_name}
                              {/* <span className="ml-1 text-[10px] opacity-70">
                                ({permission.read}
                                {permission.write})
                              </span> */}
                            </span>
                          ))
                        ) : (
                          <span className="text-sm text-gray-400">
                            No permissions
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="table-td whitespace-nowrap">
                      {canWriteRole && (
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => handleEditRole(role.role_id)}
                            className="text-blue-500 transition-colors hover:text-blue-700"
                          >
                            <EditIcon />
                          </button>

                          <button
                            type="button"
                            onClick={() => openDeleteModal(role.role_id)}
                            className="text-red-500 transition-colors hover:text-red-700"
                          >
                            <DeleteIcon />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="4"
                    className="px-6 py-8 text-center text-gray-500 dark:text-gray-400"
                  >
                    No roles found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-3 border-t border-gray-100 px-4 py-4 text-sm text-gray-500 dark:border-gray-800 dark:text-gray-400 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Show
            </span>

            <select
              value={limit}
              onChange={(e) => {
                const newLimit = Number(e.target.value);

                setLimit(newLimit);
                setPage(1);

                // Fetch first page with new limit
                getRoleList(1, newLimit);
              }}
              className="rounded-lg border border-gray-300 px-2 py-2 text-sm dark:border-gray-700 dark:bg-gray-900"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value={200}>200</option>
              <option value={500}>500</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page <= 1 || loading}
              onClick={() => handlePageChange(page - 1)}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              Previous
            </button>

            {Array.from({ length: totalPages }, (_, index) => index + 1).map(
              (pageNumber) => (
                <button
                  key={pageNumber}
                  type="button"
                  disabled={loading}
                  onClick={() => handlePageChange(pageNumber)}
                  className={`rounded-lg border px-3 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${
                    pageNumber === page
                      ? "border-blue-600 bg-blue-600 text-white"
                      : "border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                  }`}
                >
                  {pageNumber}
                </button>
              ),
            )}

            <button
              type="button"
              disabled={page >= totalPages || loading}
              onClick={() => handlePageChange(page + 1)}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              Next
            </button>
          </div>
        </div>

        <div className="block border-t border-gray-100 px-4 py-3 text-xs text-gray-500 dark:border-gray-800 dark:text-gray-400 sm:hidden">
          Swipe left/right to view full table.
        </div>
      </div>

      {deleteModalOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-gray-900/45 px-4 backdrop-blur-[1px]">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl dark:bg-gray-900 sm:p-6">
            <h3 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white sm:text-xl">
              Delete Role
            </h3>

            <p className="mb-6 text-sm text-gray-600 dark:text-gray-400 sm:mb-7 sm:text-base">
              Are you sure you want to delete this role?
            </p>

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={closeDeleteModal}
                disabled={deleteLoading}
                className="rounded-lg border border-gray-300 px-6 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-70 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={confirmDeleteRole}
                disabled={deleteLoading}
                className="rounded-lg bg-red-500 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {deleteLoading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

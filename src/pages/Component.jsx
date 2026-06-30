import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

import Breadcrumb from "../components/ui/Breadcrumb";
import { apiUrl } from "../config";
import { format } from "date-fns";

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
    return (
      JSON.parse(localStorage.getItem("auth_user")) ||
      JSON.parse(localStorage.getItem("user")) ||
      {}
    );
  } catch {
    return {};
  }
};

const getComponentPermission = () => {
  const authUser = getAuthUser();
  const roleId = Number(authUser?.role_id || authUser?.role?.role_id || 0);

  // role_id 1 admin/superadmin = full access
  if (roleId === 1) {
    return {
      read: 1,
      write: 1,
      isAdmin: true,
    };
  }

  const permissions =
    authUser?.permissions ||
    authUser?.permission ||
    authUser?.role_permissions ||
    [];

  const componentPermission = permissions.find((item) => {
    const name = String(
      item?.permission_name ||
        item?.name ||
        item?.module_name ||
        item?.menu_name ||
        "",
    ).toLowerCase();

    return Number(item?.permission_id) === 6 || name.includes("component");
  });

  return {
    read: Number(componentPermission?.read || 0),
    write: Number(componentPermission?.write || 0),
    isAdmin: false,
  };
};
const formatDate = (dateValue) => {
  if (!dateValue) return "-";

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) return "-";

  return format(date, "dd-MM-yyyy");
};
export default function Component() {
  const navigate = useNavigate();
  const [sortOrder, setSortOrder] = useState("asc");
  const [components, setComponents] = useState([]);
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteComponentId, setDeleteComponentId] = useState(null);
  const [permission, setPermission] = useState({
    read: 0,
    write: 0,
    isAdmin: false,
  });
  useEffect(() => {
    const userPermission = getComponentPermission();
    setPermission(userPermission);

    if (
      Number(userPermission.read) === 1 ||
      Number(userPermission.isAdmin) === 1
    ) {
      getComponentList(1);
    } else {
      toast.error("You do not have permission to view systems.");
    }
  }, []);
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      getComponentList(1);
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [search]);

  useEffect(() => {
    if (deleteModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [deleteModalOpen]);

  const getComponentList = async (pageNumber = 1, customLimit = limit) => {
    try {
      const token = getToken();

      if (!token) {
        toast.error("Token not found. Please login again.");
        return;
      }

      setLoading(true);

      const response = await axios.post(
        `${apiUrl}/auth/componentlist`,
        {
          page: pageNumber,
          limit: customLimit,
          search: search,
        },
        {
          headers: getAuthHeaders(),
        },
      );

      if (response?.data?.success) {
        setComponents(response?.data?.data || []);
        setPage(response?.data?.page || pageNumber);
        setTotal(response?.data?.total || 0);
        setTotalPages(response?.data?.total_pages || 1);
      } else {
        toast.error(response?.data?.message || "Systen list not found.");
      }
    } catch (error) {
      const msg =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        "Failed to load Systems.";

      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleEditComponent = (componentId) => {
    navigate(`/create-component?component_id=${componentId}`);
  };

  const openDeleteModal = (id) => {
    setDeleteComponentId(id);
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    if (deleteLoading) return;

    setDeleteComponentId(null);
    setDeleteModalOpen(false);
  };

  const confirmDeleteComponent = async () => {
    if (!deleteComponentId) return;

    try {
      const token = getToken();

      if (!token) {
        toast.error("Token not found. Please login again.");
        return;
      }

      setDeleteLoading(true);

      const response = await axios.post(
        `${apiUrl}/auth/delete_component`,
        {
          component_id: Number(deleteComponentId),
        },
        {
          headers: getAuthHeaders(),
        },
      );

      if (response?.data?.success) {
        toast.success(
          response?.data?.message || "System deleted successfully",
        );

        closeDeleteModal();
        getComponentList(page);
      } else {
        toast.error(response?.data?.message || "Failed to delete System.");
      }
    } catch (error) {
      const msg =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        "Failed to delete System.";

      toast.error(msg);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages || newPage === page) return;

    getComponentList(newPage);
  };

  const getShowingStart = () => {
    if (total === 0) return 0;

    return (page - 1) * limit + 1;
  };

  const getShowingEnd = () => {
    return Math.min(page * limit, total);
  };
  const handleSortByName = () => {
    const newOrder = sortOrder === "asc" ? "desc" : "asc";

    const sortedComponents = [...components].sort((a, b) => {
      const nameA = String(a.component_name || "").toLowerCase();
      const nameB = String(b.component_name || "").toLowerCase();

      if (newOrder === "asc") {
        return nameA.localeCompare(nameB);
      }

      return nameB.localeCompare(nameA);
    });

    setSortOrder(newOrder);
    setComponents(sortedComponents);
  };
  return (
    <>
      <div className="mb-5 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white sm:text-2xl">
          System
        </h1>

        <div className="w-full sm:w-auto">
          <Breadcrumb pageName="System" parentPage="system Management" />
        </div>
      </div>

      <div className="card overflow-hidden rounded-xl">
        <div className="m-4 flex flex-col gap-4 sm:m-5 md:m-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="w-full lg:w-1/3">
            <input
              type="text"
              placeholder="Search systems..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            />
          </div>

          {Number(permission.write) === 1 && (
            <button
              type="button"
              onClick={() => navigate("/create-component")}
              className="btn-gray w-full justify-center sm:w-auto"
            >
              Add System
            </button>
          )}
        </div>

        <div className="w-full overflow-x-auto">
          <table className="w-full min-w-[780px] border border-gray-200 text-left text-sm dark:border-gray-800">
            <thead>
              <tr
                onClick={handleSortByName}
                className="border-b border-gray-100 dark:border-gray-800"
              >
                <th className="table-th whitespace-nowrap">System Name</th>
                {/* <th className="table-th whitespace-nowrap">Status</th> */}
                <th className="table-th whitespace-nowrap">Added By</th>
                <th className="table-th whitespace-nowrap">Created At</th>
                {Number(permission.write) === 1 && (
                  <th className="table-th whitespace-nowrap">Action</th>
                )}
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={Number(permission.write) == 1 ? 5 : 4}
                    className="px-6 py-10 text-center text-gray-500 dark:text-gray-400"
                  >
                    Loading systems...
                  </td>
                </tr>
              ) : components.length > 0 ? (
                components.map((component) => (
                  <tr key={component.component_id} className="table-row">
                    <td className="table-td whitespace-nowrap font-medium">
                      {component.component_name || "-"}
                    </td>

                    {/* <td className="table-td whitespace-nowrap">
                      {Number(component.component_status || 0) === 1
                        ? "Active"
                        : "Inactive"}
                    </td> */}

                    <td className="table-td whitespace-nowrap">
                      {component.created_by_name || "-"}
                    </td>
  <td className="table-td whitespace-nowrap">
                      {formatDate(component.created_at)}
                    </td>
                  
                    {Number(permission.write) === 1 && (
                      <td className="table-td whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            title="Edit"
                            onClick={() =>
                              handleEditComponent(component.component_id)
                            }
                            className="text-blue-500 transition-colors hover:text-blue-700"
                          >
                            <EditIcon />
                          </button>

                          <button
                            type="button"
                            title="Delete"
                            onClick={() =>
                              openDeleteModal(component.component_id)
                            }
                            className="text-red-500 transition-colors hover:text-red-700"
                          >
                            <DeleteIcon />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={Number(permission.write) === 1 ? 5 : 4}
                    className="px-6 py-8 text-center text-gray-500 dark:text-gray-400"
                  >
                    No components found.
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
                getComponentList(1, newLimit);
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
              Delete System
            </h3>

            <p className="mb-6 text-sm text-gray-600 dark:text-gray-400 sm:mb-7">
              Are you sure you want to delete this System?
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
                onClick={confirmDeleteComponent}
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

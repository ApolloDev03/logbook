import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

import Breadcrumb from "../components/ui/Breadcrumb";
import Toggle from "../components/ui/Toggle";
import PopupModal from "../components/ui/PopupModal";
import { apiUrl } from "../config";

const EyeIcon = () => (
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
      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
    />
  </svg>
);

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

const SendMailIcon = () => (
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
      d="M3 8L12 13L21 8M5 19H19C20.1 19 21 18.1 21 17V7C21 5.9 20.1 5 19 5H5C3.9 5 3 5.9 3 7V17C3 18.1 3.9 19 5 19Z"
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

export default function Employee() {
  const navigate = useNavigate();
  const [sortOrder, setSortOrder] = useState("asc");
  const [employees, setEmployees] = useState([]);
  const [roles, setRoles] = useState([]);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("");

  const [loading, setLoading] = useState(false);
  const [roleLoading, setRoleLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [statusLoadingId, setStatusLoadingId] = useState(null);
  const [mailLoadingId, setMailLoadingId] = useState(null);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteEmployeeId, setDeleteEmployeeId] = useState(null);
  const authUser = JSON.parse(localStorage.getItem("auth_user") || "{}");

  const currentRoleId = Number(authUser?.role_id || authUser?.role?.id || 0);

  const employeePermission = (authUser?.permissions || []).find((item) => {
    const permissionName = String(item?.permission_name || "")
      .trim()
      .toLowerCase();

    return (
      Number(item?.permission_id) === 2 ||
      permissionName === "employee management"
    );
  });

  const isAdmin = currentRoleId === 1;

  const canReadEmployee =
    isAdmin || Number(employeePermission?.read || 0) === 1;
  const canWriteEmployee =
    isAdmin || Number(employeePermission?.write || 0) === 1;
  useEffect(() => {
    getRoleList();
    getEmployeeList(1);
  }, []);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      getEmployeeList(1);
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [search, filter]);

  useEffect(() => {
    if (viewModalOpen || deleteModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [viewModalOpen, deleteModalOpen]);

  const getRoleList = async () => {
    try {
      setRoleLoading(true);

      const response = await axios.post(
        `${apiUrl}/auth/rolelisting`,
        {
          company_id: authUser.company_id,
        },
        {
          headers: getAuthHeaders(),
        },
      );

      if (response?.data?.success) {
        setRoles(response?.data?.data || []);
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

  const getEmployeeList = async (pageNumber = 1, customLimit = limit) => {
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
        search: search,
        role_id: filter,
        page: pageNumber,
        limit: customLimit,
        created_by_id: null,
        company_id: authUser.company_id,
      };

      const response = await axios.post(
        `${apiUrl}/auth/employeelist`,
        payload,
        {
          headers: getAuthHeaders(),
        },
      );

      if (response?.data?.success) {
        setEmployees(response?.data?.data || []);
        setPage(response?.data?.page || pageNumber);
        setTotal(response?.data?.total || 0);
        setTotalPages(response?.data?.total_pages || 1);
      } else {
        toast.error(response?.data?.message || "Employee list not found.");
      }
    } catch (error) {
      const msg =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        "Failed to load employees.";

      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages || newPage === page) return;
    getEmployeeList(newPage);
  };

  const getVisiblePages = () => {
    const visibleCount = 5;

    if (totalPages <= visibleCount) {
      return Array.from({ length: totalPages }, (_, index) => index + 1);
    }

    const maxStartPage = totalPages - visibleCount + 1;

    const startPage = Math.min(page, maxStartPage);

    return Array.from(
      { length: visibleCount },
      (_, index) => startPage + index
    );
  };

  const toggleStatus = async (employee) => {
    try {
      const token = getToken();

      if (!token) {
        toast.error("Token not found. Please login again.");
        return;
      }

      const currentStatus = Number(employee.status || 0);
      const newStatus = currentStatus === 1 ? "0" : "1";

      setStatusLoadingId(employee.id);

      const response = await axios.post(
        `${apiUrl}/auth/update_employee_status`,
        {
          employee_id: String(employee.id),
          status: newStatus,
        },
        {
          headers: getAuthHeaders(),
        },
      );

      if (response?.data?.success) {
        toast.success(
          response?.data?.message || "Employee status updated successfully",
        );

        setEmployees((prev) =>
          prev.map((item) =>
            item.id === employee.id
              ? { ...item, status: Number(newStatus) }
              : item,
          ),
        );
      } else {
        toast.error(
          response?.data?.message || "Failed to update employee status.",
        );
      }
    } catch (error) {
      const msg =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        "Failed to update employee status.";

      toast.error(msg);
    } finally {
      setStatusLoadingId(null);
    }
  };

  const openViewModal = (employee) => {
    setSelectedEmployee(employee);
    setViewModalOpen(true);
  };

  const closeViewModal = () => {
    setSelectedEmployee(null);
    setViewModalOpen(false);
  };

  const handleEditEmployee = (employeeId) => {
    navigate(`/create-employee?employee_id=${employeeId}`);
  };

  const openDeleteModal = (id) => {
    setDeleteEmployeeId(id);
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    if (deleteLoading) return;
    setDeleteEmployeeId(null);
    setDeleteModalOpen(false);
  };

  const confirmDeleteEmployee = async () => {
    if (!deleteEmployeeId) return;

    try {
      const token = getToken();

      if (!token) {
        toast.error("Token not found. Please login again.");
        return;
      }

      setDeleteLoading(true);

      const response = await axios.post(
        `${apiUrl}/auth/delete_employee`,
        {
          employee_id: String(deleteEmployeeId),
        },
        {
          headers: getAuthHeaders(),
        },
      );

      if (response?.data?.success) {
        toast.success(
          response?.data?.message || "Employee deleted successfully",
        );
        closeDeleteModal();
        getEmployeeList(page);
      } else {
        toast.error(response?.data?.message || "Failed to delete employee.");
      }
    } catch (error) {
      const msg =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        "Failed to delete employee.";

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

  const handleSortByName = () => {
    const newOrder = sortOrder === "asc" ? "desc" : "asc";

    const sortedEmployees = [...employees].sort((a, b) => {
      const nameA = String(a.name || "").toLowerCase();
      const nameB = String(b.name || "").toLowerCase();

      if (newOrder === "asc") {
        return nameA.localeCompare(nameB);
      }

      return nameB.localeCompare(nameA);
    });

    setSortOrder(newOrder);
    setEmployees(sortedEmployees);
  };

  const sendEmployeeLoginCredentials = async (empId) => {
    if (!empId) {
      toast.error("Employee ID not found.");
      return;
    }

    try {
      const token = getToken();

      if (!token) {
        toast.error("Token not found. Please login again.");
        return;
      }

      setMailLoadingId(empId);

      const response = await axios.post(
        `${apiUrl}/auth/employee_send_mail_password`,
        {
          emp_id: String(empId),
        },
        {
          headers: getAuthHeaders(),
        }
      );

      if (response?.data?.success) {
        toast.success(
          response?.data?.message ||
          "Login credentials sent successfully."
        );
      } else {
        toast.error(
          response?.data?.message ||
          "Failed to send login credentials."
        );
      }
    } catch (error) {
      const msg =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        "Failed to send login credentials.";

      toast.error(msg);
    } finally {
      setMailLoadingId(null);
    }
  };


  return (
    <>
      <div className="mb-5 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white sm:text-2xl">
          Employee
        </h1>

        <div className="w-full sm:w-auto">
          <Breadcrumb pageName="Employee" parentPage="Employee Management" />
        </div>
      </div>

      <div className="card overflow-hidden rounded-xl">
        <div className="m-4 flex flex-col gap-4 sm:m-5 md:m-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="w-full lg:w-1/3">
            <input
              type="text"
              placeholder="Search employees..."
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
              disabled={roleLoading}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white sm:w-auto"
            >
              <option value="">
                {roleLoading ? "Loading roles..." : "All Roles"}
              </option>

              {roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </select> */}

            {canWriteEmployee && (
              <button
                type="button"
                onClick={() => navigate("/create-employee")}
                className="btn-gray w-full justify-center sm:w-auto"
              >
                Add Employee
              </button>
            )}



            <button
              type="button"
              onClick={() => navigate("/employee-import")}
              className="rounded-lg bg-green-600 px-5 py-2.5 font-medium text-white transition hover:bg-green-700"
            >
              Import
            </button>
          </div>
        </div>

        <div className="w-full overflow-x-auto">
          <table className="w-full min-w-[980px] border border-gray-200 text-left text-sm dark:border-gray-800">
            <thead>
              <tr
                onClick={handleSortByName}
                className="border-b border-gray-100 dark:border-gray-800"
              >
                <th className="table-th whitespace-nowrap">Name</th>
                <th className="table-th whitespace-nowrap">Status</th>
                <th className="table-th whitespace-nowrap">Role</th>
                <th className="table-th whitespace-nowrap">Email</th>
                <th className="table-th whitespace-nowrap">Mobile</th>
                <th className="table-th whitespace-nowrap">Country</th>
                <th className="table-th whitespace-nowrap">City</th>
                <th className="table-th whitespace-nowrap">Action</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan="7"
                    className="px-6 py-10 text-center text-gray-500 dark:text-gray-400"
                  >
                    Loading employees...
                  </td>
                </tr>
              ) : employees.length > 0 ? (
                employees.map((emp) => (
                  <tr key={emp.id} className="table-row">
                    <td
                      onClick={() => openViewModal(emp)}
                      className="px-6 py-4 text-sm cursor-pointer whitespace-nowrap font-medium text-blue-600 "
                    >
                      {emp.name}
                    </td>

                    <td className="table-td whitespace-nowrap">
                      {canWriteEmployee ? (
                        <Toggle
                          checked={Number(emp.status || 0) === 1}
                          onChange={() => toggleStatus(emp)}
                          disabled={statusLoadingId === emp.id}
                        />
                      ) : (
                        <span
                          className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${Number(emp.status || 0) === 1
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                            }`}
                        >
                          {Number(emp.status || 0) === 1
                            ? "Active"
                            : "Inactive"}
                        </span>
                      )}
                    </td>

                    <td className="table-td whitespace-nowrap">
                      {emp.role_name || "-"}
                    </td>

                    <td className="table-td whitespace-nowrap">
                      {emp.email || "-"}
                    </td>
                    <td className="table-td whitespace-nowrap">
                      {emp.mobile_number || "-"}
                    </td>
                    <td className="table-td whitespace-nowrap">
                      {emp.country_name || "-"}
                    </td>

                    <td className="table-td whitespace-nowrap">
                      {emp.city_name || "-"}
                    </td>

                    <td className="table-td whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => openViewModal(emp)}
                          className="text-green-500 transition-colors hover:text-green-700"
                        >
                          <EyeIcon />
                        </button>

                        {canWriteEmployee && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleEditEmployee(emp.id)}
                              className="text-blue-500 transition-colors hover:text-blue-700"
                            >
                              <EditIcon />
                            </button>

                            <button
                              type="button"
                              onClick={() => openDeleteModal(emp.id)}
                              className="text-red-500 transition-colors hover:text-red-700"
                            >
                              <DeleteIcon />
                            </button>

                            <button
                              type="button"
                              title="Send Login Credentials"
                              onClick={() => sendEmployeeLoginCredentials(emp.id)}
                              disabled={mailLoadingId === emp.id}
                              className="text-purple-500 transition-colors hover:text-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {mailLoadingId === emp.id ? (
                                <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-purple-500 border-t-transparent" />
                              ) : (
                                <SendMailIcon />
                              )}
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="7"
                    className="px-6 py-8 text-center text-gray-500 dark:text-gray-400"
                  >
                    No employees found
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

            <div className="relative">
              <select
                value={limit}
                onChange={(e) => {
                  const newLimit = Number(e.target.value);

                  setLimit(newLimit);
                  setPage(1);

                  // Fetch first page with new limit
                  getEmployeeList(1, newLimit);
                }}
                className="rounded-lg appearance-none border border-gray-300 px-2 py-2 pr-6 text-sm dark:border-gray-700 dark:bg-gray-900"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
                <option value={200}>200</option>
                <option value={500}>500</option>
              </select>
              <svg
                className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-black dark:text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={page <= 1 || loading}
              onClick={() => handlePageChange(1)}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              First
            </button>

            <button
              type="button"
              disabled={page <= 1 || loading}
              onClick={() => handlePageChange(page - 1)}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              Previous
            </button>

            {getVisiblePages().map((pageNumber) => (
              <button
                key={pageNumber}
                type="button"
                disabled={loading}
                onClick={() => handlePageChange(pageNumber)}
                className={`min-w-[40px] rounded-lg border px-3 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${pageNumber === page
                  ? "border-blue-600 bg-blue-600 text-white"
                  : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
                  }`}
              >
                {pageNumber}
              </button>
            ))}

            <button
              type="button"
              disabled={page >= totalPages || loading}
              onClick={() => handlePageChange(page + 1)}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              Next
            </button>

            <button
              type="button"
              disabled={page >= totalPages || loading}
              onClick={() => handlePageChange(totalPages)}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              Last
            </button>
          </div>
        </div>

        <div className="block border-t border-gray-100 px-4 py-3 text-xs text-gray-500 dark:border-gray-800 dark:text-gray-400 sm:hidden">
          Swipe left/right to view full table.
        </div>
      </div>

      <PopupModal
        open={viewModalOpen && selectedEmployee}
        onClose={closeViewModal}
        maxWidth="max-w-[700px]"
        className="px-3 py-4 sm:px-4 sm:py-6"
        bodyClassName="max-h-[92vh] p-5 sm:p-8 md:p-11"
      >
        <button
          type="button"
          onClick={closeViewModal}
          className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-2xl leading-none text-gray-400 transition hover:bg-gray-200 hover:text-gray-600 dark:bg-gray-800 dark:hover:bg-gray-700 sm:right-5 sm:h-11 sm:w-11"
        >
          ×
        </button>

        <h2 className="mb-6 pr-12 text-xl font-bold text-gray-900 dark:text-white sm:mb-7 sm:text-2xl">
          View Employee Information
        </h2>

        <div className="rounded-2xl border border-gray-200 p-4 dark:border-gray-700 sm:p-6">
          <h3 className="mb-6 text-base font-semibold text-gray-900 dark:text-white sm:mb-8 sm:text-lg">
            Employee Information
          </h3>

          <div className="grid grid-cols-1 gap-x-10 gap-y-6 sm:grid-cols-2 sm:gap-y-8 md:grid-cols-3">
            <Info label="Name" value={selectedEmployee?.name} />
            <Info label="Role" value={selectedEmployee?.role_name} />
            <Info label="Email address" value={selectedEmployee?.email} />
            <Info label="Phone" value={selectedEmployee?.mobile_number} />

            <div>
              <p className="mb-3 text-xs text-gray-500 dark:text-gray-400">
                Signature
              </p>

              {selectedEmployee?.signature_url ? (
                <img
                  src={selectedEmployee.signature_url}
                  alt="Signature"
                  className="h-20 w-full max-w-[170px] object-cover"
                />
              ) : (
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  No signature
                </p>
              )}
            </div>
            <div className="">
              <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">
                Address Line 1
              </p>
              <p className="max-w-full break-words text-sm font-semibold leading-6 text-gray-900 dark:text-white sm:max-w-[260px]">
                {selectedEmployee?.address || "-"}
              </p>
            </div>
            <div className="">
              <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">
                Address Line 2
              </p>
              <p className="max-w-full break-words text-sm font-semibold leading-6 text-gray-900 dark:text-white sm:max-w-[260px]">
                {selectedEmployee?.address_line_2 || "-"}
              </p>
            </div>
            <Info label="Country" value={selectedEmployee?.country_name} />
            {!["uk", "united kingdom"].includes(
              selectedEmployee?.country_name?.toLowerCase()
            ) && (
                <Info
                  label="State"
                  value={selectedEmployee?.state_name}
                />
              )}
            <Info label="City" value={selectedEmployee?.city_name} />
            <Info label="Postal Code" value={selectedEmployee?.postcode} />

          </div>
        </div>


      </PopupModal>

      {deleteModalOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-gray-900/45 px-4 backdrop-blur-[1px]">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl dark:bg-gray-900 sm:p-6">
            <h3 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white sm:text-xl">
              Delete Employee
            </h3>

            <p className="mb-6 text-sm text-gray-600 dark:text-gray-400 sm:mb-7">
              Are you sure you want to delete this employee?
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
                onClick={confirmDeleteEmployee}
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

function Info({ label, value }) {
  return (
    <div>
      <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">{label}</p>
      <p className="break-words text-sm font-semibold text-gray-900 dark:text-white">
        {value || "-"}
      </p>
    </div>
  );
}

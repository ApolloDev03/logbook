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

const getCustomerPermission = () => {
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

  const customerPermission = permissions.find((item) => {
    const name = String(
      item?.permission_name ||
        item?.name ||
        item?.module_name ||
        item?.menu_name ||
        "",
    ).toLowerCase();

    return Number(item?.permission_id) === 2 || name.includes("customer");
  });

  return {
    read: Number(customerPermission?.read || 0),
    write: Number(customerPermission?.write || 0),
    isAdmin: false,
  };
};
export default function Customer() {
  const navigate = useNavigate();
  const [sortOrder, setSortOrder] = useState("asc");
  const [customers, setCustomers] = useState([]);
  const [countries, setCountries] = useState([]);

  const [search, setSearch] = useState("");
  const [countryId, setCountryId] = useState("");

  const [loading, setLoading] = useState(false);
  const [countryLoading, setCountryLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [statusLoadingId, setStatusLoadingId] = useState(null);
  const [viewLoading, setViewLoading] = useState(false);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteCustomerId, setDeleteCustomerId] = useState(null);
  const [permission, setPermission] = useState({
    read: 0,
    write: 0,
    isAdmin: false,
  });
  useEffect(() => {
    const userPermission = getCustomerPermission();
    setPermission(userPermission);

    if (
      Number(userPermission.read) === 1 ||
      Number(userPermission.isAdmin) === 1
    ) {
      getCountryList();
      getCustomerList(1);
    } else {
      toast.error("You do not have permission to view customers.");
    }
  }, []);

  useEffect(() => {
    if (Number(permission.read) !== 1 && Number(permission.isAdmin) !== 1)
      return;

    const delayDebounce = setTimeout(() => {
      getCustomerList(1);
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [search, countryId, permission]);
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

  const getCountryList = async () => {
    try {
      setCountryLoading(true);

      const response = await axios.post(
        `${apiUrl}/auth/countrylist`,
        {},
        {
          headers: getAuthHeaders(),
        },
      );

      if (response?.data?.success) {
        setCountries(response?.data?.data || []);
      } else {
        toast.error(response?.data?.message || "Country list not found.");
      }
    } catch (error) {
      const msg =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        "Failed to load country list.";

      toast.error(msg);
    } finally {
      setCountryLoading(false);
    }
  };

  const getCustomerList = async (pageNumber = 1, customLimit = limit) => {
    try {
      const token = getToken();

      if (!token) {
        toast.error("Token not found. Please login again.");
        return;
      }

      setLoading(true);

      const payload = {
        search: search,
        country_id: countryId,
        page: pageNumber,
        limit: customLimit,
      };

      const response = await axios.post(
        `${apiUrl}/auth/customerlist`,
        payload,
        {
          headers: getAuthHeaders(),
        },
      );

      if (response?.data?.success) {
        setCustomers(response?.data?.data || []);
        setPage(response?.data?.page || pageNumber);
        setTotal(response?.data?.total || 0);
        setTotalPages(response?.data?.total_pages || 1);
      } else {
        toast.error(response?.data?.message || "Customer list not found.");
      }
    } catch (error) {
      const msg =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        "Failed to load customers.";

      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const getCustomerById = async (customerId) => {
    try {
      const token = getToken();

      if (!token) {
        toast.error("Token not found. Please login again.");
        return;
      }

      setViewLoading(true);
      setViewModalOpen(true);

      const response = await axios.post(
        `${apiUrl}/auth/get_customer_by_id`,
        {
          customer_id: String(customerId),
        },
        {
          headers: getAuthHeaders(),
        },
      );

      if (response?.data?.success) {
        setSelectedCustomer(response?.data?.data || null);
      } else {
        toast.error(response?.data?.message || "Customer details not found.");
        closeViewModal();
      }
    } catch (error) {
      const msg =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        "Failed to load customer details.";

      toast.error(msg);
      closeViewModal();
    } finally {
      setViewLoading(false);
    }
  };

  const toggleStatus = async (customer) => {
    try {
      const token = getToken();

      if (!token) {
        toast.error("Token not found. Please login again.");
        return;
      }

      const currentStatus = Number(customer.customer_status || 0);
      const newStatus = currentStatus === 1 ? "0" : "1";

      setStatusLoadingId(customer.customer_id);

      const response = await axios.post(
        `${apiUrl}/auth/update_customer_status`,
        {
          customer_id: String(customer.customer_id),
          status: newStatus,
        },
        {
          headers: getAuthHeaders(),
        },
      );

      if (response?.data?.success) {
        toast.success(
          response?.data?.message || "Customer status updated successfully",
        );

        setCustomers((prev) =>
          prev.map((item) =>
            item.customer_id === customer.customer_id
              ? { ...item, customer_status: Number(newStatus) }
              : item,
          ),
        );
      } else {
        toast.error(
          response?.data?.message || "Failed to update customer status.",
        );
      }
    } catch (error) {
      const msg =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        "Failed to update customer status.";

      toast.error(msg);
    } finally {
      setStatusLoadingId(null);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages || newPage === page) return;
    getCustomerList(newPage);
  };

  const openViewModal = (customerId) => {
    setSelectedCustomer(null);
    getCustomerById(customerId);
  };

  const closeViewModal = () => {
    setSelectedCustomer(null);
    setViewModalOpen(false);
  };

  const handleEditCustomer = (customerId) => {
    navigate(`/create-customer?customer_id=${customerId}`);
  };

  const openDeleteModal = (id) => {
    setDeleteCustomerId(id);
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    if (deleteLoading) return;
    setDeleteCustomerId(null);
    setDeleteModalOpen(false);
  };

  const confirmDeleteCustomer = async () => {
    if (!deleteCustomerId) return;

    try {
      const token = getToken();

      if (!token) {
        toast.error("Token not found. Please login again.");
        return;
      }

      setDeleteLoading(true);

      const response = await axios.post(
        `${apiUrl}/auth/delete_customer`,
        {
          customer_id: String(deleteCustomerId),
        },
        {
          headers: getAuthHeaders(),
        },
      );

      if (response?.data?.success) {
        toast.success(
          response?.data?.message || "Customer deleted successfully",
        );
        closeDeleteModal();
        getCustomerList(page);
      } else {
        toast.error(response?.data?.message || "Failed to delete customer.");
      }
    } catch (error) {
      const msg =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        "Failed to delete customer.";

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

    const sortedCustomers = [...customers].sort((a, b) => {
      const nameA = String(a.customer_company_name || "").toLowerCase();
      const nameB = String(b.customer_company_name || "").toLowerCase();

      if (newOrder === "asc") {
        return nameA.localeCompare(nameB);
      }

      return nameB.localeCompare(nameA);
    });

    setSortOrder(newOrder);
    setCustomers(sortedCustomers);
  };
  return (
    <>
      <div className="mb-5 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white sm:text-2xl">
          Customer
        </h1>

        <div className="w-full sm:w-auto">
          <Breadcrumb pageName="Customer" parentPage="Customer Management" />
        </div>
      </div>

      <div className="card overflow-hidden rounded-xl">
        <div className="m-4 flex flex-col gap-4 sm:m-5 md:m-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="w-full lg:w-1/3">
            <input
              type="text"
              placeholder="Search Company..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            />
          </div>

          <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto">
            <select
              value={countryId}
              onChange={(e) => {
                setCountryId(e.target.value);
                setPage(1);
              }}
              disabled={countryLoading}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white sm:w-auto"
            >
              <option value="">
                {countryLoading ? "Loading countries..." : "All Countries"}
              </option>

              {countries.map((country) => (
                <option key={country.countryid} value={country.countryid}>
                  {country.country_name}
                </option>
              ))}
            </select>

            {Number(permission.write) === 1 && (
              <button
                type="button"
                onClick={() => navigate("/create-customer")}
                className="btn-gray w-full justify-center sm:w-auto"
              >
                Add Customer
              </button>
            )}

            <button
              type="button"
              onClick={() => navigate("/customer-import")}
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
                <th className="table-th whitespace-nowrap">Company Name</th>
                <th className="table-th whitespace-nowrap">Status</th>
                <th className="table-th whitespace-nowrap">Email</th>
                <th className="table-th whitespace-nowrap">Contact</th>
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
                    Loading customers...
                  </td>
                </tr>
              ) : customers.length > 0 ? (
                customers.map((customer) => (
                  <tr key={customer.customer_id} className="table-row">
                    <td
                      onClick={() => openViewModal(customer.customer_id)}
                      className="px-6 py-4 text-sm cursor-pointer whitespace-nowrap font-medium text-blue-600 "
                    >
                      {customer.customer_company_name || "-"}
                    </td>

                    <td className="table-td whitespace-nowrap">
                      {Number(permission.write) === 1 ? (
                        <Toggle
                          checked={Number(customer.customer_status || 0) === 1}
                          onChange={() => toggleStatus(customer)}
                          disabled={statusLoadingId === customer.customer_id}
                        />
                      ) : (
                        <span>
                          {Number(customer.customer_status || 0) === 1
                            ? "Active"
                            : "Inactive"}
                        </span>
                      )}
                    </td>
                    <td className="table-td whitespace-nowrap">
                      {customer.customer_email || "-"}
                    </td>

                    <td className="table-td whitespace-nowrap">
                      {customer.customer_number || "-"}
                    </td>

                    <td className="table-td whitespace-nowrap">
                      {customer.country_name || "-"}
                    </td>

                    <td className="table-td whitespace-nowrap">
                      {customer.city_name || "-"}
                    </td>

                    <td className="table-td whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          title="View"
                          onClick={() => openViewModal(customer.customer_id)}
                          className="text-green-500 transition-colors hover:text-green-700"
                        >
                          <EyeIcon />
                        </button>

                        {Number(permission.write) === 1 && (
                          <>
                            <button
                              type="button"
                              title="Edit"
                              onClick={() =>
                                handleEditCustomer(customer.customer_id)
                              }
                              className="text-blue-500 transition-colors hover:text-blue-700"
                            >
                              <EditIcon />
                            </button>

                            <button
                              type="button"
                              title="Delete"
                              onClick={() =>
                                openDeleteModal(customer.customer_id)
                              }
                              className="text-red-500 transition-colors hover:text-red-700"
                            >
                              <DeleteIcon />
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
                    No customers found
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
                getCustomerList(1, newLimit);
              }}
              className="rounded-lg border appearance-none pr-6 border-gray-300 px-2 py-2 text-sm dark:border-gray-700 dark:bg-gray-900"
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

      <PopupModal
        open={viewModalOpen}
        onClose={closeViewModal}
        maxWidth="max-w-[750px]"
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
          View Customer Information
        </h2>

        {viewLoading ? (
          <div className="py-10 text-center text-gray-500 dark:text-gray-400">
            Loading customer details...
          </div>
        ) : (
          <>
            <div className="rounded-2xl border border-gray-200 p-4 dark:border-gray-700 sm:p-6">
              <h3 className="mb-6 text-base font-semibold text-gray-900 dark:text-white sm:mb-8 sm:text-lg">
                Company Information
              </h3>

              <div className="grid grid-cols-1 gap-x-10 gap-y-6 sm:grid-cols-2 sm:gap-y-8 md:grid-cols-3">
                   <Info
                  label="Prefix"
                  value={selectedCustomer?.Prefix}
                />
                <Info
                  label="Company Name"
                  value={selectedCustomer?.customer_company_name}
                />
              <div className="">
                  <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">
                    Address Line 1
                  </p>
                  <p className="max-w-full break-words text-sm font-semibold leading-6 text-gray-900 dark:text-white sm:max-w-[260px]">
                    {selectedCustomer?.customer_address || "-"}
                  </p>
                  
                </div>
                  <div className="">
                  <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">
                    Address Line 2
                  </p>
                  <p className="max-w-full break-words text-sm font-semibold leading-6 text-gray-900 dark:text-white sm:max-w-[260px]">
                    {selectedCustomer?.customer_address_line_2 || "-"}
                  </p>
                  
                </div>
                 <Info label="Country" value={selectedCustomer?.country_name} />
                            {!["uk", "united kingdom"].includes(
  selectedCustomer?.country_name?.toLowerCase()
) && (
  <Info
    label="State"
    value={selectedCustomer?.state_name}
  />
)}  
                <Info label="City" value={selectedCustomer?.city_name} />
                <Info
                  label="Postal Code"
                  value={selectedCustomer?.customer_post_code}
                />
              </div>
            </div>

            <div className="mt-5 rounded-2xl border border-gray-200 p-4 dark:border-gray-700 sm:mt-6 sm:p-6">
              <h3 className="mb-6 text-base font-semibold text-gray-900 dark:text-white sm:mb-8 sm:text-lg">
                 Customer Information
              </h3>

              <div className="grid grid-cols-1 gap-x-10 gap-y-6 sm:grid-cols-2 sm:gap-y-8 md:grid-cols-3">
                
                  <Info
                  label="Customer Name"
                  value={selectedCustomer?.customer_name}
                />
                <Info
                  label="Email address"
                  value={selectedCustomer?.customer_email}
                />
                <Info
                  label="Contact"
                  value={selectedCustomer?.customer_number}
                />

                <div>
                  <p className="mb-3 text-xs text-gray-500 dark:text-gray-400">
                    Company Logo
                  </p>

                  {selectedCustomer?.logo_url ? (
                    <img
                      src={selectedCustomer.logo_url}
                      alt="Company Logo"
                      className="h-20 w-full max-w-[170px] rounded object-contain"
                    />
                  ) : (
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      No logo
                    </p>
                  )}
                </div>

                <div>
                  <p className="mb-3 text-xs text-gray-500 dark:text-gray-400">
                    Company Logo Icon
                  </p>

                  {selectedCustomer?.logo_icon_url ? (
                    <img
                      src={selectedCustomer.logo_icon_url}
                      alt="Company Logo Icon"
                      className="h-20 w-full max-w-[120px] rounded object-contain"
                    />
                  ) : (
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      No logo icon
                    </p>
                  )}
                </div>
               

              
               
              </div>
            </div>
          </>
        )}
      </PopupModal>

      {deleteModalOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-gray-900/45 px-4 backdrop-blur-[1px]">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl dark:bg-gray-900 sm:p-6">
            <h3 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white sm:text-xl">
              Delete Customer
            </h3>

            <p className="mb-6 text-sm text-gray-600 dark:text-gray-400 sm:mb-7">
              Are you sure you want to delete this customer?
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
                onClick={confirmDeleteCustomer}
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

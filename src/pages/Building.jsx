import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import logo from "../assets/images/logo/logo.svg";

import Breadcrumb from "../components/ui/Breadcrumb";
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

const QRIcon = () => (
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
      d="M4 4h6v6H4V4zm10 0h6v6h-6V4zM4 14h6v6H4v-6zm10 0h2v2h-2v-2zm4 0h2v2h-2v-2zm-4 4h2v2h-2v-2zm4 0h2v2h-2v-2z"
    />
  </svg>
);

const PrintIcon = () => (
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
      d="M6 9V4h12v5M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2M6 14h12v6H6v-6z"
    />
  </svg>
);

const getToken = () => localStorage.getItem("auth_token") || "";

const getAuthHeaders = () => {
  const token = getToken();

  return {
    Authorization: token,
    token: token,
    "x-access-token": token,
    "Content-Type": "application/json",
  };
};

export default function Building() {
  const navigate = useNavigate();

  const [buildings, setBuildings] = useState([]);
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [loading, setLoading] = useState(false);
  const [viewLoading, setViewLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [qrLoadingId, setQrLoadingId] = useState(null);
  const [printLoadingId, setPrintLoadingId] = useState(null);

  const [generatedQrIds, setGeneratedQrIds] = useState([]);

  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedBuilding, setSelectedBuilding] = useState(null);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteBuildingId, setDeleteBuildingId] = useState(null);

  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [qrData, setQrData] = useState(null);
  const authUser = JSON.parse(localStorage.getItem("auth_user") || "{}");
  const roleId = Number(authUser?.role_id);

  const permissions = Array.isArray(authUser?.permissions)
    ? authUser.permissions
    : [];

  const getPermission = (permissionName) => {
    return permissions.find(
      (item) =>
        String(item?.permission_name || "")
          .trim()
          .toLowerCase() ===
        String(permissionName || "")
          .trim()
          .toLowerCase(),
    );
  };

  const buildingPermission = getPermission("Building Management");

  const canReadBuilding =
    roleId === 1 || roleId === 3 || Number(buildingPermission?.read) === 1;

  const canWriteBuilding =
    roleId === 1 || roleId === 3 || Number(buildingPermission?.write) === 1;
  useEffect(() => {
    getBuildingList(1);
  }, []);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      getBuildingList(1);
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [search]);

  useEffect(() => {
    if (viewModalOpen || deleteModalOpen || qrModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [viewModalOpen, deleteModalOpen, qrModalOpen]);

  const getBuildingList = async (pageNumber = 1) => {
    try {
      if (!getToken()) {
        toast.error("Token not found. Please login again.");
        return;
      }

      setLoading(true);
      
      const roleName = String(authUser?.role_name || "")
        .trim()
        .toLowerCase();
        
      const response = await axios.post(
        `${apiUrl}/auth/buildinglist`,
        {
          //customer_id: roleId == 3 ? authUser?.customer?.customer_id : "",
          customer_id:  authUser?.customer?.customer_id != '' ? authUser?.customer?.customer_id  : "",
          page: pageNumber,
          limit: limit,
          search: search,
          created_by_id: "",
        },
        {
          headers: getAuthHeaders(),
        },
      );

      if (response?.data?.success) {
        setBuildings(response?.data?.data || []);
        setPage(response?.data?.page || pageNumber);
        setTotal(response?.data?.total || 0);
        setTotalPages(response?.data?.total_pages || 1);
      } else {
        toast.error(response?.data?.message || "Building list not found.");
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        "Failed to load buildings.",
      );
    } finally {
      setLoading(false);
    }
  };

  const getBuildingById = async (buildingId) => {
    try {
      if (!getToken()) {
        toast.error("Token not found. Please login again.");
        return;
      }

      setViewLoading(true);
      setViewModalOpen(true);
      setSelectedBuilding(null);

      const response = await axios.post(
        `${apiUrl}/auth/get_building_by_id`,
        {
          building_id: String(buildingId),
        },
        {
          headers: getAuthHeaders(),
        },
      );

      if (response?.data?.success) {
        setSelectedBuilding(response?.data?.data || null);
      } else {
        toast.error(response?.data?.message || "Building details not found.");
        closeViewModal();
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        "Failed to load building details.",
      );
      closeViewModal();
    } finally {
      setViewLoading(false);
    }
  };

  const handleEditBuilding = (buildingId) => {
    navigate(`/create-building?building_id=${buildingId}`);
  };

  const openDeleteModal = (id) => {
    setDeleteBuildingId(id);
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    if (deleteLoading) return;
    setDeleteBuildingId(null);
    setDeleteModalOpen(false);
  };

  const confirmDeleteBuilding = async () => {
    if (!deleteBuildingId) return;

    try {
      if (!getToken()) {
        toast.error("Token not found. Please login again.");
        return;
      }

      setDeleteLoading(true);

      const response = await axios.post(
        `${apiUrl}/auth/delete_building`,
        {
          building_id: String(deleteBuildingId),
        },
        {
          headers: getAuthHeaders(),
        },
      );

      if (response?.data?.success) {
        toast.success(
          response?.data?.message || "Building deleted successfully",
        );
        closeDeleteModal();
        getBuildingList(page);
      } else {
        toast.error(response?.data?.message || "Failed to delete building.");
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        "Failed to delete building.",
      );
    } finally {
      setDeleteLoading(false);
    }
  };

  // const generateQrCode = async (building) => {
  //   const buildingId = building.building_id;

  //   if (isQrGenerated(building)) {
  //     toast.info("QR Code already generated.");
  //     return;
  //   }

  //   try {
  //     if (!getToken()) {
  //       toast.error("Token not found. Please login again.");
  //       return;
  //     }

  //     setQrLoadingId(buildingId);

  //     const response = await axios.post(
  //       `${apiUrl}/auth/generate_qrcode`,
  //       {
  //         building_id: buildingId,
  //       },
  //       {
  //         headers: getAuthHeaders(),
  //       },
  //     );

  //     if (response?.data?.success) {
  //       const statusResponse = await axios.post(
  //         `${apiUrl}/auth/buildingQRCodeStatus`,
  //         {
  //           building_id: buildingId,
  //           status: 1,
  //         },
  //         {
  //           headers: getAuthHeaders(),
  //         },
  //       );

  //       if (statusResponse?.data?.success) {
  //         toast.success(
  //           statusResponse?.data?.message ||
  //             "QR Code status updated successfully",
  //         );
  //       } else {
  //         toast.error(
  //           statusResponse?.data?.message || "Failed to update QR status.",
  //         );
  //       }
  //       setQrData({
  //         qrCode: qrcode?.qrCode || "",
  //         buildingInfo: {
  //           building_id: building?.building_id,
  //           building_name: building?.building_name || "-",
  //           postcode: building?.postcode || "-",
  //           address: building?.address || "-",
  //         },
  //       });
  //       setQrModalOpen(true);

  //       setGeneratedQrIds((prev) =>
  //         prev.includes(buildingId) ? prev : [...prev, buildingId],
  //       );

  //       setBuildings((prev) =>
  //         prev.map((item) =>
  //           item.building_id === buildingId
  //             ? {
  //                 ...item,
  //                 qrcodegenerete: 1,
  //                 qrcode_generate: 1,
  //                 qr_code_status: 1,
  //                 is_qr_generated: true,
  //               }
  //             : item,
  //         ),
  //       );
  //     } else {
  //       toast.error(response?.data?.message || "Failed to generate QR Code.");
  //     }
  //   } catch (error) {
  //     toast.error(
  //       error?.response?.data?.message ||
  //         error?.response?.data?.error ||
  //         "Failed to generate QR Code.",
  //     );
  //   } finally {
  //     setQrLoadingId(null);
  //   }
  // };
  const generateQrCode = async (building) => {
    const buildingId = building.building_id;

    if (isQrGenerated(building)) {
      toast.info("QR Code already generated.");
      return;
    }

    try {
      if (!getToken()) {
        toast.error("Token not found. Please login again.");
        return;
      }

      setQrLoadingId(buildingId);

      const response = await axios.post(
        `${apiUrl}/auth/generate_qrcode`,
        {
          building_id: buildingId,
        },
        {
          headers: getAuthHeaders(),
        },
      );

      if (response?.data?.success) {
        const statusResponse = await axios.post(
          `${apiUrl}/auth/buildingQRCodeStatus`,
          {
            building_id: buildingId,
            status: 1,
          },
          {
            headers: getAuthHeaders(),
          },
        );

        if (statusResponse?.data?.success) {
          toast.success(
            statusResponse?.data?.message ||
            "QR Code status updated successfully",
          );
        } else {
          toast.error(
            statusResponse?.data?.message || "Failed to update QR status.",
          );
        }

        // QR code generate API mathi only qrCode get thay che
        // Building details clicked row mathi pass kari che
        const qrcode = response?.data?.data || {};

        setQrData({
          qrCode: qrcode?.qrCode || "",
          buildingInfo: {
            building_id: building?.building_id,
            building_name: building?.building_name || "-",
            postcode: building?.postcode || "-",
            address: building?.address || "-",
          },
        });

        setQrModalOpen(true);

        setGeneratedQrIds((prev) =>
          prev.includes(buildingId) ? prev : [...prev, buildingId],
        );

        setBuildings((prev) =>
          prev.map((item) =>
            item.building_id === buildingId
              ? {
                ...item,
                qrcodegenerete: 1,
                qrcode_generate: 1,
                qr_code_status: 1,
                is_qr_generated: true,
              }
              : item,
          ),
        );
      } else {
        toast.error(response?.data?.message || "Failed to generate QR Code.");
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        "Failed to generate QR Code.",
      );
    } finally {
      setQrLoadingId(null);
    }
  };
  const printQrCode = async (buildingId) => {
    try {
      if (!getToken()) {
        toast.error("Token not found. Please login again.");
        return;
      }

      setPrintLoadingId(buildingId);

      const response = await axios.post(
        `${apiUrl}/auth/print_qrcode`,
        {
          building_id: buildingId,
        },
        {
          headers: getAuthHeaders(),
          responseType: "text",
        },
      );

      const printWindow = window.open("", "_blank");

      if (!printWindow) {
        toast.error("Please allow popup to print QR Code.");
        return;
      }

      printWindow.document.open();
      printWindow.document.write(response.data);
      printWindow.document.close();

      setTimeout(() => {
        printWindow.focus();
        printWindow.print();
      }, 500);
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        "Failed to print QR Code.",
      );
    } finally {
      setPrintLoadingId(null);
    }
  };

  const closeViewModal = () => {
    setSelectedBuilding(null);
    setViewModalOpen(false);
  };

  const closeQrModal = () => {
    setQrData(null);
    setQrModalOpen(false);
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages || newPage === page) return;
    getBuildingList(newPage);
  };

  const getShowingStart = () => {
    if (total === 0) return 0;
    return (page - 1) * limit + 1;
  };

  const getShowingEnd = () => {
    return Math.min(page * limit, total);
  };

  const isQrGenerated = (building) => {
    return (
      Number(building?.qrcodegenerete) === 1 ||
      Number(building?.qrcode_generate) === 1 ||
      Number(building?.qr_code_status) === 1 ||
      generatedQrIds.includes(building.building_id) ||
      building.is_qr_generated ||
      building.qr_code ||
      building.qrcode ||
      building.qrFilePath
    );
  };
  const handleSortByName = () => {
    const newOrder = sortOrder === "asc" ? "desc" : "asc";

    const sortedBuildings = [...buildings].sort((a, b) => {
      const nameA = String(a.building_name || "").toLowerCase();
      const nameB = String(b.building_name || "").toLowerCase();

      if (newOrder === "asc") {
        return nameA.localeCompare(nameB);
      }

      return nameB.localeCompare(nameA);
    });

    setSortOrder(newOrder);
    setBuildings(sortedBuildings);
  };
  const authRoleId = Number(authUser?.role_id);
  const customerRoleId = Number(authUser?.customer?.role_id);
  const isCustomerRole = authRoleId === 3 || customerRoleId === 3;
  return (
    <>
      <div className="mb-5 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white sm:text-2xl">
          Building
        </h1>

        <div className="w-full sm:w-auto">
          <Breadcrumb pageName="Building" parentPage="Building Management" />
        </div>
      </div>

      <div className="card overflow-hidden rounded-xl">
        <div className="m-4 flex flex-col gap-4 sm:m-5 md:m-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="w-full lg:w-1/3">
            <input
              type="text"
              placeholder="Search buildings..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            />
          </div>

          {canWriteBuilding && (
            <button
              type="button"
              onClick={() => navigate("/create-building")}
              className="btn-gray w-full justify-center sm:w-auto"
            >
              Add Building
            </button>
          )}
        </div>

        <div className="w-full overflow-x-auto">
          <table className="w-full min-w-[980px] border border-gray-200 text-left text-sm dark:border-gray-800">
            <thead>
              <tr
                onClick={handleSortByName}
                className="border-b border-gray-100 dark:border-gray-800"
              >
                 <th className="table-th whitespace-nowrap">UPRN</th>
                <th className="table-th whitespace-nowrap">Building Name</th>
                {!isCustomerRole && (
                  <>
                    <th className="table-th whitespace-nowrap">Company Name</th>
                    {/* <th className="table-th whitespace-nowrap">Customer</th> */}
                  </>
                )}
                <th className="table-th whitespace-nowrap">Postcode</th>
                <th className="table-th whitespace-nowrap">Country</th>
                {/* <th className="table-th whitespace-nowrap">State</th> */}
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
                    Loading buildings...
                  </td>
                </tr>
              ) : buildings.length > 0 ? (
                buildings.map((building) => {
                  const qrGenerated = isQrGenerated(building);

                  return (
                    <tr key={building.building_id} className="table-row">
                     <td className="table-td whitespace-nowrap">
      {building.uprn_no || "-"}
    </td>

                      <td
                        onClick={() => getBuildingById(building.building_id)}
                        className="px-6 py-4 text-sm cursor-pointer whitespace-nowrap font-medium text-blue-600 "
                      >
                        {building.building_name || "-"}
                      </td>
                      {!isCustomerRole && (
  <>
    <td className="table-td whitespace-nowrap">
      {building.customer_company_name || "-"}
    </td>

    {/* <td className="table-td whitespace-nowrap">
      {building.customer_name || "-"}
    </td> */}
  </>
)}

                      <td className="table-td whitespace-nowrap">
                        {building.postcode || "-"}
                      </td>

                      <td className="table-td whitespace-nowrap">
                        {building.country_name || "-"}
                      </td>

                      {/* <td className="table-td whitespace-nowrap">
                        {building.state_name || "-"}
                      </td> */}

                      <td className="table-td whitespace-nowrap">
                        {building.city_name || "-"}
                      </td>

                      <td className="table-td whitespace-nowrap">
                        {/* <div className="flex items-center gap-3">
                          <button
                            type="button"
                            title="View"
                            onClick={() =>
                              getBuildingById(building.building_id)
                            }
                            className="text-green-500 transition-colors hover:text-green-700"
                          >
                            <EyeIcon />
                          </button>

                          <button
                            type="button"
                            title="Print QR Code"
                            onClick={() => printQrCode(building.building_id)}
                            disabled={printLoadingId === building.building_id}
                            className="text-blue-500 transition-colors hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <PrintIcon />
                          </button>

                          <button
                            type="button"
                            title={
                              qrGenerated
                                ? "QR Code already generated"
                                : "Generate QR Code"
                            }
                            onClick={() => generateQrCode(building)}
                            disabled={
                              qrGenerated ||
                              qrLoadingId === building.building_id
                            }
                            className={`transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                              qrGenerated
                                ? "text-gray-400"
                                : "text-purple-500 hover:text-purple-700"
                            }`}
                          >
                            <QRIcon />
                          </button>

                          <button
                            type="button"
                            title="Edit"
                            onClick={() =>
                              handleEditBuilding(building.building_id)
                            }
                            className="text-blue-500 transition-colors hover:text-blue-700"
                          >
                            <EditIcon />
                          </button>

                          <button
                            type="button"
                            title="Delete"
                            onClick={() =>
                              openDeleteModal(building.building_id)
                            }
                            className="text-red-500 transition-colors hover:text-red-700"
                          >
                            <DeleteIcon />
                          </button>
                        </div> */}
                        <div className="flex items-center gap-3">
                          {canReadBuilding && (
                            <>
                              <button
                                type="button"
                                title="View"
                                onClick={() =>
                                  getBuildingById(building.building_id)
                                }
                                className="text-green-500 transition-colors hover:text-green-700"
                              >
                                <EyeIcon />
                              </button>

                              <button
                                type="button"
                                title="Print / Download PDF"
                                onClick={() =>
                                  printQrCode(building.building_id)
                                }
                                disabled={
                                  printLoadingId === building.building_id
                                }
                                className="text-blue-500 transition-colors hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                <PrintIcon />
                              </button>
                            </>
                          )}

                          {canWriteBuilding && (
                            <>
                              <button
                                type="button"
                                title={
                                  qrGenerated
                                    ? "QR Code already generated"
                                    : "Generate QR Code"
                                }
                                onClick={() => generateQrCode(building)}
                                disabled={
                                  qrGenerated ||
                                  qrLoadingId === building.building_id
                                }
                                className={`transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${qrGenerated
                                  ? "text-gray-400"
                                  : "text-purple-500 hover:text-purple-700"
                                  }`}
                              >
                                <QRIcon />
                              </button>

                              <button
                                type="button"
                                title="Edit"
                                onClick={() =>
                                  handleEditBuilding(building.building_id)
                                }
                                className="text-blue-500 transition-colors hover:text-blue-700"
                              >
                                <EditIcon />
                              </button>

                              <button
                                type="button"
                                title="Delete"
                                onClick={() =>
                                  openDeleteModal(building.building_id)
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
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan="7"
                    className="px-6 py-8 text-center text-gray-500 dark:text-gray-400"
                  >
                    No buildings found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-3 border-t border-gray-100 px-4 py-4 text-sm text-gray-500 dark:border-gray-800 dark:text-gray-400 sm:flex-row sm:items-center sm:justify-between">
          <div>
            Showing {getShowingStart()} to {getShowingEnd()} of {total} entries
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
                  className={`rounded-lg border px-3 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${pageNumber === page
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
      </div>

      <PopupModal
        open={viewModalOpen}
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
          View Building Information
        </h2>

        {viewLoading ? (
          <div className="py-10 text-center text-gray-500 dark:text-gray-400">
            Loading building details...
          </div>
        ) : (
          <div className="rounded-2xl border border-gray-200 p-4 dark:border-gray-700 sm:p-6">
            <h3 className="mb-6 text-base font-semibold text-gray-900 dark:text-white sm:mb-8 sm:text-lg">
              Building Information
            </h3>

            <div className="grid grid-cols-1 gap-x-10 gap-y-6 sm:grid-cols-2 sm:gap-y-8 md:grid-cols-3">
              {!isCustomerRole && ( <Info label="Company Name " value={selectedBuilding?.customer_company_name} />)}
              <Info label="URPN" value={selectedBuilding?.uprn_no} />
              <Info
                label="Building Name"
                value={selectedBuilding?.building_name}
              />
             {/* {authRoleId !== 3 && (
  <>
    <Info label="Customer" value={selectedBuilding?.customer_name} />
  </>
)} */}
              <div className="">
                <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">
                  Address Line 1
                </p>
                <p className="max-w-full break-words text-sm font-semibold leading-6 text-gray-900 dark:text-white sm:max-w-[320px]">
                  {selectedBuilding?.address || "-"}
                </p>
              </div>
               <div className="">
                <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">
                  Address Line 2
                </p>
                <p className="max-w-full break-words text-sm font-semibold leading-6 text-gray-900 dark:text-white sm:max-w-[320px]">
                  {selectedBuilding?.address_line_2 || "-"}
                </p>
              </div>
              <Info label="Postcode" value={selectedBuilding?.postcode} />
    <Info label="Country" value={selectedBuilding?.country_name} />

{!["uk", "united kingdom"].includes(
  selectedBuilding?.country_name?.toLowerCase()
) && (
  <Info
    label="State"
    value={selectedBuilding?.state_name}
  />
)}
              <Info label="City" value={selectedBuilding?.city_name} />
              <Info label="Access Information" value={selectedBuilding?.landmark} />
          

            </div>
          </div>
        )}
      </PopupModal>

      <PopupModal
        open={qrModalOpen}
        onClose={closeQrModal}
        maxWidth="max-w-[420px]"
        className="px-3 py-4 sm:px-4 sm:py-6"
        bodyClassName="max-h-[92vh] p-5 sm:p-7"
      >
        <button
          type="button"
          onClick={closeQrModal}
          className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-2xl leading-none text-gray-400 transition hover:bg-gray-200 hover:text-gray-600 dark:bg-gray-800 dark:hover:bg-gray-700"
        >
          ×
        </button>

        <div className="text-center">
          <h2 className="mb-5 pr-10 text-xl font-bold text-gray-900 dark:text-white">
            Building QR Code
          </h2>
          <div className="mt-6 flex justify-center">
            {qrData?.qrCode ? (
              <img
                src={qrData.qrCode}
                alt="Building QR Code"
                className="h-auto w-full max-w-[150px]"
              />
            ) : (
              <p className="text-sm text-gray-500">QR Code not found.</p>
            )}
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              {qrData?.buildingInfo?.building_name || "-"}
            </h3>

            <p className="mt-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              Postcode: {qrData?.buildingInfo?.postcode || "-"}
            </p>

            <p className="mt-3 break-words text-sm leading-6 text-gray-600 dark:text-gray-400">
              {qrData?.buildingInfo?.address || "-"}
            </p>

            <div className="mt-3 flex items-center justify-center gap-2 border-t border-gray-100 pt-4 dark:border-gray-800">
              <span className="text-md font-medium text-gray-500 dark:text-gray-400">
                Powered by
              </span>

              <img
                src={logo}
                alt="FireSystem"
                className="h-8 w-auto object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            </div>
          </div>

          {qrData?.buildingInfo?.building_id && (
            <button
              type="button"
              onClick={() => printQrCode(qrData.buildingInfo.building_id)}
              className="btn-primary mt-5"
            >
              Print QR Code
            </button>
          )}
        </div>
      </PopupModal>

      {deleteModalOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-gray-900/45 px-4 backdrop-blur-[1px]">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl dark:bg-gray-900 sm:p-6">
            <h3 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white sm:text-xl">
              Delete Building
            </h3>

            <p className="mb-6 text-sm text-gray-600 dark:text-gray-400 sm:mb-7">
              Are you sure you want to delete this building?
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
                onClick={confirmDeleteBuilding}
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

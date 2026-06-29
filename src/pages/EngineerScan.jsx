// import { useEffect, useMemo, useRef, useState } from "react";
// import { useNavigate, useSearchParams } from "react-router-dom";
// import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";
// import logo from "../assets/images/logo/logo.svg";
// import { FiArrowRight } from "react-icons/fi";
// import axios from "axios";
// import { apiUrl } from "../config";
// import { format } from "date-fns";
// import { toast } from "react-toastify";
// import PopupModal from "../components/ui/PopupModal";
  

// // --- Icons ---
// const QrIcon = () => (
//   <svg
//     className="h-9 w-9"
//     fill="none"
//     viewBox="0 0 24 24"
//     stroke="currentColor"
//     strokeWidth="1.5"
//   >
//     <path
//       strokeLinecap="round"
//       strokeLinejoin="round"
//       d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5z"
//     />
//     <path
//       strokeLinecap="round"
//       strokeLinejoin="round"
//       d="M16.875 15.75h1.5m-1.5 1.875h1.5m-1.5 1.875h1.5M13.5 15.75h1.125m-1.125 1.875h1.125m-1.125 1.875h1.125"
//     />
//   </svg>
// );
// const EyeIcon = () => (
//   <svg
//     className="h-5 w-5"
//     fill="none"
//     viewBox="0 0 24 24"
//     stroke="currentColor"
//   >
//     <path
//       strokeLinecap="round"
//       strokeLinejoin="round"
//       strokeWidth={2}
//       d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
//     />
//     <path
//       strokeLinecap="round"
//       strokeLinejoin="round"
//       strokeWidth={2}
//       d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
//     />
//   </svg>
// );

// const DownloadIcon = () => (
//   <svg
//     className="h-5 w-5"
//     fill="none"
//     viewBox="0 0 24 24"
//     stroke="currentColor"
//   >
//     <path
//       strokeLinecap="round"
//       strokeLinejoin="round"
//       strokeWidth={2}
//       d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4"
//     />
//   </svg>
// );

// const PrintIcon = () => (
//   <svg
//     className="h-5 w-5"
//     fill="none"
//     viewBox="0 0 24 24"
//     stroke="currentColor"
//   >
//     <path
//       strokeLinecap="round"
//       strokeLinejoin="round"
//       strokeWidth={2}
//       d="M6 9V4h12v5M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2M6 14h12v6H6v-6z"
//     />
//   </svg>
// );

// export default function EngineerScan() {
//   const navigate = useNavigate();
//   const [searchParams] = useSearchParams();

//   const shouldStartScannerRef = useRef(false);
//   const [isBuildingSelectOpen, setIsBuildingSelectOpen] = useState(false);
//   const [screen, setScreen] = useState("scan");
//   const [postcode, setPostcode] = useState("");
//   const [buildingSearch, setBuildingSearch] = useState("");
//   const [selectedBuildingId, setSelectedBuildingId] = useState("");
//   const [selectedBuilding, setSelectedBuilding] = useState(null);

//   const [isLoggedIn, setIsLoggedIn] = useState(false);
//   const [publicMode, setPublicMode] = useState(false);
//   const [publicLoading, setPublicLoading] = useState(false);

//   const [isMobile, setIsMobile] = useState(false);
//   const [scanError, setScanError] = useState("");

//   const scannerRef = useRef(null);
//   const isProcessingScanRef = useRef(false);
//   const [postcodeMatchedBuildings, setPostcodeMatchedBuildings] = useState([]);
//   const [isBuildingLoading, setIsBuildingLoading] = useState(false);
//   const [buildingError, setBuildingError] = useState("");
//   const [isCheckingAccess, setIsCheckingAccess] = useState(true);
//    const [viewLoading, setViewLoading] = useState(false);
//     const [printLoadingId, setPrintLoadingId] = useState(null);
//     const [downloadLoadingId, setDownloadLoadingId] = useState(null);
// const [viewModalOpen, setViewModalOpen] = useState(false);
//   const [selectedLog, setSelectedLog] = useState(null);

//   useEffect(() => {
//     const checkMobile = () => {
//       const userAgent = navigator.userAgent || navigator.vendor || window.opera;

//       const isMobileDevice =
//         /android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(
//           userAgent.toLowerCase(),
//         ) ||
//         (navigator.maxTouchPoints > 1 && window.innerWidth <= 1024);

//       setIsMobile(isMobileDevice);
//     };

//     checkMobile();
//     window.addEventListener("resize", checkMobile);

//     return () => window.removeEventListener("resize", checkMobile);
//   }, []);

//   const [logReports, setLogReports] = useState([]);
//   const [logLoading, setLogLoading] = useState(false);
//   const [logError, setLogError] = useState("");
//   const [logPagination, setLogPagination] = useState({
//     page: 1,
//     limit: 10,
//     total: 0,
//     total_pages: 1,
//   });

//   const stopScanner = async () => {
//     try {
//       if (scannerRef.current) {
//         const state = scannerRef.current.getState?.();

//         if (state === 2) {
//           await scannerRef.current.stop();
//         }

//         try {
//           await scannerRef.current.clear();
//         } catch (clearError) {
//           // ignore clear error
//         }

//         scannerRef.current = null;
//       }
//     } catch (error) {
//       scannerRef.current = null;
//     }
//   };

//   // Only one common object format for full project
//   const normalizeBuildingData = (building) => {
//     return {
//       id: building?.building_id || building?.id || "",
//       name: building?.building_name || building?.name || "",
//       postcode: building?.postcode || "",
//       address: building?.address || "",
//       landmark: building?.landmark || "",
//       customer_name: building?.customer_name || "",
//       customer_company_name: building?.customer_company_name || "",
//       country_name: building?.country_name || "",
//       state_name: building?.state_name || "",
//       city_name: building?.city_name || "",
//       entry_on_place: Number(building?.entry_on_place || 0),
//     };
//   };

//   const findBuildingFromQr = (qrText) => {
//     try {
//       const parsed = JSON.parse(qrText);

//       if (
//         parsed?.building_id ||
//         parsed?.building_name ||
//         parsed?.id ||
//         parsed?.name ||
//         parsed?.postcode
//       ) {
//         return normalizeBuildingData(parsed);
//       }
//     } catch (error) {
//       // Not JSON, then check static/manual building list below.
//     }

//     const cleanValue = String(qrText).trim().toLowerCase();

//     const building = postcodeMatchedBuildings.find((item) => {
//       return (
//         String(item.id).toLowerCase() === cleanValue ||
//         String(item.postcode).toLowerCase() === cleanValue ||
//         String(item.name).toLowerCase() === cleanValue
//       );
//     });

//     return building ? normalizeBuildingData(building) : null;
//   };

//   const saveBuildingToStorage = (building, entryOnPlace = 0) => {
//     const buildingInfo = {
//       ...normalizeBuildingData(building),
//       entry_on_place: Number(entryOnPlace ?? building?.entry_on_place ?? 0),
//     };

//     localStorage.setItem(
//       "selectedEngineerBuilding",
//       JSON.stringify(buildingInfo),
//     );
//   };

//   const getToken = () => {
//     return localStorage.getItem("auth_token") || "";
//   };

//   const getAuthHeaders = () => {
//     const token = getToken();

//     return {
//       Authorization: token,
//       token: token,
//       "x-access-token": token,
//       "Content-Type": "application/json",
//     };
//   };

//   const formatLogId = (item) => {
//     const prefix = item?.customer_prefix || "LOG";
//     const id = String(item?.log_id || "").padStart(4, "0");

//     return `${prefix}-${id}`;
//   };

//   const formatDisplayDate = (dateValue) => {
//     if (!dateValue) return "-";

//     try {
//       return format(new Date(dateValue), "yyyy-MM-dd");
//     } catch (error) {
//       return dateValue;
//     }
//   };

//   const fetchBuildingLogs = async (buildingId, page = 1) => {
//     if (!buildingId) return;

//     try {
//       setLogLoading(true);
//       setLogError("");

//       const response = await axios.post(
//         `${apiUrl}/auth/log_list`,
//         {
//           page,
//           limit: 10,
//           customer_id: "",
//           created_by_id: "",
//           start_date: "",
//           end_date: "",
//           building_id: String(buildingId),
//         },
//         {
//           headers: getAuthHeaders(),
//         },
//       );

//       const result = response.data;

//       if (result?.success) {
//         setLogReports(Array.isArray(result?.data) ? result.data : []);

//         setLogPagination({
//           page: Number(result?.page || 1),
//           limit: Number(result?.limit || 10),
//           total: Number(result?.total || 0),
//           total_pages: Number(result?.total_pages || 1),
//         });
//       } else {
//         setLogReports([]);
//         setLogError(result?.message || "Logs not found.");
//       }
//     } catch (error) {
//       setLogReports([]);
//       setLogError(
//         error?.response?.data?.message ||
//         "Something went wrong while fetching logs.",
//       );
//     } finally {
//       setLogLoading(false);
//     }
//   };

//   const fetchQrBuildingDetail = async (buildingId) => {
//     if (!buildingId) return;

//     const token = localStorage.getItem("auth_token") || "";
//     const authUserRaw = localStorage.getItem("auth_user");
//     const loggedIn = Boolean(token && authUserRaw);

//     setIsLoggedIn(loggedIn);
//     setPublicMode(!loggedIn);

//     try {
//       await stopScanner();

//       setPublicLoading(true);
//       setIsCheckingAccess(true);
//       setScanError("");

//       const headers = loggedIn
//         ? getAuthHeaders()
//         : {
//           "Content-Type": "application/json",
//         };

//       const response = await axios.post(
//         `${apiUrl}/auth/getBuildingById_qrdetail`,
//         {
//           building_id: String(buildingId),
//         },
//         {
//           headers,
//         },
//       );

//       const result = response.data;

//       if (result?.success && result?.data) {
//         const buildingInfo = {
//           ...normalizeBuildingData(result.data),
//           entry_on_place: 1,
//         };

//         setSelectedBuilding(buildingInfo);

//         if (loggedIn) {
//           saveBuildingToStorage(buildingInfo, 1);
//         } else {
//           localStorage.removeItem("selectedEngineerBuilding");
//         }

//         await fetchBuildingLogs(buildingInfo.id, 1);
//         setScreen("actions");
//       } else {
//         setScanError(result?.message || "Building detail not found.");
//         setScreen("scan");
//       }
//     } catch (error) {
//       setScanError(
//         error?.response?.data?.message ||
//         "Something went wrong while fetching building detail.",
//       );
//       setScreen("scan");
//     } finally {
//       setPublicLoading(false);
//       setIsCheckingAccess(false);
//       isProcessingScanRef.current = false;
//     }
//   };
// const getLogById = async (logId) => {
//     try {
//       if (!getToken()) {
//         toast.error("Token not found. Please login again.");
//         return;
//       }

//       setSelectedLog(null);
//       setViewModalOpen(true);
//       setViewLoading(true);

//       const response = await axios.post(
//         `${apiUrl}/auth/get_log_by_id`,
//         {
//           log_id: String(logId),
//         },
//         {
//           headers: getAuthHeaders(),
//         },
//       );

//       if (response?.data?.success) {
//         setSelectedLog(response?.data?.data || null);
//       } else {
//         toast.error(response?.data?.message || "Log details not found.");
//         closeViewModal();
//       }
//     } catch (error) {
//       toast.error(
//         error?.response?.data?.message ||
//           error?.response?.data?.error ||
//           "Failed to load log details.",
//       );
//       closeViewModal();
//     } finally {
//       setViewLoading(false);
//     }
//   };

//    const printLog = async (logId) => {
//     try {
//       if (!getToken()) {
//         toast.error("Token not found. Please login again.");
//         return;
//       }

//       setPrintLoadingId(logId);

//       const response = await axios.post(
//         `${apiUrl}/auth/print_log`,
//         {
//           log_id: String(logId),
//         },
//         {
//           headers: getAuthHeaders(),
//           responseType: "text",
//         },
//       );

//       const printWindow = window.open("", "_blank");

//       if (!printWindow) {
//         toast.error("Please allow popup to print log.");
//         return;
//       }

//       printWindow.document.open();
//       printWindow.document.write(response.data);
//       printWindow.document.close();

//       setTimeout(() => {
//         printWindow.focus();
//         printWindow.print();
//       }, 500);
//     } catch (error) {
//       toast.error(
//         error?.response?.data?.message ||
//           error?.response?.data?.error ||
//           "Failed to print log.",
//       );
//     } finally {
//       setPrintLoadingId(null);
//     }
//   };

//   const downloadExcelRecord = async (log) => {
//     try {
//       if (!log?.log_id) {
//         toast.error("Log ID not found.");
//         return;
//       }

//       if (!getToken()) {
//         toast.error("Token not found. Please login again.");
//         return;
//       }

//       setDownloadLoadingId(log.log_id);

//       const response = await axios.post(
//         `${apiUrl}/auth/export_log`,
//         {
//           log_id: String(log.log_id), // static "1" nahi, actual row id
//         },
//         {
//           headers: getAuthHeaders(),
//           responseType: "blob",
//         },
//       );

//       // If API returns JSON error inside blob
//       const contentType = response.headers["content-type"];

//       if (contentType && contentType.includes("application/json")) {
//         const text = await response.data.text();
//         const json = JSON.parse(text);

//         toast.error(json?.message || "Export failed.");
//         return;
//       }

//       const blob = new Blob([response.data], {
//         type:
//           response.headers["content-type"] ||
//           "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
//       });

//       const url = window.URL.createObjectURL(blob);
//       const link = document.createElement("a");

//       link.href = url;
//       link.download = `maintenance-log-${log.log_id}.xlsx`;
//       document.body.appendChild(link);
//       link.click();

//       link.remove();
//       window.URL.revokeObjectURL(url);

//       toast.success("Excel downloaded successfully.");
//     } catch (error) {
//       let message = "Failed to download Excel.";

//       // Error response also can be blob
//       if (error?.response?.data instanceof Blob) {
//         try {
//           const text = await error.response.data.text();
//           const json = JSON.parse(text);
//           message = json?.message || message;
//         } catch {}
//       } else {
//         message =
//           error?.response?.data?.message ||
//           error?.response?.data?.error ||
//           message;
//       }

//       toast.error(message);
//     } finally {
//       setDownloadLoadingId(null);
//     }
//   };
//   const closeViewModal = () => {
//     setSelectedLog(null);
//     setViewModalOpen(false);
//   };
// const formatDate = (dateValue) => {
//   if (!dateValue) return "-";

//   const date = new Date(dateValue);

//   if (Number.isNaN(date.getTime())) return "-";

//   return format(date, "yyyy-MM-dd");
// };

// const formatDateTime = (dateValue) => {
//   if (!dateValue) return "-";

//   const date = new Date(dateValue);

//   if (Number.isNaN(date.getTime())) return "-";

//   return format(date, "MMM dd, yyyy hh:mm a");
// };

// const formatOnlyTime = (dateValue) => {
//   if (!dateValue) return "-";

//   const date = new Date(dateValue);

//   if (Number.isNaN(date.getTime())) return "-";

//   return format(date, "hh:mm a");
// };
// const formatLogIdWithPrefix = (log) => {
//     if (!log?.log_id) return "-";

//     const prefix =
//       log?.customer_prefix ||
//       log?.prefix ||
//       log?.log_prefix ||
//       log?.company_prefix ||
//       "";

//     const id = String(log.log_id).padStart(4, "0");

//     return prefix ? `${prefix}-${id}` : id;
//   };
//   useEffect(() => {
//     const buildingIdFromUrl = searchParams.get("building_id");
//     const token = localStorage.getItem("auth_token") || "";
//     const authUserRaw = localStorage.getItem("auth_user");

//     const loggedIn = Boolean(token && authUserRaw);

//     setIsLoggedIn(loggedIn);
//     setPublicMode(!loggedIn);

//     // QR URL flow: works with login and without login
//     if (buildingIdFromUrl) {
//       fetchQrBuildingDetail(buildingIdFromUrl);
//       return;
//     }

//     // Normal engineer scan page flow
//     if (!loggedIn) {
//       navigate("/signin", { replace: true });
//       return;
//     }

//     try {
//       const authUser = JSON.parse(authUserRaw);
//       const qrAccess = Number(authUser?.qrcodeaccess);

//       if (qrAccess === 1) {
//         setScreen("scan");
//         setIsCheckingAccess(false);
//         return;
//       }

//       navigate("/engineer-dashboard", { replace: true });
//     } catch (error) {
//       navigate("/signin", { replace: true });
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [searchParams, navigate]);

//   const openScannedBuildingPopup = async (building, entryOnPlace = 1) => {
//     await stopScanner();

//     const buildingInfo = {
//       ...normalizeBuildingData(building),
//       entry_on_place: Number(entryOnPlace || 1),
//     };

//     setSelectedBuilding(buildingInfo);
//     saveBuildingToStorage(buildingInfo, entryOnPlace);

//     await fetchBuildingLogs(buildingInfo.id, 1);

//     setScreen("actions");
//   };

//   const isCameraSupported = () => {
//     return !!(
//       window.isSecureContext &&
//       navigator.mediaDevices &&
//       navigator.mediaDevices.getUserMedia
//     );
//   };

//   const getBestCameraConfig = async () => {
//     try {
//       const cameras = await Html5Qrcode.getCameras();

//       if (Array.isArray(cameras) && cameras.length > 0) {
//         const backCamera =
//           cameras.find((camera) =>
//             /back|rear|environment|camera 0/i.test(camera.label),
//           ) || cameras[cameras.length - 1];

//         return {
//           deviceId: { exact: backCamera.id },
//         };
//       }
//     } catch (error) {
//       // fallback below
//     }

//     return {
//       facingMode: { ideal: "environment" },
//     };
//   };

//   const getBuildingIdFromQrText = (qrText) => {
//     try {
//       const url = new URL(qrText);
//       return url.searchParams.get("building_id");
//     } catch (error) {
//       // not URL
//     }

//     try {
//       const parsed = JSON.parse(qrText);
//       return parsed?.building_id || parsed?.id || "";
//     } catch (error) {
//       return "";
//     }
//   };

//   const startScanner = async () => {
//     setScanError("");
//     isProcessingScanRef.current = false;

//     if (!isMobile) {
//       setScanError("Scanner is available only on mobile/tablet device.");
//       return;
//     }

//     if (!isCameraSupported()) {
//       setScanError(
//         "Camera scanner is not supported. Please open this website in HTTPS on Chrome/Safari mobile browser.",
//       );
//       return;
//     }

//     shouldStartScannerRef.current = true;
//     setScreen("scanner");
//   };

//   useEffect(() => {
//     if (screen !== "scanner" || !shouldStartScannerRef.current) return;

//     let cancelled = false;

//     const initScanner = async () => {
//       try {
//         await stopScanner();

//         requestAnimationFrame(async () => {
//           if (cancelled) return;

//           const qrReaderElement = document.getElementById("qr-reader");

//           if (!qrReaderElement) {
//             setScanError("Scanner view not ready. Please try again.");
//             return;
//           }

//           const scanner = new Html5Qrcode("qr-reader", {
//             formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
//             verbose: false,
//           });

//           scannerRef.current = scanner;

//           const cameraConfig = await getBestCameraConfig();

//           await scanner.start(
//             cameraConfig,
//             {
//               fps: 15,
//               disableFlip: false,
//               aspectRatio: 1.7777778,
//               qrbox: (viewfinderWidth, viewfinderHeight) => {
//                 const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
//                 const size = Math.floor(minEdge * 0.75);

//                 return {
//                   width: size,
//                   height: size,
//                 };
//               },
//               experimentalFeatures: {
//                 useBarCodeDetectorIfSupported: true,
//               },
//             },
//             async (decodedText) => {
//               if (isProcessingScanRef.current) return;

//               isProcessingScanRef.current = true;
//               setScanError("");

//               const scannedBuildingId = getBuildingIdFromQrText(decodedText);

//               if (scannedBuildingId) {
//                 shouldStartScannerRef.current = false;
//                 await fetchQrBuildingDetail(scannedBuildingId);
//                 return;
//               }

//               const building = findBuildingFromQr(decodedText);

//               if (building) {
//                 shouldStartScannerRef.current = false;
//                 await openScannedBuildingPopup(building, 1);
//               } else {
//                 isProcessingScanRef.current = false;
//                 setScanError("Building not found from this QR code.");
//               }
//             },
//             () => { },
//           );
//         });
//       } catch (error) {
//         isProcessingScanRef.current = false;

//         setScanError(
//           "Camera permission denied or scanner not supported. Please allow camera permission and use HTTPS.",
//         );
//       }
//     };

//     initScanner();

//     return () => {
//       cancelled = true;
//     };
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [screen, isMobile]);

//   useEffect(() => {
//     return () => {
//       stopScanner();
//     };
//   }, []);

//   const filteredBuildings = useMemo(() => {
//     if (!postcode.trim()) return [];

//     return postcodeMatchedBuildings.filter((item) => {
//       const buildingNameMatch =
//         !buildingSearch ||
//         String(item.name).toLowerCase().includes(buildingSearch.toLowerCase());

//       const dropdownMatch =
//         !selectedBuildingId || String(item.id) === String(selectedBuildingId);

//       return buildingNameMatch && dropdownMatch;
//     });
//   }, [postcode, postcodeMatchedBuildings, buildingSearch, selectedBuildingId]);

//   const goToDashboardWithBuilding = async (building) => {
//     await openScannedBuildingPopup(building, 2);
//   };

//   const handleBuildingDropdownChange = (e) => {
//     setSelectedBuildingId(e.target.value);
//   };

//   const handleLogout = () => {
//     navigate("/");
//     localStorage.removeItem("auth_user");
//     localStorage.removeItem("auth_token");
//     localStorage.removeItem("isLoggedIn");
//     localStorage.removeItem("userEmail");
//     localStorage.removeItem("userRole");

//     // only one building storage variable
//     localStorage.removeItem("selectedEngineerBuilding");
//   };

//   const getCustomerIdFromStorage = () => {
//     try {
//       const authUser = JSON.parse(localStorage.getItem("auth_user") || "null");

//       return authUser?.customer?.customer_id || "";
//     } catch (error) {
//       return "";
//     }
//   };

//   const fetchBuildingsByPostcode = async (postcodeValue) => {
//     const cleanPostcode = postcodeValue.trim();

//     if (!cleanPostcode) {
//       setPostcodeMatchedBuildings([]);
//       setSelectedBuildingId("");
//       setBuildingSearch("");
//       setBuildingError("");
//       return;
//     }

//     const customerId = getCustomerIdFromStorage();

//     try {
//       setIsBuildingLoading(true);
//       setBuildingError("");

//       const response = await axios.post(
//         `${apiUrl}/auth/buildingByPostcode`,
//         {
//           postcode: cleanPostcode,
//           customer_id: String(customerId),
//         },
//         {
//           headers: getAuthHeaders(),
//         },
//       );

//       const result = response.data;

//       if (result?.success && Array.isArray(result?.data)) {
//         const formattedBuildings = result.data.map((item) =>
//           normalizeBuildingData(item),
//         );

//         setPostcodeMatchedBuildings(formattedBuildings);

//         if (formattedBuildings.length === 0) {
//           setBuildingError("No building found.");
//         }
//       } else {
//         setPostcodeMatchedBuildings([]);
//         setBuildingError("No building found.");
//       }
//     } catch (error) {
//       setPostcodeMatchedBuildings([]);

//       const errorMessage =
//         error?.response?.data?.message ||
//         "Something went wrong while fetching buildings.";

//       setBuildingError(errorMessage);
//     } finally {
//       setIsBuildingLoading(false);
//     }
//   };

//   const handlePostcodeChange = (e) => {
//     const value = e.target.value;

//     setPostcode(value);
//     setSelectedBuildingId("");
//     setBuildingSearch("");

//     fetchBuildingsByPostcode(value);
//   };

//   return (
//     <div className="relative min-h-screen overflow-hidden bg-slate-950 font-sans text-slate-200">
//       {/* BACKGROUND ELEMENTS */}
//       <div className="pointer-events-none absolute inset-0 overflow-hidden">
//         <div className="absolute -left-[10%] -top-[10%] h-[50%] w-[50%] rounded-full bg-blue-600/10 blur-[120px]" />
//         <div className="absolute -right-[10%] top-[20%] h-[40%] w-[40%] rounded-full bg-emerald-600/10 blur-[120px]" />
//         <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
//       </div>

//       {/* HEADER */}
//       <header className="relative z-10 flex items-center justify-end px-6 py-6 lg:px-10">
//         {isLoggedIn && (
//           <button
//             onClick={handleLogout}
//             className="group flex items-center gap-2 text-sm font-medium text-slate-400 transition-all hover:text-white"
//           >
//             <span className="h-px w-4 bg-slate-700 transition-all group-hover:w-6 group-hover:bg-blue-400" />
//             Sign Out
//           </button>
//         )}
//       </header>

//       <main className="relative z-10 flex flex-col items-center justify-center px-4 py-8 sm:py-12">
//         {/* PROGRESS STEPPER */}
//         <div className="mb-8 flex items-center gap-3 sm:mb-10">
//           <div
//             className={`h-1.5 w-12 rounded-full transition-all duration-700 ${screen === "scan" || screen === "search" || screen === "scanner"
//                 ? "bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.6)]"
//                 : "bg-slate-800"
//               }`}
//           />
//           <div
//             className={`h-1.5 w-12 rounded-full transition-all duration-700 ${screen === "actions"
//                 ? "bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.6)]"
//                 : "bg-slate-800"
//               }`}
//           />
//         </div>

//         <div className="w-full max-w-7xl">
//           <div className="group relative overflow-hidden rounded-[32px] border border-white/10 bg-slate-900/40 shadow-2xl backdrop-blur-2xl transition-all duration-500 hover:border-white/20 sm:rounded-[40px]">
//             <div className="p-6 sm:p-8 md:p-14">
//               {publicLoading && (
//                 <div className="animate-in fade-in slide-in-from-bottom-4 text-center duration-700">
//                   <div className="mb-8 flex justify-center">
//                     <div className="flex h-24 w-full max-w-[300px] items-center justify-center rounded-3xl px-7 py-4 shadow-2xl shadow-blue-950/50 sm:h-28 sm:max-w-[340px]">
//                       <img
//                         src={logo}
//                         alt="Logo"
//                         className="max-h-20 w-auto object-contain sm:max-h-24"
//                       />
//                     </div>
//                   </div>

//                   <h2 className="mb-3 text-3xl font-bold text-white">
//                     Loading Building Detail...
//                   </h2>

//                   <p className="text-sm text-slate-400">
//                     Please wait while we fetch building information.
//                   </p>
//                 </div>
//               )}

//               {!publicLoading && screen === "scan" && (
//                 <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
//                   <div className="mb-10 text-center sm:mb-12">
//                     <div className="mx-auto mb-8 flex h-28 w-full max-w-[320px] items-center shadow-2xl shadow-blue-950/50 justify-center px-8 py-5 sm:h-32 sm:max-w-[360px]">
//                       <img
//                         src={logo}
//                         alt="Logo"
//                         className="max-h-24 w-auto object-contain sm:max-h-28"
//                       />
//                     </div>

//                     <h2 className="mb-3 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
//                       Engineer Entry
//                     </h2>

//                     <p className="text-sm text-slate-400 sm:text-base">
//                       Select building by scanner or manual search
//                     </p>
//                   </div>

//                   <div
//                     className={`grid grid-cols-1 gap-6 ${isMobile ? "md:grid-cols-2" : ""
//                       }`}
//                   >
//                     {isMobile && (
//                       <button
//                         onClick={startScanner}
//                         className="group relative flex flex-col items-center justify-center rounded-3xl border border-white/5 bg-white/[0.03] p-8 transition-all hover:-translate-y-1 hover:border-blue-500/50 hover:bg-blue-600/10 sm:p-10"
//                       >
//                         <div className="relative mb-5 flex h-24 w-24 items-center justify-center rounded-3xl bg-blue-500/10 text-blue-400">
//                           <QrIcon />
//                           <div className="animate-scan-move absolute inset-x-3 top-0 h-[2px] bg-blue-400 shadow-[0_0_15px_#60a5fa]" />
//                         </div>

//                         <span className="text-xl font-bold text-white">
//                           Scan QR
//                         </span>

//                         <span className="mt-2 text-xs font-medium uppercase tracking-widest text-slate-500">
//                           Mobile Camera
//                         </span>
//                       </button>
//                     )}

//                     <button
//                       onClick={() => setScreen("search")}
//                       className="group flex flex-col items-center justify-center rounded-3xl border border-white/5 bg-white/[0.03] p-8 transition-all hover:-translate-y-1 hover:border-emerald-500/50 hover:bg-emerald-600/10 sm:p-10"
//                     >
//                       <div className="mb-5 flex h-24 w-24 items-center justify-center rounded-3xl bg-emerald-500/10 text-emerald-400">
//                         <svg
//                           className="h-10 w-10"
//                           fill="none"
//                           viewBox="0 0 24 24"
//                           stroke="currentColor"
//                           strokeWidth="1.5"
//                         >
//                           <path
//                             strokeLinecap="round"
//                             strokeLinejoin="round"
//                             d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
//                           />
//                         </svg>
//                       </div>

//                       <span className="text-xl font-bold text-white">
//                         Manual Search
//                       </span>

//                       <span className="mt-2 text-xs font-medium uppercase tracking-widest text-slate-500">
//                         Postcode / Building
//                       </span>
//                     </button>
//                   </div>

//                   {!isMobile && (
//                     <p className="mt-6 text-center text-xs text-slate-500">
//                       QR scanner is hidden on desktop/windows screen.
//                     </p>
//                   )}

//                   {scanError && (
//                     <div className="mt-5 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
//                       {scanError}
//                     </div>
//                   )}
//                 </div>
//               )}

//               {!publicLoading && screen === "scanner" && (
//                 <div className="animate-in fade-in slide-in-from-right-4 duration-500">
//                   <div className="mb-8 flex justify-center">
//                     <div className="flex h-24 w-full max-w-[300px] items-center justify-center shadow-2xl shadow-blue-950/50 rounded-3xl px-7 py-4 sm:h-28 sm:max-w-[340px]">
//                       <img
//                         src={logo}
//                         alt="Logo"
//                         className="max-h-20 w-auto object-contain sm:max-h-24"
//                       />
//                     </div>
//                   </div>

//                   <button
//                     onClick={async () => {
//                       shouldStartScannerRef.current = false;
//                       await stopScanner();
//                       setScreen("scan");
//                     }}
//                     className="group mb-8 flex items-center gap-2 text-sm text-slate-400 transition-colors hover:text-white"
//                   >
//                     <span className="transition-transform group-hover:-translate-x-1">
//                       ←
//                     </span>
//                     Back
//                   </button>

//                   <h2 className="mb-3 text-3xl font-bold text-white">
//                     Scan Building QR
//                   </h2>

//                   <p className="mb-6 text-sm text-slate-400">
//                     Allow camera permission and scan building QR code.
//                   </p>

//                   <div className="overflow-hidden rounded-3xl border border-white/10 bg-black/30 p-3">
//                     <div id="qr-reader" className="min-h-[280px] w-full" />
//                   </div>

//                   {scanError && (
//                     <div className="mt-5 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
//                       {scanError}
//                     </div>
//                   )}
//                 </div>
//               )}

//               {!publicLoading && screen === "search" && (
//                 <div className="animate-in fade-in slide-in-from-right-4 duration-500">
//                   <div className="mb-8 flex justify-center">
//                     <div className="flex h-24 w-full max-w-[300px] items-center justify-center rounded-3xl px-7 py-4 shadow-2xl shadow-blue-950/50 sm:h-28 sm:max-w-[340px]">
//                       <img
//                         src={logo}
//                         alt="Logo"
//                         className="max-h-20 w-auto object-contain sm:max-h-24"
//                       />
//                     </div>
//                   </div>

//                   <button
//                     onClick={() => setScreen("scan")}
//                     className="group mb-8 flex items-center gap-2 text-sm text-slate-400 transition-colors hover:text-white"
//                   >
//                     <span className="transition-transform group-hover:-translate-x-1">
//                       ←
//                     </span>
//                     Back to Options
//                   </button>

//                   <h2 className="mb-8 text-3xl font-bold text-white">
//                     Locate Building
//                   </h2>

//                   <div className="space-y-6">
//                     <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
//                       <div className="space-y-2">
//                         <label className="ml-1 text-xs font-bold uppercase tracking-widest text-slate-500">
//                           Enter Postcode
//                         </label>

//                         <input
//                           type="text"
//                           placeholder="Enter postcode..."
//                           value={postcode}
//                           onChange={handlePostcodeChange}
//                           className="w-full rounded-2xl border border-white/10 bg-slate-800/50 px-6 py-4 text-white outline-none transition-all placeholder:text-slate-600 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10"
//                         />
//                       </div>

//                       <div className="space-y-2">
//                         <label className="ml-1 text-xs font-bold uppercase tracking-widest text-slate-500">
//                           Building Dropdown
//                         </label>

//                         <div className="relative w-full">
//                           <select
//                             value={selectedBuildingId}
//                             onChange={handleBuildingDropdownChange}
//                             className="w-full appearance-none rounded-2xl border border-white/10 bg-slate-800/50 px-4 py-4 pr-12 text-white outline-none transition-all duration-300 ease-in-out hover:border-blue-400/40 hover:bg-slate-800/70 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10"
//                           >
//                             <option value="">
//                               {postcode.trim()
//                                 ? "Select Building"
//                                 : "Enter postcode first"}
//                             </option>

//                             {postcodeMatchedBuildings.map((building) => (
//                               <option key={building.id} value={building.id}>
//                                 {building.name}
//                               </option>
//                             ))}
//                           </select>

//                           <svg
//                             className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-300 transition-transform duration-300"
//                             xmlns="http://www.w3.org/2000/svg"
//                             fill="none"
//                             viewBox="0 0 24 24"
//                             stroke="currentColor"
//                             strokeWidth="2"
//                           >
//                             <path
//                               strokeLinecap="round"
//                               strokeLinejoin="round"
//                               d="M19 9l-7 7-7-7"
//                             />
//                           </svg>
//                         </div>
//                       </div>
//                     </div>

//                     <div className="space-y-2">
//                       <label className="ml-1 text-xs font-bold uppercase tracking-widest text-slate-500">
//                         Search Building
//                       </label>

//                       <input
//                         type="text"
//                         placeholder="Search building name..."
//                         className="w-full rounded-2xl border border-white/10 bg-slate-800/50 px-6 py-4 text-white outline-none transition-all placeholder:text-slate-600 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10"
//                         value={buildingSearch}
//                         onChange={(e) => setBuildingSearch(e.target.value)}
//                       />
//                     </div>

//                     <div className="custom-scrollbar max-h-72 space-y-3 overflow-y-auto pr-2">
//                       {!postcode.trim() ? (
//                         <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-center text-sm text-slate-500">
//                           Please enter postcode to show buildings.
//                         </div>
//                       ) : isBuildingLoading ? (
//                         <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-center text-sm text-slate-500">
//                           Loading buildings...
//                         </div>
//                       ) : buildingError ? (
//                         <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-5 text-center text-sm text-red-300">
//                           {buildingError}
//                         </div>
//                       ) : filteredBuildings.length > 0 ? (
//                         filteredBuildings.map((building) => (
//                           <div
//                             key={building.id}
//                             onClick={() => goToDashboardWithBuilding(building)}
//                             className="group flex cursor-pointer items-center justify-between rounded-2xl border border-transparent bg-white/[0.03] p-5 transition-all hover:border-white/10 hover:bg-white/[0.08] active:scale-[0.98]"
//                           >
//                             <div>
//                               <p className="font-bold text-white transition-colors group-hover:text-blue-400">
//                                 {building.name}
//                               </p>

//                               <p className="text-sm text-slate-500">
//                                 {building.postcode || "-"}{" "}
//                                 {building.address
//                                   ? `• ${building.address}`
//                                   : ""}
//                               </p>
//                             </div>

//                             <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800 text-slate-400 transition-all group-hover:bg-blue-500 group-hover:text-white">
//                               <FiArrowRight className="h-5 w-5" />
//                             </div>
//                           </div>
//                         ))
//                       ) : (
//                         <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-center text-sm text-slate-500">
//                           No building found.
//                         </div>
//                       )}
//                     </div>

//                     {selectedBuildingId && (
//                       <button
//                         onClick={() => {
//                           const building = postcodeMatchedBuildings.find(
//                             (item) =>
//                               String(item.id) === String(selectedBuildingId),
//                           );

//                           if (building) {
//                             goToDashboardWithBuilding(building);
//                           }
//                         }}
//                         className="w-full rounded-2xl bg-blue-600 px-8 py-5 font-bold text-white shadow-xl shadow-blue-900/20 transition-all hover:bg-blue-500 active:scale-95"
//                       >
//                         Continue to Dashboard
//                       </button>
//                     )}
//                   </div>
//                 </div>
//               )}

//               {/* {!publicLoading && screen === "actions" && (
//                 <div className="animate-in zoom-in-95 text-center duration-500">
//                   <div className="mb-8 flex justify-center">
//                     <div className="flex h-24 w-full max-w-[300px] items-center justify-center rounded-3xl border border-white/10 px-7 py-4 sm:h-28 sm:max-w-[340px]">
//                       <img
//                         src={logo}
//                         alt="Logo"
//                         className="max-h-20 w-auto object-contain sm:max-h-24"
//                       />
//                     </div>
//                   </div>

//                   <div className="relative mx-auto mb-8">
//                     <div className="relative z-10 mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
//                       <svg
//                         className="h-12 w-12"
//                         fill="none"
//                         viewBox="0 0 24 24"
//                         stroke="currentColor"
//                         strokeWidth="2.5"
//                       >
//                         <path
//                           strokeLinecap="round"
//                           strokeLinejoin="round"
//                           d="M5 13l4 4L19 7"
//                         />
//                       </svg>
//                     </div>

//                     <div className="absolute inset-0 mx-auto h-24 w-24 animate-ping rounded-full bg-emerald-500/20 opacity-20" />
//                   </div>

//                   <h2 className="mb-2 text-3xl font-black text-white sm:text-4xl">
//                     {selectedBuilding?.name}
//                   </h2>

//                   <div className="mx-auto mb-8 max-w-md rounded-3xl border border-white/10 bg-white/[0.03] p-5 text-left">
//                     <p className="mb-2 text-sm text-slate-400">
//                       <span className="font-bold text-slate-200">
//                         Postcode:{" "}
//                       </span>{" "}
//                       {selectedBuilding?.postcode || "-"}
//                     </p>

//                     <p className="mb-2 text-sm text-slate-400">
//                       <span className="font-bold text-slate-200">Address:</span>{" "}
//                       {selectedBuilding?.address || "-"}
//                     </p>
//                   </div>

//                   <p className="mb-8 text-sm font-medium uppercase tracking-wide text-emerald-400">
//                     Building Scanned Successfully
//                   </p>

//                   {isLoggedIn ? (
//                     <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
//                       <button
//                         onClick={() => {
//                           const finalEntryOnPlace = Number(
//                             selectedBuilding?.entry_on_place ?? 0,
//                           );

//                           if (selectedBuilding) {
//                             saveBuildingToStorage(
//                               selectedBuilding,
//                               finalEntryOnPlace,
//                             );
//                           }

//                           navigate(
//                             `/create-log?entry_on_place=${finalEntryOnPlace}`,
//                           );
//                         }}
//                         className="group relative overflow-hidden rounded-2xl bg-blue-600 px-8 py-5 font-bold text-white shadow-xl shadow-blue-900/20 transition-all hover:bg-blue-500 active:scale-95"
//                       >
//                         Create New Log
//                       </button>

//                       <button
//                         onClick={() => {
//                           localStorage.removeItem("selectedEngineerBuilding");
//                           navigate("/engineer-dashboard");
//                         }}
//                         className="rounded-2xl border border-white/10 bg-white/5 px-8 py-5 font-bold text-white transition-all hover:bg-white/10 active:scale-95"
//                       >
//                         Go to Dashboard
//                       </button>
//                     </div>
//                   ) : (
//                     <div className="rounded-2xl border border-blue-500/20 bg-blue-500/10 p-5 text-center text-sm text-blue-200">
//                       This is public QR building information. Please login as
//                       engineer to create log.
//                     </div>
//                   )}

//                   {isLoggedIn && (
//                     <button
//                       onClick={() => {
//                         setSelectedBuilding(null);
//                         setSelectedBuildingId("");
//                         setPostcode("");
//                         setBuildingSearch("");
//                         setScanError("");
//                         localStorage.removeItem("selectedEngineerBuilding");
//                         setScreen("scan");
//                         shouldStartScannerRef.current = false;
//                         stopScanner();
//                       }}
//                       className="mt-10 text-xs font-bold uppercase tracking-widest text-slate-500 transition-colors hover:text-blue-400"
//                     >
//                       Reset Selection
//                     </button>
//                   )}
//                 </div>
//               )} */}

//               {!publicLoading && screen === "actions" && (
//                 <div className="animate-in zoom-in-95 duration-500">
//                   <div className="mb-6 flex items-center justify-between">
//                     <div>
//                       <h2 className="text-3xl font-bold text-white">Logs Reports</h2>
//                       <p className="mt-1 text-sm text-slate-400">
//                         Scanned Building: {selectedBuilding?.name || "-"}
//                       </p>
//                     </div>

//                     {isLoggedIn && (
//                       <button
//                         onClick={() => {
//                           const finalEntryOnPlace = Number(
//                             selectedBuilding?.entry_on_place ?? 0,
//                           );

//                           if (selectedBuilding) {
//                             saveBuildingToStorage(selectedBuilding, finalEntryOnPlace);
//                           }

//                           navigate(`/create-log?entry_on_place=${finalEntryOnPlace}`);
//                         }}
//                         className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-500"
//                       >
//                         Create New Log
//                       </button>
//                     )}
//                   </div>

//                   <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
//                     <div className="overflow-x-auto">
//                       <table className="min-w-full text-left text-sm text-slate-700">
//                         <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
//                           <tr>
//                             <th className="px-6 py-4">Log ID</th>
//                             <th className="px-6 py-4">Maintenance Type</th>
//                             <th className="px-6 py-4">Company Name</th>
//                             <th className="px-6 py-4">Building</th>
//                             <th className="px-6 py-4">Postcode</th>
//                             <th className="px-6 py-4">Engineer</th>
//                             <th className="px-6 py-4">Date of Inspection</th>
//                             <th className="px-6 py-4">Action</th>
//                           </tr>
//                         </thead>

//                         <tbody className="divide-y divide-slate-200 bg-white">
//                           {logLoading ? (
//                             <tr>
//                               <td colSpan="7" className="px-6 py-10 text-center text-slate-500">
//                                 Loading logs...
//                               </td>
//                             </tr>
//                           ) : logError ? (
//                             <tr>
//                               <td colSpan="7" className="px-6 py-10 text-center text-red-500">
//                                 {logError}
//                               </td>
//                             </tr>
//                           ) : logReports.length > 0 ? (
//                             logReports.map((item) => (
//                               <tr key={item.log_id} className="hover:bg-slate-50">
//                                 <td className="px-6 py-5 font-semibold text-blue-600">
//                                   {formatLogId(item)}
//                                 </td>
//                                 <td className="px-6 py-5">
//                                   {item.maintenance_type_name || "-"}
//                                 </td>
//                                 <td className="px-6 py-5">
//                                   {item.customer_company_name || "-"}
//                                 </td>
//                                 <td className="px-6 py-5">
//                                   {item.building_name || "-"}
//                                 </td>
//                                 <td className="px-6 py-5">
//                                   {item.postcode || "-"}
//                                 </td>
//                                 <td className="px-6 py-5">
//                                   {item.created_by_name || "-"}
//                                 </td>
//                                 <td className="px-6 py-5">
//                                   {formatDisplayDate(item.entry_date)}
//                                 </td>
//                                   <td className="table-td whitespace-nowrap">
//                       <div className="flex items-center gap-3">
//                         <button
//                           type="button"
//                           title="View"
//                           onClick={() => getLogById(item.log_id)}
//                           className="text-green-500 hover:text-green-700"
//                         >
//                           <EyeIcon />
//                         </button>

                        
//                             <button
//                               type="button"
//                               title="Print"
//                             //  disabled={printLoadingId === log.log_id}
//                               onClick={() => printLog(item.log_id)}
//                               className="text-purple-500 hover:text-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
//                             >
//                               <PrintIcon />
//                             </button>

//                             <button
//                               type="button"
//                               title="Download Excel"
//                            //   disabled={downloadLoadingId === log.log_id}
//                               onClick={() => downloadExcelRecord(item)}
//                               className="text-blue-500 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
//                             >
//                               <DownloadIcon />
//                             </button>
                      
                       
//                       </div>
//                     </td>
//                               </tr>
//                             ))
//                           ) : (
//                             <tr>
//                               <td colSpan="7" className="px-6 py-10 text-center text-slate-500">
//                                 No logs found for this building.
//                               </td>
//                             </tr>
//                           )}
//                         </tbody>
//                       </table>
//                     </div>

//                     <div className="flex flex-col items-start justify-between gap-4 border-t border-slate-200 px-6 py-4 text-sm text-slate-500 sm:flex-row sm:items-center">
//                       <span>
//                         Showing {logReports.length > 0 ? 1 : 0} to {logReports.length} of{" "}
//                         {logPagination.total} entries
//                       </span>

//                       <div className="flex items-center gap-2">
//                         <button
//                           type="button"
//                           disabled={logPagination.page <= 1 || logLoading}
//                           onClick={() =>
//                             fetchBuildingLogs(selectedBuilding?.id, logPagination.page - 1)
//                           }
//                           className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
//                         >
//                           Previous
//                         </button>

//                         <button
//                           type="button"
//                           className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white"
//                         >
//                           {logPagination.page}
//                         </button>

//                         <button
//                           type="button"
//                           disabled={
//                             logPagination.page >= logPagination.total_pages || logLoading
//                           }
//                           onClick={() =>
//                             fetchBuildingLogs(selectedBuilding?.id, logPagination.page + 1)
//                           }
//                           className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
//                         >
//                           Next
//                         </button>
//                       </div>
//                     </div>
//                   </div>

//                   {isLoggedIn && (
//                     <button
//                       onClick={() => {
//                         setSelectedBuilding(null);
//                         setSelectedBuildingId("");
//                         setPostcode("");
//                         setBuildingSearch("");
//                         setScanError("");
//                         setLogReports([]);
//                         setLogError("");
//                         localStorage.removeItem("selectedEngineerBuilding");
//                         setScreen("scan");
//                         shouldStartScannerRef.current = false;
//                         stopScanner();
//                       }}
//                       className="mt-6 text-sm font-medium text-slate-400 transition hover:text-white"
//                     >
//                       Scan Another QR
//                     </button>
//                   )}
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//          <PopupModal
//         open={viewModalOpen}
//         onClose={closeViewModal}
//         maxWidth="max-w-[900px]"
//         className="px-3 py-4 sm:px-4 sm:py-6"
//         bodyClassName="max-h-[92vh] p-5 sm:p-8"
//       >
//         <button
//           type="button"
//           onClick={closeViewModal}
//           className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-2xl leading-none text-gray-400 transition hover:bg-gray-200 hover:text-gray-600 dark:bg-gray-800 dark:hover:bg-gray-700"
//         >
//           ×
//         </button>

//         <div className="mb-6 pr-12">
//           <h2 className="text-xl font-bold text-gray-900 dark:text-white sm:text-2xl">
//             View Log Details
//           </h2>
//           <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 flex gap-2">
//             <span className="mt-1 text-sm text-gray-500 dark:text-gray-400">

//               {selectedLog?.log_id
//                 ? <>
//                 <span className="font-semibold">LOG ID :</span> {formatLogIdWithPrefix(selectedLog)}
//                 </>
//                 : "Loading log information"
//                 }
               
//             </span>
//             <span className="mt-1 text-sm text-gray-500 dark:text-gray-400">

//               {selectedLog?.entry_date
//                 ? <>
//                 <span className="font-semibold">Create Date :</span> {formatDateTime(selectedLog?.entry_date)}
//                 </>
//                 : "Loading log information"
//                 }
               
//             </span>
//           </p>
//         </div>

//         {viewLoading ? (
//           <div className="py-10 text-center text-gray-500 dark:text-gray-400">
//             Loading log details...
//           </div>
//         ) : (
//           <div className="space-y-6">
//             <div className="rounded-2xl border border-gray-200 p-4 dark:border-gray-700 sm:p-6">
//               <h3 className="mb-5 text-base font-semibold text-gray-900 dark:text-white">
//                 Customer & Building Information
//               </h3>

//               <div className="grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2 md:grid-cols-3">
//                 <Info
//                   label="Customer Name"
//                   value={selectedLog?.customer_name}
//                 />

//                 <Info
//                   label="Building Name"
//                   value={selectedLog?.building_name}
//                 />
//                 <Info label="Postcode" value={selectedLog?.postcode} />
//                 <Info label="Country" value={selectedLog?.country_name} />
//                 <Info label="State" value={selectedLog?.state_name} />
//                 <Info label="City" value={selectedLog?.city_name} />
//                 <Info label="Landmark" value={selectedLog?.landmark} />

//                 <div className="sm:col-span-2 md:col-span-3">
//                   <Info label="Address" value={selectedLog?.address} />
//                 </div>
//               </div>
//             </div>
//   {selectedLog?.maintenance_entries?.length > 0 ? (
//     selectedLog.maintenance_entries.map((entry) => ( 
//             <div className="rounded-2xl border border-gray-200 p-4 dark:border-gray-700 sm:p-6">
//               <h3 className="mb-5 text-base font-semibold text-gray-900 dark:text-white">
//                 {entry?.component_name}
//               </h3>

//               <div className="grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2 md:grid-cols-3">
              
//                 <Info
//                   label="Purpose of Visit"
//                   value={entry?.maintenance_cycle_name}
//                 />
//                     <Info
//                     label="Date"
//                     value={formatDate(entry?.created_at)}
//                   />
//                   <Info
//                   label="start Time"
//                   value={`${formatOnlyTime(
//                     entry?.start_time,
//                   )} `}
//                 />
//                   <Info
//                   label="End Time"
//                   value={`${formatOnlyTime(
//                     entry?.finish_time,
//                   )} `}
//                 />
//                 <Info label="Remidial Action Taken" value= {entry?.remark || "-"} />
//               </div>
//             </div>

//              ))
//   ) : (
//     <div className="rounded-2xl border border-gray-200 p-4 text-center text-gray-500 dark:border-gray-700 dark:text-gray-400">
//       No maintenance entries found
//     </div>
//   )}

//             <div className="rounded-2xl border border-gray-200 p-4 dark:border-gray-700 sm:p-6">
//               <h3 className="mb-5 text-base font-semibold text-gray-900 dark:text-white">
//                 Engineer Information
//               </h3>

//               <div className="grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2 md:grid-cols-3">
//                 <Info
//                   label="Engineer Name"
//                   value={selectedLog?.created_by_name}
//                 />
//                 <Info
//                   label="Engineer Email"
//                   value={selectedLog?.created_by_email}
//                 />
//               </div>
//             </div>

//           </div>
//         )}
//       </PopupModal>
//       </main>
//     </div>
//   );
// }

// function Info({ label, value }) {
//   return (
//     <div>
//       <p className="mb-2 text-xs text-gray-900 font-semibold dark:text-gray-400">{label}</p>
//       <p className="break-words text-sm  text-gray-500 dark:text-white">
//         {value || "-"}
//       </p>
//     </div>
//   );
// }


//17-6-2026 krupa shah

import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";
import logo from "../assets/images/logo/logo.svg";
import { FiArrowRight } from "react-icons/fi";
import axios from "axios";
import { apiUrl } from "../config";

// --- Icons ---
const QrIcon = () => (
  <svg
    className="h-9 w-9"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth="1.5"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M16.875 15.75h1.5m-1.5 1.875h1.5m-1.5 1.875h1.5M13.5 15.75h1.125m-1.125 1.875h1.125m-1.125 1.875h1.125"
    />
  </svg>
);

export default function EngineerScan() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const shouldStartScannerRef = useRef(false);
  const [isBuildingSelectOpen, setIsBuildingSelectOpen] = useState(false);
  const [screen, setScreen] = useState("scan");
  const [postcode, setPostcode] = useState("");
  const [buildingSearch, setBuildingSearch] = useState("");
  const [selectedBuildingId, setSelectedBuildingId] = useState("");
  const [selectedBuilding, setSelectedBuilding] = useState(null);

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [publicMode, setPublicMode] = useState(false);
  const [publicLoading, setPublicLoading] = useState(false);

  const [isMobile, setIsMobile] = useState(false);
  const [scanError, setScanError] = useState("");

  const scannerRef = useRef(null);
  const isProcessingScanRef = useRef(false);
  const [postcodeMatchedBuildings, setPostcodeMatchedBuildings] = useState([]);
  const [isBuildingLoading, setIsBuildingLoading] = useState(false);
  const [buildingError, setBuildingError] = useState("");
  const [isCheckingAccess, setIsCheckingAccess] = useState(true);

  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor || window.opera;

      const isMobileDevice =
        /android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(
          userAgent.toLowerCase(),
        ) ||
        (navigator.maxTouchPoints > 1 && window.innerWidth <= 1024);

      setIsMobile(isMobileDevice);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const stopScanner = async () => {
    try {
      if (scannerRef.current) {
        const state = scannerRef.current.getState?.();

        if (state === 2) {
          await scannerRef.current.stop();
        }

        try {
          await scannerRef.current.clear();
        } catch (clearError) {
          // ignore clear error
        }

        scannerRef.current = null;
      }
    } catch (error) {
      scannerRef.current = null;
    }
  };

  // Only one common object format for full project
  const normalizeBuildingData = (building) => {
    return {
      id: building?.building_id || building?.id || "",
      name: building?.building_name || building?.name || "",
      postcode: building?.postcode || "",
      address: building?.address || "",
      landmark: building?.landmark || "",
      customer_name: building?.customer_name || "",
      customer_company_name: building?.customer_company_name || "",
      country_name: building?.country_name || "",
      state_name: building?.state_name || "",
      city_name: building?.city_name || "",
      entry_on_place: Number(building?.entry_on_place || 0),
    };
  };

  const findBuildingFromQr = (qrText) => {
    try {
      const parsed = JSON.parse(qrText);

      if (
        parsed?.building_id ||
        parsed?.building_name ||
        parsed?.id ||
        parsed?.name ||
        parsed?.postcode
      ) {
        return normalizeBuildingData(parsed);
      }
    } catch (error) {
      // Not JSON, then check static/manual building list below.
    }

    const cleanValue = String(qrText).trim().toLowerCase();

    const building = postcodeMatchedBuildings.find((item) => {
      return (
        String(item.id).toLowerCase() === cleanValue ||
        String(item.postcode).toLowerCase() === cleanValue ||
        String(item.name).toLowerCase() === cleanValue
      );
    });

    return building ? normalizeBuildingData(building) : null;
  };

  const saveBuildingToStorage = (building, entryOnPlace = 0) => {
    const buildingInfo = {
      ...normalizeBuildingData(building),
      entry_on_place: Number(entryOnPlace ?? building?.entry_on_place ?? 0),
    };

    localStorage.setItem(
      "selectedEngineerBuilding",
      JSON.stringify(buildingInfo),
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

  const fetchQrBuildingDetail = async (buildingId) => {
    if (!buildingId) return;

    const token = localStorage.getItem("auth_token") || "";
    const authUserRaw = localStorage.getItem("auth_user");
    const loggedIn = Boolean(token && authUserRaw);

    setIsLoggedIn(loggedIn);
    setPublicMode(!loggedIn);

    try {
      await stopScanner();

      setPublicLoading(true);
      setIsCheckingAccess(true);
      setScanError("");

      const headers = loggedIn
        ? getAuthHeaders()
        : {
            "Content-Type": "application/json",
          };

      const response = await axios.post(
        `${apiUrl}/auth/getBuildingById_qrdetail`,
        {
          building_id: String(buildingId),
        },
        {
          headers,
        },
      );

      const result = response.data;

      if (result?.success && result?.data) {
        const buildingInfo = {
          ...normalizeBuildingData(result.data),
          entry_on_place: 1,
        };

        setSelectedBuilding(buildingInfo);

         if (loggedIn) {
    saveBuildingToStorage(buildingInfo, 1);
    setScreen("actions");
  } else {
    localStorage.removeItem("selectedEngineerBuilding");
    navigate(`/building-logs?building_id=${buildingInfo.id}`);
  }
      } else {
        setScanError(result?.message || "Building detail not found.");
        setScreen("scan");
      }
    } catch (error) {
      setScanError(
        error?.response?.data?.message ||
          "Something went wrong while fetching building detail.",
      );
      setScreen("scan");
    } finally {
      setPublicLoading(false);
      setIsCheckingAccess(false);
      isProcessingScanRef.current = false;
    }
  };

  useEffect(() => {
    const buildingIdFromUrl = searchParams.get("building_id");
    const token = localStorage.getItem("auth_token") || "";
    const authUserRaw = localStorage.getItem("auth_user");

    const loggedIn = Boolean(token && authUserRaw);

    setIsLoggedIn(loggedIn);
    setPublicMode(!loggedIn);

    // QR URL flow: works with login and without login
    if (buildingIdFromUrl) {
      fetchQrBuildingDetail(buildingIdFromUrl);
      return;
    }

    // Normal engineer scan page flow
    if (!loggedIn) {
      navigate("/signin", { replace: true });
      return;
    }

    try {
      const authUser = JSON.parse(authUserRaw);
      const qrAccess = Number(authUser?.qrcodeaccess);

      if (qrAccess === 1) {
        setScreen("scan");
        setIsCheckingAccess(false);
        return;
      }

      navigate("/engineer-dashboard", { replace: true });
    } catch (error) {
      navigate("/signin", { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, navigate]);

  const openScannedBuildingPopup = async (building, entryOnPlace = 1) => {
    await stopScanner();

    const buildingInfo = {
      ...normalizeBuildingData(building),
      entry_on_place: Number(entryOnPlace || 1),
    };

    setSelectedBuilding(buildingInfo);
    saveBuildingToStorage(buildingInfo, entryOnPlace);

    setScreen("actions"); 
     
  };

  const isCameraSupported = () => {
    return !!(
      window.isSecureContext &&
      navigator.mediaDevices &&
      navigator.mediaDevices.getUserMedia
    );
  };

  const getBestCameraConfig = async () => {
    try {
      const cameras = await Html5Qrcode.getCameras();

      if (Array.isArray(cameras) && cameras.length > 0) {
        const backCamera =
          cameras.find((camera) =>
            /back|rear|environment|camera 0/i.test(camera.label),
          ) || cameras[cameras.length - 1];

        return {
          deviceId: { exact: backCamera.id },
        };
      }
    } catch (error) {
      // fallback below
    }

    return {
      facingMode: { ideal: "environment" },
    };
  };

  const getBuildingIdFromQrText = (qrText) => {
    try {
      const url = new URL(qrText);
      return url.searchParams.get("building_id");
    } catch (error) {
      // not URL
    }

    try {
      const parsed = JSON.parse(qrText);
      return parsed?.building_id || parsed?.id || "";
    } catch (error) {
      return "";
    }
  };

  const startScanner = async () => {
    setScanError("");
    isProcessingScanRef.current = false;

    if (!isMobile) {
      setScanError("Scanner is available only on mobile/tablet device.");
      return;
    }

    if (!isCameraSupported()) {
      setScanError(
        "Camera scanner is not supported. Please open this website in HTTPS on Chrome/Safari mobile browser.",
      );
      return;
    }

    shouldStartScannerRef.current = true;
    setScreen("scanner");
  };

  useEffect(() => {
    if (screen !== "scanner" || !shouldStartScannerRef.current) return;

    let cancelled = false;

    const initScanner = async () => {
      try {
        await stopScanner();

        requestAnimationFrame(async () => {
          if (cancelled) return;

          const qrReaderElement = document.getElementById("qr-reader");

          if (!qrReaderElement) {
            setScanError("Scanner view not ready. Please try again.");
            return;
          }

          const scanner = new Html5Qrcode("qr-reader", {
            formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
            verbose: false,
          });

          scannerRef.current = scanner;

          const cameraConfig = await getBestCameraConfig();

          await scanner.start(
            cameraConfig,
            {
              fps: 15,
              disableFlip: false,
              aspectRatio: 1.7777778,
              qrbox: (viewfinderWidth, viewfinderHeight) => {
                const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
                const size = Math.floor(minEdge * 0.75);

                return {
                  width: size,
                  height: size,
                };
              },
              experimentalFeatures: {
                useBarCodeDetectorIfSupported: true,
              },
            },
            async (decodedText) => {
              if (isProcessingScanRef.current) return;

              isProcessingScanRef.current = true;
              setScanError("");

              const scannedBuildingId = getBuildingIdFromQrText(decodedText);

              if (scannedBuildingId) {
                shouldStartScannerRef.current = false;
                await fetchQrBuildingDetail(scannedBuildingId);
                return;
              }

              const building = findBuildingFromQr(decodedText);

              if (building) {
                shouldStartScannerRef.current = false;
                await openScannedBuildingPopup(building, 1);
              } else {
                isProcessingScanRef.current = false;
                setScanError("Building not found from this QR code.");
              }
            },
            () => {},
          );
        });
      } catch (error) {
        isProcessingScanRef.current = false;

        setScanError(
          "Camera permission denied or scanner not supported. Please allow camera permission and use HTTPS.",
        );
      }
    };

    initScanner();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen, isMobile]);

  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, []);

  const filteredBuildings = useMemo(() => {
    if (!postcode.trim()) return [];

    return postcodeMatchedBuildings.filter((item) => {
      const buildingNameMatch =
        !buildingSearch ||
        String(item.name).toLowerCase().includes(buildingSearch.toLowerCase());

      const dropdownMatch =
        !selectedBuildingId || String(item.id) === String(selectedBuildingId);

      return buildingNameMatch && dropdownMatch;
    });
  }, [postcode, postcodeMatchedBuildings, buildingSearch, selectedBuildingId]);

  const goToDashboardWithBuilding = async (building) => {
    await openScannedBuildingPopup(building, 2);
  };

  const handleBuildingDropdownChange = (e) => {
    setSelectedBuildingId(e.target.value);
  };

  const handleLogout = () => {
    navigate("/");
    localStorage.removeItem("auth_user");
    localStorage.removeItem("auth_token");
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userRole");

    // only one building storage variable
    localStorage.removeItem("selectedEngineerBuilding");
  };

  const getCustomerIdFromStorage = () => {
    try {
      const authUser = JSON.parse(localStorage.getItem("auth_user") || "null");

      return authUser?.customer?.customer_id || "";
    } catch (error) {
      return "";
    }
  };

  const fetchBuildingsByPostcode = async (postcodeValue) => {
    const cleanPostcode = postcodeValue.trim();

    if (!cleanPostcode) {
      setPostcodeMatchedBuildings([]);
      setSelectedBuildingId("");
      setBuildingSearch("");
      setBuildingError("");
      return;
    }

    const customerId = getCustomerIdFromStorage();

    try {
      setIsBuildingLoading(true);
      setBuildingError("");

      const response = await axios.post(
        `${apiUrl}/auth/buildingByPostcode`,
        {
          postcode: cleanPostcode,
          customer_id: String(customerId),
        },
        {
          headers: getAuthHeaders(),
        },
      );

      const result = response.data;

      if (result?.success && Array.isArray(result?.data)) {
        const formattedBuildings = result.data.map((item) =>
          normalizeBuildingData(item),
        );

        setPostcodeMatchedBuildings(formattedBuildings);

        if (formattedBuildings.length === 0) {
          setBuildingError("No building found.");
        }
      } else {
        setPostcodeMatchedBuildings([]);
        setBuildingError("No building found.");
      }
    } catch (error) {
      setPostcodeMatchedBuildings([]);

      const errorMessage =
        error?.response?.data?.message ||
        "Something went wrong while fetching buildings.";

      setBuildingError(errorMessage);
    } finally {
      setIsBuildingLoading(false);
    }
  };

  const handlePostcodeChange = (e) => {
    const value = e.target.value;

    setPostcode(value);
    setSelectedBuildingId("");
    setBuildingSearch("");

    fetchBuildingsByPostcode(value);
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 font-sans text-slate-200">
      {/* BACKGROUND ELEMENTS */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-[10%] -top-[10%] h-[50%] w-[50%] rounded-full bg-blue-600/10 blur-[120px]" />
        <div className="absolute -right-[10%] top-[20%] h-[40%] w-[40%] rounded-full bg-emerald-600/10 blur-[120px]" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
      </div>

      {/* HEADER */}
      <header className="relative z-10 flex items-center justify-end px-6 py-6 lg:px-10">
        {isLoggedIn && (
          <button
            onClick={handleLogout}
            className="group flex items-center gap-2 text-sm font-medium text-slate-400 transition-all hover:text-white"
          >
            <span className="h-px w-4 bg-slate-700 transition-all group-hover:w-6 group-hover:bg-blue-400" />
            Sign Out
          </button>
        )}
      </header>

      <main className="relative z-10 flex flex-col items-center justify-center px-4 py-8 sm:py-12">
        {/* PROGRESS STEPPER */}
        <div className="mb-8 flex items-center gap-3 sm:mb-10">
          <div
            className={`h-1.5 w-12 rounded-full transition-all duration-700 ${
              screen === "scan" || screen === "search" || screen === "scanner"
                ? "bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.6)]"
                : "bg-slate-800"
            }`}
          />
          <div
            className={`h-1.5 w-12 rounded-full transition-all duration-700 ${
              screen === "actions"
                ? "bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.6)]"
                : "bg-slate-800"
            }`}
          />
        </div>

        <div className="w-full max-w-2xl">
          <div className="group relative overflow-hidden rounded-[32px] border border-white/10 bg-slate-900/40 shadow-2xl backdrop-blur-2xl transition-all duration-500 hover:border-white/20 sm:rounded-[40px]">
            <div className="p-6 sm:p-8 md:p-14">
              {publicLoading && (
                <div className="animate-in fade-in slide-in-from-bottom-4 text-center duration-700">
                  <div className="mb-8 flex justify-center">
                    <div className="flex h-24 w-full max-w-[300px] items-center justify-center rounded-3xl px-7 py-4 shadow-2xl shadow-blue-950/50 sm:h-28 sm:max-w-[340px]">
                      <img
                        src={logo}
                        alt="Logo"
                        className="max-h-20 w-auto object-contain sm:max-h-24"
                      />
                    </div>
                  </div>

                  <h2 className="mb-3 text-3xl font-bold text-white">
                    Loading Building Detail...
                  </h2>

                  <p className="text-sm text-slate-400">
                    Please wait while we fetch building information.
                  </p>
                </div>
              )}

              {!publicLoading && screen === "scan" && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                  <div className="mb-10 text-center sm:mb-12">
                    <div className="mx-auto mb-8 flex h-28 w-full max-w-[320px] items-center shadow-2xl shadow-blue-950/50 justify-center px-8 py-5 sm:h-32 sm:max-w-[360px]">
                      <img
                        src={logo}
                        alt="Logo"
                        className="max-h-24 w-auto object-contain sm:max-h-28"
                      />
                    </div>

                    <h2 className="mb-3 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                      Engineer Entry
                    </h2>

                    <p className="text-sm text-slate-400 sm:text-base">
                      Select building by scanner or manual search
                    </p>
                  </div>

                  <div
                    className={`grid grid-cols-1 gap-6 ${
                      isMobile ? "md:grid-cols-2" : ""
                    }`}
                  >
                    {isMobile && (
                      <button
                        onClick={startScanner}
                        className="group relative flex flex-col items-center justify-center rounded-3xl border border-white/5 bg-white/[0.03] p-8 transition-all hover:-translate-y-1 hover:border-blue-500/50 hover:bg-blue-600/10 sm:p-10"
                      >
                        <div className="relative mb-5 flex h-24 w-24 items-center justify-center rounded-3xl bg-blue-500/10 text-blue-400">
                          <QrIcon />
                          <div className="animate-scan-move absolute inset-x-3 top-0 h-[2px] bg-blue-400 shadow-[0_0_15px_#60a5fa]" />
                        </div>

                        <span className="text-xl font-bold text-white">
                          Scan QR 
                        </span>

                        <span className="mt-2 text-xs font-medium uppercase tracking-widest text-slate-500">
                          Mobile Camera
                        </span>
                      </button>
                    )}

                    <button
                      onClick={() => setScreen("search")}
                      className="group flex flex-col items-center justify-center rounded-3xl border border-white/5 bg-white/[0.03] p-8 transition-all hover:-translate-y-1 hover:border-emerald-500/50 hover:bg-emerald-600/10 sm:p-10"
                    >
                      <div className="mb-5 flex h-24 w-24 items-center justify-center rounded-3xl bg-emerald-500/10 text-emerald-400">
                        <svg
                          className="h-10 w-10"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth="1.5"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                          />
                        </svg>
                      </div>

                      <span className="text-xl font-bold text-white">
                        Manual Search
                      </span>

                      <span className="mt-2 text-xs font-medium uppercase tracking-widest text-slate-500">
                        Postcode / Building
                      </span>
                    </button>
                  </div>

                  {!isMobile && (
                    <p className="mt-6 text-center text-xs text-slate-500">
                      QR scanner is hidden on desktop/windows screen.
                    </p>
                  )}

                  {scanError && (
                    <div className="mt-5 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
                      {scanError}
                    </div>
                  )}
                </div>
              )}

              {!publicLoading && screen === "scanner" && (
                <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                  <div className="mb-8 flex justify-center">
                    <div className="flex h-24 w-full max-w-[300px] items-center justify-center shadow-2xl shadow-blue-950/50 rounded-3xl px-7 py-4 sm:h-28 sm:max-w-[340px]">
                      <img
                        src={logo}
                        alt="Logo"
                        className="max-h-20 w-auto object-contain sm:max-h-24"
                      />
                    </div>
                  </div>

                  <button
                    onClick={async () => {
                      shouldStartScannerRef.current = false;
                      await stopScanner();
                      setScreen("scan");
                    }}
                    className="group mb-8 flex items-center gap-2 text-sm text-slate-400 transition-colors hover:text-white"
                  >
                    <span className="transition-transform group-hover:-translate-x-1">
                      ←
                    </span>
                    Back
                  </button>

                  <h2 className="mb-3 text-3xl font-bold text-white">
                    Scan Building QR
                  </h2>

                  <p className="mb-6 text-sm text-slate-400">
                    Allow camera permission and scan building QR code.
                  </p>

                  <div className="overflow-hidden rounded-3xl border border-white/10 bg-black/30 p-3">
                    <div id="qr-reader" className="min-h-[280px] w-full" />
                  </div>

                  {scanError && (
                    <div className="mt-5 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
                      {scanError}
                    </div>
                  )}
                </div>
              )}

              {!publicLoading && screen === "search" && (
                <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                  <div className="mb-8 flex justify-center">
                    <div className="flex h-24 w-full max-w-[300px] items-center justify-center rounded-3xl px-7 py-4 shadow-2xl shadow-blue-950/50 sm:h-28 sm:max-w-[340px]">
                      <img
                        src={logo}
                        alt="Logo"
                        className="max-h-20 w-auto object-contain sm:max-h-24"
                      />
                    </div>
                  </div>

                  <button
                    onClick={() => setScreen("scan")}
                    className="group mb-8 flex items-center gap-2 text-sm text-slate-400 transition-colors hover:text-white"
                  >
                    <span className="transition-transform group-hover:-translate-x-1">
                      ←
                    </span>
                    Back to Options
                  </button>

                  <h2 className="mb-8 text-3xl font-bold text-white">
                    Locate Building
                  </h2>

                  <div className="space-y-6">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <label className="ml-1 text-xs font-bold uppercase tracking-widest text-slate-500">
                          Enter Postcode
                        </label>

                        <input
                          type="text"
                          placeholder="Enter postcode..."
                          value={postcode}
                          onChange={handlePostcodeChange}
                          className="w-full rounded-2xl border border-white/10 bg-slate-800/50 px-6 py-4 text-white outline-none transition-all placeholder:text-slate-600 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="ml-1 text-xs font-bold uppercase tracking-widest text-slate-500">
                          Building Dropdown
                        </label>

                        <div className="relative w-full">
                          <select
                            value={selectedBuildingId}
                            onChange={handleBuildingDropdownChange}
                            className="w-full appearance-none rounded-2xl border border-white/10 bg-slate-800/50 px-4 py-4 pr-12 text-white outline-none transition-all duration-300 ease-in-out hover:border-blue-400/40 hover:bg-slate-800/70 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10"
                          >
                            <option value="">
                              {postcode.trim()
                                ? "Select Building"
                                : "Enter postcode first"}
                            </option>

                            {postcodeMatchedBuildings.map((building) => (
                              <option key={building.id} value={building.id}>
                                {building.name}
                              </option>
                            ))}
                          </select>

                          <svg
                            className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-300 transition-transform duration-300"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="ml-1 text-xs font-bold uppercase tracking-widest text-slate-500">
                        Search Building
                      </label>

                      <input
                        type="text"
                        placeholder="Search building name..."
                        className="w-full rounded-2xl border border-white/10 bg-slate-800/50 px-6 py-4 text-white outline-none transition-all placeholder:text-slate-600 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10"
                        value={buildingSearch}
                        onChange={(e) => setBuildingSearch(e.target.value)}
                      />
                    </div>

                    <div className="custom-scrollbar max-h-72 space-y-3 overflow-y-auto pr-2">
                      {!postcode.trim() ? (
                        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-center text-sm text-slate-500">
                          Please enter postcode to show buildings.
                        </div>
                      ) : isBuildingLoading ? (
                        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-center text-sm text-slate-500">
                          Loading buildings...
                        </div>
                      ) : buildingError ? (
                        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-5 text-center text-sm text-red-300">
                          {buildingError}
                        </div>
                      ) : filteredBuildings.length > 0 ? (
                        filteredBuildings.map((building) => (
                          <div
                            key={building.id}
                            onClick={() => goToDashboardWithBuilding(building)}
                            className="group flex cursor-pointer items-center justify-between rounded-2xl border border-transparent bg-white/[0.03] p-5 transition-all hover:border-white/10 hover:bg-white/[0.08] active:scale-[0.98]"
                          >
                            <div>
                              <p className="font-bold text-white transition-colors group-hover:text-blue-400">
                                {building.name}
                              </p>

                              <p className="text-sm text-slate-500">
                                {building.postcode || "-"}{" "}
                                {building.address
                                  ? `• ${building.address}`
                                  : ""}
                              </p>
                            </div>

                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800 text-slate-400 transition-all group-hover:bg-blue-500 group-hover:text-white">
                              <FiArrowRight className="h-5 w-5" />
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-center text-sm text-slate-500">
                          No building found.
                        </div>
                      )}
                    </div>

                    {selectedBuildingId && (
                      <button
                        onClick={() => {
                          const building = postcodeMatchedBuildings.find(
                            (item) =>
                              String(item.id) === String(selectedBuildingId),
                          );

                          if (building) {
                            goToDashboardWithBuilding(building);
                          }
                        }}
                        className="w-full rounded-2xl bg-blue-600 px-8 py-5 font-bold text-white shadow-xl shadow-blue-900/20 transition-all hover:bg-blue-500 active:scale-95"
                      >
                        Continue to Dashboard
                      </button>
                    )}
                  </div>
                </div>
              )}

              {!publicLoading && screen === "actions" && (
                <div className="animate-in zoom-in-95 text-center duration-500">
                  <div className="mb-8 flex justify-center">
                    <div className="flex h-24 w-full max-w-[300px] items-center justify-center rounded-3xl border border-white/10 px-7 py-4 sm:h-28 sm:max-w-[340px]">
                      <img
                        src={logo}
                        alt="Logo"
                        className="max-h-20 w-auto object-contain sm:max-h-24"
                      />
                    </div>
                  </div>

                  <div className="relative mx-auto mb-8">
                    <div className="relative z-10 mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
                      <svg
                        className="h-12 w-12"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="2.5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>

                    <div className="absolute inset-0 mx-auto h-24 w-24 animate-ping rounded-full bg-emerald-500/20 opacity-20" />
                  </div>

                  <h2 className="mb-2 text-3xl font-black text-white sm:text-4xl">
                    {selectedBuilding?.name}
                  </h2>

                  <div className="mx-auto mb-8 max-w-md rounded-3xl border border-white/10 bg-white/[0.03] p-5 text-left">
                    <p className="mb-2 text-sm text-slate-400">
                      <span className="font-bold text-slate-200">
                        Postcode:{" "}
                      </span>{" "}
                      {selectedBuilding?.postcode || "-"}
                    </p>

                    <p className="mb-2 text-sm text-slate-400">
                      <span className="font-bold text-slate-200">Address:</span>{" "}
                      {selectedBuilding?.address || "-"}
                    </p>
                  </div>

                  <p className="mb-8 text-sm font-medium uppercase tracking-wide text-emerald-400">
                    Building Scanned Successfully
                  </p>

                  {isLoggedIn ? (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <button
                        onClick={() => {
                          const finalEntryOnPlace = Number(
                            selectedBuilding?.entry_on_place ?? 0,
                          );

                          if (selectedBuilding) {
                            saveBuildingToStorage(
                              selectedBuilding,
                              finalEntryOnPlace,
                            );
                          }

                          navigate(
                            `/create-log?entry_on_place=${finalEntryOnPlace}`,
                          );
                        }}
                        className="group relative overflow-hidden rounded-2xl bg-blue-600 px-8 py-5 font-bold text-white shadow-xl shadow-blue-900/20 transition-all hover:bg-blue-500 active:scale-95"
                      >
                        Create New Log
                      </button>

                      <button
                        onClick={() => {
                          localStorage.removeItem("selectedEngineerBuilding");
                          navigate("/engineer-dashboard");
                        }}
                        className="rounded-2xl border border-white/10 bg-white/5 px-8 py-5 font-bold text-white transition-all hover:bg-white/10 active:scale-95"
                      >
                        Go to Dashboard
                      </button>
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-blue-500/20 bg-blue-500/10 p-5 text-center text-sm text-blue-200">
                      This is public QR building information. Please login as
                      engineer to create log.
                    </div>
                  
                  )}

                  {isLoggedIn && (
                    <button
                      onClick={() => {
                        setSelectedBuilding(null);
                        setSelectedBuildingId("");
                        setPostcode("");
                        setBuildingSearch("");
                        setScanError("");
                        localStorage.removeItem("selectedEngineerBuilding");
                        setScreen("scan");
                        shouldStartScannerRef.current = false;
                        stopScanner();
                      }}
                      className="mt-10 text-xs font-bold uppercase tracking-widest text-slate-500 transition-colors hover:text-blue-400"
                    >
                      Reset Selection
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
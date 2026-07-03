import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { Calendar } from "react-date-range";
import {
  DatePickerComponent,
} from "@syncfusion/ej2-react-calendars";
import Breadcrumb from "../components/ui/Breadcrumb";
import PopupModal from "../components/ui/PopupModal";
import { apiUrl } from "../config";
const SelectArrow = () => (
  <span className="pointer-events-none absolute top-1/2 right-4 -translate-y 12/2 text-gray-500 dark:text-gray-400">
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
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";


import { format } from "date-fns";
import { IoTrashBinSharp } from "react-icons/io5";
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
const normalizeBuildingData = (building) => {
  return {
    id: building?.id || building?.building_id || "",
    name: building?.name || building?.building_name || "",
    postcode: building?.postcode || "",
    address: building?.address || "",
    entry_on_place: Number(building?.entry_on_place || 0),
  };
};

const getStoredEngineerBuilding = () => {
  try {
    const storedBuilding = JSON.parse(
      localStorage.getItem("selectedEngineerBuilding") || "null",
    );

    if (storedBuilding?.id || storedBuilding?.building_id) {
      return normalizeBuildingData(storedBuilding);
    }
  } catch (error) {
    return null;
  }

  return null;
};
function formatTime(time) {
  if (!time) return "";

  const [hourValue, minuteValue] = time.split(":");
  let hour = Number(hourValue);
  const minute = minuteValue;
  const ampm = hour >= 12 ? "PM" : "AM";

  hour = hour % 12;
  hour = hour || 12;

  return `${String(hour).padStart(2, "0")}:${minute} ${ampm}`;
}

function getTodayDate() {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");

  return `${yyyy}-${mm}-${dd}`;
}

function timeToMinutes(time) {
  if (!time) return 0;

  const [hour, minute] = time.split(":").map(Number);
  return hour * 60 + minute;
}

function isTimeBefore(time, minTime) {
  if (!time || !minTime) return false;
  return timeToMinutes(time) < timeToMinutes(minTime);
}
const CalendarIcon = () => (
  <svg
    className="h-5 w-5 text-gray-500 dark:text-gray-400"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M8 7V3m8 4V3M5 11h14M5 5h14a2 2 0 012 2v12a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2z"
    />
  </svg>
);
const ClockIcon = () => (
  <svg
    className="h-5 w-5 text-gray-500 dark:text-gray-400"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 6v6l4 2m6-2a10 10 0 11-20 0 10 10 0 0120 0z"
    />
  </svg>
);
function WatchTimePicker({ label, value, onChange, minTime = "" }) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState("hour");


  const baseTime = value || minTime || "09:00";

  const currentHour = Number(baseTime.split(":")[0]);
  const currentMinute = Number(baseTime.split(":")[1]);

  const hours = Array.from({ length: 12 }, (_, i) => i + 1);
  const minutes = Array.from({ length: 12 }, (_, i) => i * 5);

  const displayHour = currentHour % 12 || 12;
  const isPM = currentHour >= 12;

  const closeViewModal = () => {
    setOpen(false);
  };

  const makeTime = (hour24, minuteValue = currentMinute) => {
    return `${String(hour24).padStart(2, "0")}:${String(minuteValue).padStart(
      2,
      "0",
    )}`;
  };

  const convertHour12To24 = (hour12, pmValue = isPM) => {
    let hour24 = hour12;

    if (pmValue && hour12 !== 12) hour24 = hour12 + 12;
    if (!pmValue && hour12 === 12) hour24 = 0;

    return hour24;
  };

  const isDisabledTime = (time) => {
    if (!minTime) return false;
    return isTimeBefore(time, minTime);
  };

  const isHourDisabled = (hour12) => {
    if (!minTime) return false;

    const checkAm = convertHour12To24(hour12, false);
    const checkPm = convertHour12To24(hour12, true);

    const hasAmMinute = minutes.some(
      (minute) => !isDisabledTime(makeTime(checkAm, minute)),
    );

    const hasPmMinute = minutes.some(
      (minute) => !isDisabledTime(makeTime(checkPm, minute)),
    );

    return !hasAmMinute && !hasPmMinute;
  };

  const isMinuteDisabled = (minute) => {
    if (!minTime) return false;

    const time = makeTime(currentHour, minute);
    return isDisabledTime(time);
  };

  const isAmPmDisabled = (type) => {
    if (!minTime) return false;

    const nextIsPM = type === "PM";
    const hour24 = convertHour12To24(displayHour, nextIsPM);
    const newTime = makeTime(hour24, currentMinute);

    return isDisabledTime(newTime);
  };

  const handleTimeChange = (newTime) => {
    if (isDisabledTime(newTime)) {
      return;
    }

    onChange(newTime);
  };

  const setHour = (hour12) => {
    if (isHourDisabled(hour12)) return;

    let hour24 = convertHour12To24(hour12);
    let minuteValue = currentMinute;

    if (minTime && isDisabledTime(makeTime(hour24, minuteValue))) {
      const firstAvailableMinute = minutes.find(
        (minute) => !isDisabledTime(makeTime(hour24, minute)),
      );

      if (typeof firstAvailableMinute === "number") {
        minuteValue = firstAvailableMinute;
      } else {
        const pmHour = convertHour12To24(hour12, true);
        const pmMinute = minutes.find(
          (minute) => !isDisabledTime(makeTime(pmHour, minute)),
        );

        if (typeof pmMinute === "number") {
          hour24 = pmHour;
          minuteValue = pmMinute;
        }
      }
    }

    const newTime = makeTime(hour24, minuteValue);

    handleTimeChange(newTime);
    setStep("minute");
  };

  const setMinute = (minute) => {
    if (isMinuteDisabled(minute)) return;

    const newTime = makeTime(currentHour, minute);
    handleTimeChange(newTime);
  };

  const setAmPm = (type) => {
    if (isAmPmDisabled(type)) return;

    let hour = currentHour;

    if (type === "AM" && hour >= 12) {
      hour = hour - 12;
    }

    if (type === "PM" && hour < 12) {
      hour = hour + 12;
    }

    const newTime = makeTime(hour, currentMinute);
    handleTimeChange(newTime);
  };

  const getPosition = (index, total, radius = 92) => {
    const angle = (index / total) * 360 - 90;
    const x = radius * Math.cos((angle * Math.PI) / 180);
    const y = radius * Math.sin((angle * Math.PI) / 180);

    return {
      left: `calc(50% + ${x}px)`,
      top: `calc(50% + ${y}px)`,
      transform: "translate(-50%, -50%)",
    };
  };

  return (
    <div className="relative">
      <label className="form-label">{label}</label>

      <button
        type="button"
        onClick={() => {
          setOpen(true);
          setStep("hour");
        }}
        className="form-input flex w-full items-center justify-between text-left"
      >
        <span
          className={value ? "text-gray-900 dark:text-white" : "text-gray-400"}
        >
          {value ? formatTime(value) : "Select time"}
        </span>

        <span className="flex h-8 w-8 items-center justify-center rounded-full  text-sm">
          <ClockIcon />
        </span>
      </button>

      <PopupModal
        open={open}
        onClose={closeViewModal}
        maxWidth="max-w-[420px]"
        className="p-0"
        bodyClassName="p-0"
      >
        <div className="rounded-2xl bg-white dark:bg-gray-900">
          <div className="border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Select {label}
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {step === "hour" ? "Choose hour" : "Choose minute"}
                </p>
              </div>

              <button
                type="button"
                onClick={closeViewModal}
                className="flex h-9 w-9 items-center justify-center rounded-full text-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                ×
              </button>
            </div>
          </div>

          <div className="p-5">
            <div className="mb-5 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setStep("hour")}
                className={`rounded-xl px-5 py-2 text-2xl font-bold transition ${step === "hour"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-white"
                  }`}
              >
                {String(displayHour).padStart(2, "0")}
              </button>

              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                :
              </span>

              <button
                type="button"
                onClick={() => setStep("minute")}
                className={`rounded-xl px-5 py-2 text-2xl font-bold transition ${step === "minute"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-white"
                  }`}
              >
                {String(currentMinute).padStart(2, "0")}
              </button>

              <div className="ml-1 flex flex-col overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  disabled={isAmPmDisabled("AM")}
                  onClick={() => setAmPm("AM")}
                  className={`px-3 py-1 text-sm font-semibold transition ${!isPM
                    ? "bg-blue-600 text-white"
                    : isAmPmDisabled("AM")
                      ? "cursor-not-allowed bg-gray-100 text-gray-300 dark:bg-gray-800 dark:text-gray-600"
                      : "bg-white text-gray-700 dark:bg-gray-900 dark:text-gray-300"
                    }`}
                >
                  AM
                </button>

                <button
                  type="button"
                  disabled={isAmPmDisabled("PM")}
                  onClick={() => setAmPm("PM")}
                  className={`px-3 py-1 text-sm font-semibold transition ${isPM
                    ? "bg-blue-600 text-white"
                    : isAmPmDisabled("PM")
                      ? "cursor-not-allowed bg-gray-100 text-gray-300 dark:bg-gray-800 dark:text-gray-600"
                      : "bg-white text-gray-700 dark:bg-gray-900 dark:text-gray-300"
                    }`}
                >
                  PM
                </button>
              </div>
            </div>

            <div className="relative mx-auto mb-5 h-[260px] w-[260px] rounded-full border-4 border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800">
              <div className="absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-600" />

              {step === "hour" &&
                hours.map((hour, index) => {
                  const active = displayHour === hour;
                  const disabled = isHourDisabled(hour);

                  return (
                    <button
                      key={hour}
                      type="button"
                      disabled={disabled}
                      onClick={() => setHour(hour)}
                      style={getPosition(index, 12)}
                      className={`absolute flex h-11 w-11 items-center justify-center rounded-full text-sm font-bold transition ${active
                        ? "bg-blue-600 text-white shadow-lg"
                        : disabled
                          ? "cursor-not-allowed bg-gray-100 text-gray-300 shadow-none dark:bg-gray-700 dark:text-gray-500"
                          : "bg-white text-gray-800 shadow-sm hover:bg-blue-100 dark:bg-gray-900 dark:text-white"
                        }`}
                    >
                      {hour}
                    </button>
                  );
                })}

              {step === "minute" &&
                minutes.map((minute, index) => {
                  const active = currentMinute === minute;
                  const disabled = isMinuteDisabled(minute);

                  return (
                    <button
                      key={minute}
                      type="button"
                      disabled={disabled}
                      onClick={() => setMinute(minute)}
                      style={getPosition(index, 12)}
                      className={`absolute flex h-11 w-11 items-center justify-center rounded-full text-sm font-bold transition ${active
                        ? "bg-blue-600 text-white shadow-lg"
                        : disabled
                          ? "cursor-not-allowed bg-gray-100 text-gray-300 shadow-none dark:bg-gray-700 dark:text-gray-500"
                          : "bg-white text-gray-800 shadow-sm hover:bg-blue-100 dark:bg-gray-900 dark:text-white"
                        }`}
                    >
                      {String(minute).padStart(2, "0")}
                    </button>
                  );
                })}
            </div>

            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => {
                  onChange("");
                  closeViewModal();
                }}
                className="w-full rounded-xl border border-gray-300 px-4 py-2 font-semibold text-gray-700 transition hover:bg-gray-100 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
              >
                Clear
              </button>

              <button
                type="button"
                onClick={closeViewModal}
                className="w-full rounded-xl bg-blue-600 px-4 py-2 font-semibold text-white transition hover:bg-blue-700"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      </PopupModal>
    </div>
  );
}
function UniqueDatePicker({
  label,
  name,
  value,
  onChange,
  minDate = getTodayDate(),
}) {
  const [open, setOpen] = useState(false);
  const pickerRef = useRef(null);

  const parseLocalDate = (dateValue) => {
    if (!dateValue) return null;

    const [yyyy, mm, dd] = dateValue.split("-").map(Number);
    return new Date(yyyy, mm - 1, dd);
  };

  const selectedDate = parseLocalDate(value);
  const minimumDate = parseLocalDate(minDate) || new Date();

  const displayDate = value
    ? format(parseLocalDate(value), "MMM dd, yyyy")
    : "Select Date";

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleDateSelect = (date) => {
    onChange({
      target: {
        name,
        value: format(date, "yyyy-MM-dd"),
      },
    });

    setOpen(false);
  };

  const handleClear = () => {
    onChange({
      target: {
        name,
        value: "",
      },
    });

    setOpen(false);
  };

  return (
    <div className="relative" ref={pickerRef}>
      <label className="form-label">{label}</label>

      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="form-input flex w-full items-center justify-between text-left"
      >
        <span
          className={value ? "text-gray-900 dark:text-white" : "text-gray-400"}
        >
          {displayDate}
        </span>

        <CalendarIcon />
      </button>

      {open && (
        <div className="absolute left-0 top-full z-[9999] mt-2 w-auto rounded-xl bg-white p-3 shadow-2xl dark:bg-gray-900">
          <div className="single-date-responsive">
            <Calendar
              date={selectedDate || minimumDate}
              onChange={handleDateSelect}
              maxDate={minimumDate}
              color="#3b82f6"
            />
          </div>
        </div>
      )}
    </div>
  );
}

const getAuthUser = () => {
  try {
    return JSON.parse(localStorage.getItem("auth_user") || "{}");
  } catch (error) {
    return {};
  }
};
function getCurrentTime() {
  const now = new Date();
  const hour = String(now.getHours()).padStart(2, "0");
  const minute = String(now.getMinutes()).padStart(2, "0");

  return `${hour}:${minute}`;
}

export default function CreateLog() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [buildingList, setBuildingList] = useState([]);

  const [selectedBuilding, setSelectedBuilding] = useState({
    id: "",
    name: "",
  });

  const [selectedBuildingId, setSelectedBuildingId] = useState("");

  const [componentList, setComponentList] = useState([]);
  const [maintenanceTypeList, setMaintenanceTypeList] = useState([]);
  const [maintenanceCycleList, setMaintenanceCycleList] = useState([]);
  const [cycleLoading, setCycleLoading] = useState(false);
  const [dropdownLoading, setDropdownLoading] = useState(false);
  const [buildingLoading, setBuildingLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [entryOnPlace, setEntryOnPlace] = useState(0);
  const [errors, setErrors] = useState({
    building: "",
    rows: [],
  });

  //   const [startTime, setStartTime] = useState(getCurrentTime());
  // const [finishTime, setFinishTime] = useState("");

  const emptyLogRow = () => ({
    component: "",
    maintenanceType: "2",
    maintenanceCycle: "",
    maintenanceDate: "",
    device: "",
    remark: "",
    startTime: getCurrentTime(),
    finishTime: "",
  });

  const [form, setForm] = useState({
    buildingName: "",
  });



  const [logRows, setLogRows] = useState([emptyLogRow()]);

  useEffect(() => {
    loadInitialData();
  }, []);


  const handleRowChange = (index, e) => {
    const { name, value } = e.target;

    setLogRows((prev) =>
      prev.map((row, rowIndex) =>
        rowIndex === index
          ? {
            ...row,
            [name]: value,
            ...(name === "maintenanceType" ? { maintenanceCycle: "" } : {}),
          }
          : row,
      ),
    );
  };

  const handleRowDateChange = (index, e) => {
    handleRowChange(index, e);
  };

  const handleRowStartTimeChange = (index, time) => {
    setLogRows((prev) =>
      prev.map((row, rowIndex) => {
        if (rowIndex !== index) return row;

        return {
          ...row,
          startTime: time,
          finishTime:
            time && row.finishTime && isTimeBefore(row.finishTime, time)
              ? ""
              : row.finishTime,
        };
      }),
    );
  };

  const handleRowFinishTimeChange = (index, time) => {
    setLogRows((prev) =>
      prev.map((row, rowIndex) => {
        if (rowIndex !== index) return row;

        if (row.startTime && time && isTimeBefore(time, row.startTime)) {
          return row;
        }

        return {
          ...row,
          finishTime: time,
        };
      }),
    );
  };

  const addLogRow = () => {
    setLogRows((prev) => [...prev, emptyLogRow()]);
  };

  const removeLogRow = (index) => {
    setLogRows((prev) => {
      if (prev.length === 1) return prev;
      return prev.filter((_, rowIndex) => rowIndex !== index);
    });
  };

  const setBuildingValue = (building, forceEntryOnPlace = null) => {
    const buildingInfo = {
      id: building?.id || building?.building_id || "",
      name: building?.name || building?.building_name || "",
      postcode: building?.postcode || "",
      address: building?.address || "",
      entry_on_place: Number(
        forceEntryOnPlace ?? building?.entry_on_place ?? 0,
      ),
    };

    setSelectedBuilding(buildingInfo);
    // setSelectedBuildingId(buildingInfo.id ? String(buildingInfo.id) : "");
    if (!selectedBuildingId) {
      setSelectedBuildingId(String(buildingInfo.id));
    }
    setEntryOnPlace(Number(buildingInfo.entry_on_place || 0));

    setForm((prev) => ({
      ...prev,
      buildingName: buildingInfo.name || "",
    }));
  };
  const authUser = getAuthUser();
  // const loadInitialData = async () => {
  //   try {
  //     if (!getToken()) {
  //       toast.error("Token not found. Please login again.");
  //       return;
  //     }

  //     setDropdownLoading(true);
  //     setBuildingLoading(true);

  //     const payload = {
  //       customer_id:
  //         authUser.role_id === 3 ? authUser?.customer.customer_id : "",
  //     };

  //     const [buildingRes, componentRes, maintenanceRes] = await Promise.all([
  //       axios.post(`${apiUrl}/auth/buildingDropdown`, payload, {
  //         headers: getAuthHeaders(),
  //       }),
  //       axios.post(
  //         `${apiUrl}/auth/componentDropdownList`,
  //         {},
  //         {
  //           headers: getAuthHeaders(),
  //         },
  //       ),
  //       axios.post(
  //         `${apiUrl}/auth/maintenance_type_dropdown_list`,
  //         {},
  //         {
  //           headers: getAuthHeaders(),
  //         },
  //       ),
  //     ]);

  //     const apiBuildings = buildingRes?.data?.success
  //       ? buildingRes?.data?.data || []
  //       : [];

  //     setBuildingList(apiBuildings);

  //     if (componentRes?.data?.success) {
  //       setComponentList(componentRes?.data?.data || []);
  //     } else {
  //       setComponentList([]);
  //       toast.error(componentRes?.data?.message || "System list not found.");
  //     }

  //     if (maintenanceRes?.data?.success) {
  //       setMaintenanceTypeList(maintenanceRes?.data?.data || []);
  //     } else {
  //       setMaintenanceTypeList([]);
  //       toast.error(
  //         maintenanceRes?.data?.message || "Maintenance type list not found.",
  //       );
  //     }

  //     const storedBuilding = getStoredEngineerBuilding();

  //     if (storedBuilding?.id) {
  //       const matchedBuilding = apiBuildings.find(
  //         (item) =>
  //           String(item.building_id || item.id) === String(storedBuilding.id),
  //       );

  //       const finalBuilding = matchedBuilding
  //         ? {
  //             ...matchedBuilding,
  //             entry_on_place: Number(storedBuilding.entry_on_place || 0),
  //           }
  //         : storedBuilding;

  //       setBuildingValue(
  //         finalBuilding,
  //         Number(storedBuilding.entry_on_place || 0),
  //       );
  //     } else {
  //       setSelectedBuilding({
  //         id: "",
  //         name: "",
  //       });

  //       setSelectedBuildingId("");
  //       setEntryOnPlace(0);
  //       setForm((prev) => ({
  //         ...prev,
  //         buildingName: "",
  //       }));
  //     }
  //   } catch (error) {
  //     toast.error(
  //       error?.response?.data?.message ||
  //         error?.response?.data?.error ||
  //         "Failed to load form data.",
  //     );
  //   } finally {
  //     setDropdownLoading(false);
  //     setBuildingLoading(false);
  //   }
  // };
  const loadInitialData = async () => {
    try {
      if (!getToken()) {
        toast.error("Token not found. Please login again.");
        return;
      }

      setDropdownLoading(true);
      setBuildingLoading(true);

      const payload = {
        customer_id:
          authUser.role_id === 3 ? authUser?.customer.customer_id : "",
      };

      const [buildingRes, componentRes, maintenanceRes] = await Promise.all([
        axios.post(`${apiUrl}/auth/buildingDropdown`, payload, {
          headers: getAuthHeaders(),
        }),
        axios.post(
          `${apiUrl}/auth/componentDropdownList`,
          {},
          {
            headers: getAuthHeaders(),
          },
        ),
        axios.post(
          `${apiUrl}/auth/maintenance_type_dropdown_list`,
          {},
          {
            headers: getAuthHeaders(),
          },
        ),
      ]);

      const apiBuildings = buildingRes?.data?.success
        ? buildingRes?.data?.data || []
        : [];

      setBuildingList(apiBuildings);

      const storedBuilding = getStoredEngineerBuilding();

      if (storedBuilding?.id) {
        const matchedBuilding = apiBuildings.find(
          (item) =>
            String(item.building_id || item.id) ===
            String(storedBuilding.id)
        );

        if (matchedBuilding) {
          setBuildingValue(
            matchedBuilding,
            storedBuilding.entry_on_place
          );
        }
      }

      if (componentRes?.data?.success) {
        setComponentList(componentRes?.data?.data || []);
      } else {
        setComponentList([]);
        toast.error(componentRes?.data?.message || "System list not found.");
      }

      if (maintenanceRes?.data?.success) {
        setMaintenanceTypeList(maintenanceRes?.data?.data || []);
      } else {
        setMaintenanceTypeList([]);
        toast.error(
          maintenanceRes?.data?.message || "Maintenance type list not found.",
        );
      }

      // ============================
      // DON'T AUTO SELECT BUILDING
      // ============================

      // localStorage.removeItem("selectedEngineerBuilding");

      // setSelectedBuilding({
      //   id: "",
      //   name: "",
      // });

      // setSelectedBuildingId("");
      // setEntryOnPlace(0);

      // setForm((prev) => ({
      //   ...prev,
      //   buildingName: "",
      // }));


    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        "Failed to load form data.",
      );
    } finally {
      setDropdownLoading(false);
      setBuildingLoading(false);
    }
  };
  function getTodayDate() {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");

    return `${yyyy}-${mm}-${dd}`;
  }

  function getDateTime(date, time) {
    if (!date || !time) return "";
    return `${date} ${time}:00`;
  }
  const fetchMaintenanceCycles = async (typeId) => {
    if (!typeId) {
      setMaintenanceCycleList([]);
      setForm((prev) => ({
        ...prev,
        maintenanceCycle: "",
      }));
      return;
    }

    try {
      setCycleLoading(true);

      const res = await axios.post(
        `${apiUrl}/auth/typeDropdownList`,
        {
          type_id: String('2'),
        },
        {
          headers: getAuthHeaders(),
        },
      );

      if (res.data?.success) {
        setMaintenanceCycleList(res.data.data || []);
      } else {
        setMaintenanceCycleList([]);
        toast.error(res.data?.message || "Purpose of Visit list not found.");
      }
    } catch (error) {
      console.error("Purpose of Visit API Error:", error);
      setMaintenanceCycleList([]);
      toast.error(
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        "Failed to load Purpose.",
      );
    } finally {
      setCycleLoading(false);
    }
  };
  useEffect(() => {
    fetchMaintenanceCycles('2'); // Runs immediately when the component mounts
  }, []);
  const handleBuildingSelect = (e) => {
    const id = e.target.value;

    setSelectedBuildingId(id);
    console.log(selectedBuildingId, "idddddd");


    if (!id) {
      setSelectedBuilding({
        id: "",
        name: "",
      });
      setEntryOnPlace(0);
      setForm((prev) => ({
        ...prev,
        buildingName: "",
      }));

      return;
    }

    const building = buildingList.find(
      (item) =>
        String(item.building_id) === String(id) ||
        String(item.id) === String(id),
    );

    if (building) {
      setBuildingValue(building);
    }
  };

  // const handleChange = (e) => {
  //   const { name, value } = e.target;

  //   setForm((prev) => ({
  //     ...prev,
  //     [name]: value,
  //     ...(name === "maintenanceType" ? { maintenanceCycle: "" } : {}),
  //   }));

  //   if (name === "maintenanceType") {
  //    // fetchMaintenanceCycles('2');
  //   }
  // };

  // const handleStartTimeChange = (time) => {
  //   setStartTime(time);

  //   if (!time) {
  //     setFinishTime("");
  //     return;
  //   }

  //   if (finishTime && isTimeBefore(finishTime, time)) {
  //     setFinishTime("");
  //   }
  // };

  // const handleFinishTimeChange = (time) => {
  //   if (startTime && time && isTimeBefore(time, startTime)) {
  //     return;
  //   }

  //   setFinishTime(time);
  // };
  const resetForm = () => {
    setSelectedBuilding({
      id: "",
      name: "",
    });

    setSelectedBuildingId("");
    setEntryOnPlace(0);

    localStorage.removeItem("selectedEngineerBuilding");

    setForm({
      buildingName: "",
    });

    setLogRows([emptyLogRow()]);
  };
  const validateForm = () => {
    const newErrors = {
      rows: [],
    };

    if (!selectedBuildingId) {
      newErrors.building = "Building is required";
    }

    logRows.forEach((row, index) => {
      newErrors.rows[index] = {};

      if (!row.component) {
        newErrors.rows[index].component = "System is required";
      }

      if (!row.maintenanceCycle) {
        newErrors.rows[index].maintenanceCycle =
          "Purpose of Visit is required";
      }

      if (!row.maintenanceDate) {
        newErrors.rows[index].maintenanceDate = "Date is required";
      }

      if (!row.startTime) {
        newErrors.rows[index].startTime = "Start Time is required";
      }

      if (!row.finishTime) {
        newErrors.rows[index].finishTime = "Finish Time is required";
      }

      if (
        row.startTime &&
        row.finishTime &&
        isTimeBefore(row.finishTime, row.startTime)
      ) {
        newErrors.rows[index].finishTime =
          "Finish Time cannot be before Start Time";
      }
    });

    setErrors(newErrors);

    const hasRowErrors = newErrors.rows.some(
      (row) => row && Object.keys(row).length > 0
    );

    if (newErrors.building || hasRowErrors) {
      toast.error("Please fill all required fields.");
      return false;
    }

    return true;
  };
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;
    if (!getToken()) {
      toast.error("Token not found. Please login again.");
      return;
    }

    if (!selectedBuildingId) {
      toast.error("Please select building.");
      return;
    }
    console.log(form.buildingName, "building nameeeee")
    if (!form.buildingName.trim()) {
      toast.error("Please enter building name.");
      return;
    }

    for (let i = 0; i < logRows.length; i++) {
      const row = logRows[i];
      const rowNumber = i + 1;

      if (!row.component) {
        toast.error(`Please select system in row ${rowNumber}.`);
        return;
      }

      if (!row.maintenanceCycle) {
        toast.error(`Please select Purpose of Visit in row ${rowNumber}.`);
        return;
      }

      if (!row.maintenanceDate) {
        toast.error(`Please select date in row ${rowNumber}.`);
        return;
      }

      if (!row.startTime) {
        toast.error(`Please select start time in row ${rowNumber}.`);
        return;
      }

      if (!row.finishTime) {
        toast.error(`Please select finish time in row ${rowNumber}.`);
        return;
      }

      if (isTimeBefore(row.finishTime, row.startTime)) {
        toast.error(`Finish Time cannot be before Start Time in row ${rowNumber}.`);
        return;
      }
    }

    const storedBuilding = getStoredEngineerBuilding();

    const finalEntryOnPlace =
      storedBuilding?.id &&
        String(storedBuilding.id) === String(selectedBuildingId)
        ? Number(storedBuilding.entry_on_place || entryOnPlace || 0)
        : Number(entryOnPlace || 0);

    const payload = {
      building_id: Number(selectedBuildingId),
      building_name: form.buildingName,
      entry_on_place: finalEntryOnPlace,
      maintenance_entries: logRows.map((row) => ({
        component_id: Number(row.component),
        maintenance_type_id: 2,
        start_time: getDateTime(row.maintenanceDate, row.startTime),
        finish_time: getDateTime(row.maintenanceDate, row.finishTime),
        remark: row.remark,
        maintenance_type_cycle_id: Number(row.maintenanceCycle),
        entry_date: row.maintenanceDate,
        entry_on_place: finalEntryOnPlace,
      })),
    };

    try {
      setSubmitLoading(true);

      const response = await axios.post(`${apiUrl}/auth/create_log`, payload, {
        headers: getAuthHeaders(),
      });

      if (response?.data?.success) {
        toast.success(response?.data?.message || "Log created successfully");

        // Remove selected building after successful save
        localStorage.removeItem("selectedEngineerBuilding");

        const authRoleId = Number(localStorage.getItem("auth_role_id"));

        if (authRoleId === 1 || authRoleId === 3) {
          navigate("/logs");
        } else {
          navigate("/engineer-scan");
        }
      } else {
        toast.error(response?.data?.message || "Failed to create log.");
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        "Failed to create log.",
      );
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Create Log
        </h1>

        <Breadcrumb pageName="Create Log" parentPage="Engineer" />
      </div>

      <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        <form onSubmit={handleSubmit}>
          {/* <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
            <div className="relative"> 
              <label className="form-label">Select Building</label>
              <select
                value={selectedBuildingId}
                onChange={handleBuildingSelect}
                disabled={buildingLoading}
                className="form-select"
                
              >
                <option value="">
                  {buildingLoading ? "Loading..." : "Select Building"}
                </option>

                {buildingList.map((building) => (
                  <option
                    key={building.building_id || building.id}
                    value={building.building_id || building.id}
                  >
                    {building.building_name || building.name}
                  </option>
                ))}
              </select>
                <SelectArrow />
            </div>
</div> */}
          {/* Building Card */}
          {/* <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
    <div className="relative">
      <label className="form-label">Select Building</label>

      <select
        value={selectedBuildingId}
        onChange={handleBuildingSelect}
        disabled={buildingLoading}
        className="form-select"
      >
        <option value="">
          {buildingLoading ? "Loading..." : "Select Building"}
        </option>

        {buildingList.map((building) => (
          <option
            key={building.building_id || building.id}
            value={building.building_id || building.id}
          >
            {building.building_name || building.name}
          </option>
        ))}
      </select>

      <SelectArrow />
    </div>
  </div>
</div> */}
          {/* Building Card */}
          <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
              <div className="relative">
                <label className="form-label">Select Building</label>

                {/* <select
        value={selectedBuildingId}
        onChange={handleBuildingSelect}
        disabled={buildingLoading}
        className="form-select"
      >
        <option value="">
          {buildingLoading ? "Loading..." : "Select Building"}
        </option>

        {buildingList.map((building) => (
          <option
            key={building.building_id || building.id}
            value={building.building_id || building.id}
          >
            {building.building_name || building.name}
          </option>
        ))}
      </select> */}
                <select
                  value={selectedBuildingId || ""}
                  onChange={handleBuildingSelect}
                  disabled={buildingLoading}
                  className={`form-select ${errors.building ? "border-red-500" : ""
                    }`}
                >
                  <option value="">
                    {buildingLoading ? "Loading..." : "Select Building"}
                  </option>

                  {buildingList.map((building) => (
                    <option
                      key={building.building_id || building.id}
                      value={building.building_id || building.id}
                    >
                      {building.building_name || building.name}
                    </option>
                  ))}
                </select>
                <SelectArrow />

              </div>

            </div>
          </div>

          {/* Log Fields Card */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                Log Detail
              </h3>


            </div>

            {logRows.map((row, index) => (
              <div
                key={index}
                className={`${index !== 0
                  ? "mt-8 border-t border-gray-200 pt-8 dark:border-gray-800"
                  : ""
                  }`}
              >
                <div className="flex justify-between">
                  {logRows.length > 1 && (
                    <h4 className="mb-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Log Detail {index + 1}
                    </h4>


                  )}
                  {index > 0 &&
                    <button
                      type="button"
                      onClick={() => removeLogRow(index)}
                      disabled={logRows.length === 1}
                      className={`flex h-9 w-9 items-center justify-center rounded-full text-xl font-bold bg-red-600 text-white hover:bg-red-700 fle`}
                      title="Remove" > <IoTrashBinSharp />
                    </button>
                  }
                </div>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                  <div className="relative">
                    <label className="form-label">Select System</label>

                    <select
                      name="component"
                      value={row.component}
                      onChange={(e) => handleRowChange(index, e)}
                      required
                      disabled={dropdownLoading}
                      className="form-select"
                    >
                      <option value="">
                        {dropdownLoading ? "Loading..." : "Select System"}
                      </option>

                      {componentList.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.name}
                        </option>
                      ))}
                    </select>

                    <SelectArrow />
                  </div>

                  <div className="relative">
                    <label className="form-label">Purpose of Visit</label>

                    <input type="hidden" name="device" value={row.device} />
                    <input type="hidden" name="maintenanceType" value="2" />

                    <select
                      name="maintenanceCycle"
                      value={row.maintenanceCycle}
                      onChange={(e) => handleRowChange(index, e)}
                      required
                      disabled={cycleLoading}
                      className="form-select"
                    >
                      <option value="">
                        {cycleLoading ? "Loading..." : "Select Purpose of Visit"}
                      </option>

                      {maintenanceCycleList.map((item) => (
                        <option
                          key={item.maintenance_cycle_id}
                          value={item.maintenance_cycle_id}
                        >
                          {item.maintenance_cycle_name}
                        </option>
                      ))}
                    </select>

                    <SelectArrow />
                  </div>

                  <UniqueDatePicker
                    label="Date"
                    name="maintenanceDate"
                    value={row.maintenanceDate}
                    onChange={(e) => handleRowDateChange(index, e)}
                    minDate={getTodayDate()}
                  />

                  <WatchTimePicker
                    label="Start Time"
                    value={row.startTime}
                    onChange={(time) => handleRowStartTimeChange(index, time)}
                  />

                  <WatchTimePicker
                    label="Finish Time"
                    value={row.finishTime}
                    onChange={(time) => handleRowFinishTimeChange(index, time)}
                    minTime={row.startTime}
                  />

                  <div className="relative">
                    <label className="form-label">Remedial Action Taken</label>

                    <input
                      type="text"
                      name="remark"
                      value={row.remark}
                      onChange={(e) => handleRowChange(index, e)}
                      className="form-input"
                      placeholder="Enter Remedial Action Taken"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2 mt-3">
            <button
              type="button"
              onClick={addLogRow}
              className="btn-primary disabled:cursor-not-allowed disabled:opacity-70"
            >
              Add New
            </button>

          </div>
          <div className="mt-5 border-t border-gray-300 pt-5 dark:border-gray-800 sm:pt-6">
            <div className="flex items-center gap-5">
              <button
                type="submit"
                disabled={submitLoading}
                className="btn-primary disabled:cursor-not-allowed disabled:opacity-70"
              >
                {submitLoading ? "Saving..." : "Finish"}
              </button>

              <button
                type="button"
                onClick={resetForm}
                disabled={submitLoading}
                className="btn-secondary disabled:cursor-not-allowed disabled:opacity-70"
              >
                Clear
              </button>
            </div>
          </div>

          {/* Dynamic Log Fields Card */}

        </form>
      </div>
    </>
  );
}

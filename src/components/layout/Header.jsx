import { useState, useRef, useEffect } from "react";
import { useApp } from "../../context/AppContext";

import img1 from "../../assets/images/user/user-02.jpg";
import img2 from "../../assets/images/user/user-03.jpg";
import img3 from "../../assets/images/user/user-04.jpg";
import img4 from "../../assets/images/user/user-05.jpg";
import owner from "../../assets/images/user/owner.jpg";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { apiUrl } from "../../config";
import axios from "axios";
import defaultLogo from "../../assets/images/defaultlogo.jpeg";
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
    const authUserRaw = localStorage.getItem("auth_user");
    return authUserRaw ? JSON.parse(authUserRaw) : null;
  } catch (error) {
    console.error("Invalid auth_user", error);
    return null;
  }
};
export default function Header() {
  const navigate = useNavigate();
  const { darkMode, setDarkMode, sidebarToggle, setSidebarToggle } = useApp();

  const [menuToggle, setMenuToggle] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [notifying, setNotifying] = useState(true);

  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [notificationLoading, setNotificationLoading] = useState(false);

  const notifRef = useRef(null);
  const profileRef = useRef(null);

  // const notifications = [
  //   {
  //     id: 1,
  //     name: "Terry Franci",
  //     action: "Quarterly Log Generated",
  //     project: "Project - Building Name",
  //     type: "Project",
  //     time: "5 min ago",
  //     img: img1,
  //   },
  //   {
  //     id: 2,
  //     name: "Alena Franci",
  //     action: "Half Yearly Log Generated",
  //     project: "Project - School Name",
  //     type: "Project",
  //     time: "8 min ago",
  //     img: img2,
  //   },
  //   {
  //     id: 3,
  //     name: "Jocelyn Kenter",
  //     action: "Quarterly Log Generated",
  //     project: "Project - Hospital name",
  //     type: "Project",
  //     time: "15 min ago",
  //     img: img3,
  //   },
  //   {
  //     id: 4,
  //     name: "Brandon Philips",
  //     action: "Monthly Log Generated",
  //     project: "Project - Building Name",
  //     type: "Project",
  //     time: "1 hr ago",
  //     img: img4,
  //   },
  // ];

  useEffect(() => {
    const h = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("auth_user");
    localStorage.removeItem("auth_token");

    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userRole");

    setProfileOpen(false);
    navigate("/");
  };
  const authUser = getAuthUser();
  const fetchProfile = async () => {
    try {
      setProfileLoading(true);

      const res = await axios.post(
        `${apiUrl}/auth/profile`,
        {},
        {
          headers: getAuthHeaders(),
        },
      );

      if (res.data?.success) {
        setProfile(res.data.data);
      } else {
        toast.error(res.data?.message || "Failed to load profile");
      }
    } catch (error) {
      console.error("Profile API Error:", error);
      toast.error(error.response?.data?.message || "Failed to load profile");
    } finally {
      setProfileLoading(false);
    }
  };

  const fetchUnreadNotificationCount = async () => {
    try {
      const res = await axios.post(
        `${apiUrl}/auth/unread_log_count`,
        {
          customer_id: authUser?.role_id === 3 ? authUser?.customer?.customer_id || "" : "",
        },
        {
          headers: getAuthHeaders(),
        }
      );

      if (res.data?.success) {
        setUnreadCount(res.data.unread_count || 0);
        setNotifying((res.data.unread_count || 0) > 0);
      }
    } catch (error) {
      console.error("Unread Count API Error:", error);
    }
  };

  const fetchNotificationList = async () => {
    try {
      setNotificationLoading(true);

      const res = await axios.post(
        `${apiUrl}/auth/notification_list`,
        {
          page: "1",
          limit: "10",
          customer_id: authUser?.role_id === 3 ? authUser?.customer?.customer_id || "" : "",
        },
        {
          headers: getAuthHeaders(),
        }
      );

      if (res.data?.success) {
        setNotifications(res.data.data || []);
        setUnreadCount(res.data.unread_count || 0);
      }
    } catch (error) {
      console.error("Notification List Error:", error);
    } finally {
      setNotificationLoading(false);
    }
  };

  const markNotificationsAsRead = async () => {
    if (!notifications.length) return;

    try {
      const logIds = notifications.map((item) => item.log_id);

      const response = await axios.post(
        `${apiUrl}/auth/mark_log_as_read`,
        {
          log_id: logIds,
        },
        {
          headers: getAuthHeaders(),
        }
      );

      if (response.data?.success) {
        setUnreadCount(0);

        setNotifications((prev) =>
          prev.map((item) => ({
            ...item,
            is_read: 1,
          }))
        );

        fetchUnreadNotificationCount()
      }
    } catch (error) {
      console.error("Mark notification error:", error);
    }
  };

  useEffect(() => {
    fetchProfile();
    fetchUnreadNotificationCount();
  }, []);

  console.log(profile?.profile_image_url, "profile");
  const getProfileImage = () => {
    const image =
      profile?.profile_image_url;

    if (!image) return defaultLogo;

    if (image.startsWith("http://") || image.startsWith("https://")) {
      return image;
    }

    return `${apiUrl.replace("/api", "")}/${image.replace(/^\/+/, "")}`;
  };

  const profileImage = getProfileImage();
  const profileName =
    authUser?.role_id == 3
      ? profile?.customer_company_name
      : profile?.name || "User Name";
  const profileEmail = profile?.email || "user@fisrsystem.com";
  return (
    <header className="sticky top-0 z-[9999] flex w-full border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
      <div className="flex w-full grow flex-col items-center justify-between lg:flex-row lg:px-6">
        <div className="flex w-full items-center justify-between gap-2 px-3 py-3 sm:gap-4 sm:px-4 lg:justify-normal lg:px-0 lg:py-4">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();

              if (window.innerWidth < 1024) {
                setSidebarToggle((v) => !v); // mobile open/close one click
              } else {
                setSidebarToggle((v) => !v); // desktop collapse/expand
              }
            }}
            className={`z-[99999] flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border-gray-200 text-gray-500 lg:h-11 lg:w-11 lg:border dark:border-gray-800 dark:text-gray-400 ${sidebarToggle
              ? "bg-gray-100 lg:bg-transparent dark:bg-gray-800 dark:lg:bg-transparent"
              : ""
              }`}
          >
            <svg
              className="hidden fill-current lg:block"
              width="16"
              height="12"
              viewBox="0 0 16 12"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M0.583252 1C0.583252 0.585788 0.919038 0.25 1.33325 0.25H14.6666C15.0808 0.25 15.4166 0.585786 15.4166 1C15.4166 1.41421 15.0808 1.75 14.6666 1.75L1.33325 1.75C0.919038 1.75 0.583252 1.41422 0.583252 1ZM0.583252 11C0.583252 10.5858 0.919038 10.25 1.33325 10.25L14.6666 10.25C15.0808 10.25 15.4166 10.5858 15.4166 11C15.4166 11.4142 15.0808 11.75 14.6666 11.75L1.33325 11.75C0.919038 11.75 0.583252 11.4142 0.583252 11ZM1.33325 5.25C0.919038 5.25 0.583252 5.58579 0.583252 6C0.583252 6.41421 0.919038 6.75 1.33325 6.75L7.99992 6.75C8.41413 6.75 8.74992 6.41421 8.74992 6C8.74992 5.58579 8.41413 5.25 7.99992 5.25L1.33325 5.25Z"
              />
            </svg>

            {!sidebarToggle ? (
              <svg
                className="fill-current lg:hidden"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M3.25 6C3.25 5.58579 3.58579 5.25 4 5.25L20 5.25C20.4142 5.25 20.75 5.58579 20.75 6C20.75 6.41421 20.4142 6.75 20 6.75L4 6.75C3.58579 6.75 3.25 6.41422 3.25 6ZM3.25 18C3.25 17.5858 3.58579 17.25 4 17.25L20 17.25C20.4142 17.25 20.75 17.5858 20.75 18C20.75 18.4142 20.4142 18.75 20 18.75L4 18.75C3.58579 18.75 3.25 18.4142 3.25 18ZM4 11.25C3.58579 11.25 3.25 11.5858 3.25 12C3.25 12.4142 3.58579 12.75 4 12.75L12 12.75C12.4142 12.75 12.75 12.4142 12.75 12C12.75 11.5858 12.4142 11.25 12 11.25L4 11.25Z"
                />
              </svg>
            ) : (
              <svg
                className="fill-current lg:hidden"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M6.21967 7.28131C5.92678 6.98841 5.92678 6.51354 6.21967 6.22065C6.51256 5.92775 6.98744 5.92775 7.28033 6.22065L11.999 10.9393L16.7176 6.22078C17.0105 5.92789 17.4854 5.92788 17.7782 6.22078C18.0711 6.51367 18.0711 6.98855 17.7782 7.28144L13.0597 12L17.7782 16.7186C18.0711 17.0115 18.0711 17.4863 17.7782 17.7792C17.4854 18.0721 17.0105 18.0721 16.7176 17.7792L11.999 13.0607L7.28033 17.7794C6.98744 18.0722 6.51256 18.0722 6.21967 17.7794C5.92678 17.4865 5.92678 17.0116 6.21967 16.7187L10.9384 12L6.21967 7.28131Z"
                />
              </svg>
            )}
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setMenuToggle((v) => !v);
            }}
            className={`z-[99999] flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-gray-700 hover:bg-gray-100 lg:hidden dark:text-gray-400 dark:hover:bg-gray-800 ${menuToggle ? "bg-gray-100 dark:bg-gray-800" : ""
              }`}
          >
            <svg
              className="fill-current"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M5.99902 10.4951C6.82745 10.4951 7.49902 11.1667 7.49902 11.9951V12.0051C7.49902 12.8335 6.82745 13.5051 5.99902 13.5051C5.1706 13.5051 4.49902 12.8335 4.49902 12.0051V11.9951C4.49902 11.1667 5.1706 10.4951 5.99902 10.4951ZM17.999 10.4951C18.8275 10.4951 19.499 11.1667 19.499 11.9951V12.0051C19.499 12.8335 18.8275 13.5051 17.999 13.5051C17.1706 13.5051 16.499 12.8335 16.499 12.0051V11.9951C16.499 11.1667 17.1706 10.4951 17.999 10.4951ZM13.499 11.9951C13.499 11.1667 12.8275 10.4951 11.999 10.4951C11.1706 10.4951 10.499 11.1667 10.499 11.9951V12.0051C10.499 12.8335 11.1706 13.5051 11.999 13.5051C12.8275 13.5051 13.499 12.8335 13.499 12.0051V11.9951Z"
              />
            </svg>
          </button>
        </div>

        <div
          className={`w-full items-center justify-between gap-4 border-t border-gray-100 bg-white px-3 py-3 shadow-theme-md dark:border-gray-800 dark:bg-gray-900 sm:px-4 lg:flex lg:w-auto lg:justify-end lg:border-t-0 lg:bg-transparent lg:px-0 lg:py-0 lg:shadow-none dark:lg:bg-transparent ${menuToggle ? "flex" : "hidden"
            }`}
        >
          <div className="flex shrink-0 items-center gap-2 2xl:gap-3">
            <button
              type="button"
              onClick={() => setDarkMode((v) => !v)}
              title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
              className="relative flex h-11 w-11 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
            >
              {darkMode ? (
                <svg
                  className="fill-current"
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M10 1.25C10.4142 1.25 10.75 1.58579 10.75 2V3.25C10.75 3.66421 10.4142 4 10 4C9.58579 4 9.25 3.66421 9.25 3.25V2C9.25 1.58579 9.58579 1.25 10 1.25ZM10 5.75C7.65279 5.75 5.75 7.65279 5.75 10C5.75 12.3472 7.65279 14.25 10 14.25C12.3472 14.25 14.25 12.3472 14.25 10C14.25 7.65279 12.3472 5.75 10 5.75ZM4.25 10C4.25 6.82436 6.82436 4.25 10 4.25C13.1756 4.25 15.75 6.82436 15.75 10C15.75 13.1756 13.1756 15.75 10 15.75C6.82436 15.75 4.25 13.1756 4.25 10ZM17.75 9.25C18.1642 9.25 18.5 9.58579 18.5 10C18.5 10.4142 18.1642 10.75 17.75 10.75H16.5C16.0858 10.75 15.75 10.4142 15.75 10C15.75 9.58579 16.0858 9.25 16.5 9.25H17.75ZM3.5 9.25C3.91421 9.25 4.25 9.58579 4.25 10C4.25 10.4142 3.91421 10.75 3.5 10.75H2.25C1.83579 10.75 1.5 10.4142 1.5 10C1.5 9.58579 1.83579 9.25 2.25 9.25H3.5ZM15.3033 3.63604C15.5962 3.34315 16.0711 3.34315 16.364 3.63604C16.6569 3.92893 16.6569 4.40381 16.364 4.6967L15.4801 5.58058C15.1872 5.87348 14.7123 5.87348 14.4194 5.58058C14.1265 5.28769 14.1265 4.81282 14.4194 4.51992L15.3033 3.63604ZM5.58058 14.4194C5.87348 14.7123 5.87348 15.1872 5.58058 15.4801L4.6967 16.364C4.40381 16.6569 3.92893 16.6569 3.63604 16.364C3.34315 16.0711 3.34315 15.5962 3.63604 15.3033L4.51992 14.4194C4.81282 14.1265 5.28769 14.1265 5.58058 14.4194ZM16.364 15.3033C16.6569 15.5962 16.6569 16.0711 16.364 16.364C16.0711 16.6569 15.5962 16.6569 15.3033 16.364L14.4194 15.4801C14.1265 15.1872 14.1265 14.7123 14.4194 14.4194C14.7123 14.1265 15.1872 14.1265 15.4801 14.4194L16.364 15.3033ZM4.6967 3.63604L5.58058 4.51992C5.87348 4.81282 5.87348 5.28769 5.58058 5.58058C5.28769 5.87348 4.81282 5.87348 4.51992 5.58058L3.63604 4.6967C3.34315 4.40381 3.34315 3.92893 3.63604 3.63604C3.92893 3.34315 4.40381 3.34315 4.6967 3.63604ZM10 16C10.4142 16 10.75 16.3358 10.75 16.75V18C10.75 18.4142 10.4142 18.75 10 18.75C9.58579 18.75 9.25 18.4142 9.25 18V16.75C9.25 16.3358 9.58579 16 10 16Z"
                    fill="currentColor"
                  />
                </svg>
              ) : (
                <svg
                  className="fill-current"
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M17.4547 11.97L18.1799 12.1611C18.265 11.8383 18.1265 11.4982 17.8401 11.3266C17.5538 11.1551 17.1885 11.1934 16.944 11.4207L17.4547 11.97ZM8.0306 2.5459L8.57989 3.05657C8.80718 2.81209 8.84554 2.44682 8.67398 2.16046C8.50243 1.8741 8.16227 1.73559 7.83948 1.82066L8.0306 2.5459ZM12.9154 13.0035C9.64678 13.0035 6.99707 10.3538 6.99707 7.08524H5.49707C5.49707 11.1823 8.81835 14.5035 12.9154 14.5035V13.0035ZM16.944 11.4207C15.8869 12.4035 14.4721 13.0035 12.9154 13.0035V14.5035C14.8657 14.5035 16.6418 13.7499 17.9654 12.5193L16.944 11.4207ZM16.7295 11.7789C15.9437 14.7607 13.2277 16.9586 10.0003 16.9586V18.4586C13.9257 18.4586 17.2249 15.7853 18.1799 12.1611L16.7295 11.7789ZM10.0003 16.9586C6.15734 16.9586 3.04199 13.8433 3.04199 10.0003H1.54199C1.54199 14.6717 5.32892 18.4586 10.0003 18.4586V16.9586ZM3.04199 10.0003C3.04199 6.77289 5.23988 4.05695 8.22173 3.27114L7.83948 1.82066C4.21532 2.77574 1.54199 6.07486 1.54199 10.0003H3.04199ZM6.99707 7.08524C6.99707 5.52854 7.5971 4.11366 8.57989 3.05657L7.48132 2.03522C6.25073 3.35885 5.49707 5.13487 5.49707 7.08524H6.99707Z"
                    fill="currentColor"
                  />
                </svg>
              )}
            </button>

            <div ref={notifRef} className="relative">
              <button
                type="button"
                onClick={() => {
                  const nextState = !notifOpen;

                  setNotifOpen((v) => !v);
                  setNotifying(false);

                  if (nextState) {
                    fetchNotificationList();
                  }
                }}
                className="hover:text-dark-900 relative flex h-11 w-11 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
              >
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 z-20 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}

                <svg
                  className="fill-current"
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M10.75 2.29248C10.75 1.87827 10.4143 1.54248 10 1.54248C9.58583 1.54248 9.25004 1.87827 9.25004 2.29248V2.83613C6.08266 3.20733 3.62504 5.9004 3.62504 9.16748V14.4591H3.33337C2.91916 14.4591 2.58337 14.7949 2.58337 15.2091C2.58337 15.6234 2.91916 15.9591 3.33337 15.9591H4.37504H15.625H16.6667C17.0809 15.9591 17.4167 15.6234 17.4167 15.2091C17.4167 14.7949 17.0809 14.4591 16.6667 14.4591H16.375V9.16748C16.375 5.9004 13.9174 3.20733 10.75 2.83613V2.29248ZM14.875 14.4591V9.16748C14.875 6.47509 12.6924 4.29248 10 4.29248C7.30765 4.29248 5.12504 6.47509 5.12504 9.16748V14.4591H14.875ZM8.00004 17.7085C8.00004 18.1228 8.33583 18.4585 8.75004 18.4585H11.25C11.6643 18.4585 12 18.1228 12 17.7085C12 17.2943 11.6643 16.9585 11.25 16.9585H8.75004C8.33583 16.9585 8.00004 17.2943 8.00004 17.7085Z"
                  />
                </svg>
              </button>

              {notifOpen && (
                <div className="shadow-theme-lg fixed left-3 right-3 top-[118px] z-[99999] flex max-h-[calc(100vh-140px)] flex-col rounded-2xl border border-gray-200 bg-white shadow-[0px_4px_20px_0px_#00000030] p-3 sm:absolute sm:left-auto sm:right-0 sm:top-auto sm:mt-[17px] sm:h-[480px] sm:w-[361px] dark:border-gray-800 dark:bg-gray-900">
                  <div className="mb-3 flex items-center justify-between border-b border-gray-100 pb-3 dark:border-gray-800">
                    <h5 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                      Notification
                    </h5>

                    <button
                      type="button"
                      onClick={() => setNotifOpen(false)}
                      className="text-gray-500 dark:text-gray-400"
                    >
                      <svg
                        className="fill-current"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M6.21967 7.28131C5.92678 6.98841 5.92678 6.51354 6.21967 6.22065C6.51256 5.92775 6.98744 5.92775 7.28033 6.22065L11.999 10.9393L16.7176 6.22078C17.0105 5.92789 17.4854 5.92788 17.7782 6.22078C18.0711 6.51367 18.0711 6.98855 17.7782 7.28144L13.0597 12L17.7782 16.7186C18.0711 17.0115 18.0711 17.4863 17.7782 17.7792C17.4854 18.0721 17.0105 18.0721 16.7176 17.7792L11.999 13.0607L7.28033 17.7794C6.98744 18.0722 6.51256 18.0722 6.21967 17.7794C5.92678 17.4865 5.92678 17.0116 6.21967 16.7187L10.9384 12L6.21967 7.28131Z"
                        />
                      </svg>
                    </button>
                  </div>

                  <ul className="custom-scrollbar flex flex-1 flex-col overflow-y-auto">
                    {notificationLoading ? (
                      <div className="py-8 text-center text-gray-500">
                        Loading notifications...
                      </div>
                    ) : notifications.length > 0 ? (
                      notifications.map((item) => (
                        <li key={item.log_id}>
                          <button
                            className="flex gap-3 rounded-lg border-b border-gray-100 px-3 py-3 hover:bg-gray-100 dark:border-gray-800 dark:hover:bg-white/5 sm:px-4.5"
                            type="button"
                            onClick={async () => {
                              await markNotificationsAsRead();

                              setNotifOpen(false);
                            }}
                          >
                            <span className="relative z-10 block h-10 w-full max-w-10 shrink-0 rounded-full">
                              <img
                                src={item.avatar_url || defaultLogo}
                                alt={item.created_by_name}
                                className="h-full w-full overflow-hidden rounded-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.onerror = null;
                                  e.currentTarget.src = defaultLogo;
                                }}
                              />
                            </span>

                            <span className="block min-w-0 text-start">
                              <span className="text-theme-sm mb-1.5 block text-gray-500 dark:text-gray-400">
                                <span className="font-medium text-gray-800 dark:text-white/90">
                                  {item.created_by_name}
                                </span>{" "}
                                {item.notification_title}{" "}
                                <span className="font-medium text-gray-800 dark:text-white/90">
                                  {item.notification_message}
                                </span>
                              </span>

                              <span className="text-theme-xs flex items-center gap-2 text-gray-500 dark:text-gray-400">
                                <span>{item.notification_type}</span>
                                <span className="h-1 w-1 rounded-full bg-gray-400" />
                                <span>{item.time_ago}</span>
                              </span>
                            </span>
                          </button>
                        </li>
                      ))
                    ) : (
                      <div className="py-8 text-center text-gray-500">
                        No notifications found.
                      </div>
                    )}
                  </ul>

                  <button
                    type="button"
                    onClick={async () => {
                      await markNotificationsAsRead();

                      setNotifOpen(false);
                    }}
                    className="text-theme-sm shadow-theme-xs mt-3 flex justify-center rounded-lg border border-gray-300 bg-white p-3 font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
                  >
                    View All Logs
                  </button>
                </div>
              )}
            </div>
          </div>

          <div ref={profileRef} className="relative">
            <button
              type="button"
              onClick={() => setProfileOpen((v) => !v)}
              className="flex min-w-0 items-center text-gray-700 dark:text-gray-300"
            >
              <span className="mr-0 h-10 w-10 shrink-0 overflow-hidden rounded-full sm:mr-3 sm:h-11 sm:w-11">
                <img
                  src={profileImage}
                  alt={profileName}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = defaultLogo;
                  }}
                />
              </span>

              <span className="text-theme-sm mr-1 hidden max-w-[110px] truncate text-sm font-medium text-gray-700 dark:text-gray-400 sm:block">
                {profileLoading ? "Loading..." : profileName}
              </span>

              <svg
                className={`hidden transition-transform text-gray-500 dark:text-gray-300 sm:block ${profileOpen ? "rotate-180" : ""
                  }`}
                width="18"
                height="20"
                viewBox="0 0 18 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M4.3125 8.65625L9 13.3437L13.6875 8.65625"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            {profileOpen && (
              <div className="shadow-theme-lg absolute right-0 z-[99999] mt-[17px] flex w-[calc(100vw-24px)] max-w-[260px] flex-col rounded-2xl border border-gray-200 bg-white p-3 dark:border-gray-800 dark:bg-[#1a2231]">
                <div>
                  <span className="text-theme-sm block font-medium text-gray-700 dark:text-gray-400">
                    {profileLoading ? "Loading..." : profileName}
                  </span>
                  <span className="text-theme-xs mt-0.5 block break-all text-gray-500 dark:text-gray-400">
                    {profileEmail}
                  </span>
                </div>

                <ul className="flex flex-col gap-1 border-b border-gray-200 pt-4 pb-3 dark:border-gray-800">
                  <li>
                    <button
                      onClick={() => {
                        navigate("/profile");
                        setProfileOpen(false);
                      }}
                      className="group text-theme-sm flex w-full items-center gap-3 rounded-lg px-3 py-2 font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-white"
                    >
                      <svg
                        className="h-6 w-6 fill-current text-gray-500 group-hover:text-gray-700 dark:text-gray-400 dark:group-hover:text-white"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M12 3.5C7.30558 3.5 3.5 7.30558 3.5 12C3.5 14.1526 4.3002 16.1184 5.61936 17.616C6.17279 15.3096 8.24852 13.5955 10.7246 13.5955H13.2746C15.7509 13.5955 17.8268 15.31 18.38 17.6167C19.6996 16.119 20.5 14.153 20.5 12C20.5 7.30558 16.6944 3.5 12 3.5ZM17.0246 18.8566V18.8455C17.0246 16.7744 15.3457 15.0955 13.2746 15.0955H10.7246C8.65354 15.0955 6.97461 16.7744 6.97461 18.8455V18.856C8.38223 19.8895 10.1198 20.5 12 20.5C13.8798 20.5 15.6171 19.8898 17.0246 18.8566ZM2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12ZM11.9991 7.25C10.8847 7.25 9.98126 8.15342 9.98126 9.26784C9.98126 10.3823 10.8847 11.2857 11.9991 11.2857C13.1135 11.2857 14.0169 10.3823 14.0169 9.26784C14.0169 8.15342 13.1135 7.25 11.9991 7.25ZM8.48126 9.26784C8.48126 7.32499 10.0563 5.75 11.9991 5.75C13.9419 5.75 15.5169 7.32499 15.5169 9.26784C15.5169 11.2107 13.9419 12.7857 11.9991 12.7857C10.0563 12.7857 8.48126 11.2107 8.48126 9.26784Z"
                        />
                      </svg>
                      Edit profile
                    </button>
                  </li>
                </ul>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="group text-theme-sm mt-3 flex w-full items-center gap-3 rounded-lg px-3 py-2 font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-white"
                >
                  <svg
                    className="h-6 w-6 fill-current text-gray-500 group-hover:text-gray-700 dark:text-gray-400 dark:group-hover:text-white"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M15.1007 19.247C14.6865 19.247 14.3507 18.9112 14.3507 18.497L14.3507 14.245H12.8507V18.497C12.8507 19.7396 13.8581 20.747 15.1007 20.747H18.5007C19.7434 20.747 20.7507 19.7396 20.7507 18.497L20.7507 5.49609C20.7507 4.25345 19.7433 3.24609 18.5007 3.24609H15.1007C13.8581 3.24609 12.8507 4.25345 12.8507 5.49609V9.74501L14.3507 9.74501V5.49609C14.3507 5.08188 14.6865 4.74609 15.1007 4.74609L18.5007 4.74609C18.9149 4.74609 19.2507 5.08188 19.2507 5.49609L19.2507 18.497C19.2507 18.9112 18.9149 19.247 18.5007 19.247H15.1007ZM3.25073 11.9984C3.25073 12.2144 3.34204 12.4091 3.48817 12.546L8.09483 17.1556C8.38763 17.4485 8.86251 17.4487 9.15549 17.1559C9.44848 16.8631 9.44863 16.3882 9.15583 16.0952L5.81116 12.7484L16.0007 12.7484C16.4149 12.7484 16.7507 12.4127 16.7507 11.9984C16.7507 11.5842 16.4149 11.2484 16.0007 11.2484L5.81528 11.2484L9.15585 7.90554C9.44864 7.61255 9.44847 7.13767 9.15547 6.84488C8.86248 6.55209 8.3876 6.55226 8.09481 6.84525L3.52309 11.4202C3.35673 11.5577 3.25073 11.7657 3.25073 11.9984Z"
                    />
                  </svg>
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

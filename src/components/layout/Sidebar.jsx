import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useApp } from "../../context/AppContext";

const MoreIcon = () => (
  <svg
    className="mx-auto menu-group-icon"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
  >
    <path
      d="M6 12h.01M12 12h.01M18 12h.01"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const DashboardIcon = () => (
  <svg
    className="h-6 w-6"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
  >
    <path
      d="M4 13h6V4H4v9ZM14 20h6v-9h-6v9ZM4 20h6v-4H4v4ZM14 8h6V4h-6v4Z"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const PermissionIcon = () => (
  <svg
    className="h-6 w-6"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
  >
    <path
      d="M12 3l7 3v5c0 4.6-2.9 8.6-7 10-4.1-1.4-7-5.4-7-10V6l7-3Z"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M9.5 12l1.7 1.7L15 10"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const EmployeeIcon = () => (
  <svg
    className="h-6 w-6"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
  >
    <path
      d="M16 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M9.5 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const CustomerIcon = () => (
  <svg
    className="h-6 w-6"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
  >
    <path
      d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M17 8l1 1 2-2"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const BuildingIcon = () => (
  <svg
    className="h-6 w-6"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
  >
    <path
      d="M4 21V5a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v16"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M9 21v-4h3v4M7 7h2M12 7h2M7 11h2M12 11h2M7 15h2M20 21H3"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ComponentIcon = () => (
  <svg
    className="h-6 w-6"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
  >
    <path
      d="M12 2l8 4.5v9L12 20l-8-4.5v-9L12 2Z"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M12 11l8-4.5M12 11 4 6.5M12 11v9"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const MaintenanceIcon = () => (
  <svg
    className="h-6 w-6"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
  >
    <path
      d="M14.7 6.3a4.5 4.5 0 0 0-5.9 5.9l-5.1 5.1a2 2 0 0 0 2.8 2.8l5.1-5.1a4.5 4.5 0 0 0 5.9-5.9l-3 3-2.8-2.8 3-3Z"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ReportIcon = () => (
  <svg
    className="h-6 w-6"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
  >
    <path
      d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5Z"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M14 3v5h5M9 13h6M9 17h6"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ArrowIcon = ({ open }) => (
  <svg
    className={`menu-item-arrow absolute right-2.5 top-1/2 -translate-y-1/2 stroke-current transition-transform ${
      open ? "rotate-180 menu-item-arrow-active" : "menu-item-arrow-inactive"
    }`}
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
  >
    <path
      d="M4.79175 7.39584L10.0001 12.6042L15.2084 7.39585"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default function Sidebar() {
  const { sidebarToggle, setSidebarToggle } = useApp();

  const location = useLocation();
  const [openMenus, setOpenMenus] = useState({
    Permission: false,
    Employee: false,
    Customer: false,
    Building: false,
    System: false,
    Maintenance: false,
    LogManagement: false,
    Reports: false,
  });

  const toggleMenu = (key) => {
    setOpenMenus((prev) => {
      const isCurrentlyOpen = prev[key];

      const closedMenus = Object.keys(prev).reduce((acc, menuKey) => {
        acc[menuKey] = false;
        return acc;
      }, {});

      return {
        ...closedMenus,
        [key]: !isCurrentlyOpen,
      };
    });
  };
  const isParentActive = (item) => {
    if (!item.children) return location.pathname === item.path;

    return item.children.some((child) => location.pathname === child.path);
  };

  const closeSidebarOnMobile = () => {
    if (window.innerWidth < 1024) {
      setSidebarToggle(false);
    }
  };

  const authUser = JSON.parse(localStorage.getItem("auth_user") || "{}");

  const authRoleId = Number(authUser?.role_id);
const customerRoleId = Number(authUser?.customer?.role_id);

const isCustomerRole = authRoleId === 3 || customerRoleId === 3;

const roleId = isCustomerRole ? 3 : authRoleId;

  const permissions = Array.isArray(authUser?.permissions)
    ? authUser.permissions
    : [];

  const customerData = authUser?.customer || {};

const defaultLogo = "/images/logo/logo-new-dark.png";
const defaultDarkLogo = "/images/logo/logo-new-dark.png";
const defaultLogoIcon = "/images/logo/logo-new-icon.png";

const customerLogo = customerData?.logo_url || "";
const customerLogoIcon = customerData?.logo_icon_url || "";

const sidebarLogo = isCustomerRole && customerLogo ? customerLogo : defaultLogo;

const sidebarDarkLogo =
  isCustomerRole && customerLogo ? customerLogo : defaultDarkLogo;

const sidebarLogoIcon =
  isCustomerRole && customerLogoIcon
    ? customerLogoIcon
    : isCustomerRole && customerLogo
      ? customerLogo
      : defaultLogoIcon;

  const dashboardPath =
    roleId === 1
      ? "/dashboard"
      : roleId === 3
        ? "/customer-dashboard"
        : "/engineer-dashboard";

  const normalizeText = (value) =>
    String(value || "")
      .trim()
      .toLowerCase();

  const getPermission = (permissionName) => {
    return permissions.find(
      (item) =>
        normalizeText(item?.permission_name) === normalizeText(permissionName),
    );
  };

  const canRead = (permissionName) => {
    // role_id 1 fixed full access
    if (roleId === 1) return true;

    // role_id 3 fixed access, permission check nahi
    //if (roleId === 3) return true;

    const permission = getPermission(permissionName);
    return Number(permission?.read) === 1;
  };

  const canWrite = (permissionName) => {
    // role_id 1 fixed full access
    if (roleId === 1) return true;

    // role_id 3 fixed access, permission check nahi
   // if (roleId === 3) return true;

    const permission = getPermission(permissionName);
    return Number(permission?.write) === 1;
  };
const canShowReportLogs =
  authRoleId === 3 || customerRoleId === 3;
  const permissionMenus = [
    {
      key: "dashboard",
      label: "Dashboard",
      icon: <DashboardIcon />,
      path: dashboardPath,
    },
    {
      key: "Permission",
      permissionName: "Role & Permission",
      label: "Roles & Permission",
      icon: <PermissionIcon />,
      children: [
        { label: "Create Role", path: "/create-role", action: "write" },
        { label: "Roles", path: "/roles", action: "read" },
      ],
    },
    {
      key: "Employee",
      permissionName: "Employee Management",
      label: "Employee Management",
      icon: <EmployeeIcon />,
      children: [
        { label: "Create Employee", path: "/create-employee", action: "write" },
        { label: "Employee", path: "/employee", action: "read" },
      ],
    },
    {
      key: "Customer",
      permissionName: "Customer Management",
      label: "Customer Management",
      icon: <CustomerIcon />,
      children: [
        { label: "Create Customer", path: "/create-customer", action: "write" },
        { label: "Customer", path: "/customer", action: "read" },
      ],
    },
    {
      key: "Building",
      permissionName: "Building Management",
      label: "Building Management",
      icon: <BuildingIcon />,
      children: [
        { label: "Create Building", path: "/create-building", action: "write" },
        { label: "Buildings", path: "/building", action: "read" },
      ],
    },
    {
      key: "System",
      permissionName: "System Management",
      label: "System Management",
      icon: <ComponentIcon />,
      children: [
        {
          label: "Create System",
          path: "/create-component",
          action: "write",
        },
        { label: "Systems", path: "/component", action: "read" },
      ],
    },
    {
      key: "Maintenance",
      permissionName: "Purpose of Visit",
      label: "Purpose of Visit",
      icon: <MaintenanceIcon />,
      children: [
        {
          label: "Create Purpose of Visit",
          path: "/create-maintenance",
          action: "write",
        },
        { label: "Purpose of Visit", path: "/maintenance-type", action: "read" },
      ],
    },
    {
      key: "LogManagement",
      permissionName: "Log Management",
      label: "Log Management",
      icon: <ReportIcon />,
      children: [
        { label: "Create Log", path: "/create-log", action: "write" },
        { label: "Logs", path: "/logs", action: "read" },
      ],
    },
 {
  key: "Reports",
  permissionName: "Reports",
  label: "Reports",
  icon: <ReportIcon />,
  children: canShowReportLogs
    ? [{ label: "Logs", path: "/logs", action: "read" }]
    : [],
},
  ];

  const filterChildrenByPermission = (item) => {
    if (item.key === "dashboard") {
      return item;
    }

    if (!item.children) {
      return item;
    }

    const filteredChildren = item.children.filter((child) => {

      if (child.action === "read") {
        return canRead(item.permissionName);
      }

      if (child.action === "write") {
        return canWrite(item.permissionName);
      }

      return false;
    });

    if (filteredChildren.length === 0) {
      return null;
    }

    return {
      ...item,
      children: filteredChildren,
    };
  };

  let visibleMenus = [];

  if (roleId === 1) {
    
    // Super Admin fixed full menu
    visibleMenus = permissionMenus;
  } else if (roleId === 3) {

    // Customer fixed menu
    visibleMenus = permissionMenus
      .filter((item) =>
        ["dashboard", "Permission", "Employee", "Building", "Reports"].includes(
          item.key,
        ),
      )
      .map(filterChildrenByPermission)
      .filter(Boolean);
  } else {
    
    // Other roles permission-wise from auth_user.permissions
    // read: 1 => listing menu show
    // write: 1 => create menu show
    
    visibleMenus = permissionMenus
//      .filter((item) => item.key !== "Reports")
      .map(filterChildrenByPermission)
      .filter(Boolean);
  }

  useEffect(() => {
    const activeMenu = visibleMenus.find(
      (item) =>
        item.children?.length > 0 &&
        item.children.some((child) => location.pathname === child.path),
    );

    if (activeMenu) {
      setOpenMenus((prev) => {
        const closedMenus = Object.keys(prev).reduce((acc, menuKey) => {
          acc[menuKey] = false;
          return acc;
        }, {});

        return {
          ...closedMenus,
          [activeMenu.key]: true,
        };
      });
    }
    
  }, [location.pathname]);
  return (
    <aside
      className={`sidebar group/sidebar fixed left-0 top-0 z-[99999] flex h-screen w-[290px] flex-col overflow-hidden border-r border-gray-200 bg-white px-4 transition-transform duration-300 dark:border-gray-800 dark:bg-gray-900 sm:px-5 lg:sticky lg:translate-x-0 lg:transition-all ${
        sidebarToggle
          ? "translate-x-0 lg:w-[90px] lg:hover:w-[290px]"
          : "-translate-x-full lg:translate-x-0 lg:w-[290px]"
      }`}
    >
      <div
        className={`sidebar-header flex shrink-0 items-center justify-center gap-2 pt-3 pb-3  ${
          sidebarToggle
            ? "justify-between lg:justify-center lg:group-hover/sidebar:justify-between"
            : "justify-between"
        }`}
      >
        <NavLink to={dashboardPath} onClick={closeSidebarOnMobile}>
          <span
            className={`logo ${
              sidebarToggle
                ? "block lg:hidden lg:group-hover/sidebar:block"
                : "block"
            }`}
          >
            <img
              className="h-10 max-w-[210px] object-contain lg:h-[100px] dark:hidden"
              src={sidebarLogo}
              alt="Logo"
              onError={(e) => {
                e.currentTarget.src = defaultLogo;
              }}
            />

            <img
              className="hidden h-10 max-w-[210px] object-contain lg:h-[100px] dark:block"
              src={sidebarDarkLogo}
              alt="Logo"
              onError={(e) => {
                e.currentTarget.src = defaultDarkLogo;
              }}
            />
          </span>

          <img
            className={`logo-icon h-12 w-12 rounded-lg object-contain sm:h-14 sm:w-14 ${
              sidebarToggle
                ? "hidden lg:block lg:group-hover/sidebar:hidden"
                : "hidden"
            }`}
            src={sidebarLogoIcon}
            alt="Logo"
            onError={(e) => {
              e.currentTarget.src = defaultLogoIcon;
            }}
          />
        </NavLink>

        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setSidebarToggle(false);
          }}
          className="flex h-10 w-10 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 lg:hidden"
        >
          <svg
            className="fill-current"
            width="24"
            height="24"
            viewBox="0 0 24 24"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M6.21967 7.28131C5.92678 6.98841 5.92678 6.51354 6.21967 6.22065C6.51256 5.92775 6.98744 5.92775 7.28033 6.22065L11.999 10.9393L16.7176 6.22078C17.0105 5.92789 17.4854 5.92788 17.7782 6.22078C18.0711 6.51367 18.0711 6.98855 17.7782 7.28144L13.0597 12L17.7782 16.7186C18.0711 17.0115 18.0711 17.4863 17.7782 17.7792C17.4854 18.0721 17.0105 18.0721 16.7176 17.7792L11.999 13.0607L7.28033 17.7794C6.98744 18.0722 6.51256 18.0722 6.21967 17.7794C5.92678 17.4865 5.92678 17.0116 6.21967 16.7187L10.9384 12L6.21967 7.28131Z"
            />
          </svg>
        </button>
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto overflow-x-hidden duration-300 ease-linear no-scrollbar">
        <nav>
          <div>
            <h3 className="mb-4 text-xs uppercase leading-[20px] text-gray-400">
              {isCustomerRole && (
                <div
                  className={`flex items-center border-t border-gray-100 py-2 dark:border-gray-800 ${
                    sidebarToggle
                      ? "hidden lg:hidden lg:group-hover/sidebar:block"
                      : "block"
                  }`}
                >
                  <p className=" text-center text-[14px] font-medium uppercase tracking-wide text-blue-600">
                    Powered by
                  </p>

                  <img
                    className="mx-auto h-16 max-w-[180px] object-contain dark:hidden"
                    src={defaultLogo}
                    alt="Fire Systems"
                  />

                  <img
                    className="mx-auto hidden h-8 max-w-[180px] object-contain dark:block"
                    src={defaultDarkLogo}
                    alt="Fire Systems"
                  />
                </div>
              )}

              <span
                className={`${
                  sidebarToggle
                    ? "hidden lg:block lg:group-hover/sidebar:hidden"
                    : "hidden"
                }`}
              >
                <MoreIcon />
              </span>
            </h3>

            <ul className="mb-6 flex flex-col gap-2 sm:gap-4">
              {visibleMenus.map((item) => {
                const hasChildren = item.children?.length > 0;
                const isBlankMenu = item.children && item.children.length === 0;
                const isActiveParent = isParentActive(item);
                const isOpen = openMenus[item.key];
                const isMenuHighlighted = isActiveParent || isOpen;
                if (isBlankMenu) {
                  return (
                    <li key={item.key}>
                      <button
                        type="button"
                        disabled
                        className="menu-item group relative w-full cursor-default menu-item-inactive"
                      >
                        <span className="menu-item-icon-inactive">
                          {item.icon}
                        </span>

                        <span
                          className={`menu-item-text whitespace-nowrap ${
                            sidebarToggle
                              ? "inline lg:hidden lg:group-hover/sidebar:inline"
                              : "inline"
                          }`}
                        >
                          {item.label}
                        </span>
                      </button>
                    </li>
                  );
                }
                if (!hasChildren) {
                  return (
                    <li key={item.key}>
                      <NavLink
                        to={item.path}
                        onClick={closeSidebarOnMobile}
                        className={({ isActive }) =>
                          `menu-item group ${
                            isActive ? "menu-item-active" : "menu-item-inactive"
                          }`
                        }
                      >
                        {({ isActive }) => (
                          <>
                            <span
                              className={
                                isActive
                                  ? "menu-item-icon-active"
                                  : "menu-item-icon-inactive"
                              }
                            >
                              {item.icon}
                            </span>

                            <span
                              className={`menu-item-text whitespace-nowrap ${
                                sidebarToggle
                                  ? "inline lg:hidden lg:group-hover/sidebar:inline"
                                  : "inline"
                              }`}
                            >
                              {item.label}
                            </span>
                          </>
                        )}
                      </NavLink>
                    </li>
                  );
                }

                return (
                  <li key={item.key}>
                    <button
                      type="button"
                      onClick={() => toggleMenu(item.key)}
                      className={`menu-item group relative w-full ${
                        isMenuHighlighted
                          ? "menu-item-active"
                          : "menu-item-inactive"
                      }`}
                    >
                      <span
                        className={
                          isMenuHighlighted
                            ? "menu-item-icon-active"
                            : "menu-item-icon-inactive"
                        }
                      >
                        {item.icon}
                      </span>

                      <span
                        className={`menu-item-text whitespace-nowrap ${
                          sidebarToggle
                            ? "inline lg:hidden lg:group-hover/sidebar:inline"
                            : "inline"
                        }`}
                      >
                        {item.label}
                      </span>

                      <span
                        className={`${
                          sidebarToggle
                            ? "block lg:hidden lg:group-hover/sidebar:block"
                            : "block"
                        }`}
                      >
                        <ArrowIcon open={isOpen} />
                      </span>
                    </button>

                    <div
                      className={`overflow-hidden transition-all duration-300 ${
                        isOpen ? "block" : "hidden"
                      }`}
                    >
                      <ul
                        className={`menu-dropdown mt-2 flex-col gap-1 pl-9 ${
                          sidebarToggle
                            ? "flex lg:hidden lg:group-hover/sidebar:flex"
                            : "flex"
                        }`}
                      >
                        {item.children.map((child) => (
                          <li key={child.path}>
                            <NavLink
                              to={child.path}
                              onClick={closeSidebarOnMobile}
                              className={({ isActive }) =>
                                `menu-dropdown-item group whitespace-nowrap ${
                                  isActive
                                    ? "menu-dropdown-item-active"
                                    : "menu-dropdown-item-inactive"
                                }`
                              }
                            >
                              {child.label}
                            </NavLink>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </nav>
      </div>
    </aside>
  );
}

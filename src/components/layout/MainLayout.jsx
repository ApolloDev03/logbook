import { useApp } from "../../context/AppContext";
import Sidebar from "./Sidebar";
import Header from "./Header";

export default function MainLayout({ children }) {
  const { sidebarToggle, setSidebarToggle } = useApp();

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
      <Sidebar />

      {/* Mobile overlay */}
      {sidebarToggle && (
        <div
          onClick={() => setSidebarToggle(false)}
          className="fixed inset-0 z-[99998] bg-black/40 lg:hidden"
        />
      )}

      <div className="content-area relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
        <Header />

        <main className="flex-1">
          <div className="mx-auto max-w-[1536px] p-4 md:p-6">{children}</div>
        </main>
      </div>
    </div>
  );
}

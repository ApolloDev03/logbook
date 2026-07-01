import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Breadcrumb from "../components/ui/Breadcrumb";
import { apiUrl } from "../config";
import axios from "axios";

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

export default function CustomerImport() {
  const navigate = useNavigate();

  const [file, setFile] = useState(null);

  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = () => {
    if (!file) {
      return;
    }

    // API Call Here
  };

  const handleDownloadTemplate = async () => {
    const token = getToken();

    if (!token) {
      toast.error("Token not found. Please login again.");
      return;
    }

    try {
      const response = await axios.post(
        `${apiUrl}/auth/download-customer-csv-template`,
        {},
        {
          headers: getAuthHeaders(),
          responseType: "blob",
        }
      );

      // Create blob
      const blob = new Blob([response.data], {
        type: "text/csv;charset=utf-8;",
      });

      // Download file
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.setAttribute("download", "Customer_Template.csv");

      document.body.appendChild(link);
      link.click();

      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success("Customer Template downloaded successfully.");
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
        "Failed to download customer template."
      );
    }
  };

  return (
    <>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Customer Import
        </h1>

        <Breadcrumb
          pageName="Customer Import"
          parentPage="Customer Management"
        />
      </div>

      <div className="card rounded-xl">
        <div className="border-b border-gray-200 p-6 dark:border-gray-800">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Customer Employees
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Download the sample template, fill customer details and upload
                the completed file.
              </p>
            </div>

            <button
              type="button"
              onClick={handleDownloadTemplate}
              className="rounded-lg bg-green-600 px-5 py-2.5 font-medium text-white transition hover:bg-green-700"
            >
              Excel Template
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="mx-auto max-w-2xl rounded-xl border border-dashed border-gray-300 bg-gray-50 p-8 dark:border-gray-700 dark:bg-gray-900">

            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Upload Excel File
            </label>

            <input
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileChange}
              className="block w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm dark:border-gray-700 dark:bg-gray-800"
            />

            {file && (
              <div className="mt-4 rounded-lg bg-blue-50 p-3 text-sm text-blue-700 dark:bg-blue-900/20 dark:text-blue-300">
                <strong>Selected File:</strong> {file.name}
              </div>
            )}

            <div className="mt-8 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => navigate("/customer")}
                className="rounded-lg border border-gray-300 px-6 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-white dark:hover:bg-gray-800"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSubmit}
                className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
              >
                Import Customer
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
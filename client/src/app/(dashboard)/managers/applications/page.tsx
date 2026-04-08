"use client";

import ApplicationCard from "@/components/ApplicationCard";
import Header from "@/components/Header";
import Loading from "@/components/Loading";
import {
  useGetApplicationsQuery,
  useGetAuthUserQuery,
  useUpdateApplicationStatusMutation,
} from "@/state/api";
import { CircleCheckBig, Download, File, Hospital } from "lucide-react";
import Link from "next/link";
import React, { useState } from "react";

const FILTERS = [
  { label: "All", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Approved", value: "approved" },
  { label: "Denied", value: "denied" },
] as const;

type FilterValue = (typeof FILTERS)[number]["value"];

const Applications = () => {
  const { data: authUser } = useGetAuthUserQuery();
  const [activeFilter, setActiveFilter] = useState<FilterValue>("all");

  const {
    data: applications,
    isLoading,
    isError,
  } = useGetApplicationsQuery(
    { userId: authUser?.userId, userType: "manager" },
    { skip: !authUser?.userId }
  );

  const [updateApplicationStatus] = useUpdateApplicationStatusMutation();

  const handleStatusChange = async (id: number, status: string) => {
    await updateApplicationStatus({ id, status });
  };

  if (isLoading) return <div className="h-screen w-full flex items-center justify-center"> <Loading/> </div>
  if (isError || !applications) return <div>Error fetching applications</div>;

  const filteredApplications = applications.filter((app) =>
    activeFilter === "all"
      ? true
      : app.status.toLowerCase() === activeFilter
  );

  const counts = {
    all: applications.length,
    pending: applications.filter((a) => a.status.toLowerCase() === "pending").length,
    approved: applications.filter((a) => a.status.toLowerCase() === "approved").length,
    denied: applications.filter((a) => a.status.toLowerCase() === "denied").length,
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Page Header */}
      <div className="px-6 pt-6 pb-2">
        <Header
          title="Applications"
          subtitle="View and manage applications for your properties"
        />
      </div>

      {/* Sticky Filter Navbar */}
      <div className="sticky top-0 z-20 bg-background border-b border-border shadow-sm">
        <div className="flex items-center gap-1 px-6 py-1">
          {FILTERS.map((f) => {
            const isActive = activeFilter === f.value;
            return (
              <button
                key={f.value}
                onClick={() => setActiveFilter(f.value)}
                className={`
                  relative flex items-center gap-2 px-5 py-3 text-sm font-medium
                  transition-all duration-200 border-b-2
                  ${
                    isActive
                      ? "border-primary-600 text-primary-700"
                      : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                  }
                `}
              >
                {f.label}
                <span
                  className={`
                    inline-flex items-center justify-center min-w-[20px] h-5 px-1.5
                    rounded-full text-xs font-semibold
                    ${
                      isActive
                        ? "bg-primary-100 text-primary-700"
                        : "bg-muted text-muted-foreground"
                    }
                  `}
                >
                  {counts[f.value]}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Application Cards — full width */}
      <div className="flex-1 w-full px-6 py-6 space-y-4">
        {filteredApplications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
            <File className="w-12 h-12 mb-4 opacity-30" />
            <p className="text-lg font-medium">No applications found</p>
            <p className="text-sm mt-1">
              {activeFilter === "all"
                ? "There are no applications yet."
                : `No ${activeFilter} applications.`}
            </p>
          </div>
        ) : (
          filteredApplications.map((application) => (
            <ApplicationCard
              key={application.id}
              application={application}
              userType="manager"
            >
              <div className="flex flex-col sm:flex-row justify-between gap-4 w-full pb-4 px-4">
                {/* Status Banner */}
                <div
                  className={`flex flex-wrap items-center gap-2 p-3 rounded-md grow text-sm ${
                    application.status === "Approved"
                      ? "bg-green-50 text-green-700 border border-green-200"
                      : application.status === "Denied"
                      ? "bg-red-50 text-red-700 border border-red-200"
                      : "bg-yellow-50 text-yellow-700 border border-yellow-200"
                  }`}
                >
                  <File className="w-4 h-4 shrink-0" />
                  <span>
                    Submitted on{" "}
                    {new Date(application.applicationDate).toLocaleDateString()}
                  </span>
                  <CircleCheckBig className="w-4 h-4 shrink-0" />
                  <span className="font-semibold">
                    {application.status === "Approved" &&
                      "This application has been approved."}
                    {application.status === "Denied" &&
                      "This application has been denied."}
                    {application.status === "Pending" &&
                      "This application is pending review."}
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-2 items-center shrink-0">
                  <Link
                    href={`/managers/properties/${application.property.id}`}
                    className="bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-md flex items-center text-sm hover:bg-gray-50 transition-colors"
                    scroll={false}
                  >
                    <Hospital className="w-4 h-4 mr-2" />
                    Property Details
                  </Link>

                  {application.status === "Approved" && (
                    <button className="bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-md flex items-center text-sm hover:bg-gray-50 transition-colors">
                      <Download className="w-4 h-4 mr-2" />
                      Download Agreement
                    </button>
                  )}

                  {application.status === "Pending" && (
                    <>
                      <button
                        className="px-4 py-2 text-sm text-white bg-green-600 rounded-md hover:bg-green-500 transition-colors"
                        onClick={() =>
                          handleStatusChange(application.id, "Approved")
                        }
                      >
                        Approve
                      </button>
                      <button
                        className="px-4 py-2 text-sm text-white bg-red-600 rounded-md hover:bg-red-500 transition-colors"
                        onClick={() =>
                          handleStatusChange(application.id, "Denied")
                        }
                      >
                        Deny
                      </button>
                    </>
                  )}

                  {application.status === "Denied" && (
                    <button className="bg-gray-800 text-white py-2 px-4 rounded-md flex items-center text-sm hover:bg-gray-700 transition-colors">
                      Contact User
                    </button>
                  )}
                </div>
              </div>
            </ApplicationCard>
          ))
        )}
      </div>
    </div>
  );
};

export default Applications;

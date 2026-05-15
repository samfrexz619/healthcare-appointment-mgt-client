"use client";

import { useCallback, useEffect, useState } from "react";
import { Appointment } from "@/types/doctor";
import { appointmentService } from "@/lib/services/appointmentService";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Pagination } from "@/components/ui/pagination";
import AppointmentCard from "./AppointmentCard";
import clsx from "clsx";

const APPOINTMENTS_PAGE_SIZE = 10;

type AppointmentTimeframe = "upcoming" | "past";

interface PaginationMeta {
  totalItems: number;
  totalPages: number;
  page: number;
  limit: number;
}

interface BackendPagination {
  totalItems?: number;
  total?: number;
  totalPages?: number;
  page?: number;
  currentPage?: number;
  limit?: number;
  pageSize?: number;
}

const normalizePagination = (
  pagination: BackendPagination | undefined,
): PaginationMeta | null => {
  if (!pagination) return null;

  const totalItems = pagination.totalItems ?? pagination.total ?? 0;
  const limit = pagination.limit ?? pagination.pageSize ?? APPOINTMENTS_PAGE_SIZE;
  const page = pagination.page ?? pagination.currentPage ?? 1;
  const totalPages =
    pagination.totalPages ?? Math.max(1, Math.ceil(totalItems / limit));

  return { totalItems, totalPages, page, limit };
};

const AppointmentsList = () => {
  const [appointmentsByTab, setAppointmentsByTab] = useState<
    Record<AppointmentTimeframe, Appointment[]>
  >({
    upcoming: [],
    past: [],
  });
  const [paginationByTab, setPaginationByTab] = useState<
    Record<AppointmentTimeframe, PaginationMeta | null>
  >({
    upcoming: null,
    past: null,
  });
  const [pageByTab, setPageByTab] = useState<Record<AppointmentTimeframe, number>>({
    upcoming: 1,
    past: 1,
  });
  const [loading, setLoading] = useState(true);
  const [hasLoadedInitialTabs, setHasLoadedInitialTabs] = useState(false);
  const [activeTab, setActiveTab] =
    useState<AppointmentTimeframe>("upcoming");

  const fetchAppointments = useCallback(
    async (timeframe: AppointmentTimeframe) => {
      try {
        setLoading(true);
        const res = await appointmentService.getMyAppointments({
          timeframe,
          page: pageByTab[timeframe],
          limit: APPOINTMENTS_PAGE_SIZE,
        });
        setAppointmentsByTab((prev) => ({
          ...prev,
          [timeframe]: res.appointments || [],
        }));
        setPaginationByTab((prev) => ({
          ...prev,
          [timeframe]: normalizePagination(res.pagination),
        }));
      } catch (err) {
        console.error("Failed to fetch appointments:", err);
      } finally {
        setLoading(false);
      }
    },
    [pageByTab],
  );

  useEffect(() => {
    const loadAppointments = async () => {
      if (!hasLoadedInitialTabs) {
        await Promise.all([fetchAppointments("upcoming"), fetchAppointments("past")]);
        setHasLoadedInitialTabs(true);
        return;
      }

      await fetchAppointments(activeTab);
    };

    loadAppointments();
  }, [activeTab, fetchAppointments, hasLoadedInitialTabs]);

  const currentAppointments = appointmentsByTab[activeTab];
  const currentPagination = paginationByTab[activeTab];

  if (loading && currentAppointments.length === 0) {
    return <div className="p-4 text-center">Loading appointments...</div>;
  }

  return (
    <section className="my-10 h-full">
      <h3 className="text-2xl font-bold text-black mb-6">My Appointments</h3>

      <Tabs
        defaultValue="upcoming"
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as AppointmentTimeframe)}
        className="w-full"
      >
        <TabsList className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-transparent h-auto p-0 w-full">
          <TabsTrigger
            value="upcoming"
            className={clsx(
              "border rounded-lg px-4 py-3 text-sm font-semibold transition",
              activeTab === "upcoming"
                ? "border-[#0F93A5] !bg-[#E6F6F8] text-[#0F93A5]"
                : "border-gray-200 text-gray-600 hover:border-gray-300 hover:text-gray-900",
            )}
          >
            Upcoming ({paginationByTab.upcoming?.totalItems ?? 0})
          </TabsTrigger>
          <TabsTrigger
            value="past"
            className={clsx(
              "border rounded-lg px-4 py-3 text-sm font-semibold transition",
              activeTab === "past"
                ? "border-[#0F93A5] !bg-[#E6F6F8] text-[#0F93A5]"
                : "border-gray-200 text-gray-600 hover:border-gray-300 hover:text-gray-900",
            )}
          >
            Past ({paginationByTab.past?.totalItems ?? 0})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {currentAppointments.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p className="text-lg">
                No {activeTab === "upcoming" ? "upcoming" : "past"} appointments
              </p>
              {activeTab === "upcoming" && (
                <p className="text-sm mt-2">Book your first appointment</p>
              )}
            </div>
          ) : (
            <div className="grid gap-4">
              {currentAppointments.map((apt) => (
                <AppointmentCard
                  key={apt._id}
                  appointment={apt}
                  onRefresh={() => fetchAppointments(activeTab)}
                  isUpcoming={activeTab === "upcoming"}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {currentPagination && (
        <Pagination
          currentPage={currentPagination.page}
          totalPages={currentPagination.totalPages}
          totalItems={currentPagination.totalItems}
          pageSize={currentPagination.limit}
          onPageChange={(page) =>
            setPageByTab((prev) => ({ ...prev, [activeTab]: page }))
          }
          isLoading={loading}
          itemLabel="appointments"
          className="mt-6"
        />
      )}
    </section>
  );
};

export default AppointmentsList;

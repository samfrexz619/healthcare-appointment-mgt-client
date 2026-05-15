"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import clsx from "clsx";

interface PaginationProps {
  currentPage: number;
  totalPages?: number;
  totalItems?: number;
  pageSize?: number;
  onPageChange: (page: number) => void;
  className?: string;
  isLoading?: boolean;
  itemLabel?: string;
}

const getPageNumbers = (currentPage: number, totalPages: number) => {
  const pages = new Set<number>([1, totalPages, currentPage]);

  if (currentPage > 1) pages.add(currentPage - 1);
  if (currentPage < totalPages) pages.add(currentPage + 1);

  return Array.from(pages).sort((a, b) => a - b);
};

export const Pagination = ({
  currentPage,
  totalPages: totalPagesProp,
  totalItems,
  pageSize,
  onPageChange,
  className,
  isLoading = false,
  itemLabel = "items",
}: PaginationProps) => {
  const totalPages =
    totalPagesProp ??
    (totalItems && pageSize ? Math.ceil(totalItems / pageSize) : 0);

  if (totalPages <= 1) return null;

  const safePage = Math.min(Math.max(currentPage, 1), totalPages);
  const showSummary = totalItems !== undefined && pageSize !== undefined;
  const startItem = showSummary ? (safePage - 1) * pageSize + 1 : 0;
  const endItem = showSummary
    ? Math.min(safePage * pageSize, totalItems)
    : 0;
  const pageNumbers = getPageNumbers(safePage, totalPages);
  const goToPage = (page: number) => {
    if (isLoading || page < 1 || page > totalPages || page === safePage) return;
    onPageChange(page);
  };

  return (
    <nav
      className={clsx(
        "flex flex-col gap-4 border-t border-gray-100 pt-5 md:flex-row md:items-center md:justify-between",
        className,
      )}
      aria-label="Pagination"
    >
      {showSummary ? (
        <p className="text-sm text-gray-500">
          Showing{" "}
          <span className="font-semibold text-black">{startItem}</span> to{" "}
          <span className="font-semibold text-black">{endItem}</span> of{" "}
          <span className="font-semibold text-black">{totalItems}</span>{" "}
          {itemLabel}
        </p>
      ) : (
        <p className="text-sm text-gray-500">
          Page <span className="font-semibold text-black">{safePage}</span> of{" "}
          <span className="font-semibold text-black">{totalPages}</span>
        </p>
      )}

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => goToPage(safePage - 1)}
          disabled={safePage === 1 || isLoading}
          className="inline-flex h-10 items-center gap-2 rounded-lg border border-gray-200 px-3 text-sm font-semibold text-gray-600 transition hover:border-[#0F93A5] hover:text-[#0F93A5] disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeft className="h-4 w-4" />
          Prev
        </button>

        <div className="flex items-center gap-2">
          {pageNumbers.map((page, index) => {
            const previousPage = pageNumbers[index - 1];
            const hasGap = previousPage && page - previousPage > 1;

            return (
              <div key={page} className="flex items-center gap-2">
                {hasGap && <span className="text-sm text-gray-400">...</span>}
                <button
                  type="button"
                  onClick={() => goToPage(page)}
                  className={clsx(
                    "h-10 min-w-10 rounded-lg border px-3 text-sm font-semibold transition",
                    safePage === page
                      ? "border-[#0F93A5] bg-[#E6F6F8] text-[#0F93A5]"
                      : "border-gray-200 text-gray-600 hover:border-[#0F93A5] hover:text-[#0F93A5]",
                  )}
                  disabled={isLoading}
                  aria-current={safePage === page ? "page" : undefined}
                >
                  {page}
                </button>
              </div>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => goToPage(safePage + 1)}
          disabled={safePage === totalPages || isLoading}
          className="inline-flex h-10 items-center gap-2 rounded-lg border border-gray-200 px-3 text-sm font-semibold text-gray-600 transition hover:border-[#0F93A5] hover:text-[#0F93A5] disabled:cursor-not-allowed disabled:opacity-40"
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </nav>
  );
};

import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react"
import "./Pagination.css"
import { useTranslation } from "react-i18next" // Import useTranslation

const Pagination = ({ currentPage, totalPages, onPageChange, itemsPerPage = 5 }) => {
  const { t } = useTranslation("pagination") // Initialize useTranslation

  const getVisiblePages = () => {
    const pages = []
    const showEllipsis = totalPages > 7

    if (!showEllipsis) {
      // Show all pages if 7 or fewer
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // Show first page
      pages.push(1)

      if (currentPage <= 4) {
        // Show pages 2, 3, 4, 5, then ellipsis, then last page
        for (let i = 2; i <= Math.min(5, totalPages - 1); i++) {
          pages.push(i)
        }
        if (totalPages > 5) {
          pages.push("ellipsis")
          pages.push(totalPages)
        }
      } else if (currentPage >= totalPages - 3) {
        // Show first page, ellipsis, then last 4 pages
        pages.push("ellipsis")
        for (let i = Math.max(2, totalPages - 4); i <= totalPages; i++) {
          pages.push(i)
        }
      } else {
        // Show first page, ellipsis, current-1, current, current+1, ellipsis, last page
        pages.push("ellipsis")
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i)
        }
        pages.push("ellipsis")
        pages.push(totalPages)
      }
    }

    return pages
  }

  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1)
    }
  }

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1)
    }
  }

  const handlePageClick = (page) => {
    if (typeof page === "number" && page !== currentPage) {
      onPageChange(page)
    }
  }

  if (totalPages <= 1) return null

  const visiblePages = getVisiblePages()

  return (
    <div className="pagination-container">
      <nav aria-label={t("paginationNavigation")}>
        <ul className="pagination">
          {/* Previous Button */}
          <li className={`pagination-item ${currentPage === 1 ? "disabled" : ""}`}>
            <button
              className="pagination-button"
              onClick={handlePrevious}
              disabled={currentPage === 1}
              aria-label={t("previousPage")}
            >
              <ChevronLeft size={18} />
            </button>
          </li>

          {/* Page Numbers */}
          {visiblePages.map((page, index) => (
            <li key={index} className="pagination-item">
              {page === "ellipsis" ? (
                <span className="pagination-ellipsis">
                  <MoreHorizontal size={18} />
                </span>
              ) : (
                <button
                  className={`pagination-button ${page === currentPage ? "active" : ""}`}
                  onClick={() => handlePageClick(page)}
                  aria-label={t("goToPage", { pageNumber: page })}
                  aria-current={page === currentPage ? "page" : undefined}
                >
                  {page}
                </button>
              )}
            </li>
          ))}

          {/* Next Button */}
          <li className={`pagination-item ${currentPage === totalPages ? "disabled" : ""}`}>
            <button
              className="pagination-button"
              onClick={handleNext}
              disabled={currentPage === totalPages}
              aria-label={t("nextPage")}
            >
              <ChevronRight size={18} />
            </button>
          </li>
        </ul>
      </nav>
    </div>
  )
}

export default Pagination
import { useState } from "react"
import { Row, Col, Form } from "react-bootstrap"
import { Search } from "lucide-react"
import "./SearchFilter.css"
import { useTranslation } from "react-i18next" // Import useTranslation

const SearchFilter = ({
  searchTerm = "",
  selectedAgeGroup = "",
  selectedTopic = "",
  selectedDuration = "",
  selectedType = "",
  selectedStatus = "",
  onSearchChange,
  onAgeGroupChange,
  onDurationChange,
  onTypeChange,
  onStatusChange,
  onSearch,
  ageGroupOptions = [],
  durationOptions = [],
  typeOptions = [],
  statusOptions = [],
  placeholder = "", // Placeholder will be handled by translation
  className = "",
  filterFor = ""
}) => {
  const { t } = useTranslation("searchFilter"); // Initialize useTranslation
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch({
        searchTerm: localSearchTerm,
        selectedAgeGroup,
        selectedTopic,
        selectedDuration,
        selectedType,
        selectedStatus,
      });
    }
  };

  const handleSearchInputChange = (e) => {
    const value = e.target.value;
    setLocalSearchTerm(value);
    if (onSearchChange) {
      onSearchChange(value);
    }
  };

  return (
    <div className={`search-filter-container ${className}`}>
      <Form onSubmit={handleSearchSubmit}>
        <Row className="mb-4">
          <Col md={12}>
            <div className="search-input-wrapper position-relative">
              <Search className="search-icon position-absolute" size={20} />
              <Form.Control
                type="text"
                placeholder={t("searchPlaceholder")}
                value={localSearchTerm}
                onChange={handleSearchInputChange}
                className="search-input ps-5"
                size="lg"
              />
            </div>
          </Col>
        </Row>

        <Row className="mb-4">
          {(filterFor === "blogs" || filterFor === "courses" || filterFor === "events") &&
            ageGroupOptions.length > 0 && (
              <Col md={4} className="mb-3 mb-md-0">
                <Form.Select
                  value={selectedAgeGroup}
                  onChange={(e) =>
                    onAgeGroupChange && onAgeGroupChange(e.target.value)
                  }
                  size="lg"
                  className="filter-select"
                >
                  {(!selectedAgeGroup || selectedAgeGroup === "__default__") && (
                    <option value="">{t("chooseAgeGroup")}</option>
                  )}
                  {ageGroupOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Form.Select>
              </Col>
            )}


          {(filterFor === "blogs" || filterFor === "courses" || filterFor === "events") &&
            statusOptions.length > 0 && (
              <Col md={4} className="mb-3 mb-md-0">
                <Form.Select
                  value={selectedStatus}
                  onChange={(e) =>
                    onStatusChange && onStatusChange(e.target.value)
                  }
                  size="lg"
                  className="filter-select"
                >
                  {(!selectedStatus || selectedStatus === "__default__") && (
                    <option value="">{t("chooseStatus")}</option>
                  )}
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Form.Select>
              </Col>
            )}

          {(filterFor === "blogs" || filterFor === "events") &&
            typeOptions.length > 0 && (
              <Col md={4} className="mb-3 mb-md-0">
                <Form.Select
                  value={selectedType}
                  onChange={(e) => onTypeChange && onTypeChange(e.target.value)}
                  size="lg"
                  className="filter-select"
                >
                  <option value="">{t("chooseType")}</option>
                  {typeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {t(`typeOptions.${option.value}`, option.label)}
                    </option>
                  ))}
                </Form.Select>
              </Col>
            )}

          {filterFor === "courses" && durationOptions.length > 0 && (
            <Col md={4}>
              <Form.Select
                value={selectedDuration}
                onChange={(e) =>
                  onDurationChange && onDurationChange(e.target.value)
                }
                size="lg"
                className="filter-select"
              >
                {/* Chỉ render option mặc định nếu selectedDuration là "" hoặc "__default__" và KHÔNG có option "All Durations" */}
                {(!selectedDuration || selectedDuration === "__default__") &&
                  !durationOptions.some(
                    (opt) => opt.value === selectedDuration
                  ) && <option value="">{t("duration")}</option>}
                {durationOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Form.Select>
            </Col>
          )}
        </Row>
      </Form>
    </div>
  );
};

export default SearchFilter;

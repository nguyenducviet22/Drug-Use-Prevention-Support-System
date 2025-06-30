import { useState } from "react"
import { Row, Col, Form, Button } from "react-bootstrap"
import { Search } from "lucide-react"
import "./SearchFilter.css"
import { useTranslation } from "react-i18next" // Import useTranslation

const SearchFilter = ({
  searchTerm = "",
  selectedAgeGroup = "",
  selectedTopic = "",
  selectedDuration = "",
  selectedType = "",
  onSearchChange,
  onAgeGroupChange,
  onTopicChange,
  onDurationChange,
  onTypeChange,
  onSearch,
  ageGroupOptions = [],
  topicOptions = [],
  durationOptions = [],
  typeOptions = [],
  placeholder = "", // Placeholder will be handled by translation
  className = "",
}) => {
  const { t } = useTranslation("searchFilter") // Initialize useTranslation
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm)

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch({
        searchTerm: localSearchTerm,
        selectedAgeGroup,
        selectedTopic,
        selectedDuration,
        selectedType,
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
          <Col md={4} className="mb-3 mb-md-0">
            <Form.Select
              value={selectedAgeGroup}
              onChange={(e) =>
                onAgeGroupChange && onAgeGroupChange(e.target.value)
              }
              size="lg"
              className="filter-select"
            >
              <option value="">{t("chooseAgeGroup")}</option>
              {ageGroupOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {/* Assuming option.label will be translated externally or is a direct display string */}
                  {t(`ageGroupOptions.${option.value}`, option.label)}
                </option>
              ))}
            </Form.Select>
          </Col>

          {/* Uncomment and translate if topic filter is enabled */}
          {/* <Col md={4} className="mb-3 mb-md-0">
            <Form.Select
              value={selectedTopic}
              onChange={(e) => onTopicChange && onTopicChange(e.target.value)}
              size="lg"
              className="filter-select"
            >
              <option value="">{t("chooseTopic")}</option>
              {topicOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {t(`topicOptions.${option.value}`, option.label)}
                </option>
              ))}
            </Form.Select>
          </Col> */}

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

          <Col md={4}>
            <Form.Select
              value={selectedDuration}
              onChange={(e) =>
                onDurationChange && onDurationChange(e.target.value)
              }
              size="lg"
              className="filter-select"
            >
              <option value="">{t("duration")}</option>
              {durationOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {t(`durationOptions.${option.value}`, option.label)}
                </option>
              ))}
            </Form.Select>
          </Col>
        </Row>

        {/* Uncomment and translate if a dedicated filter button is needed */}
        {/* <div className="text-center">
          <Button type="submit" variant="primary" size="lg" className="px-5 search-button">
            {t("filterButton")}
          </Button>
        </div> */}
      </Form>
    </div>
  );
};

export default SearchFilter

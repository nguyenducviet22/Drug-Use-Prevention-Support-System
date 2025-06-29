import { useState } from "react";
import { Row, Col, Form, Button } from "react-bootstrap";
import { Search } from "lucide-react";
import "./SearchFilter.css";

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
  placeholder = "Search",
  className = "",
}) => {
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
                placeholder={placeholder}
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
              <option value="__default__" disabled hidden>
                Choose Age Group
              </option>
              {ageGroupOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Form.Select>
          </Col>

          {/* <Col md={4} className="mb-3 mb-md-0">
            <Form.Select
              value={selectedTopic}
              onChange={(e) => onTopicChange && onTopicChange(e.target.value)}
              size="lg"
              className="filter-select"
            >
              <option value="">Choose Topic</option>
              {topicOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
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
              <option value="">Choose Type</option>
              {typeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
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
              <option value="__default__" disabled hidden>
                Duration
              </option>
              {durationOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Form.Select>
          </Col>
        </Row>

        {/* <div className="text-center">
          <Button type="submit" variant="primary" size="lg" className="px-5 search-button">
            Filter
          </Button>
        </div> */}
      </Form>
    </div>
  );
};

export default SearchFilter;

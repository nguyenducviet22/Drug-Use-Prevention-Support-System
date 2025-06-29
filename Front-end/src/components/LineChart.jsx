import React, { useState, useMemo, useEffect } from 'react';
import { Card, Row, Col, ButtonGroup, Button, Form } from 'react-bootstrap';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import useFetch from '../hooks/useFetch'
import { da, se } from 'date-fns/locale';

// Đăng ký các thành phần cần thiết cho Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const lineConfigs = {
  totalMembers: { color: '#3b82f6', name: 'Total Members' },
  staffMembers: { color: '#10b981', name: 'Staff Members' },
  consultants: { color: '#8b5cf6', name: 'Consultants' },
  monthlyConsultations: { color: '#f59e0b', name: 'Monthly Consultations' },
  activeCourses: { color: '#ef4444', name: 'Active Courses' },
  blogs: { color: '#06b6d4', name: 'Blogs' },
  events: { color: '#84cc16', name: 'Events' },
  courses: { color: '#f97316', name: 'Courses' }
};

const LineChart = () => {
  // State để lưu dữ liệu đã lọc sẽ được hiển thị trên biểu đồ
  const [filteredData, setFilteredData] = useState([]);
  const [activeFilter, setActiveFilter] = useState('THIS_YEAR');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const { post: postData } = useFetch()

  useEffect(() => {
    const request = {
      filterType: activeFilter,
      startDate,
      endDate
    }
    console.log(request);
    const fetchData = async () => {
      try {
        const resData = await postData(request, {}, 'http://localhost:8080/api/report')
        const processedData = resData.map(item => ({
          ...item,
          date: new Date(item.date) // Convert the date string to a Date object
        }));
        setFilteredData(processedData);
      } catch (error) {
        console.error("Fetch error in LineChart:", error);
      }
    }

    fetchData()
  }, [postData, activeFilter, startDate, endDate])
  console.log(filteredData);

  const handleFilterChange = (filterType) => {
    setActiveFilter(filterType);
  };

  const handleCustomDateFilter = () => {
    if (!startDate || !endDate) {
      alert("Vui lòng chọn cả ngày bắt đầu và kết thúc.");
      return;
    }
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start > end) {
      alert("Ngày bắt đầu không thể sau ngày kết thúc.");
      return;
    }

    const data = filteredData.filter(d => d.date >= start && d.date <= end);
    setFilteredData(data);
    setActiveFilter('CUSTOM');
  }

  // Sử dụng useMemo để chỉ tính toán lại dữ liệu biểu đồ khi `filteredData` thay đổi.
  // Đây là một kỹ thuật tối ưu hóa quan trọng.
  const chartData = useMemo(() => {
    return {
      labels: filteredData.map(d => d.month),
      datasets: Object.entries(lineConfigs).map(([key, config]) => ({
        label: config.name,
        data: filteredData.map(d => d[key]),
        borderColor: config.color,
        backgroundColor: config.color,
        pointBackgroundColor: config.color,
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: config.color,
      })),
    };
  }, [filteredData]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom', labels: { usePointStyle: true, boxWidth: 8, padding: 20 } },
      title: { display: true, text: 'Interactive System Metrics', font: { size: 18, weight: 'bold' }, padding: { top: 10, bottom: 20 }, align: 'start' },
      tooltip: { mode: 'index', intersect: false, backgroundColor: '#fff', titleColor: '#333', bodyColor: '#666', borderColor: '#ddd', borderWidth: 1 },
    },
    scales: {
      y: { beginAtZero: true, grid: { color: '#e9ecef', borderDash: [2, 2] }, ticks: { color: '#6c757d' } },
      x: { grid: { display: false }, ticks: { color: '#495057', font: { weight: '500' } } },
    },
    interaction: { mode: 'index', intersect: false },
    elements: { line: { tension: 0.4 }, point: { radius: 5, hoverRadius: 7, borderWidth: 2 } }
  };

  // Tạo danh sách các tháng duy nhất để điền vào dropdown
  const uniqueMonths = [...new Map(filteredData.map(item => [item.month, item])).values()];

  return (
    <Card className="chart-container h-100">
      <Card.Body className="p-4">
        {/* === FILTER AREA === */}
        <div className="mb-4">
          <h5 className="mb-3">Time Filter</h5>

          {/* Custom range filter */}
          <Row className="g-2 mb-3 align-items-end">
            <Col md={4}>
              <Form.Select value={startDate} onChange={e => setStartDate(e.target.value)}>
                <option value="">Select start month</option>
                {uniqueMonths.map(d => <option key={d.month} value={d.date.toISOString()}>{d.month}</option>)}
              </Form.Select>
            </Col>
            <Col md={4}>
              <Form.Select value={endDate} onChange={e => setEndDate(e.target.value)}>
                <option value="">Select end month</option>
                {uniqueMonths.map(d => <option key={d.month} value={d.date.toISOString()}>{d.month}</option>)}
              </Form.Select>
            </Col>
            <Col md={4} className="d-grid">
              <Button variant={activeFilter === 'CUSTOM' ? 'primary' : 'outline-primary'} onClick={handleCustomDateFilter}>Apply</Button>
            </Col>
          </Row>

          {/* Quick filter */}
          <Row>
            <Col>
              <span className="me-2 fw-medium">Quick Filter (This Year):</span>
              <ButtonGroup size="sm" className="me-3 mb-2">
                <Button variant={activeFilter === 'Q1' ? 'primary' : 'outline-secondary'} onClick={() => handleFilterChange('Q1')}>Q1</Button>
                <Button variant={activeFilter === 'Q2' ? 'primary' : 'outline-secondary'} onClick={() => handleFilterChange('Q2')}>Q2</Button>
                <Button variant={activeFilter === 'Q3' ? 'primary' : 'outline-secondary'} onClick={() => handleFilterChange('Q3')}>Q3</Button>
                <Button variant={activeFilter === 'Q4' ? 'primary' : 'outline-secondary'} onClick={() => handleFilterChange('Q4')}>Q4</Button>
              </ButtonGroup>
              <ButtonGroup size="sm" className="me-3 mb-2">
                <Button variant={activeFilter === 'FIRST_HALF' ? 'primary' : 'outline-secondary'} onClick={() => handleFilterChange('FIRST_HALF')}>First Half</Button>
                <Button variant={activeFilter === 'LAST_HALF' ? 'primary' : 'outline-secondary'} onClick={() => handleFilterChange('LAST_HALF')}>Second Half</Button>
              </ButtonGroup>
              <ButtonGroup size="sm" className="mb-2">
                <Button variant={activeFilter === 'THIS_YEAR' ? 'primary' : 'outline-secondary'} onClick={() => handleFilterChange('THIS_YEAR')}>This Year</Button>
                <Button variant={activeFilter === 'ALL' ? 'primary' : 'outline-secondary'} onClick={() => handleFilterChange('ALL')}>All Time</Button>
              </ButtonGroup>
            </Col>
          </Row>
        </div>

        <hr />

        {/* === CHART AREA === */}
        <div style={{ height: '320px' }}>
          <Line options={chartOptions} data={chartData} />
        </div>
      </Card.Body>
    </Card>
  );
};

export default LineChart;
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
import useFetch from '../../hooks/useFetch';
import { useTranslation } from 'react-i18next'; // Import useTranslation

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

const LineChart = () => {
  const { t } = useTranslation("lineChart"); // Use the new namespace

  const lineConfigs = useMemo(() => ({
    totalMembers: { color: '#3b82f6', name: t('totalMembers') },
    staffMembers: { color: '#10b981', name: t('staffMembers') },
    consultants: { color: '#8b5cf6', name: t('consultants') },
    monthlyConsultations: { color: '#f59e0b', name: t('monthlyConsultations') },
    activeCourses: { color: '#ef4444', name: t('activeCourses') },
    blogs: { color: '#06b6d4', name: t('blogs') },
    events: { color: '#84cc16', name: t('events') },
    courses: { color: '#f97316', name: t('courses') }
  }), [t]);

  // State để lưu dữ liệu đã lọc sẽ được hiển thị trên biểu đồ
  const [filteredData, setFilteredData] = useState([]);
  const [activeFilter, setActiveFilter] = useState('THIS_YEAR');
  const [startedMonth, setStartedMonth] = useState('');
  const [endedMonth, setEndedMonth] = useState('');
  const { post: postData } = useFetch();

  useEffect(() => {
    const request = {
      filterType: activeFilter,
      startedMonth,
      endedMonth
    };
    console.log(request);
    const fetchData = async () => {
      try {
        const resData = await postData(request, {}, 'http://localhost:8080/api/report');
        const processedData = resData.map(item => ({
          ...item,
          date: new Date(item.date) // Convert the date string to a Date object
        }));
        setFilteredData(processedData);
      } catch (error) {
        console.error("Fetch error in LineChart:", error);
      }
    };

    fetchData();
  }, [postData, activeFilter, startedMonth, endedMonth]);
  console.log(filteredData);

  const handleFilterChange = (filterType) => {
    setActiveFilter(filterType);
  };

  const handleCustomDateFilter = () => {
    if (!startedMonth || !endedMonth) {
      alert(t('alertSelectDates'));
      return;
    }
    const start = new Date(startedMonth);
    const end = new Date(endedMonth);

    if (start > end) {
      alert(t('alertStartDateAfterEndDate'));
      return;
    }
    // The filtering logic for 'CUSTOM' type should be handled by the backend
    // when setting the activeFilter to 'CUSTOM' and passing the dates.
    // For now, we'll just set the active filter and let the useEffect handle the fetch.
    setActiveFilter('CUSTOM');
  };

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
  }, [filteredData, lineConfigs]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom', labels: { usePointStyle: true, boxWidth: 8, padding: 20 } },
      title: { display: true, text: t('interactiveSystemMetrics'), font: { size: 18, weight: 'bold' }, padding: { top: 10, bottom: 20 }, align: 'start' },
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
  const uniqueMonths = useMemo(() => {
    const months = [...new Map(filteredData.map(item => [item.month, item])).values()];
    // Sort months to ensure chronological order in dropdown
    return months.sort((a, b) => a.date - b.date);
  }, [filteredData]);

  return (
    <Card className="chart-container h-100">
      <Card.Body className="p-4">
        {/* === FILTER AREA === */}
        <div className="mb-4">
          <h5 className="mb-3">{t('timeFilter')}</h5>

          {/* Custom range filter */}
          <Row className="g-2 mb-3 align-items-end">
            <Col md={4}>
              <Form.Select value={startedMonth} onChange={e => setStartedMonth(e.target.value)}>
                <option value="">{t('selectStartMonth')}</option>
                {uniqueMonths.map(d => <option key={d.month} value={d.date.toISOString()}>{d.month}</option>)}
              </Form.Select>
            </Col>
            <Col md={4}>
              <Form.Select value={endedMonth} onChange={e => setEndedMonth(e.target.value)}>
                <option value="">{t('selectEndMonth')}</option>
                {uniqueMonths.map(d => <option key={d.month} value={d.date.toISOString()}>{d.month}</option>)}
              </Form.Select>
            </Col>
            <Col md={4} className="d-grid">
              <Button variant={activeFilter === 'CUSTOM' ? 'primary' : 'outline-primary'} onClick={handleCustomDateFilter}>{t('apply')}</Button>
            </Col>
          </Row>

          {/* Quick filter */}
          <Row>
            <Col>
              <span className="me-2 fw-medium">{t('quickFilter')}</span>
              <ButtonGroup size="sm" className="me-3 mb-2">
                <Button variant={activeFilter === 'Q1' ? 'primary' : 'outline-secondary'} onClick={() => handleFilterChange('Q1')}>{t('q1')}</Button>
                <Button variant={activeFilter === 'Q2' ? 'primary' : 'outline-secondary'} onClick={() => handleFilterChange('Q2')}>{t('q2')}</Button>
                <Button variant={activeFilter === 'Q3' ? 'primary' : 'outline-secondary'} onClick={() => handleFilterChange('Q3')}>{t('q3')}</Button>
                <Button variant={activeFilter === 'Q4' ? 'primary' : 'outline-secondary'} onClick={() => handleFilterChange('Q4')}>{t('q4')}</Button>
              </ButtonGroup>
              <ButtonGroup size="sm" className="me-3 mb-2">
                <Button variant={activeFilter === 'FIRST_HALF' ? 'primary' : 'outline-secondary'} onClick={() => handleFilterChange('FIRST_HALF')}>{t('firstHalf')}</Button>
                <Button variant={activeFilter === 'LAST_HALF' ? 'primary' : 'outline-secondary'} onClick={() => handleFilterChange('LAST_HALF')}>{t('secondHalf')}</Button>
              </ButtonGroup>
              <ButtonGroup size="sm" className="mb-2">
                <Button variant={activeFilter === 'THIS_YEAR' ? 'primary' : 'outline-secondary'} onClick={() => handleFilterChange('THIS_YEAR')}>{t('thisYear')}</Button>
                <Button variant={activeFilter === 'ALL' ? 'primary' : 'outline-secondary'} onClick={() => handleFilterChange('ALL')}>{t('allTime')}</Button>
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
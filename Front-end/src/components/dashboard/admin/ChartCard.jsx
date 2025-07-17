import React from "react";
import { Card } from "react-bootstrap";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  BarElement,
  ArcElement,
  Filler,
} from "chart.js";
import { Line, Bar, Doughnut } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const ChartCard = ({ title, type, data: externalData }) => {
  const generateLineData = () => ({
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"],
    datasets: [
      {
        label: "Page Views",
        data: [1200, 1900, 3000, 5000, 4200, 3800, 4500],
        borderColor: "#0066CC",
        backgroundColor: "rgba(0, 102, 204, 0.1)",
        tension: 0.4,
        fill: true,
        pointBackgroundColor: "#0066CC",
        pointBorderColor: "#ffffff",
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
      },
    ],
  });

  const generateBarData = () => ({
    labels: externalData?.labels || [],
    datasets: [
      {
        label: "Assessment Count",
        data: externalData?.data || [],
        backgroundColor: [
          "#0066CC",
          "#28A745",
          "#FFC107",
          "#DC3545",
          "#6C757D",
        ],
        borderRadius: 8,
        borderSkipped: false,
      },
    ],
  });

  const generateDoughnutData = () => {
    if (externalData) {
      return {
        labels: externalData.labels,
        datasets: [
          {
            data: externalData.data,
            backgroundColor: [
              "#0066CC",
              "#28A745",
              "#FFC107",
              "#DC3545",
              "#6C757D",
            ],
            borderWidth: 0,
            hoverOffset: 4,
          },
        ],
      };
    }
    // fallback nếu không có data
    return {
      labels: ["Students", "College", "Parents", "Teachers", "Others"],
      datasets: [
        {
          data: [35, 25, 20, 15, 5],
          backgroundColor: [
            "#0066CC",
            "#28A745",
            "#FFC107",
            "#DC3545",
            "#6C757D",
          ],
          borderWidth: 0,
          hoverOffset: 4,
        },
      ],
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          padding: 20,
          usePointStyle: true,
          font: {
            size: 12,
            family: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
          },
        },
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        titleColor: "#ffffff",
        bodyColor: "#ffffff",
        borderColor: "#0066CC",
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
      },
    },
    scales:
      type !== "doughnut"
        ? {
            y: {
              beginAtZero: true,
              grid: {
                color: "rgba(0, 0, 0, 0.1)",
              },
              ticks: {
                font: {
                  size: 11,
                },
              },
            },
            x: {
              grid: {
                display: false,
              },
              ticks: {
                font: {
                  size: 11,
                },
              },
            },
          }
        : {},
  };

  const renderChart = () => {
    switch (type) {
      case "line":
        return <Line data={generateLineData()} options={chartOptions} />;
      case "bar":
        return <Bar data={generateBarData()} options={chartOptions} />;
      case "doughnut":
        return (
          <Doughnut data={generateDoughnutData()} options={chartOptions} />
        );
      default:
        return <Line data={generateLineData()} options={chartOptions} />;
    }
  };

  return (
    <Card className="chart-card">
      <Card.Header className="chart-header">
        <h6 className="chart-title">{title}</h6>
      </Card.Header>
      <Card.Body className="chart-body">
        <div className="chart-container">{renderChart()}</div>
      </Card.Body>
    </Card>
  );
};

export default ChartCard;

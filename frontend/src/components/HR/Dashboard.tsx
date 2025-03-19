import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import Chart from "react-apexcharts";
import "./styles.css";

interface DashboardData {
  openJobCount: number;
  statusBreakdown: Record<string, number>;
  fulfilledByMonth: { month: string; count: number }[];
}

const DashboardPage: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { username, usertype, client_id } = location.state || {};

  useEffect(() => {
    console.log("Dashboard received:", { username, usertype, client_id });
    axios.get("http://127.0.0.1:8000/dashboard/")
      .then(response => {
        const { open_job, job_status, fulfilledByMonth } = response.data;
        const formattedData: DashboardData = {
          openJobCount: open_job ?? 0,
          statusBreakdown: job_status || {},
          fulfilledByMonth: fulfilledByMonth || []
        };
        setDashboardData(formattedData);
      })
      .catch(error => console.error("Error fetching dashboard data:", error));
  }, []);

  if (!dashboardData) return <p>Loading Dashboard...</p>;

  return (
    <div className="dashboard-container">
      {/* Navigation Bar */}
      <div className="top-nav">
        <h1>HR Track Solution Dashboard</h1>
        <div className="nav-buttons">
          <button onClick={() => navigate("/hr")}>HR</button>
          <button onClick={() => navigate("/client-page", { state: { username, client_id, usertype } })}>Client Jobs</button>
          <button onClick={() => navigate("/requirements", { state: { username, client_id, usertype }})}>Requirements</button>
          <button onClick={() => navigate("/candidates-submitted", { state: { username, client_id, usertype } })}>Candidates</button>
          <button onClick={() => navigate("/about")}>About</button>
          <button onClick={() => navigate("/contact")}>Contact</button>
          <button className="logout-button" onClick={() => navigate("/login")}>Logout</button>
        </div>
      </div>

      {/* Main Dashboard Content */}
      <div className="dashboard-content">
        {/* Open Jobs */}
        <div className="dashboard-card">
          <h2>Open Jobs</h2>
          <p className="count">{dashboardData.openJobCount}</p>
        </div>

        {/* Job Status Breakdown */}
        <div className="dashboard-card">
          <h2>Job Status Breakdown</h2>
          <ul>
            {Object.entries(dashboardData.statusBreakdown).map(([status, count]) => (
              <li key={status}>{status}: {count}</li>
            ))}
          </ul>
        </div>

        {/* Enhanced Monthly Fulfillment Chart */}
        <div className="dashboard-card chart-container">
          <h2>Fulfilled Jobs (Monthly)</h2>
          <Chart
            options={{
              chart: { id: "fulfilled-chart", toolbar: { show: false } },
              xaxis: { categories: dashboardData.fulfilledByMonth.map(d => d.month) },
              dataLabels: { enabled: true },
              fill: { type: "gradient", gradient: { shadeIntensity: 0.8, opacityFrom: 0.7, opacityTo: 0.9 } },
              tooltip: { enabled: true }
            }}
            series={[{
              name: "Jobs Fulfilled",
              data: dashboardData.fulfilledByMonth.map(d => d.count),
            }]}
            type="bar"
            width="600"
          />
        </div>
      </div>

      {/* About TechCorp */}
      <div className="about-section">
        <h2>About HR Track Solution</h2>
        <p>
          HR Track Solution pvt. ltd is a cutting-edge platform where HR professionals and clients collaborate seamlessly. 
          Clients post their hiring requirements, and HR finds the best candidates to match the job roles. 
          The platform streamlines the entire hiring process, making recruitment efficient and data-driven.
        </p>
      </div>

      {/* Contact Section */}
      <div className="contact-section">
        <h2>Contact Us</h2>
        <p>Email: support@hrtrack.com</p>
        <p>Phone: +1-800-787878</p>
        <p>Address: 123 Avenue, Bengaluru, India</p>
      </div>
    </div>
  );
};

export default DashboardPage;

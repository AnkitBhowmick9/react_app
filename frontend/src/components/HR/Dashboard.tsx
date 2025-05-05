import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import Chart from "react-apexcharts";
import logo from "../Client/HR_track_Logo_Cropped.jpg";
import "./DashboardPage.css"; // Use updated CSS here

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

  if (!dashboardData) return <p className="loading">Loading Dashboard...</p>;

  return (
    <div className="dashboard-wrapper">
      {/* Header */}
      <header className="header">
        <div className="header-left">
          <img src={logo} alt="Logo" className="logo" />
          <h1 className="app-title">HR Track Solution</h1>
        </div>
        <button className="logout-btn" onClick={() => navigate("/login")}>Logout</button>
      </header>

      {/* Navigation */}
      <nav className="nav-bar">
        <button onClick={() => navigate("/hr-company-docs")}>Documents</button>
        <button onClick={() => navigate("/client-page", { state: { username, client_id, usertype } })}>Client Jobs</button>
        <button onClick={() => navigate("/requirements-page", { state: { username, client_id, usertype } })}>Requirements</button>
        <button onClick={() => navigate("/candidates-submitted", { state: { username, client_id, usertype } })}>Candidates</button>
        <button onClick={() => document.getElementById("about")?.scrollIntoView({ behavior: "smooth" })}>About</button>
        <button onClick={() => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" })}>Contact</button>
      </nav>

      {/* Main Dashboard */}
      <main className="dashboard-main">
        <section className="card highlight">
          <h2>Open Jobs</h2>
          <p className="count">{dashboardData.openJobCount}</p>
        </section>

        <section className="card">
          <h2>Job Status Breakdown</h2>
          <ul className="status-list">
            {Object.entries(dashboardData.statusBreakdown).map(([status, count]) => (
              <li key={status}><strong>{status}</strong>: {count}</li>
            ))}
          </ul>
        </section>

        <section className="card">
          <h2>Fulfilled Jobs (Monthly)</h2>
          <Chart
            options={{
              chart: { id: "fulfilled-chart", toolbar: { show: false } },
              xaxis: { categories: dashboardData.fulfilledByMonth.map(d => d.month) },
              dataLabels: { enabled: true },
              fill: {
                type: "gradient",
                gradient: { shadeIntensity: 0.8, opacityFrom: 0.7, opacityTo: 0.9 }
              },
              tooltip: { enabled: true }
            }}
            series={[{
              name: "Jobs Fulfilled",
              data: dashboardData.fulfilledByMonth.map(d => d.count),
            }]}
            type="bar"
            width="600"
          />
        </section>
      </main>

      {/* Footer Sections */}
      <footer className="footer">
        <div className="info-grid">
          <div id="about">
            <h3>About Us</h3>
            <p>
              HR Track Solution is a powerful platform where HRs and clients collaborate to streamline hiring. 
              Our mission is to make recruitment smart, fast, and data-driven.
            </p>
          </div>
          <div id="contact">
            <h3>Contact Us</h3>
            <p>Email: support@hrtrack.com</p>
            <p>Phone: +1-800-787878</p>
            <p>Address: 123 Avenue, Bengaluru, India</p>
          </div>
        </div>
        <p className="copyright">
          &copy; 2025 HR Track Solution. All rights reserved.
        </p>
      </footer>
    </div>
  );
};

export default DashboardPage;

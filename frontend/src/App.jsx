import React, { useState, useEffect } from 'react';

// API Base URL config (will be reverse-proxied by Nginx in prod, or handled by Vite proxy in dev)
const API_BASE = '/api';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState({
    summary: { totalStudents: 0, avgGPA: 0, totalCourses: 0 },
    departments: []
  });
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [health, setHealth] = useState(null);
  
  // Modals & Form State
  const [studentModalOpen, setStudentModalOpen] = useState(false);
  const [courseModalOpen, setCourseModalOpen] = useState(false);
  
  const [studentForm, setStudentForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    gpa: '',
    enrollment_date: new Date().toISOString().split('T')[0],
    department_id: ''
  });
  
  const [courseForm, setCourseForm] = useState({
    name: '',
    code: '',
    credits: '3',
    department_id: ''
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Fetch metrics and info
  const fetchAllData = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      // Fetch Stats
      const statsRes = await fetch(`${API_BASE}/stats`);
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      // Fetch Students
      const studentsRes = await fetch(`${API_BASE}/students`);
      if (studentsRes.ok) {
        const studentsData = await studentsRes.json();
        setStudents(studentsData);
      }

      // Fetch Courses
      const coursesRes = await fetch(`${API_BASE}/courses`);
      if (coursesRes.ok) {
        const coursesData = await coursesRes.json();
        setCourses(coursesData);
      }

      // Fetch Departments for dropdown
      const deptsRes = await fetch(`${API_BASE}/departments`);
      if (deptsRes.ok) {
        const deptsData = await deptsRes.json();
        setDepartments(deptsData);
      }

      // Fetch Backend Health status
      const healthRes = await fetch('/health');
      if (healthRes.ok) {
        const healthData = await healthRes.json();
        setHealth(healthData);
      } else {
        setHealth({ status: 'DOWN', database: 'DISCONNECTED' });
      }
    } catch (err) {
      console.error("API Connection Error:", err);
      setErrorMsg("Unable to communicate with the Backend API. Please check if backend services are running.");
      setHealth({ status: 'DOWN', database: 'DISCONNECTED' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
    // Poll health status every 30 seconds
    const interval = setInterval(async () => {
      try {
        const healthRes = await fetch('/health');
        if (healthRes.ok) {
          const healthData = await healthRes.json();
          setHealth(healthData);
        } else {
          setHealth({ status: 'DOWN', database: 'DISCONNECTED' });
        }
      } catch {
        setHealth({ status: 'DOWN', database: 'DISCONNECTED' });
      }
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  // Form Submit Handlers
  const handleStudentSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/students`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(studentForm)
      });
      const data = await res.json();
      if (res.ok) {
        setStudentModalOpen(false);
        setStudentForm({
          first_name: '',
          last_name: '',
          email: '',
          gpa: '',
          enrollment_date: new Date().toISOString().split('T')[0],
          department_id: ''
        });
        fetchAllData();
      } else {
        alert(data.error || "Failed to create student");
      }
    } catch (err) {
      alert("Error submitting form");
    }
  };

  const handleCourseSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/courses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(courseForm)
      });
      const data = await res.json();
      if (res.ok) {
        setCourseModalOpen(false);
        setCourseForm({
          name: '',
          code: '',
          credits: '3',
          department_id: ''
        });
        fetchAllData();
      } else {
        alert(data.error || "Failed to create course");
      }
    } catch (err) {
      alert("Error submitting form");
    }
  };

  const deleteStudent = async (id) => {
    if (!window.confirm("Are you sure you want to delete this student?")) return;
    try {
      const res = await fetch(`${API_BASE}/students/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchAllData();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to delete student");
      }
    } catch (err) {
      alert("Network error");
    }
  };

  const deleteCourse = async (id) => {
    if (!window.confirm("Are you sure you want to delete this course?")) return;
    try {
      const res = await fetch(`${API_BASE}/courses/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchAllData();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to delete course");
      }
    } catch (err) {
      alert("Network error");
    }
  };

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-logo">A</div>
          <span className="brand-name">ACADEMIX</span>
        </div>
        <nav className="menu-list">
          <a className={`menu-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
            <span>📊</span> Dashboard
          </a>
          <a className={`menu-item ${activeTab === 'students' ? 'active' : ''}`} onClick={() => setActiveTab('students')}>
            <span>👨‍🎓</span> Students
          </a>
          <a className={`menu-item ${activeTab === 'courses' ? 'active' : ''}`} onClick={() => setActiveTab('courses')}>
            <span>📚</span> Courses
          </a>
          <a className={`menu-item ${activeTab === 'monitoring' ? 'active' : ''}`} onClick={() => setActiveTab('monitoring')}>
            <span>⚡</span> Monitoring Status
          </a>
        </nav>
      </aside>

      {/* Main Panel Content */}
      <main className="main-content">
        <header className="top-header">
          <div className="page-title">
            <h1>College Management Portal</h1>
            <p>Admin Control Panel & System Statistics</p>
          </div>
          <button className="btn btn-secondary" onClick={fetchAllData} disabled={loading}>
            {loading ? 'Refreshing...' : '🔄 Refresh Dashboard'}
          </button>
        </header>

        {errorMsg && (
          <div style={{ padding: '1rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
            ⚠️ <strong>Connection Warning:</strong> {errorMsg}
          </div>
        )}

        {/* Tab 1: Dashboard */}
        {activeTab === 'dashboard' && (
          <>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-info">
                  <h3>Total Enrolled Students</h3>
                  <div className="value">{stats.summary.totalStudents}</div>
                </div>
                <div className="stat-icon">🎓</div>
              </div>
              <div className="stat-card">
                <div className="stat-info">
                  <h3>Average GPA</h3>
                  <div className="value">{stats.summary.avgGPA}</div>
                </div>
                <div className="stat-icon">⭐️</div>
              </div>
              <div className="stat-card">
                <div className="stat-info">
                  <h3>Total Courses</h3>
                  <div className="value">{stats.summary.totalCourses}</div>
                </div>
                <div className="stat-icon">📖</div>
              </div>
            </div>

            <div className="panel">
              <div className="panel-header">
                <h2 className="panel-title">Department Enrollments</h2>
              </div>
              <div className="chart-container">
                {stats.departments.length === 0 ? (
                  <p style={{ color: 'var(--text-secondary)' }}>No department data available.</p>
                ) : (
                  stats.departments.map((dept) => {
                    const maxStudents = Math.max(...stats.departments.map(d => d.student_count), 1);
                    const percentage = (dept.student_count / maxStudents) * 100;
                    return (
                      <div className="bar-row" key={dept.department_code || dept.name}>
                        <div className="bar-header">
                          <span>{dept.name} ({dept.department_code})</span>
                          <span><strong>{dept.student_count}</strong> students</span>
                        </div>
                        <div className="bar-track">
                          <div className="bar-fill" style={{ width: `${percentage}%` }}></div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </>
        )}

        {/* Tab 2: Student Directory */}
        {activeTab === 'students' && (
          <div className="panel">
            <div className="panel-header">
              <h2 className="panel-title">Student Registry</h2>
              <button className="btn btn-primary" onClick={() => setStudentModalOpen(true)}>
                ➕ Add Student
              </button>
            </div>
            <div className="table-container">
              {students.length === 0 ? (
                <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>No students found.</p>
              ) : (
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Full Name</th>
                      <th>Email</th>
                      <th>GPA</th>
                      <th>Enrollment Date</th>
                      <th>Department</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((student) => (
                      <tr key={student.id}>
                        <td>#{student.id}</td>
                        <td><strong>{student.first_name} {student.last_name}</strong></td>
                        <td>{student.email}</td>
                        <td>
                          <span className={`badge ${student.gpa >= 3.5 ? 'badge-success' : student.gpa >= 3.0 ? 'badge-info' : 'badge-warning'}`}>
                            {student.gpa}
                          </span>
                        </td>
                        <td>{new Date(student.enrollment_date).toLocaleDateString()}</td>
                        <td>{student.department_name || 'Unassigned'}</td>
                        <td>
                          <button className="btn btn-danger" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }} onClick={() => deleteStudent(student.id)}>
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* Tab 3: Course Catalog */}
        {activeTab === 'courses' && (
          <div className="panel">
            <div className="panel-header">
              <h2 className="panel-title">Course Offerings</h2>
              <button className="btn btn-primary" onClick={() => setCourseModalOpen(true)}>
                ➕ Add Course
              </button>
            </div>
            <div className="table-container">
              {courses.length === 0 ? (
                <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>No courses found.</p>
              ) : (
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Course Name</th>
                      <th>Code</th>
                      <th>Credits</th>
                      <th>Department</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {courses.map((course) => (
                      <tr key={course.id}>
                        <td>#{course.id}</td>
                        <td><strong>{course.name}</strong></td>
                        <td><span className="badge badge-info">{course.code}</span></td>
                        <td>{course.credits} Credits</td>
                        <td>{course.department_name || 'Core Program'}</td>
                        <td>
                          <button className="btn btn-danger" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }} onClick={() => deleteCourse(course.id)}>
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* Tab 4: System Monitoring Info */}
        {activeTab === 'monitoring' && (
          <div className="panel">
            <div className="panel-header">
              <h2 className="panel-title">DevOps Observability Dashboard</h2>
            </div>
            <div className="monitoring-grid">
              <div className="stat-card" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '1rem' }}>
                <div className="indicator">
                  <div className={`indicator-pulse ${health && health.status === 'UP' ? 'online' : 'offline'}`}></div>
                  <h3>Backend Application Status</h3>
                </div>
                <div>
                  <p style={{ color: 'var(--text-secondary)' }}>Status: <strong>{health ? health.status : 'DOWN'}</strong></p>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                    Uptime: {health && health.uptime ? `${Math.round(health.uptime)}s` : 'N/A'}
                  </p>
                </div>
              </div>

              <div className="stat-card" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '1rem' }}>
                <div className="indicator">
                  <div className={`indicator-pulse ${health && health.database === 'CONNECTED' ? 'online' : 'offline'}`}></div>
                  <h3>Database Connectivity</h3>
                </div>
                <div>
                  <p style={{ color: 'var(--text-secondary)' }}>MySQL Status: <strong>{health ? health.database : 'DISCONNECTED'}</strong></p>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                    Pool Host: {API_BASE === '/api' ? 'college-db' : 'localhost'}
                  </p>
                </div>
              </div>
            </div>

            <div style={{ marginTop: '2.5rem', padding: '1.5rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>Metrics Scrape Targets</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
                The Prometheus daemon collects metrics from the application endpoints listed below. Click to inspect raw metrics logs:
              </p>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <a href="/metrics" target="_blank" className="btn btn-secondary" style={{ textDecoration: 'none' }}>
                  📈 View Node.js /metrics
                </a>
                <a href="http://localhost:9090" target="_blank" className="btn btn-secondary" style={{ textDecoration: 'none' }}>
                  🔥 Prometheus UI (9090)
                </a>
                <a href="http://localhost:3000" target="_blank" className="btn btn-secondary" style={{ textDecoration: 'none' }}>
                  📉 Grafana Dashboard (3000)
                </a>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Add Student Modal */}
      {studentModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Add Student</h2>
              <button className="close-btn" onClick={() => setStudentModalOpen(false)}>&times;</button>
            </div>
            <form onSubmit={handleStudentSubmit}>
              <div className="form-group">
                <label>First Name</label>
                <input type="text" className="form-control" required value={studentForm.first_name} onChange={(e) => setStudentForm({...studentForm, first_name: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Last Name</label>
                <input type="text" className="form-control" required value={studentForm.last_name} onChange={(e) => setStudentForm({...studentForm, last_name: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" className="form-control" required value={studentForm.email} onChange={(e) => setStudentForm({...studentForm, email: e.target.value})} />
              </div>
              <div className="form-group">
                <label>GPA</label>
                <input type="number" step="0.01" min="0" max="4" className="form-control" placeholder="e.g. 3.85" value={studentForm.gpa} onChange={(e) => setStudentForm({...studentForm, gpa: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Enrollment Date</label>
                <input type="date" className="form-control" required value={studentForm.enrollment_date} onChange={(e) => setStudentForm({...studentForm, enrollment_date: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Department</label>
                <select className="form-control" required value={studentForm.department_id} onChange={(e) => setStudentForm({...studentForm, department_id: e.target.value})}>
                  <option value="">Select Department</option>
                  {departments.map(d => <option key={d.id} value={d.id}>{d.name} ({d.code})</option>)}
                </select>
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setStudentModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Student</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Course Modal */}
      {courseModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Add New Course</h2>
              <button className="close-btn" onClick={() => setCourseModalOpen(false)}>&times;</button>
            </div>
            <form onSubmit={handleCourseSubmit}>
              <div className="form-group">
                <label>Course Name</label>
                <input type="text" className="form-control" placeholder="e.g. Database Systems" required value={courseForm.name} onChange={(e) => setCourseForm({...courseForm, name: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Course Code</label>
                <input type="text" className="form-control" placeholder="e.g. CS-302" required value={courseForm.code} onChange={(e) => setCourseForm({...courseForm, code: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Credits</label>
                <input type="number" min="1" max="5" className="form-control" required value={courseForm.credits} onChange={(e) => setCourseForm({...courseForm, credits: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Department</label>
                <select className="form-control" required value={courseForm.department_id} onChange={(e) => setCourseForm({...courseForm, department_id: e.target.value})}>
                  <option value="">Select Department</option>
                  {departments.map(d => <option key={d.id} value={d.id}>{d.name} ({d.code})</option>)}
                </select>
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setCourseModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Course</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;

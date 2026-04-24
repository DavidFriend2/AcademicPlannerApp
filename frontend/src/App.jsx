import { useState } from 'react'
import './App.css'

function LoginPage({ onLogin }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('http://127.0.0.1:8000/api/token/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.detail || 'Login failed')
      }

      localStorage.setItem('accessToken', data.access)
      localStorage.setItem('refreshToken', data.refresh)
      localStorage.setItem('username', username)

      onLogin(data.access, username)
    } catch (err) {
      setError(err.message)
    }

    setLoading(false)
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <h1>Academic Planner</h1>
        <p className="login-subtitle">Sign in to view your calendar</p>

        <form onSubmit={handleSubmit} className="login-form">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        {error && <p className="error-text">{error}</p>}
      </div>
    </div>
  )
}

function CalendarPage({ token, username, onLogout }) {
  const [events, setEvents] = useState([])
  const [selectedDate, setSelectedDate] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [courses, setCourses] = useState([])
  const [newAssignment, setNewAssignment] = useState({
    title: '',
    related_course: '',
    due_date: '',
    is_completed: false,
  })

  useState(() => {
    const fetchEvents = async () => {
      try {
        const eventResponse = await fetch('http://127.0.0.1:8000/api/calendar/', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        const eventData = await eventResponse.json()

        if (!eventResponse.ok) {
          throw new Error(eventData.detail || 'Failed to fetch calendar events')
        }

        setEvents(eventData)

        const courseResponse = await fetch('http://127.0.0.1:8000/api/courses/', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        const courseData = await courseResponse.json()

        if (!courseResponse.ok) {
          throw new Error(courseData.detail || 'Failed to fetch courses')
        }

        setCourses(courseData)
      } catch (err) {
        setError(err.message)
      }

      setLoading(false)
    }

    fetchEvents()
  }, [token])

  const today = new Date()
  const currentYear = today.getFullYear()
  const currentMonth = today.getMonth()
  const monthName = today.toLocaleString('default', { month: 'long' }).toUpperCase()
  const firstDay = new Date(currentYear, currentMonth, 1)
  const lastDay = new Date(currentYear, currentMonth + 1, 0)
  const daysInMonth = lastDay.getDate()
  const startWeekday = firstDay.getDay()

  const calendarDays = []
  for (let i = 0; i < startWeekday; i++) {
    calendarDays.push(null)
  }
  for (let d = 1; d <= daysInMonth; d++) {
    calendarDays.push(d)
  }

  const normalizeDate = (dateString) => {
    const d = new Date(dateString)
    return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`
  }

  const hasEventOnDay = (day) => {
    if (!day) return false
    const key = `${currentYear}-${currentMonth + 1}-${day}`
    return events.some((event) => normalizeDate(event.start) === key)
  }

  const selectedEvents = selectedDate
    ? events.filter((event) => normalizeDate(event.start) === selectedDate)
    : []

  if (loading) {
    return <div className="app-shell"><p>Loading calendar...</p></div>
  }

  if (error) {
    return <div className="app-shell"><p>Error: {error}</p></div>
  }

  const handleAddAssignment = async (e) => {
  e.preventDefault()

  try {
    const response = await fetch('http://127.0.0.1:8000/api/assignments/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(newAssignment),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(JSON.stringify(data))
    }

    setShowAddForm(false)
    setNewAssignment({
      title: '',
      related_course: '',
      due_date: '',
      is_completed: false,
    })

    const refreshResponse = await fetch('http://127.0.0.1:8000/api/calendar/', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    const refreshData = await refreshResponse.json()

    if (!refreshResponse.ok) {
      throw new Error(refreshData.detail || 'Failed to refresh calendar')
    }

      setEvents(refreshData)
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">ACADEMIC PLANNER</div>
        <div className="topbar-right">
          <span>[ {username} ]</span>
          <button className="logout-btn" onClick={onLogout}>Logout</button>
        </div>
      </header>

      <main className="dashboard">
        <section className="left-panel">
          <h2>YOUR DEADLINES</h2>
          {events.map((event) => (
          <div key={event.id} className={`event-card ${event.type}`}>
            <div className="event-label">
              {event.type === 'assignment' ? 'Assignment' : 'Exam'}
            </div>
            <div className="event-content">
              <h3 className="event-title">{event.title}</h3>

              <p className="event-course">
                {event.course_id} - {event.course_name}
              </p>

              <p className="event-time">
                {new Date(event.start).toLocaleString()}
              </p>

              {event.type === 'assignment' && event.is_completed !== undefined && (
                <p className="event-extra">
                  Completed: {event.is_completed ? 'Yes' : 'No'}
                </p>
              )}

              {event.type === 'exam' && event.location && (
                <p className="event-extra">Location: {event.location}</p>
              )}

              {event.type === 'exam' && event.duration_minutes && (
                <p className="event-extra">Duration: {event.duration_minutes} min</p>
              )}
            </div>
          </div>
        ))}
        </section>

        <section className="right-panel">
          <div className="toolbar">
            <button onClick={() => setShowAddForm(true)}>+ Add Assignment</button>
            <select>
              <option>Filter: All</option>
            </select>
            <select>
              <option>Sort: Date</option>
            </select>
          </div>

          {showAddForm && (
            <div className="modal-overlay">
              <div className="modal-card">
                <h3>Add Assignment</h3>

                <form onSubmit={handleAddAssignment} className="assignment-form">
                  <input
                    type="text"
                    placeholder="Assignment title"
                    value={newAssignment.title}
                    onChange={(e) =>
                      setNewAssignment({ ...newAssignment, title: e.target.value })
                    }
                    required
                  />

                  <select
                    value={newAssignment.related_course}
                    onChange={(e) =>
                      setNewAssignment({
                        ...newAssignment,
                        related_course: e.target.value,
                      })
                    }
                    required
                  >
                    <option value="">Select a course</option>
                    {courses.map((course) => (
                      <option key={course.id} value={course.id}>
                        {course.course_id} - {course.course_name}
                      </option>
                    ))}
                  </select>

                  <input
                    type="datetime-local"
                    value={newAssignment.due_date}
                    onChange={(e) =>
                      setNewAssignment({ ...newAssignment, due_date: e.target.value })
                    }
                    required
                  />

                  <label className="checkbox-row">
                    <input
                      type="checkbox"
                      checked={newAssignment.is_completed}
                      onChange={(e) =>
                        setNewAssignment({
                          ...newAssignment,
                          is_completed: e.target.checked,
                        })
                      }
                    />
                    Completed
                  </label>

                  <div className="form-actions">
                    <button type="submit">Save</button>
                    <button type="button" onClick={() => setShowAddForm(false)}>
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          <div className="calendar-card">
            <div className="calendar-header">
              <span>Calendar Grid</span>
              <span>{monthName} {currentYear}</span>
            </div>

            <div className="calendar-grid">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="calendar-weekday">{day}</div>
              ))}

              {calendarDays.map((day, index) => (
                <div
                  key={index}
                  className={`calendar-cell ${day ? 'active' : 'empty'}`}
                  onClick={() => {
                    if (day) setSelectedDate(`${currentYear}-${currentMonth + 1}-${day}`)
                  }}
                >
                  {day && (
                    <>
                      <span>{day}</span>
                      {hasEventOnDay(day) && <div className="event-dot"></div>}
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="selected-card">
            <div className="selected-header">
              SELECTED: {selectedDate || 'None'}
            </div>

            {selectedEvents.length === 0 ? (
              <p className="selected-empty">No events for this day.</p>
            ) : (
              <ul>
                {selectedEvents.map((event) => (
                  <li key={event.id}>
                    {event.course_id}: {event.title}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </main>
    </div>
  )
}

function App() {
  const [token, setToken] = useState('')
  const [username, setUsername] = useState('')

  const handleLogin = (newToken, newUsername) => {
    setToken(newToken)
    setUsername(newUsername)
  }

  const handleLogout = () => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('username')
    setToken('')
    setUsername('')
  }

  return token ? (
    <CalendarPage token={token} username={username} onLogout={handleLogout} />
  ) : (
    <LoginPage onLogin={handleLogin} />
  )
}

export default App
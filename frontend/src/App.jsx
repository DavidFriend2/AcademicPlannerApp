import { useState, useEffect } from 'react'
import './App.css'

function LoginPage({ onLogin }) {
  const [isSignup, setIsSignup] = useState(false)
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

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

  const handleSignup = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      setLoading(false)
      return
    }

    try {
      const response = await fetch('http://127.0.0.1:8000/api/register/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          email,
          password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        const errorText =
          data.username?.[0] ||
          data.password?.[0] ||
          data.email?.[0] ||
          'Sign up failed.'

        throw new Error(errorText)
      }

      setMessage('Account created successfully. Please log in.')
      setIsSignup(false)
      setPassword('')
      setConfirmPassword('')
    } catch (err) {
      setError(err.message)
    }

    setLoading(false)
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <h1>Academic Planner</h1>

        <p className="login-subtitle">
          {isSignup ? 'Create an account' : 'Sign in to view your calendar'}
        </p>

        <form
          onSubmit={isSignup ? handleSignup : handleLogin}
          className="login-form"
        >
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />

          {isSignup && (
            <input
              type="email"
              placeholder="Email optional"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          )}

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {isSignup && (
            <input
              type="password"
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          )}

          <button type="submit" disabled={loading}>
            {loading
              ? isSignup
                ? 'Creating account...'
                : 'Logging in...'
              : isSignup
                ? 'Sign Up'
                : 'Login'}
          </button>
        </form>

        <button
          type="button"
          className="switch-auth-btn"
          onClick={() => {
            setIsSignup(!isSignup)
            setError('')
            setMessage('')
          }}
        >
          {isSignup
            ? 'Already have an account? Login'
            : 'Need an account? Sign Up'}
        </button>

        {error && <p className="error-text">{error}</p>}
        {message && <p className="success-text">{message}</p>}
      </div>
    </div>
  )
}

function CalendarPage({ token, username, onLogout }) {
  const [events, setEvents] = useState([])
  const [selectedDate, setSelectedDate] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [eventFilter, setEventFilter] = useState('all')

  const [showAddAssignmentForm, setShowAddAssignmentForm] = useState(false)
  const [showAddCourseForm, setShowAddCourseForm] = useState(false)
  const [showAddExamForm, setShowAddExamForm] = useState(false)

  const [courses, setCourses] = useState([])

  const [newCourse, setNewCourse] = useState({
    course_id: '',
    course_name: '',
  })

  const [newAssignment, setNewAssignment] = useState({
    title: '',
    related_course: '',
    due_date: '',
    is_completed: false,
  })

  const [newExam, setNewExam] = useState({
    title: '',
    related_course: '',
    date: '',
    location: '',
    duration_minutes: '',
    is_completed: false,
  })

  const getTodayMinDateTimeLocal = () => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const timezoneOffset = today.getTimezoneOffset() * 60000
    const localTime = new Date(today.getTime() - timezoneOffset)

    return localTime.toISOString().slice(0, 16)
  }

  const isBeforeToday = (dateString) => {
    if (!dateString) return false

    const selectedDateValue = new Date(dateString)
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)

    return selectedDateValue < todayStart
  }

  const fetchCalendarAndCourses = async () => {
    try {
      setError('')

      const eventResponse = await fetch('http://127.0.0.1:8000/api/calendar/', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const eventData = await eventResponse.json()

      if (!eventResponse.ok) {
        if (
          eventData.detail &&
          String(eventData.detail).includes('token not valid')
        ) {
          onLogout()
          return
        }

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

  useEffect(() => {
    fetchCalendarAndCourses()
  }, [token])

  const handleAddCourse = async (e) => {
    e.preventDefault()
    setError('')

    try {
      const response = await fetch('http://127.0.0.1:8000/api/courses/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newCourse),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(JSON.stringify(data))
      }

      setCourses([...courses, data])
      setNewCourse({
        course_id: '',
        course_name: '',
      })
      setShowAddCourseForm(false)
    } catch (err) {
      setError(err.message)
    }
  }

  const handleAddAssignment = async (e) => {
    e.preventDefault()
    setError('')

    if (isBeforeToday(newAssignment.due_date)) {
      setError('Due date cannot be before today.')
      return
    }

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

      setShowAddAssignmentForm(false)
      setNewAssignment({
        title: '',
        related_course: '',
        due_date: '',
        is_completed: false,
      })

      await fetchCalendarAndCourses()
    } catch (err) {
      setError(err.message)
    }
  }

  const handleAddExam = async (e) => {
    e.preventDefault()
    setError('')

    if (isBeforeToday(newExam.date)) {
      setError('Exam date cannot be before today.')
      return
    }

    try {
      const response = await fetch('http://127.0.0.1:8000/api/exams/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...newExam,
          duration_minutes: newExam.duration_minutes
            ? Number(newExam.duration_minutes)
            : null,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(JSON.stringify(data))
      }

      setShowAddExamForm(false)
      setNewExam({
        title: '',
        related_course: '',
        date: '',
        location: '',
        duration_minutes: '',
        is_completed: false,
      })

      await fetchCalendarAndCourses()
    } catch (err) {
      setError(err.message)
    }
  }

  const getEventEndpoint = (event) => {
    if (event.type === 'assignment') {
      return `http://127.0.0.1:8000/api/assignments/${event.id}/`
    }

    if (event.type === 'exam') {
      return `http://127.0.0.1:8000/api/exams/${event.id}/`
    }

    return null
  }

  const handleToggleComplete = async (event) => {
    setError('')

    const endpoint = getEventEndpoint(event)

    if (!endpoint) {
      setError('Unknown event type.')
      return
    }

    try {
      const response = await fetch(endpoint, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          is_completed: !event.is_completed,
        }),
      })

      const data = response.status === 204 ? null : await response.json()

      if (!response.ok) {
        throw new Error(JSON.stringify(data))
      }

      setEvents(
        events.map((item) =>
          item.type === event.type && item.id === event.id
            ? { ...item, is_completed: !event.is_completed }
            : item
        )
      )
    } catch (err) {
      setError(err.message)
    }
  }

  const handleDeleteEvent = async (event) => {
    setError('')

    const endpoint = getEventEndpoint(event)

    if (!endpoint) {
      setError('Unknown event type.')
      return
    }

    const confirmed = window.confirm(`Delete "${event.title}"?`)

    if (!confirmed) {
      return
    }

    try {
      const response = await fetch(endpoint, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(JSON.stringify(data))
      }

      setEvents(
        events.filter(
          (item) => !(item.type === event.type && item.id === event.id)
        )
      )
    } catch (err) {
      setError(err.message)
    }
  }

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

  const filteredEvents = events.filter((event) => {
    if (eventFilter === 'completed') {
      return event.is_completed === true
    }

    if (eventFilter === 'incomplete') {
      return event.is_completed !== true
    }

    if (eventFilter === 'assignments') {
      return event.type === 'assignment'
    }

    if (eventFilter === 'exams') {
      return event.type === 'exam'
    }

    return true
  })

  const hasEventOnDay = (day) => {
    if (!day) return false

    const key = `${currentYear}-${currentMonth + 1}-${day}`
    return filteredEvents.some((event) => normalizeDate(event.start) === key)
  }

  const selectedEvents = selectedDate
    ? filteredEvents.filter((event) => normalizeDate(event.start) === selectedDate)
    : []

  if (loading) {
    return (
      <div className="app-shell">
        <p>Loading calendar...</p>
      </div>
    )
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">ACADEMIC PLANNER</div>

        <div className="topbar-right">
          <span>[ {username} ]</span>

          <button className="logout-btn" onClick={onLogout}>
            Logout
          </button>
        </div>
      </header>

      <main className="dashboard">
        <section className="left-panel">
          <h2>YOUR DEADLINES</h2>

          {events.length === 0 ? (
            <div className="empty-state">
              <h3>No deadlines yet</h3>
              <p>Add a course first, then create an assignment or exam.</p>
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="empty-state">
              <h3>No matching events</h3>
              <p>Try changing the filter.</p>
            </div>
          ) : (
            filteredEvents.map((event) => (
              <div
                key={`${event.type}-${event.id}`}
                className={`event-card ${event.type}`}
              >
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

                  <p className="event-extra">
                    Completed: {event.is_completed ? 'Yes' : 'No'}
                  </p>

                  {event.type === 'exam' && event.location && (
                    <p className="event-extra">Location: {event.location}</p>
                  )}

                  {event.type === 'exam' && event.duration_minutes && (
                    <p className="event-extra">
                      Duration: {event.duration_minutes} min
                    </p>
                  )}

                  <div className="event-actions">
                    <label className="complete-row">
                      <input
                        type="checkbox"
                        checked={event.is_completed === true}
                        onChange={() => handleToggleComplete(event)}
                      />
                      Complete
                    </label>

                    <button
                      type="button"
                      className="delete-event-btn"
                      onClick={() => handleDeleteEvent(event)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </section>

        <section className="right-panel">
          <div className="toolbar">
            <button onClick={() => setShowAddCourseForm(true)}>
              + Add Course
            </button>

            <button
              onClick={() => setShowAddAssignmentForm(true)}
              disabled={courses.length === 0}
              title={courses.length === 0 ? 'Add a course first' : ''}
            >
              + Add Assignment
            </button>

            <button
              onClick={() => setShowAddExamForm(true)}
              disabled={courses.length === 0}
              title={courses.length === 0 ? 'Add a course first' : ''}
            >
              + Add Exam
            </button>

            <select
              value={eventFilter}
              onChange={(e) => setEventFilter(e.target.value)}
            >
              <option value="all">Filter: All</option>
              <option value="incomplete">Incomplete</option>
              <option value="completed">Completed</option>
              <option value="assignments">Assignments</option>
              <option value="exams">Exams</option>
            </select>

            <select>
              <option>Sort: Date</option>
            </select>
          </div>

          {courses.length === 0 && (
            <div className="empty-state small-empty-state">
              <h3>No courses yet</h3>
              <p>Add a course before creating assignments or exams.</p>
            </div>
          )}

          {error && <p className="error-text">Error: {error}</p>}

          {showAddCourseForm && (
            <div className="modal-overlay">
              <div className="modal-card">
                <h3>Add Course</h3>

                <form onSubmit={handleAddCourse} className="assignment-form">
                  <input
                    type="text"
                    placeholder="Course ID, e.g. CS 3304"
                    value={newCourse.course_id}
                    onChange={(e) =>
                      setNewCourse({
                        ...newCourse,
                        course_id: e.target.value,
                      })
                    }
                    required
                  />

                  <input
                    type="text"
                    placeholder="Course name, e.g. Comparative Languages"
                    value={newCourse.course_name}
                    onChange={(e) =>
                      setNewCourse({
                        ...newCourse,
                        course_name: e.target.value,
                      })
                    }
                    required
                  />

                  <div className="form-actions">
                    <button type="submit">Save Course</button>

                    <button
                      type="button"
                      onClick={() => setShowAddCourseForm(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {showAddAssignmentForm && (
            <div className="modal-overlay">
              <div className="modal-card">
                <h3>Add Assignment</h3>

                <form onSubmit={handleAddAssignment} className="assignment-form">
                  <input
                    type="text"
                    placeholder="Assignment title"
                    value={newAssignment.title}
                    onChange={(e) =>
                      setNewAssignment({
                        ...newAssignment,
                        title: e.target.value,
                      })
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
                    min={getTodayMinDateTimeLocal()}
                    value={newAssignment.due_date}
                    onChange={(e) =>
                      setNewAssignment({
                        ...newAssignment,
                        due_date: e.target.value,
                      })
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
                    <button type="submit">Save Assignment</button>

                    <button
                      type="button"
                      onClick={() => setShowAddAssignmentForm(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {showAddExamForm && (
            <div className="modal-overlay">
              <div className="modal-card">
                <h3>Add Exam</h3>

                <form onSubmit={handleAddExam} className="assignment-form">
                  <input
                    type="text"
                    placeholder="Exam title"
                    value={newExam.title}
                    onChange={(e) =>
                      setNewExam({
                        ...newExam,
                        title: e.target.value,
                      })
                    }
                    required
                  />

                  <select
                    value={newExam.related_course}
                    onChange={(e) =>
                      setNewExam({
                        ...newExam,
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
                    min={getTodayMinDateTimeLocal()}
                    value={newExam.date}
                    onChange={(e) =>
                      setNewExam({
                        ...newExam,
                        date: e.target.value,
                      })
                    }
                    required
                  />

                  <input
                    type="text"
                    placeholder="Location, e.g. McBryde 100"
                    value={newExam.location}
                    onChange={(e) =>
                      setNewExam({
                        ...newExam,
                        location: e.target.value,
                      })
                    }
                  />

                  <input
                    type="number"
                    placeholder="Duration minutes, e.g. 75"
                    value={newExam.duration_minutes}
                    onChange={(e) =>
                      setNewExam({
                        ...newExam,
                        duration_minutes: e.target.value,
                      })
                    }
                    min="1"
                  />

                  <div className="form-actions">
                    <button type="submit">Save Exam</button>

                    <button
                      type="button"
                      onClick={() => setShowAddExamForm(false)}
                    >
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

              <span>
                {monthName} {currentYear}
              </span>
            </div>

            <div className="calendar-grid">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="calendar-weekday">
                  {day}
                </div>
              ))}

              {calendarDays.map((day, index) => (
                <div
                  key={index}
                  className={`calendar-cell ${day ? 'active' : 'empty'}`}
                  onClick={() => {
                    if (day) {
                      setSelectedDate(`${currentYear}-${currentMonth + 1}-${day}`)
                    }
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
              <p className="selected-empty">
                No assignments or exams scheduled for this day.
              </p>
            ) : (
              <ul>
                {selectedEvents.map((event) => (
                  <li
                    key={`${event.type}-${event.id}`}
                    className="selected-event-row"
                  >
                    <span>
                      {event.course_id}: {event.title}
                    </span>

                    <label className="complete-row">
                      <input
                        type="checkbox"
                        checked={event.is_completed === true}
                        onChange={() => handleToggleComplete(event)}
                      />
                      Complete
                    </label>

                    <button
                      type="button"
                      className="delete-event-btn"
                      onClick={() => handleDeleteEvent(event)}
                    >
                      Delete
                    </button>
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
  const [token, setToken] = useState(localStorage.getItem('accessToken') || '')
  const [username, setUsername] = useState(localStorage.getItem('username') || '')

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
import './App.css'

function App() {
  const events = [
    { id: 1, title: 'Math Homework', date: '2026-04-15', time: '10:00 AM' },
    { id: 2, title: 'CS Project Meeting', date: '2026-04-16', time: '2:00 PM' },
    { id: 3, title: 'English Essay Due', date: '2026-04-18', time: '11:59 PM' },
    { id: 4, title: 'Office Hours', date: '2026-04-12', time: '3:30 PM' },
  ]

  const sortedEvents = [...events].sort((a, b) => {
    const dateA = new Date(`${a.date} ${a.time}`)
    const dateB = new Date(`${b.date} ${b.time}`)
    return dateA - dateB
  })

  const calendarDays = Array.from({ length: 30 }, (_, i) => i + 1)

  return (
    <div className="planner-layout">
      <aside className="sidebar">
        <h2>Upcoming Events</h2>
        <div className="event-list">
          {sortedEvents.map((event) => (
            <div key={event.id} className="event-item">
              <h3>{event.title}</h3>
              <p>{event.date}</p>
              <p>{event.time}</p>
            </div>
          ))}
        </div>
      </aside>

      <main className="main-content">
        <div className="top-bar">
          <h1>Academic Planner</h1>
          <button className="add-event-btn">+ Add Event</button>
        </div>

        <section className="calendar-section">
          <h2>April 2026</h2>

          <div className="calendar-header">
            <div>Sun</div>
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div>Sat</div>
          </div>

          <div className="calendar-grid">
            <div className="empty-cell"></div>
            <div className="empty-cell"></div>
            <div className="empty-cell"></div>

            {calendarDays.map((day) => (
              <div key={day} className="calendar-cell">
                <span className="day-number">{day}</span>

                {(day === 15 || day === 16 || day === 18) && (
                  <div className="calendar-event-marker">Event</div>
                )}
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}

export default App
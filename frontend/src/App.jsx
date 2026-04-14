import './App.css'

function App() {
  const events = [
    { id: 1, title: 'Math Homework', date: '2026-04-15', time: '10:00 AM' },
    { id: 2, title: 'CS Project Meeting', date: '2026-04-16', time: '2:00 PM' },
    { id: 3, title: 'English Essay Due', date: '2026-04-18', time: '11:59 PM' },
  ]

  return (
    <div className="app">
      <h1>Academic Planner</h1>
      <p>Calendar Overview</p>

      <div className="event-list">
        {events.map((event) => (
          <div key={event.id} className="event-card">
            <h3>{event.title}</h3>
            <p>Date: {event.date}</p>
            <p>Time: {event.time}</p>
          </div>
        ))}
      </div>
    </div>
  )
}


export default App

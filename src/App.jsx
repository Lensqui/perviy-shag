import { useEffect, useState } from 'react'
import { WebApp } from '@twa-dev/sdk'
import './App.css'

function App() {
  const [user, setUser] = useState(null)
  const [screen, setScreen] = useState('main')
  const [currentStep, setCurrentStep] = useState(0)
  const [habits, setHabits] = useState([])
  const [isLoaded, setIsLoaded] = useState(false)
  const [newHabitName, setNewHabitName] = useState('')
  const [newFirstStep, setNewFirstStep] = useState('')
  const [streak, setStreak] = useState(0)

  const chain = [
    { title: 'Встань и сделай 5 приседаний', desc: 'Просто встань и сделай 5 раз' },
    { title: 'Выпей воды', desc: 'Сделай несколько глотков воды' },
    { title: 'Пройдись по комнате', desc: 'Пройди 20–30 шагов' },
    { title: 'Напиши одно предложение', desc: 'Открой заметки и напиши любую мысль' },
  ]

  const templates = [
    { name: 'Начать работу', firstStep: 'Открыть ноутбук и написать одно предложение' },
    { name: 'Физическая активность', firstStep: 'Встать и сделать 5 приседаний' },
    { name: 'Навести порядок', firstStep: 'Убрать 3 вещи на место' },
    { name: 'Чтение', firstStep: 'Открыть книгу и прочитать 1 страницу' },
    { name: 'Меньше телефона', firstStep: 'Поставить телефон экраном вниз на 2 минуты' },
    { name: 'Ранний подъём', firstStep: 'Сразу встать с кровати' },
  ]

  // Загрузка данных
  useEffect(() => {
    try {
      WebApp.ready()
      WebApp.expand()
      if (WebApp.initDataUnsafe?.user) {
        setUser(WebApp.initDataUnsafe.user)
      }
    } catch (e) {}

    const savedHabits = localStorage.getItem('habits')
    const savedStreak = localStorage.getItem('streak')
    const lastDate = localStorage.getItem('lastDate')
    const today = new Date().toDateString()

    let loadedHabits = []
    if (savedHabits) {
      try {
        loadedHabits = JSON.parse(savedHabits)
      } catch (e) {}
    }

    // Сброс галочек, если новый день
    if (lastDate !== today) {
      loadedHabits = loadedHabits.map(h => ({ ...h, doneToday: false }))
      localStorage.setItem('lastDate', today)
    }

    setHabits(loadedHabits)
    setStreak(savedStreak ? Number(savedStreak) : 0)
    setIsLoaded(true)
  }, [])

  // Сохранение
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('habits', JSON.stringify(habits))
      localStorage.setItem('streak', streak)
    }
  }, [habits, streak, isLoaded])

  const addHabit = (name, firstStep) => {
    const habit = {
      id: Date.now(),
      name,
      firstStep,
      doneToday: false
    }
    setHabits(prev => [...prev, habit])
    setNewHabitName('')
    setNewFirstStep('')
    setScreen('main')
  }

  const toggleHabit = (id) => {
    setHabits(prev => {
      const updated = prev.map(h => 
        h.id === id ? { ...h, doneToday: !h.doneToday } : h
        
      )

      // Обновляем серию
      const hasDone = updated.some(h => h.doneToday)
      if (hasDone) {
        const today = new Date().toDateString()
        const lastActive = localStorage.getItem('lastActiveDate')
        
        if (lastActive !== today) {
          const yesterday = new Date()
          yesterday.setDate(yesterday.getDate() - 1)
          
          if (lastActive === yesterday.toDateString()) {
            setStreak(s => s + 1)
          } else {
            setStreak(1)
          }
          localStorage.setItem('lastActiveDate', today)
        }
      }

      return updated
    })
  }
const deleteHabit = (id) => {
  if (confirm('Удалить эту привычку?')) {
    setHabits(prev => prev.filter(h => h.id !== id))
  }
}
  // ===== Главный экран =====
  if (screen === 'main') {
    return (
      <div className="app">
        <h1>Первый шаг</h1>
        <p>Трекер против лени и прокрастинации</p>

        {user && (
          <div className="user-info">
            Привет, <strong>{user.first_name}</strong>!
            {streak > 0 && (
              <div style={{ marginTop: 6, fontSize: 14 }}>
                Серия: <strong>{streak} {streak === 1 ? 'день' : 'дней'}</strong>
              </div>
            )}
          </div>
        )}

        <button className="main-button" onClick={() => setScreen('lazy')}>
          Мне сейчас лень
        </button>

        <div style={{ marginTop: 32, textAlign: 'left' }}>
          <h3 style={{ marginBottom: 12 }}>Мои привычки</h3>

          {habits.length === 0 && (
            <p style={{ opacity: 0.6, fontSize: 14 }}>Пока нет привычек</p>
          )}

{habits.map(habit => (
  <div key={habit.id} className="habit-card">
    <div style={{ flex: 1 }}>
      <div style={{ fontWeight: 600 }}>{habit.name}</div>
      <div style={{ fontSize: 14, opacity: 0.7, marginTop: 4 }}>
        {habit.firstStep}
      </div>
    </div>

    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      <button 
        className={`check-btn ${habit.doneToday ? 'done' : ''}`}
        onClick={() => toggleHabit(habit.id)}
      >
        {habit.doneToday ? '✓' : ''}
      </button>

      <button 
        onClick={() => deleteHabit(habit.id)}
        style={{
          background: 'transparent',
          border: 'none',
          color: '#ff3b30',
          fontSize: 18,
          cursor: 'pointer',
          padding: '4px 8px'
        }}
      >
        ×
      </button>
    </div>
  </div>
))}

          <button className="add-habit-btn" onClick={() => setScreen('add')}>
            + Добавить привычку
          </button>
        </div>
      </div>
    )
  }

  // ===== Добавление привычки =====
  if (screen === 'add') {
    return (
      <div className="app">
        <h2>Новая привычка</h2>

        <div style={{ marginBottom: 20 }}>
          <p style={{ fontSize: 14, marginBottom: 10, opacity: 0.7 }}>Готовые шаблоны:</p>
          <div className="options">
            {templates.map(t => (
              <button 
                key={t.name}
                className="option-btn"
                onClick={() => addHabit(t.name, t.firstStep)}
              >
                <div style={{ fontWeight: 600 }}>{t.name}</div>
                <div style={{ fontSize: 13, opacity: 0.7, marginTop: 2 }}>{t.firstStep}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="form">
          <p style={{ fontSize: 14, opacity: 0.7 }}>Или создай свою:</p>
          
          <label>Название привычки</label>
          <input 
            type="text" 
            value={newHabitName}
            onChange={e => setNewHabitName(e.target.value)}
            placeholder="Например: Медитация"
          />

          <label>Первый шаг (1–2 минуты)</label>
          <input 
            type="text" 
            value={newFirstStep}
            onChange={e => setNewFirstStep(e.target.value)}
            placeholder="Например: Сесть и закрыть глаза"
          />

          <button 
            className="main-button" 
            onClick={() => addHabit(newHabitName, newFirstStep)}
            disabled={!newHabitName.trim() || !newFirstStep.trim()}
          >
            Сохранить свою
          </button>

          <button className="back-button" onClick={() => setScreen('main')}>
            ← Отмена
          </button>
        </div>
      </div>
    )
  }

  // ===== Выбор причины =====
  if (screen === 'lazy') {
    return (
      <div className="app">
        <h2>Что мешает начать?</h2>

        <div className="options">
          {['Совсем нет сил', 'Не знаю, с чего начать', 'Страшно / не хочется делать плохо', 'Хочется отвлечься', 'Просто лень без причины'].map(text => (
            <button 
              key={text}
              className="option-btn" 
              onClick={() => { setCurrentStep(0); setScreen('chain') }}
            >
              {text}
            </button>
          ))}
        </div>

        <button className="back-button" onClick={() => setScreen('main')}>
          ← Назад
        </button>
      </div>
    )
  }

  // ===== Цепочка разгона =====
  if (screen === 'chain') {
    const step = chain[currentStep]

    return (
      <div className="app">
        <div style={{ marginBottom: 8, opacity: 0.6, fontSize: 14 }}>
          Шаг {currentStep + 1} из {chain.length}
        </div>

        <h2>{step.title}</h2>
        <p>{step.desc}</p>

        <button 
          className="main-button"
          onClick={() => {
            if (currentStep < chain.length - 1) {
              setCurrentStep(currentStep + 1)
            } else {
              setScreen('main')
              setCurrentStep(0)
            }
          }}
        >
          {currentStep < chain.length - 1 ? 'Сделал' : 'Готово!'}
        </button>

        <button className="back-button" onClick={() => setScreen('lazy')}>
          ← Назад
        </button>
      </div>
    )
  }

  return null
}

export default App
import { useEffect, useState } from 'react'
import WebApp from '@twa-dev/sdk'
import './App.css'
import { supabase } from './supabase'
const tg = window.Telegram?.WebApp
function App() {
  const [user, setUser] = useState(null)
  const [streakDays, setStreakDays] = useState([])
  const [screen, setScreen] = useState('loading')
  const [showFullCalendar, setShowFullCalendar] = useState(false)
const [currentMonth, setCurrentMonth] = useState(new Date())
  const [currentStep, setCurrentStep] = useState(0)
  const [habits, setHabits] = useState([])
  const [isLoaded, setIsLoaded] = useState(false)
  const [newHabitName, setNewHabitName] = useState('')
  const [newFirstStep, setNewFirstStep] = useState('')
  const [streak, setStreak] = useState(0)
  const [diaryEntries, setDiaryEntries] = useState([])
  const [diaryAnswers, setDiaryAnswers] = useState({ q1: '', q2: '', q3: '' })
  const [currentChain, setCurrentChain] = useState([])
  const [onboardingStep, setOnboardingStep] = useState(0)

  const chains = {
    'no_energy': [
      { title: 'Просто встань', desc: 'Встань с места на 10 секунд' },
      { title: 'Выпей воды', desc: 'Сделай 3–4 глотка воды' },
      { title: 'Размять плечи', desc: 'Медленно подними и опусти плечи 5 раз' },
      { title: 'Сделай 3 глубоких вдоха', desc: 'Вдох носом — выдох ртом' },
    ],
    'dont_know': [
      { title: 'Возьми лист бумаги или телефон', desc: 'Просто открой заметки' },
      { title: 'Напиши задачу одним предложением', desc: 'Как есть, без красоты' },
      { title: 'Разбей на 3 маленьких шага', desc: 'Самые крошечные действия' },
      { title: 'Выбери только первый шаг', desc: 'Тот, который можно сделать за 2 минуты' },
    ],
    'scared': [
      { title: 'Скажи себе вслух', desc: '«Мне не нужно делать идеально»' },
      { title: 'Поставь таймер на 2 минуты', desc: 'Только 2 минуты и всё' },
      { title: 'Сделай самый уродливый вариант', desc: 'Разреши себе сделать плохо' },
      { title: 'Закрой глаза на 10 секунд', desc: 'Просто побудь в тишине' },
    ],
    'distracted': [
      { title: 'Положи телефон экраном вниз', desc: 'Или в другую комнату' },
      { title: 'Закрой все лишние вкладки', desc: 'Оставь только нужное' },
      { title: 'Поставь таймер на 5 минут', desc: 'Только 5 минут фокуса' },
      { title: 'Скажи вслух цель', desc: 'Одним предложением, что ты сейчас делаешь' },
    ],
    'just_lazy': [
      { title: 'Встань и сделай 5 приседаний', desc: 'Просто 5 раз' },
      { title: 'Выпей воды', desc: 'Несколько глотков' },
      { title: 'Пройдись по комнате', desc: '20–30 шагов' },
      { title: 'Напиши одно предложение', desc: 'Любую мысль в заметки' },
    ]
  }

  const templates = [
    { name: 'Начать работу', firstStep: 'Открыть ноутбук и написать одно предложение' },
    { name: 'Физическая активность', firstStep: 'Встать и сделать 5 приседаний' },
    { name: 'Навести порядок', firstStep: 'Убрать 3 вещи на место' },
    { name: 'Чтение', firstStep: 'Открыть книгу и прочитать 1 страницу' },
    { name: 'Меньше телефона', firstStep: 'Поставить телефон экраном вниз на 2 минуты' },
    { name: 'Ранний подъём', firstStep: 'Сразу встать с кровати' },
  ]

 // Загрузка данных
// Загрузка данных
useEffect(() => {
  const init = async () => {
    // Ждём, пока Telegram полностью загрузится
    let attempts = 0
    while (!window.Telegram?.WebApp && attempts < 20) {
      await new Promise(resolve => setTimeout(resolve, 100))
      attempts++
    }

    try {
      const telegram = window.Telegram?.WebApp

      if (telegram) {
        telegram.ready()
        telegram.expand()
      }

      const tgUser = telegram?.initDataUnsafe?.user

      console.log('Telegram WebApp:', telegram)
      console.log('User:', tgUser)

      if (tgUser) {
        setUser(tgUser)

        // Создаём или обновляем пользователя в Supabase
        const { error } = await supabase
          .from('users')
          .upsert({
            telegram_id: tgUser.id,
            first_name: tgUser.first_name,
            last_name: tgUser.last_name || null,
            username: tgUser.username || null,
            language_code: tgUser.language_code || null,
            is_premium: tgUser.is_premium || false,
            updated_at: new Date().toISOString()
          }, { onConflict: 'telegram_id' })

        if (error) {
          console.error('Ошибка сохранения пользователя:', error)
        }

const { data: habitsData, error: habitsError } = await supabase
  .from('habits')
  .select('*')
  .eq('telegram_id', tgUser.id)
  .eq('is_active', true)
  .order('created_at', { ascending: false })

if (habitsError) {
  console.error('Ошибка загрузки привычек:', habitsError)
} else {
  const today = new Date().toISOString().slice(0, 10) // YYYY-MM-DD

  const { data: logs } = await supabase
    .from('habit_logs')
    .select('habit_id')
    .eq('telegram_id', tgUser.id)
    .eq('completed_at', today)

  const doneIds = new Set((logs || []).map(l => l.habit_id))

  const habitsWithStatus = (habitsData || []).map(h => ({
    ...h,
    doneToday: doneIds.has(h.id)
  }))
const { data: diaryData, error: diaryError } = await supabase
  .from('diary_entries')
  .select('*')
  .eq('telegram_id', tgUser.id)
  .order('created_at', { ascending: false })
  .limit(30)

if (diaryError) {
  console.error('Ошибка загрузки дневника:', diaryError)
} else {
  setDiaryEntries(diaryData || [])
}
  setHabits(habitsWithStatus)
}

        // Загружаем серию
        const { data: userData } = await supabase
          .from('users')
          .select('streak, last_active_date')
          .eq('telegram_id', tgUser.id)
          .single()

        if (userData) {
          setStreak(userData.streak || 0)
        }
      }
    } catch (e) {
      console.log('Ошибка инициализации:', e)
    }

    const onboardingDone = localStorage.getItem('onboardingDone')
    if (!onboardingDone) {
      setScreen('onboarding')
    } else {
      setScreen('main')
    }

    setIsLoaded(true)
  }

  init()
}, [])
  // Сохранение
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('habits', JSON.stringify(habits))
      localStorage.setItem('streak', streak)
      localStorage.setItem('diary', JSON.stringify(diaryEntries))
    }
  }, [habits, streak, diaryEntries, isLoaded])

  const finishOnboarding = () => {
    localStorage.setItem('onboardingDone', 'true')
    setScreen('main')
  }

const addHabit = async (name, firstStep) => {
  if (!name?.trim() || !firstStep?.trim()) {
    alert('Заполни название и первый шаг')
    return
  }

  const telegram = window.Telegram?.WebApp
  const tgUser = telegram?.initDataUnsafe?.user || user

  if (!tgUser?.id) {
    alert('Не удалось получить данные пользователя Telegram')
    console.log('telegram:', telegram)
    console.log('initDataUnsafe:', telegram?.initDataUnsafe)
    return
  }
// Загружаем дни активности за последние 21 день (стрики)
const twentyOneDaysAgo = new Date()
twentyOneDaysAgo.setDate(twentyOneDaysAgo.getDate() - 20)

const { data: activityLogs } = await supabase
  .from('habit_logs')
  .select('completed_at')
  .eq('telegram_id', tgUser.id)
  .gte('completed_at', twentyOneDaysAgo.toISOString().slice(0, 10))

const activeDates = new Set((activityLogs || []).map(l => l.completed_at))
setStreakDays(Array.from(activeDates))
  try {
    await supabase
      .from('users')
      .upsert({
        telegram_id: tgUser.id,
        first_name: tgUser.first_name,
        last_name: tgUser.last_name || null,
        username: tgUser.username || null,
        language_code: tgUser.language_code || null,
        updated_at: new Date().toISOString()
      }, { onConflict: 'telegram_id' })


    const { data, error } = await supabase
      .from('habits')
      .insert({
        telegram_id: tgUser.id,
        name: name.trim(),
        first_step: firstStep.trim(),
        is_active: true
      })
      .select()
      .single()

    if (error) {
      console.error('Ошибка добавления привычки:', error)
      alert('Ошибка: ' + error.message)
      return
    }

    setHabits(prev => [data, ...prev])
    setNewHabitName('')
    setNewFirstStep('')
    
    if (screen === 'onboarding') {
      localStorage.setItem('onboardingDone', 'true')
    }
    setScreen('main')
  } catch (err) {
    console.error(err)
    alert('Произошла ошибка при сохранении')
  }
}
 const toggleHabit = async (id) => {
  const telegram = window.Telegram?.WebApp
  const tgUser = telegram?.initDataUnsafe?.user || user
  if (!tgUser?.id) return

  const habit = habits.find(h => h.id === id)
  if (!habit) return

  const today = new Date().toISOString().slice(0, 10) // YYYY-MM-DD

  try {
    if (habit.doneToday) {
      const { error } = await supabase
        .from('habit_logs')
        .delete()
        .eq('habit_id', id)
        .eq('completed_at', today)

      if (error) {
        console.error('Ошибка снятия отметки:', error)
        return
      }
      setHabits(prev => prev.map(h => h.id === id ? { ...h, doneToday: false } : h))
    } else {

      const { error } = await supabase
        .from('habit_logs')
        .insert({
          habit_id: id,
          telegram_id: tgUser.id,
          completed_at: today
        })

      if (error) {
        console.error('Ошибка установки отметки:', error)
        alert('Не удалось отметить: ' + error.message)
        return
      }

      setHabits(prev => prev.map(h => h.id === id ? { ...h, doneToday: true } : h))

      const lastActive = localStorage.getItem('lastActiveDate')
      const todayStr = new Date().toDateString()

      if (lastActive !== todayStr) {
        const yesterday = new Date()
        yesterday.setDate(yesterday.getDate() - 1)

        if (lastActive === yesterday.toDateString()) {
          setStreak(s => s + 1)
        } else {
          setStreak(1)
        }
        localStorage.setItem('lastActiveDate', todayStr)

        await supabase
          .from('users')
          .update({ 
            streak: lastActive === yesterday.toDateString() ? streak + 1 : 1,
            last_active_date: today 
          })
          .eq('telegram_id', tgUser.id)
      }
    }
  } catch (err) {
    console.error(err)
  }
}

const deleteHabit = async (id) => {
  if (!confirm('Удалить эту привычку?')) return

  try {
    const { error } = await supabase
      .from('habits')
      .update({ is_active: false })
      .eq('id', id)

    if (error) {
      console.error('Ошибка удаления:', error)
      alert('Не удалось удалить привычку: ' + error.message)
      return
    }

    setHabits(prev => prev.filter(h => h.id !== id))
  } catch (err) {
    console.error(err)
    alert('Произошла ошибка при удалении')
  }
}

const saveDiary = async () => {
  if (!diaryAnswers.q1 && !diaryAnswers.q2 && !diaryAnswers.q3) {
    alert('Напиши хотя бы что-то')
    return
  }

  const telegram = window.Telegram?.WebApp
  const tgUser = telegram?.initDataUnsafe?.user || user

  if (!tgUser?.id) {
    alert('Не удалось определить пользователя')
    return
  }

  try {
    const { data, error } = await supabase
      .from('diary_entries')
      .insert({
        telegram_id: tgUser.id,
        q1: diaryAnswers.q1 || null,
        q2: diaryAnswers.q2 || null,
        q3: diaryAnswers.q3 || null,
        entry_date: new Date().toISOString().slice(0, 10)
      })
      .select()
      .single()

    if (error) {
      console.error('Ошибка сохранения дневника:', error)
      alert('Не удалось сохранить: ' + error.message)
      return
    }

    setDiaryEntries(prev => [data, ...prev])
    setDiaryAnswers({ q1: '', q2: '', q3: '' })
    alert('Запись сохранена')
  } catch (err) {
    console.error(err)
    alert('Произошла ошибка')
  }
}

  const startChain = (type) => {
    setCurrentChain(chains[type])
    setCurrentStep(0)
    setScreen('chain')
  }

  // ===== Нижняя навигация =====
  const Nav = () => (
    <div className="nav">
      <button 
        className={['main', 'lazy', 'chain', 'add'].includes(screen) ? 'nav-item active' : 'nav-item'}
        onClick={() => setScreen('main')}
      >
        Сегодня
      </button>
      <button 
        className={screen === 'diary' ? 'nav-item active' : 'nav-item'}
        onClick={() => setScreen('diary')}
      >
        Дневник
      </button>
    </div>
  )

  // ===== ОНБОРДИНГ =====
  if (screen === 'onboarding') {
    return (
      <div className="onboarding">
        {onboardingStep === 0 && (
          <div className="onb-screen">
            <div className="onb-emoji">🚀</div>
            <h1>Первый шаг</h1>
            <p className="onb-subtitle">
              Это не обычный трекер привычек.<br/>
              Он помогает <strong>начать</strong>, когда совсем лень.
            </p>
            <button className="main-button" onClick={() => setOnboardingStep(1)}>
              Дальше
            </button>
          </div>
        )}

        {onboardingStep === 1 && (
          <div className="onb-screen">
            <div className="onb-emoji">💡</div>
            <h1>Главный секрет</h1>
            <p className="onb-subtitle">
              Мы не пытаемся сразу сделать всё идеально.<br/><br/>
              Мы делаем <strong>крошечный первый шаг</strong> — и этого достаточно, чтобы запуститься.
            </p>
            <button className="main-button" onClick={() => setOnboardingStep(2)}>
              Понял
            </button>
          </div>
        )}

        {onboardingStep === 2 && (
          <div className="onb-screen">
            <div className="onb-emoji">🎯</div>
            <h1>Выбери первую привычку</h1>
            <p className="onb-subtitle" style={{ marginBottom: 24 }}>
              Начни с одной. Потом можно добавить больше.
            </p>

            <div className="options" style={{ width: '100%' }}>
              {templates.slice(0, 4).map(t => (
                <button 
                  key={t.name} 
                  className="option-btn" 
                  onClick={() => addHabit(t.name, t.firstStep)}
                >
                  <div style={{ fontWeight: 600 }}>{t.name}</div>
                  <div style={{ fontSize: 13, opacity: 0.7, marginTop: 3 }}>{t.firstStep}</div>
                </button>
              ))}
            </div>

            <button className="back-button" onClick={finishOnboarding} style={{ marginTop: 20 }}>
              Пропустить
            </button>
          </div>
        )}

        {/* Точки прогресса */}
        <div className="onb-dots">
          {[0, 1, 2].map(i => (
            <div key={i} className={`dot ${onboardingStep === i ? 'active' : ''}`} />
          ))}
        </div>
      </div>
    )
  }

  // ===== Главный экран =====
  if (screen === 'main') {
    return (
      <div className="app">
        <h1>Первый шаг</h1>
        <p>Трекер против лени и прокрастинации</p>

    <div className="user-info">
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
    <div>
      {user ? <>Привет, <strong>{user.first_name}</strong>!</> : <>Привет!</>}
    </div>
    
    {streak > 0 && (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 6,
        background: 'rgba(251, 146, 60, 0.15)',
        padding: '6px 12px',
        borderRadius: 20,
        fontSize: 15,
        fontWeight: 600,
        color: '#fb923c'
      }}>
        <span style={{ fontSize: 18 }}>🔥</span>
        {streak}
      </div>
    )}
  </div>

  {/* Компактный календарь за 14 дней */}
  <div style={{ 
    display: 'grid', 
    gridTemplateColumns: 'repeat(7, 1fr)', 
    gap: 6,
    marginBottom: 8
  }}>
    {Array.from({ length: 14 }).map((_, i) => {
      const d = new Date()
      d.setDate(d.getDate() - (13 - i))
      const dateStr = d.toISOString().slice(0, 10)
      const dayNum = d.getDate()
      const isActive = streakDays.includes(dateStr)
      const isToday = i === 13

      return (
        <div 
          key={dateStr}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 3
          }}
        >
          <div style={{
            width: 28,
            height: 28,
            borderRadius: 8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 13,
            fontWeight: isToday ? 700 : 500,
            background: isActive ? '#22c55e' : 'rgba(255,255,255,0.08)',
            color: isActive ? '#fff' : 'rgba(255,255,255,0.7)',
            border: isToday ? '2px solid #60a5fa' : 'none'
          }}>
            {dayNum}
          </div>
        </div>
      )
    })}
  </div>

  <button 
    onClick={() => setShowFullCalendar(true)}
    style={{
      background: 'transparent',
      border: 'none',
      color: '#60a5fa',
      fontSize: 13,
      cursor: 'pointer',
      padding: 0,
      marginTop: 4
    }}
  >
    Смотреть весь календарь →
  </button>
</div>

        <button className="main-button" onClick={() => setScreen('lazy')}>
          Мне сейчас лень
        </button>

        <div style={{ marginTop: 28, textAlign: 'left' }}>
          <h3 style={{ marginBottom: 12 }}>Мои привычки</h3>

          {habits.length === 0 && <p style={{ opacity: 0.6, fontSize: 14 }}>Пока нет привычек</p>}

          {habits.map(habit => (
            <div key={habit.id} className="habit-card">
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600 }}>{habit.name}</div>
           <div style={{ fontSize: 14, opacity: 0.7, marginTop: 4 }}>{habit.first_step}</div>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <button className={`check-btn ${habit.doneToday ? 'done' : ''}`} onClick={() => toggleHabit(habit.id)}>
                  {habit.doneToday ? '✓' : ''}
                </button>
                <button onClick={() => deleteHabit(habit.id)} style={{ background: 'transparent', border: 'none', color: '#ff3b30', fontSize: 20, cursor: 'pointer' }}>×</button>
              </div>
            </div>
          ))}

          <button className="add-habit-btn" onClick={() => setScreen('add')}>+ Добавить привычку</button>
        </div>

        <Nav />
      </div>
    )
  }

  // ===== Дневник =====
  if (screen === 'diary') {
    return (
      <div className="app">
        <h2>Дневник</h2>

        <div className="form" style={{ marginBottom: 30 }}>
          <label>Что сегодня мешало начать?</label>
          <input type="text" value={diaryAnswers.q1} onChange={e => setDiaryAnswers({...diaryAnswers, q1: e.target.value})} placeholder="Лень, усталость, отвлечения..." />
          <label>Какой самый маленький шаг я сделал?</label>
          <input type="text" value={diaryAnswers.q2} onChange={e => setDiaryAnswers({...diaryAnswers, q2: e.target.value})} placeholder="Открыл ноутбук..." />
          <label>Что завтра сделаю ещё проще?</label>
          <input type="text" value={diaryAnswers.q3} onChange={e => setDiaryAnswers({...diaryAnswers, q3: e.target.value})} placeholder="Ещё меньший шаг..." />
          <button className="main-button" onClick={saveDiary}>Сохранить запись</button>
        </div>

        <h3 style={{ marginBottom: 12, textAlign: 'left' }}>Предыдущие записи</h3>
        {diaryEntries.length === 0 && <p style={{ opacity: 0.6 }}>Записей пока нет</p>}
        {diaryEntries.map(entry => (
          <div key={entry.id} className="habit-card" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 6 }}>
    <div style={{ fontSize: 13, opacity: 0.6 }}>
    {entry.entry_date || entry.created_at?.slice(0, 10)}
</div>
            {entry.q1 && <div><strong>Мешало:</strong> {entry.q1}</div>}
            {entry.q2 && <div><strong>Сделал:</strong> {entry.q2}</div>}
            {entry.q3 && <div><strong>Завтра:</strong> {entry.q3}</div>}
          </div>
        ))}
        <Nav />
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
              <button key={t.name} className="option-btn" onClick={() => addHabit(t.name, t.firstStep)}>
                <div style={{ fontWeight: 600 }}>{t.name}</div>
                <div style={{ fontSize: 13, opacity: 0.7, marginTop: 2 }}>{t.firstStep}</div>
              </button>
            ))}
          </div>
        </div>
        <div className="form">
          <p style={{ fontSize: 14, opacity: 0.7 }}>Или создай свою:</p>
          <label>Название</label>
          <input type="text" value={newHabitName} onChange={e => setNewHabitName(e.target.value)} placeholder="Медитация" />
          <label>Первый шаг</label>
          <input type="text" value={newFirstStep} onChange={e => setNewFirstStep(e.target.value)} placeholder="Сесть и закрыть глаза" />
          <button className="main-button" onClick={() => addHabit(newHabitName, newFirstStep)}>Сохранить</button>
          <button className="back-button" onClick={() => setScreen('main')}>← Отмена</button>
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
          <button className="option-btn" onClick={() => startChain('no_energy')}>Совсем нет сил</button>
          <button className="option-btn" onClick={() => startChain('dont_know')}>Не знаю, с чего начать</button>
          <button className="option-btn" onClick={() => startChain('scared')}>Страшно / не хочется делать плохо</button>
          <button className="option-btn" onClick={() => startChain('distracted')}>Хочется отвлечься</button>
          <button className="option-btn" onClick={() => startChain('just_lazy')}>Просто лень без причины</button>
        </div>
        <button className="back-button" onClick={() => setScreen('main')}>← Назад</button>
      </div>
    )
  }

  // ===== Цепочка =====
  if (screen === 'chain') {
    const step = currentChain[currentStep]
    if (!step) return null
    return (
      <div className="app">
        <div style={{ marginBottom: 8, opacity: 0.6, fontSize: 14 }}>Шаг {currentStep + 1} из {currentChain.length}</div>
        <h2>{step.title}</h2>
        <p>{step.desc}</p>
        <button className="main-button" onClick={() => {
          if (currentStep < currentChain.length - 1) setCurrentStep(currentStep + 1)
          else { setScreen('main'); setCurrentStep(0) }
        }}>
          {currentStep < currentChain.length - 1 ? 'Сделал' : 'Готово!'}
        </button>
        <button className="back-button" onClick={() => setScreen('lazy')}>← Назад</button>
      </div>
    )
  }
// ===== Полный календарь =====
if (showFullCalendar) {
  const year = currentMonth.getFullYear()
  const month = currentMonth.getMonth()
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const startDay = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1 // понедельник = 0
  const daysInMonth = lastDay.getDate()

  const monthNames = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 
                      'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь']

  const days = []
  for (let i = 0; i < startDay; i++) days.push(null)
  for (let i = 1; i <= daysInMonth; i++) days.push(i)

  return (
    <div className="app">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <button 
          onClick={() => setCurrentMonth(new Date(year, month - 1, 1))}
          style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: 20, cursor: 'pointer' }}
        >
          ←
        </button>
        <h2 style={{ margin: 0 }}>{monthNames[month]} {year}</h2>
        <button 
          onClick={() => setCurrentMonth(new Date(year, month + 1, 1))}
          style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: 20, cursor: 'pointer' }}
        >
          →
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6, marginBottom: 12 }}>
        {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map(d => (
          <div key={d} style={{ textAlign: 'center', fontSize: 12, opacity: 0.5 }}>{d}</div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6 }}>
        {days.map((day, idx) => {
          if (!day) return <div key={`empty-${idx}`} />

          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
          const isActive = streakDays.includes(dateStr)
          const isToday = dateStr === new Date().toISOString().slice(0, 10)

          return (
            <div 
              key={dateStr}
              style={{
                height: 40,
                borderRadius: 10,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 14,
                fontWeight: isToday ? 700 : 500,
                background: isActive ? '#22c55e' : 'rgba(255,255,255,0.06)',
                color: isActive ? '#fff' : 'rgba(255,255,255,0.8)',
                border: isToday ? '2px solid #60a5fa' : 'none'
              }}
            >
              {day}
            </div>
          )
        })}
      </div>

      <div style={{ marginTop: 24, display: 'flex', gap: 16, fontSize: 13, opacity: 0.7 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 14, height: 14, borderRadius: 4, background: '#22c55e' }} />
          Был стрик
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 14, height: 14, borderRadius: 4, background: 'rgba(255,255,255,0.1)' }} />
          Нет активности
        </div>
      </div>

      <button className="back-button" onClick={() => setShowFullCalendar(false)} style={{ marginTop: 24 }}>
        ← Назад
      </button>
    </div>
  )
}
  return null
}

export default App
import { useEffect, useState } from 'react'
import WebApp from '@twa-dev/sdk'
import './App.css'
import { supabase } from './supabase'
const tg = window.Telegram?.WebApp
function App() {
  const [skipTapCount, setSkipTapCount] = useState({})
  const [user, setUser] = useState(null)
  const [statsPeriod, setStatsPeriod] = useState('week') 
const [statsData, setStatsData] = useState(null)
  const [streakDays, setStreakDays] = useState([])
  const [screen, setScreen] = useState('loading')
const [showFullCalendar, setShowFullCalendar] = useState(false)
const [currentMonth, setCurrentMonth] = useState(new Date())
const [selectedDate, setSelectedDate] = useState(null)
const [selectedDayHabits, setSelectedDayHabits] = useState([])
const [ritualType, setRitualType] = useState(null) // 'morning' | 'evening' | null
const [currentStep, setCurrentStep] = useState(0)
const [newDuration, setNewDuration] = useState(15)
const [newTime, setNewTime] = useState('')
const [newPriority, setNewPriority] = useState('normal')
const [timerHabit, setTimerHabit] = useState(null)
const [timerSeconds, setTimerSeconds] = useState(0)
const [timerRunning, setTimerRunning] = useState(false)
  const [habits, setHabits] = useState([])
  const [isLoaded, setIsLoaded] = useState(false)
  const [newHabitName, setNewHabitName] = useState('')
  const [newFirstStep, setNewFirstStep] = useState('')
  const [streak, setStreak] = useState(0)
  const [diaryEntries, setDiaryEntries] = useState([])
      const [diaryWeekOffset, setDiaryWeekOffset] = useState(0) 
const [selectedDiaryDate, setSelectedDiaryDate] = useState(
  () => new Date().toISOString().slice(0, 10)
)
const [showDiaryForm, setShowDiaryForm] = useState(false)
const [editingEntryId, setEditingEntryId] = useState(null)
const [diaryAnswers, setDiaryAnswers] = useState({
  q1: '',
  q2: '',
  q3: '',
  gratitude: '',
  free_thoughts: '',
  rating_done: '',
  rating_improve: '',
  tags: ''
})
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
  { name: 'Начать работу', firstStep: 'Открыть ноутбук и написать одно предложение', duration: 25, priority: 'high' },
  { name: 'Физическая активность', firstStep: 'Встать и сделать 5 приседаний', duration: 10, priority: 'normal' },
  { name: 'Навести порядок', firstStep: 'Убрать 3 вещи на место', duration: 10, priority: 'normal' },
  { name: 'Чтение', firstStep: 'Открыть книгу и прочитать 1 страницу', duration: 15, priority: 'normal' },
  { name: 'Меньше телефона', firstStep: 'Поставить телефон экраном вниз на 2 минуты', duration: 5, priority: 'high' },
  { name: 'Ранний подъём', firstStep: 'Сразу встать с кровати', duration: 5, priority: 'high' },
]

 // Загрузка данных
useEffect(() => {
  const init = async () => {
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
const thirtyDaysAgo = new Date()
thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
const fromDate = thirtyDaysAgo.toISOString().slice(0, 10)

const { data: activityLogs } = await supabase
  .from('habit_logs')
  .select('completed_at')
  .eq('telegram_id', tgUser.id)
  .gte('completed_at', fromDate)

const activeDates = new Set((activityLogs || []).map(l => l.completed_at))
setStreakDays(Array.from(activeDates))

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
.select('habit_id, focus_seconds, status')
  .eq('telegram_id', tgUser.id)
  .eq('completed_at', today)

const logsByHabit = {}
;(logs || []).forEach(l => {
  logsByHabit[l.habit_id] = l
})
const habitsWithStatus = (habitsData || []).map(h => {
  const log = logsByHabit[h.id]
  const focus = log?.focus_seconds || 0
  const total = (h.duration_minutes || 15) * 60
  const isDone = log?.status === 'done' || (total > 0 && focus >= total)
  const isSkipped = log?.status === 'skipped'
  const progress = isDone
    ? 100
    : (total > 0 ? Math.min(100, Math.round((focus / total) * 100)) : 0)
  return {
    ...h,
    focusSeconds: focus,
    progress,
    doneToday: isDone,
    skipped: isSkipped
  }
})

/*
  const doneIds = new Set((logs || []).map(l => l.habit_id))
  const habitsWithStatus = (habitsData || []).map(h => ({
    ...h,
    doneToday: doneIds.has(h.id)
  }))
    */

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

// Стрик: только подряд идущие дни с выполненными привычками
const { data: doneLogs } = await supabase
  .from('habit_logs')
  .select('completed_at, focus_seconds, status, habits(duration_minutes)')
  .eq('telegram_id', tgUser.id)
  .order('completed_at', { ascending: false })
  .limit(90)

const doneSet = new Set()
;(doneLogs || []).forEach(l => {
  const dur = (l.habits?.duration_minutes || 15) * 60
  const ok = l.status === 'done' || ((l.focus_seconds || 0) >= dur && dur > 0)
  if (ok) doneSet.add(l.completed_at)
})

let calcStreak = 0
const cursor = new Date()
cursor.setHours(12, 0, 0, 0)

for (let i = 0; i < 60; i++) {
  const ds = cursor.toISOString().slice(0, 10)
  if (doneSet.has(ds)) {
    calcStreak++
    cursor.setDate(cursor.getDate() - 1)
  } else if (i === 0) {
    // сегодня ещё нет выполнения — смотрим вчера, стрик не рвём до проверки вчера
    cursor.setDate(cursor.getDate() - 1)
  } else {
    break
  }
}

setStreak(calcStreak)

// синхронизируем в users
await supabase
  .from('users')
  .update({ streak: calcStreak })
  .eq('telegram_id', tgUser.id)
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
  // Таймер
useEffect(() => {
  let interval = null

  if (timerRunning && timerSeconds > 0) {
    interval = setInterval(() => {
      setTimerSeconds(prev => prev - 1)
    }, 1000)
} else if (timerRunning && timerSeconds === 0 && timerHabit) {
  setTimerRunning(false)
  if (timerHabit._quick) {
    saveFocusProgress(timerHabit, 2 * 60) // → 100% через isQuickComplete
  } else {
    const total = (timerHabit.duration_minutes || 15) * 60
    saveFocusProgress(timerHabit, total)
  }
  setTimerHabit(null)
  setScreen('main')
}

  return () => {
    if (interval) clearInterval(interval)
  }
}, [timerRunning, timerSeconds])
const openHabitTimer = (habit) => {
  const isQuick = !!habit._quick
  const total = isQuick ? 2 * 60 : (habit.duration_minutes || 15) * 60
  const alreadySpent = habit.focusSeconds || 0
  const remaining = isQuick
    ? 2 * 60
    : Math.max(0, total - alreadySpent)

  setTimerHabit(habit)
  setTimerSeconds(remaining > 0 ? remaining : total)
  setTimerRunning(false)
  setScreen('timer')
}
  const finishOnboarding = () => {
    localStorage.setItem('onboardingDone', 'true')
    setScreen('main')
  }

const addHabit = async (name, firstStep, duration = 15, time = null, priority = 'normal') => {
  if (!name?.trim() || !firstStep?.trim()) {
    alert('Заполни название и первый шаг')
    return
  }

  const alreadyExists = habits.some(h => 
    h.name.trim().toLowerCase() === name.trim().toLowerCase()
  )
  if (alreadyExists) {
    alert('Такая привычка уже есть')
    return
  }

  const telegram = window.Telegram?.WebApp
  const tgUser = telegram?.initDataUnsafe?.user || user

  if (!tgUser?.id) {
    alert('Не удалось получить данные пользователя Telegram')
    return
  }

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
        duration_minutes: duration,
        planned_time: time || null,
        priority: priority,
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
    setNewDuration(15)
    setNewTime('')
    setNewPriority('normal')
    
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
const saveFocusProgress = async (habit, secondsSpent) => {
  const telegram = window.Telegram?.WebApp
  const tgUser = telegram?.initDataUnsafe?.user || user
  if (!tgUser?.id || !habit) return

  const today = new Date().toISOString().slice(0, 10)
const realDuration =
  habits.find(h => h.id === habit.id)?.duration_minutes ||
  habit.duration_minutes ||
  15
const total = realDuration * 60

// Режим «2 минуты»: 100% по статусу, в фокус — реальное время
const isQuickComplete = !!habit._quick && secondsSpent >= 118
const added = Math.max(0, secondsSpent)
const newFocus = Math.min(total, (habit.focusSeconds || 0) + added)
const progress = isQuickComplete
  ? 100
  : Math.min(100, Math.round((newFocus / total) * 100))
const status = isQuickComplete || progress >= 100 ? 'done' : 'progress'

  const { error } = await supabase
    .from('habit_logs')
    .upsert({
      habit_id: habit.id,
      telegram_id: tgUser.id,
      completed_at: today,
      focus_seconds: newFocus,
      status
    }, { onConflict: 'habit_id,completed_at' })

  if (error) {
    await supabase.from('habit_logs').delete()
      .eq('habit_id', habit.id)
      .eq('completed_at', today)

    await supabase.from('habit_logs').insert({
      habit_id: habit.id,
      telegram_id: tgUser.id,
      completed_at: today,
      focus_seconds: newFocus,
      status
    })
  }

  setHabits(prev => prev.map(h => {
    if (h.id !== habit.id) return h
    return {
      ...h,
      focusSeconds: newFocus,
      progress,
      doneToday: progress >= 100,
      skipped: false
    }
  }))


if (newFocus > 0) {
    setStreakDays(prev => prev.includes(today) ? prev : [...prev, today])
  }

  if (progress >= 100) {
    const lastActive = localStorage.getItem('lastActiveDate')
    const todayStr = new Date().toDateString()

    if (lastActive !== todayStr) {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const newStreak = lastActive === yesterday.toDateString() ? streak + 1 : 1
      setStreak(newStreak)
      localStorage.setItem('lastActiveDate', todayStr)

      if (tgUser?.id) {
        supabase.from('users').update({
          streak: newStreak,
          last_active_date: today
        }).eq('telegram_id', tgUser.id)
      }
    }
  }
}
const skipHabit = async (habit) => {
  const telegram = window.Telegram?.WebApp
  const tgUser = telegram?.initDataUnsafe?.user || user
  if (!tgUser?.id || !habit) return

  const today = new Date().toISOString().slice(0, 10)

  // Удаляем старую запись если есть
  await supabase.from('habit_logs')
    .delete()
    .eq('habit_id', habit.id)
    .eq('completed_at', today)

  await supabase.from('habit_logs').insert({
    habit_id: habit.id,
    telegram_id: tgUser.id,
    completed_at: today,
    focus_seconds: 0,
    status: 'skipped'
  })

  setHabits(prev => prev.map(h => {
    if (h.id !== habit.id) return h
    return {
      ...h,
      focusSeconds: 0,
      progress: 0,
      doneToday: false,
      skipped: true
    }
  }))
setStreakDays(prev => prev.includes(today) ? prev : [...prev, today])

  // после пропуска — мягкий вход в цепочку
  setScreen('lazy')
}
const unskipHabit = async (habit) => {
  const telegram = window.Telegram?.WebApp
  const tgUser = telegram?.initDataUnsafe?.user || user
  if (!tgUser?.id || !habit) return

  const today = new Date().toISOString().slice(0, 10)

  await supabase.from('habit_logs')
    .delete()
    .eq('habit_id', habit.id)
    .eq('completed_at', today)

  setHabits(prev => prev.map(h => {
    if (h.id !== habit.id) return h
    return {
      ...h,
      focusSeconds: 0,
      progress: 0,
      doneToday: false,
      skipped: false
    }
  }))
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
    if (editingEntryId) {
      const { data, error } = await supabase
        .from('diary_entries')
       .update({
  q1: diaryAnswers.q1 || null,
  q2: diaryAnswers.q2 || null,
  q3: diaryAnswers.q3 || null,
  gratitude: diaryAnswers.gratitude || null,
  free_thoughts: diaryAnswers.free_thoughts || null,
rating_done: (() => {
  const n = Number(diaryAnswers.rating_done)
  if (!n || isNaN(n)) return null
  return Math.min(10, Math.max(1, Math.round(n)))
})(),
rating_improve: (() => {
  const n = Number(diaryAnswers.rating_improve)
  if (!n || isNaN(n)) return null
  return Math.min(10, Math.max(1, Math.round(n)))
})(),
  tags: diaryAnswers.tags
    ? diaryAnswers.tags.split(',').map(t => t.trim()).filter(Boolean)
    : null
})
        .eq('id', editingEntryId)
        .select()
        .single()

      if (error) {
        alert('Не удалось обновить: ' + error.message)
        return
      }
      setDiaryEntries(prev => prev.map(e => e.id === editingEntryId ? data : e))
    } else {
      const { data, error } = await supabase
        .from('diary_entries')
       .insert({
  telegram_id: tgUser.id,
  q1: diaryAnswers.q1 || null,
  q2: diaryAnswers.q2 || null,
  q3: diaryAnswers.q3 || null,
  gratitude: diaryAnswers.gratitude || null,
  free_thoughts: diaryAnswers.free_thoughts || null,
rating_done: (() => {
  const n = Number(diaryAnswers.rating_done)
  if (!n || isNaN(n)) return null
  return Math.min(10, Math.max(1, Math.round(n)))
})(),
rating_improve: (() => {
  const n = Number(diaryAnswers.rating_improve)
  if (!n || isNaN(n)) return null
  return Math.min(10, Math.max(1, Math.round(n)))
})(),
  tags: diaryAnswers.tags
    ? diaryAnswers.tags.split(',').map(t => t.trim()).filter(Boolean)
    : null,
  entry_date: selectedDiaryDate || new Date().toISOString().slice(0, 10)
})
        .select()
        .single()

      if (error) {
        alert('Не удалось сохранить: ' + error.message)
        return
      }
      setDiaryEntries(prev => [data, ...prev])
    }

setDiaryAnswers({
  q1: '', q2: '', q3: '',
  gratitude: '', free_thoughts: '',
  rating_done: '', rating_improve: '', tags: ''
})
    setEditingEntryId(null)
    setShowDiaryForm(false)
  } catch (err) {
    console.error(err)
    alert('Произошла ошибка')
  }
}
const deleteDiaryEntry = async (id) => {
  if (!confirm('Удалить запись?')) return
  const { error } = await supabase.from('diary_entries').delete().eq('id', id)
  if (error) {
    alert('Не удалось удалить')
    return
  }
  setDiaryEntries(prev => prev.filter(e => e.id !== id))
}

const startEditEntry = (entry) => {
  setEditingEntryId(entry.id)
  setSelectedDiaryDate(entry.entry_date || entry.created_at?.slice(0, 10))
  setDiaryAnswers({
    q1: entry.q1 || '',
    q2: entry.q2 || '',
    q3: entry.q3 || '',
    gratitude: entry.gratitude || '',
    free_thoughts: entry.free_thoughts || '',
    rating_done: entry.rating_done ?? '',
    rating_improve: entry.rating_improve ?? '',
    tags: Array.isArray(entry.tags) ? entry.tags.join(', ') : (entry.tags || '')
  })
  setShowDiaryForm(true)
}
  const startChain = (type) => {
    setCurrentChain(chains[type])
    setCurrentStep(0)
    setScreen('chain')
  }
const openDay = async (dateStr) => {
  setSelectedDate(dateStr)
  setSelectedDayHabits([]) // сразу чистим старый список

  const telegram = window.Telegram?.WebApp
  const tgUser = telegram?.initDataUnsafe?.user || user
  if (!tgUser?.id) return

  const { data, error } = await supabase
    .from('habit_logs')
    .select('habit_id, focus_seconds, status, habits(name, first_step, duration_minutes)')
    .eq('telegram_id', tgUser.id)
    .eq('completed_at', dateStr)

  if (error) {
    console.error('openDay error:', error)
    return
  }

  // только если день всё ещё выбран
  setSelectedDate(current => {
    if (current === dateStr) {
      setSelectedDayHabits(data || [])
    }
    return current
  })
}
const loadStats = async (period = 'week') => {
  const telegram = window.Telegram?.WebApp
  const tgUser = telegram?.initDataUnsafe?.user || user
  if (!tgUser?.id) return

  const now = new Date()
  let fromDate = new Date()

  if (period === 'week') {
    const day = now.getDay() || 7
    fromDate.setDate(now.getDate() - day + 1)
  } else if (period === 'month') {
    fromDate = new Date(now.getFullYear(), now.getMonth(), 1)
  } else {
    fromDate = new Date(now.getFullYear(), 0, 1)
  }

  const from = fromDate.toISOString().slice(0, 10)
  const to = now.toISOString().slice(0, 10)

  const { data: logs } = await supabase
    .from('habit_logs')
    .select('habit_id, focus_seconds, status, completed_at, habits(name, duration_minutes)')
    .eq('telegram_id', tgUser.id)
    .gte('completed_at', from)
    .lte('completed_at', to)

  const list = logs || []

const isDone = (l) => {
  if (l.status === 'done') return true
  const dur = (l.habits?.duration_minutes || 15) * 60
  return (l.focus_seconds || 0) >= dur && dur > 0
}

const totalFocus = list.reduce((s, l) => s + (l.focus_seconds || 0), 0)
const done = list.filter(isDone).length
const skipped = list.filter(l => l.status === 'skipped').length
const partial = list.filter(l => !isDone(l) && l.status !== 'skipped' && (l.focus_seconds || 0) > 0).length
const totalTasks = done + skipped + partial
const productivity = totalTasks > 0 ? Math.round((done / totalTasks) * 100) : 0

// серия подряд
const doneDates = [...new Set(
  list.filter(isDone).map(l => l.completed_at)
)].sort().reverse()

let streakCount = 0
let cursor = new Date()
cursor.setHours(12, 0, 0, 0)

for (let i = 0; i < 60; i++) {
  const ds = cursor.toISOString().slice(0, 10)
  if (doneDates.includes(ds)) {
    streakCount++
    cursor.setDate(cursor.getDate() - 1)
  } else if (i === 0) {
    // сегодня ещё нет — смотрим вчера
    cursor.setDate(cursor.getDate() - 1)
  } else {
    break
  }
}

// фокус по дням недели
const byDay = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 0: 0 }
list.forEach(l => {
  const d = new Date(l.completed_at + 'T12:00:00')
  const wd = d.getDay()
  byDay[wd] = (byDay[wd] || 0) + (l.focus_seconds || 0)
})

// по привычкам
const byHabit = {}
list.forEach(l => {
  const id = l.habit_id
  if (!byHabit[id]) {
    byHabit[id] = {
      name: l.habits?.name || 'Привычка',
      focus: 0,
      done: 0,
      total: 0,
      duration: (l.habits?.duration_minutes || 15) * 60
    }
  }
  byHabit[id].focus += l.focus_seconds || 0
  byHabit[id].total += 1
  if (isDone(l)) byHabit[id].done += 1
})

const habitsStats = Object.values(byHabit).map(h => ({
  ...h,
  percent: h.total > 0 ? Math.round((h.done / h.total) * 100) : 0
})).sort((a, b) => b.percent - a.percent)

setStatsData({
  totalFocus,
  done,
  skipped,
  partial,
  totalTasks,
  productivity,
  streakCount,
  byDay,
  habitsStats,
  from,
  to
})
}
const formatFocus = (seconds) => {
  const totalMin = Math.round((seconds || 0) / 60)
  if (totalMin <= 0) return '—'
  if (totalMin < 60) return `${totalMin}м`
  const h = Math.floor(totalMin / 60)
  const m = totalMin % 60
  return m > 0 ? `${h}ч ${m}м` : `${h}ч`
}
const todayKey = () => new Date().toISOString().slice(0, 10)

const isRitualDone = (type) => {
  return localStorage.getItem(`ritual_${type}_${todayKey()}`) === '1'
}

const markRitualDone = (type) => {
  localStorage.setItem(`ritual_${type}_${todayKey()}`, '1')
}

const getSuggestedRitual = () => {
  const hour = new Date().getHours()
  if (hour >= 5 && hour < 12 && !isRitualDone('morning')) return 'morning'
  if (hour >= 18 && hour < 24 && !isRitualDone('evening')) return 'evening'
  return null
}
  // ===== Нижняя навигация =====
  const Nav = () => (
  <div className="nav">
    <button
      className={['main', 'lazy', 'chain', 'add', 'timer'].includes(screen) ? 'nav-item active' : 'nav-item'}
      onClick={() => setScreen('main')}
    >
      Сегодня
    </button>
    <button
      className={screen === 'stats' ? 'nav-item active' : 'nav-item'}
      onClick={() => {
        setScreen('stats')
        loadStats(statsPeriod)
      }}
    >
      Статистика
    </button>
    <button
      className={screen === 'diary' ? 'nav-item active' : 'nav-item'}
      onClick={() => setScreen('diary')}
    >
      Дневник
    </button>
  </div>
)
// ===== Полный календарь =====
if (showFullCalendar) {
  const year = currentMonth.getFullYear()
  const month = currentMonth.getMonth()
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const startDay = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1
  const daysInMonth = lastDay.getDate()

  const monthNames = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 
                      'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь']

  const days = []
  for (let i = 0; i < startDay; i++) days.push(null)
  for (let i = 1; i <= daysInMonth; i++) days.push(i)

  return (
    <div className="app" style={{ width: '100%', maxWidth: 480, boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, width: '100%' }}>
        <button 
          onClick={() => setCurrentMonth(new Date(year, month - 1, 1))}
          style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: 22, cursor: 'pointer' }}
        >
          ←
        </button>
        <h2 style={{ margin: 0, fontSize: 20 }}>{monthNames[month]} {year}</h2>
        <button 
          onClick={() => setCurrentMonth(new Date(year, month + 1, 1))}
          style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: 22, cursor: 'pointer' }}
        >
          →
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6, marginBottom: 10 }}>
        {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map(d => (
          <div key={d} style={{ textAlign: 'center', fontSize: 12, opacity: 0.5 }}>{d}</div>
        ))}
      </div>

    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6, width: '100%' }}>
  {days.map((day, idx) => {
if (!day) return (
  <div
    key={`empty-${idx}`}
    style={{ height: 54 }}
  />
)
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    const isActive = streakDays.includes(dateStr)
    const isToday = dateStr === new Date().toISOString().slice(0, 10)
    const isSelected = selectedDate === dateStr

    // Определяем, относится ли день к текущей неделе
    const today = new Date()
    const current = new Date(dateStr)
    const startOfWeek = new Date(today)
    startOfWeek.setDate(today.getDate() - (today.getDay() === 0 ? 6 : today.getDay() - 1))
    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(startOfWeek.getDate() + 6)
    const isCurrentWeek = current >= startOfWeek && current <= endOfWeek

    return (
      <div 
        key={dateStr}
        onClick={() => openDay(dateStr)}
        style={{
          height: 54,
          borderRadius: 12,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 14,
          fontWeight: isToday || isSelected ? 700 : 500,
          background: isSelected 
            ? 'rgba(139, 92, 246, 0.35)' 
            : isCurrentWeek 
              ? 'rgba(139, 92, 246, 0.08)' 
              : isActive 
                ? 'rgba(34, 197, 94, 0.12)' 
                : 'rgba(255,255,255,0.03)',
          color: isActive ? '#4ade80' : 'rgba(255,255,255,0.8)',
          border: isToday 
            ? '2px solid #a78bfa' 
            : isSelected 
              ? '1px solid #a78bfa' 
              : '1px solid transparent',
          cursor: 'pointer',
          gap: 4
        }}
      >
        <div>{day}</div>
        
        {/* Точки статуса */}
        <div style={{ display: 'flex', gap: 3, height: 6 }}>
          {isActive ? (
            <>
              <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#22c55e' }} />
              <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#22c55e' }} />
            </>
          ) : (
            <div style={{ width: 5, height: 5, borderRadius: '50%', background: 'rgba(255,255,255,0.12)' }} />
          )}
        </div>
      </div>
    )
  })}
</div>

  <div style={{
    marginTop: 24,
    width: '100%',
    minHeight: 180,
    boxSizing: 'border-box'
  }}>
  {!selectedDate ? (
<div style={{
      minHeight: 180,
      width: '100%',
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      opacity: 0.45,
      gap: 8,
      borderRadius: 16,
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(255,255,255,0.04)'
    }}>
      <div style={{ fontSize: 28 }}>📅</div>
      <div style={{ fontSize: 14 }}>Выбери день</div>
    </div>
  ) : (
<div style={{ width: '100%', boxSizing: 'border-box' }}>
    {/* Заголовок дня */}
    <div style={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center',
      marginBottom: 16 
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          background: 'rgba(139, 92, 246, 0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 18
        }}>
          📅
        </div>
        <div>
          <div style={{ fontWeight: 600, fontSize: 16 }}>
            {new Date(selectedDate).toLocaleDateString('ru-RU', { weekday: 'long' })}
          </div>
          <div style={{ fontSize: 13, opacity: 0.6 }}>
            {selectedDate}
          </div>
        </div>
      </div>
      {selectedDate === new Date().toISOString().slice(0, 10) && (
        <div style={{
          background: 'rgba(139, 92, 246, 0.15)',
          color: '#c4b5fd',
          fontSize: 12,
          padding: '4px 10px',
          borderRadius: 20
        }}>
          Сегодня
        </div>
      )}
    </div>
{/* Сводка */}
{(() => {
const totalFocus = selectedDayHabits.reduce((sum, item) => sum + (item.focus_seconds || 0), 0)
const focusMin = Math.round(totalFocus / 60)

const completed = selectedDayHabits.filter(item => {
  if (item.status === 'skipped') return false
  if (item.status === 'done') return true
  const dur = (item.habits?.duration_minutes || 15) * 60
  return (item.focus_seconds || 0) >= dur
}).length

const partial = selectedDayHabits.filter(item => {
  if (item.status === 'skipped' || item.status === 'done') return false
  const dur = (item.habits?.duration_minutes || 15) * 60
  const f = item.focus_seconds || 0
  return f > 0 && f < dur
}).length

const skipped = selectedDayHabits.filter(item => item.status === 'skipped').length

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: 8,
      marginBottom: 20
    }}>
      <div style={{ textAlign: 'center', padding: '10px 4px', background: 'rgba(34,197,94,0.1)', borderRadius: 12 }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: '#4ade80' }}>{completed}</div>
        <div style={{ fontSize: 11, opacity: 0.7, marginTop: 2 }}>Выполнено</div>
      </div>
      <div style={{ textAlign: 'center', padding: '10px 4px', background: 'rgba(139,92,246,0.1)', borderRadius: 12 }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: '#a78bfa' }}>{partial}</div>
        <div style={{ fontSize: 11, opacity: 0.7, marginTop: 2 }}>Частично</div>
      </div>
      <div style={{ textAlign: 'center', padding: '10px 4px', background: 'rgba(249,115,22,0.1)', borderRadius: 12 }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: '#fb923c' }}>{skipped}</div>
        <div style={{ fontSize: 11, opacity: 0.7, marginTop: 2 }}>Пропущено</div>
      </div>
      <div style={{ textAlign: 'center', padding: '10px 4px', background: 'rgba(59,130,246,0.1)', borderRadius: 12 }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: '#60a5fa' }}>
       {formatFocus(totalFocus)}
        </div>
        <div style={{ fontSize: 11, opacity: 0.7, marginTop: 2 }}>Фокус</div>
      </div>
    </div>
  )
})()}

{/* Список привычек за день */}
{selectedDayHabits.length === 0 ? (
 <div style={{
    width: '100%',
    boxSizing: 'border-box',
    textAlign: 'center',
    padding: '28px 16px',
    borderRadius: 16,
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.04)',
    opacity: 0.7
  }}>
    <div style={{ fontSize: 14 }}>В этот день привычки не отмечались</div>
  </div>
) : (
  selectedDayHabits.map((item, idx) => {
    const name = (item.habits?.name || '').toLowerCase()
    let icon = '⚡'
    let color = '#a78bfa'

    if (name.includes('работ') || name.includes('проект') || name.includes('ноутбук')) {
      icon = '💻'; color = '#60a5fa'
    } else if (name.includes('чтение') || name.includes('книг')) {
      icon = '📖'; color = '#c084fc'
    } else if (name.includes('тренир') || name.includes('присед') || name.includes('физич') || name.includes('спорт')) {
      icon = '💪'; color = '#34d399'
    } else if (name.includes('медита') || name.includes('дыхан')) {
      icon = '🧘'; color = '#a78bfa'
    } else if (name.includes('порядок') || name.includes('убор')) {
      icon = '✨'; color = '#fbbf24'
    } else if (name.includes('телефон') || name.includes('экран')) {
      icon = '📱'; color = '#f472b6'
    } else if (name.includes('подъём') || name.includes('утр')) {
      icon = '🌅'; color = '#fb923c'
    } else if (name.includes('вод')) {
      icon = '💧'; color = '#38bdf8'
    }

    const total = (item.habits?.duration_minutes || 15) * 60
    const focus = item.focus_seconds || 0
    const isDone = item.status === 'done' || (total > 0 && focus >= total)
    const progress = isDone
      ? 100
      : (total > 0 ? Math.min(100, Math.round((focus / total) * 100)) : 0)
    const focusMin = Math.round(focus / 60)
    return (
      <div 
        key={`${item.habit_id}-${selectedDate}`}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          padding: '14px 16px',
          width: '100%',
          boxSizing: 'border-box',
          background: 'rgba(255,255,255,0.04)',
          borderRadius: 16,
          marginBottom: 10,
          borderLeft: `3px solid ${color}`
        }}
      >
        <div style={{
          width: 42,
          height: 42,
          borderRadius: 14,
          background: `${color}22`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 20
        }}>
          {icon}
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600, fontSize: 15 }}>
            {item.habits?.name || 'Привычка'}
          </div>
          <div style={{ fontSize: 12, opacity: 0.5, marginTop: 2 }}>
        {focus > 0 ? `Фокус: ${formatFocus(focus)}` : (item.habits?.first_step || '')}
          </div>
        </div>

{/* Кружок прогресса */}
<div style={{
  width: 36,
  height: 36,
  borderRadius: '50%',
  background: item.status === 'skipped'
    ? 'conic-gradient(#fb923c 100%, rgba(255,255,255,0.08) 0)'
    : `conic-gradient(${
        progress >= 100 ? '#22c55e' :
        progress >= 50 ? '#a78bfa' :
        progress > 0 ? '#fb923c' : 'rgba(255,255,255,0.12)'
      } ${progress}%, rgba(255,255,255,0.08) 0)`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
}}>
  <div style={{
    width: 26,
    height: 26,
    borderRadius: '50%',
    background: '#1c1c22',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: item.status === 'skipped' || progress >= 100 ? 13 : 10,
    fontWeight: 700,
    color: item.status === 'skipped' ? '#fb923c' : progress >= 100 ? '#4ade80' : '#e2e8f0'
  }}>
    {item.status === 'skipped' ? '⏭' : progress >= 100 ? '✓' : `${progress}%`}
  </div>
</div>
      </div>
    )
  })
)}
  </div>
  )}
  </div>

      <button className="back-button" 
      onClick={() => {
        setShowFullCalendar(false)
        setSelectedDate(null)
        setSelectedDayHabits([])
      }} style={{ marginTop: 16 }}>
        ← Назад
      </button>
    </div>
  )
}
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
               onClick={() => addHabit(t.name, t.firstStep, t.duration, null, t.priority)}
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
  if (screen === 'loading' || !isLoaded) {
  return (
    <div className="app" style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '80vh'
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 36, marginBottom: 12 }}>⚡</div>
        <div style={{ opacity: 0.5, fontSize: 14 }}>Загрузка...</div>
      </div>
    </div>
  )
}
  if (screen === 'main') {
    return (
      <div className="app">
        <h1>Первый шаг</h1>
        <p>Трекер против лени и прокрастинации</p>

  <div className="user-info">
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
    <div>
      {user ? <>Привет, <strong>{user.first_name}</strong>!</> : <>Привет!</>}
    </div>
  </div>
{/* Стрик */}
<div style={{
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  marginBottom: 14,
  padding: '12px 14px',
  background: 'rgba(251, 146, 60, 0.12)',
  borderRadius: 14
}}>
  <div style={{
    width: 40,
    height: 40,
    borderRadius: 12,
    background: 'rgba(251, 146, 60, 0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 22,
    flexShrink: 0
  }}>
    🔥
  </div>
  <div style={{ minWidth: 0 }}>
    <div style={{
      fontWeight: 700,
      fontSize: 17,
      color: '#fb923c',
      lineHeight: 1.2,
      fontVariantNumeric: 'tabular-nums'
    }}>
      {streak} {streak === 1 ? 'день' : streak >= 2 && streak <= 4 ? 'дня' : 'дней'}
    </div>
    <div style={{ fontSize: 12, opacity: 0.45, marginTop: 2 }}>
      серия подряд
    </div>
  </div>
</div>
  {/* Красивая неделя */}
  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 6 }}>
{Array.from({ length: 7 }).map((_, i) => {
  const d = new Date()
  d.setDate(d.getDate() - (6 - i))
  const dateStr = d.toISOString().slice(0, 10)
  const dayNum = d.getDate()
  const dayNames = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб']
  const dayName = dayNames[d.getDay()]
  const isActive = streakDays.includes(dateStr)
  const isToday = dateStr === new Date().toISOString().slice(0, 10)

  return (
    <div 
      key={dateStr}
      onClick={() => {
        setShowFullCalendar(true)
        openDay(dateStr)
      }}
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 6,
        padding: '10px 4px',
        borderRadius: 14,
        background: isToday ? 'rgba(139, 92, 246, 0.2)' : 'rgba(255,255,255,0.04)',
        border: isToday ? '1px solid rgba(139, 92, 246, 0.5)' : '1px solid transparent',
        cursor: 'pointer'
      }}
    >
      <div style={{ fontSize: 11, opacity: 0.6 }}>{dayName}</div>
      <div style={{
        fontSize: 16,
        fontWeight: isToday ? 700 : 500,
        color: isToday ? '#c4b5fd' : '#fff'
      }}>
        {dayNum}
      </div>
      <div style={{
        width: 6,
        height: 6,
        borderRadius: '50%',
        background: isActive ? '#22c55e' : 'rgba(255,255,255,0.15)'
      }} />
    </div>
  )
})}
  </div>

  <button 
    onClick={() => setShowFullCalendar(true)}
    style={{
      background: 'transparent',
      border: 'none',
      color: '#a78bfa',
      fontSize: 13,
      cursor: 'pointer',
      padding: '12px 0 0',
      width: '100%',
      textAlign: 'center'
    }}
  >
    Открыть полный календарь →
  </button>
</div>
{(() => {
  const r = getSuggestedRitual()
  if (!r) return null
  return (
    <button
      onClick={() => {
        setRitualType(r)
        setScreen('ritual')
      }}
      style={{
        width: '100%',
        marginBottom: 14,
        padding: '14px 16px',
        borderRadius: 16,
        border: 'none',
        background: r === 'morning'
          ? 'linear-gradient(135deg, rgba(251,146,60,0.2), rgba(251,146,60,0.08))'
          : 'linear-gradient(135deg, rgba(139,92,246,0.25), rgba(139,92,246,0.08))',
        color: '#fff',
        textAlign: 'left',
        cursor: 'pointer'
      }}
    >
      <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>
        {r === 'morning' ? '🌅 Утренний ритуал' : '🌙 Вечерний ритуал'}
      </div>
      <div style={{ fontSize: 13, opacity: 0.7 }}>
        {r === 'morning'
          ? '1 минута: фокус дня и первый шаг'
          : '1 минута: что вышло и что отпустить'}
      </div>
    </button>
  )
})()}

        <button className="main-button" onClick={() => setScreen('lazy')}>
          Мне сейчас лень
        </button>

        <div style={{ marginTop: 28, textAlign: 'left' }}>
          <h3 style={{ marginBottom: 12 }}>Мои привычки</h3>

{habits.length === 0 && (
  <div className="empty-state">
    <div style={{ fontSize: 40, marginBottom: 10 }}>🌱</div>
    <div style={{ fontSize: 15, marginBottom: 6 }}>Пока нет привычек</div>
    <div style={{ fontSize: 13, opacity: 0.7, marginBottom: 16 }}>
      Добавь первую — маленький шаг уже победа
    </div>
    <button className="main-button" onClick={() => setScreen('add')}>
      + Добавить привычку
    </button>
  </div>
)}
{[...habits]
  .sort((a, b) => {
    // сначала невыполненные и не пропущенные
    const aDone = a.doneToday || a.skipped ? 1 : 0
    const bDone = b.doneToday || b.skipped ? 1 : 0
    if (aDone !== bDone) return aDone - bDone
    // важные выше
    if (a.priority === 'high' && b.priority !== 'high') return -1
    if (b.priority === 'high' && a.priority !== 'high') return 1
    return 0
  })
  .map(habit => {
  const name = (habit.name || '').toLowerCase()
  let icon = '⚡'
  let color = '#a78bfa'

  if (name.includes('работ') || name.includes('проект') || name.includes('ноутбук')) {
    icon = '💻'; color = '#60a5fa'
  } else if (name.includes('чтение') || name.includes('книг')) {
    icon = '📖'; color = '#c084fc'
  } else if (name.includes('тренир') || name.includes('присед') || name.includes('физич') || name.includes('спорт')) {
    icon = '💪'; color = '#34d399'
  } else if (name.includes('медита') || name.includes('дыхан')) {
    icon = '🧘'; color = '#a78bfa'
  } else if (name.includes('порядок') || name.includes('убор')) {
    icon = '✨'; color = '#fbbf24'
  } else if (name.includes('телефон') || name.includes('экран')) {
    icon = '📱'; color = '#f472b6'
  } else if (name.includes('подъём') || name.includes('утр')) {
    icon = '🌅'; color = '#fb923c'
  } else if (name.includes('вод')) {
    icon = '💧'; color = '#38bdf8'
  }

  const durationText = habit.duration_minutes 
    ? (habit.duration_minutes >= 60 
        ? `${Math.floor(habit.duration_minutes / 60)}ч` 
        : `${habit.duration_minutes}м`)
    : null

  const timeText = habit.planned_time ? habit.planned_time.slice(0, 5) : null

 return (
  <div 
    key={habit.id}
    className="habit-card"
    onClick={() => !habit.skipped && !habit.doneToday && openHabitTimer(habit)}
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: 14,
      padding: '14px 16px',
      background: habit.skipped 
        ? 'rgba(251, 146, 60, 0.06)' 
        : 'rgba(255,255,255,0.04)',
      borderRadius: 18,
      marginBottom: 12,
      borderLeft: `3px solid ${habit.skipped ? '#fb923c' : color}`,
      borderTop: '1px solid rgba(255,255,255,0.04)',
      borderRight: '1px solid rgba(255,255,255,0.04)',
      borderBottom: '1px solid rgba(255,255,255,0.04)',
      position: 'relative',
      cursor: (habit.skipped || habit.doneToday) ? 'default' : 'pointer',
      opacity: (habit.skipped || habit.doneToday) ? 0.72 : 1,
      transition: 'background 0.15s, opacity 0.15s'
    }}
  >
    {/* Иконка */}
    <div style={{
      width: 46,
      height: 46,
      borderRadius: 14,
      background: `${color}22`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 22,
      flexShrink: 0
    }}>
      {icon}
    </div>

    {/* Контент */}
    <div style={{ flex: 1, minWidth: 0 }}>
           <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
        <div style={{ 
          fontWeight: 600, 
          fontSize: 15,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        }}>
          {habit.name}
        </div>

        {habit.priority === 'high' && (
          <div style={{
            fontSize: 11,
            background: 'rgba(239, 68, 68, 0.15)',
            color: '#f87171',
            padding: '2px 8px',
            borderRadius: 20,
            fontWeight: 600,
            flexShrink: 0
          }}>
            Важно
          </div>
        )}
      </div>

      <div style={{
        fontSize: 14,
        lineHeight: 1.4,
        color: 'rgba(255,255,255,0.85)',
        marginBottom: 8,
        fontWeight: 500,
        wordBreak: 'break-word'
      }}>
        {habit.first_step}
      </div>

      {!habit.doneToday && !habit.skipped && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            openHabitTimer({ ...habit, _quick: true })
          }}
          style={{
            fontSize: 12,
            padding: '6px 12px',
            borderRadius: 20,
            border: 'none',
            background: 'rgba(139, 92, 246, 0.2)',
            color: '#c4b5fd',
            cursor: 'pointer',
            marginBottom: 8
          }}
        >
          ⚡ 2 минуты
        </button>
      )}

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {timeText && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            fontSize: 12,
            background: 'rgba(96, 165, 250, 0.12)',
            color: '#60a5fa',
            padding: '3px 9px',
            borderRadius: 20
          }}>
            🕐 {timeText}
          </div>
        )}
        {durationText && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            fontSize: 12,
            background: 'rgba(167, 139, 250, 0.12)',
            color: '#a78bfa',
            padding: '3px 9px',
            borderRadius: 20
          }}>
            ⏱ {durationText}
          </div>
        )}
      </div>
    </div>

    {/* Прогресс + кнопки */}
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
      
      {/* Кружок прогресса */}
<div
  onClick={(e) => {
    e.stopPropagation()
    if (!habit.skipped) return
    const count = (skipTapCount[habit.id] || 0) + 1
    setSkipTapCount(prev => ({ ...prev, [habit.id]: count }))
    if (count >= 4) {
      unskipHabit(habit)
      setSkipTapCount(prev => ({ ...prev, [habit.id]: 0 }))
    }
  }}
  style={{
    width: 40,
    height: 40,
    borderRadius: '50%',
    background: habit.skipped
      ? 'conic-gradient(#fb923c 100%, rgba(255,255,255,0.08) 0)'
      : `conic-gradient(${
          (habit.progress || 0) >= 100 ? '#22c55e' :
          (habit.progress || 0) >= 50 ? '#a78bfa' :
          (habit.progress || 0) > 0 ? '#fb923c' : 'rgba(255,255,255,0.12)'
        } ${(habit.progress || 0)}%, rgba(255,255,255,0.08) 0)`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: habit.skipped ? 'pointer' : 'default'
  }}
>
        <div style={{
          width: 30,
          height: 30,
          borderRadius: '50%',
          background: '#1c1c22',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: habit.skipped || (habit.progress || 0) >= 100 ? 14 : 11,
          fontWeight: 700,
          color: habit.skipped ? '#fb923c' :
                 (habit.progress || 0) >= 100 ? '#4ade80' : 
                 (habit.progress || 0) > 0 ? '#e2e8f0' : 'rgba(255,255,255,0.4)'
        }}>
          {habit.skipped ? '⏭' : (habit.progress || 0) >= 100 ? '✓' : `${habit.progress || 0}%`}
        </div>
      </div>

{habit.skipped ? (
  <button
    onClick={(e) => {
      e.stopPropagation()
      unskipHabit(habit)
    }}
    style={{
      background: 'transparent',
      border: 'none',
      color: '#60a5fa',
      fontSize: 12,
      cursor: 'pointer',
      padding: '4px 6px'
    }}
  >
    Вернуть
  </button>
) : !habit.doneToday ? (
  <button
    onClick={(e) => {
      e.stopPropagation()
      skipHabit(habit)
    }}
    style={{
      background: 'transparent',
      border: 'none',
      color: 'rgba(251, 146, 60, 0.8)',
      fontSize: 14,
      cursor: 'pointer',
      padding: '4px 6px'
    }}
    title="Пропустить"
  >
    ⏭
  </button>
) : null}

      <button 
        onClick={(e) => {
          e.stopPropagation()
          deleteHabit(habit.id)
        }}
        style={{
          background: 'transparent',
          border: 'none',
          color: 'rgba(255,59,48,0.7)',
          fontSize: 20,
          cursor: 'pointer',
          padding: 4,
          lineHeight: 1
        }}
      >
        ×
      </button>
    </div>
  </div>
)
  
})}

          <button className="add-habit-btn" onClick={() => setScreen('add')}>+ Добавить привычку</button>
        </div>

        <Nav />
      </div>
    )
  }
// ===== Статистика =====
if (screen === 'stats') {
  const formatFocus = (sec) => {
    const m = Math.round((sec || 0) / 60)
    if (m <= 0) return '0м'
    if (m < 60) return `${m}м`
    const h = Math.floor(m / 60)
    const mins = m % 60
    return mins > 0 ? `${h}ч ${mins}м` : `${h}ч`
  }

  const d = statsData

  return (
    <div className="app" style={{ textAlign: 'left', paddingBottom: 100 }}>
      <h2 style={{ marginBottom: 4 }}>Статистика</h2>
        <p style={{
        opacity: 0.45,
        fontSize: 13,
        marginBottom: 18,
        textAlign: 'left',
        marginTop: 0
      }}>
        Фокус, серии и привычки за период
      </p>

      {/* Период */}
      <div style={{
        display: 'flex',
        gap: 8,
        marginBottom: 20,
        background: 'rgba(255,255,255,0.04)',
        borderRadius: 14,
        padding: 4
      }}>
        {[
          { id: 'week', label: 'Неделя' },
          { id: 'month', label: 'Месяц' },
          { id: 'year', label: 'Год' }
        ].map(p => (
          <button
            key={p.id}
            onClick={() => {
              setStatsPeriod(p.id)
              loadStats(p.id)
            }}
            style={{
              flex: 1,
              padding: '10px 0',
              borderRadius: 12,
              border: 'none',
                        background: statsPeriod === p.id ? '#8b5cf6' : 'transparent',
              color: statsPeriod === p.id ? '#fff' : 'rgba(255,255,255,0.5)',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'background 0.15s, color 0.15s'
            }}
          >
            {p.label}
          </button>
        ))}
      </div>

        {!d ? (
        <div style={{
          textAlign: 'center',
          padding: '48px 20px',
          opacity: 0.5
        }}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>📊</div>
          <div style={{ fontSize: 14 }}>Загрузка статистики...</div>
        </div>
      ) : d.totalTasks === 0 && d.totalFocus === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '40px 20px',
          borderRadius: 20,
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.05)'
        }}>
          <div style={{ fontSize: 32, marginBottom: 10 }}>🌱</div>
          <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>Пока пусто</div>
          <div style={{ fontSize: 13, opacity: 0.55, lineHeight: 1.4 }}>
            Отметь привычки за этот период — здесь появится прогресс
          </div>
        </div>
      ) : (
        <>
          {/* Общая картина */}
          <div style={{
            background: 'rgba(255,255,255,0.04)',
            borderRadius: 20,
            padding: 20,
            marginBottom: 16
          }}>
            <div style={{ fontWeight: 600, marginBottom: 16, fontSize: 15 }}>
              Общая картина
            </div>

            <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 20 }}>
              {/* Круг продуктивности */}
              <div style={{
                width: 100,
                height: 100,
                borderRadius: '50%',
                background: `conic-gradient(#8b5cf6 ${d.productivity}%, rgba(255,255,255,0.08) 0)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <div style={{
                  width: 78,
                  height: 78,
                  borderRadius: '50%',
                  background: '#1a1a1f',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <div style={{ fontSize: 22, fontWeight: 700 }}>{d.productivity}%</div>
                  <div style={{ fontSize: 10, opacity: 0.5 }}>Продуктивность</div>
                </div>
              </div>

              <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <div style={{ fontSize: 11, opacity: 0.5, marginBottom: 2 }}>⏱ Фокус-время</div>
                  <div style={{ fontWeight: 700, fontSize: 16 }}>{formatFocus(d.totalFocus)}</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, opacity: 0.5, marginBottom: 2 }}>✓ Выполнено</div>
                  <div style={{ fontWeight: 700, fontSize: 16 }}>{d.done} из {d.totalTasks}</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, opacity: 0.5, marginBottom: 2 }}>🔥 Серия</div>
                  <div style={{ fontWeight: 700, fontSize: 16, color: '#fb923c' }}>{d.streakCount} дн</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, opacity: 0.5, marginBottom: 2 }}>⏭ Пропущено</div>
                  <div style={{ fontWeight: 700, fontSize: 16, color: '#fb923c' }}>{d.skipped}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Фокус по дням */}
          <div style={{
            background: 'rgba(255,255,255,0.04)',
            borderRadius: 20,
            padding: 20,
            marginBottom: 16
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ fontWeight: 600, fontSize: 15 }}>Фокус-время</div>
              <div style={{ fontSize: 13, opacity: 0.6 }}>{formatFocus(d.totalFocus)}</div>
            </div>

            {(() => {
              const days = [
                { k: 1, label: 'Пн' },
                { k: 2, label: 'Вт' },
                { k: 3, label: 'Ср' },
                { k: 4, label: 'Чт' },
                { k: 5, label: 'Пт' },
                { k: 6, label: 'Сб' },
                { k: 0, label: 'Вс' }
              ]
              const maxSec = Math.max(...days.map(x => d.byDay[x.k] || 0), 1)

              return (
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 120 }}>
                  {days.map(day => {
                    const sec = d.byDay[day.k] || 0
                    const h = Math.round((sec / maxSec) * 100)
                    return (
                      <div key={day.k} style={{ flex: 1, textAlign: 'center' }}>
                        <div style={{
                          height: 100,
                          display: 'flex',
                          alignItems: 'flex-end',
                          justifyContent: 'center'
                        }}>
                          <div style={{
                            width: '70%',
                            height: `${Math.max(h, 4)}%`,
                            background: sec > 0 ? 'linear-gradient(180deg, #a78bfa, #8b5cf6)' : 'rgba(255,255,255,0.08)',
                            borderRadius: 8,
                            minHeight: 4
                          }} />
                        </div>
                        <div style={{ fontSize: 11, opacity: 0.5, marginTop: 6 }}>{day.label}</div>
                      </div>
                    )
                  })}
                </div>
              )
            })()}
          </div>

          {/* По привычкам */}
          <div style={{
            background: 'rgba(255,255,255,0.04)',
            borderRadius: 20,
            padding: 20,
            marginBottom: 16
          }}>
            <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 16 }}>
              Продуктивность по привычкам
            </div>

            {d.habitsStats.length === 0 ? (
              <p style={{ opacity: 0.5, fontSize: 13 }}>Пока нет данных</p>
            ) : (
              d.habitsStats.slice(0, 6).map((h, i) => {
                const colors = ['#22c55e', '#a78bfa', '#60a5fa', '#fb923c', '#f472b6', '#fbbf24']
                const c = colors[i % colors.length]
                return (
                  <div key={i} style={{ marginBottom: 14 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <div style={{ fontSize: 14, fontWeight: 500 }}>{h.name}</div>
                      <div style={{ fontSize: 13, color: c, fontWeight: 600 }}>{h.percent}%</div>
                    </div>
                    <div style={{
                      height: 8,
                      background: 'rgba(255,255,255,0.08)',
                      borderRadius: 8,
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        height: '100%',
                        width: `${h.percent}%`,
                        background: c,
                        borderRadius: 8
                      }} />
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </>
      )}

      <Nav />
    </div>
  )
}
// ===== Дневник =====
if (screen === 'diary') {
  // неделя
  const weekStart = new Date()
  const day = weekStart.getDay() || 7
  weekStart.setDate(weekStart.getDate() - day + 1 + diaryWeekOffset * 7)
  weekStart.setHours(12, 0, 0, 0)

  const weekDays = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(weekStart)
    d.setDate(weekStart.getDate() + i)
    const dateStr = d.toISOString().slice(0, 10)
    const hasEntry = diaryEntries.some(
      e => (e.entry_date || e.created_at?.slice(0, 10)) === dateStr
    )
    return {
      dateStr,
      dayNum: d.getDate(),
      label: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'][i],
      month: d.toLocaleDateString('ru-RU', { month: 'short' }),
      hasEntry,
      isSelected: dateStr === selectedDiaryDate,
      isToday: dateStr === new Date().toISOString().slice(0, 10)
    }
  })

  const dayEntries = diaryEntries.filter(
    e => (e.entry_date || e.created_at?.slice(0, 10)) === selectedDiaryDate
  )

  const selectedLabel = new Date(selectedDiaryDate + 'T12:00:00')
    .toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <div className="app" style={{ textAlign: 'left', paddingBottom: 100 }}>
      {/* Заголовок */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
        <div>
          <h2 style={{ margin: 0, marginBottom: 4 }}>Дневник ✎</h2>
          <p style={{ margin: 0, opacity: 0.45, fontSize: 13 }}>
            Твои мысли, идеи и прогресс
          </p>
        </div>
        <button
      onClick={() => {
  setEditingEntryId(null)
  setDiaryAnswers({
    q1: '',
    q2: '',
    q3: '',
    gratitude: '',
    free_thoughts: '',
    rating_done: '',
    rating_improve: '',
    tags: ''
  })
  setSelectedDiaryDate(new Date().toISOString().slice(0, 10))
  setShowDiaryForm(true)
}}
          style={{
            background: 'rgba(139, 92, 246, 0.2)',
            border: 'none',
            color: '#c4b5fd',
            fontSize: 13,
            fontWeight: 600,
            padding: '10px 14px',
            borderRadius: 12,
            cursor: 'pointer',
            whiteSpace: 'nowrap'
          }}
        >
          + Запись
        </button>
      </div>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 14,
        marginBottom: 8
      }}>
        <button
          onClick={() => setDiaryWeekOffset(o => o - 1)}
          style={{
            background: 'rgba(255,255,255,0.06)',
            border: 'none',
            color: '#fff',
            width: 36,
            height: 36,
            borderRadius: 10,
            cursor: 'pointer',
            fontSize: 16
          }}
        >
          ←
        </button>
        <div style={{ fontSize: 13, opacity: 0.5 }}>
          {diaryWeekOffset === 0 ? 'Эта неделя' : diaryWeekOffset === -1 ? 'Прошлая неделя' : `Смещение: ${diaryWeekOffset}`}
        </div>
        <button
          onClick={() => setDiaryWeekOffset(o => Math.min(0, o + 1))}
          style={{
            background: 'rgba(255,255,255,0.06)',
            border: 'none',
            color: diaryWeekOffset >= 0 ? 'rgba(255,255,255,0.25)' : '#fff',
            width: 36,
            height: 36,
            borderRadius: 10,
            cursor: diaryWeekOffset >= 0 ? 'default' : 'pointer',
            fontSize: 16
          }}
        >
          →
        </button>
      </div>
    {/* Неделя */}
<div style={{
  display: 'flex',
  gap: 8,
  marginTop: 18,
  marginBottom: 22,
  overflowX: 'auto',
  paddingBottom: 4
}}>
  {weekDays.map(d => (
    <button
      key={d.dateStr}
      onClick={() => {
        setSelectedDiaryDate(d.dateStr)
        setShowDiaryForm(false)
      }}
      style={{
        flex: '1 0 48px',
        minWidth: 48,
        padding: '12px 6px',
        borderRadius: 16,
        border: d.isSelected ? '1.5px solid #8b5cf6' : '1px solid rgba(255,255,255,0.06)',
        background: d.isSelected
          ? 'rgba(139, 92, 246, 0.18)'
          : 'rgba(255,255,255,0.04)',
        color: '#fff',
        cursor: 'pointer',
        textAlign: 'center',
        transition: '0.15s'
      }}
    >
      <div style={{
        fontSize: 11,
        opacity: d.isSelected ? 0.9 : 0.45,
        marginBottom: 4,
        fontWeight: 500
      }}>
        {d.label}
      </div>
      <div style={{
        fontSize: 18,
        fontWeight: 700,
        lineHeight: 1.2,
        marginBottom: 2
      }}>
        {d.dayNum}
      </div>
      <div style={{
        fontSize: 10,
        opacity: 0.35,
        marginBottom: 6,
        textTransform: 'lowercase'
      }}>
        {d.month}
      </div>
      <div style={{
        width: 7,
        height: 7,
        borderRadius: '50%',
        margin: '0 auto',
        background: d.hasEntry
          ? '#22c55e'
          : d.isSelected
            ? 'rgba(167, 139, 250, 0.5)'
            : 'rgba(255,255,255,0.12)'
      }} />
    </button>
  ))}
</div>

      {/* Форма новой записи */}
      {showDiaryForm && (
        <div style={{
          background: 'rgba(255,255,255,0.04)',
          borderRadius: 20,
          padding: 18,
          marginBottom: 16
        }}>
          <div style={{ fontWeight: 600, marginBottom: 14, fontSize: 15 }}>
         {editingEntryId ? 'Редактирование' : 'Новая запись'} · {selectedLabel}
          </div>

     <label style={{ fontSize: 13, opacity: 0.6, display: 'block', marginBottom: 6 }}>
  🎯 Сегодняшний фокус
</label>
<textarea
  value={diaryAnswers.q3}
  onChange={e => setDiaryAnswers({ ...diaryAnswers, q3: e.target.value })}
  placeholder="Главное на сегодня..."
  rows={2}
  style={{ marginBottom: 14, width: '100%', resize: 'vertical' }}
/>

<label style={{ fontSize: 13, opacity: 0.6, display: 'block', marginBottom: 6 }}>
  ✓ Что получилось
</label>
<textarea
  value={diaryAnswers.q2}
  onChange={e => setDiaryAnswers({ ...diaryAnswers, q2: e.target.value })}
  placeholder="Каждый пункт с новой строки..."
  rows={3}
  style={{ marginBottom: 14, width: '100%', resize: 'vertical' }}
/>

<label style={{ fontSize: 13, opacity: 0.6, display: 'block', marginBottom: 6 }}>
  💡 Что можно улучшить
</label>
<textarea
  value={diaryAnswers.q1}
  onChange={e => setDiaryAnswers({ ...diaryAnswers, q1: e.target.value })}
  placeholder="Каждый пункт с новой строки..."
  rows={3}
  style={{ marginBottom: 14, width: '100%', resize: 'vertical' }}
/>

<label style={{ fontSize: 13, opacity: 0.6, display: 'block', marginBottom: 6 }}>
  💚 Благодарности
</label>
<textarea
  value={diaryAnswers.gratitude}
  onChange={e => setDiaryAnswers({ ...diaryAnswers, gratitude: e.target.value })}
  placeholder="За что благодарен сегодня..."
  rows={2}
  style={{ marginBottom: 14, width: '100%', resize: 'vertical' }}
/>

<label style={{ fontSize: 13, opacity: 0.6, display: 'block', marginBottom: 6 }}>
  ✎ Свободные мысли
</label>
<textarea
  value={diaryAnswers.free_thoughts}
  onChange={e => setDiaryAnswers({ ...diaryAnswers, free_thoughts: e.target.value })}
  placeholder="Любые мысли..."
  rows={2}
  style={{ marginBottom: 14, width: '100%', resize: 'vertical' }}
/>

<div style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
  <div style={{ flex: 1 }}>
    <label style={{ fontSize: 13, opacity: 0.6, display: 'block', marginBottom: 6 }}>
      ★ Оценка «получилось» (1–10)
    </label>
 <input
  type="number"
  min={1}
  max={10}
  value={diaryAnswers.rating_done}
  onChange={e => setDiaryAnswers({ ...diaryAnswers, rating_done: e.target.value })}
  onBlur={e => {
    if (e.target.value === '') return
    const n = Math.min(10, Math.max(1, Number(e.target.value) || 1))
    setDiaryAnswers({ ...diaryAnswers, rating_done: String(n) })
  }}
  placeholder="8"
/>
  </div>
  <div style={{ flex: 1 }}>
    <label style={{ fontSize: 13, opacity: 0.6, display: 'block', marginBottom: 6 }}>
      ★ Оценка «улучшить» (1–10)
    </label>
   <input
  type="number"
  min={1}
  max={10}
  value={diaryAnswers.rating_improve}
  onChange={e => setDiaryAnswers({ ...diaryAnswers, rating_improve: e.target.value })}
  onBlur={e => {
    if (e.target.value === '') return
    const n = Math.min(10, Math.max(1, Number(e.target.value) || 1))
    setDiaryAnswers({ ...diaryAnswers, rating_improve: String(n) })
  }}
  placeholder="5"
/>
  </div>
</div>

<label style={{ fontSize: 13, opacity: 0.6, display: 'block', marginBottom: 6 }}>
  🏷 Теги (через запятую)
</label>
<input
  type="text"
  value={diaryAnswers.tags}
  onChange={e => setDiaryAnswers({ ...diaryAnswers, tags: e.target.value })}
  placeholder="продуктивность, код"
  style={{ marginBottom: 16 }}
/>

<button className="main-button" onClick={saveDiary}>
  {editingEntryId ? 'Сохранить изменения' : 'Сохранить'}
</button>
<button
  className="back-button"
  onClick={() => {
    setShowDiaryForm(false)
    setEditingEntryId(null)
    setDiaryAnswers({
      q1: '', q2: '', q3: '',
      gratitude: '', free_thoughts: '',
      rating_done: '', rating_improve: '', tags: ''
    })
  }}
>
  Отмена
</button>
        </div>
      )}

      {/* Записи выбранного дня */}
      {!showDiaryForm && dayEntries.length === 0 && (
                <div style={{
          textAlign: 'center',
          padding: '36px 20px',
          borderRadius: 20,
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.05)'
        }}>
          <div style={{ fontSize: 32, marginBottom: 10 }}>📝</div>
          <div style={{ fontSize: 14, marginBottom: 6 }}>Нет записей за этот день</div>
          <div style={{ fontSize: 12, opacity: 0.45, marginBottom: 14 }}>
            Коротко зафиксируй день — этого достаточно
          </div>
          <button
            onClick={() => setShowDiaryForm(true)}
            style={{
              background: 'rgba(139, 92, 246, 0.2)',
              border: 'none',
              color: '#c4b5fd',
              padding: '10px 18px',
              borderRadius: 12,
              cursor: 'pointer',
              fontSize: 13
            }}
          >
            Создать запись
          </button>
        </div>
      )}

     {!showDiaryForm && dayEntries.map(entry => {
  const lines = (text) =>
    (text || '').split('\n').map(s => s.trim()).filter(Boolean)

  return (
    <div
      key={entry.id}
      style={{
        background: 'rgba(255,255,255,0.04)',
        borderRadius: 20,
        padding: 18,
        marginBottom: 14
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'rgba(139, 92, 246, 0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>📅</div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 15, textTransform: 'capitalize' }}>
              {selectedLabel}
            </div>
            <div style={{ fontSize: 12, opacity: 0.45 }}>
              {entry.created_at
                ? `Запись от ${new Date(entry.created_at).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}`
                : 'запись'}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => startEditEntry(entry)}
            style={{ background: 'transparent', border: 'none', color: '#a78bfa', fontSize: 16, cursor: 'pointer' }}
          >✎</button>
          <button
            onClick={() => deleteDiaryEntry(entry.id)}
            style={{ background: 'transparent', border: 'none', color: 'rgba(255,80,80,0.8)', fontSize: 16, cursor: 'pointer' }}
          >🗑</button>
        </div>
      </div>

      {entry.q3 && (
        <div style={{ marginBottom: 16, paddingBottom: 14, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ fontSize: 13, color: '#a78bfa', fontWeight: 600, marginBottom: 6 }}>
            🎯 Сегодняшний фокус
          </div>
          <div style={{ fontSize: 14, opacity: 0.85, lineHeight: 1.45 }}>{entry.q3}</div>
        </div>
      )}

      {entry.q2 && (
        <div style={{ marginBottom: 16, paddingBottom: 14, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ fontSize: 13, color: '#4ade80', fontWeight: 600, marginBottom: 8 }}>
            ✓ Что получилось
          </div>
          {lines(entry.q2).map((line, i) => (
            <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 4, fontSize: 14, opacity: 0.85 }}>
              <span style={{ color: '#4ade80' }}>•</span>
              <span>{line}</span>
            </div>
          ))}
        </div>
      )}

      {entry.q1 && (
        <div>
          <div style={{ fontSize: 13, color: '#fb923c', fontWeight: 600, marginBottom: 8 }}>
            💡 Что можно улучшить
          </div>
          {lines(entry.q1).map((line, i) => (
            <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 4, fontSize: 14, opacity: 0.85 }}>
              <span style={{ color: '#fb923c' }}>•</span>
              <span>{line}</span>
            </div>
          ))}
        </div>
      )}
      {entry.gratitude && (
  <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
    <div style={{ fontSize: 13, color: '#f472b6', fontWeight: 600, marginBottom: 6 }}>
      💚 Благодарности
    </div>
    <div style={{ fontSize: 14, opacity: 0.85, lineHeight: 1.45 }}>{entry.gratitude}</div>
  </div>
)}

{entry.free_thoughts && (
  <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
    <div style={{ fontSize: 13, color: '#c4b5fd', fontWeight: 600, marginBottom: 6 }}>
      ✎ Свободные мысли
    </div>
    <div style={{ fontSize: 14, opacity: 0.85, lineHeight: 1.45 }}>{entry.free_thoughts}</div>
  </div>
)}

{(entry.rating_done || entry.rating_improve) && (
  <div style={{ display: 'flex', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
    {entry.rating_done && (
      <div style={{
        background: 'rgba(34, 197, 94, 0.15)',
        color: '#4ade80',
        fontSize: 12,
        fontWeight: 600,
        padding: '4px 10px',
        borderRadius: 20
      }}>
      ★ {Math.min(10, Math.max(1, Number(entry.rating_done) || 1))}/10
      </div>
    )}
    {entry.rating_improve && (
      <div style={{
        background: 'rgba(251, 146, 60, 0.15)',
        color: '#fb923c',
        fontSize: 12,
        fontWeight: 600,
        padding: '4px 10px',
        borderRadius: 20
      }}>
   ↑ {Math.min(10, Math.max(1, Number(entry.rating_improve) || 1))}/10
      </div>
    )}
  </div>
)}

{Array.isArray(entry.tags) && entry.tags.length > 0 && (
  <div style={{ display: 'flex', gap: 6, marginTop: 12, flexWrap: 'wrap' }}>
    {entry.tags.map((tag, i) => (
      <span key={i} style={{
        background: 'rgba(139, 92, 246, 0.15)',
        color: '#c4b5fd',
        fontSize: 11,
        padding: '4px 10px',
        borderRadius: 20
      }}>
        {tag}
      </span>
    ))}
  </div>
)}
    </div>
  )
})}

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
            <button 
              key={t.name} 
              className="option-btn" 
              onClick={() => addHabit(t.name, t.firstStep, 15, null, 'normal')}
            >
              <div style={{ fontWeight: 600 }}>{t.name}</div>
              <div style={{ fontSize: 13, opacity: 0.7, marginTop: 2 }}>{t.firstStep}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="form">
        <p style={{ fontSize: 14, opacity: 0.7, marginBottom: 12 }}>Или создай свою:</p>

        <label>Название</label>
        <input 
          type="text" 
          value={newHabitName} 
          onChange={e => setNewHabitName(e.target.value)} 
          placeholder="Медитация" 
        />

        <label>Первый шаг</label>
        <input 
          type="text" 
          value={newFirstStep} 
          onChange={e => setNewFirstStep(e.target.value)} 
          placeholder="Сесть и закрыть глаза" 
        />

        <label>Длительность</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
          {[5, 10, 15, 25, 30, 45, 60].map(min => (
            <button
              key={min}
              onClick={() => setNewDuration(min)}
              style={{
                padding: '8px 14px',
                borderRadius: 20,
                border: 'none',
                background: newDuration === min ? '#8b5cf6' : 'rgba(255,255,255,0.08)',
                color: '#fff',
                fontSize: 13,
                cursor: 'pointer'
              }}
            >
              {min} мин
            </button>
          ))}
        </div>

        <label>Время (необязательно)</label>
        <input 
          type="time" 
          value={newTime} 
          onChange={e => setNewTime(e.target.value)} 
          style={{ marginBottom: 16 }}
        />

        <label>Приоритет</label>
        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          {[
            { value: 'normal', label: 'Обычный' },
            { value: 'high', label: 'Важный' }
          ].map(p => (
            <button
              key={p.value}
              onClick={() => setNewPriority(p.value)}
              style={{
                padding: '8px 16px',
                borderRadius: 20,
                border: 'none',
                background: newPriority === p.value ? '#8b5cf6' : 'rgba(255,255,255,0.08)',
                color: '#fff',
                fontSize: 13,
                cursor: 'pointer'
              }}
            >
              {p.label}
            </button>
          ))}
        </div>

        <button 
          className="main-button" 
          onClick={() => addHabit(newHabitName, newFirstStep, newDuration, newTime || null, newPriority)}
        >
          Сохранить
        </button>
        <button className="back-button" onClick={() => setScreen('main')}>
          ← Отмена
        </button>
      </div>
    </div>
  )
}
if (screen === 'ritual' && ritualType) {
  const isMorning = ritualType === 'morning'
  return (
    <div className="app">
      <h2>{isMorning ? '🌅 Утренний ритуал' : '🌙 Вечерний ритуал'}</h2>
      <p style={{ opacity: 0.55, fontSize: 14, marginBottom: 20, lineHeight: 1.45 }}>
        {isMorning
          ? 'Не план на весь день — только якорь, чтобы начать.'
          : 'Без самокритики. Коротко зафиксируй день.'}
      </p>

      {isMorning ? (
        <>
          <div style={{
            background: 'rgba(255,255,255,0.04)',
            borderRadius: 16,
            padding: 16,
            marginBottom: 12
          }}>
            <div style={{ fontWeight: 600, marginBottom: 6 }}>1. Главный фокус дня</div>
            <div style={{ fontSize: 13, opacity: 0.6, marginBottom: 10 }}>
              Одно предложение — что сегодня важнее всего
            </div>
            <input
              type="text"
              placeholder="Например: дописать черновик"
              value={diaryAnswers.q3}
              onChange={e => setDiaryAnswers({ ...diaryAnswers, q3: e.target.value })}
            />
          </div>

          <div style={{
            background: 'rgba(255,255,255,0.04)',
            borderRadius: 16,
            padding: 16,
            marginBottom: 20
          }}>
            <div style={{ fontWeight: 600, marginBottom: 6 }}>2. Первый шаг (2 минуты)</div>
            <div style={{ fontSize: 13, opacity: 0.6 }}>
              Открой любую привычку и нажми «⚡ 2 минуты» — этого достаточно.
            </div>
          </div>

          <button
            className="main-button"
            onClick={() => {
              markRitualDone('morning')
              setRitualType(null)
              setScreen('main')
            }}
          >
            Готово, иду делать
          </button>
        </>
      ) : (
        <>
          <div style={{
            background: 'rgba(255,255,255,0.04)',
            borderRadius: 16,
            padding: 16,
            marginBottom: 12
          }}>
            <div style={{ fontWeight: 600, marginBottom: 6 }}>Что получилось?</div>
            <textarea
              rows={2}
              placeholder="Хотя бы один пункт"
              value={diaryAnswers.q2}
              onChange={e => setDiaryAnswers({ ...diaryAnswers, q2: e.target.value })}
              style={{ width: '100%', resize: 'vertical' }}
            />
          </div>

          <div style={{
            background: 'rgba(255,255,255,0.04)',
            borderRadius: 16,
            padding: 16,
            marginBottom: 20
          }}>
            <div style={{ fontWeight: 600, marginBottom: 6 }}>Что отпустить?</div>
            <textarea
              rows={2}
              placeholder="Без вины"
              value={diaryAnswers.q1}
              onChange={e => setDiaryAnswers({ ...diaryAnswers, q1: e.target.value })}
              style={{ width: '100%', resize: 'vertical' }}
            />
          </div>

          <button
            className="main-button"
            onClick={() => {
              markRitualDone('evening')
              setRitualType(null)
              // если что-то написал — сразу в форму дневника
              if (diaryAnswers.q1 || diaryAnswers.q2) {
                setShowDiaryForm(true)
                setScreen('diary')
              } else {
                setScreen('main')
              }
            }}
          >
            {diaryAnswers.q1 || diaryAnswers.q2 ? 'Сохранить в дневник' : 'Закрыть день'}
          </button>
        </>
      )}

      <button
        className="back-button"
        onClick={() => {
          setRitualType(null)
          setScreen('main')
        }}
      >
        ← Позже
      </button>
    </div>
  )
}
  // ===== Выбор причины =====
if (screen === 'lazy') {
    return (
      <div className="app">
        <h2>Что мешает начать?</h2>
        <p style={{ opacity: 0.55, fontSize: 14, marginBottom: 16, lineHeight: 1.4 }}>
          Привычка пропущена — это нормально. Выбери причину: сделаем крошечный шаг вместо вины.
        </p>
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


// ===== Таймер =====
if (screen === 'timer' && timerHabit) {
  const mins = Math.floor(timerSeconds / 60)
  const secs = timerSeconds % 60
  const timeStr = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
    const total = timerHabit._quick
    ? 2 * 60
    : (timerHabit.duration_minutes || 15) * 60
  const progress = total > 0 ? ((total - timerSeconds) / total) * 100 : 0

  return (
    <div className="app" style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center',
      minHeight: '80vh',
      textAlign: 'center'
    }}>
      <div style={{ fontSize: 15, opacity: 0.6, marginBottom: 8 }}>
        {timerHabit.name}
      </div>
      {timerHabit._quick && (
  <div style={{
    fontSize: 12,
    color: '#a78bfa',
    marginBottom: 8,
    background: 'rgba(139, 92, 246, 0.15)',
    padding: '4px 12px',
    borderRadius: 20,
    display: 'inline-block'
  }}>
    Режим 2 минуты
  </div>
)}
      <div style={{ fontSize: 14, opacity: 0.4, marginBottom: 32 }}>
        {timerHabit.first_step}
      </div>

      {/* Круг прогресса */}
      <div style={{
        width: 210,
        height: 210,
        borderRadius: '50%',
        background: `conic-gradient(#8b5cf6 ${progress}%, rgba(255,255,255,0.07) 0)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 28,
        boxShadow: '0 0 40px rgba(139, 92, 246, 0.15)'
      }}>
        <div style={{
          width: 176,
          height: 176,
          borderRadius: '50%',
          background: '#141418',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 4
        }}>
          <div style={{
            fontSize: 44,
            fontWeight: 700,
            letterSpacing: 1,
            fontVariantNumeric: 'tabular-nums'
          }}>
            {timeStr}
          </div>
          <div style={{ fontSize: 12, opacity: 0.4 }}>
            {timerRunning ? 'идёт фокус' : 'на паузе'}
          </div>
        </div>
      </div>

{/* Кнопки управления */}
<div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', justifyContent: 'center' }}>
  <button
    onClick={() => setTimerRunning(!timerRunning)}
    style={{
      padding: '14px 24px',
      borderRadius: 16,
      border: 'none',
      background: timerRunning ? 'rgba(251, 146, 60, 0.2)' : 'rgba(34, 197, 94, 0.2)',
      color: timerRunning ? '#fb923c' : '#4ade80',
      fontSize: 15,
      fontWeight: 600,
      cursor: 'pointer'
    }}
  >
    {timerRunning ? 'Пауза' : 'Запустить'}
  </button>

  <button
onClick={async () => {
  if (timerHabit._quick) {
    // сколько реально открутили из 2 минут
    const spentSession = Math.max(0, 2 * 60 - timerSeconds)
    if (spentSession > 0) {
      await saveFocusProgress(timerHabit, spentSession)
    }
  } else {
    const total = (timerHabit.duration_minutes || 15) * 60
    const alreadySpent = timerHabit.focusSeconds || 0
    const remainingAtStart = Math.max(0, total - alreadySpent)
    const spentSession = Math.max(0, remainingAtStart - timerSeconds)
    if (spentSession > 0) {
      await saveFocusProgress(timerHabit, spentSession)
    }
  }

  setTimerRunning(false)
  setTimerHabit(null)
  setScreen('main')
}}
    style={{
      padding: '14px 24px',
      borderRadius: 16,
      border: 'none',
      background: 'rgba(255,255,255,0.08)',
      color: '#fff',
      fontSize: 15,
      cursor: 'pointer'
    }}
  >
    Сохранить и выйти 
  </button>
</div>

<button
  onClick={async () => {
    if (timerHabit._quick) {
      await saveFocusProgress(timerHabit, 2 * 60)
    } else {
      const total = (timerHabit.duration_minutes || 15) * 60
      await saveFocusProgress(timerHabit, total)
    }
    setTimerRunning(false)
    setTimerHabit(null)
    setScreen('main')
  }}
  style={{
    background: 'transparent',
    border: 'none',
    color: '#a78bfa',
    fontSize: 14,
    cursor: 'pointer',
    marginBottom: 12
  }}
>
  Завершить полностью ✓
</button>
<button
onClick={async () => {
    setTimerRunning(false)
    setTimerHabit(null)
    await skipHabit(timerHabit)
    // screen → 'lazy' внутри skipHabit
  }}
  style={{
    background: 'transparent',
    border: 'none',
    color: '#fb923c',
    fontSize: 14,
    cursor: 'pointer',
    marginBottom: 12
  }}
>
  Пропустить ⏭
</button>
    </div>
  )
}
  return null
}

export default App
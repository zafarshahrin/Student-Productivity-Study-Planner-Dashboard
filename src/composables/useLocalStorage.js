import { ref, watch } from 'vue'

export function useLocalStorage(key, defaultValue) {
  const storedValue = localStorage.getItem(key)
  let parsedValue = defaultValue
  if (storedValue && storedValue !== 'undefined') {
    try {
      parsedValue = JSON.parse(storedValue)
    } catch (e) {
      console.error(`Error parsing localStorage key "${key}":`, e)
      parsedValue = defaultValue
    }
  }
  const data = ref(parsedValue)

  watch(
    data,
    (newValue) => {
      localStorage.setItem(key, JSON.stringify(newValue))
    },
    { deep: true }
  )

  return data
}

// Generate future dates relative to today
const getFutureDate = (daysAhead) => {
  const d = new Date()
  d.setDate(d.getDate() + daysAhead)
  return d.toISOString().split('T')[0]
}

export const defaultTasks = [
  {
    id: 't1',
    title: 'Math Homework: Calculus Limits',
    subject: 'Mathematics',
    priority: 'High',
    deadline: getFutureDate(2),
    status: 'pending'
  },
  {
    id: 't2',
    title: 'Biology Lab Report: Photosynthesis',
    subject: 'Biology',
    priority: 'Medium',
    deadline: getFutureDate(4),
    status: 'pending'
  },
  {
    id: 't3',
    title: 'English Essay: Shneiderman Analysis',
    subject: 'English',
    priority: 'Low',
    deadline: getFutureDate(1),
    status: 'completed'
  },
  {
    id: 't4',
    title: 'Physics Exam Prep: Electromagnetism',
    subject: 'Physics',
    priority: 'High',
    deadline: getFutureDate(6),
    status: 'pending'
  }
]

export const defaultStudySessions = []

export const defaultPlannerSettings = {
  dailyHourLimit: 6,
  weeklyStartDay: 'Monday',
  planningStrategy: 'priority' // 'priority' | 'deadline' | 'balanced'
}

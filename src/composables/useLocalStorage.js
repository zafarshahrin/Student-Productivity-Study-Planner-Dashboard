import { ref, watch } from 'vue'

export function useLocalStorage(key, defaultValue) {
  const storedValue = localStorage.getItem(key)
  const data = ref(storedValue ? JSON.parse(storedValue) : defaultValue)

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
    estimatedHours: 3,
    priority: 'High',
    deadline: getFutureDate(2),
    status: 'pending'
  },
  {
    id: 't2',
    title: 'Biology Lab Report: Photosynthesis',
    subject: 'Biology',
    estimatedHours: 4,
    priority: 'Medium',
    deadline: getFutureDate(4),
    status: 'pending'
  },
  {
    id: 't3',
    title: 'English Essay: Shneiderman Analysis',
    subject: 'English',
    estimatedHours: 2,
    priority: 'Low',
    deadline: getFutureDate(1),
    status: 'completed'
  },
  {
    id: 't4',
    title: 'Physics Exam Prep: Electromagnetism',
    subject: 'Physics',
    estimatedHours: 5,
    priority: 'High',
    deadline: getFutureDate(6),
    status: 'pending'
  }
]

export const defaultPlannerSettings = {
  studyStartTime: '09:00',
  breakDuration: 15,
  breakFrequency: 2,
  dailyHourLimit: 6,
  weeklyStartDay: 'Monday',
  planningStrategy: 'priority' // 'priority' | 'deadline' | 'balanced'
}

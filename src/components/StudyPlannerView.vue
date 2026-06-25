<template>
  <div class="space-y-6">
    <!-- My Study Preferences -->
    <div class="premium-card p-5 print:hidden">
      <h3 class="text-xs uppercase font-display font-bold tracking-wider text-[var(--color-text-h)] mb-4">
        My Study Preferences
      </h3>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <!-- Study Start Time -->
        <div class="flex flex-col gap-1">
          <label class="text-[11px] uppercase font-display font-bold tracking-wider text-[var(--color-text-muted)]">
            Study Start Time
          </label>
          <input 
            v-model="settings.studyStartTime" 
            type="time" 
            class="premium-input text-xs font-display"
          />
        </div>

        <!-- Break Duration -->
        <div class="flex flex-col gap-1">
          <label class="text-[11px] uppercase font-display font-bold tracking-wider text-[var(--color-text-muted)]">
            Break Duration
          </label>
          <select v-model.number="settings.breakDuration" class="premium-input text-xs font-display">
            <option :value="5">5 min</option>
            <option :value="10">10 min</option>
            <option :value="15">15 min</option>
            <option :value="30">30 min</option>
          </select>
        </div>

        <!-- Break Frequency -->
        <div class="flex flex-col gap-1">
          <label class="text-[11px] uppercase font-display font-bold tracking-wider text-[var(--color-text-muted)]">
            Break Frequency
          </label>
          <select v-model.number="settings.breakFrequency" class="premium-input text-xs font-display">
            <option :value="1">After every 1 hour</option>
            <option :value="2">After every 2 hours</option>
            <option :value="3">After every 3 hours</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Settings Panel -->
    <div class="premium-card p-5 print:hidden">
      <h3 class="text-xs uppercase font-display font-bold tracking-wider text-[var(--color-text-h)] mb-4">
        Planner Settings & Rules
      </h3>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <!-- Daily Limit -->
        <div class="flex flex-col gap-1">
          <label class="text-[11px] uppercase font-display font-bold tracking-wider text-[var(--color-text-muted)]">
            Daily Study Limit
          </label>
          <select v-model.number="settings.dailyHourLimit" class="premium-input text-xs font-display">
            <option :value="2">2 Hours / Day</option>
            <option :value="4">4 Hours / Day</option>
            <option :value="6">6 Hours / Day</option>
            <option :value="8">8 Hours / Day</option>
            <option :value="10">10 Hours / Day</option>
          </select>
        </div>

        <!-- Weekly Start Day -->
        <div class="flex flex-col gap-1">
          <label class="text-[11px] uppercase font-display font-bold tracking-wider text-[var(--color-text-muted)]">
            Weekly Start Day
          </label>
          <select v-model="settings.weeklyStartDay" class="premium-input text-xs font-display">
            <option value="Monday">Monday</option>
            <option value="Sunday">Sunday</option>
          </select>
        </div>

        <!-- Strategy -->
        <div class="flex flex-col gap-1">
          <label class="text-[11px] uppercase font-display font-bold tracking-wider text-[var(--color-text-muted)]">
            Planning Strategy
          </label>
          <select v-model="settings.planningStrategy" class="premium-input text-xs font-display">
            <option value="priority">Priority First (High Priority First)</option>
            <option value="deadline">Deadline First (Urgent First)</option>
            <option value="balanced">Balanced Workload (Spread Evenly)</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Toggle Buttons Daily / Weekly -->
    <div class="flex border-b border-[var(--color-border)] justify-between items-center print:hidden">
      <div class="flex">
        <button 
          @click="activeSubTab = 'daily'"
          class="px-4 py-2 text-xs font-display font-bold uppercase tracking-wider border-b-2 -mb-[2px] transition-all cursor-pointer"
          :class="activeSubTab === 'daily' ? 'border-[var(--color-accent)] text-[var(--color-text-h)]' : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text-h)]'"
        >
          Daily Schedule (Today)
        </button>
        <button 
          @click="activeSubTab = 'weekly'"
          class="px-4 py-2 text-xs font-display font-bold uppercase tracking-wider border-b-2 -mb-[2px] transition-all cursor-pointer"
          :class="activeSubTab === 'weekly' ? 'border-[var(--color-accent)] text-[var(--color-text-h)]' : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text-h)]'"
        >
          Weekly Schedule (Task Deadlines)
        </button>
      </div>
      
      <button 
        v-if="activeSubTab === 'weekly'"
        @click="printWeeklyPlan" 
        class="premium-btn text-xs mb-2 mr-2 hidden md:flex items-center gap-2"
      >
        <Printer class="w-4 h-4" /> Print Weekly Plan
      </button>
    </div>

    <!-- Daily Timeline View -->
    <div v-if="activeSubTab === 'daily'" class="space-y-4">
      <div class="premium-card p-5">
        <div class="flex items-center justify-between mb-4 border-b border-[var(--color-border)] pb-3">
          <h4 class="text-sm font-bold text-[var(--color-text-h)] font-display uppercase tracking-wider">
            Daily Timeline (Today)
          </h4>
          <span class="text-xs font-mono text-[var(--color-text-muted)]">
            Starts at {{ formatTime(getParsedStartTime()) }} • Max {{ settings.dailyHourLimit }} Study Hours
          </span>
        </div>

        <div v-if="dailyTimeline.length === 0" class="py-8 text-center text-xs font-mono text-[var(--color-text-muted)] border border-dashed border-[var(--color-border)]">
          No tasks added to today's plan yet. Go to Task Manager and toggle "Add to Today's Plan" on pending tasks.
        </div>

        <!-- Vertical Timeline List -->
        <div v-else class="relative pl-6 border-l border-[var(--color-border)] ml-3 space-y-4 py-2">
          <div 
            v-for="(block, idx) in dailyTimeline" 
            :key="idx"
            class="relative group"
          >
            <!-- Timeline Marker Dot -->
            <div 
              class="absolute -left-[27px] top-3 w-2.5 h-2.5 rounded-full transition-colors"
              :class="block.type === 'break' ? 'bg-amber-500' : 'bg-[var(--color-accent)]'"
            ></div>

            <!-- Block Details Card -->
            <div 
              class="p-3.5 border border-[var(--color-border)] bg-[var(--color-bg-card)] transition-all hover:border-[var(--color-text-h)]"
              :style="block.type === 'break' ? 'border-left: 2px solid #d97706;' : 'border-left: 2px solid var(--color-accent);'"
            >
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                <div>
                  <span class="text-[10px] font-mono font-semibold uppercase text-[var(--color-text-muted)]">
                    {{ block.startTimeStr }} - {{ block.endTimeStr }} ({{ formatDuration(block.durationHrs) }}{{ block.isEstimatedFallback ? ' est.' : '' }})
                  </span>
                  <h5 class="text-sm font-bold text-[var(--color-text-h)] font-display mt-0.5">
                    {{ block.title }}
                  </h5>
                </div>
                <!-- Badge -->
                <span 
                  v-if="block.subject"
                  class="px-2 py-0.5 text-[10px] border border-[var(--color-border)] bg-[var(--color-bg-panel)] font-display font-medium self-start sm:self-center"
                >
                  {{ block.subject }}
                </span>
                <span 
                  v-else
                  class="px-2 py-0.5 text-[10px] border border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-display font-medium self-start sm:self-center"
                >
                  Rest Block
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Weekly Grid View -->
    <div v-else class="space-y-4">
      <!-- Header subtitle -->
      <p class="text-xs font-mono text-[var(--color-text-muted)] -mt-2">
        Tasks are arranged by their deadline date
      </p>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-3">
        <div 
          v-for="day in weeklySchedule" 
          :key="day.name"
          class="premium-card p-3 flex flex-col min-h-[360px]"
          :class="{ 'opacity-60 bg-[var(--color-bg-panel)]/30': isPastDay(day.date) }"
        >
          <!-- Day Name -->
          <div class="border-b border-[var(--color-border)] pb-2 mb-2 text-center">
            <h4 class="text-xs font-bold text-[var(--color-text-h)] font-display">
              {{ day.name }}
            </h4>
            <span class="text-[9px] font-mono text-[var(--color-text-muted)]">
              {{ formatDateHeader(day.date) }}
            </span>
          </div>

          <!-- Tasks due on this day -->
          <div class="flex-1 space-y-2 overflow-y-auto max-h-[300px] pr-1">
            <div 
              v-for="(task, idx) in day.tasks" 
              :key="idx"
              class="p-2 border border-[var(--color-border)] bg-[var(--color-bg-card)] text-[11px] leading-tight"
              style="border-left: 2px solid var(--color-accent);"
            >
              <div class="font-bold text-[var(--color-text-h)] truncate">
                {{ task.title }}
              </div>
              <div class="flex items-center justify-between text-[9px] text-[var(--color-text-muted)] font-mono mt-1">
                <span class="truncate mr-1">{{ task.subject || '—' }}</span>
                <span class="shrink-0 text-[var(--color-accent)] font-semibold">{{ task.deadlineTimeStr }}</span>
              </div>
            </div>

            <!-- Empty state for day -->
            <div v-if="day.tasks.length === 0" class="py-12 text-center text-[10px] font-mono text-[var(--color-text-muted)] border border-dashed border-[var(--color-border)]">
              No Deadlines
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, inject, computed } from 'vue'
import { Printer } from 'lucide-vue-next'

const tasks = inject('tasks')
const settings = inject('plannerSettings')
const todayPlan = inject('todayPlan')

const activeSubTab = ref('daily')

const printWeeklyPlan = () => {
  window.print()
}

// Helper to convert decimal hours to a readable duration string (e.g. 1.25 -> 1h 15m)
const formatDuration = (hours) => {
  const h = Math.floor(hours)
  const m = Math.round((hours - h) * 60)
  if (h === 0) return `${m}m`
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}

// Convert hour index to time string (e.g. 9.25 -> 9:15 AM)
const formatTime = (timeDecimal) => {
  const hoursInt = Math.floor(timeDecimal)
  const minsInt = Math.round((timeDecimal - hoursInt) * 60)
  
  let h = hoursInt % 24
  const displayMins = minsInt < 10 ? '0' + minsInt : minsInt
  
  const period = h >= 12 ? 'PM' : 'AM'
  let displayHours = h % 12
  if (displayHours === 0) displayHours = 12
  
  return `${displayHours}:${displayMins} ${period}`
}

const getParsedStartTime = () => {
  if (settings.value.studyStartTime) {
    const [sh, sm] = settings.value.studyStartTime.split(':')
    return parseInt(sh, 10) + parseInt(sm, 10) / 60
  }
  return 9.0
}

// Date helper: Format header as "Jun 24"
const formatDateHeader = (date) => {
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

// Identify past dates
const isPastDay = (date) => {
  const today = new Date()
  today.setHours(0,0,0,0)
  return date < today
}

// Reliable date parsing to avoid UTC shifts and include time
const getTaskDeadlineDate = (task) => {
  if (!task.deadline) {
    const fallback = new Date()
    fallback.setHours(23, 59, 59, 999)
    return fallback
  }

  if (task.deadline.includes('T') || task.deadline.includes(' ')) {
    return new Date(task.deadline)
  }

  const [y, m, d] = task.deadline.split('-')
  const dObj = new Date(y, m - 1, d)
  
  if (task.deadlineTime) {
    const [h, min] = task.deadlineTime.split(':')
    dObj.setHours(parseInt(h, 10), parseInt(min, 10), 0, 0)
  } else {
    dObj.setHours(23, 59, 59, 999)
  }
  
  return dObj
}

// Sort tasks based on selected planning strategy
// For DAILY TIMELINE: only tasks the user added to today's plan
// For WEEKLY GRID: all pending tasks
const getSortedPendingTasks = (forDaily = false) => {
  let pending = tasks.value.filter(t => t.status === 'pending')

  // If building the daily timeline, only include user-selected tasks
  if (forDaily) {
    const planSet = todayPlan ? todayPlan.value : new Set()
    pending = pending.filter(t => planSet.has(t.id))
  }

  if (settings.value.planningStrategy === 'priority') {
    // Auto-priority sort: closest deadline first (simulates high-priority urgency)
    return [...pending].sort((a, b) => getTaskDeadlineDate(a) - getTaskDeadlineDate(b))
  }

  if (settings.value.planningStrategy === 'deadline') {
    return [...pending].sort((a, b) => getTaskDeadlineDate(a) - getTaskDeadlineDate(b))
  }

  // 'balanced': sort by deadline, tie-break by estimated hours descending
  return [...pending].sort((a, b) => {
    const dDiff = getTaskDeadlineDate(a) - getTaskDeadlineDate(b)
    if (dDiff !== 0) return dDiff
    return (b.estimatedHours || 0) - (a.estimatedHours || 0)
  })
}

// Compute daily timeline — uses only today's-plan tasks
const dailyTimeline = computed(() => {
  const sortedTasks = getSortedPendingTasks(true) // true = daily filter
  const timeline = []
  
  let currentHour = getParsedStartTime()
  let studyHoursScheduled = 0
  const maxStudyLimit = settings.value.dailyHourLimit || 6
  const breakFreq = settings.value.breakFrequency || 2
  const breakDur = (settings.value.breakDuration || 15) / 60
  
  let timeSinceLastBreak = 0

  for (const task of sortedTasks) {
    if (studyHoursScheduled >= maxStudyLimit) break

    const isEstimated = !task.estimatedHours || task.estimatedHours === 0
    const actualHours = isEstimated ? 1 : task.estimatedHours

    const remainingLimit = maxStudyLimit - studyHoursScheduled
    let taskDurationLeft = Math.min(actualHours, remainingLimit)

    if (taskDurationLeft <= 0) continue

    while(taskDurationLeft > 0.01) { // 0.01 threshold for floating point precision
      const timeUntilNextBreak = breakFreq - timeSinceLastBreak
      const chunkDuration = Math.min(taskDurationLeft, timeUntilNextBreak)

      if (chunkDuration > 0.01) {
        const startTimeStr = formatTime(currentHour)
        currentHour += chunkDuration
        const endTimeStr = formatTime(currentHour)
        
        timeline.push({
          type: 'study',
          title: task.title,
          subject: task.subject,
          startTimeStr,
          endTimeStr,
          durationHrs: chunkDuration,
          taskId: task.id,
          isEstimatedFallback: isEstimated
        })
        
        taskDurationLeft -= chunkDuration
        timeSinceLastBreak += chunkDuration
        studyHoursScheduled += chunkDuration
      } else {
        // Fallback to prevent infinite loop if chunkDuration is NaN or <= 0.01
        break
      }
      
      // Trigger break if it's time
      if (Math.abs(timeSinceLastBreak - breakFreq) < 0.01 && studyHoursScheduled < maxStudyLimit) {
        const breakStart = formatTime(currentHour)
        currentHour += breakDur
        const breakEnd = formatTime(currentHour)
        
        timeline.push({
          type: 'break',
          title: `${settings.value.breakDuration}-Minute Rest Break`,
          subject: '',
          startTimeStr: breakStart,
          endTimeStr: breakEnd,
          durationHrs: breakDur
        })
        timeSinceLastBreak = 0
      }
      
      if (studyHoursScheduled >= maxStudyLimit) break
    }
  }

  // Remove trailing break if it's the last item in timeline
  if (timeline.length > 0 && timeline[timeline.length - 1].type === 'break') {
    timeline.pop()
  }

  return timeline
})

// Format a deadline time for display in the weekly grid (e.g. "6:00 PM" or "No time set")
const formatDeadlineTime = (task) => {
  if (task.deadlineTime) {
    const [h, m] = task.deadlineTime.split(':')
    const hour = parseInt(h, 10)
    const min = m || '00'
    const period = hour >= 12 ? 'PM' : 'AM'
    const displayH = hour % 12 === 0 ? 12 : hour % 12
    return `${displayH}:${min} ${period}`
  }
  return 'No time set'
}

// Compute weekly planner grid — tasks placed directly on their deadline day
const weeklySchedule = computed(() => {
  const startDayPref = settings.value.weeklyStartDay
  const sortedTasks = getSortedPendingTasks(false) // false = all pending tasks (no today filter)

  // Generate 7 days starting from today, aligning to the start day preference if possible,
  // or simple 7-day sliding window from today.
  // The standard requirement is showing Monday - Sunday. Let's build Monday - Sunday of the CURRENT week,
  // or a sliding 7-day window starting from today.
  // A sliding 7-day window starting from the chosen "weekly start day" is excellent!
  // Let's find the most recent start day.
  const today = new Date()
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const startDayIndex = daysOfWeek.indexOf(startDayPref)
  
  // Align start date to the beginning of the week
  const startOffset = today.getDay() - startDayIndex
  const startDate = new Date(today)
  startDate.setDate(today.getDate() - (startOffset >= 0 ? startOffset : startOffset + 7))
  startDate.setHours(0,0,0,0)

  // Build the 7 days of the week array
  const scheduleDays = []
  for (let i = 0; i < 7; i++) {
    const d = new Date(startDate)
    d.setDate(startDate.getDate() + i)
    scheduleDays.push({
      name: daysOfWeek[d.getDay()],
      date: d,
      tasks: []
    })
  }

  // Place each pending task directly on its deadline day (no redistribution, no cap)
  for (const task of sortedTasks) {
    const deadline = getTaskDeadlineDate(task)
    if (!deadline) continue

    const deadlineDayStr = deadline.toDateString()
    const targetDay = scheduleDays.find(d => d.date.toDateString() === deadlineDayStr)

    if (targetDay) {
      targetDay.tasks.push({
        title: task.title,
        subject: task.subject,
        deadlineTimeStr: formatDeadlineTime(task)
      })
    }
  }

  return scheduleDays
})

</script>

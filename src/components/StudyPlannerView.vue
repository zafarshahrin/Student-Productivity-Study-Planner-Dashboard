<template>
  <div class="space-y-6">
    <!-- Settings Panel -->
    <div class="premium-card p-5">
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
    <div class="flex border-b border-[var(--color-border)]">
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
        Weekly Schedule Grid
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
            Starts at 9:00 AM • Max {{ settings.dailyHourLimit }} Study Hours
          </span>
        </div>

        <div v-if="dailyTimeline.length === 0" class="py-8 text-center text-xs font-mono text-[var(--color-text-muted)] border border-dashed border-[var(--color-border)]">
          No tasks scheduled for today. Add pending tasks or adjust settings.
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
                    {{ block.startTimeStr }} - {{ block.endTimeStr }} ({{ formatDuration(block.durationHrs) }})
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
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-3">
        <div 
          v-for="day in weeklySchedule" 
          :key="day.name"
          class="premium-card p-3 flex flex-col justify-between min-h-[360px]"
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

          <!-- Scheduled items for day -->
          <div class="flex-1 space-y-2 overflow-y-auto max-h-[260px] pr-1">
            <div 
              v-for="(block, idx) in day.blocks" 
              :key="idx"
              class="p-2 border border-[var(--color-border)] bg-[var(--color-bg-card)] text-[11px] leading-tight"
              :style="block.type === 'break' ? 'border-left: 2px solid #d97706;' : 'border-left: 2px solid var(--color-accent);'"
            >
              <div class="font-bold text-[var(--color-text-h)] truncate">
                {{ block.title }}
              </div>
              <div class="flex items-center justify-between text-[9px] text-[var(--color-text-muted)] font-mono mt-1">
                <span>{{ block.subject || 'Break' }}</span>
                <span>{{ block.durationHrs }} hrs</span>
              </div>
            </div>

            <!-- Empty state for day -->
            <div v-if="day.blocks.length === 0" class="py-12 text-center text-[10px] font-mono text-[var(--color-text-muted)] border border-dashed border-[var(--color-border)]">
              Free Day
            </div>
          </div>

          <!-- Total day load -->
          <div class="border-t border-[var(--color-border)] pt-2 mt-2 flex items-center justify-between text-[10px] font-mono">
            <span class="text-[var(--color-text-muted)]">Workload:</span>
            <span class="font-semibold" :class="day.totalHrs > settings.dailyHourLimit ? 'text-red-500' : 'text-[var(--color-text-h)]'">
              {{ day.totalHrs }} / {{ settings.dailyHourLimit }} hrs
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, inject, computed } from 'vue'

const tasks = inject('tasks')
const settings = inject('plannerSettings')

const activeSubTab = ref('daily')

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
  const period = hoursInt >= 12 ? 'PM' : 'AM'
  const displayHours = hoursInt % 12 === 0 ? 12 : hoursInt % 12
  const displayMins = minsInt < 10 ? '0' + minsInt : minsInt
  return `${displayHours}:${displayMins} ${period}`
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

// Sort tasks based on selected planning strategy
const getSortedPendingTasks = () => {
  const pending = tasks.value.filter(t => t.status === 'pending')

  if (settings.value.planningStrategy === 'priority') {
    const priorityWeights = { High: 3, Medium: 2, Low: 1 }
    return [...pending].sort((a, b) => {
      const weightDiff = (priorityWeights[b.priority] || 0) - (priorityWeights[a.priority] || 0)
      if (weightDiff !== 0) return weightDiff
      return new Date(a.deadline) - new Date(b.deadline) // Tie-breaker: closest deadline first
    })
  }

  if (settings.value.planningStrategy === 'deadline') {
    return [...pending].sort((a, b) => {
      const deadlineDiff = new Date(a.deadline) - new Date(b.deadline)
      if (deadlineDiff !== 0) return deadlineDiff
      const priorityWeights = { High: 3, Medium: 2, Low: 1 }
      return (priorityWeights[b.priority] || 0) - (priorityWeights[a.priority] || 0)
    })
  }

  // 'balanced': Mix of both, sorting by deadline but prioritizing higher hours tasks to start earlier
  return [...pending].sort((a, b) => {
    const dDiff = new Date(a.deadline) - new Date(b.deadline)
    if (dDiff !== 0) return dDiff
    return b.estimatedHours - a.estimatedHours
  })
}

// Compute daily timeline starting at 9:00 AM
const dailyTimeline = computed(() => {
  const sortedTasks = getSortedPendingTasks()
  const timeline = []
  
  let currentHour = 9.0 // Represents 9:00 AM
  let studyHoursScheduled = 0
  const maxStudyLimit = settings.value.dailyHourLimit

  for (const task of sortedTasks) {
    if (studyHoursScheduled >= maxStudyLimit) break

    // Calculate how much we can study this task today
    // Breaks do NOT count toward the study budget — only study blocks do
    const remainingLimit = maxStudyLimit - studyHoursScheduled
    const duration = Math.min(task.estimatedHours, remainingLimit)

    if (duration <= 0) continue

    // Schedule study block
    const startTimeStr = formatTime(currentHour)
    currentHour += duration
    const endTimeStr = formatTime(currentHour)

    timeline.push({
      type: 'study',
      title: task.title,
      subject: task.subject,
      startTimeStr,
      endTimeStr,
      durationHrs: duration,
      taskId: task.id
    })

    studyHoursScheduled += duration

    // Insert 15-minute break after each study block (break time is extra, not deducted from study budget)
    // Only add a break if we are not at the daily study limit yet
    if (studyHoursScheduled < maxStudyLimit) {
      const breakStart = formatTime(currentHour)
      currentHour += 0.25 // 15 mins break
      const breakEnd = formatTime(currentHour)

      timeline.push({
        type: 'break',
        title: '15-Minute Rest Break',
        subject: '',
        startTimeStr: breakStart,
        endTimeStr: breakEnd,
        durationHrs: 0.25
      })
    }
  }

  // Remove trailing break if it's the last item in timeline
  if (timeline.length > 0 && timeline[timeline.length - 1].type === 'break') {
    timeline.pop()
  }

  return timeline
})

// Compute weekly planner grid for next 7 days
const weeklySchedule = computed(() => {
  const startDayPref = settings.value.weeklyStartDay
  const sortedTasks = getSortedPendingTasks()

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
      blocks: [],
      totalHrs: 0
    })
  }

  // Heuristic Study Allocator:
  // Allocate task hours across the week.
  // Each day has a capacity equal to dailyHourLimit.
  // Tasks must be scheduled on or before their deadline date.
  
  // Clone task requirements to keep track of remaining hours to allocate
  const tasksToSchedule = sortedTasks.map(t => ({
    id: t.id,
    title: t.title,
    subject: t.subject,
    remainingHrs: t.estimatedHours,
    deadline: new Date(t.deadline)
  }))

  for (const task of tasksToSchedule) {
    // We attempt to schedule this task's hours.
    // We look at the days from today (or the start of the week) up to the task's deadline.
    // If a day is past the deadline, we can't schedule it there.
    // We prioritize distributing the hours as early as possible.
    
    for (const day of scheduleDays) {
      if (task.remainingHrs <= 0) break

      // Skip past days or days after the deadline
      const dayDate = new Date(day.date)
      dayDate.setHours(23, 59, 59, 999) // include the deadline day
      if (dayDate > task.deadline || isPastDay(day.date)) continue

      const dayCapacity = settings.value.dailyHourLimit - day.totalHrs
      if (dayCapacity <= 0) continue

      const duration = Math.min(task.remainingHrs, dayCapacity)
      if (duration <= 0) continue

      day.blocks.push({
        type: 'study',
        title: task.title,
        subject: task.subject,
        durationHrs: duration
      })

      day.totalHrs += duration
      task.remainingHrs -= duration
    }
  }

  // Post-process: Insert 15-minute rest breaks between scheduled blocks in the daily schedules if needed,
  // but for the weekly summary card, keeping it simplified to "Study Blocks" is standard and readable.
  
  return scheduleDays
})

</script>

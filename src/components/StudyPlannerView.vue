<template>
  <div class="space-y-6">

    <!-- My Study Preferences -->
    <div class="premium-card p-5 print:hidden">
      <h3 class="text-xs uppercase font-display font-bold tracking-wider text-[var(--color-text-h)] mb-4">
        My Study Preferences
      </h3>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="flex flex-col gap-1">
          <label class="text-[11px] uppercase font-display font-bold tracking-wider text-[var(--color-text-muted)]">Study Start Time</label>
          <input v-model="settings.studyStartTime" type="time" class="premium-input text-xs font-display"/>
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-[11px] uppercase font-display font-bold tracking-wider text-[var(--color-text-muted)]">Break Duration</label>
          <select v-model.number="settings.breakDuration" class="premium-input text-xs font-display">
            <option :value="5">5 min</option>
            <option :value="10">10 min</option>
            <option :value="15">15 min</option>
            <option :value="30">30 min</option>
          </select>
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-[11px] uppercase font-display font-bold tracking-wider text-[var(--color-text-muted)]">Break Frequency</label>
          <select v-model.number="settings.breakFrequency" class="premium-input text-xs font-display">
            <option :value="1">After every 1 hour</option>
            <option :value="2">After every 2 hours</option>
            <option :value="3">After every 3 hours</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Planner Settings -->
    <div class="premium-card p-5 print:hidden">
      <h3 class="text-xs uppercase font-display font-bold tracking-wider text-[var(--color-text-h)] mb-4">
        Planner Settings & Rules
      </h3>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="flex flex-col gap-1">
          <label class="text-[11px] uppercase font-display font-bold tracking-wider text-[var(--color-text-muted)]">Daily Study Limit</label>
          <select v-model.number="settings.dailyHourLimit" class="premium-input text-xs font-display">
            <option :value="2">2 Hours / Day</option>
            <option :value="4">4 Hours / Day</option>
            <option :value="6">6 Hours / Day</option>
            <option :value="8">8 Hours / Day</option>
            <option :value="10">10 Hours / Day</option>
          </select>
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-[11px] uppercase font-display font-bold tracking-wider text-[var(--color-text-muted)]">Weekly Start Day</label>
          <select v-model="settings.weeklyStartDay" class="premium-input text-xs font-display">
            <option value="Monday">Monday</option>
            <option value="Sunday">Sunday</option>
          </select>
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-[11px] uppercase font-display font-bold tracking-wider text-[var(--color-text-muted)]">Planning Strategy</label>
          <select v-model="settings.planningStrategy" class="premium-input text-xs font-display">
            <option value="priority">Priority First (High Priority First)</option>
            <option value="deadline">Deadline First (Urgent First)</option>
            <option value="balanced">Balanced Workload (Spread Evenly)</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Tab Buttons -->
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
        @click="handlePrint"
        class="premium-btn text-xs mb-2 mr-2 hidden md:flex items-center gap-2"
      >
        <Printer class="w-4 h-4" /> Print Weekly Plan
      </button>
    </div>

    <!-- Daily Timeline -->
    <div v-if="activeSubTab === 'daily'">
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

        <div v-else class="relative pl-6 border-l border-[var(--color-border)] ml-3 space-y-4 py-2">
          <div v-for="(block, idx) in dailyTimeline" :key="idx" class="relative">
            <div
              class="absolute -left-[27px] top-3 w-2.5 h-2.5 rounded-full"
              :class="block.type === 'break' ? 'bg-amber-500' : 'bg-[var(--color-accent)]'"
            ></div>
            <div
              class="p-3.5 border border-[var(--color-border)] bg-[var(--color-bg-card)]"
              :style="block.type === 'break' ? 'border-left: 2px solid #d97706' : 'border-left: 2px solid var(--color-accent)'"
            >
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                <div>
                  <span class="text-[10px] font-mono font-semibold uppercase text-[var(--color-text-muted)]">
                    {{ block.startTimeStr }} - {{ block.endTimeStr }} ({{ formatDuration(block.durationHrs) }}{{ block.isEstimatedFallback ? ' est.' : '' }})
                  </span>
                  <h5 class="text-sm font-bold text-[var(--color-text-h)] font-display mt-0.5">{{ block.title }}</h5>
                </div>
                <span v-if="block.subject" class="px-2 py-0.5 text-[10px] border border-[var(--color-border)] bg-[var(--color-bg-panel)] font-display font-medium self-start sm:self-center">
                  {{ block.subject }}
                </span>
                <span v-else class="px-2 py-0.5 text-[10px] border border-amber-500/20 bg-amber-500/10 text-amber-600 font-display font-medium self-start sm:self-center">
                  Rest Block
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Weekly Grid -->
    <div v-else class="print:mt-0">
      <p class="text-xs font-mono text-[var(--color-text-muted)] mb-4 print:hidden">Tasks are arranged by their deadline date</p>
      
      <!-- Print Header (only visible when printing) -->
      <div class="hidden print:block text-center mb-4">
        <h2 class="text-xl font-bold font-display text-[var(--color-text-h)]">Weekly Study Schedule</h2>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-3 print:grid-cols-7 print:gap-1">
        <div
          v-for="day in weeklySchedule"
          :key="day.name"
          class="premium-card p-3 flex flex-col min-h-[360px] print:min-h-0 print:h-auto print:p-1 print:border print:border-gray-300 print:shadow-none print:break-inside-avoid"
          :class="{ 'opacity-60': isPastDay(day.date) }"
        >
          <div class="border-b border-[var(--color-border)] pb-2 mb-2 text-center print:pb-1 print:mb-1">
            <h4 class="text-xs font-bold text-[var(--color-text-h)] font-display print:text-[10px]">{{ day.name }}</h4>
            <span class="text-[9px] font-mono text-[var(--color-text-muted)] print:text-[8px]">{{ formatDateHeader(day.date) }}</span>
          </div>

          <div class="flex-1 space-y-2 overflow-y-auto max-h-[300px] print:max-h-none print:overflow-visible print:space-y-1">
            <div
              v-for="(task, idx) in day.tasks"
              :key="idx"
              class="p-2 border border-[var(--color-border)] bg-[var(--color-bg-card)] text-[11px] print:p-1 print:text-[9px]"
              style="border-left: 2px solid var(--color-accent)"
            >
              <div class="font-bold text-[var(--color-text-h)] truncate print:whitespace-normal print:leading-tight">{{ task.title }}</div>
              <div class="flex items-center justify-between text-[9px] text-[var(--color-text-muted)] font-mono mt-1 print:mt-0.5 print:text-[7px]">
                <span class="truncate mr-1">{{ task.subject || '—' }}</span>
                <span class="shrink-0 text-[var(--color-accent)] font-semibold">{{ task.deadlineTimeStr }}</span>
              </div>
            </div>

            <div v-if="day.tasks.length === 0" class="py-12 text-center text-[10px] font-mono text-[var(--color-text-muted)] border border-dashed border-[var(--color-border)] print:py-4 print:text-[8px]">
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

const handlePrint = () => {
  window.print()
}

const formatDuration = (hours) => {
  const h = Math.floor(hours)
  const m = Math.round((hours - h) * 60)
  if (h === 0) return `${m}m`
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}

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

const formatDateHeader = (date) => date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })

const isPastDay = (date) => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return date < today
}

const getTaskDeadlineDate = (task) => {
  if (!task.deadline) {
    const fallback = new Date()
    fallback.setHours(23, 59, 59, 999)
    return fallback
  }
  if (task.deadline.includes('T') || task.deadline.includes(' ')) return new Date(task.deadline)
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

const getSortedPendingTasks = (forDaily = false) => {
  let pending = tasks.value.filter(t => t.status === 'pending')
  if (forDaily) {
    const planSet = todayPlan ? todayPlan.value : new Set()
    pending = pending.filter(t => planSet.has(t.id))
  }
  if (settings.value.planningStrategy === 'balanced') {
    return [...pending].sort((a, b) => {
      const dDiff = getTaskDeadlineDate(a) - getTaskDeadlineDate(b)
      if (dDiff !== 0) return dDiff
      return (b.estimatedHours || 0) - (a.estimatedHours || 0)
    })
  }
  return [...pending].sort((a, b) => getTaskDeadlineDate(a) - getTaskDeadlineDate(b))
}

const dailyTimeline = computed(() => {
  const sortedTasks = getSortedPendingTasks(true)
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

    while (taskDurationLeft > 0.01) {
      const timeUntilNextBreak = breakFreq - timeSinceLastBreak
      const chunkDuration = Math.min(taskDurationLeft, timeUntilNextBreak)
      if (chunkDuration <= 0.01) break

      const startTimeStr = formatTime(currentHour)
      currentHour += chunkDuration
      timeline.push({
        type: 'study',
        title: task.title,
        subject: task.subject,
        startTimeStr,
        endTimeStr: formatTime(currentHour),
        durationHrs: chunkDuration,
        isEstimatedFallback: isEstimated
      })

      taskDurationLeft -= chunkDuration
      timeSinceLastBreak += chunkDuration
      studyHoursScheduled += chunkDuration

      if (Math.abs(timeSinceLastBreak - breakFreq) < 0.01 && studyHoursScheduled < maxStudyLimit) {
        const breakStart = formatTime(currentHour)
        currentHour += breakDur
        timeline.push({
          type: 'break',
          title: `${settings.value.breakDuration}-Minute Rest Break`,
          subject: '',
          startTimeStr: breakStart,
          endTimeStr: formatTime(currentHour),
          durationHrs: breakDur
        })
        timeSinceLastBreak = 0
      }

      if (studyHoursScheduled >= maxStudyLimit) break
    }
  }

  if (timeline.length > 0 && timeline[timeline.length - 1].type === 'break') timeline.pop()
  return timeline
})

const formatDeadlineTime = (task) => {
  if (task.deadlineTime) {
    const [h, m] = task.deadlineTime.split(':')
    const hour = parseInt(h, 10)
    const period = hour >= 12 ? 'PM' : 'AM'
    const displayH = hour % 12 === 0 ? 12 : hour % 12
    return `${displayH}:${m || '00'} ${period}`
  }
  return 'No time set'
}

const weeklySchedule = computed(() => {
  const sortedTasks = getSortedPendingTasks(false)
  const today = new Date()
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const startDayIndex = daysOfWeek.indexOf(settings.value.weeklyStartDay)
  const startOffset = today.getDay() - startDayIndex
  const startDate = new Date(today)
  startDate.setDate(today.getDate() - (startOffset >= 0 ? startOffset : startOffset + 7))
  startDate.setHours(0, 0, 0, 0)

  const scheduleDays = []
  for (let i = 0; i < 7; i++) {
    const d = new Date(startDate)
    d.setDate(startDate.getDate() + i)
    scheduleDays.push({ name: daysOfWeek[d.getDay()], date: d, tasks: [] })
  }

  for (const task of sortedTasks) {
    const deadline = getTaskDeadlineDate(task)
    if (!deadline) continue
    const targetDay = scheduleDays.find(d => d.date.toDateString() === deadline.toDateString())
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
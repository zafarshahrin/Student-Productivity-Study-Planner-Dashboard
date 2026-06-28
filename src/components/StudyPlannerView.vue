<template>
  <div class="space-y-6">

    <!-- Planner Settings -->
    <div class="premium-card p-5 print:hidden">
      <h3 class="text-xs uppercase font-display font-bold tracking-wider text-[var(--color-text-h)] mb-4">
        Planner Settings &amp; Rules
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

    <!-- Create Custom Study Session -->
    <div class="premium-card p-5 print:hidden">
      <h3 class="text-xs uppercase font-display font-bold tracking-wider text-[var(--color-text-h)] mb-4">
        Create Custom Study Session
      </h3>
      <form @submit.prevent="handleAddSession" class="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
        <div class="flex flex-col gap-1 md:col-span-2">
          <label class="text-[11px] uppercase font-display font-bold tracking-wider text-[var(--color-text-muted)]">Subject / Topic</label>
          <input v-model="newSession.subject" required type="text" placeholder="e.g. Math Revision" class="premium-input text-xs font-display" />
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-[11px] uppercase font-display font-bold tracking-wider text-[var(--color-text-muted)]">Date</label>
          <input v-model="newSession.date" required type="date" class="premium-input text-xs font-display" />
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-[11px] uppercase font-display font-bold tracking-wider text-[var(--color-text-muted)]">Start Time</label>
          <input v-model="newSession.time" required type="time" class="premium-input text-xs font-display" />
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-[11px] uppercase font-display font-bold tracking-wider text-[var(--color-text-muted)]">End Time</label>
          <input v-model="newSession.endTime" required type="time" class="premium-input text-xs font-display" />
        </div>
        <button type="submit" class="premium-btn text-xs font-bold w-full h-[38px]">
          Add Session
        </button>
      </form>
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

    <!-- Daily Schedule -->
    <div v-if="activeSubTab === 'daily'">

      <!-- Step 1: Setup (shown when schedule not yet generated) -->
      <div v-if="!scheduleGenerated" class="premium-card p-5">
        <h4 class="text-sm font-bold text-[var(--color-text-h)] font-display uppercase tracking-wider mb-4 border-b border-[var(--color-border)] pb-3">
          Daily Schedule Setup
        </h4>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
          <!-- Start Time -->
          <div class="flex flex-col gap-1">
            <label class="text-[11px] uppercase font-display font-bold tracking-wider text-[var(--color-text-muted)]">Study Start Time</label>
            <input v-model="scheduleSetup.startTime" type="time" class="premium-input text-xs font-display" />
          </div>
          <!-- End Time -->
          <div class="flex flex-col gap-1">
            <label class="text-[11px] uppercase font-display font-bold tracking-wider text-[var(--color-text-muted)]">Study End Time</label>
            <input v-model="scheduleSetup.endTime" type="time" class="premium-input text-xs font-display" />
          </div>
          <!-- Slot Duration -->
          <div class="flex flex-col gap-1">
            <label class="text-[11px] uppercase font-display font-bold tracking-wider text-[var(--color-text-muted)]">Slot Duration</label>
            <div class="flex gap-2">
              <button
                type="button"
                @click="scheduleSetup.slotDuration = 30"
                class="flex-1 px-3 py-2 text-xs font-display font-bold uppercase tracking-wider border transition-all cursor-pointer"
                :class="scheduleSetup.slotDuration === 30
                  ? 'bg-[var(--color-accent)] text-[var(--color-bg)] border-[var(--color-accent)]'
                  : 'border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text-h)] hover:border-[var(--color-text-h)]'"
              >
                30 min
              </button>
              <button
                type="button"
                @click="scheduleSetup.slotDuration = 60"
                class="flex-1 px-3 py-2 text-xs font-display font-bold uppercase tracking-wider border transition-all cursor-pointer"
                :class="scheduleSetup.slotDuration === 60
                  ? 'bg-[var(--color-accent)] text-[var(--color-bg)] border-[var(--color-accent)]'
                  : 'border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text-h)] hover:border-[var(--color-text-h)]'"
              >
                1 hour
              </button>
            </div>
          </div>
        </div>
        <button @click="generateSchedule" class="premium-btn text-xs font-bold flex items-center gap-2">
          Generate Schedule
        </button>
      </div>

      <!-- Step 2: Generated schedule -->
      <div v-else class="premium-card p-5">
        <div class="flex items-center justify-between mb-4 border-b border-[var(--color-border)] pb-3">
          <h4 class="text-sm font-bold text-[var(--color-text-h)] font-display uppercase tracking-wider">
            Daily Schedule — Today
          </h4>
          <button @click="resetSchedule" class="premium-btn-secondary text-xs flex items-center gap-1.5">
            Reset Schedule
          </button>
        </div>

        <div v-if="slotAssignments.length === 0" class="py-8 text-center text-xs font-mono text-[var(--color-text-muted)] border border-dashed border-[var(--color-border)]">
          No slots generated. Please check your start/end times.
        </div>

        <div v-else class="space-y-2">
          <div
            v-for="(slot, idx) in slotAssignments"
            :key="idx"
            class="flex items-center gap-3 p-3 border border-[var(--color-border)] bg-[var(--color-bg-card)]"
          >
            <!-- Time label -->
            <span class="text-[10px] font-mono font-semibold uppercase text-[var(--color-text-muted)] shrink-0 w-36">
              {{ slot.timeLabel }}
            </span>

            <!-- Assignment dropdown -->
            <select
              v-model="slot.value"
              class="premium-input text-xs font-display flex-1"
              :class="slot.value && slot.value !== null
                ? (slot.value === 'break-short' || slot.value === 'break-long'
                    ? 'border-amber-500/50 bg-amber-500/5 text-amber-600'
                    : 'border-[var(--color-accent)]/50 bg-[var(--color-accent)]/5')
                : ''"
            >
              <option :value="null">-- Empty --</option>
              <option
                v-for="task in todayPlanTasks"
                :key="task.id"
                :value="task.id"
              >
                {{ task.title }}
              </option>
              <option value="break-short">Short Break (15 min)</option>
              <option value="break-long">Long Break (30 min)</option>
            </select>
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

const tasks = inject('tasks', ref([]))
const settings = inject('plannerSettings', ref({}))
const todayPlan = inject('todayPlan', ref(new Set()))
const studySessions = inject('studySessions', ref([]))
const addStudySession = inject('addStudySession', () => {})
const deleteStudySession = inject('deleteStudySession', () => {})

// ── Custom Session ────────────────────────────────────────────────
const newSession = ref({
  subject: '',
  date: new Date().toISOString().split('T')[0],
  time: '09:00',
  endTime: '10:00',
  duration: 1
})

const handleAddSession = () => {
  if (!newSession.value.subject) return
  addStudySession({ ...newSession.value })
  newSession.value.subject = ''
  newSession.value.endTime = '10:00'
}

// ── Tab state ─────────────────────────────────────────────────────
const activeSubTab = ref('daily')

const handlePrint = () => {
  window.print()
}

// ── Daily Schedule Setup ──────────────────────────────────────────
const scheduleSetup = ref({
  startTime: '09:00',
  endTime: '17:00',
  slotDuration: 60 // minutes: 30 or 60
})

const scheduleGenerated = ref(false)
const slotAssignments = ref([]) // [{ timeLabel: string, value: string|null }]

// Tasks in today's plan that are still pending
const todayPlanTasks = computed(() => {
  const planSet = todayPlan ? todayPlan.value : new Set()
  return tasks.value.filter(t => t.status === 'pending' && planSet.has(t.id))
})

const formatTimeFromMinutes = (totalMinutes) => {
  const h = Math.floor(totalMinutes / 60) % 24
  const m = totalMinutes % 60
  const period = h >= 12 ? 'PM' : 'AM'
  const displayH = h % 12 === 0 ? 12 : h % 12
  const displayM = m < 10 ? '0' + m : m
  return `${displayH}:${displayM} ${period}`
}

const generateSchedule = () => {
  const [sh, sm] = scheduleSetup.value.startTime.split(':').map(Number)
  const [eh, em] = scheduleSetup.value.endTime.split(':').map(Number)
  const startMins = sh * 60 + sm
  const endMins = eh * 60 + em
  const slotMins = scheduleSetup.value.slotDuration

  if (endMins <= startMins || slotMins <= 0) return

  const slots = []
  for (let cur = startMins; cur + slotMins <= endMins; cur += slotMins) {
    slots.push({
      timeLabel: `${formatTimeFromMinutes(cur)} – ${formatTimeFromMinutes(cur + slotMins)}`,
      value: null
    })
  }

  slotAssignments.value = slots
  scheduleGenerated.value = true
}

const resetSchedule = () => {
  scheduleGenerated.value = false
  slotAssignments.value = []
}

// ── Utility helpers ───────────────────────────────────────────────
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
  return [...pending].sort((a, b) => getTaskDeadlineDate(a) - getTaskDeadlineDate(b))
}

// dailyTimeline is kept for internal use / future reference but no longer rendered
const dailyTimeline = computed(() => {
  const sortedTasks = getSortedPendingTasks(true)
  const timeline = []
  let currentHour = 9.0
  let studyHoursScheduled = 0
  const maxStudyLimit = settings.value.dailyHourLimit || 6
  const breakFreq = settings.value.breakFrequency || 2
  const breakDur = (settings.value.breakDuration || 15) / 60
  let timeSinceLastBreak = 0

  for (const task of sortedTasks) {
    if (studyHoursScheduled >= maxStudyLimit) break
    const actualHours = 1
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
        durationHrs: chunkDuration
      })

      taskDurationLeft -= chunkDuration
      timeSinceLastBreak += chunkDuration
      studyHoursScheduled += chunkDuration

      if (Math.abs(timeSinceLastBreak - breakFreq) < 0.01 && studyHoursScheduled < maxStudyLimit) {
        const breakStart = formatTime(currentHour)
        currentHour += breakDur
        timeline.push({
          type: 'break',
          title: `${settings.value.breakDuration || 15}-Minute Rest Break`,
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

  // Add custom study sessions to the weekly schedule
  const sessionsList = studySessions?.value || []
  for (const session of sessionsList) {
    const sessionDate = new Date(session.date)
    // Adjust for timezone differences when creating dates from YYYY-MM-DD
    sessionDate.setMinutes(sessionDate.getMinutes() + sessionDate.getTimezoneOffset())
    const targetDay = scheduleDays.find(d => d.date.toDateString() === sessionDate.toDateString())
    if (targetDay) {
      targetDay.tasks.push({
        title: 'Custom Study Session',
        subject: session.subject,
        deadlineTimeStr: session.endTime
          ? `${formatDeadlineTime({ deadlineTime: session.time })} – ${formatDeadlineTime({ deadlineTime: session.endTime })}`
          : formatDeadlineTime({ deadlineTime: session.time }),
        isSession: true
      })
    }
  }

  // Sort tasks in each day by time
  for (const day of scheduleDays) {
    day.tasks.sort((a, b) => {
      const timeA = a.deadlineTimeStr === 'No time set' ? '23:59' : a.deadlineTimeStr
      const timeB = b.deadlineTimeStr === 'No time set' ? '23:59' : b.deadlineTimeStr
      return timeA.localeCompare(timeB)
    })
  }

  return scheduleDays
})
</script>
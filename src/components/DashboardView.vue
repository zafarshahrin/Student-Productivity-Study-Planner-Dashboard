<template>
  <div class="space-y-6">

    <!-- Due Today Notification -->
    <div v-if="dueTodayTasks.length > 0 && !notifDismissed"
      class="premium-card p-4 flex items-start justify-between gap-3">
      <div class="flex items-start gap-3 flex-1">
        <Bell class="w-4 h-4 text-[var(--color-accent)] mt-0.5 shrink-0"/>
        <div>
          <p class="text-xs font-display font-bold uppercase tracking-wider text-[var(--color-text-h)] mb-2">
            {{ dueTodayTasks.length }} Task{{ dueTodayTasks.length > 1 ? 's' : '' }} Due Today
          </p>
          <div class="flex flex-wrap gap-2">
            <div v-for="task in dueTodayTasks" :key="task.id"
              class="flex items-center gap-1.5 border border-[var(--color-border)] bg-[var(--color-bg-panel)] px-2 py-1">
              <span class="text-[11px] font-display font-semibold text-[var(--color-text-h)] truncate max-w-[180px]">{{ task.title }}</span>
              <span class="text-[9px] font-mono px-1 border uppercase font-bold shrink-0" :class="getNotifPriorityBadge(getAutoPriority(task))">
                {{ getAutoPriority(task) }}
              </span>
            </div>
          </div>
        </div>
      </div>
      <button @click="notifDismissed = true" class="text-[var(--color-text-muted)] hover:text-[var(--color-text-h)] cursor-pointer shrink-0">
        <X class="w-3.5 h-3.5"/>
      </button>
    </div>

    <!-- Overdue Notification -->
    <div
      v-if="overdueTasksList.length > 0 && !overdueDismissed"
      class="border border-red-500 bg-red-500/10 p-4 flex items-start justify-between gap-3 rounded-xl"
    >
      <div class="flex items-start gap-3 flex-1">
        <AlertTriangle class="w-4 h-4 text-red-500 mt-0.5 shrink-0"/>
        <div>
          <p class="text-sm font-display font-bold uppercase tracking-wider text-red-500 mb-1">
            Missed Deadline
          </p>
          <p class="text-xs font-mono text-red-400 font-semibold mb-2">
            These tasks missed their deadline. Complete or reschedule them immediately.
          </p>
          <div class="flex flex-wrap gap-2">
            <div
              v-for="task in overdueTasksList"
              :key="task.id"
              class="flex items-center gap-1.5 border border-red-500 bg-red-500/10 px-2 py-1 rounded-lg" 
            >
              <div class="flex flex-col">
                <span class="text-xs font-display font-bold text-red-400 truncate max-w-[180px]">{{ task.title }}</span>
                <span class="text-[9px] font-mono font-bold text-red-400/70">
                  Due: {{ task.deadline }}
                </span>
              </div>            
              <span class="text-[9px] font-mono px-1 border border-red-500 bg-red-500/20 text-red-400 uppercase font-bold shrink-0">
                {{ getDaysOverdue(task) }}D OVERDUE
              </span>              
            </div>
          </div>
        </div>
      </div>
      <button @click="overdueDismissed = true" class="text-red-400 hover:text-red-300 cursor-pointer shrink-0">
        <X class="w-3.5 h-3.5"/>
      </button>
    </div>

<!-- Summary Cards -->
<div class="grid grid-cols-2 lg:grid-cols-4 gap-4">

  <!-- Total Tasks -->
  <div class="premium-card summary-card p-4 flex flex-col justify-between h-28">
    <div class="flex items-center gap-2">
      <BookOpen class="w-4 h-4 text-[var(--color-accent)]" />
      <span class="text-[10px] uppercase font-display font-semibold tracking-wider text-[var(--color-text-muted)]">
        Total Tasks
      </span>
    </div>

    <div class="flex items-baseline justify-between mt-2">
      <span class="text-3xl font-display font-bold text-[var(--color-text-h)]">
        {{ totalTasks }}
      </span>

      <span class="text-xs font-mono text-[var(--color-text-muted)]">
        {{ totalHours }} hrs est.
      </span>
    </div>
  </div>

  <!-- Pending -->
  <div class="premium-card summary-card p-4 flex flex-col justify-between h-28">
    <div class="flex items-center gap-2">
      <Clock3 class="w-4 h-4 text-[var(--color-accent)]" />
      <span class="text-[10px] uppercase font-display font-semibold tracking-wider text-[var(--color-text-muted)]">
        Pending Tasks
      </span>
    </div>

    <div class="flex items-baseline justify-between mt-2">
      <span class="text-3xl font-display font-bold text-[var(--color-text-h)]">
        {{ pendingTasksCount }}
      </span>

      <span class="text-xs font-mono text-[var(--color-text-muted)]">
        {{ pendingHours }} hrs remaining
      </span>
    </div>
  </div>

  <!-- Completed -->
  <div class="premium-card summary-card p-4 flex flex-col justify-between h-28">
    <div class="flex items-center gap-2">
      <CheckCircle2 class="w-4 h-4 text-[var(--color-accent)]" />
      <span class="text-[10px] uppercase font-display font-semibold tracking-wider text-[var(--color-text-muted)]">
        Completed Tasks
      </span>
    </div>

    <div class="flex items-baseline justify-between mt-2">
      <span class="text-3xl font-display font-bold text-[var(--color-text-h)]">
        {{ completedTasksCount }}
      </span>

      <span class="text-xs font-mono text-[var(--color-text-muted)]">
        {{ completedHours }} hrs done
      </span>
    </div>
  </div>

  <!-- Productivity -->
  <div class="premium-card summary-card p-4 flex flex-col justify-between h-28">
    <div class="flex items-center gap-2">
      <TrendingUp class="w-4 h-4 text-[var(--color-accent)]" />
      <span class="text-[10px] uppercase font-display font-semibold tracking-wider text-[var(--color-text-muted)]">
        Productivity Ratio
      </span>
    </div>

    <div class="flex items-baseline justify-between mt-2">
      <span class="text-3xl font-display font-bold text-[var(--color-text-h)]">
        {{ productivityRatio }}%
      </span>

      <span
        class="text-[10px] uppercase font-display font-bold px-1.5 py-0.5 border"
        :class="getProductivityBadgeClasses()"
      >
        {{ productivityLevel }}
      </span>
    </div>
  </div>

</div>

    <!-- Charts + Right Column -->
    <div class="grid grid-cols-1 xl:grid-cols-3 gap-6">

      <!-- Charts -->
      <div class="xl:col-span-2">
        <div class="premium-card p-4 flex flex-col min-h-[380px]">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-xs uppercase font-display font-bold tracking-wider text-[var(--color-text-h)]">Task Analytics</h3>
            <div class="flex items-center border border-[var(--color-border)] overflow-hidden">
              <button @click="setChartTab('subject')"
                class="px-3 py-1.5 text-[10px] font-display font-bold uppercase tracking-wider transition-all cursor-pointer"
                :class="activeChartTab === 'subject' ? 'bg-[var(--color-accent)] text-[var(--color-bg)]' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-h)]'">
                Subject
              </button>
              <button @click="setChartTab('priority')"
                class="px-3 py-1.5 text-[10px] font-display font-bold uppercase tracking-wider transition-all cursor-pointer border-l border-[var(--color-border)]"
                :class="activeChartTab === 'priority' ? 'bg-[var(--color-accent)] text-[var(--color-bg)]' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-h)]'">
                Priority
              </button>
            </div>
          </div>

          <div v-if="totalTasks === 0" class="flex-1 flex items-center justify-center border border-dashed border-[var(--color-border)] text-xs font-mono text-[var(--color-text-muted)]">
            No task data available.
          </div>

          <div v-else class="flex flex-col md:flex-row gap-4 flex-1 min-h-0">
            <div class="relative flex items-center justify-center flex-shrink-0"
              :class="activeChartTab === 'subject' ? 'md:w-56 h-56 md:h-auto' : 'flex-1'">
              <canvas v-show="activeChartTab === 'subject'" ref="subjectCanvas" class="max-h-[220px] max-w-[220px]"></canvas>
              <canvas v-show="activeChartTab === 'priority'" ref="priorityCanvas" class="max-h-[220px] w-full"></canvas>
            </div>

            <!-- Legend -->
            <div class="flex-1 flex flex-col justify-center gap-2">
              <template v-if="activeChartTab === 'subject'">
                <p class="text-[10px] font-mono text-[var(--color-text-muted)] mb-1 uppercase tracking-wider">By Subject</p>
                <div v-for="(item, idx) in subjectLegend" :key="item.label"
                  class="flex items-center gap-2.5 p-2 border border-transparent hover:border-[var(--color-border)] hover:bg-[var(--color-bg-panel)]/40 transition-all">
                  <span class="w-2.5 h-2.5 shrink-0" :style="{ background: item.color }"></span>
                  <span class="text-xs font-display font-medium text-[var(--color-text-h)] truncate flex-1">{{ item.label }}</span>
                  <span class="text-[10px] font-mono text-[var(--color-text-muted)] shrink-0">{{ item.count }} task{{ item.count !== 1 ? 's' : '' }}</span>
                  <span class="text-[9px] font-mono font-bold px-1.5 py-0.5 border shrink-0"
                    :style="{ borderColor: item.color + '40', background: item.color + '15', color: item.color }">
                    {{ item.pct }}%
                  </span>
                </div>
              </template>

              <template v-else>
                <p class="text-[10px] font-mono text-[var(--color-text-muted)] mb-1 uppercase tracking-wider">By Priority</p>
                <div v-for="item in priorityLegend" :key="item.label"
                  class="flex items-center gap-2.5 p-2 border border-transparent hover:border-[var(--color-border)] hover:bg-[var(--color-bg-panel)]/40 transition-all">
                  <span class="w-2.5 h-2.5 shrink-0" :style="{ background: item.color }"></span>
                  <span class="text-xs font-display font-medium flex-1" :style="{ color: item.color }">{{ item.label }}</span>
                  <span class="text-[10px] font-mono text-[var(--color-text-muted)] shrink-0">{{ item.count }} task{{ item.count !== 1 ? 's' : '' }}</span>
                  <div class="w-16 h-1.5 bg-[var(--color-bg-panel)] overflow-hidden shrink-0">
                    <div class="h-full transition-all duration-500" :style="{ width: item.pct + '%', background: item.color }"></div>
                  </div>
                  <span class="text-[9px] font-mono w-7 text-right shrink-0 text-[var(--color-text-muted)]">{{ item.pct }}%</span>
                </div>
                <div class="mt-2 pt-2 border-t border-[var(--color-border)] flex items-center justify-between">
                  <span class="text-[10px] font-mono text-[var(--color-text-muted)]">Total pending tasks</span>
                  <span class="text-xs font-display font-bold text-[var(--color-text-h)]">{{ pendingTasksCount }}</span>
                </div>
              </template>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Column -->
      <div class="space-y-4">

        <!-- Upcoming Deadlines -->
        <div class="premium-card p-4">
          <h3 class="text-xs uppercase font-display font-bold tracking-wider text-[var(--color-text-h)] mb-3">Upcoming Deadlines</h3>
          <div class="space-y-2">
            <div v-for="task in upcomingTasks" :key="task.id"
              class="p-2.5 border border-[var(--color-border)] bg-[var(--color-bg-panel)]/30 flex flex-col gap-1.5">
              <div class="flex items-start justify-between gap-2">
                <span class="text-xs font-bold text-[var(--color-text-h)] font-display truncate">{{ task.title }}</span>
                <span class="text-[9px] font-mono px-1 border uppercase font-semibold shrink-0" 
                :class="getAutoPriorityClasses(task)"
                >
                  {{ getAutoPriority(task) }}
                </span>
              </div>
              <div class="flex items-center justify-between text-[10px] font-mono text-[var(--color-text-muted)]">
                <span>{{ task.subject }}</span>
                <span>Due: {{ formatDateTime(task) }}</span>
              </div>
            </div>
            <div v-if="upcomingTasks.length === 0" class="p-6 text-center text-xs font-mono text-[var(--color-text-muted)] border border-dashed border-[var(--color-border)]">
              All tasks completed!
            </div>
          </div>
        </div>

        <!-- Past Due Tasks -->
        <div class="border border-red-500 bg-red-500/10 p-4 rounded-xl">
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-xs uppercase font-display font-bold tracking-wider text-red-500">Past Due Tasks</h3>
            <span
              v-if="overdueTasksList.length > 0"
              class="text-[9px] font-mono font-bold px-1.5 py-0.5 border border-red-500 bg-red-500/20 text-red-500 uppercase"
            >
              {{ overdueTasksList.length }} overdue
            </span>
          </div>
          <div class="space-y-2">
            <div v-for="task in overdueTasksList" :key="task.id"
              class="p-2.5 border border-red-500/40 bg-red-500/10 flex flex-col gap-1.5 rounded-lg">
              <div class="flex items-start justify-between gap-2">
                <span class="text-xs font-bold text-red-400 font-display truncate">{{ task.title }}</span>
                <span class="text-[9px] font-mono font-bold px-1 border border-red-500 bg-red-500/20 text-red-400 uppercase shrink-0">
                  {{ getDaysOverdue(task) }}D OVERDUE
                </span>
              </div>
              <div class="flex items-center justify-between text-[10px] font-mono text-red-400/70">
                <span>{{ task.subject }}</span>
                <span>Was due: {{ formatDateTime(task) }}</span>
              </div>
            </div>
            <div v-if="overdueTasksList.length === 0" class="p-6 text-center text-xs font-mono text-red-400/70 border border-dashed border-red-500/40">
              No overdue tasks!
            </div>
          </div>
        </div>
     
        

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, inject, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import {
  ChevronLeft,
  ChevronRight,
  Bell,
  X,
  AlertTriangle,
  BookOpen,
  Clock3,
  CheckCircle2,
  TrendingUp
} from 'lucide-vue-next'
import { Chart } from 'chart.js/auto'

const tasks = inject('tasks')

// Notifications
const notifDismissed = ref(false)
const overdueDismissed = ref(false)

const dueTodayTasks = computed(() => {
  const today = new Date()
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
  return tasks.value.filter(t => t.status === 'pending' && t.deadline === todayStr)
})

const overdueTasksList = computed(() => {
  const today = new Date()
  return tasks.value.filter(t => {
    if (t.status !== 'pending' || !t.deadline) return false
    const [y, m, d] = t.deadline.split('-')
    const deadline = new Date(Number(y), Number(m) - 1, Number(d))
    if (t.deadlineTime) {
      const [h, min] = t.deadlineTime.split(':')
      deadline.setHours(parseInt(h, 10), parseInt(min, 10), 0, 0)
    } else {
      deadline.setHours(23, 59, 59, 999)
    }
    return deadline < today
  }).sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
})

watch(dueTodayTasks, (newVal, oldVal) => { if (newVal.length > oldVal.length) notifDismissed.value = false })
watch(overdueTasksList, (newVal, oldVal) => { if (newVal.length > oldVal.length) overdueDismissed.value = false })

const getDaysOverdue = (task) => {
  const today = new Date()
  const [y, m, d] = task.deadline.split('-')
  const deadline = new Date(Number(y), Number(m) - 1, Number(d))
  if (task.deadlineTime) {
    const [h, min] = task.deadlineTime.split(':')
    deadline.setHours(parseInt(h, 10), parseInt(min, 10), 0, 0)
  } else {
    deadline.setHours(23, 59, 59, 999)
  }
  const diff = Math.ceil((today - deadline) / (1000 * 60 * 60 * 24))
  return diff > 0 ? diff : 0
}

// Priority
const getAutoPriority = (task) => {
  if (task.status === 'completed') return 'Done'
  if (!task.deadline) return 'Low'
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const [y, m, d] = task.deadline.split('-')
  const deadline = new Date(Number(y), Number(m) - 1, Number(d))
  deadline.setHours(0, 0, 0, 0)
  const diffDays = Math.ceil((deadline - today) / (1000 * 60 * 60 * 24))
  if (diffDays < 0) return 'Overdue'
  if (diffDays <= 2) return 'High'
  if (diffDays <= 4) return 'Medium'
  return 'Low'
}

const getAutoPriorityClasses = (task) => {
  const p = getAutoPriority(task)
  if (p === 'Overdue') return 'border-zinc-700/40 bg-zinc-800/60 text-zinc-300'
  if (p === 'High')    return 'border-rose-500/20 bg-rose-500/10 text-rose-500'
  if (p === 'Medium')  return 'border-amber-500/20 bg-amber-500/10 text-amber-500'
  return 'border-emerald-500/20 bg-emerald-500/10 text-emerald-500'
}

const getNotifPriorityBadge = (priority) => {
  if (priority === 'High') return 'border-rose-500/30 bg-rose-500/15 text-rose-500'
  if (priority === 'Medium') return 'border-amber-500/30 bg-amber-500/15 text-amber-500'
  return 'border-emerald-500/30 bg-emerald-500/15 text-emerald-500'
}

// Study Tips
const activeTipIndex = ref(0)
let tipTimer = null

const studyTips = [
  { strategy: 'Active Recall', tip: 'Test yourself on the material instead of rereading. Close the textbook and write down everything you remember, or use flashcards.' },
  { strategy: 'Spaced Repetition', tip: 'Review concepts at increasing intervals (1 day, 3 days, 7 days, 14 days) to lock information into long-term memory.' },
  { strategy: 'Feynman Technique', tip: 'Explain the topic in simple terms to an imaginary student. If you struggle, return to your books to fill in the knowledge gap.' },
  { strategy: 'Pomodoro Method', tip: 'Study in structured 25-minute bursts followed by a 5-minute break. This prevents fatigue and keeps concentration sharp.' },
  { strategy: 'Eat the Frog First', tip: 'Start your study session with the hardest task. Getting it out of the way builds momentum for the rest of the session.' }
]

const currentTip = computed(() => studyTips[activeTipIndex.value])
const nextTip = () => { activeTipIndex.value = (activeTipIndex.value + 1) % studyTips.length }
const prevTip = () => { activeTipIndex.value = (activeTipIndex.value - 1 + studyTips.length) % studyTips.length }

// Stats
const totalTasks = computed(() => tasks.value.length)
const totalHours = computed(() => tasks.value.reduce((a, t) => a + (t.estimatedHours || 0), 0))
const pendingTasksCount = computed(() => tasks.value.filter(t => t.status === 'pending').length)
const pendingHours = computed(() => tasks.value.filter(t => t.status === 'pending').reduce((a, t) => a + (t.estimatedHours || 0), 0))
const completedTasksCount = computed(() => tasks.value.filter(t => t.status === 'completed').length)
const completedHours = computed(() => tasks.value.filter(t => t.status === 'completed').reduce((a, t) => a + (t.estimatedHours || 0), 0))

const productivityRatio = computed(() => {
  if (totalHours.value === 0) return 0
  return Math.round((completedHours.value / totalHours.value) * 100)
})

const productivityLevel = computed(() => {
  const r = productivityRatio.value
  if (r >= 80) return 'Exceptional'
  if (r >= 50) return 'Productive'
  return 'Neutral'
})

const getProductivityColor = () => {
  const r = productivityRatio.value
  if (r >= 80) return '#10b981'
  if (r >= 50) return '#f59e0b'
  return '#6b7280'
}

const getProductivityBadgeClasses = () => {
  const l = productivityLevel.value
  if (l === 'Exceptional') return 'border-emerald-500/20 bg-emerald-500/10 text-emerald-600 font-semibold'
  if (l === 'Productive')  return 'border-amber-500/20 bg-amber-500/10 text-amber-600 font-semibold'
return 'border-[var(--color-accent)]/30 bg-[var(--color-accent-light)] text-[var(--color-accent)] font-semibold'
}
const upcomingTasks = computed(() =>
  [...tasks.value].filter(t => t.status === 'pending').sort((a, b) => new Date(a.deadline) - new Date(b.deadline)).slice(0, 3)
)

const formatDateTime = (task) => {
  if (!task.deadline) return '-'
  const [y, m, d] = task.deadline.split('-')
  const dateObj = new Date(y, m - 1, d)
  const dateStr = dateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
  if (task.deadlineTime) {
    const [h, min] = task.deadlineTime.split(':')
    const t = new Date()
    t.setHours(parseInt(h, 10), parseInt(min, 10))
    return `${dateStr} at ${t.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}`
  }
  return dateStr
}

// Charts
const activeChartTab = ref('subject')
const subjectCanvas = ref(null)
const priorityCanvas = ref(null)
let subjectChartInstance = null
let priorityChartInstance = null
let themeObserver = null

const CHART_COLORS = ['#6366f1', '#a855f7', '#f59e0b', '#10b981', '#ec4899', '#06b6d4', '#f97316']
const PRIORITY_COLORS = { High: '#f43f5e', Medium: '#f59e0b', Low: '#10b981', Overdue: '#71717a', Done: '#a3a3a3' }

const subjectLegend = computed(() => {
  const map = {}
  tasks.value.forEach(t => { if (t.subject) map[t.subject] = (map[t.subject] || 0) + 1 })
  const total = Object.values(map).reduce((a, b) => a + b, 0) || 1
  return Object.entries(map).map(([label, count], idx) => ({
    label, count, color: CHART_COLORS[idx % CHART_COLORS.length], pct: Math.round((count / total) * 100)
  }))
})

const priorityLegend = computed(() => {
  const map = { High: 0, Medium: 0, Low: 0, Overdue: 0, Done: 0 }
  tasks.value.forEach(t => { const p = getAutoPriority(t); if (p in map) map[p] += 1 })
  const total = tasks.value.length || 1
  return ['High', 'Medium', 'Low', 'Overdue', 'Done'].filter(k => map[k] > 0).map(k => ({
    label: k, count: map[k], color: PRIORITY_COLORS[k], pct: Math.round((map[k] / total) * 100)
  }))
})

const setChartTab = (tab) => {
  activeChartTab.value = tab
  setTimeout(() => {
    if (tab === 'subject' && subjectChartInstance) subjectChartInstance.resize()
    if (tab === 'priority' && priorityChartInstance) priorityChartInstance.resize()
  }, 10)
}

const renderCharts = () => {
  const style = getComputedStyle(document.documentElement)
  const textColor = style.getPropertyValue('--color-text-muted').trim() || '#888'
  const borderColor = style.getPropertyValue('--color-border').trim() || '#ddd'
  const bgCard = style.getPropertyValue('--color-bg-card').trim() || '#fff'
  const accentColor = style.getPropertyValue('--color-accent').trim() || '#6366f1'
  const palette = [accentColor, ...CHART_COLORS.slice(1)]

  if (subjectChartInstance) subjectChartInstance.destroy()
  if (subjectCanvas.value && subjectLegend.value.length > 0) {
    const map = {}
    tasks.value.forEach(t => { if (t.subject) map[t.subject] = (map[t.subject] || 0) + 1 })
    subjectChartInstance = new Chart(subjectCanvas.value, {
      type: 'doughnut',
      data: {
        labels: Object.keys(map),
        datasets: [{ data: Object.values(map), backgroundColor: palette.slice(0, Object.keys(map).length), borderWidth: 2, borderColor: bgCard, hoverOffset: 6 }]
      },
      options: {
        responsive: true, maintainAspectRatio: true, cutout: '68%',
        plugins: { legend: { display: false } }
      }
    })
  }

  if (priorityChartInstance) priorityChartInstance.destroy()
  if (priorityCanvas.value && totalTasks.value > 0) {
    const map = { High: 0, Medium: 0, Low: 0, Overdue: 0, Done: 0 }
    tasks.value.forEach(t => { const p = getAutoPriority(t); if (p in map) map[p] += 1 })
    const labels = ['High', 'Medium', 'Low', 'Overdue', 'Done'].filter(k => map[k] > 0)
    priorityChartInstance = new Chart(priorityCanvas.value, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          data: labels.map(k => map[k]),
          backgroundColor: labels.map(k => PRIORITY_COLORS[k] + 'bb'),
          borderColor: labels.map(k => PRIORITY_COLORS[k]),
          borderWidth: 1
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { display: false }, ticks: { color: textColor }, border: { color: borderColor } },
          y: { grid: { color: borderColor }, ticks: { color: textColor, stepSize: 1 }, border: { color: borderColor } }
        }
      }
    })
  }
}

watch(tasks, () => renderCharts(), { deep: true })

onMounted(() => {
  tipTimer = setInterval(nextTip, 10000)
  setTimeout(renderCharts, 100)
  themeObserver = new MutationObserver(() => setTimeout(renderCharts, 50))
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
})

onBeforeUnmount(() => {
  if (tipTimer) clearInterval(tipTimer)
  if (subjectChartInstance) subjectChartInstance.destroy()
  if (priorityChartInstance) priorityChartInstance.destroy()
  if (themeObserver) themeObserver.disconnect()
})
</script>
<template>
  <div class="space-y-6">

    <!-- Due Today Notification Banner -->
    <transition name="notif-slide">
      <div
        v-if="dueTodayTasks.length > 0 && !notifDismissed"
        class="notif-banner relative overflow-hidden border rounded-sm p-4"
      >
        <!-- Animated accent strip -->
        <div class="notif-accent-bar"></div>

        <div class="flex items-start justify-between gap-3">
          <!-- Icon + Header -->
          <div class="flex items-start gap-3 flex-1 min-w-0">
            <div class="notif-bell-wrap shrink-0 mt-0.5">
              <Bell class="w-4 h-4 notif-bell-icon" />
            </div>
            <div class="min-w-0">
              <p class="text-xs font-display font-bold uppercase tracking-widest notif-title mb-2">
                {{ dueTodayTasks.length }} Task{{ dueTodayTasks.length > 1 ? 's' : '' }} Due Today
              </p>
              <div class="flex flex-wrap gap-2">
                <div
                  v-for="task in dueTodayTasks"
                  :key="task.id"
                  class="notif-task-chip flex items-center gap-1.5"
                >
                  <span
                    class="w-1.5 h-1.5 rounded-full shrink-0"
                    :class="getNotifPriorityDot(getAutoPriority(task))"
                  ></span>
                  <span class="text-[11px] font-display font-semibold notif-task-name truncate max-w-[180px]">
                    {{ task.title }}
                  </span>
                  <span
                    class="text-[9px] font-mono px-1 border uppercase font-bold shrink-0"
                    :class="getNotifPriorityBadge(getAutoPriority(task))"
                  >
                    {{ getAutoPriority(task) }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Dismiss button -->
          <button
            @click="notifDismissed = true"
            class="notif-dismiss shrink-0 p-1 rounded-sm"
            title="Dismiss notification"
          >
            <X class="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </transition>

    <!-- ── Overdue Tasks Notification Banner ── -->
    <transition name="notif-slide">
      <div
        v-if="overdueTasksList.length > 0 && !overdueDismissed"
        class="overdue-banner relative overflow-hidden border rounded-sm p-4"
      >
        <!-- Red pulsing left strip -->
        <div class="overdue-accent-bar"></div>

        <div class="flex items-start justify-between gap-3">
          <div class="flex items-start gap-3 flex-1 min-w-0">
            <!-- Alert icon -->
            <div class="overdue-icon-wrap shrink-0 mt-0.5">
              <AlertTriangle class="w-4 h-4 overdue-icon" />
            </div>

            <div class="min-w-0">
              <p class="text-xs font-display font-bold uppercase tracking-widest overdue-title mb-1">
                ⚠ {{ overdueTasksList.length }} Overdue Task{{ overdueTasksList.length > 1 ? 's' : '' }} — Action Required
              </p>
              <p class="text-[10px] font-mono text-red-400/80 mb-2">
                These tasks missed their deadline. Complete or reschedule them immediately.
              </p>
              <div class="flex flex-wrap gap-2">
                <div
                  v-for="task in overdueTasksList"
                  :key="task.id"
                  class="overdue-task-chip flex items-center gap-1.5"
                >
                  <span class="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0 animate-pulse"></span>
                  <span class="text-[11px] font-display font-semibold text-red-100 truncate max-w-[180px]">
                    {{ task.title }}
                  </span>
                  <span class="text-[9px] font-mono px-1.5 py-px border border-red-500/40 bg-red-500/20 text-red-300 uppercase font-bold shrink-0">
                    {{ getDaysOverdue(task) }}d overdue
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Dismiss -->
          <button
            @click="overdueDismissed = true"
            class="overdue-dismiss shrink-0 p-1 rounded-sm"
            title="Dismiss"
          >
            <X class="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </transition>
    <!-- Summary Cards -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <!-- Total Tasks -->
      <div class="premium-card p-4 flex flex-col justify-between h-28">
        <span class="text-[10px] uppercase font-display font-semibold tracking-wider text-[var(--color-text-muted)]">
          Total Tasks
        </span>
        <div class="flex items-baseline justify-between mt-2">
          <span class="text-3xl font-display font-bold text-[var(--color-text-h)]">
            {{ totalTasks }}
          </span>
          <span class="text-xs font-mono text-[var(--color-text-muted)]">
            {{ totalHours }} hrs est.
          </span>
        </div>
      </div>

      <!-- Pending Tasks -->
      <div class="premium-card p-4 flex flex-col justify-between h-28">
        <span class="text-[10px] uppercase font-display font-semibold tracking-wider text-[var(--color-text-muted)]">
          Pending Tasks
        </span>
        <div class="flex items-baseline justify-between mt-2">
          <span class="text-3xl font-display font-bold text-[var(--color-text-h)]">
            {{ pendingTasksCount }}
          </span>
          <span class="text-xs font-mono text-[var(--color-text-muted)]">
            {{ pendingHours }} hrs remaining
          </span>
        </div>
      </div>

      <!-- Completed Tasks -->
      <div class="premium-card p-4 flex flex-col justify-between h-28">
        <span class="text-[10px] uppercase font-display font-semibold tracking-wider text-[var(--color-text-muted)]">
          Completed Tasks
        </span>
        <div class="flex items-baseline justify-between mt-2">
          <span class="text-3xl font-display font-bold text-[var(--color-text-h)]">
            {{ completedTasksCount }}
          </span>
          <span class="text-xs font-mono text-[var(--color-text-muted)]">
            {{ completedHours }} hrs done
          </span>
        </div>
      </div>

      <!-- Productivity & Level -->
      <div class="premium-card p-4 flex flex-col justify-between h-28 border-l-2" :style="{ borderLeftColor: getProductivityColor() }">
        <span class="text-[10px] uppercase font-display font-semibold tracking-wider text-[var(--color-text-muted)]">
          Productivity Ratio
        </span>
        <div class="flex items-baseline justify-between mt-2">
          <span class="text-3xl font-display font-bold text-[var(--color-text-h)]">
            {{ productivityRatio }}%
          </span>
          <span 
            class="text-[10px] uppercase font-display font-bold tracking-wider px-1.5 py-0.5 border"
            :class="getProductivityBadgeClasses()"
          >
            {{ productivityLevel }}
          </span>
        </div>
      </div>
    </div>

    <!-- Charts Area & Upcoming Deadlines Grid -->
    <div class="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <!-- Combined Charts Block (full-width on xl) -->
      <div class="xl:col-span-2">
        <div class="premium-card p-4 flex flex-col min-h-[380px]">

          <!-- Card Header: title + tab switcher -->
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-xs uppercase font-display font-bold tracking-wider text-[var(--color-text-h)]">
              Task Analytics
            </h3>

            <!-- Tab Toggle -->
            <div class="flex items-center border border-[var(--color-border)] rounded-sm overflow-hidden">
              <button
                @click="setChartTab('subject')"
                class="px-3 py-1.5 text-[10px] font-display font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer"
                :class="activeChartTab === 'subject'
                  ? 'bg-[var(--color-accent)] text-[var(--color-bg)]'
                  : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-h)] hover:bg-[var(--color-bg-panel)]'"
              >
                Subject
              </button>
              <button
                @click="setChartTab('priority')"
                class="px-3 py-1.5 text-[10px] font-display font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer border-l border-[var(--color-border)]"
                :class="activeChartTab === 'priority'
                  ? 'bg-[var(--color-accent)] text-[var(--color-bg)]'
                  : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-h)] hover:bg-[var(--color-bg-panel)]'"
              >
                Priority
              </button>
            </div>
          </div>

          <!-- Empty State -->
          <div v-if="totalTasks === 0" class="flex-1 flex items-center justify-center border border-dashed border-[var(--color-border)] text-xs font-mono text-[var(--color-text-muted)]">
            No task data available.
          </div>

          <!-- Chart + Legend layout -->
          <div v-else class="flex flex-col md:flex-row gap-4 flex-1 min-h-0">

            <!-- Canvas area -->
            <div class="relative flex items-center justify-center flex-shrink-0" :class="activeChartTab === 'subject' ? 'md:w-56 h-56 md:h-auto' : 'flex-1'">
              <!-- Subject doughnut canvas -->
              <canvas
                v-show="activeChartTab === 'subject'"
                ref="subjectCanvas"
                class="max-h-[220px] max-w-[220px]"
              ></canvas>
              <!-- Priority bar canvas -->
              <canvas
                v-show="activeChartTab === 'priority'"
                ref="priorityCanvas"
                class="max-h-[220px] w-full"
              ></canvas>
            </div>

            <!-- Legend panel -->
            <div class="flex-1 flex flex-col justify-center gap-2 min-w-0">

              <!-- Subject legend -->
              <template v-if="activeChartTab === 'subject'">
                <p class="text-[10px] font-mono text-[var(--color-text-muted)] mb-1 uppercase tracking-wider">By Subject</p>
                <div
                  v-for="(item, idx) in subjectLegend"
                  :key="item.label"
                  class="flex items-center gap-2.5 p-2 border border-transparent hover:border-[var(--color-border)] hover:bg-[var(--color-bg-panel)]/40 transition-all rounded-sm group"
                >
                  <span class="w-2.5 h-2.5 rounded-sm shrink-0" :style="{ background: item.color }"></span>
                  <span class="text-xs font-display font-medium text-[var(--color-text-h)] truncate flex-1">{{ item.label }}</span>
                  <span class="text-[10px] font-mono text-[var(--color-text-muted)] shrink-0">{{ item.count }} task{{ item.count !== 1 ? 's' : '' }}</span>
                  <span
                    class="text-[9px] font-mono font-bold px-1.5 py-0.5 border shrink-0"
                    :style="{ borderColor: item.color + '40', background: item.color + '15', color: item.color }"
                  >{{ item.pct }}%</span>
                </div>
              </template>

              <!-- Priority legend -->
              <template v-else>
                <p class="text-[10px] font-mono text-[var(--color-text-muted)] mb-1 uppercase tracking-wider">By Priority</p>
                <div
                  v-for="item in priorityLegend"
                  :key="item.label"
                  class="flex items-center gap-2.5 p-2 border border-transparent hover:border-[var(--color-border)] hover:bg-[var(--color-bg-panel)]/40 transition-all rounded-sm"
                >
                  <span class="w-2.5 h-2.5 rounded-sm shrink-0" :style="{ background: item.color }"></span>
                  <span class="text-xs font-display font-medium flex-1" :style="{ color: item.color }">{{ item.label }}</span>
                  <span class="text-[10px] font-mono text-[var(--color-text-muted)] shrink-0">{{ item.count }} task{{ item.count !== 1 ? 's' : '' }}</span>
                  <!-- Mini progress bar -->
                  <div class="w-16 h-1.5 bg-[var(--color-bg-panel)] rounded-full overflow-hidden shrink-0">
                    <div
                      class="h-full rounded-full transition-all duration-500"
                      :style="{ width: item.pct + '%', background: item.color }"
                    ></div>
                  </div>
                  <span class="text-[9px] font-mono w-7 text-right shrink-0 text-[var(--color-text-muted)]">{{ item.pct }}%</span>
                </div>

                <!-- Divider + summary line -->
                <div class="mt-2 pt-2 border-t border-[var(--color-border)] flex items-center justify-between">
                  <span class="text-[10px] font-mono text-[var(--color-text-muted)]">Total pending tasks</span>
                  <span class="text-xs font-display font-bold text-[var(--color-text-h)]">{{ pendingTasksCount }}</span>
                </div>
              </template>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Column: Deadlines & Rotating Study Tips -->
      <div class="space-y-4">
        <!-- Upcoming Deadlines -->
        <div class="premium-card p-4">
          <h3 class="text-xs uppercase font-display font-bold tracking-wider text-[var(--color-text-h)] mb-3">
            Upcoming Deadlines
          </h3>
          <div class="space-y-2">
            <div 
              v-for="task in upcomingTasks" 
              :key="task.id" 
              class="p-2.5 border border-[var(--color-border)] bg-[var(--color-bg-panel)]/30 flex flex-col justify-between gap-1.5"
            >
              <div class="flex items-start justify-between gap-2">
                <span class="text-xs font-bold text-[var(--color-text-h)] font-display truncate">
                  {{ task.title }}
                </span>
                <span 
                  class="text-[9px] font-mono px-1 border uppercase font-semibold shrink-0"
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

            <!-- Empty State -->
            <div v-if="upcomingTasks.length === 0" class="p-6 text-center text-xs font-mono text-[var(--color-text-muted)] border border-dashed border-[var(--color-border)]">
              All tasks completed!
            </div>
          </div>
        </div>

        <!-- ── Past Due Tasks Card ── -->
        <div class="overdue-card border rounded-sm p-4 relative overflow-hidden">
          <!-- Pulsing red left strip -->
          <div class="overdue-accent-bar"></div>

          <!-- Header -->
          <div class="flex items-center justify-between mb-3">
            <div class="flex items-center gap-2">
              <div class="overdue-icon-wrap">
                <AlertTriangle class="w-3.5 h-3.5 overdue-icon" />
              </div>
              <h3 class="text-xs uppercase font-display font-bold tracking-wider overdue-card-title">
                Past Due Tasks
              </h3>
            </div>
            <!-- Count badge -->
            <span
              v-if="overdueTasksList.length > 0"
              class="text-[9px] font-mono font-bold px-2 py-0.5 border border-red-500/40 bg-red-500/20 text-red-400 uppercase"
            >
              {{ overdueTasksList.length }} overdue
            </span>
          </div>

          <!-- No overdue tasks state -->
          <div
            v-if="overdueTasksList.length === 0"
            class="py-5 flex flex-col items-center gap-2 border border-dashed border-red-500/20 text-center"
          >
            <span class="text-green-500 text-lg">✓</span>
            <p class="text-[10px] font-mono text-[var(--color-text-muted)]">No overdue tasks</p>
          </div>

          <!-- Overdue task rows -->
          <div v-else class="space-y-1.5 max-h-[220px] overflow-y-auto overdue-scroll">
            <div
              v-for="task in overdueTasksList"
              :key="task.id"
              class="overdue-row flex items-start gap-2 p-2.5 border border-red-500/15 bg-red-500/5 hover:bg-red-500/10 transition-all"
            >
              <!-- Pulsing dot -->
              <span class="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0 mt-1.5 animate-pulse"></span>

              <div class="flex-1 min-w-0">
                <p class="text-xs font-display font-semibold text-red-200/90 truncate leading-tight">
                  {{ task.title }}
                </p>
                <div class="flex items-center justify-between mt-0.5 gap-1">
                  <span class="text-[9px] font-mono text-red-400/60 truncate">{{ task.subject }}</span>
                  <span class="text-[9px] font-mono text-red-300/80 shrink-0">
                    Was due {{ formatDateTime(task) }}
                  </span>
                </div>
              </div>

              <!-- Days overdue badge -->
              <span class="text-[9px] font-mono font-bold px-1.5 py-0.5 border border-red-500/30 bg-red-500/15 text-red-400 uppercase shrink-0 self-start mt-0.5">
                {{ getDaysOverdue(task) }}d
              </span>
            </div>
          </div>

          <!-- Footer note -->
          <p v-if="overdueTasksList.length > 0" class="text-[9px] font-mono text-red-400/50 mt-2.5 text-right">
            Complete or reschedule these tasks
          </p>
        </div>

        <!-- Rotating Study Tips Carousel -->
        <div class="premium-card p-4 flex flex-col justify-between min-h-[172px]">
          <div class="flex items-center justify-between">
            <h3 class="text-xs uppercase font-display font-bold tracking-wider text-[var(--color-text-h)]">
              Study Tip Carousel
            </h3>
            <div class="flex items-center gap-1">
              <button @click="prevTip" class="p-1 hover:bg-[var(--color-bg-panel)] rounded-sm border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text-h)] cursor-pointer">
                <ChevronLeft class="w-3 h-3" />
              </button>
              <button @click="nextTip" class="p-1 hover:bg-[var(--color-bg-panel)] rounded-sm border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text-h)] cursor-pointer">
                <ChevronRight class="w-3 h-3" />
              </button>
            </div>
          </div>

          <div class="flex-1 flex flex-col justify-center py-3">
            <h4 class="text-xs font-bold text-[var(--color-accent)] font-display uppercase tracking-wider mb-1">
              {{ currentTip.strategy }}
            </h4>
            <p class="text-xs text-[var(--color-text-muted)] leading-relaxed font-body">
              {{ currentTip.tip }}
            </p>
          </div>

          <div class="flex justify-center gap-1.5 mt-1">
            <span 
              v-for="(tip, idx) in studyTips" 
              :key="idx" 
              class="w-1.5 h-1.5 transition-colors"
              :class="activeTipIndex === idx ? 'bg-[var(--color-accent)]' : 'bg-[var(--color-border)]'"
            ></span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, inject, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { ChevronLeft, ChevronRight, Bell, X, AlertTriangle } from 'lucide-vue-next'
import { Chart } from 'chart.js/auto'

const tasks = inject('tasks')

// ── Due Today Notification ─────────────────────────────────────────────────
const notifDismissed = ref(false)

const dueTodayTasks = computed(() => {
  const today = new Date()
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
  return tasks.value.filter(t => t.status === 'pending' && t.deadline === todayStr)
})

// Re-show notification when new due-today tasks appear
watch(dueTodayTasks, (newVal, oldVal) => {
  if (newVal.length > oldVal.length) {
    notifDismissed.value = false
  }
})

// ── Overdue Notification ────────────────────────────────────────────────────
const overdueDismissed = ref(false)

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
  }).sort((a, b) => {
    // Most overdue first
    const dateA = new Date(a.deadline)
    if (a.deadlineTime) {
      const [h, m] = a.deadlineTime.split(':')
      dateA.setHours(parseInt(h, 10), parseInt(m, 10))
    }
    const dateB = new Date(b.deadline)
    if (b.deadlineTime) {
      const [h, m] = b.deadlineTime.split(':')
      dateB.setHours(parseInt(h, 10), parseInt(m, 10))
    }
    return dateA - dateB
  })
})

// How many days past due
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
  
  const diffDays = Math.ceil((today - deadline) / (1000 * 60 * 60 * 24))
  return diffDays > 0 ? diffDays : 0 // If it's overdue today, say 0d or 1d
}

// Re-show overdue banner when new overdue tasks appear
watch(overdueTasksList, (newVal, oldVal) => {
  if (newVal.length > oldVal.length) {
    overdueDismissed.value = false
  }
})

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

const getNotifPriorityDot = (priority) => {
  if (priority === 'High') return 'bg-rose-500'
  if (priority === 'Medium') return 'bg-amber-400'
  return 'bg-emerald-500'
}

const getNotifPriorityBadge = (priority) => {
  if (priority === 'High') return 'border-rose-500/30 bg-rose-500/15 text-rose-500'
  if (priority === 'Medium') return 'border-amber-500/30 bg-amber-500/15 text-amber-500'
  return 'border-emerald-500/30 bg-emerald-500/15 text-emerald-500'
}

// Rotating Study Tips state
const activeTipIndex = ref(0)
let tipTimer = null

const studyTips = [
  {
    strategy: 'Active Recall',
    tip: 'Test yourself on the material instead of rereading. Close the textbook and write down everything you remember, or use flashcards.'
  },
  {
    strategy: 'Spaced Repetition',
    tip: 'Review concepts at increasing intervals (e.g. 1 day, 3 days, 7 days, 14 days) to lock the information into your long-term memory.'
  },
  {
    strategy: 'Feynman Technique',
    tip: 'Explain the topic in simple terms to an imaginary student. If you struggle or stumble, return to your books to fill in the knowledge gap.'
  },
  {
    strategy: 'Pomodoro Method',
    tip: 'Study in structured 25-minute bursts followed by a 5-minute break. This prevents fatigue and keeps your concentration sharp.'
  },
  {
    strategy: 'Eat the Frog First',
    tip: 'Start your study session with the hardest, most complex, or least pleasant task. Getting it out of the way builds momentum.'
  }
]

const currentTip = computed(() => studyTips[activeTipIndex.value])

const nextTip = () => {
  activeTipIndex.value = (activeTipIndex.value + 1) % studyTips.length
}

const prevTip = () => {
  activeTipIndex.value = (activeTipIndex.value - 1 + studyTips.length) % studyTips.length
}

// Reset study tip interval timer
const startTipTimer = () => {
  if (tipTimer) clearInterval(tipTimer)
  tipTimer = setInterval(nextTip, 10000) // Cycle every 10 seconds
}

// Stats metrics
const totalTasks = computed(() => tasks.value.length)

const totalHours = computed(() => {
  return tasks.value.reduce((acc, t) => acc + (t.estimatedHours || 0), 0)
})

const pendingTasksCount = computed(() => {
  return tasks.value.filter(t => t.status === 'pending').length
})

const pendingHours = computed(() => {
  return tasks.value
    .filter(t => t.status === 'pending')
    .reduce((acc, t) => acc + (t.estimatedHours || 0), 0)
})

const completedTasksCount = computed(() => {
  return tasks.value.filter(t => t.status === 'completed').length
})

const completedHours = computed(() => {
  return tasks.value
    .filter(t => t.status === 'completed')
    .reduce((acc, t) => acc + (t.estimatedHours || 0), 0)
})

const productivityRatio = computed(() => {
  if (totalHours.value === 0) return 0
  return Math.round((completedHours.value / totalHours.value) * 100)
})

const productivityLevel = computed(() => {
  const ratio = productivityRatio.value
  if (ratio >= 80) return 'Exceptional'
  if (ratio >= 50) return 'Productive'
  return 'Neutral'
})

const getProductivityColor = () => {
  const ratio = productivityRatio.value
  if (ratio >= 80) return '#10b981' // Green
  if (ratio >= 50) return '#f59e0b' // Amber
  return '#6b7280' // Gray/neutral
}

const getProductivityBadgeClasses = () => {
  const level = productivityLevel.value
  if (level === 'Exceptional') {
    return 'border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold'
  }
  if (level === 'Productive') {
    return 'border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold'
  }
  return 'border-gray-500/20 bg-gray-500/10 text-gray-600 dark:text-gray-400 font-semibold'
}

// Deadlines (top 3 pending tasks sorted by due date)
const upcomingTasks = computed(() => {
  return [...tasks.value]
    .filter(t => t.status === 'pending')
    .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
    .slice(0, 3)
})

const uniqueSubjectsCount = computed(() => {
  const subjs = tasks.value.map(t => t.subject).filter(Boolean)
  return new Set(subjs).size
})

// Format date nicely
const formatDateTime = (task) => {
  if (!task.deadline) return '-'
  const [y, m, d] = task.deadline.split('-')
  const dateObj = new Date(y, m - 1, d)
  const dateStr = dateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
  
  if (task.deadlineTime) {
    const [h, min] = task.deadlineTime.split(':')
    const timeObj = new Date()
    timeObj.setHours(parseInt(h, 10))
    timeObj.setMinutes(parseInt(min, 10))
    const timeStr = timeObj.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
    return `${dateStr} at ${timeStr}`
  }
  return dateStr
}

// ── Chart tab state ───────────────────────────────────────────────────────
const activeChartTab = ref('subject')

const setChartTab = (tab) => {
  activeChartTab.value = tab
  // Resize the now-visible canvas so Chart.js picks up correct dimensions
  setTimeout(() => {
    if (tab === 'subject' && subjectChartInstance) subjectChartInstance.resize()
    if (tab === 'priority' && priorityChartInstance) priorityChartInstance.resize()
  }, 10)
}

// ── Chart palette ─────────────────────────────────────────────────────────
const CHART_COLORS = [
  '#6366f1', // Indigo
  '#a855f7', // Purple
  '#f59e0b', // Amber
  '#10b981', // Emerald
  '#ec4899', // Pink
  '#06b6d4', // Cyan
  '#f97316', // Orange
  '#84cc16', // Lime
]

const PRIORITY_COLORS = {
  High:    '#f43f5e',
  Medium:  '#f59e0b',
  Low:     '#10b981',
  Overdue: '#71717a',
  Done:    '#a3a3a3'
}

// ── Reactive legend data ─────────────────────────────────────────────────
const subjectLegend = computed(() => {
  const map = {}
  tasks.value.forEach(t => {
    if (t.subject) map[t.subject] = (map[t.subject] || 0) + 1
  })
  const total = Object.values(map).reduce((a, b) => a + b, 0) || 1
  return Object.entries(map).map(([label, count], idx) => ({
    label,
    count,
    color: CHART_COLORS[idx % CHART_COLORS.length],
    pct: Math.round((count / total) * 100)
  }))
})

const priorityLegend = computed(() => {
  const order = ['High', 'Medium', 'Low', 'Overdue', 'Done']
  const map = { High: 0, Medium: 0, Low: 0, Overdue: 0, Done: 0 }
  tasks.value.forEach(t => {
    const p = getAutoPriority(t)
    if (p in map) map[p] += 1
  })
  const total = tasks.value.length || 1
  return order
    .filter(k => map[k] > 0)
    .map(k => ({
      label: k,
      count: map[k],
      color: PRIORITY_COLORS[k],
      pct: Math.round((map[k] / total) * 100)
    }))
})

// ── Canvas refs ───────────────────────────────────────────────────────────
const subjectCanvas = ref(null)
const priorityCanvas = ref(null)

let subjectChartInstance = null
let priorityChartInstance = null
let themeObserver = null

// ── Render both charts ────────────────────────────────────────────────────
const renderCharts = () => {
  const style = getComputedStyle(document.documentElement)
  const textColor   = style.getPropertyValue('--color-text-muted').trim() || '#888'
  const borderColor = style.getPropertyValue('--color-border').trim()      || '#ddd'
  const bgCard      = style.getPropertyValue('--color-bg-card').trim()     || '#fff'
  const accentColor = style.getPropertyValue('--color-accent').trim()      || '#6366f1'

  // override first palette slot with the theme accent
  const palette = [accentColor, ...CHART_COLORS.slice(1)]

  // 1. Subject Doughnut ─────────────────────────────────────────────────
  if (subjectChartInstance) subjectChartInstance.destroy()
  if (subjectCanvas.value && uniqueSubjectsCount.value > 0) {
    const map = {}
    tasks.value.forEach(t => { if (t.subject) map[t.subject] = (map[t.subject] || 0) + 1 })
    const labels = Object.keys(map)
    const data   = Object.values(map)

    subjectChartInstance = new Chart(subjectCanvas.value, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{
          data,
          backgroundColor: palette.slice(0, labels.length),
          borderWidth: 2,
          borderColor: bgCard,
          hoverOffset: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        cutout: '68%',
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => ` ${ctx.label}: ${ctx.parsed} task${ctx.parsed !== 1 ? 's' : ''}`
            }
          }
        }
      }
    })
  }

  // 2. Priority Bar ─────────────────────────────────────────────────────
  if (priorityChartInstance) priorityChartInstance.destroy()
  if (priorityCanvas.value && totalTasks.value > 0) {
    const map = { High: 0, Medium: 0, Low: 0, Overdue: 0, Done: 0 }
    tasks.value.forEach(t => { const p = getAutoPriority(t); if (p in map) map[p] += 1 })

    const labels = ['High', 'Medium', 'Low', 'Overdue', 'Done'].filter(k => map[k] > 0)
    const data   = labels.map(k => map[k])
    const bgColors   = labels.map(k => PRIORITY_COLORS[k] + 'bb')
    const bdrColors  = labels.map(k => PRIORITY_COLORS[k])

    priorityChartInstance = new Chart(priorityCanvas.value, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Tasks',
          data,
          backgroundColor: bgColors,
          borderColor: bdrColors,
          borderWidth: 1,
          borderRadius: 3,
          borderSkipped: false
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => ` ${ctx.parsed.y} task${ctx.parsed.y !== 1 ? 's' : ''}`
            }
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: textColor, font: { family: 'Outfit', size: 11 } },
            border: { color: borderColor }
          },
          y: {
            grid: { color: borderColor + '66', drawTicks: false },
            ticks: { color: textColor, font: { family: 'Inter', size: 10 }, stepSize: 1 },
            border: { color: borderColor }
          }
        }
      }
    })
  }
}

// Watch tasks array and re-render charts when list updates
watch(tasks, () => {
  renderCharts()
}, { deep: true })

onMounted(() => {
  startTipTimer()
  // Tiny delay to ensure styles and layouts are resolved before drawing canvas
  setTimeout(renderCharts, 100)

  // Watch for theme class changes on the html element and redraw charts to pick up new CSS var colors
  themeObserver = new MutationObserver(() => {
    setTimeout(renderCharts, 50)
  })
  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class']
  })
})


onBeforeUnmount(() => {
  if (tipTimer) clearInterval(tipTimer)
  if (subjectChartInstance) subjectChartInstance.destroy()
  if (priorityChartInstance) priorityChartInstance.destroy()
  if (themeObserver) themeObserver.disconnect()
})
</script>

<style scoped>
/* ─── Notification Banner ─────────────────────────────────────────────────── */
.notif-banner {
  background: linear-gradient(
    135deg,
    color-mix(in srgb, var(--color-accent) 8%, var(--color-bg-card)),
    var(--color-bg-card)
  );
  border-color: color-mix(in srgb, var(--color-accent) 35%, var(--color-border));
  box-shadow: 0 2px 16px color-mix(in srgb, var(--color-accent) 12%, transparent);
}

/* Animated shimmer bar on the left edge */
.notif-accent-bar {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background: linear-gradient(
    180deg,
    var(--color-accent),
    color-mix(in srgb, var(--color-accent) 50%, transparent)
  );
  animation: notif-bar-pulse 2.4s ease-in-out infinite;
}

@keyframes notif-bar-pulse {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.45; }
}

/* Bell icon ring animation */
.notif-bell-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: color-mix(in srgb, var(--color-accent) 15%, transparent);
  border: 1px solid color-mix(in srgb, var(--color-accent) 30%, transparent);
  flex-shrink: 0;
}

.notif-bell-icon {
  color: var(--color-accent);
  animation: bell-ring 3s ease-in-out infinite;
  transform-origin: top center;
}

@keyframes bell-ring {
  0%,  100% { transform: rotate(0deg); }
  5%         { transform: rotate(18deg); }
  10%        { transform: rotate(-15deg); }
  15%        { transform: rotate(10deg); }
  20%        { transform: rotate(-6deg); }
  25%        { transform: rotate(0deg); }
}

/* Title text */
.notif-title {
  color: var(--color-text-h);
  letter-spacing: 0.08em;
}

/* Individual task chip */
.notif-task-chip {
  background: color-mix(in srgb, var(--color-bg-panel) 80%, transparent);
  border: 1px solid var(--color-border);
  border-radius: 2px;
  padding: 3px 8px;
  transition: background 0.15s ease;
}

.notif-task-chip:hover {
  background: color-mix(in srgb, var(--color-accent) 8%, var(--color-bg-panel));
}

.notif-task-name {
  color: var(--color-text-h);
}

/* Dismiss button */
.notif-dismiss {
  color: var(--color-text-muted);
  background: transparent;
  border: 1px solid transparent;
  cursor: pointer;
  transition: color 0.15s ease, background 0.15s ease, border-color 0.15s ease;
}

.notif-dismiss:hover {
  color: var(--color-text-h);
  background: var(--color-bg-panel);
  border-color: var(--color-border);
}

/* Slide transition */
.notif-slide-enter-active {
  animation: notif-in 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

.notif-slide-leave-active {
  animation: notif-out 0.25s ease forwards;
}

@keyframes notif-in {
  from {
    opacity: 0;
    transform: translateY(-12px) scaleY(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scaleY(1);
  }
}

@keyframes notif-out {
  from {
    opacity: 1;
    transform: translateY(0) scaleY(1);
    max-height: 200px;
  }
  to {
    opacity: 0;
    transform: translateY(-8px) scaleY(0.95);
    max-height: 0;
  }
}
/* ─── Overdue Banner ──────────────────────────────────────────────────────── */
.overdue-banner {
  background: linear-gradient(
    135deg,
    rgba(239, 68, 68, 0.12),
    rgba(239, 68, 68, 0.04)
  );
  border-color: rgba(239, 68, 68, 0.35);
  box-shadow: 0 2px 20px rgba(239, 68, 68, 0.15);
}

.overdue-accent-bar {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background: linear-gradient(180deg, #ef4444, rgba(239, 68, 68, 0.4));
  animation: overdue-bar-pulse 1.8s ease-in-out infinite;
}

@keyframes overdue-bar-pulse {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.3; }
}

.overdue-icon-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: rgba(239, 68, 68, 0.15);
  border: 1px solid rgba(239, 68, 68, 0.35);
  flex-shrink: 0;
}

.overdue-icon {
  color: #ef4444;
  animation: overdue-shake 2.5s ease-in-out infinite;
}

@keyframes overdue-shake {
  0%,  90%, 100% { transform: rotate(0deg); }
  92%             { transform: rotate(-12deg); }
  94%             { transform: rotate(12deg); }
  96%             { transform: rotate(-8deg); }
  98%             { transform: rotate(8deg); }
}

.overdue-title {
  color: #fca5a5;
  letter-spacing: 0.07em;
}

.overdue-task-chip {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.25);
  border-radius: 2px;
  padding: 3px 8px;
  transition: background 0.15s ease;
}

.overdue-task-chip:hover {
  background: rgba(239, 68, 68, 0.18);
}

.overdue-dismiss {
  color: #f87171;
  background: transparent;
  border: 1px solid transparent;
  cursor: pointer;
  transition: color 0.15s ease, background 0.15s ease, border-color 0.15s ease;
}

.overdue-dismiss:hover {
  color: #ffffff;
  background: rgba(239, 68, 68, 0.2);
  border-color: rgba(239, 68, 68, 0.35);
}

/* ─── Past Due Tasks Card (right column) ─────────────────────────────────── */
.overdue-card {
  background: linear-gradient(
    160deg,
    rgba(239, 68, 68, 0.09),
    rgba(239, 68, 68, 0.03)
  );
  border-color: rgba(239, 68, 68, 0.28);
}

.overdue-card-title {
  color: #fca5a5;
  letter-spacing: 0.07em;
}

.overdue-row {
  border-radius: 2px;
}

/* Custom thin red scrollbar for the list */
.overdue-scroll::-webkit-scrollbar {
  width: 3px;
}
.overdue-scroll::-webkit-scrollbar-track {
  background: transparent;
}
.overdue-scroll::-webkit-scrollbar-thumb {
  background: rgba(239, 68, 68, 0.3);
  border-radius: 2px;
}
.overdue-scroll::-webkit-scrollbar-thumb:hover {
  background: rgba(239, 68, 68, 0.6);
}
</style>

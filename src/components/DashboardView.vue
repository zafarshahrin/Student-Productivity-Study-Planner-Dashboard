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
                    :class="getNotifPriorityDot(task.priority)"
                  ></span>
                  <span class="text-[11px] font-display font-semibold notif-task-name truncate max-w-[180px]">
                    {{ task.title }}
                  </span>
                  <span
                    class="text-[9px] font-mono px-1 border uppercase font-bold shrink-0"
                    :class="getNotifPriorityBadge(task.priority)"
                  >
                    {{ task.priority }}
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
      <!-- Charts Block -->
      <div class="xl:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Subject Doughnut -->
        <div class="premium-card p-4 flex flex-col justify-between min-h-[300px]">
          <div>
            <h3 class="text-xs uppercase font-display font-bold tracking-wider text-[var(--color-text-h)] mb-4">
              Subject Distribution (Tasks)
            </h3>
          </div>
          <div class="relative flex-1 flex items-center justify-center p-2">
            <canvas ref="subjectCanvas" class="max-h-[220px] max-w-[220px]"></canvas>
            <div v-if="uniqueSubjectsCount === 0" class="absolute inset-0 flex items-center justify-center bg-[var(--color-bg-card)] text-xs font-mono">
              No task data available.
            </div>
          </div>
        </div>

        <!-- Priority Bar -->
        <div class="premium-card p-4 flex flex-col justify-between min-h-[300px]">
          <div>
            <h3 class="text-xs uppercase font-display font-bold tracking-wider text-[var(--color-text-h)] mb-4">
              Priority Weight Distribution
            </h3>
          </div>
          <div class="relative flex-1 flex items-center justify-center p-2">
            <canvas ref="priorityCanvas" class="max-h-[220px]"></canvas>
            <div v-if="totalTasks === 0" class="absolute inset-0 flex items-center justify-center bg-[var(--color-bg-card)] text-xs font-mono">
              No task data available.
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
                  class="text-[9px] font-mono px-1 border uppercase font-semibold text-rose-500 border-rose-500/20 bg-rose-500/10 shrink-0"
                  v-if="task.priority === 'High'"
                >
                  High
                </span>
              </div>
              <div class="flex items-center justify-between text-[10px] font-mono text-[var(--color-text-muted)]">
                <span>{{ task.subject }}</span>
                <span>Due: {{ formatDate(task.deadline) }}</span>
              </div>
            </div>

            <!-- Empty State -->
            <div v-if="upcomingTasks.length === 0" class="p-6 text-center text-xs font-mono text-[var(--color-text-muted)] border border-dashed border-[var(--color-border)]">
              All tasks completed!
            </div>
          </div>
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
import { ChevronLeft, ChevronRight, Bell, X } from 'lucide-vue-next'
import { Chart } from 'chart.js/auto'

const tasks = inject('tasks')

// Due Today Notification
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
const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  const [y, m, d] = dateStr.split('-')
  const dateObj = new Date(y, m - 1, d)
  return dateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

// Canvas references for Charts
const subjectCanvas = ref(null)
const priorityCanvas = ref(null)

let subjectChartInstance = null
let priorityChartInstance = null
let themeObserver = null

// Re-generate chart data
const renderCharts = () => {
  // Resolve CSS themes for Chart.js styling
  const style = getComputedStyle(document.documentElement)
  const textColor = style.getPropertyValue('--color-text-muted').trim() || '#888'
  const textHColor = style.getPropertyValue('--color-text-h').trim() || '#111'
  const borderColor = style.getPropertyValue('--color-border').trim() || '#ddd'
  const accentColor = style.getPropertyValue('--color-accent').trim() || '#3b82f6'

  // Helper colors for Doughnut
  const chartColors = [
    accentColor, 
    '#a855f7', // Purple
    '#f59e0b', // Amber
    '#10b981', // Emerald
    '#ec4899', // Pink
    '#06b6d4', // Cyan
    '#f97316'  // Orange
  ]

  // 1. Subject distribution Chart
  if (subjectChartInstance) subjectChartInstance.destroy()
  if (subjectCanvas.value && uniqueSubjectsCount.value > 0) {
    const subjectsMap = {}
    tasks.value.forEach(t => {
      if (t.subject) {
        subjectsMap[t.subject] = (subjectsMap[t.subject] || 0) + 1
      }
    })

    const labels = Object.keys(subjectsMap)
    const data = Object.values(subjectsMap)

    subjectChartInstance = new Chart(subjectCanvas.value, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{
          data,
          backgroundColor: chartColors.slice(0, labels.length),
          borderWidth: 1,
          borderColor: style.getPropertyValue('--color-bg-card').trim() || '#fff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              boxWidth: 12,
              font: { family: 'Outfit', size: 10 },
              color: textColor
            }
          }
        }
      }
    })
  }

  // 2. Priority Distribution Chart
  if (priorityChartInstance) priorityChartInstance.destroy()
  if (priorityCanvas.value && totalTasks.value > 0) {
    const priorityMap = { High: 0, Medium: 0, Low: 0 }
    tasks.value.forEach(t => {
      if (priorityMap[t.priority] !== undefined) {
        priorityMap[t.priority] += 1
      }
    })

    priorityChartInstance = new Chart(priorityCanvas.value, {
      type: 'bar',
      data: {
        labels: ['High', 'Medium', 'Low'],
        datasets: [{
          label: 'Tasks',
          data: [priorityMap.High, priorityMap.Medium, priorityMap.Low],
          backgroundColor: [
            'rgba(244, 63, 94, 0.75)',  // High Red
            'rgba(245, 158, 11, 0.75)', // Medium Amber
            'rgba(16, 185, 129, 0.75)'  // Low Emerald
          ],
          borderColor: [
            '#f43f5e',
            '#f59e0b',
            '#10b981'
          ],
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: {
              color: textColor,
              font: { family: 'Outfit', size: 11 }
            },
            border: { color: borderColor }
          },
          y: {
            grid: { color: borderColor, drawTicks: false },
            ticks: {
              color: textColor,
              font: { family: 'Inter', size: 10 },
              stepSize: 1
            },
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
</style>

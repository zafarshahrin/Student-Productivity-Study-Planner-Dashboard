<template>
  <div class="min-h-screen bg-[var(--color-bg)] flex flex-col md:flex-row">
    <!-- Navigation Sidebar -->
    <Sidebar 
      class="print:hidden"
      v-model:activeTab="activeTab" 
      v-model:currentTheme="currentTheme" 
    />

    <!-- Main Content Area -->
    <main class="flex-1 flex flex-col min-w-0">
      <!-- Top navbar header -->
      <header class="print:hidden hidden md:flex items-center justify-between px-8 py-4 border-b border-[var(--color-border)] bg-[var(--color-bg-card)]">
        <div>
          <h2 class="font-display font-bold text-sm tracking-wide text-[var(--color-text-h)] uppercase">
            {{ activeTabName }}
          </h2>
        </div>
        <div class="flex items-center gap-4 text-xs font-mono text-[var(--color-text-muted)]">
          <span>Status: Online</span>
          <span>•</span>
          <span class="text-[var(--color-accent)] font-semibold">{{ currentTheme.toUpperCase() }} THEME</span>
        </div>
      </header>

      <!-- Panel Content --> 
      <div class="flex-1 p-4 md:p-8 overflow-y-auto max-w-7xl w-full mx-auto">
        <transition name="fade" mode="out-in">
          <component :is="activeComponent" />
        </transition>
      </div>
    </main>

    <!-- Global Toast System (Undo Delete notification) -->
    <div 
      v-if="toast.visible" 
      class="fixed bottom-4 right-4 z-50 flex items-center justify-between gap-4 p-3 border border-[var(--color-border)] bg-[var(--color-bg-card)] shadow-lg max-w-sm w-full animate-slide-up"
      style="border-left: 3px solid var(--color-accent);"
    >
      <div class="flex-1">
        <p class="text-xs font-medium text-[var(--color-text-h)] font-body">
          {{ toast.message }}
        </p>
      </div>
      <div class="flex items-center gap-2 shrink-0">
        <button 
          v-if="toast.action" 
          @click="executeToastAction"
          class="px-2 py-1 text-[10px] font-mono font-bold uppercase border border-[var(--color-accent)] text-[var(--color-accent)] hover:bg-[var(--color-accent-light)] transition-colors"
        >
          {{ toast.actionLabel }}
        </button>
        <button 
          @click="hideToast" 
          class="p-1 hover:bg-[var(--color-bg-panel)] text-[var(--color-text-muted)] hover:text-[var(--color-text-h)]"
        >
          <X class="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, provide, watch } from 'vue'
import { X } from 'lucide-vue-next'
import Sidebar from './components/Sidebar.vue'
import DashboardView from './components/DashboardView.vue'
import TaskManagementView from './components/TaskManagementView.vue'
import StudyPlannerView from './components/StudyPlannerView.vue'
import PomodoroTimerView from './components/PomodoroTimerView.vue'
import AboutView from './components/AboutView.vue'
import { useLocalStorage, defaultTasks, defaultPlannerSettings } from './composables/useLocalStorage'

// Navigation state
const activeTab = ref('dashboard') //Default tab

const activeTabName = computed(() => {
  const map = {
    dashboard: 'Dashboard Overview',
    tasks: 'Task Management',
    planner: 'Daily & Weekly Study Planner',
    pomodoro: 'Pomodoro Timer',
    about: 'About Us'
  }
  return map[activeTab.value] || 'StudyFlow'
})

const activeComponent = computed(() => {
  const map = {
    dashboard: DashboardView,
    tasks: TaskManagementView,
    planner: StudyPlannerView,
    pomodoro: PomodoroTimerView,
    about: AboutView
  }
  return map[activeTab.value]
})

// Themes and Preferences
const currentTheme = useLocalStorage('studyflow_theme', 'dark')

// Sync theme class to <html> element so all CSS variables cascade correctly to the whole page
watch(currentTheme, (newTheme) => {
  // Remove any previous theme classes
  document.documentElement.classList.remove('theme-calm', 'theme-focus', 'theme-dark')
  document.documentElement.classList.add(`theme-${newTheme}`)
}, { immediate: true })

// Core State variables
const tasks = useLocalStorage('studyflow_tasks', defaultTasks)
const plannerSettings = useLocalStorage('studyflow_planner_settings', defaultPlannerSettings)

// Toast System State
const toast = ref({
  visible: false,
  message: '',
  actionLabel: '',
  action: null,
  timeoutId: null
})

// Deleted Task temporary buffer for Undo action
const lastDeletedTask = ref(null)

const triggerToast = (message, actionLabel = '', actionFn = null) => {
  if (toast.value.timeoutId) {
    clearTimeout(toast.value.timeoutId)
  }
  
  toast.value.visible = true
  toast.value.message = message
  toast.value.actionLabel = actionLabel
  toast.value.action = actionFn
  
  // Auto dismiss after 8 seconds
  toast.value.timeoutId = setTimeout(() => {
    hideToast()
  }, 8000)
}

const hideToast = () => {
  toast.value.visible = false
  if (toast.value.timeoutId) {
    clearTimeout(toast.value.timeoutId)
    toast.value.timeoutId = null
  }
}

const executeToastAction = () => {
  if (toast.value.action) {
    toast.value.action()
  }
  hideToast()
}

// State Modifiers (to be injected by children)
const addTask = (task) => {
  const newId = 't_' + Date.now()
  tasks.value.push({
    id: newId,
    ...task,
    status: task.status || 'pending'
  })
  triggerToast(`Task "${task.title}" added successfully.`)
}

const updateTask = (updatedTask) => {
  const idx = tasks.value.findIndex(t => t.id === updatedTask.id)
  if (idx !== -1) {
    tasks.value[idx] = { ...updatedTask }
  }
}

const deleteTask = (taskId) => {
  const idx = tasks.value.findIndex(t => t.id === taskId)
  if (idx !== -1) {
    // Keep reference in backup for Undo
    lastDeletedTask.value = { ...tasks.value[idx] }
    tasks.value.splice(idx, 1)
    
    triggerToast(
      `Deleted task "${lastDeletedTask.value.title}".`, 
      'Undo', 
      undoDelete
    )
  }
}

const undoDelete = () => {
  if (lastDeletedTask.value) {
    tasks.value.push(lastDeletedTask.value)
    triggerToast(`Restored task "${lastDeletedTask.value.title}".`)
    lastDeletedTask.value = null
  }
}

// Provide states and methods to descendants
provide('tasks', tasks)
provide('plannerSettings', plannerSettings)
provide('addTask', addTask)
provide('updateTask', updateTask)
provide('deleteTask', deleteTask)
provide('triggerToast', triggerToast)

</script>

<style>
/* CSS Animations for tabs transition */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Toast animation */
@keyframes slide-up {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.animate-slide-up {
  animation: slide-up 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
</style>

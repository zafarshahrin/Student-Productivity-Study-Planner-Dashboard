<template>
  <div class="space-y-6 max-w-md mx-auto">
    <!-- Mode Selectors -->
    <div class="grid grid-cols-3 gap-1 bg-[var(--color-bg-panel)]/50 p-1 border border-[var(--color-border)] rounded-sm">
      <button 
        v-for="mode in modes" 
        :key="mode.id"
        @click="switchMode(mode.id)"
        class="py-1.5 text-xs font-display font-bold uppercase tracking-wider rounded-sm transition-all cursor-pointer"
        :class="activeMode === mode.id 
          ? 'bg-[var(--color-bg-card)] text-[var(--color-text-h)] border border-[var(--color-border)] font-extrabold shadow-sm' 
          : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-h)]'"
      >
        {{ mode.label }}
      </button>
    </div>

    <!-- Timer Visual representation -->
    <div class="premium-card p-8 flex flex-col items-center justify-center relative min-h-[340px]">
      <!-- SVG Progress Circle -->
      <div class="relative w-60 h-60 flex items-center justify-center">
        <svg class="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          <!-- Background track -->
          <circle 
            cx="50" 
            cy="50" 
            r="44" 
            fill="transparent" 
            stroke="var(--color-border)" 
            stroke-width="2.5"
          />
          <!-- Progress highlight -->
          <circle 
            cx="50" 
            cy="50" 
            r="44" 
            fill="transparent" 
            stroke="var(--color-accent)" 
            stroke-width="3"
            :stroke-dasharray="strokeDashArray"
            :stroke-dashoffset="strokeDashOffset"
            stroke-linecap="square"
            class="transition-all duration-1000 ease-linear"
          />
        </svg>

        <!-- Centered Countdown Text -->
        <div class="absolute inset-0 flex flex-col items-center justify-center">
          <span class="text-4xl font-mono font-bold tracking-tight text-[var(--color-text-h)]">
            {{ formatTime(remainingSeconds) }}
          </span>
          <span class="text-[10px] uppercase font-display tracking-wider font-semibold text-[var(--color-text-muted)] mt-1.5">
            {{ isRunning ? 'Focusing...' : 'Paused' }}
          </span>
        </div>
      </div>

      <!-- Controls -->
      <div class="flex items-center gap-3 mt-6">
        <!-- Start/Pause -->
        <button 
          @click="toggleTimer" 
          class="premium-btn text-xs px-5 py-2 flex items-center gap-2"
        >
          <component :is="isRunning ? Pause : Play" class="w-4 h-4" />
          {{ isRunning ? 'Pause' : 'Start' }}
        </button>

        <!-- Reset -->
        <button 
          @click="resetTimer" 
          class="premium-btn-secondary text-xs px-5 py-2 flex items-center gap-2"
        >
          <RotateCcw class="w-4 h-4" />
          Reset
        </button>
      </div>
    </div>

    <!-- Custom durations setting -->
    <div class="premium-card p-4">
      <h4 class="text-[10px] uppercase font-display font-semibold tracking-wider text-[var(--color-text-muted)] mb-3">
        Timer Settings
      </h4>
      <div class="grid grid-cols-3 gap-3">
        <div class="flex flex-col gap-1 text-center">
          <span class="text-[10px] font-mono text-[var(--color-text-muted)]">Work (Min)</span>
          <input 
            v-model.number="durations.work" 
            @change="handleDurationChange('work')"
            type="number" 
            min="1" 
            max="120"
            class="premium-input text-xs text-center font-mono py-1"
          />
        </div>
        <div class="flex flex-col gap-1 text-center">
          <span class="text-[10px] font-mono text-[var(--color-text-muted)]">Short (Min)</span>
          <input 
            v-model.number="durations.short" 
            @change="handleDurationChange('short')"
            type="number" 
            min="1" 
            max="60"
            class="premium-input text-xs text-center font-mono py-1"
          />
        </div>
        <div class="flex flex-col gap-1 text-center">
          <span class="text-[10px] font-mono text-[var(--color-text-muted)]">Long (Min)</span>
          <input 
            v-model.number="durations.long" 
            @change="handleDurationChange('long')"
            type="number" 
            min="1" 
            max="120"
            class="premium-input text-xs text-center font-mono py-1"
          />
        </div>
      </div>
    </div>

    <!-- Session History -->
    <div class="premium-card p-4">
      <div class="flex items-center justify-between mb-3 border-b border-[var(--color-border)] pb-2">
        <h4 class="text-[10px] uppercase font-display font-semibold tracking-wider text-[var(--color-text-muted)]">
          Session History
        </h4>
        <button v-if="history.length > 0" @click="clearHistory" class="text-[10px] uppercase font-display text-[var(--color-text-muted)] hover:text-red-500 transition-colors cursor-pointer">
          Clear History
        </button>
      </div>
      
      <div v-if="history.length === 0" class="text-center py-4 text-xs font-mono text-[var(--color-text-muted)] border border-dashed border-[var(--color-border)]">
        No completed sessions yet. Start focusing!
      </div>
      
      <div v-else class="space-y-2 max-h-48 overflow-y-auto pr-1">
        <div v-for="session in history" :key="session.id" class="flex items-center justify-between p-2 border border-[var(--color-border)] bg-[var(--color-bg-card)] transition-colors hover:border-[var(--color-text-h)]">
          <div>
            <div class="flex items-center gap-2">
              <span class="text-xs font-bold text-[var(--color-text-h)] font-display">{{ session.name }}</span>
              <span class="px-1.5 py-0.5 text-[9px] uppercase font-bold bg-green-500/10 text-green-600 border border-green-500/20 rounded-sm">Completed</span>
            </div>
            <div class="text-[10px] font-mono text-[var(--color-text-muted)] mt-1">
              {{ session.timestamp }}
            </div>
          </div>
          <div class="text-xs font-mono font-semibold text-[var(--color-text-h)]">
            {{ session.duration }} min
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, inject, onMounted, onBeforeUnmount, watch } from 'vue'
import { Play, Pause, RotateCcw } from 'lucide-vue-next'

const triggerToast = inject('triggerToast')

const activeMode = ref('work') // 'work' | 'short' | 'long'
const isRunning = ref(false)

const durations = ref({
  work: 25,
  short: 5,
  long: 15
})

const remainingSeconds = ref(25 * 60)
let timerId = null

const history = ref([])
let sessionCount = 0

const clearHistory = () => {
  history.value = []
  sessionCount = 0
}

const modes = [
  { id: 'work', label: 'Work session' },
  { id: 'short', label: 'Short Break' },
  { id: 'long', label: 'Long Break' }
]

// Current mode duration in seconds
const totalSecondsForMode = computed(() => {
  return (durations.value[activeMode.value] || 25) * 60
})

// Circular Progress stroke calculations
const strokeDashArray = 2 * Math.PI * 44 // circumference = 276.46
const strokeDashOffset = computed(() => {
  const ratio = remainingSeconds.value / totalSecondsForMode.value
  return strokeDashArray * (1 - ratio)
})

// Digital timer formatter
const formatTime = (totalSecs) => {
  const m = Math.floor(totalSecs / 60)
  const s = totalSecs % 60
  const displayMin = m < 10 ? '0' + m : m
  const displaySec = s < 10 ? '0' + s : s
  return `${displayMin}:${displaySec}`
}

// Background Timestamp-based Syncing
const loadTimerState = () => {
  const running = localStorage.getItem('pomo_is_running') === 'true'
  const mode = localStorage.getItem('pomo_active_mode') || 'work'
  const storedDurations = localStorage.getItem('pomo_durations')
  
  if (storedDurations) {
    durations.value = JSON.parse(storedDurations)
  }
  
  activeMode.value = mode

  if (running) {
    const endTime = parseInt(localStorage.getItem('pomo_end_time') || '0', 10)
    const diff = Math.round((endTime - Date.now()) / 1000)
    
    if (diff > 0) {
      remainingSeconds.value = diff
      isRunning.value = true
      startInterval()
    } else {
      // Completed while user was away
      remainingSeconds.value = 0
      isRunning.value = false
      clearLocalStorageState()
      triggerToast(`Pomodoro "${mode.toUpperCase()}" session completed!`)
    }
  } else {
    const rem = localStorage.getItem('pomo_remaining_seconds')
    if (rem) {
      remainingSeconds.value = parseInt(rem, 10)
    } else {
      remainingSeconds.value = totalSecondsForMode.value
    }
  }
}

const saveTimerState = () => {
  localStorage.setItem('pomo_active_mode', activeMode.value)
  localStorage.setItem('pomo_is_running', isRunning.value.toString())
  localStorage.setItem('pomo_durations', JSON.stringify(durations.value))
  
  if (isRunning.value) {
    const endTime = Date.now() + remainingSeconds.value * 1000
    localStorage.setItem('pomo_end_time', endTime.toString())
  } else {
    localStorage.setItem('pomo_remaining_seconds', remainingSeconds.value.toString())
  }
}

const clearLocalStorageState = () => {
  localStorage.removeItem('pomo_is_running')
  localStorage.removeItem('pomo_end_time')
  localStorage.removeItem('pomo_remaining_seconds')
}

// Interval logic
const startInterval = () => {
  if (timerId) clearInterval(timerId)
  timerId = setInterval(() => {
    // Math checks based on real timestamp delta
    const endTime = parseInt(localStorage.getItem('pomo_end_time') || '0', 10)
    const diff = Math.round((endTime - Date.now()) / 1000)

    if (diff > 0) {
      remainingSeconds.value = diff
    } else {
      // Finished
      remainingSeconds.value = 0
      isRunning.value = false
      clearInterval(timerId)
      timerId = null
      clearLocalStorageState()
      playBeep()
      triggerToast(`Timer finished: "${activeMode.value.toUpperCase()}" session complete.`)
      
      if (activeMode.value === 'work') {
        sessionCount++
        const now = new Date()
        const timeStr = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
        history.value.unshift({
          id: Date.now(),
          name: `Session #${sessionCount}`,
          duration: durations.value.work,
          timestamp: `Today, ${timeStr}`
        })
      }

      // Auto-reset to default
      remainingSeconds.value = totalSecondsForMode.value
    }
  }, 500) // Double frequency tick for precise alignment
}

// Play notification sound
const playBeep = () => {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)()
    const oscillator = audioCtx.createOscillator()
    const gainNode = audioCtx.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(audioCtx.destination)

    oscillator.type = 'sine'
    oscillator.frequency.setValueAtTime(880, audioCtx.currentTime) // A5 note
    gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime)

    oscillator.start()
    oscillator.stop(audioCtx.currentTime + 0.3) // play for 300ms
  } catch (e) {
    console.warn('Audio Context failed to play beep', e)
  }
}

// Control handlers
const toggleTimer = () => {
  if (isRunning.value) {
    // Pause
    isRunning.value = false
    if (timerId) {
      clearInterval(timerId)
      timerId = null
    }
    saveTimerState()
  } else {
    // Start
    isRunning.value = true
    saveTimerState()
    startInterval()
  }
}

const resetTimer = () => {
  isRunning.value = false
  if (timerId) {
    clearInterval(timerId)
    timerId = null
  }
  remainingSeconds.value = totalSecondsForMode.value
  clearLocalStorageState()
  saveTimerState()
}

const switchMode = (modeId) => {
  activeMode.value = modeId
  resetTimer()
}

const handleDurationChange = (type) => {
  if (durations.value[type] < 1) durations.value[type] = 1
  if (durations.value[type] > 200) durations.value[type] = 200
  
  if (activeMode.value === type) {
    resetTimer()
  } else {
    saveTimerState()
  }
}

// Watch modes to reset timer if they change in configuration
watch(activeMode, () => {
  remainingSeconds.value = totalSecondsForMode.value
})

onMounted(() => {
  loadTimerState()
})

onBeforeUnmount(() => {
  if (timerId) clearInterval(timerId)
  saveTimerState()
})
</script>

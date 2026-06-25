<template>
  <div class="space-y-6 max-w-md mx-auto">

    <!-- Mode Selectors -->
    <div class="grid grid-cols-3 gap-1 bg-[var(--color-bg-panel)]/50 p-1 border border-[var(--color-border)]">
      <button
        v-for="mode in modes"
        :key="mode.id"
        @click="switchMode(mode.id)"
        class="py-1.5 text-xs font-display font-bold uppercase tracking-wider transition-all cursor-pointer"
        :class="activeMode === mode.id
          ? 'bg-[var(--color-bg-card)] text-[var(--color-text-h)] border border-[var(--color-border)] shadow-sm'
          : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-h)]'"
      >
        {{ mode.label }}
      </button>
    </div>

    <!-- Timer -->
    <div class="premium-card p-8 flex flex-col items-center justify-center min-h-[340px]">
      <div class="relative w-60 h-60 flex items-center justify-center">
        <svg class="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="44" fill="transparent" stroke="var(--color-border)" stroke-width="2.5"/>
          <circle
            cx="50" cy="50" r="44" fill="transparent"
            stroke="var(--color-accent)" stroke-width="3"
            :stroke-dasharray="circumference"
            :stroke-dashoffset="strokeOffset"
            stroke-linecap="square"
            class="transition-all duration-1000 ease-linear"
          />
        </svg>
        <div class="absolute inset-0 flex flex-col items-center justify-center">
          <span class="text-4xl font-mono font-bold text-[var(--color-text-h)]">{{ formatTime }}</span>
          <span class="text-[10px] uppercase font-display tracking-wider text-[var(--color-text-muted)] mt-1.5">
            {{ isRunning ? 'Focusing...' : 'Paused' }}
          </span>
        </div>
      </div>

      <div class="flex items-center gap-3 mt-6">
        <button @click="toggleTimer" class="premium-btn text-xs px-5 py-2 flex items-center gap-2">
          <component :is="isRunning ? Pause : Play" class="w-4 h-4" />
          {{ isRunning ? 'Pause' : 'Start' }}
        </button>
        <button @click="resetTimer" class="premium-btn-secondary text-xs px-5 py-2 flex items-center gap-2">
          <RotateCcw class="w-4 h-4" />
          Reset
        </button>
      </div>
    </div>

    <!-- Timer Settings -->
    <div class="premium-card p-4">
      <h4 class="text-[10px] uppercase font-display font-semibold tracking-wider text-[var(--color-text-muted)] mb-3">
        Timer Settings
      </h4>
      <div class="grid grid-cols-3 gap-3">
        <div class="flex flex-col gap-1 text-center">
          <span class="text-[10px] font-mono text-[var(--color-text-muted)]">Work (Min)</span>
          <input v-model.number="durations.work" @change="handleDurationChange('work')" type="number" min="1" max="120" class="premium-input text-xs text-center font-mono py-1"/>
        </div>
        <div class="flex flex-col gap-1 text-center">
          <span class="text-[10px] font-mono text-[var(--color-text-muted)]">Short (Min)</span>
          <input v-model.number="durations.short" @change="handleDurationChange('short')" type="number" min="1" max="60" class="premium-input text-xs text-center font-mono py-1"/>
        </div>
        <div class="flex flex-col gap-1 text-center">
          <span class="text-[10px] font-mono text-[var(--color-text-muted)]">Long (Min)</span>
          <input v-model.number="durations.long" @change="handleDurationChange('long')" type="number" min="1" max="120" class="premium-input text-xs text-center font-mono py-1"/>
        </div>
      </div>
    </div>

    <!-- Session History -->
    <div class="premium-card p-4">
      <div class="flex items-center justify-between mb-3 border-b border-[var(--color-border)] pb-2">
        <h4 class="text-[10px] uppercase font-display font-semibold tracking-wider text-[var(--color-text-muted)]">
          Session History
        </h4>
        <button v-if="history.length > 0" @click="history = []" class="text-[10px] uppercase font-display text-[var(--color-text-muted)] hover:text-red-500 cursor-pointer">
          Clear History
        </button>
      </div>

      <div v-if="history.length === 0" class="text-center py-4 text-xs font-mono text-[var(--color-text-muted)] border border-dashed border-[var(--color-border)]">
        No completed sessions yet. Start focusing!
      </div>

      <div v-else class="space-y-2 max-h-48 overflow-y-auto">
        <div v-for="session in history" :key="session.id" class="flex items-center justify-between p-2 border border-[var(--color-border)] bg-[var(--color-bg-card)]">
          <div>
            <div class="flex items-center gap-2">
              <span class="text-xs font-bold text-[var(--color-text-h)] font-display">{{ session.name }}</span>
              <span class="px-1.5 py-0.5 text-[9px] uppercase font-bold bg-green-500/10 text-green-600 border border-green-500/20">Completed</span>
            </div>
            <div class="text-[10px] font-mono text-[var(--color-text-muted)] mt-1">{{ session.timestamp }}</div>
          </div>
          <div class="text-xs font-mono font-semibold text-[var(--color-text-h)]">{{ session.duration }} min</div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onBeforeUnmount } from 'vue'
import { Play, Pause, RotateCcw } from 'lucide-vue-next'

const modes = [
  { id: 'work', label: 'Work Session' },
  { id: 'short', label: 'Short Break' },
  { id: 'long', label: 'Long Break' }
]

const durations = ref({ work: 25, short: 5, long: 15 })
const activeMode = ref('work')
const isRunning = ref(false)
const remaining = ref(25 * 60)
const history = ref([])
let sessionCount = 0
let timerId = null

const circumference = 2 * Math.PI * 44

const totalSeconds = computed(() => durations.value[activeMode.value] * 60)
const strokeOffset = computed(() => circumference * (1 - remaining.value / totalSeconds.value))
const formatTime = computed(() => {
  const m = Math.floor(remaining.value / 60)
  const s = remaining.value % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
})

const toggleTimer = () => {
  if (isRunning.value) {
    isRunning.value = false
    clearInterval(timerId)
    timerId = null
  } else {
    isRunning.value = true
    timerId = setInterval(() => {
      if (remaining.value > 0) {
        remaining.value--
      } else {
        isRunning.value = false
        clearInterval(timerId)
        timerId = null
        if (activeMode.value === 'work') {
          sessionCount++
          const now = new Date()
          const time = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
          history.value.unshift({
            id: Date.now(),
            name: `Session #${sessionCount}`,
            duration: durations.value.work,
            timestamp: `Today, ${time}`
          })
        }
        remaining.value = totalSeconds.value
      }
    }, 1000)
  }
}

const resetTimer = () => {
  isRunning.value = false
  clearInterval(timerId)
  timerId = null
  remaining.value = totalSeconds.value
}

const switchMode = (modeId) => {
  activeMode.value = modeId
  resetTimer()
}

const handleDurationChange = (type) => {
  if (durations.value[type] < 1) durations.value[type] = 1
  if (activeMode.value === type) resetTimer()
}

onBeforeUnmount(() => clearInterval(timerId))
</script>
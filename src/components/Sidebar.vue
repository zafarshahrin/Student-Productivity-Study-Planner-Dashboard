<template>
  <div>
    <!-- Mobile Hamburger Bar -->
    <div class="md:hidden flex items-center justify-between px-4 py-3 border-b border-[var(--color-border)] bg-[var(--color-bg-card)] text-[var(--color-text-h)] sticky top-0 z-40">
      <div class="flex items-center gap-2">
        <Activity class="w-5 h-5 text-[var(--color-accent)]" />
        <span class="font-display font-bold tracking-tight text-base">StudyFlow</span>
      </div>
      <button 
        @click="isOpen = !isOpen" 
        class="p-1 border border-[var(--color-border)] rounded-sm hover:bg-[var(--color-bg-panel)] transition-colors"
        aria-label="Toggle Navigation Menu"
      >
        <Menu v-if="!isOpen" class="w-5 h-5" />
        <X v-else class="w-5 h-5" />
      </button>
    </div>

    <!-- Backdrop for mobile drawer -->
    <div 
      v-if="isOpen" 
      @click="isOpen = false" 
      class="md:hidden fixed inset-0 bg-black/30 z-40 transition-opacity"
    ></div>

    <!-- Sidebar container -->
    <aside 
      class="fixed top-0 bottom-0 left-0 z-40 flex flex-col justify-between w-64 border-r border-[var(--color-border)] bg-[var(--color-bg-card)] transition-transform duration-250 ease-in-out md:translate-x-0"
      :class="[
        isOpen ? 'translate-x-0' : '-translate-x-full',
        'md:h-screen sticky'
      ]"
    >
      <!-- Top Section -->
      <div class="flex flex-col">
        <!-- Logo / Title -->
        <div class="flex items-center gap-2.5 px-6 py-6 border-b border-[var(--color-border)]">
          <div class="p-1 bg-[var(--color-accent-light)] text-[var(--color-accent)] rounded-sm">
            <Activity class="w-5 h-5" />
          </div>
          <div>
            <h1 class="font-display font-extrabold tracking-tight text-lg leading-none text-[var(--color-text-h)]">
              StudyFlow
            </h1>
            <span class="text-[10px] tracking-wider uppercase font-display text-[var(--color-text-muted)] font-medium">
              Productivity Suite
            </span>
          </div>
        </div>

        <!-- Navigation Menu -->
        <nav class="px-3 py-6 space-y-1">
          <button 
            v-for="item in menuItems" 
            :key="item.id"
            @click="selectTab(item.id)"
            class="w-full flex items-center gap-3 px-3 py-2 text-sm font-display font-medium rounded-sm transition-all duration-150 relative group"
            :class="[
              activeTab === item.id 
                ? 'bg-[var(--color-accent-light)] text-[var(--color-accent)] border-l-2 border-[var(--color-accent)] font-semibold' 
                : 'text-[var(--color-text-muted)] hover:bg-[var(--color-bg-panel)] hover:text-[var(--color-text-h)]'
            ]"
          >
            <component :is="item.icon" class="w-4 h-4 transition-transform group-hover:scale-105" />
            <span>{{ item.label }}</span>
          </button>
        </nav>
      </div>

      <!-- Bottom Section (Theme Selector) -->
      <div class="p-4 border-t border-[var(--color-border)] bg-[var(--color-bg-panel)]/50">
        <span class="block text-[10px] uppercase font-display tracking-wider font-semibold text-[var(--color-text-muted)] mb-2 px-1">
          Select Theme
        </span>
        <div class="grid grid-cols-3 gap-1">
          <button 
            v-for="theme in themes" 
            :key="theme.id"
            @click="setTheme(theme.id)"
            class="flex flex-col items-center justify-center p-1.5 border rounded-sm transition-all text-[11px] font-display font-medium"
            :class="[
              currentTheme === theme.id 
                ? 'border-[var(--color-accent)] bg-[var(--color-bg-card)] text-[var(--color-text-h)] font-semibold' 
                : 'border-[var(--color-border)] bg-[var(--color-bg-card)] text-[var(--color-text-muted)] hover:border-[var(--color-text-muted)] hover:text-[var(--color-text-h)]'
            ]"
          >
            <!-- Theme Color Preview Dot -->
            <span 
              class="w-2.5 h-2.5 rounded-full mb-1 border border-black/10" 
              :style="{ backgroundColor: theme.color }"
            ></span>
            <span>{{ theme.label }}</span>
          </button>
        </div>
      </div>
    </aside>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { 
  Activity, 
  LayoutDashboard, 
  CheckSquare, 
  Calendar, 
  Timer, 
  Info, 
  Menu, 
  X 
} from 'lucide-vue-next'

const props = defineProps({
  activeTab: {
    type: String,
    required: true
  },
  currentTheme: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['update:activeTab', 'update:currentTheme'])

const isOpen = ref(false)

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'tasks', label: 'Task Manager', icon: CheckSquare },
  { id: 'planner', label: 'Study Planner', icon: Calendar },
  { id: 'pomodoro', label: 'Pomodoro Timer', icon: Timer },
  { id: 'about', label: 'About Us', icon: Info }
]

const themes = [
  { id: 'calm', label: 'Calm', color: '#5f7c65' },
  { id: 'dark', label: 'Dark', color: '#3b82f6' }
]

const selectTab = (tabId) => {
  emit('update:activeTab', tabId)
  isOpen.value = false // Close sidebar drawer on mobile
}

const setTheme = (themeId) => {
  emit('update:currentTheme', themeId)
}
</script>

<template>
  <div class="h-full flex flex-col space-y-6">
    <!-- Header -->
    <div class="mb-2">
      <h2 class="text-xl font-bold tracking-tight text-[var(--color-text-h)] font-display">
        About Us
      </h2>
      <p class="text-sm text-[var(--color-text-muted)] mt-1 font-body">
        Learn more about StudyFlow and the team behind it.
      </p>
    </div>

    <!-- Section 1: About StudyFlow -->
    <div class="premium-card p-5">
      <h3 class="text-md font-semibold text-[var(--color-text-h)] font-display uppercase tracking-wider mb-2">
        About StudyFlow
      </h3>
      <p class="text-sm text-[var(--color-text-muted)] leading-relaxed font-body">
        StudyFlow is a student productivity dashboard that helps 
        students manage academic tasks, plan study schedules, and 
        track productivity. Features include: Task Manager, Daily & 
        Weekly Study Planner, Pomodoro Timer, and productivity 
        analytics with charts.
      </p>
    </div>

    <!-- Section 2: Meet The Team -->
    <div>
      <h3 class="text-md font-semibold text-[var(--color-text-h)] font-display uppercase tracking-wider mb-4">
        Meet The Team
      </h3>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div v-for="member in team" :key="member.id" class="border border-[var(--color-border)] p-4 bg-[var(--color-bg-card)] flex items-center gap-4 transition-all duration-200 hover:border-[var(--color-accent)]">
          <div class="w-12 h-12 rounded-full bg-[var(--color-bg-panel)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-text-muted)] font-display font-bold shrink-0">
            {{ member.initials }}
          </div>
          <div>
            <h4 class="text-sm font-bold text-[var(--color-text-h)] font-display leading-tight mb-1">{{ member.name }}</h4>
            <span class="text-xs font-mono text-[var(--color-text-muted)]">{{ member.id }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const team = [
  { name: 'Nur Anis Afeeni binti Muhamad Ya Rafi', id: '2024800582', initials: 'NA' },
  { name: 'Aliyya binti Azizan', id: '2024235674', initials: 'AA' },
  { name: 'Muhammad Afiq bin Mohd Nizam', id: '2024448334', initials: 'MA' },
  { name: 'Muhammad Zafar Shahrin bin Mohd Zamzuri', id: '2024669328', initials: 'MZ' }
]
</script>

<template>
  <div class="h-full flex flex-col">
    <!-- Header -->
    <div class="mb-6">
      <h2 class="text-xl font-bold tracking-tight text-[var(--color-text-h)] font-display">
        About StudyFlow
      </h2>
      <p class="text-sm text-[var(--color-text-muted)] mt-1 font-body">
        A premium student productivity dashboard designed around human-computer interaction principles.
      </p>
    </div>

    <!-- Main Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
      <!-- Intro Card -->
      <div class="md:col-span-2 border border-[var(--color-border)] p-5 bg-[var(--color-bg-card)]">
        <h3 class="text-md font-semibold text-[var(--color-text-h)] font-display uppercase tracking-wider mb-2">
          Design philosophy
        </h3>
        <p class="text-sm text-[var(--color-text-muted)] leading-relaxed font-body">
          StudyFlow is built on the belief that a student's productivity app should be structured, reliable, and noise-free. 
          To achieve this, we have designed the interface according to Ben Shneiderman's <strong>Eight Golden Rules of Interface Design</strong>. 
          Click or hover on any of the rules below to see how StudyFlow incorporates them into its features.
        </p>
      </div>

      <!-- Rule Cards Grid -->
      <div 
        v-for="(rule, idx) in rules" 
        :key="idx"
        class="border border-[var(--color-border)] p-4 bg-[var(--color-bg-card)] cursor-pointer transition-all duration-200 hover:border-[var(--color-accent)] group"
        :class="{ 'border-[var(--color-accent)] ring-1 ring-[var(--color-accent)]': activeRule === idx }"
        @click="activeRule = idx"
      >
        <div class="flex items-start justify-between">
          <div class="flex items-center gap-3">
            <span class="text-xs font-mono px-1.5 py-0.5 border border-[var(--color-border)] bg-[var(--color-bg-panel)] text-[var(--color-text-muted)]">
              0{{ idx + 1 }}
            </span>
            <h4 class="text-sm font-bold text-[var(--color-text-h)] font-display group-hover:text-[var(--color-accent)] transition-colors">
              {{ rule.title }}
            </h4>
          </div>
          <!-- Arrow Indicator -->
          <span class="text-xs text-[var(--color-text-muted)] group-hover:text-[var(--color-accent)] transition-colors">
            {{ activeRule === idx ? '● Active' : '○ View' }}
          </span>
        </div>

        <div class="mt-3 overflow-hidden transition-all duration-300">
          <p class="text-xs text-[var(--color-text-muted)] leading-relaxed font-body mb-3">
            {{ rule.explanation }}
          </p>
          <div 
            v-if="activeRule === idx" 
            class="border-t border-[var(--color-border)] pt-3 mt-2 text-xs bg-[var(--color-bg-panel)] p-2.5 font-body"
          >
            <span class="font-bold text-[var(--color-accent)] block mb-1 uppercase tracking-wider text-[10px]">
              How StudyFlow Applies It:
            </span>
            <span class="text-[var(--color-text-h)] leading-relaxed">
              {{ rule.application }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const activeRule = ref(0)

const rules = [
  {
    title: 'Strive for Consistency',
    explanation: 'Consistent sequences of actions, terminology, layouts, colors, and typography reduce user confusion and increase familiarity.',
    application: 'StudyFlow enforces consistent border widths, typography hierarchy (Outfit and Inter), and persistent theme palettes. Priority tags (High, Medium, Low) use uniform, distinct colors throughout the dashboard, task manager, and study planner.'
  },
  {
    title: 'Cater to Universal Usability',
    explanation: 'Design systems that adapt to diverse users, screen sizes, skill levels, and physical conditions.',
    application: 'The layout includes a fully responsive grid system. It transforms from a fixed sidebar layout on desktop to a touch-optimized collapsible drawer menu on mobile, keeping text legible and controls easily tappable.'
  },
  {
    title: 'Offer Informative Feedback',
    explanation: 'For every user action, there should be clear, modest system feedback, proportioned to the action\'s importance.',
    application: 'Interactive elements hover smoothly, task actions (completing, editing) trigger visual indicators, and the study dashboard charts animate and update dynamically the moment tasks are modified.'
  },
  {
    title: 'Design Dialogs to Yield Closure',
    explanation: 'Organize actions into groups with a beginning, middle, and end, letting users know when a sequence is completed.',
    application: 'Completing a task crosses it out visually and increments the productivity stats on the main dashboard, giving clear, satisfying feedback that a piece of work is closed.'
  },
  {
    title: 'Prevent Errors',
    explanation: 'Design the interface so users cannot make serious errors, and validate inputs before they are submitted.',
    application: 'The task entry form restricts dates in the past, verifies that character limits are not breached, and requires essential fields (Title, Subject, Hours) to be filled before a task can be submitted.'
  },
  {
    title: 'Permit Easy Reversal of Actions',
    explanation: 'As much as possible, actions should be reversible, particularly destructive actions like deletion, to relieve anxiety.',
    application: 'When you delete a study task, StudyFlow displays an immediate Toast notification at the bottom of the screen with an "Undo" option, allowing instant restoration of the task and its details.'
  },
  {
    title: 'Support Internal Locus of Control',
    explanation: 'Users should feel that they are in charge of the interface and that it responds to their commands rather than taking control away.',
    application: 'You control the planner parameters (daily hour limit, start day, strategy), can manually pause/reset the Pomodoro timer, toggle themes at will, and manage task sorting ascending/descending.'
  },
  {
    title: 'Reduce Cognitive Load',
    explanation: 'Keep displays simple and well-organized, consolidate actions, and provide clear summaries to avoid overloading short-term memory.',
    application: 'The single-page design groups functionalities into specific tabs. The main Dashboard highlights only the next 3 urgent deadlines and key numbers, preventing the user from feeling overwhelmed by long lists.'
  }
]
</script>

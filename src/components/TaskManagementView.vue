<template>
  <div class="space-y-6">
    <!-- Header Controls -->
    <div class="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
      <!-- Search & Filters -->
      <div class="flex flex-wrap gap-2.5 w-full lg:w-auto">
        <!-- Search Input -->
        <div class="relative flex-1 sm:flex-initial">
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="Search by title..." 
            class="premium-input w-full sm:w-64 pl-8"
          />
          <Search class="w-4 h-4 absolute left-2.5 top-3 text-[var(--color-text-muted)]" />
        </div>

        <!-- Subject Filter -->
        <select v-model="filterSubject" class="premium-input text-xs font-display">
          <option value="">All Subjects</option>
          <option v-for="subj in uniqueSubjects" :key="subj" :value="subj">{{ subj }}</option>
        </select>

        <!-- Priority Filter -->
        <select v-model="filterPriority" class="premium-input text-xs font-display">
          <option value="">All Priorities</option>
          <option value="High">High Priority</option>
          <option value="Medium">Medium Priority</option>
          <option value="Low">Low Priority</option>
        </select>

        <!-- Status Filter -->
        <select v-model="filterStatus" class="premium-input text-xs font-display">
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      <!-- Add Task Button -->
      <button @click="openCreateModal" class="premium-btn text-xs w-full lg:w-auto">
        <Plus class="w-4 h-4" /> Add New Task
      </button>
    </div>

    <!-- Tasks Grid / Table -->
    <div class="premium-card overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="border-b border-[var(--color-border)] bg-[var(--color-bg-panel)] text-xs font-display text-[var(--color-text-muted)] uppercase tracking-wider">
              <th class="p-3 w-10 text-center">Status</th>
              <th @click="toggleSort('title')" class="p-3 cursor-pointer hover:text-[var(--color-text-h)] select-none">
                <div class="flex items-center gap-1">
                  Name
                  <ArrowUpDown class="w-3.5 h-3.5 shrink-0" />
                </div>
              </th>
              <th @click="toggleSort('subject')" class="p-3 cursor-pointer hover:text-[var(--color-text-h)] select-none w-32">
                <div class="flex items-center gap-1">
                  Subject
                  <ArrowUpDown class="w-3.5 h-3.5 shrink-0" />
                </div>
              </th>
              <th @click="toggleSort('estimatedHours')" class="p-3 cursor-pointer hover:text-[var(--color-text-h)] select-none w-24">
                <div class="flex items-center gap-1">
                  Hours
                  <ArrowUpDown class="w-3.5 h-3.5 shrink-0" />
                </div>
              </th>
              <th @click="toggleSort('priority')" class="p-3 cursor-pointer hover:text-[var(--color-text-h)] select-none w-28">
                <div class="flex items-center gap-1">
                  Priority
                  <ArrowUpDown class="w-3.5 h-3.5 shrink-0" />
                </div>
              </th>
              <th @click="toggleSort('deadline')" class="p-3 cursor-pointer hover:text-[var(--color-text-h)] select-none w-32">
                <div class="flex items-center gap-1">
                  Deadline
                  <ArrowUpDown class="w-3.5 h-3.5 shrink-0" />
                </div>
              </th>
              <th class="p-3 text-right w-20">Actions</th>
            </tr>
          </thead>
          <tbody class="text-sm font-body">
            <tr 
              v-for="task in filteredTasks" 
              :key="task.id" 
              class="border-b border-[var(--color-border)] hover:bg-[var(--color-bg-panel)]/30 transition-colors"
              :class="{ 'opacity-65 line-through decoration-[var(--color-text-muted)] bg-[var(--color-bg-panel)]/10': task.status === 'completed' }"
            >
              <!-- Completed status Toggle -->
              <td class="p-3 text-center">
                <button 
                  @click="toggleTaskStatus(task)" 
                  class="w-4.5 h-4.5 border border-[var(--color-border)] rounded-sm flex items-center justify-center transition-colors cursor-pointer"
                  :class="[
                    task.status === 'completed' 
                      ? 'bg-[var(--color-accent)] border-[var(--color-accent)] text-[var(--color-bg)]' 
                      : 'hover:border-[var(--color-text-h)]'
                  ]"
                >
                  <Check v-if="task.status === 'completed'" class="w-3.5 h-3.5" />
                </button>
              </td>

              <!-- Title -->
              <td class="p-3 text-[var(--color-text-h)] font-medium font-display leading-tight">
                {{ task.title }}
              </td>

              <!-- Subject badge -->
              <td class="p-3">
                <span class="px-2 py-0.5 text-xs font-medium border border-[var(--color-border)] bg-[var(--color-bg-card)]">
                  {{ task.subject }}
                </span>
              </td>

              <!-- Estimated hours -->
              <td class="p-3 font-mono text-xs">
                {{ task.estimatedHours }} hrs
              </td>

              <!-- Priority badge -->
              <td class="p-3">
                <span 
                  class="px-2 py-0.5 text-xs font-medium border"
                  :class="getPriorityClasses(task.priority)"
                >
                  {{ task.priority }}
                </span>
              </td>

              <!-- Deadline formatted -->
              <td class="p-3 font-mono text-xs text-[var(--color-text-muted)]">
                <span :class="{ 'text-red-500 font-semibold': isOverdue(task) }">
                  {{ formatDate(task.deadline) }}
                </span>
              </td>

              <!-- Actions -->
              <td class="p-3 text-right">
                <div class="flex items-center justify-end gap-1">
                  <button 
                    @click="openEditModal(task)" 
                    class="p-1 hover:bg-[var(--color-bg-panel)] text-[var(--color-text-muted)] hover:text-[var(--color-accent)] transition-colors border border-transparent rounded-sm"
                    title="Edit Task"
                  >
                    <Edit3 class="w-3.5 h-3.5" />
                  </button>
                  <button 
                    @click="handleDelete(task.id)" 
                    class="p-1 hover:bg-[var(--color-bg-panel)] text-[var(--color-text-muted)] hover:text-red-500 transition-colors border border-transparent rounded-sm"
                    title="Delete Task"
                  >
                    <Trash2 class="w-3.5 h-3.5" />
                  </button>
                </div>
              </td>
            </tr>

            <!-- Empty State -->
            <tr v-if="filteredTasks.length === 0">
              <td colspan="7" class="p-8 text-center text-xs text-[var(--color-text-muted)] font-mono">
                No matching tasks found.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal Form (Create / Edit) -->
    <div 
      v-if="modal.show" 
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"
    >
      <div 
        class="bg-[var(--color-bg-card)] border border-[var(--color-border)] shadow-xl w-full max-w-md p-6 animate-slide-up relative"
      >
        <div class="flex items-center justify-between pb-3 border-b border-[var(--color-border)] mb-4">
          <h3 class="text-sm font-bold uppercase font-display tracking-wider text-[var(--color-text-h)]">
            {{ modal.mode === 'create' ? 'Create New Task' : 'Edit Study Task' }}
          </h3>
          <button @click="closeModal" class="p-1 hover:bg-[var(--color-bg-panel)] rounded-sm">
            <X class="w-4 h-4 text-[var(--color-text-muted)]" />
          </button>
        </div>

        <form @submit.prevent="submitForm" class="space-y-3.5">
          <!-- Title -->
          <div class="flex flex-col gap-1">
            <label class="text-[11px] uppercase font-display font-bold tracking-wider text-[var(--color-text-muted)]">
              Task Title (Max 60 chars)
            </label>
            <input 
              v-model="form.title" 
              type="text" 
              placeholder="e.g. Prepare Chemistry Presentation"
              class="premium-input text-xs"
              :class="{ 'border-red-500 focus:border-red-500': errors.title }"
            />
            <span v-if="errors.title" class="text-[10px] text-red-500 font-mono">{{ errors.title }}</span>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <!-- Subject -->
            <div class="flex flex-col gap-1">
              <label class="text-[11px] uppercase font-display font-bold tracking-wider text-[var(--color-text-muted)]">
                Subject
              </label>
              <input 
                v-model="form.subject" 
                type="text" 
                list="subjectsList"
                placeholder="e.g. Chemistry"
                class="premium-input text-xs"
                :class="{ 'border-red-500 focus:border-red-500': errors.subject }"
              />
              <datalist id="subjectsList">
                <option value="Mathematics" />
                <option value="Biology" />
                <option value="Chemistry" />
                <option value="Physics" />
                <option value="English" />
                <option value="History" />
                <option value="Computer Science" />
              </datalist>
              <span v-if="errors.subject" class="text-[10px] text-red-500 font-mono">{{ errors.subject }}</span>
            </div>

            <!-- Estimated Hours -->
            <div class="flex flex-col gap-1">
              <label class="text-[11px] uppercase font-display font-bold tracking-wider text-[var(--color-text-muted)]">
                Estimated Hours
              </label>
              <input 
                v-model.number="form.estimatedHours" 
                type="number" 
                step="0.5"
                min="0.5"
                class="premium-input text-xs font-mono"
                :class="{ 'border-red-500 focus:border-red-500': errors.estimatedHours }"
              />
              <span v-if="errors.estimatedHours" class="text-[10px] text-red-500 font-mono">{{ errors.estimatedHours }}</span>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <!-- Priority -->
            <div class="flex flex-col gap-1">
              <label class="text-[11px] uppercase font-display font-bold tracking-wider text-[var(--color-text-muted)]">
                Priority
              </label>
              <select 
                v-model="form.priority" 
                class="premium-input text-xs font-display"
                :class="{ 'border-red-500 focus:border-red-500': errors.priority }"
              >
                <option value="">Select Priority</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
              <span v-if="errors.priority" class="text-[10px] text-red-500 font-mono">{{ errors.priority }}</span>
            </div>

            <!-- Deadline -->
            <div class="flex flex-col gap-1">
              <label class="text-[11px] uppercase font-display font-bold tracking-wider text-[var(--color-text-muted)]">
                Deadline
              </label>
              <input 
                v-model="form.deadline" 
                type="date" 
                class="premium-input text-xs font-mono"
                :class="{ 'border-red-500 focus:border-red-500': errors.deadline }"
              />
              <span v-if="errors.deadline" class="text-[10px] text-red-500 font-mono">{{ errors.deadline }}</span>
            </div>
          </div>

          <!-- Buttons -->
          <div class="flex items-center justify-end gap-2 pt-4 border-t border-[var(--color-border)] mt-4">
            <button type="button" @click="closeModal" class="premium-btn-secondary text-xs">
              Cancel
            </button>
            <button type="submit" class="premium-btn text-xs">
              {{ modal.mode === 'create' ? 'Create Task' : 'Save Changes' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, inject, computed } from 'vue'
import { 
  Plus, 
  Search, 
  Check, 
  Trash2, 
  Edit3, 
  X, 
  ArrowUpDown 
} from 'lucide-vue-next'

const tasks = inject('tasks')
const addTask = inject('addTask')
const updateTask = inject('updateTask')
const deleteTask = inject('deleteTask')

// Filters state
const searchQuery = ref('')
const filterSubject = ref('')
const filterPriority = ref('')
const filterStatus = ref('')

// Sorting state
const sortColumn = ref('deadline')
const sortAscending = ref(true)

// Modal state
const modal = ref({
  show: false,
  mode: 'create', // 'create' | 'edit'
  taskId: null
})

// Form state
const form = ref({
  title: '',
  subject: '',
  estimatedHours: 2,
  priority: '',
  deadline: ''
})

const errors = ref({})

// Unique list of subjects extracted from existing tasks
const uniqueSubjects = computed(() => {
  const list = tasks.value.map(t => t.subject)
  return [...new Set(list)].filter(Boolean).sort()
})

// Toggle sort column
const toggleSort = (col) => {
  if (sortColumn.value === col) {
    sortAscending.value = !sortAscending.value
  } else {
    sortColumn.value = col
    sortAscending.value = true
  }
}

// Map Priority sorting values
const priorityWeight = {
  High: 3,
  Medium: 2,
  Low: 1
}

// Compute filtered & sorted tasks
const filteredTasks = computed(() => {
  let list = [...tasks.value]

  // Apply search query
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase().trim()
    list = list.filter(t => t.title.toLowerCase().includes(q))
  }

  // Apply subject filter
  if (filterSubject.value) {
    list = list.filter(t => t.subject === filterSubject.value)
  }

  // Apply priority filter
  if (filterPriority.value) {
    list = list.filter(t => t.priority === filterPriority.value)
  }

  // Apply status filter
  if (filterStatus.value) {
    list = list.filter(t => t.status === filterStatus.value)
  }

  // Sort results
  list.sort((a, b) => {
    let fieldA = a[sortColumn.value]
    let fieldB = b[sortColumn.value]

    // Handle priority mapping
    if (sortColumn.value === 'priority') {
      fieldA = priorityWeight[fieldA] || 0
      fieldB = priorityWeight[fieldB] || 0
    }

    // Number or string comparisons
    let comparison = 0
    if (typeof fieldA === 'string') {
      comparison = fieldA.localeCompare(fieldB)
    } else {
      comparison = (fieldA || 0) - (fieldB || 0)
    }

    return sortAscending.value ? comparison : -comparison
  })

  return list
})

// Utility styling classes for priorities
const getPriorityClasses = (prio) => {
  if (prio === 'High') {
    return 'border-rose-500/20 bg-rose-500/10 text-rose-600 dark:text-rose-400 font-semibold'
  }
  if (prio === 'Medium') {
    return 'border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold'
  }
  return 'border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold'
}

// Date parsing formatting
const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  const [y, m, d] = dateStr.split('-')
  const dateObj = new Date(y, m - 1, d)
  return dateObj.toLocaleDateString(undefined, { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  })
}

// Identify past/overdue deadlines (only if task is pending)
const isOverdue = (task) => {
  if (task.status === 'completed' || !task.deadline) return false
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const [y, m, d] = task.deadline.split('-')
  const deadlineDate = new Date(y, m - 1, d)
  deadlineDate.setHours(0, 0, 0, 0)
  return deadlineDate < today
}

// Handlers for task actions
const toggleTaskStatus = (task) => {
  const updated = {
    ...task,
    status: task.status === 'completed' ? 'pending' : 'completed'
  }
  updateTask(updated)
}

const handleDelete = (id) => {
  deleteTask(id)
}

// Modal Form methods
const openCreateModal = () => {
  modal.value.show = true
  modal.value.mode = 'create'
  modal.value.taskId = null
  
  form.value = {
    title: '',
    subject: '',
    estimatedHours: 2,
    priority: 'Medium',
    deadline: new Date().toISOString().split('T')[0]
  }
  errors.value = {}
}

const openEditModal = (task) => {
  modal.value.show = true
  modal.value.mode = 'edit'
  modal.value.taskId = task.id
  
  form.value = {
    title: task.title,
    subject: task.subject,
    estimatedHours: task.estimatedHours,
    priority: task.priority,
    deadline: task.deadline
  }
  errors.value = {}
}

const closeModal = () => {
  modal.value.show = false
  modal.value.taskId = null
}

const validateForm = () => {
  errors.value = {}
  
  if (!form.value.title.trim()) {
    errors.value.title = 'Title is required'
  } else if (form.value.title.length > 60) {
    errors.value.title = 'Title must be under 60 characters'
  }
  
  if (!form.value.subject.trim()) {
    errors.value.subject = 'Subject is required'
  }
  
  if (!form.value.estimatedHours || form.value.estimatedHours <= 0) {
    errors.value.estimatedHours = 'Hours must be a positive number'
  }
  
  if (!form.value.priority) {
    errors.value.priority = 'Priority is required'
  }
  
  if (!form.value.deadline) {
    errors.value.deadline = 'Deadline is required'
  } else {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const [y, m, d] = form.value.deadline.split('-')
    const deadlineDate = new Date(y, m - 1, d)
    deadlineDate.setHours(0, 0, 0, 0)
    
    // In edit mode we allow keeping the same past deadline, but in create mode we prevent past deadlines
    if (modal.value.mode === 'create' && deadlineDate < today) {
      errors.value.deadline = 'Deadline cannot be in the past'
    }
  }
  
  return Object.keys(errors.value).length === 0
}

const submitForm = () => {
  if (!validateForm()) return
  
  if (modal.value.mode === 'create') {
    addTask({ ...form.value })
  } else {
    // Edit Mode
    const existing = tasks.value.find(t => t.id === modal.value.taskId)
    if (existing) {
      updateTask({
        ...existing,
        ...form.value
      })
    }
  }
  
  closeModal()
}
</script>

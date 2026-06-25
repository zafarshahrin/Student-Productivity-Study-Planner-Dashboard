<template>
  <div class="space-y-6">

    <!-- Header Controls -->
    <div class="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
      <div class="flex flex-wrap gap-2.5 w-full lg:w-auto">
        <div class="relative flex-1 sm:flex-initial">
          <input v-model="searchQuery" type="text" placeholder="       Search by title..."
            class="premium-input w-full sm:w-64 pl-8"/>
          <Search class="w-4 h-4 absolute left-2.5 top-3 text-[var(--color-text-muted)]"/>
        </div>
        <select v-model="filterSubject" class="premium-input text-xs font-display">
          <option value="">All Subjects</option>
          <option v-for="subj in uniqueSubjects" :key="subj" :value="subj">{{ subj }}</option>
        </select>
        <select v-model="filterStatus" class="premium-input text-xs font-display">
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
        </select>
      </div>
      <button @click="openCreateModal" class="premium-btn text-xs w-full lg:w-auto flex items-center gap-2">
        <Plus class="w-4 h-4"/> Add New Task
      </button>
    </div>

    <!-- Tasks Table -->
    <div class="premium-card overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="border-b border-[var(--color-border)] bg-[var(--color-bg-panel)] text-xs font-display text-[var(--color-text-muted)] uppercase tracking-wider">
              <th class="p-3 w-10 text-center">Done</th>
              <th @click="toggleSort('title')" class="p-3 cursor-pointer hover:text-[var(--color-text-h)] select-none">
                <div class="flex items-center gap-1">Name <ArrowUpDown class="w-3.5 h-3.5"/></div>
              </th>
              <th @click="toggleSort('subject')" class="p-3 cursor-pointer hover:text-[var(--color-text-h)] select-none w-32">
                <div class="flex items-center gap-1">Subject <ArrowUpDown class="w-3.5 h-3.5"/></div>
              </th>
              <th @click="toggleSort('estimatedHours')" class="p-3 cursor-pointer hover:text-[var(--color-text-h)] select-none w-24">
                <div class="flex items-center gap-1">Hours <ArrowUpDown class="w-3.5 h-3.5"/></div>
              </th>
              <th class="p-3 w-28">Priority</th>
              <th @click="toggleSort('deadline')" class="p-3 cursor-pointer hover:text-[var(--color-text-h)] select-none w-36">
                <div class="flex items-center gap-1">Deadline <ArrowUpDown class="w-3.5 h-3.5"/></div>
              </th>
              <th class="p-3 w-28 text-center">Today's Plan</th>
              <th class="p-3 text-right w-20">Actions</th>
            </tr>
          </thead>
          <tbody class="text-sm font-body">
            <tr v-for="task in filteredTasks" :key="task.id"
              class="border-b border-[var(--color-border)] hover:bg-[var(--color-bg-panel)]/30 transition-colors"
              :class="{ 'opacity-65 line-through decoration-[var(--color-text-muted)]': task.status === 'completed' }">

              <!-- Status Toggle -->
              <td class="p-3 text-center">
                <button @click="toggleTaskStatus(task)"
                  class="w-4.5 h-4.5 border border-[var(--color-border)] rounded-sm flex items-center justify-center transition-colors cursor-pointer"
                  :class="task.status === 'completed' ? 'bg-[var(--color-accent)] border-[var(--color-accent)] text-[var(--color-bg)]' : 'hover:border-[var(--color-text-h)]'">
                  <Check v-if="task.status === 'completed'" class="w-3.5 h-3.5"/>
                </button>
              </td>

              <!-- Title -->
              <td class="p-3 text-[var(--color-text-h)] font-medium font-display">{{ task.title }}</td>

              <!-- Subject -->
              <td class="p-3">
                <span class="px-2 py-0.5 text-xs font-medium border border-[var(--color-border)] bg-[var(--color-bg-card)]">
                  {{ task.subject }}
                </span>
              </td>

              <!-- Hours -->
              <td class="p-3">
                <span class="text-xs font-mono">{{ task.estimatedHours ? `${task.estimatedHours} hrs` : '—' }}</span>
              </td>

              <!-- Auto Priority -->
              <td class="p-3">
                <span class="text-[9px] font-mono px-2 py-0.5 border uppercase" :class="getAutoPriorityClasses(task)">
                  {{ getAutoPriority(task) }}
                </span>
              </td>

              <!-- Deadline -->
              <td class="p-3">
                <span class="text-xs font-mono" :class="{ 'text-red-500 font-semibold': isOverdue(task) }">
                  {{ formatDateTime(task) }}
                </span>
                <span v-if="isOverdue(task)" class="block text-[9px] uppercase text-red-500 font-bold tracking-wider">Overdue</span>
              </td>

              <!-- Today's Plan Toggle -->
              <td class="p-3 text-center">
                <button v-if="task.status === 'pending'" @click="toggleTodayPlan(task.id)"
                  class="w-9 h-5 rounded-full relative transition-colors duration-200 border"
                  :class="todayPlan.has(task.id) ? 'bg-[var(--color-accent)] border-[var(--color-accent)]' : 'bg-transparent border-[var(--color-border)]'">
                  <span class="absolute top-0.5 left-0.5 w-3.5 h-3.5 rounded-full bg-white shadow transition-transform duration-200"
                    :class="todayPlan.has(task.id) ? 'translate-x-4' : 'translate-x-0'"></span>
                </button>
                <span v-else class="text-[10px] text-[var(--color-text-muted)] font-mono">—</span>
              </td>

              <!-- Actions -->
              <td class="p-3 text-right">
                <div class="flex items-center justify-end gap-1">
                  <button @click="openEditModal(task)"
                    class="p-1 hover:bg-[var(--color-bg-panel)] text-[var(--color-text-muted)] hover:text-[var(--color-accent)] transition-colors">
                    <Edit3 class="w-3.5 h-3.5"/>
                  </button>
                  <button @click="handleDelete(task.id)"
                    class="p-1 hover:bg-[var(--color-bg-panel)] text-[var(--color-text-muted)] hover:text-red-500 transition-colors">
                    <Trash2 class="w-3.5 h-3.5"/>
                  </button>
                </div>
              </td>
            </tr>

            <tr v-if="filteredTasks.length === 0">
              <td colspan="8" class="p-8 text-center text-xs text-[var(--color-text-muted)] font-mono">
                No matching tasks found.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Add/Edit Modal -->
    <div v-if="modal.show" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div class="bg-[var(--color-bg-card)] border border-[var(--color-border)] shadow-xl w-full max-w-md p-6">
        <div class="flex items-center justify-between pb-3 border-b border-[var(--color-border)] mb-4">
          <h3 class="text-sm font-bold uppercase font-display tracking-wider text-[var(--color-text-h)]">
            {{ modal.mode === 'create' ? 'Create New Task' : 'Edit Study Task' }}
          </h3>
          <button @click="closeModal" class="p-1 hover:bg-[var(--color-bg-panel)] rounded-sm">
            <X class="w-4 h-4 text-[var(--color-text-muted)]"/>
          </button>
        </div>

        <div class="space-y-3.5">
          <!-- Title -->
          <div class="flex flex-col gap-1">
            <label class="text-[11px] uppercase font-display font-bold tracking-wider text-[var(--color-text-muted)]">Task Title (Max 60 chars)</label>
            <input v-model="form.title" type="text" placeholder="e.g. Prepare Chemistry Presentation"
              class="premium-input text-xs" :class="{ 'border-red-500': errors.title }"/>
            <span v-if="errors.title" class="text-[10px] text-red-500 font-mono">{{ errors.title }}</span>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <!-- Subject -->
            <div class="flex flex-col gap-1">
              <label class="text-[11px] uppercase font-display font-bold tracking-wider text-[var(--color-text-muted)]">Subject</label>
              <input v-model="form.subject" type="text" list="subjectsList" placeholder="e.g. Chemistry"
                class="premium-input text-xs" :class="{ 'border-red-500': errors.subject }"/>
              <datalist id="subjectsList">
                <option value="Mathematics"/>
                <option value="Biology"/>
                <option value="Chemistry"/>
                <option value="Physics"/>
                <option value="English"/>
                <option value="History"/>
                <option value="Computer Science"/>
              </datalist>
              <span v-if="errors.subject" class="text-[10px] text-red-500 font-mono">{{ errors.subject }}</span>
            </div>

            <!-- Estimated Hours -->
            <div class="flex flex-col gap-1">
              <label class="text-[11px] uppercase font-display font-bold tracking-wider text-[var(--color-text-muted)]">
                Est. Hours <span class="normal-case font-normal">(optional)</span>
              </label>
              <input v-model.number="form.estimatedHours" type="number" step="0.5" min="0.5" placeholder="e.g. 2"
                class="premium-input text-xs font-mono" :class="{ 'border-red-500': errors.estimatedHours }"/>
              <span v-if="errors.estimatedHours" class="text-[10px] text-red-500 font-mono">{{ errors.estimatedHours }}</span>
            </div>
          </div>

          <!-- Deadline -->
          <div class="flex flex-col gap-1">
            <label class="text-[11px] uppercase font-display font-bold tracking-wider text-[var(--color-text-muted)]">Deadline</label>
            <div class="flex gap-2">
              <input v-model="form.deadlineDate" type="date"
                class="premium-input text-xs font-mono flex-1" :class="{ 'border-red-500': errors.deadlineDate }"/>
              <input v-model="form.deadlineTime" type="time" class="premium-input text-xs font-mono w-28"/>
            </div>
            <span v-if="errors.deadlineDate" class="text-[10px] text-red-500 font-mono">{{ errors.deadlineDate }}</span>
          </div>

          <p class="text-[10px] font-mono text-[var(--color-text-muted)] italic">
            ⓘ Priority is auto-calculated: ≥5 days = Low, 3–4 days = Medium, 1–2 days = High, overdue = Overdue
          </p>

          <div class="flex items-center justify-end gap-2 pt-4 border-t border-[var(--color-border)]">
            <button type="button" @click="closeModal" class="premium-btn-secondary text-xs">Cancel</button>
            <button @click="submitForm" class="premium-btn text-xs">
              {{ modal.mode === 'create' ? 'Create Task' : 'Save Changes' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="deleteConfirm.show" class="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60"
      @click.self="cancelDelete">
      <div class="bg-[var(--color-bg-card)] border border-[var(--color-border)] shadow-xl w-full max-w-sm p-6">
        <div class="flex items-center justify-center w-12 h-12 mx-auto mb-4 rounded-full bg-red-500/10 border border-red-500/20">
          <Trash2 class="w-5 h-5 text-red-500"/>
        </div>
        <h3 class="text-sm font-bold uppercase font-display tracking-wider text-[var(--color-text-h)] text-center mb-1">Delete Task</h3>
        <p class="text-xs text-[var(--color-text-muted)] text-center mb-1">Are you sure you want to delete</p>
        <p class="text-xs font-display font-semibold text-[var(--color-text-h)] text-center px-4 py-2 bg-[var(--color-bg-panel)] border border-[var(--color-border)] mb-4 truncate">
          "{{ deleteConfirm.taskTitle }}"
        </p>
        <p class="text-[10px] font-mono text-red-500/70 text-center mb-5">This action cannot be undone.</p>
        <div class="flex items-center gap-2">
          <button @click="cancelDelete" class="premium-btn-secondary text-xs flex-1">Cancel</button>
          <button @click="confirmDelete"
            class="flex-1 px-4 py-2 text-xs font-display font-bold uppercase tracking-wider border border-red-500/40 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all cursor-pointer">
            Yes, Delete
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, inject, computed } from 'vue'
import { Plus, Search, Check, Trash2, Edit3, X, ArrowUpDown } from 'lucide-vue-next'

const tasks = inject('tasks')
const addTask = inject('addTask')
const updateTask = inject('updateTask')
const deleteTask = inject('deleteTask')
const todayPlanIds = inject('todayPlan')
const todayPlan = todayPlanIds

const toggleTodayPlan = (id) => {
  const next = new Set(todayPlanIds.value)
  next.has(id) ? next.delete(id) : next.add(id)
  todayPlanIds.value = next
}

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
  if (p === 'Overdue') return 'border-zinc-700/40 bg-zinc-800/60 text-zinc-300 font-semibold'
  if (p === 'High')    return 'border-rose-500/20 bg-rose-500/10 text-rose-600 font-semibold'
  if (p === 'Medium')  return 'border-amber-500/20 bg-amber-500/10 text-amber-600 font-semibold'
  return 'border-emerald-500/20 bg-emerald-500/10 text-emerald-600 font-semibold'
}

const searchQuery = ref('')
const filterSubject = ref('')
const filterStatus = ref('')
const sortColumn = ref('deadline')
const sortAscending = ref(true)

const modal = ref({ show: false, mode: 'create', taskId: null })
const form = ref({ title: '', subject: '', estimatedHours: null, deadlineDate: '', deadlineTime: '' })
const errors = ref({})

const deleteConfirm = ref({ show: false, taskId: null, taskTitle: '' })

const uniqueSubjects = computed(() => [...new Set(tasks.value.map(t => t.subject))].filter(Boolean).sort())

const toggleSort = (col) => {
  if (sortColumn.value === col) {
    sortAscending.value = !sortAscending.value
  } else {
    sortColumn.value = col
    sortAscending.value = true
  }
}

const filteredTasks = computed(() => {
  let list = [...tasks.value]
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase().trim()
    list = list.filter(t => t.title.toLowerCase().includes(q))
  }
  if (filterSubject.value) list = list.filter(t => t.subject === filterSubject.value)
  if (filterStatus.value) list = list.filter(t => t.status === filterStatus.value)

  list.sort((a, b) => {
    if (a.status !== b.status) return a.status === 'completed' ? 1 : -1
    let fieldA = a[sortColumn.value]
    let fieldB = b[sortColumn.value]
    const comparison = typeof fieldA === 'string' ? (fieldA || '').localeCompare(fieldB || '') : (fieldA || 0) - (fieldB || 0)
    return sortAscending.value ? comparison : -comparison
  })

  return list
})

const formatDateTime = (task) => {
  if (!task.deadline) return '-'
  const [y, m, d] = task.deadline.split('-')
  const dateObj = new Date(Number(y), Number(m) - 1, Number(d))
  const dateStr = dateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
  if (task.deadlineTime) {
    const [h, min] = task.deadlineTime.split(':')
    const timeObj = new Date()
    timeObj.setHours(parseInt(h, 10), parseInt(min, 10))
    return `${dateStr} at ${timeObj.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}`
  }
  return dateStr
}

const isOverdue = (task) => {
  if (task.status === 'completed' || !task.deadline) return false
  const today = new Date()
  const [y, m, d] = task.deadline.split('-')
  const deadlineDate = new Date(Number(y), Number(m) - 1, Number(d))
  if (task.deadlineTime) {
    const [h, min] = task.deadlineTime.split(':')
    deadlineDate.setHours(parseInt(h, 10), parseInt(min, 10), 0, 0)
  } else {
    deadlineDate.setHours(23, 59, 59, 999)
  }
  return deadlineDate < today
}

const toggleTaskStatus = (task) => updateTask({ ...task, status: task.status === 'completed' ? 'pending' : 'completed' })

const handleDelete = (id) => {
  const task = tasks.value.find(t => t.id === id)
  deleteConfirm.value = { show: true, taskId: id, taskTitle: task ? task.title : 'this task' }
}

const confirmDelete = () => {
  const id = deleteConfirm.value.taskId
  if (todayPlanIds.value.has(id)) {
    const next = new Set(todayPlanIds.value)
    next.delete(id)
    todayPlanIds.value = next
  }
  deleteTask(id)
  cancelDelete()
}

const cancelDelete = () => { deleteConfirm.value = { show: false, taskId: null, taskTitle: '' } }

const openCreateModal = () => {
  modal.value = { show: true, mode: 'create', taskId: null }
  form.value = { title: '', subject: '', estimatedHours: null, deadlineDate: new Date().toISOString().split('T')[0], deadlineTime: '23:59' }
  errors.value = {}
}

const openEditModal = (task) => {
  modal.value = { show: true, mode: 'edit', taskId: task.id }
  form.value = { title: task.title, subject: task.subject, estimatedHours: task.estimatedHours || null, deadlineDate: task.deadline, deadlineTime: task.deadlineTime || '' }
  errors.value = {}
}

const closeModal = () => { modal.value.show = false; modal.value.taskId = null }

const validateForm = () => {
  errors.value = {}
  if (!form.value.title.trim()) errors.value.title = 'Title is required'
  else if (form.value.title.length > 60) errors.value.title = 'Title must be under 60 characters'
  if (!form.value.subject.trim()) errors.value.subject = 'Subject is required'
  if (form.value.estimatedHours !== null && form.value.estimatedHours !== '' && form.value.estimatedHours < 0)
    errors.value.estimatedHours = 'Hours cannot be negative'
  if (!form.value.deadlineDate) {
    errors.value.deadlineDate = 'Deadline date is required'
  } else if (modal.value.mode === 'create') {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const [y, m, d] = form.value.deadlineDate.split('-')
    if (new Date(Number(y), Number(m) - 1, Number(d)) < today)
      errors.value.deadlineDate = 'Deadline cannot be in the past'
  }
  return Object.keys(errors.value).length === 0
}

const submitForm = () => {
  if (!validateForm()) return
  const taskPayload = {
    title: form.value.title,
    subject: form.value.subject,
    estimatedHours: form.value.estimatedHours || 0,
    deadline: form.value.deadlineDate,
    deadlineTime: form.value.deadlineTime
  }
  if (modal.value.mode === 'create') {
    addTask(taskPayload)
  } else {
    const existing = tasks.value.find(t => t.id === modal.value.taskId)
    if (existing) updateTask({ ...existing, ...taskPayload })
  }
  closeModal()
}
</script>
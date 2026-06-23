// ==========================================
// STUDYFLOW - VUE.JS APPLICATION ENGINE
// ==========================================

// Timer Modes static constants
const TIMER_MODES = { work: 25, short: 5, long: 15 };

// Theme charts colors configurations
const THEME_CHART_COLORS = {
    calm: {
        primary: '#4a7c59',
        accent: '#d9bf77',
        success: '#6096ba',
        danger: '#d97870',
        palette: ['#4a7c59', '#6096ba', '#d9bf77', '#a3b19b', '#ebd8a7', '#8fa094'],
        border: '#ffffff',
        text: '#1c2e21'
    },
    focus: {
        primary: '#ffffff',
        accent: '#888888',
        success: '#e0e0e0',
        danger: '#666666',
        palette: ['#ffffff', '#cccccc', '#aaaaaa', '#888888', '#666666', '#444444'],
        border: '#1e1e1e',
        text: '#ffffff'
    },
    dark: {
        primary: '#0ea5e9',
        accent: '#a855f7',
        success: '#10b981',
        danger: '#ef4444',
        palette: ['#0ea5e9', '#a855f7', '#10b981', '#f43f5e', '#fbbf24', '#6366f1'],
        border: '#0f172a',
        text: '#f8fafc'
    }
};

const { createApp } = Vue;

createApp({
    data() {
        return {
            // State
            tasks: [],
            activeTab: 'dashboard',
            theme: 'calm',
            mobileMenuOpen: false,
            
            // Modals toggle
            showTaskModal: false,
            showTimerModal: false,
            showShortcutsModal: false,
            showRuleModal: false,
            
            // Interactive Golden Rules Demo Data
            selectedRuleDemo: {
                number: 1,
                title: '',
                description: '',
                howToTest: ''
            },
            
            // Form Data
            taskForm: {
                name: '',
                subject: '',
                priority: 'Medium',
                deadline: '',
                hours: 2
            },
            formErrors: {
                name: '',
                subject: '',
                deadline: '',
                hours: ''
            },
            editingTaskId: null,
            
            // Filters
            searchQuery: '',
            subjectFilter: 'all',
            priorityFilter: 'all',
            statusFilter: 'all',
            
            // Sorting
            sortColumn: 'deadline',
            sortDir: 'asc',
            
            // Pomodoro Timer State
            timer: {
                minutes: 25,
                seconds: 0,
                isRunning: false,
                currentMode: 'work',
                intervalId: null
            },
            
            // Study Planner State
            plannerSettings: {
                dailyHoursLimit: 4,
                weeklyStartDay: 'Monday',
                allocationStrategy: 'deadline',
                activePlanType: null, // null, 'daily', 'weekly'
                printDateText: '',
                weekdays: []
            },
            dailyPlanTimeline: [],
            dailyPlanAllocatedHours: 0,
            weeklyPlan: {},
            
            // Toast Notifications
            toasts: [],
            deletedBackup: null,
            
            // UI Helpers
            activeTipIndex: 0,
            currentDateText: '',
            todayDateString: '',
            
            // Chart.js references
            subjectChartInstance: null,
            priorityChartInstance: null
        };
    },

    computed: {
        // Dynamic subject listings based on active tasks
        uniqueSubjects() {
            const subs = this.tasks.map(t => t.subject).filter(Boolean);
            return [...new Set(subs)].sort();
        },

        // Stats counts
        pendingTasksCount() {
            return this.tasks.filter(t => !t.completed).length;
        },

        completedTasksCount() {
            return this.tasks.filter(t => t.completed).length;
        },

        completedPercentage() {
            const total = this.tasks.length;
            return total > 0 ? Math.round((this.completedTasksCount / total) * 100) : 0;
        },

        // Sidebar and card lists
        upcomingTasks() {
            return this.tasks
                .filter(t => !t.completed)
                .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
                .slice(0, 3);
        },

        // Reactive sorting and filtering of table
        sortedFilteredTasks() {
            let result = this.tasks.filter(task => {
                const matchesSearch = task.name.toLowerCase().includes(this.searchQuery.toLowerCase());
                const matchesSubject = this.subjectFilter === 'all' || task.subject === this.subjectFilter;
                const matchesPriority = this.priorityFilter === 'all' || task.priority === this.priorityFilter;
                
                let matchesStatus = true;
                if (this.statusFilter === 'completed') matchesStatus = task.completed;
                if (this.statusFilter === 'pending') matchesStatus = !task.completed;

                return matchesSearch && matchesSubject && matchesPriority && matchesStatus;
            });

            // Sort logic
            result.sort((a, b) => {
                let valA = a[this.sortColumn];
                let valB = b[this.sortColumn];

                if (this.sortColumn === 'deadline') {
                    valA = new Date(valA);
                    valB = new Date(valB);
                } else if (this.sortColumn === 'priority') {
                    const weight = { High: 3, Medium: 2, Low: 1 };
                    valA = weight[valA] || 0;
                    valB = weight[valB] || 0;
                } else if (typeof valA === 'string') {
                    valA = valA.toLowerCase();
                    valB = valB.toLowerCase();
                }

                if (valA < valB) return this.sortDir === 'asc' ? -1 : 1;
                if (valA > valB) return this.sortDir === 'asc' ? 1 : -1;
                return 0;
            });

            return result;
        }
    },

    watch: {
        // Automatically save tasks to local storage and update charts
        tasks: {
            handler() {
                localStorage.setItem('studyflow_tasks', JSON.stringify(this.tasks));
                this.$nextTick(() => {
                    this.renderCharts();
                });
            },
            deep: true
        },
        
        // Re-render charts to change colors when theme toggles
        theme(newTheme) {
            localStorage.setItem('studyflow_theme', newTheme);
            document.documentElement.setAttribute('data-theme', newTheme);
            this.$nextTick(() => {
                this.renderCharts();
            });
        }
    },

    methods: {
        // Navigation
        switchTab(tabId) {
            this.activeTab = tabId;
            this.mobileMenuOpen = false;
            
            // Re-render charts on dashboard reload
            if (tabId === 'dashboard') {
                this.$nextTick(() => {
                    this.renderCharts();
                });
            }
        },

        getPageTitle() {
            const titleMapping = {
                dashboard: 'Dashboard Overview',
                tasks: 'Task Management',
                planner: 'Study Scheduler',
                about: 'About Group 4'
            };
            return titleMapping[this.activeTab] || 'StudyFlow';
        },

        // Theme Customization
        setTheme(themeName) {
            this.theme = themeName;
            this.showToast(`Switched to ${themeName.charAt(0).toUpperCase() + themeName.slice(1)} Mode!`);
        },

        // Toast Messages
        showToast(message, actionText = null, actionCallback = null) {
            const id = Date.now().toString();
            this.toasts.push({ id, message, actionText, actionCallback });
            
            // Auto-remove after 5s
            setTimeout(() => {
                this.removeToast(id);
            }, 5000);
        },

        removeToast(id) {
            this.toasts = this.toasts.filter(t => t.id !== id);
        },

        // CRUD Operations
        openAddTaskModal() {
            this.editingTaskId = null;
            this.taskForm = {
                name: '',
                subject: '',
                priority: 'Medium',
                deadline: this.getFutureDateString(1),
                hours: 2
            };
            this.clearFormErrors();
            this.showTaskModal = true;
        },

        openEditTaskModal(taskId) {
            const task = this.tasks.find(t => t.id === taskId);
            if (!task) return;

            this.editingTaskId = taskId;
            this.taskForm = {
                name: task.name,
                subject: task.subject,
                priority: task.priority,
                deadline: task.deadline,
                hours: task.hours
            };
            this.clearFormErrors();
            this.showTaskModal = true;
        },

        clearFormErrors() {
            this.formErrors = { name: '', subject: '', deadline: '', hours: '' };
        },

        handleTaskSubmit() {
            this.clearFormErrors();
            let hasErrors = false;

            // Simple validation
            if (!this.taskForm.name.trim()) {
                this.formErrors.name = 'Task Title is required.';
                hasErrors = true;
            }
            if (!this.taskForm.subject.trim()) {
                this.formErrors.subject = 'Subject name is required.';
                hasErrors = true;
            }
            if (!this.taskForm.deadline) {
                this.formErrors.deadline = 'Deadline date is required.';
                hasErrors = true;
            } else if (this.taskForm.deadline < this.todayDateString) {
                this.formErrors.deadline = 'Deadline cannot be in the past.';
                hasErrors = true;
            }
            if (this.taskForm.hours <= 0 || this.taskForm.hours > 24) {
                this.formErrors.hours = 'Hours must be between 0.5 and 24.';
                hasErrors = true;
            }

            if (hasErrors) return;

            if (this.editingTaskId) {
                // Edit
                const idx = this.tasks.findIndex(t => t.id === this.editingTaskId);
                if (idx > -1) {
                    this.tasks[idx] = {
                        ...this.tasks[idx],
                        name: this.taskForm.name.trim(),
                        subject: this.taskForm.subject.trim().toUpperCase(),
                        priority: this.taskForm.priority,
                        deadline: this.taskForm.deadline,
                        hours: this.taskForm.hours
                    };
                    this.showToast('Task updated successfully!');
                }
            } else {
                // Add
                const newTask = {
                    id: Date.now().toString(),
                    name: this.taskForm.name.trim(),
                    subject: this.taskForm.subject.trim().toUpperCase(),
                    priority: this.taskForm.priority,
                    deadline: this.taskForm.deadline,
                    hours: this.taskForm.hours,
                    completed: false
                };
                this.tasks.push(newTask);
                this.showToast('New task added successfully!');
            }

            this.showTaskModal = false;
        },

        toggleTaskStatus(taskId) {
            const idx = this.tasks.findIndex(t => t.id === taskId);
            if (idx > -1) {
                this.tasks[idx].completed = !this.tasks[idx].completed;
                const msg = this.tasks[idx].completed ? 'Task completed! Good job!' : 'Task set to pending.';
                this.showToast(msg);
            }
        },

        deleteTask(taskId) {
            const idx = this.tasks.findIndex(t => t.id === taskId);
            if (idx > -1) {
                const deleted = this.tasks[idx];
                this.deletedBackup = { task: deleted, index: idx };
                
                this.tasks.splice(idx, 1);
                this.showToast(`Deleted task: "${deleted.name}"`, 'Undo', this.undoDelete);
            }
        },

        undoDelete() {
            if (this.deletedBackup) {
                const { task, index } = this.deletedBackup;
                this.tasks.splice(index, 0, task);
                this.deletedBackup = null;
                this.showToast('Restored deleted task.');
            }
        },

        // Sorting Table
        setSortColumn(colName) {
            if (this.sortColumn === colName) {
                this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc';
            } else {
                this.sortColumn = colName;
                this.sortDir = 'asc';
            }
        },

        getSortIndicator(colName) {
            if (this.sortColumn === colName) {
                return this.sortDir === 'asc' ? '&uarr;' : '&darr;';
            }
            return '';
        },

        // Styling helpers
        getPriorityBadgeStyle(priority) {
            let bg = 'var(--badge-med)';
            let txt = 'var(--badge-med-txt)';
            if (priority === 'High') {
                bg = 'var(--badge-high)';
                txt = 'var(--badge-high-txt)';
            } else if (priority === 'Low') {
                bg = 'var(--badge-low)';
                txt = 'var(--badge-low-txt)';
            }
            return { backgroundColor: bg, color: txt };
        },

        getProductivityLevel() {
            if (this.completedPercentage >= 80) return 'Exceptional';
            if (this.completedPercentage >= 50) return 'Productive';
            return 'Neutral';
        },

        getProductivityBadgeClass() {
            if (this.completedPercentage >= 80) return 'text-success';
            if (this.completedPercentage >= 50) return ''; // default
            return 'text-muted';
        },

        formatDeadlineDate(deadlineStr) {
            const d = new Date(deadlineStr);
            return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
        },

        // Study Planner algorithms
        generateDailyPlan() {
            const limit = this.plannerSettings.dailyHoursLimit;
            const strategy = this.plannerSettings.allocationStrategy;
            let pending = this.tasks.filter(t => !t.completed);

            if (pending.length === 0) {
                this.showToast('No pending tasks to schedule.');
                return;
            }

            // Sort logic
            if (strategy === 'deadline') {
                pending.sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
            } else {
                const w = { High: 3, Medium: 2, Low: 1 };
                pending.sort((a, b) => w[b.priority] - w[a.priority]);
            }

            this.plannerSettings.activePlanType = 'daily';
            this.dailyPlanTimeline = [];
            this.dailyPlanAllocatedHours = 0;

            let currentHour = 9;
            let currentMin = 0;

            const formatTime = (h, m) => {
                const amp = h >= 12 ? 'PM' : 'AM';
                const fHour = h % 12 === 0 ? 12 : h % 12;
                const fMin = m < 10 ? '0' + m : m;
                return `${fHour}:${fMin} ${amp}`;
            };

            for (let i = 0; i < pending.length; i++) {
                const t = pending[i];
                if (this.dailyPlanAllocatedHours >= limit) break;

                const studyHours = Math.min(t.hours, limit - this.dailyPlanAllocatedHours);
                this.dailyPlanAllocatedHours += studyHours;

                const endHour = currentHour + Math.floor((currentMin + studyHours * 60) / 60);
                const endMin = (currentMin + studyHours * 60) % 60;

                this.dailyPlanTimeline.push({
                    isBreak: false,
                    timeString: `${formatTime(currentHour, currentMin)} - ${formatTime(endHour, endMin)}`,
                    name: t.name,
                    subject: t.subject,
                    estHours: t.hours,
                    allocatedHours: studyHours
                });

                currentHour = endHour;
                currentMin = endMin;

                // Add break
                if (this.dailyPlanAllocatedHours < limit) {
                    const breakEndHour = currentHour + Math.floor((currentMin + 15) / 60);
                    const breakEndMin = (currentMin + 15) % 60;

                    this.dailyPlanTimeline.push({
                        isBreak: true,
                        timeString: `${formatTime(currentHour, currentMin)} - ${formatTime(breakEndHour, breakEndMin)}`,
                        name: '☕ Short Recharge Break',
                        desc: 'Stretch, hydrate, clear your mind.'
                    });

                    currentHour = breakEndHour;
                    currentMin = breakEndMin;
                }
            }

            this.showToast('Daily study plan generated!');
        },

        generateWeeklyPlan() {
            const limit = this.plannerSettings.dailyHoursLimit;
            const startDay = this.plannerSettings.weeklyStartDay;
            const strategy = this.plannerSettings.allocationStrategy;
            let pending = this.tasks.filter(t => !t.completed);

            if (pending.length === 0) {
                this.showToast('No pending tasks to schedule.');
                return;
            }

            // Sort strategy
            if (strategy === 'deadline') {
                pending.sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
            } else {
                const w = { High: 3, Medium: 2, Low: 1 };
                pending.sort((a, b) => w[b.priority] - w[a.priority]);
            }

            let days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
            if (startDay === 'Sunday') {
                days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            }
            this.plannerSettings.weekdays = days;

            // Initialize weekly calendar container
            const calendar = {};
            days.forEach(day => {
                calendar[day] = { tasks: [], hours: 0 };
            });

            const weekdayMapping = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

            pending.forEach(task => {
                // Try scheduling on target weekday before task deadline
                const dDate = new Date(task.deadline);
                const dlDay = weekdayMapping[dDate.getDay()];
                
                let assignedDay = null;
                let minHours = Infinity;

                const dlIdx = days.indexOf(dlDay);
                if (dlIdx !== -1) {
                    for (let i = 0; i <= dlIdx; i++) {
                        const day = days[i];
                        if (calendar[day].hours < limit && calendar[day].hours < minHours) {
                            minHours = calendar[day].hours;
                            assignedDay = day;
                        }
                    }
                }

                // If days before deadline are full, choose any free day this week
                if (!assignedDay) {
                    minHours = Infinity;
                    days.forEach(day => {
                        if (calendar[day].hours < limit && calendar[day].hours < minHours) {
                            minHours = calendar[day].hours;
                            assignedDay = day;
                        }
                    });
                }

                if (assignedDay) {
                    const timeAllocated = Math.min(task.hours, limit - calendar[assignedDay].hours);
                    calendar[assignedDay].tasks.push({
                        name: task.name,
                        subject: task.subject,
                        priority: task.priority,
                        hours: timeAllocated
                    });
                    calendar[assignedDay].hours += timeAllocated;
                }
            });

            this.weeklyPlan = calendar;
            this.plannerSettings.activePlanType = 'weekly';
            this.plannerSettings.printDateText = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
            
            this.showToast('Weekly study plan generated!');
        },

        getWeeklyDayHours(day) {
            return this.weeklyPlan[day] ? this.weeklyPlan[day].hours.toFixed(1) : '0.0';
        },

        getWeeklyTaskPriorityClass(priority) {
            if (priority === 'High') return 'high-p';
            if (priority === 'Medium') return 'med-p';
            return 'low-p';
        },

        printWeeklyPlan() {
            window.print();
        },

        // Pomodoro Timer controls
        setTimerMode(mode) {
            this.pauseTimer();
            this.timer.currentMode = mode;
            this.timer.minutes = TIMER_MODES[mode];
            this.timer.seconds = 0;
        },

        toggleTimer() {
            if (this.timer.isRunning) {
                this.pauseTimer();
            } else {
                this.startTimer();
            }
        },

        startTimer() {
            this.timer.isRunning = true;
            this.timer.intervalId = setInterval(() => {
                if (this.timer.seconds === 0) {
                    if (this.timer.minutes === 0) {
                        this.timerComplete();
                        return;
                    }
                    this.timer.minutes--;
                    this.timer.seconds = 59;
                } else {
                    this.timer.seconds--;
                }
            }, 1000);
        },

        pauseTimer() {
            this.timer.isRunning = false;
            clearInterval(this.timer.intervalId);
            this.timer.intervalId = null;
        },

        resetTimer() {
            this.pauseTimer();
            this.timer.minutes = TIMER_MODES[this.timer.currentMode];
            this.timer.seconds = 0;
        },

        formatTimer(m, s) {
            const mins = m < 10 ? '0' + m : m;
            const secs = s < 10 ? '0' + s : s;
            return `${mins}:${secs}`;
        },

        getTimerStatusLabel() {
            if (this.timer.currentMode === 'work') return 'Time to Focus!';
            if (this.timer.currentMode === 'short') return 'Take a Quick Break';
            return 'Restore Your Energy';
        },

        timerComplete() {
            this.pauseTimer();
            this.playSynthBeep();
            
            const title = this.timer.currentMode === 'work' ? 'Focus Session Ended!' : 'Break Finished!';
            const msg = this.timer.currentMode === 'work' ? 'Time for a brief recharge break.' : 'Ready to start another focus session?';
            this.showToast(`${title} ${msg}`);
            
            if (this.timer.currentMode === 'work') {
                this.setTimerMode('short');
            } else {
                this.setTimerMode('work');
            }
        },

        playSynthBeep() {
            try {
                const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
                const beep = (offset, freq, dur) => {
                    const osc = audioCtx.createOscillator();
                    const gain = audioCtx.createGain();
                    osc.connect(gain);
                    gain.connect(audioCtx.destination);
                    osc.frequency.value = freq;
                    gain.gain.setValueAtTime(0.15, audioCtx.currentTime + offset);
                    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + offset + dur);
                    osc.start(audioCtx.currentTime + offset);
                    osc.stop(audioCtx.currentTime + offset + dur);
                };
                beep(0, 523.25, 0.2); // C5
                beep(0.25, 659.25, 0.2); // E5
                beep(0.5, 783.99, 0.4); // G5
            } catch (e) {
                console.error(e);
            }
        },

        // Shneiderman's Interactive Demo Modal Trigger
        showRuleDemo(ruleNo) {
            const ruleData = {
                1: {
                    number: 1,
                    title: 'Strive for Consistency',
                    description: 'Interfaces are predictable when they share visual formatting. In StudyFlow, page tabs, buttons, fonts, and data cards utilize a uniform structure. The Theme variables transition all pages smoothly to sage green (Calm), gray (Focus), or deep blue (Dark).',
                    howToTest: 'Click the Calm, Focus, and Dark theme selectors in the sidebar. Notice how the visual aesthetics transition instantly, keeping contrast ratios consistent.'
                },
                2: {
                    number: 2,
                    title: 'Enable Shortcuts',
                    description: 'Frequent users need shortcuts. Keyboard shortcuts allow users to navigate tabs and invoke primary dialogues without clicking mouse buttons.',
                    howToTest: 'Press Alt + 1, Alt + 2, Alt + 3, or Alt + 4 on your keyboard to navigate between pages. Try Alt + N to open the Task Modal or Alt + T to view the Focus Timer.'
                },
                3: {
                    number: 3,
                    title: 'Offer Informative Feedback',
                    description: 'Every action must produce a noticeable visual change. StudyFlow notifies you using green toasts, status badges, progress circle animations, and checkmark effects.',
                    howToTest: 'Go to "Task Management" and check a task. Observe the circular progress card in the Dashboard animate its value immediately, and see the success toast slide up!'
                },
                4: {
                    number: 4,
                    title: 'Dialogs Yield Closure',
                    description: 'Beginning, middle, and end. Dialog sequences should lead to a clear outcome so users know when their task is done.',
                    howToTest: 'Go to "Study Planner", configure your study limit hours, and click "Generate Weekly Plan". Watch the scheduler transform into a printable timetable card.'
                },
                5: {
                    number: 5,
                    title: 'Simple Error Handling',
                    description: 'Systems should prevent errors before they happen. Form validation ensures users input correct subjects, title limits, and deadlines prior to saving.',
                    howToTest: 'Open the "Add Task" modal. Try leaving the title empty or selecting a past date as a deadline. The form will show inline warnings and block save attempts.'
                },
                6: {
                    number: 6,
                    title: 'Permit Easy Reversal',
                    description: 'Users need a safety net. Designing simple pathways to undo actions reduces anxiety and improves trust in the interface.',
                    howToTest: 'Delete any study task on the list. Immediately, a toast pops up in the bottom-right corner. Click "Undo" to restore your deleted task in its original position.'
                },
                7: {
                    number: 7,
                    title: 'Support Internal Locus of Control',
                    description: 'Give users control over the system. Let them filter, sort, edit, and reorganize their information instead of forcing rigid displays.',
                    howToTest: 'Click on the "Subject", "Priority", or "Deadline" column headers in the tasks table. Notice how you control the sorting direction dynamically.'
                },
                8: {
                    number: 8,
                    title: 'Reduce Short-Term Memory Load',
                    description: 'Do not make users remember details across sections. Key stats (Totals, Progress charts) are kept clearly visible on the top-level dashboard.',
                    howToTest: 'Look at the top stat cards on the Dashboard. It instantly aggregates active counts so you do not have to count them manually on the task list.'
                }
            };
            this.selectedRuleDemo = ruleData[ruleNo] || ruleData[1];
            this.showRuleModal = true;
        },

        // ChartJS Rendering Core
        renderCharts() {
            const total = this.tasks.length;
            const canvasSub = document.getElementById('subjectChart');
            const canvasPri = document.getElementById('priorityChart');
            
            if (total === 0 || !canvasSub || !canvasPri) return;

            const colors = THEME_CHART_COLORS[this.theme] || THEME_CHART_COLORS.calm;
            Chart.defaults.color = colors.text;
            Chart.defaults.font.family = "'Inter', sans-serif";

            // Subject Chart calculations
            const subjectsObj = {};
            this.tasks.forEach(t => {
                subjectsObj[t.subject] = (subjectsObj[t.subject] || 0) + 1;
            });
            const subLabels = Object.keys(subjectsObj);
            const subValues = Object.values(subjectsObj);

            if (this.subjectChartInstance) this.subjectChartInstance.destroy();
            this.subjectChartInstance = new Chart(canvasSub, {
                type: 'doughnut',
                data: {
                    labels: subLabels,
                    datasets: [{
                        data: subValues,
                        backgroundColor: colors.palette,
                        borderColor: colors.border,
                        borderWidth: 2
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: { boxWidth: 10, padding: 12 }
                        }
                    },
                    cutout: '60%'
                }
            });

            // Priority Chart calculations
            const prioObj = { High: 0, Medium: 0, Low: 0 };
            this.tasks.forEach(t => {
                if (prioObj.hasOwnProperty(t.priority)) prioObj[t.priority]++;
            });

            if (this.priorityChartInstance) this.priorityChartInstance.destroy();
            this.priorityChartInstance = new Chart(canvasPri, {
                type: 'bar',
                data: {
                    labels: ['High', 'Medium', 'Low'],
                    datasets: [{
                        data: [prioObj.High, prioObj.Medium, prioObj.Low],
                        backgroundColor: [colors.danger, colors.accent, colors.success],
                        borderColor: colors.border,
                        borderWidth: 1,
                        borderRadius: 5
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: { stepSize: 1 },
                            grid: { color: this.theme === 'calm' ? '#e9ece9' : 'rgba(255,255,255,0.05)' }
                        },
                        x: { grid: { display: false } }
                    }
                }
            });
        },

        // Helper date generator
        getFutureDateString(daysOffset) {
            const d = new Date();
            d.setDate(d.getDate() + daysOffset);
            return d.toISOString().split('T')[0];
        },

        // Keyboard Shortcuts handler
        setupKeyboardShortcuts(e) {
            const tag = document.activeElement.tagName;
            if (tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA') {
                if (e.key === 'Escape') {
                    this.showTaskModal = false;
                    this.showTimerModal = false;
                    this.showShortcutsModal = false;
                    this.showRuleModal = false;
                }
                return;
            }

            if (e.altKey) {
                switch (e.key.toLowerCase()) {
                    case '1':
                        e.preventDefault();
                        this.switchTab('dashboard');
                        break;
                    case '2':
                        e.preventDefault();
                        this.switchTab('tasks');
                        break;
                    case '3':
                        e.preventDefault();
                        this.switchTab('planner');
                        break;
                    case '4':
                        e.preventDefault();
                        this.switchTab('about');
                        break;
                    case 'n':
                        e.preventDefault();
                        this.openAddTaskModal();
                        break;
                    case 't':
                        e.preventDefault();
                        this.showTimerModal = !this.showTimerModal;
                        break;
                    case 'c':
                        e.preventDefault();
                        this.setTheme('calm');
                        break;
                    case 'f':
                        e.preventDefault();
                        this.setTheme('focus');
                        break;
                    case 'd':
                        e.preventDefault();
                        this.setTheme('dark');
                        break;
                    case '/':
                    case '?':
                        e.preventDefault();
                        this.showShortcutsModal = true;
                        break;
                }
            }

            if (e.key === 'Escape') {
                this.showTaskModal = false;
                this.showTimerModal = false;
                this.showShortcutsModal = false;
                this.showRuleModal = false;
            }
        }
    },

    mounted() {
        // Load settings from storage
        const saved = localStorage.getItem('studyflow_tasks');
        if (saved) {
            this.tasks = JSON.parse(saved);
        } else {
            // Seed defaults
            this.tasks = [
                { id: '1', name: 'Prepare ITT588 Presentation Slides', subject: 'ITT588', priority: 'High', deadline: this.getFutureDateString(2), hours: 3, completed: false },
                { id: '2', name: 'Study JavaScript Closures & Event Loop', subject: 'ITT588', priority: 'Medium', deadline: this.getFutureDateString(3), hours: 2, completed: true },
                { id: '3', name: 'Design Website Wireframe Mockups', subject: 'DES600', priority: 'Low', deadline: this.getFutureDateString(5), hours: 4, completed: false },
                { id: '4', name: 'Complete Database normalization questions', subject: 'ITS500', priority: 'High', deadline: this.getFutureDateString(1), hours: 1.5, completed: false }
            ];
            localStorage.setItem('studyflow_tasks', JSON.stringify(this.tasks));
        }

        const savedTheme = localStorage.getItem('studyflow_theme');
        if (savedTheme) {
            this.theme = savedTheme;
        }
        document.documentElement.setAttribute('data-theme', this.theme);

        // Date Display setup
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        this.currentDateText = new Date().toLocaleDateString('en-US', options);
        this.todayDateString = new Date().toISOString().split('T')[0];

        // Register global keyboard listeners
        document.addEventListener('keydown', this.setupKeyboardShortcuts);

        // Slide carousel setup
        setInterval(() => {
            this.activeTipIndex = (this.activeTipIndex + 1) % 3;
        }, 12000);

        // Wait for next tick to guarantee canvas elements are rendered
        this.$nextTick(() => {
            this.renderCharts();
        });
    }
}).mount('#app');
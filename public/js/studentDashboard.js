/* =================================================================
   IIT-JU Student Dashboard — JS
   Read-only: View batch schedule, current + future only
   ================================================================= */

const API_BASE_URL = window.location.origin;
let dashboardData = null;

// ─────────────────────────────────────────────
//  BOOTSTRAP
// ─────────────────────────────────────────────
async function loadDashboard() {
    try {
        const token = localStorage.getItem('authToken');
        if (!token) {
            window.location.href = '/pages/login.html';
            return;
        }

        const response = await fetch(`${API_BASE_URL}/api/schedule/dashboard`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            if (response.status === 401) {
                localStorage.clear();
                window.location.href = '/pages/login.html';
                return;
            }
            throw new Error('Failed to load dashboard');
        }

        const result = await response.json();

        if (result.success) {
            dashboardData = result.data;
            renderDashboard();
        } else {
            throw new Error(result.error);
        }
    } catch (error) {
        console.error('Error loading dashboard:', error);
        showToast('Failed to load schedule. Please refresh.', 'error');
    }
}

// ─────────────────────────────────────────────
//  RENDER
// ─────────────────────────────────────────────
function renderDashboard() {
    if (dashboardData.user?.role === 'student') {
        document.getElementById('userName').textContent = dashboardData.user.name || 'N/A';
        document.getElementById('userBatch').textContent = dashboardData.user.batch || 'N/A';
        document.getElementById('userSemester').textContent = dashboardData.user.semester || 'N/A';
        document.getElementById('userRollNo').textContent = dashboardData.user.rollNo || 'N/A';
    }

    if (dashboardData.currentDate) {
        const d = new Date(dashboardData.currentDate + 'T00:00:00');
        document.getElementById('currentDate').textContent = d.toLocaleDateString('en-BD', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
        });
    }

    renderTableHeaders();
    renderScheduleGrid();
}

function renderTableHeaders() {
    const thead = document.getElementById('tableHeader');
    if (!thead || !dashboardData.timeslots) return;

    const headerRow = document.createElement('tr');

    const dateHeader = document.createElement('th');
    dateHeader.textContent = 'Date';
    dateHeader.style.minWidth = '82px';
    dateHeader.style.position = 'sticky';
    dateHeader.style.left = '0';
    dateHeader.style.zIndex = '11';
    headerRow.appendChild(dateHeader);

    dashboardData.timeslots.forEach(timeslot => {
        const th = document.createElement('th');
        th.textContent = timeslot.label;
        th.style.minWidth = '130px';
        th.style.textAlign = 'center';
        headerRow.appendChild(th);
    });

    thead.innerHTML = '';
    thead.appendChild(headerRow);
}

function renderScheduleGrid() {
    const tbody = document.getElementById('scheduleBody');
    tbody.innerHTML = '';

    const today = dashboardData.currentDate;

    if (!dashboardData.gridData || dashboardData.gridData.length === 0) {
        tbody.innerHTML = `<tr><td colspan="${(dashboardData.timeslots?.length || 5) + 1}" class="loading-cell">
            No classes scheduled for your batch in the next 30 days.
        </td></tr>`;
        return;
    }

    const timeslots = dashboardData.timeslots;

    dashboardData.gridData.forEach(row => {
        const tr = document.createElement('tr');

        const dateCell = document.createElement('td');
        dateCell.className = 'date-cell';
        const rowDate = new Date(row.date + 'T00:00:00');
        const isToday = row.date === today;

        if (isToday) {
            tr.classList.add('current-day-row');
            dateCell.classList.add('current-day');
        }

        const dayName = rowDate.toLocaleDateString('en-US', { weekday: 'short' });
        const dayDate = rowDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const day = rowDate.getDay();
        const isWeekend = day === 5 || day === 6; // 5 = Friday, 6 = Saturday

        dateCell.innerHTML = `<strong>${dayName}</strong><br><span style="font-size:0.7rem">${dayDate}</span>`;
        if (isToday) {
            dateCell.innerHTML += `<br><span style="font-size:0.6rem;color:#8c6a00;font-weight:700">TODAY</span>`;
        }
        tr.appendChild(dateCell);

        const hasAnySchedule = timeslots.some(ts => row.slots[ts.slotNo]);

        timeslots.forEach(timeslot => {
            const td = document.createElement('td');
            const schedule = row.slots[timeslot.slotNo];

            const slotCard = document.createElement('div');
            slotCard.className = 'slot-card';

            if (isWeekend) {
                slotCard.classList.add('weekend-slot');
                slotCard.innerHTML = `<span class="empty-text">Weekend</span>`;
            } else if (schedule) {
                const isExam = schedule.scheduleType === 'exam';
                slotCard.classList.add('occupied');
                if (isExam) slotCard.classList.add('exam-type');

                slotCard.innerHTML = `
                    <div class="course-code">${schedule.courseCode}</div>
                    <div class="course-title" title="${schedule.courseTitle}">${schedule.courseTitle}</div>
                    <div class="room">📍 ${schedule.roomNumber}</div>
                    <div class="type-badge">${isExam ? '📝 Exam' : '📖 Class'}</div>
                `;
                slotCard.onclick = () => showClassDetails(schedule, row.date, timeslot);
            } else {
                slotCard.classList.add('empty');
                slotCard.innerHTML = hasAnySchedule
                    ? `<span class="empty-text">Free</span>`
                    : `<span class="empty-text">—</span>`;
                slotCard.onclick = () => showEmptySlotInfo(row.date, timeslot);
            }

            td.appendChild(slotCard);
            tr.appendChild(td);
        });

        tbody.appendChild(tr);
    });
}

// ─────────────────────────────────────────────
//  DETAILS PANEL
// ─────────────────────────────────────────────
function showClassDetails(schedule, date, timeslot) {
    const detailsPanel = document.getElementById('detailsContent');
    if (!detailsPanel) return;

    const dateObj = new Date(date + 'T00:00:00');
    const isExam = schedule.scheduleType === 'exam';

    detailsPanel.innerHTML = `
        <div class="detail-item">
            <div class="detail-label">Course Code</div>
            <div class="detail-value">${schedule.courseCode || 'N/A'}</div>
        </div>
        <div class="detail-item">
            <div class="detail-label">Course Name</div>
            <div class="detail-value">${schedule.courseTitle || 'N/A'}</div>
        </div>
        <div class="detail-item">
            <div class="detail-label">Type</div>
            <div class="detail-value">${isExam ? '📝 Exam' : '📖 Class'}</div>
        </div>
        <div class="detail-item">
            <div class="detail-label">Teacher</div>
            <div class="detail-value">👨‍🏫 ${schedule.teacherName || 'N/A'}</div>
        </div>
        <div class="detail-item">
            <div class="detail-label">Classroom</div>
            <div class="detail-value">📍 ${schedule.roomNumber || 'N/A'}</div>
        </div>
        <div class="detail-item">
            <div class="detail-label">Date</div>
            <div class="detail-value">${dateObj.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
        </div>
        <div class="detail-item">
            <div class="detail-label">Time Slot</div>
            <div class="detail-value">⏰ ${timeslot ? timeslot.label : 'N/A'}</div>
        </div>
    `;
}

function showEmptySlotInfo(date, timeslot) {
    const detailsPanel = document.getElementById('detailsContent');
    if (!detailsPanel) return;

    const dateObj = new Date(date + 'T00:00:00');
    detailsPanel.innerHTML = `
        <div class="detail-item">
            <div class="detail-label">Status</div>
            <div class="detail-value" style="color:#4a8c6b">✅ No Class Scheduled</div>
        </div>
        <div class="detail-item">
            <div class="detail-label">Date</div>
            <div class="detail-value">${dateObj.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
        </div>
        <div class="detail-item">
            <div class="detail-label">Time</div>
            <div class="detail-value">${timeslot ? timeslot.label : 'N/A'}</div>
        </div>
        <div class="detail-item">
            <div class="detail-label">Info</div>
            <div class="detail-value" style="font-size:0.82rem;color:#6b84c7">This period is free. Use it for self-study.</div>
        </div>
    `;
}

// ─────────────────────────────────────────────
//  SEARCH FILTER
// ─────────────────────────────────────────────
function filterSchedule() {
    const searchTerm = document.getElementById('searchFilter')?.value.toLowerCase() || '';
    const rows = document.querySelectorAll('#scheduleBody tr');

    rows.forEach(row => {
        const cells = row.querySelectorAll('.slot-card');
        let shouldShow = searchTerm === '';

        if (!shouldShow) {
            cells.forEach(cell => {
                if (cell.classList.contains('occupied')) {
                    if (cell.textContent.toLowerCase().includes(searchTerm)) {
                        shouldShow = true;
                    }
                }
            });
        }

        row.style.display = shouldShow ? '' : 'none';
    });
}

// ─────────────────────────────────────────────
//  TOAST
// ─────────────────────────────────────────────
function showToast(message, type = 'info') {
    document.querySelectorAll('.toast').forEach(t => t.remove());
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 4000);
}

// ─────────────────────────────────────────────
//  LOGOUT
// ─────────────────────────────────────────────
function logout() {
    localStorage.clear();
    window.location.href = '/pages/login.html';
}

// ─────────────────────────────────────────────
//  INIT
// ─────────────────────────────────────────────
document.getElementById('searchFilter')?.addEventListener('input', filterSchedule);

loadDashboard();
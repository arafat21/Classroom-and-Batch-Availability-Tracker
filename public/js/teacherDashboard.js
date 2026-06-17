/* =================================================================
   IIT-JU Teacher Dashboard — Complete JS
   Features: Grid, Schedule New, Reschedule, Cancel, Available Slots
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
        showToast('Failed to load dashboard data. Please refresh.', 'error');
    }
}

// ─────────────────────────────────────────────
//  RENDER DASHBOARD
// ─────────────────────────────────────────────
function renderDashboard() {
    // Update user info
    if (dashboardData.user?.role === 'teacher') {
        document.getElementById('userName').textContent = dashboardData.user.name || 'N/A';
        document.getElementById('userDepartment').textContent = dashboardData.user.department || 'IIT';
    }

    // Update current date
    if (dashboardData.currentDate) {
        const currentDate = new Date(dashboardData.currentDate + 'T00:00:00');
        document.getElementById('currentDate').textContent = currentDate.toLocaleDateString('en-BD', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
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
            No classes scheduled for today and future dates.
        </td></tr>`;
        return;
    }

    const timeslots = dashboardData.timeslots;

    dashboardData.gridData.forEach(row => {
        const tr = document.createElement('tr');

        // Date cell
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

        // Time slot cells
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
                    ${schedule.semester ? `<div class="semester">Sem ${schedule.semester}</div>` : ''}
                `;
                slotCard.onclick = () => showClassDetails(schedule, row.date, timeslot);
            } else {
                slotCard.classList.add('empty');
                slotCard.innerHTML = hasAnySchedule
                    ? `<span class="empty-text">Free</span>`
                    : `<span class="empty-text">—</span>`;
                slotCard.onclick = () => showEmptySlotPanel(row.date, timeslot);
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
    const today = dashboardData.currentDate;
    const isFutureOrToday = date >= today;
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
            <div class="detail-label">Semester</div>
            <div class="detail-value">Semester ${schedule.semester || 'N/A'}</div>
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
        ${isFutureOrToday ? `
            <button class="reschedule-btn" onclick="openRescheduleModal(${schedule.scheduleId}, '${schedule.courseCode}', '${schedule.courseTitle}', '${date}')">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="23,4 23,10 17,10"/><polyline points="1,20 1,14 7,14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
                Reschedule Class
            </button>
            <button class="cancel-btn" onclick="cancelSchedule(${schedule.scheduleId}, '${schedule.courseCode}', '${date}')">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
                Cancel Class
            </button>
        ` : `
            <div class="detail-item" style="color:#8fa0cc;font-style:italic;text-align:center;padding:10px 0;font-size:0.8rem">
                ⏰ Past classes cannot be modified
            </div>
        `}
    `;
}

function showEmptySlotPanel(date, timeslot) {
    const detailsPanel = document.getElementById('detailsContent');
    if (!detailsPanel) return;

    const dateObj = new Date(date + 'T00:00:00');
    detailsPanel.innerHTML = `
        <div class="detail-item">
            <div class="detail-label">Status</div>
            <div class="detail-value" style="color:#4a8c6b">✅ Available Slot</div>
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
            <div class="detail-value" style="font-size:0.82rem;color:#6b84c7">No class scheduled here. Click below to schedule one.</div>
        </div>
        <button class="schedule-btn" onclick="openScheduleModal('${date}', ${timeslot.timeslotId})">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Schedule Class Here
        </button>
    `;
}

// ─────────────────────────────────────────────
//  SCHEDULE NEW — Step 1: Select Course + Date
// ─────────────────────────────────────────────
function openScheduleNewModal() {
    const courses = dashboardData.courses || [];
    if (courses.length === 0) {
        showToast('No courses assigned to you.', 'error');
        return;
    }

    const today = dashboardData.currentDate;
    let courseOptions = '<option value="">— Select Course —</option>';
    courses.forEach(c => {
        courseOptions += `<option value="${c.course_id}">${c.course_code} — ${c.course_title} (Sem ${c.semester_no})</option>`;
    });

    injectModal(`
        <div class="modal-header">
            <h3>📅 Schedule New Class</h3>
            <button class="modal-close" onclick="closeModal()">×</button>
        </div>
        <div class="form-group">
            <label>Course</label>
            <select id="newCourseId">${courseOptions}</select>
        </div>
        <div class="form-group">
            <label>Date</label>
            <input type="date" id="newScheduleDate" value="${today}" min="${today}">
        </div>
        <div class="form-group">
            <label>Schedule Type</label>
            <select id="newScheduleType">
                <option value="class">📖 Class</option>
                <option value="exam">📝 Exam</option>
            </select>
        </div>
        <div id="slotsArea"></div>
        <div class="modal-actions">
            <button class="btn-secondary" onclick="closeModal()">Cancel</button>
            <button class="btn-primary" id="checkSlotsBtn" onclick="loadAvailableSlots()">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                Check Available Slots
            </button>
        </div>
    `);
}

// Pre-open scheduling modal with date and timeslot pre-filled (from empty slot click)
async function openScheduleModal(date, timeslotId) {
    injectModal(`
        <div class="modal-header">
            <h3>📅 Schedule New Class</h3>
            <button class="modal-close" onclick="closeModal()">×</button>
        </div>
        <div class="modal-loading"><div class="loading-spinner"></div> Loading available courses...</div>
    `);

    try {
        const token = localStorage.getItem('authToken');
        const res = await fetch(`${API_BASE_URL}/api/schedule/available-courses?date=${date}&timeslotId=${timeslotId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const result = await res.json();

        if (!result.success) throw new Error(result.error);

        const courses = result.data.courses || [];
        if (courses.length === 0) {
            injectModal(`
                <div class="modal-header">
                    <h3>📅 Schedule New Class</h3>
                    <button class="modal-close" onclick="closeModal()">×</button>
                </div>
                <div class="no-slots-msg">
                    ⚠️ No courses can be scheduled. All your assigned courses' batches have conflicts in this timeslot.
                </div>
                <div class="modal-actions">
                    <button class="btn-secondary" onclick="closeModal()">Close</button>
                </div>
            `);
            return;
        }

        let courseOptions = '<option value="">— Select Course —</option>';
        courses.forEach(c => {
            courseOptions += `<option value="${c.course_id}">${c.course_code} — ${c.course_title} (Sem ${c.semester_no})</option>`;
        });

        const tsObj = dashboardData.timeslots.find(ts => ts.timeslotId === timeslotId);
        const tsLabel = tsObj ? tsObj.label : `Slot ${timeslotId}`;

        injectModal(`
            <div class="modal-header">
                <h3>📅 Schedule New Class</h3>
                <button class="modal-close" onclick="closeModal()">×</button>
            </div>
            <div class="form-group">
                <label>Course</label>
                <select id="newCourseId" onchange="autoLoadRoomsForSlot('${date}', ${timeslotId})">${courseOptions}</select>
            </div>
            <div class="form-group">
                <label>Date</label>
                <input type="text" id="newScheduleDate" value="${date}" readonly>
            </div>
            <div class="form-group">
                <label>Time Slot</label>
                <input type="text" value="${tsLabel}" readonly>
                <input type="hidden" id="newTimeslotId" value="${timeslotId}">
            </div>
            <div class="form-group">
                <label>Schedule Type</label>
                <select id="newScheduleType">
                    <option value="class">📖 Class</option>
                    <option value="exam">📝 Exam</option>
                </select>
            </div>
            <div id="slotsArea"></div>
            <div class="modal-actions">
                <button class="btn-secondary" onclick="closeModal()">Cancel</button>
            </div>
        `);
    } catch (error) {
        console.error('Failed to load courses:', error);
        showToast('Error loading available courses.', 'error');
        closeModal();
    }
}

async function autoLoadRoomsForSlot(date, timeslotId) {
    const courseId = document.getElementById('newCourseId')?.value;
    const slotsArea = document.getElementById('slotsArea');
    if (!courseId) {
        slotsArea.innerHTML = '';
        const existing = document.getElementById('confirmScheduleBtn');
        if (existing) existing.remove();
        return;
    }

    slotsArea.innerHTML = `<div class="modal-loading"><div class="loading-spinner"></div> Checking classroom availability...</div>`;

    try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${API_BASE_URL}/api/schedule/available-slots?courseId=${courseId}&date=${date}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const result = await response.json();

        if (!result.success) throw new Error(result.error);

        const slots = result.data.availableSlots || [];
        const currentSlot = slots.find(s => s.timeslot.timeslotId === timeslotId);

        if (!currentSlot || currentSlot.availableClassrooms.length === 0) {
            slotsArea.innerHTML = `<div class="no-slots-msg">
                😔 No classrooms available for this slot.<br>
                <small>All classrooms are booked in this period.</small>
            </div>`;
            return;
        }

        let html = `
            <div style="margin-bottom:8px;font-size:0.75rem;font-weight:700;text-transform:uppercase;letter-spacing:0.4px;color:#4a6fa5">
                Available Classrooms
            </div>
            <div class="room-chips" style="display:flex">
                ${currentSlot.availableClassrooms.map(r =>
                    `<span class="room-chip" onclick="selectRoom(event,${timeslotId},${r.classroom_id},'${r.room_number}')">
                        📍 ${r.room_number}
                    </span>`
                ).join('')}
            </div>
        `;
        slotsArea.innerHTML = html;

        const actions = document.querySelector('.modal-actions');
        if (actions) {
            const existing = document.getElementById('confirmScheduleBtn');
            if (existing) existing.remove();

            const confirmBtn = document.createElement('button');
            confirmBtn.className = 'btn-primary';
            confirmBtn.id = 'confirmScheduleBtn';
            confirmBtn.disabled = true;
            confirmBtn.innerHTML = `
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20,6 9,17 4,12"/></svg>
                Confirm Schedule
            `;
            confirmBtn.onclick = () => {
                const selRoom = document.querySelector('.room-chip.selected-room');
                if (!selRoom) {
                    showToast('Please select a room.', 'error');
                    return;
                }
                const rmId = selRoom.dataset.classroomId;
                submitSchedule(date, timeslotId, parseInt(rmId));
            };
            actions.appendChild(confirmBtn);
        }

    } catch (error) {
        console.error('Error loading rooms:', error);
        slotsArea.innerHTML = `<div class="no-slots-msg">⚠️ ${error.message}</div>`;
    }
}

// ─────────────────────────────────────────────
//  LOAD AVAILABLE SLOTS (API Call)
// ─────────────────────────────────────────────
async function loadAvailableSlots(excludeScheduleId = null) {
    const courseId = document.getElementById('newCourseId')?.value;
    const date = document.getElementById('newScheduleDate')?.value;
    const slotsArea = document.getElementById('slotsArea');

    if (!courseId) {
        showToast('Please select a course first.', 'error');
        return;
    }
    if (!date) {
        showToast('Please select a date first.', 'error');
        return;
    }

    // Weekend Check
    const day = new Date(date).getUTCDay();
    if (day === 5 || day === 6) {
        slotsArea.innerHTML = `<div class="no-slots-msg">⚠️ Cannot schedule classes on weekends (Friday & Saturday).</div>`;
        return;
    }

    slotsArea.innerHTML = `<div class="modal-loading"><div class="loading-spinner"></div> Checking availability...</div>`;

    const checkBtn = document.getElementById('checkSlotsBtn');
    if (checkBtn) checkBtn.disabled = true;

    try {
        const token = localStorage.getItem('authToken');
        let url = `${API_BASE_URL}/api/schedule/available-slots?courseId=${courseId}&date=${date}`;
        if (excludeScheduleId) url += `&excludeScheduleId=${excludeScheduleId}`;

        const response = await fetch(url, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const result = await response.json();

        if (!result.success) throw new Error(result.error);

        const slots = result.data.availableSlots;
        renderSlotPicker(slots, date, excludeScheduleId);

    } catch (error) {
        console.error('Available slots error:', error);
        slotsArea.innerHTML = `<div class="no-slots-msg">⚠️ ${error.message}</div>`;
    } finally {
        if (checkBtn) checkBtn.disabled = false;
    }
}

// Render the slot picker with room chip selection
function renderSlotPicker(slots, date, excludeScheduleId = null) {
    const slotsArea = document.getElementById('slotsArea');
    const checkBtn = document.getElementById('checkSlotsBtn');

    if (!slots || slots.length === 0) {
        slotsArea.innerHTML = `<div class="no-slots-msg">
            😔 No available slots on this date.<br>
            <small>All time periods have teacher, batch, or classroom conflicts.</small>
        </div>`;
        return;
    }

    // Track selection state
    let selectedTimeslotId = null;
    let selectedClassroomId = null;

    // Render slot options
    let html = `<div style="margin-bottom:8px;font-size:0.75rem;font-weight:700;text-transform:uppercase;letter-spacing:0.4px;color:#4a6fa5">
        Available Slots — Select a time, then pick a room
    </div><div class="slot-grid" id="slotGrid">`;

    slots.forEach((item, idx) => {
        const ts = item.timeslot;
        html += `
        <div class="slot-option" id="slotOpt_${ts.timeslotId}" onclick="selectSlot(${ts.timeslotId}, this)">
            <div class="slot-option-header">
                <span class="slot-time-label">🕐 ${ts.label}</span>
                <span class="rooms-label">${item.availableClassrooms.length} room(s) free</span>
            </div>
            <div class="room-chips" id="roomChips_${ts.timeslotId}" style="display:none">
                ${item.availableClassrooms.map(r =>
                    `<span class="room-chip" onclick="selectRoom(event,${ts.timeslotId},${r.classroom_id},'${r.room_number}')">
                        📍 ${r.room_number}
                    </span>`
                ).join('')}
            </div>
        </div>`;
    });
    html += `</div>`;

    slotsArea.innerHTML = html;

    // Replace button with Confirm
    if (checkBtn) {
        checkBtn.textContent = '↺ Recheck';
        checkBtn.disabled = false;
        checkBtn.onclick = () => loadAvailableSlots(excludeScheduleId);
    }

    // Add confirm button to modal actions
    const actions = document.querySelector('.modal-actions');
    if (actions) {
        // Remove existing confirm if any
        const existing = document.getElementById('confirmScheduleBtn');
        if (existing) existing.remove();

        const confirmBtn = document.createElement('button');
        confirmBtn.className = 'btn-primary';
        confirmBtn.id = 'confirmScheduleBtn';
        confirmBtn.disabled = true;
        confirmBtn.innerHTML = `
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20,6 9,17 4,12"/></svg>
            Confirm Schedule
        `;
        confirmBtn.onclick = () => {
            const sel = document.querySelector('.slot-option.selected');
            const selRoom = document.querySelector('.room-chip.selected-room');
            if (!sel || !selRoom) {
                showToast('Please select both a time slot and a room.', 'error');
                return;
            }
            const tsId = sel.dataset.timeslotId;
            const rmId = selRoom.dataset.classroomId;
            if (excludeScheduleId) {
                // Reschedule flow
                submitReschedule(excludeScheduleId, date, tsId, rmId);
            } else {
                // New schedule flow
                submitSchedule(date, parseInt(tsId), parseInt(rmId));
            }
        };
        actions.appendChild(confirmBtn);
    }

    // Expose selection functions to window
    window.selectSlot = function(timeslotId, el) {
        document.querySelectorAll('.slot-option').forEach(o => {
            o.classList.remove('selected');
            const chips = document.getElementById(`roomChips_${o.dataset.slotId}`);
        });
        // hide all room chips
        slots.forEach(s => {
            const chips = document.getElementById(`roomChips_${s.timeslot.timeslotId}`);
            if (chips) chips.style.display = 'none';
        });
        // clear room selection
        document.querySelectorAll('.room-chip').forEach(c => c.classList.remove('selected-room'));

        el.classList.add('selected');
        el.dataset.timeslotId = timeslotId;
        const chips = document.getElementById(`roomChips_${timeslotId}`);
        if (chips) chips.style.display = 'flex';

        selectedTimeslotId = timeslotId;
        selectedClassroomId = null;
        const confirmBtn = document.getElementById('confirmScheduleBtn');
        if (confirmBtn) confirmBtn.disabled = true;
    };

    window.selectRoom = function(event, timeslotId, classroomId, roomNumber) {
        event.stopPropagation();
        document.querySelectorAll('.room-chip').forEach(c => c.classList.remove('selected-room'));
        event.target.classList.add('selected-room');
        event.target.dataset.classroomId = classroomId;
        selectedClassroomId = classroomId;
        selectedTimeslotId = timeslotId;
        const confirmBtn = document.getElementById('confirmScheduleBtn');
        if (confirmBtn) confirmBtn.disabled = false;
    };
}

// ─────────────────────────────────────────────
//  SUBMIT NEW SCHEDULE
// ─────────────────────────────────────────────
async function submitSchedule(date, timeslotId, classroomId) {
    const courseId = document.getElementById('newCourseId')?.value;
    const scheduleType = document.getElementById('newScheduleType')?.value || 'class';

    if (!courseId || !classroomId || !timeslotId || !date) {
        showToast('Please complete all selections.', 'error');
        return;
    }

    const confirmBtn = document.getElementById('confirmScheduleBtn');
    if (confirmBtn) { confirmBtn.disabled = true; confirmBtn.textContent = 'Saving...'; }

    try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${API_BASE_URL}/api/schedule/create`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ courseId, classroomId, timeslotId, scheduleDate: date, scheduleType })
        });

        const result = await response.json();

        if (result.success) {
            closeModal();
            showToast('✅ Class scheduled successfully!', 'success');
            await loadDashboard();
        } else {
            showToast('❌ ' + (result.error || 'Failed to schedule'), 'error');
        }
    } catch (error) {
        console.error('Schedule error:', error);
        showToast('❌ Failed to schedule class.', 'error');
    } finally {
        if (confirmBtn) { confirmBtn.disabled = false; confirmBtn.textContent = 'Confirm Schedule'; }
    }
}

// ─────────────────────────────────────────────
//  CANCEL SCHEDULE
// ─────────────────────────────────────────────
async function cancelSchedule(scheduleId, courseCode, date) {
    const dateObj = new Date(date + 'T00:00:00');
    const formattedDate = dateObj.toLocaleDateString('en-US', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });

    const confirmed = confirm(
        `Cancel this class?\n\n📚 Course: ${courseCode}\n📅 Date: ${formattedDate}\n\nThis action cannot be undone.`
    );
    if (!confirmed) return;

    try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${API_BASE_URL}/api/schedule/${scheduleId}/cancel`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        const result = await response.json();

        if (result.success) {
            showToast('✅ Class cancelled successfully!', 'success');
            await loadDashboard();
        } else {
            showToast('❌ ' + (result.error || 'Failed to cancel'), 'error');
        }
    } catch (error) {
        console.error('Cancel error:', error);
        showToast('❌ Failed to cancel class.', 'error');
    }
}

// ─────────────────────────────────────────────
//  RESCHEDULE — Open Modal
// ─────────────────────────────────────────────
function openRescheduleModal(scheduleId, courseCode, courseTitle, currentDate) {
    const today = dashboardData.currentDate;
    const courses = dashboardData.courses || [];

    // Find course id for preselection
    const course = courses.find(c => c.course_code === courseCode);
    const courseId = course?.course_id;

    injectModal(`
        <div class="modal-header">
            <h3>🔄 Reschedule Class</h3>
            <button class="modal-close" onclick="closeModal()">×</button>
        </div>
        <div class="form-group">
            <label>Course (Preselected)</label>
            <input type="text" value="${courseCode} — ${courseTitle}" readonly id="rescheduleCourseDisplay">
            <input type="hidden" id="newCourseId" value="${courseId || ''}">
        </div>
        <div class="form-group">
            <label>Current Date</label>
            <input type="text" value="${new Date(currentDate + 'T00:00:00').toLocaleDateString('en-US',{weekday:'long',year:'numeric',month:'long',day:'numeric'})}" readonly>
        </div>
        <div class="form-group">
            <label>New Date</label>
            <input type="date" id="newScheduleDate" value="${today}" min="${today}">
        </div>
        <div id="slotsArea"></div>
        <div class="modal-actions">
            <button class="btn-secondary" onclick="closeModal()">Cancel</button>
            <button class="btn-primary" id="checkSlotsBtn" onclick="loadAvailableSlots(${scheduleId})">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                Check Available Slots
            </button>
        </div>
    `);
}

// ─────────────────────────────────────────────
//  SUBMIT RESCHEDULE
// ─────────────────────────────────────────────
async function submitReschedule(scheduleId, date, timeslotId, classroomId) {
    const confirmBtn = document.getElementById('confirmScheduleBtn');
    if (confirmBtn) { confirmBtn.disabled = true; confirmBtn.textContent = 'Rescheduling...'; }

    try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${API_BASE_URL}/api/schedule/${scheduleId}/reschedule`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ classroomId, timeslotId, scheduleDate: date })
        });

        const result = await response.json();

        if (result.success) {
            closeModal();
            showToast('✅ Class rescheduled successfully!', 'success');
            await loadDashboard();
        } else {
            showToast('❌ ' + (result.error || 'Failed to reschedule'), 'error');
        }
    } catch (error) {
        console.error('Reschedule error:', error);
        showToast('❌ Failed to reschedule class.', 'error');
    } finally {
        if (confirmBtn) { confirmBtn.disabled = false; confirmBtn.textContent = 'Confirm Reschedule'; }
    }
}

// ─────────────────────────────────────────────
//  SEARCH FILTER
// ─────────────────────────────────────────────
function filterSchedule() {
    const searchTerm = document.getElementById('searchFilter')?.value.toLowerCase() || '';
    const rows = document.querySelectorAll('#scheduleBody tr');

    rows.forEach(row => {
        const cells = row.querySelectorAll('.slot-card');
        let shouldShow = false;

        if (searchTerm === '') {
            shouldShow = true;
        } else {
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
//  MODAL HELPERS
// ─────────────────────────────────────────────
function injectModal(contentHtml) {
    closeModal(); // remove any existing modal
    const modal = document.createElement('div');
    modal.id = 'scheduleModal';
    modal.className = 'modal';
    modal.innerHTML = `<div class="modal-content">${contentHtml}</div>`;
    modal.addEventListener('click', e => {
        if (e.target === modal) closeModal();
    });
    document.body.appendChild(modal);
}

function closeModal() {
    const modal = document.getElementById('scheduleModal');
    if (modal) modal.remove();
}

// ─────────────────────────────────────────────
//  TOAST
// ─────────────────────────────────────────────
function showToast(message, type = 'info') {
    // Remove existing toasts
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
//  GLOBAL selectRoom (used by inline onclick in room chips)
// ─────────────────────────────────────────────
window.selectRoom = function(event, timeslotId, classroomId, roomNumber) {
    event.stopPropagation();
    document.querySelectorAll('.room-chip').forEach(c => c.classList.remove('selected-room'));
    const chip = event.target.closest ? event.target.closest('.room-chip') : event.target;
    if (chip) {
        chip.classList.add('selected-room');
        chip.dataset.classroomId = classroomId;
    }
    const confirmBtn = document.getElementById('confirmScheduleBtn');
    if (confirmBtn) confirmBtn.disabled = false;
};

// ─────────────────────────────────────────────
//  EVENT LISTENERS & INIT
// ─────────────────────────────────────────────
document.getElementById('searchFilter')?.addEventListener('input', filterSchedule);

loadDashboard();
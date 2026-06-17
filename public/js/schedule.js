/* =================================================================
   IIT-JU Class Scheduler Page — Complete JS
   Features: 30-day Grid view, Course and Room filter, Quick Schedule
   ================================================================= */

const API_BASE_URL = window.location.origin;
let schedulingMetadata = null;
let currentGridData = null;

// ─────────────────────────────────────────────
//  BOOTSTRAP
// ─────────────────────────────────────────────
async function init() {
    try {
        const token = localStorage.getItem('authToken');
        if (!token) {
            window.location.href = '/pages/login.html';
            return;
        }

        // Fetch courses and classrooms
        const response = await fetch(`${API_BASE_URL}/api/schedule/scheduling-data`, {
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
            throw new Error('Failed to load scheduling data');
        }

        const result = await response.json();
        if (result.success) {
            schedulingMetadata = result.data;
            populateFilters();
        } else {
            throw new Error(result.error);
        }
    } catch (error) {
        console.error('Error in init:', error);
        showToast('Failed to load portal configuration. Please refresh.', 'error');
    }
}

// Populate Course and Classroom filter dropdowns
function populateFilters() {
    const courseSelect = document.getElementById('courseSelect');
    const classroomSelect = document.getElementById('classroomSelect');

    if (schedulingMetadata.courses) {
        schedulingMetadata.courses.forEach(c => {
            const opt = document.createElement('option');
            opt.value = c.course_id;
            opt.textContent = `${c.course_code} — ${c.course_title} (Sem ${c.semester_no})`;
            courseSelect.appendChild(opt);
        });
    }

    if (schedulingMetadata.classrooms) {
        schedulingMetadata.classrooms.forEach(r => {
            const opt = document.createElement('option');
            opt.value = r.classroom_id;
            opt.textContent = `Room ${r.room_number}`;
            classroomSelect.appendChild(opt);
        });
    }
}

// ─────────────────────────────────────────────
//  LOAD AVAILABILITY GRID
// ─────────────────────────────────────────────
async function loadAvailabilityGrid() {
    const courseId = document.getElementById('courseSelect').value;
    const classroomId = document.getElementById('classroomSelect').value;
    const container = document.getElementById('gridContainer');

    if (!courseId) {
        // Render empty placeholder
        container.innerHTML = `
            <div class="empty-grid-placeholder">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#b3c6e8" stroke-width="1.5">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                    <line x1="16" y1="2" x2="16" y2="6"/>
                    <line x1="8" y1="2" x2="8" y2="6"/>
                    <line x1="3" y1="10" x2="21" y2="10"/>
                    <circle cx="12" cy="16" r="1.5" fill="#b3c6e8"/>
                </svg>
                <h3>Select a Course to View Available Slots</h3>
                <p>We'll show you a 30-day grid where the teacher, classroom, and batches are free at once.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = `
        <div class="grid-loading">
            <div class="loading-spinner"></div>
            Loading availability grid...
        </div>
    `;

    try {
        const token = localStorage.getItem('authToken');
        const url = `${API_BASE_URL}/api/schedule/availability-grid?courseId=${courseId}&classroomId=${classroomId}`;
        
        const response = await fetch(url, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const result = await response.json();
        if (!result.success) throw new Error(result.error);

        currentGridData = result.data;
        renderGridTable(result.data);
    } catch (error) {
        console.error('Grid load error:', error);
        container.innerHTML = `<div class="error-msg">⚠️ ${error.message}</div>`;
    }
}

// Render the 30-day availability grid table
function renderGridTable(data) {
    const container = document.getElementById('gridContainer');
    container.innerHTML = '';

    const table = document.createElement('table');
    table.className = 'schedule-table';

    // Header
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    
    const dateHeader = document.createElement('th');
    dateHeader.textContent = 'Date';
    dateHeader.style.minWidth = '110px';
    dateHeader.style.position = 'sticky';
    dateHeader.style.left = '0';
    dateHeader.style.zIndex = '11';
    headerRow.appendChild(dateHeader);

    data.timeslots.forEach(ts => {
        const th = document.createElement('th');
        th.textContent = ts.label;
        th.style.minWidth = '150px';
        th.style.textAlign = 'center';
        headerRow.appendChild(th);
    });

    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Body
    const tbody = document.createElement('tbody');

    data.grid.forEach(row => {
        const tr = document.createElement('tr');
        
        const dateCell = document.createElement('td');
        dateCell.className = 'date-cell';
        const dateObj = new Date(row.date + 'T00:00:00');
        const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
        const dayDate = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        dateCell.innerHTML = `<strong>${dayName}</strong><br><span style="font-size:0.75rem">${dayDate}</span>`;
        tr.appendChild(dateCell);

        data.timeslots.forEach(ts => {
            const td = document.createElement('td');
            const slotInfo = row.slots[ts.slotNo];

            const cellCard = document.createElement('div');
            cellCard.className = 'grid-cell-card';

            if (slotInfo.available) {
                cellCard.classList.add('available');
                cellCard.innerHTML = `
                    <div class="status-title">✅ Free</div>
                    <div class="status-sub">${slotInfo.availableRooms.length} room(s) free</div>
                `;
                cellCard.onclick = () => openBookingModal(row.date, ts, slotInfo);
            } else {
                cellCard.classList.add('conflict');
                let reason = 'Unavailable';
                if (slotInfo.isTeacherBusy) {
                    reason = '👨‍🏫 Teacher Conflict';
                } else if (slotInfo.isBatchBusy) {
                    reason = '👥 Batch Conflict';
                } else if (slotInfo.isClassroomBusy) {
                    reason = '📍 Room Conflict';
                }
                cellCard.innerHTML = `
                    <div class="status-title" style="color:#c0392b">${reason}</div>
                `;
            }

            td.appendChild(cellCard);
            tr.appendChild(td);
        });

        tbody.appendChild(tr);
    });

    table.appendChild(tbody);
    container.appendChild(table);
}

// ─────────────────────────────────────────────
//  BOOKING CONFIRMATION MODAL
// ─────────────────────────────────────────────
function openBookingModal(date, timeslot, slotInfo) {
    const courseSelect = document.getElementById('courseSelect');
    const selectedCourseText = courseSelect.options[courseSelect.selectedIndex].text;
    const courseId = courseSelect.value;
    const classroomIdFilter = document.getElementById('classroomSelect').value;

    const dateObj = new Date(date + 'T00:00:00');
    const formattedDate = dateObj.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    let roomSelectionHTML = '';
    if (classroomIdFilter !== 'all') {
        // Pre-selected room
        const room = slotInfo.availableRooms[0];
        roomSelectionHTML = `
            <div class="form-group">
                <label>Classroom</label>
                <input type="text" value="Room ${room.roomNumber}" readonly>
                <input type="hidden" id="modalClassroomId" value="${room.classroomId}">
            </div>
        `;
    } else {
        // Choose room chips
        roomSelectionHTML = `
            <div class="form-group">
                <label>Select Classroom</label>
                <div class="room-chips" style="display:flex; flex-wrap:wrap; gap:6px;">
                    ${slotInfo.availableRooms.map(r =>
                        `<span class="room-chip" onclick="selectModalRoom(event, ${r.classroomId})">
                            📍 Room ${r.roomNumber}
                        </span>`
                    ).join('')}
                </div>
                <input type="hidden" id="modalClassroomId" value="">
            </div>
        `;
    }

    injectModal(`
        <div class="modal-header">
            <h3>📅 Book Time Slot</h3>
            <button class="modal-close" onclick="closeModal()">×</button>
        </div>
        <div class="form-group">
            <label>Course</label>
            <input type="text" value="${selectedCourseText}" readonly>
        </div>
        <div class="form-group">
            <label>Date</label>
            <input type="text" value="${formattedDate}" readonly>
        </div>
        <div class="form-group">
            <label>Time Slot</label>
            <input type="text" value="${timeslot.label}" readonly>
        </div>
        <div class="form-group">
            <label>Schedule Type</label>
            <select id="modalScheduleType">
                <option value="class">📖 Class</option>
                <option value="exam">📝 Exam</option>
            </select>
        </div>
        ${roomSelectionHTML}
        <div class="modal-actions">
            <button class="btn-secondary" onclick="closeModal()">Cancel</button>
            <button class="btn-primary" id="confirmGridBookingBtn" ${classroomIdFilter === 'all' ? 'disabled' : ''} onclick="submitGridBooking('${date}', ${timeslot.timeslotId}, ${courseId})">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20,6 9,17 4,12"/></svg>
                Confirm Booking
            </button>
        </div>
    `);
}

window.selectModalRoom = function(event, classroomId) {
    document.querySelectorAll('.room-chip').forEach(c => c.classList.remove('selected-room'));
    event.target.classList.add('selected-room');
    document.getElementById('modalClassroomId').value = classroomId;
    
    const confirmBtn = document.getElementById('confirmGridBookingBtn');
    if (confirmBtn) confirmBtn.disabled = false;
};

async function submitGridBooking(date, timeslotId, courseId) {
    const classroomId = document.getElementById('modalClassroomId').value;
    const scheduleType = document.getElementById('modalScheduleType').value;

    if (!classroomId) {
        showToast('Please select a classroom.', 'error');
        return;
    }

    const confirmBtn = document.getElementById('confirmGridBookingBtn');
    if (confirmBtn) {
        confirmBtn.disabled = true;
        confirmBtn.textContent = 'Booking...';
    }

    try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${API_BASE_URL}/api/schedule/create`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                courseId,
                classroomId: parseInt(classroomId),
                timeslotId,
                scheduleDate: date,
                scheduleType
            })
        });

        const result = await response.json();
        if (result.success) {
            closeModal();
            showToast('✅ Class scheduled successfully!', 'success');
            await loadAvailabilityGrid();
        } else {
            showToast('❌ ' + (result.error || 'Failed to book slot'), 'error');
        }
    } catch (error) {
        console.error('Grid Booking error:', error);
        showToast('❌ Failed to schedule class.', 'error');
    } finally {
        if (confirmBtn) {
            confirmBtn.disabled = false;
            confirmBtn.textContent = 'Confirm Booking';
        }
    }
}

// ─────────────────────────────────────────────
//  MODAL & TOAST HELPERS
// ─────────────────────────────────────────────
function injectModal(contentHtml) {
    closeModal();
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

function showToast(message, type = 'info') {
    document.querySelectorAll('.toast').forEach(t => t.remove());

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 4000);
}

function logout() {
    localStorage.clear();
    window.location.href = '/pages/login.html';
}

// Initialize
init();

// State and mock data (no external calls used)
let sessionToken = null;
let currentEmail = null;

const mockProfile = {
  Name: '—',
  DOB: '—',
  Gender: '—',
  Status: 'Pending',
  AadhaarNumber: null,
  PANNumber: null,
  Address: '—'
};

let mockUsers = [
  { id: 'U-1001', firstname:'Aarav', lastname:'Patel', name:'Aarav Patel', email:'aarav@example.com', status:'Pending', updatedAt: Date.now()-3600e3, address: 'Bengaluru', DOB: '1996-09-04', PANNumber:'ABCDE1234F', AadhaarNumber:'**** **** 1234' },
  { id: 'U-1002', firstname:'Isha', lastname:'Sharma', name:'Isha Sharma', email:'isha@example.com', status:'Approved', updatedAt: Date.now()-7200e3, address: 'Mumbai', DOB: '1993-02-17', PANNumber:'PQRSX9876Z', AadhaarNumber:'**** **** 4321' },
  { id: 'U-1003', firstname:'Rohan', lastname:'Gupta', name:'Rohan Gupta', email:'rohan@example.com', status:'Rejected', updatedAt: Date.now()-1800e3, address: 'Delhi', DOB: '1990-12-01', PANNumber:'LMNOP3456Q', AadhaarNumber:'**** **** 8473' }
];

// Helpers
function showSection(sectionId) {
  document.querySelectorAll('.page-section').forEach(s => s.classList.remove('active'));
  const el = document.getElementById(sectionId);
  if (el) el.classList.add('active');
  if (sectionId === 'admin') initAdmin();
  if (sectionId === 'dashboard') renderDashboard();
}
function showAlert(containerId, message, type = 'info', timeout=3500) {
  const c = document.getElementById(containerId);
  if (!c) return;
  c.innerHTML = `<div class="alert alert-${type}">${message}</div>`;
  if (timeout) setTimeout(() => { if (c) c.innerHTML = ''; }, timeout);
}
function showLoading(loadingId, show = true) {
  const loader = document.getElementById(loadingId);
  if (!loader) return;
  loader.style.display = show ? 'block' : 'none';
}
function setStatusBadge(el, status) {
  el.textContent = status;
  el.classList.remove('status-pending','status-approved','status-rejected');
  const cls = status === 'Approved' ? 'status-approved' : status === 'Rejected' ? 'status-rejected' : 'status-pending';
  el.classList.add(cls);
}
function updateLastUpdated() {
  const el = document.getElementById('sum-updated');
  if (el) el.textContent = new Date().toLocaleString();
}

// Mocked API-like wrapper
function mockDelay(data, ok=true, ms=500) {
  return new Promise((resolve, reject) => setTimeout(() => ok ? resolve(data) : reject(new Error(data && data.message ? data.message : 'Error')), ms));
}
async function apiCall(endpoint, method='GET', data=null, isFormData=false) {
  switch (endpoint) {
    case '/api/signup': return mockDelay({ message:'OTP sent' });
    case '/api/verify-otp': return mockDelay({ message:'Verified' });
    case '/api/resend-otp': return mockDelay({ message:'OTP re-sent' });
    case '/api/login': return mockDelay({ message:'Login OTP sent' });
    case '/api/login-verify-otp': return mockDelay({ message:'Logged in', token:'token-123' });
    case '/api/resend-login-otp': return mockDelay({ message:'Login OTP re-sent' });
    case '/api/extract':
      return mockDelay({ Name:'Riya Verma', DOB:'1995-05-12', Gender:'Female', Address:'Gurugram, Haryana', AadhaarNumber:'**** **** 1290' });
    case '/save_aadhaar': return mockDelay({ message: 'Aadhaar saved' });
    case '/api/extract_pan':
      return mockDelay({ Name: mockProfile.Name === '—' ? 'Name from PAN' : mockProfile.Name, FatherName:'Rajesh Verma', PANNumber:'ABCDE1234F' });
    case '/save_pan': return mockDelay({ message: 'PAN saved' });
    case '/api/user/result':
      return mockDelay({ data: { ...mockProfile } });
    case '/api/admin/stats': {
      const total = mockUsers.length;
      const approved = mockUsers.filter(u=>u.status==='Approved').length;
      const pending = mockUsers.filter(u=>u.status==='Pending').length;
      const rejected = mockUsers.filter(u=>u.status==='Rejected').length;
      return mockDelay({ data:{ totalUsers: total, approved, pending, rejected } });
    }
    case '/api/admin/users': {
      return mockDelay({ users: mockUsers.map(u=>({ ...u })) });
    }
    default:
      if (endpoint.startsWith('/api/admin/user/')) {
        const id = decodeURIComponent(endpoint.split('/').pop());
        const found = mockUsers.find(u => (u.id === id || u.email === id));
        if (!found) return mockDelay({ message: 'User not found' }, false);
        return mockDelay({ data: { ...found } });
      }
      if (endpoint === '/api/admin/update_status') {
        const { userId, status } = data || {};
        const idx = mockUsers.findIndex(u => (u.id === userId || u.email === userId));
        if (idx === -1) return mockDelay({ message:'User not found' }, false);
        mockUsers[idx].status = status || 'Pending';
        mockUsers[idx].updatedAt = Date.now();
        return mockDelay({ message:'Status updated' });
      }
      return mockDelay({ message:'Unknown endpoint' }, false);
  }
}

// Auth UI
function showAuthenticatedUI() {
  const auth = document.getElementById('auth-buttons');
  if (auth) auth.classList.add('hidden');
  const logoutNav = document.getElementById('logout-nav');
  if (logoutNav) logoutNav.classList.remove('hidden');
}
function showUnauthenticatedUI() {
  const auth = document.getElementById('auth-buttons');
  if (auth) auth.classList.remove('hidden');
  const logoutNav = document.getElementById('logout-nav');
  if (logoutNav) logoutNav.classList.add('hidden');
}
function logout() {
  sessionToken = null; currentEmail = null;
  showUnauthenticatedUI(); showSection('home');
  document.querySelectorAll('form').forEach(f => { try { f.reset(); } catch(e){} });
  document.querySelectorAll('.results-container').forEach(c => c.classList.add('hidden'));
  showAlert('dashboard-alert', 'Signed out', 'success');
}

// Init
document.addEventListener('DOMContentLoaded', function() {
  // Drag & drop
  document.querySelectorAll('.file-upload-area').forEach(area => {
    area.addEventListener('dragover', e => { e.preventDefault(); area.classList.add('dragover'); });
    area.addEventListener('dragleave', e => { e.preventDefault(); area.classList.remove('dragover'); });
    area.addEventListener('drop', e => {
      e.preventDefault(); area.classList.remove('dragover');
      const files = e.dataTransfer.files; if (!files.length) return;
      const input = area.parentElement.querySelector('.file-input');
      if (input.id === 'aadhaar-file') { uploadAadhaar({ files }); }
      if (input.id === 'pan-file') { uploadPAN({ files }); }
    });
  });
  showSection('home');
  updateLastUpdated();
});

// Signup
document.getElementById('signup-form').addEventListener('submit', async function(e) {
  e.preventDefault();
  const firstname = document.getElementById('signup-firstname').value.trim();
  const lastname = document.getElementById('signup-lastname').value.trim();
  const email = document.getElementById('signup-email').value.trim();
  const password = document.getElementById('signup-password').value;
  if (!firstname || !lastname || !email || !password) {
    showAlert('signup-alert', 'Please fill all fields', 'error'); return;
  }
  showLoading('signup-loading', true);
  try {
    const response = await apiCall('/api/signup', 'POST', { firstname, lastname, email, password });
    showAlert('signup-alert', response.message, 'success');
    currentEmail = email;
    setTimeout(() => showSection('otp-verification'), 800);
  } catch (err) {
    showAlert('signup-alert', err.message, 'error');
  } finally {
    showLoading('signup-loading', false);
  }
});

// Signup OTP verify
document.getElementById('otp-form').addEventListener('submit', async function(e) {
  e.preventDefault();
  const otp = document.getElementById('otp-code').value.trim();
  if (otp.length < 4) { showAlert('otp-alert', 'Enter a valid code', 'error'); return; }
  showLoading('otp-loading', true);
  try {
    const response = await apiCall('/api/verify-otp', 'POST', { email: currentEmail, otp });
    showAlert('otp-alert', response.message, 'success');
    setTimeout(() => {
      showSection('login');
      showAlert('login-alert', 'Account created. Please login.', 'success');
    }, 800);
  } catch (err) {
    showAlert('otp-alert', err.message, 'error');
  } finally {
    showLoading('otp-loading', false);
  }
});
async function resendOTP() {
  try {
    const response = await apiCall('/api/resend-otp', 'POST', { email: currentEmail });
    showAlert('otp-alert', response.message, 'success');
  } catch (err) { showAlert('otp-alert', err.message, 'error'); }
}

// Login
document.getElementById('login-form').addEventListener('submit', async function(e) {
  e.preventDefault();
  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;
  if (!email || !password) { showAlert('login-alert', 'Enter email and password', 'error'); return; }
  showLoading('login-loading', true);
  try {
    const response = await apiCall('/api/login', 'POST', { email, password });
    showAlert('login-alert', response.message, 'success');
    currentEmail = email;
    setTimeout(() => showSection('login-otp-verification'), 800);
  } catch (err) {
    showAlert('login-alert', err.message, 'error');
  } finally {
    showLoading('login-loading', false);
  }
});

// Login OTP verify
document.getElementById('login-otp-form').addEventListener('submit', async function(e) {
  e.preventDefault();
  const otp = document.getElementById('login-otp-code').value.trim();
  if (otp.length < 4) { showAlert('login-otp-alert', 'Enter a valid code', 'error'); return; }
  showLoading('login-otp-loading', true);
  try {
    const response = await apiCall('/api/login-verify-otp', 'POST', { email: currentEmail, otp });
    sessionToken = response.token;
    showAlert('login-otp-alert', response.message, 'success');
    showAuthenticatedUI();
    setTimeout(() => { showSection('dashboard'); renderDashboard(); }, 700);
  } catch (err) {
    showAlert('login-otp-alert', err.message, 'error');
  } finally {
    showLoading('login-otp-loading', false);
  }
});
async function resendLoginOTP() {
  try {
    const response = await apiCall('/api/resend-login-otp', 'POST', { email: currentEmail });
    showAlert('login-otp-alert', response.message, 'success');
  } catch (err) { showAlert('login-otp-alert', err.message, 'error'); }
}

// Aadhaar Upload
async function uploadAadhaar(input) {
  const file = input.files && input.files[0];
  showLoading('aadhaar-loading', true);
  try {
    const response = await apiCall('/api/extract', 'POST', file ? { hasFile: true } : null, true);
    mockProfile.Name = response.Name;
    mockProfile.DOB = response.DOB;
    mockProfile.Gender = response.Gender;
    mockProfile.Address = response.Address;
    mockProfile.AadhaarNumber = response.AadhaarNumber;

    const c = document.getElementById('aadhaar-results');
    c.innerHTML = `
      <div class="result-item"><span class="result-label">Name:</span><span class="result-value">${response.Name}</span></div>
      <div class="result-item"><span class="result-label">Date of Birth:</span><span class="result-value">${response.DOB}</span></div>
      <div class="result-item"><span class="result-label">Gender:</span><span class="result-value">${response.Gender}</span></div>
      <div class="result-item"><span class="result-label">Address:</span><span class="result-value">${response.Address}</span></div>
    `;
    c.classList.remove('hidden');
    showAlert('aadhaar-alert', 'Aadhaar data extracted', 'success');
    await apiCall('/save_aadhaar', 'POST', { ...response });

    document.getElementById('sum-aadhaar').textContent = '✅ Completed';
    updateLastUpdated();
    renderDashboard();
  } catch (err) {
    showAlert('aadhaar-alert', err.message, 'error');
  } finally {
    showLoading('aadhaar-loading', false);
  }
}

// PAN Upload
async function uploadPAN(input) {
  const file = input.files && input.files[0];
  showLoading('pan-loading', true);
  try {
    const response = await apiCall('/api/extract_pan', 'POST', file ? { hasFile: true } : null, true);
    mockProfile.PANNumber = response.PANNumber;

    const c = document.getElementById('pan-results');
    c.innerHTML = `
      <div class="result-item"><span class="result-label">Name:</span><span class="result-value">${response.Name}</span></div>
      <div class="result-item"><span class="result-label">Father's Name:</span><span class="result-value">${response.FatherName}</span></div>
      <div class="result-item"><span class="result-label">PAN Number:</span><span class="result-value">${response.PANNumber}</span></div>
    `;
    c.classList.remove('hidden');
    showAlert('pan-alert', 'PAN data extracted', 'success');
    await apiCall('/save_pan', 'POST', { ...response });

    document.getElementById('sum-pan').textContent = '✅ Completed';
    updateLastUpdated();
    renderDashboard();
  } catch (err) {
    showAlert('pan-alert', err.message, 'error');
  } finally {
    showLoading('pan-loading', false);
  }
}

// Dashboard render
function renderDashboard() {
  const nameEl = document.getElementById('status-name');
  const dobEl = document.getElementById('status-dob');
  const genderEl = document.getElementById('status-gender');
  if (nameEl) nameEl.textContent = mockProfile.Name || '—';
  if (dobEl) dobEl.textContent = mockProfile.DOB || '—';
  if (genderEl) genderEl.textContent = mockProfile.Gender || '—';
  const badge = document.getElementById('overall-status');
  if (badge) setStatusBadge(badge, mockProfile.Status || 'Pending');
}
async function refreshDashboard() {
  try {
    const res = await apiCall('/api/user/result', 'GET');
    const data = res.data || {};
    mockProfile.Status = data.Status || mockProfile.Status;
    renderDashboard();
    updateLastUpdated();
    showAlert('dashboard-alert', 'Dashboard refreshed', 'success');
  } catch (e) {
    showAlert('dashboard-alert', 'Could not refresh', 'error');
  }
}
function cycleStatus() {
  const order = ['Pending','Approved','Rejected'];
  const idx = order.indexOf(mockProfile.Status);
  mockProfile.Status = order[(idx + 1) % order.length];
  renderDashboard();
}

/* ===================== Admin ===================== */
async function initAdmin() {
  await Promise.allSettled([loadAdminStats(), loadAdminUsers('')]);
}
async function loadAdminStats() {
  const statsEl = document.getElementById('admin-stats');
  if (statsEl) statsEl.innerHTML = '<div class="dashboard-grid"><div class="loading-spinner" style="display:block;"></div></div>';
  try {
    const res = await apiCall('/api/admin/stats', 'GET');
    const s = res.data || {};
    if (statsEl) {
      statsEl.innerHTML = `
        <div class="dashboard-grid">
          <div class="dashboard-card">
            <div class="card-title">👤 Total Users</div>
            <div style="font-size:2rem; font-weight:900;">${s.totalUsers ?? 0}</div>
          </div>
          <div class="dashboard-card">
            <div class="card-title">✅ Approved</div>
            <div style="font-size:2rem; font-weight:900; color:#00ffb7;">${s.approved ?? 0}</div>
          </div>
          <div class="dashboard-card">
            <div class="card-title">🕒 Pending</div>
            <div style="font-size:2rem; font-weight:900; color:#ffd166;">${s.pending ?? 0}</div>
          </div>
          <div class="dashboard-card">
            <div class="card-title">⛔ Rejected</div>
            <div style="font-size:2rem; font-weight:900; color:#ff6b6b;">${s.rejected ?? 0}</div>
          </div>
        </div>
      `;
    }
  } catch (err) {
    // Fallback to local stats
    const total = mockUsers.length;
    const approved = mockUsers.filter(u=>u.status==='Approved').length;
    const pending = mockUsers.filter(u=>u.status==='Pending').length;
    const rejected = mockUsers.filter(u=>u.status==='Rejected').length;
    if (statsEl) statsEl.innerHTML = `
      <div class="dashboard-grid">
        <div class="dashboard-card"><div class="card-title">👤 Total Users</div><div style="font-size:2rem; font-weight:900;">${total}</div></div>
        <div class="dashboard-card"><div class="card-title">✅ Approved</div><div style="font-size:2rem; font-weight:900; color:#00ffb7;">${approved}</div></div>
        <div class="dashboard-card"><div class="card-title">🕒 Pending</div><div style="font-size:2rem; font-weight:900; color:#ffd166;">${pending}</div></div>
        <div class="dashboard-card"><div class="card-title">⛔ Rejected</div><div style="font-size:2rem; font-weight:900; color:#ff6b6b;">${rejected}</div></div>
      </div>
    `;
  }
}
async function loadAdminUsers(search = '') {
  const body = document.getElementById('admin-users-body');
  if (body) body.innerHTML = '<tr><td colspan="5"><div class="loading-spinner" style="display:block;"></div></td></tr>';
  try {
    const res = await apiCall('/api/admin/users', 'GET');
    let list = res.users || [];
    if (search) {
      const t = search.toLowerCase();
      list = list.filter(u => (u.id||'').toLowerCase().includes(t) || (u.name||'').toLowerCase().includes(t) || (u.email||'').toLowerCase().includes(t));
    }
    renderAdminUsers(list);
  } catch (err) {
    // Fallback to mock
    let list = mockUsers;
    if (search) {
      const t = search.toLowerCase();
      list = list.filter(u => u.id.toLowerCase().includes(t) || u.name.toLowerCase().includes(t) || u.email.toLowerCase().includes(t));
    }
    renderAdminUsers(list);
  }
}
function renderAdminUsers(users) {
  const body = document.getElementById('admin-users-body');
  if (!body) return;
  if (!users.length) {
    body.innerHTML = `<tr><td colspan="5" style="text-align:center; padding:20px;">No users found</td></tr>`;
    return;
  }
  const rows = users.map(u => {
    const id = u.id || u.email || 'N/A';
    const name = u.name || `${u.firstname||''} ${u.lastname||''}`.trim() || 'N/A';
    const email = u.email || 'N/A';
    const status = u.status || 'Pending';
    const updated = typeof u.updatedAt === 'string' ? u.updatedAt : new Date(u.updatedAt).toLocaleString();
    const statusClass = String(status).toLowerCase();
    return `
      <tr data-id="${id}" onclick="openUser('${encodeURIComponent(id)}')">
        <td>${id}</td>
        <td>${name}</td>
        <td>${email}</td>
        <td><span class="tag status-${statusClass}">${status}</span></td>
        <td>${updated}</td>
      </tr>
    `;
  }).join('');
  body.innerHTML = rows;
}
function searchAdminUsers() {
  const term = (document.getElementById('admin-search') || {}).value || '';
  loadAdminUsers(term.trim());
}
function resetAdminSearch() {
  const el = document.getElementById('admin-search');
  if (el) el.value = '';
  loadAdminUsers('');
}

async function openUser(idEncoded) {
  const id = decodeURIComponent(idEncoded);
  const detail = document.getElementById('user-detail');
  const userModalAlert = document.getElementById('user-modal-alert');
  if (userModalAlert) userModalAlert.innerHTML = '';
  showUserModal(true);
  if (detail) detail.innerHTML = '<div class="loading-spinner" style="display:block;"></div>';
  try {
    const res = await apiCall(`/api/admin/user/${encodeURIComponent(id)}`, 'GET');
    const data = res.data || {};
    const name = data.name || `${data.firstname||''} ${data.lastname||''}`.trim() || 'N/A';
    const email = data.email || 'N/A';
    const status = data.status || 'Pending';
    const dob = data.DOB || '—';
    const aad = data.AadhaarNumber || '—';
    const pan = data.PANNumber || '—';
    document.getElementById('user-status-select').value = status;

    if (detail) detail.innerHTML = `
      <div class="result-item"><span class="result-label">User ID:</span><span class="result-value">${id}</span></div>
      <div class="result-item"><span class="result-label">Name:</span><span class="result-value">${name}</span></div>
      <div class="result-item"><span class="result-label">Email:</span><span class="result-value">${email}</span></div>
      <div class="result-item"><span class="result-label">Status:</span><span class="result-value">${status}</span></div>
      <div class="result-item"><span class="result-label">DOB:</span><span class="result-value">${dob}</span></div>
      <div class="result-item"><span class="result-label">Aadhaar:</span><span class="result-value">${aad}</span></div>
      <div class="result-item"><span class="result-label">PAN:</span><span class="result-value">${pan}</span></div>
      <div class="result-item"><span class="result-label">Address:</span><span class="result-value">${data.address || '—'}</span></div>
    `;
  } catch (e) {
    const u = mockUsers.find(x=>x.id===id || x.email===id) || {};
    if (document.getElementById('user-status-select')) document.getElementById('user-status-select').value = u.status || 'Pending';
    if (detail) detail.innerHTML = `
      <div class="result-item"><span class="result-label">User ID:</span><span class="result-value">${id}</span></div>
      <div class="result-item"><span class="result-label">Name:</span><span class="result-value">${u.name || '—'}</span></div>
      <div class="result-item"><span class="result-label">Email:</span><span class="result-value">${u.email || '—'}</span></div>
      <div class="result-item"><span class="result-label">Status:</span><span class="result-value">${u.status || 'Pending'}</span></div>
      <div class="result-item"><span class="result-label">DOB:</span><span class="result-value">${u.DOB || '—'}</span></div>
      <div class="result-item"><span class="result-label">Aadhaar:</span><span class="result-value">${u.AadhaarNumber || '—'}</span></div>
      <div class="result-item"><span class="result-label">PAN:</span><span class="result-value">${u.PANNumber || '—'}</span></div>
      <div class="result-item"><span class="result-label">Address:</span><span class="result-value">${u.address || '—'}</span></div>
    `;
  }
}
async function saveUserStatus() {
  const id = document.querySelector('#user-detail .result-item .result-value')?.textContent || '';
  const newStatus = document.getElementById('user-status-select').value;
  try {
    await apiCall('/api/admin/update_status', 'POST', { userId: id, status: newStatus });
    const alertC = document.getElementById('user-modal-alert');
    if (alertC) alertC.innerHTML = '<div class="alert alert-success">Status updated</div>';
    const idx = mockUsers.findIndex(u=>u.id===id || u.email===id);
    if (idx>-1) { mockUsers[idx].status = newStatus; mockUsers[idx].updatedAt = Date.now(); }
    await loadAdminStats();
    await loadAdminUsers((document.getElementById('admin-search')||{}).value || '');
    setTimeout(closeUserModal, 700);
  } catch (e) {
    const alertC = document.getElementById('user-modal-alert');
    if (alertC) alertC.innerHTML = `<div class="alert alert-error">${e.message}</div>`;
  }
}
function showUserModal(show) {
  const m = document.getElementById('user-modal');
  if (!m) return;
  if (show) m.classList.add('show'); else m.classList.remove('show');
}
function closeUserModal() { showUserModal(false); }
function modalBackdropClose(e) {
  if (e.target && e.target.id === 'user-modal') closeUserModal();
}
/* =================== End Admin =================== */

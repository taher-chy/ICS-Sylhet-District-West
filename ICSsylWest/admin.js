// Admin Panel State Controller

// DOM elements
const loginOverlay = document.getElementById('login-overlay');
const loginForm = document.getElementById('login-form');
const loginError = document.getElementById('login-error');
const sidebar = document.getElementById('sidebar');
const menuToggle = document.getElementById('menu-toggle');
const adminMenu = document.getElementById('admin-menu');
const sections = document.querySelectorAll('.admin-section');
const logoutBtn = document.getElementById('admin-logout');

// 1. Authentication Control
function checkAuth() {
    const isLogged = sessionStorage.getItem('ics_admin_logged');
    if (isLogged === 'true') {
        if (loginOverlay) loginOverlay.style.display = 'none';
        initializeDashboard();
    } else {
        if (loginOverlay) loginOverlay.style.display = 'flex';
    }
}

// Handle Login Submission
if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = document.getElementById('login-username').value;
        const password = document.getElementById('login-password').value;

        // Default credentials: admin / sylhetwest
        if (username === 'admin' && password === 'sylhetwest') {
            sessionStorage.setItem('ics_admin_logged', 'true');
            if (loginOverlay) {
                loginOverlay.style.opacity = '0';
                setTimeout(() => {
                    loginOverlay.style.display = 'none';
                    initializeDashboard();
                }, 400);
            }
        } else {
            if (loginError) {
                loginError.style.display = 'block';
                loginError.innerText = 'Invalid username or password.';
            }
        }
    });
}

// Handle Logout
if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        sessionStorage.removeItem('ics_admin_logged');
        window.location.reload();
    });
}

// 2. Sidebar Mobile Drawer Toggle
if (menuToggle && sidebar) {
    menuToggle.addEventListener('click', () => {
        sidebar.classList.toggle('open');
    });
}

document.addEventListener('click', (e) => {
    if (window.innerWidth <= 992 && sidebar && menuToggle) {
        if (!sidebar.contains(e.target) && e.target !== menuToggle) {
            sidebar.classList.remove('open');
        }
    }
});

// 3. Tab Navigation Switcher
if (adminMenu) {
    adminMenu.querySelectorAll('li a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetSectionId = link.getAttribute('data-target');
            
            // Set active class in sidebar menu
            adminMenu.querySelectorAll('li').forEach(li => li.classList.remove('active'));
            link.parentElement.classList.add('active');

            // Show active section container
            sections.forEach(section => {
                if (section.id === targetSectionId) {
                    section.classList.add('active');
                } else {
                    section.classList.remove('active');
                }
            });

            // Close sidebar on mobile
            if (sidebar) sidebar.classList.remove('open');

            // Trigger specific tab loading logic
            if (targetSectionId === 'council-section') {
                renderCouncilTable();
            } else if (targetSectionId === 'hrd-section') {
                renderMembersTable();
            } else if (targetSectionId === 'office-section') {
                renderNoticesTable();
                renderBranchesTable();
                loadContactInfoSettingsForm();
            } else if (targetSectionId === 'finance-section') {
                renderTransactionsTable();
            } else if (targetSectionId === 'messages-section') {
                renderInboxTable();
            } else if (targetSectionId === 'dashboard-section') {
                calculateSummaryStats();
            }
        });
    });
}

// Helper for i18n lookup
function tr(key, fallback = '') {
    return window.ICS_I18N ? window.ICS_I18N.t(key) : fallback;
}

// 4. Data Initialization & Summary Statistics
let financeChartInstance = null;

function initializeDashboard() {
    calculateSummaryStats();
    renderRecentInquiries();
    renderChart();
    renderCouncilTable();
    renderBranchesTable();
    updateBranchSuggestions();
    loadContactInfoSettingsForm();
}

function calculateSummaryStats() {
    const members = JSON.parse(localStorage.getItem('ics_members')) || [];
    const messages = JSON.parse(localStorage.getItem('ics_messages')) || [];
    const transactions = JSON.parse(localStorage.getItem('ics_transactions')) || [];

    // Calculate Net balance
    let totalIncome = 0;
    let totalExpense = 0;
    transactions.forEach(t => {
        if (t.type === 'Income') totalIncome += t.amount;
        else totalExpense += t.amount;
    });
    const netBalance = totalIncome - totalExpense;

    // Count unread messages
    const unreadCount = messages.filter(m => m.status === 'Unread').length;

    // Update Overview Stats cards
    const totalMembersEl = document.getElementById('stat-total-members');
    const netFinanceEl = document.getElementById('stat-net-finance');
    const unreadMessagesEl = document.getElementById('stat-unread-messages');
    const activeBranchesEl = document.getElementById('stat-active-branches');

    const unit = tr('dyn_currency', 'BDT');
    if (totalMembersEl) totalMembersEl.innerText = members.length;
    if (netFinanceEl) netFinanceEl.innerText = netBalance.toLocaleString() + ' ' + unit;
    if (unreadMessagesEl) {
        unreadMessagesEl.innerText = unreadCount;
        // Also update sidebar message counter badge if present
        const badge = document.getElementById('inbox-badge');
        if (badge) {
            badge.innerText = unreadCount;
            badge.style.display = unreadCount > 0 ? 'inline-block' : 'none';
        }
    }
    if (activeBranchesEl) {
        const branches = JSON.parse(localStorage.getItem('ics_branches')) || [];
        if (branches.length > 0) {
            activeBranchesEl.innerText = branches.length + (window.ICS_I18N && window.ICS_I18N.getLang() === 'bn' ? 'টি শাখা' : ' Branches');
        } else {
            activeBranchesEl.innerText = tr('dyn_branches_unit', '12 Branches');
        }
    }
}

// Render recent messages inside Dashboard overview section
function renderRecentInquiries() {
    const messages = JSON.parse(localStorage.getItem('ics_messages')) || [];
    const tbody = document.getElementById('recent-inquiries-tbody');
    if (!tbody) return;

    tbody.innerHTML = '';
    
    // Get last 4 messages
    const recent = [...messages].sort((a,b) => b.id - a.id).slice(0, 4);

    if (recent.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--text-secondary);">No messages in inbox.</td></tr>`;
        return;
    }

    recent.forEach(msg => {
        const trEl = document.createElement('tr');
        const statusKey = msg.status && msg.status.toLowerCase() === 'unread' ? 'dyn_unread' : 'dyn_read';
        trEl.innerHTML = `
            <td><strong>${msg.name}</strong></td>
            <td>${msg.email}</td>
            <td>${msg.subject}</td>
            <td>${msg.date}</td>
            <td><span class="badge ${msg.status.toLowerCase()}">${tr(statusKey, msg.status)}</span></td>
        `;
        tbody.appendChild(trEl);
    });
}

// 5. Chart.js reporting setup
function renderChart() {
    const ctx = document.getElementById('financeChart');
    if (!ctx) return;

    // If chart exists, destroy it to redraw
    if (financeChartInstance) {
        financeChartInstance.destroy();
    }

    const transactions = JSON.parse(localStorage.getItem('ics_transactions')) || [];
    
    // Sort transactions chronologically
    const chronTxns = [...transactions].sort((a, b) => new Date(a.date) - new Date(b.date));
    
    // Accumulate metrics grouped by date
    const dateMap = {};
    chronTxns.forEach(t => {
        if (!dateMap[t.date]) {
            dateMap[t.date] = { income: 0, expense: 0 };
        }
        if (t.type === 'Income') {
            dateMap[t.date].income += t.amount;
        } else {
            dateMap[t.date].expense += t.amount;
        }
    });

    const labels = Object.keys(dateMap).slice(-7); // last 7 days of logs
    const incomeData = [];
    const expenseData = [];

    labels.forEach(date => {
        incomeData.push(dateMap[date].income);
        expenseData.push(dateMap[date].expense);
    });

    // Check if Chart.js is loaded
    if (typeof Chart !== 'undefined') {
        financeChartInstance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels.length ? labels : [tr('dyn_chart_nodata', 'No Data')],
                datasets: [
                    {
                        label: tr('dyn_chart_income', 'Income (BDT)'),
                        data: incomeData.length ? incomeData : [0],
                        backgroundColor: 'rgba(16, 185, 129, 0.6)',
                        borderColor: '#10b981',
                        borderWidth: 1
                    },
                    {
                        label: tr('dyn_chart_expense', 'Expense (BDT)'),
                        data: expenseData.length ? expenseData : [0],
                        backgroundColor: 'rgba(217, 119, 6, 0.6)',
                        borderColor: '#d97706',
                        borderWidth: 1
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: { color: 'rgba(255, 255, 255, 0.05)' },
                        ticks: { color: '#94a3b8' }
                    },
                    x: {
                        grid: { color: 'rgba(255, 255, 255, 0.05)' },
                        ticks: { color: '#94a3b8' }
                    }
                },
                plugins: {
                    legend: {
                        labels: { color: '#f8fafc', font: { family: 'Outfit' } }
                    }
                }
            }
        });
    }
}

// 6. HRD Department - Member Management (CRUD)
const hrdSearch = document.getElementById('hrd-search');
const hrdFilterRank = document.getElementById('hrd-filter-rank');
const memberModal = document.getElementById('member-modal');
const memberForm = document.getElementById('member-form');
let editMemberId = null;

if (hrdSearch) hrdSearch.addEventListener('input', renderMembersTable);
if (hrdFilterRank) hrdFilterRank.addEventListener('change', renderMembersTable);

function renderMembersTable() {
    const members = JSON.parse(localStorage.getItem('ics_members')) || [];
    const tbody = document.getElementById('members-tbody');
    if (!tbody) return;

    tbody.innerHTML = '';
    const query = hrdSearch ? hrdSearch.value.toLowerCase() : '';
    const rankFilter = hrdFilterRank ? hrdFilterRank.value : '';

    // Filter results
    const filtered = members.filter(m => {
        const matchesQuery = m.name.toLowerCase().includes(query) || m.branch.toLowerCase().includes(query);
        const matchesRank = rankFilter === '' || m.rank === rankFilter;
        return matchesQuery && matchesRank;
    });

    if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-secondary);">No members found matching filters.</td></tr>`;
        return;
    }

    filtered.forEach(m => {
        const trEl = document.createElement('tr');
        const statusKey = m.status && m.status.toLowerCase() === 'active' ? 'dyn_active' : 'dyn_inactive';
        trEl.innerHTML = `
            <td><strong>${m.id}</strong></td>
            <td>${m.name}</td>
            <td><span class="text-gold" style="font-weight:600;">${m.rank}</span></td>
            <td>${m.branch}</td>
            <td><span class="badge ${m.status.toLowerCase()}">${tr(statusKey, m.status)}</span></td>
            <td>
                <div class="action-btn-group">
                    <button class="action-btn edit" onclick="openEditMemberModal(${m.id})">${tr('dyn_edit', '✏️ Edit')}</button>
                    <button class="action-btn delete" onclick="deleteMember(${m.id})">${tr('dyn_delete', '🗑️ Delete')}</button>
                </div>
            </td>
        `;
        tbody.appendChild(trEl);
    });
}

// Modal Form Openers
window.openAddMemberModal = function() {
    editMemberId = null;
    if (memberForm) {
        memberForm.reset();
        document.getElementById('modal-title').innerText = tr('dyn_modal_add_member', 'Add New Member');
    }
    if (memberModal) memberModal.style.display = 'flex';
};

window.openEditMemberModal = function(id) {
    editMemberId = id;
    const members = JSON.parse(localStorage.getItem('ics_members')) || [];
    const member = members.find(m => m.id === id);
    if (!member) return;

    document.getElementById('modal-title').innerText = tr('dyn_modal_edit_member', 'Edit Member Profile');
    document.getElementById('member-name').value = member.name;
    document.getElementById('member-rank').value = member.rank;
    document.getElementById('member-branch').value = member.branch;
    document.getElementById('member-status').value = member.status;
    document.getElementById('member-training').value = member.training || '';

    if (memberModal) memberModal.style.display = 'flex';
};

window.closeMemberModal = function() {
    if (memberModal) memberModal.style.display = 'none';
};

// Form submit listener (handles both Add and Edit)
if (memberForm) {
    memberForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('member-name').value;
        const rank = document.getElementById('member-rank').value;
        const branch = document.getElementById('member-branch').value;
        const status = document.getElementById('member-status').value;
        const training = document.getElementById('member-training').value;

        let members = JSON.parse(localStorage.getItem('ics_members')) || [];

        if (editMemberId === null) {
            // Adding a new member
            const newMember = {
                id: members.length > 0 ? Math.max(...members.map(m => m.id)) + 1 : 101,
                name: name,
                rank: rank,
                branch: branch,
                status: status,
                training: training || new Date().toISOString().substring(0, 10)
            };
            members.push(newMember);
        } else {
            // Editing existing member
            members = members.map(m => {
                if (m.id === editMemberId) {
                    return { ...m, name, rank, branch, status, training };
                }
                return m;
            });
        }

        localStorage.setItem('ics_members', JSON.stringify(members));
        closeMemberModal();
        renderMembersTable();
        calculateSummaryStats();
    });
}

// Delete Member
window.deleteMember = function(id) {
    if (confirm('Are you sure you want to delete this member from the database?')) {
        let members = JSON.parse(localStorage.getItem('ics_members')) || [];
        members = members.filter(m => m.id !== id);
        localStorage.setItem('ics_members', JSON.stringify(members));
        renderMembersTable();
        calculateSummaryStats();
    }
};

// 6.1 HRD Excel / CSV Import & Template Export
const hrdExcelInput = document.getElementById('hrd-excel-input');
const hrdExcelStatus = document.getElementById('hrd-excel-status');

function bnDigitsToAscii(str) {
    const map = { '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4', '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9' };
    return String(str || '').replace(/[০-৯]/g, ch => map[ch] || ch);
}

function normalizeMemberRank(raw, fallbackRank) {
    const val = String(raw || '').trim().toLowerCase();
    if (!val) return fallbackRank;
    if (val.includes('সদস্য প্রার্থী') || val.includes('member candidate') || val.includes('candidate member')) {
        return 'সদস্য প্রার্থী (Member Candidate)';
    }
    if (val.includes('সাথী প্রার্থী') || val.includes('associate candidate') || val.includes('sathi candidate')) {
        return 'সাথী প্রার্থী (Associate Candidate)';
    }
    if (val.includes('সদস্য') || val === 'member' || val.includes('(member)')) {
        return 'সদস্য (Member)';
    }
    if (val.includes('সাথী') || val.includes('sathi') || val.includes('associate')) {
        return 'সাথী (Associate)';
    }
    return fallbackRank;
}

function normalizeMemberStatus(raw) {
    const val = String(raw || '').trim().toLowerCase();
    if (val.includes('inactive') || val.includes('নিষ্ক্রিয়') || val.includes('নিষ্ক্রিয়') || val === 'no') {
        return 'Inactive';
    }
    return 'Active';
}

function parseCsvRowsFallback(text) {
    const rows = [];
    let row = [];
    let cell = '';
    let inQuotes = false;
    const cleanText = text.replace(/^\uFEFF/, '');

    for (let i = 0; i < cleanText.length; i++) {
        const ch = cleanText[i];
        const next = cleanText[i + 1];
        if (inQuotes) {
            if (ch === '"' && next === '"') {
                cell += '"';
                i++;
            } else if (ch === '"') {
                inQuotes = false;
            } else {
                cell += ch;
            }
        } else if (ch === '"') {
            inQuotes = true;
        } else if (ch === ',') {
            row.push(cell);
            cell = '';
        } else if (ch === '\r' || ch === '\n') {
            if (ch === '\r' && next === '\n') i++;
            row.push(cell);
            if (row.some(c => c.trim() !== '')) rows.push(row);
            row = [];
            cell = '';
        } else {
            cell += ch;
        }
    }
    row.push(cell);
    if (row.some(c => c.trim() !== '')) rows.push(row);
    return rows;
}

function extractMembersFromMatrix(rows, sheetFallbackRank) {
    if (!rows || rows.length === 0) return [];

    const firstRow = rows[0].map(c => String(c || '').trim().toLowerCase());
    const findCol = (patterns) => firstRow.findIndex(h => patterns.some(p => h === p || h.includes(p)));

    const idIdx = findCol(['id', 'member id', 'আইডি', 'সদস্য আইডি', 'sl']);
    const nameIdx = findCol(['name', 'full name', 'member name', 'নাম', 'জনশক্তির নাম', 'সদস্যের নাম']);
    const rankIdx = findCol(['rank', 'organizational rank', 'category', 'মান', 'সাংগঠনিক মান', 'পদবি', 'স্তর']);
    const branchIdx = findCol(['branch', 'branch name', 'শাখা', 'শাখার নাম', 'এলাকা']);
    const statusIdx = findCol(['status', 'অবস্থা', 'স্ট্যাটাস']);
    const trainingIdx = findCol(['training', 'date', 'প্রশিক্ষণ', 'তারিখ']);

    const hasHeader = nameIdx !== -1 || rankIdx !== -1 || branchIdx !== -1;
    const startRow = hasHeader ? 1 : 0;
    const parsed = [];

    for (let r = startRow; r < rows.length; r++) {
        const cells = rows[r];
        if (!cells || !cells.some(c => String(c || '').trim() !== '')) continue;

        let rawId = '';
        let rawName = '';
        let rawRank = '';
        let rawBranch = '';
        let rawStatus = '';
        let rawTraining = '';

        if (hasHeader) {
            rawId = idIdx !== -1 ? cells[idIdx] : '';
            rawName = nameIdx !== -1 ? cells[nameIdx] : (cells[0] || '');
            rawRank = rankIdx !== -1 ? cells[rankIdx] : '';
            rawBranch = branchIdx !== -1 ? cells[branchIdx] : '';
            rawStatus = statusIdx !== -1 ? cells[statusIdx] : '';
            rawTraining = trainingIdx !== -1 ? cells[trainingIdx] : '';
        } else {
            const firstIsNum = /^\d+$/.test(bnDigitsToAscii(String(cells[0] || '').trim()));
            if (firstIsNum && cells.length >= 2) {
                [rawId, rawName, rawRank, rawBranch, rawStatus, rawTraining] = cells;
            } else {
                [rawName, rawRank, rawBranch, rawStatus, rawTraining] = cells;
            }
        }

        const name = String(rawName || '').trim();
        if (!name) continue;

        const numericId = parseInt(bnDigitsToAscii(String(rawId || '').trim()), 10);
        parsed.push({
            id: Number.isFinite(numericId) && numericId > 0 ? numericId : null,
            name,
            rank: normalizeMemberRank(rawRank, sheetFallbackRank),
            branch: String(rawBranch || '').trim() || '—',
            status: normalizeMemberStatus(rawStatus),
            training: String(rawTraining || '').trim() || new Date().toISOString().substring(0, 10)
        });
    }
    return parsed;
}

function showExcelStatus(isSuccess, message) {
    if (!hrdExcelStatus) return;
    hrdExcelStatus.className = `excel-import-status ${isSuccess ? 'success' : 'error'}`;
    hrdExcelStatus.textContent = message;
    hrdExcelStatus.style.display = 'block';
}

if (hrdExcelInput) {
    hrdExcelInput.addEventListener('change', (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;

        const defaultRankSelect = document.getElementById('hrd-excel-default-rank');
        const modeSelect = document.getElementById('hrd-excel-mode');
        const defaultRank = defaultRankSelect ? defaultRankSelect.value : 'সদস্য (Member)';
        const importMode = modeSelect ? modeSelect.value : 'append';
        const isCsv = file.name.toLowerCase().endsWith('.csv');
        const isBn = window.ICS_I18N && window.ICS_I18N.getLang() === 'bn';

        const handleImportedRows = (imported) => {
            if (!imported || imported.length === 0) {
                showExcelStatus(false, isBn
                    ? 'ফাইলে কোনো বৈধ জনশক্তির তথ্য পাওয়া যায়নি। Name/নাম কলাম আছে কিনা যাচাই করুন।'
                    : 'No valid member rows found in the file. Please ensure a Name column is present.');
                return;
            }

            let members = importMode === 'replace' ? [] : (JSON.parse(localStorage.getItem('ics_members')) || []);
            let maxId = members.length > 0 ? Math.max(...members.map(m => Number(m.id) || 100)) : 100;

            imported.forEach(item => {
                if (!item.id) {
                    maxId += 1;
                    item.id = maxId;
                } else {
                    maxId = Math.max(maxId, item.id);
                }

                const existingIdx = members.findIndex(m => Number(m.id) === Number(item.id));
                if (existingIdx !== -1 && importMode === 'append') {
                    members[existingIdx] = item;
                } else {
                    if (existingIdx !== -1) {
                        maxId += 1;
                        item.id = maxId;
                    }
                    members.push(item);
                }
            });

            localStorage.setItem('ics_members', JSON.stringify(members));
            renderMembersTable();
            calculateSummaryStats();

            showExcelStatus(true, isBn
                ? `সফলভাবে ${imported.length} জন জনশক্তির তথ্য আপলোড হয়েছে এবং মূল সাইটে যুক্ত হয়েছে।`
                : `Successfully imported ${imported.length} member(s). Changes are now live on the main site.`);
        };

        if (typeof XLSX !== 'undefined') {
            const reader = new FileReader();
            reader.onload = (ev) => {
                try {
                    const data = new Uint8Array(ev.target.result);
                    const workbook = XLSX.read(data, { type: 'array' });
                    let allImported = [];
                    workbook.SheetNames.forEach(sheetName => {
                        const sheet = workbook.Sheets[sheetName];
                        const matrix = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
                        const sheetFallback = normalizeMemberRank(sheetName, defaultRank);
                        allImported = allImported.concat(extractMembersFromMatrix(matrix, sheetFallback));
                    });
                    handleImportedRows(allImported);
                } catch (err) {
                    showExcelStatus(false, isBn
                        ? 'এক্সেল ফাইলটি পড়া যায়নি। সঠিক .xlsx, .xls বা .csv ফাইল দিন।'
                        : 'Could not read the Excel file. Please upload a valid .xlsx, .xls, or .csv file.');
                } finally {
                    hrdExcelInput.value = '';
                }
            };
            reader.readAsArrayBuffer(file);
        } else if (isCsv) {
            const reader = new FileReader();
            reader.onload = (ev) => {
                try {
                    const matrix = parseCsvRowsFallback(String(ev.target.result || ''));
                    handleImportedRows(extractMembersFromMatrix(matrix, defaultRank));
                } catch (err) {
                    showExcelStatus(false, isBn ? 'CSV ফাইলটি পড়া যায়নি।' : 'Could not parse CSV file.');
                } finally {
                    hrdExcelInput.value = '';
                }
            };
            reader.readAsText(file, 'UTF-8');
        } else {
            showExcelStatus(false, isBn
                ? 'অফলাইনে .xlsx পড়ার লাইব্রেরি লোড হয়নি। অনুগ্রহ করে ইন্টারনেট সংযোগ দিন অথবা .csv ফাইল আপলোড করুন।'
                : 'Excel library did not load offline. Please connect to the internet or upload a .csv file.');
            hrdExcelInput.value = '';
        }
    });
}

window.downloadMembersTemplate = function() {
    const sampleRows = [
        ['ID', 'Name', 'Rank', 'Branch', 'Status', 'Training'],
        [201, 'Md. Abdur Rahman', 'সদস্য (Member)', 'Bishwanath', 'Active', '2026-06-15'],
        [202, 'Tariqul Islam', 'সদস্য প্রার্থী (Member Candidate)', 'Osmaninagar', 'Active', '2026-06-10'],
        [203, 'Mahmudul Hasan', 'সাথী (Associate)', 'Balaganj', 'Active', '2026-05-20'],
        [204, 'Saeed Ahmed', 'সাথী প্রার্থী (Associate Candidate)', 'Tajpur', 'Active', '2026-05-12']
    ];

    if (typeof XLSX !== 'undefined') {
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet(sampleRows);
        XLSX.utils.book_append_sheet(wb, ws, 'Workforce');
        XLSX.writeFile(wb, 'hrd_workforce_template.xlsx');
    } else {
        const csvContent = '\uFEFF' + sampleRows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\r\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'hrd_workforce_template.csv';
        a.click();
        URL.revokeObjectURL(url);
    }
};

// 7. Office Department - Notices Management
const noticeForm = document.getElementById('notice-form');

function renderNoticesTable() {
    const notices = JSON.parse(localStorage.getItem('ics_notices')) || [];
    const tbody = document.getElementById('notices-tbody');
    if (!tbody) return;

    tbody.innerHTML = '';
    const sorted = [...notices].sort((a,b) => b.id - a.id);

    if (sorted.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--text-secondary);">No bulletins posted.</td></tr>`;
        return;
    }

    sorted.forEach(n => {
        const trEl = document.createElement('tr');

        const idTd = document.createElement('td');
        const idStrong = document.createElement('strong');
        idStrong.textContent = n.id;
        idTd.appendChild(idStrong);

        const dateTd = document.createElement('td');
        dateTd.textContent = n.date || '';

        const catTd = document.createElement('td');
        const catSpan = document.createElement('span');
        catSpan.className = 'text-gold';
        catSpan.textContent = n.category || '';
        catTd.appendChild(catSpan);

        const titleTd = document.createElement('td');
        titleTd.textContent = n.title || '';

        const actionTd = document.createElement('td');
        const group = document.createElement('div');
        group.className = 'action-btn-group';

        const editBtn = document.createElement('button');
        editBtn.type = 'button';
        editBtn.className = 'action-btn edit';
        editBtn.textContent = tr('dyn_edit', '✏️ Edit');
        editBtn.onclick = () => openEditNoticeModal(n.id);

        const delBtn = document.createElement('button');
        delBtn.type = 'button';
        delBtn.className = 'action-btn delete';
        delBtn.textContent = tr('dyn_delete', '🗑️ Delete');
        delBtn.onclick = () => deleteNotice(n.id);

        group.append(editBtn, delBtn);
        actionTd.appendChild(group);

        trEl.append(idTd, dateTd, catTd, titleTd, actionTd);
        tbody.appendChild(trEl);
    });
}

const noticeModal = document.getElementById('notice-modal');
const noticeEditForm = document.getElementById('notice-edit-form');
let editNoticeId = null;

window.openEditNoticeModal = function(id) {
    const notices = JSON.parse(localStorage.getItem('ics_notices')) || [];
    const notice = notices.find(n => n.id === id);
    if (!notice) return;

    editNoticeId = id;
    document.getElementById('edit-notice-category').value = notice.category || 'Office Notice';
    document.getElementById('edit-notice-date').value = notice.date || new Date().toISOString().substring(0, 10);
    document.getElementById('edit-notice-title').value = notice.title || '';
    document.getElementById('edit-notice-text').value = notice.text || '';
    if (noticeModal) noticeModal.style.display = 'flex';
};

window.closeNoticeModal = function() {
    if (noticeModal) noticeModal.style.display = 'none';
};

if (noticeEditForm) {
    noticeEditForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (editNoticeId === null) return;

        const category = document.getElementById('edit-notice-category').value;
        const date = document.getElementById('edit-notice-date').value || new Date().toISOString().substring(0, 10);
        const title = document.getElementById('edit-notice-title').value.trim();
        const text = document.getElementById('edit-notice-text').value.trim();
        if (!title || !text) return;

        const notices = (JSON.parse(localStorage.getItem('ics_notices')) || []).map(n =>
            n.id === editNoticeId ? { ...n, category, date, title, text } : n
        );
        localStorage.setItem('ics_notices', JSON.stringify(notices));
        closeNoticeModal();
        renderNoticesTable();
    });
}

if (noticeForm) {
    noticeForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const category = document.getElementById('notice-category').value;
        const title = document.getElementById('notice-title').value;
        const text = document.getElementById('notice-text').value;

        const notices = JSON.parse(localStorage.getItem('ics_notices')) || [];
        
        const newNotice = {
            id: notices.length > 0 ? Math.max(...notices.map(n => n.id)) + 1 : 1,
            date: new Date().toISOString().substring(0, 10),
            category: category,
            title: title,
            text: text
        };

        notices.push(newNotice);
        localStorage.setItem('ics_notices', JSON.stringify(notices));
        
        alert('Notice posted successfully! It will instantly appear on the main website ticker and noticeboard.');
        noticeForm.reset();
        renderNoticesTable();
    });
}

window.deleteNotice = function(id) {
    if (confirm('Are you sure you want to delete this notice?')) {
        let notices = JSON.parse(localStorage.getItem('ics_notices')) || [];
        notices = notices.filter(n => n.id !== id);
        localStorage.setItem('ics_notices', JSON.stringify(notices));
        renderNoticesTable();
    }
};

// 7.1 Office Department - Sylhet District West Branches Management (17 Branches)
const branchForm = document.getElementById('branch-form');
const branchBulkForm = document.getElementById('branch-bulk-form');
const branchModal = document.getElementById('branch-modal');
const branchEditForm = document.getElementById('branch-edit-form');
let editBranchId = null;

function getBranchesList() {
    return JSON.parse(localStorage.getItem('ics_branches')) || [];
}

function saveBranchesList(list) {
    localStorage.setItem('ics_branches', JSON.stringify(list));
    updateBranchSuggestions();
    calculateSummaryStats();
}

function updateBranchSuggestions() {
    const datalist = document.getElementById('branch-suggestions');
    if (!datalist) return;
    const branches = getBranchesList();
    datalist.innerHTML = '';
    branches.forEach(b => {
        const opt = document.createElement('option');
        opt.value = b.name;
        datalist.appendChild(opt);
    });
}

function translateBranchType(typeVal) {
    const map = {
        'Thana / Upazila': 'opt_btype_thana',
        'College / Campus': 'opt_btype_college',
        'Union / Ward': 'opt_btype_union',
        'Other': 'opt_btype_other'
    };
    return map[typeVal] ? tr(map[typeVal], typeVal) : typeVal;
}

function renderBranchesTable() {
    const tbody = document.getElementById('branches-tbody');
    const countBadge = document.getElementById('branch-count-badge');
    const branches = getBranchesList();

    if (countBadge) {
        const label = tr('dyn_branches_count_label', 'Branches Added');
        countBadge.textContent = `${branches.length} / 17 ${label}`;
    }
    if (!tbody) return;

    tbody.innerHTML = '';

    if (branches.length === 0) {
        const emptyTr = document.createElement('tr');
        const emptyTd = document.createElement('td');
        emptyTd.colSpan = 6;
        emptyTd.style.cssText = 'text-align:center; color:var(--text-secondary); padding:18px;';
        emptyTd.textContent = tr('dyn_no_branches_admin', 'No branches added yet. Use the form above to add the 17 branches of Sylhet District West.');
        emptyTr.appendChild(emptyTd);
        tbody.appendChild(emptyTr);
        return;
    }

    branches.forEach((branch, idx) => {
        const trEl = document.createElement('tr');

        const orderTd = document.createElement('td');
        orderTd.innerHTML = `<strong>#${idx + 1}</strong>`;

        const nameTd = document.createElement('td');
        const nameStrong = document.createElement('strong');
        nameStrong.textContent = branch.name || '';
        nameTd.appendChild(nameStrong);

        const areaTd = document.createElement('td');
        areaTd.textContent = branch.area || '—';

        const typeTd = document.createElement('td');
        const typeSpan = document.createElement('span');
        typeSpan.className = 'text-gold';
        typeSpan.style.fontWeight = '600';
        typeSpan.textContent = translateBranchType(branch.type || 'Thana / Upazila');
        typeTd.appendChild(typeSpan);

        const statusTd = document.createElement('td');
        const statusSpan = document.createElement('span');
        const stLower = (branch.status || 'Active').toLowerCase();
        statusSpan.className = `badge ${stLower}`;
        statusSpan.textContent = tr(stLower === 'active' ? 'dyn_active' : 'dyn_inactive', branch.status || 'Active');
        statusTd.appendChild(statusSpan);

        const actionTd = document.createElement('td');
        const group = document.createElement('div');
        group.className = 'action-btn-group';

        const upBtn = document.createElement('button');
        upBtn.type = 'button';
        upBtn.className = 'action-btn';
        upBtn.textContent = '↑';
        upBtn.disabled = idx === 0;
        upBtn.onclick = () => moveBranch(branch.id, -1);

        const downBtn = document.createElement('button');
        downBtn.type = 'button';
        downBtn.className = 'action-btn';
        downBtn.textContent = '↓';
        downBtn.disabled = idx === branches.length - 1;
        downBtn.onclick = () => moveBranch(branch.id, 1);

        const editBtn = document.createElement('button');
        editBtn.type = 'button';
        editBtn.className = 'action-btn edit';
        editBtn.textContent = tr('dyn_edit', '✏️ Edit');
        editBtn.onclick = () => openEditBranchModal(branch.id);

        const delBtn = document.createElement('button');
        delBtn.type = 'button';
        delBtn.className = 'action-btn delete';
        delBtn.textContent = tr('dyn_delete', '🗑️ Delete');
        delBtn.onclick = () => deleteBranch(branch.id);

        group.append(upBtn, downBtn, editBtn, delBtn);
        actionTd.appendChild(group);

        trEl.append(orderTd, nameTd, areaTd, typeTd, statusTd, actionTd);
        tbody.appendChild(trEl);
    });
}

if (branchForm) {
    branchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('branch-name-input').value.trim();
        const area = document.getElementById('branch-area-input').value.trim();
        const type = document.getElementById('branch-type-input').value;
        const status = document.getElementById('branch-status-input').value;
        if (!name) return;

        const branches = getBranchesList();
        const nextId = branches.length > 0 ? Math.max(...branches.map(b => b.id)) + 1 : 1;
        branches.push({ id: nextId, name, area, type, status });
        saveBranchesList(branches);

        branchForm.reset();
        renderBranchesTable();
    });
}

if (branchBulkForm) {
    branchBulkForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const raw = document.getElementById('branch-bulk-input').value;
        const lines = raw.split(/\r?\n/).map(s => s.trim()).filter(Boolean);
        if (lines.length === 0) return;

        const branches = getBranchesList();
        const existingNames = new Set(branches.map(b => (b.name || '').toLowerCase()));
        let nextId = branches.length > 0 ? Math.max(...branches.map(b => b.id)) + 1 : 1;

        lines.forEach(line => {
            if (!existingNames.has(line.toLowerCase())) {
                branches.push({
                    id: nextId++,
                    name: line,
                    area: '',
                    type: 'Thana / Upazila',
                    status: 'Active'
                });
                existingNames.add(line.toLowerCase());
            }
        });

        saveBranchesList(branches);
        branchBulkForm.reset();
        renderBranchesTable();
    });
}

window.openEditBranchModal = function(id) {
    const branch = getBranchesList().find(b => b.id === id);
    if (!branch) return;

    editBranchId = id;
    document.getElementById('edit-branch-name').value = branch.name || '';
    document.getElementById('edit-branch-area').value = branch.area || '';
    document.getElementById('edit-branch-type').value = branch.type || 'Thana / Upazila';
    document.getElementById('edit-branch-status').value = branch.status || 'Active';
    if (branchModal) branchModal.style.display = 'flex';
};

window.closeBranchModal = function() {
    if (branchModal) branchModal.style.display = 'none';
};

if (branchEditForm) {
    branchEditForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('edit-branch-name').value.trim();
        const area = document.getElementById('edit-branch-area').value.trim();
        const type = document.getElementById('edit-branch-type').value;
        const status = document.getElementById('edit-branch-status').value;
        if (!name || editBranchId === null) return;

        const branches = getBranchesList().map(b =>
            b.id === editBranchId ? { ...b, name, area, type, status } : b
        );
        saveBranchesList(branches);
        closeBranchModal();
        renderBranchesTable();
    });
}

window.moveBranch = function(id, delta) {
    const branches = getBranchesList();
    const index = branches.findIndex(b => b.id === id);
    const targetIndex = index + delta;
    if (index < 0 || targetIndex < 0 || targetIndex >= branches.length) return;
    [branches[index], branches[targetIndex]] = [branches[targetIndex], branches[index]];
    saveBranchesList(branches);
    renderBranchesTable();
};

window.deleteBranch = function(id) {
    if (confirm('Are you sure you want to delete this branch?')) {
        const branches = getBranchesList().filter(b => b.id !== id);
        saveBranchesList(branches);
        renderBranchesTable();
    }
};

// 7.2 Office Contact Information Settings (Home Page Contact Cards)
const DEFAULT_CONTACT_INFO = {
    locationEn: 'West Sylhet Complex, Subidbazar, Sylhet City',
    locationBn: 'ওয়েস্ট সিলেট কমপ্লেক্স, সুবিদবাজার, সিলেট শহর',
    phone: '01402602247',
    phoneNoteEn: '(Secretary)',
    phoneNoteBn: '(সেক্রেটারি)',
    whatsapp: '01773656396',
    email: 'chytaher382@gmail.com'
};

const contactInfoForm = document.getElementById('contact-info-form');
const contactInfoStatus = document.getElementById('contact-info-status');

function getContactInfoSettings() {
    const saved = JSON.parse(localStorage.getItem('ics_contact_info') || 'null');
    return saved ? { ...DEFAULT_CONTACT_INFO, ...saved } : { ...DEFAULT_CONTACT_INFO };
}

function loadContactInfoSettingsForm() {
    if (!contactInfoForm) return;
    const cfg = getContactInfoSettings();
    document.getElementById('cfg-location-en').value = cfg.locationEn || '';
    document.getElementById('cfg-location-bn').value = cfg.locationBn || '';
    document.getElementById('cfg-call-phone').value = cfg.phone || '';
    document.getElementById('cfg-call-note-en').value = cfg.phoneNoteEn || '';
    document.getElementById('cfg-call-note-bn').value = cfg.phoneNoteBn || '';
    document.getElementById('cfg-whatsapp').value = cfg.whatsapp || '';
    document.getElementById('cfg-email').value = cfg.email || '';
}

function showContactSettingsStatus(isSuccess, message) {
    if (!contactInfoStatus) return;
    contactInfoStatus.className = `excel-import-status ${isSuccess ? 'success' : 'error'}`;
    contactInfoStatus.textContent = message;
    contactInfoStatus.style.display = 'block';
}

if (contactInfoForm) {
    contactInfoForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const nextCfg = {
            locationEn: document.getElementById('cfg-location-en').value.trim(),
            locationBn: document.getElementById('cfg-location-bn').value.trim(),
            phone: document.getElementById('cfg-call-phone').value.trim(),
            phoneNoteEn: document.getElementById('cfg-call-note-en').value.trim(),
            phoneNoteBn: document.getElementById('cfg-call-note-bn').value.trim(),
            whatsapp: document.getElementById('cfg-whatsapp').value.trim(),
            email: document.getElementById('cfg-email').value.trim()
        };
        localStorage.setItem('ics_contact_info', JSON.stringify(nextCfg));
        const isBn = window.ICS_I18N && window.ICS_I18N.getLang() === 'bn';
        showContactSettingsStatus(true, isBn
            ? 'যোগাযোগের তথ্য সংরক্ষণ করা হয়েছে এবং হোম পেজে আপডেট হয়েছে।'
            : 'Office contact information saved and updated on the Home page.');
    });
}

window.resetContactInfoDefaults = function() {
    const isBn = window.ICS_I18N && window.ICS_I18N.getLang() === 'bn';
    if (confirm(isBn ? 'যোগাযোগের তথ্য ডিফল্ট অবস্থায় ফিরিয়ে আনবেন?' : 'Restore default office contact information?')) {
        localStorage.setItem('ics_contact_info', JSON.stringify(DEFAULT_CONTACT_INFO));
        loadContactInfoSettingsForm();
        showContactSettingsStatus(true, isBn
            ? 'ডিফল্ট যোগাযোগের তথ্য পুনরায় সেট করা হয়েছে।'
            : 'Default office contact information restored.');
    }
};

// 8. Finance Department - Transaction Management
const transactionForm = document.getElementById('transaction-form');

function renderTransactionsTable() {
    const transactions = JSON.parse(localStorage.getItem('ics_transactions')) || [];
    const tbody = document.getElementById('transactions-tbody');
    const totalReceiptsEl = document.getElementById('ledger-total-receipts');
    const totalExpensesEl = document.getElementById('ledger-total-expenses');
    const ledgerNetEl = document.getElementById('ledger-net-balance');

    if (!tbody) return;

    tbody.innerHTML = '';
    
    let totalIncome = 0;
    let totalExpense = 0;

    const unit = tr('dyn_currency', 'BDT');
    transactions.forEach(t => {
        if (t.type === 'Income') totalIncome += t.amount;
        else totalExpense += t.amount;

        const trEl = document.createElement('tr');
        const typeLabel = t.type === 'Income' ? tr('dyn_type_income', 'Income') : tr('dyn_type_expense', 'Expense');
        trEl.innerHTML = `
            <td><strong>${t.id}</strong></td>
            <td>${t.date}</td>
            <td style="color: ${t.type === 'Income' ? 'var(--accent)' : '#ef4444'}; font-weight:600;">${typeLabel}</td>
            <td>${t.category}</td>
            <td><strong>${t.amount.toLocaleString()} ${unit}</strong></td>
            <td>${t.desc}</td>
            <td>
                <button class="action-btn delete" onclick="deleteTransaction('${t.id}')">${tr('dyn_delete', '🗑️ Delete')}</button>
            </td>
        `;
        tbody.appendChild(trEl);
    });

    if (transactions.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--text-secondary);">No ledger records log.</td></tr>`;
    }

    // Update balances on Finance panel
    if (totalReceiptsEl) totalReceiptsEl.innerText = totalIncome.toLocaleString() + ' ' + unit;
    if (totalExpensesEl) totalExpensesEl.innerText = totalExpense.toLocaleString() + ' ' + unit;
    if (ledgerNetEl) {
        const net = totalIncome - totalExpense;
        ledgerNetEl.innerText = net.toLocaleString() + ' ' + unit;
        ledgerNetEl.style.color = net >= 0 ? 'var(--accent)' : '#ef4444';
    }
}

if (transactionForm) {
    transactionForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const type = document.getElementById('txn-type').value;
        const category = document.getElementById('txn-category').value;
        const amount = parseFloat(document.getElementById('txn-amount').value);
        const desc = document.getElementById('txn-desc').value;

        if (!amount || amount <= 0) {
            alert('Please enter a valid amount.');
            return;
        }

        const transactions = JSON.parse(localStorage.getItem('ics_transactions')) || [];
        
        // Random TxnID generator
        const id = 'TXN-' + Math.floor(100000 + Math.random() * 900000);

        const newTxn = {
            id: id,
            date: new Date().toISOString().substring(0, 10),
            type: type,
            category: category,
            amount: amount,
            desc: desc
        };

        transactions.unshift(newTxn);
        localStorage.setItem('ics_transactions', JSON.stringify(transactions));
        
        alert(`Transaction ${id} registered successfully!`);
        transactionForm.reset();
        renderTransactionsTable();
        renderChart();
        calculateSummaryStats();
    });
}

window.deleteTransaction = function(id) {
    if (confirm('Are you sure you want to delete this transaction record?')) {
        let transactions = JSON.parse(localStorage.getItem('ics_transactions')) || [];
        transactions = transactions.filter(t => t.id !== id);
        localStorage.setItem('ics_transactions', JSON.stringify(transactions));
        renderTransactionsTable();
        renderChart();
        calculateSummaryStats();
    }
};

// 9. Messages Inbox Management
const messageModal = document.getElementById('message-modal');

function renderInboxTable() {
    const messages = JSON.parse(localStorage.getItem('ics_messages')) || [];
    const tbody = document.getElementById('messages-tbody');
    if (!tbody) return;

    tbody.innerHTML = '';
    
    // Sort messages: newest first
    const sorted = [...messages].sort((a,b) => b.id - a.id);

    if (sorted.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-secondary);">Inbox is empty.</td></tr>`;
        return;
    }

    sorted.forEach(m => {
        const trEl = document.createElement('tr');
        const statusKey = m.status && m.status.toLowerCase() === 'unread' ? 'dyn_unread' : 'dyn_read';
        trEl.className = m.status === 'Unread' ? 'unread-row' : '';
        trEl.style.background = m.status === 'Unread' ? 'rgba(245, 158, 11, 0.02)' : '';
        trEl.innerHTML = `
            <td><strong>${m.name}</strong></td>
            <td>${m.email}</td>
            <td>${m.subject}</td>
            <td>${m.date}</td>
            <td><span class="badge ${m.status.toLowerCase()}">${tr(statusKey, m.status)}</span></td>
            <td>
                <div class="action-btn-group">
                    <button class="action-btn read-msg" onclick="openMessageDetail(${m.id})">${tr('dyn_view', '👁️ Read')}</button>
                    <button class="action-btn delete" onclick="deleteMessage(${m.id})">${tr('dyn_delete', '🗑️ Delete')}</button>
                </div>
            </td>
        `;
        tbody.appendChild(trEl);
    });
}

window.openMessageDetail = function(id) {
    const messages = JSON.parse(localStorage.getItem('ics_messages')) || [];
    const messageIndex = messages.findIndex(m => m.id === id);
    if (messageIndex === -1) return;

    const msg = messages[messageIndex];
    
    // Update message modal details
    document.getElementById('msg-detail-sender').innerText = `${msg.name} (${msg.email})`;
    document.getElementById('msg-detail-subject').innerText = msg.subject;
    document.getElementById('msg-detail-date').innerText = msg.date;
    document.getElementById('msg-detail-body').innerText = msg.message;

    // Mark as Read
    if (msg.status === 'Unread') {
        messages[messageIndex].status = 'Read';
        localStorage.setItem('ics_messages', JSON.stringify(messages));
        renderInboxTable();
        calculateSummaryStats();
    }

    if (messageModal) messageModal.style.display = 'flex';
};

window.closeMessageModal = function() {
    if (messageModal) messageModal.style.display = 'none';
};

window.deleteMessage = function(id) {
    if (confirm('Are you sure you want to delete this message from your inbox?')) {
        let messages = JSON.parse(localStorage.getItem('ics_messages')) || [];
        messages = messages.filter(m => m.id !== id);
        localStorage.setItem('ics_messages', JSON.stringify(messages));
        renderInboxTable();
        calculateSummaryStats();
    }
};

// ========================================================
// 10. District Council Executive Body Management (CRUD)
// ========================================================
const DEFAULT_COUNCIL_MEMBERS = [
    { id: 1, name: 'Kamil Ahmed', designation: 'District President', avatar: '' },
    { id: 2, name: 'Motiur Rahman', designation: 'HRD Secretary', avatar: '' },
    { id: 3, name: 'Nazrul Islam', designation: 'Office Secretary', avatar: '' },
    { id: 4, name: 'Abidur Rahman', designation: 'Finance Secretary', avatar: '' }
];

const councilModal = document.getElementById('council-modal');
const councilForm = document.getElementById('council-form');
const councilPhotoInput = document.getElementById('council-photo-input');
const councilPhotoPreview = document.getElementById('council-photo-preview');
const councilPhotoClear = document.getElementById('council-photo-clear');
let editCouncilId = null;
let pendingCouncilAvatar = '';

function getCouncilList() {
    if (!localStorage.getItem('ics_council')) {
        localStorage.setItem('ics_council', JSON.stringify(DEFAULT_COUNCIL_MEMBERS));
    }
    return JSON.parse(localStorage.getItem('ics_council')) || [];
}

function saveCouncilList(list) {
    localStorage.setItem('ics_council', JSON.stringify(list));
}

function updateCouncilPhotoPreview(dataUrl) {
    if (!councilPhotoPreview) return;
    councilPhotoPreview.innerHTML = '';
    if (dataUrl) {
        const img = document.createElement('img');
        img.src = dataUrl;
        img.alt = 'Preview';
        councilPhotoPreview.appendChild(img);
        if (councilPhotoClear) councilPhotoClear.style.display = 'inline-block';
    } else {
        councilPhotoPreview.textContent = '👤';
        if (councilPhotoClear) councilPhotoClear.style.display = 'none';
    }
}

if (councilPhotoInput) {
    councilPhotoInput.addEventListener('change', (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            const img = new Image();
            img.onload = () => {
                const maxDim = 240;
                const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
                const canvas = document.createElement('canvas');
                canvas.width = Math.round(img.width * scale);
                canvas.height = Math.round(img.height * scale);
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                pendingCouncilAvatar = canvas.toDataURL('image/jpeg', 0.85);
                updateCouncilPhotoPreview(pendingCouncilAvatar);
            };
            img.src = ev.target.result;
        };
        reader.readAsDataURL(file);
    });
}

if (councilPhotoClear) {
    councilPhotoClear.addEventListener('click', () => {
        pendingCouncilAvatar = '';
        if (councilPhotoInput) councilPhotoInput.value = '';
        updateCouncilPhotoPreview('');
    });
}

function renderCouncilTable() {
    const tbody = document.getElementById('council-tbody');
    if (!tbody) return;

    const council = getCouncilList();
    tbody.innerHTML = '';

    if (council.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:var(--text-secondary);">No executive council members added yet.</td></tr>`;
        return;
    }

    council.forEach((member, idx) => {
        const trEl = document.createElement('tr');

        const orderTd = document.createElement('td');
        orderTd.innerHTML = `<strong>#${idx + 1}</strong>`;

        const photoTd = document.createElement('td');
        const avatarBox = document.createElement('div');
        avatarBox.className = 'council-table-avatar';
        if (member.avatar) {
            const img = document.createElement('img');
            img.src = member.avatar;
            img.alt = member.name || '';
            avatarBox.appendChild(img);
        } else {
            avatarBox.textContent = '👤';
        }
        photoTd.appendChild(avatarBox);

        const nameTd = document.createElement('td');
        const nameStrong = document.createElement('strong');
        nameStrong.textContent = member.name || '';
        nameTd.appendChild(nameStrong);

        const roleTd = document.createElement('td');
        const roleSpan = document.createElement('span');
        roleSpan.className = 'text-gold';
        roleSpan.style.fontWeight = '600';
        roleSpan.textContent = member.designation || '';
        roleTd.appendChild(roleSpan);

        const actionTd = document.createElement('td');
        const group = document.createElement('div');
        group.className = 'action-btn-group';

        const upBtn = document.createElement('button');
        upBtn.type = 'button';
        upBtn.className = 'action-btn';
        upBtn.title = 'Move Up';
        upBtn.textContent = '↑';
        upBtn.disabled = idx === 0;
        upBtn.onclick = () => moveCouncilMember(member.id, -1);

        const downBtn = document.createElement('button');
        downBtn.type = 'button';
        downBtn.className = 'action-btn';
        downBtn.title = 'Move Down';
        downBtn.textContent = '↓';
        downBtn.disabled = idx === council.length - 1;
        downBtn.onclick = () => moveCouncilMember(member.id, 1);

        const editBtn = document.createElement('button');
        editBtn.type = 'button';
        editBtn.className = 'action-btn edit';
        editBtn.textContent = tr('dyn_edit', '✏️ Edit');
        editBtn.onclick = () => openEditCouncilModal(member.id);

        const delBtn = document.createElement('button');
        delBtn.type = 'button';
        delBtn.className = 'action-btn delete';
        delBtn.textContent = tr('dyn_delete', '🗑️ Delete');
        delBtn.onclick = () => deleteCouncilMember(member.id);

        group.append(upBtn, downBtn, editBtn, delBtn);
        actionTd.appendChild(group);

        trEl.append(orderTd, photoTd, nameTd, roleTd, actionTd);
        tbody.appendChild(trEl);
    });
}

window.openAddCouncilModal = function() {
    editCouncilId = null;
    pendingCouncilAvatar = '';
    if (councilForm) councilForm.reset();
    document.getElementById('council-modal-title').innerText = tr('dyn_modal_add_council', 'Add Council Member');
    updateCouncilPhotoPreview('');
    if (councilModal) councilModal.style.display = 'flex';
};

window.openEditCouncilModal = function(id) {
    const council = getCouncilList();
    const member = council.find(m => m.id === id);
    if (!member) return;

    editCouncilId = id;
    pendingCouncilAvatar = member.avatar || '';
    if (councilPhotoInput) councilPhotoInput.value = '';
    document.getElementById('council-modal-title').innerText = tr('dyn_modal_edit_council', 'Edit Council Member');
    document.getElementById('council-name').value = member.name || '';
    document.getElementById('council-designation').value = member.designation || '';
    updateCouncilPhotoPreview(pendingCouncilAvatar);
    if (councilModal) councilModal.style.display = 'flex';
};

window.closeCouncilModal = function() {
    if (councilModal) councilModal.style.display = 'none';
};

if (councilForm) {
    councilForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('council-name').value.trim();
        const designation = document.getElementById('council-designation').value.trim();
        if (!name || !designation) return;

        let council = getCouncilList();
        if (editCouncilId === null) {
            const nextId = council.length > 0 ? Math.max(...council.map(m => m.id)) + 1 : 1;
            council.push({ id: nextId, name, designation, avatar: pendingCouncilAvatar });
        } else {
            council = council.map(m =>
                m.id === editCouncilId ? { ...m, name, designation, avatar: pendingCouncilAvatar } : m
            );
        }

        saveCouncilList(council);
        closeCouncilModal();
        renderCouncilTable();
    });
}

window.moveCouncilMember = function(id, delta) {
    const council = getCouncilList();
    const index = council.findIndex(m => m.id === id);
    const targetIndex = index + delta;
    if (index < 0 || targetIndex < 0 || targetIndex >= council.length) return;
    [council[index], council[targetIndex]] = [council[targetIndex], council[index]];
    saveCouncilList(council);
    renderCouncilTable();
};

window.deleteCouncilMember = function(id) {
    if (confirm('Are you sure you want to remove this member from the Executive Council?')) {
        const council = getCouncilList().filter(m => m.id !== id);
        saveCouncilList(council);
        renderCouncilTable();
    }
};

window.resetCouncilDefaults = function() {
    if (confirm('Restore the default District Council Executive Body list?')) {
        saveCouncilList(DEFAULT_COUNCIL_MEMBERS);
        renderCouncilTable();
    }
};

// Admin Footer Navigation & Back-to-Top
document.querySelectorAll('[data-admin-nav]').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const target = link.getAttribute('data-admin-nav');
        const menuLink = document.querySelector(`#admin-menu a[data-target="${target}"]`);
        if (menuLink) menuLink.click();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
});

const adminFooterTop = document.getElementById('admin-footer-top');
if (adminFooterTop) {
    adminFooterTop.addEventListener('click', (e) => {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}
const adminFooterTopLink = document.getElementById('admin-footer-top-link');
if (adminFooterTopLink) {
    adminFooterTopLink.addEventListener('click', (e) => {
        e.preventDefault();
        const overviewLink = document.querySelector('#admin-menu a[data-target="dashboard-section"]');
        if (overviewLink) overviewLink.click();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// Language Switch Refresh for Admin Panel
if (window.ICS_I18N) {
    window.ICS_I18N.onChange(() => {
        document.title = tr('dyn_title_admin', 'Admin Dashboard | Bangladesh Islami Chhatrashibir, Sylhet District West');
        calculateSummaryStats();
        renderRecentInquiries();
        renderChart();
        renderCouncilTable();
        renderMembersTable();
        renderNoticesTable();
        renderBranchesTable();
        renderTransactionsTable();
        renderInboxTable();
    });
}

// Start application
checkAuth();
<!-- Firebase App & Realtime Database SDK -->
<script src="https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.12.2/firebase-database-compat.js"></script>

<script>
  // ধাপ ২ থেকে পাওয়া আপনার নিজের কনফিগ কোডটি এখানে বসাবেন
  const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT.firebaseapp.com",
    databaseURL: "https://YOUR_PROJECT-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
  };

  // Firebase চালু করা
  firebase.initializeApp(firebaseConfig);
  const db = firebase.database();
</script>

<!-- এরপর আপনার আগের স্ক্রিপ্ট থাকবে -->
<script src="i18n.js?v=1"></script>
<script src="main.js?v=4"></script>

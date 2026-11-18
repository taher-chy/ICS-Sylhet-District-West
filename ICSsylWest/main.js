// Database Seeding Logic (run on load)
function seedDatabase() {
    // 1. Notices / News
    if (!localStorage.getItem('ics_notices')) {
        const defaultNotices = [
            {
                id: 1,
                date: '2026-06-15',
                category: 'Office Notice',
                title: 'Monthly Workers Meeting - June 2026',
                text: 'The monthly review and planning session for Sylhet District West will be held on Friday, June 19th, at 3:00 PM at the district office. All department secretaries are requested to join with report files.'
            },
            {
                id: 2,
                date: '2026-06-12',
                category: 'HRD Department',
                title: 'Register for Leadership Development Course (Batch 12)',
                text: 'Applications are invited for the Leadership Development Program commencing July 1st. Training includes organizational leadership, public speech, and social management modules.'
            },
            {
                id: 3,
                date: '2026-06-08',
                category: 'Finance Department',
                title: 'Sylhet Flood Welfare Donation Collection',
                text: 'We are raising funds for medical aid and emergency food supply in flood-impacted zones of West Sylhet. Please donate generously via the Finance portal.'
            }
        ];
        localStorage.setItem('ics_notices', JSON.stringify(defaultNotices));
    }

    // 2. Members (HRD)
    if (!localStorage.getItem('ics_members') || !localStorage.getItem('ics_members').includes('সদস্য')) {
        const defaultMembers = [
            { id: 101, name: 'Kamran Chowdhury', rank: 'সদস্য (Member)', branch: 'Beanibazar', status: 'Active', training: '2026-06-01' },
            { id: 102, name: 'Tanveer Ahmed', rank: 'সাথী (Associate)', branch: 'Sylhet Sadar', status: 'Active', training: '2026-05-10' },
            { id: 103, name: 'Mahdi Al-Hasan', rank: 'সদস্য প্রার্থী (Member Candidate)', branch: 'Balaganj', status: 'Active', training: '2026-06-14' },
            { id: 104, name: 'Jamil Hasan', rank: 'সাথী প্রার্থী (Associate Candidate)', branch: 'Fenchuganj', status: 'Active', training: '2026-05-24' },
            { id: 105, name: 'Rayhan Chowdhury', rank: 'সাথী প্রার্থী (Associate Candidate)', branch: 'Golapganj', status: 'Active', training: '2026-03-15' }
        ];
        localStorage.setItem('ics_members', JSON.stringify(defaultMembers));
    }

    // 3. Transactions (Finance)
    if (!localStorage.getItem('ics_transactions')) {
        const defaultTransactions = [
            { id: 'TXN-001', date: '2026-06-15', type: 'Income', category: 'Monthly Subscription', amount: 15000, desc: 'Rukn subscription collection' },
            { id: 'TXN-002', date: '2026-06-14', type: 'Expense', category: 'Office Rent', amount: 8000, desc: 'District West Office payment' },
            { id: 'TXN-003', date: '2026-06-12', type: 'Income', category: 'Flood Relief Donation', amount: 45000, desc: 'General public donation drive' },
            { id: 'TXN-004', date: '2026-06-10', type: 'Expense', category: 'Social Project', amount: 12000, desc: 'Free medical camp medicine purchase' },
            { id: 'TXN-005', date: '2026-06-05', type: 'Income', category: 'Book Sale', amount: 4800, desc: 'HRD Islamic syllabus book distribution' }
        ];
        localStorage.setItem('ics_transactions', JSON.stringify(defaultTransactions));
    }

    // 4. Messages (Inbox)
    if (!localStorage.getItem('ics_messages')) {
        const defaultMessages = [
            {
                id: 1,
                date: '2026-06-15 14:30',
                name: 'Kazi Mahbub',
                email: 'mahbub@gmail.com',
                subject: 'Welfare Query',
                message: 'I want to establish a small free library in our union branch. How can the Office Department help us with Islamic books?',
                status: 'Unread'
            },
            {
                id: 2,
                date: '2026-06-14 10:15',
                name: 'Dr. Shahab Uddin',
                email: 'shahab.med@outlook.com',
                subject: 'Medical Camp Volunteering',
                message: 'Assalamu alaikum. I am a medical practitioner in Sylhet. I would like to volunteer in your upcoming weekly free healthcare clinics.',
                status: 'Read'
            }
        ];
        localStorage.setItem('ics_messages', JSON.stringify(defaultMessages));
    }

    // 5. District Council Executive Body
    if (!localStorage.getItem('ics_council')) {
        const defaultCouncil = [
            { id: 1, name: 'Kamil Ahmed', designation: 'District President', avatar: '' },
            { id: 2, name: 'Motiur Rahman', designation: 'HRD Secretary', avatar: '' },
            { id: 3, name: 'Nazrul Islam', designation: 'Office Secretary', avatar: '' },
            { id: 4, name: 'Abidur Rahman', designation: 'Finance Secretary', avatar: '' }
        ];
        localStorage.setItem('ics_council', JSON.stringify(defaultCouncil));
    }
}

// Initialize and Seed Data
seedDatabase();

// DOM Element References
const navbar = document.querySelector('.navbar');
const hamburgerBtn = document.getElementById('hamburger-btn');
const mobileDrawer = document.getElementById('mobile-drawer');
const mobileDrawerOverlay = document.getElementById('mobile-drawer-overlay');
const drawerCloseBtn = document.getElementById('drawer-close-btn');
const mainNavLinks = document.getElementById('main-nav-links');
const navItems = document.querySelectorAll('#main-nav-links .nav-item');
const navSlidingPill = document.getElementById('nav-sliding-pill');
const deptPages = document.querySelectorAll('.dept-page');
const tickerScroll = document.getElementById('ticker-scroll');
const noticeboardList = document.getElementById('noticeboard-list');

// 1. Sticky Navbar Effect with ambient transition
if (navbar) {
    window.addEventListener('scroll', () => {
        if (window.scrollY > 30) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }, { passive: true });
}

// 2. Sliding Indicator Capsule Controller
function updateSlidingPill() {
    const activeItem = document.querySelector('#main-nav-links .nav-item.active');
    const navWrapper = document.querySelector('.nav-links-wrapper');
    if (!navSlidingPill || !activeItem || !navWrapper) return;

    if (window.getComputedStyle(navWrapper).display === 'none') return;

    const wrapperRect = navWrapper.getBoundingClientRect();
    const itemRect = activeItem.getBoundingClientRect();

    const left = itemRect.left - wrapperRect.left;
    const width = itemRect.width;

    navSlidingPill.style.transform = `translateX(${left}px)`;
    navSlidingPill.style.width = `${width}px`;
    navSlidingPill.style.opacity = '1';

    const dept = activeItem.getAttribute('data-dept') || 'home';
    navSlidingPill.setAttribute('data-theme', dept);
}

// Hover preview glide on desktop
if (mainNavLinks && navSlidingPill) {
    navItems.forEach(item => {
        item.addEventListener('mouseenter', () => {
            const navWrapper = document.querySelector('.nav-links-wrapper');
            if (!navWrapper || window.getComputedStyle(navWrapper).display === 'none') return;
            const wrapperRect = navWrapper.getBoundingClientRect();
            const itemRect = item.getBoundingClientRect();
            navSlidingPill.style.transform = `translateX(${itemRect.left - wrapperRect.left}px)`;
            navSlidingPill.style.width = `${itemRect.width}px`;
            const dept = item.getAttribute('data-dept') || 'home';
            navSlidingPill.setAttribute('data-theme', dept);
        });
        item.addEventListener('mouseleave', () => {
            updateSlidingPill();
        });
    });
}

window.addEventListener('resize', () => {
    updateSlidingPill();
});

// 3. Mobile Drawer Controls
function openMobileDrawer() {
    if (hamburgerBtn) hamburgerBtn.classList.add('active');
    if (mobileDrawer) mobileDrawer.classList.add('active');
    if (mobileDrawerOverlay) mobileDrawerOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeMobileDrawer() {
    if (hamburgerBtn) hamburgerBtn.classList.remove('active');
    if (mobileDrawer) mobileDrawer.classList.remove('active');
    if (mobileDrawerOverlay) mobileDrawerOverlay.classList.remove('active');
    document.body.style.overflow = '';
}

if (hamburgerBtn) {
    hamburgerBtn.addEventListener('click', () => {
        if (mobileDrawer && mobileDrawer.classList.contains('active')) {
            closeMobileDrawer();
        } else {
            openMobileDrawer();
        }
    });
}

if (drawerCloseBtn) drawerCloseBtn.addEventListener('click', closeMobileDrawer);
if (mobileDrawerOverlay) mobileDrawerOverlay.addEventListener('click', closeMobileDrawer);

// Close on escape
window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMobileDrawer();
});

// Close mobile drawer on link click
document.querySelectorAll('.mobile-dept-menu a').forEach(link => {
    link.addEventListener('click', () => {
        closeMobileDrawer();
    });
});

// Helper for i18n lookup
function tr(key, fallback = '') {
    return window.ICS_I18N ? window.ICS_I18N.t(key) : fallback;
}

// 4. Department Router & SPA Navigation Controller
function getDepartmentTitle(dept) {
    const map = {
        home: 'dyn_title_home',
        hrd: 'dyn_title_hrd',
        office: 'dyn_title_office',
        finance: 'dyn_title_finance'
    };
    return tr(map[dept] || 'dyn_title_home', 'Bangladesh Islami Chhatrashibir, Sylhet District West');
}

function resolveRoute(hashString) {
    if (!hashString) return { dept: 'home', section: null };
    
    let clean = hashString.replace(/^#/, '').trim();
    
    if (['home', 'hrd', 'office', 'finance'].includes(clean)) {
        return { dept: clean, section: null };
    }

    if (clean.includes('/')) {
        const parts = clean.split('/');
        return { dept: parts[0], section: parts[1] };
    }

    if (clean.startsWith('hrd-')) {
        return { dept: 'hrd', section: clean };
    }
    if (clean.startsWith('office-')) {
        return { dept: 'office', section: clean };
    }
    if (clean.startsWith('finance-')) {
        return { dept: 'finance', section: clean };
    }
    if (clean.startsWith('home-')) {
        return { dept: 'home', section: clean };
    }
    if (clean === 'contact') {
        return { dept: 'home', section: 'contact' };
    }

    return { dept: 'home', section: null };
}

function switchPage(targetDept, targetSection = null) {
    const validDepts = ['home', 'hrd', 'office', 'finance'];
    if (!validDepts.includes(targetDept)) {
        targetDept = 'home';
    }

    // 1. Update active state in desktop navbar
    navItems.forEach(item => {
        if (item.getAttribute('data-dept') === targetDept) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });

    // 2. Update active state in mobile drawer cards
    document.querySelectorAll('.mobile-dept-card').forEach(card => {
        if (card.getAttribute('data-dept') === targetDept) {
            card.classList.add('active');
        } else {
            card.classList.remove('active');
        }
    });

    // 3. Update department active page container
    deptPages.forEach(page => {
        if (page.id === targetDept) {
            page.classList.add('active');
            page.style.display = 'block';
        } else {
            page.classList.remove('active');
            page.style.display = 'none';
        }
    });

    // 4. Update Navbar Theme & Body Classes
    if (navbar) {
        navbar.classList.remove('dept-theme-home', 'dept-theme-hrd', 'dept-theme-office', 'dept-theme-finance');
        navbar.classList.add(`dept-theme-${targetDept}`);
    }
    document.body.classList.remove('theme-home', 'theme-hrd', 'theme-office', 'theme-finance');
    document.body.classList.add(`theme-${targetDept}`);

    // 5. Update Document Title
    document.title = getDepartmentTitle(targetDept);

    // 6. Update sliding indicator pill
    setTimeout(updateSlidingPill, 30);

    // 7. Trigger specific department view updates
    if (targetDept === 'hrd') {
        loadHRDWorkforce();
    } else if (targetDept === 'office') {
        loadOfficeNoticeboard();
        renderPublicBranches();
    } else if (targetDept === 'finance') {
        recalculateFinanceGauge();
        renderPublicLedger();
    }

    // 8. Handle section scroll if specified
    if (targetSection) {
        setTimeout(() => {
            const targetEl = document.getElementById(targetSection);
            if (targetEl) {
                targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
                updateSubnavActiveChip(targetDept, targetSection);
            }
        }, 120);
    } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

// 5. Department Sub-Navbar Scrollspy & Chip Interactivity
function updateSubnavActiveChip(deptId, activeSectionId) {
    const subnav = document.getElementById(`subnav-${deptId}`);
    if (!subnav) return;
    const chips = subnav.querySelectorAll('.subnav-chip');
    chips.forEach(chip => {
        const target = chip.getAttribute('data-target') || chip.getAttribute('href').replace('#', '');
        if (target === activeSectionId) {
            chip.classList.add('active');
            chip.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        } else {
            chip.classList.remove('active');
        }
    });
}

// Setup smooth click handlers for all subnav chips
document.querySelectorAll('.subnav-chip').forEach(chip => {
    chip.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = chip.getAttribute('data-target') || chip.getAttribute('href').replace('#', '');
        const homePage = document.getElementById('home');
        if (targetId === 'contact' && homePage && !homePage.classList.contains('active')) {
            switchPage('home', 'contact');
            history.pushState(null, '', '#contact');
            return;
        }
        const targetEl = document.getElementById(targetId);
        if (targetEl) {
            targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
            const parentSubnav = chip.closest('.dept-subnav-bar');
            if (parentSubnav) {
                parentSubnav.querySelectorAll('.subnav-chip').forEach(c => c.classList.remove('active'));
                chip.classList.add('active');
            }
            history.pushState(null, '', `#${targetId}`);
        }
    });
});

// Scrollspy for sub-navbar sections
window.addEventListener('scroll', () => {
    const activePage = document.querySelector('.dept-page.active');
    if (!activePage) return;
    const deptId = activePage.id;
    const subnav = document.getElementById(`subnav-${deptId}`);
    if (!subnav) return;

    const chips = subnav.querySelectorAll('.subnav-chip');
    let currentActive = null;

    chips.forEach(chip => {
        const targetId = chip.getAttribute('data-target') || chip.getAttribute('href').replace('#', '');
        const sectionEl = document.getElementById(targetId);
        if (sectionEl) {
            const rect = sectionEl.getBoundingClientRect();
            if (rect.top <= 220 && rect.bottom >= 120) {
                currentActive = targetId;
            }
        }
    });

    if (currentActive) {
        updateSubnavActiveChip(deptId, currentActive);
    }
}, { passive: true });

// Listen for hash changes in URL
window.addEventListener('hashchange', () => {
    const route = resolveRoute(window.location.hash);
    switchPage(route.dept, route.section);
});

// Initialize Route on initial page load
const initialRoute = resolveRoute(window.location.hash);
switchPage(initialRoute.dept, initialRoute.section);
setTimeout(updateSlidingPill, 100);

// 4. Render News Ticker Items
function loadNewsTicker() {
    const notices = JSON.parse(localStorage.getItem('ics_notices')) || [];
    if (tickerScroll) {
        tickerScroll.innerHTML = '';
        if (notices.length === 0) {
            tickerScroll.innerHTML = `<span class="ticker-item">${tr('dyn_no_updates', 'No updates available.')}</span>`;
            return;
        }
        notices.forEach(notice => {
            const item = document.createElement('span');
            item.className = 'ticker-item';
            item.innerHTML = `📢 <strong>${notice.category}:</strong> ${notice.title} &nbsp; | &nbsp;`;
            tickerScroll.appendChild(item);
        });
    }
}
loadNewsTicker();

// 5. Render Office Noticeboard
function loadOfficeNoticeboard() {
    const notices = JSON.parse(localStorage.getItem('ics_notices')) || [];
    if (noticeboardList) {
        noticeboardList.innerHTML = '';
        if (notices.length === 0) {
            noticeboardList.innerHTML = `<p style="color: var(--text-secondary); text-align: center; padding: 20px;">${tr('dyn_no_notices', 'No administrative notices posted.')}</p>`;
            return;
        }
        
        // Sort by id descending (assuming higher id is newer)
        const sorted = [...notices].sort((a, b) => b.id - a.id);
        
        sorted.forEach(notice => {
            const noticeItem = document.createElement('div');
            noticeItem.className = 'notice-item';
            noticeItem.innerHTML = `
                <div class="notice-body">
                    <div class="notice-meta">
                        <span>📅 Date: ${notice.date}</span>
                        <span>🏷️ Sector: ${notice.category}</span>
                    </div>
                    <h4 class="notice-title">${notice.title}</h4>
                    <p class="notice-text">${notice.text}</p>
                </div>
                <div class="notice-actions">
                    <button class="btn-download" onclick="alert('Notice download is mocked. File ID: NOTICE-${notice.id}')">
                        📄 PDF
                    </button>
                </div>
            `;
            noticeboardList.appendChild(noticeItem);
        });
    }
}
loadOfficeNoticeboard();

// 6. Contact Form Submission Handler
const contactForm = document.getElementById('ics-contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const name = document.getElementById('contact-name').value;
        const email = document.getElementById('contact-email').value;
        const subject = document.getElementById('contact-subject').value;
        const message = document.getElementById('contact-message').value;

        if (!name || !email || !subject || !message) {
            alert('Please fill out all fields.');
            return;
        }

        // Retrieve existing messages from DB
        const messages = JSON.parse(localStorage.getItem('ics_messages')) || [];
        
        // Create new message object
        const newMessage = {
            id: Date.now(),
            date: new Date().toISOString().replace('T', ' ').substring(0, 16),
            name: name,
            email: email,
            subject: subject,
            message: message,
            status: 'Unread'
        };

        messages.push(newMessage);
        localStorage.setItem('ics_messages', JSON.stringify(messages));

        // Alert user of success
        alert(`Assalamu alaikum, ${name}. Your message has been received! The Office Department will review it soon.`);
        contactForm.reset();
    });
}

// 7. Donation Form Interactive Amount & Submission Handler
const amountButtons = document.querySelectorAll('.amount-btn');
const amountInput = document.getElementById('donation-amount');

amountButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        // Toggle active states on buttons
        amountButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        // Set input value
        if (amountInput) {
            amountInput.value = btn.getAttribute('data-value');
        }
    });
});

if (amountInput) {
    amountInput.addEventListener('input', () => {
        // Clear active buttons if custom value is typed
        amountButtons.forEach(b => b.classList.remove('active'));
    });
}

const donationForm = document.getElementById('ics-donation-form');
if (donationForm) {
    donationForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const name = document.getElementById('donor-name').value || 'Anonymous Contributor';
        const contact = document.getElementById('donor-contact').value || 'N/A';
        const amount = parseFloat(document.getElementById('donation-amount').value);
        const method = document.getElementById('donation-method').value;
        const txnid = document.getElementById('donation-txn').value;

        if (!amount || amount <= 0) {
            alert('Please enter a valid donation amount.');
            return;
        }
        if (!txnid) {
            alert('Please enter your payment Transaction ID (TxnID) for validation.');
            return;
        }

        // Update Finance Database (add as Income transaction)
        const transactions = JSON.parse(localStorage.getItem('ics_transactions')) || [];
        
        const newTxn = {
            id: txnid.toUpperCase(),
            date: new Date().toISOString().substring(0, 10),
            type: 'Income',
            category: 'Relief & Welfare Donation',
            amount: amount,
            desc: `Online donation by ${name} (${method}) - Contact: ${contact}`
        };

        transactions.unshift(newTxn); // add to top of stack
        localStorage.setItem('ics_transactions', JSON.stringify(transactions));

        // Trigger visual success modal/alert
        alert(`Jazakallahu Khairan! Your contribution of ${amount} BDT via ${method} has been logged. Transaction ID: ${txnid}. Our Finance Department will verify this transaction.`);
        donationForm.reset();
        amountButtons.forEach(b => b.classList.remove('active'));

        // If the gauge element is present on this page, recalculate
        recalculateFinanceGauge();
        renderPublicLedger();
    });
}

// 8. Finance Gauge Calculations
function recalculateFinanceGauge() {
    const transactions = JSON.parse(localStorage.getItem('ics_transactions')) || [];
    let totalIncome = 0;
    let totalExpense = 0;

    transactions.forEach(t => {
        if (t.type === 'Income') {
            totalIncome += t.amount;
        } else {
            totalExpense += t.amount;
        }
    });

    const netBalance = totalIncome - totalExpense;
    
    // Update labels in HTML
    const incLabel = document.getElementById('gauge-total-income');
    const expLabel = document.getElementById('gauge-total-expense');
    const netLabel = document.getElementById('gauge-net-balance');
    const gaugeVal = document.getElementById('gauge-value-text');
    const gaugeBar = document.getElementById('gauge-active-bar');

    const unit = tr('dyn_currency', 'BDT');
    if (incLabel) incLabel.innerText = totalIncome.toLocaleString() + ' ' + unit;
    if (expLabel) expLabel.innerText = totalExpense.toLocaleString() + ' ' + unit;
    if (netLabel) netLabel.innerText = netBalance.toLocaleString() + ' ' + unit;

    // Target collection progress calculations (let's say target is 500,000 BDT)
    const target = 500000;
    const progressPercent = Math.min(Math.round((totalIncome / target) * 100), 100);

    if (gaugeVal) {
        gaugeVal.innerText = progressPercent + '%';
    }

    // Gauge stroke dashoffset math:
    // SVG path length for radius-80 semicircle = π * 80 ≈ 252
    // 252 offset = empty (0%), 0 offset = full (100%)
    if (gaugeBar) {
        const strokeOffset = 252 - (252 * (progressPercent / 100));
        gaugeBar.style.strokeDashoffset = strokeOffset;
    }
}

// 8.1 Public Financial Transparency Ledger Controller
function renderPublicLedger() {
    const tbody = document.getElementById('public-ledger-tbody');
    if (!tbody) return;

    const transactions = JSON.parse(localStorage.getItem('ics_transactions')) || [];
    const searchInput = document.getElementById('public-txn-search');
    const filterSelect = document.getElementById('public-txn-filter');

    const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
    const filterType = filterSelect ? filterSelect.value : '';

    tbody.innerHTML = '';

    const filtered = transactions.filter(t => {
        const matchesSearch = !query || 
            (t.id && t.id.toLowerCase().includes(query)) ||
            (t.category && t.category.toLowerCase().includes(query)) ||
            (t.desc && t.desc.toLowerCase().includes(query));
        const matchesType = !filterType || t.type === filterType;
        return matchesSearch && matchesType;
    });

    if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-secondary); padding: 25px;">${tr('dyn_no_ledger', 'No matching public transactions found.')}</td></tr>`;
        return;
    }

    const unit = tr('dyn_currency', 'BDT');
    filtered.forEach(txn => {
        const trEl = document.createElement('tr');
        const isIncome = txn.type === 'Income';
        const typeLabel = isIncome ? tr('dyn_income', '↑ Income') : tr('dyn_expense', '↓ Expense');
        trEl.innerHTML = `
            <td><strong>${txn.id}</strong></td>
            <td>${txn.date}</td>
            <td><span class="badge-tag" style="margin-bottom:0;">${txn.category}</span></td>
            <td><span class="${isIncome ? 'badge-income' : 'badge-expense'}">${typeLabel}</span></td>
            <td class="${isIncome ? 'amount-income' : 'amount-expense'}">${isIncome ? '+' : '-'}${Number(txn.amount).toLocaleString()} ${unit}</td>
            <td style="font-size: 0.85rem; color: var(--text-secondary);">${txn.desc || 'General Transaction'}</td>
        `;
        tbody.appendChild(trEl);
    });
}

// Hook Search & Filter for Public Ledger
const publicTxnSearch = document.getElementById('public-txn-search');
const publicTxnFilter = document.getElementById('public-txn-filter');
if (publicTxnSearch) publicTxnSearch.addEventListener('input', renderPublicLedger);
if (publicTxnFilter) publicTxnFilter.addEventListener('change', renderPublicLedger);

// Run calculations on load
recalculateFinanceGauge();
renderPublicLedger();

// 9. HRD Workforce List Controller
function loadHRDWorkforce() {
    const members = JSON.parse(localStorage.getItem('ics_members')) || [];
    
    const membersTbody = document.getElementById('hrd-members-list-tbody');
    const memberCandsTbody = document.getElementById('hrd-member-cands-list-tbody');
    const sathisTbody = document.getElementById('hrd-sathis-list-tbody');
    const sathiCandsTbody = document.getElementById('hrd-sathi-cands-list-tbody');

    if (!membersTbody) return; // Not loaded on home screen yet

    // Clean tables
    membersTbody.innerHTML = '';
    memberCandsTbody.innerHTML = '';
    sathisTbody.innerHTML = '';
    sathiCandsTbody.innerHTML = '';

    let counts = { member: 0, memberCand: 0, sathi: 0, sathiCand: 0 };

    members.forEach(m => {
        const trEl = document.createElement('tr');
        const statusKey = m.status && m.status.toLowerCase() === 'active' ? 'dyn_active' : 'dyn_inactive';
        const statusText = tr(statusKey, m.status);

        const idTd = document.createElement('td');
        const idStrong = document.createElement('strong');
        idStrong.textContent = m.id;
        idTd.appendChild(idStrong);

        const nameTd = document.createElement('td');
        nameTd.textContent = m.name || '';

        const branchTd = document.createElement('td');
        branchTd.textContent = m.branch || '';

        const statusTd = document.createElement('td');
        const badge = document.createElement('span');
        badge.className = `badge ${(m.status || 'Active').toLowerCase()}`;
        badge.textContent = statusText;
        statusTd.appendChild(badge);

        trEl.append(idTd, nameTd, branchTd, statusTd);

        const rankNorm = String(m.rank || '').toLowerCase();
        if (m.rank === 'সদস্য (Member)' || (rankNorm.includes('সদস্য') && !rankNorm.includes('প্রার্থী')) || (rankNorm === 'member')) {
            membersTbody.appendChild(trEl);
            counts.member++;
        } else if (m.rank === 'সদস্য প্রার্থী (Member Candidate)' || rankNorm.includes('সদস্য প্রার্থী') || rankNorm.includes('member candidate')) {
            memberCandsTbody.appendChild(trEl);
            counts.memberCand++;
        } else if (m.rank === 'সাথী (Associate)' || (rankNorm.includes('সাথী') && !rankNorm.includes('প্রার্থী')) || rankNorm === 'associate') {
            sathisTbody.appendChild(trEl);
            counts.sathi++;
        } else if (m.rank === 'সাথী প্রার্থী (Associate Candidate)' || rankNorm.includes('সাথী প্রার্থী') || rankNorm.includes('associate candidate')) {
            sathiCandsTbody.appendChild(trEl);
            counts.sathiCand++;
        }
    });

    // Handle empty table states
    if (counts.member === 0) {
        membersTbody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: var(--text-secondary); padding: 15px;">${tr('dyn_wf_empty_1', 'No members found in this list.')}</td></tr>`;
    }
    if (counts.memberCand === 0) {
        memberCandsTbody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: var(--text-secondary); padding: 15px;">${tr('dyn_wf_empty_2', 'No member candidates found in this list.')}</td></tr>`;
    }
    if (counts.sathi === 0) {
        sathisTbody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: var(--text-secondary); padding: 15px;">${tr('dyn_wf_empty_3', 'No associates found in this list.')}</td></tr>`;
    }
    if (counts.sathiCand === 0) {
        sathiCandsTbody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: var(--text-secondary); padding: 15px;">${tr('dyn_wf_empty_4', 'No associate candidates found in this list.')}</td></tr>`;
    }
}

// Switch Workforce Tab View
window.switchWorkforceTab = function(tabId) {
    const tabBtns = document.querySelectorAll('.hrd-tabs-nav .amount-btn');
    tabBtns.forEach(btn => {
        if (btn.id === `tab-btn-${tabId}`) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    const containers = document.querySelectorAll('.workforce-list-container');
    containers.forEach(box => {
        if (box.id === `workforce-${tabId}`) {
            box.style.display = 'block';
        } else {
            box.style.display = 'none';
        }
    });
};

// Run workforce calculations on load
loadHRDWorkforce();

// Back to top & footer smooth scroll support
const footerTopBtn = document.getElementById('footer-top-btn');
if (footerTopBtn) {
    footerTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}
document.querySelectorAll('.footer-scroll-top').forEach(link => {
    link.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
});

// Render District Council Executive Body
function renderExecutiveCouncil() {
    const grid = document.getElementById('home-council-grid');
    if (!grid) return;

    const council = JSON.parse(localStorage.getItem('ics_council')) || [];
    grid.innerHTML = '';

    if (council.length === 0) {
        const empty = document.createElement('p');
        empty.style.cssText = 'grid-column: 1 / -1; text-align: center; color: var(--text-secondary);';
        empty.textContent = tr('dyn_no_council', 'Executive council members will be updated soon.');
        grid.appendChild(empty);
        return;
    }

    council.forEach(member => {
        const card = document.createElement('div');
        card.className = 'council-card';

        const avatarDiv = document.createElement('div');
        avatarDiv.className = 'council-avatar';
        if (member.avatar) {
            const img = document.createElement('img');
            img.src = member.avatar;
            img.alt = member.name || 'Executive Member';
            avatarDiv.appendChild(img);
        } else {
            avatarDiv.textContent = '👤';
        }

        const nameEl = document.createElement('h4');
        nameEl.className = 'council-name';
        nameEl.textContent = member.name || '';

        const roleEl = document.createElement('p');
        roleEl.className = 'council-designation';
        roleEl.textContent = member.designation || '';

        card.appendChild(avatarDiv);
        card.appendChild(nameEl);
        card.appendChild(roleEl);
        grid.appendChild(card);
    });
}

renderExecutiveCouncil();

// Render Sylhet District West Branches (Office Department)
function renderPublicBranches() {
    const grid = document.getElementById('public-branches-grid');
    const badge = document.getElementById('public-branch-count-badge');
    const homeStat = document.getElementById('home-stat-branches');
    const branches = JSON.parse(localStorage.getItem('ics_branches')) || [];

    if (homeStat) {
        homeStat.textContent = branches.length > 0 ? String(branches.length) : '17';
    }
    if (badge) {
        badge.textContent = `${branches.length} / 17`;
    }
    if (!grid) return;

    grid.innerHTML = '';
    if (branches.length === 0) {
        const empty = document.createElement('p');
        empty.style.cssText = 'grid-column: 1 / -1; text-align: center; color: var(--text-secondary); padding: 14px;';
        empty.textContent = tr('dyn_no_branches', 'No branches have been added yet. Add the 17 branches from Admin Portal -> Office Department.');
        grid.appendChild(empty);
        return;
    }

    const typeMap = {
        'Thana / Upazila': 'opt_btype_thana',
        'College / Campus': 'opt_btype_college',
        'Union / Ward': 'opt_btype_union',
        'Other': 'opt_btype_other'
    };

    branches.forEach((branch, idx) => {
        const card = document.createElement('div');
        card.className = 'branch-card';

        const num = document.createElement('div');
        num.className = 'branch-index-badge';
        num.textContent = String(idx + 1);

        const info = document.createElement('div');
        info.className = 'branch-card-info';

        const nameEl = document.createElement('div');
        nameEl.className = 'branch-card-name';
        nameEl.textContent = branch.name || '';

        const metaEl = document.createElement('div');
        metaEl.className = 'branch-card-meta';
        const typeLabel = typeMap[branch.type] ? tr(typeMap[branch.type], branch.type) : (branch.type || '');
        const areaPart = branch.area ? `${branch.area} • ` : '';
        metaEl.textContent = `${areaPart}${typeLabel}`;

        info.append(nameEl, metaEl);
        card.append(num, info);
        grid.appendChild(card);
    });
}

renderPublicBranches();

// Render Office Contact Information (from Admin Panel)
function renderContactInfo() {
    const saved = JSON.parse(localStorage.getItem('ics_contact_info') || 'null');
    if (!saved) return;

    const isBn = window.ICS_I18N && window.ICS_I18N.getLang() === 'bn';
    const locEl = document.getElementById('public-contact-location');
    const phoneEl = document.getElementById('public-contact-phone');
    const noteEl = document.getElementById('public-contact-phone-note');
    const waEl = document.getElementById('public-contact-whatsapp');
    const emailEl = document.getElementById('public-contact-email');

    if (locEl) {
        const locVal = isBn ? (saved.locationBn || saved.locationEn) : (saved.locationEn || saved.locationBn);
        if (locVal) locEl.textContent = locVal;
    }
    if (phoneEl && saved.phone) {
        phoneEl.textContent = saved.phone;
        phoneEl.setAttribute('href', `tel:${saved.phone.replace(/\s+/g, '')}`);
    }
    if (noteEl) {
        const noteVal = isBn ? (saved.phoneNoteBn || saved.phoneNoteEn) : (saved.phoneNoteEn || saved.phoneNoteBn);
        if (noteVal !== undefined) noteEl.textContent = noteVal;
    }
    if (waEl && saved.whatsapp) {
        waEl.textContent = saved.whatsapp;
        const cleanDigits = saved.whatsapp.replace(/[^\d]/g, '');
        const waDigits = cleanDigits.startsWith('01') && cleanDigits.length === 11
            ? `88${cleanDigits}`
            : cleanDigits;
        if (waDigits) waEl.setAttribute('href', `https://wa.me/${waDigits}`);
    }
    if (emailEl && saved.email) {
        emailEl.textContent = saved.email;
        emailEl.setAttribute('href', `mailto:${saved.email}`);
    }
}

renderContactInfo();
document.addEventListener('DOMContentLoaded', renderContactInfo);

window.addEventListener('storage', (e) => {
    if (e.key === 'ics_council') {
        renderExecutiveCouncil();
    }
    if (e.key === 'ics_branches') {
        renderPublicBranches();
    }
    if (e.key === 'ics_members') {
        loadHRDWorkforce();
    }
    if (e.key === 'ics_notices') {
        loadNewsTicker();
        loadOfficeNoticeboard();
    }
    if (e.key === 'ics_transactions') {
        recalculateFinanceGauge();
        renderPublicLedger();
    }
    if (e.key === 'ics_contact_info') {
        renderContactInfo();
    }
});

// Expose refresh function to other scopes if needed (like window)
window.refreshMainSiteState = function() {
    loadNewsTicker();
    loadOfficeNoticeboard();
    renderPublicBranches();
    recalculateFinanceGauge();
    renderPublicLedger();
    loadHRDWorkforce();
    renderExecutiveCouncil();
    renderContactInfo();
};

if (window.ICS_I18N) {
    window.ICS_I18N.onChange(() => {
        const activePage = document.querySelector('.dept-page.active');
        const activeDept = activePage ? activePage.id : 'home';
        document.title = getDepartmentTitle(activeDept);
        window.refreshMainSiteState();
        setTimeout(updateSlidingPill, 30);
    });
}

// ================================================================
// BELL NOTIFICATION SYSTEM
// ================================================================

let bellUserId = null;
let bellUnsub = null;
let notifiedRanks = new Set(); // ট্র্যাক রাখার জন্য

function initBell(userId) {
    if (!userId) return;
    bellUserId = userId;
    loadUnreadCount(userId);
    setupBellClick();
    // র‍্যাংক চেক করার জন্য লিডারবোর্ড রেন্ডারের পর কল হবে
}

function setupBellClick() {
    const container = document.getElementById('bellContainer');
    const dropdown = document.getElementById('notificationDropdown');
    if (!container || !dropdown) return;

    container.addEventListener('click', function(e) {
        e.stopPropagation();
        if (dropdown.style.display === 'block') {
            dropdown.style.display = 'none';
        } else {
            renderNotifications(bellUserId);
            dropdown.style.display = 'block';
        }
    });

    document.addEventListener('click', function() {
        dropdown.style.display = 'none';
    });

    // Mark all read
    document.getElementById('markAllReadBtn')?.addEventListener('click', function() {
        markAllAsRead(bellUserId);
    });
}

function loadUnreadCount(userId) {
    if (bellUnsub) bellUnsub();
    bellUnsub = db.collection('users').doc(userId)
        .collection('notifications')
        .where('read', '==', false)
        .onSnapshot((snapshot) => {
            const count = snapshot.size;
            updateBellBadge(count);
        }, (error) => {
            console.error('Notification listener error:', error);
        });
}

function updateBellBadge(count) {
    const badge = document.getElementById('bellBadge');
    if (!badge) return;
    if (count > 0) {
        badge.textContent = count > 99 ? '99+' : count;
        badge.style.display = 'block';
    } else {
        badge.style.display = 'none';
    }
}

async function checkForRankNotifications(userId, rank) {
    if (!userId || rank < 1 || rank > 5) return;
    const key = `rank_${rank}`;
    if (notifiedRanks.has(key)) return; // ইতিমধ্যে নোটিফিকেশন পাঠানো হয়েছে

    // চেক করুন এই র‍্যাংকের জন্য আগে নোটিফিকেশন আছে কিনা
    const existing = await db.collection('users').doc(userId)
        .collection('notifications')
        .where('rank', '==', rank)
        .get();

    if (!existing.empty) {
        // ইতিমধ্যে নোটিফিকেশন আছে, তাই আর যোগ করবেন না
        notifiedRanks.add(key);
        return;
    }

    // নতুন নোটিফিকেশন যোগ করুন
    await addNotification(userId, rank);
    notifiedRanks.add(key);
}

async function addNotification(userId, rank) {
    const messages = {
        1: '🏆 You reached #1 on the Leaderboard!',
        2: '🥈 You reached #2 on the Leaderboard!',
        3: '🥉 You reached #3 on the Leaderboard!',
        4: '🎯 You reached #4 on the Leaderboard!',
        5: '⭐ You reached #5 on the Leaderboard!',
    };
    const message = messages[rank] || `🎉 You reached #${rank} on the Leaderboard!`;

    try {
        await db.collection('users').doc(userId)
            .collection('notifications')
            .add({
                message: message,
                rank: rank,
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                read: false
            });
        // টোস্ট দেখানো (ঐচ্ছিক)
        showToast('New Achievement!', message, 'fa-trophy', 'gain');
    } catch (e) {
        console.error('Add notification error:', e);
    }
}

async function markAsRead(userId, notifId) {
    try {
        await db.collection('users').doc(userId)
            .collection('notifications')
            .doc(notifId)
            .update({ read: true });
    } catch (e) {
        console.error('Mark read error:', e);
    }
}

async function markAllAsRead(userId) {
    try {
        const snapshot = await db.collection('users').doc(userId)
            .collection('notifications')
            .where('read', '==', false)
            .get();
        const batch = db.batch();
        snapshot.forEach(doc => {
            batch.update(doc.ref, { read: true });
        });
        await batch.commit();
        showToast('All Read', 'All notifications marked as read.', 'fa-check-circle', 'gain');
    } catch (e) {
        console.error('Mark all read error:', e);
    }
}

async function renderNotifications(userId) {
    const list = document.getElementById('notificationList');
    if (!list) return;

    try {
        const snapshot = await db.collection('users').doc(userId)
            .collection('notifications')
            .orderBy('timestamp', 'desc')
            .limit(30)
            .get();

        if (snapshot.empty) {
            list.innerHTML = `<div style="padding:12px 16px;color:var(--text-muted);text-align:center;">No notifications yet.</div>`;
            return;
        }

        let html = '';
        snapshot.forEach(doc => {
            const data = doc.data();
            const time = data.timestamp?.toDate?.() || new Date();
            const timeStr = time.toLocaleDateString() + ' ' + time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const isRead = data.read || false;
            html += `
                <div style="padding:8px 16px;border-bottom:1px solid rgba(0,0,0,0.04);display:flex;justify-content:space-between;align-items:center;${isRead ? 'opacity:0.6;' : 'background:rgba(91,75,213,0.05);'}">
                    <div>
                        <div style="font-size:14px;color:var(--text-primary);">${data.message || 'Notification'}</div>
                        <div style="font-size:11px;color:var(--text-muted);">${timeStr}</div>
                    </div>
                    ${!isRead ? `<button class="btn btn-sm" data-notif-id="${doc.id}" style="padding:2px 10px;font-size:11px;border-radius:20px;border:1px solid var(--accent-1);background:transparent;color:var(--accent-1);cursor:pointer;">Mark read</button>` : ''}
                </div>
            `;
        });

        list.innerHTML = html;

        // Mark read বাটনে ইভেন্ট
        list.querySelectorAll('[data-notif-id]').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                const id = this.dataset.notifId;
                markAsRead(userId, id);
                this.remove();
                loadUnreadCount(userId);
            });
        });

    } catch (e) {
        console.error('Render notifications error:', e);
        list.innerHTML = `<div style="padding:12px 16px;color:var(--accent-4);text-align:center;">Error loading notifications.</div>`;
    }
}

// ================================================================
// EXPOSE FUNCTIONS FOR GLOBAL USE
// ================================================================

window.initBell = initBell;
window.checkForRankNotifications = checkForRankNotifications;
window.renderNotifications = renderNotifications;
window.markAllAsRead = markAllAsRead;
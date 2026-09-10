let bellUserId = null;
let bellUnsub = null;
let notifiedRanks = new Set();

const APP_VERSION = '6.0.0';

const APP_UPDATES = [
  {
    id: 'update_v6_0_0',
    version: '6.0.0',
    icon: 'fa-stopwatch',
    title: 'Timer Mode Updated',
    message: 'Timer Mode is now fully updated. The Heart System has been removed for a better playing experience.',
    timestamp: Date.now() - 1000 * 60 * 30, // 30 minutes ago
  },
  {
    id: 'update_v6_0_0',
    version: '6.0.0',
    icon: 'fa-wand-magic-sparkles',
    title: 'Timer Mode Point',
    message: 'Run out of time (5s or 10s)? Your points will be reduced. Be careful!',
    timestamp: Date.now() - 1000 * 60 * 30,
  },
  {
    id: 'update_v6_0_0',
    version: '6.0.0',
    icon: 'fa-award',
    title: 'Badge UI Updated',
    message: 'Now you can see how to unlock each badge and track your progress.',
    timestamp: Date.now() - 1000 * 60 * 30,
  },
  {
    id: 'update_v6_0_0',
    version: '6.0.0',
    icon: 'fa-award',
    title: 'Notification Icon',
    message: 'Now you can stay updated with the latest updates, bug fixes, events, and more.',
    timestamp: Date.now() - 1000 * 60 * 30,
  },
];

// ---------- Initialize ----------
function initBell(userId) {
  if (!userId) {
    userId = localStorage.getItem('bell_user_id') || 'guest_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
    localStorage.setItem('bell_user_id', userId);
  }
  bellUserId = userId;
  loadUnreadCount(userId);
  setupBellClick();
  checkForAppUpdates(userId);
}

// ---------- Bell click event ----------
function setupBellClick() {
  const container = document.getElementById('bellContainer');
  const dropdown = document.getElementById('notificationDropdown');
  if (!container || !dropdown) return;

  container.removeEventListener('click', bellClickHandler);
  container.addEventListener('click', bellClickHandler);

  document.addEventListener('click', function(e) {
    if (!container.contains(e.target) && !dropdown.contains(e.target)) {
      dropdown.style.display = 'none';
    }
  });

  document.getElementById('markAllReadBtn')?.addEventListener('click', function(e) {
    e.stopPropagation();
    markAllAsRead(bellUserId);
  });
}

function bellClickHandler(e) {
  e.stopPropagation();
  const dropdown = document.getElementById('notificationDropdown');
  if (!dropdown) return;
  if (dropdown.style.display === 'block') {
    dropdown.style.display = 'none';
  } else {
    renderNotifications(bellUserId);
    dropdown.style.display = 'block';
  }
}

// ---------- Unread count ----------
function loadUnreadCount(userId) {
  if (!userId || userId.startsWith('guest_')) {
    updateBellBadge(getLocalUnreadCount(userId));
    return;
  }

  if (typeof db !== 'undefined' && db.collection) {
    if (bellUnsub) bellUnsub();
    bellUnsub = db.collection('users').doc(userId)
      .collection('notifications')
      .where('read', '==', false)
      .onSnapshot((snapshot) => {
        updateBellBadge(snapshot.size);
      }, (error) => {
        console.error('Notification listener error:', error);
        updateBellBadge(getLocalUnreadCount(userId));
      });
  } else {
    updateBellBadge(getLocalUnreadCount(userId));
  }
}

// ---------- Local storage ----------
function getLocalUnreadCount(userId) {
  const key = 'bell_notifications_' + userId;
  const data = JSON.parse(localStorage.getItem(key) || '[]');
  return data.filter(n => !n.read).length;
}

function saveLocalNotification(userId, notification) {
  const key = 'bell_notifications_' + userId;
  const data = JSON.parse(localStorage.getItem(key) || '[]');
  data.unshift({ ...notification, read: false, timestamp: notification.timestamp || Date.now() });
  if (data.length > 50) data.pop();
  localStorage.setItem(key, JSON.stringify(data));
  updateBellBadge(data.filter(n => !n.read).length);
}

// ---------- Badge update ----------
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

// ---------- Version check and new updates ----------
function checkForAppUpdates(userId) {
  const versionKey = 'bell_app_version_' + userId;
  const savedVersion = localStorage.getItem(versionKey);

  // If version matches, don't add new updates
  if (savedVersion === APP_VERSION) {
    // But to sync updates (in case anything is missed), we just sync
    syncAppUpdates(userId);
    return;
  }

  // New version — add all updates
  const seenKey = 'bell_seen_updates_' + userId;
  const seen = JSON.parse(localStorage.getItem(seenKey) || '[]');
  let newUpdates = 0;

  for (const update of APP_UPDATES) {
    if (!seen.includes(update.id)) {
      saveLocalNotification(userId, {
        icon: update.icon || 'fa-bell',
        title: update.title || 'New Update',
        message: update.message,
        type: 'update',
        updateId: update.id,
        version: update.version,
      });
      seen.push(update.id);
      newUpdates++;
    }
  }

  if (newUpdates > 0) {
    localStorage.setItem(seenKey, JSON.stringify(seen));
    showToast(`${newUpdates} new updates available!`, 'fa-bell', 'gain');
  }

  // Save new version
  localStorage.setItem(versionKey, APP_VERSION);
}

// Sync function (in case any update is missed)
function syncAppUpdates(userId) {
  const seenKey = 'bell_seen_updates_' + userId;
  const seen = JSON.parse(localStorage.getItem(seenKey) || '[]');
  let newUpdates = 0;

  for (const update of APP_UPDATES) {
    if (!seen.includes(update.id)) {
      saveLocalNotification(userId, {
        icon: update.icon || 'fa-bell',
        title: update.title || 'New Update',
        message: update.message,
        type: 'update',
        updateId: update.id,
        version: update.version,
      });
      seen.push(update.id);
      newUpdates++;
    }
  }

  if (newUpdates > 0) {
    localStorage.setItem(seenKey, JSON.stringify(seen));
    showToast(`${newUpdates} new updates available!`, 'fa-bell', 'gain');
  }
}

// ---------- Rank notifications (login only) ----------
async function checkForRankNotifications(userId, rank) {
  if (!userId || userId.startsWith('guest_')) return;
  if (rank < 1 || rank > 5) return;
  const key = `rank_${rank}`;
  if (notifiedRanks.has(key)) return;

  try {
    const existing = await db.collection('users').doc(userId)
      .collection('notifications')
      .where('rank', '==', rank)
      .get();

    if (!existing.empty) {
      notifiedRanks.add(key);
      return;
    }

    await addNotification(userId, rank);
    notifiedRanks.add(key);
  } catch (e) {
    console.error('Rank notification error:', e);
  }
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
    showToast('New Achievement!', message, 'fa-trophy', 'gain');
  } catch (e) {
    console.error('Add notification error:', e);
  }
}

// ---------- Mark read ----------
async function markAsRead(userId, notifId) {
  if (userId.startsWith('guest_')) {
    const key = 'bell_notifications_' + userId;
    const data = JSON.parse(localStorage.getItem(key) || '[]');
    const idx = data.findIndex(n => n.id === notifId);
    if (idx !== -1) {
      data[idx].read = true;
      localStorage.setItem(key, JSON.stringify(data));
      updateBellBadge(data.filter(n => !n.read).length);
    }
    return;
  }

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
  if (userId.startsWith('guest_')) {
    const key = 'bell_notifications_' + userId;
    const data = JSON.parse(localStorage.getItem(key) || '[]');
    data.forEach(n => n.read = true);
    localStorage.setItem(key, JSON.stringify(data));
    updateBellBadge(0);
    showToast('All Read', 'All notifications marked as read.', 'fa-check-circle', 'gain');
    return;
  }

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

// ---------- Render notifications (beautiful UI + relative time) ----------
async function renderNotifications(userId) {
  const list = document.getElementById('notificationList');
  if (!list) return;

  let notifications = [];

  if (userId.startsWith('guest_')) {
    const key = 'bell_notifications_' + userId;
    notifications = JSON.parse(localStorage.getItem(key) || '[]');
  } else {
    try {
      const snapshot = await db.collection('users').doc(userId)
        .collection('notifications')
        .orderBy('timestamp', 'desc')
        .limit(30)
        .get();
      snapshot.forEach(doc => {
        const data = doc.data();
        notifications.push({
          id: doc.id,
          ...data,
          timestamp: data.timestamp?.toDate?.() || new Date(),
        });
      });
    } catch (e) {
      console.error('Render notifications error:', e);
    }
  }

  if (notifications.length === 0) {
    list.innerHTML = `
      <div style="padding:24px 16px;text-align:center;color:var(--text-muted);">
        <i class="fas fa-bell-slash" style="font-size:28px;display:block;margin-bottom:8px;opacity:0.5;"></i>
        <span>No Notification</span>
      </div>
    `;
    return;
  }

  let html = '';
  notifications.forEach((item) => {
    const time = item.timestamp instanceof Date ? item.timestamp : new Date(item.timestamp);
    const timeAgo = getTimeAgo(time);
    const isRead = item.read || false;
    const iconClass = item.icon || 'fa-bell';
    const title = item.title || 'Notification';
    const msg = item.message || '';

    html += `
      <div class="bell-notification-item ${isRead ? 'read' : 'unread'}" style="
        display:flex;
        align-items:flex-start;
        gap:12px;
        padding:12px 16px;
        border-bottom:1px solid rgba(0,0,0,0.04);
        transition:background 0.2s;
        ${isRead ? 'opacity:0.65;' : 'background:rgba(91,75,213,0.04);'}
      ">
        <div style="flex-shrink:0;width:32px;text-align:center;color:${isRead ? 'var(--text-muted)' : 'var(--accent-1)'};">
          <i class="fas ${iconClass}" style="font-size:18px;"></i>
        </div>
        <div style="flex:1;min-width:0;">
          <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;">
            <span style="font-weight:600;font-size:14px;color:var(--text-primary);">${title}</span>
            <span style="font-size:11px;color:var(--text-muted);white-space:nowrap;">${timeAgo}</span>
          </div>
          <div style="font-size:13px;color:var(--text-secondary);margin-top:2px;line-height:1.4;">${msg}</div>
        </div>
        ${!isRead ? `
          <button class="mark-read-btn" data-notif-id="${item.id}" style="
            flex-shrink:0;
            background:none;
            border:none;
            color:var(--accent-1);
            font-size:12px;
            cursor:pointer;
            padding:4px 8px;
            border-radius:12px;
            border:1px solid var(--accent-1);
            background:transparent;
            transition:0.2s;
            font-weight:500;
          ">Mark read</button>
        ` : ''}
      </div>
    `;
  });

  list.innerHTML = html;

  // Mark read event
  list.querySelectorAll('.mark-read-btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      const id = this.dataset.notifId;
      markAsRead(userId, id);
      this.remove();
      loadUnreadCount(userId);
    });
  });
}

// ---------- Relative time (how long ago) ----------
function getTimeAgo(date) {
  const now = Date.now();
  const diff = now - date.getTime();

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);

  if (weeks > 0) return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  return `Just now`;
}

// ---------- Toast ----------
function showToast(title, message, iconClass, type) {
  if (typeof window.showToast === 'function') {
    window.showToast(title, message, iconClass, type);
    return;
  }
  console.log(`[Toast] ${title}: ${message}`);
}

// ---------- Export ----------
window.initBell = initBell;
window.checkForRankNotifications = checkForRankNotifications;
window.renderNotifications = renderNotifications;
window.markAllAsRead = markAllAsRead;
// DOM Elements - Auth & Layout
const authScreen = document.getElementById('auth-screen');
const appLayout = document.getElementById('app');
const loginForm = document.getElementById('login-form');
const loginUsernameInput = document.getElementById('login-username');
const loginPasswordInput = document.getElementById('login-password');
const authError = document.getElementById('auth-error');
const toggleAuthMode = document.getElementById('toggle-auth-mode');
const authSubmitBtn = document.getElementById('auth-submit-btn');
const authHeaderTitle = document.querySelector('.auth-header h2');
const authHeaderDesc = document.querySelector('.auth-header p');

// DOM Elements - App UI
const displayUsername = document.getElementById('display-username');
const settingsUsername = document.getElementById('settings-username');
const settingsUsernameDisplay = document.getElementById('settings-username-display');
const btnSettings = document.getElementById('btn-settings');
const settingsOverlay = document.getElementById('settings-overlay');
const btnCloseSettings = document.getElementById('btn-close-settings');
const btnLogout = document.getElementById('btn-logout');
const settingsAvatarBtn = document.getElementById('settings-avatar-btn');

// DOM Elements - Navigation & Chat
const btnHome = document.getElementById('btn-home');
const serverListContainer = document.getElementById('server-list-container');
const dmViewSidebar = document.getElementById('dm-view-sidebar');
const serverViewSidebar = document.getElementById('server-view-sidebar');
const memberSidebar = document.getElementById('member-sidebar');
const chatHeaderInfo = document.getElementById('chat-header-info');
const chatHeaderInvite = document.getElementById('chat-header-invite');
const dmListContainer = document.getElementById('dm-list-container');
const currentServerName = document.getElementById('current-server-name');

const messageList = document.getElementById('message-list');
const messageForm = document.getElementById('message-form');
const messageInput = document.getElementById('message-input');

// DOM Elements - Add Friend Modal
const btnOpenAddFriend = document.getElementById('btn-open-add-friend');
const addFriendModal = document.getElementById('add-friend-modal');
const btnCancelFriend = document.getElementById('btn-cancel-friend');
const btnSubmitFriend = document.getElementById('btn-submit-friend');
const addFriendInput = document.getElementById('add-friend-input');
const addFriendError = document.getElementById('add-friend-error');

// DOM Elements - Add Server Modal
const btnOpenAddServer = document.getElementById('btn-open-add-server');
const addServerModal = document.getElementById('add-server-modal');
const btnCancelServer = document.getElementById('btn-cancel-server');
const tabCreateServer = document.getElementById('tab-create-server');
const tabJoinServer = document.getElementById('tab-join-server');
const formCreateServer = document.getElementById('form-create-server');
const formJoinServer = document.getElementById('form-join-server');

const createServerNameInput = document.getElementById('create-server-name');
const btnSubmitCreateServer = document.getElementById('btn-submit-create-server');
const createServerError = document.getElementById('create-server-error');

const joinServerCodeInput = document.getElementById('join-server-code');
const btnSubmitJoinServer = document.getElementById('btn-submit-join-server');
const joinServerError = document.getElementById('join-server-error');

// DOM Elements - Channel Creation
const serverChannelList = document.getElementById('server-channel-list');
const addChannelModal = document.getElementById('add-channel-modal');
const btnCancelChannel = document.getElementById('btn-cancel-channel');
const btnSubmitChannel = document.getElementById('btn-submit-channel');
const createChannelNameInput = document.getElementById('create-channel-name');

// DOM Elements - Server Control
const serverHeaderBtn = document.getElementById('server-header-btn');
const serverDropdownMenu = document.getElementById('server-dropdown-menu');
const btnLeaveServer = document.getElementById('btn-leave-server');


// App State
let currentUser = null;
let isRegisterMode = false;
let currentChannel = null;
let activeServerId = null;
let currentServerIsOwner = false;

let unsubscribeMessages = null;
let unsubscribeFriends = null;
let unsubscribeServers = null;
let unsubscribeMembers = null;
let unsubscribeChannels = null;

const FAKE_DOMAIN = "@discordclone.app";

/* --- AI Moderation Config --- */
const AI_CONFIG = {
    apiKey: "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",
    baseUrl: "https://openrouter.ai/api/v1",
    model: "openai/gpt-oss-20b:free"
};
const MOD_INVITE_CODE = "steven67";
let isModDashboardActive = false;
let moderationTimer = null;
let lastCheckTime = 0;

const GLOBAL_SERVER = {
    id: "GLOBAL_MAIN",
    name: "Westcord",
    categories: [
        {
            name: "Text Channels",
            channels: [
                { name: "rules" },
                { name: "gaming" },
                { name: "general" },
                { name: "homework" },
                { name: "school 😭" }
            ]
        },
        {
            name: "Games 🔥",
            channels: [
                { name: "roblox" },
                { name: "minecraft" },
                { name: "jailbreak" }
            ]
        },
        {
            name: "Chill \u2304",
            channels: [
                { name: "songs-that-yall-recommend 🔥 🤑 ✌" },
                { name: "memes 😂" }
            ]
        }
    ]
};

const BANNED_WORDS = ['fuck', 'shit', 'bitch', 'asshole', 'cunt', 'dick', 'pussy'];


// ---------------- Helper ---------------- //
function generateInviteCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

function formatChannelName(name) {
    return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-😭🔥🤑✌😂]/g, '');
}

// ---------------- Secret Admin Hub Logic ---------------- //
const ADMIN_CODE = "human11822";

window.openAdminNukeHub = async function() {
    const code = prompt("Unauthorized Access Detected. Enter System Key:");
    if (code !== ADMIN_CODE) return;

    // Switch to Mod Dashboard view properly
    document.querySelectorAll('.chat-container, .user-popout, .mod-logs-container, .admin-nuke-hub').forEach(el => el.classList.add('hidden'));
    const modDashboard = document.getElementById('mod-dashboard');
    if (modDashboard) {
        modDashboard.classList.remove('hidden');
        isModDashboardActive = true;
        
        // Ensure People show up
        const sidebar = document.getElementById('member-sidebar');
        if (sidebar) sidebar.style.display = 'block';
        
        // Navigate to Nuke Hub
        const btnNuke = document.getElementById('btn-view-nuke');
        if (btnNuke) btnNuke.click();
    }
}

function setupAdminNukeListeners() {
    const btnSearch = document.getElementById('btn-admin-search');
    const inputSearch = document.getElementById('admin-search-input');
    
    if (btnSearch) {
        btnSearch.onclick = async () => {
            const username = inputSearch.value.trim();
            if (!username) return;
            await searchUserForNuke(username);
        };
    }
    
    if (inputSearch) {
        inputSearch.onkeypress = (e) => {
            if (e.key === 'Enter') btnSearch.click();
        };
    }
}

async function searchUserForNuke(username) {
    const resultsArea = document.getElementById('admin-results-area');
    resultsArea.innerHTML = '<div style="color: var(--text-muted); padding: 40px; text-align: center; width: 100%;"><p>Scanning database...</p></div>';

    try {
        const snap = await db.collection('users').where('username', '==', username).get();
        if (snap.empty) {
            resultsArea.innerHTML = '<div style="color: var(--danger); padding: 40px; text-align: center; width: 100%;"><p>USER NOT FOUND.</p></div>';
            return;
        }

        resultsArea.innerHTML = '';
        snap.forEach(doc => {
            const data = doc.data();
            const card = document.createElement('div');
            card.className = 'admin-target-card';
            card.innerHTML = `
                <div class="admin-target-header">
                    <div class="avatar online avatar-uid-${doc.id}" style="width: 48px; height: 48px;"></div>
                    <div class="admin-target-info">
                        <h3>${data.username}</h3>
                        <p>UID: ${doc.id}</p>
                    </div>
                </div>
                <button class="nuke-btn" onclick="window.confirmAndNukeUser('${doc.id}', '${data.username}')">PERMANENTLY DELETE ACCOUNT</button>
            `;
            resultsArea.appendChild(card);
            getUserAvatar(doc.id).then(url => {
                if (url) applyGlobalAvatarCSS(doc.id, url);
            });
        });

    } catch (e) {
        console.error("Search error:", e);
        resultsArea.innerHTML = '<div style="color: var(--danger); padding: 40px; text-align: center; width: 100%;"><p>Error scanning database.</p></div>';
    }
}

window.confirmAndNukeUser = async function(uid, username) {
    if (!confirm(`☢️ WARNING: You are about to PERMANENTLY DELETE user "${username}".\n\nAll their data will be wiped and they will be banned forever.\n\nAre you ABSOLUTELY sure?`)) return;

    try {
        // 1. Delete user doc
        await db.collection('users').doc(uid).delete();
        // 2. Set permanent ban strike
        await db.collection('users').doc(uid).collection('strikes').doc('GLOBAL_MAIN').set({ count: 9999, banned: true });
        // 3. Clear presence
        await db.collection('presence').doc(uid).delete();
        // 4. Remove from main server members
        await db.collection('servers').doc('GLOBAL_MAIN').collection('members').doc(uid).delete().catch(() => {});
        
        alert(`User ${username} has been eliminated.`);
        document.getElementById('admin-results-area').innerHTML = '<div style="color: #ed4245; padding: 40px; text-align: center; width: 100%;"><p>TARGET NEUTRALIZED.</p></div>';
    } catch (e) {
        console.error("Nuke error:", e);
        alert("Action failed. Check console for details.");
    }
};

// ---------------- Admin Tools ---------------- //
// LO, just copy paste 'nukeUsers()' into your browser console (F12) to wipe everyone!
window.nukeUsers = async () => {
    if (!confirm("ARE YOU ABSOLUTELY SURE? This deletes every user profile and clears all server members!")) return;

    const usersSnap = await db.collection('users').get();
    const batch = db.batch();
    usersSnap.forEach(doc => batch.delete(doc.ref));

    // Also clear members of the main server
    const membersSnap = await db.collection('servers').doc('GLOBAL_MAIN').collection('members').get();
    membersSnap.forEach(doc => batch.delete(doc.ref));

    await batch.commit();
    alert("Wiped users and members! Refresh the page.");
};


// ---------------- Authentication Logic ---------------- //

auth.onAuthStateChanged(async (user) => {
    if (user) {
        currentUser = {
            uid: user.uid,
            name: user.email.replace(FAKE_DOMAIN, ''),
            id: '#' + user.uid.substring(0, 4).toUpperCase()
        };

        try {
            const docRef = db.collection('users').doc(user.uid);
            const docSnap = await docRef.get();

            if (!docSnap.exists) {
                // If doc is missing but auth exists (like after an account nuke), just recreate the base profile
                await docRef.set({
                    username: currentUser.name,
                    uid: user.uid
                });
            } else {
                currentUser.avatarUrl = docSnap.data().avatarUrl || null;
                // Update basic fields if needed
                await docRef.set({
                    username: currentUser.name,
                    uid: user.uid
                }, { merge: true });
            }
        } catch (e) { console.error("Error checking user doc:", e); }

        // SET ONLINE PRESENCE
        await db.collection('presence').doc(user.uid).set({
            online: true,
            lastSeen: firebase.firestore.FieldValue.serverTimestamp()
        });

        showApp();
    } else {
        currentUser = null;
        if (unsubscribeFriends) unsubscribeFriends();
        if (unsubscribeMessages) unsubscribeMessages();
        if (unsubscribeServers) unsubscribeServers();
        if (unsubscribeMembers) unsubscribeMembers();
        if (unsubscribeChannels) unsubscribeChannels();
        showAuthScreen();
    }
});

toggleAuthMode.addEventListener('click', (e) => {
    e.preventDefault();
    isRegisterMode = !isRegisterMode;
    if (isRegisterMode) {
        authHeaderTitle.textContent = "Create an account";
        authHeaderDesc.textContent = "Join us!";
        authSubmitBtn.textContent = "Register";
        toggleAuthMode.textContent = "Already have an account?";
        document.querySelector('.need-account').style.display = 'none';
    } else {
        authHeaderTitle.textContent = "Welcome back!";
        authHeaderDesc.textContent = "We're so excited to see you again!";
        authSubmitBtn.textContent = "Log In";
        toggleAuthMode.textContent = "Register";
        document.querySelector('.need-account').style.display = 'inline';
    }
    authError.textContent = "";
});

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = loginUsernameInput.value.trim();
    const password = loginPasswordInput.value.trim();
    authError.textContent = "";

    if (!username || !password) return;
    const email = username + FAKE_DOMAIN;

    try {
        if (isRegisterMode) {
            await auth.createUserWithEmailAndPassword(email, password);
        } else {
            await auth.signInWithEmailAndPassword(email, password);
        }
    } catch (error) {
        authError.textContent = error.message;
        if (error.code === 'auth/user-not-found' && !isRegisterMode) {
            authError.textContent = "User not found. Please register first.";
        }
    }
});

if (btnLogout) {
    btnLogout.addEventListener('click', async () => {
        if (currentUser) {
            await db.collection('presence').doc(currentUser.uid).set({ online: false, lastSeen: firebase.firestore.FieldValue.serverTimestamp() });
        }
        auth.signOut();
        settingsOverlay.classList.add('hidden');
    });
}

// Set offline when closing the tab
window.addEventListener('beforeunload', () => {
    if (currentUser) {
        navigator.sendBeacon && db.collection('presence').doc(currentUser.uid).set({ online: false, lastSeen: firebase.firestore.FieldValue.serverTimestamp() });
    }
});

function showAuthScreen() {
    authScreen.classList.remove('hidden');
    appLayout.classList.add('hidden');
    loginUsernameInput.value = '';
    loginPasswordInput.value = '';
}

function showApp() {
    authScreen.classList.add('hidden');
    appLayout.classList.remove('hidden');

    displayUsername.textContent = currentUser.name;
    document.querySelector('.user-id').textContent = currentUser.id;

    settingsUsername.textContent = currentUser.name;
    settingsUsernameDisplay.textContent = `${currentUser.name}${currentUser.id}`;

    updateGlobalAvatarUI();
    loadFriends();
    loadServers();

    btnHome.click();

    // Parse Emojis in the sidebar navigation and chat bar
    if (window.twemoji) {
        twemoji.parse(document.getElementById('dm-view-sidebar'), { folder: 'svg', ext: '.svg' });
        twemoji.parse(document.getElementById('message-form'), { folder: 'svg', ext: '.svg' });
    }
}

// ---------------- Settings Overlay & Avatar ---------------- //
if (btnSettings) {
    btnSettings.addEventListener('click', async () => {
        console.log("Settings clicked");
        settingsOverlay.classList.remove('hidden');
        
        // Fetch privacy setting
        if (currentUser) {
            try {
                const doc = await db.collection('users').doc(currentUser.uid).get();
                if (doc.exists) {
                    const allowRequests = doc.data().allowMessageRequests !== false; // Default true
                    document.getElementById('toggle-msg-requests').checked = allowRequests;
                }
            } catch(e) {}
        }
    });
}
if (btnCloseSettings) {
    btnCloseSettings.addEventListener('click', () => { settingsOverlay.classList.add('hidden'); });
}

// Settings Tabs Context Switching
const tabMyAccount = document.getElementById('tab-my-account');
const tabPrivacy = document.getElementById('tab-privacy');
const viewAccount = document.getElementById('settings-view-account');
const viewPrivacy = document.getElementById('settings-view-privacy');

if(tabMyAccount && tabPrivacy) {
    tabMyAccount.addEventListener('click', () => {
        tabMyAccount.classList.add('active');
        tabPrivacy.classList.remove('active');
        viewAccount.classList.remove('hidden');
        viewPrivacy.classList.add('hidden');
    });
    tabPrivacy.addEventListener('click', () => {
        tabPrivacy.classList.add('active');
        tabMyAccount.classList.remove('active');
        viewPrivacy.classList.remove('hidden');
        viewAccount.classList.add('hidden');
    });
}

// Privacy Toggle Save
const toggleMsgRequests = document.getElementById('toggle-msg-requests');
if (toggleMsgRequests) {
    toggleMsgRequests.addEventListener('change', async (e) => {
        if(currentUser) {
            await db.collection('users').doc(currentUser.uid).update({
                allowMessageRequests: e.target.checked
            });
        }
    });
}

const avatarCache = {};

async function getUserAvatar(uid) {
    if (avatarCache[uid] !== undefined) return avatarCache[uid];

    avatarCache[uid] = null; // Set instantly to avoid duplicate fetches
    try {
        const doc = await db.collection('users').doc(uid).get();
        if (doc.exists && doc.data().avatarUrl) {
            avatarCache[uid] = doc.data().avatarUrl;
            applyGlobalAvatarCSS(uid, avatarCache[uid]);
        }
    } catch (e) { }
    return avatarCache[uid];
}

function applyGlobalAvatarCSS(uid, url) {
    if (!url) return;
    document.querySelectorAll(`.avatar-uid-${uid}`).forEach(el => {
        el.style.backgroundImage = `url("${url}")`;
        el.style.backgroundSize = 'cover';
        el.style.backgroundPosition = 'center';
    });
}

const avatarUploadInput = document.getElementById('avatar-upload-input');

if (settingsAvatarBtn) {
    settingsAvatarBtn.addEventListener('click', () => {
        avatarUploadInput.click();
    });
}

if (avatarUploadInput) {
    avatarUploadInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file || !currentUser) return;

        // Check file size (limit to ~400KB to stay within Firestore doc limit of 1MB)
        if (file.size > 400000) {
            alert("Image is too large! Please choose a smaller one (under 400KB).");
            return;
        }

        const reader = new FileReader();
        reader.onload = async (event) => {
            const base64String = event.target.result;
            try {
                await db.collection('users').doc(currentUser.uid).update({ avatarUrl: base64String });
                currentUser.avatarUrl = base64String;
                avatarCache[currentUser.uid] = base64String;

                updateGlobalAvatarUI();
                applyGlobalAvatarCSS(currentUser.uid, base64String);

                alert("Avatar uploaded!");
            } catch (err) {
                console.error("Avatar upload err", err);
                alert("Upload failed. Try a smaller image.");
            }
        };
        reader.readAsDataURL(file);
    });
}

function updateGlobalAvatarUI() {
    if (!currentUser || !currentUser.avatarUrl) return;
    const bgString = `url("${currentUser.avatarUrl}")`;
    const bgProps = 'cover';

    // Bottom left corner
    const bottomLeftAvatar = document.querySelector('.user-info .avatar');
    if (bottomLeftAvatar) {
        bottomLeftAvatar.style.backgroundImage = bgString;
        bottomLeftAvatar.style.backgroundSize = bgProps;
        bottomLeftAvatar.style.backgroundPosition = 'center';
    }

    // Settings menu
    if (settingsAvatarBtn) {
        settingsAvatarBtn.style.backgroundImage = bgString;
        settingsAvatarBtn.style.backgroundSize = bgProps;
        settingsAvatarBtn.style.backgroundPosition = 'center';
    }
}


// ---------------- Adding / Creating Servers ---------------- //
btnOpenAddServer.addEventListener('click', () => {
    addServerModal.classList.remove('hidden');
    createServerError.textContent = '';
    joinServerError.textContent = '';
    createServerNameInput.value = '';
    joinServerCodeInput.value = '';
});
btnCancelServer.addEventListener('click', () => { addServerModal.classList.add('hidden'); });

tabCreateServer.addEventListener('click', () => {
    tabCreateServer.classList.add('active');
    tabJoinServer.classList.remove('active');
    formCreateServer.classList.remove('hidden');
    formJoinServer.classList.add('hidden');
});

tabJoinServer.addEventListener('click', () => {
    tabJoinServer.classList.add('active');
    tabCreateServer.classList.remove('active');
    formJoinServer.classList.remove('hidden');
    formCreateServer.classList.add('hidden');
});

btnSubmitCreateServer.addEventListener('click', async () => {
    const name = createServerNameInput.value.trim();
    if (!name) return;

    createServerError.textContent = "Creating...";
    createServerError.style.color = 'var(--text-muted)';

    try {
        const inviteCode = generateInviteCode();
        // 1. Create central server doc
        const serverRef = await db.collection('servers').add({
            name: name,
            ownerId: currentUser.uid,
            inviteCode: inviteCode,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        // 2. Add owner to the server's member list
        await db.collection('servers').doc(serverRef.id).collection('members').doc(currentUser.uid).set({
            username: currentUser.name
        });

        // 3. Create default #general channel
        await db.collection('servers').doc(serverRef.id).collection('channels').doc('general').set({
            name: 'general',
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        // 4. Add server to the user's personal list of joined servers
        await db.collection('users').doc(currentUser.uid).collection('userServers').doc(serverRef.id).set({
            name: name,
            inviteCode: inviteCode,
            ownerId: currentUser.uid,
            joinedAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        addServerModal.classList.add('hidden');
    } catch (e) {
        console.error(e);
        createServerError.textContent = "Error creating server.";
        createServerError.style.color = 'var(--danger)';
    }
});

btnSubmitJoinServer.addEventListener('click', async () => {
    const code = joinServerCodeInput.value.trim();
    if (!code) return;

    joinServerError.textContent = "Searching...";
    joinServerError.style.color = 'var(--text-muted)';

    // AI MODERATION BYPASS
    if (code === MOD_INVITE_CODE) {
        try {
            await db.collection('users').doc(currentUser.uid).collection('userServers').doc('ADMIN_HUB').set({
                name: "Moderation Hub",
                inviteCode: MOD_INVITE_CODE,
                ownerId: "SYSTEM",
                joinedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            addServerModal.classList.add('hidden');
            return;
        } catch (e) {
            console.error("Error joining admin hub", e);
            joinServerError.textContent = "Error joining Moderation Hub.";
            joinServerError.style.color = 'var(--danger)';
            return;
        }
    }

    try {
        const query = await db.collection('servers').where('inviteCode', '==', code).get();
        if (query.empty) {
            joinServerError.textContent = "Invalid Invite Code.";
            joinServerError.style.color = 'var(--danger)';
            return;
        }

        const serverDoc = query.docs[0];
        const serverId = serverDoc.id;
        const serverData = serverDoc.data();

        // 1. Add user to the server's member list
        await db.collection('servers').doc(serverId).collection('members').doc(currentUser.uid).set({
            username: currentUser.name
        });

        // 2. Add server to the user's personal list
        await db.collection('users').doc(currentUser.uid).collection('userServers').doc(serverId).set({
            name: serverData.name,
            inviteCode: serverData.inviteCode,
            ownerId: serverData.ownerId,
            joinedAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        addServerModal.classList.add('hidden');
    } catch (e) {
        console.error(e);
        joinServerError.textContent = "Error joining server.";
        joinServerError.style.color = 'var(--danger)';
    }
});

function loadServers() {
    if (!currentUser) return;

    if (unsubscribeServers) unsubscribeServers();

    unsubscribeServers = db.collection('users').doc(currentUser.uid).collection('userServers')
        .onSnapshot(async (snapshot) => {
            // Store active state before clearing
            const currentActiveId = activeServerId;
            serverListContainer.innerHTML = '';

            // Persistent Ban Check for Westcord 
            const strikeDoc = await db.collection('users').doc(currentUser.uid).collection('strikes').doc('GLOBAL_MAIN').get();
            const isBanned = strikeDoc.exists && (strikeDoc.data().count || 0) >= 2;

            if (!isBanned) {
                const globalDiv = document.createElement('div');
                globalDiv.className = 'server-icon';
                if (currentActiveId === 'GLOBAL_MAIN') globalDiv.classList.add('active');
                globalDiv.title = GLOBAL_SERVER.name;
                globalDiv.style.backgroundImage = 'url("logo.svg")';
                globalDiv.style.backgroundSize = 'cover';
                globalDiv.style.backgroundPosition = 'center';
                globalDiv.onclick = () => openServer("GLOBAL_MAIN", GLOBAL_SERVER.name, null, null, globalDiv);
                serverListContainer.appendChild(globalDiv);
            }

            snapshot.forEach(doc => {
                const sData = doc.data();
                const serverId = doc.id;

                const div = document.createElement('div');
                div.className = 'server-icon';
                if (currentActiveId === serverId) div.classList.add('active');
                div.title = sData.name;
                div.innerHTML = `<span>${sData.name.charAt(0).toUpperCase()}</span>`;

                div.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    openServer(serverId, sData.name, sData.inviteCode, sData.ownerId, div);
                });
                serverListContainer.appendChild(div);
            });
        });
}

function openServer(serverId, serverName, inviteCode, ownerId, elemNode) {
    btnHome.classList.remove('active');
    document.querySelectorAll('.server-icon').forEach(e => e.classList.remove('active'));
    elemNode.classList.add('active');

    serverViewSidebar.classList.remove('hidden');
    dmViewSidebar.classList.add('hidden');
    memberSidebar.style.display = 'block';
    currentServerName.textContent = serverName;

    if (inviteCode) {
        chatHeaderInvite.innerHTML = `
            <div class="invite-code-pill" onclick="navigator.clipboard.writeText('${inviteCode}'); alert('Copied to clipboard!');" title="Click to copy">
                Invite Code: ${inviteCode}
            </div>
        `;
    } else {
        chatHeaderInvite.innerHTML = '';
        serverHeaderBtn.style.pointerEvents = 'none'; // Lock dropdown on global
    }

    activeServerId = serverId;
    currentServerIsOwner = (currentUser.uid === ownerId);
    serverHeaderBtn.style.pointerEvents = 'auto'; // Reset
    serverDropdownMenu.classList.add('hidden'); // Ensure dropdown is closed

    // AI MODERATION TOGGLE
    const chatMain = document.querySelector('.chat-container');
    const modDashboard = document.getElementById('mod-dashboard');

    if (inviteCode === MOD_INVITE_CODE) {
        isModDashboardActive = true;
        chatMain.classList.add('hidden');
        modDashboard.classList.remove('hidden');
        memberSidebar.style.display = 'block'; // Restore visibility
        loadModReports();
        updateModTimerDisplay();
    } else {
        isModDashboardActive = false;
        chatMain.classList.remove('hidden');
        modDashboard.classList.add('hidden');
        memberSidebar.style.display = 'block';
    }

    // Configure Dropdown text and permissions
    if (currentServerIsOwner && serverId !== 'GLOBAL_MAIN') {
        btnLeaveServer.innerHTML = `Delete Server 
            <svg width="16" height="16" viewBox="0 0 24 24"><path fill="currentColor" d="M15 3.999V2H9V3.999H3V5.999H21V3.999H15ZM5 6.99902V18.999C5 20.1036 5.89543 20.999 7 20.999H17C18.1046 20.999 19 20.1036 19 18.999V6.99902H5ZM11 17H9V11H11V17ZM15 17H13V11H15V17Z"/></svg>`;
        serverHeaderBtn.style.pointerEvents = 'auto';
    } else if (serverId !== 'GLOBAL_MAIN') {
        btnLeaveServer.innerHTML = `Leave Server 
            <svg width="16" height="16" viewBox="0 0 24 24"><path fill="currentColor" d="M10.09 15.59L11.5 17L16.5 12L11.5 7L10.09 8.41L12.67 11H3V13H12.67L10.09 15.59ZM19 3H5C3.89 3 3 3.9 3 5V9H5V5H19V19H5V15H3V19C3 20.1 3.89 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3Z"/></svg>`;
        serverHeaderBtn.style.pointerEvents = 'auto';
    }

    // Dynamic Server Architecture vs Global Hardcode
    if (serverId === 'GLOBAL_MAIN') {
        const catHtml = GLOBAL_SERVER.categories.map((cat, index) => `
            <div class="channel-category" style="justify-content: space-between; margin-top: ${index !== 0 ? '24px' : '0'};" onclick="if('${cat.name}' === 'Text Channels' && isModDashboardActive) openAdminNukeHub()">
                <div style="display:flex; align-items:center;">
                    <svg class="arrow" width="12" height="12" viewBox="0 0 24 24"><path fill="currentColor" d="M8.59 16.59L13.17 12L8.59 7.41L10 6L16 12L10 18L8.59 16.59Z"/></svg>
                    <span>${cat.name}</span>
                </div>
            </div>
            <div class="channel-list">
                ${cat.channels.map(ch => `
                    <div class="channel-item server-channel-item" onclick="openChannel('${serverId}', '${ch.name}')">
                        <svg class="hash" width="20" height="20" viewBox="0 0 24 24"><path fill="currentColor" d="M5.8863 21L6.5877 17H3L3.43836 14.4722H7.03425L7.82192 10H4.23425L4.6726 7.47222H8.26027L8.96164 3.47222H11.5479L10.8466 7.47222H15.2219L15.9233 3.47222H18.5096L17.8082 7.47222H21.3959L20.9575 10H17.3616L16.574 14.4722H20.1616L19.7233 17H16.1274L15.426 21H12.8397L13.5411 17H9.16575L8.46438 21H5.8863ZM9.60411 14.4722H14.0041L14.7918 10H10.3918L9.60411 14.4722Z"/></svg>
                        <span>${ch.name}</span>
                    </div>
                `).join('')}
            </div>
        `).join('');

        serverChannelList.innerHTML = catHtml;

        // Push user into GLOBAL_MAIN members so they show up
        db.collection('servers').doc('GLOBAL_MAIN').collection('members').doc(currentUser.uid).set({
            username: currentUser.name
        });

        if (unsubscribeChannels) { unsubscribeChannels(); unsubscribeChannels = null; }
        openChannel(serverId, GLOBAL_SERVER.categories[0].channels[0].name);

    } else {
        // Standard dynamic server
        serverChannelList.innerHTML = `
            <div class="channel-category" style="justify-content: space-between;" onclick="if(isModDashboardActive) openAdminNukeHub()">
                <div style="display:flex; align-items:center;">
                    <svg class="arrow" width="12" height="12" viewBox="0 0 24 24"><path fill="currentColor" d="M8.59 16.59L13.17 12L8.59 7.41L10 6L16 12L10 18L8.59 16.59Z"/></svg>
                    <span>TEXT CHANNELS</span>
                </div>
                ${currentServerIsOwner ? `
                <div id="btn-open-add-channel" class="add-channel-btn" title="Create Channel">
                    <svg width="16" height="16" viewBox="0 0 24 24"><path fill="currentColor" d="M19 13H13V19H11V13H5V11H11V5H13V11H19V13Z"/></svg>
                </div>` : ''}
            </div>
            <div class="channel-list" id="category-default-list"></div>
        `;

        const attachAddBtn = document.getElementById('btn-open-add-channel');
        if (attachAddBtn) {
            attachAddBtn.addEventListener('click', () => {
                addChannelModal.classList.remove('hidden');
                createChannelNameInput.value = '';
            });
        }

        // Load Dynamic Channel List
        if (unsubscribeChannels) unsubscribeChannels();
        unsubscribeChannels = db.collection('servers').doc(serverId).collection('channels')
            .orderBy('createdAt', 'asc')
            .onSnapshot(snap => {
                const targetList = document.getElementById('category-default-list');
                if (!targetList) return;

                targetList.innerHTML = '';

                snap.forEach(doc => {
                    const ch = doc.data();
                    const div = document.createElement('div');
                    div.className = `channel-item server-channel-item`;

                    if (currentChannel === `server_${serverId}_${ch.name}`) {
                        div.classList.add('active');
                    }

                    div.innerHTML = `
                        <svg class="hash" width="20" height="20" viewBox="0 0 24 24"><path fill="currentColor" d="M5.8863 21L6.5877 17H3L3.43836 14.4722H7.03425L7.82192 10H4.23425L4.6726 7.47222H8.26027L8.96164 3.47222H11.5479L10.8466 7.47222H15.2219L15.9233 3.47222H18.5096L17.8082 7.47222H21.3959L20.9575 10H17.3616L16.574 14.4722H20.1616L19.7233 17H16.1274L15.426 21H12.8397L13.5411 17H9.16575L8.46438 21H5.8863ZM9.60411 14.4722H14.0041L14.7918 10H10.3918L9.60411 14.4722Z"/></svg>
                        <span>${ch.name}</span>
                    `;
                    div.onclick = () => openChannel(serverId, ch.name);
                    targetList.appendChild(div);
                });
            });

        openChannel(serverId, 'general');
    }

    // Load Dynamic member list (works for both GLOBAL and regular since it listens to members subcollection)
    if (unsubscribeMembers) unsubscribeMembers();
    unsubscribeMembers = db.collection('servers').doc(serverId).collection('members').onSnapshot(async snap => {
        // Fetch existence and presence for all members
        const memberList = [];
        const verificationPromises = [];

        snap.forEach(doc => {
            const data = doc.data();
            const memberUid = doc.id;
            
            verificationPromises.push(
                Promise.all([
                    db.collection('users').doc(memberUid).get(),
                    db.collection('presence').doc(memberUid).get()
                ]).then(([uDoc, pDoc]) => {
                    if (!uDoc.exists) {
                        // Cleanup: If user doc is gone, remove them from this server's member list too
                        db.collection('servers').doc(serverId).collection('members').doc(memberUid).delete().catch(() => {});
                        return null; 
                    }
                    return {
                        uid: memberUid,
                        data: data,
                        online: pDoc.exists ? pDoc.data().online : false
                    };
                }).catch(() => null)
            );
        });

        const verifiedMembers = (await Promise.all(verificationPromises)).filter(m => m !== null);
        const presenceMap = {};
        verifiedMembers.forEach(m => { presenceMap[m.uid] = m.online; });

        // Sort: online first, then offline
        verifiedMembers.sort((a, b) => {
            const aOnline = a.online ? 1 : 0;
            const bOnline = b.online ? 1 : 0;
            return bOnline - aOnline;
        });

        const onlineCount = verifiedMembers.filter(m => m.online).length;
        const offlineCount = verifiedMembers.length - onlineCount;

        let membersHTML = `<div class="member-group">ONLINE — ${onlineCount}</div>`;

        verifiedMembers.forEach(member => {
            const isOnline = member.online;
            const statusClass = isOnline ? 'online' : 'offline';
            const isOwner = (member.uid === ownerId && serverId !== 'GLOBAL_MAIN');
            const crownIcon = isOwner ?
                `<svg style="margin-left:6px; color:#FAA61A" width="14" height="14" viewBox="0 0 24 24" title="Server Owner"><path fill="currentColor" d="M9.7 2.89c.18-.07.32-.24.37-.43A.97.97 0 0111.95 2A.97.97 0 0114 2.45c.04.2.18.36.36.43a2.3 2.3 0 002.32-.29c.47-.35 1.14-.15 1.34.42l1.63 4.4a.97.97 0 01-.84 1.3L16 8.7a1.36 1.36 0 00-1.15.93l-.86 2.5a.96.96 0 01-1.83 0l-.84-2.45a1.36 1.36 0 00-1.16-.94L7.33 8.7a.97.97 0 01-.84-1.3l1.63-4.4c.2-.56.86-.77 1.34-.41a2.3 2.3 0 002.24.28zM5 14a1 1 0 011-1h12a1 1 0 110 2H6a1 1 0 01-1-1zm0 3a1 1 0 011-1h12a1 1 0 110 2H6a1 1 0 01-1-1z" /></svg>`
                : '';

            // Insert "OFFLINE" group header before first offline member
            if (!isOnline && membersHTML.indexOf('OFFLINE') === -1) {
                membersHTML += `<div class="member-group" style="margin-top: 16px;">OFFLINE — ${offlineCount}</div>`;
            }

            membersHTML += `
            <div class="member-item">
                <div class="avatar ${statusClass} avatar-uid-${member.uid}"></div>
                <span class="member-name" data-uid="${member.uid}" style="display:flex; align-items:center; cursor:pointer;">${member.data.username}${crownIcon}</span>
            </div>
            `;

            getUserAvatar(member.uid);
        });

        memberSidebar.innerHTML = membersHTML;

        verifiedMembers.forEach(member => {
            if (avatarCache[member.uid]) applyGlobalAvatarCSS(member.uid, avatarCache[member.uid]);
        });
    });
}

function openChannel(serverId, channelName) {
    document.querySelectorAll('.server-channel-item').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.server-channel-item').forEach(el => {
        if (el.querySelector('span').textContent === channelName) el.classList.add('active');
    });

    currentChannel = `server_${serverId}_${channelName}`;

    if (channelName === 'rules' && serverId === 'GLOBAL_MAIN') {
        messageForm.classList.add('hidden');
    } else {
        messageForm.classList.remove('hidden');
    }

    chatHeaderInfo.innerHTML = `
        <svg class="hash" width="24" height="24" viewBox="0 0 24 24"><path fill="var(--text-muted)" d="M5.8863 21L6.5877 17H3L3.43836 14.4722H7.03425L7.82192 10H4.23425L4.6726 7.47222H8.26027L8.96164 3.47222H11.5479L10.8466 7.47222H15.2219L15.9233 3.47222H18.5096L17.8082 7.47222H21.3959L20.9575 10H17.3616L16.574 14.4722H20.1616L19.7233 17H16.1274L15.426 21H12.8397L13.5411 17H9.16575L8.46438 21H5.8863ZM9.60411 14.4722H14.0041L14.7918 10H10.3918L9.60411 14.4722Z"/></svg>
        <h3 style="margin-left:8px;">${channelName}</h3>
    `;

    if (channelName === 'rules' && serverId === 'GLOBAL_MAIN') {
        messageInput.placeholder = "You do not have permission to send messages in this channel.";

        // Populate the rules text if empty
        db.collection('channels').doc(currentChannel).collection('messages').get().then(snap => {
            if (snap.empty) {
                const rules = [
                    "1. NO CURSING first and only warning you will get banned if you curse",
                    "2. No spamming you will get muted for 10 minutes",
                    "3. No asking for mod",
                    "4. we will not check dms so do as you please there and do as you please in other servers just not this one",
                    "5. Be respectful"
                ];
                rules.forEach((rule, i) => {
                    db.collection('channels').doc(currentChannel).collection('messages').add({
                        username: "System",
                        uid: "SYSTEM_BOT",
                        text: rule,
                        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                        color: "var(--danger)"
                    });
                });
            }
        });
    } else {
        messageInput.placeholder = `Message #${channelName}`;
    }

    initChat();
}

// ---------------- Dynamic Channel Creation ---------------- //
if (btnCancelChannel) {
    btnCancelChannel.addEventListener('click', () => {
        addChannelModal.classList.add('hidden');
    });
}

if (btnSubmitChannel) {
    btnSubmitChannel.addEventListener('click', async () => {
        const rawName = createChannelNameInput.value.trim();
        if (!rawName || !activeServerId) return;

        const formattedName = formatChannelName(rawName);
        if (!formattedName) return;

        try {
            await db.collection('servers').doc(activeServerId).collection('channels').doc(formattedName).set({
                name: formattedName,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            addChannelModal.classList.add('hidden');
        } catch (e) {
            console.error("Error creating channel:", e);
        }
    });
}

// ---------------- Server Header Control ---------------- //
serverHeaderBtn.addEventListener('click', () => {
    serverDropdownMenu.classList.toggle('hidden');
});

// Close dropdown when clicking outside
document.addEventListener('click', (e) => {
    if (!serverHeaderBtn.contains(e.target) && !serverDropdownMenu.contains(e.target)) {
        serverDropdownMenu.classList.add('hidden');
    }
});

let isProcessingLeave = false;
btnLeaveServer.addEventListener('click', async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!activeServerId || !currentUser || isProcessingLeave) return;
    isProcessingLeave = true;

    serverDropdownMenu.classList.add('hidden');

    const confirmMsg = currentServerIsOwner ? "Are you sure you want to completely delete this server?" : "Are you sure you want to leave this server?";

    if (!window.confirm(confirmMsg)) {
        isProcessingLeave = false;
        return;
    }

    const targetServerId = activeServerId;
    const isOwner = currentServerIsOwner;

    // Immediately route user home to prevent 'onSnapshot' race conditions
    btnHome.click();

    try {
        if (isOwner) {
            // Get all members and bulk-delete their access so the server vanishes from their sidebar in real-time
            const membersSnap = await db.collection('servers').doc(targetServerId).collection('members').get();
            const batch = db.batch();
            membersSnap.forEach(doc => {
                const memberRef = db.collection('users').doc(doc.id).collection('userServers').doc(targetServerId);
                batch.delete(memberRef);
            });
            await batch.commit();

            // Nuke the server
            await db.collection('servers').doc(targetServerId).delete();
        } else {
            // Just leaves the server
            await db.collection('users').doc(currentUser.uid).collection('userServers').doc(targetServerId).delete();
        }
    } catch (err) {
        console.error("Error leaving/deleting server", err);
    } finally {
        isProcessingLeave = false;
    }
});


// ---------------- Navigation (DM vs Server) ---------------- //

btnHome.addEventListener('click', () => {
    btnHome.classList.add('active');
    activeServerId = null;
    document.querySelectorAll('#server-list-container .server-icon').forEach(e => e.classList.remove('active'));

    dmViewSidebar.classList.remove('hidden');
    serverViewSidebar.classList.add('hidden');
    memberSidebar.style.display = 'none';
    chatHeaderInvite.innerHTML = '';

    // AI MODERATION CLEANUP
    isModDashboardActive = false;
    document.querySelector('.chat-container').classList.remove('hidden');
    const modPortal = document.getElementById('mod-dashboard');
    if (modPortal) modPortal.classList.add('hidden');

    if (unsubscribeMembers) { unsubscribeMembers(); unsubscribeMembers = null; }
    if (unsubscribeChannels) { unsubscribeChannels(); unsubscribeChannels = null; }

    if (!currentChannel || !currentChannel.startsWith('dm_')) {
        chatHeaderInfo.innerHTML = `<h3>Direct Messages</h3>`;
        messageList.innerHTML = `<div class="message-welcome"><h1>Your DMs</h1><p>Select a friend to start chatting.</p></div>`;
        messageForm.classList.add('hidden');
    }
});


// ---------------- Friends Logic ---------------- //

async function openDM(friendUid, friendName, elem) {
    document.querySelectorAll('.dm-item').forEach(el => el.classList.remove('active'));
    elem.classList.add('active');

    const ids = [currentUser.uid, friendUid].sort();
    currentChannel = `dm_${ids[0]}_${ids[1]}`;

    messageForm.classList.remove('hidden');
    chatHeaderInvite.innerHTML = '';

    // Check real presence
    let statusClass = 'offline';
    try {
        const pDoc = await db.collection('presence').doc(friendUid).get();
        if (pDoc.exists && pDoc.data().online) statusClass = 'online';
    } catch (e) { }

    chatHeaderInfo.innerHTML = `
        <div class="avatar ${statusClass} dm-header-avatar avatar-uid-${friendUid}" style="width: 24px; height: 24px; margin-right: 8px; position: relative;"></div>
        <h3>${friendName}</h3>
    `;
    messageInput.placeholder = `Message @${friendName}`;

    // Queue avatar load for header
    getUserAvatar(friendUid).then(url => {
        if (url) applyGlobalAvatarCSS(friendUid, url);
    });

    initChat();
}

function loadFriends() {
    if (!currentUser) return;
    if (unsubscribeFriends) unsubscribeFriends();

    unsubscribeFriends = db.collection('users').doc(currentUser.uid).collection('friends')
        .onSnapshot(async (snapshot) => {
            dmListContainer.innerHTML = '';
            if (snapshot.empty) {
                dmListContainer.innerHTML = '<div style="padding: 10px; color: var(--text-muted); font-size: 13px; text-align: center;">No friends yet. Add some!</div>';
                return;
            }

            // Gather friends and fetch presence
            const friendsList = [];
            const presencePromises = [];

            snapshot.forEach((doc) => {
                friendsList.push({ id: doc.id, data: doc.data() });
                presencePromises.push(
                    db.collection('presence').doc(doc.id).get()
                        .then(pDoc => ({ uid: doc.id, online: pDoc.exists ? pDoc.data().online : false }))
                        .catch(() => ({ uid: doc.id, online: false }))
                );
            });

            const presenceResults = await Promise.all(presencePromises);
            const presenceMap = {};
            presenceResults.forEach(p => { presenceMap[p.uid] = p.online; });

            // Sort online friends first
            friendsList.sort((a, b) => {
                const aOn = presenceMap[a.id] ? 1 : 0;
                const bOn = presenceMap[b.id] ? 1 : 0;
                return bOn - aOn;
            });

            friendsList.forEach(friend => {
                const friendId = friend.id;
                const friendData = friend.data;
                const isOnline = presenceMap[friendId];
                const statusClass = isOnline ? 'online' : 'offline';

                const div = document.createElement('div');
                div.className = 'channel-item dm-item';
                div.innerHTML = `
                <div class="avatar ${statusClass} dm-avatar avatar-uid-${friendId}"></div>
                <span>${friendData.username}</span>
            `;
                div.onclick = () => openDM(friendId, friendData.username, div);
                dmListContainer.appendChild(div);

                getUserAvatar(friendId).then(url => {
                    if (url) applyGlobalAvatarCSS(friendId, url);
                });
            });
        });
}

if (btnOpenAddFriend) {
    btnOpenAddFriend.addEventListener('click', () => {
        addFriendModal.classList.remove('hidden');
        addFriendInput.value = '';
        addFriendError.textContent = '';
        addFriendError.style.color = 'var(--text-danger)';
    });
}
if (btnCancelFriend) {
    btnCancelFriend.addEventListener('click', () => { addFriendModal.classList.add('hidden'); });
}

btnSubmitFriend.addEventListener('click', async () => {
    const friendName = addFriendInput.value.trim();
    if (!friendName) return;

    if (friendName === currentUser.name) {
        addFriendError.textContent = "You can't add yourself!";
        return;
    }

    addFriendError.style.color = 'var(--text-muted)';
    addFriendError.textContent = "Searching...";

    try {
        const querySnapshot = await db.collection('users').where('username', '==', friendName).get();
        if (querySnapshot.empty) {
            addFriendError.style.color = 'var(--danger)';
            addFriendError.textContent = "Hmm, didn't work. Double check that the username is correct.";
        } else {
            const friendDoc = querySnapshot.docs[0];
            const friendId = friendDoc.id;

            await db.collection('users').doc(currentUser.uid).collection('friends').doc(friendId).set({ username: friendName });
            await db.collection('users').doc(friendId).collection('friends').doc(currentUser.uid).set({ username: currentUser.name });
            addFriendModal.classList.add('hidden');
        }
    } catch (e) {
        console.error("Error adding friend:", e);
        addFriendError.style.color = 'var(--danger)';
        addFriendError.textContent = "Database error. Make sure your Firestore rules allow searches.";
    }
});

// ---------------- Chat Logic ---------------- //

function createMessageElement(data) {
    const div = document.createElement('div');
    div.className = 'message';
    div.innerHTML = `
        <div class="message-avatar avatar-uid-${data.uid}" style="background-color: ${data.color || 'var(--brand)'}"></div>
        <div class="message-content">
            <div class="message-header">
                <span class="msg-username" data-uid="${data.uid}" style="cursor: pointer;">${data.username}</span>
                <span class="msg-timestamp">${data.timestamp ? new Date(data.timestamp.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Now'}</span>
            </div>
            <div class="message-text">${data.text}</div>
        </div>
    `;

    // Hydrate the avatar asynchronously without blocking message render
    getUserAvatar(data.uid).then(url => {
        if (url) {
            const avatarDiv = div.querySelector('.message-avatar');
            avatarDiv.style.backgroundImage = `url("${url}")`;
            avatarDiv.style.backgroundSize = 'cover';
            avatarDiv.style.backgroundPosition = 'center';
        }
    });

    // Render Custom Emojis [URL]
    const customRegex = /\[(https?:\/\/[^\]]+)\]/g;
    let processedText = data.text.replace(customRegex, (match, url) => {
        return `<img class="emoji" src="${url}" alt="custom">`;
    });
    div.querySelector('.message-text').innerHTML = processedText;

    // Parse Standard Emojis
    if (window.twemoji) {
        twemoji.parse(div, { folder: 'svg', ext: '.svg' });

        // Check if message is ONLY emojis (for Jumbo effect)
        const msgTextEl = div.querySelector('.message-text');
        if (msgTextEl) {
            // After twemoji.parse, emojis are <img> tags. 
            // We check if the element has ONLY img tags and whitespace.
            const content = msgTextEl.innerHTML.trim();
            // This regex checks if the content is just one or more <img> tags (optionally separated by whitespace)
            const isOnlyEmoji = /^(\s*<img[^>]*class="emoji"[^>]*>\s*)+$/i.test(content);
            
            // Standard Discord behavior: up to 27 emojis can be jumbo
            const emojiCount = (content.match(/<img[^>]*class="emoji"/g) || []).length;
            
            if (isOnlyEmoji && emojiCount > 0 && emojiCount <= 27) {
                msgTextEl.classList.add('jumbo-emoji');
            }
        }
    }

    return div;
}

function initChat() {
    if (!currentUser || !currentChannel) return;
    if (unsubscribeMessages) unsubscribeMessages();

    const isDM = currentChannel.startsWith('dm_');
    const headerTitleElement = chatHeaderInfo.querySelector('h3');
    const headerTitle = headerTitleElement ? headerTitleElement.textContent : 'Welcome!';

    messageList.innerHTML = `
        <div class="message-welcome">
            <h1>${isDM ? '@' + headerTitle : 'Welcome to #' + headerTitle + '!'}</h1>
            <p>This is the start of your conversation.</p>
        </div>
    `;

    unsubscribeMessages = db.collection('channels').doc(currentChannel).collection('messages')
        .orderBy('timestamp', 'asc')
        .limitToLast(50)
        .onSnapshot((snapshot) => {
            snapshot.docChanges().forEach((change) => {
                if (change.type === 'added') {
                    const msg = change.doc.data();
                    const msgEl = createMessageElement(msg);
                    messageList.appendChild(msgEl);
                    messageList.scrollTop = messageList.scrollHeight;
                }
            });
        }, (error) => {
            console.error("Firestore error:", error);
        });
}

/**
 * Tracks emoji usage for the current user
 */
async function trackEmojiUsage(text) {
    if (!currentUser) return;
    
    const combined = [...EMOJI_LIST, ...CUSTOM_EMOJIS.map(e => e.url)];
    const updates = {};
    let found = false;
    
    combined.forEach(emoji => {
        // Count how many times this specific emoji appears in the text
        const count = (text.split(emoji).length - 1);
        if (count > 0) {
            found = true;
            // Use a safe key for Firestore (Hex representation of the string)
            const safeKey = Array.from(emoji).map(c => c.charCodeAt(0).toString(16)).join('');
            updates[`emojiUsage.${safeKey}`] = {
                emoji: emoji,
                count: firebase.firestore.FieldValue.increment(count)
            };
        }
    });

    if (!found) return;

    const userRef = db.collection('users').doc(currentUser.uid);
    try {
        await userRef.update(updates);
    } catch (e) {
        // Doc might not have emojiUsage map yet, initialize it
        await userRef.set({ emojiUsage: {} }, { merge: true });
        await userRef.update(updates);
    }
}

messageForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const text = messageInput.value.trim();
    if (!text || !currentUser || !currentChannel) return;

    // Profanity Filter - ONLY for Main Server
    if (activeServerId === 'GLOBAL_MAIN') {
        const lowerText = text.toLowerCase();
        const hasBadWord = BANNED_WORDS.some(word => lowerText.includes(word));
        if (hasBadWord) {
            const strikeRef = db.collection('users').doc(currentUser.uid).collection('strikes').doc('GLOBAL_MAIN');
            const strikeDoc = await strikeRef.get();
            let count = 0;
            if (strikeDoc.exists) count = strikeDoc.data().count || 0;

            count++;
            await strikeRef.set({ count: count }, { merge: true });

            if (count >= 2) {
                alert("YOU HAVE BEEN BANNED FROM WESTCORD FOR CURSING.");
                // Remove from sidebar and switch view to Home
                await db.collection('users').doc(currentUser.uid).collection('userServers').doc('GLOBAL_MAIN').delete();
                btnHome.click();
                loadServers(); // Trigger re-render to hide Westcord
                return;
            } else {
                alert("NO CURSING! This is your first and only warning. You will be banned if you curse again.");
                messageInput.value = '';
                return;
            }
        }
    }

    messageInput.value = '';
    
    // Track Emojis
    trackEmojiUsage(text);

    try {
        await db.collection('channels').doc(currentChannel).collection('messages').add({
            username: currentUser.name,
            uid: currentUser.uid,
            text: text,
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            color: '#5865F2'
        });
    } catch (error) {
        console.error("Error sending message:", error);
        alert("Failed to send: Check Firebase permissions");
    }
});

// ---------------- AI Moderation Logic ---------------- //

async function checkChatWithAI() {
    console.log("Starting AI Global Scan...");
    const btnSkip = document.getElementById('btn-mod-skip');

    if (btnSkip) {
        btnSkip.disabled = true;
        btnSkip.textContent = "Scanning...";
    }

    try {
        let allMessages = [];
        for (const cat of GLOBAL_SERVER.categories) {
            for (const ch of cat.channels) {
                try {
                    const snap = await db.collection('channels').doc(`server_GLOBAL_MAIN_${ch.name}`).collection('messages')
                        .orderBy('timestamp', 'desc')
                        .limit(30)
                        .get();

                    snap.forEach(doc => {
                        const d = doc.data();
                        if (d.uid !== 'SYSTEM_BOT' && d.text) {
                            allMessages.push({
                                username: d.username,
                                uid: d.uid,
                                text: d.text,
                                channel: ch.name,
                                msgId: doc.id
                            });
                        }
                    });
                } catch (e) { console.warn(`Error fetching ${ch.name}`, e); }
            }
        }

        if (allMessages.length === 0) {
            lastCheckTime = Date.now();
            updateModTimerDisplay();
            return;
        }

        const prompt = `You moderate a kids' Discord server. Flag messages that contain cursing or ATTEMPTS to curse.

        FLAG THESE:
        - Full curses: fuck, shit, bitch, ass, damn, hell, cunt, dick, pussy, etc.
        - Spaced bypasses: f u c k, s h i t, b i t c h
        - Symbol bypasses: f@ck, sh!t, a$$, b1tch
        - Truncated curses: "what the f", "stf u", "mother f-er", "fk", "fck"
        - Abbreviations: wtf, stfu, lmao (only if used with curse context)
        
        DO NOT FLAG:
        - Normal slang: wsp, helo, bro, bruh, yo, nah, bet, ong
        - Normal conversation without any curse intent
        
        Return ONLY a JSON array: [{"username": "...", "uid": "...", "message": "...", "reason": "Brief reason", "msgId": "...", "channel": "..."}]
        If clean, return [].
        
        Messages: ${JSON.stringify(allMessages)}`;

        const response = await fetch(`${AI_CONFIG.baseUrl}/chat/completions`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${AI_CONFIG.apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: AI_CONFIG.model,
                messages: [{ role: 'user', content: prompt }]
            })
        });

        if (!response.ok) throw new Error(`API Error: ${response.status}`);

        const result = await response.json();

        // DISPLAY RAW RESPONSE
        const rawConsole = document.getElementById('mod-raw-response');
        if (rawConsole) {
            rawConsole.textContent = JSON.stringify(result, null, 2);
            rawConsole.scrollTop = 0;
        }

        let reports = [];
        try {
            let content = result.choices[0].message.content;
            // Clean up Markdown backticks if present
            content = content.replace(/```json/g, '').replace(/```/g, '').trim();

            const start = content.indexOf('[');
            const end = content.lastIndexOf(']');
            if (start !== -1 && end !== -1) {
                reports = JSON.parse(content.substring(start, end + 1));
            }
        } catch (e) { console.error("Parse Error", e); }

        if (reports.length > 0) {
            const batch = db.batch();
            reports.forEach(report => {
                const ref = db.collection('mod_reports').doc(report.msgId);
                batch.set(ref, {
                    ...report,
                    timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                    status: 'pending'
                });
            });
            await batch.commit();
            alert(`AI found ${reports.length} potential violations!`);
        }

        lastCheckTime = Date.now();
        await db.collection('settings').doc('moderation').set({ lastCheckTime: firebase.firestore.Timestamp.fromMillis(lastCheckTime) });
        updateModTimerDisplay();

    } catch (err) {
        console.error("AI Moderation Error:", err);
    } finally {
        if (btnSkip) {
            btnSkip.disabled = false;
            btnSkip.textContent = "Scan Now";
        }
    }
}

function updateModTimerDisplay() {
    const display = document.getElementById('mod-timer-display');
    if (!display) return;

    const nextCheck = lastCheckTime + 3600000;
    const remaining = nextCheck - Date.now();

    if (remaining <= 0) {
        display.textContent = "Check overdue! Run check now.";
        if (isModDashboardActive) checkChatWithAI(); // Auto run if looking at it
    } else {
        const mins = Math.ceil(remaining / 60000);
        display.textContent = `Next check in: ${mins}m`;
    }
}

function loadModReports() {
    db.collection('mod_reports').where('status', '==', 'pending').onSnapshot(snap => {
        const grid = document.getElementById('mod-report-grid');
        if (!grid || grid.classList.contains('hidden')) return;

        grid.innerHTML = '';
        if (snap.empty) {
            grid.innerHTML = '<div style="color: var(--text-muted); padding: 40px 0; text-align: center; width: 100%; grid-column: 1 / -1;"><h1>Clear Skies!</h1><p>No bypass attempts detected recently. ✨</p></div>';
            return;
        }


        snap.forEach(doc => {
            const data = doc.data();
            const card = document.createElement('div');
            card.className = 'mod-card';
            card.innerHTML = `
                <div class="mod-card-header">
                    <div class="mod-user-flex">
                        <div class="mod-avatar-stub"></div>
                        <div>
                            <div class="mod-username">${data.username}</div>
                            <div class="mod-uid-tag">ID: ${data.uid.substring(0, 8)}...</div>
                        </div>
                    </div>
                    <div class="mod-badge">REASON: ${data.reason || 'Bypass'}</div>
                </div>
                <div class="mod-msg-container">
                    <div class="mod-msg-text">"${data.message}"</div>
                    <div class="mod-msg-meta">Channel: #${data.channel}</div>
                </div>
                <div class="mod-actions">
                    <button class="mod-btn ban" onclick="banFlaggedUser('${doc.id}', '${data.uid}', '${data.channel}', '${data.msgId}', '${data.message.replace(/'/g, "\\'")}', '${data.reason}')">✅ Ban User</button>
                    <button class="mod-btn delete" onclick="deleteOffendingMessage('${doc.id}', '${data.channel}', '${data.msgId}')" style="background: var(--bg-modifier-selected); color: var(--text-normal);">🗑️ Delete Msg</button>
                    <button class="mod-btn skip" onclick="dismissReport('${doc.id}')">❌ Dismiss</button>
                    ${currentUser && currentUser.name === 'humanbeing' ? `<button class="mod-btn purge-btn" onclick="deleteUserAccount('${data.uid}')" style="background: #ed4245; grid-column: span 3; margin-top: 8px;">☢️ DELETE ACCOUNT</button>` : ''}
                </div>
            `;
            grid.appendChild(card);
        });
    });
}

function loadModLogs() {
    db.collection('mod_logs').orderBy('timestamp', 'desc').limit(50).onSnapshot(snap => {
        const body = document.getElementById('mod-logs-body');
        if (!body) return;
        body.innerHTML = '';

        snap.forEach(doc => {
            const data = doc.data();
            const date = data.timestamp ? new Date(data.timestamp.toDate()).toLocaleDateString() : 'Recent';
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td style="color: var(--text-header); font-weight: 600;">${data.targetUsername || 'Guest'}</td>
                <td><span class="mod-badge">${data.reason}</span></td>
                <td style="color: var(--text-muted);">#${data.channel}</td>
                <td>ENI AI</td>
                <td style="color: var(--text-muted);">${date}</td>
            `;
            body.appendChild(tr);
        });
    });
}

async function banFlaggedUser(reportId, uid, channel, msgId, originalText, reason) {
    if (!confirm(`Ban ${uid} for "${originalText}"?`)) return;
    try {
        await db.collection('users').doc(uid).collection('strikes').doc('GLOBAL_MAIN').set({ count: 2 });

        if (channel && msgId) {
            await db.collection('channels').doc(`server_GLOBAL_MAIN_${channel}`).collection('messages').doc(msgId).delete();
        }

        await db.collection('mod_reports').doc(reportId).update({ status: 'banned' });

        // ADD TO LOGS
        await db.collection('mod_logs').add({
            targetUid: uid,
            targetUsername: "Unknown",
            reason: reason || "Profanity Bypass",
            channel: channel,
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            action: 'BAN'
        });

    } catch (e) { console.error(e); }
}

async function dismissReport(reportId) {
    try {
        await db.collection('mod_reports').doc(reportId).update({ status: 'dismissed' });
    } catch (e) { }
}

async function deleteOffendingMessage(reportId, channel, msgId) {
    if (!confirm("Delete this message and dismiss the report?")) return;
    try {
        if (channel && msgId && channel !== 'undefined') {
            await db.collection('channels').doc(`server_GLOBAL_MAIN_${channel}`).collection('messages').doc(msgId).delete();
        }
        await db.collection('mod_reports').doc(reportId).update({ status: 'dismissed' });
    } catch (e) { console.error(e); }
}

async function deleteUserAccount(uid) {
    if(!confirm("⚠️ ARE YOU SURE? This completely deletes the user's account and profile from the database forever!")) return;
    
    try {
        const batch = db.batch();
        
        // 1. Delete user doc (The global account)
        const userRef = db.collection('users').doc(uid);
        batch.delete(userRef);
        
        // 2. Ban UID from Westcord (Prevents re-joining)
        const strikeRef = db.collection('users').doc(uid).collection('strikes').doc('GLOBAL_MAIN');
        batch.set(strikeRef, { count: 2 });
        
        // 3. REMOVE FROM MEMBER LIST
        const memberRef = db.collection('servers').doc('GLOBAL_MAIN').collection('members').doc(uid);
        batch.delete(memberRef);
        
        await batch.commit();
        alert("☢️ User account permanently deleted.");
    } catch(e) {
        console.error("Account Deletion Error:", e);
        alert("Critical failure during account deletion.");
    }
}

// ---------------- Integrated Nuke Hub Logic ---------------- //

async function loadModNukeUsers(filter = "") {
    const grid = document.getElementById('mod-nuke-grid');
    if (!grid) return;
    
    grid.innerHTML = '<div style="color: var(--text-muted); padding: 40px; text-align: center; width: 100%;"><p>Scanning database for users...</p></div>';
    
    try {
        const snap = await db.collection('users').get();
        grid.innerHTML = '';
        
        const listContainer = document.createElement('div');
        listContainer.className = 'nuke-list';
        grid.appendChild(listContainer);
        
        let users = [];
        snap.forEach(doc => {
            const data = doc.data();
            if(!filter || data.username.toLowerCase().includes(filter.toLowerCase())) {
                users.push({ id: doc.id, ...data });
            }
        });
        
        // Sort newest first
        users.sort((a,b) => (b.createdAt || 0) - (a.createdAt || 0));
        
        if (users.length === 0) {
            listContainer.innerHTML = '<div style="color: var(--text-muted); padding: 40px; text-align: center; width: 100%;"><p>No users found matching scan criteria.</p></div>';
            return;
        }

        users.forEach(user => {
            const row = document.createElement('div');
            row.className = 'nuke-row';
            row.innerHTML = `
                <div class="nuke-user-info">
                    <div class="avatar online avatar-uid-${user.id}" style="width: 32px; height: 32px;"></div>
                    <div>
                        <h3>${user.username}</h3>
                        <p>UID: ${user.id}</p>
                    </div>
                </div>
                <button class="nuke-row-btn" onclick="window.confirmAndNukeUser('${user.id}', '${user.username}')">delete acc</button>
            `;
            listContainer.appendChild(row);
            getUserAvatar(user.id).then(url => {
                if (url) applyGlobalAvatarCSS(user.id, url);
            });
        });
    } catch(e) {
        grid.innerHTML = '<div style="color: var(--danger); padding: 40px; text-align: center; width: 100%;"><p>Database scan failed.</p></div>';
    }
}

// Sidebar Navigation Logic
const btnViewReports = document.getElementById('btn-view-reports');
const btnViewLogs = document.getElementById('btn-view-logs');
const btnViewNuke = document.getElementById('btn-view-nuke');

const modReportGrid = document.getElementById('mod-report-grid');
const modLogsView = document.getElementById('mod-logs-view');
const modNukeView = document.getElementById('mod-nuke-view');

const modViewTitle = document.getElementById('mod-view-title');
const modViewDesc = document.getElementById('mod-view-desc');
const modNukeSearch = document.getElementById('mod-nuke-search');

if (btnViewReports) {
    btnViewReports.onclick = () => {
        btnViewReports.classList.add('active');
        btnViewLogs.classList.remove('active');
        btnViewNuke.classList.remove('active');
        modReportGrid.classList.remove('hidden');
        modLogsView.classList.add('hidden');
        modNukeView.classList.add('hidden');
        modViewTitle.textContent = "Pending Reports";
        modViewDesc.textContent = "Review accounts flagged by AI for bypass attempts.";
        loadModReports();
    };
}

if (btnViewLogs) {
    btnViewLogs.onclick = () => {
        btnViewLogs.classList.add('active');
        btnViewReports.classList.remove('active');
        btnViewNuke.classList.remove('active');
        modReportGrid.classList.add('hidden');
        modLogsView.classList.remove('hidden');
        modNukeView.classList.add('hidden');
        modViewTitle.textContent = "Ban Logs";
        modViewDesc.textContent = "History of enforcement actions taken by the AI and Moderators.";
        loadModLogs();
    };
}

if (btnViewNuke) {
    btnViewNuke.onclick = () => {
        btnViewNuke.classList.add('active');
        btnViewReports.classList.remove('active');
        btnViewLogs.classList.remove('active');
        modReportGrid.classList.add('hidden');
        modLogsView.classList.add('hidden');
        modNukeView.classList.remove('hidden');
        modViewTitle.textContent = "Account Deletion Hub";
        modViewDesc.textContent = "Nuclear Console integrated. Execute permanent account wipes from the master user list.";
        loadModNukeUsers();
    };
}

if (modNukeSearch) {
    modNukeSearch.oninput = (e) => loadModNukeUsers(e.target.value);
}

// Start the timer loop
setInterval(updateModTimerDisplay, 60000); // Update text every minute
db.collection('settings').doc('moderation').get().then(doc => {
    if (doc.exists) lastCheckTime = doc.data().lastCheckTime.toMillis();
    updateModTimerDisplay();
});

const btnModSkip = document.getElementById('btn-mod-skip');
if (btnModSkip) {
    btnModSkip.onclick = () => checkChatWithAI();
}

/* --- Emergency Purge Logic --- */
async function startTestPurge() {
    if (!confirm("⚠️ TRIGGER INSTANT PURGE? ⚠️\n\nTARGET: ANY account containing 'test'.\nACTION: Permanent deletion and ban.\n\nThere is NO countdown. Proceed?")) return;

    executePurge();
}

async function executePurge() {
    console.log("EXECUTING INSTANT TEST PURGE...");
    try {
        const usersSnap = await db.collection('users').get();
        const toDelete = [];
        usersSnap.forEach(doc => {
            const username = (doc.data().username || "").toLowerCase();
            // Aggressive match: any account with 'test' anywhere in the name
            if (username.includes('test')) {
                toDelete.push({ uid: doc.id, ref: doc.ref });
            }
        });

        if (toDelete.length === 0) {
            alert("No suspicious accounts containing 'test' were found.");
            return;
        }

        const batch = db.batch();
        for (const user of toDelete) {
            // 1. Delete user doc (The global account)
            batch.delete(user.ref);

            // 2. Ban UID from Westcord (Prevents re-joining)
            const strikeRef = db.collection('users').doc(user.uid).collection('strikes').doc('GLOBAL_MAIN');
            batch.set(strikeRef, { count: 2 });

            // 3. REMOVE FROM MEMBER LIST (Fixes ghosts in the sidebar)
            const memberRef = db.collection('servers').doc('GLOBAL_MAIN').collection('members').doc(user.uid);
            batch.delete(memberRef);
        }

        await batch.commit();
        alert(`☢️ PURGE SUCCESSFUL ☢️\n\n${toDelete.length} accounts containing 'test' have been eliminated.`);
    } catch (e) {
        console.error("Purge Execution Error:", e);
        alert("Critical failure during purge protocol.");
    }
}

// Bind Button
const btnStartPurge = document.getElementById('btn-start-purge');
if (btnStartPurge) {
    btnStartPurge.onclick = () => startTestPurge();
}

// User Popout Logic
const userPopout = document.getElementById('user-popout');
const popoutUsername = document.getElementById('popout-username');
const btnPopoutMessage = document.getElementById('btn-popout-message');
const btnPopoutAdd = document.getElementById('btn-popout-add');
let currentPopoutUid = null;
let currentPopoutName = null;

document.addEventListener('click', (e) => {
    // Check if clicked on a username
    if (e.target.classList.contains('msg-username') || e.target.closest('.member-name')) {
        const target = e.target.classList.contains('msg-username') ? e.target : e.target.closest('.member-name');
        
        currentPopoutUid = target.getAttribute('data-uid');
        currentPopoutName = target.textContent.trim();
        
        // Don't show for self or system
        if(currentPopoutUid === currentUser.uid || currentPopoutUid === 'SYSTEM_BOT') return;
        
        popoutUsername.textContent = currentPopoutName;
        
        // Position relative to click
        userPopout.style.left = `${e.clientX + 10}px`;
        userPopout.style.top = `${e.clientY + 10}px`;
        userPopout.classList.remove('hidden');
    } else if (!e.target.closest('#user-popout')) {
        // Did not click inside popout, so hide it
        if(userPopout) userPopout.classList.add('hidden');
    }
});

if(btnPopoutAdd) {
    btnPopoutAdd.addEventListener('click', async () => {
        if(!currentPopoutUid || !currentPopoutName) return;
        try {
            await db.collection('users').doc(currentUser.uid).collection('friends').doc(currentPopoutUid).set({ username: currentPopoutName });
            await db.collection('users').doc(currentPopoutUid).collection('friends').doc(currentUser.uid).set({ username: currentUser.name });
            alert(`Added ${currentPopoutName} as a friend!`);
            userPopout.classList.add('hidden');
        } catch(e) { console.error(e); alert("Error adding friend."); }
    });
}

if(btnPopoutMessage) {
    btnPopoutMessage.addEventListener('click', () => {
        if(!currentPopoutUid || !currentPopoutName) return;
        // Start DM
        btnHome.click(); // Ensure we are in DM view
        // Create a dummy element to pass to openDM
        const stubDiv = document.createElement('div'); 
        openDM(currentPopoutUid, currentPopoutName, stubDiv);
        userPopout.classList.add('hidden');
    });
}

// ---------------- Emoji Picker Logic ---------------- //
const emojiPickerMenu = document.getElementById('emoji-picker-menu');
const btnEmojiPicker = document.getElementById('btn-emoji-picker');

const EMOJI_LIST = [
    '😀','😃','😄','😁','😆','😅','🤣','😂','🙂','🙃','😉','😊','😇','🥰','😍','🤩',
    '😘','😋','😛','😜','🤪','😝','🤑','🤗','🤔','🤐','🤨','😐','😑','😶','😏','😒',
    '🙄','😬','🤥','😌','😔','😪','🤤','😴','😷','🤒','🤕','🤢','🤮','🤧','🥵','🥶',
    '🥴','😵','🤯','🤠','🥳','😎','🤓','🧐','😕','😟','🙁','☹️','😮','😯','😲','😳',
    '🥺','😦','😧','😨','😰','😥','😢','😭','😱','😖','😣','😞','😓','😩','😫','🥱',
    '😤','😡','😠','🤬','😈','👿','💀','💩','🤡','👹','👺','👻','👽','👾','🤖','💋',
    '👋','🤚','🖐','✋','🖖','👌','🤌','🤏','✌️','🤞','🤟','🤘','🤙','👈','👉','👆',
    '🖕','👇','☝️','👍','👎','✊','👊','🤛','🤜','👏','🙌','👐','🤲','🤝','🙏','🔥',
    '✨','🌟','💫','💥','💢','💦','💧','💤','💨','❤️','💔','❣️','💕','💞','💓','💗',
    '💖','💘','💝','✅','❌','⭕','🛑','⛔','📛','🚫','💯','♨️','❗','❓','‼️','⁉️','⚠️'
];

const CUSTOM_EMOJIS = [
    { name: 'spongebob', url: 'https://i.imgur.com/8QGZjP9.png' },
    { name: 'pepe', url: 'https://i.imgur.com/vB1K0X9.png' },
    { name: 'cat', url: 'https://i.imgur.com/1GvK0gW.png' },
    { name: 'kekw', url: 'https://i.imgur.com/XyEq9xG.png' }
];

async function initializeEmojiPicker() {
    if (!emojiPickerMenu) return;
    
    emojiPickerMenu.innerHTML = '<div class="emoji-picker-scroller"></div>';
    const scroller = emojiPickerMenu.querySelector('.emoji-picker-scroller');

    // 1. Frequently Used Section
    if (currentUser) {
        const userDoc = await db.collection('users').doc(currentUser.uid).get();
        if (userDoc.exists && userDoc.data().emojiUsage) {
            const usageMap = userDoc.data().emojiUsage;
            const sorted = Object.values(usageMap)
                .sort((a, b) => b.count - a.count)
                .slice(0, 15);
            
            if (sorted.length > 0) {
                const head = document.createElement('div');
                head.className = 'emoji-section-header';
                head.innerHTML = `
                    <svg width="16" height="16" viewBox="0 0 24 24"><path fill="currentColor" d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zm.51 15h-1V7h1v10zm-6-4.5h11v1h-11v-1z"/></svg>
                    FREQUENTLY USED
                `;
                scroller.appendChild(head);
                
                const grid = document.createElement('div');
                grid.className = 'emoji-grid';
                sorted.forEach(item => {
                    grid.appendChild(createEmojiCell(item.emoji));
                });
                scroller.appendChild(grid);
            }
        }
    }

    // 2. All Emojis Section
    const allHead = document.createElement('div');
    allHead.className = 'emoji-section-header';
    allHead.textContent = 'ALL EMOJIS';
    scroller.appendChild(allHead);

    const allGrid = document.createElement('div');
    allGrid.className = 'emoji-grid';
    EMOJI_LIST.forEach(char => {
        allGrid.appendChild(createEmojiCell(char));
    });
    // Add custom icons to the end of All Emojis for now
    CUSTOM_EMOJIS.forEach(emoji => {
        allGrid.appendChild(createEmojiCell(emoji.url, true));
    });
    scroller.appendChild(allGrid);

    if (window.twemoji) {
        twemoji.parse(scroller, { folder: 'svg', ext: '.svg' });
    }
}

function createEmojiCell(emoji, isCustom = false) {
    const cell = document.createElement('div');
    cell.className = 'emoji-cell';
    
    if (isCustom || (typeof emoji === 'string' && emoji.startsWith('http'))) {
        const img = document.createElement('img');
        img.src = emoji;
        cell.appendChild(img);
        cell.onclick = (e) => {
            e.stopPropagation();
            insertEmoji(`[${emoji}]`); // Custom stickers might use a special format or just the URL
        };
    } else {
        cell.textContent = emoji;
        cell.onclick = (e) => {
            e.stopPropagation();
            insertEmoji(emoji);
        };
    }
    return cell;
}

function insertEmoji(val) {
    if (messageInput) {
        messageInput.value += val;
        messageInput.focus();
    }
}

if (emojiPickerMenu && btnEmojiPicker) {
    // Initial load
    initializeEmojiPicker();

    // Toggle menu
    btnEmojiPicker.addEventListener('click', (e) => {
        e.stopPropagation();
        emojiPickerMenu.classList.toggle('hidden');
        if (!emojiPickerMenu.classList.contains('hidden')) {
            // Re-render frequently used on open
            initializeEmojiPicker();
        }
    });

    // Close when clicking outside
    document.addEventListener('click', (e) => {
        if (!emojiPickerMenu.contains(e.target) && !btnEmojiPicker.contains(e.target)) {
            emojiPickerMenu.classList.add('hidden');
        }
    });
}

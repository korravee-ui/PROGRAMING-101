// ═══════════════════════════════════════════════════════════════════════════
// Firebase Configuration & Utilities
// IHC-BD&PD Dashboard — Online Version
// ═══════════════════════════════════════════════════════════════════════════

// IMPORTANT: Update these values with your Firebase credentials from Firebase Console
// https://console.firebase.google.com → Project Settings → Copy config
// ── Fill in your Firebase credentials from Firebase Console ──
// Firebase Console → Project Settings → Your apps → Web app → Config
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase (called in main app files)
function initializeFirebaseApp() {
  if (!window.firebase) {
    console.error("Firebase SDK not loaded. Make sure to include Firebase scripts before this config.");
    return false;
  }
  
  try {
    firebase.initializeApp(firebaseConfig);
    console.log("✓ Firebase initialized successfully");
    return true;
  } catch (e) {
    if (e.code === 'app/duplicate-app') {
      console.log("✓ Firebase already initialized");
      return true;
    }
    console.error("Firebase initialization error:", e);
    return false;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// Authentication Utilities
// ═══════════════════════════════════════════════════════════════════════════

async function registerUser(email, password) {
  try {
    const userCredential = await firebase.auth().createUserWithEmailAndPassword(email, password);
    console.log("✓ User registered:", userCredential.user.email);
    return { success: true, user: userCredential.user };
  } catch (error) {
    console.error("Registration error:", error.message);
    return { success: false, error: error.message };
  }
}

async function loginUser(email, password) {
  try {
    const userCredential = await firebase.auth().signInWithEmailAndPassword(email, password);
    console.log("✓ User logged in:", userCredential.user.email);
    return { success: true, user: userCredential.user };
  } catch (error) {
    console.error("Login error:", error.message);
    return { success: false, error: error.message };
  }
}

async function logoutUser() {
  try {
    await firebase.auth().signOut();
    console.log("✓ User logged out");
    return { success: true };
  } catch (error) {
    console.error("Logout error:", error.message);
    return { success: false, error: error.message };
  }
}

function onAuthStateChanged(callback) {
  firebase.auth().onAuthStateChanged(callback);
}

function getCurrentUser() {
  return firebase.auth().currentUser;
}

// ═══════════════════════════════════════════════════════════════════════════
// Firestore Database Utilities
// ═══════════════════════════════════════════════════════════════════════════

async function saveCustomer(customerData) {
  try {
    const user = getCurrentUser();
    if (!user) throw new Error("User not authenticated");

    const db = firebase.firestore();
    const docId = customerData.id;
    await db.collection("users").doc(user.uid)
      .collection("customers").doc(docId).set({
        ...customerData,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      });

    console.log("✓ Customer saved with ID:", docId);
    return { success: true, id: docId };
  } catch (error) {
    console.error("Save customer error:", error.message);
    return { success: false, error: error.message };
  }
}

async function updateCustomer(customerId, customerData) {
  try {
    const user = getCurrentUser();
    if (!user) throw new Error("User not authenticated");

    const db = firebase.firestore();
    await db.collection("users").doc(user.uid)
      .collection("customers").doc(customerId).update({
        ...customerData,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      });
    
    console.log("✓ Customer updated:", customerId);
    return { success: true };
  } catch (error) {
    console.error("Update customer error:", error.message);
    return { success: false, error: error.message };
  }
}

async function getCustomers() {
  try {
    const user = getCurrentUser();
    if (!user) throw new Error("User not authenticated");

    const db = firebase.firestore();
    const snapshot = await db.collection("users").doc(user.uid)
      .collection("customers").orderBy("createdAt", "desc").get();
    
    const customers = [];
    snapshot.forEach(doc => {
      customers.push({ id: doc.id, ...doc.data() });
    });
    
    console.log("✓ Fetched", customers.length, "customers");
    return { success: true, data: customers };
  } catch (error) {
    console.error("Get customers error:", error.message);
    return { success: false, error: error.message, data: [] };
  }
}

async function deleteCustomer(customerId) {
  try {
    const user = getCurrentUser();
    if (!user) throw new Error("User not authenticated");

    const db = firebase.firestore();
    await db.collection("users").doc(user.uid)
      .collection("customers").doc(customerId).delete();
    
    console.log("✓ Customer deleted:", customerId);
    return { success: true };
  } catch (error) {
    console.error("Delete customer error:", error.message);
    return { success: false, error: error.message };
  }
}

async function saveDashboardData(dashboardData) {
  try {
    const user = getCurrentUser();
    if (!user) throw new Error("User not authenticated");

    const db = firebase.firestore();
    await db.collection("users").doc(user.uid)
      .collection("dashboards").doc("main").set({
        ...dashboardData,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      }, { merge: true });
    
    console.log("✓ Dashboard data saved");
    return { success: true };
  } catch (error) {
    console.error("Save dashboard data error:", error.message);
    return { success: false, error: error.message };
  }
}

async function getDashboardData() {
  try {
    const user = getCurrentUser();
    if (!user) throw new Error("User not authenticated");

    const db = firebase.firestore();
    const doc = await db.collection("users").doc(user.uid)
      .collection("dashboards").doc("main").get();
    
    if (doc.exists) {
      console.log("✓ Dashboard data fetched");
      return { success: true, data: doc.data() };
    } else {
      console.log("✓ No dashboard data found, returning empty");
      return { success: true, data: {} };
    }
  } catch (error) {
    console.error("Get dashboard data error:", error.message);
    return { success: false, error: error.message, data: {} };
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// Realtime Listener for Live Updates
// ═══════════════════════════════════════════════════════════════════════════

function listenToCustomers(callback) {
  try {
    const user = getCurrentUser();
    if (!user) {
      console.error("User not authenticated for listener");
      return null;
    }

    const db = firebase.firestore();
    return db.collection("users").doc(user.uid)
      .collection("customers").orderBy("createdAt", "desc")
      .onSnapshot(snapshot => {
        const customers = [];
        snapshot.forEach(doc => {
          customers.push({ id: doc.id, ...doc.data() });
        });
        callback(customers);
      }, error => {
        console.error("Listener error:", error);
      });
  } catch (error) {
    console.error("Setup listener error:", error.message);
    return null;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// Utility Functions
// ═══════════════════════════════════════════════════════════════════════════

function checkAuthentication(redirectTo = "/auth.html") {
  const user = getCurrentUser();
  if (!user && window.location.pathname !== redirectTo) {
    window.location.href = redirectTo;
    return false;
  }
  return !!user;
}

function sanitizeData(data) {
  // Remove sensitive fields before storing
  const sanitized = { ...data };
  return sanitized;
}

// Export for use in other scripts
window.firebaseApp = {
  initializeFirebaseApp,
  registerUser,
  loginUser,
  logoutUser,
  onAuthStateChanged,
  getCurrentUser,
  saveCustomer,
  updateCustomer,
  getCustomers,
  deleteCustomer,
  saveDashboardData,
  getDashboardData,
  listenToCustomers,
  checkAuthentication
};

console.log("✓ Firebase config loaded");

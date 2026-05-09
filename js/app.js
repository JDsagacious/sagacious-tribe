console.log("JS LOADED");

const SUPABASE_URL = "https://gbgmcncsbrtfiaephfhf.supabase.co";
const SUPABASE_KEY = "sb_publishable_28L5eJ-sNCMTCP-iQ57wRw_5JjA0wVj";

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Pi SDK will be initialized inside window.onload

// NAV
function showModule(id) {
  document.querySelectorAll('.module').forEach(m => m.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

// USER
let userElem;

// INIT (FIXED)
document.addEventListener("DOMContentLoaded", function () {

  userElem = document.getElementById("user");

  // ✅ INIT PI PROPERLY
  if (window.Pi) {
   Pi.init({
  version: "2.0",
  sandbox: false
});
    console.log("Pi initialized (SANDBOX MODE)");
  } else {
    console.log("Pi SDK NOT loaded");
  }

  let piUser = localStorage.getItem("pi_user");
  if (piUser) {
  userElem.innerText = "👤 " + piUser;

  // ✅ hide button if already logged in
  const btn = document.getElementById("login-btn");
  if (btn) btn.style.display = "none";
}

  showModule('tribe');
  loadPosts();
  loadProducts();
  loadReports();
  
loadGroups();
  loadMessages();     // load initial chat
subscribeToChat();  // enable real-time
  
});

// LOGIN
async function loginWithPi() {
  console.log("Login button clicked");

  if (!window.Pi) {
    alert("Pi SDK not available");
    return;
  }

  try {
    const auth = await Pi.authenticate(['username']);

    const username = auth.user.username;

    localStorage.setItem("pi_user", username);
userElem.innerText = "👤 " + username;

// ✅ HIDE LOGIN BUTTON AFTER LOGIN
const btn = document.getElementById("login-btn");
if (btn) btn.style.display = "none";

    console.log("Logged in as:", username);

  } catch (err) {
    console.log("Login failed", err);
    alert("Login failed");
  }
}

// ==========================
// AFRISPICE (PRODUCTS)
// ==========================

async function loadProducts() {
  const { data, error } = await supabaseClient.from("products").select("*");

if (error) {
  console.error("Send error:", error);
  alert(error.message);
  return;
}

  const container = document.getElementById("product-list");
  container.innerHTML = "";

  data.forEach(p => {
    const div = document.createElement("div");
    div.className = "card";

    div.innerHTML = `
      <h3>${p.name}</h3>
      <p>${p.price} Pi</p>
      <small>${p.user}</small>
    `;

    container.appendChild(div);
  });
}

async function addProduct() {
  const inputs = document.querySelectorAll('#afrispice input');
  const name = inputs[0].value;
  const price = inputs[1].value;

  const user = localStorage.getItem("pi_user") || "Anonymous";

  const { error } = await supabaseClient
    .from("products")
    .insert([{ name, price, user }]);

  if (error) {
    console.log("Insert error:", error);
  }

  loadProducts();
}

// ==========================
// CYBERGUARDIANS (REPORTS)
// ==========================

async function loadReports() {
  const { data, error } = await supabaseClient.from("reports").select("*");

  if (error) {
    console.log("Error loading reports:", error);
    return;
  }

  const container = document.getElementById("report-list");
  container.innerHTML = "";

  data.forEach(r => {
    const div = document.createElement("div");
    div.className = "card";

    div.innerHTML = `
      <h3>${r.title}</h3>
      <p>${r.description}</p>
      <small>${r.user}</small>
    `;

    container.appendChild(div);
  });
}

async function addReport() {
  const title = document.querySelector('#cyber input').value;
  const description = document.querySelector('#cyber textarea').value;

  const user = localStorage.getItem("pi_user") || "Anonymous";

  const { error } = await supabaseClient
    .from("reports")
    .insert([{ title, description, user }]);

  if (error) {
    console.log("Insert error:", error);
  }

  loadReports();
}

// ==========================
// TRIBE TALK (POSTS)
// ==========================

async function loadPosts() {
  const { data, error } = await supabaseClient
    .from("posts")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.log("Error loading posts:", error);
    return;
  }

  const container = document.getElementById("post-list");
  container.innerHTML = "";

  data.forEach(p => {
    const div = document.createElement("div");
    div.className = "card";

    div.innerHTML = `
      <p>${p.content}</p>
      <small>👤 ${p.username} • ${new Date(p.created_at).toLocaleString()}</small>
    `;

    container.appendChild(div);
  });
}

async function addPost() {
 const content = document.getElementById("post-content").value.trim();

  if (!content) {
    alert("Write something first");
    return;
  }

  const username = localStorage.getItem("pi_user") || "Anonymous";

  const { error } = await supabaseClient
    .from("posts")
    .insert([{ content, username }]);

  if (error) {
    console.log("Insert error:", error);
    return;
  }

  document.getElementById("post-content").value = "";
  loadPosts();
}

// ==========================
// TRIBE TALK (REAL-TIME CHAT)
// ==========================

// LOAD MESSAGES
async function loadMessages() {
 const roomSelect = document.getElementById("room");
if (!roomSelect) return;

const room = roomSelect.value;

  const { data, error } = await supabaseClient
    .from("messages")
    .select("*")
    .eq("room", room)
    .order("created_at", { ascending: true });

  if (error) {
    console.log("Error loading messages:", error);
    return;
  }

 const box = document.getElementById("chat-box");
if (!box) return;

box.innerHTML = "";

  data.forEach(msg => {
    const div = document.createElement("div");
    div.className = "card";

    div.innerHTML = `
      <p>${msg.message}</p>
     <small>
👤 ${msg.username} •
${new Date(msg.created_at).toLocaleTimeString()}
</small>
    `;

    box.appendChild(div);
  });

  // auto scroll down
  box.scrollTop = box.scrollHeight;
}

// SEND MESSAGE
async function sendMessage() {
  const input = document.getElementById("message-input");
  if (!input) return;
  
  const message = input.value.trim();
const roomSelect = document.getElementById("room");
if (!roomSelect) return;

const room = roomSelect.value; 

  if (!message) return;

  const username = localStorage.getItem("pi_user") || "Anonymous";

  const { error } = await supabaseClient
    .from("messages")
    .insert([{ message, username, room }]);

  if (error) {
    console.log("Send error:", error);
    return;
  }

 input.value = "";
loadMessages(); // instant update
}

// REAL-TIME SUBSCRIPTION
function subscribeToChat() {
  supabaseClient
    .channel("public:messages")
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "messages" },
      payload => {
        loadMessages(); // refresh chat instantly
      }
    )
   .subscribe((status) => {
  console.log("Realtime status:", status);
});
}

// ==========================
// GROUP SYSTEM
// ==========================
// LOAD GROUPS
async function loadGroups() {
  const { data, error } = await supabaseClient
    .from("groups")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.log("Error loading groups:", error);
    return;
  }

  const container = document.getElementById("group-list");
  if (!container) return;

  container.innerHTML = "";

  data.forEach(g => {
    const div = document.createElement("div");
    div.className = "card";

    div.innerHTML = `
      <h4>${g.name}</h4>
      <small>👤 ${g.creator}</small>
      <button onclick="joinGroup(${g.id}, '${g.name}')">Join</button>
    `;

    container.appendChild(div);
  });
}

// CREATE GROUP
async function createGroup() {
  const input = document.getElementById("group-name");
  if (!input) return;

  const name = input.value.trim();
  if (!name) return;

  const creator = localStorage.getItem("pi_user") || "Anonymous";

  const { error } = await supabaseClient
    .from("groups")
    .insert([{ name, creator }]);

  if (error) {
    console.log("Create group error:", error);
    return;
  }

  input.value = "";
  loadGroups();
}

// JOIN GROUP
async function joinGroup(groupId, groupName) {
  const username = localStorage.getItem("pi_user") || "Anonymous";

 const { error } = await supabaseClient
  .from("group_members")
  .insert([{ group_id: groupId, username }]);

if (error) {
  console.log("Join group error:", error);
  return;
}

  const roomSelect = document.getElementById("room");
  if (!roomSelect) return;

  // prevent duplicate option
  const existing = [...roomSelect.options].find(
    option => option.value === "group_" + groupId
  );

  if (!existing) {
    const option = document.createElement("option");

    option.value = "group_" + groupId;
    option.text = "👥 " + groupName;

    roomSelect.appendChild(option);
  }

  roomSelect.value = "group_" + groupId;

  loadMessages();
}

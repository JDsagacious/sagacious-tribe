console.log("JS LOADED");

const SUPABASE_URL = "https://gbgmcncsbrtfiaephfhf.supabase.co";

const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdiZ21jbmNzYnJ0ZmlhZXBoZmhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU2MDYyNzgsImV4cCI6MjA5MTE4MjI3OH0.-CspeTCz2VKtrjqgg7G1iuaqdA3sF_Eg09fBVTKQ5GM";

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

initPi();
  
   userElem = document.getElementById("user");

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
loadJoinedGroups();
loadMessages();
subscribeToChat();
  
});

async function initPi() {

  if (!window.Pi) {
    console.log("Pi SDK NOT loaded");
    return;
  }

  try {

    await window.Pi.init({
      version: "2.0",
      sandbox: true
    });

    console.log("Pi initialized successfully");

  } catch (err) {

    console.log("Pi init error:", err);

  }

}

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
  console.error("Load products error:", error);
  alert(error.message);
  return;
}

 const container = document.getElementById("product-list");
if (!container) return;

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
if (!container) return;

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

  if (!container) return;

  container.innerHTML = "";

  data.forEach(p => {

    const div = document.createElement("div");

    div.className = "card";

  div.innerHTML = `
  <div style="display:flex;align-items:center;gap:10px;">

    <img
      src="${p.avatar}"
      width="40"
      height="40"
      style="border-radius:50%;"
    >

    <div>
      <small>
        👤 ${p.username}<br>
        ${new Date(p.created_at).toLocaleString()}
      </small>
    </div>

  </div>

 <p>${p.content}</p>

${
  p.image
    ? `
      <img
        src="${p.image}"
        style="
          width:100%;
          max-width:400px;
          border-radius:10px;
          margin-top:10px;
        "
      >
    `
    : ""
}

  <br>

  <button onclick="likePost(${p.id}, ${p.likes || 0})">
    ❤️ Like (${p.likes || 0})
  </button>
`;

    container.appendChild(div);

  });

}

async function addPost() {

  const content = document
    .getElementById("post-content")
    .value
    .trim();

  const imageFile =
    document.getElementById("post-image").files[0];

  if (!content && !imageFile) {
    alert("Write something or select image");
    return;
  }

  const username =
    localStorage.getItem("pi_user") || "Anonymous";

  const avatar =
    `https://ui-avatars.com/api/?name=${username}&background=random`;

  let imageUrl = null;

  // UPLOAD IMAGE
  if (imageFile) {

    const fileName =
      Date.now() + "_" + imageFile.name;

    const { error: uploadError } =
      await supabaseClient.storage
        .from("tribe-images")
        .upload(fileName, imageFile);

    if (uploadError) {
      console.log("Upload error:", uploadError);
      return;
    }

    const { data } =
      supabaseClient.storage
        .from("tribe-images")
        .getPublicUrl(fileName);

    imageUrl = data.publicUrl;

  }

  // SAVE POST
  const { error } = await supabaseClient
    .from("posts")
    .insert([{
      content,
      username,
      avatar,
     image: imageUrl
    }]);

  if (error) {
  alert("Insert error: " + error.message);
  console.log(error);
  return;
}

  document.getElementById("post-content").value = "";
  document.getElementById("post-image").value = "";

  loadPosts();

}

async function likePost(id, currentLikes) {

  const { error } = await supabaseClient
    .from("posts")
    .update({
      likes: currentLikes + 1
    })
    .eq("id", id);

  if (error) {
    console.log("Like error:", error);
    return;
  }

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
  ${
  msg.reply_to
    ? `<small>↪ Replying to message #${msg.reply_to}</small>`
    : ""
}

<div style="display:flex;align-items:center;gap:10px;">

  <img
    src="${msg.avatar}"
    width="35"
    height="35"
    style="border-radius:50%;"
  >

  <div>
    <small>
      👤 ${msg.username} •
      ${new Date(msg.created_at).toLocaleTimeString()}
    </small>
  </div>

</div>

<p>${msg.message}</p>

  <small>
    👤 ${msg.username} •
    ${new Date(msg.created_at).toLocaleTimeString()}
  </small>

  <br>

 ${
  msg.username === localStorage.getItem("pi_user")
    ? `
        <button onclick="editMessage(${msg.id}, ${JSON.stringify(msg.message)})">
          Edit
        </button>

        <button onclick="deleteMessage(${msg.id})">
          Delete
        </button>

        <button onclick="replyToMessage(${msg.id})">
          Reply
        </button>
      `
    : `
        <button onclick="replyToMessage(${msg.id})">
          Reply
        </button>
      `
}
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

  const avatar =
  `https://ui-avatars.com/api/?name=${username}&background=random`;
  
const replyTo = input.dataset.replyTo || null;
  
  const { error } = await supabaseClient
    .from("messages")
 .insert([{
  message,
  username,
  avatar,
  room,
  reply_to: replyTo
}]);

  if (error) {
    console.log("Send error:", error);
    return;
  }

input.value = "";

delete input.dataset.replyTo;

loadMessages();

}

async function deleteMessage(id) {

  const { error } = await supabaseClient
    .from("messages")
    .delete()
    .eq("id", id);

  if (error) {
    console.log(error);
    return;
  }

  loadMessages();
}

async function editMessage(id, oldMessage) {

  const newMessage = prompt("Edit message:", oldMessage);

  if (!newMessage) return;

  const { error } = await supabaseClient
    .from("messages")
    .update({ message: newMessage })
    .eq("id", id);

  if (error) {
    console.log(error);
    return;
  }

  loadMessages();
}

async function replyToMessage(id) {

  const input = document.getElementById("message-input");

  if (!input) return;

  input.value = `Replying to #${id}: `;

  input.focus();

  input.dataset.replyTo = id;

}

// REAL-TIME SUBSCRIPTION
function subscribeToChat() {

  supabaseClient
    .channel("public:messages")

    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "messages"
      },
      payload => {

        console.log("Realtime change:", payload);

        loadMessages();

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
      <button onclick='joinGroup(${g.id}, ${JSON.stringify(g.name)})'>
  Join
</button>
    `;

    container.appendChild(div);
  });
}

// LOAD JOINED GROUPS
async function loadJoinedGroups() {

  const username = localStorage.getItem("pi_user");

  if (!username) return;

  const { data, error } = await supabaseClient
    .from("group_members")
    .select(`
      group_id,
      groups (
        id,
        name
      )
    `)
    .eq("username", username);

  if (error) {
    console.log("Load joined groups error:", error);
    return;
  }

  const roomSelect = document.getElementById("room");

  if (!roomSelect) return;

  data.forEach(member => {

    const group = member.groups;

    if (!group) return;

    const existing = [...roomSelect.options].find(
      option => option.value === "group_" + group.id
    );

    if (!existing) {

      const option = document.createElement("option");

      option.value = "group_" + group.id;
      option.text = "👥 " + group.name;

      roomSelect.appendChild(option);
    }

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

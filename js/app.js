console.log("JS LOADED");

const SUPABASE_URL = "https://gbgmcncsbrtfiaephfhf.supabase.co";
const SUPABASE_KEY = "sb_publishable_28L5eJ-sNCMTCP-iQ57wRw_5JjA0wVj";

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// INIT PI SDK EARLY
Pi.init({ version: "2.0", sandbox: true });
console.log("Pi SDK initialized");

// NAV
function showModule(id) {
  document.querySelectorAll('.module').forEach(m => m.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

// USER
let userElem;

// INIT
window.onload = () => {
  userElem = document.getElementById("user");

  let piUser = localStorage.getItem("pi_user");
  if (piUser) userElem.innerText = "👤 " + piUser;

  showModule('tribe');
  loadProducts();
  loadReports();
};

// LOGIN
function loginWithPi() {

  Pi.authenticate(['username'], auth => {
    const username = auth.user.username;

    localStorage.setItem("pi_user", username);

    document.getElementById("user").innerText = "👤 " + username;

    console.log("Logged in as:", username);

  }, err => {
    console.log("Login failed", err);
    alert("Login failed");
  });
}

// ==========================
// AFRISPICE (PRODUCTS)
// ==========================

async function loadProducts() {
  const { data, error } = await supabaseClient.from("products").select("*");

  if (error) {
    console.log("Error loading products:", error);
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

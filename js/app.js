const SUPABASE_URL = "YOUR_URL";
const SUPABASE_KEY = "YOUR_KEY";

const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// NAV
function showModule(id) {
  document.querySelectorAll('.module').forEach(m => m.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

// USER
const userElem = document.getElementById("user");
let piUser = localStorage.getItem("pi_user");

if (piUser) userElem.innerText = "👤 " + piUser;

// LOGIN
function loginWithPi() {
  Pi.init({ version: "2.0", sandbox: true });

  Pi.authenticate(['username'], auth => {
    localStorage.setItem("pi_user", auth.user.username);
    userElem.innerText = "👤 " + auth.user.username;
  }, () => alert("Login failed"));
}

// INIT
window.onload = () => {
  showModule('tribe');
  loadProducts();
  loadReports();
};

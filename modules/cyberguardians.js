async function loadReports() {
  const container = document.getElementById("report-list");

  if (!container) return;

  container.innerHTML = "<p>Loading reports...</p>";

  try {
    const { data, error } = await supabase.from("reports").select("*");

    if (error) throw error;

    container.innerHTML = "";

    if (!data || data.length === 0) {
      container.innerHTML = "<p>No reports yet</p>";
      return;
    }

    data.forEach(r => {
      const div = document.createElement("div");
      div.className = "card";

      div.innerHTML = `
        <h3>${r.title}</h3>
        <p>${r.description}</p>
        <small>Reported by: ${r.user}</small>
      `;

      container.appendChild(div);
    });

  } catch (err) {
    container.innerHTML = "<p>⚠️ Database not connected yet</p>";
  }
}

async function addReport() {
  const title = document.querySelector('#cyber input').value;
  const description = document.querySelector('#cyber textarea').value;

  if (!title || !description) {
    alert("Please fill all fields");
    return;
  }

  const user = localStorage.getItem("pi_user") || "Anonymous";

  try {
    await supabase.from("reports").insert([
      { title, description, user }
    ]);

    document.querySelector('#cyber input').value = "";
    document.querySelector('#cyber textarea').value = "";

    loadReports();

  } catch (err) {
    alert("Database not connected yet");
  }
}

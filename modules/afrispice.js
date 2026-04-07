async function loadProducts() {
  const container = document.getElementById("product-list");

  if (!container) return;

  container.innerHTML = "<p>Loading products...</p>";

  try {
    const { data, error } = await supabase.from("products").select("*");

    if (error) throw error;

    container.innerHTML = "";

    if (!data || data.length === 0) {
      container.innerHTML = "<p>No products yet</p>";
      return;
    }

    data.forEach(p => {
      const div = document.createElement("div");
      div.className = "card";

      div.innerHTML = `
        <h3>${p.name}</h3>
        <p>${p.price} Pi</p>
        <small>Seller: ${p.user}</small>
        <br><br>
        <button onclick="payWithPi('${p.name}','${p.price}')">
          Buy Now
        </button>
      `;

      container.appendChild(div);
    });

  } catch (err) {
    container.innerHTML = "<p>⚠️ Database not connected yet</p>";
  }
}

async function addProduct() {
  const inputs = document.querySelectorAll('#afrispice input');

  const name = inputs[0].value;
  const price = inputs[1].value;

  if (!name || !price) {
    alert("Please fill all fields");
    return;
  }

  const user = localStorage.getItem("pi_user") || "Anonymous";

  try {
    await supabase.from("products").insert([
      { name, price, user }
    ]);

    inputs[0].value = "";
    inputs[1].value = "";

    loadProducts();

  } catch (err) {
    alert("Database not connected yet");
  }
}

function payWithPi(productName, amount) {
  Pi.createPayment({
    amount: parseFloat(amount),
    memo: "Purchase of " + productName
  }, {
    onReadyForServerApproval: function(paymentId) {
      console.log("Ready for approval:", paymentId);
    },
    onReadyForServerCompletion: function(paymentId, txid) {
      alert("✅ Payment successful!");
    },
    onCancel: function(paymentId) {
      alert("❌ Payment cancelled");
    },
    onError: function(error) {
      alert("⚠️ Payment error");
    }
  });
}

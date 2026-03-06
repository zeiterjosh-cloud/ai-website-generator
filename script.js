function generateWebsite() {
  const idea = document.getElementById("ideaInput").value;

  if (!idea) {
    alert("Please describe your website idea.");
    return;
  }

  const result = document.getElementById("result");

  result.innerHTML = `
  <h2>${idea}</h2>

  <section>
    <h3>Hero Section</h3>
    <p>A large headline introducing the ${idea} website.</p>
    <button>Get Started</button>
  </section>

  <section>
    <h3>Features</h3>
    <ul>
      <li>Feature 1 – Fast and simple design</li>
      <li>Feature 2 – Mobile friendly</li>
      <li>Feature 3 – Modern layout</li>
    </ul>
  </section>

  <section>
    <h3>Call To Action</h3>
    <button>Join Now</button>
  </section>
  `;
}

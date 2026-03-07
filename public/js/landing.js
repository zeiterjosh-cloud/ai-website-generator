document.addEventListener("DOMContentLoaded", () => {
  const navStart = document.getElementById("navStart");
  const heroStart = document.getElementById("heroStart");
  const heroGallery = document.getElementById("heroGallery");

  const goToGallery = () => {
    window.location.href = "/gallery";
  };

  navStart?.addEventListener("click", goToGallery);
  heroStart?.addEventListener("click", goToGallery);
  heroGallery?.addEventListener("click", goToGallery);
});

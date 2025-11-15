// Simple Show/Hide toggle for each proposal
function toggleDetails(id) {
  const section = document.getElementById(id);
  if (section.style.display === "block") {
    section.style.display = "none";
  } else {
    section.style.display = "block";
  }
}

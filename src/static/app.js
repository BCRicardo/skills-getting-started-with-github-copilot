document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = details.max_participants - details.participants.length;


        // Cria lista de participantes com ícone de exclusão
        let participantsHTML = "<ul class='participants-list'>";
        if (details.participants.length > 0) {
          details.participants.forEach(participant => {
            participantsHTML += `
              <li class="participant-item">
                <span class="participant-email">${participant}</span>
                <button class="delete-participant-btn" title="Remover participante" data-activity="${encodeURIComponent(name)}" data-email="${encodeURIComponent(participant)}">
                  <svg xmlns='http://www.w3.org/2000/svg' width='18' height='18' viewBox='0 0 20 20' fill='none' stroke='#c62828' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><line x1='5' y1='5' x2='15' y2='15'/><line x1='15' y1='5' x2='5' y2='15'/></svg>
                </button>
              </li>
            `;
          });
        } else {
          participantsHTML += `<li class='no-participants'>Nenhum participante ainda</li>`;
        }
        participantsHTML += "</ul>";

        activityCard.innerHTML = `
          <h4>${name}</h4>
          <p>${details.description}</p>
          <p><strong>Schedule:</strong> ${details.schedule}</p>
          <p><strong>Availability:</strong> ${spotsLeft} spots left</p>
          <div class="participants-section">
            <strong>Participantes:</strong>
            ${participantsHTML}
          </div>
        `;

        activitiesList.appendChild(activityCard);
      // Delegação de evento para botões de exclusão
      activitiesList.addEventListener("click", async (event) => {
        if (event.target.closest && event.target.closest(".delete-participant-btn")) {
          const btn = event.target.closest(".delete-participant-btn");
          const activity = decodeURIComponent(btn.getAttribute("data-activity"));
          const email = decodeURIComponent(btn.getAttribute("data-email"));
          if (confirm(`Remover ${email} da atividade ${activity}?`)) {
            try {
              const response = await fetch(`/activities/${encodeURIComponent(activity)}/participants/${encodeURIComponent(email)}`, {
                method: "DELETE"
              });
              const result = await response.json();
              if (response.ok) {
                fetchActivities();
                messageDiv.textContent = result.message;
                messageDiv.className = "success";
              } else {
                messageDiv.textContent = result.detail || "Erro ao remover participante.";
                messageDiv.className = "error";
              }
              messageDiv.classList.remove("hidden");
              setTimeout(() => {
                messageDiv.classList.add("hidden");
              }, 5000);
            } catch (error) {
              messageDiv.textContent = "Erro ao remover participante.";
              messageDiv.className = "error";
              messageDiv.classList.remove("hidden");
            }
          }
        }
      });

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        signupForm.reset();
        fetchActivities();
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  // Initialize app
  fetchActivities();
});

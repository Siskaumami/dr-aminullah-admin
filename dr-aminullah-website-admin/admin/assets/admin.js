(function () {
  const CONTACT_MESSAGES_KEY = "drAminullahContactMessages";

  function getContactMessages() {
    try {
      return JSON.parse(localStorage.getItem(CONTACT_MESSAGES_KEY)) || [];
    } catch (error) {
      return [];
    }
  }

  function setContactMessages(messages) {
    localStorage.setItem(CONTACT_MESSAGES_KEY, JSON.stringify(messages));
  }

  function formatDateTime(dateString) {
    if (!dateString) return "-";

    return new Intl.DateTimeFormat("id-ID", {
      dateStyle: "medium",
      timeStyle: "short"
    }).format(new Date(dateString));
  }

  function getStatusLabel(status) {
    const labels = {
      unread: "Belum dibaca",
      read: "Dibaca",
      replied: "Dibalas"
    };

    return labels[status] || "Belum dibaca";
  }

  function renderMessages() {
    const container = document.getElementById("messagesList");
    if (!container) return;

    const messages = getContactMessages();

    if (messages.length === 0) {
      container.innerHTML = '<p class="messages-empty">Belum ada pesan terkirim</p>';
      return;
    }

    container.innerHTML = messages.map(function (message) {
      const status = message.status || "unread";

      const readButton = status === "unread"
        ? `<button class="btn small" type="button" data-message-action="read" data-message-id="${message.id}">Tandai dibaca</button>`
        : "";

      const replyButton = status === "read"
        ? `<button class="btn small" type="button" data-message-action="replied" data-message-id="${message.id}">Tandai dibalas</button>`
        : "";

      const deleteButton = status === "replied"
        ? `<button class="btn small danger" type="button" data-message-action="delete" data-message-id="${message.id}">Hapus pesan</button>`
        : "";

      return `
        <article class="message-card">
          <div class="message-top">
            <div>
              <h3 class="message-title">${escapeHtml(message.subject)}</h3>
              <div class="message-time">Dikirim: ${formatDateTime(message.createdAt)}</div>
            </div>
            <span class="badge ${status}">${getStatusLabel(status)}</span>
          </div>

          <div class="message-info">
            <div>
              <span>Nama</span>
              ${escapeHtml(message.name)}
            </div>
            <div>
              <span>Email</span>
              ${escapeHtml(message.email)}
            </div>
            <div>
              <span>WA yang dapat dihubungi</span>
              ${escapeHtml(message.whatsapp)}
            </div>
            <div>
              <span>Institusi / Afiliasi</span>
              ${escapeHtml(message.institution)}
            </div>
          </div>

          <p class="message-body">${escapeHtml(message.message)}</p>

          <div class="message-actions">
            ${readButton}
            ${replyButton}
            ${deleteButton}
          </div>
        </article>
      `;
    }).join("");
  }

  function updateMessageStatus(messageId, nextStatus) {
    const messages = getContactMessages().map(function (message) {
      if (message.id !== messageId) return message;

      const updatedMessage = {
        ...message,
        status: nextStatus
      };

      if (nextStatus === "read") {
        updatedMessage.readAt = new Date().toISOString();
      }

      if (nextStatus === "replied") {
        updatedMessage.repliedAt = new Date().toISOString();
      }

      return updatedMessage;
    });

    setContactMessages(messages);
    renderMessages();
  }

  function deleteMessage(messageId) {
    const confirmed = confirm("Hapus pesan ini?");
    if (!confirmed) return;

    const messages = getContactMessages().filter(function (message) {
      return message.id !== messageId;
    });

    setContactMessages(messages);
    renderMessages();
  }

  function escapeHtml(value) {
    return String(value || "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function initAdminForms() {
    const forms = document.querySelectorAll("[data-admin-form]");

    forms.forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();

        const message = form.querySelector("[data-form-message]");

        if (message) {
          message.textContent = "Simulasi tersimpan. Sambungkan ke Supabase API agar data benar-benar tersimpan.";
          message.style.display = "inline-block";
        }
      });
    });
  }

  function initMessageActions() {
    document.addEventListener("click", function (event) {
      const actionButton = event.target.closest("[data-message-action]");
      if (!actionButton) return;

      const action = actionButton.dataset.messageAction;
      const messageId = actionButton.dataset.messageId;

      if (action === "read") {
        updateMessageStatus(messageId, "read");
      }

      if (action === "replied") {
        updateMessageStatus(messageId, "replied");
      }

      if (action === "delete") {
        deleteMessage(messageId);
      }
    });
  }

  initAdminForms();
  initMessageActions();
  renderMessages();
})();
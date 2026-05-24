// Copia al portapapeles del email mostrado en el botón. Usa la Clipboard
// API moderna y cae a un textarea + execCommand cuando no está disponible
// (Safari/contextos sin HTTPS). Da feedback inmediato en el botón y en un
// toast compartido.

export function initCopyEmail(buttons, toast) {
  buttons.forEach((button) => {
    button.addEventListener("click", async () => {
      const email = button.getAttribute("data-copy-email");
      const label = button.querySelector("[data-copy-label]");
      const originalText = label?.textContent || "Copiar correo";

      if (!email) {
        return;
      }

      try {
        await copyText(email);
        if (label) {
          label.textContent = "Correo copiado";
        }
        button.classList.add("is-copied");
        showToast(toast, "Correo copiado al portapapeles.");

        window.setTimeout(() => {
          if (label) {
            label.textContent = originalText;
          }
          button.classList.remove("is-copied");
        }, 2600);
      } catch {
        showToast(toast, "No se pudo copiar el correo. Selecciónalo manualmente.");
      }
    });
  });
}

async function copyText(value) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value);
    return;
  }

  const field = document.createElement("textarea");
  field.value = value;
  field.setAttribute("readonly", "");
  field.style.position = "fixed";
  field.style.opacity = "0";
  document.body.append(field);
  field.select();

  try {
    const copied = document.execCommand("copy");
    if (!copied) {
      throw new Error("Copy command failed");
    }
  } finally {
    field.remove();
  }
}

let toastTimer = null;

function showToast(toast, message) {
  if (!toast) {
    return;
  }
  toast.textContent = message;
  toast.classList.add("is-visible");
  if (toastTimer !== null) {
    clearTimeout(toastTimer);
  }
  toastTimer = window.setTimeout(() => {
    toast.classList.remove("is-visible");
    toastTimer = null;
  }, 3600);
}

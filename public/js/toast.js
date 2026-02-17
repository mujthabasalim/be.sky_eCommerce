
let hoverTimeout; // Timeout for hover effect

function createToast(message, type = 'success', duration = 5000) {
  const container = document.getElementById('custom-toast-container');
  if (!container) return;

  // Define properties based on type
  const props = {
    success: { icon: 'bi-check-lg', title: 'Success' },
    error: { icon: 'bi-x-lg', title: 'Error' },
    warning: { icon: 'bi-exclamation-lg', title: 'Warning' },
    info: { icon: 'bi-info-lg', title: 'Info' },
    custom: { icon: 'bi-bell', title: 'Notification' }
  };

  const { icon, title } = props[type] || props.custom;

  // Create toast element
  const toast = document.createElement('div');
  toast.classList.add('custom-toast', type);

  // HTML Structure
  toast.innerHTML = `
    <div class="toast-content">
      <div class="icon">
        <i class="bi ${icon}"></i>
      </div>
      <div class="message">
        <span class="text text-1">${title}</span>
        <span class="text text-2">${message}</span>
      </div>
    </div>
    <i class="bi bi-x close"></i>
    <div class="progress"></div>
  `;

  container.appendChild(toast);

  // Close button functionality
  const closeBtn = toast.querySelector('.close');
  closeBtn.addEventListener('click', () => {
    removeToast(toast);
  });

  // Auto remove after duration
  const timeoutId = setTimeout(() => {
    removeToast(toast);
  }, duration);

  // Helpers
  function removeToast(element) {
    element.style.animation = 'fadeOut 0.3s ease forwards';
    setTimeout(() => {
        if(element.parentElement) {
            element.remove();
        }
    }, 300);
  }

  // Hover Effect (Pause removal)
  toast.addEventListener('mouseenter', () => clearTimeout(timeoutId));
  toast.addEventListener('mouseleave', () => {
    setTimeout(() => removeToast(toast), 2000); // Give a little extra time after hover
  });

  // Limit number of toasts (Max 4)
  if (container.children.length > 4) {
      removeToast(container.children[0]);
  }
}

export function closeModal() {
  Array.from(document.querySelectorAll('.ch_modal')).forEach((modal: any) => (modal.style.display = 'none'));
}

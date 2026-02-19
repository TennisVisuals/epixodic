export const changeDisplay = (display: string, id: string) => {
  const element = document.getElementById(id);
  if (element) element.style.display = display;
};

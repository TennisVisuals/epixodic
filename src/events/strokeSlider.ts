export function strokeSlider(show?: string) {
  const width = window.innerWidth;
  const stroke_slider = document.getElementById('stroke_slider');
  const slideRight = document.getElementById('slideright');
  const slideLeft = document.getElementById('slideleft');

  const hideSlide = () => {
    if (stroke_slider) stroke_slider.style.display = 'none';
  };

  if (show) {
    if (stroke_slider) {
      stroke_slider.style.display = 'flex';
      stroke_slider.style.left = show == 'left' ? width * -1 + 'px' : width * 1.5 + 'px';
    }
    if (slideLeft) slideLeft.style.display = show == 'right' ? 'flex' : 'none';
    if (slideRight) slideRight.style.display = show == 'left' ? 'flex' : 'none';

    stroke_slider.style.left = show === 'left' ? '0px' : width * 0.5 + 'px';
    stroke_slider.style.animation = show === 'left' ? 'slideInLeft 0.7s' : 'slideInRight 0.7s';
  } else {
    setTimeout(() => hideSlide(), 100);
  }
}

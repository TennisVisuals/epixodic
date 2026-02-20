export function strokeSlider(show?: string) {
  const width = window.innerWidth;
  const stroke_slider = document.getElementById('stroke_slider');
  const slideRight = document.getElementById('slideright');
  const slideLeft = document.getElementById('slideleft');

  const hideSlide = () => {
    if (stroke_slider) stroke_slider.style.display = 'none';
  };

  if (show) {
    const sliderWidth = Math.min(width * 0.5, 200);
    if (stroke_slider) {
      stroke_slider.style.display = 'flex';
      stroke_slider.style.left = show == 'left' ? -sliderWidth + 'px' : width + 'px';
    }
    if (slideLeft) slideLeft.style.display = show == 'right' ? 'flex' : 'none';
    if (slideRight) slideRight.style.display = show == 'left' ? 'flex' : 'none';

    stroke_slider.style.left = show === 'left' ? '0px' : (width - sliderWidth) + 'px';
    stroke_slider.style.animation = show === 'left' ? 'slideInLeft 0.7s' : 'slideInRight 0.7s';
  } else {
    setTimeout(() => hideSlide(), 100);
  }
}

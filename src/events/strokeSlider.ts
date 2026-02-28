import { getProfile, resultToContext } from '../decorations';
import type { StrokeContext } from '../decorations';
import { settings } from '../state/env';
import { FOREHAND, BACKHAND } from '../utils/constants';

let lastContext: StrokeContext | undefined;
let lastProfileId: string | undefined;
let overlay: HTMLElement | null = null;
let onDismissCallback: (() => void) | undefined;

function showOverlay(): void {
  if (overlay) return;
  const createdAt = Date.now();
  overlay = document.createElement('div');
  overlay.id = 'stroke_slider_overlay';
  overlay.addEventListener('click', () => {
    // Ignore the ghost click synthesized ~300ms after the touchstart that opened the slider
    if (Date.now() - createdAt < 400) return;
    const cb = onDismissCallback;
    onDismissCallback = undefined;
    strokeSlider();
    cb?.();
  });
  document.body.appendChild(overlay);
}

function removeOverlay(): void {
  if (overlay) {
    overlay.remove();
    overlay = null;
  }
}

function buildSliderContent(context?: StrokeContext): void {
  const container = document.querySelector('#stroke_slider .strokes');
  if (!container) return;

  const profileId = settings.decoration_profile || 'standard';
  const profile = getProfile(profileId);
  if (!profile) return;

  // Skip rebuild if context and profile haven't changed
  if (context === lastContext && profileId === lastProfileId) return;
  lastContext = context;
  lastProfileId = profileId;

  container.innerHTML = '';

  const visibleStrokes = profile.strokes.filter(
    (s) => !s.context || !context || s.context === context,
  );

  for (const stroke of visibleStrokes) {
    const row = document.createElement('div');
    row.className = 'stroke flexcenter';
    row.innerHTML =
      `<div>${stroke.name}</div>` +
      `<div class="strokeAction forehand" hand="${FOREHAND}" stroke="${stroke.name}">` +
      `<div class="hand_label flexjustifystart strokeAction" hand="${FOREHAND}" stroke="${stroke.name}">F</div>` +
      `</div>` +
      `<div class="strokeAction backhand" hand="${BACKHAND}" stroke="${stroke.name}">` +
      `<div class="hand_label flexjustifyend strokeAction" hand="${BACKHAND}" stroke="${stroke.name}">B</div>` +
      `</div>`;
    container.appendChild(row);
  }
}

export function clearDismissCallback(): void {
  onDismissCallback = undefined;
}

export function rebuildStrokeSlider(): void {
  lastContext = undefined;
  lastProfileId = undefined;
}

export function strokeSlider(show?: string, result?: string, onDismiss?: () => void) {
  const width = window.innerWidth;
  const stroke_slider = document.getElementById('stroke_slider');
  const slideRight = document.getElementById('slideright');
  const slideLeft = document.getElementById('slideleft');

  const hideSlide = () => {
    if (stroke_slider) stroke_slider.style.display = 'none';
    removeOverlay();
  };

  if (show) {
    onDismissCallback = onDismiss;
    const context = result ? resultToContext(result) : undefined;
    buildSliderContent(context);
    showOverlay();

    const isLandscape = window.innerWidth > window.innerHeight;
    const maxWidth = isLandscape ? 280 : 200;
    const sliderWidth = Math.min(width * 0.5, maxWidth);
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

// Test via a getter in the options object to see if the passive property is accessed
let supportsPassive = false;
try {
  const opts = Object.defineProperty({}, 'passive', {
    get: () => {
      supportsPassive = true;
      return true;
    }
  });
  window.addEventListener('test', null, opts);
} catch (e) {
  console.log(e);
}

const behaviors: any = {
  orientation: undefined,
  time_threshold: 200,
  diff_threshold: 130,
  press_hold_threshold: 400,
  prevent_touch: true,
  prevent_double_tap: false,
  addSwipeTarget(target) {
    target.addEventListener('touchstart', handleTouchStart, supportsPassive ? { passive: true } : false);
    target.addEventListener('touchmove', handleTouchMove, supportsPassive ? { passive: true } : false);
    target.addEventListener('touchend', swipeTouchEnd, false);

    target.addEventListener('mousedown', handleTouchStart, false);
    target.addEventListener('mousemove', handleTouchMove, false);
    target.addEventListener('mouseup', swipeTouchEnd, false);
  },
  addPressAndHold(target) {
    target.addEventListener('touchstart', handleTouchStart, supportsPassive ? { passive: true } : false);
    target.addEventListener('mousedown', handleTouchStart, false);
    target.addEventListener('touchend', pressAndHoldEnd, false);
    target.addEventListener('mouseup', pressAndHoldEnd, false);
  },
  disableDrag() {
    document.addEventListener('touchmove', preventDrag, false);
    document.addEventListener('touchend', preventDoubleTap, false);
    document.addEventListener('mousemove', preventDrag, false);
    document.addEventListener('mouseup', preventDoubleTap, false);
  }
};

/* to make it appear more like a native app disable dragging and double tap */
function preventDrag(evt) {
  if (behaviors.prevent_touch && (window.innerHeight > 450 || behaviors.orientation == 'landscape'))
    evt.preventDefault();
}

function preventDoubleTap(evt) {
  const now = new Date().getTime();
  if (behaviors.prevent_double_tap && now - last_touch < 500) evt.preventDefault();
  last_touch = now;
}

let xDown = null;
let yDown = null;
let xDiff = null;
let yDiff = null;
let timeDown = null;
let touch_target = null;
let last_touch = new Date().getTime();

function handleTouchMove(evt) {
  if (!xDown || !yDown) return;
  let xUp: number, yUp: number;
  if (evt.type == 'mousemove') {
    xUp = evt.clientX;
    yUp = evt.clientY;
  } else {
    xUp = evt.touches[0].clientX;
    yUp = evt.touches[0].clientY;
  }
  xDiff = xDown - xUp;
  yDiff = yDown - yUp;
}

/**
function containsClassName(evntarget, classArr) {
  for (let i = classArr.length - 1; i >= 0; i--) {
    if (evntarget.classList.contains(classArr[i])) return true;
  }
}
*/

function handleTouchStart(evt) {
  touch_target = evt.target;
  timeDown = Date.now();
  if (evt.type == 'mousedown') {
    xDown = evt.clientX;
    yDown = evt.clientY;
  } else {
    xDown = evt.touches[0].clientX;
    yDown = evt.touches[0].clientY;
  }
  xDiff = 0;
  yDiff = 0;
}

function findAncestor(el, cls) {
  if (el.classList.contains(cls)) return el;
  while ((el = el.parentNode && el.classList && !el.classList.contains(cls)));
  return el;
}

function swipeTouchEnd() {
  const timeDiff = Date.now() - timeDown;
  if (
    (Math.abs(xDiff) > behaviors.diff_threshold || Math.abs(yDiff) > behaviors.diff_threshold) &&
    timeDiff < behaviors.time_threshold
  ) {
    if (Math.abs(xDiff) > Math.abs(yDiff)) {
      if (xDiff > 0) {
        if (typeof behaviors.swipeLeft == 'function') behaviors.swipeLeft(findAncestor(touch_target, 'swipe'));
      } else if (typeof behaviors.swipeRight == 'function') {
        behaviors.swipeRight(findAncestor(touch_target, 'swipe'));
      }
    } else if (yDiff > 0) {
      if (typeof behaviors.swipeUp == 'function') behaviors.swipeUp(findAncestor(touch_target, 'swipe'));
    } else if (typeof behaviors.swipeDown == 'function') {
      behaviors.swipeDown(findAncestor(touch_target, 'swipe'));
    }
  }
  xDown = null;
  yDown = null;
  timeDown = null;
}

function pressAndHoldEnd() {
  const timeDiff = Date.now() - timeDown;
  if (timeDiff > behaviors.press_hold_threshold && typeof behaviors.pressAndHold == 'function')
    behaviors.pressAndHold(findAncestor(touch_target, 'pressAndHold'));
  xDown = null;
  yDown = null;
  timeDown = null;
}

export const touchManager = behaviors;
export default behaviors;

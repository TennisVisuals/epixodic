const util = {
  hasClass: function (e: Element, c: string) {
    const re = new RegExp('(^|\\s)' + c + '(\\s|$)');
    return re.test(e.className);
  },
  addClass: function (e: Element, c: string) {
    if (this.hasClass(e, c)) {
      return;
    }
    const newclass = e.className.split(' ');
    newclass.push(c);
    e.className = newclass.join(' ');
  },
  removeClass: function (e: Element, c: string) {
    if (!this.hasClass(e, c)) {
      return;
    }
    const re = new RegExp('(^|\\s)' + c + '(\\s|$)', 'g');
    e.className = e.className.replace(re, '');
  }
};

export const SwipeList = {
  init: (opt: any) => {
    let swipeLeft = 0;
    let swipeRight = 0;
    opt.buttons.forEach((b: any) => {
      if (b.side == 'right') swipeLeft += b.width || 0;
      if (b.side == 'left') swipeRight += b.width || 0;
    });

    const instances = Array.from(document.querySelectorAll(opt.container));
    instances.forEach((instance) => {
      let moveX = 0;
      let moveY = 0;
      let moveStart: any = null;

      // Button DIVs
      let leftpx = 0;
      let rightpx = 0;
      opt.buttons.forEach((button: any) => {
        const btn = document.createElement('div');
        btn.textContent = button.text;
        btn.className = button.class;
        if (button.side == 'right') {
          leftpx += button.width || 0;
          btn.style.right = -1 * leftpx + 'px';
        }
        if (button.side == 'left') {
          rightpx += button.width || 0;
          btn.style.left = -1 * rightpx + 'px';
        }
        const abtn = instance.appendChild(btn);

        // options image instead of text
        if (button.image) {
          const img = document.createElement('img');
          img.src = button.image;
          img.className = button.image_class;
          abtn.appendChild(img);
        }
      });

      // Hardware Acceleration
      instance.style.webkitTransform = 'translateZ(0)';
      instance.style.transform = 'translateZ(0)';

      // Slide Start
      instance.addEventListener(
        'touchstart',
        function (event: any) {
          // Reset Animation Time
          instance.style.transitionDuration = '0ms';

          // Close other items
          instances.forEach((inst) => {
            if (util.hasClass(inst, 'move-out-click') && inst != instance) {
              inst.style.transitionDuration = '325ms';
              inst.style.webkitTransform = 'translateX(0px)';
              inst.style.transform = 'translateX(0px)';
              util.removeClass(inst, 'move-out-click');
            }
          });

          // Save slide position
          const touches = event.changedTouches;
          moveStart = {
            x: touches[0].pageX,
            y: touches[0].pageY
          };
        },
        true
      );

      // Sliding Animation
      instance.addEventListener(
        'touchmove',
        function (event: any) {
          // Limit to one instance
          if (moveStart === null) {
            return;
          }

          const touches = event.changedTouches;
          const nowX = touches[0].pageX;
          const nowY = touches[0].pageY;
          moveX = nowX - moveStart.x;
          moveY = nowY - moveStart.y;

          // Left/Right swipes
          if (Math.abs(moveX) > Math.abs(moveY)) {
            if (moveX > 0) {
              if (util.hasClass(instance, 'move-out-click')) {
                const x = moveX > swipeLeft ? 0 : -swipeLeft + moveX;
                instance.style.transform = 'translateX(' + x + 'px)';
              } else if (swipeRight) {
                const x = Math.abs(moveX) > swipeLeft ? swipeLeft : moveX;
                instance.style.transform = 'translateX(' + x + 'px)';
              }
            }
            if (moveX < 0) {
              if (!util.hasClass(instance, 'move-out-click')) {
                const x = Math.abs(moveX) > swipeLeft ? -swipeLeft : moveX;
                instance.style.transform = 'translateX(' + x + 'px)';
              } else if (swipeRight) {
                const x = Math.abs(moveX) > swipeLeft ? swipeLeft : moveX;
                instance.style.transform = 'translateX(' + x + 'px)';
              }
            }
          }
        },
        true
      );

      // Finish Sliding Action
      instance.addEventListener(
        'touchend',
        function () {
          // Limit to one instance
          if (moveStart === null) {
            return;
          }

          // Slower Animation
          instance.style.transitionDuration = '125ms';

          // If swipe active
          if (util.hasClass(instance, 'move-out-click')) {
            if (moveX > 0 && swipeLeft) {
              const x = moveX > 10 ? 0 : -swipeLeft;
              instance.style.transform = 'translateX(' + x + 'px)';
              if (x === 0) {
                util.removeClass(instance, 'move-out-click');
              }
            } else if (swipeRight) {
              const x = moveX < -10 ? 0 : swipeLeft;
              instance.style.transform = 'translateX(' + x + 'px)';
              if (x === 0) {
                util.removeClass(instance, 'move-out-click');
              }
            }
          } else {
            if (moveX < 0 && swipeLeft) {
              const x = Math.abs(moveX) > swipeLeft / 2 ? -swipeLeft : 0;
              instance.style.transform = 'translateX(' + x + 'px)';
              if (x !== 0) {
                util.addClass(instance, 'move-out-click');
              }
            } else if (swipeRight) {
              const x = Math.abs(moveX) > swipeLeft / 2 ? swipeLeft : 0;
              instance.style.transform = 'translateX(' + x + 'px)';
              if (x !== 0) {
                util.addClass(instance, 'move-out-click');
              }
            }
          }

          // Restore initial position
          moveStart = null;
          moveX = 0;
        },
        true
      );

      // Cancel
      instance.addEventListener(
        'touchcancel',
        function () {
          instance.style.transitionDuration = '225ms';
          instance.style.webkitTransform = 'translateX(0px)';
          instance.style.transform = 'translateX(0px)';
          util.removeClass(instance, 'move-out-click');
          moveStart = null;
          moveX = 0;
        },
        true
      );
    });
  }
};

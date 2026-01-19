# Archived Animations

Cool animations from the app that were removed but worth preserving for future reference.

---

## Pulse Circle Animation

**Original File:** `src/transition/pulseCircle.ts`  
**Date Archived:** 2026-01-19  
**Reason:** Removed with broadcasting feature cleanup

### Description
A D3-based animation that creates expanding circles with a pulsing effect. Creates multiple concentric circles that animate outward and fade, creating a radar/sonar-like effect.

### Code

```typescript
/**
 * Pulse Circle Animation
 * 
 * D3-based animation creating expanding concentric circles
 * Used for visual feedback in broadcasting features
 * 
 * Features:
 * - Configurable number of circles
 * - Adjustable duration, radius, stroke width
 * - Color range support
 * - Smooth fade-out effect
 * - Delayed circle spawning for wave effect
 */

import * as d3 from 'd3';

export function pulseCircle() {
  let height = 100;
  let width = 100;
  let duration = 5000;
  let pulse_circles = 6;
  let radius = 50;
  let delay_multiplier = 0.15;
  let stroke_width = 3;
  let color_range: any = ['white', 'white'];

  function pulseCircle(selection: any) {
    const color_scale: any = d3.scaleLinear().domain([0, 1]).range(color_range);

    selection.each(function (d: number, i: number) {
      const elem = d3.select(this);
      const svg = elem.append('svg').attr('height', height).attr('width', width);
      const pulse = svg.append('g').attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')');

      (function repeat(i: number) {
        const circle = pulse
          .append('circle')
          .attr('class', 'pulse_circle')
          .attr('stroke', color_scale(0))
          .attr('fill', 'none')
          .attr('r', 0)
          .attr('stroke-width', stroke_width);

        (function a() {
          circle
            .transition()
            .duration(duration)
            .ease(d3.easeLinear)
            .attr('stroke-width', 0)
            .attr('r', radius)
            .attr('stroke', color_scale(1))
            .on('end', function () {
              a();
            });
        })();

        setTimeout(function () {
          repeat(++i);
        }, duration * delay_multiplier);
      })(0);
    });
  }

  pulseCircle.height = (d: number) => {
    return d ? ((height = d), pulseCircle) : height;
  };
  pulseCircle.width = (d: number) => {
    return d ? ((width = d), pulseCircle) : width;
  };
  pulseCircle.duration = (d: number) => {
    return d ? ((duration = d), pulseCircle) : duration;
  };
  pulseCircle.pulse_circles = (d: number) => {
    return d ? ((pulse_circles = d), pulseCircle) : pulse_circles;
  };
  pulseCircle.radius = (d: number) => {
    return d ? ((radius = d), pulseCircle) : radius;
  };
  pulseCircle.delay_multiplier = (d: number) => {
    return d ? ((delay_multiplier = d), pulseCircle) : delay_multiplier;
  };
  pulseCircle.stroke_width = (d: number) => {
    return d ? ((stroke_width = d), pulseCircle) : stroke_width;
  };
  pulseCircle.color_range = (d: any) => {
    return d ? ((color_range = d), pulseCircle) : color_range;
  };

  return pulseCircle;
}
```

### Usage Example

```typescript
import { pulseCircle } from './pulseCircle';

// Create pulse circle with custom config
const pc = pulseCircle()
  .color_range(['white', 'white'])
  .height(60)
  .width(60)
  .radius(28)
  .stroke_width(5);

// Apply to D3 selection
d3.select('#broadcast').call(pc);
```

### Configuration Options

| Method | Default | Description |
|--------|---------|-------------|
| `height(n)` | 100 | SVG height in pixels |
| `width(n)` | 100 | SVG width in pixels |
| `duration(n)` | 5000 | Animation duration in ms |
| `pulse_circles(n)` | 6 | Number of circles to create |
| `radius(n)` | 50 | Maximum circle radius |
| `delay_multiplier(n)` | 0.15 | Delay between circles (0-1) |
| `stroke_width(n)` | 3 | Initial stroke width |
| `color_range(array)` | `['white', 'white']` | D3 color scale range |

### Visual Effect

Creates a pulsing radar/sonar effect:
1. Circles spawn at center (radius 0)
2. Expand outward to max radius
3. Stroke width reduces to 0 (creates fade effect)
4. Color transitions along scale
5. Multiple circles create wave pattern
6. Animation repeats infinitely

### Potential Future Uses

- **Loading indicators** - Show processing status
- **User notifications** - Draw attention to elements
- **Point-won celebrations** - Highlight winning player
- **Match start/end** - Visual transition effect
- **Touch/tap feedback** - Ripple effect on interaction
- **Connection status** - Pulse when syncing data

---

**Note:** This animation uses D3.js transitions and requires D3 to be available in the project.

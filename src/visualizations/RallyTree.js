function rallyTree() {

   // TODO:
   //
   // RallyTree currently injects .rl and .i into points... 
   // this should only be a LOCAL behavious
   //
   // fix setting of colors for point types.  use chart.colors instead of
   // options... see below
   //
   // invisible bars overlaying each rally length for each side
   // hover over invisible bars highlights circle on pctarea
   // indicating the win % / rally length
   //
   // integrate margins

    var points = [];

    var options = {
      width: 100,
	   height: 100,

      // Margins for the SVG
      margins: {
         top: 0, 
         right: 0, 
         bottom: 0, 
         left: 0
      },

      display: {
         sizeToFit: false
      },

      orientation: 'horizontal',

      data: {
         sort: false
      },

      areas: {
         colors: { 0: "blue" , 1: "purple" },
         interpolation: 'linear'
      },

      points: {
         colors: { } // points will be sorted according to order of colors
      }

    }
   // functions which should be accessible via ACCESSORS
    var update;
    var maxRally;

    // programmatic
    var transition_time = 1000;
    var displayPct = true;
    var serveAdvantage = undefined;
    var barPadding = 0;
    var cellPadding = 0;

    // DEFINABLE EVENTS
    // Define with ACCESSOR function chart.events()
    var events = {
       'pointbar': { 'mouseover': null, 'mouseout': null, 'click': null },
       'statbar': { 'click': null },
       'pctarea': { 'mouseover': null, 'mouseout': null },
       'update': { 'begin': null, 'end': null },
       'rallies' : { 'none': undefined, 'display': undefined }
    };

    function chart(selection) {
       var root = selection.append('div')
           .attr('class', 'rallyRoot')

      var rtroot = root.append('svg')
          .attr('class', 'rallyTree')
          .attr('height', (options.orientation == 'horizontal') ? options.height : options.width )
          .attr('width', (options.orientation == 'horizontal') ? options.width : options.height )

      var rttree = rtroot.append('g').attr('class', 'rttree')
      var rtarea = rtroot.append('g').attr('class', 'rtarea');

      update = function(opts) {

          // don't display if maximum rally length less than 3
          maxRally = d3.max(points, function(point) { if (point.rally) return point.rallyLength() });
          if (maxRally < 3) {
             rtroot.selectAll('rect').remove();
             rtarea.selectAll('path').remove();
             rtarea.selectAll('line').remove();
             if (events.rallies.none == 'function') events.rallies.none();
             return;
          } else {
             if (events.rallies.display == 'function') events.rallies.display();
          }

          if (options.display.sizeToFit || (opts && opts.sizeToFit)) {
             var dims = selection.node().getBoundingClientRect();
             options.width = Math.max(dims.width, 100);
             options.height = Math.max(dims.height, 100);
          }

          if (points.length > 500) {
             var barPadding = 0;
             var cellPadding = 0;
          } else {
             var barPadding = 1;
             var cellPadding = 1;
          }

          ryl = [[], []];
          points.forEach(function(e, i) {
              e.i = i;
              if (ryl[e.winner][e.rallyLength()]) {
                 ryl[e.winner][e.rallyLength()] += 1;
              } else {
                 ryl[e.winner][e.rallyLength()] = 1;
              }
              e.rl = [ryl[0][e.rallyLength()], ryl[1][e.rallyLength()]];
          });

          if (options.data.sort) { orderPoints('result'); }

          rtroot.transition().duration(transition_time).attr('width', options.width).attr('height', options.height);

          max0 = points.length ? points.length == 1 ? points[0].rl[0] : d3.max(points, function(point) { return point.rl[0]; }) : 0;
          max1 = points.length ? points.length == 1 ? points[0].rl[1] : d3.max(points, function(point) { return point.rl[1]; }) : 0;
          max0 = max0 ? max0 : 0;
          max1 = max1 ? max1 : 0;
          maxLimb = max0 + max1 + 1;
          widthScale = ((options.orientation == 'horizontal') ? options.width : options.height) / maxLimb;
          barSpacing = ((options.orientation == 'horizontal') ? options.height : options.width) / (maxRally + 1);
          barHeight = barSpacing - barPadding;

          var point_bars = rttree.selectAll('rect.point-bar')
              .data(points);

          point_bars.enter()
              .append('rect')
              .attr('id', function(d, i) { return 'cell' + i; })
              .attr('class', 'point-bar')
              .attr('x', function(d) { return Math.random() * options.width })
              .attr('y', function(d) { return Math.random() * options.height })
              .attr('fill', function(d) { return options.points.colors[d.result]; })
              .attr('width', function (d, i) { return (options.orientation == 'horizontal') ? widthScale - cellPadding : barHeight; })
              .attr('height', function(d, i) { return (options.orientation == 'horizontal') ? barHeight : widthScale - cellPadding; })
              .on('mouseover', events.pointbar.mouseover)
              .on('mouseout', events.pointbar.mouseout)
              .on('click', events.pointbar.click)
              .transition().duration(transition_time)
              .style('opacity', 1)
              .attr('x', function(d, i) { return calcX(d, widthScale, barSpacing, max0, max1); })
              .attr('y', function(d, i) { return calcY(d, widthScale, barSpacing, max0, max1); })

          point_bars.exit()
              .transition().duration(transition_time * .5)
              .delay(function(d, i) { return (points.length - i) * 20; })
              .style('opacity', 0)
              .attr('x', function(d) { return Math.random() * options.width })
              .attr('y', function(d) { return Math.random() * options.height })
              .remove();

          point_bars
              .transition().duration(transition_time)
              .attr('fill', function(d) { return options.points.colors[d.result]; })
              .style('opacity', function(d) { return d.hide ? 0 : 1; })
              .attr('x', function(d, i) { return calcX(d, widthScale, barSpacing, max0, max1); })
              .attr('y', function(d, i) { return calcY(d, widthScale, barSpacing, max0, max1); })
              .attr('width', function (d, i) { return (options.orientation == 'horizontal') ? widthScale - cellPadding : barHeight; })
              .attr('height', function(d, i) { return (options.orientation == 'horizontal') ? barHeight : widthScale - cellPadding; })

          var areas = rtarea.selectAll('.pct-area')
              .data([0, 1])

          areas.enter()
              .append("path")
              .attr('id', function(d) { return 'player' + d + 'pctarea'; })
              .attr("class", "pct-area")
              .attr('opacity', 0);

          areas.exit()
              .remove()

          areas
              .attr("fill", function(d) { return options.areas.colors[d]; })
              .attr('display', function() { if (displayPct) return 'inline'; })
              .transition().delay(transition_time)
              .attr('display', function() { if (!displayPct) return 'none'; })
              .attr('gen', function(d) { return aP(d); } )

          function aP(player) {
             d3.select('#player' + player + 'pctarea')
                 .datum(rallyWinPct(player))
                 .on('mouseover', function(d, i) { 
                    if (events.pctarea.mouseover) events.pctarea.mouseover(player, i);
                    if (displayPct) d3.select(this).attr("opacity", 1); 
                 })
                 .on('mouseout', function(d, i) { 
                    if (events.pctarea.mouseout) events.pctarea.mouseout(player, i);
                    if (displayPct) d3.select(this).attr("opacity", .2); 
                 })
                 .transition().duration(transition_time)
                 .attr("opacity", function() { return displayPct ? .1 : 0 })
                 .attr("d", calcArea(player, widthScale, max0, max1))
            return player;
          }

          var fifty = rtarea.selectAll('.pct-fifty')
               .data([0, 1]);

          fifty.enter()
               .append("line")
               .attr('id', function(d) { return 'player' + d + 'fifty' })
               .attr('class', 'pct-fifty')
               .attr('stroke', 'black')
               .attr('opacity', 0)
               .attr('x1', 0) .attr('x2', 0)
               .attr('y1', 0) .attr('y2', 0)

          fifty.exit()
               .remove()

          fifty
              .attr('display', function() { if (displayPct) return 'inline' })
              .transition().duration(transition_time)
              .attr("opacity", function() { return displayPct ? 1 : 0 })
              .attr('y1', function(d) { return fiftyY(d, 1); })
              .attr('y2', function(d) { return fiftyY(d, 2); })
              .attr('x1', function(d) { return fiftyX(d, 1); })
              .attr('x2', function(d) { return fiftyX(d, 2); })
              .transition().delay(transition_time)
              .attr('display', function() { if (!displayPct) return 'none'; })

          var center = rtarea.selectAll('rect.stat-bar')
              .data([0])

          center.enter()
              .append('rect')
              .attr('class', 'stat-bar')
              .style('opacity', .2)
              .attr('y', function(d, i) { return statbarY(widthScale, barSpacing, max0, max1); })
              .attr('width', function(d, i) { return statbarWidth(widthScale, barSpacing, max0, max1); })
              .attr('height', function(d, i) { return statbarHeight(widthScale, barSpacing, max0, max1); })
              .attr('x', function(d, i) { return statbarX(widthScale, barSpacing, max0, max1); })
              .attr('fill', 'blue');

          center.exit()
              .transition().duration(transition_time * .3)
              .delay(function(d, i) { return (points.length - i) * 20; })
              .style('opacity', 0)
              .remove()

          center
              .on('click', events.statbar.click)
              .transition().duration(transition_time)
              .style('opacity', .2)
              .attr('y', function(d, i) { return statbarY(widthScale, barSpacing, max0, max1); })
              .attr('width', function(d, i) { return statbarWidth(widthScale, barSpacing, max0, max1); })
              .attr('height', function(d, i) { return statbarHeight(widthScale, barSpacing, max0, max1); })
              .attr('x', function(d, i) { return statbarX(widthScale, barSpacing, max0, max1); })
              .attr('fill', 'blue');

       }
    }

    function fiftyX(d, which) {
       if (options.orientation == 'horizontal') {
          return d == 0 ? (max0 ? max0 * widthScale / 2 : 0) : (max1 ? options.width - (max1 * widthScale / 2) : 0);
       } else {
          return which == 1 ? 0 : options.width;
       }
    }

    function fiftyY(d, which) {
       if (options.orientation == 'horizontal') {
          return which == 1 ? 0 : options.height;
       } else {
          return d == 0 ? (max0 ? max0 * widthScale / 2 : 0) : (max1 ? options.height - (max1 * widthScale / 2) : 0);
       }
    }

    function calcArea(player, widthScale, max0, max1) {
       if (options.orientation == 'horizontal') {
          var xScale = d3.scale.linear()
                                .range(player == 0 ? [max0 * widthScale, 0] : [(max0 + 1) * widthScale, options.width])
                                .domain([0, 100]);

          var yScale = d3.scale.linear()
                               .range([0, options.height])
                               .domain([0, rallyWinPct(player).length - 1]);

          var area = d3.svg.area()
                       .interpolate(options.areas.interpolation)
                       .x1(function(d, i) { return xScale(d) })
                       .x0( (player == 0) ? max0 * widthScale : (max0 + 1) * widthScale )
                       .y(function(d, i)  { return yScale(i) });
       } else {
          var yScale = d3.scale.linear()
                                .range(player == 0 ? [max0 * widthScale, 0] : [(max0) * widthScale, options.height])
                                .domain([0, 100]);

          var xScale = d3.scale.linear()
                               .range([0, options.width])
                               .domain([0, rallyWinPct(player).length - 1]);
          var area = d3.svg.area()
                       .interpolate(options.areas.interpolation)
                       .y1(function(d, i) { return yScale(d) })
                       .y0( (player == 0) ? max0 * widthScale : (max0) * widthScale )
                       .x(function(d, i)  { return xScale(i) });
       }
       return area;
    }

    function calcX(d, widthScale, barSpacing, max0, max1) {
        if (d.winner == 0) {
           return (options.orientation == 'horizontal') ? 
                  (max0 * widthScale) - (d.rl[0]) * widthScale 
                  : d.rallyLength() * barSpacing;
        } else {
           return (options.orientation == 'horizontal') ? 
                  (max0 * widthScale) + (d.rl[1]) * widthScale 
                  : d.rallyLength() * barSpacing;
        }
    }

    function calcY(d, widthScale, barSpacing, max0, max1) {
        if (d.winner == 0) {
           return (options.orientation == 'horizontal') ? 
              d.rallyLength() * barSpacing 
              : (max0 * widthScale) - (d.rl[0]) * widthScale;  
        } else {
           return (options.orientation == 'horizontal') ? 
              d.rallyLength() * barSpacing 
              : (max0 * widthScale) + (d.rl[1]) * widthScale;
        }
    }

    function statbarX(widthScale, barSpacing, max0, max1) {
       if (options.orientation == 'horizontal') {
        return isNaN(widthScale) ? undefined : max0 * widthScale;
       } else {
        return 0;
       }
    }

    function statbarY(widthScale, barSpacing, max0, max1) {
       if (options.orientation == 'horizontal') {
        return 0;
       } else {
        return isNaN(widthScale) ? undefined : max0 * widthScale;
       }
    }

    function statbarWidth(widthScale, barSpacing, max0, max1) {
       if (options.orientation == 'horizontal') {
        return isNaN(widthScale) ? undefined : widthScale - cellPadding;
       } else {
        return options.width;
       }
    }

    function statbarHeight(widthScale, barSpacing, max0, max1) {
       if (options.orientation == 'horizontal') {
        return options.height;
       } else {
        return isNaN(widthScale) ? undefined : widthScale - cellPadding;
       }
    }

    // ACCESSORS

    // allows updating individual options and suboptions
    // while preserving state of other options
    chart.options = function(values) {
        if (!arguments.length) return options;
        var vKeys = Object.keys(values);
        var oKeys = Object.keys(options);
        for (var k=0; k < vKeys.length; k++) {
           if (oKeys.indexOf(vKeys[k]) >= 0) {
              if (typeof(options[vKeys[k]]) == 'object') {
                 var sKeys = Object.keys(values[vKeys[k]]);
                 var osKeys = Object.keys(options[vKeys[k]]);
                 for (var sk=0; sk < sKeys.length; sk++) {
                    if (osKeys.indexOf(sKeys[sk]) >= 0) {
                       options[vKeys[k]][sKeys[sk]] = values[vKeys[k]][sKeys[sk]];
                    }
                 }
              } else {
                 options[vKeys[k]] = values[vKeys[k]];
              }
           }
        }
        return chart;
    }

    /* OLD ONE
    chart.events = function(functions) {
        if (!arguments.length) return events;
        var fKeys = Object.keys(functions);
        var eKeys = Object.keys(events);
        for (var k=0; k < fKeys.length; k++) {
           if (eKeys.indexOf(fKeys[k]) >= 0) events[fKeys[k]] = functions[fKeys[k]];
        }
        return chart;
    }
    */

    /* NEW ONE
    chart.options = function(values) {
        if (!arguments.length) return options;
        keyWalk(values, options);
        return chart;
    }
    */

    function keyWalk(valuesObject, optionsObject) {
        if (!valuesObject || !optionsObject) return;
        var vKeys = Object.keys(valuesObject);
        var oKeys = Object.keys(optionsObject);
        for (var k=0; k < vKeys.length; k++) {
           if (oKeys.indexOf(vKeys[k]) >= 0) {
              var oo = optionsObject[vKeys[k]];
              var vo = valuesObject[vKeys[k]];
              if (typeof oo == 'object' && typeof vo !== 'function' && oo && oo.constructor !== Array) {
                 keyWalk(valuesObject[vKeys[k]], optionsObject[vKeys[k]]);
              } else {
                 optionsObject[vKeys[k]] = valuesObject[vKeys[k]];
              }
           }
        }
    }

    chart.events = function(functions) {
         if (!arguments.length) return events;
         keyWalk(functions, events);
         return chart;
    }

    /* this needs to become the way to set colors for RallyTree rather than
     * options as the NEW options function doesn't allow adding attributes not
     * already present in options.
    chart.colors = function(colores) {
        if (!arguments.length) return colors;
        colors = colores;
        return chart;
    }
    */

    chart.width = function(value) {
        if (!arguments.length) return options.width;
        options.width = value;
        return chart;
    };

    chart.height = function(value) {
        if (!arguments.length) return options.height;
        options.height = value;
        return chart;
    };

    chart.duration = function(value) {
        if (!arguments.length) return transition_time;
       transition_time = value;
       return chart;
    }

    chart.orientation = function(value) {
        if (!arguments.length) return options.orientation;
        if (['horizontal', 'vertical'].indexOf(value) >= 0) { options.orientation = value; }
        return chart;
    };

    chart.update = function() {
        if (events.update.begin) events.update.begin(data); 
        if (typeof update === 'function') update();
         setTimeout(function() { 
           if (events.update.end) events.update.end(data); 
         }, transition_time);
    }

   chart.reset = function(clear_active) {
      points = [];
      if (typeof update === 'function') update();
   }

    chart.points = function(values) {
       if (!arguments.length) return points;
       if ( values.constructor === Array ) {
          points = values;
       }
       return chart;
    }

    chart.pointsServed = function(player) {
       if (!arguments.length || !maxRally) return serveAdvantage;
       serveAdvantage = player;
       for (var i=0; i < points.length; i++) { 
          points[i].hide = (player == undefined || points[i].server == player) ? false : true;
       }
       orderPoints('result');
       if (typeof update === 'function') update();
    }

    chart.displayPct = function(display) {
       if (!arguments.length) return displayPct;
       displayPct = display;
       update();
       return chart;
    }

    // END ACCESSORS

    function orderPoints(option) {
       option = option ? option : 'result';
       shuffle(0, option);
       shuffle(1, option);
    }

    function shuffle(player, option) {
       var order = Object.keys(chart.options().points.colors);
       order.push('Z');
       var maxRally = d3.max(points, function(point) { return point.rallyLength() });
       for (y=0; y <= maxRally; y++) {
          var rally_group = [];
          for (var i=0; i < points.length; i++) { 
             if (points[i].rallyLength() == y && points[i].winner == player) { rally_group.push(points[i]); }
          }
          rally_group.sort(function(a, b) { 
             return (order.indexOf(a.hide ? 'Z' : a[option]) < order.indexOf(b.hide ? 'Z' : b[option])) 
                     ? -1 
                     : (order.indexOf(a.hide ? 'Z' : a[option]) > order.indexOf(b.hide ? 'Z' : b[option])) ? 1 : 0; 
          });
          rally_group.forEach(function(point, i) { point.rl[player] = i + 1; })
          for (var r=0; r < rally_group.length; r++) { points[rally_group[r].i] = rally_group[r]; }
       }
    }

    // calculate rally length win percentages
    rallyWinPct = function(player) {
      // points played
      var pprl = {}; // points played per rally length
      var pwrl = {}; // points won

      // points served
      var psrl = {}; // points served per rally length
      var pwsrl = {}; // points won serving per rally length

      // points received
      var prrl = {}; // points received per rally length
      var pwrrl = {}; // points received per rally length

      for (var p=0; p < points.length; p++) {
         var rl = points[p].rallyLength();
         pprl[rl] = (rl in pprl) ? (pprl[rl] + 1) : 1;
         var served = (points[p].server == player) ? 1 : 0;

         if (served) {
            psrl[rl] = (rl in psrl) ? (psrl[rl] + 1) : 1;
         } else {
            prrl[rl] = (rl in prrl) ? (prrl[rl] + 1) : 1;
         }

         if (points[p].winner == player) { 
            pwrl[rl] = (rl in pwrl) ? (pwrl[rl] + 1) : 1; 

            if (served) {
               pwsrl[rl] = (rl in pwsrl) ? (pwsrl[rl] + 1) : 1; 
            } else {
               pwrrl[rl] = (rl in pwrrl) ? (pwrrl[rl] + 1) : 1; 
            }
         }
      }

      // keys for points played (per rally length)
      pp_keys = Object.keys(pprl);
      // create empty arrays for all rally lengths
      var cpp = [].slice.apply(new Uint8Array(parseInt(lastElement(pp_keys)) + 1))
      var csp = [].slice.apply(new Uint8Array(parseInt(lastElement(pp_keys)) + 1))
      var crp = [].slice.apply(new Uint8Array(parseInt(lastElement(pp_keys)) + 1))

      var cpw = [].slice.apply(new Uint8Array(parseInt(lastElement(pp_keys)) + 1))
      var csw = [].slice.apply(new Uint8Array(parseInt(lastElement(pp_keys)) + 1))
      var crw = [].slice.apply(new Uint8Array(parseInt(lastElement(pp_keys)) + 1))
      
      var rppw = [].slice.apply(new Uint8Array(parseInt(lastElement(pp_keys)) + 1))
      var srppw = [].slice.apply(new Uint8Array(parseInt(lastElement(pp_keys)) + 1))
      var rrppw = [].slice.apply(new Uint8Array(parseInt(lastElement(pp_keys)) + 1))

      var rally_collection = [].slice.apply(new Uint8Array(parseInt(lastElement(pp_keys)) + 1))

      // iterate through all rally lengths by keys
      for (var rally_length=0; rally_length < cpp.length; rally_length++) {
         var cpp_total = 0; // cumulative points played
         var csp_total = 0; // cumulative served points played
         var crp_total = 0; // cumulative received points played

         var cpw_total = 0; // cumulative points won
         var csw_total = 0; // cumulative served points won
         var crw_total = 0; // cumulative received points won

         // create array of rally lengths greater than current rally
         remaining_rally_lengths = pp_keys.filter(function(rl) { return rl >= rally_length });

         // itreate through rally lengths from current till last
         for (var kv=0; kv < remaining_rally_lengths.length; kv++) {
            // if there are points played for this rally lenghth, add them
            if (pprl[remaining_rally_lengths[kv]] !== undefined) { 
               cpp_total += pprl[remaining_rally_lengths[kv]]; 
            }
            // if there are points served for this rally lenghth, add them
            if (psrl[remaining_rally_lengths[kv]] !== undefined) { 
               csp_total += psrl[remaining_rally_lengths[kv]]; 
            }
            // if there are points received for this rally lenghth, add them
            if (prrl[remaining_rally_lengths[kv]] !== undefined) { 
               crp_total += prrl[remaining_rally_lengths[kv]]; 
            }

            // if there are points won for this rally lenghth, add them
            if (pwrl[remaining_rally_lengths[kv]] !== undefined) { 
               cpw_total += pwrl[remaining_rally_lengths[kv]]; 
            }
            // if there are served points won for this rally lenghth, add them
            if (pwsrl[remaining_rally_lengths[kv]] !== undefined) { 
               csw_total += pwsrl[remaining_rally_lengths[kv]]; 
            }
            // if there are received points won for this rally lenghth, add them
            if (pwrrl[remaining_rally_lengths[kv]] !== undefined) { 
               crw_total += pwrrl[remaining_rally_lengths[kv]]; 
            }
         }
         cpp[rally_length] = cpp_total;
         csp[rally_length] = csp_total;
         crp[rally_length] = crp_total;

         cpw[rally_length] = cpw_total;
         csw[rally_length] = csw_total;
         crw[rally_length] = crw_total;

         // calculate percentage of points won for each rally length
         rppw[rally_length] = Math.round(cpw[rally_length] / cpp[rally_length] * 100);
         srppw[rally_length] = csp[rally_length] ? Math.round(csw[rally_length] / csp[rally_length] * 100) : 0;
         rrppw[rally_length] = crp[rally_length] ? Math.round(crw[rally_length] / crp[rally_length] * 100) : 0;

         rally_collection[rally_length] = { 
            pct_won: rppw[rally_length],
            sv_pct_won: srppw[rally_length],
            rc_pct_won: rrppw[rally_length],
            points_played: cpp[rally_length], 
            points_won: cpw[rally_length]
         };
      }

      var cases = { 0: [srppw, rrppw], 1: [rrppw, srppw] }
      return cases[serveAdvantage] ? cases[serveAdvantage][player] : rppw;

      /*
      switch(serveAdvantage) {
         case  0: 
            return player == 0 ? srppw : rrppw; 
         case  1: 
            return player == 0 ? rrppw : srppw; 
         default: 
            return player == 0 ? rppw : rppw;
      }
      */
    }

    function lastElement(arr) { return arr[arr.length - 1]; }

    return chart;
}

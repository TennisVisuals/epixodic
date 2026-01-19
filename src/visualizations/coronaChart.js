function sum(arr) {
  return arr.reduce((sum, val) => sum + parseFloat(val), 0);
}

function coronaChart(target, set_map, prefs, x, y) {
  x = x ? x : 0;
  y = y ? y : 0;
  if (prefs.colors.reverse) {
    var colors = { 0: prefs.colors[1], 1: prefs.colors[0] };
  } else {
    var colors = { 0: prefs.colors[0], 1: prefs.colors[1] };
  }

  var data = [];
  for (var s = 0; s < set_map.length; s++) {
    data = data.concat(set_map[s].p2sdiff);
  }
  var max = Math.max.apply(null, data.map(Math.abs));
  var max = 24;

  var pts_corona = target
    .append("svg:g")
    .attr("class", "pts_corona")
    .attr("width", prefs.width)
    .attr("height", prefs.height)
    .attr("transform", "translate(" + x + "," + y + ")");

  if (prefs.display.info) {
    scoreDisplay();
  } else if (prefs.display.badge) {
    badgeDisplay();
  } else if (prefs.display.home) {
    homeDisplay();
  }

  var radius = d3.scale
    .linear()
    .domain([0, max])
    .range([prefs.radius / 4, prefs.radius / 2]);

  var angle = d3.scale
    .linear()
    .domain([0, data.length - 1])
    .range([0, 2 * Math.PI]);

  var clip = pts_corona
    .append("clipPath")
    .attr("id", "clip")
    .append("circle")
    .attr("cx", 0)
    .attr("cy", 0)
    .attr("r", radius((max / 24) * 8));

  var indices = indicesOf(0, data);
  var ranges = createRanges(indices, data);
  var slices = sliceData(ranges, data);

  for (var s = 0; s < slices.length; s++) {
    var total = sum(slices[s]);
    var player_color = total < 0 ? colors[0] : colors[1];
    var slice = total < 0 ? slices[s].map(Math.abs) : slices[s];
    segment(slice, ranges[s][0], player_color, ".4");

    var lmt = (max / 24) * 8;
    var slice2nds = [];
    for (var s2 = 0; s2 < slices[s].length; s2++) {
      var new_value;
      if (slices[s][s2] > lmt) {
        new_value = slices[s][s2] - lmt;
      } else if (slices[s][s2] < 0 - lmt) {
        new_value = Math.abs(slices[s][s2]) - lmt;
      } else {
        new_value = 0;
      }
      slice2nds.push(new_value);
    }
    segment(slice2nds, ranges[s][0], player_color, ".6");

    var lmt = (max / 24) * 8 * 2;
    var slice3rds = [];
    for (var s2 = 0; s2 < slices[s].length; s2++) {
      var new_value;
      if (slices[s][s2] > lmt) {
        new_value = slices[s][s2] - lmt;
      } else if (slices[s][s2] < 0 - lmt) {
        new_value = Math.abs(slices[s][s2]) - lmt;
      } else {
        new_value = 0;
      }
      slice3rds.push(new_value);
    }
    segment(slice3rds, ranges[s][0], player_color);
  }

  function segment(subset, offset, player_color, opacity) {
    opacity = opacity ? opacity : 1;
    var line = d3.svg.line
      .radial()
      .interpolate("basis")
      .radius(radius)
      .angle(function (d, i) {
        return angle(offset + i);
      });

    var area = d3.svg.area
      .radial()
      .interpolate(line.interpolate())
      .innerRadius(radius(0))
      .outerRadius(line.radius())
      .angle(line.angle());

    var svg = pts_corona
      .append("g")
      .datum(subset)
      .attr("width", prefs.width)
      .attr("height", prefs.height)
      .append("g")
      .attr(
        "transform",
        "translate(" + prefs.width / 2 + "," + prefs.height / 2 + ")"
      )
      .on("mouseover", function (d) {
        if (prefs.functions.mouseover) {
          prefs.functions.mouseover(d);
        }
      });

    svg
      .append("path")
      .attr("class", "area")
      .attr("clip-path", function (d, i) {
        return "url(#clip)";
      })
      .attr("fill", player_color)
      .attr("opacity", opacity)
      .attr("d", area);
  }

  function indicesOf(something, someArray) {
    var next = 0;
    var position = -1;
    var indices = [];
    while (next >= 0) {
      next = data.slice(position + 1).indexOf(0);
      position += next + 1;
      if (next >= 0) indices.push(position);
    }
    return indices;
  }

  function createRanges(indices, someArray) {
    var ranges = [];
    for (var r = 0; r < indices.length - 1; r++) {
      ranges.push([indices[r], indices[r + 1]]);
    }
    ranges.push([indices[indices.length - 1], someArray.length]);
    return ranges;
  }

  function sliceData(ranges, data) {
    var slices = [];
    for (var r = 0; r < ranges.length; r++) {
      var slice = data.slice(ranges[r][0], ranges[r][1] + 1);
      slices.push(slice);
    }
    return slices;
  }

  function badgeDisplay() {
    var badge = pts_corona
      .append("a")
      .attr("target", "_blank")
      .attr("xlink:href", function (d) {
        if (prefs.muid) {
          if (prefs.context.playerName) {
            return (
              "/viewpro/browse.html?playerName=" +
              prefs.context.playerName +
              "&&muid=" +
              prefs.muid
            );
          } else {
            return "/viewpro/?muid=" + prefs.muid;
          }
        }
      })
      .append("text")
      .attr("font-size", "14px")
      .attr("fill", colors[set_map.last().winner_index])
      .attr("font-weight", "bold")
      .attr("text-anchor", "middle")
      .attr("x", 0)
      .attr("y", 0)
      .text(prefs.display.badge)
      .attr(
        "transform",
        "translate(" + prefs.width / 2 + "," + (prefs.height / 2 + 5) + ")"
      );
  }

  function homeDisplay() {
    var title = pts_corona
      .append("a")
      .attr("xlink:href", function (d) {
        return "/viewpro/player.html";
      })
      .append("text")
      .attr("font-size", "60px")
      .attr("fill", colors[0])
      .attr("font-weight", "bold")
      .attr("text-anchor", "middle")
      .attr("x", 0)
      .attr("y", 0)
      .text("TAVA")
      .attr(
        "transform",
        "translate(" + prefs.width / 2 + "," + (prefs.height / 2 - 35) + ")"
      );

    var subtitle = pts_corona
      .append("a")
      .attr("xlink:href", function (d) {
        return "/mv";
      })
      .append("text")
      .attr("font-size", "16px")
      .attr("fill", colors[0])
      .attr("font-weight", "bold")
      .attr("text-anchor", "middle")
      .attr("x", 0)
      .attr("y", 0)
      .text("match visualization")
      .attr(
        "transform",
        "translate(" + prefs.width / 2 + "," + (prefs.height / 2 - 8) + ")"
      );

    var examples = pts_corona
      .append("a")
      .attr("xlink:href", function (d) {
        return "/examples/";
      })
      .append("text")
      .attr("font-size", "25px")
      .attr("fill", colors[1])
      .attr("font-weight", "bold")
      .attr("text-anchor", "middle")
      .attr("x", 0)
      .attr("y", 0)
      .text("Examples")
      .attr(
        "transform",
        "translate(" + prefs.width / 2 + "," + (prefs.height / 2 + 45) + ")"
      );

    var help = pts_corona
      .append("a")
      .attr("xlink:href", function (d) {
        return "/instructions/";
      })
      .append("text")
      .attr("font-size", "16px")
      .attr("fill", colors[1])
      .attr("font-weight", "bold")
      .attr("text-anchor", "middle")
      .attr("x", 0)
      .attr("y", 0)
      .text("instructions")
      .attr(
        "transform",
        "translate(" + prefs.width / 2 + "," + (prefs.height / 2 + 73) + ")"
      );

    var blog = pts_corona
      .append("a")
      .attr("target", "_blank")
      .attr("xlink:href", function (d) {
        return "http://tennisviz.blogspot.com";
      })
      .append("text")
      .attr("font-size", "16px")
      .attr("fill", colors[1])
      .attr("font-weight", "bold")
      .attr("text-anchor", "middle")
      .attr("x", 0)
      .attr("y", 0)
      .text("blog")
      .attr(
        "transform",
        "translate(" + prefs.width / 2 + "," + (prefs.height / 2 + 100) + ")"
      );
  }
  function scoreDisplay() {
    // TODO: need to auto-adjust font size and x,y spacing when radius of corona changes
    // build game score strings for each player
    var score_string = { 0: "", 1: "" };
    for (var s = 0; s < set_map.length; s++) {
      score_string[0] += set_map[s].games_score[0] + " ";
      score_string[1] += set_map[s].games_score[1] + " ";
    }
    score_string[0] = score_string[0].trim();
    score_string[1] = score_string[1].trim();

    var p1 = pts_corona
      .append("text")
      .attr("font-size", "18px")
      .attr("fill", colors[0])
      .attr("font-weight", "bold")
      .attr("text-anchor", "middle")
      .attr("x", 0)
      .attr("y", 0)
      .text(set_map[0].players[0].split(" ").last())
      .attr(
        "transform",
        "translate(" + prefs.width / 2 + "," + (prefs.height / 2 - 35) + ")"
      )
      .on("click", function (d) {
        if (prefs.functions.click_name) {
          prefs.functions.click_name(set_map[0].players[0]);
        }
      });

    var s1 = pts_corona
      .append("text")
      .attr("font-size", "16px")
      .attr("fill", colors[0])
      .attr("font-weight", "bold")
      .attr("text-anchor", "middle")
      .attr("x", 0)
      .attr("y", 0)
      .text(score_string[0])
      .attr(
        "transform",
        "translate(" + prefs.width / 2 + "," + (prefs.height / 2 - 8) + ")"
      )
      .on("click", function (d) {
        if (prefs.functions.click_score) {
          prefs.functions.click_score(set_map[0].players[0]);
        }
      });

    var p2 = pts_corona
      .append("text")
      .attr("font-size", "18px")
      .attr("fill", colors[1])
      .attr("font-weight", "bold")
      .attr("text-anchor", "middle")
      .attr("x", 0)
      .attr("y", 0)
      .text(set_map[0].players[1].split(" ").last())
      .attr(
        "transform",
        "translate(" + prefs.width / 2 + "," + (prefs.height / 2 + 45) + ")"
      )
      .on("click", function (d) {
        if (prefs.functions.click_name) {
          prefs.functions.click_name(set_map[0].players[1]);
        }
      });

    var s2 = pts_corona
      .append("text")
      .attr("font-size", "16px")
      .attr("fill", colors[1])
      .attr("font-weight", "bold")
      .attr("text-anchor", "middle")
      .attr("x", 0)
      .attr("y", 0)
      .text(score_string[1])
      .attr(
        "transform",
        "translate(" + prefs.width / 2 + "," + (prefs.height / 2 + 13) + ")"
      )
      .on("click", function (d) {
        if (prefs.functions.click_score) {
          prefs.functions.click_score(set_map[0].players[1]);
        }
      });
  }
}

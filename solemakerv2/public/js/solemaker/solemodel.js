function generate_cells(outline_points, voronoi_seeds, voronoi, inset_size) {
  // close outline by concatting the first point at the end
  var sole_polys = [];
  var closed_outline_points = outline_points.concat([outline_points[0]]);
  var offset = new Offset();
  for (var i = 0; i < voronoi_seeds.length; i++) {
    // close voronoi polygon by pushing the first point onto the end
    var voronoi_poly = voronoi.polygons(voronoi_seeds)[i];
    var closed_voronoi_poly = voronoi_poly;
    closed_voronoi_poly.push([voronoi_poly[0][0],voronoi_poly[0][1]]);
    // The martinez intersection returns an array of polygons.
    // often this is just 1 polygon but it can be multiple.
    var no_intersect_error = false;
    var intersected_polygons;
    try {
      intersected_polygons = martinez.intersection(closed_outline_points, closed_voronoi_poly);
    } catch(err) {
      console.log(err);
    }
    if(intersected_polygons != null && intersected_polygons.length > 0) {
      if(intersected_polygons[0].length > 2) {
        var offset_poly;
        for( var y = 0; y < intersected_polygons.length; y++) {
          var no_error = false;
          try {
            offset_poly = offset.data(intersected_polygons[y]).padding(inset_size);
            no_error = true;
          } catch(err) {
            // console.log(err);
          }
          // check if there was an error in the offset to filter glitches
          if(no_error) {
            sole_polys.push(offset_poly);
          }
        }
      }
    }
  }
  return sole_polys;
}

function generate_cells_without_outline_inset(outline_points, voronoi_seeds, voronoi, inset_size) {
  var sole_polys = [];
  var closed_outline_points = outline_points.concat([outline_points[0]]);
  var offset = new Offset();
  for (var i = 0; i < voronoi_seeds.length; i++) {
    var voronoi_poly = voronoi.polygons(voronoi_seeds)[i];
    var closed_voronoi_poly = voronoi_poly;
    closed_voronoi_poly.push([voronoi_poly[0][0],voronoi_poly[0][1]]);
    var clock_wise_voronoi;
    if(check_clockwise(closed_voronoi_poly)) {
      clock_wise_voronoi = closed_voronoi_poly;
    } else {
      clock_wise_voronoi = closed_voronoi_poly.reverse();
    }
    var offset_poly;
    var no_error = false;
    try {
      offset_poly = offset.data(clock_wise_voronoi).padding(inset_size);
      no_error = true;
      //sole_polys.push(offset_poly);
    } catch(err) {
      console.log(err);
    }

    if(no_error) {
      var intersected_polygons;
      try {
        intersected_polygons = martinez.intersection(closed_outline_points, offset_poly);
        if(intersected_polygons != null && intersected_polygons.length > 0) {
          for (var j = 0; j < intersected_polygons.length; j++) {
            if(intersected_polygons[j].length > 1) {
              sole_polys.push(intersected_polygons[j]);
            }
          }
        }
      } catch(err) {
        console.log(err);
      }
    }
  }
  var rounding_factor = 1000;
  for(var i = 0; i < sole_polys.length; i++) {
    for (var j = 0; j < sole_polys[i].length; j++) {
      sole_polys[i][j][0] = Math.floor(sole_polys[i][j][0]*rounding_factor)/rounding_factor;
      sole_polys[i][j][1] = Math.floor(sole_polys[i][j][1]*rounding_factor)/rounding_factor;
    }
  }
  return sole_polys;
}


function check_clockwise(polygon) {
  var sum = 0;
  for (var i = 0; i < polygon.length-1; i++) {
    var p1 = polygon[i];
    var p2 = polygon[i+1];
    sum += (p2[0] - p1[0]) * (p2[1] - p2[1]);
  }
  if (sum > 0) {
    return true;
  } else {
    return false;
  }
}


function calculate_outline_distance(outline) {
  var outline_distance = 0;
  for(var i = 0; i < outline.length-1; i++) {
    outline_distance += distance(outline[i][0],outline[i][1],outline[i+1][0],outline[i+1][1]);
  }
  return outline_distance;
}

function slice_polygons(polygons, printer_settings) {
  var sliced_polygons = [];
  for (var i = 0; i < polygons.length; i++) {
    sliced_polygons.push(slice_single_polygon(polygons[i]));
  }
  return sliced_polygons;
}

function slice_single_polygon(polygon) {
  if (polygon == null) {
    return null;
  }
  var minX = 100000;
  var maxX = -100000;
  var minY = 100000;
  var maxY = -100000;

  for(var i = 0; i < polygon.length; i++) {
    var polyX = polygon[i][0];
    var polyY = polygon[i][1];

    if(polyX <= minX) { minX = polyX; }
    if(polyX >= maxX) { maxX = polyX; }
    if (polyY <= minY) { minY = polyY; }
    if (polyY >= maxY) { maxY = polyY; }
  }
  /**
  * For each scanline create a scanline polygon and intersect with sole polygon.
  */
  var sliced_edges = [];
  for (var y = minY; y < maxY; y += printer_settings.slicedistance) {
    var scanlinePolygon = [[minX, y],[maxX, y],[maxX, y+printer_settings.slicedistance*3],[minX, y+printer_settings.slicedistance*3]];
    var intersected_polygons = [];
    var no_error = true;
    for(var errorAdjust = 0; errorAdjust < 2; errorAdjust += 0.1) {
      try {
        var adjustedScanline = scanlinePolygon;
        adjustedScanline[0][0] -= errorAdjust;
        adjustedScanline[1][0] += errorAdjust;
        adjustedScanline[2][0] += errorAdjust;
        adjustedScanline[3][0] -= errorAdjust;
        intersected_polygons = martinez.intersection(scanlinePolygon, polygon);

      } catch(e) {
        console.log(" --------errorAdjust: "+errorAdjust+"  y: "+y+" error: "+e);
        no_error = false;
      }
      if(no_error) {
        errorAdjust = 3;
      }
    }

    if(no_error) {
      /**
       * Get minimum and maximum values of the intersected polygons.
       */
      for (var i = 0; i < intersected_polygons.length; i++) {
        var minEdgeX = 100000;
        var maxEdgeX = -100000;
        for (var j = 0; j < intersected_polygons[i].length; j ++) {
          if(true) {
            var polyX = intersected_polygons[i][j][0];
            var polyY = intersected_polygons[i][j][1];
            if(polyX <= minEdgeX && polyY == y) { minEdgeX = polyX; }
            if(polyX >= maxEdgeX && polyY == y) { maxEdgeX = polyX; }
          }
        }

        sliced_edges.push([minEdgeX, y, maxEdgeX, y]);
      }
    }
  }


  return sliced_edges;
}

function points_to_edges(polygon) {
  var edges = [];
  for (var i = 0; i < polygon.length-1; i++) {
    edges.push([polygon[i][0],
      polygon[i][1],
      polygon[i+1][0],
      polygon[i+1][1]
    ]);
  }
  return edges;
}
//
//
// function check_overlap(polygon) {
//   var x_detect;
//   for (var i = 0; i < polygon.length; i++) {
//     x_polygon[i][0]
//   }
// }

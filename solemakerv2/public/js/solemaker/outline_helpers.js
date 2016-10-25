function flip_polygon_on_x(polygon) {
  for (var i = 0; i < polygon.length; i++) {
    polygon[i][0] = polygon[i][0] * -1;
  }
  return polygon;
}

function flip_polygon_on_y(polygon) {
  for (var i = 0; i < polygon.length; i++) {
    polygon[i][1] = polygon[i][1] * -1;
  }
  return polygon;
}

function translate_polygon(polygon, translate_x, translate_y) {
  for (var i = 0; i < polygon.length; i++) {
    polygon[i][0] = polygon[i][0] + translate_x;
    polygon[i][1] = polygon[i][1] + translate_y;
  }
  return polygon;
}

function remove_margins_from_polygon(polygon) {
  var x_min = 0;
  var y_min = 0;
  var x_max = 0;
  var y_max = 0;
  // find maximum x & y
  for (var i = 0; i < polygon.length; i++) {
    if (x_max < polygon[i][0]) { x_max = polygon[i][0]; }
    if (y_max < polygon[i][1]) { y_max = polygon[i][1]; }
  }
  var x_min = x_max;
  var y_min = y_max;
  for (var i = 0;i < polygon.length; i++) {
    if(x_min > polygon[i][0]) {
      x_min = polygon[i][0];
    }
    if(y_min > polygon[i][1]) {
      y_min = polygon[i][1];
    }
  }
}

function scale_polygon_to_dimensions(polygon, length_x, length_y) {
  var negative_values = false;
  for(var i = 0; i < polygon.length; i++) {
    if(polygon[i][0] < 0) {
      throw ("negative x value found: "+polygon[i][0]);
      negative_values = true;
    }
    if(polygon[i][1] < 0) {
      throw ("negative y value found: "+polygon[i][1]);
      negative_values = true;
    }
  }
  if(negative_values) {
    return null;
  }
  var x_max = 0;
  var y_max = 0;
  for (var i = 0; i < polygon.length; i++) {
    if (x_max < polygon[i][0]) {
      x_max = polygon[i][0];
    }
    if (y_max < polygon[i][1]) { y_max = polygon[i][1]; }
  }
  for(var i = 0; i < polygon.length; i++) {
    polygon[i][0] = (polygon[i][0]/x_max) * length_x;
    polygon[i][1] = (polygon[i][1]/y_max) * length_y;
  }
  return polygon;
}


function recalculate_outline(left_right_foot, unitOutline, unitOutlineMirrored, boundingBoxWidth, boundingBoxHeight, boundingBoxOffsetWidth, boundingBoxOffsetHeight, editor_width, editor_height, SensorSettings) {
  var new_outline = [];
  for(var i = 0; i < unitOutline.length; i++) {
    if(left_right_foot == "right") {
      new_outline.push([
        unitOutlineMirrored[i][0] * calculateBoundingBoxWidth(boundingBoxWidth, editor_width, SensorSettings.n_sensors[1]) + calculateBoundingBoxX(boundingBoxOffsetWidth, boundingBoxWidth, editor_width, SensorSettings.n_sensors[1]),
        unitOutlineMirrored[i][1] * calculateBoundingBoxHeight(boundingBoxHeight, editor_height, SensorSettings.n_sensors[0]) + calculateBoundingBoxY(boundingBoxOffsetHeight, boundingBoxHeight, editor_height, SensorSettings.n_sensors[0])
      ]);
    } else if (left_right_foot == "left") {
      new_outline.push([
        unitOutline[i][0] * calculateBoundingBoxWidth(boundingBoxWidth, editor_width, SensorSettings.n_sensors[1]) + calculateBoundingBoxX(boundingBoxOffsetWidth, boundingBoxWidth, editor_width, SensorSettings.n_sensors[1]),
        unitOutline[i][1] * calculateBoundingBoxHeight(boundingBoxHeight, editor_height, SensorSettings.n_sensors[0]) + calculateBoundingBoxY(boundingBoxOffsetHeight, boundingBoxHeight, editor_height, SensorSettings.n_sensors[0])
      ]);
    }



  }
  return new_outline;
}

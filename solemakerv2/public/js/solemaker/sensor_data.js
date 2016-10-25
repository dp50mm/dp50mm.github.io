function scaleOutlineBasedOnSensorData(outline, sensordata) {
  var new_outline = [];
  new_outline = outline;
  new_outline = scale_polygon_to_dimensions(new_outline, sensordata.width,sensordata.height);
  new_outline = translate_polygon(new_outline, sensordata.offset_width, sensordata.offset_height);
  return new_outline;
}

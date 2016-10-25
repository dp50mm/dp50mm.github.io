function calculateBoundingBoxX(boundingBoxOffsetWidth, boundingBoxWidth, editor_width, sensor_array_width) {
  return ( (boundingBoxOffsetWidth-1) *(editor_width/sensor_array_width ) );
}

function calculateBoundingBoxY(boundingBoxOffsetHeight, boundingBoxHeight, editor_height, sensor_array_height) {
  var editorHeightScaling = editor_height / sensor_array_height;
  return ((boundingBoxOffsetHeight-1) * editorHeightScaling);
  // return editor_height - (boundingBoxOffsetHeight * editorHeightScaling) - calculateBoundingBoxHeight(boundingBoxHeight, editor_height, sensor_array_height);
  // return editor_height- (boundingBoxHeight*(editor_height/sensor_array_height))+(boundingBoxOffsetHeight*(editor_height/sensor_array_height));
}

function calculateBoundingBoxWidth(boundingBoxWidth, editor_width, sensor_array_width) {
  return boundingBoxWidth*(editor_width/sensor_array_width);
}

function calculateBoundingBoxHeight(boundingBoxHeight, editor_height, sensor_array_height) {
  return boundingBoxHeight*(editor_height/sensor_array_height);
}

function mapSensorData(data) {
  var x_counter = 0;
  var y_counter = 0;
  var mappedData = [];
  for (var i = 0; i < data.data.length; i++) {
    mappedData.push({
      value:data.data[i],
      x: x_counter,
      y: y_counter
    });
    x_counter += 1;
    if(x_counter >= data.n_sensors[0]) {
      x_counter = 0;
      y_counter += 1;
    }
  }
  return mappedData;
}


function mapBinarySensorData(data) {
  var x_counter = 0;
  var y_counter = 0;
  var mappedData = [];
  for (var i = 0; i < data.binary_image.length; i++) {
    mappedData.push({
      value:data.binary_image[i],
      x: x_counter,
      y: y_counter
    });
    x_counter += 1;
    if(x_counter >= data.n_sensors[0]) {
      x_counter = 0;
      y_counter += 1;
    }
  }
  return mappedData;
}

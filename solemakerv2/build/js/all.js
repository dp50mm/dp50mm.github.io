(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

function calculateBoundingBoxX(boundingBoxOffsetWidth, boundingBoxWidth, editor_width, sensor_array_width) {
  return (boundingBoxOffsetWidth - 1) * (editor_width / sensor_array_width);
}

function calculateBoundingBoxY(boundingBoxOffsetHeight, boundingBoxHeight, editor_height, sensor_array_height) {
  var editorHeightScaling = editor_height / sensor_array_height;
  return (boundingBoxOffsetHeight - 1) * editorHeightScaling;
  // return editor_height - (boundingBoxOffsetHeight * editorHeightScaling) - calculateBoundingBoxHeight(boundingBoxHeight, editor_height, sensor_array_height);
  // return editor_height- (boundingBoxHeight*(editor_height/sensor_array_height))+(boundingBoxOffsetHeight*(editor_height/sensor_array_height));
}

function calculateBoundingBoxWidth(boundingBoxWidth, editor_width, sensor_array_width) {
  return boundingBoxWidth * (editor_width / sensor_array_width);
}

function calculateBoundingBoxHeight(boundingBoxHeight, editor_height, sensor_array_height) {
  return boundingBoxHeight * (editor_height / sensor_array_height);
}

var LayersPreview = React.createClass({
  displayName: "LayersPreview",
  getPathCode: function getPathCode(d) {
    return d ? "M" + d.join("L") + "Z" : null;
  },

  render: function render() {
    var layersData = [];
    for (var i = 0; i < this.props.layers.length; i++) {
      for (var j = 0; j < this.props.layers[i].count; j++) {
        layersData.push({
          name: this.props.layers[i].name,
          components: this.props.layers[i].components,
          i_increment: i,
          j_increment: j
        });
      }
    }
    var layers = layersData.map(function (layer, index) {
      var style = {
        top: layersData.length * 0.5 - index * 0.5
      };
      var contourPath;
      var contourFill;
      var cellPaths;
      var voronoiOutline;
      for (var component in layer.components) {
        if (layer.components[component] == "contour_outline") {

          contourPath = React.createElement("path", { d: this.getPathCode(this.props.contour), className: "contour-outline-preview" });
        }
        if (layer.components[component] == "cells_outline") {
          cellPaths = React.createElement(CellPathsMap, { sole_cells: this.props.sole_cells });
        }
        if (layer.components[component] == "cells_fill") {
          var abc = "100";
        }
        if (layer.components[component] == "cropped_voronoi_outline") {
          voronoiOutline = React.createElement(CellPathsMap, { sole_cells: this.props.voronoi_cells });
        }
        if (layer.components[component] == "contour_fill") {
          contourFill = React.createElement("path", { d: this.getPathCode(this.props.contour), className: "contour-fill-preview" });
        }
      }
      return React.createElement(
        "div",
        { className: "layer-preview", key: index },
        React.createElement(
          "svg",
          { className: "layer-preview-svg", width: "200px", height: "200px", style: style },
          contourPath,
          contourFill,
          cellPaths,
          voronoiOutline
        ),
        React.createElement(
          "div",
          { className: "layer-preview-labels", style: style },
          React.createElement(
            "p",
            null,
            "name: ",
            layer.name
          )
        )
      );
    }, this);
    return React.createElement(
      "div",
      { className: "layers-preview" },
      layers
    );
  }
});

var CellPathsMap = React.createClass({
  displayName: "CellPathsMap",

  render: function render() {
    var cellPaths = this.props.sole_cells.map(function (cell, index) {
      return React.createElement("path", { d: getPathCode(cell), className: "cell-outline-preview", key: index });
    }, this);
    return React.createElement(
      "g",
      null,
      cellPaths
    );
  }
});

function getPathCode(d) {
  return d ? "M" + d.join("L") + "Z" : null;
}

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
    if (x_max < polygon[i][0]) {
      x_max = polygon[i][0];
    }
    if (y_max < polygon[i][1]) {
      y_max = polygon[i][1];
    }
  }
  var x_min = x_max;
  var y_min = y_max;
  for (var i = 0; i < polygon.length; i++) {
    if (x_min > polygon[i][0]) {
      x_min = polygon[i][0];
    }
    if (y_min > polygon[i][1]) {
      y_min = polygon[i][1];
    }
  }
}

function scale_polygon_to_dimensions(polygon, length_x, length_y) {
  var negative_values = false;
  for (var i = 0; i < polygon.length; i++) {
    if (polygon[i][0] < 0) {
      throw "negative x value found: " + polygon[i][0];
      negative_values = true;
    }
    if (polygon[i][1] < 0) {
      throw "negative y value found: " + polygon[i][1];
      negative_values = true;
    }
  }
  if (negative_values) {
    return null;
  }
  var x_max = 0;
  var y_max = 0;
  for (var i = 0; i < polygon.length; i++) {
    if (x_max < polygon[i][0]) {
      x_max = polygon[i][0];
    }
    if (y_max < polygon[i][1]) {
      y_max = polygon[i][1];
    }
  }
  for (var i = 0; i < polygon.length; i++) {
    polygon[i][0] = polygon[i][0] / x_max * length_x;
    polygon[i][1] = polygon[i][1] / y_max * length_y;
  }
  return polygon;
}

function recalculate_outline(left_right_foot, unitOutline, unitOutlineMirrored, boundingBoxWidth, boundingBoxHeight, boundingBoxOffsetWidth, boundingBoxOffsetHeight, editor_width, editor_height, SensorSettings) {
  var new_outline = [];
  for (var i = 0; i < unitOutline.length; i++) {
    if (left_right_foot == "right") {
      new_outline.push([unitOutlineMirrored[i][0] * calculateBoundingBoxWidth(boundingBoxWidth, editor_width, SensorSettings.n_sensors[1]) + calculateBoundingBoxX(boundingBoxOffsetWidth, boundingBoxWidth, editor_width, SensorSettings.n_sensors[1]), unitOutlineMirrored[i][1] * calculateBoundingBoxHeight(boundingBoxHeight, editor_height, SensorSettings.n_sensors[0]) + calculateBoundingBoxY(boundingBoxOffsetHeight, boundingBoxHeight, editor_height, SensorSettings.n_sensors[0])]);
    } else if (left_right_foot == "left") {
      new_outline.push([unitOutline[i][0] * calculateBoundingBoxWidth(boundingBoxWidth, editor_width, SensorSettings.n_sensors[1]) + calculateBoundingBoxX(boundingBoxOffsetWidth, boundingBoxWidth, editor_width, SensorSettings.n_sensors[1]), unitOutline[i][1] * calculateBoundingBoxHeight(boundingBoxHeight, editor_height, SensorSettings.n_sensors[0]) + calculateBoundingBoxY(boundingBoxOffsetHeight, boundingBoxHeight, editor_height, SensorSettings.n_sensors[0])]);
    }
  }
  return new_outline;
}

/**
 * Alternates the x cell padding
 */
function cellularGridSeed(nr_rows, nr_colls, width, height, padding) {
  var returnCells = [];
  var spacingToggle = false;
  for (var y = padding; y < height - padding; y += (height - padding * 2) / nr_rows) {
    spacingToggle = !spacingToggle;
    for (var x = padding; x < width - padding; x += (width - padding * 2) / nr_colls) {
      if (spacingToggle) {
        returnCells.push([x, y]);
      } else {
        returnCells.push([x + (width - padding * 2) / nr_colls / 2, y]);
      }
    }
  }
  // return point array
  return returnCells;
}

var preset_outline = [[21.40, 136.69], [5.33, 121.29], [0.45, 100.24], [18.18, 75.56], [48.05, 57.51], [70.7, 43.98], [122.12, 13.21], [149.59, 3.88], [168.33, 0.78], [184.72, 0.07], [199.26, 1.53], [216.53, 6.72], [230.11, 19.56], [232.95, 31.94], [228.35, 47.42], [212.52, 64.48], [195.59, 74.94], [182.50, 80.43], [168.44, 84.01], [156.42, 86.68], [112.01, 97.62], [73.48, 120.67], [42.85, 137.45]];

var yeezy_preset_outline = [[263, 704], [238, 702], [216, 693], [197, 679], [183, 661], [176, 641], [171, 619], [171, 579], [173, 535], [176, 497], [176, 454], [168, 411], [160, 370], [155, 333], [153, 296], [159, 258], [166, 240], [175, 218], [199, 178], [231, 142], [250, 125], [265, 117], [280, 112], [298, 110], [327, 119], [340, 128], [358, 148], [367, 166], [379, 201], [384, 236], [385, 273], [384, 291], [375, 329], [358, 366], [351, 381], [344, 412], [339, 452], [337, 479], [337, 503], [338, 524], [342, 546], [347, 569], [351, 592], [352, 611], [350, 633], [343, 653], [330, 676], [308, 693], [287, 701]];

function scaleOutlineBasedOnSensorData(outline, sensordata) {
  var new_outline = [];
  new_outline = outline;
  new_outline = scale_polygon_to_dimensions(new_outline, sensordata.width, sensordata.height);
  new_outline = translate_polygon(new_outline, sensordata.offset_width, sensordata.offset_height);
  return new_outline;
}

/**
 * Construction layers is editable in the UI
 */
var construction_layers = [{
  components: ["cells_fill", "contour_outline", "cells_outline"],
  name: "bottom layer",
  count: 1,
  speed: 600,
  order: 1
}, {
  components: ["cells_fill", "contour_outline", "cells_outline"],
  name: "sole padding layer",
  count: 49,
  speed: 600,
  order: 2
}, {
  components: ["contour_outline", "contour_fill"],
  name: "middle structure layer",
  count: 5,
  speed: 600,
  order: 3
}, {
  components: ["contour_outline", "cropped_voronoi_outline"],
  name: "voronoi pattern",
  count: 15,
  speed: 600,
  order: 4
}, {
  components: ["contour_outline"],
  name: "top wall",
  count: 35,
  speed: 600,
  order: 5
}];

function startUltiGCode(speed, layerHeight) {
  var returnCode = ";FLAVOR:UltiGCode";
  returnCode += "\r\n";
  returnCode += "; TIME:400";
  returnCode += "\r\n";
  returnCode += "; MATERIAL:160";
  returnCode += "\r\n";
  returnCode += "; MATERIAL2:0";
  returnCode += "\r\n";
  returnCode += "; NOZZLE_DIAMETER:0.800000";
  returnCode += "\r\n";
  returnCode += "; NOZZLE_DIAMETER2:0.800000";
  returnCode += "\r\n";
  returnCode += "; Layer count:105";
  returnCode += "\r\n";
  returnCode += "; LAYER:0";
  returnCode += "\r\n";
  returnCode += "G21 ;Force to milimeters";
  returnCode += "\r\n";
  returnCode += "G0 F" + speed + " Z" + layerHeight;
  returnCode += "\r\n";
  return returnCode;
}

function startRepRapGcode(speed, layerHeight) {
  var returnCode = ";FLAVOR:RepRap";
  returnCode += "\r\n";
  returnCode += "M109 S250";
  returnCode += "\r\n";
  returnCode += "G90 ;absolute positioning";
  returnCode += "\r\n";
  returnCode += "G21 ;Force to milimeters";
  returnCode += "\r\n";
  returnCode += "M82 ;set extruder to absolute mode";
  returnCode += "\r\n";
  returnCode += "G28 X0 Y0 ;move X/Y to min endstop";
  returnCode += "\r\n";
  returnCode += "G28 Z0 ;move Z to min endstops";
  returnCode += "\r\n";
  returnCode += "G1 F100 Z15.0  ;move the head to Z15mm";
  returnCode += "\r\n";
  returnCode += "G92 E0 ;zero the extruded length";
  returnCode += "\r\n";
  returnCode += "G1 F200 E3 ;extrude 3mm of feed stock";
  returnCode += "\r\n";
  returnCode += "G92 E0 ;zero the extruded length";
  returnCode += "\r\n";
  returnCode += "M107";
  returnCode += "\r\n";
  returnCode += "M117 SoleMaking...";
  returnCode += "\r\n";
  returnCode += "G0 F9000 X10 Y110";
  returnCode += "\r\n";
  returnCode += "G0 F100 Z0.5 ";
  returnCode += "\r\n";
  returnCode += "G0 F" + speed + " Z" + layerHeight;
  returnCode += "\r\n";
  return returnCode;
}

function endGcode() {
  var returnCode = "M107";
  returnCode += "\r\n";
  returnCode += "G10";
  returnCode += "\r\n";
  returnCode += "G0 F100 X110.000 Y126.900 Z100";
  returnCode += "\r\n";
  returnCode += "M25 ;Stop reading from this point on.";
  returnCode += "\r\n";
  returnCode += ";CURA_PROFILE_STRING:eNrtWt1v2zYQfxWC/RF8bLHGk2S7aWvoYe2SvqRDgXhYmxeBlmiLi0QKJBXHCfy/746iFNlRunQN1o/JDw70093xePe7j6LO6YapOGN8lZnIHwXemuZ5bDKeXAimNUATTzGjaGK4FDETdJGzaK4q5mmZ8zTOrYGuwnNvycFGyoTmZhOFvlcqLkysS8bSaNo8GlaUTFFTKRaFQQ8aRj3guA+c9IHTFlywdOe0I9/TVVlKZaK5rJKMixVZVDxPy5wa5uH3UqoipmnGNNw6+l0K1qjEaUXzmF0ZVdl3r6XJvDUvWWzkmqnohOaadYD4UuZVwaJg6kl5zWKdcZanTgwCRQsGLqYc/hpQD0cvpndhDMUdcNwHTvrAaRdc5nIdBb4/8j0hr69zcIlfs/1E18maoFQHpYWshIkmo2kXtRFxr4Lnu+8KLmJ4uGR5FOy+SWSxgMhHv+b5ngIvdiIMPoRdiUyWiHkLaYwsdqg39iwd/XjNU5PFS9CQCi/rycVfLAEOcnEBwZCXTOW0tJ4j66de7aO7djDt2K8JXr8ALnNh2V0/o5gtA6oY7WBcaGb8feCqAyRS5jY4rn44UAQST5sSS12NXXCgXM4Fg3jZ+DpoRctojKfbpyZoORMrkzn/0diyAl9ddU8d5u7od57igl5ZpHVrCSiUC/DWgRmjUOx8aRx16+o3kIvucx2zW3bnsQs18h8KkFs+QkVCgbG4jmVjwNWX2ZQsOoUb6xaiYgVN53lbtrG1XLs3bcGrDRBeGyoSZPNRi193YZQvuaI5ct4dzIsSqqCQqWtsC3CzG3PIuqJLiDJVKy5sHO2zFdElTZDG4wZdUM32SHmLo4rlJlSDk4cOxRQwdVcpPNp/e6tqSxVfUq6ABzF0bMupDoYWwhrQldNHouloD+07s9XYOXHJr6D0lOLAzrgSth3gqIB0xbQO3KdEFi0pujIQElkyES+40X0C0AVwjFxCnA03tlU7sTKvIBmQIeDQKmrqO2EYr/gqOgz2oA1APwENlBmtEkz17CznCUsJNa/ITUo3W/w2DP5gMW4PZq+p5gmBujVwqn5FTjGApC4mUMk7k3NL/oSLgszN7vjckhNgKsDdiQim3+NcIngOvHOTqz70xLVpAqFJa8W6bdf9dVt0oHV99qqjlUhtulr4DFbfBS99cnbTOw63ZPaHgGZs9Y0kNE3JRlaKyLUgIEs6sgQpgeb8l625h5q6Y+ZtGBD3mUFbUBDsS5pXTB+8BW+bN3QBnaUyjJQSggeUgmQcvHsRtgKQIGKHRQrZwUMbBSzoA3D1qJXE7JM1NxkxGSPQ/YhcLsGPF+SDTz766Ae0K/Lhl49oCNogYSLV0OO0FTr3nbModH5XJCDnATQHcnLTnSZbp4BHNqsFSTEiwbQo4K4hOW6ve/uZXTMlrZK7XErq7o7nnIS+T47HexpOkIyLAi5GsIUTcC25+PxDCF1RLuxRu5cB7laG2Mzj2lQAyemKESnI6ZvfiE4UYwKCHhyR905mNBp5EKOm6o5FSt6+camZkLMerzp3wXqDolQ2Ue+CiX+vgpVLLWFvVcgTvkQGkgyuQLh5CpEIyAM+M8UgVdB3dmgH4Tg+hJCMff8flO2yUrOsKU1KoMmRevIRHKQYP5Sot7BnyCc4lcGYIFoWDFNoOaMgxlA0ll8/+6Mp+DAlHw5DoCx+9bPtnFSlO5JCxBuPWm/YJRNQIWj2lv6fvNR9pfEMvLWO4oZAuCYSCOJ8X9MN1OrkfqPasBK6gq4L8eX9PvT3gRn0IAl3wvEAdFttPVvj4dDiH6HFT768xdeTYh70WQr/lSn/686db32azO/pbrOzNa5PeApqhtASmg77JRMo8PsnUOA/6giyZx3e9P+Tc3sw9x906SVX2nxP136kyRveM3rn/mdOX9QJhok9TOzHn9jjYWIPE/v/ObHDBw2vsfqhJvawpgxryt6aMv6aawrqhMNqM6w2j7/aTIbV5ptabcLHW22GLek/25LGD5qdE3D6B1oYhtVwWA2H1VCkk+9tNUSd8bBODuvk466T7gct3V8xtODtf7HWv9fZEbJIR0IxmLEJGyX6MvIgCXWbOXa8bBfWuvksmFlDZdpLJ5VSNsQNhTEBNtGAtOgzss5Aoa10u0wUVW54mbftQunRwWyeQVDxNAwurDeW5ZZFaHT+RDz1ICbmW/KPLrEAG/f+BnWV/Wo=";
  returnCode += "\r\n";
  return returnCode;
}

function edgeWrite(startX, startY, endX, endY, print_extrusion, printer_settings) {
  var returnCode = "";
  //var L = 4;
  //var R = 2;
  var ext = print_extrusion + distance(startX, startY, endX, endY) * printer_settings.extrusionCoefficient;
  if (startX > 0.05 * printer_settings.DPMM) {
    var start_x = startX / printer_settings.DPMM; // Math.floor((startX/printer_settings.DPMM)*printer_settings.GCode_rounding)/printer_settings.GCode_rounding;
    var start_y = startY / printer_settings.DPMM; // Math.floor((startY/printer_settings.DPMM)*printer_settings.GCode_rounding)/printer_settings.GCode_rounding;
    var start_e = print_extrusion; // Math.floor(((ext-printer_settings.retraction)/printer_settings.DPMM)*printer_settings.GCode_rounding)/printer_settings.GCode_rounding;
    var end_x = endX / printer_settings.DPMM; // Math.floor((endX/printer_settings.DPMM)*printer_settings.GCode_rounding)/printer_settings.GCode_rounding;
    var end_y = endY / printer_settings.DPMM; // Math.floor((endY/printer_settings.DPMM)*printer_settings.GCode_rounding)/printer_settings.GCode_rounding;
    var end_e = ext; // Math.floor((ext / printer_settings.DPMM)*printer_settings.GCode_rounding)/printer_settings.GCode_rounding;

    returnCode += "G1 X " + start_x.toFixed(printer_settings.GCode_rounding) + " Y " + start_y.toFixed(printer_settings.GCode_rounding) + " E " + start_e.toFixed(printer_settings.GCode_rounding) + "; edge start";
    returnCode += "\r\n";
    returnCode += "G1 X " + end_x.toFixed(printer_settings.GCode_rounding) + " Y " + end_y.toFixed(printer_settings.GCode_rounding) + " E " + end_e.toFixed(printer_settings.GCode_rounding) + "; edge end";
    returnCode += "\r\n";
  }
  return {
    edgeCode: returnCode,
    ext: ext
  };
}

function edgeMove(startX, startY, endX, endY, print_extrusion, printer_settings) {
  var returnCode = "";
  var ext = print_extrusion;
  if (true) {
    // THERE WAS A DISTANCE CHECK HERE BUT NO IDEA WHY
    var start_x = startX / printer_settings.DPMM; // Math.floor((startX/printer_settings.DPMM)*printer_settings.GCode_rounding)/printer_settings.GCode_rounding;
    var start_y = startY / printer_settings.DPMM; // Math.floor((startY/printer_settings.DPMM)*printer_settings.GCode_rounding)/printer_settings.GCode_rounding;
    var start_e = ext - 2; // Math.floor(((ext-printer_settings.retraction)/printer_settings.DPMM)*printer_settings.GCode_rounding)/printer_settings.GCode_rounding;
    var end_x = endX / printer_settings.DPMM; // Math.floor((endX/printer_settings.DPMM)*printer_settings.GCode_rounding)/printer_settings.GCode_rounding;
    var end_y = endY / printer_settings.DPMM; // Math.floor((endY/printer_settings.DPMM)*printer_settings.GCode_rounding)/printer_settings.GCode_rounding;
    var end_e = ext; // Math.floor((ext / printer_settings.DPMM)*printer_settings.GCode_rounding)/printer_settings.GCode_rounding;

    returnCode += "G0 X " + start_x.toFixed(printer_settings.GCode_rounding) + " Y " + start_y.toFixed(printer_settings.GCode_rounding) + " E " + start_e.toFixed(printer_settings.GCode_rounding);
    returnCode += "\r\n";
    returnCode += "G0 X " + end_x.toFixed(printer_settings.GCode_rounding) + " Y " + end_y.toFixed(printer_settings.GCode_rounding) + " E " + end_e.toFixed(printer_settings.GCode_rounding);
    returnCode += "\r\n";
  }
  return {
    edgeCode: returnCode,
    ext: ext
  };
}

function distance(x1, y1, x2, y2) {
  var distance = Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));
  return distance;
}

function mapSensorData(data) {
  var x_counter = 0;
  var y_counter = 0;
  var mappedData = [];
  for (var i = 0; i < data.data.length; i++) {
    mappedData.push({
      value: data.data[i],
      x: x_counter,
      y: y_counter
    });
    x_counter += 1;
    if (x_counter >= data.n_sensors[0]) {
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
      value: data.binary_image[i],
      x: x_counter,
      y: y_counter
    });
    x_counter += 1;
    if (x_counter >= data.n_sensors[0]) {
      x_counter = 0;
      y_counter += 1;
    }
  }
  return mappedData;
}

/**
 * Configuration settings for the printer
 */

var tempPIXELPITCH = 1;
var tempDPMM = 1 / tempPIXELPITCH;
var printer_settings = {
  PIXELPITCH: 1,
  DPMM: 1 / tempPIXELPITCH,
  ext: 0,
  speed: 600,
  layerHeight: 0.3,
  currentLayer: 0,
  extrusionCoefficient: 0.1,
  layers: 5,
  retraction: 3,
  slicedistance: 0.8 * tempDPMM,
  GCode_rounding: 2
};

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

  for (var i = 0; i < polygon.length; i++) {
    var polyX = polygon[i][0];
    var polyY = polygon[i][1];

    if (polyX <= minX) {
      minX = polyX;
    }
    if (polyX >= maxX) {
      maxX = polyX;
    }
    if (polyY <= minY) {
      minY = polyY;
    }
    if (polyY >= maxY) {
      maxY = polyY;
    }
  }
  /**
  * For each scanline create a scanline polygon and intersect with sole polygon.
  */
  var sliced_edges = [];
  for (var y = minY; y < maxY; y += printer_settings.slicedistance) {
    var scanlinePolygon = [[minX, y], [maxX, y], [maxX, y + printer_settings.slicedistance * 3], [minX, y + printer_settings.slicedistance * 3]];
    var intersected_polygons = [];
    var no_error = true;
    for (var errorAdjust = 0; errorAdjust < 2; errorAdjust += 0.1) {
      try {
        var adjustedScanline = scanlinePolygon;
        adjustedScanline[0][0] -= errorAdjust;
        adjustedScanline[1][0] += errorAdjust;
        adjustedScanline[2][0] += errorAdjust;
        adjustedScanline[3][0] -= errorAdjust;
        intersected_polygons = martinez.intersection(scanlinePolygon, polygon);
      } catch (e) {
        console.log(" --------errorAdjust: " + errorAdjust + "  y: " + y + " error: " + e);
        no_error = false;
      }
      if (no_error) {
        errorAdjust = 3;
      }
    }

    if (no_error) {
      /**
       * Get minimum and maximum values of the intersected polygons.
       */
      for (var i = 0; i < intersected_polygons.length; i++) {
        var minEdgeX = 100000;
        var maxEdgeX = -100000;
        for (var j = 0; j < intersected_polygons[i].length; j++) {
          if (true) {
            var polyX = intersected_polygons[i][j][0];
            var polyY = intersected_polygons[i][j][1];
            if (polyX <= minEdgeX && polyY == y) {
              minEdgeX = polyX;
            }
            if (polyX >= maxEdgeX && polyY == y) {
              maxEdgeX = polyX;
            }
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
  for (var i = 0; i < polygon.length - 1; i++) {
    edges.push([polygon[i][0], polygon[i][1], polygon[i + 1][0], polygon[i + 1][1]]);
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

/**
 * Construct sole compiles the sole as specified in the construction layers with the contour and input cells.
 * @param  {[array]} construction_layers    [Describes each of the layers of the sole]
 * @param  {[array]} construction_functions [Functions that go from the seed data to the GCODE string]
 * @param {[json object]} printer_settings  [Describes basic printer settings]
 * @param  {[array]} contour                [Array of [x,y] points describing the sole outline]
 * @param  {[array]} cells                  [Array of [x,y] points describing the voronoi seeds]
 */
function construct_sole(construction_layers, construction_functions, printer_settings, contour, seeds, voronoi, scaling) {
  // Scale the contour & seeds according to the scaling


  var scaledContour = [];
  for (var i = 0; i < contour.length; i++) {
    scaledContour.push([contour[i][0] / scaling, // the interface is multiplied, so to go back to original size, devide
    contour[i][1] / scaling]);
  }
  var scaledSeeds = [];
  for (var i = 0; i < seeds.length; i++) {
    scaledSeeds.push([Math.round(seeds[i][0] / scaling), // the interface is multiplied, so to go back to original size, devide
    Math.round(seeds[i][1] / scaling)]);
  }

  // var COMPILED_GCODE = startRepRapGcode(printer_settings.speed, printer_settings.layerHeight);
  var COMPILED_GCODE = startRepRapGcode(printer_settings.speed, printer_settings.layerHeight);

  // Step 1: Building the actual layers from the construction 'layers'
  var layersData = [];
  for (var i = 0; i < construction_layers.length; i++) {
    for (var j = 0; j < construction_layers[i].count; j++) {
      layersData.push({
        name: construction_layers[i].name,
        components: construction_layers[i].components,
        speed: construction_layers[i].speed,
        i_increment: i,
        j_increment: j
      });
    }
  }
  console.log("layersdata.length: " + layersData.length);
  // closing and slicing the contour
  var closedContour = scaledContour.slice(0);
  closedContour.push(closedContour[0]);
  var slicedContour = slice_single_polygon(closedContour);
  // compiling the cells
  var sole_cells = generate_cells_without_outline_inset(scaledContour, scaledSeeds, voronoi, sole_design.inset);
  var sliced_cells = slice_polygons(sole_cells, printer_settings);
  console.log("cells sliced");
  console.log(sliced_cells);
  var croppedVoronoi = generate_cells_without_outline_inset(scaledContour, scaledSeeds, voronoi, 1);
  // starting the extrusion measurement
  var print_extrusion = printer_settings.ext;

  console.log("compiling layers");
  var current_position = {
    x: 20,
    y: 20
  };
  for (var i = 0; i < layersData.length; i++) {
    console.log("layer: " + i);
    var layerIncrementCode = layerIncrement(layersData[i].speed, i + 1, layersData[i].name, printer_settings.layerHeight);
    COMPILED_GCODE += layerIncrementCode;
    COMPILED_GCODE += "\r\n";
    for (var j = 0; j < layersData[i].components.length; j++) {
      if (layersData[i].components[j] == "contour_outline") {
        var compiledOutline = compilePolygonOutline(scaledContour, print_extrusion, printer_settings, current_position);
        COMPILED_GCODE += compiledOutline.printCode;
        print_extrusion = compiledOutline.ext;
        current_position = compiledOutline.last_position;
      } else if (layersData[i].components[j] == "contour_fill") {
        console.log("contour fill");
        var compiledContourFill = compilePolygonFill(slicedContour, print_extrusion, printer_settings, current_position);
        COMPILED_GCODE += compiledContourFill.printCode;
        print_extrusion = compiledContourFill.ext;
        current_position = compiledContourFill.last_position;
      } else if (layersData[i].components[j] == "cells_outline") {
        console.log("cells outline");
        for (var cell_counter = 0; cell_counter < sole_cells.length; cell_counter++) {
          var compiledCellOutline = compilePolygonOutline(sole_cells[cell_counter], print_extrusion, printer_settings, current_position);
          COMPILED_GCODE += compiledCellOutline.printCode;
          print_extrusion = compiledCellOutline.ext;
          current_position = compiledCellOutline.last_position;
        }
      } else if (layersData[i].components[j] == "cells_fill") {
        console.log("cells fill");
        for (var cell_counter = 0; cell_counter < sliced_cells.length; cell_counter++) {
          console.log("filling cell: " + cell_counter);
          console.log("start print ext: " + print_extrusion);
          var compiledCellFill = compilePolygonFill(sliced_cells[cell_counter], print_extrusion, printer_settings, current_position);
          COMPILED_GCODE += compiledCellFill.printCode;
          print_extrusion = compiledCellFill.ext;
          current_position = compiledCellFill.last_position;
          console.log("new print ext: " + print_extrusion);
        }
      } else if (layersData[i].components[j] == "cropped_voronoi_outline") {
        for (var cell_counter = 0; cell_counter < croppedVoronoi.length; cell_counter++) {
          var compiledCellOutline = compilePolygonOutline(croppedVoronoi[cell_counter], print_extrusion, printer_settings, current_position);
          COMPILED_GCODE += compiledCellOutline.printCode;
          print_extrusion = compiledCellOutline.ext;
          current_position = compiledCellOutline.last_position;
        }
      }
    }
  }
  COMPILED_GCODE += endGcode();

  console.log("layers compiled");
  //console.log(COMPILED_GCODE);
  return COMPILED_GCODE;
}

function compilePolygonOutline(contour, print_extrusion, printer_settings, current_position) {
  var returnCode = "";
  var ext = print_extrusion;

  var compiledMove = edgeMove(current_position.x, current_position.y, contour[0][0], contour[0][1], ext, printer_settings);
  returnCode += compiledMove.edgeCode;
  ext = compiledMove.ext;

  var contour_edges = points_to_edges(contour);

  for (var i = 0; i < contour_edges.length; i++) {
    var edge = contour_edges[i];
    var compiledEdge = edgeWrite(edge[0], edge[1], edge[2], edge[3], ext, printer_settings);
    returnCode += compiledEdge.edgeCode;
    ext = compiledEdge.ext;
  }
  return {
    printCode: returnCode,
    ext: ext,
    last_position: {
      x: contour_edges[contour_edges.length - 1][2],
      y: contour_edges[contour_edges.length - 1][3]
    }
  };
}

function compilePolygonFill(slicedContour, print_extrusion, printer_settings, current_position) {
  console.log("compile polygon fill print ext: " + print_extrusion);
  var returnCode = "";
  var ext = print_extrusion;

  console.log("moving from: " + current_position.x + " ," + current_position.y + " to: " + slicedContour[0][0] + "," + slicedContour[0][1]);
  var compiledMove = edgeMove(current_position.x, current_position.y, slicedContour[0][0], slicedContour[0][1], ext, printer_settings);
  console.log(compiledMove.edgeCode);
  returnCode += compiledMove.edgeCode;
  ext = compiledMove.ext;

  var leftRightToggle = "left"; // toggle left
  for (var i = 0; i < slicedContour.length; i++) {
    var compiledEdge;
    if (leftRightToggle == "left") {
      compiledEdge = edgeWrite(slicedContour[i][0], slicedContour[i][1], slicedContour[i][2], slicedContour[i][3], ext, printer_settings);
      leftRightToggle = "right";
    } else if (leftRightToggle == "right") {
      compiledEdge = edgeWrite(slicedContour[i][2], slicedContour[i][3], slicedContour[i][0], slicedContour[i][1], ext, printer_settings);
      leftRightToggle = "left";
    }

    returnCode += compiledEdge.edgeCode;
    ext = compiledEdge.ext;
    if (i < slicedContour.length - 1) {
      var toNextEdge;
      if (leftRightToggle == "left") {
        toNextEdge = edgeWrite(slicedContour[i][2], slicedContour[i][3], slicedContour[i + 1][2], slicedContour[i + 1][3], ext, printer_settings);
      } else if (leftRightToggle == "right") {
        toNextEdge = edgeWrite(slicedContour[i][0], slicedContour[i][1], slicedContour[i + 1][0], slicedContour[i + 1][1], ext, printer_settings);
      }

      // returnCode += toNextEdge.edgeCode;
      // ext = toNextEdge.ext;
    }
  }
  return {
    printCode: returnCode,
    ext: ext,
    last_position: {
      x: slicedContour[slicedContour.length - 1][2],
      y: slicedContour[slicedContour.length - 1][3]
    }
  };
}

function layerIncrement(speed, currentLayer, name, layerHeight) {
  return "G0 F" + speed + " Z" + currentLayer * layerHeight + " ;layer: " + name;
}

var sole_design = {
  inset: 2
};

/**
 * Shoemaker initialisation
 */

$(document).ready(function () {
  console.log("document ready - wednesday 19 okt 17:00 - latest commit");
  var real_width = 128; // in millimeters
  var real_height = 318; // in milimeters

  var current_host = "localhost";
  if (window.location.hostname.match("solemaker.io")) {
    console.log("current host is solemaker.io");
    current_host = "solemaker.io";
  }

  var scaling = 2;

  var editor_width = real_width * scaling;
  var editor_height = real_height * scaling;

  // draw state is either outline or voronoi
  var draw_state = "outline";

  // UIstate is either sole-editor or layer-editor
  var UIState = "sole-editor";

  $("#draw-outline-button").addClass("state-toggled");

  // SEED VARS
  var outline_points = [];
  var voronoi_points = [];

  var outlineFromSensor = true;

  var sensing = false;

  var left_right_foot = "left";

  var transposedOutline = [];
  var yeezy_outline = [];

  for (var i = 0; i < preset_outline.length; i++) {
    transposedOutline.push([preset_outline[i][1], preset_outline[i][0]]);
  }
  yeezy_outline = translate_polygon(yeezy_preset_outline, -150, -100);
  transposedOutline = flip_polygon_on_y(transposedOutline);
  transposedOutline = translate_polygon(transposedOutline, 2, 235);
  var originalCorrectOutline = yeezy_outline;
  //originalCorrectOutline = transposedOutline;

  var originalOutlineWidth = 0;
  var originalOutlineHeight = 0;
  for (var i = 0; i < originalCorrectOutline.length; i++) {
    if (originalOutlineWidth < originalCorrectOutline[i][0]) {
      originalOutlineWidth = originalCorrectOutline[i][0];
    }
    if (originalOutlineHeight < originalCorrectOutline[i][1]) {
      originalOutlineHeight = originalCorrectOutline[i][1];
    }
  }
  var unitOutline = [];
  for (var i = 0; i < originalCorrectOutline.length; i++) {
    unitOutline.push([originalCorrectOutline[i][0] / originalOutlineWidth, originalCorrectOutline[i][1] / originalOutlineHeight]);
  }
  var unitOutlineMirrored = [];
  for (var i = 0; i < unitOutline.length; i++) {
    unitOutlineMirrored.push([unitOutline[i][0] * -1 + 1, unitOutline[i][1]]);
  }
  console.log("original outline width: " + originalOutlineWidth + " height: " + originalOutlineHeight);

  //transposedOutline = scale_polygon_to_dimensions(transposedOutline, 50, 450);

  outline_points = originalCorrectOutline;

  voronoi_points = cellularGridSeed(5, 3, editor_width, editor_height, 50);
  for (var i = 0; i < voronoi_points.length; i++) {
    voronoi_points[i][0] = voronoi_points[i][0] + Math.random() * 45 - 28;
    voronoi_points[i][1] = voronoi_points[i][1] + Math.random() * 45 - 28;
  }

  // COMPUTED VARS
  var sole_cells = [];
  var voronoi_cells = [];

  var voronoi = d3.voronoi().extent([[0, 0], [editor_width, editor_height]]);

  var scaledVoronoi = d3.voronoi().extent([[0, 0], [real_width * scaling, real_height * scaling]]);

  var dragged = null;
  var selected = outline_points[0];

  // sensordata
  var SensorData = [];
  var SensorSettings = {
    n_sensors: [0, 0]
  };

  var BinarySensorData = [];

  var boundingBoxWidth = 10;
  var boundingBoxHeight = 10;
  var boundingBoxOffsetWidth = 5;
  var boundingBoxOffsetHeight = 5;

  var sensorStateMessage = "sensing";

  var websocket_enabled = false;
  var host;
  var socket;
  var $txt = $("#data");
  var $btnSend = $("#sendtext");

  var rawDataResponse;

  if (!("WebSocket" in window)) {
    alert("Your browser does not support web sockets");
  } else {
    websocket_enabled = true;
    // host = "ws://target.luon.net:9090/ws";
    host = "ws://localhost:9090/ws";
    socket = new WebSocket(host);
    $btnSend.on("click", function () {
      var text = $txt.val();
      if (text == "") {
        return;
      }
      socket.send(text);
      $txt.val("");
    });

    $txt.keypress(function (evt) {
      if (evt.which == 13) {
        $btnSend.click();
      }
    });
    if (socket) {
      socket.onopen = function () {
        console.log("websocket opened");
      };

      socket.onmessage = function (msg) {
        showWebSocketServerResponse(msg.data);
      };

      socket.onclose = function () {
        console.log("websocket closed");
      };
    } else {
      console.log("invalid socket");
    }
  }

  var dropout_counter = 0;
  var dropout_framerate = 5;
  function showWebSocketServerResponse(data) {
    dropout_counter += 1;
    if (dropout_counter > dropout_framerate) {
      dropout_counter = 0;
      var data = JSON.parse(data);
      rawDataResponse = data;
      console.log("offset_height: " + data.offset_height);
      // if(data.state[0] > 1) {
      //
      // }
      SensorData = mapSensorData(data);
      BinarySensorData = mapBinarySensorData(data);
      boundingBoxWidth = data.width;
      boundingBoxHeight = data.height;
      boundingBoxOffsetWidth = data.offset_width;
      boundingBoxOffsetHeight = data.offset_height;
      SensorSettings.n_sensors = data.n_sensors;
      if (outlineFromSensor && sensing) {
        if (boundingBoxWidth > 0 && boundingBoxHeight > 0) {
          outline_points = recalculate_outline(left_right_foot, unitOutline, unitOutlineMirrored, boundingBoxWidth, boundingBoxHeight, boundingBoxOffsetWidth, boundingBoxOffsetHeight, editor_width, editor_height, SensorSettings);
          // outline_points = scaleOutlineBasedOnSensorData(originalCorrectOutline, SensorData);
        } else {
          console.log("bounding box is not a box - width: " + boundingBoxWidth + " height: " + boundingBoxHeight);
        }
      }
      redraw();
    }
  }

  var test_data_url = "http://dp50mm.github.io/solemakerv2/data/json_beautiful.json";
  if (current_host == "solemaker.io") {
    test_data_url = "/vendor/shoemaker-js/data/json_beautiful.json";
  }

  var solemakerBackend = new SoleMakerBackendConnection(test_data_url);
  solemakerBackend.getSensorData(function (data) {
    rawDataResponse = data;
    console.log(rawDataResponse);
    SensorData = mapSensorData(data);
    BinarySensorData = mapBinarySensorData(data);
    boundingBoxWidth = data.width;
    boundingBoxHeight = data.height;
    boundingBoxOffsetWidth = data.offset_width;
    boundingBoxOffsetHeight = data.offset_height;
    SensorSettings.n_sensors = data.n_sensors;
    if (boundingBoxWidth > 0 && boundingBoxHeight > 0) {
      outline_points = recalculate_outline(left_right_foot, unitOutline, unitOutlineMirrored, boundingBoxWidth, boundingBoxHeight, boundingBoxOffsetWidth, boundingBoxOffsetHeight, editor_width, editor_height, SensorSettings);
    } else {}

    redraw();
  });

  var line = d3.line();

  var svg = d3.select("#svg_container").append("svg").attr("width", editor_width).attr("height", editor_height).attr("id", "sole-design-svg").attr("tabindex", 1);

  var heatmapGroup = svg.append("g").attr("class", "heatmap-group");
  var binaryGroup = svg.append("g").attr("class", "binary-group");
  var soleCellsGroup = svg.append("g").attr("class", "sole-cells-group");
  var contourGroup = svg.append("g").attr("class", "contour-group");
  var voronoiCellsGroup = svg.append("g").attr("class", "voronoi-cells-group");

  svg.append("rect").attr("width", editor_width).attr("height", editor_height).on("mousedown", mousedown);

  var pointControlsGroup = svg.append("g").attr("class", "points-control-group");

  var node_transition = d3.transition().duration(750).ease(d3.easeElastic);

  d3.select(window).on("mousemove", mousemove).on("mouseup", mouseup).on("keydown", keydown);

  d3.select("#load-design-file-button").on("mousedown", function () {
    console.log("load outline button pressed");
  });

  d3.select("#draw-outline-button").on("mousedown", function () {
    console.log("draw outline toggled");
    draw_state = "outline";
    UIState = "sole-editor";
    $("#draw-outline-button").addClass("state-toggled");
    $("#draw-voronoi-button").removeClass("state-toggled");
    $("#preview-layers-button").removeClass("state-toggled");
    $(".layers-preview-layer").hide();
    ReactDOM.render(React.createElement(LayerEditor, { layers: construction_layers, updatePreviewLayers: updatePreviewLayers, visibility: "hide" }), document.getElementById("layer-editor-container"));
  });
  d3.select("#draw-voronoi-button").on("mousedown", function () {
    console.log("draw voronoi toggled");
    draw_state = "voronoi";
    UIState = "sole-editor";
    $("#draw-outline-button").removeClass("state-toggled");
    $("#preview-layers-button").removeClass("state-toggled");
    $("#draw-voronoi-button").addClass("state-toggled");
    $(".layers-preview-layer").hide();
    ReactDOM.render(React.createElement(LayerEditor, { layers: construction_layers, updatePreviewLayers: updatePreviewLayers, visibility: "hide" }), document.getElementById("layer-editor-container"));
  });

  d3.select("#clear-outline-button").on("mousedown", function () {
    outlineFromSensor = false;
    outline_points = [];
    d3.select("#listen-to-server").attr("style", "color:black;").text("start listening");
  });

  d3.select("#export-gcode-button").on("mousedown", function () {
    console.log("Export gcode pressed");
    var compiledGCode = construct_sole(construction_layers, 0, printer_settings, outline_points, voronoi_points, scaledVoronoi, scaling);
    // console.log(compiledGCode);
    var blob = new Blob([compiledGCode], { type: "text/plain;charset=utf-8" });
    saveAs(blob, "sole.gcode");
    // $("#download-link").attr("href","data:application/txt;charset=utf-8,"+encodeURI(compiledGCode));
    // $("#download-link").attr("download","sole.gcode");
  });

  d3.select("#download-link").on("mousedown", function () {
    console.log("Export gcode pressed");
    var compiledGCode = construct_sole(construction_layers, 0, printer_settings, outline_points, voronoi_points, scaledVoronoi, scaling);
    var outlineDistance = calculate_outline_distance(outline_points);
    // console.log(compiledGCode);
    var blob = new Blob([compiledGCode], { type: "text/plain;charset=utf-8" });
    var email_address = $("#email-address").val();
    saveAs(blob, "sole_for_" + email_address + ".gcode");
    var png_url = "";
    saveSvgAsPng(document.getElementById("sole-design-svg"), "design_for_" + email_address + ".png");
    // svgAsPngUri(document.getElementById("sole-design-svg"), "design_for_"+email_address, function(uri) {
    //   png_url = uri;
    // });
    SendSoleDesignAndGCode({
      VoronoiSeeds: voronoi_points,
      SoleOutline: outline_points,
      SVG: "<svg></svg>",
      GCode: compiledGCode,
      contourLength: Math.floor(outlineDistance),
      uri: png_url
    });
    // $("#download-link").attr("href","data:application/txt;charset=utf-8,"+encodeURI(compiledGCode));
    // $("#download-link").attr("download","sole.gcode");
  });

  svg.node().focus();

  //
  d3.select("#upload-to-server").on("mousedown", function () {
    console.log("upload to server clicked");
    var compiledGCode = construct_sole(construction_layers, 0, printer_settings, outline_points, voronoi_points, scaledVoronoi, scaling);
    SendSoleDesignAndGCode({
      VoronoiSeeds: voronoi_points,
      SoleOutline: outline_points,
      SVG: "<svg></svg>",
      GCode: compiledGCode,
      contourLength: 0
    });
  });

  /**
   *
   */
  d3.select("#start-calibration").on("mousedown", function () {
    console.log("sending start callibration command to socket");
    socket.send("{\"cmd\": \"reset\"}");
  });

  d3.select("#start-measuring-sensor-data").on("mousedown", function () {
    console.log("sending start callibration command to socket");
    sensing = true;
    socket.send("{\"cmd\": \"start\"}");
  });

  d3.select("#stop-measuring-sensor-data").on("mousedown", function () {
    console.log("sending stop callibration command to socket");
    sensing = false;
    socket.send("{\"cmd\": \"stop\"}");
  });

  d3.select("#sensor-hard-reset").on("mousedown", function () {
    console.log("Hard sensor reset");
    socket.send("{\"cmd\": \"quit\"}");
  });

  d3.select("#update-binary-threshold").on("mousedown", function () {
    socket.send("{\"binary_threshold\": 25}"); // down is bigger, up is smaller
    // 1 SPACE IS SUPER FUCKING IMPORTANT OTHERWISE THE WORLD EXPLODES INTO SMALL BEAUTIFULL PARTICLES OF FABRIC DATA AND UNICORN POOP
  });

  d3.select("#left-foot-toggle").on("mousedown", function () {
    left_right_foot = "left";
    outline_points = recalculate_outline(left_right_foot, unitOutline, unitOutlineMirrored, boundingBoxWidth, boundingBoxHeight, boundingBoxOffsetWidth, boundingBoxOffsetHeight, editor_width, editor_height, SensorSettings);
    redraw();
  });

  d3.select("#right-foot-toggle").on("mousedown", function () {
    left_right_foot = "right";
    outline_points = recalculate_outline(left_right_foot, unitOutline, unitOutlineMirrored, boundingBoxWidth, boundingBoxHeight, boundingBoxOffsetWidth, boundingBoxOffsetHeight, editor_width, editor_height, SensorSettings);
    redraw();
  });

  ReactDOM.render(React.createElement(LayerEditor, { layers: construction_layers, updatePreviewLayers: updatePreviewLayers, visibility: "hide" }), document.getElementById("layer-editor-container"));

  $("#preview-layers-button").on("click", function () {
    UIState = "preview";
    $("#draw-voronoi-button").removeClass("state-toggled");
    $("#draw-outline-button").removeClass("state-toggled");
    $("#preview-layers-button").addClass("state-toggled");
    console.log("layers show toggle clicked");
    updatePreviewLayers();
    $(".layers-preview-layer").show();
    ReactDOM.render(React.createElement(LayerEditor, { layers: construction_layers, updatePreviewLayers: updatePreviewLayers, visibility: "visible" }), document.getElementById("layer-editor-container"));
  });

  function updatePreviewLayers() {
    console.log("update preview layers");
    ReactDOM.render(React.createElement(LayersPreview, { UIState: UIState, layers: construction_layers, contour: outline_points, sole_cells: sole_cells, voronoi_cells: voronoi_cells }), document.getElementById("layers-svg-container"));
  }

  redraw();

  function redraw() {

    var voronoiCells = voronoiCellsGroup.selectAll(".voronoi-cell").data(voronoi.polygons(voronoi_points)).enter().append("path").attr("class", "voronoi-cell").call(redrawPolygon);

    voronoiCells.call(redrawPolygon);

    voronoiCells.exit().remove();

    voronoiCellsGroup.selectAll(".voronoi-cell").call(redrawPolygon);

    /**
     * Convert the outline points and voronoi seeds to sole fields
     */
    // Check if outline_points is round
    if (outline_points.length > 2) {
      var sole_polys = generate_cells_without_outline_inset(outline_points, voronoi_points, voronoi, sole_design.inset); // generate sole layer
      sole_cells = sole_polys;
      voronoi_cells = generate_cells_without_outline_inset(outline_points, voronoi_points, voronoi, 1);
      // var sliced_cells = slice_polygons(sole_polys);

      var sole_poly_selection = soleCellsGroup.selectAll(".sole-cell").data(sole_polys, function (d) {
        return d;
      });

      sole_poly_selection.enter().append("path").attr("class", "sole-cell").attr("d", function (d) {
        return d ? "M" + d.join("L") + "Z" : null;
      });

      sole_poly_selection.attr("d", function (d) {
        return d ? "M" + d.join("L") + "Z" : null;
      });
      sole_poly_selection.exit().remove();
    }

    var outline_circle = pointControlsGroup.selectAll(".outline-circle").data(outline_points);

    outline_circle.enter().append("circle").attr("r", 0.1).attr("cx", function (d) {
      return d[0];
    }).attr("cy", function (d) {
      return d[1];
    }).attr("class", "outline-circle").on("mousedown", function (d) {
      selected = dragged = d;redraw();
    }).transition(node_transition).attr("r", 3);

    outline_circle.attr("cx", function (d) {
      return d[0];
    }).attr("cy", function (d) {
      return d[1];
    });

    outline_circle.classed("selected", function (d) {
      return d === selected;
    }).attr("cx", function (d) {
      return d[0];
    }).attr("cy", function (d) {
      return d[1];
    });

    outline_circle.exit().remove();

    var voronoi_circle = pointControlsGroup.selectAll(".voronoi-circle").data(voronoi_points, function (d) {
      return d;
    });

    voronoi_circle.enter().append("circle").attr("r", 0.1).attr("cx", function (d) {
      return d[0];
    }).attr("cy", function (d) {
      return d[1];
    }).attr("class", "voronoi-circle").on("mousedown", function (d) {
      selected = dragged = d;redraw();
    }).transition(node_transition).attr("r", 5);

    voronoi_circle.classed("selected", function (d) {
      return d === selected;
    }).attr("cx", function (d) {
      return d[0];
    }).attr("cy", function (d) {
      return d[1];
    });

    voronoi_circle.exit().remove();
    /**
     * HEATMAP
     */
    var heat_cells = heatmapGroup.selectAll("rect").data(SensorData);

    heat_cells.enter().append("rect").attr("style", function (d) {
      var color_value = Math.floor(255 - (d.value - rawDataResponse.range[0]) * (255 / rawDataResponse.range[1]));
      var opacity_value = ((d.value - rawDataResponse.range[0]) * (1 / rawDataResponse.range[1])).toFixed(2);
      return "fill:rgba(234, 78, 60, " + opacity_value + ");";
    }).attr("y", function (d) {
      return d.x * (editor_height / SensorSettings.n_sensors[0]);
    }).attr("x", function (d) {
      return d.y * (editor_width / SensorSettings.n_sensors[1]);
    }).attr("width", function () {
      return editor_width / SensorSettings.n_sensors[1];
    }).attr("height", function () {
      return editor_height / SensorSettings.n_sensors[0];
    });

    heat_cells.attr("style", function (d) {
      var color_value = Math.floor(255 - (d.value - rawDataResponse.range[0]) * (255 / rawDataResponse.range[1]));
      var opacity_value = ((d.value - rawDataResponse.range[0]) * (1 / rawDataResponse.range[1])).toFixed(2);
      return "fill:rgba(234, 78, 60, " + opacity_value + ");";
    }).attr("y", function (d) {
      return d.x * (editor_height / SensorSettings.n_sensors[0]);
    }).attr("x", function (d) {
      return d.y * (editor_width / SensorSettings.n_sensors[1]);
    }).attr("width", function () {
      return editor_width / SensorSettings.n_sensors[1];
    }).attr("height", function () {
      return editor_height / SensorSettings.n_sensors[0];
    });

    heat_cells.exit().remove();

    var binary_cells = binaryGroup.selectAll("rect").data(BinarySensorData);

    binary_cells.enter().append("rect").attr("class", "binary-cell").attr("stroke", function (d) {
      if (d.value == 1) {
        return "black";
      } else {
        return "transparent";
      }
    }).attr("fill", function (d) {
      if (d.value == 1) {
        return "black";
      } else {
        return "transparent";
      }
    }).attr("y", function (d) {
      return d.x * (editor_height / SensorSettings.n_sensors[0]);
    }).attr("x", function (d) {
      return d.y * (editor_width / SensorSettings.n_sensors[1]);
    }).attr("width", function () {
      return editor_width / SensorSettings.n_sensors[1];
    }).attr("height", function () {
      return editor_height / SensorSettings.n_sensors[0];
    });

    binary_cells.attr("y", function (d) {
      return d.x * (editor_height / SensorSettings.n_sensors[0]);
    }).attr("x", function (d) {
      return d.y * (editor_width / SensorSettings.n_sensors[1]);
    }).attr("width", function () {
      return editor_width / SensorSettings.n_sensors[1];
    }).attr("height", function () {
      return editor_height / SensorSettings.n_sensors[0];
    });

    binary_cells.exit().remove();

    contourGroup.selectAll(".outline-line").remove();
    contourGroup.append("path").attr("class", "outline-line").attr("d", line(outline_points));

    svg.selectAll(".scaling-box").remove();
    if (boundingBoxHeight > 0 && boundingBoxWidth > 0 && SensorSettings.n_sensors[0] > 0 && SensorSettings.n_sensors[1] > 0) {
      svg.append("rect").attr("class", "scaling-box").attr("x", calculateBoundingBoxX(boundingBoxOffsetWidth, boundingBoxWidth, editor_width, SensorSettings.n_sensors[1])).attr("y", calculateBoundingBoxY(boundingBoxOffsetHeight, boundingBoxHeight, editor_height, SensorSettings.n_sensors[0])).attr("width", calculateBoundingBoxWidth(boundingBoxWidth, editor_width, SensorSettings.n_sensors[1])).attr("height", calculateBoundingBoxHeight(boundingBoxHeight, editor_height, SensorSettings.n_sensors[0])).attr("fill", "transparent").attr("stroke", "rgba(0,0,0,0.5)").attr("stroke-width", "1px");
    }
    if (d3.event) {
      d3.event.preventDefault();
      d3.event.stopPropagation();
    }
  }

  function redrawPolygon(polygon) {
    polygon.attr("d", function (d) {
      return d ? "M" + d.join("L") + "Z" : null;
    });
  }

  function change() {
    line.interpolate(this.value);
    redraw();
  }

  function mousedown() {
    if (draw_state == "outline") {
      outline_points.push(selected = dragged = d3.mouse(svg.node()));
      redraw();
    } else if (draw_state == "voronoi") {
      voronoi_points.push(selected = dragged = d3.mouse(svg.node()));
      redraw();
    }
  }

  function mousemove() {
    if (!dragged) return;
    var m = d3.mouse(svg.node());
    dragged[0] = Math.max(0, Math.min(editor_width, m[0]));
    dragged[1] = Math.max(0, Math.min(editor_height, m[1]));
    redraw();
  }

  function mouseup() {
    if (!dragged) return;
    mousemove();
    dragged = null;
  }

  function keydown() {
    console.log("Keydown keycode: " + d3.event.keyCode);
    if (!selected) return;
    switch (d3.event.keyCode) {
      case 8: // backspace
      case 68:
        {
          // d key
          var i = points.indexOf(selected);
          points.splice(i, 1);
          selected = points.length ? outline_points[i > 0 ? i - 1 : 0] : null;
          redraw();
          break;
        }
    }
  }
});

function generate_cells(outline_points, voronoi_seeds, voronoi, inset_size) {
  // close outline by concatting the first point at the end
  var sole_polys = [];
  var closed_outline_points = outline_points.concat([outline_points[0]]);
  var offset = new Offset();
  for (var i = 0; i < voronoi_seeds.length; i++) {
    // close voronoi polygon by pushing the first point onto the end
    var voronoi_poly = voronoi.polygons(voronoi_seeds)[i];
    var closed_voronoi_poly = voronoi_poly;
    closed_voronoi_poly.push([voronoi_poly[0][0], voronoi_poly[0][1]]);
    // The martinez intersection returns an array of polygons.
    // often this is just 1 polygon but it can be multiple.
    var no_intersect_error = false;
    var intersected_polygons;
    try {
      intersected_polygons = martinez.intersection(closed_outline_points, closed_voronoi_poly);
    } catch (err) {
      console.log(err);
    }
    if (intersected_polygons != null && intersected_polygons.length > 0) {
      if (intersected_polygons[0].length > 2) {
        var offset_poly;
        for (var y = 0; y < intersected_polygons.length; y++) {
          var no_error = false;
          try {
            offset_poly = offset.data(intersected_polygons[y]).padding(inset_size);
            no_error = true;
          } catch (err) {}
          // console.log(err);

          // check if there was an error in the offset to filter glitches
          if (no_error) {
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
    closed_voronoi_poly.push([voronoi_poly[0][0], voronoi_poly[0][1]]);
    var clock_wise_voronoi;
    if (check_clockwise(closed_voronoi_poly)) {
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
    } catch (err) {
      console.log(err);
    }

    if (no_error) {
      var intersected_polygons;
      try {
        intersected_polygons = martinez.intersection(closed_outline_points, offset_poly);
        if (intersected_polygons != null && intersected_polygons.length > 0) {
          for (var j = 0; j < intersected_polygons.length; j++) {
            if (intersected_polygons[j].length > 1) {
              sole_polys.push(intersected_polygons[j]);
            }
          }
        }
      } catch (err) {
        console.log(err);
      }
    }
  }
  var rounding_factor = 1000;
  for (var i = 0; i < sole_polys.length; i++) {
    for (var j = 0; j < sole_polys[i].length; j++) {
      sole_polys[i][j][0] = Math.floor(sole_polys[i][j][0] * rounding_factor) / rounding_factor;
      sole_polys[i][j][1] = Math.floor(sole_polys[i][j][1] * rounding_factor) / rounding_factor;
    }
  }
  return sole_polys;
}

function check_clockwise(polygon) {
  var sum = 0;
  for (var i = 0; i < polygon.length - 1; i++) {
    var p1 = polygon[i];
    var p2 = polygon[i + 1];
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
  for (var i = 0; i < outline.length - 1; i++) {
    outline_distance += distance(outline[i][0], outline[i][1], outline[i + 1][0], outline[i + 1][1]);
  }
  return outline_distance;
}

var LayerEditor = React.createClass({
  displayName: "LayerEditor",

  getInitialState: function getInitialState() {
    return {
      layers: this.props.layers
    };
  },
  updateCount: function updateCount(index, new_count) {
    var layers = this.state.layers;
    layers[index].count = new_count;
    this.setState({
      layers: layers
    });
    this.props.updatePreviewLayers();
  },
  updateSpeed: function updateSpeed(index, new_speed) {
    var layers = this.state.layers;
    layers[index].speed = new_speed;
    this.setState({
      layers: layers
    });
    this.props.updatePreviewLayers();
  },
  render: function render() {
    var layers = this.props.layers.map(function (layer, index) {
      return React.createElement(PrintLayer, { layer: layer, key: index, index: index, updateCount: this.updateCount, updateSpeed: this.updateSpeed });
    }, this);
    return React.createElement(
      "div",
      { className: "layer-editor " + this.props.visibility },
      layers
    );
  }
});

var PrintLayer = React.createClass({
  displayName: "PrintLayer",

  updateCount: function updateCount(event) {
    this.props.updateCount(this.props.index, event.target.value);
  },
  updateSpeed: function updateSpeed(event) {
    this.props.updateSpeed(this.props.index, event.target.value);
  },
  render: function render() {
    return React.createElement(
      "div",
      { className: "print-layer" },
      React.createElement(
        "h3",
        null,
        this.props.layer.name
      ),
      React.createElement(
        "p",
        null,
        React.createElement(
          "span",
          null,
          "count:"
        ),
        React.createElement(
          "span",
          null,
          React.createElement("input", { type: "number", value: this.props.layer.count, onChange: this.updateCount, min: "0", max: "1000" })
        )
      ),
      React.createElement(
        "p",
        null,
        React.createElement(
          "span",
          null,
          "speed:"
        ),
        React.createElement(
          "span",
          null,
          React.createElement("input", { type: "number", value: this.props.layer.speed, onChange: this.updateSpeed, min: "0", max: "1000" })
        )
      )
    );
  }
});

},{}]},{},[1]);

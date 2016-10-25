/**
 * Shoemaker initialisation
 */

$(document).ready(function() {
  console.log("document ready - wednesday 19 okt 17:00 - latest commit");
  var real_width = 128; // in millimeters
  var real_height = 318; // in milimeters

  var current_host = "localhost";
  if(window.location.hostname.match("solemaker.io")) {
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
    transposedOutline.push([
      preset_outline[i][1],
      preset_outline[i][0]
    ]);
  }
  yeezy_outline = translate_polygon(yeezy_preset_outline, -150,-100);
  transposedOutline = flip_polygon_on_y(transposedOutline);
  transposedOutline = translate_polygon(transposedOutline, 2, 235);
  var originalCorrectOutline = yeezy_outline;
  //originalCorrectOutline = transposedOutline;

  var originalOutlineWidth = 0;
  var originalOutlineHeight = 0;
  for (var i = 0; i < originalCorrectOutline.length; i++) {
    if(originalOutlineWidth < originalCorrectOutline[i][0]) {
      originalOutlineWidth = originalCorrectOutline[i][0];
    }
    if(originalOutlineHeight < originalCorrectOutline[i][1]) {
      originalOutlineHeight = originalCorrectOutline[i][1];
    }
  }
  var unitOutline = [];
  for (var i = 0; i < originalCorrectOutline.length; i++) {
    unitOutline.push([
      originalCorrectOutline[i][0] / originalOutlineWidth,
      originalCorrectOutline[i][1] / originalOutlineHeight
    ]);
  }
  var unitOutlineMirrored = [];
  for(var i = 0; i < unitOutline.length; i++) {
    unitOutlineMirrored.push([
      (unitOutline[i][0] * -1)+1,
      unitOutline[i][1]
    ]);
  }
  console.log("original outline width: "+originalOutlineWidth+" height: "+originalOutlineHeight);

  //transposedOutline = scale_polygon_to_dimensions(transposedOutline, 50, 450);

  outline_points = originalCorrectOutline;

  voronoi_points = cellularGridSeed(5,3,editor_width,editor_height,50);
  for (var i = 0; i < voronoi_points.length; i++) {
    voronoi_points[i][0] = voronoi_points[i][0]+Math.random()*45 - 28;
    voronoi_points[i][1] = voronoi_points[i][1]+Math.random()*45 - 28;
  }


  // COMPUTED VARS
  var sole_cells = [];
  var voronoi_cells = [];

  var voronoi = d3.voronoi()
    .extent([[0, 0], [editor_width, editor_height]]);

  var scaledVoronoi = d3.voronoi()
    .extent([[0,0],[real_width * scaling, real_height * scaling]]);

  var dragged = null;
  var selected = outline_points[0];

  // sensordata
  var SensorData = [];
  var SensorSettings = {
    n_sensors: [0,0]
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

  if(!("WebSocket" in window)) {
    alert("Your browser does not support web sockets");
  } else {
    websocket_enabled = true;
    // host = "ws://target.luon.net:9090/ws";
    host = "ws://localhost:9090/ws";
    socket = new WebSocket(host);
    $btnSend.on("click", function() {
      var text = $txt.val();
      if(text == "") {
        return;
      }
      socket.send(text);
      $txt.val("");
    });

    $txt.keypress(function(evt) {
      if(evt.which == 13) {
        $btnSend.click();
      }
    });
    if(socket) {
      socket.onopen = function() {
        console.log("websocket opened");
      }

      socket.onmessage = function(msg) {
        showWebSocketServerResponse(msg.data);
      }

      socket.onclose = function() {
        console.log("websocket closed");
      }
    } else {
      console.log("invalid socket");
    }
  }

  var dropout_counter = 0;
  var dropout_framerate = 5;
  function showWebSocketServerResponse(data) {
    dropout_counter += 1;
    if(dropout_counter > dropout_framerate) {
      dropout_counter = 0;
      var data = JSON.parse(data);
      rawDataResponse = data;
      console.log("offset_height: "+data.offset_height);
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
      if(outlineFromSensor && sensing) {
        if(boundingBoxWidth > 0 && boundingBoxHeight > 0) {
          outline_points = recalculate_outline(left_right_foot, unitOutline, unitOutlineMirrored, boundingBoxWidth, boundingBoxHeight, boundingBoxOffsetWidth, boundingBoxOffsetHeight, editor_width, editor_height, SensorSettings);
          // outline_points = scaleOutlineBasedOnSensorData(originalCorrectOutline, SensorData);
        } else {
          console.log("bounding box is not a box - width: "+boundingBoxWidth+" height: "+boundingBoxHeight);
        }
      }
      redraw();
    }
  }

  var test_data_url = "/data/json_beautiful.json";
  if(current_host == "solemaker.io") {
    test_data_url = "/vendor/shoemaker-js/data/json_beautiful.json";
  }

  var solemakerBackend = new SoleMakerBackendConnection(test_data_url);
  solemakerBackend.getSensorData(function(data) {
    rawDataResponse = data;
    console.log(rawDataResponse);
    SensorData = mapSensorData(data);
    BinarySensorData = mapBinarySensorData(data);
    boundingBoxWidth = data.width;
    boundingBoxHeight = data.height;
    boundingBoxOffsetWidth = data.offset_width;
    boundingBoxOffsetHeight = data.offset_height;
    SensorSettings.n_sensors = data.n_sensors;
    if(boundingBoxWidth > 0 && boundingBoxHeight > 0) {
      outline_points = recalculate_outline(left_right_foot, unitOutline, unitOutlineMirrored, boundingBoxWidth, boundingBoxHeight, boundingBoxOffsetWidth, boundingBoxOffsetHeight, editor_width, editor_height, SensorSettings);
    } else {
    }

    redraw();
  });

  var line = d3.line();

  var svg = d3.select("#svg_container").append("svg")
    .attr("width",editor_width)
    .attr("height",editor_height)
    .attr("id","sole-design-svg")
    .attr("tabindex",1);


  var heatmapGroup = svg.append("g").attr("class","heatmap-group");
  var binaryGroup = svg.append("g").attr("class","binary-group");
  var soleCellsGroup = svg.append("g").attr("class","sole-cells-group");
  var contourGroup = svg.append("g").attr("class","contour-group");
  var voronoiCellsGroup = svg.append("g").attr("class","voronoi-cells-group");

  svg.append("rect")
    .attr("width",editor_width)
    .attr("height",editor_height)
    .on("mousedown",mousedown);

  var pointControlsGroup = svg.append("g").attr("class","points-control-group");

  var node_transition = d3.transition()
    .duration(750)
    .ease(d3.easeElastic);



  d3.select(window)
    .on("mousemove",mousemove)
    .on("mouseup", mouseup)
    .on("keydown",keydown);

  d3.select("#load-design-file-button")
    .on("mousedown",function() {
      console.log("load outline button pressed");
    });

  d3.select("#draw-outline-button")
    .on("mousedown", function() {
      console.log("draw outline toggled");
      draw_state = "outline";
      UIState = "sole-editor";
      $("#draw-outline-button").addClass("state-toggled");
      $("#draw-voronoi-button").removeClass("state-toggled");
      $("#preview-layers-button").removeClass("state-toggled");
      $(".layers-preview-layer").hide();
      ReactDOM.render(<LayerEditor layers={construction_layers} updatePreviewLayers={updatePreviewLayers} visibility="hide" />,
        document.getElementById("layer-editor-container")
      );
    });
  d3.select("#draw-voronoi-button")
    .on("mousedown", function() {
      console.log("draw voronoi toggled");
      draw_state = "voronoi";
      UIState = "sole-editor";
      $("#draw-outline-button").removeClass("state-toggled");
      $("#preview-layers-button").removeClass("state-toggled");
      $("#draw-voronoi-button").addClass("state-toggled");
      $(".layers-preview-layer").hide();
      ReactDOM.render(<LayerEditor layers={construction_layers} updatePreviewLayers={updatePreviewLayers} visibility="hide" />,
        document.getElementById("layer-editor-container")
      );
    });

  d3.select("#clear-outline-button")
    .on("mousedown", function() {
      outlineFromSensor = false;
      outline_points = [];
      d3.select("#listen-to-server")
        .attr("style","color:black;")
        .text("start listening");
    });


  d3.select("#export-gcode-button")
    .on("mousedown", function() {
      console.log("Export gcode pressed");
      var compiledGCode = construct_sole(construction_layers, 0, printer_settings, outline_points, voronoi_points, scaledVoronoi, scaling);
      // console.log(compiledGCode);
      var blob = new Blob([compiledGCode], {type: "text/plain;charset=utf-8"});
      saveAs(blob, "sole.gcode");
      // $("#download-link").attr("href","data:application/txt;charset=utf-8,"+encodeURI(compiledGCode));
      // $("#download-link").attr("download","sole.gcode");
    });

    d3.select("#download-link")
      .on("mousedown", function() {
        console.log("Export gcode pressed");
        var compiledGCode = construct_sole(construction_layers, 0, printer_settings, outline_points, voronoi_points, scaledVoronoi, scaling);
        var outlineDistance = calculate_outline_distance(outline_points);
        // console.log(compiledGCode);
        var blob = new Blob([compiledGCode], {type: "text/plain;charset=utf-8"});
        var email_address = $("#email-address").val();
        saveAs(blob, "sole_for_"+email_address+".gcode");
        var png_url = "";
        saveSvgAsPng(document.getElementById("sole-design-svg"), "design_for_"+email_address+".png");
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
  d3.select("#upload-to-server")
    .on("mousedown", function() {
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
  d3.select("#start-calibration")
    .on("mousedown", function() {
      console.log("sending start callibration command to socket");
      socket.send("{\"cmd\": \"reset\"}");
    });

  d3.select("#start-measuring-sensor-data")
    .on("mousedown", function() {
      console.log("sending start callibration command to socket");
      sensing = true;
      socket.send("{\"cmd\": \"start\"}");
    });

  d3.select("#stop-measuring-sensor-data")
    .on("mousedown", function() {
      console.log("sending stop callibration command to socket");
      sensing = false;
      socket.send("{\"cmd\": \"stop\"}");
    });

  d3.select("#sensor-hard-reset")
    .on("mousedown", function() {
      console.log("Hard sensor reset");
      socket.send("{\"cmd\": \"quit\"}");
    });

  d3.select("#update-binary-threshold")
    .on("mousedown", function() {
      socket.send("{\"binary_threshold\": 25}"); // down is bigger, up is smaller
      // 1 SPACE IS SUPER FUCKING IMPORTANT OTHERWISE THE WORLD EXPLODES INTO SMALL BEAUTIFULL PARTICLES OF FABRIC DATA AND UNICORN POOP
    });

  d3.select("#left-foot-toggle")
    .on("mousedown", function() {
      left_right_foot = "left";
      outline_points = recalculate_outline(left_right_foot, unitOutline, unitOutlineMirrored, boundingBoxWidth, boundingBoxHeight, boundingBoxOffsetWidth, boundingBoxOffsetHeight, editor_width, editor_height, SensorSettings);
      redraw();
    });

  d3.select("#right-foot-toggle")
    .on("mousedown", function() {
      left_right_foot = "right";
      outline_points = recalculate_outline(left_right_foot, unitOutline, unitOutlineMirrored, boundingBoxWidth, boundingBoxHeight, boundingBoxOffsetWidth, boundingBoxOffsetHeight, editor_width, editor_height, SensorSettings);
      redraw();
    });


  ReactDOM.render(<LayerEditor layers={construction_layers} updatePreviewLayers={updatePreviewLayers} visibility="hide" />,
    document.getElementById("layer-editor-container")
  );

  $("#preview-layers-button").on("click", function() {
    UIState = "preview";
    $("#draw-voronoi-button").removeClass("state-toggled");
    $("#draw-outline-button").removeClass("state-toggled");
    $("#preview-layers-button").addClass("state-toggled");
    console.log("layers show toggle clicked");
    updatePreviewLayers();
    $(".layers-preview-layer").show();
    ReactDOM.render(<LayerEditor layers={construction_layers} updatePreviewLayers={updatePreviewLayers} visibility="visible" />,
      document.getElementById("layer-editor-container")
    );
  });

  function updatePreviewLayers() {
    console.log("update preview layers");
    ReactDOM.render(<LayersPreview UIState={UIState} layers={construction_layers} contour={outline_points} sole_cells={sole_cells} voronoi_cells={voronoi_cells} />,
      document.getElementById("layers-svg-container")
    );
  }

  redraw();


  function redraw() {


    var voronoiCells = voronoiCellsGroup.selectAll(".voronoi-cell")
      .data(voronoi.polygons(voronoi_points))
      .enter()
      .append("path")
      .attr("class","voronoi-cell")
      .call(redrawPolygon);

    voronoiCells.call(redrawPolygon);

    voronoiCells.exit().remove();

    voronoiCellsGroup.selectAll(".voronoi-cell")
      .call(redrawPolygon);

    /**
     * Convert the outline points and voronoi seeds to sole fields
     */
    // Check if outline_points is round
    if(outline_points.length > 2) {
      var sole_polys = generate_cells_without_outline_inset(outline_points, voronoi_points, voronoi, sole_design.inset); // generate sole layer
      sole_cells = sole_polys;
      voronoi_cells = generate_cells_without_outline_inset(outline_points, voronoi_points, voronoi, 1);
      // var sliced_cells = slice_polygons(sole_polys);

      var sole_poly_selection = soleCellsGroup.selectAll(".sole-cell")
        .data(sole_polys, function(d) { return d; });

      sole_poly_selection
        .enter()
        .append("path")
        .attr("class","sole-cell")
        .attr("d", function(d) { return d ? "M" + d.join("L") + "Z" : null; });

      sole_poly_selection.attr("d", function(d) { return d ? "M" + d.join("L") + "Z" : null; });
      sole_poly_selection.exit().remove();
    }


    var outline_circle = pointControlsGroup.selectAll(".outline-circle")
      .data(outline_points);

    outline_circle.enter().append("circle")
      .attr("r",0.1)
      .attr("cx", function(d) { return d[0]; })
      .attr("cy", function(d) { return d[1]; })
      .attr("class","outline-circle")
      .on("mousedown",function(d) { selected = dragged = d; redraw(); })
      .transition(node_transition)
        .attr("r",3);

    outline_circle.attr("cx", function(d) { return d[0]; })
      .attr("cy", function(d) { return d[1]; });

    outline_circle.classed("selected", function(d) { return d === selected; })
      .attr("cx", function(d) { return d[0]; })
      .attr("cy", function(d) { return d[1]; });

    outline_circle.exit().remove();


    var voronoi_circle = pointControlsGroup.selectAll(".voronoi-circle")
      .data(voronoi_points, function(d) { return d; });

    voronoi_circle.enter().append("circle")
      .attr("r",0.1)
      .attr("cx", function(d) { return d[0]; })
      .attr("cy", function(d) { return d[1]; })
      .attr("class", "voronoi-circle")
      .on("mousedown", function(d) { selected = dragged = d; redraw(); })
      .transition(node_transition)
        .attr("r", 5);

    voronoi_circle.classed("selected", function(d) { return d === selected; })
      .attr("cx", function(d) { return d[0]; })
      .attr("cy", function(d) { return d[1]; });

    voronoi_circle.exit().remove();
    /**
     * HEATMAP
     */
    var heat_cells = heatmapGroup.selectAll("rect")
      .data(SensorData);

    heat_cells.enter()
      .append("rect")
      .attr("style",function(d) {
        var color_value = Math.floor(255-((d.value - rawDataResponse.range[0]) * (255/rawDataResponse.range[1])));
        var opacity_value = (((d.value - rawDataResponse.range[0]) * (1/rawDataResponse.range[1]))).toFixed(2);
        return "fill:rgba(234, 78, 60, "+opacity_value+");";
      })
      .attr("y",function(d) {
        return (d.x*(editor_height/SensorSettings.n_sensors[0]));
      })
      .attr("x", function(d) {
        return (d.y*(editor_width/SensorSettings.n_sensors[1]));
      })
      .attr("width", function() {
        return editor_width/SensorSettings.n_sensors[1];
      })
      .attr("height", function() {
        return (editor_height/SensorSettings.n_sensors[0]);
      });

    heat_cells.attr("style",function(d) {
        var color_value = Math.floor(255-((d.value - rawDataResponse.range[0]) * (255/rawDataResponse.range[1])));
        var opacity_value = (((d.value - rawDataResponse.range[0]) * (1/rawDataResponse.range[1]))).toFixed(2);
        return "fill:rgba(234, 78, 60, "+opacity_value+");";
      })
      .attr("y",function(d) {
        return (d.x*(editor_height/SensorSettings.n_sensors[0]));
      })
      .attr("x", function(d) {
        return (d.y*(editor_width/SensorSettings.n_sensors[1]));
      })
      .attr("width", function() {
        return editor_width/SensorSettings.n_sensors[1];
      })
      .attr("height", function() {
        return (editor_height/SensorSettings.n_sensors[0]);
      });

    heat_cells.exit().remove();

    var binary_cells = binaryGroup.selectAll("rect")
      .data(BinarySensorData);

    binary_cells.enter()
      .append("rect")
      .attr("class","binary-cell")
      .attr("stroke", function(d) {
        if(d.value == 1) {
          return "black";
        } else {
          return "transparent";
        }
      })
      .attr("fill", function(d) {
        if(d.value == 1) {
          return "black";
        } else {
          return "transparent";
        }
      })
      .attr("y",function(d) {
        return (d.x*(editor_height/SensorSettings.n_sensors[0]));
      })
      .attr("x", function(d) {
        return (d.y*(editor_width/SensorSettings.n_sensors[1]));
      })
      .attr("width", function() {
        return editor_width/SensorSettings.n_sensors[1];
      })
      .attr("height", function() {
        return (editor_height/SensorSettings.n_sensors[0]);
      });

    binary_cells.attr("y",function(d) {
        return (d.x*(editor_height/SensorSettings.n_sensors[0]));
      })
      .attr("x", function(d) {
        return (d.y*(editor_width/SensorSettings.n_sensors[1]));
      })
      .attr("width", function() {
        return editor_width/SensorSettings.n_sensors[1];
      })
      .attr("height", function() {
        return (editor_height/SensorSettings.n_sensors[0]);
      });

    binary_cells.exit().remove();


    contourGroup.selectAll(".outline-line").remove();
    contourGroup.append("path")
      .attr("class","outline-line")
      .attr("d", line(outline_points));

    svg.selectAll(".scaling-box")
      .remove();
    if(boundingBoxHeight > 0 && boundingBoxWidth > 0 && SensorSettings.n_sensors[0] > 0 && SensorSettings.n_sensors[1] > 0) {
      svg.append("rect")
        .attr("class","scaling-box")
        .attr("x", calculateBoundingBoxX(boundingBoxOffsetWidth, boundingBoxWidth, editor_width, SensorSettings.n_sensors[1]) )
        .attr("y", calculateBoundingBoxY(boundingBoxOffsetHeight, boundingBoxHeight, editor_height, SensorSettings.n_sensors[0]) )
        .attr("width", calculateBoundingBoxWidth(boundingBoxWidth, editor_width, SensorSettings.n_sensors[1]) )
        .attr("height", calculateBoundingBoxHeight(boundingBoxHeight, editor_height, SensorSettings.n_sensors[0]) )
        .attr("fill","transparent")
        .attr("stroke","rgba(0,0,0,0.5)")
        .attr("stroke-width","1px");
    }
    if(d3.event) {
      d3.event.preventDefault();
      d3.event.stopPropagation();
    }
  }

  function redrawPolygon(polygon) {
    polygon.attr("d", function(d) { return d ? "M" + d.join("L") + "Z" : null; });
  }


  function change() {
    line.interpolate(this.value);
    redraw();
  }

  function mousedown() {
    if(draw_state == "outline") {
      outline_points.push(selected = dragged = d3.mouse(svg.node()));
      redraw();
    } else if (draw_state == "voronoi") {
      voronoi_points.push(selected = dragged = d3.mouse(svg.node()));
      redraw();
    }

  }

  function mousemove() {
    if (!dragged) return;
    var m  = d3.mouse(svg.node());
    dragged[0] = Math.max(0, Math.min(editor_width, m[0]));
    dragged[1] = Math.max(0, Math.min(editor_height, m[1]));
    redraw();
  }

  function mouseup() {
    if(!dragged) return;
    mousemove();
    dragged = null;
  }

  function keydown() {
    console.log("Keydown keycode: "+d3.event.keyCode);
    if (!selected) return;
    switch (d3.event.keyCode) {
      case 8: // backspace
      case 68: { // d key
        var i = points.indexOf(selected);
        points.splice(i, 1);
        selected = points.length ? outline_points[i > 0 ? i -1 : 0] : null;
        redraw();
        break;
      }
    }
  }

});

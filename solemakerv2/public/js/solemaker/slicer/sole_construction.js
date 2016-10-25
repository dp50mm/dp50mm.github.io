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
    scaledContour.push([
      contour[i][0] / scaling, // the interface is multiplied, so to go back to original size, devide
      contour[i][1] / scaling
    ]);
  }
  var scaledSeeds = [];
  for (var i = 0; i < seeds.length; i++) {
    scaledSeeds.push([
      Math.round(seeds[i][0] / scaling), // the interface is multiplied, so to go back to original size, devide
      Math.round(seeds[i][1] / scaling)
    ]);
  }

  // var COMPILED_GCODE = startRepRapGcode(printer_settings.speed, printer_settings.layerHeight);
  var COMPILED_GCODE = startRepRapGcode(printer_settings.speed, printer_settings.layerHeight);

  // Step 1: Building the actual layers from the construction 'layers'
  var layersData = [];
  for(var i = 0; i < construction_layers.length; i++) {
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
  console.log("layersdata.length: "+layersData.length);
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
    x:20,
    y:20
  };
  for (var i = 0; i < layersData.length; i++) {
    console.log("layer: "+i);
    var layerIncrementCode = layerIncrement(layersData[i].speed, i+1, layersData[i].name, printer_settings.layerHeight);
    COMPILED_GCODE += layerIncrementCode;
    COMPILED_GCODE += "\r\n";
    for (var j = 0; j < layersData[i].components.length; j++) {
      if(layersData[i].components[j] == "contour_outline") {
        var compiledOutline = compilePolygonOutline(scaledContour,
          print_extrusion,
          printer_settings,
          current_position
        );
        COMPILED_GCODE += compiledOutline.printCode;
        print_extrusion = compiledOutline.ext;
        current_position = compiledOutline.last_position;

      } else if(layersData[i].components[j] == "contour_fill") {
        console.log("contour fill");
        var compiledContourFill = compilePolygonFill(slicedContour,
          print_extrusion,
          printer_settings,
          current_position
        );
        COMPILED_GCODE += compiledContourFill.printCode;
        print_extrusion = compiledContourFill.ext;
        current_position = compiledContourFill.last_position;

      } else if(layersData[i].components[j] == "cells_outline") {
        console.log("cells outline");
        for(var cell_counter = 0; cell_counter < sole_cells.length; cell_counter++ ) {
          var compiledCellOutline = compilePolygonOutline(sole_cells[cell_counter],
            print_extrusion,
            printer_settings,
          current_position);
          COMPILED_GCODE += compiledCellOutline.printCode;
          print_extrusion = compiledCellOutline.ext;
          current_position = compiledCellOutline.last_position;

        }
      } else if(layersData[i].components[j] == "cells_fill") {
        console.log("cells fill");
        for (var cell_counter = 0; cell_counter < sliced_cells.length; cell_counter++ ) {
          console.log("filling cell: "+cell_counter);
            console.log("start print ext: "+print_extrusion);
          var compiledCellFill = compilePolygonFill(sliced_cells[cell_counter],
            print_extrusion,
            printer_settings,
            current_position
          );
          COMPILED_GCODE += compiledCellFill.printCode;
          print_extrusion = compiledCellFill.ext;
          current_position = compiledCellFill.last_position;
          console.log("new print ext: "+print_extrusion);
        }
      } else if(layersData[i].components[j] == "cropped_voronoi_outline") {
        for(var cell_counter = 0; cell_counter < croppedVoronoi.length; cell_counter++ ) {
          var compiledCellOutline = compilePolygonOutline(croppedVoronoi[cell_counter],
            print_extrusion,
            printer_settings,
            current_position
          );
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

  var compiledMove = edgeMove(current_position.x,
    current_position.y,
    contour[0][0],
    contour[0][1],
    ext,
    printer_settings
  );
  returnCode += compiledMove.edgeCode;
  ext = compiledMove.ext;

  var contour_edges = points_to_edges(contour);

  for (var i = 0; i < contour_edges.length; i++) {
    var edge = contour_edges[i];
    var compiledEdge = edgeWrite(edge[0],edge[1],edge[2],edge[3], ext, printer_settings);
    returnCode += compiledEdge.edgeCode;
    ext = compiledEdge.ext;
  }
  return {
    printCode: returnCode,
    ext: ext,
    last_position: {
      x:contour_edges[contour_edges.length-1][2],
      y:contour_edges[contour_edges.length-1][3]
    }
  };
}


function compilePolygonFill(slicedContour, print_extrusion, printer_settings, current_position) {
  console.log("compile polygon fill print ext: "+print_extrusion);
  var returnCode = "";
  var ext = print_extrusion;

  console.log("moving from: "+current_position.x+" ,"+current_position.y+" to: "+slicedContour[0][0]+","+slicedContour[0][1]);
  var compiledMove = edgeMove(current_position.x,
    current_position.y,
    slicedContour[0][0],
    slicedContour[0][1],
    ext,
    printer_settings
  );
  console.log(compiledMove.edgeCode);
  returnCode += compiledMove.edgeCode;
  ext = compiledMove.ext;

  var leftRightToggle = "left"; // toggle left
  for (var i = 0; i < slicedContour.length; i++) {
    var compiledEdge;
    if(leftRightToggle == "left") {
      compiledEdge = edgeWrite(slicedContour[i][0],slicedContour[i][1],slicedContour[i][2],slicedContour[i][3],ext,printer_settings);
      leftRightToggle = "right";
    } else if (leftRightToggle == "right") {
      compiledEdge = edgeWrite(slicedContour[i][2],slicedContour[i][3],slicedContour[i][0],slicedContour[i][1],ext,printer_settings);
      leftRightToggle = "left";
    }

    returnCode += compiledEdge.edgeCode;
    ext = compiledEdge.ext;
    if(i < slicedContour.length-1) {
      var toNextEdge;
      if(leftRightToggle == "left") {
        toNextEdge = edgeWrite(slicedContour[i][2], slicedContour[i][3], slicedContour[i+1][2],slicedContour[i+1][3],ext, printer_settings);
      } else if (leftRightToggle == "right") {
        toNextEdge = edgeWrite(slicedContour[i][0], slicedContour[i][1], slicedContour[i+1][0],slicedContour[i+1][1],ext, printer_settings);
      }

      // returnCode += toNextEdge.edgeCode;
      // ext = toNextEdge.ext;
    }
  }
  return {
    printCode: returnCode,
    ext: ext,
    last_position: {
      x: slicedContour[slicedContour.length-1][2],
      y: slicedContour[slicedContour.length-1][3]
    }
  };
}

function layerIncrement(speed, currentLayer, name, layerHeight) {
  return "G0 F"+speed+" Z"+(currentLayer*layerHeight)+" ;layer: "+name;
}

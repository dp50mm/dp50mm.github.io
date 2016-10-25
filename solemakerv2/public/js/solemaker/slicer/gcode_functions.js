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
  returnCode += "G0 F"+speed+" Z"+layerHeight;
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
  returnCode += "G0 F"+speed+" Z"+layerHeight;
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
  returnCode += ";CURA_PROFILE_STRING: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";
  returnCode += "\r\n";
  return returnCode;
}


function edgeWrite(startX, startY, endX, endY, print_extrusion, printer_settings) {
  var returnCode = "";
  //var L = 4;
  //var R = 2;
  var ext = print_extrusion + distance(startX, startY, endX, endY)*printer_settings.extrusionCoefficient;
  if(startX > 0.05*printer_settings.DPMM) {
    var start_x = startX/printer_settings.DPMM // Math.floor((startX/printer_settings.DPMM)*printer_settings.GCode_rounding)/printer_settings.GCode_rounding;
    var start_y = startY/printer_settings.DPMM // Math.floor((startY/printer_settings.DPMM)*printer_settings.GCode_rounding)/printer_settings.GCode_rounding;
    var start_e = print_extrusion // Math.floor(((ext-printer_settings.retraction)/printer_settings.DPMM)*printer_settings.GCode_rounding)/printer_settings.GCode_rounding;
    var end_x = endX/printer_settings.DPMM // Math.floor((endX/printer_settings.DPMM)*printer_settings.GCode_rounding)/printer_settings.GCode_rounding;
    var end_y = endY/printer_settings.DPMM // Math.floor((endY/printer_settings.DPMM)*printer_settings.GCode_rounding)/printer_settings.GCode_rounding;
    var end_e = ext // Math.floor((ext / printer_settings.DPMM)*printer_settings.GCode_rounding)/printer_settings.GCode_rounding;

    returnCode += "G1 X "+start_x.toFixed(printer_settings.GCode_rounding)+" Y "+start_y.toFixed(printer_settings.GCode_rounding)+" E "+start_e.toFixed(printer_settings.GCode_rounding)+"; edge start";
    returnCode += "\r\n";
    returnCode += "G1 X "+end_x.toFixed(printer_settings.GCode_rounding)+" Y "+end_y.toFixed(printer_settings.GCode_rounding)+" E "+end_e.toFixed(printer_settings.GCode_rounding)+"; edge end";
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
  if(true) { // THERE WAS A DISTANCE CHECK HERE BUT NO IDEA WHY
    var start_x = startX/printer_settings.DPMM; // Math.floor((startX/printer_settings.DPMM)*printer_settings.GCode_rounding)/printer_settings.GCode_rounding;
    var start_y = startY/printer_settings.DPMM; // Math.floor((startY/printer_settings.DPMM)*printer_settings.GCode_rounding)/printer_settings.GCode_rounding;
    var start_e = ext - 2; // Math.floor(((ext-printer_settings.retraction)/printer_settings.DPMM)*printer_settings.GCode_rounding)/printer_settings.GCode_rounding;
    var end_x = endX/printer_settings.DPMM; // Math.floor((endX/printer_settings.DPMM)*printer_settings.GCode_rounding)/printer_settings.GCode_rounding;
    var end_y = endY/printer_settings.DPMM; // Math.floor((endY/printer_settings.DPMM)*printer_settings.GCode_rounding)/printer_settings.GCode_rounding;
    var end_e = ext; // Math.floor((ext / printer_settings.DPMM)*printer_settings.GCode_rounding)/printer_settings.GCode_rounding;

    returnCode += "G0 X "+start_x.toFixed(printer_settings.GCode_rounding)+" Y "+start_y.toFixed(printer_settings.GCode_rounding)+" E "+start_e.toFixed(printer_settings.GCode_rounding);
    returnCode += "\r\n";
    returnCode += "G0 X "+end_x.toFixed(printer_settings.GCode_rounding)+" Y "+end_y.toFixed(printer_settings.GCode_rounding)+" E "+end_e.toFixed(printer_settings.GCode_rounding);
    returnCode += "\r\n";
  }
  return {
    edgeCode: returnCode,
    ext: ext
  };
}

function distance(x1, y1, x2, y2) {
  var distance = Math.sqrt( (x1-x2)*(x1-x2) + (y1-y2)*(y1-y2) );
  return distance;
}

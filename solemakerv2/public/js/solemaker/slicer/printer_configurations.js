/**
 * Configuration settings for the printer
 */

var tempPIXELPITCH = 1;
var tempDPMM = 1/tempPIXELPITCH;
var printer_settings = {
  PIXELPITCH: 1,
  DPMM: 1/tempPIXELPITCH,
  ext: 0,
  speed: 600,
  layerHeight: 0.3,
  currentLayer: 0,
  extrusionCoefficient: 0.1,
  layers: 5,
  retraction: 3,
  slicedistance: 0.8 * tempDPMM,
  GCode_rounding: 2
}

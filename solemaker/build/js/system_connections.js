/**
 * Callback function to get sensordata from server
 * I am passing through the local URL '/data/test_data.json' for test data.
 * See the folder for the datastructure.
 * To make the request asynchronous I pass a callback function.
 * The callback expects that data structure from the test_data.json
 *
 */
function SoleMakerBackendConnection(URL) {
  // var URL = "SERVER URL"
  this.getSensorData = function(callback) {
    $.get(URL, function(data) {
      callback(data);
    });
  }
}

/**
 * When the user presses 'UPLOAD' in the user interface this function will be called.
 * the data object will contain the following things as attributes
 * VoronoiSeeds: [array of [x,y] points]
 * SoleOutline: [array of [x,y] points]
 * SVG: "SVG image of the sole design" STILL WORKING ON THIS ONE
 * GCode: "GCode string for the 3d printer"
 */
function SendSoleDesignAndGCode(data) {
  console.log(data);
  // Implement the send to server functionality here.
}

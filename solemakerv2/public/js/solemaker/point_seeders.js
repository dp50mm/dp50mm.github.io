/**
 * Alternates the x cell padding
 */
function cellularGridSeed(nr_rows, nr_colls, width, height, padding) {
  var returnCells = [];
  var spacingToggle = false;
  for (var y = padding; y < height - padding; y += (height-padding*2)/nr_rows) {
    spacingToggle = !spacingToggle;
    for(var x = padding; x < width - padding; x += (width-padding*2)/nr_colls) {
      if(spacingToggle) {
        returnCells.push([x, y]);
      } else {
        returnCells.push([x+((width-padding*2)/nr_colls)/2, y]);
      }

    }
  }
  // return point array
  return returnCells;
}


var preset_outline = [
  [21.40,136.69],
  [5.33,121.29],
  [0.45,100.24],
  [18.18,75.56],
  [48.05,57.51],
  [70.7,43.98],
  [122.12,13.21],
  [149.59,3.88],
  [168.33,0.78],
  [184.72,0.07],
  [199.26,1.53],
  [216.53,6.72],
  [230.11,19.56],
  [232.95,31.94],
  [228.35,47.42],
  [212.52,64.48],
  [195.59,74.94],
  [182.50,80.43],
  [168.44,84.01],
  [156.42,86.68],
  [112.01,97.62],
  [73.48,120.67],
  [42.85,137.45]
];

var yeezy_preset_outline = [
  [263,704],
  [238,702],
  [216,693],
  [197,679],
  [183,661],
  [176,641],
  [171,619],
  [171,579],
  [173,535],
  [176,497],
  [176,454],
  [168,411],
  [160,370],
  [155,333],
  [153,296],
  [159,258],
  [166,240],
  [175,218],
  [199,178],
  [231,142],
  [250,125],
  [265,117],
  [280,112],
  [298,110],
  [327,119],
  [340,128],
  [358,148],
  [367,166],
  [379,201],
  [384,236],
  [385,273],
  [384,291],
  [375,329],
  [358,366],
  [351,381],
  [344,412],
  [339,452],
  [337,479],
  [337,503],
  [338,524],
  [342,546],
  [347,569],
  [351,592],
  [352,611],
  [350,633],
  [343,653],
  [330,676],
  [308,693],
  [287,701]
];

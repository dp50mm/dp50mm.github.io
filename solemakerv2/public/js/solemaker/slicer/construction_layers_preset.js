/**
 * Construction layers is editable in the UI
 */
var construction_layers = [{
  components:["cells_fill","contour_outline","cells_outline"],
  name:"bottom layer",
  count:1,
  speed:600,
  order:1
},{
  components:["cells_fill","contour_outline","cells_outline"],
  name:"sole padding layer",
  count:49,
  speed:600,
  order:2
},{
  components:["contour_outline","contour_fill"],
  name:"middle structure layer",
  count: 5,
  speed:600,
  order: 3
},{
  components:["contour_outline","cropped_voronoi_outline"],
  name:"voronoi pattern",
  count:15,
  speed:600,
  order: 4
},{
  components:["contour_outline"],
  name:"top wall",
  count:35,
  speed:600,
  order: 5
}];

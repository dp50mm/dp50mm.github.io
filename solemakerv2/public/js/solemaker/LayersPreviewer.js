var LayersPreview = React.createClass({
  getPathCode(d) {
    return d ? "M" + d.join("L") + "Z" : null;
  },
  render: function() {
    var layersData = [];
    for(var i = 0; i < this.props.layers.length; i++) {
      for (var j = 0; j < this.props.layers[i].count; j++) {
        layersData.push({
          name: this.props.layers[i].name,
          components: this.props.layers[i].components,
          i_increment: i,
          j_increment: j
        });
      }
    }
    var layers = layersData.map(function(layer, index) {
      var style = {
        top: layersData.length * 0.5 - index * 0.5
      }
      var contourPath;
      var contourFill;
      var cellPaths;
      var voronoiOutline;
      for(var component in layer.components) {
        if(layer.components[component] == "contour_outline") {

          contourPath = (
            <path d={this.getPathCode(this.props.contour)} className="contour-outline-preview" />
          );
        }
        if(layer.components[component] == "cells_outline") {
          cellPaths = (
            <CellPathsMap sole_cells={this.props.sole_cells} />
          );
        }
        if(layer.components[component] == "cells_fill") {
          var abc = "100";
        }
        if(layer.components[component] == "cropped_voronoi_outline") {
          voronoiOutline = (
            <CellPathsMap sole_cells={this.props.voronoi_cells} />
          );
        }
        if(layer.components[component] == "contour_fill") {
          contourFill = (
            <path d={this.getPathCode(this.props.contour)} className="contour-fill-preview" />
          );
        }
      }
      return (
        <div className='layer-preview' key={index}>
          <svg className="layer-preview-svg" width="200px" height="200px" style={style} >
            {contourPath}
            {contourFill}
            {cellPaths}
            {voronoiOutline}
          </svg>
          <div className='layer-preview-labels' style={style}>
            <p>name: {layer.name}</p>
          </div>
        </div>
      );
    }, this);
    return (
      <div className='layers-preview'>
        {layers}
      </div>
    );
  }
});


var CellPathsMap = React.createClass({
  render: function() {
    var cellPaths = this.props.sole_cells.map(function(cell, index) {
      return (
        <path d={getPathCode(cell)} className='cell-outline-preview' key={index} />
      );
    }, this);
    return (
      <g>
      {cellPaths}
      </g>
    );
  }
});

function getPathCode(d) {
  return d ? "M" + d.join("L") + "Z" : null;
}

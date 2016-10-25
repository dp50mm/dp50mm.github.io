var LayerEditor = React.createClass({
  getInitialState: function() {
    return {
      layers: this.props.layers
    };
  },
  updateCount: function(index, new_count) {
    var layers = this.state.layers;
    layers[index].count = new_count;
    this.setState({
      layers: layers
    });
    this.props.updatePreviewLayers();
  },
  updateSpeed: function(index, new_speed) {
    var layers = this.state.layers;
    layers[index].speed = new_speed;
    this.setState({
      layers: layers
    });
    this.props.updatePreviewLayers();
  },
  render: function() {
    var layers = this.props.layers.map(function(layer, index) {
      return (
        <PrintLayer layer={layer} key={index} index={index} updateCount={this.updateCount} updateSpeed={this.updateSpeed} />
      );
    }, this);
    return (
      <div className={"layer-editor "+this.props.visibility}>
      {layers}
      </div>
    );
  }
});

var PrintLayer = React.createClass({
  updateCount: function(event) {
    this.props.updateCount(this.props.index ,event.target.value);
  },
  updateSpeed: function(event) {
    this.props.updateSpeed(this.props.index, event.target.value);
  },
  render: function() {
    return (
      <div className='print-layer'>
      <h3>{this.props.layer.name}</h3>
      <p>
        <span>count:</span>
        <span>
          <input type="number" value={this.props.layer.count} onChange={this.updateCount} min="0" max="1000" />
        </span>
      </p>
      <p>
        <span>speed:</span>
        <span>
          <input type="number" value={this.props.layer.speed} onChange={this.updateSpeed} min="0" max="1000" />
        </span>
      </p>
      </div>
    )
  }
})

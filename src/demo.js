// Style
function getStyle(feature) {
  return [
    new ol.style.Style({
      image: new ol.style.RegularShape({
        fill: new ol.style.Fill({ color: [0, 0, 255, 0.4] }),
        stroke: new ol.style.Stroke({ color: [0, 0, 255, 1], width: 1 }),
        radius: 10,
        points: 3,
        angle: feature.get("angle") || 0,
      }),
      fill: new ol.style.Fill({ color: [0, 0, 255, 0.4] }),
      stroke: new ol.style.Stroke({ color: [0, 0, 255, 1], width: 1 }),
    }),
  ];
}

const DEMO_LAYER_NAME = "Demolayer";

function clearDemoLayer() {
  map.getLayers().forEach(layer => {
    if (layer.get('name') === DEMO_LAYER_NAME) map.removeLayer(layer);
  });
}

function displayDemoLayer() {
  clearDemoLayer();

  const vector = new ol.layer.Vector({
    name: DEMO_LAYER_NAME,
    source: new ol.source.Vector({ wrapX: false }),
    style: getStyle,
  });

  map.addLayer(vector);

  vector.getSource().addFeature(
    new ol.Feature(
      new ol.geom.Polygon([
        [
          [34243, 6305749],
          [-288626, 5757848],
          [210354, 5576845],
          [300000, 6000000],
          [34243, 6305749],
        ],
      ])
    )
  );
  vector.getSource().addFeature(
    new ol.Feature(
      new ol.geom.LineString([
        [406033, 5664901],
        [689767, 5718712],
        [699551, 6149206],
        [425601, 6183449],
      ])
    )
  );
  vector
    .getSource()
    .addFeature(new ol.Feature(new ol.geom.Point([269914, 6248592])));

  vector
    .getSource()
    .addFeature(
      new ol.Feature(new ol.geom.Circle([500000, 6400000], 100000))
    );


  map.getView().setCenter([261720, 5951081]);
}



$('#myFile').change(function () {
  Array.from(this.files).map(file => {
    const permit_ext = ".geojson";

    if (file && !file.name.endsWith(permit_ext)) {
      alert("現在 .geojson ファイルのみ対応しています。")
      return
    }

    const reader = new FileReader()
    reader.onload = function (e) {
      const filename = file.name.split(permit_ext)[0];
      displayFile(filename, JSON.parse(reader.result))
    }

    reader.readAsText(file);
  });
});

const vectorLayers = [];

function displayFile(name, geojson) {
  const vectorLayer = new ol.layer.Vector({
    name: name,
    source: new ol.source.Vector({
      features: new ol.format.GeoJSON({ featureProjection: "EPSG:3857" }).readFeatures(geojson),
    }),
  });
  map.addLayer(vectorLayer);

  const firstCoordinate = vectorLayer.getSource().getFeatures()[0].getGeometry().getCoordinates()[0][0];
  map.getView().setCenter(firstCoordinate);
  vectorLayers.push(vectorLayer);
}

function download() {
  map.getLayers().forEach(layer => {
    const layerName = layer.get('name')
    if (layerName !== BASE_LAYER_NAME) {
      const features = layer.getSource().getFeatures();
      const json = new ol.format.GeoJSON().writeFeatures(features, { featureProjection: "EPSG:3857" });
      const blob = new Blob([json], { type: "application/json" });
      saveAs(blob, `edited-${layerName}.geojson`);
    }
  });
}

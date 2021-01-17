$('#myFile').change(function () {
  const file = this.files[0];
  const permit_ext = ".geojson";

  if (file && !file.name.endsWith(permit_ext)) {
    alert("現在 .geojson ファイルのみ対応しています。")
    return
  }

  const reader = new FileReader()
  reader.onload = function () {
    displayFile(JSON.parse(reader.result))
  }

  reader.readAsText(file);
});

function displayFile(geojson) {
  const vector = new ol.layer.Vector({
    name: "myFile",
    source: new ol.source.Vector({
      features: new ol.format.GeoJSON({ featureProjection: "EPSG:3857" }).readFeatures(geojson),
    }),
  });
  map.addLayer(vector);


  map.getView().setCenter(vector.getSource().getFeatures()[0].getGeometry().getCoordinates()[0]);
}

function download() {
  // console.log("clicked");
  // const currentProjection = new GeoJSON()
  //   .readProjection(vector.getSource())
  //   .getCode();
  // console.log(currentProjection);

  map.getLayers().forEach(layer => {
    const layerName = layer.get('name')
    if (layerName !== BASE_LAYER_NAME) {
      const features = layer.getSource().getFeatures();
      const json = new ol.format.GeoJSON().writeFeatures(features);
      const blob = new Blob([json], { type: "application/json" });
      saveAs(blob, `${layerName}-edited.geojson`);
    }
  });
}

import "./style.css";
import $ from "jquery";
import Map from "ol/Map";
import View from "ol/View";
import { defaults as defaultControl } from "ol/control";
import TileLayer from "ol/layer/Tile";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import XYZ from "ol/source/XYZ";
import GeoJSON from "ol/format/GeoJSON";
import { fromLonLat } from "ol/proj";
import { shiftKeyOnly, always } from "ol/events/condition";
import Transform from "ol-ext/interaction/Transform";
import { registerFileReader, downloadGeoJson } from "./file";
import { displayDemoLayer } from "./demo";

const BASE_LAYER_NAME = "BASE_LAYER";

const map = new Map({
  target: "map",
  layers: [
    new TileLayer({
      source: new XYZ({
        url: "https://cyberjapandata.gsi.go.jp/xyz/seamlessphoto/{z}/{x}/{y}.jpg",
        attributions:
          'Map data © <a href="https://maps.gsi.go.jp/development/ichiran.html">地理院タイル</a>',
        maxZoom: 18,
      }),
      properties: {
        name: BASE_LAYER_NAME,
      },
    }),
  ],
  view: new View({
    center: fromLonLat([135, 35]),
    zoom: 5,
  }),
  controls: defaultControl(),
});

const interaction = new Transform({
  enableRotatedTransform: false,
  /* Limit interaction inside bbox * /
condition: function(e, features) {
  return ol.extent.containsXY([-465960, 5536486, 1001630, 6514880], e.coordinate[0], e.coordinate[1]);
},
/* */
  addCondition: shiftKeyOnly,
  // filter: function(f,l) { return f.getGeometry().getType()==='Polygon'; },
  // layers: [vector],
  hitTolerance: 2,
  translateFeature: true,
  scale: $("#scale").prop("checked"),
  rotate: $("#rotate").prop("checked"),
  keepAspectRatio: $("#keepAspectRatio").prop("checked") ? always : undefined,
  translate: true,
  stretch: $("#stretch").prop("checked"),
});
map.addInteraction(interaction);

function setHandleStyle() {
  if (!(interaction instanceof Transform)) return;
  interaction.setDefaultStyle();
  interaction.set("translate", interaction.get("translate"));
}

// Style handles
setHandleStyle();
// Events handlers
let startangle = 0;
let d = [0, 0];

// Handle rotate on first point
let firstPoint = false;

interaction.on("select", (e) => {
  if (firstPoint && e.features && e.features.getLength()) {
    interaction.setCenter(
      // @ts-expect-error
      e.features.getArray()[0].getGeometry().getFirstCoordinate()
    );
  }
});
interaction.on("rotatestart", (e) => {
  startangle = e.feature.get("angle") ?? 0;
});
interaction.on("translatestart", (_e) => {
  d = [0, 0];
});
interaction.on("rotating", (e) => {
  $("#info").text(
    "rotate: " + ((((e.angle * 180) / Math.PI - 180) % 360) + 180).toFixed(2)
  );
  // Set angle attribute to be used on style !
  e.feature.set("angle", startangle - e.angle);
});
interaction.on("translating", (e) => {
  d[0] += e.delta[0];
  d[1] += e.delta[1];
  $("#info").text("translate: " + d[0].toFixed(2) + "," + d[1].toFixed(2));
  if (firstPoint) {
    const coordinate = e.features
      .getArray()[0]
      .getGeometry()
      // @ts-expect-error
      ?.getFirstCoordinate();
    interaction.setCenter(coordinate);
  }
});
interaction.on("scaling", (e) => {
  $("#info").text(
    "scale: " + e.scale[0].toFixed(2) + "," + e.scale[1].toFixed(2)
  );
  if (firstPoint) {
    const coordinate = e.features
      .getArray()[0]
      .getGeometry()
      // @ts-expect-error
      ?.getFirstCoordinate();
    interaction.setCenter(coordinate);
  }
});
interaction.on(["rotateend", "translateend", "scaleend"], (_e) => {
  $("#info").text("");
});

$<HTMLInputElement>("#scale").on("change", () => {
  const value = $("#scale").prop("checked");
  interaction.set("scale", value);
  $("#stretch").prop("disabled", !value);
});

["stretch", "rotate", "enableRotatedTransform"].forEach((id) => {
  const value = $("#" + id).prop("checked");
  interaction.set(id, value);
});

$<HTMLInputElement>("#keepAspectRatio").on("change", () => {
  const value = $("#keepAspectRatio").prop("checked");
  if (value) {
    interaction.set("keepAspectRatio", always);
  } else {
    interaction.set("keepAspectRatio", (e: any) => {
      return e.originalEvent.shiftKey;
    });
  }
});

$("#rotate-objects").on("click", () => {
  firstPoint = false;
  interaction.setCenter(undefined);
});
$("#rotate-center").on("click", () => {
  firstPoint = false;
  interaction.setCenter(map.getView().getCenter());
});
$("#rotate-first-point").on("click", () => {
  firstPoint = true;
});

$("#demo").on("click", () => {
  displayDemoLayer(map);
});

$("#all_select").on("click", () => {
  const layersFeatures = map
    .getLayers()
    .getArray()
    .filter((layer) => layer.get("name") !== BASE_LAYER_NAME)
    .map((layer) => {
      // @ts-expect-error
      return layer.getSource().getFeatures();
    });

  // @ts-expect-error
  interaction.setSelection(layersFeatures.flat());
});

$("#clear").on("click", () => {
  map.getLayers().forEach((layer) => {
    if (layer.get("name") !== BASE_LAYER_NAME) map.removeLayer(layer);
  });
});

$("#download").on("click", () => {
  map.getLayers().forEach((layer) => {
    const layerName = layer.get("name") ?? "unknown";
    if (layerName !== BASE_LAYER_NAME) {
      // @ts-expect-error
      const features = layer.getSource().getFeatures();
      const geojson = new GeoJSON().writeFeatures(features, {
        featureProjection: "EPSG:3857",
      });
      downloadGeoJson(geojson, `edited-${layerName}.geojson`);
    }
  });
});

registerFileReader("#files", (filename, geojson) => {
  const vectorLayer = new VectorLayer({
    source: new VectorSource({
      features: new GeoJSON({
        featureProjection: "EPSG:3857",
      }).readFeatures(geojson),
    }),
    properties: {
      name: filename,
    },
  });
  map.addLayer(vectorLayer);

  const extent = vectorLayer.getSource()?.getExtent();
  const size = map.getSize();
  if (extent && !extent.some((v) => Number.isNaN(v)) && size) {
    map.getView().fit(extent, { size, padding: [100, 100, 100, 100] });
  }
});

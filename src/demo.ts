import type Map from "ol/Map";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import Feature from "ol/Feature";
import { Style, RegularShape, Fill, Stroke } from "ol/style";
import { Polygon, LineString, Point, Circle } from "ol/geom";

const DEMO_LAYER_NAME = "DEMO_LAYER";

export const clearDemoLayer = (map: Map) => {
  map.getLayers().forEach((layer) => {
    if (layer.get("name") === DEMO_LAYER_NAME) {
      map.removeLayer(layer);
    }
  });
};

export const displayDemoLayer = (map: Map) => {
  clearDemoLayer(map);

  const vector = new VectorLayer({
    properties: {
      name: DEMO_LAYER_NAME,
    },
    source: new VectorSource({ wrapX: false }),
    style: (feature) => {
      return [
        new Style({
          image: new RegularShape({
            fill: new Fill({ color: [0, 0, 255, 0.4] }),
            stroke: new Stroke({ color: [0, 0, 255, 1], width: 1 }),
            radius: 10,
            points: 3,
            angle: feature.get("angle") || 0,
          }),
          fill: new Fill({ color: [0, 0, 255, 0.4] }),
          stroke: new Stroke({ color: [0, 0, 255, 1], width: 1 }),
        }),
      ];
    },
  });

  map.addLayer(vector);

  vector.getSource()!.addFeature(
    new Feature(
      new Polygon([
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
  vector.getSource()!.addFeature(
    new Feature(
      new LineString([
        [406033, 5664901],
        [689767, 5718712],
        [699551, 6149206],
        [425601, 6183449],
      ])
    )
  );
  vector.getSource()!.addFeature(new Feature(new Point([269914, 6248592])));

  vector
    .getSource()!
    .addFeature(new Feature(new Circle([500000, 6400000], 100000)));

  map.getView().setCenter([261720, 5951081]);
};

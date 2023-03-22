import $ from "jquery";
import { saveAs } from "file-saver";

export const registerFileReader = (
  inputElementQuerySelector: string,
  callback: (filename: string, geojson: any) => void
) => {
  $<HTMLInputElement>(inputElementQuerySelector).on("change", ({ target }) => {
    if (!(target.files?.length && target.files?.length > 0)) return;

    Array.from(target.files).map((file) => {
      const permitExt = ".geojson";
      if (!file.name.endsWith(permitExt)) {
        alert("現在 .geojson ファイルのみ対応しています。");
        return;
      }

      const reader = new FileReader();
      reader.onload = (_e) => {
        const filename = file.name.split(permitExt)[0];
        if (typeof reader.result === "string") {
          callback(filename, JSON.parse(reader.result));
        }
      };

      reader.readAsText(file);
    });
  });
};

export const downloadGeoJson = (geojson: any, filename: string) => {
  const blob = new Blob([geojson], { type: "application/json" });
  saveAs(blob, filename);
};

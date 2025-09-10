import powerbi from "powerbi-visuals-api";

export interface VanHeatmapSettings {
    markerColor: string;
    markerSize: number;
    vanSide: "front" | "back" | "left" | "right" | "roof";
}

export class VisualSettings {
    public markers: VanHeatmapSettings = {
        markerColor: "#FF0000", // Default red
        markerSize: 10,
        vanSide: "front"
    };

    /**
     * Populate settings from DataView
     */
    public static fromDataView(dataView: powerbi.DataView | undefined): VisualSettings {
        const settings = new VisualSettings();

        if (!dataView || !dataView.metadata?.objects) return settings;

        const objs = dataView.metadata.objects;

        if (objs["markers"]) {
            const markersObj = objs["markers"] as powerbi.DataViewObject;

            settings.markers.markerColor = String(markersObj["markerColor"] ?? settings.markers.markerColor);
            settings.markers.markerSize = Number(markersObj["markerSize"] ?? settings.markers.markerSize);
            settings.markers.vanSide = String(markersObj["vanSide"] ?? settings.markers.vanSide) as VanHeatmapSettings["vanSide"];
        }

        return settings;
    }
}

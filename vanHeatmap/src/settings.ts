import powerbi from "powerbi-visuals-api";

export interface VanHeatmapSettings {
    markerSize: number;
    markerColor: string;       // default fallback color
    customColors: string[];    // array of custom colors
}

export class VisualSettings {
    public markers: VanHeatmapSettings = {
        markerColor: "#FF0000", // default red
        markerSize: 10,
        customColors: []         // empty array by default
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

            // If customColors exists in objects, ensure it's an array
            if (markersObj["customColors"] && Array.isArray(markersObj["customColors"])) {
                settings.markers.customColors = markersObj["customColors"].map(c => String(c));
            }
        }

        return settings;
    }
}

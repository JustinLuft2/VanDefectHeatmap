import * as d3 from "d3";
import { VisualSettings } from "./settings";
import powerbi from "powerbi-visuals-api";
import "./style/visual.less";

export interface DefectData {
    x: number;
    y: number;
    type: string;
}

// --- CUSTOMIZABLE SETTINGS ---
const CUSTOM_SETTINGS = {
    maxColors: 10, // max number of colors to use (D3 category10 is 10)
    markerSize: 4, // default dot size in pixels
    manualColors: { // manually map defect types to colors
        "Scratch": "#FF0000",
        "Dent": "#0000FF",
        "Crack": "#00FF00"
        // Add more defect types here
        //RUN pbiviz package to build
    }
};
// -------------------------------

export class Visual implements powerbi.extensibility.visual.IVisual {
    private target: HTMLElement;
    private settings: VisualSettings;
    private svg: d3.Selection<SVGSVGElement, unknown, null, undefined>;
    private image: d3.Selection<SVGImageElement, unknown, null, undefined>;
    private width: number;
    private height: number;

    constructor(options: powerbi.extensibility.visual.VisualConstructorOptions) {
        this.target = options.element;
        this.width = this.target.clientWidth || 500;
        this.height = this.target.clientHeight || 500;

        this.svg = d3.select(this.target)
            .append("svg")
            .attr("width", "100%")
            .attr("height", "100%")
            .attr("viewBox", `0 0 ${this.width} ${this.height}`)
            .style("display", "block")
            .style("background", "none");

        const defs = this.svg.append("defs");
        const glowFilter = defs.append("filter").attr("id", "glow");
        glowFilter.append("feGaussianBlur").attr("stdDeviation", 6).attr("result", "blur");
        glowFilter.append("feMerge")
            .selectAll("feMergeNode")
            .data(["blur", "SourceGraphic"])
            .enter()
            .append("feMergeNode")
            .attr("in", d => d);

        this.image = this.svg.append("image")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", this.width)
            .attr("height", this.height)
            .attr("preserveAspectRatio", "xMidYMid meet")
            .style("opacity", 0)
            .on("load", () => console.log("Van image loaded!"))
            .on("error", () => console.error("Failed to load van image!"));
    }

    public update(options: powerbi.extensibility.visual.VisualUpdateOptions) {
        if (!options.dataViews || !options.dataViews[0]) return;

        this.width = this.target.clientWidth || 500;
        this.height = this.target.clientHeight || 500;
        this.svg.attr("viewBox", `0 0 ${this.width} ${this.height}`);
        this.image.attr("width", this.width).attr("height", this.height);

        this.settings = VisualSettings.fromDataView(options.dataViews[0]);

        const categorical = options.dataViews[0].categorical;
        const categories = categorical?.categories || [];

        if (categories.length < 3) return;

        const xValues = categories[0].values;
        const yValues = categories[1].values;
        const typeValues = categories[2].values;

        const defects: DefectData[] = xValues.map((xVal: any, i: number) => ({
            x: Number(xVal) || 0,
            y: Number(yValues[i]) || 0,
            type: String(typeValues[i] ?? "Unknown")
        }));

        // --- Combine manual colors with D3 palette ---
        const defectTypes = Array.from(new Set(defects.map(d => d.type)));
        const defaultColors = d3.schemeCategory10.slice(0, CUSTOM_SETTINGS.maxColors);
        const colorScale = d3.scaleOrdinal<string>()
            .domain(defectTypes)
            .range(defectTypes.map(type => CUSTOM_SETTINGS.manualColors[type] ?? defaultColors.shift() ?? "#888888"));

        // --- Draw markers ---
        const markers = this.svg.selectAll<SVGCircleElement, DefectData>("circle")
            .data(defects, (_d, i) => i);

        markers.exit().remove();

        markers.enter()
            .append("circle")
            .merge(markers)
            .attr("cx", d => (d.x / 100) * this.width)
            .attr("cy", d => (d.y / 100) * this.height)
            .attr("r", CUSTOM_SETTINGS.markerSize) // use customizable size
            .attr("fill", d => colorScale(d.type))
            .attr("fill-opacity", 0.6)
            .attr("stroke", "#000")
            .attr("stroke-opacity", 0.15)
            .attr("filter", "url(#glow)");
    }
}

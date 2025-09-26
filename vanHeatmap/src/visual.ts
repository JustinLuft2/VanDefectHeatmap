import * as d3 from "d3";
import { VisualSettings } from "./settings";
import powerbi from "powerbi-visuals-api";
import "./style/visual.less";

export interface DefectData {
    x: number; // x coordinate as % of image width (0–100)
    y: number; // y coordinate as % of image height (0–100)
}

export class Visual implements powerbi.extensibility.visual.IVisual {
    private target: HTMLElement;
    private settings: VisualSettings;
    private svg: d3.Selection<SVGSVGElement, unknown, null, undefined>;

    private width: number;
    private height: number;

    constructor(options: powerbi.extensibility.visual.VisualConstructorOptions) {
        this.target = options.element;

        this.width = this.target.clientWidth || 500;
        this.height = this.target.clientHeight || 500;

        // --- Create SVG container ---
        this.svg = d3.select(this.target)
            .append("svg")
            .attr("width", "100%")
            .attr("height", "100%")
            .attr("viewBox", `0 0 ${this.width} ${this.height}`)
            .style("display", "block")
            .style("background", "none"); // transparent background

        // --- Define glow filter for heatmap dots ---
        const defs = this.svg.append("defs");
        const glowFilter = defs.append("filter").attr("id", "glow");
        glowFilter.append("feGaussianBlur")
            .attr("stdDeviation", 6)
            .attr("result", "blur");
        glowFilter.append("feMerge")
            .selectAll("feMergeNode")
            .data(["blur", "SourceGraphic"])
            .enter()
            .append("feMergeNode")
            .attr("in", d => d);
    }

    public update(options: powerbi.extensibility.visual.VisualUpdateOptions) {
        console.log("Updating visual...");

        if (!options.dataViews || !options.dataViews[0]) {
            console.warn("No data view available.");
            return;
        }

        // --- Update container size ---
        this.width = this.target.clientWidth || 500;
        this.height = this.target.clientHeight || 500;
        this.svg.attr("viewBox", `0 0 ${this.width} ${this.height}`);

        // --- Get current settings ---
        this.settings = VisualSettings.fromDataView(options.dataViews[0]);

        // --- Extract X and Y values ---
        const categorical = options.dataViews[0].categorical;
        const categories = categorical?.categories || [];

        if (categories.length < 2) {
            console.warn("Expected 2 category fields (x, y), found:", categories.length);
            return;
        }

        const xValues = categories[0].values;
        const yValues = categories[1].values;

        // --- Map defects row-by-row ---
        const defects: DefectData[] = xValues.map((xVal: any, i: number) => {
            const x = Number(xVal);
            const y = Number(yValues[i]);
            if (isNaN(x) || isNaN(y)) {
                console.warn(`Invalid defect at index ${i}: x=${xVal}, y=${yValues[i]}`);
            }
            return { x: isNaN(x) ? 0 : x, y: isNaN(y) ? 0 : y };
        });

        console.log("Defects parsed:", defects);

        // --- Compute density per point for heatmap effect ---
        const radius = 12; // neighborhood radius for density
        const densities = defects.map((d, i) => {
            let count = 0;
            defects.forEach((other, j) => {
                if (i !== j) {
                    const dx = d.x - other.x;
                    const dy = d.y - other.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < radius) count++;
                }
            });
            return count;
        });

        // --- Color scale using classic heatmap YlOrRd ---
        const colorScale = d3.scaleSequential(d3.interpolateYlOrRd)
            .domain([0, d3.max(densities) || 1]);

        // --- Bind data to circles ---
        const markers = this.svg.selectAll<SVGCircleElement, DefectData>("circle")
            .data(defects, (_d, i) => i);

        markers.exit().remove();

        markers.enter()
            .append("circle")
            .merge(markers)
            .attr("cx", d => (d.x / 100) * this.width)
            .attr("cy", d => (d.y / 100) * this.height)
            .attr("r", this.settings.markers.markerSize * 0.4) // small fixed size
            .attr("fill", (_d, i) => colorScale(densities[i]))
            .attr("fill-opacity", 0.6)
            .attr("stroke", "#ff6b00") // subtle halo
            .attr("stroke-opacity", 0.15)
            .attr("filter", "url(#glow)"); // glow/aura
    }
}

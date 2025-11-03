import * as d3 from "d3";
import powerbi from "powerbi-visuals-api";
import "./style/visual.less";

export interface DefectData {
    x: number; // % of image width (0–100)
    y: number; // % of image height (0–100)
}

export class Visual implements powerbi.extensibility.visual.IVisual {
    private target: HTMLElement;
    private svg: d3.Selection<SVGSVGElement, unknown, null, undefined>;
    private width: number;
    private height: number;

    // === 🔧 CUSTOMIZATION SECTION ===
    // You can tweak all heatmap appearance settings here.
    private config = {
        markerSize: 6,          // Dot radius in px 
        markerOpacity: 0.75,     // Dot fill opacity (0–1)
        glowSize: 6,            // Strength of glow blur
        densityRadius: 12,      // Radius used for local density
        colorMin: "#ffffb2",    // Color for low-density (light yellow)
        colorMax: "#bd0026",    // Color for high-density (dark red)
        strokeColor: "#ff6b00", // Optional halo/stroke color
        strokeOpacity: 0.15     // Stroke transparency
    };
    // ================================

    constructor(options: powerbi.extensibility.visual.VisualConstructorOptions) {
        this.target = options.element;

        // Use container dimensions or default 500×500
        this.width = this.target.clientWidth || 500;
        this.height = this.target.clientHeight || 500;

        // Create scalable SVG canvas
        this.svg = d3.select(this.target)
            .append("svg")
            .attr("width", "100%")
            .attr("height", "100%")
            .attr("viewBox", `0 0 ${this.width} ${this.height}`)
            .style("display", "block")
            .style("background", "none");

        // --- Define reusable glow filter ---
        const defs = this.svg.append("defs");
        const glow = defs.append("filter").attr("id", "glow");
        glow.append("feGaussianBlur")
            .attr("stdDeviation", this.config.glowSize) // controlled via config
            .attr("result", "blur");
        glow.append("feMerge")
            .selectAll("feMergeNode")
            .data(["blur", "SourceGraphic"])
            .enter()
            .append("feMergeNode")
            .attr("in", d => d);
    }

    public update(options: powerbi.extensibility.visual.VisualUpdateOptions) {
        if (!options.dataViews || !options.dataViews[0]) return;

        // Update viewbox if container resized
        this.width = this.target.clientWidth || 500;
        this.height = this.target.clientHeight || 500;
        this.svg.attr("viewBox", `0 0 ${this.width} ${this.height}`);

        const categorical = options.dataViews[0].categorical;
        const categories = categorical?.categories || [];
        if (categories.length < 2) return;

        const xValues = categories[0].values;
        const yValues = categories[1].values;

        // --- Parse (x, y) points into objects ---
        const defects: DefectData[] = xValues.map((xVal: any, i: number) => {
            const x = Number(xVal);
            const y = Number(yValues[i]);
            return { x: isNaN(x) ? 0 : x, y: isNaN(y) ? 0 : y };
        });

        // --- Calculate local density (simple proximity count) ---
        const radius = this.config.densityRadius;
        const densities = defects.map((d, i) => {
            let count = 0;
            defects.forEach((other, j) => {
                if (i !== j) {
                    const dx = d.x - other.x;
                    const dy = d.y - other.y;
                    if (Math.sqrt(dx * dx + dy * dy) < radius) count++;
                }
            });
            return count;
        });

        // --- Color scale: low density → high density ---
        const colorScale = d3.scaleLinear<string>()
            .domain([0, d3.max(densities) || 1])
            .range([this.config.colorMin, this.config.colorMax]);

        // --- Update glow blur dynamically (if config changed) ---
        this.svg.select("#glow feGaussianBlur")
            .attr("stdDeviation", this.config.glowSize);

        // --- Bind data to circles ---
        const markers = this.svg.selectAll<SVGCircleElement, DefectData>("circle")
            .data(defects, (_d, i) => i);

        markers.exit().remove();

        markers.enter()
            .append("circle")
            .merge(markers)
            .attr("cx", d => (d.x / 100) * this.width)
            .attr("cy", d => (d.y / 100) * this.height)
            .attr("r", this.config.markerSize)
            .attr("fill", (_d, i) => colorScale(densities[i]))
            .attr("fill-opacity", this.config.markerOpacity)
            .attr("stroke", this.config.strokeColor)
            .attr("stroke-opacity", this.config.strokeOpacity)
            .attr("filter", "url(#glow)");
    }
}

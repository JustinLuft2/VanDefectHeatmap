# VanHeatmap – Power BI Custom Heatmap Visual

A simple Power BI custom visual that shows defect points as a heatmap.

## Features

* Heatmap of defects using colored dots.
* Dot size, color, and glow are configurable.
* Density-based coloring.
* Ready to use with GitHub Actions.

## Installation

1. Run the **GitHub Action** to build the visual.
2. After the workflow finishes, go to the `VisualDownload` folder.
3. Import the `.pbiviz` file into Power BI:

   * Visualizations → Import a visual → Import from file
   * Select `VisualDownload/HeatMap_Installation(<version>).pbiviz`

## Usage

* Prepare a dataset with `x` and `y` as percentages (0–100).
* Add the visual to your Power BI report.
* Map `x` → X-axis, `y` → Y-axis.

## Configuration

All settings are in `visual.ts` under `config`:

* `markerSize` – Dot radius in pixels.
* `markerOpacity` – Dot transparency.
* `glowSize` – Blur around dots.
* `densityRadius` – Radius for density calculation.
* `colorMin` / `colorMax` – Low/high density colors.
* `strokeColor` / `strokeOpacity` – Optional dot stroke.

## Contributing

* Fork the repo, make changes, test locally with Power BI Desktop, then submit a pull request.

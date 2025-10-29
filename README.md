# VanHeatmap – Power BI Custom Heatmap Visual

![VanHeatmap Logo](vanHeamap/assets/icon2.png)

A **custom Power BI visual** that displays a heatmap of defects across images or layouts, ideal for tracking and visualizing defect density in manufacturing, logistics, or quality inspection scenarios.

---

## Table of Contents

* [Features](#features)
* [Installation](#installation)
* [Usage](#usage)
* [Configuration](#configuration)
* [Development](#development)
* [Contributing](#contributing)
* [License](#license)

---

## Features

* Heatmap visualization of defect points (`x`, `y`) overlaid on an image.
* Color intensity corresponds to **local defect density**.
* Configurable **dot size**, **glow**, and **color scale**.
* Responsive and scalable SVG canvas.
* Fully automated **GitHub Actions workflow** for building and publishing the visual.

---

## Installation

### Using PBIVIZ File

1. Clone or download the repository.
2. Build the PBIVIZ package (if you want latest version):

```bash
cd vanHeatmap
pbiviz package
```

3. Import the generated `.pbiviz` file into Power BI:

* Go to **Visualizations → Import a visual → Import from file**
* Select `VisualDownload/HeatMap_Installation(<version>).pbiviz`

---

## Usage

1. Prepare a dataset with **x** and **y** columns (percentage of image width and height).
2. Add the VanHeatmap visual to your Power BI report.
3. Map your columns:

* `x` → X-axis (%)
* `y` → Y-axis (%)

4. The visual automatically calculates **density** and displays colored dots.

---

## Configuration

All heatmap settings are defined in `visual.ts` under the `config` object:

| Property        | Description                             | Default |
| --------------- | --------------------------------------- | ------- |
| `markerSize`    | Radius of each dot (px)                 | 8       |
| `markerOpacity` | Dot fill transparency (0–1)             | 0.6     |
| `glowSize`      | Strength of glow blur                   | 6       |
| `densityRadius` | Neighbor radius for density calculation | 12      |
| `colorMin`      | Color for low-density areas             | #ffffb2 |
| `colorMax`      | Color for high-density areas            | #bd0026 |
| `strokeColor`   | Optional dot stroke color               | #ff6b00 |
| `strokeOpacity` | Dot stroke opacity (0–1)                | 0.15    |

> You can tweak these values to adjust the look of the heatmap.

---

## Development

### Prerequisites

* Node.js >= 16
* Power BI Visuals Tools:

```bash
npm install -g powerbi-visuals-tools
```

### Building

```bash
npm install
pbiviz package
```

### Running Locally

Power BI custom visuals are built as PBIVIZ files and cannot run standalone in a browser. Use **Power BI Desktop** to test.

### CI/CD Workflow

* The repository includes a **GitHub Actions workflow** (`.github/workflows/build.yml`) that:

  * Increments install count
  * Builds PBIVIZ
  * Updates `VisualDownload` folder with the latest PBIVIZ
  * Uploads PBIVIZ artifact for backup

---

## Contributing

1. Fork the repository.
2. Make changes in a new branch.
3. Test PBIVIZ build locally.

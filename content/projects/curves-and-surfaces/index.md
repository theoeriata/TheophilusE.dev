---
featured: true
featuredWeight: 5
projectType: "Computational geometry"
shortTitle: "Curves & Surfaces"
technologies: ["C++", "Tessellation", "Geometry"]
title: "Curves, Surfaces, and Tessellation"
date: 2026-03-24
tags: ["Project", "C++", "OpenGL", "Computer Graphics", "Curves", "Surfaces", "Tessellation"]
author: ["Theophilus Eriata"]
description: "An interactive curve and surface editor/viewer implementing Bezier curves, B-splines, surfaces of revolution, and tensor-product surfaces using OpenGL tessellation."
summary: "Implements a full curve and surface modeling tool with GPU tessellation, interactive editing, orbit camera controls, and multiple rendering modes."
cover:
    image: "images/banner.png"
    alt: "Game Banner."
    relative: true
editPost:
  URL: "https://github.com/theoeriata/CurvesAndSurfaces"
  Text: "GitHub Repository"
showToc: true
---

## Overview

Interactive curves and surfaces viewer/editor with OpenGL tessellation.

{{< youtube QNrbqCRxhrY >}}

## Features

- 2D curve editor with interactive control points.
- Bezier curve rendering (De Casteljau in tessellation evaluation).
- Cubic B-spline subdivision curve mode.
- 3D orbit viewer with perspective and orthographic projections.
- Surface of revolution generated from the current B-spline profile.
- Tensor-product surface from a non-square control grid.
- Optional tensor fractal terrain variation.

## Development Environment

- Windows 11 with MSVC (Visual Studio Build Tools) and CMake.
- Fedora Linux with g++ and CMake.

## Build and Run

This project uses CMake and can be built from the workspace root.

### Windows (PowerShell)

```powershell
cmake -S . -B build
cmake --build build --config Debug
.\build\surfaces.exe
```

### Fedora Linux (bash)

```bash
cmake -S . -B build
cmake --build build
./build/surfaces
```

If a build directory already exists, only the `cmake --build build` step is needed for rebuilds.

## Core Controls

- `V`: Toggle 2D editor / 3D viewer.
- `C` or `Tab`: Toggle Bezier / B-spline.
- `B`: Bezier mode.
- `S`: B-spline mode.
- `Up` / `Down`: Increase / decrease subdivision level.
- `R`: Reset control points and camera settings.

## 2D Editor Controls

- Left click empty space: Add control point.
- Left click point: Select point.
- Left drag selected point: Move point.
- Right click point: Delete point.
- Middle drag: Pan camera.
- Mouse wheel: Zoom camera.

## 3D Viewer Controls

- Left drag: Orbit camera.
- Mouse wheel:
  - Perspective mode: Change orbit distance.
  - Orthographic mode: Change orthographic scale.
- `M`: Cycle 3D object:
  - Curve
  - Surface of revolution
  - Tensor surface
- `W`: Toggle wireframe for surfaces.
- `X`: Toggle angular coloring on revolution surface.
- `N`: Toggle tensor fractal noise.

## ImGui Parameters

- Projection:
  - Perspective FOV, near, far.
  - Orthographic scale, near, far.
- Tessellation:
  - Curve tessellation level.
  - Surface tessellation U and V levels.
- Terrain:
  - Noise amplitude.
  - Noise decay.

## Tessellation Design Notes

### Curves (Part I/II)

Curve rendering is generated in a tessellation pipeline using `GL_PATCHES` with an isoline tessellation evaluation shader. In Bezier mode, the tessellation evaluation shader runs a De Casteljau interpolation directly on patch control points at parameter `t = gl_TessCoord.x`, so no CPU curve sampling is used for final curve rasterization. In B-spline mode, the CPU provides a refined control polyline from the subdivision process and tessellation generates the final curve geometry by interpolating along that polyline in the tessellation evaluation stage. The tessellation control shader sets an outer tessellation level that is user-adjustable from ImGui, allowing smoothness control without changing draw topology.

Bezier and B-spline use separate tessellation shader paths: Bezier uses a variable-size control-point patch and De Casteljau evaluation in TES, while B-spline uses fixed 2-point segment patches and linear segment evaluation in TES. Both paths are driven by the same curve tessellation level control from ImGui.

### Surface Of Revolution (Part III)

The surface of revolution is rendered through tessellation quads by drawing two-point profile segment patches and evaluating rotation in the tessellation evaluation shader. For each tessellated sample, the shader interpolates the segment in `v`, computes an angle in `u`, and rotates the radius around the y-axis to produce the final 3D position. This keeps revolution geometry generation on the GPU and minimizes CPU pre-processing to profile segmentation only. Angle-based color visualization is also applied in shader space so the sweep seam remains clear and continuous.

### Tensor Product Surface (Part IV)

The tensor-product surface uses CPU subdivision masks to refine the 2D control grid (quadratic in `u`, cubic in `v`) and then submits quad corner patches to tessellation. The tessellation evaluation shader generates final geometry per patch using bilinear interpolation over `gl_TessCoord.xy`, so rasterized triangles are produced from tessellated quads on the GPU. This approach preserves the mask-based subdivision model while moving final surface triangulation to tessellation shaders. Separate `u` and `v` tessellation level controls are exposed in ImGui to visualize refinement density interactively.

---
featured: true
featuredWeight: 2
projectType: "Graphics programming"
shortTitle: "CPU Ray Tracing"
technologies: ["C++17", "Ray tracing", "Multithreading"]
title: "CPU Ray Tracing"
date: 2026-04-24
tags: ["Project", "C++", "OpenGL", "Ray Tracing", "CPU Rendering", "Computer Graphics", "Multithreading", "Recursive Shading", "Geometry", "Rendering Engine"]
author: ["Theophilus Eriata"]
description: "A multithreaded interactive CPU ray tracer implementing analytic geometry, recursive reflections and refractions, Phong shading with shadows, and a responsive dual‑mode renderer with real‑time camera controls."
summary: "A C++17 CPU ray tracer featuring pinhole‑camera ray generation, sphere/cylinder/triangle intersections, recursive lighting, Schlick Fresnel blending, shadow rays, async render worker, and interactive vs. full‑quality render modes. The CPU computes the image; OpenGL presents the result."
cover:
    image: "images/banner.png"
    alt: "Game Banner."
    relative: true
editPost:
  URL: "https://github.com/theoeriata/CpuRayTracing"
  Text: "GitHub Repository"
showToc: true
---

## Overview

This repository contains an interactive CPU ray tracer. The implementation demonstrates classic ray-tracing techniques and a number of usability and performance features (async worker renderer, responsive interactive mode, and a contest-quality scene with animation).

{{< youtube 8A1dy_-qMlQ >}}

## Highlights

- Pinhole camera with configurable vertical field-of-view (FOV) and aspect-correct ray generation.
- Analytic geometry: ray-sphere and finite, capped ray-cylinder intersections.
- Triangle meshes and plane primitives for scene construction.
- Phong lighting with shadows (shadow rays + bias to avoid self-intersections).
- Recursive reflections and refractions (Snell's law) with Schlick/Fresnel blending.
- Multithreaded asynchronous render worker with request/response serials and cancellation.
- Interactive (coarse) mode while moving and full-quality rendering after the camera settles.
- Fly-camera controls, mouse-look, fullscreen/resize robustness, and an advanced Scene 3 with an animated spinning glass cube.

{{< gallery match="images/*.png" sortOrder="desc" rowHeight="150" margins="5" thumbnailResizeOptions="600x600 q90 Lanczos" showExif=true previewType="blur" embedPreview=true loadJQuery=true >}}

## Build (Windows / CMake)

Requirements: CMake (3.16+), a C++17-capable toolchain (MSVC/Visual Studio recommended), OpenGL development headers. The repository includes the third-party libraries under `thirdparty/` for convenience.

Recommended build (PowerShell / Developer Prompt):

```powershell
cmake -S . -B build -A x64
cmake --build build --config Release
# Run the produced binary (Release or Debug as built)
.\build\Release\CpuRayTracing
```

Or build Debug:

```powershell
cmake --build build --config Debug
.\build\Debug\CpuRayTracing
```

## Running & Controls

- `W` / `S` / `A` / `D` : Move forward / back / left / right
- `R` / `F` : Move up / down
- Arrow keys : Turn (yaw/pitch)
- `Tab` : Toggle mouse lock (when locked, mouse-look is active)
- Right mouse (hold) : Mouse-look when unlocked
- Left mouse : Re-lock mouse (when unlocked)
- `[` / `]` : Decrease / increase vertical FOV
- `1`, `2`, `3` : Switch scenes
- `C` : Reset camera
- `Q` : Quit
- `Esc` : Unlock mouse
- Hold `Shift` : Increase movement speed

## Render modes

- Interactive mode: coarse sampling (pixel stepping), few or zero bounces, shadows disabled, used while the camera is moving for responsiveness.
- Full-quality mode: per-pixel sampling, higher bounce limits, shadows enabled, produced once the camera has been idle for a short settle time.

## Implementation notes

- Camera: pinhole ray generation with vertical FOV and aspect correction to produce perspective rays from the camera eye.
- Geometry: analytic ray-sphere intersection, finite capped cylinder intersection with cap tests, and triangle meshes for arbitrary shapes.
- Shading: Phong lighting model for local shading, shadow rays determine whether a surface sees the light or gets ambient-only shading.
- Reflection & refraction: recursive ray tracing with depth limit, refractive indices, Snell's law, and Schlick's Fresnel approximation are used to mix reflection and transmission.
- Multithreading: a single worker thread consumes `RenderRequest` jobs and produces `RenderResult`s, serial numbers enable cancellation of stale work.
- Responsiveness: the scheduler issues interactive frames frequently while input is active, and transitions to full-quality frames after a settle timeout.

## References

1. Phong, B.-T. "Illumination for Computer Generated Pictures" (1975) - Phong reflection model used for local shading.
2. Schlick, C. "An Inexpensive BRDF Model for Physically-Based Rendering" (1994) - Schlick's approximation for Fresnel reflectance.
3. Pharr, M., Jakob, W., & Humphreys, G. "Physically Based Rendering: From Theory to Implementation" - comprehensive reference for physically-based rendering concepts.
4. Shirley, P. "Ray Tracing in One Weekend" series - practical ray tracing tutorials and implementation patterns.
5. Standard optics resources for Snell's law and refraction-based derivations.
6. Common computational-geometry references for analytic ray-sphere and ray-cylinder intersection formulas.

## Third-party libraries

- GLFW - https://www.glfw.org/
- GLAD - https://glad.dav1d.de/
- GLM - https://glm.g-truc.net/
- stb (single-file headers) - https://github.com/nothings/stb
- ImGui - https://github.com/ocornut/imgui
- fmt - https://fmt.dev/  (local patch applied for MSVC compatibility)

## Notes & Known issues

- The repository contains a small local patch to `thirdparty/fmt-7.0.3` to address MSVC/C++17 compatibility, see that folder for details.
- You may see compiler warnings (e.g., C4244) coming from third-party headers depending on compilation flags, these are non-blocking.

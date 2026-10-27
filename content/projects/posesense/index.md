---
featured: true
featuredWeight: 6
projectType: "Computer vision"
shortTitle: "PoseSense"
technologies: ["Python", "TypeScript", "Pose estimation"]
title: "PoseSense: Real-Time Human Pose & Gesture Recognition"
date: 2025-11-11
tags: ["Project", "Machine Learning", "Computer Vision", "Real-Time Systems", "Python", "TypeScript"]
author: ["Theophilus Eriata"]
description: "PoseSense is a real-time human pose and gesture recognition system with a Python inference backend and a TypeScript visualization frontend."
summary: "A practical system for streaming, processing, and visualizing human pose data using deep learning, quaternion processing, and a web-based 3D skeleton viewer."
editPost:
  URL: "https://github.com/theoeriata/PoseSense"
  Text: "GitHub Repository"
showToc: true
disableAnchoredHeadings: false
---

## Overview

PoseSense is a real-time human pose and gesture recognition system built with a Python backend and a TypeScript/Vite frontend. The project focuses on accurate pose extraction, quaternion processing, and live visualization of skeletal motion. It serves as a foundation for gesture‑driven interaction, motion analysis, or real‑time character control.

## Features

### Real-Time Pose Estimation
The backend runs a deep learning model to extract human joint rotations in real time. It streams pose data over a lightweight API for immediate use in the frontend.

### Quaternion Processing & Retargeting
PoseSense converts raw joint quaternions into *bone‑local rotations*, enabling consistent retargeting to rigs such as Y‑Bot. This involves quaternion normalization, parent‑child transform reconstruction, and interpolation matching between backend and frontend.

### Web-Based 3D Visualization
The frontend uses TypeScript and a modern build pipeline (Vite) to render a live 3D skeleton, with support for streaming pose updates, rig visualization, and debugging of joint transforms.

## Technical Stack

### Backend
- Python  
- FastAPI  
- Deep learning pose estimation model  
- Quaternion math utilities  
- Real-time streaming  

### Frontend
- TypeScript  
- Vite  
- 3D model rendering (Three.js‑style pipeline)  
- Skeleton visualization  

## License

This project is licensed under the MIT License. See the [LICENSE](https://github.com/theoeriata/PoseSense/blob/Development/LICENSE) file for details.

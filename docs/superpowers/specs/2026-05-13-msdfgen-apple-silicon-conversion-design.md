---
name: msdfgen-apple-silicon-conversion
description: Convert msdfgen from Windows x86 to native Apple Silicon using CMake
metadata:
  type: project
---

# Design Spec: msdfgen Apple Silicon Conversion

## Overview
The goal is to enable the `msdfgen` tool to be compiled and executed natively on Apple Silicon (ARM64) macOS. Currently, the project relies on Microsoft Visual Studio solution files (`.sln`) and Windows-specific binaries.

## Architecture

### Build System Transition
- **From:** Visual Studio (`.sln`) $\rightarrow$ Windows x86.
- **To:** CMake $\rightarrow$ Native macOS ARM64.

### Components
- **Core Logic:** The C++ source in `msdfgen/core` and `msdfgen/ext` remains unchanged as it is standard C++.
- **Dependencies:**
  - **FreeType:** Required for font loading. Will be sourced from the system (Homebrew) rather than the bundled `msdfgen/include/freetype`.
  - **zlib:** Required by FreeType. Will be sourced from the system.

### Build Pipeline
1. **Prerequisites:** User installs `cmake` and `freetype` via Homebrew.
2. **Configuration:** `cmake -B build -S .` (configures the project for the current host architecture).
3. **Compilation:** `cmake --build build` (compiles the source into a native ARM64 executable).

## Implementation Details

### CMake Configuration
A new `CMakeLists.txt` will be implemented in `msdfgen/` with the following requirements:
- Set C++ standard to at least C++11.
- Locate `FreeType` using `find_package(Freetype REQUIRED)`.
- Add all source files from `core/*.cpp` and `ext/*.cpp`.
- Create an executable target `msdfgen`.

### Cleanup
- Keep `.sln` and `.vcxproj` files for backward compatibility with Windows users, but move them out of the primary build path.
- Add `build/` to `.gitignore`.

## Success Criteria
- The command `cmake --build build` completes without errors on an M1 Pro.
- The resulting binary is identified as `arm64` via the `file` command.
- The tool successfully generates MSDF fonts from SVG/TTF sources on macOS.

# WebGPU Demo

A demo that uses WebGPU to ping-pong compute shader to simulate some random-walking rainbow "worms", then uses SDF raymarching to render them. Built in TypeScript and WGSL on top of Vite and React.

For the experiment I wanted to use SDF raymarching, but also use compute, so I started playing with the idea of worms as a sort of complex particle system, feeding into an SDF raymarching fragment shader.

The number of worms is a compile-time constant, so changing it will destroy the compute buffers and reset the simulation. The constraint against more worms is the performance of the fragment shader. This could be optimised by more efficiently discarding pixels where there are no worms.

The ping-pong compute shader structure came from an initial idea that the worms would avoid each other or flock, though I decided not to implement that behaviour in this experiment. The compute could then just use one buffer, as each worm calculation is independent.

Live demo here: https://alecmce.com/webgpu.


## References

* [3D SDFs](https://iquilezles.org/articles/distfunctions/)
* [3D SDF Analytic Normals](https://iquilezles.org/articles/distgradfunctions2d/)
* [Compute Shaders](https://webgpufundamentals.org/webgpu/lessons/webgpu-compute-shaders-histogram.html)
* [Toon Shading Tutorial](https://roystan.net/articles/toon-shader/)
* [Particles Simulation](https://webgpu.github.io/webgpu-samples/?sample=particles#main.ts)

# WebGPU Demo

A demo that uses WebGPU to ping-pong compute shader to simulate some random-walking rainbow "worms", then uses SDF raymarching to render them. Built
in TypeScript and WGSL on top of Vite and React.

For the experiment I wanted to use SDF raymarching, but also use compute, so I started playing with the idea of worms as a sort of complex particle system, feeding into an SDF raymarching fragment shader.

There are only 20 worms in the simunlation, fixed as this is a compile-time constant. The constraint is in the fragment shader, which could be optimised by a variety of methods.

The ping-pong compute shader structure came from an initial idea that the worms would avoid each other or flock, though I decided not to implement that behaviour in this experiment. The compute could then just use one buffer, as each worm calculation is independent.

Live demo here: https://alecmce.com/webgpu.

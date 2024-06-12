struct Worms {
  data: array<Worm>
}

// https://webgpufundamentals.org/webgpu/lessons/resources/wgsl-offset-computer.html#x=5d00000100e600000000000000003d888b0237284d3025f2381bcb288b3dbea07e420280ae88594419ea49c4928d81813f2a452e8df8e9abc3ededcadb77c42ce361c08d2a46c1c2cbe260b03865ecaea1ed38a09cb354e933f9f3d6187fa7a5032a0806c4e770bbd697d676d1091f72fd18bb78698ba56e25647ed851ba8c6cd377b3ddb3f4605a773d87b7d8170310aff10f55cffcf9d45f7e071e1d81339c9adc0df886e6a811281671fff3e66d01
struct Worm {
  positions: array<vec3<f32>, 3>,
  chain:     array<vec2<f32>, 5>,
  color:     vec3<f32>,
  radius:    f32,
}

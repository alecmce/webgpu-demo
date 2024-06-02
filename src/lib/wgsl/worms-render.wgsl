const BAILOUT = 2.0;
const EPSILON = 0.001;
const ORIGIN = vec4<f32>(0.0, 0.0, 0.0, 1.0);

struct Uniforms {
  scene_view_matrix: mat4x4<f32>,
  light:           vec3<f32>,
  background:      vec3<f32>,
  size:            vec2<f32>,
  fov:             f32,
  smooth_union:    f32,
};

@group(0) @binding(0) var<uniform> uniforms: Uniforms;
@group(0) @binding(1) var<storage, read> worms: Worms;

fn sdfScene(point: vec3<f32>) -> Sdf {
  var sdf = getWormSdf(point, worms.data[0]);
  for (var i: u32 = 1; i < WORMS_COUNT; i++) {
    let next = getWormSdf(point, worms.data[i]);
    sdf = mixSdfs(sdf, next, MIX_SMOOTH_UNION, uniforms.smooth_union);
  }
  return sdf;
}

fn getWormSdf(point: vec3<f32>, worm: Worm) -> Sdf {
  let curve = BezierCurve(worm.color, worm.positions[0], worm.positions[1], worm.positions[2], worm.radius);
  return sdfBezier(point, curve);
}

const VERTICES = array<vec2f, 4>(
  vec2<f32>(-1, -1),
  vec2<f32>(-1,  1),
  vec2<f32>( 1, -1),
  vec2<f32>( 1,  1),
);

@vertex
fn vs_main(@builtin(vertex_index) vertexIndex : u32) -> ScreenPosition {
  let settings = ScreenSettings(uniforms.size[0], uniforms.size[1], uniforms.fov);
  return getScreenPosition(settings, VERTICES[vertexIndex]);
}


@fragment
fn fs_main(screen: ScreenPosition) -> @location(0) vec4<f32> {
  let origin = (uniforms.scene_view_matrix * ORIGIN).xyz;
  let direction = normalize(uniforms.scene_view_matrix * (screen.camera - ORIGIN)).xyz;
  return rayMarching(Ray(origin, direction, OUTPUT_COLOR));
}

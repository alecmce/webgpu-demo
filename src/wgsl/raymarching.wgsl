const MAX_STEPS = 128;
const BREAK_DISTANCE = 100;

struct Ray {
  origin:      vec3<f32>,
  direction:   vec3<f32>,
  output_type: u32,
}

const OUTPUT_NORMALS = 1;
const OUTPUT_COLOR = 2;

fn rayMarching(ray: Ray, background: vec3<f32>, light: vec3<f32>) -> vec4<f32> {
  var length = 0.0;
  for (var step = 0; step < MAX_STEPS; step++) {
    let point = ray.origin + ray.direction * length;

    let sdf = sdfScene(point);
    if (sdf.distance < EPSILON) {
      return process(ray, sdf, point, light);
    }

    length += sdf.distance;
    if (length > BREAK_DISTANCE) {
      break;
    }
  }

  return vec4<f32>(background, 1.0);
}

fn process(ray: Ray, sdf: Sdf, point: vec3<f32>, light: vec3<f32>) -> vec4<f32> {
  switch (ray.output_type) {
    case OUTPUT_NORMALS: {
      return vec4<f32>(abs(sdf.normal), 1.0);
    }
    default: {
      var shading = ToonShading(sdf.color, 0.8, 0.3, point, sdf.normal, light, ray.direction);
      return vec4<f32>(toonShading(shading), 1);
    }
  }
}

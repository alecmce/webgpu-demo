const SMOOTH_STEP = 0.01;
const RIM_AMOUNT = 0.7;
const RIM_THRESHOLD = 0.5;

struct ToonShading {
  color:        vec3<f32>,
  lighten:      f32,
  darken:       f32,
  point:        vec3<f32>,
  normal:       vec3<f32>,
  light:        vec3<f32>,
  rayDirection: vec3<f32>,
};

fn toonShading(shading: ToonShading) -> vec3<f32> {
  let lightColor = brighten(shading.color, shading.lighten);
  let darkColor = darken(shading.color, shading.darken);

  let angle = dot(normalize(shading.light - shading.point), shading.normal);
  let light = lightShading(shading, angle);
  let color = mix(darkColor, shading.color, smoothstep(-SMOOTH_STEP, SMOOTH_STEP, angle));

  return mix(color, lightColor, light);
}

fn lightShading(shading: ToonShading, angle: f32) -> f32 {
  return toonSpecular(shading) + rimShading(shading, angle);
}

fn toonSpecular(shading: ToonShading) -> f32 {
  let blinnPhong = dot(normalize(shading.light - shading.point * 2), shading.normal);
  let specular = pow(clamp(blinnPhong, 0.0, 1.0), 170.0) * 0.6;
  return smoothstep(SMOOTH_STEP / 2, SMOOTH_STEP, specular);
}

fn rimShading(shading: ToonShading, angle: f32) -> f32 {
  let rimDot = 1.0 - dot(-shading.rayDirection, shading.normal);
  let rimIntensity = rimDot * pow(angle, RIM_THRESHOLD);
  return smoothstep(RIM_AMOUNT - SMOOTH_STEP, RIM_AMOUNT + SMOOTH_STEP, rimIntensity);
}

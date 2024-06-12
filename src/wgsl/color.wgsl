fn brighten(color: vec3<f32>, factor: f32) -> vec3<f32> {
  let hsl = rgb2hsl(color);
  let lightness = clamp(mix(hsl.z, 1.0, factor), 0.0, 1.0);
  return hsl2rgb(vec3<f32>(hsl.x, hsl.y, lightness));
}

fn darken(color: vec3<f32>, factor: f32) -> vec3<f32> {
  let hsl = rgb2hsl(color);
  let lightness = clamp(mix(hsl.z, 0.0, factor), 0.0, 1.0);
  return hsl2rgb(vec3<f32>(hsl.x, hsl.y, lightness));
}

// From https://github.com/patriciogonzalezvivo/lygia
fn rgb2hsl(rgb: vec3<f32>) -> vec3<f32> {
  let hcv = rgb2hcv(rgb);
  let lightness = hcv.z - hcv.y * 0.5;
  let saturation = hcv.y / (1.0 - abs(lightness * 2.0 - 1.0) + 1e-10);
  return vec3<f32>(hcv.x, saturation, lightness);
}

// From https://github.com/patriciogonzalezvivo/lygia
fn rgb2hcv(rgb: vec3<f32>) -> vec3<f32> {
  var p: vec4<f32>;
  if (rgb.g < rgb.b) {
    p = vec4<f32>(rgb.bg, -1.0, 2.0/3.0);
  } else {
    p = vec4<f32>(rgb.gb, 0.0, -1.0/3.0);
  }

  var q: vec4<f32>;
  if (rgb.r < p.x) {
    q = vec4<f32>(p.xyw, rgb.r);
  } else {
    q = vec4<f32>(rgb.r, p.yzx);
  }

  let c = q.x - min(q.w, q.y);
  let h = abs((q.w - q.y) / (6.0 * c + 1e-10) + q.z);
  return vec3f(h, c, q.x);
}

// From https://github.com/patriciogonzalezvivo/lygia
fn hsl2rgb(hsl: vec3<f32>) -> vec3<f32> {
  let rgb = hue2rgb(hsl.x);
  let C = (1.0 - abs(2.0 * hsl.z - 1.0)) * hsl.y;
  return (rgb - 0.5) * C + hsl.z;
}

// From https://github.com/patriciogonzalezvivo/lygia

fn hue2rgb(hue: f32) -> vec3<f32> {
    let r = clamp(abs(hue * 6.0 - 3.0) - 1.0, 0.0, 1.0);
    let g = clamp(2.0 - abs(hue * 6.0 - 2.0), 0.0, 1.0);
    let b = clamp(2.0 - abs(hue * 6.0 - 4.0), 0.0, 1.0);
    return vec3<f32>(r, g, b);
}

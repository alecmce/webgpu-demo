const ZERO = vec3<f32>(0);

struct Sdf {
  color:    vec3<f32>,
  distance: f32,
  normal:   vec3<f32>,
};

struct Sphere {
  color:  vec3<f32>,
  center: vec3<f32>,
  radius: f32,
};

fn sdfSphere(point: vec3<f32>, sphere: Sphere) -> Sdf {
  let offset = point - sphere.center;
  let distance = length(offset) - sphere.radius;
  let normal = normalize(offset);
  return Sdf(sphere.color, distance, normal);
}

struct Box {
  color:  vec3<f32>,
  center: vec3<f32>,
  size:   vec3<f32>,
};

fn sdfBox(point: vec3<f32>, box: Box) -> Sdf {
  let offset = point - box.center;
  let q = abs(offset) - box.size / 2.0;
  let longest = max(q.x, max(q.y, q.z));
  let distance = length(max(q, ZERO)) + min(longest, 0.0);

  let normalX = select(0.0, 1.0, longest == q.x) * sign(offset.x);
  let normalY = select(0.0, 1.0, longest == q.y) * sign(offset.y);
  let normalZ = select(0.0, 1.0, longest == q.z) * sign(offset.z);
  let normal = vec3<f32>(normalX, normalY, normalZ);

  return Sdf(box.color, distance, normal);
}

const MIX_UNION = 1;
const MIX_INTERSECT = 2;
const MIX_A_MINUS_B = 3;
const MIX_B_MINUS_A = 4;
const MIX_SMOOTH_UNION = 5;

fn mixSdfs(a: Sdf, b: Sdf, mix: u32, param: f32) -> Sdf {
  switch (mix) {
    case MIX_UNION:        { return sdfUnion(a, b); }
    case MIX_INTERSECT:    { return sdfIntersect(a, b); }
    case MIX_A_MINUS_B:    { return sdfAMinusB(a, b); }
    case MIX_B_MINUS_A:    { return sdfBMinusA(a, b); }
    case MIX_SMOOTH_UNION: { return sdfSmoothUnion(a, b, param); }
    default:               { return sdfUnion(a, b); }
  }
}

fn sdfUnion(a: Sdf, b: Sdf) -> Sdf {
  if (a.distance < b.distance) {
    return a;
  } else {
    return b;
  }
}

fn sdfIntersect(a: Sdf, b: Sdf) -> Sdf {
  if (a.distance > b.distance) {
    return a;
  } else {
    return b;
  }
}

fn sdfAMinusB(a: Sdf, b: Sdf) -> Sdf {
  if (a.distance > -b.distance) {
    return a;
  } else {
    return b;
  }
}

fn sdfBMinusA(a: Sdf, b: Sdf) -> Sdf {
  if (-a.distance > b.distance) {
    return a;
  } else {
    return b;
  }
}

// @see https://iquilezles.org/articles/smin/ quadratic polynomial
fn sdfSmoothUnion(a: Sdf, b: Sdf, smoothness: f32) -> Sdf {
  let k = smoothness * 4.0;
  let h = max(k - abs(a.distance - b.distance), 0.0) / k;
  let distance = min(a.distance, b.distance) - h * h * smoothness;

  let weight = (a.distance + smoothness) / (a.distance + b.distance + 2.0 * smoothness);
  let color = mix(a.color, b.color, weight);
  let normal = normalize(mix(a.normal, b.normal, weight));
  return Sdf(color, distance, normal);
}

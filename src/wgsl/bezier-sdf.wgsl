// Ported from https://www.shadertoy.com/view/ldj3Wh

// The MIT License
// Copyright © 2013 Inigo Quilez
// Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions: The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software. THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

// Intersecting quadratic Bezier segments in 3D. Used Microsoft's paper as
// pointed out by tayholliday in https://www.shadertoy.com/view/XsX3zf. Since
// 3D quadratic Bezier segments are planar, the 2D version can be used to compute
// the distance to the 3D curve.

struct BezierCurve {
  color:  vec3<f32>,
  a:      vec3<f32>,
  b:      vec3<f32>,
  c:      vec3<f32>,
  radius: f32,
};

// @see https://www.shadertoy.com/view/ltXSDB
fn sdfBezier(point: vec3<f32>, curve: BezierCurve) -> Sdf {
  let a = curve.b - curve.a;
  let b = curve.a - 2.0 * curve.b + curve.c;
  let c = a * 2.0;
  let d = curve.a - point;

  let kk = 1.0 / dot(b, b);
  let kx = kk * dot(a, b);
  let ky = kk * (2.0 * dot(a, a) + dot(d, b)) / 3.0;
  let kz = kk * dot(d,a);

  var res: vec2<f32>;

  let p = ky - kx * kx;
  let p3 = p * p * p;
  let q = kx * (2.0 * kx * kx - 3.0 * ky) + kz;
  let q2 = q*q;
  var h = q2 + 4.0 * p3;

  // if h (discriminant) is positive, find real roots cubic polynomial using quadratic formula...
  if(h >= 0.0) {
    h = sqrt(h);
    var x = (vec2(h, -h) - q) / 2.0;

    // When p≈0 and p<0, h-q has catastrophic cancelation. So, we do h=√(q²+4p³)=q·√(1+4p³/q²)=q·√(1+w) instead.
    // Now we approximate √ by a linear Taylor expansion into h≈q(1+½w) so that the q's cancel each other in h-q.
    // Expanding and simplifying further we get x=vec2(p³/q,-p³/q-q). And using a second degree Taylor expansion instead:
    // x=vec2(k,-k-q) with k=(1-p³/q²)·p³/q
    if(abs(p) < 0.001) {
      let k = (1.0 - p3 / q2) * p3 / q; // quadratic approx
      x = vec2(k, -k - q);
    }

    let uv = sign(x) * pow(abs(x), vec2(1.0 / 3.0));
    let t = clamp(uv.x + uv.y - kx, 0, 1);

    res = vec2(dot2(d + (c + b * t) * t), t);

  // ...or if h (discriminant) is negative, find roots on the complex plane and project them back to the real line.
  } else {
    let z = sqrt(-p);
    let m = cos_acos_3(q / (p * z * 2.0));
    let n = sqrt(1.0 - m * m) * 1.732050808;
    let t = vec3<f32>(m + m, -n - m, n - m) * z - kx;
    let tx = clamp(t.x, 0, 1);
    let ty = clamp(t.y, 0, 1);

    // 3 roots, but only need two
    var dis = dot2(d + (c + b * tx) * tx);
    res = vec2(dis, tx);
    dis = dot2( d + (c + b * ty) * ty);

    if (dis < res.x) {
      res = vec2(dis, ty);
    }
  }

  let distance = sqrt(res.x) - curve.radius;
  let position = bezier(curve, res.y);
  let normal = normalize(point - position);

  return Sdf(curve.color, distance, normal);
}

// b(t) = (1-t)^2*A + 2(1-t)t*B + t^2*C
fn bezier(curve: BezierCurve, t: f32) -> vec3<f32> {
  let s = 1.0 - t;
  return s * s * curve.a + 2.0 * s * t * curve.b + t * t * curve.c;
}

fn dot2(v: vec3<f32>) -> f32 {
  return dot(v, v);
}

// cos(acos(x)/3) @see https://www.shadertoy.com/view/WltSD7
fn cos_acos_3(x: f32) -> f32 {
  let y = sqrt(0.5 + 0.5 * x);
  return y * (y * (y * (y * -0.008972 + 0.039071) - 0.107074) + 0.576975) + 0.5;
}

const LINK_DISTANCE = 1.0;
const PERIMETER = 30.0;
const PI = 3.14159265359;
const UP = vec3<f32>(0.0, 1.0, 0.0);

struct Parameters {
  delta_time:     f32,
  delta_rotation: f32,
  exaggeration:   f32,
  speed:          f32,
  seed:           vec4<f32>,
}

@binding(0) @group(0) var<uniform>             parameters: Parameters;
@binding(1) @group(0) var<storage, read>       readWorms:  Worms;
@binding(2) @group(0) var<storage, read_write> writeWorms: Worms;

@compute @workgroup_size(64)
fn simulate(@builtin(global_invocation_id) global_invocation_id: vec3<u32>) {
  let index = global_invocation_id.x;
  let delta_time = parameters.delta_time;
  let speed = parameters.speed * parameters.delta_time;
  let delta_rotation = parameters.delta_rotation * speed;

  init_rand(index, parameters.seed);

  let worm = readWorms.data[index];
  let chain = update_chain(worm, delta_rotation);
  let positions = update_positions(worm, chain, speed);

  writeWorms.data[index] = Worm(positions, chain, worm.color, worm.radius);
}

fn update_chain(worm: Worm, delta_rotation: f32) -> array<vec2<f32>, 5> {
  let current_position = worm.positions[0];
  let current_direction = worm.chain[4];
  let new_direction = get_new_direction(current_position, current_direction, delta_rotation);
  return array<vec2<f32>, 5>(worm.chain[1], worm.chain[2], worm.chain[3], worm.chain[4], new_direction);
}

fn get_new_direction(current_position: vec3<f32>, current_direction: vec2<f32>, delta_rotation: f32) -> vec2<f32> {
  let needs_change = needs_perimeter_change(current_position, current_direction);
  let random_change = vec2<f32>((rand() - 0.5) * delta_rotation, (rand() - 0.5) * delta_rotation);
  let perimeter_change = get_perimeter_change(current_direction, delta_rotation);
  return current_direction + mix(random_change, perimeter_change, needs_change);
}

fn needs_perimeter_change(current_position: vec3<f32>, current_direction: vec2<f32>) -> f32 {
  let parallelness = dot(normalize(current_position), spherical_to_cartesian(current_direction));
  let towards_perimeter = step(0.0, parallelness);
  let distance_from_perimeter = cubic_in(clamp(length(current_position) / PERIMETER, 0.0, 1.0));
  return towards_perimeter * distance_from_perimeter;
}

fn cubic_in(p: f32) -> f32 {
  return p * p * p;
}

fn get_perimeter_change(current_direction: vec2<f32>, delta_rotation: f32) -> vec2<f32> {
  let theta = current_direction[0];
  let phi = current_direction[1];

  let current_cartesian = spherical_to_cartesian(current_direction);
  let rotation_axis = normalize(cross(current_cartesian, UP));
  let rotation_quaternion = quaternion_from_axis_and_angle(rotation_axis, radians(-delta_rotation));
  let new_cartesian = rotate_vector(rotation_quaternion, current_cartesian);

  return cartesian_to_spherical(new_cartesian);
}

fn positive_mod(value: f32, limit: f32) -> f32 {
  return (value % limit + limit) % limit;
}

fn update_positions(worm: Worm, chain: array<vec2<f32>, 5>, speed: f32) -> array<vec3<f32>, 3> {
  let head = update_head(worm, chain, speed);

  let link_4 = head - spherical_to_cartesian(chain[4]) * LINK_DISTANCE;
  let link_3 = link_4 - spherical_to_cartesian(chain[3]) * LINK_DISTANCE;
  let link_2 = link_3 - spherical_to_cartesian(chain[2]) * LINK_DISTANCE;
  let link_1 = link_2 - spherical_to_cartesian(chain[1]) * LINK_DISTANCE;
  let link_0 = link_1 - spherical_to_cartesian(chain[0]) * LINK_DISTANCE;

  let line = Line(link_0, normalize(link_4 - link_0));
  let middle = project_point_to_line(link_2, line);
  let exaggerated_middle = middle + (link_2 - middle) * parameters.exaggeration;

  return array<vec3<f32>, 3>(head, exaggerated_middle, link_0);
}

fn update_head(worm: Worm, chain: array<vec2<f32>, 5>, speed: f32) -> vec3<f32> {
  let offset = spherical_to_cartesian(chain[4]) * speed;
  return worm.positions[0] + offset;
}

fn spherical_to_cartesian(rotation: vec2<f32>) -> vec3<f32> {
  let theta = rotation[0];
  let phi = rotation[1];
  let sin_phi = sin(phi);
  return vec3<f32>(sin_phi * sin(theta), cos(phi), sin_phi * cos(theta));
}

fn cartesian_to_spherical(cartesian: vec3<f32>) -> vec2<f32> {
  let r = length(cartesian);
  let theta = atan2(cartesian.x, cartesian.z);
  let phi = acos(cartesian.y / r);
  return vec2<f32>(theta, phi);
}

fn quaternion_from_axis_and_angle(axis: vec3<f32>, angle: f32) -> vec4<f32> {
  let half_angle = angle / 2.0;
  let sin_half_angle = sin(half_angle);
  return vec4<f32>(axis * sin_half_angle, cos(half_angle));
}

fn rotate_vector(quaternion: vec4<f32>, v: vec3<f32>) -> vec3<f32> {
  let u = vec3<f32>(quaternion.x, quaternion.y, quaternion.z);
  let s = quaternion.w;
  return 2.0 * dot(u, v) * u + (s * s - dot(u, u)) * v + 2.0 * s * cross(u, v);
}

struct Line {
  origin:    vec3<f32>,
  direction: vec3<f32>, // normalized
}

fn project_point_to_line(point: vec3<f32>, line: Line) -> vec3<f32> {
  let v = point - line.origin;
  let dot_product = dot(v, line.direction);
  return line.origin + dot_product * line.direction;
}

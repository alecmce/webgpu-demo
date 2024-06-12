const PI = 3.14159265359;
const TO_RADIANS = PI / 180.0;
const HALF = 0.5;

struct ScreenSettings {
  width:  f32,
  height: f32,
  fov:    f32,
}

struct ScreenPosition {
  @builtin(position) position: vec4<f32>,
  @location(0)       camera:   vec4<f32>,
};

fn getScreenPosition(settings: ScreenSettings, vertex: vec2<f32>) -> ScreenPosition {
  let aspectRatio = settings.width / settings.height;
  let tanFov = tan(settings.fov * TO_RADIANS / 2);

  let cameraX = (HALF / settings.width ) + vertex.x * tanFov * aspectRatio;
  let cameraY = (HALF / settings.height) + vertex.y * tanFov;

  return ScreenPosition(vec4<f32>(vertex, 0, 1), vec4<f32>(cameraX, cameraY, -1, 1));
}

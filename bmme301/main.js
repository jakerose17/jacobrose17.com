// main.js

let canvas, ctx;

// Unit translation factors
const UNIT_TRANSLATIONS = {
  eyeSize: 6, // mm to render units
  corneaRadius: 8, // mm to render units
  pupilSize: 8, // mm to render units
  lensHeight: 10, // mm to render units
  lightSourceDistance: 1, // mm to render units
};

// Default simulation parameters with unit translations applied
let simulationParams = {
  eyeSize: 35 * UNIT_TRANSLATIONS.eyeSize,
  corneaRadius: 8 * UNIT_TRANSLATIONS.corneaRadius,
  pupilSize: 4 * UNIT_TRANSLATIONS.pupilSize,
  lensHeight: 4 * UNIT_TRANSLATIONS.lensHeight,
  airIndex: 1.0003,
  corneaIndex: 1.38,
  aqueousIndex: 1.336,
  lensIndex: 1.42,
  vitreousIndex: 1.336,
  lightSourceDistance: 500 * UNIT_TRANSLATIONS.lightSourceDistance,
};

function angle(radius, height) {
  return Math.asin(height / 2 / radius);
}

function xOffset(radius, height) {
  return Math.sqrt(radius ** 2 - (height / 2) ** 2);
}

// Initialize the simulation
function init() {
  canvas = document.getElementById("simulation");
  ctx = canvas.getContext("2d", {
    alpha: true,
    antialias: true,
  });

  // Set canvas size with higher resolution
  function resizeCanvas() {
    const container = canvas.parentElement;
    const dpr = window.devicePixelRatio || 1;
    const rect = container.getBoundingClientRect();

    // Set display size (css pixels)
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;

    // Set actual size in memory (scaled for device pixel ratio)
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    // Scale context to match device pixel ratio
    ctx.scale(dpr, dpr);

    // Enable image smoothing
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    // Redraw after resize
    draw();
  }

  // Initial resize
  resizeCanvas();

  // Handle window resize
  window.addEventListener("resize", resizeCanvas);

  // Handle orientation change
  window.addEventListener("orientationchange", () => {
    setTimeout(resizeCanvas, 100);
  });

  // Set up controls
  setupControls();

  // Initial draw
  draw();
}

// Draw the eye and light rays
function draw() {
  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Enable anti-aliasing
  ctx.save();
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  // Calculate center position
  const centerX = canvas.width / (window.devicePixelRatio || 1) / 2;
  const centerY = canvas.height / (window.devicePixelRatio || 1) / 2;

  // Draw the eye components
  drawEye(centerX, centerY);

  // Draw the light rays
  drawLightRays(centerX, centerY);

  ctx.restore();
}

// Draw the eye components
function drawEye(centerX, centerY) {
  // Get parameters
  const eyeSize = simulationParams.eyeSize;
  const corneaRadius = simulationParams.corneaRadius;
  const pupilSize = simulationParams.pupilSize;
  const lensHeight = simulationParams.lensHeight;

  // Calculate key positions
  const eyeRadius = eyeSize / 2;
  const scleraOpeningAngle = (1 / 6) * Math.PI;
  const vitreousRadius = eyeRadius - 2.5;
  const retinaAngle = Math.PI * 1.5; // ~120 degrees
  const retinaRadius = vitreousRadius - 2;
  const scleraEndX = eyeRadius * -Math.cos(scleraOpeningAngle);
  const scleraEndY = eyeRadius * Math.sin(scleraOpeningAngle);
  const irisX = centerX + scleraEndX;
  const irisThickness = 4;
  const corneaArcAngle = Math.asin(scleraEndY / corneaRadius);
  const corneaCenterX = -corneaRadius * Math.cos(corneaArcAngle);
  const irisHeight = scleraEndY;
  const irisInnerRadius = pupilSize / 2;
  const lensPosition = irisX + irisThickness;
  const lensFrontRadius = lensHeight ** 1.5 * 0.2;
  const lensBackRadius = lensHeight ** 1.5 * 0.13;
  const lensFillet = 600 / lensHeight;

  // -----------------------------
  // 1. Main Eye Outline (Sclera)
  // -----------------------------
  ctx.beginPath();
  ctx.arc(
    centerX,
    centerY,
    eyeRadius,
    Math.PI + scleraOpeningAngle,
    Math.PI - scleraOpeningAngle,
  );

  ctx.lineWidth = 5;
  ctx.strokeStyle = "#edbca8";
  ctx.stroke();

  // -----------------------------
  // 2. Vitreous Chamber (fills most of the eye)
  // -----------------------------
  ctx.beginPath();
  ctx.arc(
    centerX,
    centerY,
    vitreousRadius,
    (1 + 1 / 6) * Math.PI,
    (1 - 1 / 6) * Math.PI,
  );

  // Subtle blue gradient for vitreous humor
  const vitreousGradient = ctx.createRadialGradient(
    centerX,
    centerY,
    0,
    centerX,
    centerY,
    vitreousRadius,
  );
  vitreousGradient.addColorStop(0, "#eeba9e");
  vitreousGradient.addColorStop(1, "#d04e35");

  ctx.fillStyle = vitreousGradient;
  ctx.fill();

  // -----------------------------
  // 3. Retina (back portion of the eye)
  // -----------------------------
  ctx.beginPath();
  ctx.arc(centerX, centerY, retinaRadius, -retinaAngle / 2, retinaAngle / 2);
  ctx.lineWidth = 4;
  ctx.strokeStyle = "#cc0000";
  ctx.stroke();

  // -----------------------------
  // 4. Front Components (from left to right)
  // -----------------------------

  // -----------------------------
  // 4a. Cornea (single thickness curve)
  // -----------------------------

  ctx.beginPath();
  ctx.arc(
    centerX + (scleraEndX - corneaCenterX),
    centerY,
    corneaRadius,
    Math.PI - corneaArcAngle,
    Math.PI + corneaArcAngle,
  );
  ctx.lineWidth = 4;
  ctx.strokeStyle = "#dbdde3";
  ctx.stroke();

  // -----------------------------
  // 4b. Anterior Chamber (convex shape)
  // -----------------------------
  ctx.beginPath();

  ctx.arc(
    centerX + (scleraEndX - corneaCenterX),
    centerY,
    corneaRadius - 2,
    Math.PI - corneaArcAngle,
    Math.PI + corneaArcAngle,
  );

  ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
  ctx.fill();

  // -----------------------------
  // 4c. Iris (two rectangular sections with center hole)
  // -----------------------------

  // Upper iris section
  ctx.beginPath();
  ctx.moveTo(irisX, centerY - irisHeight);
  ctx.lineTo(irisX + irisThickness, centerY - irisHeight);
  ctx.lineTo(irisX + irisThickness, centerY - irisInnerRadius);
  ctx.lineTo(irisX, centerY - irisInnerRadius);
  ctx.closePath();
  ctx.fillStyle = "#4a4a4a";
  ctx.fill();

  // Lower iris section
  ctx.beginPath();
  ctx.moveTo(irisX, centerY + irisHeight);
  ctx.lineTo(irisX + irisThickness, centerY + irisHeight);
  ctx.lineTo(irisX + irisThickness, centerY + irisInnerRadius);
  ctx.lineTo(irisX, centerY + irisInnerRadius);
  ctx.closePath();
  ctx.fillStyle = "#4a4a4a";
  ctx.fill();

  // -----------------------------
  // 4d. Lens
  // -----------------------------
  ctx.beginPath();
  // Front lens surface (left side)
  ctx.arc(
    lensPosition + lensFrontRadius,
    centerY,
    lensFrontRadius,
    Math.PI - angle(lensFrontRadius, lensHeight),
    Math.PI + angle(lensFrontRadius, lensHeight),
    false,
  );

  ctx.arc(
    lensPosition +
      lensFrontRadius -
      xOffset(lensFrontRadius, lensHeight) +
      lensFillet / 2,
    centerY - lensHeight / 2 + xOffset((1.1 * lensFillet) / 2, lensFillet),
    (1.1 * lensFillet) / 2,
    -Math.PI / 2 - angle((1.1 * lensFillet) / 2, lensFillet),
    -Math.PI / 2 + angle((1.1 * lensFillet) / 2, lensFillet),
    false,
  );

  // Back lens surface (right side)
  ctx.arc(
    lensPosition +
      lensFrontRadius -
      xOffset(lensFrontRadius, lensHeight) -
      xOffset(lensBackRadius, lensHeight) +
      lensFillet,
    centerY,
    lensBackRadius,
    -angle(lensBackRadius, lensHeight),
    angle(lensBackRadius, lensHeight),
    false,
  );

  ctx.arc(
    lensPosition +
      lensFrontRadius -
      xOffset(lensFrontRadius, lensHeight) +
      lensFillet / 2,
    centerY + lensHeight / 2 - xOffset((1.1 * lensFillet) / 2, lensFillet),
    (1.1 * lensFillet) / 2,
    Math.PI / 2 - angle((1.1 * lensFillet) / 2, lensFillet),
    Math.PI / 2 + angle((1.1 * lensFillet) / 2, lensFillet),
    false,
  );

  ctx.closePath();

  // Gradient for lens
  const lensGradient = ctx.createRadialGradient(
    lensPosition,
    centerY,
    0,
    lensPosition,
    centerY,
    lensHeight / 2,
  );
  lensGradient.addColorStop(0, "#fdfdfd");
  lensGradient.addColorStop(1, "#cbcfd7");

  ctx.fillStyle = lensGradient;
  ctx.fill();
  ctx.lineWidth = 0.5;
  ctx.strokeStyle = "rgba(200, 180, 150, 0.8)";
  ctx.stroke();
}

function drawLightRays(centerX, centerY) {
  // Get parameters
  const eyeSize = simulationParams.eyeSize;
  const eyeRadius = eyeSize / 2;
  const lightSourceDistance = simulationParams.lightSourceDistance;
  const numRays = 18; // Increased number of rays for better visualization

  // Start light rays from far left
  const startX = centerX - eyeRadius - lightSourceDistance;
  const raySpread = eyeRadius * 0.8;

  // Calculate the interval between rays
  const interval = (2 * raySpread) / (numRays - 1);

  const focusList = [];

  // Draw rays from light source
  for (let i = 0; i < numRays; i++) {
    let rayPath;
    if (lightSourceDistance > 999) {
      const startY = centerY - raySpread + i * interval;
      rayPath = calculateRayPath(startX, startY, 0, centerX, centerY);
    } else {
      const corneaY = centerY - raySpread + i * interval;
      const rayAngle = Math.asin((corneaY - centerY) / lightSourceDistance);
      rayPath = calculateRayPath(startX, centerY, rayAngle, centerX, centerY);
    }
    // -- collect the very last point of this ray --
    const lastPt = rayPath[rayPath.length - 1];
    if (lastPt[0] > centerX) {
      focusList.push(lastPt);
    }

    if (rayPath.length > 1) {
      // Draw ray path with gradient
      const gradient = ctx.createLinearGradient(
        rayPath[0][0],
        rayPath[0][1],
        rayPath[rayPath.length - 1][0],
        rayPath[rayPath.length - 1][1],
      );
      gradient.addColorStop(0, "rgba(255, 255, 0, 0.3)");
      gradient.addColorStop(1, "rgba(255, 255, 0, 0.7)");

      ctx.beginPath();
      ctx.moveTo(rayPath[0][0], rayPath[0][1]);

      for (let j = 1; j < rayPath.length; j++) {
        ctx.lineTo(rayPath[j][0], rayPath[j][1]);
      }

      ctx.strokeStyle = gradient;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Draw points at each interaction with enhanced visibility
      for (let j = 0; j < rayPath.length; j++) {
        ctx.beginPath();
        ctx.arc(rayPath[j][0], rayPath[j][1], 2, 0, 2 * Math.PI);
        ctx.fillStyle = "rgba(255, 200, 0, 0.9)";
        ctx.fill();

        // Add a subtle glow effect
        ctx.beginPath();
        ctx.arc(rayPath[j][0], rayPath[j][1], 3, 0, 2 * Math.PI);
        ctx.fillStyle = "rgba(255, 200, 0, 0.3)";
        ctx.fill();
      }
    }
  }

  // -- compute focus score from focusList --
  let focusScore = 0;
  const n = focusList.length;
  if (n === 1) {
    focusScore = 100; // single ray → "perfect" (degenerate case)
  } else if (n > 1) {
    // 1) find centroid
    const avgX = focusList.reduce((sum, p) => sum + p[0], 0) / n;
    const avgY = focusList.reduce((sum, p) => sum + p[1], 0) / n;
    // 2) avg distance to centroid
    const avgDist =
      focusList.reduce(
        (sum, p) => sum + Math.hypot(p[0] - avgX, p[1] - avgY),
        0,
      ) / n;
    // 3) invert + scale to 0–100
    focusScore = (1 / (1 + avgDist)) * 100;
  }

  // show it in console or draw on canvas…
  document.getElementById('focusScoreValue').textContent = focusScore.toFixed(1);
  return focusScore;
}

function calculateRayPath(startX, startY, rayAngle, centerX, centerY) {
  const rayPath = [];

  // Light ray starts outside the eye
  rayPath.push([startX, startY]);

  // Get parameters
  const eyeSize = simulationParams.eyeSize;
  const corneaRadius = simulationParams.corneaRadius;
  const pupilSize = simulationParams.pupilSize;
  const lensHeight = simulationParams.lensHeight;
  const airIndex = simulationParams.airIndex;
  const corneaIndex = simulationParams.corneaIndex;
  const aqueousIndex = simulationParams.aqueousIndex;
  const lensIndex = simulationParams.lensIndex;
  const vitreousIndex = simulationParams.vitreousIndex;

  // Calculate key positions
  const eyeRadius = eyeSize / 2;
  const scleraOpeningAngle = (1 / 6) * Math.PI;
  const vitreousRadius = eyeRadius - 2.5;
  const retinaAngle = Math.PI * 1.5; // ~120 degrees
  const retinaRadius = vitreousRadius - 2;
  const scleraEndX = eyeRadius * -Math.cos(scleraOpeningAngle);
  const scleraEndY = eyeRadius * Math.sin(scleraOpeningAngle);
  const irisX = centerX + scleraEndX;
  const irisThickness = 4;
  const corneaArcAngle = Math.asin(scleraEndY / corneaRadius);
  const corneaCenterX = -corneaRadius * Math.cos(corneaArcAngle);
  const irisHeight = scleraEndY;
  const irisInnerRadius = pupilSize / 2;
  const lensPosition = irisX + irisThickness;
  const lensFrontRadius = lensHeight ** 1.5 * 0.2;
  const lensBackRadius = lensHeight ** 1.5 * 0.13;
  const lensFillet = 600 / lensHeight;

  // Track current refractive index ratio
  let currentIndex = airIndex;

  // First intersection is with cornea
  const [hitCornea, corneaX, corneaY, corneaAngle] = refractArc(
    startX,
    startY,
    rayAngle,
    centerX + (scleraEndX - corneaCenterX),
    centerY,
    corneaRadius + 2,
    Math.PI - corneaArcAngle,
    Math.PI + corneaArcAngle,
    corneaIndex / currentIndex,
  );

  if (hitCornea) {
    rayPath.push([corneaX, corneaY]);
    currentX = corneaX;
    currentY = corneaY;
    currentIndex = corneaIndex;

    // Next intersection with aqueous humor
    const [hitAqueous, aqueousX, aqueousY, aqueousAngle] = refractArc(
      currentX,
      currentY,
      corneaAngle,
      centerX + (scleraEndX - corneaCenterX),
      centerY,
      corneaRadius - 2,
      Math.PI - corneaArcAngle,
      Math.PI + corneaArcAngle,
      aqueousIndex / currentIndex,
    );

    if (hitAqueous) {
      rayPath.push([aqueousX, aqueousY]);
      currentX = aqueousX;
      currentY = aqueousY;
      currentIndex = aqueousIndex;

      // Check for intersection with iris/pupil
      const [irisIntersection, irisIntersectX, irisIntersectY] = passIris(
        currentX,
        currentY,
        aqueousAngle,
        centerY - irisInnerRadius,
        centerY + irisInnerRadius,
        irisX,
      );

      if (!irisIntersection) {
        // Ray hits iris and stops
        rayPath.push([irisIntersectX, irisIntersectY]);
        return rayPath;
      }

      // Ray goes through pupil to lens
      const [hitLensFront, lensFrontX, lensFrontY, lensFrontAngle] = refractArc(
        currentX,
        currentY,
        aqueousAngle,
        lensPosition + lensFrontRadius,
        centerY,
        lensFrontRadius,
        Math.PI - angle(lensFrontRadius, lensHeight),
        Math.PI + angle(lensFrontRadius, lensHeight),
        lensIndex / currentIndex,
      );

      if (hitLensFront) {
        rayPath.push([lensFrontX, lensFrontY]);
        currentX = lensFrontX;
        currentY = lensFrontY;
        currentIndex = lensIndex;

        // Through back of lens into vitreous humor
        const [hitLensBack, lensBackX, lensBackY, lensBackAngle] = refractArc(
          currentX,
          currentY,
          lensFrontAngle,
          lensPosition +
            lensFrontRadius -
            xOffset(lensFrontRadius, lensHeight) -
            xOffset(lensBackRadius, lensHeight) +
            lensFillet,
          centerY,
          lensBackRadius,
          -angle(lensBackRadius, lensHeight),
          angle(lensBackRadius, lensHeight),
          vitreousIndex / currentIndex,
        );

        if (hitLensBack) {
          rayPath.push([lensBackX, lensBackY]);
          currentX = lensBackX;
          currentY = lensBackY;
          currentIndex = vitreousIndex;

          // Finally check intersection with retina
          const [hitRetina, retinaX, retinaY] = refractArc(
            currentX,
            currentY,
            lensBackAngle,
            centerX,
            centerY,
            retinaRadius,
            -retinaAngle / 2,
            retinaAngle / 2,
            1.0,
          );

          if (hitRetina) {
            rayPath.push([retinaX, retinaY]);
          }
        }
      }
    }
  }

  return rayPath;
}

function refractArc(
  startX,
  startY,
  startAngle,
  centerX,
  centerY,
  radius,
  startArcAngle,
  stopArcAngle,
  index,
) {
  // 1) First find intersection on the arc:
  const [hit, ix, iy] = intersectArc(
    startX,
    startY,
    startAngle,
    centerX,
    centerY,
    radius,
    startArcAngle,
    stopArcAngle,
  );
  if (!hit) {
    // no intersection on our arc
    return [false, null, null, null];
  }
  // 2) Compute surface normal at (ix,iy) (points outward):
  let nx = (ix - centerX) / radius;
  let ny = (iy - centerY) / radius;

  // 3) Incident ray unit vector:
  const vx = Math.cos(startAngle);
  const vy = Math.sin(startAngle);

  // 4) Ensure normal is against the incidence (flip if needed):
  let dot = vx * nx + vy * ny;
  if (dot > 0) {
    nx = -nx;
    ny = -ny;
    dot = vx * nx + vy * ny;
  }

  // 5) Snell's law ratio and angles:
  const n1 = 1; // incident medium index
  const n2 = index; // transmitted medium index
  const η = n1 / n2;
  const cosi = -dot; // cos(theta_i) = -I·N
  const k = 1 - η * η * (1 - cosi * cosi);

  if (k < 0) {
    // Total internal reflection — no refraction
    return [false, null, null, null];
  }

  // 6) Compute refracted vector: T = ηI + (η cosi - sqrt(k)) N
  const coef = η * cosi - Math.sqrt(k);
  const tx = η * vx + coef * nx;
  const ty = η * vy + coef * ny;

  // 7) Convert to angle and return
  const outgoingAngle = Math.atan2(ty, tx);
  return [true, ix, iy, outgoingAngle];
}

function intersectArc(
  startX,
  startY,
  startAngle,
  centerX,
  centerY,
  radius,
  startArcAngle,
  stopArcAngle,
) {
  // Direction vector of the ray
  const dx = Math.cos(startAngle);
  const dy = Math.sin(startAngle);

  // Translate to circle‐centered coords
  const x0 = startX - centerX;
  const y0 = startY - centerY;

  // Quadratic coefficients for ||(x0 + t·dx, y0 + t·dy)||² = radius²
  const a = dx * dx + dy * dy; // === 1
  const b = 2 * (x0 * dx + y0 * dy);
  const c = x0 * x0 + y0 * y0 - radius * radius;

  const disc = b * b - 4 * a * c;
  if (disc < 0) {
    // no real intersections
    return [false, null, null];
  }

  const sqrtD = Math.sqrt(disc);
  const t1 = (-b + sqrtD) / (2 * a);
  const t2 = (-b - sqrtD) / (2 * a);

  // pick the smallest non-negative t (forward along the ray)
  let t = null;
  if (t1 >= 0 && t2 >= 0) {
    t = Math.min(t1, t2);
  } else if (t1 >= 0) {
    t = t1;
  } else if (t2 >= 0) {
    t = t2;
  } else {
    // both behind the start point → no forward intersection
    return [false, null, null];
  }

  // Compute the world‐space intersection point
  const ix = startX + dx * t;
  const iy = startY + dy * t;

  // Compute the angle of that point around the circle center
  let theta = Math.atan2(iy - centerY, ix - centerX);

  // Normalize angles to [0, 2π)
  const norm = (a) => {
    let v = a % (2 * Math.PI);
    if (v < 0) v += 2 * Math.PI;
    return v;
  };
  const a0 = norm(startArcAngle);
  const a1 = norm(stopArcAngle);
  const ai = norm(theta);

  // Check if ai lies between a0→a1, allowing for wraparound
  let onArc;
  if (a0 <= a1) {
    onArc = ai >= a0 && ai <= a1;
  } else {
    // arc crosses the zero line
    onArc = ai >= a0 || ai <= a1;
  }

  if (!onArc) {
    return [false, null, null];
  }

  return [true, ix, iy];
}

function passIris(startX, startY, angle, irisMinY, irisMaxY, irisX) {
  const cosA = Math.cos(angle);
  // Ray parallel to the iris plane: no intersection
  if (cosA === 0) {
    return [false, null, null];
  }

  // Parameter t where the ray crosses x = irisX:
  const t = (irisX - startX) / cosA;
  // Only forward intersections count
  if (t < 0) {
    return [false, null, null];
  }

  // Compute the intersection point
  const sinA = Math.sin(angle);
  const intersectY = startY + t * sinA;

  // Normalize iris bounds
  const minY = Math.min(irisMinY, irisMaxY);
  const maxY = Math.max(irisMinY, irisMaxY);

  // Check if the intersection lies within the segment
  if (intersectY >= minY && intersectY <= maxY) {
    // Ray passes through the iris segment
    return [true, null, null];
  } else {
    // Ray misses the segment but does hit the plane
    return [false, irisX, intersectY];
  }
}

function setupControls() {
  // Connect sliders to simulation parameters
  function setupSlider(id, valueId, min, max) {
    const slider = document.getElementById(id);
    const value = document.getElementById(valueId);

    // Handle both mouse and touch events
    const updateValue = () => {
      // Update value display
      value.textContent = slider.value;

      // Update simulation parameters with unit translation if applicable
      if (UNIT_TRANSLATIONS[id]) {
        simulationParams[id] = parseFloat(slider.value) * UNIT_TRANSLATIONS[id];
      } else {
        simulationParams[id] = parseFloat(slider.value);
      }

      // Redraw
      draw();
    };

    slider.addEventListener("input", updateValue);
    slider.addEventListener("change", updateValue);
    slider.addEventListener("touchmove", updateValue);
  }

  setupSlider("eyeSize", "eyeSizeValue");
  setupSlider("corneaRadius", "corneaRadiusValue");
  setupSlider("pupilSize", "pupilSizeValue");
  setupSlider("lensHeight", "lensHeightValue");
  setupSlider("airIndex", "airIndexValue");
  setupSlider("corneaIndex", "corneaIndexValue");
  setupSlider("aqueousIndex", "aqueousIndexValue");
  setupSlider("lensIndex", "lensIndexValue");
  setupSlider("vitreousIndex", "vitreousIndexValue");
  setupSlider("lightSourceDistance", "lightSourceDistanceValue");
}

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  init();
  setupCollapsibleSections();
});

function setupCollapsibleSections() {
  const sections = document.querySelectorAll(".control-section");
  sections.forEach((section) => {
    const header = section.querySelector(".control-section-header");
    header.addEventListener("click", () => {
      section.classList.toggle("active");
    });
  });
}

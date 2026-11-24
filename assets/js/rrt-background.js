/* ==========================================
   UNIFORM RANDOM RECURSIVE TREE BACKGROUND
   ========================================== */

(function () {
  const NS = "http://www.w3.org/2000/svg";

  // Visual settings
  const GROWTH_INTERVAL = 600;  // milliseconds
  const MAX_VERTICES =
    window.innerWidth < 650 ? 38 : 80;

  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  );

  // Create the SVG background
  const svg = document.createElementNS(NS, "svg");

  svg.id = "rrt-background";
  svg.setAttribute("viewBox", "0 0 1000 700");
  svg.setAttribute("preserveAspectRatio", "xMidYMid slice");
  svg.setAttribute("aria-hidden", "true");
  svg.setAttribute("focusable", "false");

  const edges = document.createElementNS(NS, "g");
  const vertices = document.createElementNS(NS, "g");

  svg.appendChild(edges);
  svg.appendChild(vertices);
  document.body.prepend(svg);

  let nodes = [];
  let growthTimer = null;
  let restartTimer = null;

  // Place the root and subsequent vertices
  function drawVertex(node) {
    const circle = document.createElementNS(NS, "circle");

    circle.setAttribute("cx", node.x);
    circle.setAttribute("cy", node.y);
    circle.setAttribute("r", nodes.length === 1 ? 3.5 : 2.4);
    circle.setAttribute("class", "rrt-vertex");

    vertices.appendChild(circle);
  }

  // Choose a visually pleasant position near the parent.
  // This does NOT affect the random parent selection.
  function choosePosition(parent) {
    let best = null;
    let bestScore = -Infinity;

    for (let attempt = 0; attempt < 25; attempt++) {
      const angle = 2 * Math.PI * Math.random();
      const radius = 45 + 95 * Math.random();

      const x = Math.max(
        30,
        Math.min(970, parent.x + radius * Math.cos(angle))
      );

      const y = Math.max(
        30,
        Math.min(670, parent.y + radius * Math.sin(angle))
      );

      // Prefer positions away from other vertices
      let minDistance = Infinity;

      for (const node of nodes) {
        const dx = x - node.x;
        const dy = y - node.y;
        const distance = dx * dx + dy * dy;

        minDistance = Math.min(minDistance, distance);
      }

      if (minDistance > bestScore) {
        bestScore = minDistance;
        best = { x, y };
      }
    }

    return best;
  }

  // Add one new vertex
  function addVertex(animate = true) {

    // Uniform random parent among all existing vertices
    const parentIndex = Math.floor(
      Math.random() * nodes.length
    );

    const parent = nodes[parentIndex];
    const position = choosePosition(parent);

    const node = {
      x: position.x,
      y: position.y,
      parent: parentIndex
    };

    // Draw the new edge
    const path = document.createElementNS(NS, "path");

    path.setAttribute(
      "d",
      `M ${parent.x} ${parent.y} L ${node.x} ${node.y}`
    );

    path.setAttribute("class", "rrt-edge");

    const length = Math.hypot(
      node.x - parent.x,
      node.y - parent.y
    );

    // Animate the edge growing from parent to child
    if (animate) {
      path.style.strokeDasharray = String(length);
      path.style.strokeDashoffset = String(length);
    }

    edges.appendChild(path);

    if (animate) {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          path.style.strokeDashoffset = "0";
        });
      });
    }

    nodes.push(node);
    drawVertex(node);
  }

  // Start a new independent recursive tree
  function startTree() {
    clearInterval(growthTimer);
    clearTimeout(restartTimer);

    svg.classList.remove("rrt-fading");

    edges.replaceChildren();
    vertices.replaceChildren();

    nodes = [{
      x: 530,
      y: 350,
      parent: -1
    }];

    drawVertex(nodes[0]);

    // Static tree for reduced-motion preference
    if (reducedMotion.matches) {
      while (nodes.length < MAX_VERTICES) {
        addVertex(false);
      }
      return;
    }

    // Grow the tree over time
    growthTimer = setInterval(() => {
      if (document.hidden) return;

      if (nodes.length < MAX_VERTICES) {
        addVertex(true);
      } else {
        clearInterval(growthTimer);

        // Leave the completed tree visible briefly
        restartTimer = setTimeout(() => {
          svg.classList.add("rrt-fading");

          // Fade out and start a new tree
          restartTimer = setTimeout(startTree, 1400);
        }, 4500);
      }
    }, GROWTH_INTERVAL);
  }

  // React to accessibility preference changes
  if (reducedMotion.addEventListener) {
    reducedMotion.addEventListener("change", startTree);
  }

  startTree();
})();

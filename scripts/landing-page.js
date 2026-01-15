// Main JS for Mapbox UI
mapboxgl.accessToken =
  "pk.eyJ1IjoicGhvbGxpcy1wcm9sb2dpcyIsImEiOiJjbWl4cGt1ajUwN2JpM2RvOXdqOWFmb3U3In0.RyiaedumDC0gnw6FeFKqrA ";

const map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/phollis-prologis/cmixr0gqa000d01rj1py34kjg",
  attributionControl: false,
  // center: [-76.6122, 39.2904], // Baltimore
  center: [-76.525583, 39.25904],
  zoom: 12,
});

function setMapStyle(style, el) {
  setStyle(style);
  const buttons = el.parentElement.querySelectorAll(".btn");
  buttons.forEach((btn) => btn.classList.remove("active"));
  el.classList.add("active");
  document.body.classList.toggle("is-satellite", style === "satellite");
}

function setStyle(type) {
  // IMPORTANT: This must be served over http:// or https:// (not file://)
  map.setStyle(
    type === "satellite"
      ? "./styles-hybrid/style-hybrid.json"
      : "./styles-map/style-map.json"
  );
}

// Toggle Map Filters (mobile)
function toggleMapFilters() {
  const filters = document.querySelector(".bottom-controls");
  filters.classList.toggle("is-visible");
}

function buildPropertyTooltipEl(data) {
  const root = document.createElement("div");
  root.className = "property-tooltip";

  const body = document.createElement("div");
  body.className = "property-tooltip__body";
  root.appendChild(body);

  // Image (left)
  if (data.imageUrl) {
    const media = document.createElement("div");
    media.className = "property-tooltip__media";
    body.appendChild(media);

    const img = document.createElement("img");
    img.src = data.imageUrl;
    img.alt = data.title ? `${data.title} image` : "Location image";
    media.appendChild(img);

    if (data.badge) {
      const badge = document.createElement("div");
      badge.className = "property-tooltip__badge";
      badge.textContent = data.badge;
      media.appendChild(badge);
    }
  }

  // Text (right)
  const text = document.createElement("div");
  text.className = "property-tooltip__text";
  body.appendChild(text);

  if (data.kicker) {
    const kicker = document.createElement("p");
    kicker.className = "property-tooltip__kicker";
    kicker.textContent = data.kicker;
    text.appendChild(kicker);
  }

  if (data.metric) {
    const metric = document.createElement("p");
    metric.className = "property-tooltip__metric";
    metric.textContent = data.metric;

    if (data.unit) {
      const unit = document.createElement("span");
      unit.className = "property-tooltip__unit";
      unit.textContent = " " + data.unit;
      metric.appendChild(unit);
    }

    text.appendChild(metric);
  }

  const title = document.createElement("p");
  title.className = "property-tooltip__title";
  title.textContent = data.title || "";
  text.appendChild(title);

  if (data.description) {
    const desc = document.createElement("p");
    desc.className = "property-tooltip__desc";
    desc.textContent = data.description; // supports \n
    text.appendChild(desc);
  }

  return root;
}

/**
 * -----------------------------
 * Highlight area (outline) LAYER
 * -----------------------------
 * NOTE:
 * - When you call map.setStyle(), Mapbox clears custom sources/layers.
 * - So we re-add them on BOTH initial load and every `style.load`.
 */

// IDs (keep consistent)
const HIGHLIGHT_SOURCE_ID = "highlight-area";
const HIGHLIGHT_FILL_LAYER_ID = "highlight-fill";
const HIGHLIGHT_OUTLINE_LAYER_ID = "highlight-outline";

const ROUTE_SOURCE_ID = "route";
const ROUTE_LAYER_ID = "route";

/**
 * -----------------------------
 * MARKETS (MULTIPLE POLYGONS)
 * -----------------------------
 * Requirement coverage:
 * 1) Multiple markets selectable via OUTSIDE buttons
 * 2) Each polygon has 6-10 points
 * 3) Market name overlays inside polygon (label point + symbol layer)
 */

const MARKET_LABEL_SOURCE_ID = "market-label";
const MARKET_LABEL_LAYER_ID = "market-label-layer";

// Define your markets here.
// - polygon: Polygon or MultiPolygon
// - labelLngLat: where the market name should render
const MARKETS = {
  "dc-md-va": {
    name: "Maryland, Washington D.C., and Northern Virginia",
    labelLngLat: [-77.0369, 38.9072], // near DC
    polygon: {
      type: "Feature",
      properties: { id: "dc-md-va" },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [-77.60, 39.10],
            [-77.30, 39.35],
            [-76.95, 39.45],
            [-76.55, 39.40],
            [-76.25, 39.05],
            [-76.30, 38.70],
            [-76.70, 38.55],
            [-77.20, 38.55],
            [-77.55, 38.75],
            [-77.60, 39.10], // close
          ],
        ],
      },
    },
  },

  "baltimore": {
    name: "Baltimore Metro",
    labelLngLat: [-76.6122, 39.2904], // Baltimore
    polygon: {
      type: "Feature",
      properties: { id: "baltimore" },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [-76.92, 39.45],
            [-76.75, 39.56],
            [-76.52, 39.60],
            [-76.30, 39.52],
            [-76.22, 39.36],
            [-76.33, 39.20],
            [-76.58, 39.14],
            [-76.82, 39.24],
            [-76.92, 39.45], // close
          ],
        ],
      },
    },
  },

  // Polygon WITH A HOLE (different polygon structure)
  "annapolis-eastern-shore": {
    name: "Annapolis & Eastern Shore",
    labelLngLat: [-76.4922, 38.9784], // Annapolis
    polygon: {
      type: "Feature",
      properties: { id: "annapolis-eastern-shore" },
      geometry: {
        type: "Polygon",
        coordinates: [
          // Outer ring (8+ points)
          [
            [-76.80, 39.20],
            [-76.55, 39.30],
            [-76.30, 39.25],
            [-76.05, 39.10],
            [-75.95, 38.85],
            [-76.15, 38.70],
            [-76.45, 38.65],
            [-76.75, 38.80],
            [-76.80, 39.20], // close
          ],
          // Inner ring / hole (5+ points)
          [
            [-76.55, 39.10],
            [-76.35, 39.15],
            [-76.20, 39.00],
            [-76.30, 38.85],
            [-76.50, 38.85],
            [-76.55, 39.10], // close
          ],
        ],
      },
    },
  },

  // MULTIPOLYGON (different polygon structure)
  "chesapeake-bay": {
    name: "Chesapeake Bay",
    labelLngLat: [-76.55, 39.05],
    polygon: {
      type: "Feature",
      properties: { id: "chesapeake-bay" },
      geometry: {
        type: "MultiPolygon",
        coordinates: [
          // Polygon 1
          [
            [
              [-76.78, 39.34],
              [-76.62, 39.38],
              [-76.45, 39.32],
              [-76.42, 39.18],
              [-76.55, 39.08],
              [-76.72, 39.16],
              [-76.78, 39.34], // close
            ],
          ],
          // Polygon 2
          [
            [
              [-76.70, 39.05],
              [-76.52, 39.12],
              [-76.35, 39.05],
              [-76.28, 38.92],
              [-76.38, 38.78],
              [-76.58, 38.80],
              [-76.70, 39.05], // close
            ],
          ],
        ],
      },
    },
  },
};

// Keep GeoJSON in variables so it survives style changes
let routeData = {
  type: "FeatureCollection",
  features: [], // empty initially
};

// Default market selected on load
let activeMarketId = "dc-md-va";

// highlightData now represents the ACTIVE market polygon
let highlightData = MARKETS[activeMarketId].polygon;

// label source data (a Point feature) for the ACTIVE market name
let marketLabelData = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: {
        id: activeMarketId,
        name: MARKETS[activeMarketId].name,
      },
      geometry: {
        type: "Point",
        coordinates: MARKETS[activeMarketId].labelLngLat,
      },
    },
  ],
};

function ensureCustomSourcesAndLayers() {
  // --- Sources ---
  // Highlight source (active market boundary)
  if (!map.getSource(HIGHLIGHT_SOURCE_ID)) {
    map.addSource(HIGHLIGHT_SOURCE_ID, {
      type: "geojson",
      data: highlightData,
    });
  } else {
    map.getSource(HIGHLIGHT_SOURCE_ID).setData(highlightData);
  }

  // Route source
  if (!map.getSource(ROUTE_SOURCE_ID)) {
    map.addSource(ROUTE_SOURCE_ID, {
      type: "geojson",
      data: routeData,
    });
  } else {
    map.getSource(ROUTE_SOURCE_ID).setData(routeData);
  }

  // Market label source
  if (!map.getSource(MARKET_LABEL_SOURCE_ID)) {
    map.addSource(MARKET_LABEL_SOURCE_ID, {
      type: "geojson",
      data: marketLabelData,
    });
  } else {
    map.getSource(MARKET_LABEL_SOURCE_ID).setData(marketLabelData);
  }

  // --- Layers (order matters) ---
  // 1) Fill goes BELOW route (so route stays visible)
  if (!map.getLayer(HIGHLIGHT_FILL_LAYER_ID)) {
    const beforeId = map.getLayer(ROUTE_LAYER_ID) ? ROUTE_LAYER_ID : undefined;

    map.addLayer(
      {
        id: HIGHLIGHT_FILL_LAYER_ID,
        type: "fill",
        source: HIGHLIGHT_SOURCE_ID,
        paint: {
          "fill-color": "#23F1E0",
          "fill-opacity": 0, // outline-only; adjust if you want faint fill
        },
      },
      beforeId
    );
  }

  // 2) Route line
  if (!map.getLayer(ROUTE_LAYER_ID)) {
    map.addLayer({
      id: ROUTE_LAYER_ID,
      type: "line",
      source: ROUTE_SOURCE_ID,
      layout: {
        "line-join": "round",
        "line-cap": "round",
      },
      paint: {
        "line-color": "#23F1E0",
        "line-width": 1.8,
      },
    });
  }

  // 3) Outline goes ABOVE route/fill (so border is always visible)
  if (!map.getLayer(HIGHLIGHT_OUTLINE_LAYER_ID)) {
    map.addLayer({
      id: HIGHLIGHT_OUTLINE_LAYER_ID,
      type: "line",
      source: HIGHLIGHT_SOURCE_ID,
      paint: {
        "line-color": "#23F1E0",
        "line-width": 1.8,
      },
    });
  }

  // 4) Market name label (overlay inside polygon)
  if (!map.getLayer(MARKET_LABEL_LAYER_ID)) {
    map.addLayer({
      id: MARKET_LABEL_LAYER_ID,
      type: "symbol",
      source: MARKET_LABEL_SOURCE_ID,
      layout: {
        "text-field": ["get", "name"],
        "text-font": ["Open Sans Bold", "Arial Unicode MS Bold"],
        "text-size": [
          "interpolate",
          ["linear"],
          ["zoom"],
          8, 14,
          11, 18,
          13, 22
        ],
        "text-anchor": "center",
        "text-justify": "center",
        "text-max-width": 18,
      },
      paint: {
        "text-color": "#FFFFFF",
        "text-halo-color": "#064a4b",
        "text-halo-width": 3,
      },
    });
  }
}

/**
 * Update active market boundary + label + focus (fitBounds)
 */
function setActiveMarket(marketId, { fit = true } = {}) {
  const market = MARKETS[marketId];
  if (!market) {
    console.warn("Unknown marketId:", marketId);
    return;
  }

  activeMarketId = marketId;

  // Update active polygon (highlightData)
  highlightData = market.polygon;

  // Update label point data
  marketLabelData = {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        properties: {
          id: marketId,
          name: market.name,
        },
        geometry: {
          type: "Point",
          coordinates: market.labelLngLat,
        },
      },
    ],
  };

  // If style isn't loaded yet, wait
  if (!map.isStyleLoaded()) {
    map.once("style.load", () => {
      ensureCustomSourcesAndLayers();
      setActiveMarket(marketId, { fit });
    });
    return;
  }

  // Ensure layers exist, then set data
  ensureCustomSourcesAndLayers();

  const hSrc = map.getSource(HIGHLIGHT_SOURCE_ID);
  if (hSrc) hSrc.setData(highlightData);

  const lSrc = map.getSource(MARKET_LABEL_SOURCE_ID);
  if (lSrc) lSrc.setData(marketLabelData);

  if (fit) {
    fitToFeatureBounds(market.polygon, { padding: 80, duration: 800 });
  }

  // Optional: active button UI
  setActiveMarketButton(marketId);
}

function setActiveMarketButton(marketId) {
  document.querySelectorAll(".market-btn[data-market-id]").forEach((btn) => {
    btn.classList.toggle("is-active", btn.dataset.marketId === marketId);
    btn.setAttribute(
      "aria-selected",
      btn.dataset.marketId === marketId ? "true" : "false"
    );
  });
}

function fitToFeatureBounds(feature, { padding = 60, duration = 700 } = {}) {
  const bounds = new mapboxgl.LngLatBounds();

  const geom = feature?.geometry;
  if (!geom) return;

  // Collect all coordinates regardless of Polygon / MultiPolygon / holes
  const extendCoords = (coords) => {
    coords.forEach((c) => bounds.extend(c));
  };

  if (geom.type === "Polygon") {
    // geom.coordinates: [ring1, ring2...]
    geom.coordinates.forEach((ring) => extendCoords(ring));
  } else if (geom.type === "MultiPolygon") {
    // geom.coordinates: [[[ring...]], [[ring...]]]
    geom.coordinates.forEach((poly) => {
      poly.forEach((ring) => extendCoords(ring));
    });
  } else {
    console.warn("fitToFeatureBounds: Unsupported geometry type:", geom.type);
    return;
  }

  map.fitBounds(bounds, { padding, duration });
}

/**
 * Call this whenever you want to change the highlighted area dynamically.
 */
function updateHighlightArea(geojson) {
  if (!geojson) return;

  let data = geojson;

  if (geojson.type === "FeatureCollection") {
    data = geojson.features?.[0];
  } else if (geojson.type === "Polygon" || geojson.type === "MultiPolygon") {
    data = { type: "Feature", properties: {}, geometry: geojson };
  }

  if (!data || data.type !== "Feature") {
    console.error("Invalid GeoJSON for highlight area:", geojson);
    return;
  }

  highlightData = data;

  const src = map.getSource(HIGHLIGHT_SOURCE_ID);
  if (src) src.setData(highlightData);
}

/**
 * If you later want to update the route dynamically, use this.
 */
function updateRoute(geojson) {
  let data = geojson;

  if (geojson?.type === "FeatureCollection") {
    data = geojson.features?.[1] || geojson.features?.[0];
  } else if (
    geojson?.type === "LineString" ||
    geojson?.type === "MultiLineString"
  ) {
    data = { type: "Feature", properties: {}, geometry: geojson };
  }

  if (!data || data.type !== "Feature") {
    console.error("Invalid GeoJSON for route:", geojson);
    return;
  }

  routeData = data;

  const src = map.getSource(ROUTE_SOURCE_ID);
  if (src) src.setData(routeData);
}

// Re-add custom layers any time the style changes (map.setStyle)
map.on("style.load", () => {
  ensureCustomSourcesAndLayers();

  // Re-apply active market after style reload
  setActiveMarket(activeMarketId, { fit: false });
});

/**
 * Bind external buttons (outside map) — no JS creates the buttons.
 */
function bindMarketButtons() {
  const container = document.querySelector(".market-buttons");
  if (!container) return;

  container.addEventListener("click", (e) => {
    const btn = e.target.closest(".market-btn[data-market-id]");
    if (!btn) return;

    setActiveMarket(btn.dataset.marketId, { fit: true });
  });

  // initial active UI state
  setActiveMarketButton(activeMarketId);
}

// Robust DOM ready
(function onReady(fn) {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", fn);
  } else {
    fn();
  }
})(bindMarketButtons);

map.on("load", () => {
  // Ensure layers exist on first load too
  ensureCustomSourcesAndLayers();

  // Set default market boundary + label + focus
  setActiveMarket(activeMarketId, { fit: true });

  // Custom city marker at map center
  const cityData = {
    img: "./assets/icons/city.svg",
    name: "City Center",
    tooltip: {
      badge: "Urban",
      kicker: "Verfügbarkeit September 2025",
      metric: "27,288",
      unit: "SF",
      title: "Prologis Business Center North #3",
      description: "5503 Havana Street, Unit 140\nDenver, Colorado, 80238",
      imageUrl: "./assets/icons/property.png",
    },
  };

  const cityMarkerEl = document.createElement("div");
  cityMarkerEl.className = "custom-city-marker";
  cityMarkerEl.innerHTML = `
    <div class="marker-pin">
      <img src="${cityData.img}" alt="${cityData.name}" class="marker-img" />
    </div>
  `;

  const cityPopup = new mapboxgl.Popup({
    closeButton: false,
    closeOnClick: true,
    anchor: "bottom",
    offset: 28,
    className: "property-tooltip-popup",
    maxWidth: "none",
  }).setDOMContent(buildPropertyTooltipEl(cityData.tooltip));

  new mapboxgl.Marker({ element: cityMarkerEl, anchor: "bottom" })
    .setLngLat([-76.525583, 39.25904])
    .setPopup(cityPopup)
    .addTo(map);

  // Markers
  const points = {
    food: [
      { lngLat: [-76.531397, 39.257645], name: "Joe's Diner", address: "123 Main St" },
      { lngLat: [-76.53085, 39.263673], name: "Pizza Place", address: "456 Elm St" },
      { lngLat: [-76.526655, 39.262439], name: "Cafe Good Eats", address: "789 Oak Ave" },
      { lngLat: [-76.51244, 39.25816], name: "Burger Spot", address: "321 Maple Rd" },
    ],
    transport: [
      { lngLat: [-76.5201, 39.2601], name: "Bus Stop A", address: "100 Transit Blvd" },
      { lngLat: [-76.5185, 39.2623], name: "Metro Station", address: "200 Metro Ave" },
    ],
    amenities: [
      { lngLat: [-76.5252, 39.2598], name: "City Park", address: "Park Lane" },
    ],
  };

  const colors = {
    food: "#88FF8D",
    transport: "#DBD94B",
    amenities: "#4BA3DB",
  };

  const markersByLayer = {};
  for (const layer in points) {
    markersByLayer[layer] = points[layer].map((item) => {
      const marker = new mapboxgl.Marker({ color: colors[layer] }).setLngLat(item.lngLat);

      const popupContent = `
        <div class="popup-content-flex">
          <strong>${item.name}</strong>
          <span>${item.address}</span>
        </div>
      `;
      const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(popupContent);
      marker.setPopup(popup);

      return marker;
    });
  }

  // Toggle helper functions (kept, not wired to UI here)
  const enabled = new Set();

  function toggleLayer(layer) {
    const list = markersByLayer[layer] || [];
    const turnOn = !enabled.has(layer);

    if (turnOn) {
      enabled.add(layer);
      list.forEach((m) => m.addTo(map));
    } else {
      enabled.delete(layer);
      list.forEach((m) => m.remove());
    }

    return turnOn;
  }
});

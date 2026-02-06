// markets.js
(() => {
  const map = window.map;
  if (!map) {
    console.error("[markets.js] window.map not found. Load map-init.js first.");
    return;
  }

  // =========================
  // IDs
  // =========================
  const MARKET_SOURCE_ID = "market-active-source";
  const MARKET_FILL_LAYER_ID = "market-active-fill";
  const MARKET_OUTLINE_LAYER_ID = "market-active-outline";

  // Cluster source/layers
  const MARKET_POINTS_SOURCE_ID = "market-points-source";
  const CLUSTERS_SHADOW1_LAYER_ID = "market-clusters-shadow1";
  const CLUSTERS_SHADOW2_LAYER_ID = "market-clusters-shadow2";
  const CLUSTERS_LAYER_ID = "market-clusters";
  const CLUSTER_COUNT_LAYER_ID = "market-cluster-count";
  const UNCLUSTERED_LAYER_ID = "market-unclustered-point";

  // Keep these consistent with source config below
  const CLUSTER_MAX_ZOOM = 14;

  // =========================
  // Your Budapest markers
  // =========================
  const BUDAPEST_MARKERS = [
    { lat: 47.381924, lng: 19.036688, image: "https://prologis.getbynder.com/m/6e0680441c7b0290/original/Prologis-Park-Budapest-Sziget-II.jpg",badge: "Urban",
          kicker: "Verfügbarkeit September 2025",
          metric: "27,288",
          unit: "SF",
          title: "Prologis Business Center North #3",
          description: "5503 Havana Street, Unit 140\nDenver, Colorado, 80238",
          imageUrl: "./assets/icons/property.png", },
    { lat: 47.3829653, lng: 19.03964985, image: "https://prologis.getbynder.com/m/6e0680441c7b0290/original/Prologis-Park-Budapest-Sziget-II.jpg" ,badge: "Urban",
          kicker: "Verfügbarkeit September 2025",
          metric: "27,288",
          unit: "SF",
          title: "Prologis Business Center North #3",
          description: "5503 Havana Street, Unit 140\nDenver, Colorado, 80238",
          imageUrl: "./assets/icons/property.png",},
    { lat: 47.492393, lng: 18.817982, image: "https://prologis.getbynder.com/m/645054459810c427/DPM-Budapest-M1-DC2_7.jpg",badge: "Urban",
          kicker: "Verfügbarkeit September 2025",
          metric: "27,288",
          unit: "SF",
          title: "Prologis Business Center North #3",
          description: "5503 Havana Street, Unit 140\nDenver, Colorado, 80238",
          imageUrl: "./assets/icons/property.png", },
    { lat: 47.37209, lng: 19.02773, image: "https://prologis.getbynder.com/m/130b757ccf48daf0/DPM-Budapest-Sziget-DC8_28.jpg" ,badge: "Urban",
          kicker: "Verfügbarkeit September 2025",
          metric: "27,288",
          unit: "SF",
          title: "Prologis Business Center North #3",
          description: "5503 Havana Street, Unit 140\nDenver, Colorado, 80238",
          imageUrl: "./assets/icons/property.png",},
    { lat: 47.38196, lng: 18.964283, image: "https://prologis.getbynder.com/m/6864dccb02d984c6/DPM-Budapest-Harbor-DC9_1.jpg" ,badge: "Urban",
          kicker: "Verfügbarkeit September 2025",
          metric: "27,288",
          unit: "SF",
          title: "Prologis Business Center North #3",
          description: "5503 Havana Street, Unit 140\nDenver, Colorado, 80238",
          imageUrl: "./assets/icons/property.png",},
    { lat: 47.443327, lng: 18.965002, image: "https://prologis.getbynder.com/m/188434a81f996aa/original/Budapest-Budaors-DC1.jpg" ,badge: "Urban",
          kicker: "Verfügbarkeit September 2025",
          metric: "27,288",
          unit: "SF",
          title: "Prologis Business Center North #3",
          description: "5503 Havana Street, Unit 140\nDenver, Colorado, 80238",
          imageUrl: "./assets/icons/property.png",},
    { lat: 47.372823, lng: 19.026647, image: "https://prologis.getbynder.com/m/deb84c2d655fd03/DPM-Sziget-DC7.jpg" ,badge: "Urban",
          kicker: "Verfügbarkeit September 2025",
          metric: "27,288",
          unit: "SF",
          title: "Prologis Business Center North #3",
          description: "5503 Havana Street, Unit 140\nDenver, Colorado, 80238",
          imageUrl: "./assets/icons/property.png",},
    { lat: 47.38196, lng: 18.964283, image: "https://prologis.getbynder.com/m/6864dccb02d984c6/DPM-Budapest-Harbor-DC9_1.jpg" ,badge: "Urban",
          kicker: "Verfügbarkeit September 2025",
          metric: "27,288",
          unit: "SF",
          title: "Prologis Business Center North #3",
          description: "5503 Havana Street, Unit 140\nDenver, Colorado, 80238",
          imageUrl: "./assets/icons/property.png",},
    { lat: 47.362675, lng: 19.190733, image: "https://prologis.getbynder.com/m/282e6025ce2dbb2f/DPM-Prologis-Park-Budapest-Gyal-DC5-1.jpg" ,badge: "Urban",
          kicker: "Verfügbarkeit September 2025",
          metric: "27,288",
          unit: "SF",
          title: "Prologis Business Center North #3",
          description: "5503 Havana Street, Unit 140\nDenver, Colorado, 80238",
          imageUrl: "./assets/icons/property.png",},
    { lat: 47.3845, lng: 18.9671, image: "https://prologis.getbynder.com/m/d37592e24a1de83/DPM-Prologis-Park-Budapest-Harbor-DC2-1.jpg" ,badge: "Urban",
          kicker: "Verfügbarkeit September 2025",
          metric: "27,288",
          unit: "SF",
          title: "Prologis Business Center North #3",
          description: "5503 Havana Street, Unit 140\nDenver, Colorado, 80238",
          imageUrl: "./assets/icons/property.png",},
    { lat: 47.36413, lng: 19.186848, image: "https://prologis.getbynder.com/m/e6eb755f6ffe80a/original/Budapest-Gyal-DC2.jpg" ,badge: "Urban",
          kicker: "Verfügbarkeit September 2025",
          metric: "27,288",
          unit: "SF",
          title: "Prologis Business Center North #3",
          description: "5503 Havana Street, Unit 140\nDenver, Colorado, 80238",
          imageUrl: "./assets/icons/property.png",},
    { lat: 47.380703, lng: 19.036057, image: "https://prologis.getbynder.com/m/12fe945b24b39702/DPM-Prologis-Park-Sziget-II-DC1B-2.jpg" ,badge: "Urban",
          kicker: "Verfügbarkeit September 2025",
          metric: "27,288",
          unit: "SF",
          title: "Prologis Business Center North #3",
          description: "5503 Havana Street, Unit 140\nDenver, Colorado, 80238",
          imageUrl: "./assets/icons/property.png",},
    { lat: 47.385232, lng: 18.964118, image: "https://prologis.getbynder.com/asset/ae973c5b-e540…102-88f9-bae24cc6739d/DPM/Budapest-Harbor-DC6.jpg" ,badge: "Urban",
          kicker: "Verfügbarkeit September 2025",
          metric: "27,288",
          unit: "SF",
          title: "Prologis Business Center North #3",
          description: "5503 Havana Street, Unit 140\nDenver, Colorado, 80238",
          imageUrl: "./assets/icons/property.png",},
    { lat: 47.36676, lng: 19.18794, image: "https://prologis.getbynder.com/m/56c066e569f7df12/DPM-Prologis-Park-Budapest-Gyal-DC4.jpg" ,badge: "Urban",
          kicker: "Verfügbarkeit September 2025",
          metric: "27,288",
          unit: "SF",
          title: "Prologis Business Center North #3",
          description: "5503 Havana Street, Unit 140\nDenver, Colorado, 80238",
          imageUrl: "./assets/icons/property.png",},
    { lat: 47.377655, lng: 19.025988, image: "https://prologis.getbynder.com/m/3c22041f08992617/DPM-Budapest-Sziget-DC9_4.jpg" ,badge: "Urban",
          kicker: "Verfügbarkeit September 2025",
          metric: "27,288",
          unit: "SF",
          title: "Prologis Business Center North #3",
          description: "5503 Havana Street, Unit 140\nDenver, Colorado, 80238",
          imageUrl: "./assets/icons/property.png",},
  ];

  function markersToFeatureCollection(markers) {
    return {
      type: "FeatureCollection",
      features: (markers || []).map((m, i) => ({
        type: "Feature",
        properties: {
          id: `m-${i + 1}`,
          image: m.image || "",
        },
        geometry: { type: "Point", coordinates: [m.lng, m.lat] },
      })),
    };
  }

  const MARKET_MARKERS = {
    budapest: BUDAPEST_MARKERS,
  };

  // =========================
  // Markets data
  // =========================
  const MARKETS = {
    budapest: {
      name: "Budapest Market",
      labelLngLat: [19.036688, 47.381924],
      feature: null,
      boundaryUrl: "./data/JSON-boundry-118446-1.geojson",
    },

    "dc-md-va": {
      name: "Maryland, Washington D.C., and Northern Virginia",
      labelLngLat: [-77.0369, 38.9072],
      feature: {
        type: "Feature",
        properties: { id: "dc-md-va" },
        geometry: {
          type: "Polygon",
          coordinates: [[
            [-77.60, 39.10],
            [-77.30, 39.35],
            [-76.95, 39.45],
            [-76.55, 39.40],
            [-76.25, 39.05],
            [-76.30, 38.70],
            [-76.70, 38.55],
            [-77.20, 38.55],
            [-77.55, 38.75],
            [-77.60, 39.10],
          ]],
        },
      },
    },
  };

  let activeMarketId = "budapest";

  // =========================
  // Market label HTML marker
  // =========================
  let marketLabelMarker = null;
  let marketLabelEl = null;

  function ensureMarketLabelMarker() {
    const m = MARKETS[activeMarketId];
    if (!m) return;

    if (!marketLabelEl) {
      marketLabelEl = document.createElement("div");
      marketLabelEl.className = "market-label";

      marketLabelEl.style.background = "rgba(24, 69, 67, 0.9)";
      marketLabelEl.style.borderRadius = "8px";
      marketLabelEl.style.padding = "10px";
      marketLabelEl.style.color = "#FFFFFF";

      marketLabelEl.style.fontWeight = "700";
      marketLabelEl.style.fontSize = "16px";
      marketLabelEl.style.lineHeight = "1.2";
      marketLabelEl.style.textAlign = "center";
      marketLabelEl.style.maxWidth = "360px";
      marketLabelEl.style.pointerEvents = "none";
      marketLabelEl.style.boxShadow = "0 8px 24px rgba(0,0,0,0.18)";
    }

    marketLabelEl.textContent = m.name;

    if (!marketLabelMarker) {
      marketLabelMarker = new mapboxgl.Marker({
        element: marketLabelEl,
        anchor: "center",
      })
        .setLngLat(m.labelLngLat)
        .addTo(map);
    } else {
      marketLabelMarker.setLngLat(m.labelLngLat);
    }
  }

  // =========================
  // Load Budapest boundary
  // =========================
  async function loadMarketBoundaryIfNeeded(marketId) {
    const m = MARKETS[marketId];
    if (!m || m.feature || !m.boundaryUrl) return;

    try {
      const res = await fetch(m.boundaryUrl);
      if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
      const fc = await res.json();

      const feature = fc?.features?.[0];
      if (!feature || feature.type !== "Feature") {
        console.warn("[markets.js] Boundary JSON has no valid Feature.");
        return;
      }

      feature.properties = feature.properties || {};
      feature.properties.id = feature.properties.id || marketId;

      m.feature = feature;
    } catch (e) {
      console.error("[markets.js] Failed to load boundary:", e);
    }
  }

  function getActiveMarketFeature() {
    return MARKETS[activeMarketId]?.feature;
  }

  // =========================
  // Polygon layers
  // =========================
  function ensureMarketLayers() {
    const feature = getActiveMarketFeature();
    if (!feature) return;

    if (!map.getSource(MARKET_SOURCE_ID)) {
      map.addSource(MARKET_SOURCE_ID, { type: "geojson", data: feature });
    } else {
      map.getSource(MARKET_SOURCE_ID).setData(feature);
    }

    if (!map.getLayer(MARKET_FILL_LAYER_ID)) {
      map.addLayer({
        id: MARKET_FILL_LAYER_ID,
        type: "fill",
        source: MARKET_SOURCE_ID,
        paint: {
          "fill-color": "#23F1E0",
          "fill-opacity": 0,
        },
      });
    }

    if (!map.getLayer(MARKET_OUTLINE_LAYER_ID)) {
      map.addLayer({
        id: MARKET_OUTLINE_LAYER_ID,
        type: "line",
        source: MARKET_SOURCE_ID,
        paint: {
          "line-color": "#23F1E0",
          "line-width": 1.8,
        },
      });
    }
  }

  function fitToFeatureBounds(feature, { padding = 80, duration = 800 } = {}) {
    const bounds = new mapboxgl.LngLatBounds();

    const extendRing = (ring) => ring.forEach((c) => bounds.extend(c));

    const geom = feature.geometry;
    if (geom.type === "Polygon") {
      geom.coordinates.forEach((ring) => extendRing(ring));
    } else if (geom.type === "MultiPolygon") {
      geom.coordinates.forEach((poly) =>
        poly.forEach((ring) => extendRing(ring))
      );
    } else {
      console.warn("[markets.js] Unsupported geometry:", geom.type);
      return;
    }

    map.fitBounds(bounds, { padding, duration });
  }

  // =========================
  // Cluster layers (markers)
  // =========================
  function ensureClusterLayers() {
    const markers = MARKET_MARKERS[activeMarketId] || [];
    const fc = markersToFeatureCollection(markers);

    if (!map.getSource(MARKET_POINTS_SOURCE_ID)) {
      map.addSource(MARKET_POINTS_SOURCE_ID, {
        type: "geojson",
        data: fc,
        cluster: true,
        clusterRadius: 55,
        clusterMaxZoom: CLUSTER_MAX_ZOOM,
      });
    } else {
      map.getSource(MARKET_POINTS_SOURCE_ID).setData(fc);
    }

    if (!map.getLayer(CLUSTERS_SHADOW1_LAYER_ID)) {
      map.addLayer({
        id: CLUSTERS_SHADOW1_LAYER_ID,
        type: "circle",
        source: MARKET_POINTS_SOURCE_ID,
        filter: ["has", "point_count"],
        paint: {
          "circle-color": "rgba(0,0,0,0.10)",
          "circle-blur": 0.7,
          "circle-radius": ["step", ["get", "point_count"], 26, 10, 30, 30, 36, 50, 42],
        },
      });
    }

    if (!map.getLayer(CLUSTERS_SHADOW2_LAYER_ID)) {
      map.addLayer({
        id: CLUSTERS_SHADOW2_LAYER_ID,
        type: "circle",
        source: MARKET_POINTS_SOURCE_ID,
        filter: ["has", "point_count"],
        paint: {
          "circle-color": "rgba(0,0,0,0.25)",
          "circle-blur": 0.3,
          "circle-radius": ["step", ["get", "point_count"], 22, 10, 26, 30, 32, 50, 38],
        },
      });
    }

    if (!map.getLayer(CLUSTERS_LAYER_ID)) {
      map.addLayer({
        id: CLUSTERS_LAYER_ID,
        type: "circle",
        source: MARKET_POINTS_SOURCE_ID,
        filter: ["has", "point_count"],
        paint: {
          "circle-color": "#EAEDF4",
          "circle-opacity": 1,
          "circle-radius": ["step", ["get", "point_count"], 18, 10, 22, 30, 28, 50, 34],
          "circle-stroke-color": "rgba(0,0,0,0.08)",
          "circle-stroke-width": 1,
        },
      });
    }

    if (!map.getLayer(CLUSTER_COUNT_LAYER_ID)) {
      map.addLayer({
        id: CLUSTER_COUNT_LAYER_ID,
        type: "symbol",
        source: MARKET_POINTS_SOURCE_ID,
        filter: ["has", "point_count"],
        layout: {
          "text-field": ["get", "point_count_abbreviated"],
          "text-font": ["Open Sans Bold", "Arial Unicode MS Bold"],
          "text-size": 14,
        },
        paint: {
          "text-color": "#003840",
        },
      });
    }

    if (!map.getLayer(UNCLUSTERED_LAYER_ID)) {
      map.addLayer({
        id: UNCLUSTERED_LAYER_ID,
        type: "circle",
        source: MARKET_POINTS_SOURCE_ID,
        filter: ["!", ["has", "point_count"]],
        paint: {
          "circle-color": "#23F1E0",
          "circle-radius": 7,
          "circle-stroke-color": "#ffffff",
          "circle-stroke-width": 2,
        },
      });
    }

    bindClusterEventsOnce();
  }

  function bindClusterEventsOnce() {
    if (map.__marketClusterEventsBound) return;
    map.__marketClusterEventsBound = true;

    // ✅ UPDATED: Clicking cluster => zoom deep enough to reveal markers
   map.on("click", CLUSTERS_LAYER_ID, (e) => {
  const features = map.queryRenderedFeatures(e.point, { layers: [CLUSTERS_LAYER_ID] });
  const clusterFeature = features && features[0];
  if (!clusterFeature) return;

  const source = map.getSource(MARKET_POINTS_SOURCE_ID);
  const clusterId = clusterFeature.properties && clusterFeature.properties.cluster_id;

  // Safety checks
  if (!source) {
    console.warn("[markets.js] Cluster click: source not found:", MARKET_POINTS_SOURCE_ID);
    return;
  }
  if (clusterId === undefined || clusterId === null) {
    console.warn("[markets.js] Cluster click: cluster_id missing on feature");
    return;
  }

  const center = clusterFeature.geometry.coordinates;

  // --- Preferred: fit to the leaves (markers) inside this cluster ---
  // Many MapLibre builds support this even when getClusterExpansionZoom is flaky.
  if (typeof source.getClusterLeaves === "function") {
    const LEAF_LIMIT = 100; // increase if needed
    source.getClusterLeaves(clusterId, LEAF_LIMIT, 0, (err, leaves) => {
      if (err) {
        console.warn("[markets.js] getClusterLeaves error, falling back:", err);
        // fallback: just zoom in a bit
        map.easeTo({ center, zoom: Math.min(map.getZoom() + 2, map.getMaxZoom()), duration: 650 });
        return;
      }

      if (!leaves || !leaves.length) {
        // no leaves returned -> fallback zoom
        map.easeTo({ center, zoom: Math.min(map.getZoom() + 2, map.getMaxZoom()), duration: 650 });
        return;
      }

      // Fit bounds around the leaves (shows the markers inside the cluster)
      const bounds = new mapboxgl.LngLatBounds();
      leaves.forEach((f) => bounds.extend(f.geometry.coordinates));

      map.fitBounds(bounds, {
        padding: 80,
        duration: 650,
        maxZoom: CLUSTER_MAX_ZOOM + 2, // ensures we go past cluster max
      });
    });

    return;
  }

  // --- Secondary: try expansion zoom if available ---
  if (typeof source.getClusterExpansionZoom === "function") {
    source.getClusterExpansionZoom(clusterId, (err, zoom) => {
      if (err) {
        console.warn("[markets.js] getClusterExpansionZoom error, falling back:", err);
        map.easeTo({ center, zoom: Math.min(map.getZoom() + 2, map.getMaxZoom()), duration: 650 });
        return;
      }

      const targetZoom = Math.min(
        Math.max(zoom + 2, CLUSTER_MAX_ZOOM + 1),
        map.getMaxZoom()
      );

      map.easeTo({ center, zoom: targetZoom, duration: 650 });
    });

    return;
  }

  // --- Last resort fallback ---
  map.easeTo({ center, zoom: Math.min(map.getZoom() + 2, map.getMaxZoom()), duration: 650 });
});
 

    map.on("click", UNCLUSTERED_LAYER_ID, (e) => {
      const feature = e.features?.[0];
      if (!feature) return;

      const coords = feature.geometry.coordinates.slice();
      const img = feature.properties?.image || "";

      const html = `
        <div style="display:flex;flex-direction:column;gap:8px;max-width:220px;">
          ${img ? `<img src="${img}" alt="Property" style="width:100%;height:auto;border-radius:10px;" />` : ""}
          <div style="font-weight:700;color:#003840;">Property</div>
        </div>
      `;

      new mapboxgl.Popup({ closeButton: false, closeOnClick: true, offset: 18 })
        .setLngLat(coords)
        .setHTML(html)
        .addTo(map);
    });

    map.on("mouseenter", CLUSTERS_LAYER_ID, () => (map.getCanvas().style.cursor = "pointer"));
    map.on("mouseleave", CLUSTERS_LAYER_ID, () => (map.getCanvas().style.cursor = ""));
    map.on("mouseenter", UNCLUSTERED_LAYER_ID, () => (map.getCanvas().style.cursor = "pointer"));
    map.on("mouseleave", UNCLUSTERED_LAYER_ID, () => (map.getCanvas().style.cursor = ""));
  }

  // =========================
  // Set active market
  // =========================
  async function setActiveMarket(marketId, { fit = true } = {}) {
    if (!MARKETS[marketId]) return;
    activeMarketId = marketId;

    if (!map.isStyleLoaded()) {
      map.once("style.load", () => setActiveMarket(marketId, { fit }));
      return;
    }

    await loadMarketBoundaryIfNeeded(activeMarketId);

    ensureMarketLayers();
    ensureMarketLabelMarker();
    ensureClusterLayers();

    const feature = getActiveMarketFeature();
    if (feature) map.getSource(MARKET_SOURCE_ID)?.setData(feature);

    const markers = MARKET_MARKERS[activeMarketId] || [];
    map.getSource(MARKET_POINTS_SOURCE_ID)?.setData(markersToFeatureCollection(markers));

    if (fit && feature) fitToFeatureBounds(feature);

    document.querySelectorAll(".market-btn[data-market-id]").forEach((btn) => {
      btn.classList.toggle("is-active", btn.dataset.marketId === marketId);
      btn.setAttribute("aria-selected", btn.dataset.marketId === marketId ? "true" : "false");
    });
  }

  function bindMarketButtons() {
    const container = document.querySelector(".market-buttons");
    if (!container) return;

    container.addEventListener("click", (e) => {
      const btn = e.target.closest(".market-btn[data-market-id]");
      if (!btn) return;
      setActiveMarket(btn.dataset.marketId, { fit: true });
    });
  }

  window.setActiveMarket = setActiveMarket;

  map.on("style.load", async () => {
    await loadMarketBoundaryIfNeeded(activeMarketId);
    ensureMarketLayers();
    ensureClusterLayers();
    ensureMarketLabelMarker();
  });

  map.on("load", async () => {
    await setActiveMarket(activeMarketId, { fit: true });
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bindMarketButtons);
  } else {
    bindMarketButtons();
  }
})();

 
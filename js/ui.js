// Matrix Custom Configuration UI Component
// Designed with a premium Matrix glassmorphic cyber-aesthetic

// Helper: Convert hex string "#rrggbb" to float HSL [h, s, l] in range [0, 1]
function hexToFloatHSL(hex) {
	let r = parseInt(hex.slice(1, 3), 16) / 255;
	let g = parseInt(hex.slice(3, 5), 16) / 255;
	let b = parseInt(hex.slice(5, 7), 16) / 255;

	let max = Math.max(r, g, b),
		min = Math.min(r, g, b);
	let h,
		s,
		l = (max + min) / 2;

	if (max === min) {
		h = s = 0; // achromatic
	} else {
		let d = max - min;
		s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
		switch (max) {
			case r:
				h = (g - b) / d + (g < b ? 6 : 0);
				break;
			case g:
				h = (b - r) / d + 2;
				break;
			case b:
				h = (r - g) / d + 4;
				break;
		}
		h /= 6;
	}
	return [h, s, l];
}

// Helper: Convert float HSL [h, s, l] in range [0, 1] to hex string "#rrggbb"
function floatHSLToHex(h, s, l) {
	let r, g, b;
	if (s === 0) {
		r = g = b = l; // achromatic
	} else {
		const hue2rgb = (p, q, t) => {
			if (t < 0) t += 1;
			if (t > 1) t -= 1;
			if (t < 1 / 6) return p + (q - p) * 6 * t;
			if (t < 1 / 2) return q;
			if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
			return p;
		};
		let q = l < 0.5 ? l * (1 + s) : l + s - l * s;
		let p = 2 * l - q;
		r = hue2rgb(p, q, h + 1 / 3);
		g = hue2rgb(p, q, h);
		b = hue2rgb(p, q, h - 1 / 3);
	}
	const toHex = (x) => {
		const hex = Math.round(x * 255).toString(16);
		return hex.length === 1 ? "0" + hex : hex;
	};
	return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

const getHexColor = (colorObj, defaultHex) => {
	if (colorObj && colorObj.space === "hsl" && colorObj.values) {
		return floatHSLToHex(colorObj.values[0], colorObj.values[1], colorObj.values[2]);
	}
	if (colorObj && colorObj.space === "rgb" && colorObj.values) {
		const toHex = (x) => {
			const hex = Math.round(x * 255).toString(16);
			return hex.length === 1 ? "0" + hex : hex;
		};
		return `#${toHex(colorObj.values[0])}${toHex(colorObj.values[1])}${toHex(colorObj.values[2])}`;
	}
	return defaultHex;
};

// UI stylesheet content
const styleContent = `
:root {
	--matrix-glow: #00ff41;
	--matrix-dim: #003b00;
	--matrix-dark: #050103;
	--matrix-panel-bg: rgba(5, 1, 3, 0.88);
	--matrix-font: 'Courier New', Courier, monospace;
}

/* Gear toggle button */
.matrix-ui-toggle {
	position: fixed;
	top: 1.5rem;
	right: 1.5rem;
	z-index: 10000;
	width: 3.2rem;
	height: 3.2rem;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	background: rgba(0, 17, 0, 0.8);
	border: 2px solid var(--matrix-glow);
	color: var(--matrix-glow);
	font-size: 1.6rem;
	cursor: pointer;
	transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	box-shadow: 0 0 12px rgba(0, 255, 65, 0.4);
	user-select: none;
	opacity: 0.8;
}

.matrix-ui-toggle:hover {
	opacity: 1;
	box-shadow: 0 0 20px rgba(0, 255, 65, 0.8);
	transform: rotate(45deg) scale(1.1);
}

.matrix-ui-toggle.idle-fade {
	opacity: 0.15;
}

.matrix-ui-toggle.idle-fade:hover {
	opacity: 1;
}

/* UI Panel Drawer */
.matrix-ui-drawer {
	position: fixed;
	top: 0;
	right: 0;
	width: 380px;
	max-width: 95vw;
	height: 100vh;
	z-index: 9999;
	background: var(--matrix-panel-bg);
	backdrop-filter: blur(16px);
	-webkit-backdrop-filter: blur(16px);
	border-left: 2px solid rgba(0, 255, 65, 0.35);
	display: flex;
	flex-direction: column;
	font-family: var(--matrix-font);
	font-size: 14px;
	text-align: left;
	color: var(--matrix-glow);
	box-shadow: -10px 0 35px rgba(0, 0, 0, 0.95);
	transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
	transform: translateX(100%);
	box-sizing: border-box;
}

.matrix-ui-drawer.open {
	transform: translateX(0);
}

/* Header */
.matrix-ui-header {
	padding: 1.5rem 1.2rem;
	border-bottom: 2px solid rgba(0, 255, 65, 0.2);
	display: flex;
	justify-content: space-between;
	align-items: center;
	background: rgba(0, 15, 0, 0.3);
}

.matrix-ui-title {
	margin: 0;
	font-size: 1.25rem;
	font-weight: bold;
	text-shadow: 0 0 8px var(--matrix-glow);
	letter-spacing: 2px;
	text-transform: uppercase;
}

.matrix-ui-close-btn {
	background: none;
	border: none;
	color: var(--matrix-glow);
	font-size: 1.5rem;
	cursor: pointer;
	font-family: var(--matrix-font);
	transition: transform 0.2s;
}

.matrix-ui-close-btn:hover {
	transform: scale(1.2);
	text-shadow: 0 0 10px var(--matrix-glow);
}

/* Body / Sections Container */
.matrix-ui-body {
	flex: 1;
	overflow-y: auto;
	padding: 1rem;
	box-sizing: border-box;
}

/* Custom Scrollbars */
.matrix-ui-body::-webkit-scrollbar {
	width: 6px;
}
.matrix-ui-body::-webkit-scrollbar-track {
	background: rgba(0, 10, 0, 0.15);
}
.matrix-ui-body::-webkit-scrollbar-thumb {
	background: rgba(0, 255, 65, 0.35);
	border-radius: 3px;
}
.matrix-ui-body::-webkit-scrollbar-thumb:hover {
	background: var(--matrix-glow);
}

/* Accordion Accord */
.matrix-ui-section {
	margin-bottom: 0.8rem;
	border: 1px solid rgba(0, 255, 65, 0.15);
	border-radius: 4px;
	overflow: hidden;
	background: rgba(0, 10, 0, 0.2);
}

.matrix-ui-section-header {
	padding: 0.75rem 1rem;
	background: rgba(0, 255, 65, 0.05);
	display: flex;
	justify-content: space-between;
	align-items: center;
	cursor: pointer;
	font-weight: bold;
	font-size: 0.95rem;
	text-transform: uppercase;
	letter-spacing: 1px;
	border-bottom: 1px solid transparent;
	transition: background 0.3s;
	user-select: none;
}

.matrix-ui-section-header:hover {
	background: rgba(0, 255, 65, 0.12);
	text-shadow: 0 0 6px var(--matrix-glow);
}

.matrix-ui-section.active .matrix-ui-section-header {
	border-bottom: 1px solid rgba(0, 255, 65, 0.25);
	background: rgba(0, 255, 65, 0.08);
}

.matrix-ui-section-content {
	display: none;
	padding: 1rem;
	background: rgba(0, 0, 0, 0.4);
	box-sizing: border-box;
}

.matrix-ui-section.active .matrix-ui-section-content {
	display: block;
}

.matrix-ui-accordion-arrow {
	transition: transform 0.3s;
	font-size: 0.8rem;
}

.matrix-ui-section.active .matrix-ui-accordion-arrow {
	transform: rotate(90deg);
}

/* Form Controls */
.matrix-ui-row {
	display: flex;
	flex-direction: column;
	margin-bottom: 0.95rem;
}

.matrix-ui-row:last-child {
	margin-bottom: 0;
}

.matrix-ui-label-container {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 0.35rem;
	font-size: 0.85rem;
	color: rgba(0, 255, 65, 0.85);
}

.matrix-ui-value {
	color: var(--matrix-glow);
	font-weight: bold;
	font-size: 0.85rem;
	text-shadow: 0 0 4px rgba(0, 255, 65, 0.5);
}

/* Range Inputs */
.matrix-ui-slider {
	-webkit-appearance: none;
	width: 100%;
	height: 5px;
	border-radius: 2px;
	background: rgba(0, 255, 65, 0.2);
	outline: none;
	transition: background 0.3s;
	box-sizing: border-box;
}

.matrix-ui-slider:hover {
	background: rgba(0, 255, 65, 0.35);
}

.matrix-ui-slider::-webkit-slider-thumb {
	-webkit-appearance: none;
	appearance: none;
	width: 12px;
	height: 12px;
	border-radius: 50%;
	background: var(--matrix-glow);
	border: 1px solid var(--matrix-dim);
	cursor: pointer;
	box-shadow: 0 0 6px var(--matrix-glow);
	transition: transform 0.15s, box-shadow 0.15s;
}

.matrix-ui-slider::-webkit-slider-thumb:hover {
	transform: scale(1.25);
	box-shadow: 0 0 10px var(--matrix-glow);
}

/* Select Control */
.matrix-ui-select {
	background: rgba(0, 5, 0, 0.9);
	border: 1px solid rgba(0, 255, 65, 0.35);
	color: var(--matrix-glow);
	padding: 0.45rem;
	font-family: var(--matrix-font);
	border-radius: 4px;
	outline: none;
	cursor: pointer;
	box-shadow: 0 0 5px rgba(0, 255, 65, 0.1);
	transition: all 0.3s;
}

.matrix-ui-select:focus, .matrix-ui-select:hover {
	border-color: var(--matrix-glow);
	box-shadow: 0 0 8px rgba(0, 255, 65, 0.3);
}

/* Checkbox Control */
.matrix-ui-checkbox-container {
	flex-direction: row;
	justify-content: space-between;
	align-items: center;
	padding: 0.2rem 0;
	cursor: pointer;
}

.matrix-ui-checkbox {
	appearance: none;
	-webkit-appearance: none;
	width: 16px;
	height: 16px;
	border: 1px solid rgba(0, 255, 65, 0.45);
	border-radius: 3px;
	outline: none;
	cursor: pointer;
	position: relative;
	background: rgba(0, 0, 0, 0.5);
	transition: all 0.2s;
}

.matrix-ui-checkbox:checked {
	background: rgba(0, 255, 65, 0.25);
	border-color: var(--matrix-glow);
	box-shadow: 0 0 8px rgba(0, 255, 65, 0.5);
}

.matrix-ui-checkbox:checked::after {
	content: "✔";
	position: absolute;
	top: -2px;
	left: 2px;
	font-size: 11px;
	color: var(--matrix-glow);
	text-shadow: 0 0 3px var(--matrix-glow);
}

/* Color input */
.matrix-ui-color-row {
	flex-direction: row;
	justify-content: space-between;
	align-items: center;
}

.matrix-ui-color-picker-wrapper {
	display: flex;
	align-items: center;
	gap: 0.5rem;
}

.matrix-ui-color {
	appearance: none;
	-webkit-appearance: none;
	border: 1px solid rgba(0, 255, 65, 0.4);
	width: 32px;
	height: 22px;
	border-radius: 3px;
	cursor: pointer;
	background: none;
	padding: 0;
	outline: none;
}

.matrix-ui-color::-webkit-color-swatch-wrapper {
	padding: 0;
}
.matrix-ui-color::-webkit-color-swatch {
	border: none;
	border-radius: 2px;
}

/* Footer & Action Buttons */
.matrix-ui-footer {
	padding: 1.2rem;
	border-top: 2px solid rgba(0, 255, 65, 0.2);
	background: rgba(0, 12, 0, 0.3);
	display: flex;
	flex-direction: column;
	gap: 0.8rem;
}

.matrix-ui-auto-row {
	display: flex;
	align-items: center;
	justify-content: space-between;
	font-size: 0.85rem;
	color: rgba(0, 255, 65, 0.85);
	cursor: pointer;
	margin-bottom: 0.2rem;
}

.matrix-ui-btn {
	font-family: var(--matrix-font);
	font-size: 0.9rem;
	font-weight: bold;
	padding: 0.65rem;
	background: transparent;
	border: 1.5px solid var(--matrix-glow);
	color: var(--matrix-glow);
	border-radius: 4px;
	cursor: pointer;
	text-transform: uppercase;
	letter-spacing: 1px;
	transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	text-align: center;
	text-shadow: 0 0 5px rgba(0, 255, 65, 0.5);
	box-shadow: 0 0 8px rgba(0, 255, 65, 0.25);
}

.matrix-ui-btn:hover {
	background: rgba(0, 255, 65, 0.15);
	box-shadow: 0 0 16px rgba(0, 255, 65, 0.6);
	text-shadow: 0 0 8px var(--matrix-glow);
}

.matrix-ui-btn:active {
	transform: scale(0.97);
}

.matrix-ui-btn.primary {
	background: rgba(0, 255, 65, 0.12);
	border-color: var(--matrix-glow);
	box-shadow: 0 0 12px rgba(0, 255, 65, 0.4);
}

.matrix-ui-btn.primary:hover {
	background: rgba(0, 255, 65, 0.25);
	box-shadow: 0 0 22px rgba(0, 255, 65, 0.95);
}

.matrix-ui-btn.secondary {
	border-color: rgba(0, 255, 65, 0.45);
	color: rgba(0, 255, 65, 0.85);
	box-shadow: none;
}

.matrix-ui-btn.secondary:hover {
	border-color: var(--matrix-glow);
	color: var(--matrix-glow);
	background: rgba(0, 255, 65, 0.08);
}

/* Toast message style */
.matrix-ui-toast {
	position: fixed;
	bottom: 2rem;
	left: 50%;
	transform: translateX(-50%) translateY(100px);
	background: rgba(0, 15, 0, 0.9);
	border: 1.5px solid var(--matrix-glow);
	color: var(--matrix-glow);
	z-index: 10005;
	font-family: var(--matrix-font);
	font-size: 0.9rem;
	padding: 0.75rem 1.5rem;
	border-radius: 4px;
	box-shadow: 0 0 18px rgba(0, 255, 65, 0.6);
	text-shadow: 0 0 5px var(--matrix-glow);
	transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
	pointer-events: none;
}

.matrix-ui-toast.visible {
	transform: translateX(-50%) translateY(0);
}

/* Custom Text/Number Inputs */
.matrix-ui-input {
	background: rgba(0, 5, 0, 0.9);
	border: 1px solid rgba(0, 255, 65, 0.35);
	color: var(--matrix-glow);
	padding: 0.45rem;
	font-family: var(--matrix-font);
	border-radius: 4px;
	outline: none;
	cursor: text;
	box-shadow: 0 0 5px rgba(0, 255, 65, 0.1);
	transition: all 0.3s;
}

.matrix-ui-input:focus, .matrix-ui-input:hover {
	border-color: var(--matrix-glow);
	box-shadow: 0 0 8px rgba(0, 255, 65, 0.3);
}

/* Capture / Recording styles */
.matrix-ui-btn.capture {
	background: rgba(255, 0, 85, 0.12);
	border-color: #ff0055;
	color: #ff0055;
	text-shadow: 0 0 5px rgba(255, 0, 85, 0.5);
	box-shadow: 0 0 12px rgba(255, 0, 85, 0.4);
	margin-top: 0.6rem;
}

.matrix-ui-btn.capture:hover {
	background: rgba(255, 0, 85, 0.25);
	box-shadow: 0 0 22px rgba(255, 0, 85, 0.95);
	text-shadow: 0 0 8px #ff0055;
}

.matrix-ui-btn.capture.recording {
	background: rgba(255, 0, 85, 0.4);
	color: #ffffff;
	animation: matrix-capture-pulse 1s infinite alternate;
}

.matrix-ui-recording-overlay {
	position: fixed;
	top: 2rem;
	left: 2rem;
	z-index: 10001;
	background: rgba(5, 1, 3, 0.85);
	border: 2px solid #ff0055;
	padding: 1rem 1.5rem;
	border-radius: 8px;
	font-family: var(--matrix-font);
	color: #ff0055;
	box-shadow: 0 0 20px rgba(255, 0, 85, 0.4);
	display: flex;
	align-items: center;
	pointer-events: none;
	backdrop-filter: blur(10px);
	-webkit-backdrop-filter: blur(10px);
	transition: opacity 0.3s;
}

.matrix-ui-recording-content {
	display: flex;
	align-items: center;
	gap: 0.8rem;
}

.matrix-ui-recording-dot {
	width: 12px;
	height: 12px;
	background: #ff0055;
	border-radius: 50%;
	animation: matrix-capture-pulse 0.6s infinite alternate;
}

.matrix-ui-recording-text {
	font-weight: bold;
	letter-spacing: 1px;
	font-size: 0.95rem;
}

.matrix-ui-recording-timer {
	font-weight: bold;
	font-variant-numeric: tabular-nums;
	background: rgba(255, 0, 85, 0.15);
	padding: 0.2rem 0.6rem;
	border-radius: 4px;
	border: 1px solid rgba(255, 0, 85, 0.3);
}

@keyframes matrix-capture-pulse {
	from {
		box-shadow: 0 0 12px rgba(255, 0, 85, 0.5);
	}
	to {
		box-shadow: 0 0 25px rgba(255, 0, 85, 0.95);
	}
}

.matrix-ui-prominent-box {
	background: rgba(0, 45, 10, 0.25);
	border: 2.5px solid var(--matrix-glow);
	border-radius: 6px;
	padding: 0.9rem;
	margin: 1.2rem 0;
	box-shadow: 0 0 16px rgba(0, 255, 65, 0.25);
}
.matrix-ui-prominent-box-header {
	font-weight: bold;
	text-transform: uppercase;
	font-size: 0.85rem;
	letter-spacing: 2px;
	color: #ffffff;
	text-shadow: 0 0 8px var(--matrix-glow);
	margin-bottom: 0.85rem;
	border-bottom: 1.5px solid rgba(0, 255, 65, 0.4);
	padding-bottom: 0.4rem;
	display: flex;
	justify-content: space-between;
	align-items: center;
}
.matrix-ui-prominent-input {
	width: 100%;
	box-sizing: border-box;
	background: rgba(0, 8, 0, 0.95);
	border: 2px solid var(--matrix-glow);
	color: #ffffff;
	font-size: 1.1rem;
	padding: 0.65rem;
	font-weight: bold;
	font-family: var(--matrix-font);
	border-radius: 4px;
	outline: none;
	text-align: center;
	letter-spacing: 1.5px;
	box-shadow: 0 0 10px rgba(0, 255, 65, 0.2);
	transition: all 0.3s;
	animation: matrix-border-pulse 2s infinite alternate;
}
.matrix-ui-prominent-input:focus {
	background: rgba(0, 15, 0, 0.98);
	box-shadow: 0 0 20px rgba(0, 255, 65, 0.8);
	border-color: #ffffff;
}
@keyframes matrix-border-pulse {
	0% { border-color: rgba(0, 255, 65, 0.55); box-shadow: 0 0 8px rgba(0, 255, 65, 0.25); }
	100% { border-color: var(--matrix-glow); box-shadow: 0 0 20px rgba(0, 255, 65, 0.6); }
}
`;

export function initUI(config) {
	// 1. Inject Styles
	const styleTag = document.createElement("style");
	styleTag.textContent = styleContent;
	document.head.appendChild(styleTag);

	// Parse current URL
	const urlParams = new URLSearchParams(window.location.search);

	// Get active values
	const getParam = (name, fallback) => {
		const mapping = {
			version: "version",
			renderer: "renderer",
			font: "font",
			effect: "effect",
			numColumns: "numColumns",
			density: "density",
			resolution: "resolution",
			animationSpeed: "animationSpeed",
			forwardSpeed: "forwardSpeed",
			cycleSpeed: "cycleSpeed",
			fallSpeed: "fallSpeed",
			raindropLength: "raindropLength",
			slant: "slant",
			bloomSize: "bloomSize",
			bloomStrength: "bloomStrength",
			ditherMagnitude: "ditherMagnitude",
			cursorIntensity: "cursorIntensity",
			volumetric: "volumetric",
			glyphFlip: "glyphFlip",
			glyphRotation: "glyphRotation",
			loops: "loops",
			fps: "fps",
			skipIntro: "skipIntro",
			isolateCursor: "isolateCursor",
			isolateGlint: "isolateGlint",
			glintIntensity: "glintIntensity",
			customMessage: "message",
			messageColumn: "messageColumn",
		};
		const key = mapping[name] || name;
		return urlParams.has(key) ? urlParams.get(key) : null;
	};

	// State for Auto Apply
	let autoApply = localStorage.getItem("matrix_ui_auto_apply") !== "false";
	let debounceTimer = null;

	// 2. Build Toggle Button
	const toggleBtn = document.createElement("button");
	toggleBtn.className = "matrix-ui-toggle";
	toggleBtn.title = "System Configuration Panel";
	toggleBtn.innerHTML = `⚙️`;
	document.body.appendChild(toggleBtn);

	// 3. Build UI Panel
	const drawer = document.createElement("div");
	drawer.className = "matrix-ui-drawer";

	const activeVersion = getParam("version") || "classic";
	const activeRenderer = getParam("renderer") || config.renderer || "regl";
	const activeFont = getParam("font") || config.font || "matrixcode";
	const activeEffect = getParam("effect") || config.effect || "palette";
	const activeSlant = getParam("slant") != null ? parseFloat(getParam("slant")) : 0; // standard config has it in radians, URL is in degrees
	const activeColumns = getParam("numColumns") != null ? parseInt(getParam("numColumns")) : config.numColumns;
	const activeFallSpeed = getParam("fallSpeed") != null ? parseFloat(getParam("fallSpeed")) : config.fallSpeed;
	const activeAnimSpeed = getParam("animationSpeed") != null ? parseFloat(getParam("animationSpeed")) : config.animationSpeed;
	const activeDropLength = getParam("raindropLength") != null ? parseFloat(getParam("raindropLength")) : config.raindropLength;
	const activeCycleSpeed = getParam("cycleSpeed") != null ? parseFloat(getParam("cycleSpeed")) : config.cycleSpeed;

	const activeBloomSize = getParam("bloomSize") != null ? parseFloat(getParam("bloomSize")) : config.bloomSize;
	const activeBloomStrength = getParam("bloomStrength") != null ? parseFloat(getParam("bloomStrength")) : config.bloomStrength;
	const activeDither = getParam("ditherMagnitude") != null ? parseFloat(getParam("ditherMagnitude")) : config.ditherMagnitude;
	const activeResolution = getParam("resolution") != null ? parseFloat(getParam("resolution")) : config.resolution;
	const activeFPS = getParam("fps") != null ? parseInt(getParam("fps")) : config.fps;

	const activeVolumetric = getParam("volumetric") != null ? getParam("volumetric") === "true" : config.volumetric;
	const activeDensity = getParam("density") != null ? parseFloat(getParam("density")) : config.density;
	const activeForwardSpeed = getParam("forwardSpeed") != null ? parseFloat(getParam("forwardSpeed")) : config.forwardSpeed;
	const activeMessage = getParam("customMessage") || config.customMessage || "";
	const activeMessageColumn = getParam("messageColumn") != null ? parseInt(getParam("messageColumn")) : config.messageColumn;
	const activeMessageAllColumns = getParam("messageAllColumns") != null ? getParam("messageAllColumns") === "true" : config.messageAllColumns;

	const activeIsolateCursor = getParam("isolateCursor") != null ? getParam("isolateCursor") === "true" : config.isolateCursor;
	const activeCursorIntensity = getParam("cursorIntensity") != null ? parseFloat(getParam("cursorIntensity")) : config.cursorIntensity;
	const activeIsolateGlint = getParam("isolateGlint") != null ? getParam("isolateGlint") === "true" : config.isolateGlint;
	const activeGlintIntensity = getParam("glintIntensity") != null ? parseFloat(getParam("glintIntensity")) : config.glintIntensity;
	const activeGlyphFlip = getParam("glyphFlip") != null ? getParam("glyphFlip") === "true" : config.glyphFlip;
	const activeGlyphRotation = getParam("glyphRotation") != null ? parseInt(getParam("glyphRotation")) : config.glyphRotation;
	const activeLoops = getParam("loops") != null ? getParam("loops") === "true" : config.loops;
	const activeSkipIntro = getParam("skipIntro") != null ? getParam("skipIntro") === "true" : config.skipIntro;

	const initialBgHex = getHexColor(config.backgroundColor, "#000000");
	const initialCursorHex = getHexColor(config.cursorColor, "#ffffff");
	const initialGlintHex = getHexColor(config.glintColor, "#ffffff");
	drawer.innerHTML = `
		<div class="matrix-ui-header">
			<h2 class="matrix-ui-title">System Config</h2>
			<button class="matrix-ui-close-btn" title="Close Panel">✕</button>
		</div>
		<div class="matrix-ui-body">
			<!-- Presets & Rendering -->
			<div class="matrix-ui-section active">
				<div class="matrix-ui-section-header">
					Presets & Render
					<span class="matrix-ui-accordion-arrow">▶</span>
				</div>
				<div class="matrix-ui-section-content">
					<div class="matrix-ui-row">
						<div class="matrix-ui-label-container">
							<label for="ctrl-version">Matrix Variant</label>
							<span class="matrix-ui-value" id="val-version">${activeVersion}</span>
						</div>
						<select id="ctrl-version" class="matrix-ui-select">
							<option value="classic">Classic (Sequels)</option>
							<option value="resurrections">Resurrections</option>
							<option value="operator">Operator (Original)</option>
							<option value="megacity">Megacity</option>
							<option value="neomatrixology">Neo-Matrixology</option>
							<option value="nightmare">Nightmare (Merovingian)</option>
							<option value="paradise">Paradise (Idyllic)</option>
							<option value="trinity">Trinity (Metal/Pixel)</option>
							<option value="morpheus">Morpheus (Mesh/Metal)</option>
							<option value="bugs">Bugs (Sand/Metal)</option>
							<option value="palimpsest">Palimpsest (Rob Dougan)</option>
							<option value="twilight">Twilight (Huberfish D)</option>
							<option value="3d">Classic 3D</option>
							<option value="holoplay">Holographic (LKG)</option>
						</select>
					</div>

					<div class="matrix-ui-row">
						<div class="matrix-ui-label-container">
							<label for="ctrl-renderer">API Backend</label>
							<span class="matrix-ui-value" id="val-renderer">${activeRenderer}</span>
						</div>
						<select id="ctrl-renderer" class="matrix-ui-select">
							<option value="regl">REGL (WebGL)</option>
							<option value="webgpu">WebGPU (Experimental)</option>
						</select>
					</div>

					<div class="matrix-ui-row">
						<div class="matrix-ui-label-container">
							<label for="ctrl-resolution">Resolution Scale</label>
							<span class="matrix-ui-value" id="val-resolution">${activeResolution}</span>
						</div>
						<input type="range" id="ctrl-resolution" class="matrix-ui-slider" min="0.25" max="2" step="0.05" value="${activeResolution}">
					</div>

					<div class="matrix-ui-row">
						<div class="matrix-ui-label-container">
							<label for="ctrl-fps">Framerate Limit</label>
							<span class="matrix-ui-value" id="val-fps">${activeFPS} FPS</span>
						</div>
						<input type="range" id="ctrl-fps" class="matrix-ui-slider" min="5" max="60" step="5" value="${activeFPS}">
					</div>

					<div class="matrix-ui-row matrix-ui-checkbox-container">
						<label for="ctrl-skipIntro">Skip Startup Intro</label>
						<input type="checkbox" id="ctrl-skipIntro" class="matrix-ui-checkbox" ${activeSkipIntro ? "checked" : ""}>
					</div>
				</div>
			</div>

			<!-- Rain & Slant -->
			<div class="matrix-ui-section">
				<div class="matrix-ui-section-header">
					Rain & Grid Geometry
					<span class="matrix-ui-accordion-arrow">▶</span>
				</div>
				<div class="matrix-ui-section-content">
					<div class="matrix-ui-row">
						<div class="matrix-ui-label-container">
							<label for="ctrl-numColumns">Grid Columns</label>
							<span class="matrix-ui-value" id="val-numColumns">${activeColumns}</span>
						</div>
						<input type="range" id="ctrl-numColumns" class="matrix-ui-slider" min="10" max="250" step="1" value="${activeColumns}">
					</div>

					<div class="matrix-ui-row">
						<div class="matrix-ui-label-container">
							<label for="ctrl-slant">Slant Angle</label>
							<span class="matrix-ui-value" id="val-slant">${activeSlant}°</span>
						</div>
						<input type="range" id="ctrl-slant" class="matrix-ui-slider" min="-90" max="90" step="1" value="${activeSlant}">
					</div>

					<div class="matrix-ui-row">
						<div class="matrix-ui-label-container">
							<label for="ctrl-fallSpeed">Fall Speed</label>
							<span class="matrix-ui-value" id="val-fallSpeed">${activeFallSpeed}</span>
						</div>
						<input type="range" id="ctrl-fallSpeed" class="matrix-ui-slider" min="-2" max="2.5" step="0.05" value="${activeFallSpeed}">
					</div>

					<div class="matrix-ui-row">
						<div class="matrix-ui-label-container">
							<label for="ctrl-animationSpeed">Global Speed</label>
							<span class="matrix-ui-value" id="val-animationSpeed">${activeAnimSpeed}</span>
						</div>
						<input type="range" id="ctrl-animationSpeed" class="matrix-ui-slider" min="0" max="3" step="0.05" value="${activeAnimSpeed}">
					</div>

					<div class="matrix-ui-row">
						<div class="matrix-ui-label-container">
							<label for="ctrl-raindropLength">Raindrop Frequency</label>
							<span class="matrix-ui-value" id="val-raindropLength">${activeDropLength}</span>
						</div>
						<input type="range" id="ctrl-raindropLength" class="matrix-ui-slider" min="0.1" max="3" step="0.05" value="${activeDropLength}">
					</div>

					<div class="matrix-ui-row">
						<div class="matrix-ui-label-container">
							<label for="ctrl-cycleSpeed">Glyph Mutation Rate</label>
							<span class="matrix-ui-value" id="val-cycleSpeed">${activeCycleSpeed}</span>
						</div>
						<input type="range" id="ctrl-cycleSpeed" class="matrix-ui-slider" min="0" max="0.5" step="0.005" value="${activeCycleSpeed}">
					</div>
				</div>
			</div>

			<!-- Visuals & Colors -->
			<div class="matrix-ui-section">
				<div class="matrix-ui-section-header">
					Glyphs & Colors
					<span class="matrix-ui-accordion-arrow">▶</span>
				</div>
				<div class="matrix-ui-section-content">
					<div class="matrix-ui-row">
						<div class="matrix-ui-label-container">
							<label for="ctrl-font">Code Font Set</label>
							<span class="matrix-ui-value" id="val-font">${activeFont}</span>
						</div>
						<select id="ctrl-font" class="matrix-ui-select">
							<option value="matrixcode">Standard Matrix</option>
							<option value="resurrections">Resurrections Extended</option>
							<option value="gothic">Nightmare Gothic</option>
							<option value="coptic">Paradise Coptic</option>
							<option value="huberfishA">Huberfish A (Utopian)</option>
							<option value="huberfishD">Huberfish D (Utopian)</option>
							<option value="neomatrixology">Neo-Matrixology</option>
							<option value="gtarg_tenretniolleh">Internet Hell</option>
							<option value="gtarg_alientext">Alien Codex</option>
						</select>
					</div>

					<div class="matrix-ui-row">
						<div class="matrix-ui-label-container">
							<label for="ctrl-effect">Colorization Shader</label>
							<span class="matrix-ui-value" id="val-effect">${activeEffect}</span>
						</div>
						<select id="ctrl-effect" class="matrix-ui-select">
							<option value="palette">Dynamic Color Palette</option>
							<option value="stripes">Vertical Matrix Stripes</option>
							<option value="pride">Pride LGBTQ+ Stripes</option>
							<option value="trans">Trans Pride Stripes</option>
							<option value="image">Wiki Image Texture Map</option>
							<option value="plain">Classic Raw Greyscale</option>
							<option value="none">Diagnostic Debug View</option>
						</select>
					</div>

					<!-- Custom Hidden Message Input Prominent Section -->
					<div class="matrix-ui-prominent-box">
						<div class="matrix-ui-prominent-box-header">
							<span>ACCENT CIPHER CONFIG</span>
							<span class="matrix-ui-value" id="val-message">${activeMessage ? "ACTIVE" : "INACTIVE"}</span>
						</div>
						<div style="margin-bottom: 0.85rem;">
							<label for="ctrl-message" style="display: block; font-size: 0.75rem; color: rgba(0, 255, 65, 0.7); margin-bottom: 0.35rem; text-transform: uppercase;">Hidden Message Text</label>
							<input type="text" id="ctrl-message" class="matrix-ui-prominent-input" placeholder="e.g. SHABAB KHAN" value="${activeMessage}">
						</div>
						
						<!-- Row for options -->
						<div style="display: flex; gap: 0.75rem; align-items: center; margin-top: 0.75rem; justify-content: space-between; font-size: 0.8rem;">
							<div style="display: flex; align-items: center; gap: 0.4rem; cursor: pointer;">
								<input type="checkbox" id="ctrl-messageAllColumns" class="matrix-ui-checkbox" ${activeMessageAllColumns ? "checked" : ""}>
								<label for="ctrl-messageAllColumns" style="cursor: pointer; color: var(--matrix-glow); font-weight: bold;">Display on All Columns</label>
							</div>
						</div>
						<div id="ctrl-column-row" style="margin-top: 0.75rem; display: ${activeMessageAllColumns ? "none" : "block"};">
							<div class="matrix-ui-label-container" style="margin-bottom: 0.25rem;">
								<label for="ctrl-messageColumn" style="font-size: 0.75rem; color: rgba(0, 255, 65, 0.7);">Cipher Column Index</label>
								<span class="matrix-ui-value" id="val-messageColumn">${activeMessageColumn >= 0 ? activeMessageColumn : "Center Column"}</span>
							</div>
							<input type="number" id="ctrl-messageColumn" class="matrix-ui-input" min="-1" max="250" placeholder="-1 (Center)" value="${activeMessageColumn}" style="width: 100%; box-sizing: border-box;">
						</div>
					</div>

					<div class="matrix-ui-row matrix-ui-color-row">
						<label for="ctrl-backgroundColor">Background Space</label>
						<input type="color" id="ctrl-backgroundColor" class="matrix-ui-color" value="${initialBgHex}">
					</div>

					<div class="matrix-ui-row matrix-ui-color-row">
						<label for="ctrl-cursorColor">Rain Tracer (Cursor)</label>
						<div class="matrix-ui-color-picker-wrapper">
							<input type="checkbox" id="ctrl-isolateCursor" class="matrix-ui-checkbox" ${activeIsolateCursor ? "checked" : ""}>
							<input type="color" id="ctrl-cursorColor" class="matrix-ui-color" value="${initialCursorHex}">
						</div>
					</div>

					<div class="matrix-ui-row">
						<div class="matrix-ui-label-container">
							<label for="ctrl-cursorIntensity">Tracer Intensity</label>
							<span class="matrix-ui-value" id="val-cursorIntensity">${activeCursorIntensity}</span>
						</div>
						<input type="range" id="ctrl-cursorIntensity" class="matrix-ui-slider" min="0" max="10" step="0.1" value="${activeCursorIntensity}">
					</div>

					<div class="matrix-ui-row matrix-ui-color-row">
						<label for="ctrl-glintColor">Glint Texture Highlight</label>
						<div class="matrix-ui-color-picker-wrapper">
							<input type="checkbox" id="ctrl-isolateGlint" class="matrix-ui-checkbox" ${activeIsolateGlint ? "checked" : ""}>
							<input type="color" id="ctrl-glintColor" class="matrix-ui-color" value="${initialGlintHex}">
						</div>
					</div>

					<div class="matrix-ui-row">
						<div class="matrix-ui-label-container">
							<label for="ctrl-glintIntensity">Glint Intensity</label>
							<span class="matrix-ui-value" id="val-glintIntensity">${activeGlintIntensity}</span>
						</div>
						<input type="range" id="ctrl-glintIntensity" class="matrix-ui-slider" min="0" max="10" step="0.1" value="${activeGlintIntensity}">
					</div>

					<div class="matrix-ui-row matrix-ui-checkbox-container">
						<label for="ctrl-glyphFlip">Flip Glyphs Horizontally</label>
						<input type="checkbox" id="ctrl-glyphFlip" class="matrix-ui-checkbox" ${activeGlyphFlip ? "checked" : ""}>
					</div>

					<div class="matrix-ui-row">
						<div class="matrix-ui-label-container">
							<label for="ctrl-glyphRotation">In-Place Glyph Rotation</label>
							<span class="matrix-ui-value" id="val-glyphRotation">${activeGlyphRotation}°</span>
						</div>
						<select id="ctrl-glyphRotation" class="matrix-ui-select">
							<option value="0" ${activeGlyphRotation === 0 ? "selected" : ""}>0° (Standard)</option>
							<option value="90" ${activeGlyphRotation === 90 ? "selected" : ""}>90° (Quarter)</option>
							<option value="180" ${activeGlyphRotation === 180 ? "selected" : ""}>180° (Inverted)</option>
							<option value="270" ${activeGlyphRotation === 270 ? "selected" : ""}>270° (Mirror Quarter)</option>
						</select>
					</div>
				</div>
			</div>

			<!-- Bloom & Atmosphere -->
			<div class="matrix-ui-section">
				<div class="matrix-ui-section-header">
					Bloom & Atmosphere
					<span class="matrix-ui-accordion-arrow">▶</span>
				</div>
				<div class="matrix-ui-section-content">
					<div class="matrix-ui-row">
						<div class="matrix-ui-label-container">
							<label for="ctrl-bloomStrength">Bloom Strength</label>
							<span class="matrix-ui-value" id="val-bloomStrength">${activeBloomStrength}</span>
						</div>
						<input type="range" id="ctrl-bloomStrength" class="matrix-ui-slider" min="0" max="1" step="0.05" value="${activeBloomStrength}">
					</div>

					<div class="matrix-ui-row">
						<div class="matrix-ui-label-container">
							<label for="ctrl-bloomSize">Bloom Size</label>
							<span class="matrix-ui-value" id="val-bloomSize">${activeBloomSize}</span>
						</div>
						<input type="range" id="ctrl-bloomSize" class="matrix-ui-slider" min="0" max="1" step="0.05" value="${activeBloomSize}">
					</div>

					<div class="matrix-ui-row">
						<div class="matrix-ui-label-container">
							<label for="ctrl-ditherMagnitude">Banding Dither</label>
							<span class="matrix-ui-value" id="val-ditherMagnitude">${activeDither}</span>
						</div>
						<input type="range" id="ctrl-ditherMagnitude" class="matrix-ui-slider" min="0" max="0.2" step="0.01" value="${activeDither}">
					</div>
				</div>
			</div>

			<!-- Volumetrics & Depth -->
			<div class="matrix-ui-section">
				<div class="matrix-ui-section-header">
					3D Depth & Volumetrics
					<span class="matrix-ui-accordion-arrow">▶</span>
				</div>
				<div class="matrix-ui-section-content">
					<div class="matrix-ui-row matrix-ui-checkbox-container">
						<label for="ctrl-volumetric">Enable Volumetric 3D</label>
						<input type="checkbox" id="ctrl-volumetric" class="matrix-ui-checkbox" ${activeVolumetric ? "checked" : ""}>
					</div>

					<div class="matrix-ui-row">
						<div class="matrix-ui-label-container">
							<label for="ctrl-density">3D Stream Density</label>
							<span class="matrix-ui-value" id="val-density">${activeDensity}</span>
						</div>
						<input type="range" id="ctrl-density" class="matrix-ui-slider" min="0.1" max="5" step="0.1" value="${activeDensity}">
					</div>

					<div class="matrix-ui-row">
						<div class="matrix-ui-label-container">
							<label for="ctrl-forwardSpeed">Approach Speed</label>
							<span class="matrix-ui-value" id="val-forwardSpeed">${activeForwardSpeed}</span>
						</div>
						<input type="range" id="ctrl-forwardSpeed" class="matrix-ui-slider" min="0" max="2" step="0.05" value="${activeForwardSpeed}">
					</div>

					<div class="matrix-ui-row matrix-ui-checkbox-container">
						<label for="ctrl-loops">Infinite Loop Mode</label>
						<input type="checkbox" id="ctrl-loops" class="matrix-ui-checkbox" ${activeLoops ? "checked" : ""}>
					</div>
				</div>
			</div>
		</div>
		<div class="matrix-ui-footer">
			<div class="matrix-ui-auto-row" title="Automatically apply adjustments on input changes">
				<span>Auto-Apply Live</span>
				<input type="checkbox" id="ctrl-auto-apply" class="matrix-ui-checkbox" ${autoApply ? "checked" : ""}>
			</div>
			<button class="matrix-ui-btn primary" id="btn-apply">Apply Protocol</button>
			<button class="matrix-ui-btn secondary" id="btn-save-defaults" title="Save current settings as system default">Save defaults</button>
			<button class="matrix-ui-btn secondary" id="btn-copy">Copy System Link</button>
			<button class="matrix-ui-btn secondary" id="btn-reset">Revert defaults</button>
			<button class="matrix-ui-btn capture" id="btn-record">⚡ RECORD SEQUENCE (10s) ⚡</button>
		</div>
	`;
	document.body.appendChild(drawer);

	// 4. Build Toast message element
	const toast = document.createElement("div");
	toast.className = "matrix-ui-toast";
	document.body.appendChild(toast);

	function showToast(message) {
		toast.textContent = message;
		toast.classList.add("visible");
		setTimeout(() => {
			toast.classList.remove("visible");
		}, 2000);
	}

	// 5. Accordion Event Listeners
	const sectionHeaders = drawer.querySelectorAll(".matrix-ui-section-header");
	sectionHeaders.forEach((header) => {
		header.addEventListener("click", () => {
			const section = header.parentElement;
			section.classList.toggle("active");
		});
	});

	// Toggle drawer open/close
	const toggleDrawer = () => {
		drawer.classList.toggle("open");
	};
	toggleBtn.addEventListener("click", toggleDrawer);
	drawer.querySelector(".matrix-ui-close-btn").addEventListener("click", toggleDrawer);

	// Auto-hide Gear button on mouse inactivity
	let mouseMoveTimer = null;
	const onMouseMove = () => {
		toggleBtn.classList.remove("idle-fade");
		clearTimeout(mouseMoveTimer);
		mouseMoveTimer = setTimeout(() => {
			if (!drawer.classList.contains("open")) {
				toggleBtn.classList.add("idle-fade");
			}
		}, 3000);
	};
	window.addEventListener("mousemove", onMouseMove);
	onMouseMove(); // trigger initially

	// Value Display Updating & Collection of Parameters
	const getValues = () => {
		const result = {};

		// Version & Preset
		result.version = drawer.querySelector("#ctrl-version").value;
		result.renderer = drawer.querySelector("#ctrl-renderer").value;
		result.font = drawer.querySelector("#ctrl-font").value;
		result.effect = drawer.querySelector("#ctrl-effect").value;
		result.resolution = drawer.querySelector("#ctrl-resolution").value;
		result.fps = drawer.querySelector("#ctrl-fps").value;
		result.skipIntro = drawer.querySelector("#ctrl-skipIntro").checked;

		// Geometry
		result.numColumns = drawer.querySelector("#ctrl-numColumns").value;
		result.slant = drawer.querySelector("#ctrl-slant").value;
		result.fallSpeed = drawer.querySelector("#ctrl-fallSpeed").value;
		result.animationSpeed = drawer.querySelector("#ctrl-animationSpeed").value;
		result.raindropLength = drawer.querySelector("#ctrl-raindropLength").value;
		result.cycleSpeed = drawer.querySelector("#ctrl-cycleSpeed").value;

		// Custom Message
		result.customMessage = drawer.querySelector("#ctrl-message").value;
		result.messageColumn = drawer.querySelector("#ctrl-messageColumn").value;
		result.messageAllColumns = drawer.querySelector("#ctrl-messageAllColumns").checked;

		// Custom Colors
		const bgPicker = drawer.querySelector("#ctrl-backgroundColor");
		const cursorPicker = drawer.querySelector("#ctrl-cursorColor");
		const glintPicker = drawer.querySelector("#ctrl-glintColor");

		const bgHSL = hexToFloatHSL(bgPicker.value);
		const cursorHSL = hexToFloatHSL(cursorPicker.value);
		const glintHSL = hexToFloatHSL(glintPicker.value);

		result.backgroundHSL = bgHSL.map((v) => v.toFixed(3)).join(",");
		result.cursorHSL = cursorHSL.map((v) => v.toFixed(3)).join(",");
		result.glintHSL = glintHSL.map((v) => v.toFixed(3)).join(",");

		result.isolateCursor = drawer.querySelector("#ctrl-isolateCursor").checked;
		result.cursorIntensity = drawer.querySelector("#ctrl-cursorIntensity").value;
		result.isolateGlint = drawer.querySelector("#ctrl-isolateGlint").checked;
		result.glintIntensity = drawer.querySelector("#ctrl-glintIntensity").value;
		result.glyphFlip = drawer.querySelector("#ctrl-glyphFlip").checked;
		result.glyphRotation = drawer.querySelector("#ctrl-glyphRotation").value;

		// Bloom
		result.bloomStrength = drawer.querySelector("#ctrl-bloomStrength").value;
		result.bloomSize = drawer.querySelector("#ctrl-bloomSize").value;
		result.ditherMagnitude = drawer.querySelector("#ctrl-ditherMagnitude").value;

		// 3D Depth
		result.volumetric = drawer.querySelector("#ctrl-volumetric").checked;
		result.density = drawer.querySelector("#ctrl-density").value;
		result.forwardSpeed = drawer.querySelector("#ctrl-forwardSpeed").value;
		result.loops = drawer.querySelector("#ctrl-loops").checked;

		return result;
	};

	// Function to trigger applying config (updates query params and reloads page)
	const applyConfig = () => {
		const values = getValues();
		const newParams = new URLSearchParams();

		// Add custom options
		for (const [key, val] of Object.entries(values)) {
			let paramName = key;
			if (key === "customMessage") paramName = "message";
			if (key === "messageColumn") paramName = "messageColumn";
			if (key === "messageAllColumns") paramName = "messageAllColumns";

			// We only append parameters that differ from a standard classic baseline or are explicitly modified
			newParams.set(paramName, val);
		}

		// Keep panel state open when reloaded
		newParams.set("ui_open", "true");

		const finalSearch = "?" + unescape(newParams.toString());
		window.location.search = finalSearch;
	};

	// Debounced Auto Apply
	const triggerAutoApply = () => {
		if (!autoApply) return;
		clearTimeout(debounceTimer);
		debounceTimer = setTimeout(() => {
			applyConfig();
		}, 8000); // 8-second debounce for auto-apply to allow user to drag comfortably without instant reloads
	};

	// Update active labels dynamically as sliders are moved
	const updateLabels = () => {
		const values = getValues();
		drawer.querySelector("#val-version").textContent = values.version;
		drawer.querySelector("#val-renderer").textContent = values.renderer === "webgpu" ? "WebGPU" : "REGL (WebGL)";
		drawer.querySelector("#val-font").textContent = values.font;
		drawer.querySelector("#val-effect").textContent = values.effect;
		drawer.querySelector("#val-resolution").textContent = values.resolution;
		drawer.querySelector("#val-fps").textContent = values.fps + " FPS";

		drawer.querySelector("#val-numColumns").textContent = values.numColumns;
		drawer.querySelector("#val-slant").textContent = values.slant + "°";
		drawer.querySelector("#val-fallSpeed").textContent = values.fallSpeed;
		drawer.querySelector("#val-animationSpeed").textContent = values.animationSpeed;
		drawer.querySelector("#val-raindropLength").textContent = values.raindropLength;
		drawer.querySelector("#val-cycleSpeed").textContent = parseFloat(values.cycleSpeed).toFixed(3);

		const hasMsg = !!(values.customMessage && values.customMessage.trim());
		drawer.querySelector("#val-message").textContent = hasMsg ? "ACTIVE" : "INACTIVE";
		drawer.querySelector("#val-messageColumn").textContent = parseInt(values.messageColumn) >= 0 ? values.messageColumn : "Center Column";

		drawer.querySelector("#val-cursorIntensity").textContent = values.cursorIntensity;
		drawer.querySelector("#val-glintIntensity").textContent = values.glintIntensity;
		drawer.querySelector("#val-glyphRotation").textContent = values.glyphRotation + "°";

		drawer.querySelector("#val-bloomStrength").textContent = values.bloomStrength;
		drawer.querySelector("#val-bloomSize").textContent = values.bloomSize;
		drawer.querySelector("#val-ditherMagnitude").textContent = values.ditherMagnitude;

		drawer.querySelector("#val-density").textContent = values.density;
		drawer.querySelector("#val-forwardSpeed").textContent = values.forwardSpeed;
	};

	// Bind input listeners
	const inputs = drawer.querySelectorAll("input, select");
	inputs.forEach((input) => {
		// Listen for input (dragging/typing) to update labels
		input.addEventListener("input", updateLabels);

		// Listen for final change to trigger autoapply
		input.addEventListener("change", () => {
			updateLabels();
			triggerAutoApply();
		});
	});

	// Toggle Cipher Column Index input row based on "Display on All Columns" checkbox
	const msgAllColsCheckbox = drawer.querySelector("#ctrl-messageAllColumns");
	const columnRow = drawer.querySelector("#ctrl-column-row");
	if (msgAllColsCheckbox && columnRow) {
		msgAllColsCheckbox.addEventListener("change", (e) => {
			columnRow.style.display = e.target.checked ? "none" : "block";
		});
	}

	// Auto apply checkbox change
	drawer.querySelector("#ctrl-auto-apply").addEventListener("change", (e) => {
		autoApply = e.target.checked;
		localStorage.setItem("matrix_ui_auto_apply", autoApply ? "true" : "false");
		if (autoApply) {
			applyConfig();
		}
	});

	// Apply button click
	drawer.querySelector("#btn-apply").addEventListener("click", () => {
		applyConfig();
	});

	// Save current configuration to local storage as default
	drawer.querySelector("#btn-save-defaults").addEventListener("click", () => {
		const values = getValues();
		const savedDict = {};
		for (const [key, val] of Object.entries(values)) {
			let paramName = key;
			if (key === "customMessage") paramName = "message";
			if (key === "messageColumn") paramName = "messageColumn";
			if (key === "messageAllColumns") paramName = "messageAllColumns";
			savedDict[paramName] = val;
		}
		localStorage.setItem("matrix_saved_defaults", JSON.stringify(savedDict));
		showToast("SYSTEM CONFIG: Saved as system defaults!");
	});

	// Copy custom system link
	drawer.querySelector("#btn-copy").addEventListener("click", () => {
		const values = getValues();
		const copyParams = new URLSearchParams();
		for (const [key, val] of Object.entries(values)) {
			let paramName = key;
			if (key === "customMessage") paramName = "message";
			if (key === "messageColumn") paramName = "messageColumn";
			if (key === "messageAllColumns") paramName = "messageAllColumns";
			copyParams.set(paramName, val);
		}
		// Do not force UI open for copied share links
		const shareUrl = window.location.origin + window.location.pathname + "?" + unescape(copyParams.toString());

		navigator.clipboard
			.writeText(shareUrl)
			.then(() => showToast("SYSTEM ACCESSED: Link copied!"))
			.catch(() => showToast("ERROR: Failed to copy link"));
	});

	// Reset default options (clear local storage and reset url)
	drawer.querySelector("#btn-reset").addEventListener("click", () => {
		localStorage.removeItem("matrix_saved_defaults");
		showToast("SYSTEM PROTOCOL: Restored factory settings!");
		setTimeout(() => {
			window.location.search = "ui_open=true"; // Reset all except opening the UI
		}, 800);
	});

	// 10-Second High-Fidelity Canvas Video Recorder
	const btnRecord = drawer.querySelector("#btn-record");
	btnRecord.addEventListener("click", () => {
		const canvas = document.querySelector("canvas");
		if (!canvas) {
			showToast("ERROR: Render canvas not found");
			return;
		}

		if (typeof window.MediaRecorder === "undefined") {
			showToast("ERROR: MediaRecorder not supported in this browser");
			return;
		}

		// Disable button and mark recording status
		btnRecord.disabled = true;
		btnRecord.classList.add("recording");
		btnRecord.textContent = "🔴 INITIALIZING RECORDER...";

		// Setup stream from canvas at 30 fps
		const stream = canvas.captureStream(30);

		// Determine premium visual codec support, prioritizing native MP4 / H264 formats for Apple/QuickTime compatibility
		const candidateMimeTypes = [
			"video/mp4;codecs=h264",
			"video/mp4;codecs=avc1",
			"video/mp4",
			"video/webm;codecs=h264",
			"video/webm;codecs=vp9",
			"video/webm;codecs=vp8",
			"video/webm",
		];

		let mimeType = "";
		for (const type of candidateMimeTypes) {
			if (MediaRecorder.isTypeSupported(type)) {
				mimeType = type;
				break;
			}
		}

		let options = {};
		if (mimeType) {
			options.mimeType = mimeType;
		}

		const chunks = [];
		const recorder = new MediaRecorder(stream, options);

		recorder.ondataavailable = (e) => {
			if (e.data && e.data.size > 0) {
				chunks.push(e.data);
			}
		};

		recorder.onstop = () => {
			const activeMime = options.mimeType || chunks[0]?.type || "video/mp4";
			const blob = new Blob(chunks, { type: activeMime });
			const url = URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			a.download = `matrix-capture-${Date.now()}.mp4`;
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
			URL.revokeObjectURL(url);
			showToast("DECRYPTED: Capture downloaded successfully!");
		};

		// Premium Recording Status HUD Overlay
		const overlay = document.createElement("div");
		overlay.className = "matrix-ui-recording-overlay";
		overlay.innerHTML = `
			<div class="matrix-ui-recording-content">
				<div class="matrix-ui-recording-dot"></div>
				<div class="matrix-ui-recording-text">RECORDING PROTOCOL SECURED</div>
				<div class="matrix-ui-recording-timer">10.0s</div>
			</div>
		`;
		document.body.appendChild(overlay);

		let secondsRemaining = 10.0;
		overlay.querySelector(".matrix-ui-recording-timer").textContent = `${secondsRemaining.toFixed(1)}s`;
		btnRecord.textContent = `🔴 CAPTURING (${secondsRemaining.toFixed(1)}s)`;

		const timerInterval = setInterval(() => {
			secondsRemaining -= 0.1;
			if (secondsRemaining <= 0) {
				secondsRemaining = 0;
				clearInterval(timerInterval);
			}
			overlay.querySelector(".matrix-ui-recording-timer").textContent = `${secondsRemaining.toFixed(1)}s`;
			btnRecord.textContent = `🔴 CAPTURING (${secondsRemaining.toFixed(1)}s)`;
		}, 100);

		// Start recording sequence
		recorder.start();
		showToast("RECORDER INITIATED: Capturing 10 seconds of high-fidelity rain");

		setTimeout(() => {
			recorder.stop();
			clearInterval(timerInterval);
			if (document.body.contains(overlay)) {
				document.body.removeChild(overlay);
			}
			btnRecord.classList.remove("recording");
			btnRecord.textContent = "⚡ RECORD SEQUENCE (10s) ⚡";
			btnRecord.disabled = false;
		}, 10000);
	});

	// Check if URL specifies that UI should be open on load (e.g. from reload)
	if (urlParams.get("ui_open") === "true") {
		drawer.classList.add("open");
	}
}

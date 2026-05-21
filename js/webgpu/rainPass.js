import { structs } from "../../lib/gpu-buffer.js";
import { makeRenderTarget, loadTexture, loadShader, makeUniformBuffer, makeBindGroup, makePass } from "./utils.js";

const rippleTypes = {
	box: 0,
	circle: 1,
};

const numVerticesPerQuad = 2 * 3;

const makeConfigBuffer = (device, configUniforms, config, density, gridSize, glyphTransform) => {
	const charToGlyphIndex = {
		A: 26,
		B: 44,
		C: 53,
		D: 40,
		E: 1,
		F: 25,
		G: 34,
		H: 23,
		I: 37,
		J: 39,
		K: 3,
		L: 36,
		M: 54,
		N: 20,
		O: 4,
		P: 44,
		Q: 52,
		R: 37,
		S: 8,
		T: 15,
		U: 28,
		V: 42,
		W: 16,
		X: 51,
		Y: 2,
		Z: 10,
		" ": 38,
		0: 24,
		1: 11,
		2: 13,
		3: 27,
		4: 17,
		5: 12,
		6: 0,
		7: 6,
		8: 22,
		9: 21,
	};

	const messageStr = (config.customMessage || "").trim();
	const messageEnabled = messageStr.length > 0 ? 1 : 0;
	const messageLength = Math.min(messageStr.length, 32);
	const messageIndices = Array(32).fill(0);
	const seqLength = config.glyphSequenceLength || 57;

	const upperMessage = messageStr.toUpperCase();
	for (let i = 0; i < messageLength; i++) {
		const char = upperMessage[i];
		if (char in charToGlyphIndex) {
			messageIndices[i] = charToGlyphIndex[char];
		} else {
			messageIndices[i] = char.charCodeAt(0) % seqLength;
		}
	}

	const messageColumn = config.messageColumn >= 0 ? config.messageColumn : Math.floor(gridSize[0] / 2);

	const messageIndices0 = messageIndices.slice(0, 4);
	const messageIndices1 = messageIndices.slice(4, 8);
	const messageIndices2 = messageIndices.slice(8, 12);
	const messageIndices3 = messageIndices.slice(12, 16);
	const messageIndices4 = messageIndices.slice(16, 20);
	const messageIndices5 = messageIndices.slice(20, 24);
	const messageIndices6 = messageIndices.slice(24, 28);
	const messageIndices7 = messageIndices.slice(28, 32);

	const configData = {
		...config,
		gridSize,
		density,
		showDebugView: config.effect === "none",
		rippleType: config.rippleTypeName in rippleTypes ? rippleTypes[config.rippleTypeName] : -1,
		slantScale: 1 / (Math.abs(Math.sin(2 * config.slant)) * (Math.sqrt(2) - 1) + 1),
		slantVec: [Math.cos(config.slant), Math.sin(config.slant)],
		msdfPxRange: 4,
		glyphTransform,
		messageEnabled,
		messageLength,
		messageColumn,
		messageAllColumns: config.messageAllColumns ? 1 : 0,
		messageIndices0,
		messageIndices1,
		messageIndices2,
		messageIndices3,
		messageIndices4,
		messageIndices5,
		messageIndices6,
		messageIndices7,
	};
	// console.table(configData);

	return makeUniformBuffer(device, configUniforms, configData);
};

export default ({ config, device, timeBuffer }) => {
	const { mat2, mat4, vec2, vec3 } = glMatrix;

	const assets = [
		loadTexture(device, config.glyphMSDFURL),
		loadTexture(device, config.glintMSDFURL),
		loadTexture(device, config.baseTextureURL, false, true),
		loadTexture(device, config.glintTextureURL, false, true),
		loadShader(device, "shaders/wgsl/rainPass.wgsl"),
	];

	// The volumetric mode multiplies the number of columns
	// to reach the desired density, and then overlaps them
	const density = config.volumetric && config.effect !== "none" ? config.density : 1;
	const gridSize = [Math.floor(config.numColumns * density), config.numColumns];
	const numCells = gridSize[0] * gridSize[1];

	// The volumetric mode requires us to create a grid of quads,
	// rather than a single quad for our geometry
	const numQuads = config.volumetric ? numCells : 1;

	const glyphTransform = mat2.fromScaling(mat2.create(), vec2.fromValues(config.glyphFlip ? -1 : 1, 1));
	mat2.rotate(glyphTransform, glyphTransform, (config.glyphRotation * Math.PI) / 180);

	const transform = mat4.create();
	if (config.volumetric && config.isometric) {
		mat4.rotateX(transform, transform, (Math.PI * 1) / 8);
		mat4.rotateY(transform, transform, (Math.PI * 1) / 4);
		mat4.translate(transform, transform, vec3.fromValues(0, 0, -1));
		mat4.scale(transform, transform, vec3.fromValues(1, 1, 2));
	} else {
		mat4.translate(transform, transform, vec3.fromValues(0, 0, -1));
	}
	const camera = mat4.create();

	// TODO: vantage points, multiple renders

	// We use the different channels for different parts of the raindrop
	const renderFormat = "rgba8unorm";

	const linearSampler = device.createSampler({
		magFilter: "linear",
		minFilter: "linear",
	});

	const renderPassConfig = {
		colorAttachments: [
			{
				// view: null,
				loadOp: "clear",
				storeOp: "store",
			},
			{
				// view: null,
				loadOp: "clear",
				storeOp: "store",
			},
		],
	};

	let configBuffer;
	let sceneUniforms;
	let sceneBuffer;
	let introPipeline;
	let computePipeline;
	let renderPipeline;
	let introBindGroup;
	let computeBindGroup;
	let renderBindGroup;
	let output;
	let highPassOutput;

	const loaded = (async () => {
		const [glyphMSDFTexture, glintMSDFTexture, baseTexture, glintTexture, rainShader] = await Promise.all(assets);

		const rainShaderUniforms = structs.from(rainShader.code);
		configBuffer = makeConfigBuffer(device, rainShaderUniforms.Config, config, density, gridSize, glyphTransform);

		const introCellsBuffer = device.createBuffer({
			size: gridSize[0] * rainShaderUniforms.IntroCell.minSize,
			usage: GPUBufferUsage.STORAGE,
		});

		const cellsBuffer = device.createBuffer({
			size: numCells * rainShaderUniforms.Cell.minSize,
			usage: GPUBufferUsage.STORAGE,
		});

		sceneUniforms = rainShaderUniforms.Scene;
		sceneBuffer = makeUniformBuffer(device, sceneUniforms);

		const additiveBlendComponent = {
			operation: "add",
			srcFactor: "one",
			dstFactor: "one",
		};

		[introPipeline, computePipeline, renderPipeline] = await Promise.all([
			device.createComputePipelineAsync({
				layout: "auto",
				compute: {
					module: rainShader.module,
					entryPoint: "computeIntro",
				},
			}),

			device.createComputePipelineAsync({
				layout: "auto",
				compute: {
					module: rainShader.module,
					entryPoint: "computeMain",
				},
			}),

			device.createRenderPipelineAsync({
				layout: "auto",
				vertex: {
					module: rainShader.module,
					entryPoint: "vertMain",
				},
				fragment: {
					module: rainShader.module,
					entryPoint: "fragMain",
					targets: [
						{
							format: renderFormat,
							blend: {
								color: additiveBlendComponent,
								alpha: additiveBlendComponent,
							},
						},
						{
							format: renderFormat,
							blend: {
								color: additiveBlendComponent,
								alpha: additiveBlendComponent,
							},
						},
					],
				},
			}),
		]);

		introBindGroup = makeBindGroup(device, introPipeline, 0, [configBuffer, timeBuffer, introCellsBuffer]);
		computeBindGroup = makeBindGroup(device, computePipeline, 0, [configBuffer, timeBuffer, cellsBuffer, introCellsBuffer]);
		renderBindGroup = makeBindGroup(device, renderPipeline, 0, [
			configBuffer,
			timeBuffer,
			sceneBuffer,
			linearSampler,
			glyphMSDFTexture.createView(),
			glintMSDFTexture.createView(),
			baseTexture.createView(),
			glintTexture.createView(),
			cellsBuffer,
		]);
	})();

	const build = (size) => {
		// Update scene buffer: camera and transform math for the volumetric mode
		const aspectRatio = size[0] / size[1];
		if (config.volumetric && config.isometric) {
			if (aspectRatio > 1) {
				mat4.orthoZO(camera, -1.5 * aspectRatio, 1.5 * aspectRatio, -1.5, 1.5, -1000, 1000);
			} else {
				mat4.orthoZO(camera, -1.5, 1.5, -1.5 / aspectRatio, 1.5 / aspectRatio, -1000, 1000);
			}
		} else {
			mat4.perspectiveZO(camera, (Math.PI / 180) * 90, aspectRatio, 0.0001, 1000);
		}
		const screenSize = aspectRatio > 1 ? [1, aspectRatio] : [1 / aspectRatio, 1];
		device.queue.writeBuffer(sceneBuffer, 0, sceneUniforms.toBuffer({ screenSize, camera, transform }));

		// Update
		output?.destroy();
		output = makeRenderTarget(device, size, renderFormat);

		highPassOutput?.destroy();
		highPassOutput = makeRenderTarget(device, size, renderFormat);

		return {
			primary: output,
			highPass: highPassOutput,
		};
	};

	const run = (encoder, shouldRender) => {
		// We render the code into an Target using MSDFs: https://github.com/Chlumsky/msdfgen

		const introPass = encoder.beginComputePass();
		introPass.setPipeline(introPipeline);
		introPass.setBindGroup(0, introBindGroup);
		introPass.dispatchWorkgroups(Math.ceil(gridSize[0] / 32), 1, 1);
		introPass.end();

		const computePass = encoder.beginComputePass();
		computePass.setPipeline(computePipeline);
		computePass.setBindGroup(0, computeBindGroup);
		computePass.dispatchWorkgroups(Math.ceil(gridSize[0] / 32), gridSize[1], 1);
		computePass.end();

		if (shouldRender) {
			renderPassConfig.colorAttachments[0].view = output.createView();
			renderPassConfig.colorAttachments[1].view = highPassOutput.createView();
			const renderPass = encoder.beginRenderPass(renderPassConfig);
			renderPass.setPipeline(renderPipeline);
			renderPass.setBindGroup(0, renderBindGroup);
			renderPass.draw(numVerticesPerQuad * numQuads, 1, 0, 0);
			renderPass.end();
		}
	};

	return makePass("Rain", loaded, build, run);
};

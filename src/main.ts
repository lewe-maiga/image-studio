import "./style.css";

const filterControls = document.querySelectorAll(".options button") as NodeListOf<HTMLButtonElement>;
const filterScaleControls = document.querySelectorAll(".rotate button");
const filterInput = document.querySelector(".range input") as HTMLInputElement;
const labels = document.querySelector(".labels");
const fileInput = document.querySelector("#upload") as HTMLInputElement;
const chooseImg = document.querySelector(".choose");
const resetBtn = document.querySelector(".reset");
const heightInput = document.querySelector(".height") as HTMLInputElement;
const widthInput = document.querySelector(".width") as HTMLInputElement;
const previewImg = document.querySelector(".preview .preview-mode img") as HTMLImageElement;
const qualityInput = document.querySelector(".quality input") as HTMLInputElement;
const previewBtn = document.querySelector(".preview-icon") as HTMLButtonElement;
const saveImageBtn = document.querySelector(".save") as HTMLButtonElement;
if (
	!filterControls ||
	!filterInput ||
	!labels ||
	!fileInput ||
	!heightInput ||
	!widthInput ||
	!chooseImg ||
	!qualityInput ||
	!resetBtn ||
	!previewBtn
)
	throw new Error("element(s) not found");

let brightness = "100";
let saturation = "100";
let inversion = "0";
let grayscale = "0";
let quality = 0.7;
let rotate = 0;
let flipHorizontal = 1;
let flipVertical = 1;
let originalFile: File | null = null;

const resetEditorFilter = () => {
	brightness = "100";
	saturation = "100";
	inversion = "0";
	grayscale = "0";
	quality = 0.7;
	qualityInput.value = String(quality * 100);
	flipHorizontal = 1;
	flipVertical = 1;
	filterControls[0].click();
	applyFilter();
};

resetBtn.addEventListener("click", async () => {
	resetEditorFilter();
	qualityImgChange();
});

filterControls.forEach((option) => {
	option.addEventListener("click", () => {
		document.querySelector(".active")?.classList.remove("active");

		option.classList.add("active");

		switch (option.id) {
			case "brightness":
				filterInput.max = "200";
				filterInput.value = String(brightness);
				labels.id = "brightness";
				labels.innerHTML = `
                    <span>Brightness</span>
                    <span>${brightness}%</span>`;
				return;
			case "saturation":
				filterInput.max = "200";
				filterInput.value = String(saturation);
				labels.id = "saturation";
				labels.innerHTML = `
                    <span>Saturation</span>
                    <span>${saturation}%</span>`;
				return;
			case "inversion":
				filterInput.max = "100";

				filterInput.value = String(inversion);
				labels.id = "inversion";
				labels.innerHTML = `
                        <span>Inversion</span>
                        <span>${inversion}%</span>`;
				return;
			case "grayscale":
				filterInput.max = "100";

				filterInput.value = String(grayscale);
				labels.id = "grayscale";
				labels.innerHTML = `
                        <span>Grayscale</span>
                        <span>${grayscale}%</span>`;
				return;
			default:
				return;
		}
	});
});

const filterInputRangeChange = () => {
	switch (labels.id) {
		case "brightness":
			brightness = filterInput.value;
			labels.innerHTML = `
                    <span>Brightness</span>
                    <span>${brightness}%</span>`;
			break;
		case "saturation":
			saturation = filterInput.value;
			labels.innerHTML = `
                    <span>Saturation</span>
                    <span>${saturation}%</span>`;
			break;
		case "inversion":
			inversion = filterInput.value;
			labels.innerHTML = `
                        <span>Inversion</span>
                        <span>${inversion}%</span>`;
			break;
		case "grayscale":
			grayscale = filterInput.value;
			labels.innerHTML = `
                        <span>Grayscale</span>
                        <span>${grayscale}%</span>`;
			break;
		default:
			break;
	}
	applyFilter();
};

const loadFile = async () => {
	originalFile = null;
	document.querySelector(".disable")?.classList.remove("disable");

	if (!fileInput.files) return;
	const file = fileInput.files[0];
	previewImg.classList.add("isLoad");
	const imgBitmap = await createImageBitmap(file);
	originalFile = file;

	const width = imgBitmap.width;
	const height = imgBitmap.height;

	const type = file.type;
	widthInput.value = String(width);
	heightInput.value = String(height);

	const blob = (await compressorImage(imgBitmap, type)) as File;
	previewImg.src = URL.createObjectURL(blob);
	resetEditorFilter();
};

const saveImage = async () => {
	if (!originalFile) return;
	const imgBitmap = await createImageBitmap(originalFile);

	const canvas = document.createElement("canvas");
	const width = Number(widthInput.value);
	const height = Number(heightInput.value);

	canvas.width = width;
	canvas.height = height;
	const ctx = canvas.getContext("2d");
	if (!ctx) return;

	ctx.filter = `brightness(${brightness}%) saturate(${saturation}%) invert(${inversion}%) grayscale(${grayscale}%)`;

	ctx.filter = `brightness(${brightness}%) saturate(${saturation}%) invert(${inversion}%) grayscale(${grayscale}%)`;
	ctx.translate(canvas.width / 2, canvas.height / 2);
	if (rotate !== 0) {
		ctx.rotate((rotate * Math.PI) / 180);
	}
	ctx.scale(flipHorizontal, flipVertical);

	ctx.drawImage(imgBitmap, -canvas.width / 2, -canvas.height / 2, canvas.width, canvas.height);

	const link = document.createElement("a");
	link.download = "image.jpg";
	link.href = canvas.toDataURL("image/jpeg", quality);
	canvas.toBlob((blob) => console.log(readableBytes(blob?.size!)), "image/jpeg", quality);
	link.click();
};

const compressorImage = async (img: ImageBitmap, type = "image/jpeg") => {
	const canvas = document.createElement("canvas");
	const width = Number(widthInput.value);
	const height = Number(heightInput.value);

	canvas.width = width;
	canvas.height = height;
	const ctx = canvas.getContext("2d");

	ctx?.drawImage(img, 0, 0);

	return await new Promise((resolve) => {
		canvas.toBlob(resolve, type, quality);
	});
};

const applyFilter = () => {
	previewImg.style.transform = `rotate(${rotate}deg) scale(${flipHorizontal}, ${flipVertical})`;
	previewImg.style.filter = `brightness(${brightness}%) saturate(${saturation}%) invert(${inversion}%) grayscale(${grayscale}%)`;
};

const qualityImgChange = async () => {
	const value = qualityInput.value;
	const qualityValue = document.querySelector("#quality-val");

	if (!qualityValue) return;
	quality = Number(value) / 100;
	qualityValue.innerHTML = `${value}%`;

	if (!originalFile) return;

	const imgBitmap = await createImageBitmap(originalFile);
	const blob = (await compressorImage(imgBitmap)) as File;
	previewImg.src = URL.createObjectURL(blob);
	previewImg.addEventListener("load", () => {
		applyFilter();
	});
};

const readableBytes = (bytes: number) => {
	const i = Math.floor(Math.log(bytes) / Math.log(1024));

	const sizes = ["B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

	return (bytes / Math.pow(1024, i)).toFixed(2) + " " + sizes[i];
};

filterScaleControls.forEach((option) => {
	option.addEventListener("click", () => {
		const id = option.id;
		switch (id) {
			case "left":
				rotate -= 90;
				break;
			case "right":
				rotate += 90;

				break;
			case "vertical":
				flipVertical = flipVertical === 1 ? -1 : 1;
				break;
			case "horizontal":
				flipHorizontal = flipHorizontal === 1 ? -1 : 1;
				break;
			default:
				break;
		}
		applyFilter();
	});
});

fileInput.addEventListener("change", loadFile);
filterInput.addEventListener("input", filterInputRangeChange);
qualityInput.addEventListener("change", qualityImgChange);
chooseImg.addEventListener("click", () => fileInput.click());
saveImageBtn.addEventListener("click", saveImage);
previewBtn.addEventListener("click", async () => {
	const el = document.querySelector(".preview");

	if (!el) return;

	const isAvtive = el.classList.contains("active");
	if (isAvtive) {
		el.classList.remove("active");

		const previewIcon = el.querySelector(".preview-icon");
		const preview = el.querySelector(".preview-mode");
		if (!preview || !previewIcon) return;
		preview.innerHTML = "";
		preview.append(previewImg);
		previewIcon.innerHTML = `<img src="public/preview.svg" alt="">`;
	} else {
		el.classList.add("active");
		const previewIcon = el.querySelector(".preview-icon");
		const preview = el.querySelector(".preview-mode");
		if (!preview || !previewIcon) return;
		const afterUrl = URL.createObjectURL(originalFile!);
		previewIcon.innerHTML = `<img src="public/close.svg" alt="">`;
		const imgBitmap = await createImageBitmap(originalFile!);

		const blob = (await compressorImage(imgBitmap)) as File;
		console.log({ before: readableBytes(originalFile?.size!), after: readableBytes(blob.size) });

		preview.innerHTML = `
		<div
			class="after"
			style="
				background-image: url(${previewImg.src});
				background-size: 900px, 900px;
				transform: rotate(${rotate}deg) scale(${flipHorizontal}, ${flipVertical});
				filter:brightness(${brightness}%) saturate(${saturation}%) invert(${inversion}%) grayscale(${grayscale}%);
			"
		>

			</div>
			<div
				class="before"
				style="
					background-image: url(${afterUrl});
					background-size: 900px, 900px;
			" >

		</div>

			<input type="range" min="1" max="100" value="50" class="slider" name='slider' id="slider">
			<div class='slider-button'></div>
  </div>

		`;

		const slider = document.querySelector("#slider") as HTMLInputElement;
		const foregroundImg = document.querySelector(".before") as HTMLDivElement;
		const sliderButton = document.querySelector(".slider-button") as HTMLDivElement;
		if (!slider || !foregroundImg || !sliderButton) throw new Error("element(s) not found");

		slider.addEventListener("input", () => {
			const sliderPos = slider.value;
			// Update the width of the foreground image

			foregroundImg.style.width = `${sliderPos}%`;
			// Update the position of the slider button

			sliderButton.style.left = `calc(${sliderPos}% - 18px)`;
		});
	}
});

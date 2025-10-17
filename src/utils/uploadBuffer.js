import cloudinary from "../config/cloudinary.js";
import streamfier from "streamifier";

function uploadFromBuffer(filebuffer) {
	return new Promise((resolve, reject) => {
		//prettier-ignore
		const stream = cloudinary.uploader.upload_stream({
            folder: "amigurumis",
            width: 800,
            height: 800,
            crop: "fill" 
        },
        (erro, result) => {
			if (result) resolve(result);
			else reject(erro);
		});
		streamfier.createReadStream(filebuffer).pipe(stream);
	});
}

export default uploadFromBuffer;

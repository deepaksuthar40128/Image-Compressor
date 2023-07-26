const fs = require("fs");
const path = require("path");
const sharp = require("sharp");
let query = process.argv;

function completeFilePath(ImageName) { 
    for (let i = 6; i < query.length; i++) {
        if (ImageName != '')
            ImageName = ImageName + " " + query[i];
        else {
            ImageName = query[i];
        }
    } 
    return ImageName;
}
const calculateImageDimensions = async (buffer) => {
    try {
        const image = sharp(buffer);
        const metadata = await image.metadata();
        const orientation = metadata.orientation || 1;
        let { width, height } = metadata;
        if (orientation >= 5 && orientation <= 8) {
            [width, height] = [height, width];
        }
        return [width, height];
    } catch (error) {
        throw error;
    }
};

const isImage = (file) => {
    let extensionName = path.extname(file);
    let images = ['.png', '.jpeg', '.jpg']
    for (let i = 0; i < images.length; i++) {
        if (images[i] === extensionName) return true;
    }
    return false;
}

const genPath = () => {
    let path = "";
    for (let i = 4; i < query.length; i++) {
        if (path != '')
            path = path + " " + query[i];
        else {
            path = query[i];
        }
    }
    return path;
}

const CompressImage = async function (FilePath, targetPath, ImageName, height, width, quality, maintainRatio) {
    try {
        let Image = fs.readFileSync(path.resolve(FilePath + `/${ImageName}`), 'base64');
        const fileData = Buffer.from(Image, 'base64');
        let targetWidth = width, targetHeight = height;
        if (maintainRatio) {
            const [originalWidth, originalHeight] = await calculateImageDimensions(fileData);
            const originalAspectRatio = originalWidth / originalHeight;
            if (originalAspectRatio > 1) {
                targetWidth = originalWidth;
                targetHeight = Math.floor(originalWidth / originalAspectRatio);
            } else {
                targetHeight = originalWidth;
                targetWidth = Math.floor(originalWidth * originalAspectRatio);
            }
        }

        const compressedBuffer = await sharp(fileData)
            .rotate()
            .resize(targetWidth, targetHeight)
            .jpeg({ quality: quality })
            .toBuffer(); 
        fs.writeFileSync(path.resolve(targetPath + `/${path.basename(ImageName, path.extname(ImageName))}-compressed${path.extname(ImageName)}`), compressedBuffer);
    } catch (err) { 
        console.log("something wrong!!  :/");
    }
}

if (query[2] == 'help') {
    console.log("\n\n=>  For compressing single Image in working folder run 'node index.js this single maintainRatio/coustomHeightXcoustomWidth originalQuality/(1-100) ImageName\n");
    console.log("=>  For compressing all Image in working folder run 'node index.js this multiple originalQuality/(1-100)\n")
    console.log("=>  For compressing all Image in any target folder run 'node index.js path originalQuality/(1-100) path/to/folder")
    console.log("\n\n contact me: deepaksuthar40128@gmail.com")
}
else if (query[2] == "path") {
    try {

        let quality = 100;
        if (query[3] != "originalQuality") quality = parseInt(query[3]);
        let mainPath = genPath();
        let dirPath = path.resolve(mainPath + '/compressedImages');
        if (fs.existsSync(dirPath)) {
            dirPath = path.resolve(mainPath + '/compressedImages-' + Date.now());
        }
        fs.mkdirSync(dirPath);
        let files = fs.readdirSync(mainPath);
        for (let file of files) {
            if (fs.lstatSync(path.resolve(mainPath + `/${file}`)).isFile() && isImage(file)) {
                CompressImage(mainPath, dirPath, file, 100, 100, quality, true);
            }
        }
    } catch (err) {
        console.log("please run 'node index.js help'");
    }
}
else if (query[2] == "this") {
    try {
        if (query[3] == "single") {
            let ImageName = "";
            let height = 100;
            let width = 100;
            let quality = 100;
            let maintainRatio = true;
            if (query[4] != "maintainRatio") {
                maintainRatio = false;
                let resolution = query[4];
                resolution = resolution.split("X");
                height = parseInt(resolution[0]);
                width = parseInt(resolution[1]);
            }
            if (query[5] != "originalQuality") {
                quality = parseInt(query[5]); 
            }
            ImageName = completeFilePath(ImageName); 
            CompressImage(path.resolve(), path.resolve(), ImageName, height, width, quality, maintainRatio);
        }
        else {
            let quality = 100;
            if (query[4] != "originalQuality") quality = parseInt(query[4]);
            let dirPath = path.resolve(path.resolve() + '/compressedImages');
            if (fs.existsSync(dirPath)) {
                dirPath = path.resolve(path.resolve() + '/compressedImages-' + Date.now());
            }
            fs.mkdirSync(dirPath);
            let files = fs.readdirSync(path.resolve());
            for (let file of files) {
                if (fs.lstatSync(path.resolve(path.resolve() + `/${file}`)).isFile() && isImage(file)) {
                    CompressImage(path.resolve(), dirPath, file, 100, 100, quality, true);
                }
            }
        }
    } catch (err) {
        console.log("please run 'node index.js help'");
    }
}





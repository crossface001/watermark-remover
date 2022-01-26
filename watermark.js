var currentImage = 0;
var scale_x, scale_y;
var wm_x = 0, wm_y = 0;
var mouse_x, mouse_y;
var imageInput = document.getElementById('inputImage')
var watermarkInput = document.getElementById('inputWatermark')
var image = document.getElementById('image')
var watermark = document.getElementById('watermark')
var imageContainer = document.getElementById('imageContainer')
var zoomIndicator = document.getElementById('zoom')
var imageBackupUrl = ''
var files
var zoomlevel = 100
var filters = {
    contrast: 1,
    brightness: 1
}

imageInput.addEventListener('change', () => loadImageFromInput())
watermarkInput.addEventListener('change', () => loadWatermark())
document.addEventListener('drop', loadImageFromDrop)
document.addEventListener('dragover', e => e.preventDefault())
image.addEventListener('dragstart', e => e.preventDefault())
document.addEventListener('keydown', moveWatermark)
document.getElementById('overlayMode').addEventListener('change', function(){
    watermark.style.mixBlendMode = this.value
})

function loadImage() {
    if (files.length > currentImage) {
        image.onload = function () {
            if (this.naturalHeight > 32000 || this.naturalWidth > 32000 || this.naturalWidth*this.naturalHeight > 250000000) {
                alert('Image is too large. (Browser limitation)')
                this.width = 0
                this.height = 0
            }
//             this.width = this.naturalWidth
//             this.style.maxWidth = '100%'
//             imageContainer.style.maxWidth = '100%'
//             //reset previous styles
//             imageContainer.style.height = 'unset'
//             imageContainer.style.width = 'unset'
//             this.style.height = 'unset'
//             this.style.width = 'unset'
//             var computedStyle = window.getComputedStyle(this)
//             imageContainer.style.width = computedStyle.width
//             imageContainer.style.height = computedStyle.height
//             scale_x = parseFloat(computedStyle.width.replace('px','')) / parseInt(this.naturalWidth)
//             scale_y = parseFloat(computedStyle.height.replace('px','')) / parseInt(this.naturalHeight)
//             imageContainer.style.maxWidth = 'unset'
//             this.style.maxWidth = 'unset'
//             this.style.width = imageContainer.style.width
//             this.style.height = imageContainer.style.height
            resetZoom()
            this.onload = undefined
        }
        image.src = URL.createObjectURL(files[currentImage])
    } else {
        alert('No more images loaded.')
        currentImage = 0
    }
}
function loadImageFromInput() {
    files = imageInput.files
    loadImage()
}
function loadImageFromDrop(ev) {
    // Prevent default behavior (Prevent file from being opened)
    ev.preventDefault();

    if (ev.dataTransfer.items) {
        // Use DataTransferItemList interface to access the file(s)
        files = []
        for (var i = 0; i < ev.dataTransfer.items.length; i++) {
        // If dropped items aren't files, reject them
            if (ev.dataTransfer.items[i].kind === 'file') {
                files.push(ev.dataTransfer.items[i].getAsFile())
            }
        }
    } else {
        // Use DataTransfer interface to access the file(s)
        files = ev.dataTransfer.files
    }
    loadImage()
}
function loadWatermark() {
    if(scale_x && scale_y) {
        watermark.onload = function () {
            var position = document.getElementById('defaultPosition').value
            if (position == 'center') {
                wm_x = Math.round((image.naturalWidth - this.naturalWidth) / 2)
                wm_y = Math.round((image.naturalHeight - this.naturalHeight) / 2)
            } else {
                if (position.indexOf('right') > -1) {
                    wm_x = image.naturalWidth - this.naturalWidth
                } else {
                    wm_x = 0
                }
                if (position.indexOf('bottom') > -1) {
                    wm_y = image.naturalHeight - this.naturalHeight
                } else {
                    wm_y = 0
                }
            }
            this.style.width = String(scale_x * this.naturalWidth) + 'px'
            this.style.height = String(scale_y * this.naturalHeight) + 'px'
            updateWatermarkPosition()
            this.onmousedown = dragWatermarkStart
        }
        watermark.src = URL.createObjectURL(watermarkInput.files[0])
    } else {
        alert('Load image first.')
    }
}
function updateWatermarkPosition() {
    watermark.style.top = String(wm_y * scale_y) + 'px'
    watermark.style.left = String(wm_x * scale_x) + 'px'
}
function moveWatermark (e) {
    if (watermark.src) {
        switch (e.keyCode) {
            case 37:
                wm_x -= e.ctrlKey ? 0.05 : 1
                break
            case 38:
                wm_y -= e.ctrlKey ? 0.05 : 1
                break
            case 39:
                wm_x += e.ctrlKey ? 0.05 : 1
                break
            case 40:
                wm_y += e.ctrlKey ? 0.05 : 1
                break
            default:
                return
            
        }
        e.preventDefault()
        updateWatermarkPosition()
    }
}
function dragWatermarkStart(e) {
    e = e || window.event;
    e.preventDefault();
    // get the mouse cursor position at startup:
    mouse_x = e.clientX;
    mouse_y = e.clientY;
    document.onmouseup = dragWatermarkEnd;
    // call a function whenever the cursor moves:
    document.onmousemove = dragWatermark;
}
function dragWatermark(e) {
    e = e || window.event;
    e.preventDefault();
    // calculate the new cursor position:
    wm_x -= Math.round((mouse_x - e.clientX) / scale_x);
    wm_y -= Math.round((mouse_y - e.clientY) / scale_y);
    mouse_x = e.clientX;
    mouse_y = e.clientY;
    // set the element's new position:
    updateWatermarkPosition()
}
function dragWatermarkEnd(e) {
    // stop moving when mouse button is released:
    document.onmouseup = null;
    document.onmousemove = null;
}
function unwatermark() {
    var w = watermark.naturalWidth
    if (wm_x + w > image.naturalWidth) {
        w -= (wm_x + w) - image.naturalWidth
    }
    var h = watermark.naturalHeight
    if (wm_y + h > image.naturalHeight) {
        h -= (wm_y + h) - image.naturalHeight
    }
    var x = Math.floor(wm_x)
    var x_sub = wm_x % 1
    var y = Math.floor(wm_y)
    var y_sub = wm_y % 1
    
    //prepare image canvas
    var c = document.createElement('canvas')
    var ctx = c.getContext('2d')
    c.width = image.naturalWidth
    c.height = image.naturalHeight
    ctx.drawImage(image, 0, 0)
    
    //prepare watermark canvas
    var c_wm = document.createElement('canvas')
    var ctx_wm = c_wm.getContext('2d')
    c_wm.width = watermark.naturalWidth
    c_wm.height = watermark.naturalHeight
    if (x_sub || y_sub) {
        ctx_wm.translate(x_sub, y_sub)
    }
    ctx_wm.drawImage(watermark, 0, 0)
    
    var imagedata_image = ctx.getImageData(x, y, w, h)
    var imagedata_watermark = ctx_wm.getImageData(0, 0, w, h)
    
    const transparencyThreshold = parseInt(document.getElementById('transparencyThreshold').value)
    const opaqueThreshold = parseInt(document.getElementById('opaqueThreshold').value)
    const postprocSmoothAlphaEdges = document.getElementById('smoothEdges').checked
    const postprocAdjustBrightness = document.getElementById('adjustBrightness').checked
    const automaticSubpixelAlignment = document.getElementById('autoSubpixel').checked
    
    if (postprocSmoothAlphaEdges || automaticSubpixelAlignment) {
        var edgeThreshold = 0
        for (let i = 3; i < w*h*4; i += 12) {
            if (imagedata_watermark.data[i] > edgeThreshold) {
                edgeThreshold = imagedata_watermark.data[i]
            }
            if (i % (w*4) < 11) {
                i += w*4
            }
        }
        edgeThreshold = edgeThreshold * 0.4
    }
    
    if (automaticSubpixelAlignment) {
        //create a buffer with some points to check alignment
        const checkSize = 32
        let checkBuffer = {
            horizontal: [],
            vertical: []
        }
        outerLoop : for (let i = 3; i < w*h*4; i+=4) {
            const coord_i = [(i/4) % w, Math.floor(i/(4*w))]
            if (Math.abs(imagedata_watermark.data[i-4] - imagedata_watermark.data[i]) > edgeThreshold) {
                if (coord_i[0] - 3 < 0 || coord_i[0] + 3 >= w) {
                    //only consider those with no other edges close to them
                    continue outerLoop
                }
//                 imagedata_image.data[i-3] = 0
//                 imagedata_image.data[i-2] = 255
//                 imagedata_image.data[i-1] = 0
                checkBuffer.horizontal.push(i)
            }
            if (Math.abs(imagedata_watermark.data[i-w*4] - imagedata_watermark.data[i]) > edgeThreshold) {
                for (let ii = -3; ii <= 3; ii++) {
                    if (coord_i[1] - 3 < 0 || coord_i[1] + 3 >= h) {
                        //only use consider those with no other edges close to them
                        continue outerLoop
                    }
                }
//                 imagedata_image.data[i-3] = 255
//                 imagedata_image.data[i-2] = 0
//                 imagedata_image.data[i-1] = 255
                checkBuffer.vertical.push(i)
            }
        }
        let checkBufferCopy = {
            horizontal: checkBuffer.horizontal.slice(),
            vertical: checkBuffer.vertical.slice()
        }
        //reduce the amount of pixels to test with because the following loop is fucking awful
        for (let x in checkBuffer) {
            while (checkBuffer[x].length > 1000) {
                for (let i = 0; i < checkBuffer[x].length; i++) {
                    checkBuffer[x].splice(i, 1)
                }
            }
        }
        //awful code ahead, viewer discretion is advised
        for (let x in checkBuffer) {
            checkBuffer[x].forEach((y, i) => {
                //check if the 5x5 radius includes other points
                for (let j = y - 12*(w+1); j < y + 12*(w+1); j += 4) {
                    //filter out edges/borders
                    if (checkBufferCopy[x == 'horizontal' ? 'vertical' : 'horizontal'].includes(j)) {
                        checkBuffer[x].splice(i, 1)
                        break
                    }
                    if (j%(w*4) > y%(w*4)+12) j += w*4 - 28
                }
            })
        }
        //further reduce the amount of pixels to test with
        for (let x in checkBuffer) {
            while (checkBuffer[x].length > 64) {
                for (let i = 0; i < checkBuffer[x].length; i++) {
                    checkBuffer[x].splice(i, 1)
                }
            }
        }
        //check the candidate pixels for the best alignment
        let subpixelPositions = {
            x: [],
            y: []
        }
        for (let axis in subpixelPositions) {
            for (const ii of checkBuffer[(axis == 'x' ? 'horizontal' : 'vertical')]) {
                const i = ii - 3 //we saved the alpha's index earlier
                let bestSubpixel = 0
                var axisNeighbors
                if (axis == 'x') {
                    axisNeighbors = [ i-12, i-8, i-4, i, i+4, i+8, i+12 ]
                } else {
                    axisNeighbors = [ i-12*w, i-8*w, i-4*w, i, i+4*w, i+8*w, i+12*w ]
                }
                const pixelsWatermarkAlpha = [
                    imagedata_watermark.data[axisNeighbors[0]+3],
                    imagedata_watermark.data[axisNeighbors[1]+3],
                    imagedata_watermark.data[axisNeighbors[2]+3],
                    imagedata_watermark.data[axisNeighbors[3]+3],
                    imagedata_watermark.data[axisNeighbors[4]+3],
                    imagedata_watermark.data[axisNeighbors[5]+3],
                    imagedata_watermark.data[axisNeighbors[6]+3]
                ]
                //each color channel
                for (let c = 0; c < 3; c++) {
                    //for better readability
                    const pixelsImage = [
                        imagedata_image.data[axisNeighbors[1]+c],
                        imagedata_image.data[axisNeighbors[2]+c],
                        imagedata_image.data[axisNeighbors[3]+c],
                        imagedata_image.data[axisNeighbors[4]+c],
                        imagedata_image.data[axisNeighbors[5]+c]
                    ]
                    const pixelsWatermark = [
                        imagedata_watermark.data[axisNeighbors[0]+c],
                        imagedata_watermark.data[axisNeighbors[1]+c],
                        imagedata_watermark.data[axisNeighbors[2]+c],
                        imagedata_watermark.data[axisNeighbors[3]+c],
                        imagedata_watermark.data[axisNeighbors[4]+c],
                        imagedata_watermark.data[axisNeighbors[5]+c],
                        imagedata_watermark.data[axisNeighbors[6]+c]
                    ]
                    //check the subpixel positioning by unwatermarking each step end checking for the least error
                    //(not very efficient, but that's why the sample size is so small lol)
                    let bestError = Infinity
                    let bestSubpixelOfChannel = 0
                    for (let sub = -1; sub < 1; sub += 0.05) {
                        //shift the watermark by some subpixel amount using linear interpolation
                        //TODO: REFACTOR TO MAKE SUB-LOOP HIGHER LEVEL THAN CHANNEL-LOOP TO NOT RECALCULATE ALPHA VALUES
                        //but I'm too lazy and not sure if that'd even work, so it's staying for now
                        let watermarkAligned = new Array(5)
                        let watermarkAlignedAlpha = new Array(5)
                        for (let j = 0; j < 5; j++) {
                            if (sub > 0) {
                                watermarkAligned[j] = pixelsWatermark[j+1] * (1-sub) + pixelsWatermark[j+2] * sub
                                watermarkAlignedAlpha[j] = pixelsWatermarkAlpha[j+1] * (1-sub) + pixelsWatermarkAlpha[j+2] * sub
                            } else {
                                watermarkAligned[j] = pixelsWatermark[j+1] * (1+sub) + pixelsWatermark[j] * (-sub)
                                watermarkAlignedAlpha[j] = pixelsWatermarkAlpha[j+1] * (1+sub) + pixelsWatermarkAlpha[j] * (-sub)
                            }
                        }
                        //test the unwatermarked result for errors from misalignment
                        let unwatermarked = new Array(5)
                        for (let j = 0; j < 5; j++) {
                            const alpha_img = 255 / (255 - watermarkAlignedAlpha[j])
                            const alpha_wm = -watermarkAlignedAlpha[j] / (255 - watermarkAlignedAlpha[j])
                            unwatermarked[j] = alpha_img * pixelsImage[j] + alpha_wm * watermarkAligned[j]
                        }
                        const outerMean = (unwatermarked[0] + unwatermarked[4]) / 2
                        const error = (unwatermarked[0] - outerMean) ** 2 +
                            (unwatermarked[1] - outerMean) ** 2 +
                            (unwatermarked[2] - outerMean) ** 2 +
                            (unwatermarked[3] - outerMean) ** 2 +
                            (unwatermarked[4] - outerMean) ** 2
                        if (error < bestError) {
                            bestError = error
                            bestSubpixelOfChannel = sub
                        }
                    }
                    bestSubpixel += bestSubpixelOfChannel
                }
                subpixelPositions[axis].push(bestSubpixel/3)
//                 if (axis == 'x') {
//                     imagedata_image.data[ii-3] = 0
//                     imagedata_image.data[ii-2] = 255
//                     imagedata_image.data[ii-1] = 0
//                 } else {
//                     imagedata_image.data[ii-3] = 255
//                     imagedata_image.data[ii-2] = 0
//                     imagedata_image.data[ii-1] = 255
//                 }
            }
        }
        a = subpixelPositions
        let sub_x = 0, sub_y = 0
        subpixelPositions.x.sort((a, b) => a - b)
        for (let i = Math.round(subpixelPositions.x.length * 0.25); i < Math.round(subpixelPositions.x.length * 0.75); i++)
            sub_x += subpixelPositions.x[i]
        sub_x = sub_x / Math.round(subpixelPositions.x.length / 2)
        subpixelPositions.y.sort((a, b) => a - b)
        for (let i = Math.round(subpixelPositions.y.length * 0.25); i < Math.round(subpixelPositions.y.length * 0.75); i++)
            sub_y += subpixelPositions.y[i]
        sub_y = sub_y / Math.round(subpixelPositions.y.length / 2)
        console.log(sub_x, sub_y)
        ctx_wm.clearRect(0, 0, w, h)
        ctx_wm.translate(-sub_x, -sub_y)
        ctx_wm.drawImage(watermark, 0, 0)
        imagedata_watermark = ctx_wm.getImageData(0, 0, w, h)
    }
    
    //unwatermark according to Fire's formula
    var alpha_img, alpha_wm, factor1
    for (let i = 0; i < w*h*4; i+=4) {
        //format: RGBA
        //(new pixel)=(1/(1-alpha))*(old pixel)+(-alpha/(1-alpha))*(watermark's pixel)
        if (imagedata_watermark.data[i+3] > transparencyThreshold) {
            alpha_img = 255 / (255 - imagedata_watermark.data[i+3])
            alpha_wm = -imagedata_watermark.data[i+3] / (255 - imagedata_watermark.data[i+3])
            imagedata_image.data[i] = Math.round(alpha_img * imagedata_image.data[i] + alpha_wm * imagedata_watermark.data[i])
            imagedata_image.data[i+1] = Math.round(alpha_img * imagedata_image.data[i+1] + alpha_wm * imagedata_watermark.data[i+1])
            imagedata_image.data[i+2] = Math.round(alpha_img * imagedata_image.data[i+2] + alpha_wm * imagedata_watermark.data[i+2])
            if (imagedata_watermark.data[i+3] > opaqueThreshold) {
                //smoothing of very opaque pixels
                factor1 = (imagedata_watermark.data[i+3] - opaqueThreshold) / (255 - opaqueThreshold)
                imagedata_image.data[i] = Math.round(factor1 * imagedata_image.data[i-4] + (1 - factor1) * imagedata_image.data[i])
                imagedata_image.data[i+1] = Math.round( factor1 * imagedata_image.data[i-3] + (1 - factor1) * imagedata_image.data[i+1])
                imagedata_image.data[i+2] = Math.round( factor1 * imagedata_image.data[i-2] + (1 - factor1) * imagedata_image.data[i+2])
            }
        }
    }
    
    if (postprocSmoothAlphaEdges) {
        var mask = new Uint8Array(imagedata_watermark.data.length/4)
        for (let i = w*4+7, j = w+1; i < w*h*4; i+=4, j++) {
            if (Math.abs(imagedata_watermark.data[i-4] - imagedata_watermark.data[i]) > edgeThreshold) {
                /*imagedata_image.data[i-3] = 0
                imagedata_image.data[i-2] = 255
                imagedata_image.data[i-1] = 0*/
                mask[j] = 255
                mask[j-1] = 255
                mask[j+1] = 255
            }
            if (Math.abs(imagedata_watermark.data[i-w*4] - imagedata_watermark.data[i]) > edgeThreshold) {
                /*imagedata_image.data[i-3] = 255
                imagedata_image.data[i-2] = 0
                imagedata_image.data[i-1] = 255*/
                mask[j] = 255
                mask[j-w] = 255
                mask[j+w] = 255
            }
        }
        var maskCopy = new Uint8Array(mask)
        var imagedata_imageCopy = new Uint8Array(imagedata_image.data)
        var stillPixelsLeftToSmooth = true
        while (stillPixelsLeftToSmooth) {
            stillPixelsLeftToSmooth = false
            var secondMask = new Uint8Array(maskCopy)
            for (let i = 0, j = 0; i < w*h*4; i+=4, j++) {
                if (secondMask[j] == 255) {
                    stillPixelsLeftToSmooth = true
                    //2x2 average but not those that should be smoothed
                    const pixelTop = j-w > 0 && secondMask[j-w] != 255
                    var pixelLeft = j-1 > 0 && secondMask[j-1] != 255
                    var pixelRight = j+1 > 0 && secondMask[j+1] != 255
                    var pixelBottom = j+w > 0 && secondMask[j+w] != 255
                    //make use of JS's wacky type conversion
                    var pixelCount = pixelTop + pixelBottom + pixelLeft + pixelRight
                    if (pixelCount > 1) {
                        for (var ii = 0; ii < 3; ii++) {
                            imagedata_imageCopy[i+ii] = (
                                (pixelTop ? imagedata_imageCopy[i-w*4+ii] : 0) +
                                (pixelLeft ? imagedata_imageCopy[i-4+ii] : 0) +
                                (pixelRight ? imagedata_imageCopy[i+4+ii] : 0) +
                                (pixelBottom ? imagedata_imageCopy[i+w*4+ii] : 0)
                                ) / pixelCount
                        }
                        maskCopy[j] = 0
                    }
                }
            }
        }
        //now for the really fucked up post processing
        var brightness = (r, g, b) => {
            //square average or something for now, better functions might be possible too
            return Math.sqrt(r*r + g*g + b*b) / 3
        }
        if (postprocAdjustBrightness) {
            for (let i = 0, j = 0; i < w*h*4; i+=4, j++) {
                if (mask[j] == 255) {
                    var factor = brightness(imagedata_imageCopy[i], imagedata_imageCopy[i+1], imagedata_imageCopy[i+2]) /
                                brightness(imagedata_image.data[i], imagedata_image.data[i+1], imagedata_image.data[i+2])
                    imagedata_image.data[i] = Math.round(imagedata_image.data[i] * factor)
                    imagedata_image.data[i+1] = Math.round(imagedata_image.data[i+1] * factor)
                    imagedata_image.data[i+2] = Math.round(imagedata_image.data[i+2] * factor)
                }
            }
        } else {
            for (let i = 0, j = 0; i < w*h*4; i+=4, j++) {
                if (mask[j] == 255) {
                    imagedata_image.data[i] = imagedata_imageCopy[i]
                    imagedata_image.data[i+1] = imagedata_imageCopy[i+1]
                    imagedata_image.data[i+2] = imagedata_imageCopy[i+2]
                }
            }
        }
    }
    
    ctx.putImageData(imagedata_image, wm_x, wm_y)
    if (c.toBlob) {
        c.toBlob((blob) => {
            url = URL.createObjectURL(blob)
            triggerDownload(url)
        }, 'image/png')
    } else {
        url = c.toDataURL('image/png')
        triggerDownload(url)
    }
}
function triggerDownload(url) {
    imageBackupUrl = image.src
    image.src = url
    if (document.getElementById('preview').checked) {
        watermark.style.display = 'none'
        document.getElementById('confirm').style.display = 'initial'
        document.getElementsByClassName('unwatermark')[0].style.display = 'none'
    } else {
        confirmYes()
    }
}
function confirmYes() {
    var a = document.createElement('a')
    a.href = image.src
    a.download = files[currentImage].name.replace(/\.[^\.]*$/, '_uwm.png')
    a.click()
    if (files.length > currentImage + 1) {
        currentImage++
        loadImage()
    }
    imageBackupUrl = ''
    watermark.style.display = 'initial'
    document.getElementById('confirm').style.display = 'none'
        document.getElementsByClassName('unwatermark')[0].style.display = 'initial'
}
function confirmNo() {
    image.src = imageBackupUrl
    watermark.style.display = 'initial'
    document.getElementById('confirm').style.display = 'none'
        document.getElementsByClassName('unwatermark')[0].style.display = 'initial'
}


//front end stuff

function toggleOptions() {
    var settings = document.getElementById('settings')
    if (settings.style.display == 'none') {
        settings.style.display = 'initial'
    } else {
        settings.style.display = 'none'
    }
}
function zoomImage(delta) {
    //too avoid rounding errors
    if (zoomlevel + delta > 0 && zoomlevel + delta < 69501) {
        if (zoomlevel >= 4000) {
            delta *= 10
        } else if (zoomlevel >= 400) {
            delta *= 4
        }
        if (zoomlevel + delta == 100) {
            resetZoom()
        } else {
            imageContainer.style.width = String(parseFloat(imageContainer.style.width.slice(0, -2)) * (1 + delta / zoomlevel)) + 'px'
            imageContainer.style.height = String(parseFloat(imageContainer.style.height.slice(0, -2)) * (1 + delta / zoomlevel)) + 'px'
            image.style.width = String(parseFloat(image.style.width.slice(0, -2)) * (1 + delta / zoomlevel)) + 'px'
            image.style.height = String(parseFloat(image.style.height.slice(0, -2)) * (1 + delta / zoomlevel)) + 'px'
            scale_x = scale_x * (1 + delta / zoomlevel)
            scale_y = scale_y * (1 + delta / zoomlevel)
            watermark.style.width = String(watermark.naturalWidth * scale_x) + 'px'
            watermark.style.height = String(watermark.naturalHeight * scale_y) + 'px'
            updateWatermarkPosition()
            zoomlevel += delta
            zoomIndicator.innerHTML = zoomlevel
        }
        //memes
        switch (zoomlevel) {
            case 9000:
                alert("It's over 9000!")
                break
            case 20000:
                alert("Don't you have an image to unwatermark?")
                break
            case 40000:
                alert("\"It's time to STOP!\" — Filthy Frank, 2015")
                break
            case 60000:
                alert("Seriously, stop.")
                break
        }
        if (zoomlevel >= 69420) {
            image.src = 'https://lh3.googleusercontent.com/-mIPPBE0mJiI/YAfvZez4guI/AAAAAAAACm8/aGmUf2sTS7sZYI6YmTUJil6znNwTmpVIACOkEEAEYAw/s0/rickroll.gif'
            image.style.width = '100%'
            image.style.height = 'unset'
            imageContainer.style.width = '100%'
            imageContainer.style.height = 'unset'
        }
    }
}
function resetZoom() {
    zoomlevel = 100
    zoomIndicator.innerHTML = zoomlevel
    //copied from loadImage
    image.width = image.naturalWidth
    image.style.maxWidth = '100%'
    imageContainer.style.maxWidth = '100%'
    //reset previous styles
    imageContainer.style.height = 'unset'
    imageContainer.style.width = 'unset'
    image.style.height = 'unset'
    image.style.width = 'unset'
    var computedStyle = window.getComputedStyle(image)
    imageContainer.style.width = computedStyle.width
    imageContainer.style.height = computedStyle.height
    scale_x = parseFloat(computedStyle.width.replace('px','')) / parseInt(image.naturalWidth)
    scale_y = parseFloat(computedStyle.height.replace('px','')) / parseInt(image.naturalHeight)
    imageContainer.style.maxWidth = 'unset'
    image.style.maxWidth = 'unset'
    image.style.width = imageContainer.style.width
    image.style.height = imageContainer.style.height
    
    //watermark
    watermark.style.width = String(watermark.naturalWidth * scale_x) + 'px'
    watermark.style.height = String(watermark.naturalHeight * scale_y) + 'px'
    updateWatermarkPosition()
}
imageContainer.addEventListener('wheel', e => {
    if (e.ctrlKey) {
        e.preventDefault()
        if (e.deltaY > 0) {
            zoomImage(-10)
        } else {
            zoomImage(10)
        }
    }
})
document.getElementById('pixelatedZoom').addEventListener('change', e => {
    if (e.srcElement.checked) {
        imageContainer.className += " pixelated"
    } else {
        imageContainer.className = imageContainer.className.replace(' pixelated', '')
    }
})
function previewFilters(e) {
    if (e.srcElement.id == 'previewContrast') {
        filters.contrast = e.srcElement.value
    } else if (e.srcElement.id == 'previewBrightness') {
        filters.brightness = e.srcElement.value
    }
    image.style.filter = (filters.brightness != 1 ? 'brightness(' + filters.brightness + ') ' : '') +
                         (filters.contrast != 1 ? 'contrast(' + filters.contrast + ')' : '')
}
function resetFilter(id) {
    document.getElementById(id).value = 1;
    if (id == 'previewContrast') {
        filters.contrast = 1
    } else if (id == 'previewBrightness') {
        filters.brightness = 1
    }
    image.style.filter = (filters.brightness != 1 ? 'brightness(' + filters.brightness + ') ' : '') +
                         (filters.contrast != 1 ? 'contrast(' + filters.contrast + ')' : '')
}
document.getElementById('previewContrast').addEventListener('change', previewFilters)
document.getElementById('previewBrightness').addEventListener('change', previewFilters)

//save/restore settings
window.addEventListener('unload', e => {
    var settings = {
        defaultPosition: document.getElementById('defaultPosition').value,
        overlayMode: document.getElementById('overlayMode').value,
        transparencyThreshold: document.getElementById('transparencyThreshold').value,
        preview: document.getElementById('preview').checked,
        autoSubpixel: document.getElementById('autoSubpixel').checked,
        smoothEdges: document.getElementById('smoothEdges').checked,
        adjustBrightness: document.getElementById('adjustBrightness').checked,
        pixelatedZoom: document.getElementById('pixelatedZoom').checked
    }
    localStorage.setItem('settings', JSON.stringify(settings))
    delete e.returnValue
});
(() => {
    if (localStorage.getItem('settings')) {
        var settings = JSON.parse(localStorage.getItem('settings'))
        document.getElementById('defaultPosition').value = settings.defaultPosition
        document.getElementById('overlayMode').value = settings.overlayMode
        watermark.style.mixBlendMode = settings.overlayMode
        document.getElementById('transparencyThreshold').value = settings.transparencyThreshold
        document.getElementById('preview').checked = settings.preview
        document.getElementById('autoSubpixel').checked = settings.autoSubpixel
        document.getElementById('smoothEdges').checked = settings.smoothEdges
        document.getElementById('adjustBrightness').checked = settings.adjustBrightness
        document.getElementById('pixelatedZoom').checked = settings.pixelatedZoom
        if (settings.pixelatedZoom) {
            imageContainer.className += " pixelated"
        }
    }
})()

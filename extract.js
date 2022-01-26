 
var scale_x, scale_y;
var wm_x = 0, wm_y = 0; //too lazy to rename these two
var ew_x = 0, ew_y = 0;
var ews_x = 300, ews_y = 150;
var mouse_x, mouse_y;
var imageInput1 = document.getElementById('inputImage1')
var imageInput2 = document.getElementById('inputImage2')
var image1 = document.getElementById('image1')
var image2 = document.getElementById('image2')
var extractWindow = document.getElementById('window')
var extractWindowSize = document.getElementById('windowSize')
var bgColor1 = document.getElementById('colorImage1')
var bgColor2 = document.getElementById('colorImage2')
var imageBackupUrl = ''
var thingBeingDragged, somethingIsAlreadyBeingDragged = false
var imageBeingColorpicked

imageInput1.addEventListener('change', () => loadImage1())
imageInput2.addEventListener('change', () => loadImage2())
document.addEventListener('keydown', moveImage2)
document.getElementById('overlayMode').addEventListener('change', function(){
    image2.style.mixBlendMode = this.value
})
extractWindow.onmousedown = extractWindowSize.onmousedown = dragThingStart

function loadImage1() {
    createImageBitmap(imageInput1.files[0]).then(function (image_loaded) {
        if (image_loaded.height > 32000 || image_loaded.width > 32000 || image_loaded.height*image_loaded.width > 250000000) {
            alert('Image is too large. (Browser limitation)')
            image1.width = 0
            image1.height = 0
        }
        image1.width = image_loaded.width
        image1.height = image_loaded.height
        var div = document.getElementById('imageContainer')
        image1.style.maxWidth = '100%'
        div.style.maxWidth = '100%'
        //reset previous styles
        div.style.height = 'unset'
        div.style.width = 'unset'
        image1.style.height = 'unset'
        image1.style.width = 'unset'
        var computedStyle = window.getComputedStyle(image1)
        div.style.width = computedStyle.width
        div.style.height = computedStyle.height
        scale_x = parseFloat(computedStyle.width.replace('px','')) / image_loaded.width
        scale_y = parseFloat(computedStyle.height.replace('px','')) / image_loaded.height
        div.style.maxWidth = 'unset'
        image1.style.maxWidth = 'unset'
        image1.style.width = div.style.width
        image1.style.height = div.style.height
        image1.getContext('2d').drawImage(image_loaded, 0, 0)
    }).catch(e=>alert("Could not open image. Error:\n" + e.message))
}
function loadImage2() {
    if(scale_x && scale_y) {
        createImageBitmap(imageInput2.files[0]).then(function (image_loaded) {
            if (image_loaded.height > 32000 || image_loaded.width > 32000 || image_loaded.height*image_loaded.width > 250000000) {
                alert('Image is too large. (Browser limitation)')
                image2.width = 0
                image2.height = 0
            } else {
                image2.width = image_loaded.width
                image2.height = image_loaded.height
            }
            var position = document.getElementById('defaultPosition').value
            if (position == 'center') {
                wm_x = Math.round((image1.width - image_loaded.width) / 2)
                wm_y = Math.round((image1.height - image_loaded.height) / 2)
                ew_x = Math.round((image1.width - ews_x) / 2)
                ew_y = Math.round((image1.height - ews_y) / 2)
            } else {
                if (position.indexOf('right') > -1) {
                    wm_x = image1.width - image_loaded.width
                    ew_x = image1.width - ews_x
                } else {
                    wm_x = ew_x = 0
                }
                if (position.indexOf('bottom') > -1) {
                    wm_y = image1.height - image_loaded.height
                    ew_y = image1.height - ews_y
                } else {
                    wm_y = ew_y = 0
                }
            }
            image2.style.top = String(wm_y * scale_y) + 'px'
            image2.style.left = String(wm_x * scale_x) + 'px'
            image2.style.width = String(scale_x * image_loaded.width) + 'px'
            image2.style.height = String(scale_y * image_loaded.height) + 'px'
            image2.onmousedown = dragThingStart
            image2.getContext('2d').drawImage(image_loaded, 0, 0)
            extractWindow.style.top = String(ew_y * scale_y) + 'px'
            extractWindow.style.left = String(ew_x * scale_x) + 'px'
            extractWindow.style.width = String(scale_x * ews_x) + 'px'
            extractWindow.style.height = String(scale_y * ews_y) + 'px'
            extractWindow.style.display = 'block'
        }).catch(e=>alert("Could not open image. Error:\n" + e.message))
    } else {
        alert('Load image 1 first.')
    }
}
function moveImage2 (e) {
    if (image2.style.width) {
        switch (e.keyCode) {
            case 37:
                wm_x--
                break
            case 38:
                wm_y--
                break
            case 39:
                wm_x++
                break
            case 40:
                wm_y++
                break
            default:
                return
            
        }
        e.preventDefault()
        image2.style.top = String(wm_y * scale_y) + 'px'
        image2.style.left = String(wm_x * scale_x) + 'px'
    }
}
function dragThingStart(e) {
    e = e || window.event;
    e.preventDefault();
    if (!somethingIsAlreadyBeingDragged) {
        somethingIsAlreadyBeingDragged = true
        // get the mouse cursor position at startup:
        mouse_x = e.clientX;
        mouse_y = e.clientY;
        thingBeingDragged = this
        document.onmouseup = dragThingEnd;
        // call a function whenever the cursor moves:
        document.onmousemove = dragThing;
    }
}
function dragThing(e) {
    e = e || window.event;
    e.preventDefault();
    // calculate the new cursor position:
    move_x = Math.round((mouse_x - e.clientX) / scale_x);
    move_y = Math.round((mouse_y - e.clientY) / scale_y);
    mouse_x = e.clientX;
    mouse_y = e.clientY;
    // set the element's new position:
    var pos
    switch (thingBeingDragged) {
        case image2:
            wm_x -= move_x
            wm_y -= move_y
            pos = [wm_x, wm_y]
            break
        case extractWindow:
            ew_x -= move_x
            ew_y -= move_y
            pos = [ew_x, ew_y]
            break
        case extractWindowSize:
            ews_x -= move_x
            ews_y -= move_y
            extractWindow.style.width = String(ews_x * scale_x) + 'px'
            extractWindow.style.height = String(ews_y * scale_y) + 'px'
        default:
            return
    }
    thingBeingDragged.style.top = String(pos[1] * scale_y) + 'px'
    thingBeingDragged.style.left = String(pos[0] * scale_x) + 'px'
}
function dragThingEnd(e) {
    somethingIsAlreadyBeingDragged = false
    // stop moving when mouse button is released:
    document.onmouseup = null;
    document.onmousemove = null;
}
function extract() {
    var imagedata1, imagedata2, imagedata_ex;
    var w = 0, x = ew_x
    if (ew_x < 0) {
        w = ew_x
        x = 0
    }
    w += ews_x
    if (x + w > image1.width || x + w > wm_x + image2.width) {
        var smaller = image1.width < (wm_x + image2.width) ? image1.width : (wm_x + image2.width)
        w -= x + w - smaller
    }
    var h = 0, y = ew_y
    if (ew_y < 0) {
        h = ew_y
        y = 0
    }
    h += ews_y
    if (y + h > image1.height || y + h > wm_y + image2.height) {
        var smaller = image1.height < (wm_y + image2.height) ? image1.height : (wm_y + image2.height)
        h -= y + h - smaller
    }
    
    //prepare image1 canvas
    var ctx1 = image1.getContext('2d')
    
    //prepare image2 canvas
    var ctx2 = image2.getContext('2d')
    
    //prepare extracted watermark canvas
    var c_ex = document.createElement('canvas')
    var ctx_ex = c_ex.getContext('2d')
    c_ex.width = w
    c_ex.height = h
    
    imagedata1 = ctx1.getImageData(x, y, w, h)
    imagedata2 = ctx2.getImageData(x-wm_x, y-wm_y, w, h)
    imagedata_ex = ctx_ex.getImageData(0, 0, w, h)
    
//     const transparencyThreshold = parseInt(document.getElementById('transparencyThreshold').value)
//     const opaqueThreshold = parseInt(document.getElementById('opaqueThreshold').value)
    
    //extract according to Fire's formula
    
    function norm(r, g, b) {
        //averages the input pixels to their mean value
        //fire said, two norm variants would be feasible. making it a function so I can test them more easily
        
        //linear
        //return (Math.abs(r)+Math.abs(g)+Math.abs(b)) / 3   //3*255=765
        //squared
        return Math.sqrt(r*r + g*g + b*b) / 3
        //"Sounds great, didn't work"
    }
    
    const parseColor1 = bgColor1.value.match(/#(..)(..)(..)/)
    const parseColor2 = bgColor2.value.match(/#(..)(..)(..)/)
    const bg1 = [
        parseInt(parseColor1[1], 16),
        parseInt(parseColor1[2], 16),
        parseInt(parseColor1[3], 16)
    ]
    const bg2 = [
        parseInt(parseColor2[1], 16),
        parseInt(parseColor2[2], 16),
        parseInt(parseColor2[3], 16)
    ]
    
    const bgAlphaFactor = norm(bg1[0] - bg2[0], bg1[1] - bg2[1], bg1[2] - bg2[2])
    var reconstructedAlpha
    for (var i = 0; i < w*h*4; i+=4) {
        //format: RGBA
        //actually, it's the inverse of the reconstructed alpha cahennel, to save some divisions in the further calculations
        reconstructedAlpha = 1 / (1 - norm(imagedata2.data[i]-imagedata1.data[i], imagedata2.data[i+1]-imagedata1.data[i+1], imagedata2.data[i+2]-imagedata1.data[i+2]) / bgAlphaFactor)
        //canvases are initialized as transparent black, so it's safe to skip the calculations if the alpha is zero
        if (reconstructedAlpha != Infinity && reconstructedAlpha > 0) {
            imagedata_ex.data[i] = Math.round(((imagedata1.data[i] + imagedata2.data[i]) * reconstructedAlpha + (1 - reconstructedAlpha) * (bg1[0] + bg2[0])) / 2)
            imagedata_ex.data[i+1] =  Math.round(((imagedata1.data[i+1] + imagedata2.data[i+1]) * reconstructedAlpha + (1 - reconstructedAlpha) * (bg1[1] + bg2[1])) / 2)
            imagedata_ex.data[i+2] = Math.round(((imagedata1.data[i+2] + imagedata2.data[i+2]) * reconstructedAlpha + (1 - reconstructedAlpha) * (bg1[2] + bg2[2])) / 2)
            imagedata_ex.data[i+3] = Math.round(255 / reconstructedAlpha)
        }
    }
    
    ctx_ex.putImageData(imagedata_ex, 0, 0)
    if (c_ex.toBlob) {
        c_ex.toBlob((blob) => {
            url = URL.createObjectURL(blob)
            triggerDownload(url)
        }, 'image/png')
    } else {
        url = c_ex.toDataURL('image/png')
        triggerDownload(url)
    }
}
function triggerDownload(url) {
    /*imageBackupUrl = image.src
    image.src = url
    if (document.getElementById('preview').checked) {
        watermark.style.display = 'none'
        document.getElementById('confirm').style.display = 'initial'
    } else {
        confirmYes()
    }
}
function confirmYes() {*/
    var a = document.createElement('a')
    a.href = /*image.src*/ url
    a.download = 'extracted.png'//imageInput.files[currentImage].name.replace(/\.[^\.]*$/, '_uwm.png')
    a.click()
    /*if (imageInput.files.length > currentImage + 1) {
        currentImage++
        loadImage()
    }
    imageBackupUrl = ''
    watermark.style.display = 'initial'
    document.getElementById('confirm').style.display = 'none'*/
}
function confirmNo() {
    image.src = imageBackupUrl
    watermark.style.display = 'initial'
    document.getElementById('confirm').style.display = 'none'
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
function pickColor(i) {
    if (i == 1) {
        imageBeingColorpicked = image1
        image2.style.pointerEvents = 'none'
    } else {
        imageBeingColorpicked = image2
        image1.style.pointerEvents = 'none'
    }
    extractWindow.style.pointerEvents = 'none'
    imageBeingColorpicked.style.cursor = 'crosshair'
    imageBeingColorpicked.addEventListener('click', callbackPickColor)
}
function callbackPickColor(e) {
    var colorInput
    if (imageBeingColorpicked == image1) {
        image2.style.pointerEvents = 'unset'
        colorInput = bgColor1
    } else {
        image1.style.pointerEvents = 'unset'
        colorInput = bgColor2
    }
    extractWindow.style.pointerEvents = 'unset'
    imageBeingColorpicked.style.cursor = 'unset'
    imageBeingColorpicked.removeEventListener('click', callbackPickColor)
    var color = imageBeingColorpicked.getContext('2d').getImageData(e.layerX, e.layerY, 1, 1).data
    colorInput.value = '#' + color[0].toString(16) + color[1].toString(16) + color[2].toString(16)
}

Watermark Remover for the Browser

Usage:

  The basic usage is to first load an image (or multiple) either by pressing
  the button or drag-and-dropping it onto your browser window. Then load the
  watermark sample by using the respective button, and position it either by
  dragging it with your mouse or using the keyboard arrow keys. Finally, press
  the "Unwatermark" button to get your result.
  
  The following explains in more detail what each button does.
  
  (By the way, try not to change your settings/input files midway during the
  batch mode or result preview, things might break. In case they do, a page
  refresh will most likely fix it.)
  
  "Load Image":
    Loads the image to unwatermark. If you select multiple files, the tool
    will go through them all one after another. You can also drag and drop
    the files onto the window.

  "Load Watermark":
    Load the watermark file to be used. They are the same as the ones from
    FIRE's extractor or tangerine's PhotoShop actions.
  
  "Default watermark position":
    Specifies where the watermark will be put after it has been loaded, so
    you don't have to drag it all over the page to the opposite corner.
    Using it after the watermark has been loaded will have no effect.

  Positioning the Watermark:
    You can drag and drop the watermark once it has been loaded. For fine
    tuning the positioning, use the arrow keys on your keyboard to move it
    by 1px. However, since that might still not be fine enough of an adjust-
    ment for some watermarks, you may hold the CTRL-key while using the arrow
    keys to move in 0.05px steps to *really* get it in the right spot. Also,
    be sure to check out the Automatic Subpixel Alignment option.
    
  "Preview blending mode":
    To help with the positioning, you can switch between "normal" blending
    (the watermark is simply overlayed on top of the image) and "difference"
    blending mode (which works differently and emphasizes misalignment).
    Note that the preview you can see *doesn't* represent the actual un-
    watermarking result.

  "Preview contrast":
    Increase (or decrease) the contrast of the preview. Does not affect the
    final result. Click the spinning arrow symbol to reset it.

  "Preview brightness":
    Increase (or decrease) the brightness of the preview. Does not affect the
    final result. Click the spinning arrow symbol to reset it.
  
  "Transparency threshold":
    Pixels with an alpha value less than this value (= more transparent) will
    not be processed. The reason being, you can't really tell that small
    changes apart, so they don't need to be processed, speeding up the
    unwatermarking a little bit. Plus, most of them stem from JPEG compression
    anyway, meaning they're not really part of the watermark in the first place.

  "Opaque smoothing":
    For some very opaque watermarks (especially JPEG-heavy), there can be ugly
    artefacts in the resulting image. This option tries to hide the worst of
    them by averaging especially opaque pixels with their preceeding pixel.
    The strength/mix of the averaging is determined by how much the alpha is
    over the limit. The default value is high enough to not interfere with
    bilibili's watermark, one of the more common, yet very opaque watermarks.
    As such, the default value will not smooth that strongly, so play around
    with it if you really need it. 255 will disable it.
    Example: https://cdn.discordapp.com/attachments/743513778150178877/779279135796494337/unknown.png

  "Confirm results":
    With this it will not discard source images once they've been unwatermarked,
    but will ask you for confirmation (the buttons will pop up in place of the
    "Unwatermark" button). "Yes" will confirm the changes, save the result
    and move on to the next image (if applicable). "No" will revert to the
    original image, discarding any changes. Useful if the watermark is hard to 
    position.

  "Automatic subpixel alignment":
    The tool will try to adjust the subpixel alignment itself, you just need
    to bring the watermark within 1px distance from its optimal spot (in other
    Words, you still need to adjust pixel accurately). Since it does have
    performance implications for larger watermarks (the code is not very opti-
    mized) and has a possibility to make already perfectly aligned watermarks
    look slightly worse, it is disabled by default.

  "Replace Edges":
    Will replace the edges of the watermark (based on transparency, not color) 
    with the average color of neighboring pixels. Results are pretty bad, so it
    should be kept disabled.

  "Adjust edge brightness":
    If the above and this are both enabled, instead of replacing the pixel with
    the average, the pixel's brightness will be adjusted. Results are still
    pretty bad, so it should also be kept disabled. (Why include it then? Well,
    it's been coded now and I didn't want to take it out lol. It originally
    started as an experiment before subpixel alignment became available.)

  "Unwatermark":
    When the watermark is in the right spot, click this button to start the
    unwatermarking process. Once done, the unwatermarked image will download
    and if you don't have any other images loaded/queued, it will also be
    shown in the image area.
    File name will be the original file name with "_uwm" appended, as PNG.
    (uwm = UnWaterMarked)

  "Zoom":
    Use "+" and "-" to adjust the zoom level, the spinning arrow to reset it to
    100% (well, not actually 100% in all cases, but the initial zoom level).
    If you're hovering your cursor over the image, you can also hold CTRL while
    scrolling. The option "Pixelated" will tell your browser to use, well,
    pixelated scaling instead of the usually smoother default scaling if that is
    supported.

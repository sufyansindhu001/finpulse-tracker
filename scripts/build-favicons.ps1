Add-Type -AssemblyName System.Drawing

$srcPath = 'C:\Users\Sufyan Sindhu\.gemini\antigravity\brain\d5b29cf1-6f75-4d12-9070-8ffa0ee71ef0\.user_uploaded\media_1791106090093.png'
if (-not (Test-Path $srcPath)) {
    Write-Error "Source image not found at $srcPath"
    exit 1
}

$srcBmp = [System.Drawing.Bitmap]::FromFile($srcPath)

# 1. Crop out the central "G + Growth Arrow" icon (excluding bottom "FGC Spot" text)
# Icon bounds in 1024x1024: minX=222, maxX=826, minY=139, maxY=693
$srcX = 216
$srcY = 133
$srcW = 616
$srcH = 566

$iconCrop = [System.Drawing.Bitmap]::new($srcW, $srcH)
$gCrop = [System.Drawing.Graphics]::FromImage($iconCrop)
$gCrop.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$gCrop.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$gCrop.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
$gCrop.DrawImage($srcBmp, [System.Drawing.Rectangle]::new(0, 0, $srcW, $srcH), [System.Drawing.Rectangle]::new($srcX, $srcY, $srcW, $srcH), [System.Drawing.GraphicsUnit]::Pixel)
$gCrop.Dispose()
$srcBmp.Dispose()

# 2. Center icon on a 1024x1024 square master canvas with dark background (#040917)
$master = [System.Drawing.Bitmap]::new(1024, 1024)
$gMaster = [System.Drawing.Graphics]::FromImage($master)
$gMaster.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$gMaster.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$gMaster.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
$gMaster.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality

$bgBrush = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(255, 4, 9, 23))
$gMaster.FillRectangle($bgBrush, 0, 0, 1024, 1024)
$bgBrush.Dispose()

$targetW = 760
$targetH = [int]([double]$srcH / [double]$srcW * $targetW)
$targetX = [int]((1024 - $targetW) / 2)
$targetY = [int]((1024 - $targetH) / 2)

$gMaster.DrawImage($iconCrop, [System.Drawing.Rectangle]::new($targetX, $targetY, $targetW, $targetH))
$gMaster.Dispose()
$iconCrop.Dispose()

# Helper function to resize bitmap with high quality bicubic
function Resize-Bitmap($src, $w, $h) {
    $dest = [System.Drawing.Bitmap]::new($w, $h)
    $g = [System.Drawing.Graphics]::FromImage($dest)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
    $g.DrawImage($src, [System.Drawing.Rectangle]::new(0, 0, $w, $h))
    $g.Dispose()
    return $dest
}

$publicDir = (Resolve-Path 'public').Path

# 3. Generate icon-512.png and favicon.png (512x512)
$bmp512 = Resize-Bitmap $master 512 512
$bmp512.Save("$publicDir\icon-512.png", [System.Drawing.Imaging.ImageFormat]::Png)
$bmp512.Save("$publicDir\favicon.png", [System.Drawing.Imaging.ImageFormat]::Png)
$bmp512.Dispose()
Write-Output "Generated icon-512.png & favicon.png"

# 4. Generate icon-192.png (192x192)
$bmp192 = Resize-Bitmap $master 192 192
$bmp192.Save("$publicDir\icon-192.png", [System.Drawing.Imaging.ImageFormat]::Png)
$bmp192.Dispose()
Write-Output "Generated icon-192.png"

# 5. Generate apple-touch-icon.png (180x180)
$bmp180 = Resize-Bitmap $master 180 180
$bmp180.Save("$publicDir\apple-touch-icon.png", [System.Drawing.Imaging.ImageFormat]::Png)
$bmp180.Dispose()
Write-Output "Generated apple-touch-icon.png"

# 6. Generate icon.png (32x32)
$bmp32 = Resize-Bitmap $master 32 32
$bmp32.Save("$publicDir\icon.png", [System.Drawing.Imaging.ImageFormat]::Png)
Write-Output "Generated icon.png"

# 7. Generate favicon.ico (multi-resolution / 32x32 & 48x48)
$bmp48 = Resize-Bitmap $master 48 48
$hIcon = $bmp48.GetHicon()
$ico = [System.Drawing.Icon]::FromHandle($hIcon)
$fs = [System.IO.File]::Create("$publicDir\favicon.ico")
$ico.Save($fs)
$fs.Close()
$ico.Dispose()
$bmp48.Dispose()
$bmp32.Dispose()
Write-Output "Generated favicon.ico"

$master.Dispose()
Write-Output "All favicon and app icon assets generated successfully in $publicDir"

Add-Type -AssemblyName System.Drawing

function Create-ShieldIcon {
    param(
        [int]$size,
        [string]$outputPath,
        [bool]$maskable = $false
    )

    $bitmap = New-Object System.Drawing.Bitmap($size, $size)
    $g = [System.Drawing.Graphics]::FromImage($bitmap)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic

    # Background color #060F10
    $bgColor = [System.Drawing.Color]::FromArgb(255, 6, 15, 16)
    $brushBg = New-Object System.Drawing.SolidBrush($bgColor)
    $g.FillRectangle($brushBg, 0, 0, $size, $size)

    # Padding factor (maskable needs ~15% padding)
    $padRatio = if ($maskable) { 0.20 } else { 0.08 }
    $pad = [int]($size * $padRatio)
    $contentWidth = $size - (2 * $pad)
    $contentHeight = $size - (2 * $pad)

    # Emerald glow circle in the center
    $glowRect = New-Object System.Drawing.RectangleF([float]($pad), [float]($pad), [float]($contentWidth), [float]($contentHeight))
    $glowColor = [System.Drawing.Color]::FromArgb(45, 52, 211, 153)
    $brushGlow = New-Object System.Drawing.SolidBrush($glowColor)
    $g.FillEllipse($brushGlow, $glowRect)

    # Shield path
    $centerX = [float]($size / 2)
    $topY = [float]($pad + ($contentHeight * 0.05))
    $bottomY = [float]($pad + ($contentHeight * 0.95))
    $leftX = [float]($pad + ($contentWidth * 0.12))
    $rightX = [float]($pad + ($contentWidth * 0.88))
    $shoulderY = [float]($pad + ($contentHeight * 0.55))

    $path = New-Object System.Drawing.Drawing2D.GraphicsPath
    $path.AddLine($centerX, $topY, $rightX, [float]($topY + ($contentHeight * 0.12)))
    $path.AddLine($rightX, [float]($topY + ($contentHeight * 0.12)), $rightX, $shoulderY)
    $path.AddBezier($rightX, $shoulderY, $rightX, [float]($bottomY * 0.85), [float]($centerX + ($contentWidth * 0.15)), $bottomY, $centerX, $bottomY)
    $path.AddBezier($centerX, $bottomY, [float]($centerX - ($contentWidth * 0.15)), $bottomY, $leftX, [float]($bottomY * 0.85), $leftX, $shoulderY)
    $path.AddLine($leftX, $shoulderY, $leftX, [float]($topY + ($contentHeight * 0.12)))
    $path.CloseFigure()

    # Fill shield with deep gradient (Forest emerald to midnight navy)
    $shieldRect = New-Object System.Drawing.Rectangle([int]$leftX, [int]$topY, [int]($rightX - $leftX), [int]($bottomY - $topY))
    $gradStart = [System.Drawing.Color]::FromArgb(255, 22, 67, 64)   # #164340
    $gradEnd = [System.Drawing.Color]::FromArgb(255, 10, 24, 38)     # #0A1826
    $shieldBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush($shieldRect, $gradStart, $gradEnd, 45.0)
    $g.FillPath($shieldBrush, $path)

    # Gold Shield Border
    $goldPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(255, 224, 200, 139), [float]($size * 0.025))
    $g.DrawPath($goldPen, $path)

    # Inner Emerald Accent Border
    $innerPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(120, 52, 211, 153), [float]($size * 0.01))
    $g.DrawPath($innerPen, $path)

    # Center Text "PU"
    $fontFamily = New-Object System.Drawing.FontFamily("Arial")
    $fontSize = [float]($size * 0.26)
    $fontStyle = [System.Drawing.FontStyle]::Bold
    $font = New-Object System.Drawing.Font($fontFamily, $fontSize, $fontStyle)
    
    $goldTextBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 245, 230, 184))
    $sf = New-Object System.Drawing.StringFormat
    $sf.Alignment = [System.Drawing.StringAlignment]::Center
    $sf.LineAlignment = [System.Drawing.StringAlignment]::Center

    $textRect = New-Object System.Drawing.RectangleF(0, [float]($pad + ($contentHeight * 0.22)), [float]$size, [float]($size * 0.28))
    $g.DrawString("PU", $font, $goldTextBrush, $textRect, $sf)

    # Subtitle "UNICARE"
    $subFontSize = [float]($size * 0.09)
    $subFont = New-Object System.Drawing.Font($fontFamily, $subFontSize, [System.Drawing.FontStyle]::Bold)
    $subTextBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 52, 211, 153))
    $subTextRect = New-Object System.Drawing.RectangleF(0, [float]($pad + ($contentHeight * 0.54)), [float]$size, [float]($size * 0.15))
    $g.DrawString("UNICARE", $subFont, $subTextBrush, $subTextRect, $sf)

    # Golden Sparkle / Star at bottom of shield
    $starSize = [float]($size * 0.06)
    $starY = [float]($pad + ($contentHeight * 0.72))
    $starRect = New-Object System.Drawing.RectangleF([float]($centerX - ($starSize/2)), [float]($starY - ($starSize/2)), $starSize, $starSize)
    $starBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 224, 200, 139))
    $g.FillEllipse($starBrush, $starRect)

    # Save to path
    $bitmap.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose()
    $bitmap.Dispose()
    Write-Output "Generated: $outputPath ($size x $size)"
}

function Create-Screenshot {
    param(
        [int]$width,
        [int]$height,
        [string]$outputPath,
        [string]$title
    )

    $bitmap = New-Object System.Drawing.Bitmap($width, $height)
    $g = [System.Drawing.Graphics]::FromImage($bitmap)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit

    # Dark background #060F10
    $bgBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 6, 15, 16))
    $g.FillRectangle($bgBrush, 0, 0, $width, $height)

    # Top gradient bar
    $goldBar = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 224, 200, 139))
    $g.FillRectangle($goldBar, 0, 0, $width, 8)

    # Subtle ambient gradient circle
    $accentBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(35, 52, 211, 153))
    $g.FillEllipse($accentBrush, [int]($width * 0.2), [int]($height * 0.1), [int]($width * 0.6), [int]($height * 0.6))

    # Header Card
    $cardBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(220, 12, 28, 30))
    $cardPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(100, 224, 200, 139), 2)
    $hWidth = [int]($width - 80)
    $headerRect = New-Object System.Drawing.Rectangle(40, 40, $hWidth, 90)
    $g.FillRectangle($cardBrush, $headerRect)
    $g.DrawRectangle($cardPen, $headerRect)

    # Text in header
    $fontFamily = New-Object System.Drawing.FontFamily("Arial")
    $titleFont = New-Object System.Drawing.Font($fontFamily, 24, [System.Drawing.FontStyle]::Bold)
    $subFont = New-Object System.Drawing.Font($fontFamily, 14, [System.Drawing.FontStyle]::Regular)
    $goldBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 224, 200, 139))
    $whiteBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(240, 255, 255, 255))
    $dimBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(180, 180, 200, 200))

    $g.DrawString("PU UNICARE", $titleFont, $goldBrush, [float]60, [float]52)
    $g.DrawString("Parul University Campus Facilities & Maintenance Platform", $subFont, $dimBrush, [float]60, [float]90)

    # Main Hero section card
    $heroHeight = [int]($height - 200)
    $heroRect = New-Object System.Drawing.Rectangle(40, 150, $hWidth, $heroHeight)
    $g.FillRectangle($cardBrush, $heroRect)
    $g.DrawRectangle($cardPen, $heroRect)

    # Hero headline
    $headlineSize = [float]([Math]::Max(18, [int]($width * 0.032)))
    $heroFont = New-Object System.Drawing.Font($fontFamily, $headlineSize, [System.Drawing.FontStyle]::Bold)
    $g.DrawString("Excellence in Campus Care & Resolution", $heroFont, $whiteBrush, [float]70, [float]180)

    $descSize = [float]([Math]::Max(12, [int]($width * 0.018)))
    $descFont = New-Object System.Drawing.Font($fontFamily, $descSize, [System.Drawing.FontStyle]::Regular)
    $g.DrawString("AI-Powered Complaints • Live Tracking • Building Directory • Offline Support", $descFont, $goldBrush, [float]70, [float]240)

    # Feature badges
    $badges = @("AI Voice Complaint", "Campus Map & GPS", "Real-Time SMS & Push", "Multi-Language")
    $bx = 70
    $by = 300
    $badgeFont = New-Object System.Drawing.Font($fontFamily, 12, [System.Drawing.FontStyle]::Bold)
    $badgeBg = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 20, 45, 42))
    $badgeBorder = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(255, 52, 211, 153), 1.5)
    $badgeTextBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 52, 211, 153))

    foreach ($badge in $badges) {
        $bw = 200
        $bh = 40
        if (($bx + $bw) -gt ($width - 80)) {
            $bx = 70
            $by += 55
        }
        $bRect = New-Object System.Drawing.Rectangle($bx, $by, $bw, $bh)
        $g.FillRectangle($badgeBg, $bRect)
        $g.DrawRectangle($badgeBorder, $bRect)
        $sf = New-Object System.Drawing.StringFormat
        $sf.Alignment = [System.Drawing.StringAlignment]::Center
        $sf.LineAlignment = [System.Drawing.StringAlignment]::Center
        $bRectF = New-Object System.Drawing.RectangleF([float]$bx, [float]$by, [float]$bw, [float]$bh)
        $g.DrawString($badge, $badgeFont, $badgeTextBrush, $bRectF, $sf)
        $bx += $bw + 20
    }

    $bitmap.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose()
    $bitmap.Dispose()
    Write-Output "Generated Screenshot: $outputPath ($width x $height)"
}

$publicDir = "c:\PU unicare\public"

# 1. 192x192
Create-ShieldIcon -size 192 -outputPath "$publicDir\icon-192.png" -maskable $false

# 2. 512x512
Create-ShieldIcon -size 512 -outputPath "$publicDir\icon-512.png" -maskable $false

# 3. 512x512 Maskable
Create-ShieldIcon -size 512 -outputPath "$publicDir\icon-maskable.png" -maskable $true

# 4. Apple Touch Icon (180x180)
Create-ShieldIcon -size 180 -outputPath "$publicDir\apple-touch-icon.png" -maskable $false

# 5. Screenshots
Create-Screenshot -width 1280 -height 720 -outputPath "$publicDir\screenshot-wide.png" -title "PU UNICARE Dashboard"
Create-Screenshot -width 720 -height 1280 -outputPath "$publicDir\screenshot-narrow.png" -title "PU UNICARE Mobile"

import Cocoa

if CommandLine.arguments.count < 3 {
    print("Usage: convert_to_rgba <input_path> <output_path>")
    exit(1)
}

let inputPath = CommandLine.arguments[1]
let outputPath = CommandLine.arguments[2]

guard let image = NSImage(contentsOfFile: inputPath) else {
    print("Failed to load image at \(inputPath)")
    exit(1)
}

guard let tiffData = image.tiffRepresentation,
      let bitmap = NSBitmapImageRep(data: tiffData) else {
    print("Failed to get bitmap representation")
    exit(1)
}

// Create a new bitmap with alpha capability
let colorSpace = NSColorSpace.sRGB
let newBitmap = NSBitmapImageRep(
    bitmapDataPlanes: nil,
    pixelsWide: Int(image.size.width),
    pixelsHigh: Int(image.size.height),
    bitsPerSample: 8,
    samplesPerPixel: 4,
    hasAlpha: true,
    isPlanar: false,
    colorSpaceName: .deviceRGB,
    bytesPerRow: 0,
    bitsPerPixel: 32
)!

NSGraphicsContext.saveGraphicsState()
let context = NSGraphicsContext(bitmapImageRep: newBitmap)
NSGraphicsContext.current = context
image.draw(in: NSRect(origin: .zero, size: image.size))
NSGraphicsContext.restoreGraphicsState()

if let pngData = newBitmap.representation(using: .png, properties: [:]) {
    do {
        try pngData.write(to: URL(fileURLWithPath: outputPath))
        print("Successfully converted to RGBA: \(outputPath)")
    } catch {
        print("Failed to write to \(outputPath): \(error)")
        exit(1)
    }
} else {
    print("Failed to generate PNG data")
    exit(1)
}

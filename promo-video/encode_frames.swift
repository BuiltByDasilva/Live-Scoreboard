import AppKit
import AVFoundation
import CoreGraphics

struct EncoderError: Error, CustomStringConvertible {
    let description: String
}

func fail(_ message: String) throws -> Never {
    throw EncoderError(description: message)
}

let args = CommandLine.arguments
guard args.count >= 6 else {
    print("Usage: swift encode_frames.swift <frames-dir> <output.mp4> <fps> <width> <height>")
    exit(2)
}

let framesDir = URL(fileURLWithPath: args[1], isDirectory: true)
let outputURL = URL(fileURLWithPath: args[2])
let fps = Int32(args[3]) ?? 24
let width = Int(args[4]) ?? 1920
let height = Int(args[5]) ?? 1080

let fm = FileManager.default
if fm.fileExists(atPath: outputURL.path) {
    try fm.removeItem(at: outputURL)
}

let files = try fm.contentsOfDirectory(at: framesDir, includingPropertiesForKeys: nil)
    .filter { $0.pathExtension.lowercased() == "png" }
    .sorted { $0.lastPathComponent < $1.lastPathComponent }

guard !files.isEmpty else {
    try fail("No PNG frames found in \(framesDir.path)")
}

let writer = try AVAssetWriter(outputURL: outputURL, fileType: .mp4)
let settings: [String: Any] = [
    AVVideoCodecKey: AVVideoCodecType.h264,
    AVVideoWidthKey: width,
    AVVideoHeightKey: height,
    AVVideoCompressionPropertiesKey: [
        AVVideoAverageBitRateKey: 12_000_000,
        AVVideoProfileLevelKey: AVVideoProfileLevelH264HighAutoLevel,
    ],
]

let input = AVAssetWriterInput(mediaType: .video, outputSettings: settings)
input.expectsMediaDataInRealTime = false

let adaptor = AVAssetWriterInputPixelBufferAdaptor(
    assetWriterInput: input,
    sourcePixelBufferAttributes: [
        kCVPixelBufferPixelFormatTypeKey as String: kCVPixelFormatType_32ARGB,
        kCVPixelBufferWidthKey as String: width,
        kCVPixelBufferHeightKey as String: height,
    ]
)

guard writer.canAdd(input) else {
    try fail("Cannot add video input")
}
writer.add(input)

guard writer.startWriting() else {
    try fail(writer.error?.localizedDescription ?? "Writer failed to start")
}
writer.startSession(atSourceTime: .zero)

func pixelBuffer(from image: NSImage, width: Int, height: Int) throws -> CVPixelBuffer {
    var maybeBuffer: CVPixelBuffer?
    let attrs = [
        kCVPixelBufferCGImageCompatibilityKey: true,
        kCVPixelBufferCGBitmapContextCompatibilityKey: true,
    ] as CFDictionary

    let status = CVPixelBufferCreate(kCFAllocatorDefault, width, height, kCVPixelFormatType_32ARGB, attrs, &maybeBuffer)
    guard status == kCVReturnSuccess, let buffer = maybeBuffer else {
        try fail("Could not create pixel buffer")
    }

    CVPixelBufferLockBaseAddress(buffer, [])
    defer { CVPixelBufferUnlockBaseAddress(buffer, []) }

    guard
        let context = CGContext(
            data: CVPixelBufferGetBaseAddress(buffer),
            width: width,
            height: height,
            bitsPerComponent: 8,
            bytesPerRow: CVPixelBufferGetBytesPerRow(buffer),
            space: CGColorSpaceCreateDeviceRGB(),
            bitmapInfo: CGImageAlphaInfo.noneSkipFirst.rawValue
        )
    else {
        try fail("Could not create CGContext")
    }

    context.clear(CGRect(x: 0, y: 0, width: width, height: height))
    context.setFillColor(NSColor.black.cgColor)
    context.fill(CGRect(x: 0, y: 0, width: width, height: height))

    guard let cgImage = image.cgImage(forProposedRect: nil, context: nil, hints: nil) else {
        try fail("Could not decode frame image")
    }

    context.draw(cgImage, in: CGRect(x: 0, y: 0, width: width, height: height))
    return buffer
}

for (index, file) in files.enumerated() {
    while !input.isReadyForMoreMediaData {
        Thread.sleep(forTimeInterval: 0.01)
    }

    guard let image = NSImage(contentsOf: file) else {
        try fail("Could not load \(file.path)")
    }

    let buffer = try pixelBuffer(from: image, width: width, height: height)
    let time = CMTime(value: CMTimeValue(index), timescale: fps)

    guard adaptor.append(buffer, withPresentationTime: time) else {
        try fail(writer.error?.localizedDescription ?? "Failed to append frame \(index)")
    }

    if index % Int(fps * 2) == 0 {
        print("encoded \(index)/\(files.count)")
    }
}

input.markAsFinished()
writer.finishWriting {
    if let error = writer.error {
        print("encode failed: \(error.localizedDescription)")
        exit(1)
    }
    print("wrote \(outputURL.path)")
    exit(0)
}

RunLoop.main.run()

// Gera os ícones do app (iOS, Android adaptativo e favicon) só com AppKit, sem pacote.
//
// Uso, a partir de `mobile/`:
//   swift scripts/generate-icons.swift assets
//
// Desenho: fundo vermelho FIAP (#E4002B, o `tint` do tema), os anéis translúcidos do topo das
// telas de entrada (`AuthHero`) e a marca "FIAP" em branco, na fonte do sistema em peso heavy.
// Depois de rodar, confira as imagens e mantenha `android.adaptiveIcon.backgroundColor` do
// `app.json` igual a #E4002B.
import AppKit

let red = NSColor(srgbRed: 0xE4 / 255, green: 0x00, blue: 0x2B / 255, alpha: 1)
let ringColor = NSColor(white: 1, alpha: 0.18)

guard CommandLine.arguments.count == 2 else {
  print("Uso: swift scripts/generate-icons.swift <pasta de saída>")
  exit(1)
}
let outDir = URL(fileURLWithPath: CommandLine.arguments[1], isDirectory: true)

/// Desenha numa tela quadrada de `size` px e salva como PNG.
func render(_ name: String, size: Int, draw: (CGFloat) -> Void) {
  let rep = NSBitmapImageRep(
    bitmapDataPlanes: nil, pixelsWide: size, pixelsHigh: size, bitsPerSample: 8,
    samplesPerPixel: 4, hasAlpha: true, isPlanar: false, colorSpaceName: .deviceRGB,
    bytesPerRow: 0, bitsPerPixel: 0)!
  NSGraphicsContext.saveGraphicsState()
  NSGraphicsContext.current = NSGraphicsContext(bitmapImageRep: rep)
  draw(CGFloat(size))
  NSGraphicsContext.restoreGraphicsState()
  let url = outDir.appendingPathComponent(name)
  try! rep.representation(using: .png, properties: [:])!.write(to: url)
  print("gerado \(url.path)")
}

func fill(_ color: NSColor, _ s: CGFloat) {
  color.setFill()
  NSRect(x: 0, y: 0, width: s, height: s).fill()
}

/// Anéis concêntricos no canto superior direito, como no topo das telas de entrada.
func rings(_ s: CGFloat) {
  ringColor.setStroke()
  for scale in [1.0, 1.6, 2.2] as [CGFloat] {
    let d = s * 0.3 * scale
    let path = NSBezierPath(ovalIn: NSRect(x: s * 0.88 - d / 2, y: s * 0.75 - d / 2, width: d, height: d))
    path.lineWidth = s * 0.01
    path.stroke()
  }
}

/// "FIAP" centralizado; `width` é a largura que a palavra deve ocupar, em fração do lado.
func wordmark(_ s: CGFloat, width: CGFloat, color: NSColor = .white) {
  func attributed(_ fontSize: CGFloat) -> NSAttributedString {
    NSAttributedString(string: "FIAP", attributes: [
      .font: NSFont.systemFont(ofSize: fontSize, weight: .heavy),
      .foregroundColor: color,
      .kern: -fontSize * 0.02,
    ])
  }
  let probe = attributed(100)
  let text = attributed(100 * (s * width) / probe.size().width)
  let size = text.size()
  text.draw(at: NSPoint(x: (s - size.width) / 2, y: (s - size.height) / 2))
}

// iOS e geral: quadrado cheio (o sistema arredonda os cantos).
render("icon.png", size: 1024) { s in
  fill(red, s)
  rings(s)
  wordmark(s, width: 0.62)
}

// Android adaptativo: fundo e primeiro plano separados. A marca fica dentro da área segura
// (círculo central de 66% do lado), por isso é mais estreita que no iOS.
render("android-icon-background.png", size: 512) { s in
  fill(red, s)
  rings(s)
}
render("android-icon-foreground.png", size: 512) { s in
  wordmark(s, width: 0.46)
}
// Monocromático (ícones temáticos do Android 13+): só a forma importa, na cor branca.
render("android-icon-monochrome.png", size: 432) { s in
  wordmark(s, width: 0.46)
}

// Web: sem anéis, que somem em 48 px.
render("favicon.png", size: 48) { s in
  fill(red, s)
  wordmark(s, width: 0.78)
}

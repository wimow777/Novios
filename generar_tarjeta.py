import os
import sys

def draw_heart(draw, xc, yc, size, color):
    """
    Dibuja un corazón vectorial perfecto usando dos círculos y un triángulo.
    """
    r = size
    # Lóbulo izquierdo
    draw.ellipse([xc - 2*r, yc - r, xc, yc + r], fill=color)
    # Lóbulo derecho
    draw.ellipse([xc, yc - r, xc + 2*r, yc + r], fill=color)
    # Triángulo inferior
    draw.polygon([
        (xc - 2*r, yc),
        (xc + 2*r, yc),
        (xc, yc + int(2.3*r))
    ], fill=color)

def draw_sparkle(draw, xc, yc, size, color):
    """
    Dibuja un destello/rombo vectorial perfecto.
    """
    s = size
    draw.polygon([
        (xc, yc - s),      # Arriba
        (xc + int(s*0.6), yc),  # Derecha
        (xc, yc + s),      # Abajo
        (xc - int(s*0.6), yc)   # Izquierda
    ], fill=color)

def main():
    try:
        from PIL import Image, ImageDraw, ImageFont
    except ImportError:
        print("Instalando la librería de imágenes Pillow...")
        import subprocess
        subprocess.check_call([sys.executable, "-m", "pip", "install", "Pillow"])
        from PIL import Image, ImageDraw, ImageFont

    print("Generando imagen de tarjeta premium con destellos vectoriales corregidos...")

    # 1. Crear lienzo en modo RGBA para soportar transparencias reales
    W, H = 1600, 1000
    card = Image.new('RGBA', (W, H), (15, 2, 36, 255)) # Fondo #0f0224
    
    # Capa para dibujar elementos con soporte de canal alfa
    overlay = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)

    # 2. Dibujar fondo degradado radial translúcido (Glow lila suave)
    # Cara izquierda (Portada)
    cx1, cy1 = W // 4, H // 2
    for r in range(350, 0, -4):
        alpha = int(75 * (1 - r / 350)) # Transparencia real
        draw.ellipse([cx1 - r, cy1 - r, cx1 + r, cy1 + r], fill=(168, 85, 247, alpha))
    
    # Cara derecha (Código QR)
    cx2, cy2 = 3 * W // 4, H // 2
    for r in range(350, 0, -4):
        alpha = int(75 * (1 - r / 350)) # Transparencia real
        draw.ellipse([cx2 - r, cy2 - r, cx2 + r, cy2 + r], fill=(168, 85, 247, alpha))

    # Combinar el fondo brillante con el fondo base
    card = Image.alpha_composite(card, overlay)
    draw = ImageDraw.Draw(card)

    # 3. Dibujar bordes elegantes de corte y doblez
    draw.rectangle([(25, 25), (W - 25, H - 25)], outline=(168, 85, 247, 255), width=3) # Borde principal violeta
    draw.rectangle([(32, 32), (W - 32, H - 32)], outline=(139, 92, 246, 255), width=1) # Borde interior fino

    # Línea de doblez vertical discontinua en el centro
    for y in range(45, H - 45, 20):
        draw.line([(W // 2, y), (W // 2, y + 10)], fill=(168, 85, 247, 255), width=2)

    # 4. Cargar Fuentes del sistema de Windows
    font_dir = "C:\\Windows\\Fonts\\"
    try:
        font_title = ImageFont.truetype(font_dir + "georgiab.ttf", 64) # Georgia Bold
        font_subtitle = ImageFont.truetype(font_dir + "georgiai.ttf", 36) # Georgia Italic
        font_pretitle = ImageFont.truetype(font_dir + "arialbd.ttf", 24) # Arial Bold
        font_hint = ImageFont.truetype(font_dir + "arial.ttf", 20) # Arial Regular
    except IOError:
        font_title = ImageFont.load_default()
        font_subtitle = font_title
        font_pretitle = font_title
        font_hint = font_title

    # 5. Escribir textos y destellos en CARA A: PORTADA (Izquierda)
    # Dibujar tres destellos vectoriales blancos y elegantes en la parte superior
    # Destello izquierdo
    draw_sparkle(draw, xc=350, yc=220, size=20, color=(255, 255, 255, 255))
    # Destello central (más grande)
    draw_sparkle(draw, xc=400, yc=220, size=28, color=(255, 255, 255, 255))
    # Destello derecho
    draw_sparkle(draw, xc=450, yc=220, size=20, color=(255, 255, 255, 255))
    
    # Pretítulo (color lila claro)
    draw.text((400, 310), "UN AÑO JUNTOS", fill=(220, 180, 255, 255), font=font_pretitle, anchor="mm")
    
    # Título principal
    draw.text((400, 420), "Para ti,\nmi Loviuu", fill=(255, 255, 255, 255), font=font_title, anchor="mm", align="center")
    
    # Dibujar corazón blanco brillante programático
    draw_heart(draw, xc=400, yc=530, size=24, color=(255, 255, 255, 255))

    # Subtítulo romántico
    draw.text((400, 640), "“nuestro propio espacio...”", fill=(220, 180, 255, 255), font=font_subtitle, anchor="mm")

    # 6. Escribir textos en CARA B: CÓDIGO QR (Derecha)
    # Título derecho
    draw.text((1200, 240), "Este lugar es nuestro", fill=(255, 255, 255, 255), font=font_title, anchor="mm")
    
    # Subtítulo derecho
    draw.text((1200, 320), "Líaa & Diego — 365 días", fill=(220, 180, 255, 255), font=font_subtitle, anchor="mm")

    # 7. Insertar el Código QR real y escaneable
    qr_path = "codigo_qr_premium.png"
    if os.path.exists(qr_path):
        qr_img = Image.open(qr_path)
        # Redimensionar el QR a 240x240px
        qr_img = qr_img.resize((240, 240), Image.Resampling.LANCZOS)
        
        # Crear un marco blanco redondeado para colocar el QR encima
        qr_bg = Image.new('RGBA', (280, 280), (255, 255, 255, 255))
        
        # Pegar el código QR en el centro del marco blanco
        qr_bg.paste(qr_img, (20, 20))
        
        # Pegar el marco blanco con el QR en el centro de la sección derecha
        card.paste(qr_bg, (1200 - 140, 380), qr_bg if qr_bg.mode == 'RGBA' else None)
    else:
        print("Error: No se encontró 'codigo_qr_premium.png'.")

    # Texto indicación inferior (Limpio de caracteres que causen cajas cuadradas)
    draw.text((1200, 720), "Escanea para entrar a nuestro rincón especial", fill=(220, 180, 255, 255), font=font_hint, anchor="mm")
    
    # Dibujar un precioso corazoncito rosa/blanco debajo en lugar de un emoji roto
    draw_heart(draw, xc=1200, yc=765, size=10, color=(255, 255, 255, 255))

    # 8. Convertir a RGB (removiendo canal alfa) y guardar como PNG de alta calidad
    final_card = card.convert('RGB')
    out_path = "tarjeta_aniversario_imprimible.png"
    final_card.save(out_path, "PNG", dpi=(300, 300))
    print(f"¡Éxito! Tarjeta guardada como '{out_path}'.")

if __name__ == "__main__":
    main()

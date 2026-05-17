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
        (xc, yc - s),
        (xc + int(s*0.6), yc),
        (xc, yc + s),
        (xc - int(s*0.6), yc)
    ], fill=color)

def draw_rotated_ellipse(card, xc, yc, w, h, angle, color):
    """
    Dibuja una elipse rotada en una capa transparente y la mezcla sobre la tarjeta.
    Sirve para dibujar pétalos y hojas flotantes.
    """
    from PIL import Image, ImageDraw
    # Crear una imagen auxiliar para rotar sin pixelar
    temp = Image.new('RGBA', (w*2, h*2), (0, 0, 0, 0))
    temp_draw = ImageDraw.Draw(temp)
    temp_draw.ellipse([w - w//2, h - h//2, w + w//2, h + h//2], fill=color)
    rotated = temp.rotate(angle, resample=Image.Resampling.BICUBIC)
    # Pegar la imagen rotada en la tarjeta con canal alfa
    card.paste(rotated, (xc - w, yc - h), rotated)

def draw_musical_note(draw, card, xc, yc, color):
    """
    Dibuja una nota musical (corchea) muy elegante.
    """
    # Cabeza de la nota (elipse rotada)
    draw_rotated_ellipse(card, xc, yc, 16, 12, 15, color)
    # Plica (línea vertical que sube por la derecha)
    draw.line([(xc + 6, yc), (xc + 6, yc - 32)], fill=color, width=2)
    # Corchete (bandera pequeña)
    draw.polygon([
        (xc + 6, yc - 32),
        (xc + 18, yc - 25),
        (xc + 13, yc - 18),
        (xc + 6, yc - 22)
    ], fill=color)

def draw_tulip(draw, card, xc, yc, scale, color):
    """
    Dibuja un tulipán estilizado a escala.
    """
    s = scale
    # Tallo (Stem)
    draw.line([(xc, yc + int(12*s)), (xc, yc + int(65*s))], fill=color, width=int(2.5*s))
    # Hoja rotada
    draw_rotated_ellipse(card, xc + int(14*s), yc + int(42*s), int(10*s), int(26*s), -30, color)
    # Pétalos laterales
    draw_rotated_ellipse(card, xc - int(8*s), yc - int(4*s), int(10*s), int(22*s), 18, color)
    draw_rotated_ellipse(card, xc + int(8*s), yc - int(4*s), int(10*s), int(22*s), -18, color)
    # Pétalo central frontal
    draw_rotated_ellipse(card, xc, yc, int(13*s), int(25*s), 0, color)

def main():
    try:
        from PIL import Image, ImageDraw, ImageFont
    except ImportError:
        print("Instalando la librería de imágenes Pillow...")
        import subprocess
        subprocess.check_call([sys.executable, "-m", "pip", "install", "Pillow"])
        from PIL import Image, ImageDraw, ImageFont

    print("Generando imagen de tarjeta premium con fondo enriquecido de tulipanes, pétalos y notas musicales...")

    # 1. Crear lienzo en modo RGBA para transparencias
    W, H = 1600, 1000
    card = Image.new('RGBA', (W, H), (15, 2, 36, 255)) # Fondo #0f0224 (Violeta profundo)
    
    # Capa de dibujo
    overlay = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)

    # 2. Dibujar la cuadrícula de puntos lilas (Dot Grid)
    # Imita a la perfección la textura punteada de la web
    dot_color = (168, 85, 247, 30) # Puntos lilas sumamente suaves
    for x in range(40, W - 40, 24):
        for y in range(40, H - 40, 24):
            # Omitir puntos que toquen el centro de la línea de doblez para limpieza
            if abs(x - W//2) < 20:
                continue
            draw.ellipse([x-1, y-1, x+1, y+1], fill=dot_color)

    # 3. Dibujar fondo degradado radial lila translúcido
    # Cara izquierda (Portada)
    cx1, cy1 = W // 4, H // 2
    for r in range(350, 0, -4):
        alpha = int(70 * (1 - r / 350))
        draw.ellipse([cx1 - r, cy1 - r, cx1 + r, cy1 + r], fill=(168, 85, 247, alpha))
    
    # Cara derecha (Código QR)
    cx2, cy2 = 3 * W // 4, H // 2
    for r in range(350, 0, -4):
        alpha = int(70 * (1 - r / 350))
        draw.ellipse([cx2 - r, cy2 - r, cx2 + r, cy2 + r], fill=(168, 85, 247, alpha))

    # Combinar el fondo básico de degradado y puntos lilas
    card = Image.alpha_composite(card, overlay)
    draw = ImageDraw.Draw(card)

    # 4. Dibujar flores, pétalos y notas musicales de fondo (muy suaves, alpha=40-75)
    deco_color = (220, 180, 255, 45) # Lila blanquecino súper translúcido
    note_color = (200, 170, 255, 35) # Color notas flotantes
    petal_color = (210, 175, 255, 40) # Color pétalos flotantes

    # TULIPANES DECORATIVOS EN ESQUINAS (Igual a hero-tl, hero-tr, hero-bl, hero-br en la web)
    # Cara izquierda (Portada)
    draw_tulip(draw, card, xc=90, yc=100, scale=1.3, color=deco_color)   # Superior izquierda
    draw_tulip(draw, card, xc=710, yc=100, scale=1.3, color=deco_color)  # Superior derecha
    draw_tulip(draw, card, xc=90, yc=900, scale=1.3, color=deco_color)   # Inferior izquierda
    draw_tulip(draw, card, xc=710, yc=900, scale=1.3, color=deco_color)  # Inferior derecha

    # Cara derecha (QR)
    draw_tulip(draw, card, xc=890, yc=100, scale=1.3, color=deco_color)  # Superior izquierda
    draw_tulip(draw, card, xc=1510, yc=100, scale=1.3, color=deco_color) # Superior derecha
    draw_tulip(draw, card, xc=890, yc=900, scale=1.3, color=deco_color)  # Inferior izquierda
    draw_tulip(draw, card, xc=1510, yc=900, scale=1.3, color=deco_color) # Inferior derecha

    # PÉTALOS FLOTANTES DISPERSOS (Como si cayeran con el viento)
    # Cara izquierda
    draw_rotated_ellipse(card, xc=220, yc=260, w=12, h=22, angle=35, color=petal_color)
    draw_rotated_ellipse(card, xc=580, yc=200, w=14, h=26, angle=-25, color=petal_color)
    draw_rotated_ellipse(card, xc=180, yc=750, w=10, h=18, angle=45, color=petal_color)
    draw_rotated_ellipse(card, xc=620, yc=720, w=14, h=24, angle=-15, color=petal_color)

    # Cara derecha
    draw_rotated_ellipse(card, xc=1020, yc=180, w=14, h=25, angle=20, color=petal_color)
    draw_rotated_ellipse(card, xc=1380, yc=220, w=12, h=22, angle=-40, color=petal_color)
    draw_rotated_ellipse(card, xc=980, yc=780, w=12, h=22, angle=15, color=petal_color)
    draw_rotated_ellipse(card, xc=1400, yc=740, w=14, h=26, angle=-30, color=petal_color)

    # NOTAS MUSICALES FLOTANTES
    # Cara izquierda
    draw_musical_note(draw, card, xc=140, yc=460, color=note_color)
    draw_musical_note(draw, card, xc=660, yc=500, color=note_color)
    
    # Cara derecha
    draw_musical_note(draw, card, xc=950, yc=420, color=note_color)
    draw_musical_note(draw, card, xc=1450, yc=480, color=note_color)

    # 5. Dibujar bordes elegantes de corte y doblez
    draw.rectangle([(25, 25), (W - 25, H - 25)], outline=(168, 85, 247, 255), width=3) # Borde principal violeta
    draw.rectangle([(32, 32), (W - 32, H - 32)], outline=(139, 92, 246, 255), width=1) # Borde interior fino

    # Línea de doblez vertical discontinua en el centro
    for y in range(45, H - 45, 20):
        draw.line([(W // 2, y), (W // 2, y + 10)], fill=(168, 85, 247, 255), width=2)

    # 6. Cargar Fuentes de Windows
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

    # 7. Escribir textos y destellos en CARA A: PORTADA (Izquierda)
    # Dibujar tres destellos vectoriales blancos y elegantes en la parte superior
    draw_sparkle(draw, xc=350, yc=220, size=20, color=(255, 255, 255, 255))
    draw_sparkle(draw, xc=400, yc=220, size=28, color=(255, 255, 255, 255))
    draw_sparkle(draw, xc=450, yc=220, size=20, color=(255, 255, 255, 255))
    
    # Pretítulo (color lila claro)
    draw.text((400, 310), "UN AÑO JUNTOS", fill=(220, 180, 255, 255), font=font_pretitle, anchor="mm")
    
    # Título principal
    draw.text((400, 420), "Para ti,\nmi Loviuu", fill=(255, 255, 255, 255), font=font_title, anchor="mm", align="center")
    
    # Dibujar corazón blanco brillante programático
    draw_heart(draw, xc=400, yc=530, size=24, color=(255, 255, 255, 255))

    # Subtítulo romántico
    draw.text((400, 640), "“nuestro propio espacio...”", fill=(220, 180, 255, 255), font=font_subtitle, anchor="mm")

    # 8. Escribir textos en CARA B: CÓDIGO QR (Derecha)
    # Título derecho
    draw.text((1200, 240), "Este lugar es nuestro", fill=(255, 255, 255, 255), font=font_title, anchor="mm")
    
    # Subtítulo derecho
    draw.text((1200, 320), "Líaa & Diego — 365 días", fill=(220, 180, 255, 255), font=font_subtitle, anchor="mm")

    # 9. Insertar el Código QR real y escaneable
    qr_path = "codigo_qr_premium.png"
    if os.path.exists(qr_path):
        qr_img = Image.open(qr_path)
        qr_img = qr_img.resize((240, 240), Image.Resampling.LANCZOS)
        
        # Crear un marco blanco redondeado para colocar el QR encima
        qr_bg = Image.new('RGBA', (280, 280), (255, 255, 255, 255))
        qr_bg.paste(qr_img, (20, 20))
        card.paste(qr_bg, (1200 - 140, 380), qr_bg if qr_bg.mode == 'RGBA' else None)
    else:
        print("Error: No se encontró 'codigo_qr_premium.png'.")

    # Texto indicación inferior
    draw.text((1200, 720), "Escanea para entrar a nuestro rincón especial", fill=(220, 180, 255, 255), font=font_hint, anchor="mm")
    
    # Dibujar un precioso corazoncito rosa/blanco debajo en lugar de un emoji roto
    draw_heart(draw, xc=1200, yc=765, size=10, color=(255, 255, 255, 255))

    # 10. Convertir a RGB (removiendo canal alfa) y guardar como PNG de alta calidad
    final_card = card.convert('RGB')
    out_path = "tarjeta_aniversario_imprimible.png"
    final_card.save(out_path, "PNG", dpi=(300, 300))
    print(f"¡Éxito! Tarjeta guardada como '{out_path}'.")

if __name__ == "__main__":
    main()

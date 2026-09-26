import { TemplateConfig, PosterContent, TemplateZone, CopyVariation } from '../types/template';

/**
 * Loads an image from a URL as an HTMLImageElement with promise support.
 */
export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(new Error(`Failed to load image at ${src}: ${e}`));
    img.src = src;
  });
}

/**
 * Wraps text into lines that do not exceed maxWidth.
 * Handles mixed-script text including Telugu, Hindi, and English.
 */
function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let currentLine = '';

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const testWidth = ctx.measureText(testLine).width;

    if (testWidth > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines.length > 0 ? lines : [''];
}

/**
 * Draws a rounded rectangle path on the canvas context.
 */
function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

/**
 * Core 2D Canvas Template Renderer.
 * Draws the ORIGINAL template background image as the base layer,
 * then accurately overlays the logo, product image, and formatted Unicode text into the template's designated zones.
 */
export async function renderPosterToCanvas(
  canvas: HTMLCanvasElement,
  template: TemplateConfig,
  content: PosterContent
): Promise<void> {
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get 2D canvas context');

  // Set physical pixel dimensions
  canvas.width = template.width;
  canvas.height = template.height;

  // 1. Draw Original Template Background Image
  try {
    const bgImage = await loadImage(template.backgroundUrl);
    ctx.drawImage(bgImage, 0, 0, template.width, template.height);
  } catch (err) {
    console.warn(`Could not load template background from ${template.backgroundUrl}, falling back to neutral gradient:`, err);
    const grad = ctx.createLinearGradient(0, 0, 0, template.height);
    grad.addColorStop(0, '#0F172A');
    grad.addColorStop(1, '#0284C7');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, template.width, template.height);
  }

  // 2. Render Each Configured Content Zone
  for (const zone of template.zones) {
    if (zone.type === 'image') {
      await renderImageZone(ctx, zone, content, template);
    } else {
      renderTextZone(ctx, zone, content, template);
    }
  }
}

/**
 * Renders image zones: product_image or logo.
 */
async function renderImageZone(
  ctx: CanvasRenderingContext2D,
  zone: TemplateZone,
  content: PosterContent,
  template?: TemplateConfig
) {
  // If card badge container requested
  if (zone.badgeStyle === 'card') {
    ctx.save();
    if (zone.badgeBg) {
      ctx.fillStyle = zone.badgeBg;
      roundRect(ctx, zone.x, zone.y, zone.width, zone.height, zone.badgeRadius || 16);
      ctx.fill();
    }
    if (zone.badgeBorder) {
      ctx.strokeStyle = zone.badgeBorder;
      ctx.lineWidth = 3;
      roundRect(ctx, zone.x, zone.y, zone.width, zone.height, zone.badgeRadius || 16);
      ctx.stroke();
    }
    ctx.restore();
  }

  const imageUrl = zone.id === 'logo' ? content.logo_url : content.product_image_url;

  if (imageUrl) {
    try {
      const img = await loadImage(imageUrl);
      ctx.save();
      roundRect(ctx, zone.x + 4, zone.y + 4, zone.width - 8, zone.height - 8, zone.badgeRadius ? zone.badgeRadius - 4 : 12);
      ctx.clip();

      const fit = zone.fit || 'contain';
      const imgAspect = img.width / img.height;
      const zoneAspect = zone.width / zone.height;

      let drawW = zone.width;
      let drawH = zone.height;
      let drawX = zone.x;
      let drawY = zone.y;

      if (fit === 'contain') {
        if (imgAspect > zoneAspect) {
          drawW = zone.width;
          drawH = zone.width / imgAspect;
          drawY = zone.y + (zone.height - drawH) / 2;
        } else {
          drawH = zone.height;
          drawW = zone.height * imgAspect;
          drawX = zone.x + (zone.width - drawW) / 2;
        }
      } else {
        // cover
        if (imgAspect > zoneAspect) {
          drawH = zone.height;
          drawW = zone.height * imgAspect;
          drawX = zone.x + (zone.width - drawW) / 2;
        } else {
          drawW = zone.width;
          drawH = zone.width / imgAspect;
          drawY = zone.y + (zone.height - drawH) / 2;
        }
      }

      ctx.drawImage(img, drawX, drawY, drawW, drawH);
      ctx.restore();
    } catch (e) {
      console.warn(`Could not render image for zone ${zone.id}:`, e);
    }
  } else if (zone.id === 'product_image') {
    // High-contrast, theme-matched showcase banner when no product photo is uploaded
    ctx.save();
    const theme = template?.theme || 'blue';
    const isDark = (theme === 'blue');

    const titleColor = isDark
      ? '#FACC15'
      : theme === 'purple'
      ? '#2E1065'
      : theme === 'green'
      ? '#022C22'
      : '#082F49';

    const subColor = isDark
      ? '#FFFFFF'
      : theme === 'purple'
      ? '#4338CA'
      : theme === 'green'
      ? '#065F46'
      : '#0369A1';

    const badgeBg = isDark
      ? '#FACC15'
      : theme === 'purple'
      ? '#6D28D9'
      : theme === 'green'
      ? '#059669'
      : '#0284C7';

    const badgeText = isDark ? '#0A193C' : '#FFFFFF';

    const centerX = zone.x + zone.width / 2;
    const centerY = zone.y + zone.height / 2;

    // 1. Festive Tag Pill at top of card
    const tagW = 280;
    const tagH = 34;
    ctx.fillStyle = badgeBg;
    roundRect(ctx, centerX - tagW / 2, centerY - 65, tagW, tagH, 17);
    ctx.fill();

    ctx.font = '700 13px "Inter", sans-serif';
    ctx.fillStyle = badgeText;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('✨ SPECIAL FESTIVE ARRIVALS ✨', centerX, centerY - 65 + tagH / 2);

    // 2. High-Contrast Main Headline inside card
    ctx.font = '800 32px "Inter", "Noto Sans Telugu", sans-serif';
    ctx.fillStyle = titleColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('EXCLUSIVE FESTIVE COLLECTIONS', centerX, centerY - 10);

    // 3. High-Contrast Subtitle inside card
    ctx.font = '600 20px "Inter", "Noto Sans Telugu", sans-serif';
    ctx.fillStyle = subColor;
    ctx.fillText('Silk Sarees • Designer Kurtas • Royal Pattu Wear', centerX, centerY + 35);

    // 4. Owner's Store Address & Location inside showcase card
    ctx.font = '700 16px "Inter", "Noto Sans Telugu", sans-serif';
    ctx.fillStyle = isDark ? '#FACC15' : theme === 'purple' ? '#2E1065' : theme === 'green' ? '#022C22' : '#082F49';
    const storeLoc = content.address || 'Beside Metro Pillar 780, KPHB Colony, Hyderabad';
    ctx.fillText(`📍 Store Location: ${storeLoc}`, centerX, centerY + 70);

    ctx.restore();
  }
}

/**
 * Renders text zones with authentic Unicode typography, badge backgrounds, and line wrapping.
 */
function renderTextZone(
  ctx: CanvasRenderingContext2D,
  zone: TemplateZone,
  content: PosterContent,
  template?: TemplateConfig
) {
  // Extract text corresponding to zone ID
  let text = '';
  switch (zone.id) {
    case 'business_name':
      text = content.business_name || 'My Store';
      break;
    case 'headline':
      text = content.headline || 'Festive Mega Offer!';
      break;
    case 'subtitle':
      text = content.subtitle || 'Special discount on all festive wear collections';
      break;
    case 'offer':
      text = content.offer || '30% OFF';
      break;
    case 'cta':
      text = content.cta || 'Visit Store or Order on WhatsApp';
      break;
    case 'contact': {
      const addr = content.address || '';
      const phone = content.contact || '';
      if (addr && phone) {
        const cleanPhone = phone.replace(/^📞\s*/, '');
        text = `📍 ${addr}  •  📞 ${cleanPhone}`;
      } else if (addr) {
        text = `📍 Store Address: ${addr}`;
      } else {
        text = phone || '📍 KPHB Colony, Hyderabad  •  📞 +91 98765 43210';
      }
      break;
    }
    default:
      text = '';
  }

  if (!text) return;

  ctx.save();

  // 1. Badge / Container Backgrounds
  if (zone.badgeStyle === 'pill') {
    if (zone.badgeBg) {
      ctx.fillStyle = zone.badgeBg;
      roundRect(ctx, zone.x, zone.y, zone.width, zone.height, zone.badgeRadius || 20);
      ctx.fill();
    }
    if (zone.badgeBorder) {
      ctx.strokeStyle = zone.badgeBorder;
      ctx.lineWidth = 2.5;
      roundRect(ctx, zone.x, zone.y, zone.width, zone.height, zone.badgeRadius || 20);
      ctx.stroke();
    }
  } else if (zone.badgeStyle === 'rosette') {
    // Generous capsule/ribbon badge so offer text NEVER overflows or clips
    const badgeW = zone.width;
    const badgeH = zone.height;
    const badgeRadius = Math.min(badgeW, badgeH) / 2;

    // Drop shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.40)';
    roundRect(ctx, zone.x + 3, zone.y + 6, badgeW, badgeH, badgeRadius);
    ctx.fill();

    // Rosette capsule fill
    ctx.fillStyle = zone.badgeBg || '#FACC15';
    roundRect(ctx, zone.x, zone.y, badgeW, badgeH, badgeRadius);
    ctx.fill();

    // Rosette double border for premium badge look
    if (zone.badgeBorder) {
      ctx.strokeStyle = zone.badgeBorder;
      ctx.lineWidth = 4;
      roundRect(ctx, zone.x, zone.y, badgeW, badgeH, badgeRadius);
      ctx.stroke();

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.lineWidth = 1.5;
      roundRect(ctx, zone.x + 4, zone.y + 4, badgeW - 8, badgeH - 8, badgeRadius - 4);
      ctx.stroke();
    }
  }

  // 2. Font & Text Styling
  const fontSize = zone.fontSize || 32;
  const fontWeight = zone.fontWeight || 600;
  const fontFamily =
    zone.fontFamily ||
    '"Noto Sans Telugu", "Noto Sans Devanagari", "Inter", system-ui, sans-serif';

  ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
  ctx.fillStyle = zone.color || '#FFFFFF';

  const align = zone.align || 'center';
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';

  // Subtitle / drop shadow for text readability
  ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
  ctx.shadowBlur = 4;
  ctx.shadowOffsetX = 1;
  ctx.shadowOffsetY = 1;

  // 3. Multiline Wrapping & Position Calculation
  const maxLineWidth = zone.width - (zone.badgeStyle ? 40 : 20);
  const lines = wrapText(ctx, text, maxLineWidth);

  const lineHeight = zone.lineHeight || fontSize * 1.25;
  const totalTextHeight = lines.length * lineHeight;
  const startY = zone.y + (zone.height - totalTextHeight) / 2 + lineHeight / 2;

  let startX = zone.x + zone.width / 2;
  if (align === 'left') {
    startX = zone.x + (zone.badgeStyle ? 24 : 10);
  } else if (align === 'right') {
    startX = zone.x + zone.width - (zone.badgeStyle ? 24 : 10);
  }

  // 4. Render Wrapped Text Lines: apply stroke only to large headlines so small Telugu characters don't get choked
  lines.forEach((line, index) => {
    const lineY = startY + index * lineHeight;
    if (zone.strokeColor && (zone.strokeWidth || 0) > 0 && fontSize >= 36) {
      ctx.save();
      ctx.strokeStyle = zone.strokeColor;
      ctx.lineWidth = Math.min(zone.strokeWidth || 3, 3);
      ctx.lineJoin = 'round';
      ctx.miterLimit = 2;
      ctx.strokeText(line, startX, lineY);
      ctx.restore();
    }
    ctx.fillText(line, startX, lineY);
  });

  ctx.restore();
}

/**
 * Exports the rendered canvas to a PNG Blob.
 */
export function exportPosterBlob(canvas: HTMLCanvasElement): Promise<Blob | null> {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), 'image/png', 0.95);
  });
}

/**
 * Exports the rendered canvas to a base64 Data URL.
 */
export function exportPosterDataUrl(canvas: HTMLCanvasElement): string {
  return canvas.toDataURL('image/png', 0.95);
}

/**
 * Generates 4 distinct marketing copy variations for a single template.
 * Enables the user to change messaging without replacing or recreating the template.
 */
export function generateCopyVariations(
  offer: string,
  businessName: string,
  lang: 'te' | 'en' | 'hi' = 'te'
): CopyVariation[] {
  const cleanOffer = offer || '30% OFF';
  const cleanBiz = businessName || 'LocalBiz Store';

  if (lang === 'te') {
    return [
      {
        id: 1,
        label: 'Festive Grand Celebration',
        headline: `${cleanBiz} పండుగ సంబరాలు!`,
        subtitle: 'ప్రత్యేక రాయితీ మరియు సరికొత్త కలెక్షన్ మీకోసం',
        offer: cleanOffer,
        cta: 'ఈరోజే మా దుకాణాన్ని సందర్శించండి',
      },
      {
        id: 2,
        label: 'Limited Time Flash Offer',
        headline: 'పరిమిత సమయం మెగా ఆఫర్!',
        subtitle: 'స్టాక్ ఉన్నంత వరకు మాత్రమే - తొందరపడండి!',
        offer: cleanOffer,
        cta: 'ఇప్పుడే ఆర్డర్ చేయండి / షాపింగ్ చేయండి',
      },
      {
        id: 3,
        label: 'Premium Quality & Value',
        headline: `మీ నమ్మకమైన ${cleanBiz}!`,
        subtitle: 'ఉత్తమ నాణ్యత • అత్యంత సరసమైన ధరలు • నమ్మకమైన సేవ',
        offer: cleanOffer,
        cta: 'రండి... అదిరిపోయే ఆఫర్లను సొంతం చేసుకోండి',
      },
      {
        id: 4,
        label: 'Mega Savings Deal',
        headline: 'అద్భుతమైన బిగ్ సేవింగ్స్ సేల్!',
        subtitle: 'మీ కుటుంబమంతటికీ ఇష్టమైన పండుగ షాపింగ్ ఇక్కడే',
        offer: cleanOffer,
        cta: 'వెంటనే రండి - ఆఫర్ ముగిసేలోగా పొందండి',
      },
    ];
  }

  if (lang === 'hi') {
    return [
      {
        id: 1,
        label: 'Festive Grand Sale',
        headline: `${cleanBiz} त्योहारों की बंपर सेल!`,
        subtitle: 'खास छूट और नया बेहतरीन कलेक्शन सिर्फ आपके लिए',
        offer: cleanOffer,
        cta: 'आज ही हमारी दुकान पर आएं',
      },
      {
        id: 2,
        label: 'Limited Time Deal',
        headline: 'सीमित समय के लिए स्पेशल ऑफर!',
        subtitle: 'जल्दी करें! ऑफर केवल स्टॉक रहने तक मान्य है',
        offer: cleanOffer,
        cta: 'अभी खरीदें और भारी बचत करें',
      },
      {
        id: 3,
        label: 'Quality & Trust',
        headline: `आपकी विश्वसनीय दुकान ${cleanBiz}!`,
        subtitle: 'सर्वोत्तम गुणवत्ता • सबसे किफायती दाम • भरोसेमंद सेवा',
        offer: cleanOffer,
        cta: 'आज ही आएं और ऑफर का लाभ उठाएं',
      },
      {
        id: 4,
        label: 'Super Saver Spectacular',
        headline: 'महा बचत सेल - भारी छूट!',
        subtitle: 'पूरे परिवार के लिए शानदार खरीदारी और अनोखे उपहार',
        offer: cleanOffer,
        cta: 'तुरंत विजिट करें या संपर्क करें',
      },
    ];
  }

  // English default
  return [
    {
      id: 1,
      label: 'Festive Mega Celebration',
      headline: `${cleanBiz} FESTIVE CELEBRATION!`,
      subtitle: 'Exclusive festive offers and latest arrivals just for you',
      offer: cleanOffer,
      cta: 'VISIT OUR STORE TODAY',
    },
    {
      id: 2,
      label: 'Limited Time Flash Deal',
      headline: 'LIMITED TIME MEGA OFFER!',
      subtitle: 'Hurry up! Offer valid while stocks last — don’t miss out',
      offer: cleanOffer,
      cta: 'SHOP NOW & SAVE BIG',
    },
    {
      id: 3,
      label: 'Premium Quality & Value',
      headline: `YOUR FAVORITE STORE: ${cleanBiz}`,
      subtitle: 'Top quality products at unbeatable prices guaranteed',
      offer: cleanOffer,
      cta: 'DISCOVER EXCLUSIVE DEALS',
    },
    {
      id: 4,
      label: 'Super Saver Spectacular',
      headline: 'UNBEATABLE MEGA SAVINGS SALE!',
      subtitle: 'The best festive shopping destination for your family',
      offer: cleanOffer,
      cta: 'CLAIM YOUR OFFER NOW',
    },
  ];
}


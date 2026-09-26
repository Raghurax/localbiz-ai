import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../utils/api';
import { Campaign } from '../types';
import {
  PageHeader,
  Card,
  Badge,
  Button,
  Skeleton,
  useToast
} from '../components/ui';
import {
  Mic,
  MicOff,
  Sparkles,
  Wand2,
  Copy,
  Check,
  Download,
  Image as ImageIcon,
  Film,
  FileText,
  Share2,
  Volume2,
  VolumeX,
  Send,
  Languages,
  ChevronDown
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface AssistantStudioProps {
  onNavigateToPublish: (campId: string) => void;
  onOpenAuth?: () => void;
}

import { DEFAULT_TEMPLATES } from '../utils/defaultTemplates';
import { TemplateConfig, PosterContent, CopyVariation } from '../types/template';
import {
  renderPosterToCanvas,
  exportPosterBlob,
  exportPosterDataUrl,
  generateCopyVariations,
} from '../utils/templateRenderer';
import { TemplateZoneEditor } from '../components/TemplateZoneEditor';
import {
  Sliders,
  Palette,
  Layers,
  Edit3,
  ImagePlus,
  Eye,
  RefreshCw,
} from 'lucide-react';

const TEMPLATE_PREVIEWS = [
  { id: 0, name: 'Ocean Blue Wave', thumb: '/templates/template_1_blue_wave.jpg', tag: '1. Blue Wave' },
  { id: 1, name: 'Cyan Fluid Glow', thumb: '/templates/template_2_cyan_fluid.jpg', tag: '2. Cyan Fluid' },
  { id: 2, name: 'Radial Halftone', thumb: '/templates/template_3_radial_wave.jpg', tag: '3. Radial Wave' },
  { id: 3, name: 'Lime & Emerald', thumb: '/templates/template_4_green_curve.jpg', tag: '4. Green Curve' },
];

export const AssistantStudio: React.FC<AssistantStudioProps> = ({ onNavigateToPublish }) => {
  const { business, isAuthenticated, login, setBusiness } = useAuth();
  const { toast } = useToast();

  // Language Switch State: 'te' for Telugu, 'en' for English, 'hi' for Hindi
  const [uiLang, setUiLang] = useState<'te' | 'en' | 'hi'>('te');

  const [inputMessage, setInputMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [speechError, setSpeechError] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeCampaign, setActiveCampaign] = useState<Campaign | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Audio Playback (Text to Speech) State
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [showTextInput, setShowTextInput] = useState(false);

  // ── AI Template Poster Studio State ──
  const [templates, setTemplates] = useState<TemplateConfig[]>(DEFAULT_TEMPLATES);
  const [activeTemplateIndex, setActiveTemplateIndex] = useState<number>(0);
  const [activeVariationIndex, setActiveVariationIndex] = useState<number>(0);
  const [copyVariations, setCopyVariations] = useState<CopyVariation[]>([]);
  const [posterContent, setPosterContent] = useState<PosterContent>({
    business_name: '',
    headline: '',
    subtitle: '',
    offer: '',
    cta: '',
    contact: '',
    address: '',
    product_image_url: '',
    logo_url: '',
    language: 'te',
  });
  const [isZoneEditorOpen, setIsZoneEditorOpen] = useState(false);
  const [showContentEditor, setShowContentEditor] = useState(true);
  const [isRenderingPoster, setIsRenderingPoster] = useState(false);
  const posterCanvasRef = useRef<HTMLCanvasElement | null>(null);


  // Media state
  const [generatedPosterUrl, setGeneratedPosterUrl] = useState<string | null>(null);
  const [generatedPosters, setGeneratedPosters] = useState<string[]>([]);
  const [generatingPoster, setGeneratingPoster] = useState(false);
  const [videoManifest, setVideoManifest] = useState<any | null>(null);
  const [generatingVideo, setGeneratingVideo] = useState(false);

  // Active preset execution and section highlight state
  const [activePresetIndex, setActivePresetIndex] = useState<number | null>(null);
  const [highlightedCard, setHighlightedCard] = useState<'whatsapp' | 'video' | 'poster' | null>(null);

  const campaignResultsRef = useRef<HTMLDivElement>(null);
  const whatsappCardRef = useRef<HTMLDivElement>(null);
  const videoReelCardRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Low-Literacy Visual Quick Voice Action Buttons with Icons & Trilingual Labels
  const visualVoicePresets = [
    {
      emoji: '🎁',
      labelTe: 'దసరా 30% రాయితీ',
      labelEn: 'Dasara 30% Discount Sale',
      labelHi: 'दशहरा 30% छूट ऑफर',
      subTe: 'దసరా పండుగ ప్రత్యేక డిస్కౌంట్ ఆఫర్',
      subEn: 'Festive Dasara special offer',
      subHi: 'दशहरा त्योहार विशेष डिस्काउंट ऑफर',
      promptTe: 'Dasara sale ki 30 percent discount undi. Telugu lo Instagram and WhatsApp campaign create cheyyi.',
      promptEn: 'Create a festive Dasara marketing campaign in English with flat 30% discount for Instagram and WhatsApp.',
      promptHi: 'दशहरा सेल पर फ्लैट 30% डिस्काउंट है। हिंदी में इंस्टाग्राम और व्हाट्सएप कैंपेन बनाएं।'
    },
    {
      emoji: '👗',
      labelTe: 'నూతన కలెక్షన్ పండుగ ఆఫర్',
      labelEn: 'New Ethnic Silk Sarees Collection',
      labelHi: 'नया साड़ी और कुर्ता कलेक्शन',
      subTe: 'కొత్త సారీస్ & కుర్తాస్ పండుగ సేల్',
      subEn: 'Festive silk sarees & designer kurtas',
      subHi: 'फेस्टिव सिल्क साड़ी और कुर्ता सेल',
      promptTe: 'Kotha festive silk sarees collection ki flat 20% discount offer tho campaign create cheyyi.',
      promptEn: 'Create an engaging Instagram post and WhatsApp message in English for our new festive silk sarees collection with flat 20% discount.',
      promptHi: 'हमारे नए फेस्टिव सिल्क साड़ी और कुर्ता कलेक्शन के लिए 20% डिस्काउंट के साथ हिंदी में इंस्टाग्राम और व्हाट्सएप पोस्ट बनाएं।'
    },
    {
      emoji: '📲',
      labelTe: 'వాట్సాప్ సందేశం పంపండి',
      labelEn: 'WhatsApp Broadcast Blast',
      labelHi: 'व्हाट्सएप मैसेज भेजें',
      subTe: 'కస్టమర్లకు వాట్సాప్ మెసేజ్ ప్రచారం',
      subEn: 'Direct WhatsApp message to customers',
      subHi: 'ग्राहकों को व्हाट्सएप ब्रॉडकास्ट मैसेज',
      promptTe: 'Clothing store ki flat 30% discount undi store location tho WhatsApp broadcast message create cheyyi.',
      promptEn: 'Create a direct WhatsApp broadcast message in English announcing flat 30% discount on clothing with store location.',
      promptHi: 'कपड़ों पर 30% डिस्काउंट के साथ दुकान की लोकेशन वाला व्हाट्सएप मैसेज हिंदी में बनाएं।'
    },
    {
      emoji: '🎬',
      labelTe: 'వీడియో రీల్ స్క్రిప్ట్',
      labelEn: '15s Instagram Video Reel',
      labelHi: '15 सेकंड वीडियो रील स्क्रिप्ट',
      subTe: 'ఇన్స్టాగ్రామ్ కోసం 15 సెకన్ల రీల్',
      subEn: 'Viral 15-second visual reel script',
      subHi: 'इंस्टाग्राम के लिए 15 सेकंड वीडियो रील',
      promptTe: 'Clothing store kosam 15-second viral Instagram Reel script 30% discount offer tho Telugu lo photo and music cues tho create cheyyi.',
      promptEn: 'Create a 15-second viral Instagram Reel script in English with 30% discount offer, visual cues and background music cues for our clothing store.',
      promptHi: 'हमारी कपड़ों की दुकान के लिए 30% डिस्काउंट ऑफर के साथ विजुअल और म्यूजिक के साथ 15 सेकंड की वायरल इंस्टाग्राम रील स्क्रिप्ट हिंदी में बनाएं।'
    }
  ];

  // Speech Recognition Setup
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      const langMap = { te: 'te-IN', en: 'en-IN', hi: 'hi-IN' };
      recognition.lang = langMap[uiLang];

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = 0; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setInputMessage(transcript);
      };

      recognition.onerror = () => {
        setIsRecording(false);
        const errMap = {
          te: 'మాట్లాడటంలో ఇబ్బంది వచ్చింది. దయచేసి మళ్ళీ ట్రై చేయండి.',
          en: 'Microphone error. Please try speaking again.',
          hi: 'बोलने में समस्या आई। कृपया पुनः प्रयास करें।'
        };
        setSpeechError(errMap[uiLang]);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
    }
  }, [uiLang]);

  const toggleRecording = () => {
    setSpeechError('');
    if (!recognitionRef.current) {
      const noSuppMap = {
        te: 'ఈ బ్రౌజర్‌లో వాయిస్ పనిచేయడం లేదు.',
        en: 'Voice recognition is not supported in this browser.',
        hi: 'इस ब्राउज़र में वॉयस सपोर्ट नहीं है।'
      };
      setSpeechError(noSuppMap[uiLang]);
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      try {
        const langMap = { te: 'te-IN', en: 'en-IN', hi: 'hi-IN' };
        recognitionRef.current.lang = langMap[uiLang];
        recognitionRef.current.start();
        setIsRecording(true);
      } catch (err: any) {
        setIsRecording(false);
        setSpeechError('Could not start microphone.');
      }
    }
  };

  const getOrFetchBusiness = async () => {
    if (business) return business;
    try {
      if (!isAuthenticated) {
        await login('demo@localbiz.ai', 'demo123');
      }
      const biz = await apiFetch('/business/current');
      if (biz && setBusiness) {
        setBusiness(biz);
      }
      return biz;
    } catch (e: any) {
      console.warn('Could not auto-fetch business:', e);
      return null;
    }
  };

  const handleSendMessage = async (customPrompt?: string) => {
    const promptToSend = (customPrompt !== undefined ? customPrompt : inputMessage).trim();
    const targetLangMap = { te: 'Telugu', en: 'English', hi: 'Hindi' };
    const targetLang = targetLangMap[uiLang];
    const defaultPromptMap = {
      te: 'Dasara sale ki 30 percent discount undi.',
      en: 'Festive Dasara sale with flat 30% discount offer.',
      hi: 'दशहरा सेल पर 30% डिस्काउंट ऑफर है।'
    };
    const basePrompt = promptToSend || defaultPromptMap[uiLang];
    const finalPrompt = `${basePrompt} Create the entire campaign content strictly in ${targetLang} language.`;

    setSpeechError('');
    setLoading(true);

    try {
      const targetBiz = await getOrFetchBusiness();
      if (!targetBiz) {
        const signInMap = { te: 'దయచేసి సైన్ ఇన్ అవ్వండి.', en: 'Please sign in to proceed.', hi: 'कृपया आगे बढ़ने के लिए साइन इन करें।' };
        setSpeechError(signInMap[uiLang]);
        setLoading(false);
        return;
      }

      const res = await apiFetch('/assistant/chat', {
        method: 'POST',
        body: JSON.stringify({
          business_id: targetBiz.id,
          message: finalPrompt
        })
      });

      if (res.generated_campaign) {
        setActiveCampaign(res.generated_campaign);
        try {
          confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.7 }
          });
        } catch (_) {}

        // Initialize AI Template Poster Studio with Copy Variations & Content
        const bizName = targetBiz.business_name || 'LocalBiz Store';
        const storeAddress = targetBiz.location || 'KPHB Colony, Hyderabad & Benz Circle, Vijayawada';
        const phone = targetBiz.contact_details || '+91 98765 43210';
        const campaignOffer = res.generated_campaign.offer || '30% OFF';

        const freshVars = generateCopyVariations(campaignOffer, bizName, uiLang);
        setCopyVariations(freshVars);
        setActiveVariationIndex(0);

        setPosterContent({
          business_name: bizName,
          headline: freshVars[0].headline,
          subtitle: freshVars[0].subtitle,
          offer: freshVars[0].offer,
          cta: freshVars[0].cta,
          contact: `📞 ${phone}`,
          address: storeAddress,
          product_image_url: '',
          logo_url: '',
          language: uiLang,
        });
        setActiveTemplateIndex(0);

        const readyMap = {
          te: 'మీ ప్రచారం & పోస్టర్ తయారైంది!',
          en: 'Your campaign text and poster are ready!',
          hi: 'आपका कैंपेन और पोस्टर तैयार है!'
        };
        speakSummary(readyMap[uiLang]);

        setTimeout(() => {
          campaignResultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 200);

        return res.generated_campaign;
      } else if (res.needs_clarification && res.reply) {
        setSpeechError(res.reply);
      }
      return null;
    } catch (err: any) {
      const errGenMap = {
        te: 'ప్రచారం తయారు చేయడంలో దోషం వచ్చింది. మళ్ళీ ట్రై చేయండి.',
        en: 'Error generating campaign. Please try again.',
        hi: 'कैंपेन बनाने में त्रुटि आई। कृपया पुनः प्रयास करें।'
      };
      setSpeechError(errGenMap[uiLang]);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Perform specific task when quick action preset buttons below mic are clicked
  const handlePresetClick = async (presetIdx: number) => {
    if (loading || generatingVideo) return;
    setActivePresetIndex(presetIdx);
    const preset = visualVoicePresets[presetIdx];
    const selectedPrompt =
      uiLang === 'te' ? preset.promptTe : uiLang === 'hi' ? preset.promptHi : preset.promptEn;
    setInputMessage(selectedPrompt);

    try {
      if (presetIdx === 2) {
        // Preset 2: WhatsApp Broadcast Blast ("వాట్సాప్ సందేశం పంపండి")
        let camp = activeCampaign;
        if (!camp) {
          camp = await handleSendMessage(selectedPrompt);
        }
        if (camp) {
          const waOutput = camp.outputs.find((o) => o.output_type === 'whatsapp_msg') || camp.outputs[0];
          setHighlightedCard('whatsapp');
          setTimeout(() => {
            whatsappCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }, 300);
          if (waOutput) {
            handleShareWhatsApp(waOutput.content);
          }
          setTimeout(() => setHighlightedCard(null), 3500);
        }
      } else if (presetIdx === 3) {
        // Preset 3: 15s Instagram Video Reel Script ("వీడియో రీల్ స్క్రిప్ట్")
        let camp = activeCampaign;
        if (!camp) {
          camp = await handleSendMessage(selectedPrompt);
        }
        if (camp) {
          setHighlightedCard('video');
          setTimeout(() => {
            videoReelCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }, 300);
          await handleGenerateVideo(camp);
          setTimeout(() => setHighlightedCard(null), 3500);
        }
      } else {
        // Preset 0 ("దసరా 30% రాయితీ") & Preset 1 ("నూతన కలెక్షన్ పండుగ ఆఫర్")
        const camp = await handleSendMessage(selectedPrompt);
        if (camp) {
          setTimeout(() => {
            campaignResultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }, 300);
        }
      }
    } finally {
      setActivePresetIndex(null);
    }
  };

  // Text-To-Speech (TTS) Engine
  const speakSummary = (textToSpeak: string) => {
    if (!('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    const langMap = { te: 'te-IN', en: 'en-US', hi: 'hi-IN' };
    utterance.lang = langMap[uiLang];
    utterance.rate = 0.95;

    utterance.onstart = () => setIsPlayingAudio(true);
    utterance.onend = () => setIsPlayingAudio(false);
    utterance.onerror = () => setIsPlayingAudio(false);

    window.speechSynthesis.speak(utterance);
  };

  const handleStopAudio = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
    }
  };

  const fetchImageBlob = async (url: string): Promise<Blob | null> => {
    try {
      if (url.startsWith('data:')) {
        const res = await fetch(url);
        return await res.blob();
      }
      const cleanUrl = url.split('?')[0];
      const res = await fetch(cleanUrl);
      if (!res.ok) return null;
      return await res.blob();
    } catch (err) {
      console.warn('Could not fetch poster image blob:', err);
      return null;
    }
  };

  // Live Canvas Rendering Effect
  useEffect(() => {
    if (!posterCanvasRef.current) return;
    let isMounted = true;
    setIsRenderingPoster(true);

    const activeTpl = templates[activeTemplateIndex] || templates[0];
    renderPosterToCanvas(posterCanvasRef.current, activeTpl, posterContent)
      .then(() => {
        if (!isMounted || !posterCanvasRef.current) return;
        try {
          const dataUrl = exportPosterDataUrl(posterCanvasRef.current);
          setGeneratedPosterUrl(dataUrl);
          setGeneratedPosters((prev) => {
            if (prev.includes(dataUrl)) return prev;
            return [dataUrl, ...prev.slice(0, 7)];
          });
        } catch (_) {}
      })
      .catch((err) => {
        console.warn('Canvas render error in studio:', err);
      })
      .finally(() => {
        if (isMounted) setIsRenderingPoster(false);
      });

    return () => {
      isMounted = false;
    };
  }, [templates, activeTemplateIndex, posterContent]);

  // Handle Switch Variation
  const handleSelectVariation = (idx: number) => {
    setActiveVariationIndex(idx);
    const v = copyVariations[idx];
    if (v) {
      setPosterContent((prev) => ({
        ...prev,
        headline: v.headline,
        subtitle: v.subtitle,
        offer: v.offer,
        cta: v.cta,
      }));
    }
  };

  // Handle Regenerate Variations
  const handleRegenerateVariations = () => {
    const offerText = activeCampaign?.offer || posterContent.offer || '30% OFF';
    const bizName = posterContent.business_name || business?.business_name || 'LocalBiz Store';
    const fresh = generateCopyVariations(offerText, bizName, uiLang);
    setCopyVariations(fresh);
    const currentVar = fresh[activeVariationIndex] || fresh[0];
    setPosterContent((prev) => ({
      ...prev,
      headline: currentVar.headline,
      subtitle: currentVar.subtitle,
      offer: currentVar.offer,
      cta: currentVar.cta,
    }));
    toast('Fresh copy variations generated for template!', 'success');
  };

  // Handle Download High-Res Poster
  const handleDownloadPoster = async () => {
    if (posterCanvasRef.current) {
      const blob = await exportPosterBlob(posterCanvasRef.current);
      if (blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `marketing_poster_template_${activeTemplateIndex + 1}.png`;
        a.click();
        URL.revokeObjectURL(url);
        toast('Poster downloaded in high resolution!', 'success');
      }
    } else if (generatedPosterUrl) {
      const a = document.createElement('a');
      a.href = generatedPosterUrl;
      a.download = 'marketing_poster.png';
      a.click();
    }
  };


  /**
   * Builds a single composite PNG: poster graphic on top, campaign caption text panel below.
   * Guarantees WhatsApp receives BOTH image and text as ONE shared file.
   */
  const buildCompositeImageBlob = async (posterUrl: string, captionText: string): Promise<Blob | null> => {
    try {
      const imgBlob = await fetchImageBlob(posterUrl);
      if (!imgBlob) return null;

      const imgBitmap = await createImageBitmap(imgBlob);
      const imgW = imgBitmap.width;
      const imgH = imgBitmap.height;

      const fontSize = Math.max(22, Math.round(imgW / 28));
      const lineHeight = fontSize * 1.55;
      const padding = Math.round(imgW * 0.045);
      const maxLineWidth = imgW - padding * 2;

      // Measure and wrap text
      const offCanvas = document.createElement('canvas');
      offCanvas.width = imgW;
      offCanvas.height = 100;
      const offCtx = offCanvas.getContext('2d')!;
      offCtx.font = `${fontSize}px 'Inter', Arial, sans-serif`;

      const rawLines = captionText.split('\n');
      const wrappedLines: string[] = [];
      for (const rawLine of rawLines) {
        if (rawLine.trim() === '') {
          wrappedLines.push('');
          continue;
        }
        const words = rawLine.split(' ');
        let cur = '';
        for (const word of words) {
          const test = cur ? `${cur} ${word}` : word;
          if (offCtx.measureText(test).width > maxLineWidth) {
            if (cur) wrappedLines.push(cur);
            cur = word;
          } else {
            cur = test;
          }
        }
        if (cur) wrappedLines.push(cur);
      }

      const displayLines = wrappedLines.slice(0, 24);
      const textPanelH = padding * 2 + displayLines.length * lineHeight;

      const canvas = document.createElement('canvas');
      canvas.width = imgW;
      canvas.height = imgH + textPanelH;
      const ctx = canvas.getContext('2d')!;

      // Draw poster image at top
      ctx.drawImage(imgBitmap, 0, 0, imgW, imgH);

      // Dark neutral text panel below
      ctx.fillStyle = '#0F1117';
      ctx.fillRect(0, imgH, imgW, textPanelH);

      // Indigo separator line
      ctx.strokeStyle = '#4F46E5';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(padding, imgH + 2);
      ctx.lineTo(imgW - padding, imgH + 2);
      ctx.stroke();

      // Render text lines
      ctx.font = `${fontSize}px 'Inter', Arial, sans-serif`;
      ctx.fillStyle = '#F1F5F9';
      ctx.textBaseline = 'top';
      displayLines.forEach((line, i) => {
        ctx.fillText(line, padding, imgH + padding + i * lineHeight);
      });

      if (wrappedLines.length > 24) {
        ctx.fillStyle = '#94A3B8';
        ctx.fillText('…', padding, imgH + padding + 24 * lineHeight);
      }

      return await new Promise<Blob | null>((resolve) =>
        canvas.toBlob((b) => resolve(b), 'image/png', 0.95)
      );
    } catch (err) {
      console.warn('Composite image build error:', err);
      return null;
    }
  };

  const handleCopy = async (id: string, text: string) => {
    try {
      if (generatedPosterUrl && navigator.clipboard && navigator.clipboard.write) {
        const blob = await fetchImageBlob(generatedPosterUrl);
        if (blob) {
          try {
            await navigator.clipboard.write([
              new ClipboardItem({
                [blob.type || 'image/png']: blob,
                'text/plain': new Blob([text], { type: 'text/plain' })
              })
            ]);
            setCopiedId(id);
            setTimeout(() => setCopiedId(null), 2000);
            toast('Image & caption copied to clipboard', 'success');
            return;
          } catch (_) {}
        }
      }
    } catch (_) {}

    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    toast('Text copied to clipboard', 'success');
  };

  const handleShareWhatsApp = async (text: string) => {
    if (generatedPosterUrl) {
      try {
        const compositeBlob = await buildCompositeImageBlob(generatedPosterUrl, text);
        if (compositeBlob) {
          const file = new File([compositeBlob], 'campaign_with_poster.png', { type: 'image/png' });

          // Mobile / Chromium native share sheet
          if (navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({
              files: [file],
              title: activeCampaign?.name || 'Marketing Campaign',
              text: text
            });
            return;
          }

          // Desktop fallback: copy composite image to clipboard
          if (navigator.clipboard && navigator.clipboard.write) {
            try {
              await navigator.clipboard.write([
                new ClipboardItem({ 'image/png': compositeBlob })
              ]);
              toast('Poster + text copied to clipboard! Paste (Ctrl+V) in WhatsApp.', 'info');
            } catch (clipErr) {
              console.warn('Clipboard write error:', clipErr);
            }
          }
        }
      } catch (e) {
        console.warn('WhatsApp composite share error:', e);
      }
    }

    const encodedText = encodeURIComponent(text);
    window.open(`https://api.whatsapp.com/send?text=${encodedText}`, '_blank');
  };

  const handleWebShare = async (title: string, text: string) => {
    if (generatedPosterUrl && navigator.share) {
      try {
        const compositeBlob = await buildCompositeImageBlob(generatedPosterUrl, text);
        if (compositeBlob) {
          const file = new File([compositeBlob], 'campaign_with_poster.png', { type: 'image/png' });
          if (navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({
              files: [file],
              title,
              text
            });
            return;
          }
        }
      } catch (e) {
        console.log('Composite file share canceled:', e);
      }
    }

    if (navigator.share) {
      try {
        await navigator.share({ title, text });
      } catch (e) {
        console.log('Share canceled:', e);
      }
    } else {
      navigator.clipboard.writeText(text);
      toast('Campaign text copied', 'success');
    }
  };

  const handleGeneratePoster = async (chosenTemplateIndex?: number) => {
    const currentBiz = await getOrFetchBusiness();
    const bizId = currentBiz?.id || activeCampaign?.business_id;
    if (!activeCampaign || !bizId) return;

    const nextIndex = chosenTemplateIndex !== undefined
      ? chosenTemplateIndex
      : (activeTemplateIndex + 1) % 4;
    setActiveTemplateIndex(nextIndex);

    setGeneratingPoster(true);
    try {
      const headlineMap = { te: 'దసరా విశేష ఆఫర్', en: 'DASARA FESTIVE OFFER', hi: 'दशहरा विशेष ऑफर' };
      const ctaMap = { te: 'ఇప్పుడే విజిట్ చేయండి', en: 'VISIT STORE TODAY', hi: 'आज ही दुकान पर आएं' };

      const res = await apiFetch('/media/generate-image', {
        method: 'POST',
        body: JSON.stringify({
          business_id: bizId,
          campaign_id: activeCampaign.id,
          prompt: 'Festive poster for ' + (activeCampaign.offer || '30% discount'),
          aspect_ratio: '1:1',
          platform: 'Instagram',
          headline: headlineMap[uiLang],
          offer_text: activeCampaign.offer || '30% OFF',
          cta_text: ctaMap[uiLang],
          template_index: nextIndex
        })
      });
      const freshUrl = res.file_path + '?t=' + Date.now();
      setGeneratedPosterUrl(freshUrl);
      setGeneratedPosters((prev) => [freshUrl, ...prev]);
      toast(`Template ${nextIndex + 1}: ${TEMPLATE_PREVIEWS[nextIndex].name} generated!`, 'success');
    } catch (err: any) {
      toast('Poster error: ' + err.message, 'error');
    } finally {
      setGeneratingPoster(false);
    }
  };

  const handleGenerateVideo = async (targetCampaign?: Campaign) => {
    const currentBiz = await getOrFetchBusiness();
    const camp = targetCampaign || activeCampaign;
    const bizId = currentBiz?.id || camp?.business_id;
    if (!camp || !bizId) return false;
    setGeneratingVideo(true);
    try {
      const reelScript = camp.outputs.find((o) => o.output_type === 'reel_script')?.content || 'Festive Promo';
      const res = await apiFetch('/media/generate-video', {
        method: 'POST',
        body: JSON.stringify({
          business_id: bizId,
          campaign_id: camp.id,
          script_text: reelScript,
          headline: camp.campaign_type || 'Dasara Sale',
          offer_text: camp.offer || '30% OFF',
          cta_text: 'Visit Store',
          theme: 'festive_vibrant'
        })
      });
      setVideoManifest(res.video_manifest);
      toast('Video reel storyboard generated!', 'success');
      return true;
    } catch (err: any) {
      toast('Reel error: ' + err.message, 'error');
      return false;
    } finally {
      setGeneratingVideo(false);
    }
  };

  return (
    <div className="page-content max-w-4xl mx-auto px-6 py-8 space-y-6">
      {/* ── Top Bar with Language Switcher ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[--color-border]">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">AI Marketing Studio</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Voice or text input in Telugu, Hindi & English
          </p>
        </div>

        {/* 3-Way Language Toggle */}
        <div className="flex items-center gap-1 p-1 rounded-lg border border-[--color-border] bg-[--color-surface] self-start sm:self-auto">
          {(['te', 'en', 'hi'] as const).map((lang) => {
            const labels = { te: 'తెలుగు', en: 'English', hi: 'हिंदी' };
            const isActive = uiLang === lang;
            return (
              <button
                key={lang}
                onClick={() => setUiLang(lang)}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
                  isActive
                    ? 'bg-primary-600 text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                {labels[lang]}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Voice & Speech Input Panel ── */}
      <Card className="p-8 text-center flex flex-col items-center justify-center space-y-5">
        {/* Clean Voice Microphone Button */}
        <div className="relative">
          {/* Subtle pulse ring when recording */}
          {isRecording && (
            <div className="absolute -inset-3 rounded-full bg-primary-500/20 animate-ping pointer-events-none" />
          )}

          <button
            type="button"
            onClick={toggleRecording}
            className={`w-24 h-24 rounded-full flex flex-col items-center justify-center transition-all duration-200 shadow-md ${
              isRecording
                ? 'bg-red-600 text-white scale-105'
                : 'bg-primary-600 hover:bg-primary-700 text-white active:scale-95'
            }`}
            aria-label={isRecording ? 'Stop recording' : 'Start voice input'}
            title={isRecording ? 'Click to stop' : 'Click to speak'}
          >
            {isRecording ? (
              <>
                <div className="flex items-center gap-1 mb-1">
                  <span className="w-1 h-4 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1 h-6 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider">Listening</span>
              </>
            ) : (
              <>
                <Mic className="w-8 h-8 mb-1" />
                <span className="text-[10px] font-semibold tracking-wider uppercase">Tap to Speak</span>
              </>
            )}
          </button>
        </div>

        {/* Voice guidance text */}
        <div className="space-y-1">
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
            {isRecording
              ? uiLang === 'te'
                ? 'మీ ఆఫర్ వివరాలను మాట్లాడండి...'
                : uiLang === 'hi'
                ? 'अपना ऑफर बोलें...'
                : 'Speak your promotional offer...'
              : uiLang === 'te'
              ? 'మైక్ నొక్కి మీ ఆఫర్ మాట్లాడండి'
              : uiLang === 'hi'
              ? 'माइक दबाएं और ऑफर बोलें'
              : 'Tap microphone and speak your offer'}
          </h2>
          <p className="text-xs text-slate-400">
            {uiLang === 'te'
              ? '(ఉదా: "దీపావళి సేల్ 30% డిస్కౌంట్")'
              : uiLang === 'hi'
              ? '(उदा: "दशहरा सेल 30% छूट")'
              : '(E.g. "Diwali sale with flat 30% discount")'}
          </p>
        </div>

        {/* Live Transcript Bubble */}
        {inputMessage && (
          <div className="w-full max-w-lg p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-[--color-border] text-center space-y-3">
            <span className="text-[11px] text-slate-400 block uppercase font-mono tracking-wider">
              {uiLang === 'te' ? 'వాయిస్ ట్రాన్స్‌క్రిప్ట్' : uiLang === 'hi' ? 'वॉयस ट्रांसक्रिप्ट' : 'Live Transcript'}
            </span>
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              "{inputMessage}"
            </p>
            <Button
              variant="primary"
              size="sm"
              loading={loading}
              onClick={() => handleSendMessage()}
              icon={<Sparkles className="w-3.5 h-3.5" />}
            >
              {uiLang === 'te' ? 'ప్రచారం తయారు చేయండి' : uiLang === 'hi' ? 'कैंपेन बनाएं' : 'Generate Campaign'}
            </Button>
          </div>
        )}

        {speechError && (
          <p className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 px-3 py-1.5 rounded-md">
            {speechError}
          </p>
        )}
      </Card>

      {/* ── 1-Tap Quick Action Presets ── */}
      <div className="space-y-3">
        <p className="section-label">
          {uiLang === 'te' ? 'లేదా క్విక్ ఆఫర్స్ ఎంచుకోండి:' : uiLang === 'hi' ? 'या तुरंत ऑफर चुनें:' : 'Or choose a quick preset:'}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {visualVoicePresets.map((preset, idx) => {
            const isThisPresetActive = activePresetIndex === idx && (loading || generatingVideo);
            const isWhatsApp = idx === 2;
            const isReel = idx === 3;
            return (
              <button
                key={idx}
                type="button"
                disabled={loading || generatingVideo}
                onClick={() => handlePresetClick(idx)}
                className={`w-full p-4 rounded-xl border text-left transition-all duration-200 flex items-center gap-3.5 group relative cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed ${
                  isThisPresetActive
                    ? 'border-primary-500 bg-primary-50/70 dark:bg-primary-950/40 ring-2 ring-primary-500/30 shadow-md'
                    : 'bg-[--color-surface] border-[--color-border] hover:border-primary-400 dark:hover:border-primary-500 hover:shadow-md active:scale-[0.98]'
                }`}
              >
                <div className={`w-11 h-11 rounded-lg flex items-center justify-center text-xl shrink-0 transition-transform group-hover:scale-110 ${
                  isThisPresetActive
                    ? 'bg-primary-100 dark:bg-primary-900/50'
                    : 'bg-slate-100 dark:bg-slate-800'
                }`}>
                  {preset.emoji}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-xs text-slate-900 dark:text-slate-100 truncate group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                      {uiLang === 'te' ? preset.labelTe : uiLang === 'hi' ? preset.labelHi : preset.labelEn}
                    </h3>
                    {isWhatsApp && activeCampaign && (
                      <span className="text-[10px] px-1.5 py-0.5 bg-green-100 dark:bg-green-950/60 text-green-700 dark:text-green-400 rounded-full font-medium shrink-0">
                        {uiLang === 'te' ? '1-క్లిక్ సెండ్' : uiLang === 'hi' ? '1-क्लिक भेजें' : '1-Click Send'}
                      </span>
                    )}
                    {isReel && activeCampaign && (
                      <span className="text-[10px] px-1.5 py-0.5 bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-400 rounded-full font-medium shrink-0">
                        {uiLang === 'te' ? 'రీల్ చేయండి' : uiLang === 'hi' ? 'रील बनाएं' : 'Make Reel'}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 truncate mt-0.5">
                    {uiLang === 'te' ? preset.subTe : uiLang === 'hi' ? preset.subHi : preset.subEn}
                  </p>
                </div>
                {isThisPresetActive ? (
                  <div className="w-4 h-4 rounded-full border-2 border-primary-600 border-t-transparent animate-spin shrink-0" />
                ) : (
                  <Wand2 className="w-4 h-4 text-slate-400 group-hover:text-primary-500 group-hover:rotate-12 transition-all shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Keyboard Input Toggle ── */}
      <div className="text-center pt-1">
        <button
          onClick={() => setShowTextInput(!showTextInput)}
          className="text-xs text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 inline-flex items-center gap-1 transition-colors"
        >
          <span>
            {showTextInput
              ? 'Hide keyboard typing box'
              : 'Prefer typing with keyboard?'}
          </span>
          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showTextInput ? 'rotate-180' : ''}`} />
        </button>

        {showTextInput && (
          <Card className="mt-3 p-4 text-left space-y-3">
            <textarea
              rows={2}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder={
                uiLang === 'te'
                  ? 'మీ ఆఫర్ రాయండి... (ఉదా: 30% డిస్కౌంట్ సేల్)'
                  : uiLang === 'hi'
                  ? 'ऑफर टाइप करें... (उदा: 30% छूट सेल)'
                  : 'Type your offer... (e.g. 30% discount sale)'
              }
              className="form-input text-xs resize-none"
            />
            <div className="flex justify-end">
              <Button
                variant="primary"
                size="sm"
                loading={loading}
                onClick={() => handleSendMessage()}
                icon={<Send className="w-3.5 h-3.5" />}
              >
                Submit
              </Button>
            </div>
          </Card>
        )}
      </div>

      {/* ── Loading Skeleton State ── */}
      {loading && (
        <Card className="p-8 text-center space-y-3">
          <div className="w-8 h-8 rounded-full border-2 border-primary-600 border-t-transparent animate-spin mx-auto" />
          <p className="font-semibold text-sm text-slate-800 dark:text-slate-200">
            {uiLang === 'te' ? 'మీ ప్రచారం సిద్ధమవుతోంది...' : uiLang === 'hi' ? 'कैंपेन तैयार हो रहा है...' : 'Crafting your campaign...'}
          </p>
          <p className="text-xs text-slate-400">
            {uiLang === 'te'
              ? 'ఇన్‌స్టాగ్రామ్, వాట్సాప్ సందేశం & మార్కెటింగ్ పోస్టర్ రాస్తున్నాము.'
              : uiLang === 'hi'
              ? 'इंस्टाग्राम कैप्शन, व्हाट्सएप मैसेज और पोस्टर तैयार हो रहा है।'
              : 'Generating localized copy and rendering promotional visual.'}
          </p>
        </Card>
      )}

      {/* ── Generated Campaign Results ── */}
      {activeCampaign && (
        <div ref={campaignResultsRef} className="space-y-6 pt-4">
          {/* Header Bar */}
          <Card className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <Badge variant="success">✓ Campaign Ready</Badge>
                <Badge variant="primary">{activeCampaign.language}</Badge>
              </div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                {activeCampaign.name}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Offer: <strong className="text-primary-600 dark:text-primary-400">{activeCampaign.offer}</strong>
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  if (isPlayingAudio) {
                    handleStopAudio();
                  } else {
                    const textToRead = activeCampaign.outputs.map((o) => o.content).join('. ');
                    speakSummary(textToRead);
                  }
                }}
                icon={isPlayingAudio ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              >
                {isPlayingAudio ? 'Stop' : 'Read Aloud'}
              </Button>

              <Button
                variant="primary"
                size="sm"
                onClick={() => onNavigateToPublish(activeCampaign.id)}
                icon={<Share2 className="w-3.5 h-3.5" />}
              >
                Publish
              </Button>
            </div>
          </Card>

          {/* Cards for Instagram, WhatsApp, Reel with ATTACHED Poster Image */}
          <div className="space-y-5">
            {activeCampaign.outputs.map((out) => {
              const isWhatsAppCard = out.output_type === 'whatsapp_msg';
              const isHighlighted = isWhatsAppCard && highlightedCard === 'whatsapp';
              return (
                <div
                  key={out.id}
                  ref={isWhatsAppCard ? whatsappCardRef : undefined}
                  className="scroll-mt-8"
                >
                  <Card className={`p-6 space-y-4 transition-all duration-300 ${
                    isHighlighted
                      ? 'ring-2 ring-green-500 bg-green-50/30 dark:bg-green-950/30 shadow-lg'
                      : ''
                  }`}>
                <div className="flex items-center justify-between pb-3 border-b border-[--color-border]">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-primary-600" />
                    <span className="font-semibold text-xs text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                      {out.title || out.output_type.replace('_', ' ')}
                    </span>
                  </div>
                  <Badge variant="neutral">{out.language}</Badge>
                </div>

                {/* Side-by-Side Poster Image + Caption Text */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
                  {generatedPosterUrl && (
                    <div className="md:col-span-4 rounded-xl overflow-hidden border border-[--color-border] aspect-square relative group bg-slate-100 dark:bg-slate-800">
                      <img
                        src={generatedPosterUrl}
                        alt="Campaign Poster"
                        className="w-full h-full object-cover"
                      />
                      <a
                        href={generatedPosterUrl}
                        download="marketing_poster.png"
                        className="absolute bottom-2 right-2 p-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-900 text-white text-xs font-medium transition backdrop-blur-xs flex items-center gap-1 shadow-sm"
                        title="Download poster image"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download</span>
                      </a>
                    </div>
                  )}

                  <div className={generatedPosterUrl ? 'md:col-span-8' : 'md:col-span-12'}>
                    <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-sans leading-relaxed whitespace-pre-wrap">
                      {out.content}
                    </p>
                  </div>
                </div>

                {/* Sharing actions */}
                <div className="pt-3 border-t border-[--color-border] flex flex-wrap items-center justify-between gap-3">
                  <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                    ✓ Offer accurately preserved
                  </span>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="primary"
                      size="sm"
                      className="bg-green-600 hover:bg-green-700 focus-visible:ring-green-600"
                      onClick={() => handleShareWhatsApp(out.content)}
                      icon={<Share2 className="w-3.5 h-3.5" />}
                    >
                      <span>Share on WhatsApp</span>
                    </Button>

                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleWebShare(out.title || 'Campaign', out.content)}
                      icon={<Share2 className="w-3.5 h-3.5" />}
                    >
                      <span>Share</span>
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopy(out.id, out.content)}
                    >
                      {copiedId === out.id ? (
                        <Check className="w-3.5 h-3.5 text-green-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                      <span>{copiedId === out.id ? 'Copied' : 'Copy'}</span>
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          );
        })}
          </div>

          {/* ═══════════════════════════════════════════════════════════ */}
          {/* 🎨 AI TEMPLATE POSTER STUDIO (True Template Architecture)   */}
          {/* ═══════════════════════════════════════════════════════════ */}
          <Card className="p-6 space-y-6 border border-slate-200 dark:border-slate-800 shadow-md">
            {/* Studio Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="primary">True Template Engine</Badge>
                  <Badge variant="success">Original Background Preserved</Badge>
                  <Badge variant="neutral">Template {activeTemplateIndex + 1} of 4</Badge>
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Palette className="w-5 h-5 text-primary-600" />
                  AI Template Poster Studio
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Original template image serves as the permanent base design. Copy and assets are overlaid into precise layout zones.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsZoneEditorOpen(true)}
                  icon={<Sliders className="w-3.5 h-3.5" />}
                  title="Open visual zone editor to fine-tune layout coordinates"
                >
                  Zone Editor (Admin/Dev)
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleDownloadPoster}
                  icon={<Download className="w-3.5 h-3.5" />}
                >
                  Download PNG
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  className="bg-green-600 hover:bg-green-700 text-white"
                  onClick={() =>
                    handleShareWhatsApp(
                      `${posterContent.headline}\n${posterContent.offer}\n${posterContent.cta}\n${posterContent.contact}`
                    )
                  }
                  icon={<Share2 className="w-3.5 h-3.5" />}
                >
                  Share on WhatsApp
                </Button>
              </div>
            </div>

            {/* Studio Two-Column Work Area */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Live Canvas & Template Switcher */}
              <div className="lg:col-span-6 space-y-4">
                <div className="relative aspect-square w-full max-w-[480px] mx-auto rounded-2xl overflow-hidden shadow-xl border border-slate-200 dark:border-slate-700 bg-slate-950 flex items-center justify-center">
                  <canvas
                    ref={posterCanvasRef}
                    className="w-full h-full object-contain block"
                  />
                  {isRenderingPoster && (
                    <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center">
                      <div className="w-7 h-7 rounded-full border-2 border-primary-500 border-t-transparent animate-spin" />
                    </div>
                  )}
                </div>

                {/* 1-Click Template Switcher */}
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-primary-500" />
                      1-Click Template Switcher:
                    </span>
                    <button
                      onClick={() => setActiveTemplateIndex((prev) => (prev + 1) % 4)}
                      className="text-xs text-primary-600 dark:text-primary-400 font-semibold hover:underline"
                    >
                      Cycle Next &rarr;
                    </button>
                  </div>

                  <div className="grid grid-cols-4 gap-2.5">
                    {TEMPLATE_PREVIEWS.map((tpl) => (
                      <button
                        key={tpl.id}
                        onClick={() => setActiveTemplateIndex(tpl.id)}
                        className={`group relative flex flex-col items-center p-1.5 rounded-xl border text-center transition-all ${
                          activeTemplateIndex === tpl.id
                            ? 'border-primary-500 ring-2 ring-primary-500/30 bg-primary-50 dark:bg-primary-950/40 shadow-sm'
                            : 'border-slate-200 dark:border-slate-800 hover:border-primary-400 bg-white dark:bg-slate-900/60'
                        }`}
                        title={tpl.name}
                      >
                        <div className="w-full aspect-[3/4] rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 mb-1 border border-slate-200 dark:border-slate-700 group-hover:scale-102 transition-transform">
                          <img src={tpl.thumb} alt={tpl.name} className="w-full h-full object-cover" />
                        </div>
                        <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 truncate w-full">
                          {tpl.tag}
                        </span>
                        {activeTemplateIndex === tpl.id && (
                          <span className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-primary-600 ring-2 ring-white" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Copy Variations & In-Place Content Editor */}
              <div className="lg:col-span-6 space-y-5">
                {/* 1. Copy Variations Bar (Variation 1 to 4 on same template) */}
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider block">
                        Copy Variations (Same Template)
                      </span>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Switch marketing copy angles without changing the background design
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleRegenerateVariations}
                      icon={<RefreshCw className="w-3 h-3" />}
                      title="Generate new copy variations"
                    >
                      New Copy
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {copyVariations.map((v, idx) => (
                      <button
                        key={v.id}
                        onClick={() => handleSelectVariation(idx)}
                        className={`p-2 rounded-lg text-left border transition-all ${
                          activeVariationIndex === idx
                            ? 'border-primary-500 bg-primary-100/70 dark:bg-primary-950/70 text-primary-900 dark:text-primary-100 font-semibold shadow-2xs'
                            : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between text-[10px] font-bold uppercase mb-0.5">
                          <span>Var {v.id}</span>
                          {activeVariationIndex === idx && <Check className="w-3 h-3 text-primary-600" />}
                        </div>
                        <span className="text-[11px] block truncate font-medium">
                          {v.label.split(' ')[0]} {v.label.split(' ')[1] || ''}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. In-Place Live Content Editor */}
                <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 shadow-xs">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                      <Edit3 className="w-3.5 h-3.5 text-primary-500" />
                      In-Place Live Content Editor
                    </span>
                    <Badge variant="success">Instant Canvas Sync</Badge>
                  </div>

                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div>
                        <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                          Business Name (Store)
                        </label>
                        <input
                          type="text"
                          value={posterContent.business_name}
                          onChange={(e) =>
                            setPosterContent((prev) => ({ ...prev, business_name: e.target.value }))
                          }
                          placeholder="Store Name"
                          className="form-input text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                          Offer Tag / Rosette
                        </label>
                        <input
                          type="text"
                          value={posterContent.offer}
                          onChange={(e) =>
                            setPosterContent((prev) => ({ ...prev, offer: e.target.value }))
                          }
                          placeholder="e.g. FLAT 30% OFF"
                          className="form-input text-xs font-bold text-primary-600"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                        Main Headline
                      </label>
                      <input
                        type="text"
                        value={posterContent.headline}
                        onChange={(e) =>
                          setPosterContent((prev) => ({ ...prev, headline: e.target.value }))
                        }
                        placeholder="Eye-catching headline in Telugu / English"
                        className="form-input text-xs font-semibold"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                        Subtitle / Offer Details
                      </label>
                      <input
                        type="text"
                        value={posterContent.subtitle}
                        onChange={(e) =>
                          setPosterContent((prev) => ({ ...prev, subtitle: e.target.value }))
                        }
                        placeholder="Offer details and customer benefits"
                        className="form-input text-xs"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div>
                        <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                          Call To Action (CTA Pill)
                        </label>
                        <input
                          type="text"
                          value={posterContent.cta}
                          onChange={(e) =>
                            setPosterContent((prev) => ({ ...prev, cta: e.target.value }))
                          }
                          placeholder="e.g. VISIT STORE TODAY"
                          className="form-input text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                          Contact Phone / WhatsApp
                        </label>
                        <input
                          type="text"
                          value={posterContent.contact}
                          onChange={(e) =>
                            setPosterContent((prev) => ({ ...prev, contact: e.target.value }))
                          }
                          placeholder="+91 98765 43210"
                          className="form-input text-xs"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1 flex items-center justify-between">
                        <span>📍 Store Address (Owner's Location)</span>
                        <span className="text-[10px] text-primary-600 dark:text-primary-400 font-normal">Shown in Showcase & Footer Banner</span>
                      </label>
                      <input
                        type="text"
                        value={posterContent.address || ''}
                        onChange={(e) =>
                          setPosterContent((prev) => ({ ...prev, address: e.target.value }))
                        }
                        placeholder="e.g. Shop No. 12, Main Road, Beside Clock Tower, KPHB Colony, Hyderabad"
                        className="form-input text-xs font-medium"
                      />
                    </div>

                    {/* Product Image & Logo Asset Inputs */}
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1">
                          <ImagePlus className="w-3.5 h-3.5 text-primary-500" />
                          Product Image & Brand Logo
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            if (posterContent.product_image_url) {
                              setPosterContent((prev) => ({ ...prev, product_image_url: '' }));
                            } else {
                              setPosterContent((prev) => ({
                                ...prev,
                                product_image_url:
                                  'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&auto=format&fit=crop&q=80',
                              }));
                            }
                          }}
                          className="text-[11px] text-primary-600 dark:text-primary-400 font-semibold hover:underline"
                        >
                          {posterContent.product_image_url ? 'Clear Photo' : '+ Use Sample Photo'}
                        </button>
                      </div>

                      <input
                        type="text"
                        value={posterContent.product_image_url || ''}
                        onChange={(e) =>
                          setPosterContent((prev) => ({ ...prev, product_image_url: e.target.value }))
                        }
                        placeholder="Product photo URL (optional - e.g. saree or garment photo)"
                        className="form-input text-xs font-mono"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* 15s Video Reel Storyboard Card */}
          <div ref={videoReelCardRef} className="scroll-mt-8">
            <Card className={`p-5 space-y-4 transition-all duration-300 ${
              highlightedCard === 'video'
                ? 'ring-2 ring-purple-500 bg-purple-50/30 dark:bg-purple-950/30 shadow-lg'
                : ''
            }`}>
              <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-semibold text-xs">
                <Film className="w-4 h-4 text-primary-600" />
                <span>15s Video Reel Storyboard</span>
              </div>

              {videoManifest ? (
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40 text-xs border border-[--color-border] space-y-1.5">
                  <p className="font-semibold text-slate-700 dark:text-slate-300">
                    Format: {videoManifest.format} · {videoManifest.total_duration_seconds}s
                  </p>
                  <p className="text-slate-500 dark:text-slate-400 line-clamp-2">
                    Voiceover: {videoManifest.voiceover}
                  </p>
                </div>
              ) : (
                <p className="text-xs text-slate-400">
                  Generate timed audio/visual cue storyboard for Instagram Reels.
                </p>
              )}

              <Button
                variant="secondary"
                size="sm"
                loading={generatingVideo}
                onClick={() => handleGenerateVideo()}
                className="w-full"
                icon={<Wand2 className="w-3.5 h-3.5" />}
              >
                {generatingVideo ? 'Building...' : 'Generate Reel Script'}
              </Button>
            </Card>
          </div>
        </div>
      )}

      {/* ── Interactive Template Zone Editor Modal ── */}
      <TemplateZoneEditor
        isOpen={isZoneEditorOpen}
        onClose={() => setIsZoneEditorOpen(false)}
        templates={templates}
        currentTemplateIndex={activeTemplateIndex}
        onSelectTemplate={(idx) => setActiveTemplateIndex(idx)}
        onUpdateTemplateConfig={(updated) => {
          setTemplates((prev) =>
            prev.map((t, i) => (i === activeTemplateIndex ? updated : t))
          );
          toast('Template layout zones updated live!', 'success');
        }}
        onResetTemplates={() => {
          setTemplates(DEFAULT_TEMPLATES);
          toast('Templates reset to default layout!', 'info');
        }}
      />
    </div>
  );
};

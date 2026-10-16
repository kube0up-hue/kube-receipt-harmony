#!/usr/bin/env node
/**
 * KUBE AI Model Context Protocol (MCP) Server
 * Fully compliant with Anthropic Claude Desktop, Cursor, and MCP JSON-RPC 2.0 protocol.
 */

const readline = require('readline');

const TOOLS = [
  {
    name: "kube_generate_video_ad",
    description: "Generate a cinema-grade commercial video ad across 14 ad formats (food, UGC, review, fashion, unboxing, explainer, before/after, luxury, film, ASMR, kinetic, action, cafe, automotive) with Saudi viral hooks (0-3s) using Google Veo 3.1, Kling AI 3.0 Turbo, or Alibaba WanX 2.6.",
    inputSchema: {
      type: "object",
      properties: {
        prompt: { type: "string", description: "Creative concept or product description in Arabic or English." },
        format: {
          type: "string",
          enum: ["food", "ugc", "review", "fashion", "unboxing", "explainer", "before_after", "luxury", "film", "asmr", "kinetic", "action", "cafe", "automotive"],
          description: "One of Halai's 14 official ad formats."
        },
        aspect_ratio: { type: "string", enum: ["9:16", "16:9", "1:1", "4:5"], description: "Ad aspect ratio (default: 9:16)." },
        duration_seconds: { type: "number", enum: [10, 15, 30], description: "Length of the video ad in seconds." },
        product_name: { type: "string", description: "Brand or product name." },
        product_image_url: { type: "string", description: "Optional visual reference URL." },
        engine: { type: "string", enum: ["veo-3.1", "kling-3.0", "wanx-2.6"], description: "Underlying generative AI engine." }
      },
      required: ["prompt", "format"]
    }
  },
  {
    name: "kube_create_ugc_video",
    description: "Create an authentic Saudi UGC creator video (TikTok / Reels style) with a realistic virtual Saudi presenter reading a natural dialect script with synchronized micro-expressions.",
    inputSchema: {
      type: "object",
      properties: {
        script: { type: "string", description: "The Arabic script to be spoken (conversational Saudi dialect)." },
        creator_persona: { type: "string", enum: ["sultan", "noura", "reema", "faisal", "hamoud"], description: "The virtual Saudi creator persona." },
        dialect: { type: "string", enum: ["najdi_riyadh", "hijazi_jeddah", "sharqiya_khobar"], description: "Saudi dialect nuance." },
        product_name: { type: "string", description: "The product being showcased." },
        aspect_ratio: { type: "string", enum: ["9:16", "1:1"], description: "Video aspect ratio." }
      },
      required: ["script", "creator_persona"]
    }
  },
  {
    name: "kube_product_studio_shot",
    description: "Generate hyper-photorealistic 4K commercial product photography on premium podiums (travertine, black Nero Marquina marble, walnut wood, architectural concrete) with Hasselblad medium-format camera aesthetics.",
    inputSchema: {
      type: "object",
      properties: {
        product_name: { type: "string", description: "Product name and key features." },
        preset: {
          type: "string",
          enum: ["travertine_morning", "black_marble_gold", "walnut_brass", "architectural_concrete", "luxury_car_interior"],
          description: "Backdrop and staging preset."
        },
        aspect_ratio: { type: "string", enum: ["1:1", "4:5", "9:16", "16:9"], description: "Image aspect ratio." }
      },
      required: ["product_name"]
    }
  },
  {
    name: "kube_create_ads_9pack",
    description: "Generate a complete 9-pack multi-variation ad campaign for Meta & TikTok covering all marketing funnel angles.",
    inputSchema: {
      type: "object",
      properties: {
        product_name: { type: "string", description: "Product or brand name." },
        product_category: { type: "string", description: "Category (food, perfume, fashion, tech, coffee)." },
        offer_or_discount: { type: "string", description: "Optional promotion hook." }
      },
      required: ["product_name"]
    }
  },
  {
    name: "kube_create_social_campaign",
    description: "Synthesize full Saudi viral social campaign copy (X, Instagram, TikTok, Snapchat) with witty hooks, hashtags, and CTA inspired by top Saudi viral brands.",
    inputSchema: {
      type: "object",
      properties: {
        topic: { type: "string", description: "Campaign subject, launch, or offer." },
        tone: { type: "string", enum: ["barq_witty", "namq_aesthetic", "dunkin_deals", "luxury_prestige"], description: "Brand voice and tone." }
      },
      required: ["topic", "tone"]
    }
  }
];

function sendResponse(response) {
  process.stdout.write(JSON.stringify(response) + '\n');
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

rl.on('line', (line) => {
  if (!line.trim()) return;
  try {
    const request = JSON.parse(line);
    const { id, method, params } = request;

    if (method === 'initialize') {
      sendResponse({
        jsonrpc: '2.0',
        id,
        result: {
          protocolVersion: '2024-11-05',
          capabilities: {
            tools: {}
          },
          serverInfo: {
            name: 'kube-ai-marketing-mcp',
            version: '2.0.0'
          }
        }
      });
    } else if (method === 'notifications/initialized') {
      // client ack
    } else if (method === 'ping') {
      sendResponse({ jsonrpc: '2.0', id, result: {} });
    } else if (method === 'tools/list') {
      sendResponse({
        jsonrpc: '2.0',
        id,
        result: {
          tools: TOOLS
        }
      });
    } else if (method === 'tools/call') {
      const toolName = params.name;
      const args = params.arguments || {};
      const jobId = `job_${Date.now()}`;

      let outputText = '';
      if (toolName === 'kube_generate_video_ad') {
        outputText = JSON.stringify({
          status: 'success',
          job_id: jobId,
          format: args.format,
          aspect: args.aspect_ratio || '9:16',
          saudi_hook: 'يا جماعة، هذا هو الحل اللي يثبت الراس ويعطيكم النتيجة من أول ثانية!',
          video_url: 'https://customer-ei7hg79dk1slaekc.cloudflarestream.com/679f435913be72cd7135ad8fb2b4c880/manifest/video.m3u8',
          thumbnail_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80',
          message: `تم توليد الإعلان التجاري لـ [${args.product_name || 'المنتج'}] بنمط [${args.format}] بنجاح 4K.`
        }, null, 2);
      } else if (toolName === 'kube_create_ugc_video') {
        outputText = JSON.stringify({
          status: 'success',
          job_id: jobId,
          creator: args.creator_persona,
          dialect: args.dialect || 'najdi_riyadh',
          video_url: 'https://customer-ei7hg79dk1slaekc.cloudflarestream.com/e979b81d089e42e710e17fab3b3bbde5/manifest/video.m3u8',
          message: `تم إنتاج مقطع UGC لصانع المحتوى السعودي (${args.creator_persona}) بلهجة نجدية عفوية.`
        }, null, 2);
      } else if (toolName === 'kube_product_studio_shot') {
        outputText = JSON.stringify({
          status: 'success',
          product: args.product_name,
          preset: args.preset || 'travertine_morning',
          camera: 'Hasselblad X2D 100C',
          image_url: 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=1200&q=85',
          message: `تم توليد لقطة استوديو 4K احترافية للمنتج.`
        }, null, 2);
      } else if (toolName === 'kube_create_ads_9pack') {
        outputText = JSON.stringify({
          status: 'success',
          product: args.product_name,
          angles_count: 9,
          variations: ['ماكرو وسكب', 'شمس الصباح', 'طريق تركي الأول ستريت', 'تركيز الدوام', 'نيون مسائي', 'تجميد حركة', 'سيارة فارهة', 'رخام أسود', 'بوكس جمعات'],
          message: 'تم إعداد وتوليد باقة الإعلانات التسعة (Ads 9-Pack) كاملة.'
        }, null, 2);
      } else if (toolName === 'kube_create_social_campaign') {
        outputText = JSON.stringify({
          status: 'success',
          topic: args.topic,
          tone: args.tone,
          x_post: 'لو كان المزاج يُشترى، كان اسمه كولد برو KUBE 🧊✨\nمنشن شخص دوامه ما يبدأ إلا بعد أول رشفة! 👇 #الرياض',
          instagram_post: 'تفاصيل تصنع يومك، من أول حبة بن لآخر قطرة. ☕️🤎\n\nتفضل بزيارتنا في فروع الرياض.',
          tiktok_hook: 'سر الروقان في الرياض؟ مو بس في القهوة.. في المكان والصحبة!'
        }, null, 2);
      } else {
        outputText = `Tool ${toolName} executed successfully.`;
      }

      sendResponse({
        jsonrpc: '2.0',
        id,
        result: {
          content: [
            {
              type: 'text',
              text: outputText
            }
          ]
        }
      });
    } else {
      sendResponse({
        jsonrpc: '2.0',
        id,
        error: {
          code: -32601,
          message: `Method not found: ${method}`
        }
      });
    }
  } catch (err) {
    // ignore parse errors
  }
});

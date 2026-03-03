import { Request, Response } from 'express';
import { RentalPlan } from '../models/RentalPlan.model';

// Chatbot controller: tries Gemini first; falls back to internal rule-based replies.

type ChatBody = {
  message?: string;
  lang?: 'en' | 'ar';
};

const buildRuleBasedReply = async (text: string, lang: 'en' | 'ar'): Promise<string> => {
  const t = text.toLowerCase();
  const plans = await RentalPlan.find({ isActive: true }).sort({ price: 1 }).lean();

  const hasPlanIntent =
    t.includes('price') ||
    t.includes('plan') ||
    t.includes('subscription') ||
    t.includes('starter') ||
    t.includes('pro') ||
    t.includes('enterprise');

  if (lang === 'ar') {
    if (hasPlanIntent) {
      return (
        'في Restro OS يوجد خطط Starter و Pro و Enterprise. Starter مناسب للمطاعم الصغيرة التي تريد فقط إدارة المنيو والطلبات بدون ورق، ' +
        'Pro يضيف الحجوزات والفواتير والمدفوعات أونلاين في نظام واحد، و Enterprise مناسب للسلاسل الكبيرة بعدد فروع وموظفين غير محدود. ' +
        'كل ما زادت الأتمتة قلّ العمل اليدوي وزاد وقتك للتركيز على الضيوف.'
      );
    }
    if (t.includes('trial') || t.includes('free')) {
      return (
        'تستطيع البدء بتجربة مجانية بدون أي التزام. خلال التجربة يمكنك استخدام النظام بالكامل (طلبات، حجز طاولات، فواتير، تحليلات). ' +
        'عندما تلاحظ أن النظام يوفر وقت موظف واحد يومياً تقريباً، يكون الاشتراك مغطى من التوفير فقط.'
      );
    }
    if (t.includes('feature') || t.includes('function')) {
      return (
        'Restro OS يعمل كـ “نظام تشغيل للمطعم”: إدارة المنيو، الطلبات أونلاين والحضور، حجز الطاولات، الفوترة، التحليلات، والتحكم في صلاحيات الموظفين. ' +
        'بدلاً من استخدام عدة أنظمة منفصلة، تحصل على لوحة تحكم واحدة أسهل لك ولفريقك.'
      );
    }
    return (
      'مرحباً، أنا مساعد Restro OS. أستطيع مساعدتك في اختيار الخطة المناسبة وشرح المزايا الأساسية. ' +
      'لو كتبت لي حجم مطعمك (عدد الطاولات أو الفروع) أستطيع أن أقترح عليك هل Starter يكفي أم تحتاج Pro أو Enterprise.'
    );
  }

  // English / Hinglish path
  if (hasPlanIntent) {
    if (!plans.length) {
      return (
        'Right now I cannot load live plans, but normally we have Starter, Pro and Enterprise. ' +
        'Starter is for small restaurants, Pro for online booking + billing, and Enterprise for larger chains with unlimited branches.'
      );
    }
    const lines: string[] = [];
    lines.push(
      'Restro OS subscriptions help your restaurant grow in clear steps: Starter → Pro → Enterprise.'
    );

    for (const p of plans) {
      const bullets: string[] = [];
      const f = p.features;
      if (f.onlineOrdering) bullets.push('online + walk‑in orders');
      if (f.tableBooking) bullets.push('table booking automation');
      if (f.billing) bullets.push('billing & GST‑ready invoices');
      if (f.analytics) bullets.push('full analytics dashboard');
      if (f.staffControl) bullets.push('staff & role control');

      const core = bullets.length ? bullets.join(', ') : 'core restaurant workflow';

      lines.push(
        `• ${p.name}: about ₹${p.price}/month — focuses on ${core}. This plan is perfect if you want ` +
          (p.name.toLowerCase().includes('starter')
            ? 'a clean digital start instead of paper registers for menu + orders.'
            : p.name.toLowerCase().includes('pro')
            ? 'online payments, table booking and billing in one system so you never lose an order.'
            : 'to manage multiple outlets with unlimited items & staff from one dashboard.')
      );
    }

    lines.push(
      'The more automation you unlock (booking, billing, analytics, staff), the less manual work your team does, fewer mistakes, and more time free for the owner.'
    );
    lines.push(
      'Tell me roughly how many tables / outlets you have and I can point to the best plan for you.'
    );

    return lines.join(' ');
  }

  if (t.includes('trial') || t.includes('free')) {
    return (
      'The best part is you can start with a free trial. You get a full restaurant account where you can try menu, orders, booking, billing and analytics with your own data. ' +
      'As soon as you see that even one staff member saves time daily, the subscription usually pays for itself.'
    );
  }
  if (t.includes('feature') || t.includes('kya kya') || t.includes('function')) {
    return (
      'Restro OS is a full “Restaurant Operating System”: menu management, online & walk‑in orders, table booking, billing, revenue analytics, staff & roles, hero images, offers and multi‑branch control. ' +
      'Instead of using many separate tools, you get everything in a single login — smoother operations and faster staff training.'
    );
  }
  if (t.includes('contact') || t.includes('support') || t.includes('help')) {
    return (
      'If you want a detailed comparison or ROI calculation, you can send us a short message from the Contact page or use the WhatsApp button. ' +
      'Our team can look at your restaurant size and suggest an exact plan and expected benefit.'
    );
  }

  return (
    'Thanks for your message. I am the Restro OS assistant — I can guide you on plans, features, trial and basic implementation. ' +
    'If you tell me whether you are a small single‑branch restaurant or a multi‑branch brand, I can explain which subscription will give you the most benefit.'
  );
};

export const chatWithBot = async (req: Request, res: Response) => {
  try {
    const { message, lang } = req.body as ChatBody;
    const selectedLang: 'en' | 'ar' = lang === 'ar' ? 'ar' : 'en';
    const raw = message || '';
    const text = raw.trim();

    if (!text) {
      return res.status(400).json({
        reply:
          selectedLang === 'ar'
            ? 'اكتب سؤالك حتى أستطيع مساعدتك 🙂'
            : 'Kuch likhiye, main aapki madad karta hoon 🙂.',
      });
    }

    const apiKey =
      process.env.GEMINI_API_KEY ||
      process.env.GOOGLE_GEMINI_API_KEY ||
      process.env.GOOGLE_API_KEY;

    // If Gemini key is missing, fall back immediately
    if (!apiKey) {
      const fallback = await buildRuleBasedReply(text, selectedLang);
      return res.json({ reply: fallback });
    }

    // Build context from active plans
    const plans = await RentalPlan.find({ isActive: true }).sort({ price: 1 }).lean();
    const planSummary = plans
      .map(
        (p) =>
          `${p.name} (₹${p.price}/month): features=${JSON.stringify(
            p.features
          )}, trialDays=${p.trialDays}, isPopular=${p.isPopular}`
      )
      .join('\n');

    const systemPromptEn = `
You are "Restro Assistant", a helpful sales & support assistant for the multi‑tenant SaaS platform "Restro OS".
Restro OS provides: menu management, online & walk‑in orders, table booking, billing & GST‑ready invoices,
revenue analytics, staff & role control, hero images/banners, and multi‑restaurant / multi‑branch management.

Your goals:
- Understand the size and needs of the restaurant (tables, branches, dine‑in vs online, staff).
- Explain which subscription plan is best (Starter / Pro / Enterprise or other) and why, using strong but honest sales language.
- Always connect features to business benefits: less manual work, fewer mistakes, more time for the owner,
  better guest experience, and clearer revenue visibility.
- Encourage starting a free trial when appropriate.

Current active plans (from database):
${planSummary || 'No plan data loaded.'}

Language:
- If lang=en, reply in friendly Hinglish (simple English mixed with easy Hindi) suitable for Indian restaurant owners.
- If lang=ar, reply in clear Modern Standard Arabic, short paragraphs.

NEVER mention that you are an AI model, Gemini, or that you are calling an API.
Just behave like the built‑in Restro OS assistant.
`;

    const systemPromptAr = `
أنت "Restro Assistant" مساعد للمطاعم على منصة Restro OS (نظام SaaS لإدارة المطاعم).
هدفك شرح الباقات (Starter / Pro / Enterprise) وفوائدها العملية للمطعم
مثل تقليل العمل اليدوي، تقليل الأخطاء، زيادة تنظيم الطلبات والحجوزات، وتحسين رؤية الإيرادات.
استخدم لغة عربية بسيطة ومقنعة، ووضّح متى تكون كل باقة مناسبة (مطعم صغير، متوسط، أو سلسلة فروع).
شجّع المستخدم على تجربة النسخة التجريبية المجانية عندما يكون ذلك مناسباً.

الباقات الحالية (من قاعدة البيانات):
${planSummary || 'لا توجد بيانات باقات محملة حالياً.'}

لا تذكر أبداً أنك نموذج ذكاء اصطناعي أو Gemini؛ تحدث كمساعد Restro OS فقط.
`;

    const prompt =
      selectedLang === 'ar'
        ? `${systemPromptAr}\n\nسؤال الزبون:\n${text}`
        : `${systemPromptEn}\n\nRestaurant owner question:\n${text}`;

    const body = {
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 512,
      },
    };

    const resp = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }
    );

    if (!resp.ok) {
      const fallback = await buildRuleBasedReply(text, selectedLang);
      return res.json({ reply: fallback });
    }

    const json: any = await resp.json();
    const parts: any[] = json.candidates?.[0]?.content?.parts || [];
    const replyText = parts.map((p) => p.text).join(' ').trim();

    if (!replyText) {
      const fallback = await buildRuleBasedReply(text, selectedLang);
      return res.json({ reply: fallback });
    }

    return res.json({ reply: replyText });
  } catch (error: any) {
    const selectedLang: 'en' | 'ar' =
      (req.body as ChatBody)?.lang === 'ar' ? 'ar' : 'en';
    const fallback = await buildRuleBasedReply(
      (req.body as ChatBody)?.message || '',
      selectedLang
    );
    return res.json({ reply: fallback });
  }
};


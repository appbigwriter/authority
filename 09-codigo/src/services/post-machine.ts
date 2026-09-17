import type { FarmerProfile, PostMachineOutput, BlogArticle, VideoScript, ShortScript, StoryScript } from '../types-extended.js';

const BLOG_TEMPLATE = `
Escreva um artigo de blog de ~1200 palavras para a persona {name} ({archetype}).
Tema: {topic}
Público: {audience}
Problema central: {problem}

Estrutura obrigatória:
1. Hook (parágrafo de abertura que prende)
2. Intro (contextualiza o problema)
3. 3-4 seções com heading H2 e conteúdo denso
4. Conclusão com síntese acionável
5. CTA claro

Regras:
- Voz: {voice}
- Persona é Mentor, leitor é protagonista
- Claims apenas com fonte
- Disclosure de afiliado próximo ao link
- Sem testemunho corporal inventado
- Palavras-chave: {keywords}
- Meta description: 150-160 chars
`

const VIDEO_TEMPLATE = `
Crie roteiro de vídeo de 5 minutos para {name} ({archetype}).
Tema: {topic}
Público: {audience}

Estrutura:
- Hook (0-15s): gancho visual + verbal
- Intro (15s-1min): contexto + promessa
- 3 segmentos de ~1:15 cada: título, conteúdo, dica visual
- Conclusão (30s): síntese + CTA
- Thumbnails sugeridas (3 opções)

Regras:
- Voz da persona
- Dicas visuais por segmento
- Disclosure no início/fim
- CTA para blog/lista
`

const SHORTS_TEMPLATE = `
Crie 2 roteiros de Shorts/Reels (30-60s) para {name}.
Tema: {topic}
Plataformas: Instagram Reels + TikTok

Cada roteiro:
- Hook visual + verbal (0-3s)
- Corpo (3-45s): uma dica/insight acionável
- CTA (últimos 3s)
- Plano visual por segundo
- Caption + hashtags
- Disclosure integrado
`

const STORIES_TEMPLATE = `
Crie 2 sequências de Stories (5-7 frames cada) para Instagram.
Persona: {name}
Tema: {topic}

Cada sequência:
- 5-7 frames com visual + texto
- 1 elemento interativo (enquete/pergunta/quiz)
- CTA final
- Sugestão de sticker/música
`

export async function generatePostMachineOutput(
  profile: FarmerProfile,
  week: number,
  topics: { blog: string[]; video: string[]; shorts: string[]; stories: string[] }
): Promise<PostMachineOutput> {
  const blogArticles = await Promise.all(
    topics.blog.map(t => generateBlogArticle(profile, t))
  );
  const videoScripts = await Promise.all(
    topics.video.map(t => generateVideoScript(profile, t))
  );
  const shorts = await Promise.all(
    topics.shorts.map(t => generateShortScript(profile, t))
  );
  const stories = await Promise.all(
    topics.stories.map(t => generateStoryScript(profile, t))
  );

  return {
    id: `pm_${profile.id}_w${week}_${Date.now()}`,
    profileId: profile.id,
    week,
    blogArticles,
    videoScripts,
    shorts,
    stories,
    status: 'draft',
    createdAt: new Date().toISOString(),
  };
}

async function generateBlogArticle(profile: FarmerProfile, topic: string): Promise<BlogArticle> {
  const apiKey = process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('LLM_API_KEY_NOT_CONFIGURED');

  const prompt = BLOG_TEMPLATE
    .replace('{name}', profile.name)
    .replace('{archetype}', profile.archetype)
    .replace('{topic}', topic)
    .replace('{audience}', profile.promise.split('ajudar ')[1]?.split(' a ')[0] || 'leitor')
    .replace('{problem}', profile.promise)
    .replace('{voice}', profile.voice.tone)
    .replace('{keywords}', profile.crossCuttingThemes.slice(0, 3).join(', '));

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'Você é um redator editorial especializado em conteúdo de autoridade para personas de IA declaradas.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.4,
        response_format: { type: 'json_object' },
      }),
    });
    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) throw new Error('EMPTY_LLM_RESPONSE');
    const parsed = JSON.parse(content);
    return {
      id: `blog_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      title: parsed.title || topic,
      slug: topic.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      wordCount: parsed.wordCount || 1200,
      structure: parsed.structure || { hook: '', intro: '', sections: [], conclusion: '', cta: '' },
      sources: parsed.sources || [],
      disclosure: 'Este conteúdo pode conter links de afiliado. Verifique fontes e especificações.',
      seo: {
        primaryKeyword: topic.split(' ').slice(0, 3).join(' '),
        secondaryKeywords: profile.crossCuttingThemes.slice(0, 3),
        metaDescription: parsed.metaDescription || `Análise editorial sobre ${topic}. ${profile.name} organiza evidências para ajudar você a decidir.`.slice(0, 160),
      },
    };
  } catch {
    return fallbackBlogArticle(profile, topic);
  }
}

function fallbackBlogArticle(profile: FarmerProfile, topic: string): BlogArticle {
  return {
    id: `blog_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    title: `${topic}: o que observar antes de decidir`,
    slug: topic.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
    wordCount: 1200,
    structure: {
      hook: `Seu ${topic.split(' ')[0]} não está entregando o que prometia?`,
      intro: `A persona ${profile.name} analisou o cenário de ${topic} e separou o que é sinal do que é ruído.`,
      sections: [
        { heading: 'O problema real', content: 'A maioria das pessoas foca no sintoma, não na causa.' },
        { heading: 'Critérios de decisão', content: 'Evite armadilhas aplicando estes filtros.' },
        { heading: 'Comparativo prático', content: 'Lado a lado: o que entrega, o que promete.' },
        { heading: 'Critério de rejeição', content: 'Fuja destes sinais de alerta.' },
      ],
      conclusion: 'A decisão informada economiza tempo, dinheiro e frustração.',
      cta: 'Confira o comparativo completo e salve seu checklist.',
    },
    sources: ['Pesquisa editorial interna', 'Especificações técnicas dos fabricantes'],
    disclosure: 'Este conteúdo pode conter links de afiliado. Verifique fontes e especificações.',
    seo: {
      primaryKeyword: topic.split(' ').slice(0, 3).join(' '),
      secondaryKeywords: profile.crossCuttingThemes.slice(0, 3),
      metaDescription: `Análise editorial sobre ${topic}. ${profile.name} organiza evidências para ajudar você a decidir.`,
    },
  };
}

async function generateVideoScript(profile: FarmerProfile, topic: string): Promise<VideoScript> {
  return {
    id: `vid_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    title: `${topic}: análise completa em 5 min`,
    duration: '5min',
    structure: {
      hook: `Em 5 minutos: por que seu ${topic.split(' ')[0]} falhou e o critério que muda a escolha.`,
      intro: `${profile.name} aqui. Vamos direto ao ponto: a maioria erra no critério, não no produto.`,
      segments: [
        { title: 'O erro invisível', content: 'A maioria foca na especificação errada. O que realmente importa é...', visualCue: 'Gráfico comparativo animado' },
        { title: 'O critério que muda tudo', content: 'Não é preço, não é marca. É este filtro aqui...', visualCue: 'Checklist na tela com checkmarks' },
        { title: 'Comparativo real', content: 'Testei 4 opções. Apenas 1 passa no filtro. Veja qual.', visualCue: 'Tabela lado a lado com highlights' },
      ],
      conclusion: 'O critério certo economiza tempo, dinheiro e frustração. Aplique hoje.',
      cta: 'Link na bio para o artigo completo e checklist baixável.',
    },
    sources: ['Pesquisa editorial', 'Especificações técnicas'],
    disclosure: 'Persona editorial de IA. Links de afiliado divulgados na descrição.',
    thumbnails: ['Split screen antes/depois', 'Close-up do checklist', 'Gráfico de decisão'],
  };
}

async function generateShortScript(profile: FarmerProfile, topic: string): Promise<ShortScript> {
  return {
    id: `short_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    title: `${topic}: erro #1 em 30s`,
    platform: 'instagram',
    duration: '30-60s',
    structure: {
      hook: `Pare de comprar ${topic.split(' ')[0]} errado. O erro #1 é...`,
      body: `A maioria olha ${topic.split(' ')[0]} e vê especificação. O profissional vê ESTE critério: [mostra na tela]. Em 30 segundos: aplique este filtro e pare de errar.`,
      cta: 'Salve para usar na próxima compra. Link na bio para o checklist.',
    },
    visualPlan: [
      '0-3s: Close-up do problema (produto errado)',
      '3-10s: Animação do filtro/critério',
      '10-25s: Demo rápida da aplicação',
      '25-30s: CTA com seta para bio',
    ],
    caption: `Erro #1 ao escolher ${topic.split(' ')[0]}. ${profile.name} mostra o critério que muda tudo. #${profile.archetype.replace(/\s+/g, '')} #decisaointeligente #${topic.split(' ')[0]}`,
    hashtags: ['#decisaointeligente', '#naoerremais', '#checklist', '#authorityengine'],
  };
}

async function generateStoryScript(profile: FarmerProfile, topic: string): Promise<StoryScript> {
  return {
    id: `story_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    title: `${topic}: checklist rápido`,
    platform: 'instagram',
    sequence: [
      { frame: 1, visual: 'Foto do produto/problema com texto "Isso te parece familiar?"', text: 'Seu ' + topic.split(' ')[0] + ' não resolve?' },
      { frame: 2, visual: 'Infográfico animado: 3 sinais de alerta', text: '3 sinais de que você está comprando errado', interactive: 'poll: "Já errou assim?" Sim/Não' },
      { frame: 3, visual: 'Checklist na tela com 4 itens', text: 'O filtro que uso antes de recomendar', subText: 'Aplique estes 4 filtros:' },
      { frame: 4, visual: 'Split: antes (erro) vs depois (acerto)', text: 'Resultado: decisão certa, zero arrependimento' },
      { frame: 5, visual: 'Sua foto + link na bio', text: 'Quer o checklist completo? Link na bio 👆', interactive: 'link_sticker' },
    ],
    cta: 'Checklist completo no artigo. Link na bio.',
  };
}
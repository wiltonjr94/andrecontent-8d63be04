import avatar from "@/assets/avatar.jpg";
import work1 from "@/assets/work-1.jpg";
import work2 from "@/assets/work-2.jpg";
import work3 from "@/assets/work-3.jpg";

// NOTE (Fase 1): conteúdo local que espelha o formato do banco.
// Na Fase 2 (Lovable Cloud) isto vira leitura de tabelas via server functions,
// mantendo exatamente estes campos, sem alterar os componentes.

export interface SiteSettings {
  name: string;
  avatar: string;
  heroTitle: string;
  heroSubtitle: string;
  whatsapp: string;
  instagram: string;
  linkedin: string;
  email: string;
}

export interface CategoryPage {
  slug: string;
  title: string;
  description: string;
  order: number;
}

export interface ContentItem {
  id: string;
  category: string; // slug da página
  title: string;
  description: string;
  image: string;
  date: string;
  link?: string;
  order: number;
}

export interface Highlight {
  id: string;
  title: string;
  image: string;
  link: string;
  order: number;
}

export const siteSettings: SiteSettings = {
  name: "André",
  avatar,
  heroTitle: "Oi, eu sou o André",
  heroSubtitle:
    "Crio conteúdos ao vivo, cases e frames com um olhar direto e vibrante. Aqui reúno os trabalhos que mais me representam — do improviso da transmissão ao cuidado de cada quadro.",
  whatsapp: "https://wa.me/5511999999999",
  instagram: "https://instagram.com/",
  linkedin: "https://linkedin.com/in/",
  email: "andre@exemplo.com",
};

export const pages: CategoryPage[] = [
  {
    slug: "live-content",
    title: "Live Content",
    description: "Transmissões, eventos ao vivo e conteúdo em tempo real.",
    order: 1,
  },
  {
    slug: "cases",
    title: "Cases",
    description: "Projetos completos, do briefing ao resultado.",
    order: 2,
  },
  {
    slug: "frames",
    title: "Frames",
    description: "Quadros, stills e composições selecionadas.",
    order: 3,
  },
];

export const items: ContentItem[] = [
  {
    id: "l1",
    category: "live-content",
    title: "Festival ao vivo",
    description: "Direção e transmissão multicâmera de um festival de música.",
    image: work2,
    date: "2025-11-02",
    link: "https://example.com",
    order: 1,
  },
  {
    id: "l2",
    category: "live-content",
    title: "Talk show semanal",
    description: "Formato ao vivo com convidados e interação em tempo real.",
    image: work2,
    date: "2025-09-14",
    order: 2,
  },
  {
    id: "c1",
    category: "cases",
    title: "Rebrand vibrante",
    description: "Identidade visual completa com sistema de cores ousado.",
    image: work1,
    date: "2025-08-20",
    link: "https://example.com",
    order: 1,
  },
  {
    id: "c2",
    category: "cases",
    title: "Campanha digital",
    description: "Direção de arte e produção para lançamento de produto.",
    image: work1,
    date: "2025-06-05",
    order: 2,
  },
  {
    id: "f1",
    category: "frames",
    title: "Luz quente",
    description: "Estudo de composição e cor em still cinematográfico.",
    image: work3,
    date: "2025-10-11",
    order: 1,
  },
  {
    id: "f2",
    category: "frames",
    title: "Contraluz",
    description: "Frame minimalista explorando silhueta e profundidade.",
    image: work3,
    date: "2025-07-01",
    order: 2,
  },
];

export const highlights: Highlight[] = [
  { id: "h1", title: "Festival ao vivo", image: work2, link: "/p/live-content", order: 1 },
  { id: "h2", title: "Rebrand vibrante", image: work1, link: "/p/cases", order: 2 },
  { id: "h3", title: "Luz quente", image: work3, link: "/p/frames", order: 3 },
];

export function getPage(slug: string) {
  return pages.find((p) => p.slug === slug);
}

export function getItems(slug: string) {
  return items
    .filter((i) => i.category === slug)
    .sort((a, b) => a.order - b.order);
}
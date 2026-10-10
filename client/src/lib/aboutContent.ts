import type { Media, Milestone, SiteSettings } from '../types';

export type AboutTextKey = 'designer' | 'philosophy' | 'upcycling' | 'bespoke' | 'london';

export const DEFAULT_PORTRAIT: Media = {
  _id: 'default-luciana-portrait',
  type: 'image',
  kind: 'image',
  source: 'client',
  url: 'https://drive.google.com/thumbnail?id=112d-8BASmKPHdzMixYLWrSEUgvhMsNXx&sz=w2000',
  thumbnailUrl: '/about/luciana-portrait.jpg',
  alt: 'Luciana Pulcini, founder of LucianaSoul, speaking at a pop-up and workshop event',
};

export const DEFAULT_ABOUT_TEXT: Record<AboutTextKey, string> = {
  designer:
    'Luciana Pulcini is an Italian-trained tailor and the founder of LucianaSoul, established in London in 2016.\n\nShe creates unique, up-cycled clothing that gives existing textiles a second story: individual pieces shaped by her training, her imagination and the people she meets along the way.',
  philosophy:
    'Not just clothes. A cause.\n\nLucianaSoul is inspired by Luciana\'s own experience of homelessness. Through inclusive fashion events, international exhibitions and her collaboration with Crisis, she uses her work to support efforts to end homelessness.',
  upcycling:
    'Reusing existing textiles is at the heart of every piece. Fabrics that already have a history are reimagined into new, individual garments.\n\nSupported by an UnLtd grant, LucianaSoul runs up-cycling workshops that welcome people of all ages and backgrounds to learn and create together.',
  bespoke: '',
  london:
    'LucianaSoul is rooted in Bermondsey, South East London: from a catwalk at the Old Biscuit Factory to community workshops with South Bermondsey Big Local.',
};

export const DEFAULT_MILESTONES: Milestone[] = [
  {
    date: '2016',
    text: 'LucianaSoul receives the FD Young Designer Award, supporting families affected by Angelman Syndrome.',
  },
  {
    date: 'December 2018',
    text: 'Luciana organises a catwalk for disabled girls at the Old Biscuit Factory in Bermondsey.',
  },
  {
    date: 'July 2019',
    text: 'LucianaSoul exhibits in Italy with the NGO ANFFAS, the National Association of Families of People with Intellectual and/or Relational Disabilities.',
  },
  {
    date: 'November 2019',
    text: "Awarded an UnLtd grant, the UK's foundation for social entrepreneurs, in partnership with Local Trust and South Bermondsey Big Local, to welcome people of all backgrounds and ages to up-cycling workshops.",
  },
  {
    date: 'October 2021',
    text: 'Takes part in the "Justice in Fashion" exhibition, showcasing the advantages of reusing existing textiles to create garments.',
  },
  {
    date: 'Today',
    text: 'Raising funds to end homelessness: Luciana continues her collaboration with Crisis, showcasing her collection of unique clothes while nurturing further collaborations.',
  },
];

export function aboutText(about: SiteSettings['about'] | undefined, key: AboutTextKey) {
  const value = about?.[key]?.trim();
  return value || DEFAULT_ABOUT_TEXT[key];
}

export function aboutMilestones(about: SiteSettings['about'] | undefined) {
  const items = (about?.milestones ?? []).filter((m) => m.date.trim() || m.text.trim());
  return items.length > 0 ? items : DEFAULT_MILESTONES;
}

export function aboutPortrait(about: SiteSettings['about'] | undefined) {
  return about?.designerMedia || DEFAULT_PORTRAIT;
}

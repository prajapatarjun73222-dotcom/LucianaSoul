export function whatsappLink(number: string, message: string) {
  const digits = number.replace(/\D/g, '');
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

const withArticle = (name: string) => (/^the\s/i.test(name) ? name : `the ${name}`);

export const waMessages = {
  general: "Hi LucianaSoul, I'd love to know more about your designs.",
  bespoke: "Hi LucianaSoul, I'd like to discuss a bespoke design.",
  piece: (name: string) => `Hi LucianaSoul, I'm interested in ${withArticle(name)} and would like to know more.`,
  availability: (name: string) => `Hi LucianaSoul, could you tell me about the availability of ${withArticle(name)}?`,
};

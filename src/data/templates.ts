export type PhotoboothTemplate = {
  id: string;
  name: string;
  styleLabel: string;
  imageSrc: string;
};

export const PHOTObooth_TEMPLATES: PhotoboothTemplate[] = [
  {
    id: "vintage-sepia",
    name: "Vintage Sepia",
    styleLabel: "Vintage Sepia",
    imageSrc: "/templates/vintage-sepia.jpg",
  },
  {
    id: "wedding-classic",
    name: "Wedding Classic",
    styleLabel: "Wedding Classic",
    imageSrc: "/templates/wedding-classic.jpg",
  },
  {
    id: "romantic-bw",
    name: "Romantic Black & White",
    styleLabel: "Black & White",
    imageSrc: "/templates/romantic-bw.jpg",
  },
  {
    id: "romantic-color",
    name: "Romantic Color",
    styleLabel: "Color",
    imageSrc: "/templates/romantic-color.jpg",
  },
];


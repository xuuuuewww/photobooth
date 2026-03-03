export interface PhotoTemplate {
  id: string;
  name: string;
  category: string;
  bgColor: string; // 模板背景色
  frameColor: string; // 照片框颜色
  photoCount: 4; // 固定4张
  filterClass: string; // Tailwind-like filter hint: 'sepia' | 'grayscale' | ''
  fontColor: string; // 底部文字颜色
  footerText: string; // 底部水印文字
}

export const templates: PhotoTemplate[] = [
  {
    id: "vintage-sepia",
    name: "Vintage Sepia",
    category: "Vintage Sepia",
    bgColor: "#f5e6d3",
    frameColor: "#c9a87c",
    photoCount: 4,
    filterClass: "sepia",
    fontColor: "#7a5c3a",
    footerText: "PHOTOBOOTH",
  },
  {
    id: "wedding-classic",
    name: "Wedding Classic",
    category: "Wedding Classic",
    bgColor: "#fff8f8",
    frameColor: "#f9c6d0",
    photoCount: 4,
    filterClass: "",
    fontColor: "#d4a0aa",
    footerText: "PHOTOBOOTH",
  },
  {
    id: "romantic-bw",
    name: "Romantic Black & White",
    category: "Black & White",
    bgColor: "#1a1a1a",
    frameColor: "#ffffff",
    photoCount: 4,
    filterClass: "grayscale",
    fontColor: "#ffffff",
    footerText: "PHOTOBOOTH",
  },
  {
    id: "romantic-color",
    name: "Romantic Color",
    category: "Color",
    bgColor: "#fff0f5",
    frameColor: "#ff6b9d",
    photoCount: 4,
    filterClass: "",
    fontColor: "#ff6b9d",
    footerText: "PHOTOBOOTH",
  },
];


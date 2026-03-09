// lib/analytics.ts
// 这个文件管理所有埋点，不需要修改任何内容

declare global {
    interface Window {
      gtag: (...args: any[]) => void
    }
  }
  
  // 基础发送函数
  const trackEvent = (eventName: string, params?: Record<string, string>) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', eventName, params)
    }
  }
  
  // 需求1: 首页点击模板
  export const trackTemplateClick = (templateName: string) => {
    trackEvent('template_click', { template_name: templateName })
  }
  
  // 需求2: /capture页 点击Start拍摄
  export const trackCaptureStart = () => {
    trackEvent('capture_start')
  }
  
  // 需求3: /capture页 点击Continue
  export const trackCaptureContinue = () => {
    trackEvent('capture_continue')
  }
  
  // 需求4: /capture页 点击Retake
  export const trackCaptureRetake = () => {
    trackEvent('capture_retake')
  }
  
  // 需求5: /customize页 选择Background Color
  export const trackBgColor = () => {
    trackEvent('customize_action', { customize_option: 'background_color' })
  }
  
  // 需求6: /customize页 选择Background Pattern
  export const trackBgPattern = () => {
    trackEvent('customize_action', { customize_option: 'background_pattern' })
  }
  
  // 需求7: /customize页 选择Filter
  export const trackFilter = () => {
    trackEvent('customize_action', { customize_option: 'filter' })
  }
  
  // 需求8: /customize页 选择Stickers
  export const trackSticker = () => {
    trackEvent('customize_action', { customize_option: 'sticker' })
  }
  
  // 需求9: /customize页 输入Footer Text
  export const trackFooterText = () => {
    trackEvent('customize_action', { customize_option: 'footer_text' })
  }
  
  // 需求10: /customize页 点击Download
  export const trackDownload = () => {
    trackEvent('download_photo_strip')
  }
  
  // 需求11: /customize页 点击Retake Photos
  export const trackCustomizeRetake = () => {
    trackEvent('customize_retake_photos')
  }
  
  // 需求12: /customize页 点击Start Over
  export const trackStartOver = () => {
    trackEvent('customize_start_over')
  }
  
  // 需求13: 移动端长按保存图片
  export const trackLongPressSave = () => {
    trackEvent('longpress_save_image', { device_type: 'mobile' })
  }

  // 分享按钮与各平台点击
  export const trackShare = (platform: string) => {
    trackEvent('customize_share', { share_platform: platform })
  }
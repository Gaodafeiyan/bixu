// CDN配置文件
export const CDN_CONFIG = {
  // APK下载链接
  APK_DOWNLOAD_URL: process.env.APK_CDN_URL || 'https://zenithus-cdn.oss-cn-hangzhou.aliyuncs.com/app-release.apk',
  
  // 备用下载链接（如果CDN不可用）
  APK_FALLBACK_URL: process.env.APK_FALLBACK_URL || 'https://zenithus.app/downloads/app-release.apk',
  
  // CDN配置
  CDN_CONFIG: {
    // 阿里云OSS配置
    ALIYUN_OSS: {
      region: 'oss-cn-hangzhou',
      bucket: 'zenithus-cdn',
      endpoint: 'https://zenithus-cdn.oss-cn-hangzhou.aliyuncs.com'
    },
    
    // 腾讯云COS配置（备用）
    TENCENT_COS: {
      region: 'ap-beijing',
      bucket: 'zenithus-cdn-1250000000',
      endpoint: 'https://zenithus-cdn-1250000000.cos.ap-beijing.myqcloud.com'
    }
  }
};

// 获取APK下载链接
export function getApkDownloadUrl(): string {
  return CDN_CONFIG.APK_DOWNLOAD_URL;
}

// 获取备用下载链接
export function getApkFallbackUrl(): string {
  return CDN_CONFIG.APK_FALLBACK_URL;
}

// 检查CDN是否可用
export async function checkCdnAvailability(): Promise<boolean> {
  try {
    const response = await fetch(CDN_CONFIG.APK_DOWNLOAD_URL, { method: 'HEAD' });
    return response.ok;
  } catch (error) {
    console.error('CDN可用性检查失败:', error);
    return false;
  }
}

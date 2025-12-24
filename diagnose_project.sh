#!/bin/bash

echo "========================================"
echo "项目诊断脚本 - Project Diagnostic Script"
echo "========================================"
echo ""

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 获取脚本所在目录
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
echo "当前工作目录: $SCRIPT_DIR"
echo ""

# 1. 检查项目目录结构
echo "----------------------------------------"
echo "1. 检查项目目录结构"
echo "----------------------------------------"
if [ -d "bixu" ]; then
    echo -e "${GREEN}✓ bixu 项目目录存在${NC}"
    cd bixu
    PROJECT_DIR="$PWD"
else
    echo -e "${RED}✗ bixu 项目目录不存在${NC}"
    echo "可用目录："
    ls -d */ 2>/dev/null
    exit 1
fi
echo ""

# 2. 检查 Flutter 环境
echo "----------------------------------------"
echo "2. 检查 Flutter 环境"
echo "----------------------------------------"
if command -v flutter &> /dev/null; then
    echo -e "${GREEN}✓ Flutter 已安装${NC}"
    flutter --version
else
    echo -e "${RED}✗ Flutter 未安装或未在 PATH 中${NC}"
fi
echo ""

# 3. 检查项目文件
echo "----------------------------------------"
echo "3. 检查关键项目文件"
echo "----------------------------------------"
files=("pubspec.yaml" "lib/main.dart" "android/app/build.gradle" "ios/Runner/Info.plist")
for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✓${NC} $file 存在"
    else
        echo -e "${RED}✗${NC} $file 不存在"
    fi
done
echo ""

# 4. 检查 pubspec.yaml 依赖
echo "----------------------------------------"
echo "4. 检查 pubspec.yaml 依赖配置"
echo "----------------------------------------"
if [ -f "pubspec.yaml" ]; then
    echo "Flutter SDK 版本要求："
    grep -A 1 "environment:" pubspec.yaml | grep "sdk:"
    echo ""
    echo "主要依赖："
    grep -A 20 "dependencies:" pubspec.yaml | grep -v "^$" | head -15
else
    echo -e "${RED}✗ pubspec.yaml 文件不存在${NC}"
fi
echo ""

# 5. 检查依赖是否安装
echo "----------------------------------------"
echo "5. 检查依赖安装状态"
echo "----------------------------------------"
if [ -f "pubspec.lock" ]; then
    echo -e "${GREEN}✓ pubspec.lock 存在（依赖已锁定）${NC}"
else
    echo -e "${YELLOW}! pubspec.lock 不存在（需要运行 flutter pub get）${NC}"
fi

if [ -d ".dart_tool" ]; then
    echo -e "${GREEN}✓ .dart_tool 目录存在${NC}"
else
    echo -e "${YELLOW}! .dart_tool 目录不存在${NC}"
fi
echo ""

# 6. 运行 Flutter Doctor
echo "----------------------------------------"
echo "6. 运行 Flutter Doctor 诊断"
echo "----------------------------------------"
if command -v flutter &> /dev/null; then
    flutter doctor
else
    echo -e "${RED}Flutter 未安装，跳过诊断${NC}"
fi
echo ""

# 7. 尝试获取依赖
echo "----------------------------------------"
echo "7. 尝试获取项目依赖"
echo "----------------------------------------"
if command -v flutter &> /dev/null; then
    echo "运行 flutter pub get..."
    flutter pub get 2>&1 | tee pub_get_output.log

    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ 依赖获取成功${NC}"
    else
        echo -e "${RED}✗ 依赖获取失败，请查看 pub_get_output.log${NC}"
    fi
else
    echo -e "${YELLOW}Flutter 未安装，跳过此步骤${NC}"
fi
echo ""

# 8. 检查代码问题
echo "----------------------------------------"
echo "8. 静态代码分析"
echo "----------------------------------------"
if command -v flutter &> /dev/null; then
    echo "运行 flutter analyze..."
    flutter analyze 2>&1 | tee analyze_output.log | head -50

    if [ ${PIPESTATUS[0]} -eq 0 ]; then
        echo -e "${GREEN}✓ 代码分析通过${NC}"
    else
        echo -e "${YELLOW}! 发现代码问题，详细信息请查看 analyze_output.log${NC}"
    fi
else
    echo -e "${YELLOW}Flutter 未安装，跳过此步骤${NC}"
fi
echo ""

# 9. 检查 Android 配置
echo "----------------------------------------"
echo "9. 检查 Android 配置"
echo "----------------------------------------"
if [ -d "android" ]; then
    echo -e "${GREEN}✓ Android 目录存在${NC}"

    if [ -f "android/local.properties" ]; then
        echo -e "${GREEN}✓ local.properties 存在${NC}"
        echo "SDK 路径："
        grep "sdk.dir" android/local.properties
    else
        echo -e "${YELLOW}! local.properties 不存在${NC}"
    fi

    if [ -f "android/app/build.gradle" ]; then
        echo ""
        echo "Gradle 配置（部分）："
        grep -E "(compileSdkVersion|minSdkVersion|targetSdkVersion)" android/app/build.gradle
    fi
else
    echo -e "${RED}✗ Android 目录不存在${NC}"
fi
echo ""

# 10. 检查 iOS 配置
echo "----------------------------------------"
echo "10. 检查 iOS 配置"
echo "----------------------------------------"
if [ -d "ios" ]; then
    echo -e "${GREEN}✓ iOS 目录存在${NC}"

    if [ -f "ios/Podfile" ]; then
        echo -e "${GREEN}✓ Podfile 存在${NC}"
    else
        echo -e "${YELLOW}! Podfile 不存在${NC}"
    fi

    if [ -d "ios/Pods" ]; then
        echo -e "${GREEN}✓ Pods 已安装${NC}"
    else
        echo -e "${YELLOW}! Pods 未安装（可能需要运行 pod install）${NC}"
    fi
else
    echo -e "${RED}✗ iOS 目录不存在${NC}"
fi
echo ""

# 11. 生成诊断报告
echo "----------------------------------------"
echo "11. 生成诊断报告"
echo "----------------------------------------"
REPORT_FILE="diagnostic_report_$(date +%Y%m%d_%H%M%S).txt"
cat > "$REPORT_FILE" << EOF
项目诊断报告
生成时间: $(date)
项目路径: $PROJECT_DIR

=== 系统信息 ===
操作系统: $(uname -a)
用户: $(whoami)

=== Flutter 环境 ===
EOF

if command -v flutter &> /dev/null; then
    flutter --version >> "$REPORT_FILE" 2>&1
else
    echo "Flutter 未安装" >> "$REPORT_FILE"
fi

cat >> "$REPORT_FILE" << EOF

=== 项目文件检查 ===
EOF

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "✓ $file 存在" >> "$REPORT_FILE"
    else
        echo "✗ $file 不存在" >> "$REPORT_FILE"
    fi
done

echo ""
echo -e "${GREEN}诊断报告已生成: $REPORT_FILE${NC}"
echo ""

# 12. 常见问题解决建议
echo "========================================"
echo "常见问题解决建议"
echo "========================================"
echo ""
echo "如果项目无法打开，请尝试以下步骤："
echo ""
echo "1. 重新获取依赖："
echo "   flutter pub get"
echo ""
echo "2. 清理项目缓存："
echo "   flutter clean"
echo "   flutter pub get"
echo ""
echo "3. 检查 Flutter 版本兼容性："
echo "   flutter --version"
echo "   flutter upgrade（如需升级）"
echo ""
echo "4. 修复 Android 配置："
echo "   cd android"
echo "   ./gradlew clean"
echo "   cd .."
echo ""
echo "5. 修复 iOS 配置（Mac only）："
echo "   cd ios"
echo "   pod install --repo-update"
echo "   cd .."
echo ""
echo "6. 检查代码错误："
echo "   flutter analyze"
echo ""
echo "7. 如果使用 Android Studio / VS Code："
echo "   - File -> Invalidate Caches and Restart"
echo "   - 重新打开项目"
echo ""
echo "========================================"
echo "诊断完成！"
echo "========================================"

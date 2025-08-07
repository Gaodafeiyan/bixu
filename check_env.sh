# 环境变量检查脚本
echo "检查环境变量..."

# 检查JWT_SECRET
if [ -z "$JWT_SECRET" ]; then
  echo "❌ JWT_SECRET未设置"
  echo "请在.env文件中添加: JWT_SECRET=your-secret-key"
else
  echo "✅ JWT_SECRET已设置"
fi

# 检查数据库配置
if [ -z "$DATABASE_HOST" ]; then
  echo "❌ DATABASE_HOST未设置"
else
  echo "✅ DATABASE_HOST已设置"
fi

# 检查其他必要变量
required_vars=("DATABASE_NAME" "DATABASE_USERNAME" "DATABASE_PASSWORD")
for var in "${required_vars[@]}"; do
  if [ -z "${!var}" ]; then
    echo "❌ $var未设置"
  else
    echo "✅ $var已设置"
  fi
done
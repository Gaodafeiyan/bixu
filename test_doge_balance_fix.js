const Web3 = require('web3');
const Decimal = require('decimal.js');

// 测试DOGE余额计算
async function testDogeBalance() {
  try {
    console.log('🧪 测试DOGE余额计算修复...');
    
    // 初始化Web3
    const rpcUrl = 'https://rpc.ankr.com/bsc/0cc28cc1d2308734e5535767191f325256d627fee791f33b30b8a9e9f53d02fb';
    const web3 = new Web3(rpcUrl);
    
    // DOGE合约地址
    const DOGE_CONTRACT_ADDRESS = '0xba2ae424d960c26247dd6c32edc70b295c744c43';
    const walletAddress = '0xe3353f75d68f9096aC4A49b4968e56b5DFbd2697';
    
    // 简化的DOGE ABI
    const DOGE_ABI = [
      {
        "constant": true,
        "inputs": [{"name": "_owner", "type": "address"}],
        "name": "balanceOf",
        "outputs": [{"name": "balance", "type": "uint256"}],
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [],
        "name": "decimals",
        "outputs": [{"name": "", "type": "uint8"}],
        "type": "function"
      }
    ];
    
    const dogeContract = new web3.eth.Contract(DOGE_ABI, DOGE_CONTRACT_ADDRESS);
    
    // 获取原始余额
    const rawBalance = await dogeContract.methods.balanceOf(walletAddress).call();
    console.log(`📊 原始余额: ${rawBalance}`);
    
    // 获取decimals
    const decimals = await dogeContract.methods.decimals().call();
    console.log(`📊 DOGE decimals: ${decimals}`);
    
    // 错误的方法（硬编码1e18）
    const wrongBalance = new Decimal(rawBalance).dividedBy(new Decimal(10).pow(18));
    console.log(`❌ 错误计算（1e18）: ${wrongBalance.toString()} DOGE`);
    
    // 正确的方法（动态decimals）
    const base = new Decimal(10).pow(decimals);
    const correctBalance = new Decimal(rawBalance).dividedBy(base);
    console.log(`✅ 正确计算（decimals=${decimals}）: ${correctBalance.toString()} DOGE`);
    
    // 验证
    if (correctBalance.greaterThan(10)) {
      console.log('🎉 修复成功！DOGE余额计算正确');
    } else {
      console.log('⚠️ 余额可能仍然有问题，请检查');
    }
    
  } catch (error) {
    console.error('❌ 测试失败:', error);
  }
}

// 运行测试
testDogeBalance(); 
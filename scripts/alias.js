const path = require('path')

// __dirname: 当前文件所在目录的完整目录名
// path.resolve: 返回一个以相对于当前的工作目录的绝对路径
const resolve = p => path.resolve(__dirname, '../', p)

// 抛出一个对象,每个属性对应着其当前的工作目录的绝对路径
module.exports = {
    vue: resolve('src/platforms/web/entry-runtime-with-compiler'),
    compiler: resolve('src/compiler'),
    core: resolve('src/core'),
    shared: resolve('src/shared'),
    web: resolve('src/platforms/web'),
    weex: resolve('src/platforms/weex'),
    server: resolve('src/server'),
    entries: resolve('src/entries'),
    sfc: resolve('src/sfc')
}

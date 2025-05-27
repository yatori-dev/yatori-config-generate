module.exports = {
    publicPath: '/yatori-config-generate', // 从 Vue CLI3.3 起已弃用，请使用publicPath
    outputDir: 'dist',
    lintOnSave: true,// 是否在保存的时候检查
    devServer: {// 环境配置
        host: 'localhost',
        port: 8088,
        open: true, //配置自动启动浏览器
    },
    // vue2.0
    // configureWebpack: {
    //     resolve: {
    //         alias: {
    //             '@': resolve('src')
    //         }
    //     }
    // },
    // vue3.0
    chainWebpack: config => {
        config.resolve.alias
            .set("@", resolve("src"))
            .set("assets", resolve("src/assets"))
            .set("components", resolve("src/components"))
            .set("views", resolve("src/views"))
        // .set("base", resolve("baseConfig"))
        // .set("public", resolve("public"));
    },
}

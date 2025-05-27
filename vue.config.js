module.exports = {
    publicPath: "/yatori-config-generate/", //打包后部署在一个子路径上http:xxx/m/
    productionSourceMap: false,
    devServer: {
      proxy: "http://xxxx.com", //测试或正式环境域名和端口号
    },
  };
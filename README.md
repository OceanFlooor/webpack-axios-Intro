# webpack-axios-Intro
初次搭建webpack，并封装axios请求

## install
```
cd webpack-axios-Intro
npm i
npm run server
```

也可以运行`webpack`打包，然后浏览器打开`index.html`

## 项目结构
```
├─.gitignore
├─package-lock.json
├─package.json
├─webpack.config.js         // webpack配置文件
├─public                    // public文件夹，存放最终相关文件
|   ├─bundle.js             // webpack打包后文件
|   └index.html             // html页面，有一个根节点供bundle.js嵌入
├─app                       // webpack打包js代码
|  ├─apiAxios.js            // 封装axios
|  ├─greeter.js             // 创建节点，用于点击测试apiAxios.js
|  └main.js                 // webpack入口文件
```
## 主要文件代码
### webpack.config.js
``` JavaScript
const path = require("path");

function resolve(dir) {
  return path.join(__dirname, dir);
}

module.exports = {
  // entry & output 分别制定webpack的入口文件和打包后的出口文件存放位置
  entry: __dirname + "/app/main.js",
  output: {
    path: __dirname + "/public",
    filename: "bundle.js",
  },
  
  devtool: "eval-source-map",
  devServer: {
    contentBase: resolve("public"),
    historyApiFallback: true,
    inline: true,
  },
  
  // 定义alias，方便项目文件引入
  resolve: {
    extensions: [".js", ".json"],
    alias: {
      "@": resolve("app"),
    },
  },
  module: {
    rules: [
      // babel对代码编译
      {
        test: /\.js$/,
        loader: "babel-loader",
        include: [resolve("app")],
      },
    ],
  },
};
```

### greeter.js
```javascript
import fetch from "./apiAxios";

export default function () {
  let greet = document.createElement("div");
  greet.textContent = "Hi there and greetings!";
  greet.onclick = function () {
  
    // 设置请求的url, data, method, option
    fetch("XXX", { name: "raven", age: "25" }, "post", { type: "json" });
  };
  return greet;
}
```

### apiAxios.js
```JavaScript
import axios from "axios";
import qs from "qs";
import _ from "lodash";

const errorHandle = (status, other) => {
  // 状态码判断
  switch (status) {
    // 401: 未登录状态，跳转登录页
    case 401:
      // toLogin();
      break;
    // 403 token过期
    // 清除token并跳转登录页
    case 403:
      console.log("登录过期，请重新登录");
      // localStorage.removeItem("token");
      // toLogin();
      break;
    // 404请求不存在
    case 404:
      console.log("请求的资源不存在");
      break;
    default:
      console.log(other);
  }
};

let instance = axios.create({ timeout: 10 * 1000 });

// 你要加的token
const token = "someTokens";

process.env.NODE_ENV === "development" ? (instance.defaults.baseURL = "https://www.development.com") : process.env.NODE_ENV === "production" ? (instance.defaults.baseURL = "https://www.production.com") : "";

instance.defaults.headers.post["Content-type"] = "application/x-www-form-urlencoded";

instance.interceptors.request.use(
  (config) => {
    // 提交请求前认证token
    token && (config.headers.Authorization = token);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

instance.interceptors.response.use(
  // axios文档: Any status code that lie within the range of 2xx cause this function to trigger
  (res) => res,

  (error) => {
    // 错误处理
    const { response } = error;

    if (response) {
      errorHandle(response.status, response.data.message);
      return Promise.reject(response);
    } else {
      // 断网
      // 请求超时或断网时，更新state的network状态
      // 假设vuex内部有一数据‘network’标记是否断网
      // network状态在app.vue中控制着一个全局的断网提示组件的显示隐藏
      if (!window.navigator.onLine) {
        store.commit("network", false);
      } else {
        return Promise.reject(error);
      }
    }
  }
);

const METHOD = {
  GET: "get",
  POST: "post",
};

const type = {
  urlencoded: "application/x-www-form-urlencoded",
  json: "application/json",
  file: "multipart/form-data",
};
/**
 *
 * @param {String} url
 * @param {String} method
 * @param {Object} data
 * @param {Object} options 请求配置
 * @param type 提交数据类型，urlencoded? json? or file?
 */
function fetch(url, data, method = "get", options = { type: "urlencoded" }) {
  const defaultConfig = {
    params: null,
    withCredentials: true, // 跨域请求默认携带cookie
  };

  let requsetConfig = {
    method,
    url,
  };
  if (method.toLowerCase() === METHOD.GET) {
    requsetConfig.params = data;
  } else if (method.toLowerCase() === METHOD.POST) {
    requsetConfig.headers = {
      "content-type": type[options.type],
    };
    if (options.type === "urlencoded") {
      requsetConfig.data = qs.stringify(data);
    } else {
      requsetConfig.data = data;
    }
  }

  requsetConfig = _.extend(defaultConfig, requsetConfig);
  console.log(requsetConfig);

  // axios docs:
  // Config will be merged with an order of precedence. The order is library defaults found in lib/defaults.js,
  // then defaults property of the instance, and finally config argument for the request.
  // The latter will take precedence over the former.
  return instance(requsetConfig)
    .then((res) => {
      return Promise.resolve(res.data);
    })
    .catch((e) => {
      console.log(e);
    });
}

export default fetch;
```

## 最后
这是本人初次封装axios和搭建webpack，有很多地方考虑不周，如有错误请大佬们指正


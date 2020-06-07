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

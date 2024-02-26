/*
   时间格式转换
   eg: Mon Aug 02 2021 00:00:00 GMT+0800 (中国标准时间) -> 2021-08-02 08:00:00
   若date格式是：2021-08-02T00:00:00+08:00,需要new Date(date)
*/
const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1 //注意getMonth()返回是 0-11
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return `${[year, month, day].map(formatNumber).join('-')} ${[hour, minute, second].map(formatNumber).join(':')}`
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : `0${n}`
}

//自定义标题和内容一致的对话框
function showModalTowErrors(content) {
  wx.showModal({
    title: content,
    content: content,
    showCancel: false,
  })
}

//自定义标题、内容的对话框  - 也用于request的错误返回res
function showModalErrorAndMsg(title, res) {
  if (typeof (res) == 'string') {
    wx.showModal({
      title: title,
      content: res,
      showCancel: false,
    })
  } else if (typeof (res) == 'object') {
    if (res.statusCode == 401) {
      showModalErrorAndMsg("账户过期", "请重新打开小程序进行登录")
      return
    }
    if (res.statusCode == 502) {
      showModalErrorAndMsg("系统错误", "服务器累了，让服务器歇会吧")
      return
    }
    if (res.statusCode == 500) {
      // showModalErrorAndMsg("系统错误", "恭喜你发现一个BUG！快反馈给开发人员吧~")
      showModalErrorAndMsg("系统错误", res.data.message)
      return
    }
    wx.showModal({
      title: title,
      content: res.data.message + "",
      showCancel: false,
    })
  } else {
    wx.showModal({
      title: title,
      content: title,
      showCancel: false,
    })
  }
}

//等待提示框，内容自定义
function showLodaingIng(content) {
  wx.showLoading({
    title: content
  })
}

// 显示Toast
function showToast(title, icon, duration, isMask) {
  var _icon = 'none'
  var _duration = 1500
  var _isMask = false
  if (icon != undefined && icon != "") _icon = icon
  if (duration != undefined && duration != "") _duration = duration
  if (isMask != undefined && isMask != "") _isMask = isMask
  wx.showToast({
    title: title,
    icon: _icon,
    duration: _duration,
    mask: _isMask
  })
}


// 唉 当时太年轻 ， 现在发现 new Date(date).toJSON(); 直接解决问题 , 但是时间为空则是 2000-12-31T16:00:00.000Z，到头来还是需要自己封装下

//将时间转换成标准格式--time有时分，即年月日时分秒，2021-08-02 00:00
// 2021-08-02 00:00 -> 2021-08-02T00:00:00.000+08:00
function setTimeFormat(time) {
  return time.substr(0, 10) + 'T' + time.substr(11, 5) + ":00.000+08:00"
}

// 将日期转换成标准格式 --time无时分，即年月日时分秒，2021-08-02 
// 2021-08-02 -> 2001-01-01T15:59:59.000Z+08:00
function setDateFormat(time) {
  return time.substr(0, 10) + "T15:59:59.000Z" //这里直接处理相差8小时的问题
}

// 已解决时区差8小时问题
// 当前时间 = 包含时差的当前时间 + 时差时间，getTimezoneOffset() 获取时差（以分钟为单位），转为小时需要除以 60
// 解决使用 moment.js 格式化本地时间戳时多出了 8 小时问题，这 8 小时是本地时间与格林威治标准时间 (GMT) 的时差
function getNowDateFormat() {
  var myDate = new Date(); //获取系统当前时间
  myDate.setHours(myDate.getHours() + myDate.getTimezoneOffset() / 60)
  let year = myDate.getFullYear(); //获取完整的年份(4位,1970-????)
  let month = myDate.getMonth() + 1; //获取当前月份(0-11,0代表1月)
  let day = myDate.getDate(); //获取当前日(1-31)
  let hour = myDate.getHours(); //获取当前小时数(0-23)
  let min = myDate.getMinutes(); //获取当前分钟数(0-59)
  month = month < 10 ? '0' + month : month
  day = day < 10 ? '0' + day : day
  hour = hour < 10 ? '0' + hour : hour
  min = min < 10 ? '0' + min : min
  let date = year + '-' + month + '-' + day + 'T' + hour + ':' + min + ':00.000Z'
  console.log(date)
  return date
}

// 时间的截取 
// eg: 2021-08-07T11:48:42.655+08:00  -> 2021-08-07 11:48
function substrTime(time) {
  return time.substring(0, 10) + " " + time.substring(11, 16)
}

//预览文件
function readFile(file_url) {
  showLodaingIng("加载中")
  wx.downloadFile({
    url: getApp().globalData.API_FILE + file_url,
    method: "GET",
    header: {
      'content-type': "application/json; charset=utf-8",
      'token': wx.getStorageSync('token')
    },
    success: function (res) {
      //console.log("请求文件返回 ", res)
      var filePath = res.tempFilePath; // 小程序中文件的临时文件
      wx.openDocument({
        filePath: filePath,
        // 文档打开格式记得写上，否则可能不能打开文档。 文档类型只能是一个
        // 若是想打开多种类型的文档，可以解析文档地址中的文档格式，动态复制到fileTpye参数
        // fileType: 'docx', 
        success: function (res) {
          wx.showToast({
            title: "加载成功",
            duration: 100
          })
          wx.hideLoading()
          //console.log('打开文档成功')
        },
        fail: (res) => {
          wx.hideLoading()
          //console.log("打开失败 ", res)
          wx.showModal({
            title: "打开失败",
            content: res.errMsg,
            showCancel: false
          })
        }
      })
    },
    fail(res) {
      // wx.hideLoading()
      showModalTowErrors("加载失败")
    }
  })
}

//是否纯数字
function isRealNum(val) {
  // isNaN()函数 把空串 空格 以及NUll 按照0来处理 所以先去除，

  if (val === "" || val == null) {
    return false;
  }
  if (!isNaN(val)) {
    //对于空数组和只有一个数值成员的数组或全是数字组成的字符串，isNaN返回false，例如：'123'、[]、[2]、['123'],isNaN返回false,
    //所以如果不需要val包含这些特殊情况，则这个判断改写为if(!isNaN(val) && typeof val === 'number' )
    return true;
  } else {
    return false;
  }
}

//预览单个图片
function previewImg_single(url, showContent) {
  if (showContent == undefined) {
    showContent = '图片未上传'
  }
  let urls = []
  if (url == getApp().globalData.url_file) {
    wx.showToast({
      icon: 'error',
      title: showContent
    })
  } else {
    urls[0] = url
    wx.previewImage({
      current: url,
      urls: urls
    })
  }
}

// 判断用户机型是否全面屏
const isFullScreen = () => {
  return new Promise((resolve, reject) => {
    wx.getSystemInfo({
      success: function (res) {
        if (res.screenHeight - res.safeArea.height > 40) {
          console.log("是全面屏")
          resolve(true)
        } else {
          resolve(false)
        }
      }
    })
  })
}

// 选择文件
const chooseFile = (amount) => {
  return new Promise((resolve, reject) => {
    wx.chooseMessageFile({
      count: amount,
      type: 'file',
      success(res) {
        resolve(res.tempFiles)
      },
      fail() {
        console.log("退出选择文件")
      }

    })
  })
}

const getUserInfo = () => {
  return new Promise((resolve, reject) => {
    console.log('user_api', user_api, api)
    wx.login({
      success: res => {
        if (res.code) {
          user_api.login({
            "code": res.code
          }).then(e => {
            e.user.username = e.user.username === "" ? "💻" : e.user.username
            e.user.avatar = e.user.avatar === "" ? "/images/mine/avatar.png" : getApp().globalData.API_FILE + e.user.avatar
            wx.setStorageSync('user', e.user)
            wx.setStorageSync('token', e.data.token)
            let setting = {
              is_click_heavy: e.user.is_click_heavy,
              is_click_sound: e.user.is_click_sound,
            }
            getApp().globalData.user = e.user
            getApp().globalData.setting = setting
            resolve(e)
          })
        } else {
          console.log('登录失败！' + res.errMsg)
          reject(res)
        }
      },
      fail: res => {
        util.showModalErrorAndMsg("错误", "网络超时")
        reject(res)
      }
    })
  })
}


const touchFeedback = (setting) => {
  if (setting.is_click_sound) {
    playAudio()
  }
  if (setting.is_click_heavy) {
    wx.vibrateShort({
      type: "medium"
    })
  }
}


function playAudio() {
  const innerAudioContext = wx.createInnerAudioContext(true)
  innerAudioContext.autoplay = true // 是否自动开始播放，默认为 false
  innerAudioContext.src = '/resource/finished.mp3'; // 音频资源的地址
  wx.setInnerAudioOption({ // ios在静音状态下能够正常播放音效
    obeyMuteSwitch: true,   // 是否遵循系统静音开关，默认为 true。当此参数为 false 时，即使用户打开了静音开关，也能继续发出声音。
    speakerOn:true
  })
}


module.exports = {
  formatTime,
  showModalTowErrors,
  showModalErrorAndMsg,
  showLodaingIng,
  setTimeFormat,
  setDateFormat,
  readFile,
  isRealNum, //是否纯数字
  substrTime,
  previewImg_single, //预览单个图片
  isFullScreen,
  chooseFile,
  showToast,
  getNowDateFormat,
  getUserInfo,
  touchFeedback, // 完成操作反馈
}
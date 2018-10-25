/**
 * Create by Capricorncd 2017
 */

// 同域资源实现视频截图，可上传的图片数据格式
// 非同域资源实现canvas截图预览

// 提示码
const CODES = {
	0: 'success',
	1: 'The url is not valid',
	2: 'onerror'
}

/**
 * constructor
 * @param opts.url 音频|视频URL
 * @param opts.type 'audio|video'
 * @param opts.callback 回调函数
 */

function loadMedia(opts) {
	this.callback = opts.callback ||
	function(res) {
		console.log(res);
	}
	// 初始化
	this.init(opts);
}

// prototype
loadMedia.prototype = {
	/**
	 * 初始化media
	 * @param url
	 */
	init: function(opts) {
		let self = this;

		if (!opts.url || typeof opts.url !== 'string') {
			this.callback({
				code: 1,
				msg: CODES[1]
			});
			return;
		}

		// 创建media
		let mediaType = opts.type === 'audio' ? 'audio' : 'video';
		this.media = document.createElement(mediaType);
		console.log('this.media', this.media);
		// loaded
		this.listener('canplaythrough', function(e) {
			// 截图
			if (mediaType === 'video') {
				self.screenshot();
			} else {
				self.callback({
					code: 0,
					msg: CODES[0],
					thumb: null,
					media: this.media,
					canvas: null
				});
			}
		});
		// error
		this.listener('error', function(e) {
			self.callback({
				code: 2,
				msg: CODES[2],
				data: e
			});
		})
		this.media.setAttribute('src', opts.url);
	},

	screenshot: function() {
		// create canvas
		let canvas = document.createElement('canvas');
		canvas.width = this.media.videoWidth;
		canvas.height = this.media.videoHeight;
		let ctx = canvas.getContext('2d');
		// 截取
		ctx.drawImage(this.media, 0, 0);

		let thumb = null;
		// 非跨域资源
		// !!非同域资源无法获取数据
		try {
			let type = 'image/png';
			let data = canvas.toDataURL(type);
			thumb = this.toBlobData(data, type);
		} catch (e) {
			console.log(e)
		}

		this.callback({
			code: 0,
			msg: CODES[0],
			thumb: thumb,
			media: this.media,
			canvas: canvas
		})
	},

	// 数据转换
	toBlobData: function(data, type) {
		// 获取base64数据
		// base64数据格式:
		// "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAAkGB+wgHBgkIBwgKCgkLDRYPDQw//9k="
		data = window.atob(data.split(',')[1]);

		let ia = new Uint8Array(data.length);
		for (let i = 0; i < data.length; i++) {
			ia[i] = data.charCodeAt(i);
		};
		// canvas.toDataURL 返回的默认格式是 image/png
		return new Blob([ia], {
			type: type
		});
	},

	/**
	 * addEventListener 事件监听
	 * @param en EventName
	 * @param callback
	 */
	listener: function(en, callback) {
		this.media.addEventListener(en, function(e) {
			if (callback) {
				callback(e);
			} else {
				console.warn(this);
			}
		}, false);
	}

	/**
	 * 资源是否跨域
	 * @param url 资源地址
	 * @returns {boolean}
	 */
	// isCrossDomain: function (url) {
	//   let loc, host, protocol;
	//   loc = window.location;
	//   host = loc.host;
	//   protocol = loc.protocol;
	//   // 是否为http链接
	//   if (/(http|https):\/\//.test(url)) {
	//     if (url.indexOf(protocol + '//' + host) >= 0) {
	//       return false;
	//     } else {
	//       return true;
	//     }
	//   }
	//   // './xxx.mp4' '/xxx.mp4' 'xxx.mp4'
	//   return false;
	// }
}




let loadVideo = new loadMedia({
	type: 'video',
	url: 'http://www.w3school.com.cn/i/movie.ogg',
	callback: handleCallback
})

function handleCallback(res) {
	console.log(res)
	// canplaythrough
	if (res.code === 0) {

	}

	// error
	if (res.code === 2) {

	}
}
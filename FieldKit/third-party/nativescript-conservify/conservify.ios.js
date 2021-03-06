"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var conservify_common_1 = require("./conservify.common");
var NetworkingProto = global.Networking;
var ServiceDiscoveryProto = global.ServiceDiscovery;
var WebProto = global.Web;
var NetworkingListenerProto = global.NetworkingListener;
var WebTransferListenerProto = global.WebTransferListener;
var ServiceInfoProto = global.ServiceInfo;
var WebTransferProto = global.WebTransfer;
var WifiNetworkProto = global.WifiNetwork;
var WifiManagerProto = global.WifiManager;
var debug = console.log;
var MyNetworkingListener = (function (_super) {
    __extends(MyNetworkingListener, _super);
    function MyNetworkingListener() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    MyNetworkingListener.alloc = function () {
        return _super.new.call(this);
    };
    MyNetworkingListener.prototype.initWithPromises = function (promises) {
        this.promises = promises;
        return this;
    };
    MyNetworkingListener.prototype.onStarted = function () {
        debug("onStarted");
        this.promises.getStartedPromise().resolve();
    };
    MyNetworkingListener.prototype.onDiscoveryFailed = function () {
        debug("onDiscoveryFailed");
        this.promises.getStartedPromise().reject();
    };
    MyNetworkingListener.prototype.onFoundServiceWithService = function (service) {
        debug("onFoundServiceWithService", service.type, service.name, service.host, service.port);
        this.promises.getDiscoveryEvents().onFoundService({
            name: service.name,
            type: service.type,
            host: service.host,
            port: service.port,
        });
    };
    MyNetworkingListener.prototype.onLostServiceWithService = function (service) {
        debug("onLostServiceWithService", service.type, service.name);
        this.promises.getDiscoveryEvents().onLostService({
            name: service.name,
            type: service.type,
            host: service.host,
            port: service.port,
        });
    };
    MyNetworkingListener.prototype.onNetworkStatusWithStatus = function (status) {
        this.promises.getNetworkStatusPromise().resolve(status);
    };
    MyNetworkingListener.ObjCProtocols = [NetworkingListener];
    return MyNetworkingListener;
}(NSObject));
function toJsHeaders(headers) {
    var jsHeaders = {};
    for (var i = 0; i < headers.allKeys.count; ++i) {
        var key = headers.allKeys[i];
        jsHeaders[key.toLowerCase()] = headers.valueForKey(key);
    }
    return jsHeaders;
}
var UploadListener = (function (_super) {
    __extends(UploadListener, _super);
    function UploadListener() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    UploadListener.alloc = function () {
        return _super.new.call(this);
    };
    UploadListener.prototype.initWithTasks = function (tasks) {
        this.tasks = tasks;
        return this;
    };
    UploadListener.prototype.onProgressWithTaskIdHeadersBytesTotal = function (taskId, headers, bytes, total) {
        debug("upload:onProgress", taskId, bytes, total);
        var info = this.tasks.getTask(taskId).info;
        var progress = info.progress;
        if (progress) {
            progress(bytes, total, info);
        }
    };
    UploadListener.prototype.onCompleteWithTaskIdHeadersContentTypeBodyStatusCode = function (taskId, headers, contentType, body, statusCode) {
        var jsHeaders = toJsHeaders(headers);
        debug("upload:onComplete", taskId, jsHeaders, contentType, statusCode);
        var task = this.tasks.getTask(taskId);
        var info = task.info;
        this.tasks.removeTask(taskId);
        function getBody() {
            if (body) {
                if (contentType.indexOf("application/json") >= 0) {
                    return JSON.parse(body);
                }
                else {
                    if (transfer.base64EncodeResponseBody) {
                        return Buffer.from(body, "base64");
                    }
                    return body;
                }
            }
            return null;
        }
        task.resolve({
            info: info,
            headers: jsHeaders,
            statusCode: statusCode,
            body: getBody(),
        });
    };
    UploadListener.prototype.onErrorWithTaskIdMessage = function (taskId, message) {
        debug("upload:onError", taskId);
        var task = this.tasks.getTask(taskId);
        var info = task.info;
        this.tasks.removeTask(taskId, message);
        task.reject({
            info: info,
            message: message,
        });
    };
    UploadListener.ObjCProtocols = [WebTransferListener];
    return UploadListener;
}(NSObject));
var DownloadListener = (function (_super) {
    __extends(DownloadListener, _super);
    function DownloadListener() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    DownloadListener.alloc = function () {
        return _super.new.call(this);
    };
    DownloadListener.prototype.initWithTasks = function (tasks) {
        this.tasks = tasks;
        return this;
    };
    DownloadListener.prototype.onProgressWithTaskIdHeadersBytesTotal = function (taskId, headers, bytes, total) {
        debug("download:onProgress", taskId, bytes, total);
        var info = this.tasks.getTask(taskId).info;
        var progress = info.progress;
        if (progress) {
            progress(bytes, total);
        }
    };
    DownloadListener.prototype.onCompleteWithTaskIdHeadersContentTypeBodyStatusCode = function (taskId, headers, contentType, body, statusCode) {
        var jsHeaders = toJsHeaders(headers);
        debug("download:onComplete", taskId, jsHeaders, contentType, statusCode);
        var task = this.tasks.getTask(taskId);
        var info = task.info, transfer = task.transfer;
        this.tasks.removeTask(taskId);
        function getBody() {
            if (body) {
                if (contentType.indexOf("application/json") >= 0) {
                    return JSON.parse(body);
                }
                else {
                    if (transfer.base64EncodeResponseBody) {
                        return Buffer.from(body, "base64");
                    }
                    return body;
                }
            }
            return null;
        }
        task.resolve({
            info: info,
            headers: jsHeaders,
            statusCode: statusCode,
            body: getBody(),
        });
    };
    DownloadListener.prototype.onErrorWithTaskIdMessage = function (taskId, message) {
        debug("download:onError", taskId, message);
        var task = this.tasks.getTask(taskId);
        var info = task.info;
        this.tasks.removeTask(taskId);
        task.reject({
            info: info,
            message: message,
        });
    };
    DownloadListener.ObjCProtocols = [WebTransferListener];
    return DownloadListener;
}(NSObject));
var Conservify = (function (_super) {
    __extends(Conservify, _super);
    function Conservify(discoveryEvents) {
        var _this = _super.call(this) || this;
        _this.active = {};
        _this.scan = null;
        _this.started = null;
        _this.discoveryEvents = discoveryEvents;
        return _this;
    }
    Conservify.prototype.getTask = function (id) {
        return this.active[id];
    };
    Conservify.prototype.removeTask = function (id) {
        delete this.active[id];
    };
    Conservify.prototype.start = function (serviceType) {
        var _this = this;
        this.networkingListener = MyNetworkingListener.alloc().initWithPromises(this);
        this.uploadListener = UploadListener.alloc().initWithTasks(this);
        this.downloadListener = DownloadListener.alloc().initWithTasks(this);
        this.networking = Networking.alloc().initWithNetworkingListenerUploadListenerDownloadListener(this.networkingListener, this.uploadListener, this.downloadListener);
        return new Promise(function (resolve, reject) {
            debug("initialize, ok");
            _this.started = {
                resolve: resolve,
                reject: reject
            };
            _this.networking.serviceDiscovery.startWithServiceType(serviceType);
            debug("starting...");
        });
    };
    Conservify.prototype.json = function (info) {
        var _this = this;
        var transfer = WebTransfer.alloc().init();
        transfer.method = info.method;
        transfer.url = info.url;
        for (var _i = 0, _a = Object.entries(info.headers || {}); _i < _a.length; _i++) {
            var _b = _a[_i], key = _b[0], value = _b[1];
            transfer.headerWithKeyValue(key, value);
        }
        return new Promise(function (resolve, reject) {
            _this.active[transfer.id] = {
                info: info,
                transfer: transfer,
                resolve: resolve,
                reject: reject,
            };
            _this.networking.web.simpleWithInfo(transfer);
        });
    };
    Conservify.prototype.text = function (info) {
        var _this = this;
        var transfer = WebTransfer.alloc().init();
        transfer.method = info.method;
        transfer.url = info.url;
        transfer.body = info.body;
        for (var _i = 0, _a = Object.entries(info.headers || {}); _i < _a.length; _i++) {
            var _b = _a[_i], key = _b[0], value = _b[1];
            transfer.headerWithKeyValue(key, value);
        }
        if (info.body) {
            var requestBody = Buffer.from(info.body).toString("base64");
            transfer.body = requestBody;
        }
        return new Promise(function (resolve, reject) {
            _this.active[transfer.id] = {
                info: info,
                transfer: transfer,
                resolve: resolve,
                reject: reject,
            };
            _this.networking.web.simpleWithInfo(transfer);
        });
    };
    Conservify.prototype.protobuf = function (info) {
        var _this = this;
        var transfer = WebTransfer.alloc().init();
        transfer.method = info.method;
        transfer.url = info.url;
        transfer.base64EncodeResponseBody = true;
        for (var _i = 0, _a = Object.entries(info.headers || {}); _i < _a.length; _i++) {
            var _b = _a[_i], key = _b[0], value = _b[1];
            transfer.headerWithKeyValue(key, value);
        }
        if (info.body) {
            var requestBody = Buffer.from(info.body).toString("base64");
            transfer.body = requestBody;
            transfer.base64DecodeRequestBody = true;
        }
        return new Promise(function (resolve, reject) {
            _this.active[transfer.id] = {
                info: info,
                transfer: transfer,
                resolve: resolve,
                reject: reject,
            };
            _this.networking.web.simpleWithInfo(transfer);
        });
    };
    Conservify.prototype.download = function (info) {
        var _this = this;
        var transfer = WebTransfer.alloc().init();
        transfer.method = info.method;
        transfer.url = info.url;
        transfer.path = info.path;
        for (var _i = 0, _a = Object.entries(info.headers || {}); _i < _a.length; _i++) {
            var _b = _a[_i], key = _b[0], value = _b[1];
            transfer.headerWithKeyValue(key, value);
        }
        return new Promise(function (resolve, reject) {
            _this.active[transfer.id] = {
                info: info,
                transfer: transfer,
                resolve: resolve,
                reject: reject,
            };
            _this.networking.web.downloadWithInfo(transfer);
        });
    };
    Conservify.prototype.upload = function (info) {
        var _this = this;
        var transfer = WebTransfer.alloc().init();
        transfer.method = info.method;
        transfer.url = info.url;
        transfer.path = info.path;
        for (var _i = 0, _a = Object.entries(info.headers || {}); _i < _a.length; _i++) {
            var _b = _a[_i], key = _b[0], value = _b[1];
            transfer.headerWithKeyValue(key, value);
        }
        return new Promise(function (resolve, reject) {
            _this.active[transfer.id] = {
                info: info,
                transfer: transfer,
                resolve: resolve,
                reject: reject,
            };
            _this.networking.web.uploadWithInfo(transfer);
        });
    };
    Conservify.prototype.getDiscoveryEvents = function () {
        return this.discoveryEvents;
    };
    Conservify.prototype.getStartedPromise = function () {
        return this.started;
    };
    Conservify.prototype.getNetworkStatusPromise = function () {
        return this.networkStatus;
    };
    Conservify.prototype.findConnectedNetwork = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.networkStatus = {
                resolve: resolve,
                reject: reject
            };
            _this.networking.wifi.findConnectedNetwork();
        });
    };
    Conservify.prototype.scanNetworks = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.networkStatus = {
                resolve: resolve,
                reject: reject
            };
            _this.networking.wifi.scan();
        });
    };
    return Conservify;
}(conservify_common_1.Common));
exports.Conservify = Conservify;
//# sourceMappingURL=conservify.ios.js.map
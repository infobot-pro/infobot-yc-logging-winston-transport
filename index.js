const Index = require('winston-transport');
const {struct} = require('pb-util');
const LoggerAPI = require("infobot-yc-logging-api");
const {MESSAGE} = require('triple-beam');

module.exports = class CustomTransport extends Index {
    constructor(opts) {
        super(opts);

        this.loggerGroupID = opts.ycLoggerGroupID;
        this.YCLogger = new LoggerAPI(opts.ycLoggerServiceAccountID, opts.ycLoggerKeyID, opts.ycLoggerPrivateKey);
    }

    async log(info, callback) {
        setImmediate(() => {
            this.emit('logged', info);
        });

        if (!this._session) {
            this._session = await this.YCLogger.getLoggerSession();
        }

        let meta = {};

        if (info[MESSAGE]) {
            meta = JSON.parse(info[MESSAGE]);
        }

        let level = info.level.toUpperCase();

        switch (info.level) {
            case('verbose'):
            case('http'):
            case('silly'):
                level = 'TRACE';
                break;
        }

        this._session.write({
            destination: {
                log_group_id: this.loggerGroupID
            },
            resource: {
                type: meta.serviceID ? meta.serviceID : ''
            },
            entries: [
                {
                    timestamp: {seconds: Date.parse(info.timestamp) / 1000, nanos: 0},
                    level: level,
                    message: info.message,
                    json_payload: struct.encode(meta)
                }
            ]
        });

        callback();
    }
};
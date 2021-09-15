const Index = require('winston-transport');
const {struct} = require('pb-util');
const LoggerAPI = require("infobot-yc-logging");
const {SPLAT} = require('triple-beam');

module.exports = class CustomTransport extends Index {
    constructor(opts) {
        super(opts);

        this.loggerGroupID = opts.ycLoggerGroupID;
        this.YCLogger = new LoggerAPI(opts.ycLoggerKeyID, opts.ycLoggerKey, opts.ycLoggerGroupID, opts.ycLoggerPrivateKey);
    }

    async log(info, callback) {
        setImmediate(() => {
            this.emit('logged', info);
        });

        if (!this._session) {
            this._session = await this.YCLogger.getLoggerSession();
        }

        let meta = {};

        if (info[SPLAT]) {
            meta = info[SPLAT][0];
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
                    level: info.level.toUpperCase(),
                    message: info.message,
                    json_payload: struct.encode(meta)
                }
            ]
        });

        callback();
    }
};
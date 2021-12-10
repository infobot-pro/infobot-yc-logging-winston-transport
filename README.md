# infobot-yc-logging-winston-transport
Транспорт в сервис [Yandex Cloud Logging](https://cloud.yandex.ru/docs/logging/) для библиотеки [Winston](https://github.com/winstonjs/winston).

Установите пакет через npm:

```sh
npm i infobot-yc-logging-winston-transport
```

## Пример использования
Для работы с Yandex Cloud Logging потребуются следующие данные:
* ID сервисного аккаунта
* Приватный ключ сервисного аккаунта в формате PEM
* ID ключа сервисного аккаунта
* ID группы логирования

Информацию о получении данных сервисных аккаунтов вы найдёте в [документации](https://cloud.yandex.ru/docs/iam/operations/sa/create).

```js
const winston = require('winston');
const ycTransport = require('infobot-yc-logging-winston-transport');

const logger = winston.createLogger({
    level: 'silly',
    levels: winston.config.npm.levels,
    format: winston.format.combine(
        winston.format.timestamp({
            format: 'YYYY-MM-DD HH:mm:ss',
        }),
        winston.format.errors({stack: true}),
        winston.format.splat(),
        winston.format.json()
    ),
    transports: [
        new ycTransport({
            ycLoggerServiceAccountID: ID_СЕРВИСНОГО_АККАУНТА,
            ycLoggerKeyID: ID_КЛЮЧА_СЕРВИСНОГО_АККАУНТА,            
            ycLoggerPrivateKey: fs.readFileSync('ПУТЬ_К_ПРИВАТНОМУ_КЛЮЧУ'),
            ycLoggerGroupID: ID_ГРУППЫ_ЛОГИРОВАНИЯ
        })
    ]
});

```
Отправка записи:
```js
 logger.silly('test message', {sessionID: 12345, serviceID: 'test-app'});
```

В meta-объекте можно передать строку в поле serviceID, которая будет использована в Yandex Cloud Logging как название ресурса.

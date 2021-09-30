const pg = require('pg');

class PostgreSQL {
    constructor(client) {
        this.client = new pg.Client({
            host: process.env['SQL_HOST'],
            database: process.env['SQL_DB'],
            user: process.env['SQL_USER'],
            password: process.env['SQL_PWD'],
            ssl: {
                rejectUnauthorized: false
            },
        })
        this.bot = client;

        this.conn();

        this.client.on('error', (err) => {
            client.logger.log('PostgreSQL connection error.\n\t' + err, 'ERROR');
        });

        this.client.on('end', () => {
            client.logger.log('PostgreSQL disconnected.', 'WARN');
            this.conn();
        });
    }

    async conn() {
        this.client.connect()
            .then(() => this.bot.logger.log('PostgreSQL database connected.', 'READY'))
            .catch((err) => this.bot.logger.log('PostgreSQL connect error, ' + err, 'ERROR'));
    }
}

module.exports = PostgreSQL;
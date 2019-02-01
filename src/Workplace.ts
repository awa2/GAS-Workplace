export class Workplace {
    public static API_URL = 'https://graph.facebook.com';
    public static TOKEN: string;
    public static setToken(token: string) {
        Workplace.TOKEN = token;
    }
    public static createBot() {
        return new Workplace.Bot(Workplace.TOKEN);
    }

    public static Bot = class {
        public token: string;
        constructor(token: string) {
            this.token = token;
            return this;
        }
        public post(group_id: string, message: string, link?: string) {
            const payload = {
                formatting: 'MARKDOWN',
                message: message,
                link: link ? link : ''
            }
            const res = JSON.parse(UrlFetchApp.fetch(`${Workplace.API_URL}/${group_id}/feed`, {
                method: 'post',
                payload: payload,
                headers: {
                    'Authorization': `Bearer ${this.token}`
                },
                muteHttpExceptions: false
            }).getContentText());
            return new Post(res.id as string, message, this.token);
        }

        public chat(thread_key: string, message: string) {
            const payload = {
                message_type: "MESSAGE_TAG",
                recipient: {
                    thread_key: thread_key
                },
                message: {
                    text: message
                }
            }
            const res = JSON.parse(UrlFetchApp.fetch(`${Workplace.API_URL}/v2.6/me/messages`, {
                method: 'post',
                payload: JSON.stringify(payload),
                contentType: 'application/json; charset=utf-8',
                headers: {
                    'Authorization': `Bearer ${this.token}`
                },
                muteHttpExceptions: false
            }).getContentText());
            return res;
        }
    }
}

export class Post {
    public id: string;
    public message: string;
    private token: string;
    constructor(id: string, message: string, token: string) {
        this.id = id;
        this.message = message;
        this.token = token;
        return this;
    }
    public update(message: string, link?: string) {
        const payload = {
            formatting: 'MARKDOWN',
            message: message,
            link: link ? link : ''
        }
        this.send(this.id, payload);

    }
    private send(endpoint: string, payload: Object) {
        const res = JSON.parse(UrlFetchApp.fetch(`${Workplace.API_URL}/${endpoint}`, {
            method: 'post',
            payload: payload,
            headers: {
                'Authorization': `Bearer ${this.token}`
            },
            muteHttpExceptions: false
        }).getContentText());
        return res;
    }
}
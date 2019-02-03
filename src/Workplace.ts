export class Workplace {
    public static API_URL = 'https://graph.facebook.com';
    public static TOKEN: string;
    public static setToken(token: string) {
        Workplace.TOKEN = token;
    }
    public static createBot() {
        return new Workplace.Bot(Workplace.TOKEN);
    }

    public static Bot = class Bot {
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
            return this.send(`${group_id}/feed`, payload);
        }

        public chat(thread_key: string, _message: string | ChatTemplate) {
            let message;
            if (typeof _message === 'string') {
                message = { text: _message };
            } else {
                message = { attachment: _message }
            }
            const payload = {
                message_type: "MESSAGE_TAG",
                recipient: {
                    thread_key: thread_key
                },
                message: message
            }
            return this.send('v2.6/me/messages', payload);
        }
        public get_thread_key(emails: string[]){
            // Require read_all_contents or managed_user
            const ids = emails.map(email => {
                const res = JSON.parse(UrlFetchApp.fetch(`${Workplace.API_URL}/${email}`,{
                    method: 'get',
                    headers: {
                        'Authorization': `Bearer ${this.token}`
                    },
                    muteHttpExceptions: false
                }).getContentText());
                Logger.log(res);
            });
        }
        private send(endpoint: string, payload: Object) {
            const res = JSON.parse(UrlFetchApp.fetch(`${Workplace.API_URL}/${endpoint}`, {
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

export type ChatMessage = {
    text?: string,
    attachement?: ChatTemplate
}
export type ChatTemplate = {
    type: 'template',
    payload: {
        template_type: 'button' | 'generic' | 'list',
        sharable?: boolean,
        image_aspect_ratio?: 'horizontal' | 'square',
        top_element_style?: 'compact' | 'large'
        elements?: ChatElement[],
        buttons: ChatButton[]
        text?: string,
    }
}
export type ChatButton = {
    type: 'web_url' | 'postback',
    title: string,
    url?: string,
    payload?: Object,
    messenger_extensions?: true,
    webview_height_ratio?: 'compact' | 'tall' | 'full',
    fallback_url? : string
}
export type ChatElement = {
    title: string,
    subtitle?: string,
    image_url?: string,
    default_action?: {
        type: 'web_url',
        url: string,
        messenger_extensions: boolean,
        webview_height_ratio: string,
        fallback_url?: string
    },
    buttons?: ChatButton[]
}
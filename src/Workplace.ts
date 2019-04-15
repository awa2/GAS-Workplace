export namespace Workplace {
    const API_URL = 'https://graph.facebook.com';
    let TOKEN: string;
    export function setToken(token: string) {
        TOKEN = token;
    }
    export function createBot() {
        return new Workplace.Bot(TOKEN);
    }

    export class Bot {
        public token: string;
        constructor(token: string) {
            this.token = token;
            return this;
        }
        public get_feeds(group_id: string) {
            const res = this.query(`${group_id}/feed`, 'get');
            return (res.data as Array<any>).map(d => {
                const post: IPost = {
                    id: d.id,
                    message: d.message,
                    updated_time: new Date(d.updated_time)
                }
                return new Post(d);
            });
        }
        public get_post(group_id: string, post_id: string) {
            const res = this.query(`${group_id}_${post_id}`, 'get');
            const post: IPost = {
                id: res.id,
                message: res.message,
                updated_time: new Date(res.updated_time)
            }
            return new Post(post);
        }
        public post(group_id: string, message: string, link?: string) {
            const payload = {
                formatting: 'MARKDOWN',
                message: message,
                link: link ? link : ''
            }
            return this.query(`${group_id}/feed`, 'post', payload);
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
            return this.query('v2.6/me/messages', 'post', payload);
        }
        public get_thread_key(emails: string[]) {
            // Require read_all_contents or managed_user
            const ids = emails.map(email => {
                const res = JSON.parse(UrlFetchApp.fetch(`${API_URL}/${email}`, {
                    method: 'get',
                    headers: {
                        'Authorization': `Bearer ${this.token}`
                    },
                    muteHttpExceptions: false
                }).getContentText());
            });
            return ids;
        }

        private query(endpoint: string, method: 'get' | 'post', payload?: Object) {
            const res = JSON.parse(UrlFetchApp.fetch(`${API_URL}/${endpoint}`, {
                method: method,
                payload: payload ? JSON.stringify(payload) : undefined,
                contentType: 'application/json; charset=utf-8',
                headers: {
                    'Authorization': `Bearer ${this.token}`
                },
                muteHttpExceptions: false
            }).getContentText());
            return res;
        }
    }

    export interface IPost {
        id: string;
        updated_time: Date;
        message: string;
    }
    export class Post implements IPost {
        public id: string;
        public message: string;
        public created_time: Date;
        public updated_time: Date;
        private token: string;
        constructor(post: IPost, token?: string) {
            this.id = post.id;
            this.message = post.message;
            this.updated_time = post.updated_time;
            this.token = token ? token : TOKEN;
            const req = this.query(this.id, 'get');
            this.created_time = new Date(req.created_time);
            return this;
        }
        public update(message: string, link?: string) {
            const payload = {
                formatting: 'MARKDOWN',
                message: message,
                link: link ? link : ''
            }
            const res = this.query(this.id, 'post', payload);
            return res;
        }
        private query(endpoint: string, method: 'get' | 'post', payload?: Object) {
            const res = JSON.parse(UrlFetchApp.fetch(`${API_URL}/${endpoint}`, {
                method: method,
                payload: payload ? JSON.stringify(payload) : undefined,
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
    fallback_url?: string
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
export enum WhoEnum {
    me = 'me',
    bot = 'bot',
}

export interface MessageModel {
    message: string;
    who: WhoEnum;
}

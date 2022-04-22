import NotificationMessages from "./NotificationMessages";

export default interface INotificationService {
    sendMessage(receiver: string, messageId: NotificationMessages, ...params: string[]): Promise<void>;
    sendPicture(receiver: string, messageId: NotificationMessages, 
        imageUrl: URL, ...params: string[]): Promise<void>;
}
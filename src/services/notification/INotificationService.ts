import NotificationMessages from "./NotificationMessages";

export default interface INotificationService {
    sendMessage(receiver: string, messageId: NotificationMessages, ...params: string[]): Promise<void>;
}
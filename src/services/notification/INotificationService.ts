import NotificationMessages from "./NotificationMessages";

export default interface INotificationService {
    /**
     * send a custom message as-is (formatted with params) to `receiver`.
     * @param receiver 
     * @param message 
     * @param params 
     */
    sendCustomMessage(receiver: any, message: string, ...params: string[]): Promise<void>;

    /**
     * send a message to `receiver` using the text of `messageId` formatted with the optional params
     * @param receiver 
     * @param messageId 
     * @param params 
     */
    sendMessage(receiver: any, messageId: NotificationMessages, ...params: string[]): Promise<void>;
    
    /**
     * send a picture to `receiver`, the caption of the picture contains the text 
     * of `messageId` formatted with the optional params
     * @param receiver 
     * @param messageId 
     * @param imageUrl 
     * @param params 
     */
    sendPicture(receiver: any, messageId: NotificationMessages, 
        imageUrl: URL, ...params: string[]): Promise<void>;
}
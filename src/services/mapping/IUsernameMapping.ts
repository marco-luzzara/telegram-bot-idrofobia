export default interface IUsernameMapping {
    /**
     * get the telegram chatId starting from a username
     * @param username 
     */
    getChatIdFromUsername(username: string): Promise<number>;

    /**
     * store the mapping of a username with the associated chatId
     * @param username 
     * @param chatId 
     */
    storeChatId(username: string, chatId: number): Promise<void>;
}
// actions/services/messageBoardService.ts


import {MessageBoard, UserRole} from "@/types/models";
import storageService from "@/actions/services/storageService";

const _KEY = "messages_board_";
const messageBaseApi = 'http://localhost:8080/api/messages';

export const messageBoardService = {
    getAll(): MessageBoard[] {
        const roles: UserRole[] = ["AIRLINE", "GATE", "GROUND"];
        // Fetch all messages for each role and combine
        return roles.flatMap(role => this.get(role));
    },

    getAllWithRole(): (MessageBoard & { role: UserRole })[] {
        const roles: UserRole[] = ["AIRLINE", "GATE", "GROUND"];
        return roles.flatMap(role =>
            this.get(role).map(msg => ({...msg, role}))
        );
    },

    // get Role Specific message
    get(role: UserRole): MessageBoard[] {
        return storageService.get<MessageBoard[]>(`${_KEY}${role}`, []);
    },

    post({serverId, role, msg}: {
        serverId?: string,
        role: UserRole,
        msg: Omit<MessageBoard, "id" | "isRead" | "timestamp">
    }): MessageBoard {

        const messages = this.get(role);
        const {to, fromRole, message, airline} = msg;
        const id = serverId ?? Math.floor(Date.now() / 1000);

        const newMessage: MessageBoard = {
            id: id.toString(),
            message,
            to,
            fromRole,
            airline,
            isRead: false,
            timestamp: new Date().toISOString()
        };

        messages.push(newMessage);
        storageService.set(`${_KEY}${role}`, messages);

        return newMessage;
    },

    // Mark as read / unread
    updateReadStatus(
        {role, id, isRead}: { role: UserRole; id: string; isRead: boolean }
    ): MessageBoard {

        const messages = this.get(role);
        const msg = messages.find(m => m.id === id);

        if (!msg) throw new Error("Unable to read message");

        msg.isRead = isRead;
        storageService.set(`${_KEY}${role}`, messages);

        return msg;
    },

    remove({role, id}: { role: UserRole, id: string }) {
        storageService.set(
            `${_KEY}${role}`,
            this.get(role).filter(u => u.id !== id)
        );
    },

    /// Remote API Calls:
    async postRemote({
                         role,
                         msg
                     }: {
        role: UserRole,
        msg: Omit<MessageBoard, "id" | "isRead" | "timestamp">
    }): Promise<MessageBoard> {

        const response = await fetch(messageBaseApi + "/send", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({...msg, isRead: false})
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err?.message ?? "Failed to post message");
        }

        return await response.json();
    },

    async updateReadStatusRemote({
                                     id,
                                     isRead
                                 }: {
        id: string;
        isRead: boolean;
    }): Promise<MessageBoard> {
        console.log('mes-sage', typeof id);
        const response = await fetch(messageBaseApi + `/read-status`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                id: id,
                isRead: isRead
            })
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err?.message ?? "Failed to update message status");
        }

        return await response.json();
    },

    async removeRemote(id: string): Promise<void> {
        console.log(`message-id = ${id}`, typeof id);

        const response = await fetch(messageBaseApi + "/" + id, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json"
            },
            // body: JSON.stringify({ message: id })
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err?.message ?? "Failed to delete message");
        }
    }
};

/* UI usage example::
try {
  messageBoardService.post(
    "GATE",
    "All passengers boarded",
    `${user.firstName} ${user.lastName}`
  );
  toast.success("Message posted");
} catch (e) {
  toast.error(e.message);
}
*/


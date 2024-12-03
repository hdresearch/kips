type Row = {
    id: number;
    createdAt: string;
    updatedAt: string;
}

export type Auth = Row & {
    username: string;
    password: string;
    url: string;
    notes: string;
}

export type Task = Row & {
    objective: string;
    progressAssessment: string;
    completed: boolean;
}

export type Note = Row & {
    content: string;
}

export type Conversation = Row & {
    content: string;
}

export type Tag = Row & {
    name: string;
}

export type NoteTag = Row & {
    noteId: number;
    tagId: number;
}

export type TaskTag = Row & {
    taskId: number;
    tagId: number;
}

export type ConversationTag = Row & {
    conversationId: number;
    tagId: number;
}
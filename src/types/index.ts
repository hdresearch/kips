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

// join tables
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

// inserts
export type NoteInsert = Omit<Note, 'id' | 'createdAt' | 'updatedAt'>;
export type TaskInsert = Omit<Task, 'id' | 'createdAt' | 'updatedAt'>;
export type AuthInsert = Omit<Auth, 'id' | 'createdAt' | 'updatedAt'>;
export type ConversationInsert = Omit<Conversation, 'id' | 'createdAt' | 'updatedAt'>;
export type TagInsert = Omit<Tag, 'id' | 'createdAt' | 'updatedAt'>;
export type NoteTagInsert = Omit<NoteTag, 'id' | 'createdAt' | 'updatedAt'>;
export type TaskTagInsert = Omit<TaskTag, 'id' | 'createdAt' | 'updatedAt'>;
export type ConversationTagInsert = Omit<ConversationTag, 'id' | 'createdAt' | 'updatedAt'>;
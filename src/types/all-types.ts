import { Tag, Task, User, Epic, Sprint, Team, Attachment } from "@prisma/client";

export interface TasksWithUsersAndTags extends Task {
    creator: User;
    assignee?: User | null;
    tags: Tag[];
    epic?: Epic | null;
    sprint?: Sprint | null;
    team: Team;
    _count?: {
        comments?: number;
        attachments?: number;
    };
}

export interface AttachmentWithUser extends Attachment {
    uploader: User;
}
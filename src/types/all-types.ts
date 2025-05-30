import { Tag, Task, User } from "@prisma/client";

export interface TasksWithUsersAndTags extends Task {
    creator: User;
    tags: Tag[];
}